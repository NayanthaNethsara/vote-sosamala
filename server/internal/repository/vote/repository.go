package vote

import (
	"context"
	"errors"
	"time"
)

var ErrAlreadyVoted = errors.New("user already voted")

type Repository interface {
	HasUserVote(ctx context.Context, firebaseUID string) (bool, error)
	InsertUserVote(ctx context.Context, firebaseUID string, contestantID string, votedAt time.Time) (bool, error)
	IncrementContestantVotes(ctx context.Context, contestantID string, delta int64) error
}
