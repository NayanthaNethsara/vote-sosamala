package handler

import (
	"context"
	"net/http"
	"testing"
	"time"

	"github.com/NayanthaNethsara/vote-sosamala/server/internal/api/middleware"
	"github.com/NayanthaNethsara/vote-sosamala/server/internal/repository/vote"
	voteservice "github.com/NayanthaNethsara/vote-sosamala/server/internal/service/vote"
	"github.com/NayanthaNethsara/vote-sosamala/server/internal/testutil/httpx"
	"github.com/alicebob/miniredis/v2"
	"github.com/gin-gonic/gin"
	nserver "github.com/nats-io/nats-server/v2/server"
	"github.com/nats-io/nats.go"
	"github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type voteRepoStub struct {
	hasUserVoteFn      func(ctx context.Context, firebaseUID string) (bool, error)
	applyVoteBatchFn   func(ctx context.Context, votes []vote.PersistVote) (vote.BatchPersistResult, error)
	getAllVoteCountsFn func(ctx context.Context) ([]vote.ContestantVoteCount, error)
}

func (r *voteRepoStub) HasUserVote(ctx context.Context, firebaseUID string) (bool, error) {
	if r.hasUserVoteFn != nil {
		return r.hasUserVoteFn(ctx, firebaseUID)
	}
	return false, nil
}

func (r *voteRepoStub) InsertUserVote(ctx context.Context, firebaseUID string, contestantID string, votedAt time.Time) (bool, error) {
	return true, nil
}

func (r *voteRepoStub) IncrementContestantVotes(ctx context.Context, contestantID string, delta int64) error {
	return nil
}

func (r *voteRepoStub) ApplyVoteBatch(ctx context.Context, votes []vote.PersistVote) (vote.BatchPersistResult, error) {
	if r.applyVoteBatchFn != nil {
		return r.applyVoteBatchFn(ctx, votes)
	}
	return vote.BatchPersistResult{InsertedByContestant: map[string]int64{}, DuplicateByContestant: map[string]int64{}}, nil
}

func (r *voteRepoStub) GetContestantVotes(ctx context.Context, contestantID string) (int64, error) {
	return 0, nil
}

func (r *voteRepoStub) GetAllContestantVoteCounts(ctx context.Context) ([]vote.ContestantVoteCount, error) {
	if r.getAllVoteCountsFn != nil {
		return r.getAllVoteCountsFn(ctx)
	}
	return nil, nil
}

func setupVoteRouter(t *testing.T, svc *voteservice.Service) (*gin.Engine, *redis.Client) {
	t.Helper()
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(func(c *gin.Context) {
		c.Set(middleware.ContextKeyUID, "uid-1")
		c.Next()
	})

	h := NewVoteHandler(svc)
	router.POST("/api/votes", h.CastVote)
	router.GET("/api/contestants/:id/votes", h.GetContestantVotes)
	router.GET("/api/results", h.GetLeaderboard)
	router.GET("/api/votes/status", h.GetMyVoteStatus)

	return router, nil
}

func TestCastVote_Returns202OnSuccess(t *testing.T) {
	repo := &voteRepoStub{}
	mr, redisClient := newVoteHandlerRedis(t)
	defer mr.Close()
	defer redisClient.Close()

	ns, nc := newVoteHandlerNATS(t)
	defer nc.Close()
	defer ns.Shutdown()

	svc := voteservice.NewService(repo, redisClient, nc, time.Second)
	router, _ := setupVoteRouter(t, svc)

	res := httpx.PerformJSONRequest(t, router, http.MethodPost, "/api/votes", map[string]any{"contestantId": "11111111-1111-1111-1111-111111111111"})
	require.Equal(t, http.StatusAccepted, res.Code)
}

func TestCastVote_Returns409ForDuplicate(t *testing.T) {
	repo := &voteRepoStub{}
	mr, redisClient := newVoteHandlerRedis(t)
	defer mr.Close()
	defer redisClient.Close()

	ns, nc := newVoteHandlerNATS(t)
	defer nc.Close()
	defer ns.Shutdown()

	require.NoError(t, redisClient.Set(context.Background(), "vote:user:uid-1", "11111111-1111-1111-1111-111111111111", 0).Err())

	svc := voteservice.NewService(repo, redisClient, nc, time.Second)
	router, _ := setupVoteRouter(t, svc)

	res := httpx.PerformJSONRequest(t, router, http.MethodPost, "/api/votes", map[string]any{"contestantId": "11111111-1111-1111-1111-111111111111"})
	require.Equal(t, http.StatusConflict, res.Code)
}

func TestCastVote_Returns400ForBadPayload(t *testing.T) {
	svc := voteservice.NewService(&voteRepoStub{}, nil, nil, time.Second)
	router, _ := setupVoteRouter(t, svc)

	res := httpx.PerformJSONRequest(t, router, http.MethodPost, "/api/votes", map[string]any{})
	require.Equal(t, http.StatusBadRequest, res.Code)
}

func TestGetContestantVotes_Returns200(t *testing.T) {
	repo := &voteRepoStub{}
	mr, redisClient := newVoteHandlerRedis(t)
	defer mr.Close()
	defer redisClient.Close()

	require.NoError(t, redisClient.HSet(context.Background(), "vote:counts:hash", "11111111-1111-1111-1111-111111111111", 9).Err())
	svc := voteservice.NewService(repo, redisClient, nil, time.Second)
	router, _ := setupVoteRouter(t, svc)

	res := httpx.PerformJSONRequest(t, router, http.MethodGet, "/api/contestants/11111111-1111-1111-1111-111111111111/votes", nil)
	require.Equal(t, http.StatusOK, res.Code)
	var payload map[string]any
	httpx.DecodeJSON(t, res, &payload)
	assert.Equal(t, "11111111-1111-1111-1111-111111111111", payload["contestantId"])
}

func TestGetLeaderboard_Returns200(t *testing.T) {
	repo := &voteRepoStub{}
	mr, redisClient := newVoteHandlerRedis(t)
	defer mr.Close()
	defer redisClient.Close()

	require.NoError(t, redisClient.ZAdd(context.Background(), "vote:counts:rank", redis.Z{Member: "c1", Score: 10}).Err())
	svc := voteservice.NewService(repo, redisClient, nil, time.Second)
	router, _ := setupVoteRouter(t, svc)

	res := httpx.PerformJSONRequest(t, router, http.MethodGet, "/api/results?page=1&limit=20", nil)
	require.Equal(t, http.StatusOK, res.Code)
}

func TestGetMyVoteStatus_Returns200(t *testing.T) {
	repo := &voteRepoStub{hasUserVoteFn: func(ctx context.Context, firebaseUID string) (bool, error) {
		return true, nil
	}}
	svc := voteservice.NewService(repo, nil, nil, time.Second)
	router, _ := setupVoteRouter(t, svc)

	res := httpx.PerformJSONRequest(t, router, http.MethodGet, "/api/votes/status", nil)
	require.Equal(t, http.StatusOK, res.Code)
	var payload map[string]any
	httpx.DecodeJSON(t, res, &payload)
	assert.Equal(t, true, payload["hasVoted"])
}

func newVoteHandlerRedis(t *testing.T) (*miniredis.Miniredis, *redis.Client) {
	t.Helper()
	mr, err := miniredis.Run()
	require.NoError(t, err)
	client := redis.NewClient(&redis.Options{Addr: mr.Addr()})
	t.Cleanup(func() {
		_ = client.Close()
		mr.Close()
	})
	return mr, client
}

func newVoteHandlerNATS(t *testing.T) (*nserver.Server, *nats.Conn) {
	t.Helper()
	server, err := nserver.NewServer(&nserver.Options{Host: "127.0.0.1", Port: -1, NoLog: true, NoSigs: true})
	require.NoError(t, err)
	go server.Start()
	require.True(t, server.ReadyForConnections(5*time.Second))

	conn, err := nats.Connect(server.ClientURL())
	require.NoError(t, err)
	t.Cleanup(func() {
		conn.Close()
		server.Shutdown()
	})
	return server, conn
}
