package api

import (
	"firebase.google.com/go/v4/auth"
	"github.com/NayanthaNethsara/vote-sosamala/server/internal/api/handler"
	"github.com/NayanthaNethsara/vote-sosamala/server/internal/api/middleware"
	"github.com/gin-gonic/gin"
)

type Dependencies struct {
	FirebaseAuth   *auth.Client
	AllowedOrigins []string
}

type Handlers struct {
	Health     *handler.HealthHandler
	Contestant *handler.ContestantHandler
	User       *handler.UserHandler
	Vote       *handler.VoteHandler
}

func NewRouter(ginMode string, deps Dependencies, handlers Handlers) *gin.Engine {
	gin.SetMode(ginMode)
	router := gin.Default()

	router.Use(middleware.CORSMiddleware(deps.AllowedOrigins))

	registerPublicRoutes(router, handlers.Health, handlers.Contestant, handlers.Vote)
	registerAuthenticatedRoutes(router, deps, handlers.User, handlers.Vote)
	registerAdminRoutes(router, deps, handlers.Contestant, handlers.User)

	return router
}

func registerPublicRoutes(
	router *gin.Engine,
	healthHandler *handler.HealthHandler,
	contestantHandler *handler.ContestantHandler,
	voteHandler *handler.VoteHandler,
) {
	if healthHandler != nil {
		router.GET("/health", healthHandler.HealthCheck)
	}

	publicAPI := router.Group("/api")
	if contestantHandler != nil {
		publicAPI.GET("/contestants", contestantHandler.ListContestantsPublic)
	}
	if voteHandler != nil {
		publicAPI.GET("/contestants/:id/votes", voteHandler.GetContestantVotes)
	}
}

func registerAuthenticatedRoutes(
	router *gin.Engine,
	deps Dependencies,
	userHandler *handler.UserHandler,
	voteHandler *handler.VoteHandler,
) {
	authed := router.Group("/api")
	if deps.FirebaseAuth != nil {
		authed.Use(middleware.AuthMiddleware(deps.FirebaseAuth))
	}

	if userHandler != nil {
		authed.GET("/me", userHandler.Me)
	}
	if voteHandler != nil {
		authed.GET("/votes/status", voteHandler.GetMyVoteStatus)
		authed.POST("/votes", voteHandler.CastVote)
	}
}

func registerAdminRoutes(router *gin.Engine, deps Dependencies, contestantHandler *handler.ContestantHandler, userHandler *handler.UserHandler) {
	admin := router.Group("/api/admin")
	if deps.FirebaseAuth != nil {
		admin.Use(middleware.AuthMiddleware(deps.FirebaseAuth))
	}
	admin.Use(middleware.AdminMiddleware())

	if contestantHandler != nil {
		admin.GET("/contestants", contestantHandler.ListContestants)
		admin.POST("/contestants", contestantHandler.CreateContestant)
		admin.PUT("/contestants/:id", contestantHandler.UpdateContestant)
		admin.DELETE("/contestants/:id", contestantHandler.DeleteContestant)
	}

	superAdmin := admin.Group("/users")
	superAdmin.Use(middleware.SuperAdminMiddleware())
	if userHandler != nil {
		superAdmin.GET("", userHandler.ListUsers)
		superAdmin.PUT("/:uid/role", userHandler.UpdateUserRole)
	}
}
