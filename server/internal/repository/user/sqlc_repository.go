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
	queries *sqlcgen.Queries
}

func NewSQLCRepository(db *pgxpool.Pool) *SQLCRepository {
	return &SQLCRepository{queries: sqlcgen.New(db)}
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

func (r *SQLCRepository) List(ctx context.Context) ([]domain.User, error) {
	rows, err := r.queries.ListAllUsers(ctx)
	if err != nil {
		return nil, err
	}

	users := make([]domain.User, 0, len(rows))
	for _, row := range rows {
		users = append(users, toDomainUser(row.FirebaseUid, row.Email, row.DisplayName, row.PhotoUrl, row.Role, row.LastLoginAt, row.CreatedAt, row.UpdatedAt))
	}

	return users, nil
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
