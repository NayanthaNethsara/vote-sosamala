# Contributing Guide

Welcome! This guide covers development workflows, coding standards, and how to contribute.

## Table of Contents

1. [Development Setup](#development-setup)
2. [Project Structure](#project-structure)
3. [Coding Standards](#coding-standards)
4. [Git Workflow](#git-workflow)
5. [Reporting Issues](#reporting-issues)

---

## Development Setup

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- pnpm 10+ (`npm install -g pnpm`)
- Git
- GitHub account

### Initial Setup

```bash
# 1. Fork the repo on GitHub
# https://github.com/NayanthaNethsara/vote-sosamala-v2

# 2. Clone your fork
git clone https://github.com/YOUR-USERNAME/vote-sosamala-v2.git
cd vote-sosamala-v2

# 3. Add upstream remote
git remote add upstream https://github.com/NayanthaNethsara/vote-sosamala-v2.git

# 4. Install dependencies
pnpm install

# 5. Set up environment
cp .env.example .env.local
# Fill in your Supabase & Google OAuth credentials

# 6. Start dev server
pnpm dev
```

Visit http://localhost:3000

### Database Setup (Local)

```bash
# Start Supabase locally
supabase start

# Apply migrations
supabase db push

# Or manually run migrations via Supabase dashboard
```

---

## Project Structure

```
vote-sosamala-v2/
├── app/                           # Next.js App Router
│   ├── actions/                   # Server Actions
│   │   ├── admin/                 # Admin-only actions
│   │   └── public/                # Public actions
│   ├── admin/                     # Admin pages
│   ├── auth/                      # Authentication
│   ├── [category]/                # Dynamic category pages
│   └── layout.tsx                 # Root layout
│
├── components/                    # Reusable React components
│   ├── admin/                     # Admin components
│   ├── auth/                      # Auth components
│   ├── public/                    # Public components
│   ├── ui/                        # UI primitives (shadcn)
│   └── votes/                     # Voting components
│
├── config/                        # Configuration files
│   ├── categories.ts              # Category definitions
│   ├── env.ts                     # Environment validation
│   └── site-config.ts             # Site configuration
│
├── lib/                           # Utility functions
│   ├── supabase/                  # Supabase clients & auth
│   ├── security/                  # Security utilities (Arcjet)
│   ├── validation/                # Input validation schemas
│   └── utils.ts                   # General utilities
│
├── types/                         # TypeScript type definitions
│
├── docs/                          # Documentation
│   ├── SETUP.md                   # Setup guide
│   ├── ARCHITECTURE.md            # System design
│   ├── CUSTOMIZATION.md           # Customization guide
│   └── CONTRIBUTING.md            # This file
│
├── supabase/                      # Supabase config
│   ├── migrations/                # Database migrations
│   └── config.toml                # Supabase settings
│
└── public/                        # Static assets
    ├── logo/                      # Brand logos
    └── archive/                   # Archived versions
```

### Key Files

| File                                 | Purpose                  |
| ------------------------------------ | ------------------------ |
| `app/layout.tsx`                     | Root layout, providers   |
| `app/page.tsx`                       | Home/leaderboard         |
| `app/actions/public/vote-actions.ts` | Vote submission logic    |
| `app/admin/page.tsx`                 | Admin dashboard          |
| `lib/supabase/auth.ts`               | Authentication helpers   |
| `lib/validation/*/`                  | Input validation schemas |
| `config/site-config.ts`              | Site-wide configuration  |

---

## Coding Standards

### TypeScript

- Use strict mode (already enabled)
- Define types for all function parameters and returns
- Avoid `any` — use `unknown` if type is truly unknown

```typescript
// Good
function getUser(id: string): Promise<User | null> {
  // ...
}

//  Avoid
function getUser(id: any): any {
  // ...
}
```

### React Components

- Use functional components only
- Prefer named exports
- Add `'use client'` for client components
- Document component props

```typescript
// Good
"use client";

interface VoteButtonProps {
  contestantId: string;
  categoryId: string;
  onSuccess?: () => void;
}

export function VoteButton({
  contestantId,
  categoryId,
  onSuccess,
}: VoteButtonProps) {
  // ...
}

//  Avoid
export default function VoteButton(props) {
  // ...
}
```

### Server Actions

- Mark with `'use server'`
- Validate all inputs
- Handle errors gracefully
- Return structured responses

```typescript
// Good
"use server";

export async function castVote(
  email: string,
  contestantId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate
    const validation = validateEmail(email);
    if (!validation.ok) {
      return { success: false, error: validation.error };
    }

    // Process
    const result = await supabase.rpc("cast_vote", { email, contestantId });

    return { success: !!result };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
```

### Styling

- Use Tailwind CSS only
- Follow mobile-first approach
- Use semantic color classes
- Avoid inline styles

```typescript
// Good
<button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
  Vote
</button>

//  Avoid
<button style={{ backgroundColor: 'blue', padding: '16px' }}>
  Vote
</button>
```

### File Naming

- Components: `PascalCase` — `VoteButton.tsx`
- Utilities: `camelCase` — `validateEmail.ts`
- Types: `PascalCase` — `User.ts`
- Server Actions: `camelCase` with `-actions` suffix — `vote-actions.ts`

### Comments

Add comments for complex logic:

```typescript
// Hashing with salt prevents rainbow table attacks
const emailHash = crypto
  .createHash("sha256")
  .update(email + process.env.VOTE_SALT)
  .digest("hex");
```

Avoid over-commenting obvious code:

```typescript
//  Unnecessary
// Get the email from the form
const email = formData.get("email");

// Better - self-explanatory
const email = formData.get("email") as string;
```

---

## Git Workflow

### Branch Naming

- Feature: `feature/short-description` — `feature/add-voting-notification`
- Bug fix: `fix/short-description` — `fix/vote-count-bug`
- Docs: `docs/short-description` — `docs/setup-guide`
- Chore: `chore/short-description` — `chore/update-deps`

### Commit Messages

Follow conventional commits:

```
type(scope): description

[optional body]
[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**

```bash
git commit -m "feat(voting): add email validation for votes"
git commit -m "fix(admin): prevent duplicate contestant uploads"
git commit -m "docs: update SETUP.md with Vercel deployment"
git commit -m "chore(deps): update supabase-js to v2.104.0"
```

### Local Workflow

```bash
# 1. Sync with upstream
git fetch upstream
git rebase upstream/main

# 2. Create feature branch
git checkout -b feature/my-feature

# 3. Make changes & commit
git add .
git commit -m "feat: description"

# 4. Push to your fork
git push origin feature/my-feature

# 5. Create Pull Request on GitHub
```

### Keep Fork Updated

```bash
git fetch upstream
git rebase upstream/main
git push origin main
```

---

## Reporting Issues

### Bug Reports

Include:

1. **Description** — What is the bug?
2. **Steps to reproduce** — How to trigger it?
3. **Expected behavior** — What should happen?
4. **Actual behavior** — What happens instead?
5. **Environment**:
   - OS (macOS, Linux, Windows)
   - Node.js version
   - Browser (if frontend issue)
6. **Screenshots/logs** — If applicable

**Example:**

```
Title: Votes not saving for Aurudu Kumariya category

Steps to reproduce:
1. Log in with Google
2. Navigate to Aurudu Kumariya category
3. Click vote for first contestant
4. Check if vote was recorded

Expected: Vote count increases
Actual: Vote count doesn't change, no error shown

Environment:
- macOS 14.2
- Node 20.11
- Chrome 122
```

### Feature Requests

Include:

1. **Use case** — Why is this needed?
2. **Proposed solution** — How should it work?
3. **Alternatives** — Other approaches?

**Example:**

```
Title: Add real-time vote count updates

Use case:
Viewers want to see live vote counts without refreshing

Proposed solution:
Use Supabase Realtime subscriptions to push updates
when vote_count changes

Alternatives:
- Polling every 5 seconds (less efficient)
- WebSocket connection (already in Supabase)
```

### Security Issues

**Do not** open public issues for security vulnerabilities.

Email: security@vote-sosamala.dev (or maintainer's email)

Include:

- Vulnerability description
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

---

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **Supabase Docs**: https://supabase.com/docs
- **TypeScript Docs**: https://www.typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Git Workflow**: https://guides.github.com

---

## Questions?

- Open an issue for help
- Check existing discussions

---

Thank you for contributing.
