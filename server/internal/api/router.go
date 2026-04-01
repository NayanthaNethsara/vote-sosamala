package api

import (
	"firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/nats-io/nats.go"
	"github.com/redis/go-redis/v9"

	"github.com/NayanthaNethsara/vote-sosamala/server/internal/api/handlers"
	"github.com/NayanthaNethsara/vote-sosamala/server/internal/middleware"
)

// Dependencies holds all infrastructure clients required to build the router.
type Dependencies struct {
	RedisClient    *redis.Client
	NatsConn       *nats.Conn
	DBPool         *pgxpool.Pool
	FirebaseAuth   *auth.Client
	AllowedOrigins []string
}

// NewRouter creates and configures the Gin engine with all application routes.
func NewRouter(ginMode string, deps Dependencies) *gin.Engine {
	gin.SetMode(ginMode)
	router := gin.Default()

	router.Use(middleware.CORSMiddleware(deps.AllowedOrigins))

	registerPublicRoutes(router, deps)
	registerProtectedRoutes(router, deps)

	return router
}

func registerPublicRoutes(router *gin.Engine, deps Dependencies) {
	healthHandler := handlers.NewHealthHandler(deps.RedisClient, deps.NatsConn, deps.DBPool)
	router.GET("/health", healthHandler.HealthCheck)
}

func registerProtectedRoutes(router *gin.Engine, deps Dependencies) {
	userHandler := handlers.NewUserHandler()

	api := router.Group("/api")
	if deps.FirebaseAuth != nil {
		api.Use(middleware.AuthMiddleware(deps.FirebaseAuth))
	}

	api.GET("/me", userHandler.Me)
}
