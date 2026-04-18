package vote

import (
	"context"
	"encoding/json"
	"errors"
	"testing"
	"time"

	"github.com/NayanthaNethsara/vote-sosamala/server/internal/repository/vote"
	"github.com/alicebob/miniredis/v2"
	nserver "github.com/nats-io/nats-server/v2/server"
	"github.com/nats-io/nats.go"
	"github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type repositoryStub struct {
	hasUserVoteFn           func(ctx context.Context, firebaseUID string) (bool, error)
	insertUserVoteFn        func(ctx context.Context, firebaseUID string, contestantID string, votedAt time.Time) (bool, error)
	incrementContestantFn   func(ctx context.Context, contestantID string, delta int64) error
	applyVoteBatchFn        func(ctx context.Context, votes []vote.PersistVote) (vote.BatchPersistResult, error)
	getContestantVotesFn    func(ctx context.Context, contestantID string) (int64, error)
	getAllVoteCountsFn      func(ctx context.Context) ([]vote.ContestantVoteCount, error)
	applyVoteBatchCallCount int
	applyVoteBatchLastVotes []vote.PersistVote
	hasUserVoteLastUID      string
}

func (r *repositoryStub) HasUserVote(ctx context.Context, firebaseUID string) (bool, error) {
	r.hasUserVoteLastUID = firebaseUID
	if r.hasUserVoteFn != nil {
		return r.hasUserVoteFn(ctx, firebaseUID)
	}
	return false, nil
}

func (r *repositoryStub) InsertUserVote(ctx context.Context, firebaseUID string, contestantID string, votedAt time.Time) (bool, error) {
	if r.insertUserVoteFn != nil {
		return r.insertUserVoteFn(ctx, firebaseUID, contestantID, votedAt)
	}
	return true, nil
}

func (r *repositoryStub) IncrementContestantVotes(ctx context.Context, contestantID string, delta int64) error {
	if r.incrementContestantFn != nil {
		return r.incrementContestantFn(ctx, contestantID, delta)
	}
	return nil
}

func (r *repositoryStub) ApplyVoteBatch(ctx context.Context, votes []vote.PersistVote) (vote.BatchPersistResult, error) {
	r.applyVoteBatchCallCount++
	r.applyVoteBatchLastVotes = votes
	if r.applyVoteBatchFn != nil {
		return r.applyVoteBatchFn(ctx, votes)
	}
	return vote.BatchPersistResult{
		InsertedByContestant:  map[string]int64{},
		DuplicateByContestant: map[string]int64{},
	}, nil
}

func (r *repositoryStub) GetContestantVotes(ctx context.Context, contestantID string) (int64, error) {
	if r.getContestantVotesFn != nil {
		return r.getContestantVotesFn(ctx, contestantID)
	}
	return 0, nil
}

func (r *repositoryStub) GetAllContestantVoteCounts(ctx context.Context) ([]vote.ContestantVoteCount, error) {
	if r.getAllVoteCountsFn != nil {
		return r.getAllVoteCountsFn(ctx)
	}
	return nil, nil
}

func TestCastVote_HappyPathPublishesAndLocks(t *testing.T) {
	repo := &repositoryStub{}
	mr, redisClient := newTestRedis(t)
	defer mr.Close()
	defer redisClient.Close()

	natsServer, natsConn := newTestNATS(t)
	defer natsConn.Close()
	defer natsServer.Shutdown()

	svc := NewService(repo, redisClient, natsConn, time.Second)

	sub, err := natsConn.SubscribeSync(voteSubject)
	require.NoError(t, err)
	require.NoError(t, natsConn.Flush())

	contestantID := "11111111-1111-1111-1111-111111111111"
	err = svc.CastVote(context.Background(), " user-1 ", contestantID)
	require.NoError(t, err)

	storedID, err := redisClient.Get(context.Background(), voteUserKey("user-1")).Result()
	require.NoError(t, err)
	assert.Equal(t, contestantID, storedID)

	msg, err := sub.NextMsg(time.Second)
	require.NoError(t, err)
	var event castVoteEvent
	require.NoError(t, json.Unmarshal(msg.Data, &event))
	assert.Equal(t, "user-1", event.FirebaseUID)
	assert.Equal(t, contestantID, event.ContestantID)
}

func TestCastVote_AlreadyVoted(t *testing.T) {
	repo := &repositoryStub{}
	mr, redisClient := newTestRedis(t)
	defer mr.Close()
	defer redisClient.Close()

	natsServer, natsConn := newTestNATS(t)
	defer natsConn.Close()
	defer natsServer.Shutdown()

	svc := NewService(repo, redisClient, natsConn, time.Second)
	contestantID := "11111111-1111-1111-1111-111111111111"

	require.NoError(t, redisClient.Set(context.Background(), voteUserKey("user-1"), contestantID, 0).Err())
	err := svc.CastVote(context.Background(), "user-1", contestantID)
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrAlreadyVoted)
}

func TestCastVote_InvalidInput(t *testing.T) {
	repo := &repositoryStub{}
	mr, redisClient := newTestRedis(t)
	defer mr.Close()
	defer redisClient.Close()

	natsServer, natsConn := newTestNATS(t)
	defer natsConn.Close()
	defer natsServer.Shutdown()

	svc := NewService(repo, redisClient, natsConn, time.Second)

	err := svc.CastVote(context.Background(), "", "11111111-1111-1111-1111-111111111111")
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrInvalidVoteInput)

	err = svc.CastVote(context.Background(), "uid", "bad-id")
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrInvalidVoteInput)
}

func TestCastVote_PublishFailureRollsBackLock(t *testing.T) {
	repo := &repositoryStub{}
	mr, redisClient := newTestRedis(t)
	defer mr.Close()
	defer redisClient.Close()

	natsServer, natsConn := newTestNATS(t)
	svc := NewService(repo, redisClient, natsConn, time.Second)
	natsConn.Close()
	defer natsServer.Shutdown()

	contestantID := "11111111-1111-1111-1111-111111111111"
	err := svc.CastVote(context.Background(), "uid", contestantID)
	require.Error(t, err)

	_, getErr := redisClient.Get(context.Background(), voteUserKey("uid")).Result()
	assert.ErrorIs(t, getErr, redis.Nil)
}

func TestHasUserVoted_Delegates(t *testing.T) {
	repo := &repositoryStub{hasUserVoteFn: func(ctx context.Context, firebaseUID string) (bool, error) {
		return true, nil
	}}
	svc := NewService(repo, nil, nil, time.Second)

	hasVoted, err := svc.HasUserVoted(context.Background(), " uid-1 ")
	require.NoError(t, err)
	assert.True(t, hasVoted)
	assert.Equal(t, "uid-1", repo.hasUserVoteLastUID)
}

func TestGetContestantVoteCount_HitAndMiss(t *testing.T) {
	repo := &repositoryStub{}
	mr, redisClient := newTestRedis(t)
	defer mr.Close()
	defer redisClient.Close()
	svc := NewService(repo, redisClient, nil, time.Second)

	contestantID := "11111111-1111-1111-1111-111111111111"
	require.NoError(t, redisClient.HSet(context.Background(), voteCountHashKey, contestantID, 7).Err())

	votes, err := svc.GetContestantVoteCount(context.Background(), contestantID)
	require.NoError(t, err)
	assert.Equal(t, int64(7), votes)

	votes, err = svc.GetContestantVoteCount(context.Background(), "22222222-2222-2222-2222-222222222222")
	require.NoError(t, err)
	assert.Equal(t, int64(0), votes)
}

func TestGetLeaderboard_NormalizesPageAndRanks(t *testing.T) {
	repo := &repositoryStub{}
	mr, redisClient := newTestRedis(t)
	defer mr.Close()
	defer redisClient.Close()
	svc := NewService(repo, redisClient, nil, time.Second)

	require.NoError(t, redisClient.ZAdd(context.Background(), voteRankingZSetKey,
		redis.Z{Member: "c1", Score: 10},
		redis.Z{Member: "c2", Score: 7},
		redis.Z{Member: "c3", Score: 5},
	).Err())

	rows, err := svc.GetLeaderboard(context.Background(), 0, 1000)
	require.NoError(t, err)
	require.Len(t, rows, 3)
	assert.Equal(t, int64(1), rows[0].Rank)
	assert.Equal(t, "c1", rows[0].ContestantID)
	assert.Equal(t, int64(10), rows[0].Votes)
}

func TestWarmupVoteCounts_ReconcilesRedis(t *testing.T) {
	repo := &repositoryStub{getAllVoteCountsFn: func(ctx context.Context) ([]vote.ContestantVoteCount, error) {
		return []vote.ContestantVoteCount{{ContestantID: "c1", Votes: 4}, {ContestantID: "c2", Votes: 1}}, nil
	}}
	mr, redisClient := newTestRedis(t)
	defer mr.Close()
	defer redisClient.Close()
	svc := NewService(repo, redisClient, nil, time.Second)

	err := svc.WarmupVoteCounts(context.Background())
	require.NoError(t, err)

	count, err := redisClient.HGet(context.Background(), voteCountHashKey, "c1").Int64()
	require.NoError(t, err)
	assert.Equal(t, int64(4), count)
}

func TestProcessVoteEvent_QueuesAndIncrements(t *testing.T) {
	repo := &repositoryStub{}
	mr, redisClient := newTestRedis(t)
	defer mr.Close()
	defer redisClient.Close()
	svc := NewService(repo, redisClient, nil, time.Second)

	event := castVoteEvent{FirebaseUID: "uid-1", ContestantID: "c1", VotedAt: time.Now().UTC()}
	payload, err := json.Marshal(event)
	require.NoError(t, err)

	err = svc.processVoteEvent(context.Background(), payload)
	require.NoError(t, err)

	count, err := redisClient.HGet(context.Background(), voteCountHashKey, "c1").Int64()
	require.NoError(t, err)
	assert.Equal(t, int64(1), count)

	queueLen, err := redisClient.LLen(context.Background(), votePersistQueueKey).Result()
	require.NoError(t, err)
	assert.Equal(t, int64(1), queueLen)
}

func TestFlushQueuedVotes_TransientErrorRequeues(t *testing.T) {
	repo := &repositoryStub{applyVoteBatchFn: func(ctx context.Context, votes []vote.PersistVote) (vote.BatchPersistResult, error) {
		return vote.BatchPersistResult{}, context.DeadlineExceeded
	}}
	mr, redisClient := newTestRedis(t)
	defer mr.Close()
	defer redisClient.Close()
	svc := NewService(repo, redisClient, nil, time.Second)

	event := castVoteEvent{FirebaseUID: "uid-1", ContestantID: "c1", VotedAt: time.Now().UTC()}
	payload, err := json.Marshal(event)
	require.NoError(t, err)
	require.NoError(t, redisClient.RPush(context.Background(), votePersistQueueKey, payload).Err())

	err = svc.flushQueuedVotes(context.Background())
	require.Error(t, err)

	queueLen, qErr := redisClient.LLen(context.Background(), votePersistQueueKey).Result()
	require.NoError(t, qErr)
	assert.Equal(t, int64(1), queueLen)
}

func TestHandleFailedPersistEvent_ToDLQAfterMaxRetries(t *testing.T) {
	repo := &repositoryStub{}
	mr, redisClient := newTestRedis(t)
	defer mr.Close()
	defer redisClient.Close()
	svc := NewService(repo, redisClient, nil, time.Second)

	require.NoError(t, redisClient.HSet(context.Background(), voteCountHashKey, "c1", 2).Err())
	require.NoError(t, redisClient.ZAdd(context.Background(), voteRankingZSetKey, redis.Z{Member: "c1", Score: 2}).Err())
	require.NoError(t, redisClient.Set(context.Background(), voteUserKey("uid-1"), "c1", 0).Err())

	err := svc.handleFailedPersistEvent(context.Background(), castVoteEvent{
		FirebaseUID:  "uid-1",
		ContestantID: "c1",
		VotedAt:      time.Now().UTC(),
		RetryCount:   voteMaxRetries,
	}, errors.New("fk violation"))
	require.NoError(t, err)

	dlqLen, dlqErr := redisClient.LLen(context.Background(), votePersistDLQKey).Result()
	require.NoError(t, dlqErr)
	assert.Equal(t, int64(1), dlqLen)

	count, err := redisClient.HGet(context.Background(), voteCountHashKey, "c1").Int64()
	require.NoError(t, err)
	assert.Equal(t, int64(1), count)

	_, getErr := redisClient.Get(context.Background(), voteUserKey("uid-1")).Result()
	assert.ErrorIs(t, getErr, redis.Nil)
}

func TestIsTransientPersistError(t *testing.T) {
	assert.True(t, isTransientPersistError(context.DeadlineExceeded))
	assert.False(t, isTransientPersistError(errors.New("permanent")))
}

func newTestRedis(t *testing.T) (*miniredis.Miniredis, *redis.Client) {
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

func newTestNATS(t *testing.T) (*nserver.Server, *nats.Conn) {
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
