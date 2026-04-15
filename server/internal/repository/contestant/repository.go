package contestant

import (
	"context"
	"errors"

	"github.com/NayanthaNethsara/vote-sosamala/server/internal/model/domain"
)

var ErrNotFound = errors.New("contestant not found")
var ErrConflict = errors.New("contestant already exists")

type UpsertInput struct {
	Name         string
	DateOfBirth  string
	PhotoURL     *string
	Gender       string
	AcademicYear string
	Semester     string
	NIC          *string
	StudentID    *string
}

type ListParams struct {
	Page  int
	Limit int
}

type ListResult struct {
	Contestants []domain.Contestant
	Total       int64
}

type Repository interface {
	Create(ctx context.Context, input UpsertInput) (domain.Contestant, error)
	List(ctx context.Context) ([]domain.Contestant, error)
	ListPage(ctx context.Context, params ListParams) (ListResult, error)
	Update(ctx context.Context, id string, input UpsertInput) (domain.Contestant, error)
	Delete(ctx context.Context, id string) error
}
