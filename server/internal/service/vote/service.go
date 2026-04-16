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
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/nats-io/nats.go"
	"github.com/redis/go-redis/v9"
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

type deadLetterVoteEvent struct {
	Event    castVoteEvent `json:"event"`
	Error    string        `json:"error"`
	Raw      string        `json:"raw,omitempty"`
	FailedAt time.Time     `json:"failedAt"`
}

type queuedPersistVote struct {
	raw   string
	event castVoteEvent
	vote  voterepo.PersistVote
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

	queueItems := make([]queuedPersistVote, 0, len(events))
	persistVotes := make([]voterepo.PersistVote, 0, len(events))

	for _, raw := range events {
		var event castVoteEvent
		if err := json.Unmarshal([]byte(raw), &event); err != nil {
			if dlqErr := s.pushRawToDLQ(ctx, raw, fmt.Errorf("invalid queued vote payload: %w", err)); dlqErr != nil {
				log.Printf("vote malformed payload DLQ push failed: %v", dlqErr)
			}
			continue
		}

		vote := voterepo.PersistVote{
			FirebaseUID:  event.FirebaseUID,
			ContestantID: event.ContestantID,
			VotedAt:      event.VotedAt,
		}

		queueItems = append(queueItems, queuedPersistVote{
			raw:   raw,
			event: event,
			vote:  vote,
		})
		persistVotes = append(persistVotes, vote)
	}

	if len(queueItems) == 0 {
		return nil
	}

	batchResult, err := s.repo.ApplyVoteBatch(ctx, persistVotes)
	if err != nil {
		if isTransientPersistError(err) {
			if requeueErr := s.requeueBatchRaw(ctx, queueItems); requeueErr != nil {
				log.Printf("vote batch requeue failed for %d events: %v", len(queueItems), requeueErr)
			}
			return err
		}

		if isolateErr := s.persistBatchWithIsolation(ctx, queueItems); isolateErr != nil {
			return isolateErr
		}

		return nil
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

func (s *Service) persistBatchWithIsolation(ctx context.Context, queueItems []queuedPersistVote) error {
	for i := range queueItems {
		item := queueItems[i]

		batchResult, err := s.repo.ApplyVoteBatch(ctx, []voterepo.PersistVote{item.vote})
		if err != nil {
			if isTransientPersistError(err) {
				if requeueErr := s.requeueBatchRaw(ctx, queueItems[i:]); requeueErr != nil {
					log.Printf("vote isolate requeue failed for %d events: %v", len(queueItems[i:]), requeueErr)
				}
				return err
			}

			if handleErr := s.handleFailedPersistEvent(ctx, item.event, err); handleErr != nil {
				log.Printf("vote failed-event handling error for user %s contestant %s: %v", item.event.FirebaseUID, item.event.ContestantID, handleErr)
			}
			continue
		}

		duplicateCount := batchResult.DuplicateByContestant[item.event.ContestantID]
		if duplicateCount <= 0 {
			continue
		}

		if decrErr := s.redisClient.DecrBy(ctx, voteCountKey(item.event.ContestantID), duplicateCount).Err(); decrErr != nil {
			log.Printf("vote cache duplicate correction failed for contestant %s: %v", item.event.ContestantID, decrErr)
		}
	}

	return nil
}

func (s *Service) handleFailedPersistEvent(ctx context.Context, event castVoteEvent, persistErr error) error {
	event.RetryCount++

	if event.RetryCount > voteMaxRetries {
		if err := s.pushToDLQ(ctx, event, persistErr); err != nil {
			return err
		}

		if err := s.redisClient.Decr(ctx, voteCountKey(event.ContestantID)).Err(); err != nil {
			log.Printf("vote cache rollback failed for contestant %s: %v", event.ContestantID, err)
		}

		if err := s.redisClient.Del(ctx, voteUserKey(event.FirebaseUID)).Err(); err != nil {
			log.Printf("vote user lock rollback failed for user %s: %v", event.FirebaseUID, err)
		}

		return nil
	}

	retryPayload, err := json.Marshal(event)
	if err != nil {
		return s.pushToDLQ(ctx, event, fmt.Errorf("marshal retry payload: %w", err))
	}

	return s.redisClient.RPush(ctx, votePersistQueueKey, retryPayload).Err()
}

func (s *Service) pushToDLQ(ctx context.Context, event castVoteEvent, persistErr error) error {
	dlqPayload, err := json.Marshal(deadLetterVoteEvent{
		Event:    event,
		Error:    persistErr.Error(),
		FailedAt: time.Now().UTC(),
	})
	if err != nil {
		return err
	}

	return s.redisClient.RPush(ctx, votePersistDLQKey, dlqPayload).Err()
}

func (s *Service) pushRawToDLQ(ctx context.Context, raw string, persistErr error) error {
	dlqPayload, err := json.Marshal(deadLetterVoteEvent{
		Error:    persistErr.Error(),
		Raw:      raw,
		FailedAt: time.Now().UTC(),
	})
	if err != nil {
		return err
	}

	return s.redisClient.RPush(ctx, votePersistDLQKey, dlqPayload).Err()
}

func (s *Service) requeueBatchRaw(ctx context.Context, queueItems []queuedPersistVote) error {
	if len(queueItems) == 0 {
		return nil
	}

	requeuePayload := make([]interface{}, 0, len(queueItems))
	for _, item := range queueItems {
		requeuePayload = append(requeuePayload, item.raw)
	}

	return s.redisClient.RPush(ctx, votePersistQueueKey, requeuePayload...).Err()
}

func isTransientPersistError(err error) bool {
	if errors.Is(err, context.Canceled) || errors.Is(err, context.DeadlineExceeded) {
		return true
	}

	var pgErr *pgconn.PgError
	if !errors.As(err, &pgErr) {
		return false
	}

	if len(pgErr.Code) < 2 {
		return false
	}

	codeClass := pgErr.Code[:2]
	if codeClass == "08" || codeClass == "53" || codeClass == "57" {
		return true
	}

	return pgErr.Code == "40001" || pgErr.Code == "40P01"
}

func voteUserKey(firebaseUID string) string {
	return voteUserKeyPrefix + firebaseUID
}

func voteCountKey(contestantID string) string {
	return voteCountKeyPrefix + contestantID
}
