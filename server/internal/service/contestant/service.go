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
		Name:         strings.TrimSpace(input.Name),
		DateOfBirth:  strings.TrimSpace(input.DateOfBirth),
		PhotoURL:     normalizeOptionalString(input.PhotoURL),
		Gender:       strings.TrimSpace(input.Gender),
		AcademicYear: strings.TrimSpace(input.AcademicYear),
		Semester:     strings.TrimSpace(input.Semester),
		NIC:          normalizeOptionalString(input.NIC),
		StudentID:    normalizeOptionalString(input.StudentID),
	}

	if len(normalized.Name) < 2 {
		return contestantrepo.UpsertInput{}, fmt.Errorf("%w: name must be at least 2 characters", ErrInvalidInput)
	}

	if normalized.DateOfBirth == "" {
		return contestantrepo.UpsertInput{}, fmt.Errorf("%w: dateOfBirth is required", ErrInvalidInput)
	}

	if _, err := time.Parse("2006-01-02", normalized.DateOfBirth); err != nil {
		return contestantrepo.UpsertInput{}, fmt.Errorf("%w: dateOfBirth must be in YYYY-MM-DD format", ErrInvalidInput)
	}

	gender := strings.ToLower(normalized.Gender)
	if gender == "" {
		return contestantrepo.UpsertInput{}, fmt.Errorf("%w: gender is required", ErrInvalidInput)
	}
	if gender != "male" && gender != "female" {
		return contestantrepo.UpsertInput{}, fmt.Errorf("%w: gender must be male or female", ErrInvalidInput)
	}
	normalized.Gender = gender

	if normalized.AcademicYear == "" {
		return contestantrepo.UpsertInput{}, fmt.Errorf("%w: academicYear is required", ErrInvalidInput)
	}

	if normalized.Semester == "" {
		return contestantrepo.UpsertInput{}, fmt.Errorf("%w: semester is required", ErrInvalidInput)
	}

	if normalized.NIC == nil && normalized.StudentID == nil {
		return contestantrepo.UpsertInput{}, fmt.Errorf("%w: provide either nic or studentId", ErrInvalidInput)
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
