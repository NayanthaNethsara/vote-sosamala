package vote

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	voterepo "github.com/NayanthaNethsara/vote-sosamala/server/internal/repository/vote"
	"github.com/google/uuid"
	"github.com/nats-io/nats.go"
	"github.com/redis/go-redis/v9"
)

const (
	voteSubject         = "votes.cast"
	voteUserKeyPrefix   = "vote:user:"
	voteCountKeyPrefix  = "vote:contestant:"
	votePersistQueueKey = "vote:persist:queue"
	voteFlushBatchSize  = 200
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
}

type Service struct {
	repo          voterepo.Repository
	redisClient   *redis.Client
	natsConn      *nats.Conn
	flushInterval time.Duration
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

func (s *Service) StartBackground(ctx context.Context) {
	if s.repo == nil || s.redisClient == nil || s.natsConn == nil {
		return
	}

	_, err := s.natsConn.Subscribe(voteSubject, func(msg *nats.Msg) {
		if err := s.processVoteEvent(context.Background(), msg.Data); err != nil {
			log.Printf("vote event processing failed: %v", err)
		}
	})
	if err != nil {
		log.Printf("failed to subscribe to vote subject: %v", err)
		return
	}

	go func() {
		ticker := time.NewTicker(s.flushInterval)
		defer ticker.Stop()

		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				if err := s.flushQueuedVotes(context.Background()); err != nil {
					log.Printf("vote flush failed: %v", err)
				}
			}
		}
	}()
}

func (s *Service) processVoteEvent(ctx context.Context, payload []byte) error {
	var event castVoteEvent
	if err := json.Unmarshal(payload, &event); err != nil {
		return err
	}

	if event.FirebaseUID == "" || event.ContestantID == "" {
		return fmt.Errorf("invalid vote event payload")
	}

	_, err := s.redisClient.TxPipelined(ctx, func(pipe redis.Pipeliner) error {
		pipe.Incr(ctx, voteCountKey(event.ContestantID))
		pipe.RPush(ctx, votePersistQueueKey, payload)
		return nil
	})

	return err
}

func (s *Service) flushQueuedVotes(ctx context.Context) error {
	events, err := s.redisClient.LPopCount(ctx, votePersistQueueKey, voteFlushBatchSize).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return nil
		}
		return err
	}

	if len(events) == 0 {
		return nil
	}

	persistVotes := make([]voterepo.PersistVote, 0, len(events))
	requeuePayload := make([]interface{}, 0, len(events))

	for _, raw := range events {
		var event castVoteEvent
		if err := json.Unmarshal([]byte(raw), &event); err != nil {
			continue
		}

		persistVotes = append(persistVotes, voterepo.PersistVote{
			FirebaseUID:  event.FirebaseUID,
			ContestantID: event.ContestantID,
			VotedAt:      event.VotedAt,
		})
		requeuePayload = append(requeuePayload, raw)
	}

	if len(persistVotes) == 0 {
		return nil
	}

	batchResult, err := s.repo.ApplyVoteBatch(ctx, persistVotes)
	if err != nil {
		if requeueErr := s.redisClient.RPush(ctx, votePersistQueueKey, requeuePayload...).Err(); requeueErr != nil {
			log.Printf("vote batch requeue failed for %d events: %v", len(requeuePayload), requeueErr)
		}
		return err
	}

	for contestantID, duplicateCount := range batchResult.DuplicateByContestant {
		if duplicateCount <= 0 {
			continue
		}

		if decrErr := s.redisClient.DecrBy(ctx, voteCountKey(contestantID), duplicateCount).Err(); decrErr != nil {
			log.Printf("vote cache correction failed for contestant %s: %v", contestantID, decrErr)
		}
	}

	return nil
}

func voteUserKey(firebaseUID string) string {
	return voteUserKeyPrefix + firebaseUID
}

func voteCountKey(contestantID string) string {
	return voteCountKeyPrefix + contestantID
}
