CREATE TABLE IF NOT EXISTS user_votes (
    firebase_uid TEXT PRIMARY KEY,
    contestant_id UUID NOT NULL REFERENCES contestants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_votes_contestant_id ON user_votes (contestant_id);

CREATE TABLE IF NOT EXISTS contestant_vote_totals (
    contestant_id UUID PRIMARY KEY REFERENCES contestants(id) ON DELETE CASCADE,
    total_votes BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);