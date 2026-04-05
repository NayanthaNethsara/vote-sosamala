package handler

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/nats-io/nats.go"
	"github.com/redis/go-redis/v9"
)

type HealthHandler struct {
	redisClient *redis.Client
	natsConn    *nats.Conn
	dbPool      *pgxpool.Pool
}

func NewHealthHandler(redisClient *redis.Client, natsConn *nats.Conn, dbPool *pgxpool.Pool) *HealthHandler {
	return &HealthHandler{
		redisClient: redisClient,
		natsConn:    natsConn,
		dbPool:      dbPool,
	}
}

func (h *HealthHandler) HealthCheck(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	status := gin.H{
		"status": "ok",
		"time":   time.Now().Format(time.RFC3339),
	}

	// Check Redis
	if err := h.redisClient.Ping(ctx).Err(); err != nil {
		status["redis"] = "disconnected: " + err.Error()
	} else {
		status["redis"] = "connected"
	}

	// Check Postgres
	if h.dbPool != nil {
		if err := h.dbPool.Ping(ctx); err != nil {
			status["database"] = "disconnected: " + err.Error()
		} else {
			status["database"] = "connected"
		}
	} else {
		status["database"] = "uninitialized"
	}

	// Check NATS
	if h.natsConn != nil && h.natsConn.IsConnected() {
		status["nats"] = "connected"
	} else {
		status["nats"] = "disconnected"
	}

	c.JSON(http.StatusOK, status)
}
