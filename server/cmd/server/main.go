package main

import (
	"context"
	"log"

	"github.com/NayanthaNethsara/vote-sosamala/server/internal/api"
	"github.com/NayanthaNethsara/vote-sosamala/server/internal/config"
	"github.com/NayanthaNethsara/vote-sosamala/server/internal/infrastructure"
	"github.com/NayanthaNethsara/vote-sosamala/server/internal/server"
)

func main() {
	ctx := context.Background()
	cfg := config.LoadConfig()

	// -- Infrastructure --

	redisClient, err := infrastructure.InitRedis(cfg.RedisAddr)
	if err != nil {
		log.Printf("Redis init warning: %v", err)
	} else {
		defer redisClient.Close()
		log.Printf("Redis connected at %s", cfg.RedisAddr)
	}

	natsConn, err := infrastructure.InitNATS(cfg.NatsURL)
	if err != nil {
		log.Printf("NATS init warning: %v", err)
	} else {
		defer natsConn.Close()
		log.Printf("NATS connected at %s", cfg.NatsURL)
	}

	dbPool, err := infrastructure.InitPostgres(cfg.DBURL)
	if err != nil {
		log.Printf("Postgres init warning: %v", err)
	} else {
		defer dbPool.Close()
		log.Printf("Postgres connected at %s", cfg.DBURL)
	}

	// Firebase Admin SDK — uses ADC automatically.
	// Local dev: set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path.
	// GCP (Cloud Run / GKE): attach a service account with the Firebase Authentication Admin role.
	firebaseAuth, err := infrastructure.InitFirebase(ctx)
	if err != nil {
		log.Printf("Firebase init warning: %v", err)
	} else {
		log.Println("Firebase Admin SDK ready")
	}

	// -- Router --

	router := api.NewRouter(cfg.GinMode, api.Dependencies{
		RedisClient:  redisClient,
		NatsConn:     natsConn,
		DBPool:       dbPool,
		FirebaseAuth: firebaseAuth,
	})

	// -- Start --

	server.New(cfg.Port, router).Start()
}
