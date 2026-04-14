package middleware

import (
	"net/http"
	"strings"

	"firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"
)

const (
	ContextKeyUID         = "uid"
	ContextKeyEmail       = "email"
	ContextKeyRole        = "role"
	ContextKeyDisplayName = "displayName"
	ContextKeyPhotoURL    = "photoURL"

	RoleGuest      = "guest"
	RoleAdmin      = "admin"
	RoleSuperAdmin = "super-admin"
)

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
		role := RoleGuest

		if email, ok := token.Claims["email"].(string); ok {
			c.Set(ContextKeyEmail, strings.ToLower(strings.TrimSpace(email)))
		}

		if name, ok := token.Claims["name"].(string); ok {
			c.Set(ContextKeyDisplayName, strings.TrimSpace(name))
		}

		if picture, ok := token.Claims["picture"].(string); ok {
			c.Set(ContextKeyPhotoURL, strings.TrimSpace(picture))
		}

		if claimRole, ok := token.Claims["role"].(string); ok {
			switch strings.TrimSpace(strings.ToLower(claimRole)) {
			case RoleSuperAdmin:
				role = RoleSuperAdmin
			case RoleAdmin:
				role = RoleAdmin
			case RoleGuest:
				role = RoleGuest
			}
		}

		c.Set(ContextKeyRole, role)

		c.Next()
	}
}
