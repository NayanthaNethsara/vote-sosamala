package handler

import (
	"errors"
	"net/http"

	contestantrepo "github.com/NayanthaNethsara/vote-sosamala/server/internal/repository/contestant"
	contestantservice "github.com/NayanthaNethsara/vote-sosamala/server/internal/service/contestant"
	"github.com/gin-gonic/gin"
)

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

func contextString(c *gin.Context, key string) string {
	value, _ := c.Get(key)
	str, _ := value.(string)
	return str
}

func contextStringPtr(c *gin.Context, key string) *string {
	value, exists := c.Get(key)
	if !exists {
		return nil
	}

	str, ok := value.(string)
	if !ok || str == "" {
		return nil
	}

	return &str
}
