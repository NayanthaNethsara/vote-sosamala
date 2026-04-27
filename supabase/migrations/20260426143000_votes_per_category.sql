ALTER TABLE public.votes
  ADD COLUMN IF NOT EXISTS category public.contestant_category;

UPDATE public.votes v
SET category = c.category
FROM public.contestants c
WHERE v.contestant_id = c.id
  AND v.category IS NULL;

ALTER TABLE public.votes
  ALTER COLUMN category SET NOT NULL;

ALTER TABLE public.votes
  DROP CONSTRAINT IF EXISTS votes_user_id_key;

ALTER TABLE public.votes
  ADD CONSTRAINT votes_user_id_category_key UNIQUE (user_id, category);

DROP POLICY IF EXISTS "Users can insert own vote" ON public.votes;
CREATE POLICY "Users can insert own vote"
  ON public.votes
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.contestants c
      WHERE c.id = contestant_id
        AND c.active = true
        AND c.category = category
    )
  );