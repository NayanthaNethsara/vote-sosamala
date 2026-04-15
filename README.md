# Sosamala Voting

Sosamala Voting is a self-hostable, open-source voting platform for small contests and event-based voting workflows.

## System Architecture

### Runtime Topology

Client applications communicate with the Go API over HTTP. The backend persists data in PostgreSQL and uses Redis and NATS for supporting runtime workflows.

### Backend Domain Flow

Request handling flows through middleware, handlers, service logic, and repository access. Platform integrations include Firebase, Redis, and NATS.

## Quick Start

Prerequisites:

- Docker
- Docker Compose
- Make

### Full Stack (Docker)

```bash
make dev
```

Services:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

### Local Development (Without Docker)

Backend:

```bash
make server-run
```

Frontend:

```bash
make client-install
cd client && pnpm dev
```

## Developer Commands

Main commands from repository root:

- `make help` - list all targets
- `make dev` - run full stack with Docker Compose
- `make fmt` - format server and client
- `make lint` - run server vet and client lint
- `make server-build` - build server binary
- `make server-run` - run server locally
- `make setup-run` - run bootstrap/setup script
- `make client-install` - install client dependencies

## Repository Layout

- `client` - Next.js frontend
- `server` - Go backend
- `docker-compose.yml` - local stack orchestration
- `Makefile` - developer automation
- `.github/workflows` - CI workflows

## Documentation Map

- [Client README](client/README.md)
- [Server README](server/README.md)
- [Contributing](CONTRIBUTING.md)

## License

[MIT](LICENSE)
