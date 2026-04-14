package platform

import (
	"context"
	"fmt"
	"net/url"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/pgx"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/jackc/pgx/v5/pgxpool"
)

// RunMigrations executes all pending migrations from the migrations directory using pgx driver.
func RunMigrations(ctx context.Context, pool *pgxpool.Pool, migrationsDir string) error {
	// Get the database connection config from the pool
	connConfig := pool.Config().ConnConfig

	// Build pgx-compatible connection string for migrate
	// Format: pgx://user:password@host:port/database?param=value
	dsn := url.URL{
		Scheme: "pgx",
		User:   url.UserPassword(connConfig.User, connConfig.Password),
		Host:   fmt.Sprintf("%s:%d", connConfig.Host, connConfig.Port),
		Path:   connConfig.Database,
	}

	// Create migrate instance
	m, err := migrate.New(
		"file://"+migrationsDir,
		dsn.String(),
	)
	if err != nil {
		return fmt.Errorf("failed to create migrate instance: %w", err)
	}
	defer m.Close()

	// Run migrations
	if err := m.Up(); err != nil {
		if err == migrate.ErrNoChange {
			fmt.Println("No pending migrations to apply")
			return nil
		}
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	fmt.Println("All migrations applied successfully")
	return nil
}
