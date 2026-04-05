package handler

import (
	"errors"
	"net/http"
	"strings"

	"github.com/NayanthaNethsara/vote-sosamala/server/internal/api/middleware"
	contestantrepo "github.com/NayanthaNethsara/vote-sosamala/server/internal/repository/contestant"
	contestantservice "github.com/NayanthaNethsara/vote-sosamala/server/internal/service/contestant"
	"github.com/gin-gonic/gin"
)

func requireAuthenticated(c *gin.Context) bool {
	uidValue, exists := c.Get(middleware.ContextKeyUID)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "authentication context not found"})
		return false
	}

	uid, ok := uidValue.(string)
	if !ok || strings.TrimSpace(uid) == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid authentication context"})
		return false
	}

	return true
}

func respondContestantError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, contestantservice.ErrInvalidInput), errors.Is(err, contestantservice.ErrInvalidID):
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	case errors.Is(err, contestantrepo.ErrConflict):
		c.JSON(http.StatusConflict, gin.H{"error": "contestant with this NIC/Student ID already exists"})
	case errors.Is(err, contestantrepo.ErrNotFound):
		c.JSON(http.StatusNotFound, gin.H{"error": "contestant not found"})
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to process contestant request"})
	}
}
