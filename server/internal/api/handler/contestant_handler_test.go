package handler

import (
	"context"
	"errors"
	"net/http"
	"testing"
	"time"

	"github.com/NayanthaNethsara/vote-sosamala/server/internal/model/domain"
	contestantrepo "github.com/NayanthaNethsara/vote-sosamala/server/internal/repository/contestant"
	contestantservice "github.com/NayanthaNethsara/vote-sosamala/server/internal/service/contestant"
	"github.com/NayanthaNethsara/vote-sosamala/server/internal/testutil/httpx"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type contestantRepoStub struct {
	createFn   func(ctx context.Context, input contestantrepo.UpsertInput) (domain.Contestant, error)
	listFn     func(ctx context.Context) ([]domain.Contestant, error)
	listPageFn func(ctx context.Context, params contestantrepo.ListParams) (contestantrepo.ListResult, error)
	updateFn   func(ctx context.Context, id string, input contestantrepo.UpsertInput) (domain.Contestant, error)
	deleteFn   func(ctx context.Context, id string) error
}

func (s *contestantRepoStub) Create(ctx context.Context, input contestantrepo.UpsertInput) (domain.Contestant, error) {
	if s.createFn == nil {
		return domain.Contestant{}, nil
	}
	return s.createFn(ctx, input)
}

func (s *contestantRepoStub) List(ctx context.Context) ([]domain.Contestant, error) {
	if s.listFn == nil {
		return []domain.Contestant{}, nil
	}
	return s.listFn(ctx)
}

func (s *contestantRepoStub) ListPage(ctx context.Context, params contestantrepo.ListParams) (contestantrepo.ListResult, error) {
	if s.listPageFn == nil {
		return contestantrepo.ListResult{}, nil
	}
	return s.listPageFn(ctx, params)
}

func (s *contestantRepoStub) Update(ctx context.Context, id string, input contestantrepo.UpsertInput) (domain.Contestant, error) {
	if s.updateFn == nil {
		return domain.Contestant{}, nil
	}
	return s.updateFn(ctx, id, input)
}

func (s *contestantRepoStub) Delete(ctx context.Context, id string) error {
	if s.deleteFn == nil {
		return nil
	}
	return s.deleteFn(ctx, id)
}

func setupContestantRouter(repo contestantrepo.Repository) *gin.Engine {
	gin.SetMode(gin.TestMode)
	service := contestantservice.NewService(repo)
	handler := NewContestantHandler(service)

	router := gin.New()
	router.GET("/api/contestants", handler.ListContestantsPublic)
	router.GET("/api/admin/contestants", handler.ListContestants)
	router.POST("/api/admin/contestants", handler.CreateContestant)
	router.PUT("/api/admin/contestants/:id", handler.UpdateContestant)
	router.DELETE("/api/admin/contestants/:id", handler.DeleteContestant)

	return router
}

func TestListContestantsPublic_NormalizesPageAndLimit(t *testing.T) {
	var capturedParams contestantrepo.ListParams
	now := time.Now().UTC()
	router := setupContestantRouter(&contestantRepoStub{
		listPageFn: func(ctx context.Context, params contestantrepo.ListParams) (contestantrepo.ListResult, error) {
			capturedParams = params
			return contestantrepo.ListResult{
				Contestants: []domain.Contestant{{
					ID:        uuid.NewString(),
					Name:      "Contestant One",
					CreatedAt: now,
					UpdatedAt: now,
				}},
				Total: 1,
			}, nil
		},
	})

	res := httpx.PerformJSONRequest(t, router, http.MethodGet, "/api/contestants?page=0&limit=999", nil)
	require.Equal(t, http.StatusOK, res.Code)
	assert.Equal(t, contestantrepo.ListParams{Page: 1, Limit: 100}, capturedParams)

	var payload struct {
		Contestants []domain.Contestant `json:"contestants"`
		Pagination  struct {
			Page       int   `json:"page"`
			Limit      int   `json:"limit"`
			Total      int64 `json:"total"`
			TotalPages int   `json:"totalPages"`
			HasNext    bool  `json:"hasNext"`
			HasPrev    bool  `json:"hasPrev"`
		} `json:"pagination"`
	}
	httpx.DecodeJSON(t, res, &payload)
	assert.Len(t, payload.Contestants, 1)
	assert.Equal(t, 1, payload.Pagination.Page)
	assert.Equal(t, 100, payload.Pagination.Limit)
	assert.Equal(t, int64(1), payload.Pagination.Total)
	assert.Equal(t, 1, payload.Pagination.TotalPages)
	assert.False(t, payload.Pagination.HasNext)
	assert.False(t, payload.Pagination.HasPrev)
}

func TestCreateContestant_ConflictReturns409(t *testing.T) {
	router := setupContestantRouter(&contestantRepoStub{
		createFn: func(ctx context.Context, input contestantrepo.UpsertInput) (domain.Contestant, error) {
			return domain.Contestant{}, contestantrepo.ErrConflict
		},
	})

	res := httpx.PerformJSONRequest(t, router, http.MethodPost, "/api/admin/contestants", map[string]any{
		"name":         "Contestant One",
		"dateOfBirth":  "2000-02-10",
		"gender":       "male",
		"academicYear": "3rd Year",
		"semester":     "2nd Semester",
		"nic":          "200012345678",
	})

	require.Equal(t, http.StatusConflict, res.Code)
}

func TestCreateContestant_BadRequestOnInvalidPayload(t *testing.T) {
	router := setupContestantRouter(&contestantRepoStub{})

	res := httpx.PerformJSONRequest(t, router, http.MethodPost, "/api/admin/contestants", map[string]any{
		"name": "Contestant One",
	})

	require.Equal(t, http.StatusBadRequest, res.Code)
}

func TestListContestants_AdminEndpointReturns200(t *testing.T) {
	now := time.Now().UTC()
	router := setupContestantRouter(&contestantRepoStub{
		listFn: func(ctx context.Context) ([]domain.Contestant, error) {
			return []domain.Contestant{{
				ID:        uuid.NewString(),
				Name:      "Contestant One",
				CreatedAt: now,
				UpdatedAt: now,
			}}, nil
		},
	})

	res := httpx.PerformJSONRequest(t, router, http.MethodGet, "/api/admin/contestants", nil)
	require.Equal(t, http.StatusOK, res.Code)

	var payload []domain.Contestant
	httpx.DecodeJSON(t, res, &payload)
	require.Len(t, payload, 1)
	assert.Equal(t, "Contestant One", payload[0].Name)
}

func TestUpdateContestant_InvalidIDReturns400(t *testing.T) {
	router := setupContestantRouter(&contestantRepoStub{})

	res := httpx.PerformJSONRequest(t, router, http.MethodPut, "/api/admin/contestants/invalid-id", map[string]any{
		"name":         "Contestant One",
		"dateOfBirth":  "2000-02-10",
		"gender":       "male",
		"academicYear": "3rd Year",
		"semester":     "2nd Semester",
		"nic":          "200012345678",
	})

	require.Equal(t, http.StatusBadRequest, res.Code)
}

func TestUpdateContestant_NotFoundReturns404(t *testing.T) {
	router := setupContestantRouter(&contestantRepoStub{
		updateFn: func(ctx context.Context, id string, input contestantrepo.UpsertInput) (domain.Contestant, error) {
			return domain.Contestant{}, contestantrepo.ErrNotFound
		},
	})

	res := httpx.PerformJSONRequest(t, router, http.MethodPut, "/api/admin/contestants/"+uuid.NewString(), map[string]any{
		"name":         "Contestant One",
		"dateOfBirth":  "2000-02-10",
		"gender":       "male",
		"academicYear": "3rd Year",
		"semester":     "2nd Semester",
		"nic":          "200012345678",
	})

	require.Equal(t, http.StatusNotFound, res.Code)
}

func TestDeleteContestant_NotFoundReturns404(t *testing.T) {
	router := setupContestantRouter(&contestantRepoStub{
		deleteFn: func(ctx context.Context, id string) error {
			return contestantrepo.ErrNotFound
		},
	})

	res := httpx.PerformJSONRequest(t, router, http.MethodDelete, "/api/admin/contestants/"+uuid.NewString(), nil)
	require.Equal(t, http.StatusNotFound, res.Code)
}

func TestDeleteContestant_InternalErrorReturns500(t *testing.T) {
	router := setupContestantRouter(&contestantRepoStub{
		deleteFn: func(ctx context.Context, id string) error {
			return errors.New("db down")
		},
	})

	res := httpx.PerformJSONRequest(t, router, http.MethodDelete, "/api/admin/contestants/"+uuid.NewString(), nil)
	require.Equal(t, http.StatusInternalServerError, res.Code)
}
