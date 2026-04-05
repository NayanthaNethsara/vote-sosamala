package handler

import (
	"net/http"
	"strings"

	"firebase.google.com/go/v4/auth"
	"github.com/NayanthaNethsara/vote-sosamala/server/internal/api/middleware"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/iterator"
)

type UserHandler struct {
	authClient *auth.Client
}

func NewUserHandler(authClient *auth.Client) *UserHandler {
	return &UserHandler{authClient: authClient}
}

func (h *UserHandler) Me(c *gin.Context) {
	if !requireAuthenticated(c) {
		return
	}

	uid, _ := c.Get(middleware.ContextKeyUID)
	email, _ := c.Get(middleware.ContextKeyEmail)
	role, _ := c.Get(middleware.ContextKeyRole)

	c.JSON(http.StatusOK, gin.H{
		"uid":   uid,
		"email": email,
		"role":  role,
	})
}

type userSummary struct {
	UID         string `json:"uid"`
	Email       string `json:"email,omitempty"`
	DisplayName string `json:"displayName,omitempty"`
	Disabled    bool   `json:"disabled"`
	Role        string `json:"role"`
}

type setRoleRequest struct {
	Role string `json:"role" binding:"required"`
}

func (h *UserHandler) ListUsers(c *gin.Context) {
	if !requireAuthenticated(c) {
		return
	}

	if h.authClient == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "firebase auth client unavailable"})
		return
	}

	users := make([]userSummary, 0)
	iter := h.authClient.Users(c.Request.Context(), "")
	for {
		record, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list users"})
			return
		}

		users = append(users, userSummary{
			UID:         record.UID,
			Email:       record.Email,
			DisplayName: record.DisplayName,
			Disabled:    record.Disabled,
			Role:        resolveRole(record.CustomClaims),
		})
	}

	c.JSON(http.StatusOK, users)
}

func (h *UserHandler) UpdateUserRole(c *gin.Context) {
	if !requireAuthenticated(c) {
		return
	}

	if h.authClient == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "firebase auth client unavailable"})
		return
	}

	uid := strings.TrimSpace(c.Param("uid"))
	if uid == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "uid is required"})
		return
	}

	var input setRoleRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	newRole := strings.ToLower(strings.TrimSpace(input.Role))
	if newRole != middleware.RoleGuest && newRole != middleware.RoleAdmin && newRole != middleware.RoleSuperAdmin {
		c.JSON(http.StatusBadRequest, gin.H{"error": "role must be one of: guest, admin, super-admin"})
		return
	}

	record, err := h.authClient.GetUser(c.Request.Context(), uid)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	updatedClaims := make(map[string]interface{}, len(record.CustomClaims)+1)
	for k, v := range record.CustomClaims {
		updatedClaims[k] = v
	}
	updatedClaims["role"] = newRole

	if err := h.authClient.SetCustomUserClaims(c.Request.Context(), uid, updatedClaims); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update user role"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"uid":     uid,
		"email":   record.Email,
		"role":    newRole,
		"message": "role updated; user must refresh token to receive new claims",
	})
}

func resolveRole(claims map[string]interface{}) string {
	if claims == nil {
		return middleware.RoleGuest
	}

	if roleValue, ok := claims["role"].(string); ok {
		normalized := strings.ToLower(strings.TrimSpace(roleValue))
		switch normalized {
		case middleware.RoleGuest, middleware.RoleAdmin, middleware.RoleSuperAdmin:
			return normalized
		}
	}

	return middleware.RoleGuest
}
