package api

import (
	"firebase.google.com/go/v4/auth"
	"github.com/NayanthaNethsara/vote-sosamala/server/internal/api/handler"
	"github.com/NayanthaNethsara/vote-sosamala/server/internal/api/middleware"
	contestantrepo "github.com/NayanthaNethsara/vote-sosamala/server/internal/repository/contestant"
	contestantservice "github.com/NayanthaNethsara/vote-sosamala/server/internal/service/contestant"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/nats-io/nats.go"
	"github.com/redis/go-redis/v9"
)

type Dependencies struct {
	RedisClient    *redis.Client
	NatsConn       *nats.Conn
	DBPool         *pgxpool.Pool
	FirebaseAuth   *auth.Client
	AllowedOrigins []string
}

func NewRouter(ginMode string, deps Dependencies) *gin.Engine {
	gin.SetMode(ginMode)
	router := gin.Default()

	router.Use(middleware.CORSMiddleware(deps.AllowedOrigins))

	registerPublicRoutes(router, deps)
	registerProtectedRoutes(router, deps)

	return router
}

func registerPublicRoutes(router *gin.Engine, deps Dependencies) {
	healthHandler := handler.NewHealthHandler(deps.RedisClient, deps.NatsConn, deps.DBPool)
	router.GET("/health", healthHandler.HealthCheck)
}

func registerProtectedRoutes(router *gin.Engine, deps Dependencies) {
	userHandler := handler.NewUserHandler(deps.FirebaseAuth)
	contestantRepository := contestantrepo.NewSQLCRepository(deps.DBPool)
	contestantService := contestantservice.NewService(contestantRepository)
	contestantHandler := handler.NewContestantHandler(contestantService)

	api := router.Group("/api")
	if deps.FirebaseAuth != nil {
		api.Use(middleware.AuthMiddleware(deps.FirebaseAuth))
	}

	api.GET("/me", userHandler.Me)

	// Admin routes
	admin := api.Group("/admin")
	admin.Use(middleware.AdminMiddleware())
	admin.GET("/contestants", contestantHandler.ListContestants)
	admin.POST("/contestants", contestantHandler.CreateContestant)
	admin.PUT("/contestants/:id", contestantHandler.UpdateContestant)
	admin.DELETE("/contestants/:id", contestantHandler.DeleteContestant)

	superAdmin := admin.Group("/users")
	superAdmin.Use(middleware.SuperAdminMiddleware())
	superAdmin.GET("", userHandler.ListUsers)
	superAdmin.PUT("/:uid/role", userHandler.UpdateUserRole)
}
