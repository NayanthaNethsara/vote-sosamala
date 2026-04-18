package contestant

import (
	"context"
	"testing"
	"time"

	"github.com/NayanthaNethsara/vote-sosamala/server/internal/model/domain"
	contestantrepo "github.com/NayanthaNethsara/vote-sosamala/server/internal/repository/contestant"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type repositorySpy struct {
	createInput  contestantrepo.UpsertInput
	createResult domain.Contestant
	createErr    error
	createCalled bool

	updateID     string
	updateInput  contestantrepo.UpsertInput
	updateResult domain.Contestant
	updateErr    error
	updateCalled bool

	deleteID     string
	deleteErr    error
	deleteCalled bool

	listPageParams contestantrepo.ListParams
	listPageResult contestantrepo.ListResult
	listPageErr    error
}

func (s *repositorySpy) Create(ctx context.Context, input contestantrepo.UpsertInput) (domain.Contestant, error) {
	s.createCalled = true
	s.createInput = input
	return s.createResult, s.createErr
}

func (s *repositorySpy) List(ctx context.Context) ([]domain.Contestant, error) {
	return nil, nil
}

func (s *repositorySpy) ListPage(ctx context.Context, params contestantrepo.ListParams) (contestantrepo.ListResult, error) {
	s.listPageParams = params
	return s.listPageResult, s.listPageErr
}

func (s *repositorySpy) Update(ctx context.Context, id string, input contestantrepo.UpsertInput) (domain.Contestant, error) {
	s.updateCalled = true
	s.updateID = id
	s.updateInput = input
	return s.updateResult, s.updateErr
}

func (s *repositorySpy) Delete(ctx context.Context, id string) error {
	s.deleteCalled = true
	s.deleteID = id
	return s.deleteErr
}

func TestServiceCreate_NormalizesAndDelegates(t *testing.T) {
	createdAt := time.Now().UTC()
	nic := "200012345678"
	avatar := "https://cdn.example.com/avatar.jpg"

	spy := &repositorySpy{
		createResult: domain.Contestant{
			ID:        uuid.NewString(),
			Name:      "Contestant One",
			CreatedAt: createdAt,
			UpdatedAt: createdAt,
		},
	}
	service := NewService(spy)

	result, err := service.Create(context.Background(), contestantrepo.UpsertInput{
		Name:         "  Contestant One  ",
		DateOfBirth:  " 2000-02-10 ",
		PhotoURL:     &avatar,
		Gender:       " MALE ",
		AcademicYear: " 3rd Year ",
		Semester:     " 2nd Semester ",
		NIC:          strPtr("  200012345678  "),
		StudentID:    strPtr("   "),
	})
	require.NoError(t, err)

	assert.True(t, spy.createCalled)
	assert.Equal(t, "Contestant One", spy.createInput.Name)
	assert.Equal(t, "2000-02-10", spy.createInput.DateOfBirth)
	assert.Equal(t, "male", spy.createInput.Gender)
	assert.Equal(t, "3rd Year", spy.createInput.AcademicYear)
	assert.Equal(t, "2nd Semester", spy.createInput.Semester)
	assert.NotNil(t, spy.createInput.NIC)
	assert.Equal(t, nic, *spy.createInput.NIC)
	assert.Nil(t, spy.createInput.StudentID)
	assert.Equal(t, spy.createResult.ID, result.ID)
}

func TestServiceCreate_ReturnsValidationErrorWhenIdentityMissing(t *testing.T) {
	spy := &repositorySpy{}
	service := NewService(spy)

	_, err := service.Create(context.Background(), contestantrepo.UpsertInput{
		Name:         "Contestant One",
		DateOfBirth:  "2000-02-10",
		Gender:       "male",
		AcademicYear: "3rd Year",
		Semester:     "2nd Semester",
	})
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrInvalidInput)
	assert.False(t, spy.createCalled)
}

func TestServiceUpdate_NormalizesInputAndDelegates(t *testing.T) {
	spy := &repositorySpy{}
	service := NewService(spy)
	id := uuid.NewString()

	_, err := service.Update(context.Background(), id, contestantrepo.UpsertInput{
		Name:         "  Contestant Two  ",
		DateOfBirth:  " 1999-01-01 ",
		Gender:       " FEMALE ",
		AcademicYear: " 4th Year ",
		Semester:     " 1st Semester ",
		NIC:          strPtr(" 199912345678 "),
	})
	require.NoError(t, err)
	assert.True(t, spy.updateCalled)
	assert.Equal(t, id, spy.updateID)
	assert.Equal(t, "Contestant Two", spy.updateInput.Name)
	assert.Equal(t, "1999-01-01", spy.updateInput.DateOfBirth)
	assert.Equal(t, "female", spy.updateInput.Gender)
	assert.Equal(t, "4th Year", spy.updateInput.AcademicYear)
	assert.Equal(t, "1st Semester", spy.updateInput.Semester)
	require.NotNil(t, spy.updateInput.NIC)
	assert.Equal(t, "199912345678", *spy.updateInput.NIC)
}

func TestServiceUpdate_ReturnsInvalidIDAndSkipsRepo(t *testing.T) {
	spy := &repositorySpy{}
	service := NewService(spy)

	_, err := service.Update(context.Background(), "not-a-uuid", contestantrepo.UpsertInput{})
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrInvalidID)
	assert.False(t, spy.updateCalled)
}

func TestServiceDelete_ReturnsInvalidIDAndSkipsRepo(t *testing.T) {
	spy := &repositorySpy{}
	service := NewService(spy)

	err := service.Delete(context.Background(), "bad-id")
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrInvalidID)
	assert.False(t, spy.deleteCalled)
}

func TestServiceListPage_NormalizesPaginationParams(t *testing.T) {
	spy := &repositorySpy{}
	service := NewService(spy)

	_, err := service.ListPage(context.Background(), contestantrepo.ListParams{Page: 0, Limit: 1000})
	require.NoError(t, err)
	assert.Equal(t, contestantrepo.ListParams{Page: 1, Limit: 100}, spy.listPageParams)
}

func strPtr(value string) *string {
	return &value
}
