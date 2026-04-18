package vote

import (
	"context"
	"errors"
	"regexp"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/pashagolub/pgxmock/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestSQLRepositoryHasUserVote_ReturnsTrue(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := NewSQLRepositoryWithDB(mock)

	rows := pgxmock.NewRows([]string{"exists"}).AddRow(true)
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT EXISTS(SELECT 1 FROM user_votes WHERE firebase_uid = $1)`)).
		WithArgs("uid-1").
		WillReturnRows(rows)

	hasVoted, err := repo.HasUserVote(context.Background(), "uid-1")
	require.NoError(t, err)
	assert.True(t, hasVoted)
	require.NoError(t, mock.ExpectationsWereMet())
}

func TestSQLRepositoryInsertUserVote_SuccessAndDuplicate(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := NewSQLRepositoryWithDB(mock)
	contestantID := uuid.NewString()
	now := time.Now().UTC()

	mock.ExpectExec(regexp.QuoteMeta(`INSERT INTO user_votes (firebase_uid, contestant_id, created_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (firebase_uid) DO NOTHING`)).
		WithArgs("uid-1", pgxmock.AnyArg(), now).
		WillReturnResult(pgxmock.NewResult("INSERT", 1))

	created, err := repo.InsertUserVote(context.Background(), "uid-1", contestantID, now)
	require.NoError(t, err)
	assert.True(t, created)

	mock.ExpectExec(regexp.QuoteMeta(`INSERT INTO user_votes (firebase_uid, contestant_id, created_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (firebase_uid) DO NOTHING`)).
		WithArgs("uid-1", pgxmock.AnyArg(), now).
		WillReturnResult(pgxmock.NewResult("INSERT", 0))

	created, err = repo.InsertUserVote(context.Background(), "uid-1", contestantID, now)
	require.NoError(t, err)
	assert.False(t, created)
	require.NoError(t, mock.ExpectationsWereMet())
}

func TestSQLRepositoryInsertUserVote_InvalidContestantID(t *testing.T) {
	repo := NewSQLRepositoryWithDB(nil)

	created, err := repo.InsertUserVote(context.Background(), "uid-1", "bad-id", time.Now().UTC())
	require.Error(t, err)
	assert.False(t, created)
	assert.Contains(t, err.Error(), "invalid contestant id")
}

func TestSQLRepositoryApplyVoteBatch_SeededContestantsAndDuplicates(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := NewSQLRepositoryWithDB(mock)
	now := time.Now().UTC()

	seededContestantA := uuid.NewString()
	seededContestantB := uuid.NewString()

	votes := []PersistVote{
		{FirebaseUID: "uid-1", ContestantID: seededContestantA, VotedAt: now},
		{FirebaseUID: "uid-2", ContestantID: seededContestantA, VotedAt: now},
		{FirebaseUID: "uid-1", ContestantID: seededContestantA, VotedAt: now},
		{FirebaseUID: "uid-3", ContestantID: seededContestantB, VotedAt: now},
	}

	mock.ExpectBegin()

	insertVoteSQL := regexp.QuoteMeta(`INSERT INTO user_votes (firebase_uid, contestant_id, created_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (firebase_uid) DO NOTHING`)

	mock.ExpectExec(insertVoteSQL).WithArgs("uid-1", pgxmock.AnyArg(), now).WillReturnResult(pgxmock.NewResult("INSERT", 1))
	mock.ExpectExec(insertVoteSQL).WithArgs("uid-2", pgxmock.AnyArg(), now).WillReturnResult(pgxmock.NewResult("INSERT", 1))
	mock.ExpectExec(insertVoteSQL).WithArgs("uid-1", pgxmock.AnyArg(), now).WillReturnResult(pgxmock.NewResult("INSERT", 0))
	mock.ExpectExec(insertVoteSQL).WithArgs("uid-3", pgxmock.AnyArg(), now).WillReturnResult(pgxmock.NewResult("INSERT", 1))

	incrementSQL := regexp.QuoteMeta(`INSERT INTO contestant_vote_totals (contestant_id, total_votes, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (contestant_id)
         DO UPDATE SET
           total_votes = contestant_vote_totals.total_votes + EXCLUDED.total_votes,
           updated_at = NOW()`)

	mock.ExpectExec(incrementSQL).WithArgs(pgxmock.AnyArg(), int64(2)).WillReturnResult(pgxmock.NewResult("INSERT", 1))
	mock.ExpectExec(incrementSQL).WithArgs(pgxmock.AnyArg(), int64(1)).WillReturnResult(pgxmock.NewResult("INSERT", 1))
	mock.ExpectCommit()

	result, err := repo.ApplyVoteBatch(context.Background(), votes)
	require.NoError(t, err)
	assert.Equal(t, int64(2), result.InsertedByContestant[seededContestantA])
	assert.Equal(t, int64(1), result.InsertedByContestant[seededContestantB])
	assert.Equal(t, int64(1), result.DuplicateByContestant[seededContestantA])

	require.NoError(t, mock.ExpectationsWereMet())
}

func TestSQLRepositoryApplyVoteBatch_BeginTxError(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := NewSQLRepositoryWithDB(mock)
	mock.ExpectBegin().WillReturnError(errors.New("begin tx failed"))

	_, err = repo.ApplyVoteBatch(context.Background(), []PersistVote{{FirebaseUID: "uid-1", ContestantID: uuid.NewString(), VotedAt: time.Now().UTC()}})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "begin tx failed")
	require.NoError(t, mock.ExpectationsWereMet())
}

func TestSQLRepositoryGetContestantVotes_NoRowsReturnsZero(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := NewSQLRepositoryWithDB(mock)
	contestantID := uuid.NewString()

	mock.ExpectQuery(regexp.QuoteMeta(`SELECT COALESCE(total_votes, 0)
         FROM contestant_vote_totals
         WHERE contestant_id = $1`)).
		WithArgs(pgxmock.AnyArg()).
		WillReturnError(pgx.ErrNoRows)

	votes, err := repo.GetContestantVotes(context.Background(), contestantID)
	require.NoError(t, err)
	assert.Equal(t, int64(0), votes)
	require.NoError(t, mock.ExpectationsWereMet())
}

func TestSQLRepositoryGetAllContestantVoteCounts_ReturnsRows(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := NewSQLRepositoryWithDB(mock)

	seededContestantA := uuid.NewString()
	seededContestantB := uuid.NewString()

	rows := pgxmock.NewRows([]string{"contestant_id", "count"}).
		AddRow(seededContestantA, int64(3)).
		AddRow(seededContestantB, int64(1))

	mock.ExpectQuery(regexp.QuoteMeta(`SELECT contestant_id::text, COUNT(*)::bigint
         FROM user_votes
         GROUP BY contestant_id`)).
		WillReturnRows(rows)

	counts, err := repo.GetAllContestantVoteCounts(context.Background())
	require.NoError(t, err)
	require.Len(t, counts, 2)
	assert.Equal(t, seededContestantA, counts[0].ContestantID)
	assert.Equal(t, int64(3), counts[0].Votes)
	assert.Equal(t, seededContestantB, counts[1].ContestantID)
	assert.Equal(t, int64(1), counts[1].Votes)

	require.NoError(t, mock.ExpectationsWereMet())
}
