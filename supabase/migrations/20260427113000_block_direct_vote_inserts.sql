DROP POLICY IF EXISTS "Users can insert own vote" ON public.votes;

REVOKE INSERT ON TABLE public.votes FROM authenticated;
REVOKE INSERT ON TABLE public.votes FROM anon;
