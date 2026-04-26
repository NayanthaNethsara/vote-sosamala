CREATE SCHEMA IF NOT EXISTS private;

ALTER TABLE public.contestants
  DROP CONSTRAINT IF EXISTS contestants_slug_category_key;

ALTER TABLE public.contestants
  ADD CONSTRAINT contestants_slug_key UNIQUE (slug);

ALTER TABLE public.contestants
  ALTER COLUMN slug DROP DEFAULT;

DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Public can read active contestants" ON public.contestants;
DROP POLICY IF EXISTS "Admins can manage contestants" ON public.contestants;
DROP POLICY IF EXISTS "Users can insert own vote" ON public.votes;
DROP POLICY IF EXISTS "Users can read own votes" ON public.votes;
DROP POLICY IF EXISTS "Admins can manage votes" ON public.votes;

DROP TRIGGER IF EXISTS trg_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS trg_vote_insert ON public.votes;

DROP FUNCTION IF EXISTS public.handle_new_auth_user();
DROP FUNCTION IF EXISTS public.handle_vote_insert();
DROP FUNCTION IF EXISTS public.is_admin();

CREATE OR REPLACE FUNCTION private.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public, auth
AS $$
BEGIN
  INSERT INTO public.users (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION private.handle_vote_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public
AS $$
BEGIN
  UPDATE public.users
  SET has_voted = true
  WHERE id = NEW.user_id;

  UPDATE public.contestants
  SET vote_count = vote_count + 1
  WHERE id = NEW.contestant_id;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = private, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  );
$$;

CREATE TRIGGER trg_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION private.handle_new_auth_user();

CREATE TRIGGER trg_vote_insert
AFTER INSERT ON public.votes
FOR EACH ROW
EXECUTE FUNCTION private.handle_vote_insert();

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contestants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id OR private.is_admin());

CREATE POLICY "Admins can update users"
  ON public.users
  FOR UPDATE TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Public can read active contestants"
  ON public.contestants
  FOR SELECT
  USING (active = true OR private.is_admin());

CREATE POLICY "Admins can manage contestants"
  ON public.contestants
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY "Users can insert own vote"
  ON public.votes
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.contestants c
      WHERE c.id = contestant_id AND c.active = true
    )
  );

CREATE POLICY "Users can read own votes"
  ON public.votes
  FOR SELECT
  USING (auth.uid() = user_id OR private.is_admin());

CREATE POLICY "Admins can manage votes"
  ON public.votes
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());