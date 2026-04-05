package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func AdminMiddleware(adminEmails []string) gin.HandlerFunc {
	// Create a map for O(1) lookups
	admins := make(map[string]bool)
	for _, email := range adminEmails {
		admins[strings.TrimSpace(email)] = true
	}

	return func(c *gin.Context) {
		email, exists := c.Get(ContextKeyEmail)
		if !exists {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "user email not found in token"})
			return
		}

		userEmail, ok := email.(string)
		if !ok || !admins[userEmail] {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "user is not an admin"})
			return
		}

		c.Next()
	}
}
