CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE public.user_role AS ENUM ('guest', 'admin');

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'guest',
  has_voted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.contestants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  student_id text NOT NULL UNIQUE,
  bio text,
  faculty text NOT NULL,
  academic_year text,
  image_url text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  vote_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.votes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  contestant_id uuid NOT NULL REFERENCES public.contestants(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (user_id)
);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_vote_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_contestants_updated_at ON public.contestants;
CREATE TRIGGER trg_contestants_updated_at
BEFORE UPDATE ON public.contestants
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_auth_user_created ON auth.users;
CREATE TRIGGER trg_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_auth_user();

DROP TRIGGER IF EXISTS trg_vote_insert ON public.votes;
CREATE TRIGGER trg_vote_insert
AFTER INSERT ON public.votes
FOR EACH ROW
EXECUTE FUNCTION public.handle_vote_insert();

CREATE INDEX IF NOT EXISTS idx_contestants_active ON public.contestants(active);
CREATE INDEX IF NOT EXISTS idx_contestants_faculty ON public.contestants(faculty);
CREATE INDEX IF NOT EXISTS idx_votes_contestant_id ON public.votes(contestant_id);
CREATE INDEX IF NOT EXISTS idx_votes_created_at ON public.votes(created_at);

-- ROW LEVEL SECURITY --
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contestants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  );
$$;

DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Public can read active contestants" ON public.contestants;
CREATE POLICY "Public can read active contestants"
  ON public.contestants
  FOR SELECT
  USING (active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage contestants" ON public.contestants;
CREATE POLICY "Admins can manage contestants"
  ON public.contestants
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users can insert own vote" ON public.votes;
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

DROP POLICY IF EXISTS "Users can read own votes" ON public.votes;
CREATE POLICY "Users can read own votes"
  ON public.votes
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage votes" ON public.votes;
CREATE POLICY "Admins can manage votes"
  ON public.votes
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
