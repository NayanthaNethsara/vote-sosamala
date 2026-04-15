package user

import (
	"context"
	"errors"

	"github.com/NayanthaNethsara/vote-sosamala/server/internal/model/domain"
	"github.com/NayanthaNethsara/vote-sosamala/server/internal/repository/sqlcgen"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SQLCRepository struct {
	db      *pgxpool.Pool
	queries *sqlcgen.Queries
}

func NewSQLCRepository(db *pgxpool.Pool) *SQLCRepository {
	return &SQLCRepository{db: db, queries: sqlcgen.New(db)}
}

func (r *SQLCRepository) Upsert(ctx context.Context, input UpsertInput) (domain.User, error) {
	row, err := r.queries.UpsertUser(ctx, sqlcgen.UpsertUserParams{
		FirebaseUid: input.FirebaseUID,
		Email:       input.Email,
		DisplayName: input.DisplayName,
		PhotoUrl:    input.PhotoURL,
		Role:        input.Role,
	})
	if err != nil {
		return domain.User{}, err
	}

	return toDomainUser(row.FirebaseUid, row.Email, row.DisplayName, row.PhotoUrl, row.Role, row.LastLoginAt, row.CreatedAt, row.UpdatedAt), nil
}

func (r *SQLCRepository) GetByFirebaseUID(ctx context.Context, firebaseUID string) (domain.User, error) {
	row, err := r.queries.GetUserByFirebaseUID(ctx, firebaseUID)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.User{}, ErrNotFound
	}
	if err != nil {
		return domain.User{}, err
	}

	return toDomainUser(row.FirebaseUid, row.Email, row.DisplayName, row.PhotoUrl, row.Role, row.LastLoginAt, row.CreatedAt, row.UpdatedAt), nil
}

func (r *SQLCRepository) UpdateRole(ctx context.Context, firebaseUID string, role string) (domain.User, error) {
	row, err := r.queries.UpdateUserRole(ctx, sqlcgen.UpdateUserRoleParams{
		FirebaseUid: firebaseUID,
		Role:        role,
	})
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.User{}, ErrNotFound
	}
	if err != nil {
		return domain.User{}, err
	}

	return toDomainUser(row.FirebaseUid, row.Email, row.DisplayName, row.PhotoUrl, row.Role, row.LastLoginAt, row.CreatedAt, row.UpdatedAt), nil
}

func (r *SQLCRepository) List(ctx context.Context, params ListParams) (ListResult, error) {
	offset := (params.Page - 1) * params.Limit
	if offset < 0 {
		offset = 0
	}

	var roleFilter any
	if params.Role != "" {
		roleFilter = params.Role
	}

	var total int64
	err := r.db.QueryRow(
		ctx,
		`SELECT COUNT(*)
		 FROM users
		 WHERE ($1::text IS NULL OR role = $1)`,
		roleFilter,
	).Scan(&total)
	if err != nil {
		return ListResult{}, err
	}

	rows, err := r.db.Query(
		ctx,
		`SELECT firebase_uid, email, display_name, photo_url, role, last_login_at, created_at, updated_at
		 FROM users
		 WHERE ($1::text IS NULL OR role = $1)
		 ORDER BY created_at DESC
		 LIMIT $2 OFFSET $3`,
		roleFilter,
		params.Limit,
		offset,
	)
	if err != nil {
		return ListResult{}, err
	}
	defer rows.Close()

	users := make([]domain.User, 0, params.Limit)
	for rows.Next() {
		var firebaseUID string
		var email string
		var displayName string
		var photoURL *string
		var role string
		var lastLoginAt pgtype.Timestamptz
		var createdAt pgtype.Timestamptz
		var updatedAt pgtype.Timestamptz

		if err := rows.Scan(&firebaseUID, &email, &displayName, &photoURL, &role, &lastLoginAt, &createdAt, &updatedAt); err != nil {
			return ListResult{}, err
		}

		users = append(users, toDomainUser(firebaseUID, email, displayName, photoURL, role, lastLoginAt, createdAt, updatedAt))
	}

	if err := rows.Err(); err != nil {
		return ListResult{}, err
	}

	return ListResult{
		Users: users,
		Total: total,
	}, nil
}

func toDomainUser(
	firebaseUID string,
	email string,
	displayName string,
	photoURL *string,
	role string,
	lastLoginAt pgtype.Timestamptz,
	createdAt pgtype.Timestamptz,
	updatedAt pgtype.Timestamptz,
) domain.User {
	u := domain.User{
		FirebaseUID: firebaseUID,
		Email:       email,
		DisplayName: displayName,
		PhotoURL:    photoURL,
		Role:        role,
		CreatedAt:   createdAt.Time,
		UpdatedAt:   updatedAt.Time,
	}

	if lastLoginAt.Valid {
		t := lastLoginAt.Time
		u.LastLoginAt = &t
	}

	return u
}
