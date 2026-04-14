package user

import (
	"context"
	"errors"

	"github.com/NayanthaNethsara/vote-sosamala/server/internal/model/domain"
)

var ErrNotFound = errors.New("user not found")

type UpsertInput struct {
	FirebaseUID string
	Email       string
	DisplayName string
	PhotoURL    *string
	Role        string
}

type Repository interface {
	Upsert(ctx context.Context, input UpsertInput) (domain.User, error)
	GetByFirebaseUID(ctx context.Context, firebaseUID string) (domain.User, error)
	UpdateRole(ctx context.Context, firebaseUID string, role string) (domain.User, error)
	List(ctx context.Context) ([]domain.User, error)
}
