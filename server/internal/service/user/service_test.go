package user

import (
	"context"
	"testing"
	"time"

	"github.com/NayanthaNethsara/vote-sosamala/server/internal/model/domain"
	userrepo "github.com/NayanthaNethsara/vote-sosamala/server/internal/repository/user"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type repositorySpy struct {
	upsertInput  userrepo.UpsertInput
	upsertResult domain.User
	upsertErr    error

	updateUID    string
	updateRole   string
	updateResult domain.User
	updateErr    error

	getUID    string
	getResult domain.User
	getErr    error

	listParams userrepo.ListParams
	listResult userrepo.ListResult
	listErr    error
}

func (s *repositorySpy) Upsert(ctx context.Context, input userrepo.UpsertInput) (domain.User, error) {
	s.upsertInput = input
	return s.upsertResult, s.upsertErr
}

func (s *repositorySpy) GetByFirebaseUID(ctx context.Context, firebaseUID string) (domain.User, error) {
	s.getUID = firebaseUID
	return s.getResult, s.getErr
}

func (s *repositorySpy) UpdateRole(ctx context.Context, firebaseUID string, role string) (domain.User, error) {
	s.updateUID = firebaseUID
	s.updateRole = role
	return s.updateResult, s.updateErr
}

func (s *repositorySpy) List(ctx context.Context, params userrepo.ListParams) (userrepo.ListResult, error) {
	s.listParams = params
	return s.listResult, s.listErr
}

func TestServiceList_NormalizesParams(t *testing.T) {
	tests := []struct {
		name           string
		input          userrepo.ListParams
		expectedOutput userrepo.ListParams
	}{
		{
			name:           "invalid page and limit fallback with trimmed role",
			input:          userrepo.ListParams{Page: 0, Limit: 0, Role: "  admin "},
			expectedOutput: userrepo.ListParams{Page: 1, Limit: 20, Role: "admin"},
		},
		{
			name:           "unsupported role becomes empty filter",
			input:          userrepo.ListParams{Page: 2, Limit: 15, Role: "all"},
			expectedOutput: userrepo.ListParams{Page: 2, Limit: 15, Role: ""},
		},
		{
			name:           "guest role stays guest",
			input:          userrepo.ListParams{Page: 1, Limit: 50, Role: "guest"},
			expectedOutput: userrepo.ListParams{Page: 1, Limit: 50, Role: "guest"},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			spy := &repositorySpy{listResult: userrepo.ListResult{Total: 0}}
			svc := NewService(spy)

			_, err := svc.List(context.Background(), tc.input)
			require.NoError(t, err)
			assert.Equal(t, tc.expectedOutput, spy.listParams)
		})
	}
}

func TestServiceSyncFromToken_NormalizesAndUpserts(t *testing.T) {
	now := time.Now().UTC()
	avatar := "https://example.com/avatar.png"

	spy := &repositorySpy{
		upsertResult: domain.User{
			FirebaseUID: "uid-123",
			Email:       "admin@test.com",
			DisplayName: "Admin User",
			PhotoURL:    &avatar,
			Role:        "admin",
			CreatedAt:   now,
			UpdatedAt:   now,
		},
	}

	svc := NewService(spy)

	result, err := svc.SyncFromToken(
		context.Background(),
		"uid-123",
		"  ADMIN@Test.com ",
		"  Admin User  ",
		&avatar,
		"ADMIN",
	)
	require.NoError(t, err)

	assert.Equal(t, "uid-123", spy.upsertInput.FirebaseUID)
	assert.Equal(t, "admin@test.com", spy.upsertInput.Email)
	assert.Equal(t, "Admin User", spy.upsertInput.DisplayName)
	assert.Equal(t, &avatar, spy.upsertInput.PhotoURL)
	assert.Equal(t, "admin", spy.upsertInput.Role)
	assert.Equal(t, "uid-123", result.FirebaseUID)
}

func TestServiceUpdateRole_NormalizesRoleAndDelegates(t *testing.T) {
	now := time.Now().UTC()
	spy := &repositorySpy{
		updateResult: domain.User{
			FirebaseUID: "uid-222",
			Role:        "super-admin",
			CreatedAt:   now,
			UpdatedAt:   now,
		},
	}

	svc := NewService(spy)
	result, err := svc.UpdateRole(context.Background(), "uid-222", " SUPER-ADMIN ")
	require.NoError(t, err)

	assert.Equal(t, "uid-222", spy.updateUID)
	assert.Equal(t, "super-admin", spy.updateRole)
	assert.Equal(t, "super-admin", result.Role)
}

func TestServiceUpdateRole_UnknownRoleFallsBackToGuest(t *testing.T) {
	spy := &repositorySpy{}
	svc := NewService(spy)

	_, err := svc.UpdateRole(context.Background(), "uid-333", "owner")
	require.NoError(t, err)

	assert.Equal(t, "uid-333", spy.updateUID)
	assert.Equal(t, "guest", spy.updateRole)
}

func TestServiceGetByFirebaseUID_Delegates(t *testing.T) {
	now := time.Now().UTC()
	spy := &repositorySpy{
		getResult: domain.User{
			FirebaseUID: "uid-444",
			Email:       "u4@test.com",
			CreatedAt:   now,
			UpdatedAt:   now,
		},
	}

	svc := NewService(spy)
	result, err := svc.GetByFirebaseUID(context.Background(), "uid-444")
	require.NoError(t, err)

	assert.Equal(t, "uid-444", spy.getUID)
	assert.Equal(t, "uid-444", result.FirebaseUID)
}
