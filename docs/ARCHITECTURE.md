# Architecture

This document explains the runtime flow, data model, and security boundaries.

## System Overview

```mermaid
flowchart LR
  U[User Browser] --> N[Next.js App Router]
  N --> SA[Server Actions]
  N --> AR[Auth Callback Route]
  SA --> DB[(Supabase Postgres)]
  AR --> AU[Supabase Auth Google OAuth]
  SA --> ST[Supabase Storage]
  SA --> AJ[Arcjet Rate Limiting]
```

## Data Model

```mermaid
erDiagram
  AUTH_USERS ||--|| USERS : maps_to
  USERS ||--o{ VOTES : casts
  CATEGORIES ||--o{ CONTESTANTS : groups
  CATEGORIES ||--o{ VOTES : scopes
  CONTESTANTS ||--o{ VOTES : receives

  AUTH_USERS {
    uuid id
    string email
  }

  USERS {
    uuid id
    string role
    boolean has_voted
  }

  CATEGORIES {
    uuid id
    string name
    string slug
    boolean active
  }

  CONTESTANTS {
    uuid id
    string name
    string slug
    uuid category_id
    string image_url
    int vote_count
    boolean active
  }

  VOTES {
    bigint id
    uuid user_id
    uuid contestant_id
    uuid category_id
    timestamp created_at
  }
```

## Authentication and Authorization

- Authentication: Google OAuth via Supabase Auth.
- Session handling: Supabase cookies managed by server-side client.
- Authorization: role-based checks plus Row-Level Security (RLS).
- Admin access: restricted by role and server-side verification.

## Voting Flow

```mermaid
sequenceDiagram
  participant User
  participant UI as Next.js UI
  participant SA as Server Action
  participant AJ as Arcjet
  participant DB as Supabase RPC/DB

  User->>UI: Click vote
  UI->>SA: Submit email + contestant + category
  SA->>AJ: Check rate limit
  AJ-->>SA: Allow/Deny
  alt denied
    SA-->>UI: 429 rate limited
  else allowed
    SA->>DB: call cast_vote RPC
    DB-->>SA: success or duplicate
    SA-->>UI: result
  end
```

## Security Model

- One vote per user per category enforced with DB unique constraint.
- Direct vote table inserts are blocked; voting uses secure RPC.
- RLS is enabled for sensitive tables.
- Email privacy uses salted hashing.
- Arcjet protects voting endpoints from abuse.

## Storage

- Contestant images are stored in Supabase Storage bucket.
- Bucket is public for display assets.
- Upload and update paths are controlled by admin actions.

## Scalability Notes

- Leaderboards use cached `vote_count` for fast reads.
- Add indexes by category and vote count for larger events.
- Free tier is sufficient for small events; scale via Supabase/Vercel plans.
