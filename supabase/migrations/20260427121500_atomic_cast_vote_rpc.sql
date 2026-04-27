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
