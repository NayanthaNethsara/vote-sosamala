# Go Gin Server

The backend for the Sosamala Voting system, built with Go 1.25, Gin, NATS, Redis, and Postgres.

## Tech Stack
- **Framework**: [Gin Gonic](https://gin-gonic.com/)
- **Infrastructure**: [NATS](https://nats.io/), [Redis](https://redis.io/), [PostgreSQL](https://postgresql.org/)
- **Configuration**: [godotenv](https://github.com/joho/godotenv)
- **Database Driver**: [pgx/v5](https://github.com/jackc/pgx)

## Quick Start

From the **root directory**, you can manage the server using:
- `make server-fmt`: Format Go code
- `make server-lint`: Run static analysis
- `make server-build`: Build the binary
- `make server-run`: Run Go application locally

To run manually for development:
```bash
cd server
cp .env.example .env
go run cmd/server/main.go
```

## Structure
- `/cmd/server`: Main API entry point
- `/cmd/setup`: Setup/bootstrap entry point
- `/internal/api/handler`: Gin handlers (transport adapters)
- `/internal/api/middleware`: Auth/Admin/CORS middleware
- `/internal/service`: Business logic layer
- `/internal/repository`: Data access layer
- `/internal/model/domain`: Domain models
- `/internal/model/dto`: Request/response DTOs
- `/internal/platform`: Infrastructure clients (Firebase, Postgres, Redis, NATS, HTTP server)
- `/internal/config`: Configuration management
- `/migrations`: SQL migrations

## Environment
Copy the example environment file and update with your local values:

```bash
cp .env.example .env
```
