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
