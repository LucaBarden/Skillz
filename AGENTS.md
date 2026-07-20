# AGENTS.md

## Quick commands

```bash
npm run dev              # Next.js dev server (Turbopack)
npm run build            # Next.js production build
npm run check            # lint + typecheck
npm run typecheck        # tsc --noEmit only
npm run lint             # ESLint via next lint
npm run format:write     # Prettier
npm run db:push          # push Drizzle schema → SQLite
npm run db:studio        # Drizzle Studio GUI
npm run build -w packages/cli  # build CLI with tsup
npm run publish:cli      # build + npm publish CLI

npm run docker:build     # build Docker image
docker compose up -d     # start (persistent SQLite volume)
docker compose down -v   # stop + wipe DB volume
```

## Project structure

npm workspaces monorepo with 3 packages:

| Package | Dir | Published | Purpose |
|---------|-----|-----------|---------|
| `skillz` (root) | `/` | no (`private:true`) | Next.js web app (registry server) |
| `skillz` (CLI) | `packages/cli/` | yes (npm) | CLI tool, `npx skillz` |
| `@skillz/shared` | `packages/shared/` | no | shared Zod schemas + parser, consumed raw (no build) |

## Critical build gotchas

### DATABASE_URL is mandatory for `next build`

`src/server/db/index.ts` initializes a libSQL client at **import time**. `next build` evaluates route modules during the "Collecting page data" phase — if `DATABASE_URL` is unset, the build crashes with `URL_INVALID`.

Resolved via `src/server/config.ts` with this fallback chain:
1. `process.env.DATABASE_URL` (set by `.env` or CLI)
2. `server-config.json` → `database_url` field (non-Docker deployments)
3. Default: `file:./db.sqlite`

- Local: `DATABASE_URL=file:./db.sqlite npm run build`
- Docker builder stage: `DATABASE_URL=:memory:` (build only — runtime URL comes from docker-compose)
- `.env` overrides CLI env vars for Next.js; pass `SKIP_ENV_VALIDATION=true` to avoid validation errors when overriding
- Copy `server-config.example.json` → `server-config.json` for non-env configuration

### Schema duplication

`docker-entrypoint.sh` has a **hardcoded SQL copy** of the Drizzle schema. If you change `src/server/db/schema.ts`, update the `CREATE TABLE` statements in the entrypoint script too.

### Native bindings in standalone output

`next.config.js` has `outputFileTracingIncludes: { "/*": ["./node_modules/@libsql/**"] }` — required because Next.js standalone output strips platform-specific native binaries. Without this, Docker runtime fails with `Cannot find module @libsql/linux-arm64-musl`.

## Path aliases

- `skillz/*` → `src/*` (tsconfig paths, for web app imports)
- `@skillz/shared` → `packages/shared/src/index.ts` (workspace resolution, no build step)
- Do **not** create an alias `@skillz/*` — it doesn't exist

## Database

- SQLite via `@libsql/client`, file-based: `DATABASE_URL=file:./db.sqlite`
- Table prefix: `skillz_` (via `sqliteTableCreator`), physical table: `skillz_skill`
- Unique constraint on `(owner, name)`, index on `(owner, name)`
- Use `db:push` for dev; `db:generate` + `db:migrate` for versioned migrations

## Web app conventions

- **Tailwind v4** — CSS-first `@theme` in `src/styles/globals.css` (no `tailwind.config.js`)
- Dark theme only: `bg-[#090a0d]`, zinc palette
- Internal links MUST use `<Link>` from `next/link` — ESLint `@next/next/no-html-link-for-pages`
- Markdown rendering: server-side `marked` → HTML, client markup uses `.wmde-markdown` CSS class

## CLI conventions

- All dependencies **bundled** by tsup into `dist/cli.js` (no runtime deps)
- `prepublishOnly` hook auto-builds before `npm publish`
- Config stored at `~/.config/skillz/config.json`: `{ registry, skillsDir }`
- Skills installed to `skillsDir/<name>/SKILL.md` (default: `~/.skillz/`)
- Shared code (`@skillz/shared`) is bundled into the CLI — no need to publish shared separately
- ESLint/tsconfig not applied to CLI source; only tsup handles it
