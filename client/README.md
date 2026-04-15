# Client (Next.js)

Frontend application for the Sosamala Voting platform.

## Frontend Architecture

The client is built on the App Router model with UI components, feature hooks, server actions, and Firebase authentication integration.

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- shadcn/ui + Radix primitives
- Firebase client SDK
- Zod for validation

## Local Setup

From repository root:

```bash
make client-install
```

Run development server:

```bash
cd client
pnpm install
pnpm run dev
```

Useful scripts:

- `pnpm lint`
- `pnpm format`
- `pnpm format:check`
- `pnpm build`

## Directory Guide

- `app` - routes, layouts, and server actions
- `components` - UI and feature components
- `context` - auth and app context providers
- `hooks` - client data and interaction hooks
- `lib` - utilities, validation, adapters
- `config` - environment configuration
- `types` - shared TypeScript types
- `public` - static assets

## Environment

Create `client/.env.local` as needed.

Core variables:

- `NEXT_PUBLIC_API_BASE_URL` (default: http://localhost:8080)
- Firebase web config keys used in `config/env.ts`

## Auth and Admin Notes

- Auth state is managed in `context/AuthContext.tsx`.
- Session sync endpoint is `app/api/auth/session/route.ts`.
- Admin routes are guarded in `proxy.ts`.
- User-management screens expect paginated API responses from backend user endpoints.
