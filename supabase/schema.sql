-- Create contestants table
CREATE TABLE IF NOT EXISTS contestants (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  bio TEXT,
  category TEXT NOT NULL,
  vote_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id SERIAL PRIMARY KEY,
  user_hash TEXT NOT NULL,
  category TEXT NOT NULL,
  contestant_id INTEGER REFERENCES contestants(id),
  voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_hash, category)
);

-- Enable RLS on contestants table
ALTER TABLE contestants ENABLE ROW LEVEL SECURITY;

-- Allow public read access for active contestants
CREATE POLICY "Allow public read on active contestants"
  ON contestants
  FOR SELECT
  USING (active = TRUE);
