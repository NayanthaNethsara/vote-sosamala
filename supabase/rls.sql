-- Enable Row Level Security
ALTER TABLE contestants ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Anyone (public) can read contestants (for the public leaderboard)
CREATE POLICY "Allow public read"
  ON contestants
  FOR SELECT
  USING (true);

-- Only the admin can insert/update/delete contestants
CREATE POLICY "Admin write"
  ON contestants
  FOR ALL TO authenticated
  USING (auth.email() = 'your-admin@email.com')
  WITH CHECK (auth.email() = 'your-admin@email.com');

-- Any logged-in user can insert a vote
CREATE POLICY "Allow vote insert"
  ON votes
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- (Optional) Anyone can read votes (useful for admin/analytics, but not for privacy)
CREATE POLICY "Allow public read votes"
  ON votes
  FOR SELECT
  USING (true);

-- (Optional) Only admin can read all votes
-- CREATE POLICY "Admin read votes"
--   ON votes
--   FOR SELECT TO authenticated
--   USING (auth.email() = 'your-admin@email.com');
