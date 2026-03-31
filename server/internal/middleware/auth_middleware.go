package middleware

import (
	"net/http"
	"strings"

	"firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"
)

const (
	ContextKeyUID   = "uid"
	ContextKeyEmail = "email"
)

// AuthMiddleware verifies Firebase ID tokens on incoming requests.
// It expects an "Authorization: Bearer <token>" header.
// On success, it injects "uid" and "email" into the Gin context.
func AuthMiddleware(authClient *auth.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing or invalid authorization header"})
			return
		}

		idToken := strings.TrimPrefix(authHeader, "Bearer ")

		token, err := authClient.VerifyIDToken(c.Request.Context(), idToken)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		c.Set(ContextKeyUID, token.UID)
		if email, ok := token.Claims["email"].(string); ok {
			c.Set(ContextKeyEmail, email)
		}

		c.Next()
	}
}
