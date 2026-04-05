package main

import (
	"context"
	"log"

	"github.com/NayanthaNethsara/vote-sosamala/server/internal/api"
	"github.com/NayanthaNethsara/vote-sosamala/server/internal/config"
	"github.com/NayanthaNethsara/vote-sosamala/server/internal/platform"
)

func main() {
	ctx := context.Background()
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

	router := api.NewRouter(cfg.GinMode, api.Dependencies{
		RedisClient:    redisClient,
		NatsConn:       natsConn,
		DBPool:         dbPool,
		FirebaseAuth:   firebaseAuth,
		AllowedOrigins: cfg.AllowedOrigins,
		AdminEmails:    cfg.AdminEmails,
	})

	platform.New(cfg.Port, router).Start()
}
