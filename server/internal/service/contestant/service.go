package contestant

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/NayanthaNethsara/vote-sosamala/server/internal/model/domain"
	contestantrepo "github.com/NayanthaNethsara/vote-sosamala/server/internal/repository/contestant"
	"github.com/google/uuid"
)

var (
	ErrInvalidInput = errors.New("invalid contestant input")
	ErrInvalidID    = errors.New("invalid contestant id")
)

type Service struct {
	repo contestantrepo.Repository
}

func NewService(repo contestantrepo.Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) List(ctx context.Context) ([]domain.Contestant, error) {
	return s.repo.List(ctx)
}

func (s *Service) Create(ctx context.Context, input contestantrepo.UpsertInput) (domain.Contestant, error) {
	normalized, err := normalizeAndValidateInput(input)
	if err != nil {
		return domain.Contestant{}, err
	}

	return s.repo.Create(ctx, normalized)
}

func (s *Service) Update(ctx context.Context, id string, input contestantrepo.UpsertInput) (domain.Contestant, error) {
	if _, err := parseID(id); err != nil {
		return domain.Contestant{}, err
	}

	normalized, err := normalizeAndValidateInput(input)
	if err != nil {
		return domain.Contestant{}, err
	}

	return s.repo.Update(ctx, id, normalized)
}

func (s *Service) Delete(ctx context.Context, id string) error {
	if _, err := parseID(id); err != nil {
		return err
	}

	return s.repo.Delete(ctx, id)
}

func parseID(id string) (uuid.UUID, error) {
	parsedID, err := uuid.Parse(strings.TrimSpace(id))
	if err != nil {
		return uuid.Nil, fmt.Errorf("%w: %v", ErrInvalidID, err)
	}

	return parsedID, nil
}

func normalizeAndValidateInput(input contestantrepo.UpsertInput) (contestantrepo.UpsertInput, error) {
	normalized := contestantrepo.UpsertInput{
		Name:           strings.TrimSpace(input.Name),
		NicOrStudentID: strings.TrimSpace(input.NicOrStudentID),
		Birthday:       normalizeOptionalString(input.Birthday),
		PhotoURL:       normalizeOptionalString(input.PhotoURL),
		Gender:         normalizeOptionalString(input.Gender),
		AcademicYear:   normalizeOptionalString(input.AcademicYear),
	}

	if len(normalized.Name) < 2 {
		return contestantrepo.UpsertInput{}, fmt.Errorf("%w: name must be at least 2 characters", ErrInvalidInput)
	}

	if normalized.NicOrStudentID == "" {
		return contestantrepo.UpsertInput{}, fmt.Errorf("%w: nicOrStudentId is required", ErrInvalidInput)
	}

	if normalized.Birthday != nil {
		if _, err := time.Parse("2006-01-02", *normalized.Birthday); err != nil {
			return contestantrepo.UpsertInput{}, fmt.Errorf("%w: birthday must be in YYYY-MM-DD format", ErrInvalidInput)
		}
	}

	if normalized.Gender != nil {
		gender := strings.ToLower(*normalized.Gender)
		if gender != "male" && gender != "female" {
			return contestantrepo.UpsertInput{}, fmt.Errorf("%w: gender must be male or female", ErrInvalidInput)
		}
		normalized.Gender = &gender
	}

	return normalized, nil
}

func normalizeOptionalString(value *string) *string {
	if value == nil {
		return nil
	}

	trimmed := strings.TrimSpace(*value)
	if trimmed == "" {
		return nil
	}

	return &trimmed
}
