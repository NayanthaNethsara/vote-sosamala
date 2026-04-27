-- 1. Drop the voting_settings table
DROP TABLE IF EXISTS public.voting_settings CASCADE;

-- 2. Revert public.cast_vote to its previous state (Atomic RPC)
CREATE OR REPLACE FUNCTION public.cast_vote(
  p_user_id uuid,
  p_contestant_id uuid,
  p_category public.contestant_category
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.contestants c
    WHERE c.id = p_contestant_id
      AND c.active = true
      AND c.category = p_category
  ) THEN
    RETURN 'invalid_contestant';
  END IF;

  BEGIN
    INSERT INTO public.votes (user_id, contestant_id, category)
    VALUES (p_user_id, p_contestant_id, p_category);
  EXCEPTION
    WHEN unique_violation THEN
      RETURN 'already_voted';
    WHEN foreign_key_violation THEN
      RETURN 'invalid_user';
  END;

  RETURN 'success';
END;
$$;

REVOKE ALL ON FUNCTION public.cast_vote(uuid, uuid, public.contestant_category) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cast_vote(uuid, uuid, public.contestant_category) FROM anon;
REVOKE ALL ON FUNCTION public.cast_vote(uuid, uuid, public.contestant_category) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.cast_vote(uuid, uuid, public.contestant_category) TO service_role;

-- 3. Revert public.recalculate_vote_counts to its previous state
CREATE OR REPLACE FUNCTION public.recalculate_vote_counts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public
AS $$
BEGIN
  IF NOT private.is_admin() THEN
    RAISE EXCEPTION 'Only admins can recalculate vote counts';
  END IF;

  UPDATE public.contestants AS contestant
  SET vote_count = COALESCE(vote_totals.total, 0)
  FROM (
    SELECT contestant_id, COUNT(*)::integer AS total
    FROM public.votes
    GROUP BY contestant_id
  ) AS vote_totals
  WHERE contestant.id = vote_totals.contestant_id
    AND contestant.vote_count IS DISTINCT FROM vote_totals.total;

  UPDATE public.contestants
  SET vote_count = 0
  WHERE vote_count <> 0
    AND id NOT IN (SELECT contestant_id FROM public.votes);
END;
$$;

REVOKE ALL ON FUNCTION public.recalculate_vote_counts() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.recalculate_vote_counts() FROM anon;
GRANT EXECUTE ON FUNCTION public.recalculate_vote_counts() TO authenticated;

-- 4. Clean up the internal implementation functions from the private schema
DROP FUNCTION IF EXISTS private.cast_vote_impl(uuid, uuid, public.contestant_category);
DROP FUNCTION IF EXISTS private.recalculate_vote_counts_impl();
