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
	voteCountKeyPrefix  = "vote:contestant:"
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

func (s *Service) GetContestantVoteCount(ctx context.Context, contestantID string) (int64, error) {
	if s.repo == nil {
		return 0, ErrVoteUnavailable
	}

	normalizedContestantID := strings.TrimSpace(contestantID)
	if _, err := uuid.Parse(normalizedContestantID); err != nil {
		return 0, fmt.Errorf("%w: invalid contestant id", ErrInvalidVoteInput)
	}

	if s.redisClient != nil {
		cachedVotes, err := s.redisClient.Get(ctx, voteCountKey(normalizedContestantID)).Int64()
		if err == nil {
			return cachedVotes, nil
		}

		if !errors.Is(err, redis.Nil) {
			log.Printf("vote count redis read failed for contestant %s: %v", normalizedContestantID, err)
		} else {
			seededVotes, seedErr := s.seedVoteCountCacheFromDB(ctx, normalizedContestantID)
			if seedErr == nil {
				return seededVotes, nil
			}
			log.Printf("vote count cache seed failed for contestant %s: %v", normalizedContestantID, seedErr)
		}
	}

	return s.repo.GetContestantVotes(ctx, normalizedContestantID)
}

func (s *Service) seedVoteCountCacheFromDB(ctx context.Context, contestantID string) (int64, error) {
	persistedVotes, err := s.repo.GetContestantVotes(ctx, contestantID)
	if err != nil {
		return 0, err
	}

	if s.redisClient == nil {
		return persistedVotes, nil
	}

	if _, err := s.redisClient.SetNX(ctx, voteCountKey(contestantID), persistedVotes, 0).Result(); err != nil {
		return 0, err
	}

	latestVotes, err := s.redisClient.Get(ctx, voteCountKey(contestantID)).Int64()
	if err == nil {
		return latestVotes, nil
	}

	if errors.Is(err, redis.Nil) {
		return persistedVotes, nil
	}

	return 0, err
}

func voteUserKey(firebaseUID string) string {
	return voteUserKeyPrefix + firebaseUID
}

func voteCountKey(contestantID string) string {
	return voteCountKeyPrefix + contestantID
}
