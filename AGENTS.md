# AGENTS.md

## Cursor Cloud specific instructions

Single Next.js 14 app (App Router, TypeScript, Tailwind), package manager **npm** (`package-lock.json`). The "Archipel War Room" is a hackathon dashboard: `/dashboard` (big-screen view), `/team` (mobile self-report form), and APIs `/api/teams` (GET aggregated data) + `/api/progress` (POST progress update). `/` redirects to `/dashboard`.

- **Run (dev):** `npm run dev` → http://localhost:3000 . Build: `npm run build` (also runs type-check + Next's built-in lint). There are **no `lint` or `test` scripts and no test files** — `npm run build` is the only programmatic check.
- **Env:** `.env.local` is optional — the app runs with defaults if it's absent. A valid `GITHUB_TOKEN` is NOT required: without one, GitHub commit data is empty/mocked (documented dev mode). Leaving `GITHUB_TOKEN` empty is preferable in dev, because a placeholder/invalid token makes the dashboard fire ~32 failing GitHub API calls (one per team) and load slowly. Copy from `.env.example` if you need to set `HACKATHON_START_TIME` / `HACKATHON_DURATION_MINUTES`.
- **Progress is not a slider:** on `/team`, progression is set by clicking a *sprint-step button* (0/25/50/75/90/100%) in the "OÙ EN ÊTES-VOUS ?" section. The custom-label text field only changes the label, leaving progress at its current value (default 0%).
- **Team codes:** updating progress requires the team's secret code from `src/lib/teamCodes.ts` (test team `archipel-warroom` → code `AW-TEST`).
- **In-memory store:** `src/lib/store.ts` holds progress in a global `Map`; all reported progress is **reset when the dev server restarts**.
