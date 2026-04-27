DROP POLICY IF EXISTS "Admins can manage votes" ON public.votes;

CREATE POLICY "Admins can read all votes"
  ON public.votes
  FOR SELECT TO authenticated
  USING (private.is_admin());

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
GRANT EXECUTE ON FUNCTION public.recalculate_vote_counts() TO authenticated;
