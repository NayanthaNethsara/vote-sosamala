package vote

import (
	"context"
	"errors"
	"time"
)

var ErrAlreadyVoted = errors.New("user already voted")

type PersistVote struct {
	FirebaseUID  string
	ContestantID string
	VotedAt      time.Time
}

type ContestantVoteCount struct {
	ContestantID string
	Votes        int64
}

type BatchPersistResult struct {
	InsertedByContestant  map[string]int64
	DuplicateByContestant map[string]int64
}

type Repository interface {
	HasUserVote(ctx context.Context, firebaseUID string) (bool, error)
	InsertUserVote(ctx context.Context, firebaseUID string, contestantID string, votedAt time.Time) (bool, error)
	IncrementContestantVotes(ctx context.Context, contestantID string, delta int64) error
	ApplyVoteBatch(ctx context.Context, votes []PersistVote) (BatchPersistResult, error)
	GetContestantVotes(ctx context.Context, contestantID string) (int64, error)
	GetAllContestantVoteCounts(ctx context.Context) ([]ContestantVoteCount, error)
}
