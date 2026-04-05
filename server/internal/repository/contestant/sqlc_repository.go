package contestant

import (
	"context"
	"errors"
	"time"

	"github.com/NayanthaNethsara/vote-sosamala/server/internal/model/domain"
	"github.com/NayanthaNethsara/vote-sosamala/server/internal/repository/sqlcgen"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SQLCRepository struct {
	queries *sqlcgen.Queries
}

func NewSQLCRepository(db *pgxpool.Pool) *SQLCRepository {
	return &SQLCRepository{queries: sqlcgen.New(db)}
}

func (r *SQLCRepository) Create(ctx context.Context, input UpsertInput) (domain.Contestant, error) {
	dateOfBirth, err := toPgDate(input.DateOfBirth)
	if err != nil {
		return domain.Contestant{}, err
	}

	row, err := r.queries.CreateContestant(ctx, sqlcgen.CreateContestantParams{
		Name:         input.Name,
		DateOfBirth:  dateOfBirth,
		PhotoUrl:     input.PhotoURL,
		Gender:       stringPtr(input.Gender),
		AcademicYear: stringPtr(input.AcademicYear),
		Semester:     stringPtr(input.Semester),
		Nic:          input.NIC,
		StudentID:    input.StudentID,
	})
	if isUniqueViolation(err) {
		return domain.Contestant{}, ErrConflict
	}
	if err != nil {
		return domain.Contestant{}, err
	}

	return toDomainContestant(
		row.ID,
		row.Name,
		row.DateOfBirth,
		row.PhotoUrl,
		row.Gender,
		row.AcademicYear,
		row.Semester,
		row.Nic,
		row.StudentID,
		row.CreatedAt,
		row.UpdatedAt,
	), nil
}

func (r *SQLCRepository) List(ctx context.Context) ([]domain.Contestant, error) {
	rows, err := r.queries.ListContestants(ctx)
	if err != nil {
		return nil, err
	}

	contestants := make([]domain.Contestant, 0, len(rows))
	for _, row := range rows {
		contestants = append(contestants, toDomainContestant(
			row.ID,
			row.Name,
			row.DateOfBirth,
			row.PhotoUrl,
			row.Gender,
			row.AcademicYear,
			row.Semester,
			row.Nic,
			row.StudentID,
			row.CreatedAt,
			row.UpdatedAt,
		))
	}

	return contestants, nil
}

func (r *SQLCRepository) Update(ctx context.Context, id string, input UpsertInput) (domain.Contestant, error) {
	parsedID, err := toPgUUID(id)
	if err != nil {
		return domain.Contestant{}, err
	}

	dateOfBirth, err := toPgDate(input.DateOfBirth)
	if err != nil {
		return domain.Contestant{}, err
	}

	row, err := r.queries.UpdateContestant(ctx, sqlcgen.UpdateContestantParams{
		ID:           parsedID,
		Name:         input.Name,
		DateOfBirth:  dateOfBirth,
		PhotoUrl:     input.PhotoURL,
		Gender:       stringPtr(input.Gender),
		AcademicYear: stringPtr(input.AcademicYear),
		Semester:     stringPtr(input.Semester),
		Nic:          input.NIC,
		StudentID:    input.StudentID,
	})
	if isUniqueViolation(err) {
		return domain.Contestant{}, ErrConflict
	}
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.Contestant{}, ErrNotFound
	}
	if err != nil {
		return domain.Contestant{}, err
	}

	return toDomainContestant(
		row.ID,
		row.Name,
		row.DateOfBirth,
		row.PhotoUrl,
		row.Gender,
		row.AcademicYear,
		row.Semester,
		row.Nic,
		row.StudentID,
		row.CreatedAt,
		row.UpdatedAt,
	), nil
}

func (r *SQLCRepository) Delete(ctx context.Context, id string) error {
	parsedID, err := toPgUUID(id)
	if err != nil {
		return err
	}

	rowsAffected, err := r.queries.DeleteContestant(ctx, parsedID)
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}

func toPgUUID(id string) (pgtype.UUID, error) {
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return pgtype.UUID{}, err
	}

	var bytes [16]byte
	copy(bytes[:], parsedID[:])
	return pgtype.UUID{Bytes: bytes, Valid: true}, nil
}

func toPgDate(value string) (pgtype.Date, error) {
	parsedDate, err := time.Parse("2006-01-02", value)
	if err != nil {
		return pgtype.Date{}, err
	}

	return pgtype.Date{Time: parsedDate, Valid: true}, nil
}

func toDomainContestant(
	id pgtype.UUID,
	name string,
	dateOfBirth pgtype.Date,
	photoURL *string,
	gender *string,
	academicYear *string,
	semester *string,
	nic *string,
	studentID *string,
	createdAt pgtype.Timestamptz,
	updatedAt pgtype.Timestamptz,
) domain.Contestant {
	domainID := ""
	if id.Valid {
		domainID = uuid.UUID(id.Bytes).String()
	}

	dateOfBirthValue := dateString(dateOfBirth)
	genderValue := stringValue(gender)
	academicYearValue := stringValue(academicYear)
	semesterValue := stringValue(semester)

	return domain.Contestant{
		ID:           domainID,
		Name:         name,
		DateOfBirth:  dateOfBirthValue,
		PhotoURL:     photoURL,
		Gender:       genderValue,
		AcademicYear: academicYearValue,
		Semester:     semesterValue,
		NIC:          nic,
		StudentID:    studentID,
		CreatedAt:    createdAt.Time,
		UpdatedAt:    updatedAt.Time,
	}
}

func dateString(value pgtype.Date) string {
	if !value.Valid {
		return ""
	}

	return value.Time.Format("2006-01-02")
}

func stringValue(value *string) string {
	if value == nil {
		return ""
	}

	return *value
}

func stringPtr(value string) *string {
	return &value
}

func isUniqueViolation(err error) bool {
	if err == nil {
		return false
	}

	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}
