# Next.js Client

The frontend for the Sosamala Voting system, built with Next.js 15+ and Tailwind CSS.

## Tech Stack
- **Framework**: [Next.js](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Linting**: [ESLint](https://eslint.org/)
- **Formatting**: [Prettier](https://prettier.io/)

## Quick Start

From the **root directory**, you can manage the client using:
- `make client-install`: Install dependencies
- `make client-fmt`: Format code
- `make client-lint`: Lint code

To run locally for development:
```bash
cd client
pnpm install
pnpm dev
```

## Structure
- `/app`: App Router (Pages & Layouts)
- `/components`: Reusable UI components
- `/public`: Static assets

## Environment
Environment variables can be configured in a `.env.local` file if needed (e.g., API URLs).
