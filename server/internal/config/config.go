package config

import (
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                     string
	RedisAddr                string
	NatsURL                  string
	DBURL                    string
	GinMode                  string
	FirebaseProjectID        string
	BootstrapSuperAdminEmail string
	AllowedOrigins           []string
}

func LoadConfig() *Config {
	if err := godotenv.Load(".env"); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	return &Config{
		Port:                     getEnv("PORT", "8080"),
		RedisAddr:                getEnv("REDIS_ADDR", "redis:6379"),
		NatsURL:                  getEnv("NATS_URL", "nats://nats:4222"),
		DBURL:                    getEnv("DB_URL", "postgres://user:password@postgres:5432/votes?sslmode=disable"),
		GinMode:                  getEnv("GIN_MODE", "release"),
		FirebaseProjectID:        getEnv("FIREBASE_PROJECT_ID", ""),
		BootstrapSuperAdminEmail: strings.ToLower(strings.TrimSpace(getEnv("BOOTSTRAP_SUPER_ADMIN_EMAIL", ""))),
		AllowedOrigins:           getEnvSlice("ALLOWED_ORIGINS", []string{"http://localhost:3000"}),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func getEnvSlice(key string, fallback []string) []string {
	if value, ok := os.LookupEnv(key); ok && value != "" {
		parts := strings.Split(value, ",")
		for i, p := range parts {
			parts[i] = strings.TrimSpace(p)
		}
		return parts
	}
	return fallback
}
