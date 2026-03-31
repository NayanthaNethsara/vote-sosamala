package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/NayanthaNethsara/vote-sosamala/server/internal/api/handlers"
	"github.com/NayanthaNethsara/vote-sosamala/server/internal/config"
	"github.com/NayanthaNethsara/vote-sosamala/server/internal/infrastructure"
)

func main() {
	// Initialize configuration
	cfg := config.LoadConfig()

	// Initialize infrastructure
	redisClient, err := infrastructure.InitRedis(cfg.RedisAddr)
	if err != nil {
		log.Printf("Warning: Redis initialization error: %v", err)
	} else {
		defer redisClient.Close()
		log.Printf("Redis connected at %s", cfg.RedisAddr)
	}

	natsConn, err := infrastructure.InitNATS(cfg.NatsURL)
	if err != nil {
		log.Printf("Warning: NATS initialization error: %v", err)
	} else {
		defer natsConn.Close()
		log.Printf("NATS connected at %s", cfg.NatsURL)
	}

	dbPool, err := infrastructure.InitPostgres(cfg.DBURL)
	if err != nil {
		log.Printf("Warning: PostgreSQL initialization error: %v", err)
	} else {
		defer dbPool.Close()
		log.Printf("PostgreSQL connected at %s", cfg.DBURL)
	}

	// Set up Gin
	gin.SetMode(cfg.GinMode)
	router := gin.Default()

	// Initialize handlers
	healthHandler := handlers.NewHealthHandler(redisClient, natsConn, dbPool)

	// Routes
	router.GET("/health", healthHandler.HealthCheck)

	// Server configuration
	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: router,
	}

	// Start server
	go func() {
		log.Printf("Starting server on port %s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Listen: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exiting")
}
