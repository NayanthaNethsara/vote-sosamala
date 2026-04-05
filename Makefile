.PHONY: help dev build fmt lint test server-run client-install

# Default target
all: help

## help: Display available commands
help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "General:"
	@echo "  help           Display this help message"
	@echo "  dev            Start the entire stack using Docker Compose"
	@echo ""
	@echo "Backend (Go):"
	@echo "  server-fmt     Format Go code"
	@echo "  server-lint    Run static analysis for Go"
	@echo "  server-build   Build the Go binary"
	@echo "  server-run     Run Go application locally"
	@echo ""
	@echo "Frontend (pnpm):"
	@echo "  client-install Install frontend dependencies"
	@echo "  client-fmt     Format frontend code using Prettier"
	@echo "  client-lint    Lint frontend code using ESLint"
	@echo ""
	@echo "Combined:"
	@echo "  fmt            Format both backend and frontend"
	@echo "  lint           Lint both backend and frontend"

## dev: Run the full stack with Docker Compose
dev:
	docker compose up --build

## server-fmt: Format the Go backend
server-fmt:
	@cd server && go fmt ./...

## server-lint: Lint the Go backend
server-lint:
	@cd server && go vet ./...

## server-build: Build the Go backend binary
server-build:
	@cd server && go build -o bin/server cmd/server/main.go

## server-run: Run the Go backend locally
server-run:
	@cd server && go run cmd/server/main.go

## migrate-up: Run database migrations up
migrate-up:
	@cd server && ~/go/bin/migrate -path migrations -database "postgres://user:password@localhost:5432/votes?sslmode=disable" up

## migrate-down: Run database migrations down
migrate-down:
	@cd server && ~/go/bin/migrate -path migrations -database "postgres://user:password@localhost:5432/votes?sslmode=disable" down

## client-install: Install frontend dependencies
client-install:
	@cd client && pnpm install

## client-fmt: Format the frontend
client-fmt:
	@cd client && pnpm run format

## client-lint: Lint the frontend
client-lint:
	@cd client && pnpm run lint

## fmt: Format everything
fmt: server-fmt client-fmt

## lint: Lint everything
lint: server-lint client-lint
