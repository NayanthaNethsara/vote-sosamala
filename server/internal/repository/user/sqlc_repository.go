package user

import (
	"context"
	"errors"

	"github.com/NayanthaNethsara/vote-sosamala/server/internal/model/domain"
	"github.com/NayanthaNethsara/vote-sosamala/server/internal/repository/sqlcgen"
	"github.com/jackc/pgx/v5"
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

	return toDomainUser(row), nil
}

func (r *SQLCRepository) GetByFirebaseUID(ctx context.Context, firebaseUID string) (domain.User, error) {
	row, err := r.queries.GetUserByFirebaseUID(ctx, firebaseUID)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.User{}, ErrNotFound
	}
	if err != nil {
		return domain.User{}, err
	}

	return toDomainUser(row), nil
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

	return toDomainUser(row), nil
}

func (r *SQLCRepository) List(ctx context.Context) ([]domain.User, error) {
	rows, err := r.queries.ListAllUsers(ctx)
	if err != nil {
		return nil, err
	}

	users := make([]domain.User, 0, len(rows))
	for _, row := range rows {
		users = append(users, toDomainUser(row))
	}

	return users, nil
}

func toDomainUser(row sqlcgen.User) domain.User {
	return domain.User{
		FirebaseUID: row.FirebaseUid,
		Email:       row.Email,
		DisplayName: row.DisplayName,
		PhotoURL:    row.PhotoUrl,
		Role:        row.Role,
		CreatedAt:   row.CreatedAt.Time,
		UpdatedAt:   row.UpdatedAt.Time,
	}
}
