package handlers

import (
	"net/http"

	"github.com/NayanthaNethsara/vote-sosamala/server/internal/middleware"
	"github.com/gin-gonic/gin"
)

type UserHandler struct{}

func NewUserHandler() *UserHandler {
	return &UserHandler{}
}

// Me returns the currently authenticated user's information from the token context.
func (h *UserHandler) Me(c *gin.Context) {
	uid, _ := c.Get(middleware.ContextKeyUID)
	email, _ := c.Get(middleware.ContextKeyEmail)

	c.JSON(http.StatusOK, gin.H{
		"uid":   uid,
		"email": email,
	})
}
