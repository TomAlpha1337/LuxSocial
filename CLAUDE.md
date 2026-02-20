# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm run dev          # Start Vite dev server (default port 5173)
npm run build        # Production build to dist/
npm run lint         # ESLint check
npm run preview      # Preview production build locally
```

No test framework is configured. There are no test commands.

## Architecture

**Stack**: React 19 + Vite 7 + React Router 7 (SPA, JavaScript/JSX only — no TypeScript)

**Backend**: NoCodeBackend (NCB) instance `53058_luxsocial`. All data goes through `/api/data/` endpoints proxied via Vite config to `app.nocodebackend.com`. Authentication uses NCB's Better-Auth with session cookies.

### Key Layers

- **`src/services/api.js`** — Single API module exporting 20+ namespaced objects (`auth`, `dilemmas`, `votes`, `friendships`, etc.) with CRUD helpers. Generic `request()` wrapper handles NCB response format `{ status, data }`. Uses `safeRead()` for tables that may not exist yet.
- **`src/context/AuthContext.jsx`** — App-wide user state via React Context. Handles session bootstrap, localStorage caching (with background API refresh to keep fields like `role` current), daily login bonus calculation, streak tracking, and energy system state. Access via `useAuth()` hook. Exposes `energy`, `spendEnergy(amount)`, and `refillEnergy()`.
- **`src/utils/constants.js`** — Game configuration: point values, XP levels (20 tiers), badge definitions, streak milestones, daily bonus schedule, energy system constants. These are fallback values; some may be overridden by NCB tables.
- **`src/utils/energy.js`** — Pure helper functions for the energy system: `calculateEnergy(current, lastUpdate, max)` computes real-time energy based on elapsed time, `timeUntilNextEnergy(current, lastUpdate, max)` returns ms until next regen tick.
- **`src/hooks/useAchievements.js`** — Badge/achievement checking logic, called after votes to evaluate unlock conditions.

### Routing

Routes defined in `src/App.jsx`. Public routes (`/login`, `/register`) redirect authenticated users to `/feed`. Private routes wrap content in `<Layout>` (header + XP bar + bottom nav + modals). Admin routes (`/admin`, `/admin/events`) exist but have no server-side role enforcement — admin check is `user?.role === 'admin'` in the UI.

### Screen Components

Screens live in `src/screens/` and are large (1000–2300 lines each). Each screen typically contains:
- Color token constants at the top
- Injected CSS keyframes via `document.createElement('style')`
- Inline style objects
- Multiple sub-components defined in the same file
- State management with `useState`/`useEffect`/`useCallback`

The largest/most complex screens: `PlayScreen.jsx` (core game loop), `ProfileScreen.jsx`, `AdminScreen.jsx`, `FeedScreen.jsx`.

## Styling Conventions

**No CSS-in-JS library or Tailwind.** All styling uses:
- Inline style objects (defined as `const styles = { ... }` or directly in JSX)
- Color tokens defined at the top of each component file (e.g., `const GOLD = '#00D4FF'`)
- Dynamic keyframe animations injected into `<head>` with unique IDs to prevent duplicates
- Framer Motion (`motion.div`, `AnimatePresence`) for entrance/exit animations and gestures
- Lucide React for all icons

**Theme**: Dark luxury — background `#050510`, primary cyan `#00D4FF`, accent purple `#BF5AF2`, pink `#FF2D78`, orange `#FF6B35`. Glassmorphism with `backdrop-filter: blur()` and `rgba()` borders.

## Important Patterns

**React hooks ordering**: Hooks MUST be called before any early returns (`if (loading) return ...`). ProfileScreen had a production crash from this — always place `useMemo`/`useEffect` before conditional returns.

**API error handling**: Most API calls use `.catch(() => {})` (silent). An `ErrorBoundary` component wraps the app for crash recovery, but individual API failures don't show user-facing errors yet.

**Auth data freshness**: `AuthContext` caches user data in localStorage. On bootstrap, it always refreshes the profile from the API to pick up fields that may have been added after the cache was written (e.g., `role`).

**Cloudinary uploads**: Profile photos use unsigned uploads via `src/services/cloudinary.js`. Requires an upload preset named `social_dilemmas` (unsigned) configured in the Cloudinary dashboard. Cloud name and preset come from `VITE_CLOUDINARY_*` env vars.

**Vite proxy**: `vite.config.js` proxies `/api/*` to NCB and strips `__Secure-`/`__Host-` prefixes from Set-Cookie headers so auth cookies work on localhost.

**NCB pagination**: Default page limit is **10 rows**. Any query that may return more must include `limit=500` (or appropriate value) in the filter string. Key queries in `api.js` already have this — always add it for new `getAll`-style reads.

**NCB `like:` filter is broken**: The `column=like:value` partial match filter does not work. Use client-side filtering instead (fetch all rows, then `.filter()` in JS). See `FriendsScreen.jsx` search for an example.

**NCB does NOT auto-create columns or tables**: Both CREATE and UPDATE reject unknown column names with `"Unknown column"` or `"Error creating record"` errors. New columns must be added via the NCB dashboard. New tables must also be created via the dashboard before any API operations.

**XP tracking**: The `recordXp(userId, xpAmount, user)` helper in `api.js` updates leaderboard entries for daily/weekly/season periods. Call it alongside any `authApi.updateUser(id, { xp })` call. It's already wired into `PlayScreen` (session complete) and `AuthContext` (daily login bonus).

**Friendships are bidirectional**: `getFriends(userId)` queries both `user_id=X` and `friend_id=X` directions, then deduplicates. `checkExisting(userId, friendId)` checks both directions before sending a new request. When extracting a friend's user ID from a friendship record, always check which side the current user is on: `f.user_id === userId ? f.friend_id : f.user_id`. The friendship status field is `record_status` (the actual DB column name) — values: `pending`, `accepted`, `rejected`.

**Friend enrichment pattern**: `getFriends()` returns raw friendship records, NOT user profiles. To display friend names/avatars, enrich them by fetching each friend's user profile with `auth.getUser(friendId)`. See `DirectScreen.jsx` and `FriendsScreen.jsx` for examples.

**Activity creation**: Create an activity record for every user-visible action (votes, featured answers, etc.) so the Feed page has content. Required fields: `actor_id`, `verb`, `object_type`, `object_id`, `context_text`, `visibility`, `is_deleted`, `created_at`. Note: the DB columns are `object_type`/`object_id`/`context_text` (NOT `target_type`/`target_id`/`description`). Always log errors with `.catch((err) => console.warn(...))` — never use silent `.catch(() => {})`.

**Badge field name compatibility**: `useAchievements.js` writes badges with BOTH field name formats (`badge_icon` + `icon`, `badge_color` + `color`, `badge_name` + `label`, etc.) because `ProfileScreen.jsx` reads the short names. Always use fallback chains when reading badge data: `badge.icon || badge.badge_icon`, `badge.color || badge.badge_color`, `badge.label || badge.badge_name`.

**Energy system**: Replaces the old daily play limit. Users have max 100 energy (`ENERGY_MAX`), spend 10 per dilemma (`ENERGY_PER_PLAY`), and regenerate +10/hour (`ENERGY_REGEN_PER_HOUR`). Energy is computed in real time from `energy_current` and `energy_last_update` fields on the user profile. `AuthContext` ticks regen every 60 seconds via interval. `spendEnergy()` deducts and persists to DB + localStorage. `refillEnergy()` is a test-only reset to max. PlayScreen gates `handleChoice()` on sufficient energy and shows a "Not Enough Energy" modal when depleted.

**Seasons**: Managed via Admin > Events tab. Only one season should be `active` at a time. The `leaderboards` table stores entries with `period_type=season` and `period_key=season-{id}`. The "All Time" leaderboard reads directly from the `users` table instead.

## NoCodeBackend (NCB) — How It Works

The entire backend is hosted on [NoCodeBackend](https://nocodebackend.com). There is no custom server — the app talks directly to NCB's REST API through a Vite dev proxy.

**Instance**: `53058_luxsocial`
**Host**: `https://app.nocodebackend.com`

### Data API Endpoints

All CRUD operations follow this pattern:

| Operation | Method | URL Pattern |
|-----------|--------|-------------|
| Read | `GET` | `/api/data/read/{table}?Instance=53058_luxsocial&filters...` |
| Create | `POST` | `/api/data/create/{table}?Instance=53058_luxsocial` |
| Update | `PUT` | `/api/data/update/{table}/{id}?Instance=53058_luxsocial` |
| Delete | `DELETE` | `/api/data/delete/{table}/{id}?Instance=53058_luxsocial` |

The `dataUrl(action, table, id?)` helper in `api.js` builds these URLs. Every request includes:
- Header `X-Database-Instance: 53058_luxsocial`
- Header `Content-Type: application/json`
- `credentials: 'include'` (for session cookies)

### Response Format

NCB wraps all responses in `{ status, data }`. The generic `request()` function in `api.js` unwraps this automatically — callers receive just the `data` portion. For reads that return arrays, `safeRead(table, filters)` returns `[]` on any error instead of throwing.

### Read Filters

Query string filters for reads: `column=value`, `column=like:partial`, `column=gt:N`, `column=lt:N`. Multiple filters chain with `&`. Example:
```
GET /api/data/read/votes?Instance=53058_luxsocial&user_id=abc-123&dilemma_id=42
```

### Authentication

NCB uses **Better-Auth** with session cookies. Key auth endpoints (via `authUrl()` helper):
- `GET /api/user-auth/get-session` — returns current session + user
- `POST /api/user-auth/sign-up/email` — register with `{ name, email, password }`
- `POST /api/user-auth/sign-in/email` — login with `{ email, password }`

Session cookies include `__Secure-` prefix in production. The Vite proxy strips this prefix so cookies work on `http://localhost` during development (see `transformCookie()` in `vite.config.js`).

### Vite Proxy Setup

In dev, all `/api/*` requests are proxied to `app.nocodebackend.com`:
- `/api/user-auth` — auth endpoints (cookie transform enabled)
- `/api/data` — data CRUD (cookie transform enabled)
- `/api/public-data` — public reads (no cookie transform needed)

In production (Netlify), a **Netlify Edge Function** (`netlify/edge-functions/api-proxy.js`) handles the same proxy + cookie transform. It intercepts all `/api/*` requests, forwards them to NCB, and strips `__Secure-`/`__Host-` prefixes and `Domain=` attributes from Set-Cookie headers. This is required because NCB sets `Domain=app.nocodebackend.com` and `SameSite=Lax` on cookies, which browsers reject on cross-origin requests.

**Important**: Direct API calls from the browser to `app.nocodebackend.com` do NOT work for auth — the cookies won't be sent cross-origin. Always use the proxy (relative `/api/*` paths).

## Deployment (Netlify)

- **Live URL**: https://luxsocial.netlify.app/
- **GitHub**: https://github.com/TomAlpha1337/LuxSocial

Hosted on Netlify via GitHub integration. Config in `netlify.toml`:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **SPA fallback**: `/* → /index.html` (200 rewrite)
- **API proxy**: Handled by edge function at `netlify/edge-functions/api-proxy.js` (not `_redirects`)

Deploy flow:
1. Push to GitHub → Netlify auto-builds
2. Edge function deploys alongside static files
3. `public/_redirects` only handles the SPA fallback

**Drag-and-drop deploys won't work** — edge functions require Git-connected or CLI deploys.

### Database Schema (24 Tables)

Full schema documented in **`NOCODEBACKEND_SCHEMA.md`** (985 lines). Key tables:

| Table | Purpose |
|-------|---------|
| `users` | User profiles (extends Better-Auth `user` table) |
| `dilemmas` | Questions with option_a/option_b text |
| `votes` | User answers: links user_id → dilemma_id with chosen option |
| `xp_transactions` | XP ledger: every point gain/spend with source + amount |
| `friendships` | Friend requests/connections with status field |
| `achievements` | Unlocked badges per user |
| `streaks` | Daily login streak tracking |
| `streak_freezes` | Freeze tokens to protect streaks |
| `events` | Time-limited events with XP multipliers |
| `seasons` | Seasonal leaderboard periods |
| `xp_levels` | 20-tier XP thresholds (seeded data) |
| `point_rules` | XP values for 20 action types (seeded data) |
| `milestones` | 26 achievement definitions (seeded data) |
| `activities` | Feed entries: actor + verb + target per user action |
| `leaderboards` | XP rankings by period (daily/weekly/season/all-time) |
| `direct_dilemmas` | 1v1 challenges between friends |

Tables must be created in a specific order due to foreign key dependencies — see `NOCODEBACKEND_SCHEMA.md` for the full creation order and relationship map.

### API Module Structure (`src/services/api.js`)

The API layer exports 20+ namespaced objects. Each provides CRUD methods for its table:

```js
import { auth, dilemmas, votes, friendships, ... } from './services/api';
// Named exports only — there is NO default export
dilemmas.getAll()
votes.create({ user_id, dilemma_id, chosen_option })
friendships.getFriends(userId)
```

Notable specialized methods:
- `auth.getSession()` / `auth.signUp()` / `auth.signIn()` / `auth.signOut()`
- `auth.getByEmail(email)` — looks up user profile in `users` table
- `dilemmas.getFeatured()` — fetches `is_featured=true` dilemmas
- `events.getActive()` — fetches events where status is `active`
- `seasons.getActive()` — fetches current active season
- `recordXp(userId, xpAmount, user)` — updates leaderboard entries for all active periods

## MCP Server (Model Context Protocol)

A custom MCP server (`mcp-server.js`) wraps the NCB Data API and exposes 7 database tools to AI assistants. Configured in `.mcp.json` — Claude Code auto-detects it on startup.

**Tools available**: `list_tables`, `read_records`, `create_record`, `update_record`, `delete_record`, `count_records`, `describe_table`

Configuration (`.mcp.json`):
```json
{
  "mcpServers": {
    "nocodebackend": {
      "command": "node",
      "args": ["mcp-server.js"],
      "env": { "NCB_INSTANCE": "53058_luxsocial" }
    }
  }
}
```

For full setup guide (including how to use this with new projects), see **`NOCODEBACKEND_MCP_GUIDE.md`**.

**MCP caveat**: The `count_records` tool hits NCB's default 10-row page limit and may undercount. For accurate counts, use `read_records` with `limit=2000` and count client-side, or query via the Vite proxy directly.

**MCP writes require auth**: The MCP server uses public API access (no auth cookies). It can read and create records, but cannot update or delete (NCB returns 403). For write operations, use the Vite proxy with authenticated session cookies (see `seed_questions.mjs` for an example pattern).

## Seed Scripts

- `seed_questions.mjs` — Batch 1: 379 "Would you rather" dilemmas across all categories
- `seed_questions_batch2.mjs` — Batch 2: 210 more dilemmas

Both scripts authenticate via the Vite dev proxy (`localhost:5179`) using test credentials, then insert questions with minimal fields (`question_text`, `option_a`, `option_b`, `category`, `record_status`). NCB rejects extra fields like `is_mystery`, `total_votes` etc. on insert — only send fields the table accepts.

## Environment Variables

Set in `.env` (not committed):
```
VITE_NCB_INSTANCE=53058_luxsocial
VITE_NCB_AUTH_URL=https://app.nocodebackend.com/api/user-auth
VITE_NCB_DATA_URL=https://app.nocodebackend.com/api/data
VITE_NCB_APP_URL=https://app.nocodebackend.com
VITE_CLOUDINARY_CLOUD_NAME=<cloud_name>
VITE_CLOUDINARY_UPLOAD_PRESET=<unsigned_preset_name>
```
