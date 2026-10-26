# Pilot App — Backend

NestJS API for the Susi Air pilot app (schedules, flight hours, duty limits, documents).
Live: `https://pilot-backend-alpha.vercel.app`
Frontend repo: `https://github.com/reinfork/Pilot-App-Frontend`

## Run

Prerequisite: Node 22 (`engines` pins it).

```bash
npm ci
npm run start:dev   # :8000, watch mode
npm test            # unit (vitest)
npm run test:e2e    # API contract tests
npm run lint        # oxlint
npm run build       # tsc -> dist/
npm run start:prod  # node dist/main.js — run with cwd = this folder (data path is cwd-relative)
```

`PORT` overrides the local port: `PORT=8125 npm run start:prod`.

## Environment

| Var | Required where | Effect |
|---|---|---|
| `AUTH_SECRET` | Production / Vercel | HMAC signing key for tokens. Missing + `VERCEL=1` (or `NODE_ENV=production`) → boot throws. Unset locally → `dev-secret` fallback. Never commit it. |
| `PORT` | Local prod runs | Defaults to `8000`. Ignored on Vercel (serverless, no listen). |
| `VERCEL` | Auto-set by Vercel | `=1` skips `app.listen` (the serverless entry boots via `init()` instead). |

No `.env` file is used or needed. Local dev works with zero env vars.

## API

| Method | Path | Notes |
|---|---|---|
| POST | `/auth/login` | `{username, password}` → `{token}`; 401 on bad creds |
| GET | `/pilot/me` | `{name, total_flight_hours, avatar_url}` (absolute URL) |
| GET | `/flight-hours?from&to` | `[{date, hours}]`, zero-filled gaps, 1 decimal |
| GET | `/flight-hours/summary?range=` | `range=today=today` anchor; `windowDays`, `displayRangeDays`, `limit`, `max`, 15-point rolling `series` |
| GET | `/documents` | urgency computed vs fixed `TODAY=2026-05-15`: `expired` / `soon` / `safe` |
| GET | `/schedules?year&month` | month entries + `legend`, sorted |

All routes except login require `Authorization: Bearer <token>`. Errors are uniform `{statusCode, message}` via a global filter; all inputs validated via a global pipe.

## Main choices (and why)

- **JSON seeding, no database.** The dataset is fixed demo content; a DB would be infra with no payoff. `DataService` reads `data/*.json` synchronously at boot.
- **HMAC stateless tokens, no store, no JWT lib.** The previous in-memory `Set` breaks on serverless (each instance has its own memory → random 401s). Format `b64user.ts.nonce.sig`, 24h TTL, stdlib `crypto` only. Unique per login via nonce; verified cross-instance in tests.
- **One serverless function, zero new deps.** `api/index.js` (plain JS) imports the tsc-compiled `dist/` (Vercel's TS pipeline can't emit decorator metadata, so the entry can't be TS importing `src/`), calls `init()` without listening, and exports the raw Express instance. Plain JS also keeps it invisible to `nest build`.
- **Shared `configureApp`.** CORS / trust-proxy / static-avatar setup lives in `src/app.setup.ts`, used by both `main.ts` and the serverless entry — one place to change, not two.
- **UTC date math server-side.** Rolling sums and `daysRemaining` are computed here; the frontend only scales the chart axis. `TODAY` is a constant (`2026-05-15`) so demo and tests agree.
- **Open CORS.** Demo boundary; restrict to the frontend origin if this leaves demo use.

## Deploy (Vercel)

Import this repo, framework preset Other, build command `npm run build`. Set `AUTH_SECRET`. `vercel.json` handles the rest: all routes → `/api/index`, `data/**` bundled into the function, region `sin1`.

## Planned future changes

- Real user store (Postgres) replacing JSON seeds and the fixed demo credentials.
- Refresh-token rotation and revocation (likely Redis) if logout-everywhere or expiry control matters.
- Restrict CORS to the frontend origin; add rate limiting on `/auth/login`.
- Guard `/flight-hours` range length (currently unbounded by design, fine for seeded data).
- Expiry edge-case tests (TTL boundary, clock skew) for the HMAC scheme.
