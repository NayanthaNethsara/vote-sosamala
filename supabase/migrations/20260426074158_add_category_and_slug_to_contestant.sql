CREATE TYPE public.contestant_category AS ENUM ('male', 'female');

ALTER TABLE public.contestants
ADD COLUMN category public.contestant_category NOT NULL DEFAULT 'male',
ADD COLUMN slug text NOT NULL DEFAULT gen_random_uuid()::text;

ALTER TABLE public.contestants
ADD CONSTRAINT contestants_slug_category_key UNIQUE (category, slug);
