# K-VeriAI — working notes for agents

- Next.js 16 App Router: `proxy.ts` (not middleware), async `params`/`searchParams`/`cookies()`, `PageProps<"/route">` typed helpers (run `pnpm next typegen` after adding routes). Read `node_modules/next/dist/docs/` before using unfamiliar APIs.
- Prisma 7 with `@prisma/adapter-pg`; client generated to `src/generated/prisma` (gitignored) — run `pnpm prisma generate` after `pnpm install`. Config in `prisma.config.ts`; seed via `pnpm prisma db seed`.
- Server Actions live in `actions.ts` next to pages and must only export async functions; always call `requireUser()` / `requireRole()` first.
- Evaluation engine (`src/lib/eval`): keep DEMO mode deterministic (seeded PRNG) and keep `DemoJudge` key heuristics in sync with scenario annotation keys in `prisma/seed-data/library.ts`.
- Framework requirements come from `docs/framework-control-library.md` → `python3 prisma/seed-data/build-frameworks.py` → `prisma/seed-data/frameworks.json`. Edit the markdown, not the JSON.
- Checks before pushing: `pnpm tsc --noEmit && pnpm lint && pnpm build`.

@AGENTS.md
