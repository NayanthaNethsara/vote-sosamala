package contestant

import (
	"context"
	"errors"
	"regexp"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/pashagolub/pgxmock/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestSQLCRepositoryListPage_ReturnsContestantsAndTotal(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := NewSQLCRepositoryWithDB(mock)

	totalRows := pgxmock.NewRows([]string{"count"}).AddRow(int64(2))
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT COUNT(*) FROM contestants`)).WillReturnRows(totalRows)

	firstID := mustPgUUID(t)
	secondID := mustPgUUID(t)
	birthDate := pgtype.Date{Time: time.Date(2000, 2, 10, 0, 0, 0, 0, time.UTC), Valid: true}
	createdAt := pgtype.Timestamptz{Time: time.Date(2026, 1, 2, 10, 0, 0, 0, time.UTC), Valid: true}
	updatedAt := pgtype.Timestamptz{Time: time.Date(2026, 1, 3, 11, 0, 0, 0, time.UTC), Valid: true}
	photoURL := "https://cdn.example.com/p1.jpg"
	male := "male"
	female := "female"
	year := "3rd Year"
	semester := "2nd Semester"
	nic := "200012345678"
	studentID := "SEU/IS/20/ICT/001"

	rows := pgxmock.NewRows([]string{"id", "name", "date_of_birth", "photo_url", "gender", "academic_year", "semester", "nic", "student_id", "created_at", "updated_at"}).
		AddRow(firstID, "Contestant One", birthDate, &photoURL, &male, &year, &semester, &nic, &studentID, createdAt, updatedAt).
		AddRow(secondID, "Contestant Two", birthDate, nil, &female, &year, &semester, nil, nil, createdAt, updatedAt)

	mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, name, date_of_birth, photo_url, gender, academic_year, semester, nic, student_id, created_at, updated_at
		 FROM contestants
		 ORDER BY created_at DESC
		 LIMIT $1 OFFSET $2`)).
		WithArgs(10, 0).
		WillReturnRows(rows)

	result, err := repo.ListPage(context.Background(), ListParams{Page: 1, Limit: 10})
	require.NoError(t, err)
	require.Len(t, result.Contestants, 2)
	assert.Equal(t, int64(2), result.Total)
	assert.Equal(t, "Contestant One", result.Contestants[0].Name)
	assert.Equal(t, "male", result.Contestants[0].Gender)
	assert.Equal(t, "Contestant Two", result.Contestants[1].Name)
	assert.Equal(t, "female", result.Contestants[1].Gender)
	assert.Nil(t, result.Contestants[1].PhotoURL)

	require.NoError(t, mock.ExpectationsWereMet())
}

func TestSQLCRepositoryListPage_ReturnsCountError(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := NewSQLCRepositoryWithDB(mock)

	mock.ExpectQuery(regexp.QuoteMeta(`SELECT COUNT(*) FROM contestants`)).WillReturnError(errors.New("count failed"))

	_, err = repo.ListPage(context.Background(), ListParams{Page: 1, Limit: 10})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "count failed")

	require.NoError(t, mock.ExpectationsWereMet())
}

func TestSQLCRepositoryCreate_MapsUniqueViolationToConflict(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := NewSQLCRepositoryWithDB(mock)

	mock.ExpectQuery(regexp.QuoteMeta(`INSERT INTO contestants (name, date_of_birth, photo_url, gender, academic_year, semester, nic, student_id)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING id, name, date_of_birth, photo_url, gender, academic_year, semester, nic, student_id, created_at, updated_at`)).
		WithArgs(
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
		).
		WillReturnError(&pgconn.PgError{Code: "23505"})

	nic := "200012345678"
	_, err = repo.Create(context.Background(), UpsertInput{
		Name:         "Contestant One",
		DateOfBirth:  "2000-02-10",
		Gender:       "male",
		AcademicYear: "3rd Year",
		Semester:     "2nd Semester",
		NIC:          &nic,
	})
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrConflict)

	require.NoError(t, mock.ExpectationsWereMet())
}

func TestSQLCRepositoryCreate_ReturnsCreatedContestant(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := NewSQLCRepositoryWithDB(mock)

	id := mustPgUUID(t)
	birthDate := pgtype.Date{Time: time.Date(2000, 2, 10, 0, 0, 0, 0, time.UTC), Valid: true}
	createdAt := pgtype.Timestamptz{Time: time.Date(2026, 1, 2, 10, 0, 0, 0, time.UTC), Valid: true}
	updatedAt := pgtype.Timestamptz{Time: time.Date(2026, 1, 2, 10, 0, 0, 0, time.UTC), Valid: true}
	male := "male"
	year := "3rd Year"
	semester := "2nd Semester"
	nic := "200012345678"

	rows := pgxmock.NewRows([]string{"id", "name", "date_of_birth", "photo_url", "gender", "academic_year", "semester", "nic", "student_id", "created_at", "updated_at"}).
		AddRow(id, "Contestant One", birthDate, nil, &male, &year, &semester, &nic, nil, createdAt, updatedAt)

	mock.ExpectQuery(regexp.QuoteMeta(`INSERT INTO contestants (name, date_of_birth, photo_url, gender, academic_year, semester, nic, student_id)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING id, name, date_of_birth, photo_url, gender, academic_year, semester, nic, student_id, created_at, updated_at`)).
		WithArgs(
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
		).
		WillReturnRows(rows)

	result, err := repo.Create(context.Background(), UpsertInput{
		Name:         "Contestant One",
		DateOfBirth:  "2000-02-10",
		Gender:       "male",
		AcademicYear: "3rd Year",
		Semester:     "2nd Semester",
		NIC:          &nic,
	})
	require.NoError(t, err)
	assert.Equal(t, "Contestant One", result.Name)
	assert.Equal(t, "2000-02-10", result.DateOfBirth)
	assert.Equal(t, "male", result.Gender)

	require.NoError(t, mock.ExpectationsWereMet())
}

func TestSQLCRepositoryUpdate_MapsUniqueViolationToConflict(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := NewSQLCRepositoryWithDB(mock)

	mock.ExpectQuery(regexp.QuoteMeta(`UPDATE contestants
SET
  name = $2,
  date_of_birth = $3,
  photo_url = $4,
  gender = $5,
  academic_year = $6,
  semester = $7,
  nic = $8,
  student_id = $9,
  updated_at = NOW()
WHERE id = $1
RETURNING id, name, date_of_birth, photo_url, gender, academic_year, semester, nic, student_id, created_at, updated_at`)).
		WithArgs(
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
		).
		WillReturnError(&pgconn.PgError{Code: "23505"})

	nic := "200012345678"
	_, err = repo.Update(context.Background(), uuid.NewString(), UpsertInput{
		Name:         "Contestant One",
		DateOfBirth:  "2000-02-10",
		Gender:       "male",
		AcademicYear: "3rd Year",
		Semester:     "2nd Semester",
		NIC:          &nic,
	})
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrConflict)

	require.NoError(t, mock.ExpectationsWereMet())
}

func TestSQLCRepositoryUpdate_MapsNoRowsToNotFound(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := NewSQLCRepositoryWithDB(mock)

	mock.ExpectQuery(regexp.QuoteMeta(`UPDATE contestants
SET
  name = $2,
  date_of_birth = $3,
  photo_url = $4,
  gender = $5,
  academic_year = $6,
  semester = $7,
  nic = $8,
  student_id = $9,
  updated_at = NOW()
WHERE id = $1
RETURNING id, name, date_of_birth, photo_url, gender, academic_year, semester, nic, student_id, created_at, updated_at`)).
		WithArgs(
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
		).
		WillReturnError(pgx.ErrNoRows)

	nic := "200012345678"
	_, err = repo.Update(context.Background(), uuid.NewString(), UpsertInput{
		Name:         "Contestant One",
		DateOfBirth:  "2000-02-10",
		Gender:       "male",
		AcademicYear: "3rd Year",
		Semester:     "2nd Semester",
		NIC:          &nic,
	})
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrNotFound)

	require.NoError(t, mock.ExpectationsWereMet())
}

func TestSQLCRepositoryUpdate_ReturnsUpdatedContestant(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := NewSQLCRepositoryWithDB(mock)

	id := mustPgUUID(t)
	birthDate := pgtype.Date{Time: time.Date(1999, 1, 1, 0, 0, 0, 0, time.UTC), Valid: true}
	createdAt := pgtype.Timestamptz{Time: time.Date(2026, 1, 2, 10, 0, 0, 0, time.UTC), Valid: true}
	updatedAt := pgtype.Timestamptz{Time: time.Date(2026, 1, 3, 10, 0, 0, 0, time.UTC), Valid: true}
	female := "female"
	year := "4th Year"
	semester := "1st Semester"
	nic := "199912345678"

	rows := pgxmock.NewRows([]string{"id", "name", "date_of_birth", "photo_url", "gender", "academic_year", "semester", "nic", "student_id", "created_at", "updated_at"}).
		AddRow(id, "Contestant Two", birthDate, nil, &female, &year, &semester, &nic, nil, createdAt, updatedAt)

	mock.ExpectQuery(regexp.QuoteMeta(`UPDATE contestants
SET
  name = $2,
  date_of_birth = $3,
  photo_url = $4,
  gender = $5,
  academic_year = $6,
  semester = $7,
  nic = $8,
  student_id = $9,
  updated_at = NOW()
WHERE id = $1
RETURNING id, name, date_of_birth, photo_url, gender, academic_year, semester, nic, student_id, created_at, updated_at`)).
		WithArgs(
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
			pgxmock.AnyArg(),
		).
		WillReturnRows(rows)

	result, err := repo.Update(context.Background(), uuid.UUID(id.Bytes).String(), UpsertInput{
		Name:         "Contestant Two",
		DateOfBirth:  "1999-01-01",
		Gender:       "female",
		AcademicYear: "4th Year",
		Semester:     "1st Semester",
		NIC:          &nic,
	})
	require.NoError(t, err)
	assert.Equal(t, "Contestant Two", result.Name)
	assert.Equal(t, "1999-01-01", result.DateOfBirth)
	assert.Equal(t, "female", result.Gender)

	require.NoError(t, mock.ExpectationsWereMet())
}

func TestSQLCRepositoryDelete_ReturnsNotFoundWhenNoRowsDeleted(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := NewSQLCRepositoryWithDB(mock)

	mock.ExpectExec(regexp.QuoteMeta(`DELETE FROM contestants
WHERE id = $1`)).
		WithArgs(pgxmock.AnyArg()).
		WillReturnResult(pgxmock.NewResult("DELETE", 0))

	err = repo.Delete(context.Background(), uuid.NewString())
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrNotFound)

	require.NoError(t, mock.ExpectationsWereMet())
}

func TestSQLCRepositoryDelete_SucceedsWhenRowDeleted(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := NewSQLCRepositoryWithDB(mock)

	mock.ExpectExec(regexp.QuoteMeta(`DELETE FROM contestants
WHERE id = $1`)).
		WithArgs(pgxmock.AnyArg()).
		WillReturnResult(pgxmock.NewResult("DELETE", 1))

	err = repo.Delete(context.Background(), uuid.NewString())
	require.NoError(t, err)

	require.NoError(t, mock.ExpectationsWereMet())
}

func mustPgUUID(t *testing.T) pgtype.UUID {
	t.Helper()

	id := uuid.New()
	var bytes [16]byte
	copy(bytes[:], id[:])
	return pgtype.UUID{Bytes: bytes, Valid: true}
}
