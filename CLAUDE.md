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
- **`src/context/AuthContext.jsx`** — App-wide user state via React Context. Handles session bootstrap, localStorage caching (with background API refresh to keep fields like `role` current), daily login bonus calculation, and streak tracking. Access via `useAuth()` hook.
- **`src/utils/constants.js`** — Game configuration: point values, XP levels (20 tiers), badge definitions, streak milestones, daily bonus schedule. These are fallback values; some may be overridden by NCB tables.
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

In production, configure your hosting to proxy or redirect these paths to `app.nocodebackend.com`, or update the base URLs in `api.js` to use the full NCB domain.

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

Tables must be created in a specific order due to foreign key dependencies — see `NOCODEBACKEND_SCHEMA.md` for the full creation order and relationship map.

### API Module Structure (`src/services/api.js`)

The API layer exports 20+ namespaced objects. Each provides CRUD methods for its table:

```js
import API, { auth, dilemmas, votes, friendships, ... } from './services/api';
// or
API.dilemmas.getAll()
API.votes.create({ user_id, dilemma_id, chosen_option })
API.friendships.getByUser(userId)
```

Notable specialized methods:
- `auth.getSession()` / `auth.signUp()` / `auth.signIn()` / `auth.signOut()`
- `auth.getByEmail(email)` — looks up user profile in `users` table
- `dilemmas.getFeatured()` — fetches `is_featured=true` dilemmas
- `leaderboard.getTop(limit)` — reads `users` sorted by XP descending
- `events.getActive()` — fetches events where status is `active`

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
