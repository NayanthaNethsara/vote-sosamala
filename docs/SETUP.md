# Setup & Deployment Guide

Complete guide to set up and deploy Sosamala for your event.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Supabase Configuration](#supabase-configuration)
4. [Environment Variables](#environment-variables)
5. [Production Deployment](#production-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

- **Node.js** 18.17+ ([Download](https://nodejs.org/))
- **pnpm** 10+ — Install with `npm install -g pnpm`
- **Git** for version control
- **Supabase CLI** (optional, but recommended) — `npm install -g supabase`

### Required Accounts

1. **Supabase** — [Create free project](https://supabase.com/)
2. **Google Cloud Console** — [Create OAuth app](https://console.cloud.google.com/)
3. **Vercel** (or similar) — For hosting
4. **Arcjet** (optional) — [Free tier for security](https://arcjet.com/)

---

## Local Development

### 1. Clone Repository

```bash
git clone https://github.com/NayanthaNethsara/vote-sosamala-v2.git
cd vote-sosamala-v2
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Create Environment File

Copy the example and fill in your credentials:

```bash
cp .env.example .env.local
```

See [Environment Variables](#environment-variables) section for details.

### 4. Set Up Supabase Locally (Optional)

For local Supabase stack:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Start local Supabase
supabase start
```

This creates a local PostgreSQL database. Skip this if using Supabase Cloud.

### 5. Initialize Database Schema

**Option A: Using Supabase CLI (Recommended)**

```bash
supabase db push
```

This applies all migrations in `supabase/migrations/`.

**Option B: Manual SQL in Supabase Dashboard**

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project → SQL Editor
3. Open each migration file in `supabase/migrations/` and run them in order:
   - `20260425194341_init_schema.sql`
   - `20260426074158_add_category_and_slug_to_contestant.sql`
   - `20260426120000_admin_security_and_contestant_slug.sql`
   - `20260426143000_votes_per_category.sql`
   - `20260427110000_lock_vote_mutations_and_recalc.sql`
   - `20260427113000_block_direct_vote_inserts.sql`
   - `20260427121500_atomic_cast_vote_rpc.sql`
   - `20260427130000_public_storage_bucket_for_contestants.sql`

### 6. Create Storage Bucket

In Supabase Dashboard → Storage:

1. Create new bucket: `contestants`
2. Make it **public** (for image access)
3. Configure CORS if needed

Or use the Supabase CLI:

```bash
supabase storage create-bucket contestants --public
```

### 7. Start Development Server

```bash
pnpm dev
```

Visit http://localhost:3000

---

## Supabase Configuration

### Database Setup

All schemas are defined in `supabase/migrations/`. Key tables:

| Table                | Purpose                                         |
| -------------------- | ----------------------------------------------- |
| `auth.users`         | Supabase Auth users (Google OAuth)              |
| `public.users`       | Extended user info (role, voting status)        |
| `public.contestants` | Candidate profiles (name, bio, category, image) |
| `public.votes`       | Vote records (user → contestant per category)   |

### Enabling RLS (Row-Level Security)

All tables have RLS enabled. Policies define who can read/write:

- **Users** — Can only read own profile; admins can update
- **Contestants** — Public can read active only; admins can manage
- **Votes** — Only authenticated users can vote; admins can view all

RLS policies are in the migrations. Verify in Supabase Dashboard → Authentication → Policies.

### Storage Setup

The `contestants` bucket stores candidate images:

- **Path**: `contestants/{contestant_id}/image.jpg`
- **Public access**: Yes (images displayed on public pages)
- **Max file size**: Configure in Supabase settings (recommend 10MB)

---

## Environment Variables

Create `.env.local` with these variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_CONTESTANTS_BUCKET=contestants

# NextJS
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Change for production

# Google OAuth (from Google Cloud Console)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Arcjet Security (optional)
ARCJET_KEY=your-arcjet-key

# Voting Configuration
VOTE_SALT=your-random-salt  # Generate: `openssl rand -hex 32`

# Admin Configuration (email with admin access)
ADMIN_EMAIL=admin@example.com
```

### Getting Credentials

#### Supabase Keys

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project → Settings → API
3. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project (if needed)
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add redirect URIs:
   - Local: `http://localhost:3000/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`
6. Copy Client ID

#### Arcjet Key

1. Go to [Arcjet Dashboard](https://dashboard.arcjet.com/)
2. Create project
3. Copy API key

---

## Production Deployment

### Deploy to Vercel (Recommended)

#### 1. Push Code to GitHub

```bash
git add .
git commit -m "v1.2.0-aurudu-beta release"
git push origin main
```

#### 2. Connect to Vercel

1. Go to [Vercel](https://vercel.com/)
2. Click "Add New Project"
3. Select your GitHub repo
4. Vercel auto-detects Next.js
5. Click "Deploy"

#### 3. Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

Add all variables from `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL` (set to your production domain)
- `ARCJET_KEY`
- `VOTE_SALT`
- `ADMIN_EMAIL`

#### 4. Update Google OAuth

In Google Cloud Console → OAuth credentials:

Add Vercel domain to redirect URIs:

- `https://yourdomain.com/auth/callback`
- `https://yourdomain.vercel.app/auth/callback`

#### 5. Deploy

Vercel auto-deploys on `git push main`.

### Deploy to Other Platforms

Sosamala works on any Node.js host:

Docker support is provided with root-level `Dockerfile` and `.dockerignore`.

**Build & Run**

```bash
docker build -t vote-sosamala .
docker run -p 3000:3000 -e NEXT_PUBLIC_SUPABASE_URL=... vote-sosamala
```

**Railway, Render, Fly.io**

All support Next.js. Follow their deployment docs and add environment variables.

---

## Database Migrations

### Understanding Migrations

Migrations in `supabase/migrations/` are SQL files that define schema changes:

| File                                        | Purpose                                   |
| ------------------------------------------- | ----------------------------------------- |
| `init_schema.sql`                           | Create tables: users, contestants, votes  |
| `add_category_and_slug_to_contestant.sql`   | Add category & slug columns               |
| `admin_security_and_contestant_slug.sql`    | Set up RLS, admin functions               |
| `votes_per_category.sql`                    | Ensure one vote per user per category     |
| `lock_vote_mutations_and_recalc.sql`        | Prevent direct inserts, add triggers      |
| `block_direct_vote_inserts.sql`             | Allow votes only through secure functions |
| `atomic_cast_vote_rpc.sql`                  | Atomic voting function via RPC            |
| `public_storage_bucket_for_contestants.sql` | Set up storage bucket                     |

### Applying Migrations

**Using Supabase CLI**

```bash
supabase db push
```

**Manual Application**

Run each `.sql` file in SQL Editor (in order) or use psql:

```bash
psql postgresql://user:pass@localhost:5432/postgres -f supabase/migrations/init_schema.sql
```

### Creating New Migrations

To add new schema changes:

```bash
supabase migration new <migration_name>
```

This creates a timestamped SQL file in `supabase/migrations/`.

---

## Initial Data Setup

### Add Admin User

```sql
-- After user logs in via Google OAuth, run:
UPDATE public.users
SET role = 'admin'
WHERE id = 'user-uuid';
```

Find user UUID in Supabase Dashboard → Authentication → Users.

### Add Categories

Categories are managed via admin dashboard, but can be created manually:

```sql
INSERT INTO public.categories (name, description) VALUES
  ('Aurudu Kumara', 'The young prince of the new year'),
  ('Aurudu Kumariya', 'The radiant princess of the dawn');
```

### Add Contestants

Use admin dashboard or bulk insert:

```sql
INSERT INTO public.contestants (name, bio, category, image_url, active)
VALUES
  ('Name', 'Bio', 'Aurudu Kumara', 'https://...', true);
```

---

## Troubleshooting

### Issue: "Invalid credentials" during login

**Solution:**

- Verify Google OAuth app is enabled
- Check redirect URI matches exactly
- Ensure `NEXT_PUBLIC_SITE_URL` is correct

### Issue: Images not loading

**Solution:**

- Verify `contestants` bucket exists and is public
- Check image paths in database
- Ensure Supabase Storage CORS is configured

### Issue: Votes not saving

**Solution:**

- Check RLS policies in Supabase Dashboard
- Verify user is authenticated (check auth cookie)
- Check Arcjet isn't blocking requests
- Review API logs: Dashboard → Functions

### Issue: Migration fails

**Solution:**

- Run migrations in order (don't skip any)
- Ensure you're using correct Supabase project
- Check SQL syntax in Dashboard → SQL Editor
- Review migration file comments

### Getting Help

- **GitHub Issues**: [Report bugs](https://github.com/NayanthaNethsara/vote-sosamala-v2/issues)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

---

## Next Steps

Setup complete. Continue with:

1. **[Customize](./CUSTOMIZATION.md)** branding and categories
2. **[Understand](./ARCHITECTURE.md)** the system architecture
3. **[Contribute](./CONTRIBUTING.md)** or deploy for your event
