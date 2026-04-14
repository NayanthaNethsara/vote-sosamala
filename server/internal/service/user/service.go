package user

import (
	"context"
	"fmt"
	"strings"

	"github.com/NayanthaNethsara/vote-sosamala/server/internal/api/middleware"
	"github.com/NayanthaNethsara/vote-sosamala/server/internal/model/domain"
	userrepo "github.com/NayanthaNethsara/vote-sosamala/server/internal/repository/user"
)

type Service struct {
	repo userrepo.Repository
}

func NewService(repo userrepo.Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) SyncFromToken(ctx context.Context, uid, email, displayName string, photoURL *string, role string) (domain.User, error) {
	normalizedRole := normalizeRole(role)

	return s.repo.Upsert(ctx, userrepo.UpsertInput{
		FirebaseUID: uid,
		Email:       strings.ToLower(strings.TrimSpace(email)),
		DisplayName: strings.TrimSpace(displayName),
		PhotoURL:    photoURL,
		Role:        normalizedRole,
	})
}

func (s *Service) UpdateRole(ctx context.Context, firebaseUID string, newRole string) (domain.User, error) {
	normalizedRole := normalizeRole(newRole)
	if normalizedRole != middleware.RoleGuest && normalizedRole != middleware.RoleAdmin && normalizedRole != middleware.RoleSuperAdmin {
		return domain.User{}, fmt.Errorf("invalid role: %s", newRole)
	}

	return s.repo.UpdateRole(ctx, firebaseUID, normalizedRole)
}

func (s *Service) GetByFirebaseUID(ctx context.Context, firebaseUID string) (domain.User, error) {
	return s.repo.GetByFirebaseUID(ctx, firebaseUID)
}

func (s *Service) List(ctx context.Context) ([]domain.User, error) {
	return s.repo.List(ctx)
}

func normalizeRole(role string) string {
	normalized := strings.ToLower(strings.TrimSpace(role))
	switch normalized {
	case middleware.RoleSuperAdmin, middleware.RoleAdmin:
		return normalized
	default:
		return middleware.RoleGuest
	}
}
