package handler

import (
	"context"
	"errors"
	"net/http"
	"testing"
	"time"

	"github.com/NayanthaNethsara/vote-sosamala/server/internal/model/domain"
	userrepo "github.com/NayanthaNethsara/vote-sosamala/server/internal/repository/user"
	userservice "github.com/NayanthaNethsara/vote-sosamala/server/internal/service/user"
	"github.com/NayanthaNethsara/vote-sosamala/server/internal/testutil/httpx"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type userRepoStub struct {
	listFn func(ctx context.Context, params userrepo.ListParams) (userrepo.ListResult, error)
}

func (s *userRepoStub) Upsert(ctx context.Context, input userrepo.UpsertInput) (domain.User, error) {
	return domain.User{}, errors.New("not implemented")
}

func (s *userRepoStub) GetByFirebaseUID(ctx context.Context, firebaseUID string) (domain.User, error) {
	return domain.User{}, errors.New("not implemented")
}

func (s *userRepoStub) UpdateRole(ctx context.Context, firebaseUID string, role string) (domain.User, error) {
	return domain.User{}, errors.New("not implemented")
}

func (s *userRepoStub) List(ctx context.Context, params userrepo.ListParams) (userrepo.ListResult, error) {
	if s.listFn == nil {
		return userrepo.ListResult{}, nil
	}

	return s.listFn(ctx, params)
}

type listUsersResponse struct {
	Users      []domain.User `json:"users"`
	Pagination struct {
		Page       int   `json:"page"`
		Limit      int   `json:"limit"`
		Total      int64 `json:"total"`
		TotalPages int   `json:"totalPages"`
		HasNext    bool  `json:"hasNext"`
		HasPrev    bool  `json:"hasPrev"`
	} `json:"pagination"`
	Filters struct {
		Role *string `json:"role"`
	} `json:"filters"`
}

func setupUserListRouter(repo userrepo.Repository) *gin.Engine {
	gin.SetMode(gin.TestMode)
	service := userservice.NewService(repo)
	h := NewUserHandler(nil, service)
	router := gin.New()
	router.GET("/api/admin/users", h.ListUsers)
	return router
}

func TestListUsers_TableDriven(t *testing.T) {
	type testCase struct {
		name               string
		url                string
		expectedStatusCode int
		expectedParams     userrepo.ListParams
		expectedRoleNull   bool
		expectedLimit      int
		expectedHasNext    bool
		expectedHasPrev    bool
		shouldCallRepo     bool
		repoResult         userrepo.ListResult
	}

	now := time.Now().UTC()
	tests := []testCase{
		{
			name:               "all role returns null filter",
			url:                "/api/admin/users?page=1&limit=20",
			expectedStatusCode: http.StatusOK,
			expectedParams:     userrepo.ListParams{Page: 1, Limit: 20, Role: ""},
			expectedRoleNull:   true,
			expectedLimit:      20,
			expectedHasNext:    false,
			expectedHasPrev:    false,
			shouldCallRepo:     true,
			repoResult: userrepo.ListResult{
				Users: []domain.User{{
					FirebaseUID: "uid-1",
					Email:       "u1@test.com",
					DisplayName: "User 1",
					Role:        "guest",
					CreatedAt:   now,
					UpdatedAt:   now,
				}},
				Total: 1,
			},
		},
		{
			name:               "limit capped at 100",
			url:                "/api/admin/users?page=2&limit=999&role=guest",
			expectedStatusCode: http.StatusOK,
			expectedParams:     userrepo.ListParams{Page: 2, Limit: 100, Role: "guest"},
			expectedRoleNull:   false,
			expectedLimit:      100,
			expectedHasNext:    true,
			expectedHasPrev:    true,
			shouldCallRepo:     true,
			repoResult: userrepo.ListResult{
				Users: []domain.User{},
				Total: 250,
			},
		},
		{
			name:               "invalid role rejected",
			url:                "/api/admin/users?role=all",
			expectedStatusCode: http.StatusBadRequest,
			shouldCallRepo:     false,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			var (
				capturedParams userrepo.ListParams
				repoCalled     bool
			)

			router := setupUserListRouter(&userRepoStub{
				listFn: func(ctx context.Context, params userrepo.ListParams) (userrepo.ListResult, error) {
					repoCalled = true
					capturedParams = params
					return tc.repoResult, nil
				},
			})

			res := httpx.PerformJSONRequest(t, router, http.MethodGet, tc.url, nil)

			require.Equal(t, tc.expectedStatusCode, res.Code)
			assert.Equal(t, tc.shouldCallRepo, repoCalled)

			if !tc.shouldCallRepo {
				return
			}

			assert.Equal(t, tc.expectedParams, capturedParams)

			var payload listUsersResponse
			httpx.DecodeJSON(t, res, &payload)

			if tc.expectedRoleNull {
				assert.Nil(t, payload.Filters.Role)
			} else {
				require.NotNil(t, payload.Filters.Role)
				assert.Equal(t, tc.expectedParams.Role, *payload.Filters.Role)
			}

			assert.Equal(t, tc.expectedLimit, payload.Pagination.Limit)
			assert.Equal(t, tc.expectedHasNext, payload.Pagination.HasNext)
			assert.Equal(t, tc.expectedHasPrev, payload.Pagination.HasPrev)
		})
	}
}
