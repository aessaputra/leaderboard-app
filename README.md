This project is a Next.js + TypeScript + Prisma (PostgreSQL) app.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Tooling & Conventions

- EditorConfig: see `.editorconfig` for consistent whitespace, EOL and final newline.
- ESLint: flat config in `eslint.config.mjs`. Run checks with `pnpm lint` and auto-fix with `pnpm lint:fix`.
- TypeScript: run `pnpm typecheck`.
- VS Code: workspace settings live in `.vscode/`.
  - Format on save enabled; ESLint fixes on save.
  - See `.vscode/extensions.json` for recommended extensions.
- Git hooks: optional lightweight pre-commit hook in `githooks/pre-commit`.
  - Enable once per repo: `git config core.hooksPath githooks`.

### Common Tasks

```bash
pnpm dev          # run dev server
pnpm lint         # lint
pnpm lint:fix     # lint & auto-fix
pnpm typecheck    # type checks
pnpm db:seed      # seed database
```

## Notes

- `next.config.mjs` is the single source of Next config. `typedRoutes` is disabled to reduce friction with strict typed `Link` routes. Re-enable once all links are typed.

## Local Setup (no Docker)

- Env: update both `.env` (Prisma reads this) and `.env.local` (Next.js reads this) with the same `DATABASE_URL` (Neon recommended) and `NEXTAUTH_SECRET`.
- Install: `pnpm install`
- Generate Prisma client: `pnpm prisma generate`
- Apply migrations: `pnpm prisma migrate deploy`
- (Optional) Seed: `pnpm db:seed`
- Run dev server: `pnpm dev`

Notes:
- Prisma loads env from `.env` (or `prisma/.env`); ensure your Neon URL is set there. Next.js uses `.env.local` at runtime — keep them in sync.
- For Neon, use the pooled host (`-pooler`) and append `?sslmode=require`.
- When you change the Prisma schema during development, use `pnpm prisma migrate dev` to create new migrations.

## Production (no Docker)

Run the app without containers:

1. Install prerequisites: Node.js 18+ and PostgreSQL 14+.
2. Create a database (example name: `pes_trophy`).
3. Set environment variables (e.g. in your process manager):
   - `DATABASE_URL` (Neon example): `postgresql://USER:PASSWORD@ep-xxx-pooler.REGION.aws.neon.tech/DB_NAME?sslmode=require`
   - `NEXTAUTH_URL=https://your-domain`
   - `NEXTAUTH_SECRET=generate-a-strong-secret`
4. Install deps and build:
   - `pnpm install`
   - `pnpm build`
5. Apply migrations and start:
   - `pnpm prisma migrate deploy`
   - `pnpm start`

Optional: create a `systemd` service or use a process manager like PM2 to keep the app running.

### Using Neon

- Use the pooled connection host (contains `-pooler`) and append `?sslmode=require`.
- After updating `DATABASE_URL`, run:
  - `pnpm prisma generate`
  - `pnpm prisma migrate deploy`
  - `pnpm start`
