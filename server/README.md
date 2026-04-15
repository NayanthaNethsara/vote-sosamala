# Server (Go + Gin)

Backend API and domain services for the Sosamala Voting platform.

## Backend Architecture

### Request Pipeline

Incoming requests are processed by middleware, dispatched to handlers, executed in service-layer logic, and persisted through repositories into PostgreSQL. Services also interact with Firebase, Redis, and NATS where needed.

### Package Layout

The backend is organized by entrypoints, API transport, domain services, repositories, data models, platform adapters, and shared test utilities.

## Stack

- Go 1.25
- Gin
- PostgreSQL + pgx
- Redis
- NATS
- Firebase Admin SDK

## Run Locally

From repository root:

- `make server-fmt`
- `make server-lint`
- `make server-build`
- `make server-run`
- `make setup-run`

Manual run:

```bash
cd server
cp .env.example .env
go run cmd/server/main.go
```

## Folder Structure

- `cmd/server` - API entrypoint
- `cmd/setup` - setup/bootstrap runner
- `internal/api/handler` - HTTP handlers
- `internal/api/middleware` - auth and access middleware
- `internal/service` - domain business logic
- `internal/repository` - persistence adapters
- `internal/repository/sqlcgen` - generated SQL bindings
- `internal/model/domain` - domain entities
- `internal/model/dto` - transport DTOs
- `internal/platform` - external clients and infrastructure wiring
- `internal/config` - environment and runtime config
- `internal/testutil` - shared testing helpers
- `migrations` - SQL migrations

## Testing

Testing conventions:

- Unit tests are colocated with each package (`*_test.go`).
- Service tests use mocked repositories and in-memory data.
- Shared helper utilities live in `internal/testutil`.
- Prefer table-driven tests and `testify` assertions.

Run all tests:

```bash
cd server
go test ./...
```

Targeted examples:

```bash
go test ./internal/service/user -v
go test ./internal/api/handler -run 'TestListUsers_' -v
```

## Auth and Roles

Role model:

- `guest` default for authenticated users
- `admin` for admin area permissions
- `super-admin` for user role management

Claim key: `role`.

Super-admin APIs:

- `GET /api/admin/users`
- `PUT /api/admin/users/:uid/role`

After role updates, users must refresh ID token (or sign out/sign in) to receive new claims.

Bootstrap first super-admin:

1. Ensure target user has signed in at least once.
2. Set `BOOTSTRAP_SUPER_ADMIN_EMAIL` in `server/.env`.
3. Run `make setup-run`.

## Environment

Create local environment file:

```bash
cp .env.example .env
```

## Firebase and Local Docker Notes

- Use least-privilege IAM.
- Prefer ADC over static service account keys.
- Restrict CORS with `ALLOWED_ORIGINS`.

If Firebase fails inside Docker:

1. Run `gcloud auth application-default login` on host.
2. Ensure `FIREBASE_PROJECT_ID` is set in root `.env`.
3. Verify `~/.config/gcloud/application_default_credentials.json` exists.
4. Start with `docker compose up --build`.
