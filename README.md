# ITP Habits

A full-stack habit tracker implementing the Jira ITP tasks. Built with Next.js 14 (App Router) + TypeScript, Prisma (Postgres/Supabase), NextAuth, Tailwind, Zod, Upstash Redis rate limiting, Sentry, and Playwright.

- Monorepo: single Next.js app
- Database: Postgres (local via Docker) or Supabase in cloud
- Auth: NextAuth (Google OAuth + Email magic link)
- API: RESTful route handlers in /app/api
- PWA: manifest + service worker (next-pwa)
- CI: GitHub Actions for typecheck, lint, unit and e2e

## Quick start

1) Prereqs
- Node 20.x, pnpm >= 9
- Docker (for local Postgres)

2) Install deps

```
pnpm install
```

3) Copy env vars and fill in placeholders

```
cp .env.example .env.local
```

4) Start local Postgres (Dev only)

```
docker compose up -d
```

5) Generate Prisma client and run migrations

```
pnpm prisma:generate
pnpm prisma:migrate
```

6) Seed sample data (optional)

```
pnpm seed
```

7) Run the app

```
pnpm dev
```

Visit http://localhost:3000

## Environments
- Vercel recommended for hosting. Configure dev/preview/prod and set the env vars from `.env.example`.
- Supabase recommended for managed Postgres, Auth, and RLS. SQL policies in `supabase/policies.sql`.

## Testing
- Unit tests: `pnpm test`
- E2E tests: `pnpm e2e`

## Project structure
- app/ — Next.js App Router pages and API routes
- components/ — UI components
- lib/ — server utilities (db, auth, rate limiting, time helpers, zod schemas)
- prisma/ — Prisma schema and migrations
- supabase/ — SQL for RLS policies and setup
- tests/ — unit and integration tests
- .github/workflows — CI pipelines

## Security
- Zod validations on inputs
- Secure cookies via NextAuth
- CSRF protection for forms (Next.js + SameSite=Lax)
- Rate limiting on mutation endpoints with Upstash

## Observability
- Sentry for FE/BE error tracking (dsn + release)
- Vercel Analytics enabled

## License
MIT
