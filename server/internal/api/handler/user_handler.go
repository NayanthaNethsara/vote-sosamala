package handler

import (
	"log"
	"net/http"
	"strings"

	"firebase.google.com/go/v4/auth"
	"github.com/NayanthaNethsara/vote-sosamala/server/internal/api/middleware"
	userservice "github.com/NayanthaNethsara/vote-sosamala/server/internal/service/user"
	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	authClient  *auth.Client
	userService *userservice.Service
}

func NewUserHandler(authClient *auth.Client, userService *userservice.Service) *UserHandler {
	return &UserHandler{
		authClient:  authClient,
		userService: userService,
	}
}

func (h *UserHandler) Me(c *gin.Context) {
	uid := contextString(c, middleware.ContextKeyUID)
	email := contextString(c, middleware.ContextKeyEmail)
	role := contextString(c, middleware.ContextKeyRole)
	displayName := contextString(c, middleware.ContextKeyDisplayName)
	photoURL := contextStringPtr(c, middleware.ContextKeyPhotoURL)

	if h.userService != nil {
		syncedUser, err := h.userService.SyncFromToken(c.Request.Context(), uid, email, displayName, photoURL, role)
		if err != nil {
			log.Printf("failed to sync user %s to database: %v", uid, err)
		} else {
			c.JSON(http.StatusOK, gin.H{
				"uid":         syncedUser.FirebaseUID,
				"email":       syncedUser.Email,
				"displayName": syncedUser.DisplayName,
				"photoURL":    syncedUser.PhotoURL,
				"role":        syncedUser.Role,
			})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"uid":   uid,
		"email": email,
		"role":  role,
	})
}

type setRoleRequest struct {
	Role string `json:"role" binding:"required"`
}

func (h *UserHandler) ListUsers(c *gin.Context) {
	if h.userService == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "user service unavailable"})
		return
	}

	users, err := h.userService.List(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list users"})
		return
	}

	c.JSON(http.StatusOK, users)
}

func (h *UserHandler) UpdateUserRole(c *gin.Context) {
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
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found in Firebase"})
		return
	}

	updatedClaims := make(map[string]interface{}, len(record.CustomClaims)+1)
	for k, v := range record.CustomClaims {
		updatedClaims[k] = v
	}
	updatedClaims["role"] = newRole

	if err := h.authClient.SetCustomUserClaims(c.Request.Context(), uid, updatedClaims); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update user role in Firebase"})
		return
	}

	if h.userService != nil {
		if _, err := h.userService.UpdateRole(c.Request.Context(), uid, newRole); err != nil {
			log.Printf("failed to sync role to database for user %s: %v", uid, err)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"uid":     uid,
		"email":   record.Email,
		"role":    newRole,
		"message": "role updated; user must refresh token to receive new claims",
	})
}
