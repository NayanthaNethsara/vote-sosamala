# Build stage
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o /server cmd/server/main.go

# Final stage
FROM alpine:latest

WORKDIR /

# Copy the binary from the build stage
COPY --from=builder /server /server

# Set environment variables
ENV GIN_MODE=release
ENV PORT=8080

EXPOSE 8080

CMD ["/server"]
