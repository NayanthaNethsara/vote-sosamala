-- Table: contestants
CREATE TABLE IF NOT EXISTS public.contestants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  bio text,
  category text NOT NULL,
  faculty text,
  image_url text,
  active boolean DEFAULT true,
  vote_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT timezone('utc', now()),
  rank integer
);

-- Table: votes
CREATE TABLE IF NOT EXISTS public.votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contestant_id uuid NOT NULL REFERENCES public.contestants(id) ON DELETE CASCADE,
  voter_hash text NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT timezone('utc', now()),
  UNIQUE (voter_hash, category) -- one vote per voter per category
);

-- Function: update_all_ranks (competition ranking: ties get same rank, next is skipped)
CREATE OR REPLACE FUNCTION public.update_all_ranks()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  WITH ranked AS (
    SELECT
      id,
      category,
      RANK() OVER (
        PARTITION BY category
        ORDER BY vote_count DESC
      ) AS rnk
    FROM public.contestants
  )
  UPDATE public.contestants c
  SET rank = ranked.rnk
  FROM ranked
  WHERE c.id = ranked.id AND c.category = ranked.category;
END;
$$;

-- Function: increment vote count & update ranks
CREATE OR REPLACE FUNCTION public.increment_vote_count_and_update_ranks()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.contestants
  SET vote_count = vote_count + 1
  WHERE id = NEW.contestant_id;

  PERFORM public.update_all_ranks();

  RETURN NEW;
END;
$$;

-- Trigger to increment vote count and update ranks on new vote
CREATE TRIGGER trg_increment_vote_count
AFTER INSERT ON public.votes
FOR EACH ROW
EXECUTE FUNCTION public.increment_vote_count_and_update_ranks();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_contestants_category ON public.contestants(category);
CREATE INDEX IF NOT EXISTS idx_votes_voter_hash ON public.votes(voter_hash);
CREATE INDEX IF NOT EXISTS idx_votes_category ON public.votes(category);

-- (Optional) Initialize ranks after seeding contestants:
-- SELECT public.update_all_ranks();


