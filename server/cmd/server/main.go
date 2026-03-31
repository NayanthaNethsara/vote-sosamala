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
	"github.com/NayanthaNethsara/vote-sosamala/server/internal/middleware"
)

func main() {
	ctx := context.Background()

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

	firebaseAuth, err := infrastructure.InitFirebase(ctx)
	if err != nil {
		log.Printf("Warning: Firebase initialization error: %v", err)
	} else {
		log.Println("Firebase Admin SDK initialized")
	}

	// Set up Gin
	gin.SetMode(cfg.GinMode)
	router := gin.Default()

	// Public routes
	healthHandler := handlers.NewHealthHandler(redisClient, natsConn, dbPool)
	router.GET("/health", healthHandler.HealthCheck)

	// Protected API routes
	userHandler := handlers.NewUserHandler()
	api := router.Group("/api")
	if firebaseAuth != nil {
		api.Use(middleware.AuthMiddleware(firebaseAuth))
	}
	api.GET("/me", userHandler.Me)

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

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exiting")
}
