# Sosamala Voting Platform

A secure, privacy-first, self-hostable voting app for beauty contests and other events.

---

## 🚀 Features

- One vote per email per category (privacy: voter email hashed)
- Google login (OAuth, no passwords)
- Public contestant pages (shareable links)
- Admin dashboard for easy management
- Supabase DB and Storage (public images, no cost surprises)
- Rate limiting and bot detection (Arcjet)
- All admin and vote security checked on the server

---

## 🏗️ Tech Stack

- **Frontend:** Next.js App Router, Tailwind CSS
- **Backend:** Next.js API routes (Edge/serverless-ready)
- **Auth:** Supabase Auth (Google OAuth2)
- **Database:** Supabase PostgreSQL (RLS enabled)
- **Storage:** Supabase Storage CDN
- **Security:** Arcjet (API security, rate limiting, bot detection), Supabase RLS

---

## 🛡️ Security Model

- Voter emails **never stored as plain text** (SHA256 + salt)
- One vote per hashed user per category (enforced by DB unique constraint)
- All admin access limited by one configured email (in `.env`)
- RLS for all sensitive DB tables and storage
- API routes use Arcjet for rate limits and bot detection
- No persistent login needed after voting (logout is optional)

---

## 🧑‍💻 How To Run / Deploy

1. **Clone and install**

   ```bash
   git clone https://github.com/yourorg/sosamala-voting.git
   cd sosamala-voting
   npm install
   ```

2. **Setup .env.local**

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
ADMIN_EMAIL=youremail@domain.com
VOTE_SALT=sosamala-vote-salt-2024
ARCJET_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. **Setup Supabase**

   - Create a new project at [Supabase](https://supabase.com/), copy your project URL and anon key.
   - Enable Google Auth in Supabase Auth settings. Add `http://localhost:3000/auth/callback` as a redirect URL.
   - Run the SQL in `sql/schema.sql` to create tables and policies.

4. **(Optional) Setup Arcjet**

   - Sign up at [arcjet.com](https://arcjet.com/), get your API key, and add it to `.env.local` as `ARCJET_KEY`.

5. **Run Locally or Deploy**

   - To start the app locally:
     ```bash
     npm run dev
     ```
   - Or deploy to [Vercel](https://vercel.com/) for production.

---

## 📄 SQL Schema (`sql/schema.sql`)

See the full schema in [`/sql/schema.sql`](./sql/schema.sql).

---

## ⚡️ Edge Function / Middleware

- API routes are protected with Arcjet (see `middleware.ts`)
- Rate limiting and bot protection at the edge
- Admin APIs double-check user session and email

---

## 👨‍🔬 How To Contribute

- Please open issues for bugs or feature ideas.
- PRs should include updates to this README if they change APIs or tables.
- For new DB features: always add or modify RLS policies!
