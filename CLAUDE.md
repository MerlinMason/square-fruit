# square-fruit

T3 Stack project (create-t3-app v7.39.3) - full-stack TypeScript Next.js app with tRPC, NextAuth, Drizzle ORM.

## Tech Stack

### Core
- **Next.js 15.2.3** (React 19, Turbopack for dev)
- **TypeScript 5.8.2** (strict mode, noUncheckedIndexedAccess)
- **Bun** (package manager, ES modules)

### Backend
- **tRPC 11.0.0** - type-safe API layer
- **Drizzle ORM 0.41.0** - PostgreSQL database
- **NextAuth 5.0.0-beta.25** - authentication (Discord provider configured)
- **Zod 3.24.2** - runtime validation
- **SuperJSON 2.2.1** - data serialization

### Frontend
- **React 19** + **React Query 5.69.0**
- **Tailwind CSS 4.0.15** (v4 with PostCSS plugin)
- **Biome 1.9.4** - linting/formatting (replaces ESLint/Prettier)

### Database
- **PostgreSQL** via `postgres` driver (3.4.4)
- Tables prefixed: `square-fruit_*`
- Local dev: Docker/Podman container (see `start-database.sh`)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/
│   │   ├── auth/          # NextAuth routes
│   │   └── trpc/          # tRPC API endpoint
│   ├── _components/       # Server components
│   └── layout.tsx/page.tsx
├── server/
│   ├── api/
│   │   ├── root.ts        # tRPC router aggregation
│   │   ├── routers/       # API route handlers
│   │   └── trpc.ts        # tRPC setup (context, procedures)
│   ├── auth/
│   │   ├── config.ts      # NextAuth config
│   │   └── index.ts       # Auth helpers
│   └── db/
│       ├── index.ts       # DB client
│       └── schema.ts      # Drizzle schema
├── trpc/
│   ├── query-client.ts    # React Query config
│   ├── react.tsx          # Client tRPC hooks
│   └── server.ts          # Server tRPC caller
├── env.js                 # Env validation (@t3-oss/env-nextjs)
└── styles/globals.css
```

## Environment Variables

Required (see `.env.example`):
- `AUTH_SECRET` - NextAuth secret (generate: `npx auth secret`)
- `AUTH_DISCORD_ID` / `AUTH_DISCORD_SECRET` - Discord OAuth
- `DATABASE_URL` - PostgreSQL connection string

Validation: `src/env.js` enforces server/client vars via Zod schemas.

## Key Scripts

```bash
bun dev              # Dev server (Turbopack)
bun build            # Production build
bun typecheck        # TypeScript validation
bun check            # Biome lint+format
bun check:write      # Auto-fix issues
bun db:push          # Push schema to DB
bun db:studio        # Drizzle Studio GUI
./start-database.sh  # Start local Postgres container
```

## Database Setup

1. Run `./start-database.sh` (creates/starts Docker container)
2. Run `bun db:push` (sync schema to database)
3. Use `bun db:studio` for GUI management

## Auth Flow

- Discord OAuth via NextAuth v5 beta
- Drizzle adapter stores sessions in DB
- Protected procedures: `protectedProcedure` in `src/server/api/trpc.ts`
- Session extended with user ID in callbacks

## tRPC Pattern

- Define routers in `src/server/api/routers/`
- Aggregate in `src/server/api/root.ts`
- Client: `api.post.getLatest.useQuery()` (React hooks)
- Server: `await api.post.getLatest()` (direct calls in RSC)

## TypeScript Config

- Path alias: `@/*` → `src/*`
- ES2022 target, ESNext modules, Bundler resolution
- Strict mode + `noUncheckedIndexedAccess`
- `verbatimModuleSyntax` for consistency

## Code Quality

- **Biome** replaces ESLint/Prettier (faster, single tool)
- Auto-imports organization enabled
- Sorted classes with `useSortedClasses` rule (for `cn()`/`clsx()`/`cva()`)
- VCS integration (Git-aware)

## Deployment Notes

- Skip env validation: `SKIP_ENV_VALIDATION=1 bun build`
- Supports Vercel/Netlify/Docker (see T3 docs)
- Build output includes Next.js standalone mode ready
