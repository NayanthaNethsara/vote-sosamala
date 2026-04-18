package vote

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SQLRepository struct {
	db *pgxpool.Pool
}

func NewSQLRepository(db *pgxpool.Pool) *SQLRepository {
	return &SQLRepository{db: db}
}

func (r *SQLRepository) HasUserVote(ctx context.Context, firebaseUID string) (bool, error) {
	var exists bool
	err := r.db.QueryRow(
		ctx,
		`SELECT EXISTS(SELECT 1 FROM user_votes WHERE firebase_uid = $1)`,
		firebaseUID,
	).Scan(&exists)
	if err != nil {
		return false, err
	}

	return exists, nil
}

func (r *SQLRepository) InsertUserVote(
	ctx context.Context,
	firebaseUID string,
	contestantID string,
	votedAt time.Time,
) (bool, error) {
	parsedContestantID, err := uuid.Parse(contestantID)
	if err != nil {
		return false, fmt.Errorf("invalid contestant id: %w", err)
	}

	result, err := r.db.Exec(
		ctx,
		`INSERT INTO user_votes (firebase_uid, contestant_id, created_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (firebase_uid) DO NOTHING`,
		firebaseUID,
		parsedContestantID,
		votedAt,
	)
	if err != nil {
		return false, err
	}

	return result.RowsAffected() > 0, nil
}

func (r *SQLRepository) IncrementContestantVotes(
	ctx context.Context,
	contestantID string,
	delta int64,
) error {
	if delta == 0 {
		return nil
	}

	parsedContestantID, err := uuid.Parse(contestantID)
	if err != nil {
		return fmt.Errorf("invalid contestant id: %w", err)
	}

	_, err = r.db.Exec(
		ctx,
		`INSERT INTO contestant_vote_totals (contestant_id, total_votes, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (contestant_id)
         DO UPDATE SET
           total_votes = contestant_vote_totals.total_votes + EXCLUDED.total_votes,
           updated_at = NOW()`,
		parsedContestantID,
		delta,
	)

	return err
}

func (r *SQLRepository) ApplyVoteBatch(ctx context.Context, votes []PersistVote) (BatchPersistResult, error) {
	result := BatchPersistResult{
		InsertedByContestant:  make(map[string]int64),
		DuplicateByContestant: make(map[string]int64),
	}

	if len(votes) == 0 {
		return result, nil
	}

	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return result, err
	}
	defer func() {
		_ = tx.Rollback(ctx)
	}()

	for _, vote := range votes {
		parsedContestantID, parseErr := uuid.Parse(vote.ContestantID)
		if parseErr != nil {
			return result, fmt.Errorf("invalid contestant id: %w", parseErr)
		}

		execResult, execErr := tx.Exec(
			ctx,
			`INSERT INTO user_votes (firebase_uid, contestant_id, created_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (firebase_uid) DO NOTHING`,
			vote.FirebaseUID,
			parsedContestantID,
			vote.VotedAt,
		)
		if execErr != nil {
			return result, execErr
		}

		if execResult.RowsAffected() > 0 {
			result.InsertedByContestant[vote.ContestantID]++
			continue
		}

		result.DuplicateByContestant[vote.ContestantID]++
	}

	for contestantID, delta := range result.InsertedByContestant {
		if delta == 0 {
			continue
		}

		parsedContestantID, parseErr := uuid.Parse(contestantID)
		if parseErr != nil {
			return result, fmt.Errorf("invalid contestant id: %w", parseErr)
		}

		_, execErr := tx.Exec(
			ctx,
			`INSERT INTO contestant_vote_totals (contestant_id, total_votes, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (contestant_id)
         DO UPDATE SET
           total_votes = contestant_vote_totals.total_votes + EXCLUDED.total_votes,
           updated_at = NOW()`,
			parsedContestantID,
			delta,
		)
		if execErr != nil {
			return result, execErr
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return result, err
	}

	return result, nil
}

func (r *SQLRepository) GetContestantVotes(ctx context.Context, contestantID string) (int64, error) {
	parsedContestantID, err := uuid.Parse(contestantID)
	if err != nil {
		return 0, fmt.Errorf("invalid contestant id: %w", err)
	}

	var totalVotes int64
	err = r.db.QueryRow(
		ctx,
		`SELECT COALESCE(total_votes, 0)
         FROM contestant_vote_totals
         WHERE contestant_id = $1`,
		parsedContestantID,
	).Scan(&totalVotes)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return 0, nil
		}
		return 0, err
	}

	return totalVotes, nil
}

func (r *SQLRepository) GetAllContestantVoteCounts(ctx context.Context) ([]ContestantVoteCount, error) {
	rows, err := r.db.Query(
		ctx,
		`SELECT contestant_id::text, COUNT(*)::bigint
         FROM user_votes
         GROUP BY contestant_id`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	counts := make([]ContestantVoteCount, 0)
	for rows.Next() {
		var count ContestantVoteCount
		if scanErr := rows.Scan(&count.ContestantID, &count.Votes); scanErr != nil {
			return nil, scanErr
		}

		counts = append(counts, count)
	}

	if rowsErr := rows.Err(); rowsErr != nil {
		return nil, rowsErr
	}

	return counts, nil
}
