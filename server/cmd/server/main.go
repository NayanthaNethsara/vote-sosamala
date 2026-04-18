package main

import (
	"context"
	"log"
	"os/signal"
	"syscall"
	"time"

	"github.com/NayanthaNethsara/vote-sosamala/server/internal/api"
	"github.com/NayanthaNethsara/vote-sosamala/server/internal/api/handler"
	"github.com/NayanthaNethsara/vote-sosamala/server/internal/config"
	"github.com/NayanthaNethsara/vote-sosamala/server/internal/platform"
	contestantrepo "github.com/NayanthaNethsara/vote-sosamala/server/internal/repository/contestant"
	userrepo "github.com/NayanthaNethsara/vote-sosamala/server/internal/repository/user"
	voterepo "github.com/NayanthaNethsara/vote-sosamala/server/internal/repository/vote"
	contestantservice "github.com/NayanthaNethsara/vote-sosamala/server/internal/service/contestant"
	userservice "github.com/NayanthaNethsara/vote-sosamala/server/internal/service/user"
	voteservice "github.com/NayanthaNethsara/vote-sosamala/server/internal/service/vote"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	cfg := config.LoadConfig()

	redisClient, err := platform.InitRedis(cfg.RedisAddr)
	if err != nil {
		log.Printf("Redis init warning: %v", err)
	} else {
		defer redisClient.Close()
		log.Printf("Redis connected at %s", cfg.RedisAddr)
	}

	natsConn, err := platform.InitNATS(cfg.NatsURL)
	if err != nil {
		log.Printf("NATS init warning: %v", err)
	} else {
		defer natsConn.Close()
		log.Printf("NATS connected at %s", cfg.NatsURL)
	}

	dbPool, err := platform.InitPostgres(cfg.DBURL)
	if err != nil {
		log.Printf("Postgres init warning: %v", err)
	} else {
		defer dbPool.Close()
		log.Printf("Postgres connected at %s", cfg.DBURL)
	}

	firebaseAuth, err := platform.InitFirebase(ctx, cfg.FirebaseProjectID)
	if err != nil {
		log.Printf("Firebase init warning: %v (set FIREBASE_PROJECT_ID and ensure ADC is available)", err)
	} else {
		log.Println("Firebase Admin SDK ready")
	}

	contestantRepository := contestantrepo.NewSQLCRepository(dbPool)
	contestantService := contestantservice.NewService(contestantRepository)
	contestantHandler := handler.NewContestantHandler(contestantService)

	var userService *userservice.Service
	if dbPool != nil {
		userRepository := userrepo.NewSQLCRepository(dbPool)
		userService = userservice.NewService(userRepository)
	}
	userHandler := handler.NewUserHandler(firebaseAuth, userService)

	healthHandler := handler.NewHealthHandler(redisClient, natsConn, dbPool)

	var voteHandler *handler.VoteHandler
	if dbPool != nil && redisClient != nil && natsConn != nil {
		voteRepository := voterepo.NewSQLRepository(dbPool)
		voteService := voteservice.NewService(
			voteRepository,
			redisClient,
			natsConn,
			10*time.Second,
		)

		warmupCtx, cancelWarmup := context.WithTimeout(ctx, 15*time.Second)
		if warmupErr := voteService.WarmupVoteCounts(warmupCtx); warmupErr != nil {
			log.Fatalf("Vote warm-up failed: %v", warmupErr)
		}
		cancelWarmup()

		voteService.StartBackground(ctx)
		voteHandler = handler.NewVoteHandler(voteService)
	} else {
		log.Println("Vote pipeline disabled: requires Postgres, Redis, and NATS")
	}

	router := api.NewRouter(cfg.GinMode, api.Dependencies{
		FirebaseAuth:   firebaseAuth,
		AllowedOrigins: cfg.AllowedOrigins,
	}, api.Handlers{
		Health:     healthHandler,
		Contestant: contestantHandler,
		User:       userHandler,
		Vote:       voteHandler,
	})

	platform.New(cfg.Port, router).Start()
}
