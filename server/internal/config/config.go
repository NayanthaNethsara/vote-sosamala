package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port              string
	RedisAddr         string
	NatsURL           string
	DBURL             string
	GinMode           string
	FirebaseProjectID string
}

// LoadConfig loads the configuration from the environment variables.
// It also attempts to load a .env file if it exists, which is useful for local development.
func LoadConfig() *Config {
	// Only load .env if it exists (useful for local dev, not for GCP/Docker secrets)
	if err := godotenv.Load(".env"); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	return &Config{
		Port:      getEnv("PORT", "8080"),
		RedisAddr: getEnv("REDIS_ADDR", "redis:6379"),
		NatsURL:   getEnv("NATS_URL", "nats://nats:4222"),
		DBURL:     getEnv("DB_URL", "postgres://user:password@postgres:5432/votes?sslmode=disable"),
		GinMode:   getEnv("GIN_MODE", "release"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
