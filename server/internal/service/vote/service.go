package vote

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/nats-io/nats.go"
	"github.com/redis/go-redis/v9"

	voterepo "github.com/NayanthaNethsara/vote-sosamala/server/internal/repository/vote"
)

const (
	voteSubject         = "votes.cast"
	voteUserKeyPrefix   = "vote:user:"
	voteCountHashKey    = "vote:counts:hash"
	voteRankingZSetKey  = "vote:counts:rank"
	votePersistQueueKey = "vote:persist:queue"
	votePersistDLQKey   = "vote:persist:dlq"
	voteFlushBatchSize  = 200
	voteMaxRetries      = 5
)

var (
	ErrInvalidVoteInput = errors.New("invalid vote input")
	ErrAlreadyVoted     = errors.New("you have already voted")
	ErrVoteUnavailable  = errors.New("vote pipeline is unavailable")
)

type castVoteEvent struct {
	FirebaseUID  string    `json:"firebaseUid"`
	ContestantID string    `json:"contestantId"`
	VotedAt      time.Time `json:"votedAt"`
	RetryCount   int       `json:"retryCount,omitempty"`
}

type Service struct {
	repo          voterepo.Repository
	redisClient   *redis.Client
	natsConn      *nats.Conn
	flushInterval time.Duration
	startOnce     sync.Once
}

type LeaderboardEntry struct {
	Rank         int64  `json:"rank"`
	ContestantID string `json:"contestantId"`
	Votes        int64  `json:"votes"`
}

func NewService(
	repo voterepo.Repository,
	redisClient *redis.Client,
	natsConn *nats.Conn,
	flushInterval time.Duration,
) *Service {
	interval := flushInterval
	if interval <= 0 {
		interval = 10 * time.Second
	}

	return &Service{
		repo:          repo,
		redisClient:   redisClient,
		natsConn:      natsConn,
		flushInterval: interval,
	}
}

func (s *Service) CastVote(ctx context.Context, firebaseUID string, contestantID string) error {
	if s.repo == nil || s.redisClient == nil || s.natsConn == nil {
		return ErrVoteUnavailable
	}

	uid := strings.TrimSpace(firebaseUID)
	if uid == "" {
		return fmt.Errorf("%w: missing user", ErrInvalidVoteInput)
	}

	normalizedContestantID := strings.TrimSpace(contestantID)
	if _, err := uuid.Parse(normalizedContestantID); err != nil {
		return fmt.Errorf("%w: invalid contestant id", ErrInvalidVoteInput)
	}

	userVoteKey := voteUserKey(uid)
	_, err := s.redisClient.SetArgs(ctx, userVoteKey, normalizedContestantID, redis.SetArgs{Mode: "NX"}).Result()
	if errors.Is(err, redis.Nil) {
		return ErrAlreadyVoted
	}
	if err != nil {
		return err
	}

	eventPayload, err := json.Marshal(castVoteEvent{
		FirebaseUID:  uid,
		ContestantID: normalizedContestantID,
		VotedAt:      time.Now().UTC(),
	})
	if err != nil {
		_ = s.redisClient.Del(ctx, userVoteKey).Err()
		return err
	}

	if err := s.natsConn.Publish(voteSubject, eventPayload); err != nil {
		_ = s.redisClient.Del(ctx, userVoteKey).Err()
		return err
	}

	return nil
}

func (s *Service) HasUserVoted(ctx context.Context, firebaseUID string) (bool, error) {
	if s.repo == nil {
		return false, ErrVoteUnavailable
	}

	uid := strings.TrimSpace(firebaseUID)
	if uid == "" {
		return false, fmt.Errorf("%w: missing user", ErrInvalidVoteInput)
	}

	return s.repo.HasUserVote(ctx, uid)
}

func (s *Service) GetContestantVoteCount(ctx context.Context, contestantID string) (int64, error) {
	if s.repo == nil || s.redisClient == nil {
		return 0, ErrVoteUnavailable
	}

	normalizedContestantID := strings.TrimSpace(contestantID)
	if _, err := uuid.Parse(normalizedContestantID); err != nil {
		return 0, fmt.Errorf("%w: invalid contestant id", ErrInvalidVoteInput)
	}

	votes, err := s.redisClient.HGet(ctx, voteCountHashKey, normalizedContestantID).Int64()
	if err == nil {
		return votes, nil
	}
	if errors.Is(err, redis.Nil) {
		return 0, nil
	}

	log.Printf("vote count hash read failed for contestant %s: %v", normalizedContestantID, err)
	return 0, ErrVoteUnavailable
}

func (s *Service) WarmupVoteCounts(ctx context.Context) error {
	if s.repo == nil || s.redisClient == nil {
		return ErrVoteUnavailable
	}

	return s.reconcileVoteCountsFromDB(ctx)
}

func (s *Service) GetLeaderboard(ctx context.Context, page int64, limit int64) ([]LeaderboardEntry, error) {
	if s.redisClient == nil {
		return nil, ErrVoteUnavailable
	}

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}

	start := (page - 1) * limit
	end := start + limit - 1

	entries, err := s.redisClient.ZRevRangeWithScores(ctx, voteRankingZSetKey, start, end).Result()
	if err != nil {
		return nil, err
	}

	leaderboard := make([]LeaderboardEntry, 0, len(entries))
	for idx, entry := range entries {
		contestantID, ok := entry.Member.(string)
		if !ok {
			continue
		}

		leaderboard = append(leaderboard, LeaderboardEntry{
			Rank:         start + int64(idx) + 1,
			ContestantID: contestantID,
			Votes:        int64(entry.Score),
		})
	}

	return leaderboard, nil
}

func (s *Service) reconcileVoteCountsFromDB(ctx context.Context) error {
	counts, err := s.repo.GetAllContestantVoteCounts(ctx)
	if err != nil {
		return err
	}

	pipe := s.redisClient.TxPipeline()
	pipe.Del(ctx, voteCountHashKey)
	pipe.Del(ctx, voteRankingZSetKey)

	for _, count := range counts {
		pipe.HSet(ctx, voteCountHashKey, count.ContestantID, count.Votes)
		pipe.ZAdd(ctx, voteRankingZSetKey, redis.Z{
			Score:  float64(count.Votes),
			Member: count.ContestantID,
		})
	}

	if _, execErr := pipe.Exec(ctx); execErr != nil {
		return execErr
	}

	return nil
}

func voteUserKey(firebaseUID string) string {
	return voteUserKeyPrefix + firebaseUID
}

func voteCountHashField(contestantID string) string {
	return contestantID
}
