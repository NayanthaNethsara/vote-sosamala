package contestant

import (
	"context"
	"errors"

	"github.com/NayanthaNethsara/vote-sosamala/server/internal/model/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresRepository struct {
	db *pgxpool.Pool
}

func NewPostgresRepository(db *pgxpool.Pool) *PostgresRepository {
	return &PostgresRepository{db: db}
}

func (r *PostgresRepository) Create(ctx context.Context, input UpsertInput) (domain.Contestant, error) {
	query := `
		INSERT INTO contestants (name, birthday, nic_or_student_id, photo_url, gender, academic_year)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, name, birthday::text, nic_or_student_id, photo_url, gender, academic_year, created_at, updated_at
	`

	var result domain.Contestant
	err := r.db.QueryRow(ctx, query,
		input.Name,
		input.Birthday,
		input.NicOrStudentID,
		input.PhotoURL,
		input.Gender,
		input.AcademicYear,
	).Scan(
		&result.ID,
		&result.Name,
		&result.Birthday,
		&result.NicOrStudentID,
		&result.PhotoURL,
		&result.Gender,
		&result.AcademicYear,
		&result.CreatedAt,
		&result.UpdatedAt,
	)
	if isUniqueViolation(err) {
		return domain.Contestant{}, ErrConflict
	}

	return result, err
}

func (r *PostgresRepository) List(ctx context.Context) ([]domain.Contestant, error) {
	query := `
		SELECT id, name, birthday::text, nic_or_student_id, photo_url, gender, academic_year, created_at, updated_at
		FROM contestants
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	contestants := make([]domain.Contestant, 0)
	for rows.Next() {
		var item domain.Contestant
		if err := rows.Scan(
			&item.ID,
			&item.Name,
			&item.Birthday,
			&item.NicOrStudentID,
			&item.PhotoURL,
			&item.Gender,
			&item.AcademicYear,
			&item.CreatedAt,
			&item.UpdatedAt,
		); err != nil {
			return nil, err
		}

		contestants = append(contestants, item)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return contestants, nil
}

func (r *PostgresRepository) Update(ctx context.Context, id string, input UpsertInput) (domain.Contestant, error) {
	query := `
		UPDATE contestants
		SET
			name = $1,
			birthday = $2,
			nic_or_student_id = $3,
			photo_url = $4,
			gender = $5,
			academic_year = $6,
			updated_at = NOW()
		WHERE id = $7
		RETURNING id, name, birthday::text, nic_or_student_id, photo_url, gender, academic_year, created_at, updated_at
	`

	var result domain.Contestant
	err := r.db.QueryRow(ctx, query,
		input.Name,
		input.Birthday,
		input.NicOrStudentID,
		input.PhotoURL,
		input.Gender,
		input.AcademicYear,
		id,
	).Scan(
		&result.ID,
		&result.Name,
		&result.Birthday,
		&result.NicOrStudentID,
		&result.PhotoURL,
		&result.Gender,
		&result.AcademicYear,
		&result.CreatedAt,
		&result.UpdatedAt,
	)
	if isUniqueViolation(err) {
		return domain.Contestant{}, ErrConflict
	}
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.Contestant{}, ErrNotFound
	}

	return result, err
}

func (r *PostgresRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM contestants WHERE id = $1`
	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return ErrNotFound
	}

	return nil
}

func isUniqueViolation(err error) bool {
	if err == nil {
		return false
	}

	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}
