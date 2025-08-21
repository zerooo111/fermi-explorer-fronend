# Repository Guidelines

## Project Structure & Module Organization
- `apps/backend`: Bun.js API, WebSocket, gRPC client; config in `src/config`, middleware, services.
- `apps/frontend`: Vite + React UI; pages in `src/pages`, components in `src/components`, hooks in `src/hooks`.
- `packages/`: Shared libraries (`shared-utils`, `shared-types`, `config`).
- `scripts/`: Utility scripts (e.g., `decode-buffers.js`).
- Docs and ops: `README.md`, `README-DEPLOYMENT.md`, `SYSTEMD-GUIDE.md`, service files.

## Build, Test, and Development Commands
Run at repo root (workspaces via Bun):
- `bun install`: Install all workspace deps.
- `bun run dev`: Start all `@fermi/*` packages in watch mode.
- `bun run dev:backend` / `dev:frontend`: Start individual app.
- `bun run build`: Build backend and frontend.
- `bun run test`: Run tests across workspaces (`bun test`/`vitest`).
- `bun run lint` / `format` / `typecheck`: Lint, format, and TS type-check across apps.

Backend examples:
- `bun run --filter @fermi/backend tick-logger:dev`
- `bun run --filter @fermi/backend test:websocket`

## Coding Style & Naming Conventions
- Language: TypeScript, ESM modules.
- Indentation: 2 spaces; avoid semicolon churn; prefer const/readonly.
- Filenames: `kebab-case` for files, `PascalCase` for React components, `camelCase` for vars/functions.
- Lint/Format: Backend uses ESLint; frontend uses Biome/Prettier (`apps/frontend/biome.jsonc`). Run `bun run lint` and `bun run format` before PRs.

## Testing Guidelines
- Backend: `bun test`; prefer colocated `*.test.ts` near sources.
- Frontend: `vitest`; use `*.test.tsx` colocated with components or under `__tests__/`.
- Keep tests deterministic and fast; mock network/DB.

## Commit & Pull Request Guidelines
- Commits: Use imperative mood; keep short title + concise body. Optional scope prefix: `backend:`, `frontend:`, `packages:`.
- PRs: Provide summary, motivation, and screenshots for UI. Link issues, list breaking changes, and include test plan (`commands run`, sample output). Ensure `lint`, `typecheck`, and `build` pass.

## Security & Configuration Tips
- Environment: Copy `.env.example` to `.env` in `apps/backend` and `apps/frontend` as needed.
- Secrets: Never commit real credentials; use local `.env` or deployment secrets.
