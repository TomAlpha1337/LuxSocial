# NoCodeBackend MCP Server — Universal Setup Guide

Connect AI assistants (Claude Code, Cursor, Windsurf, etc.) to any NoCodeBackend instance so they can directly read, create, update, and delete database records.

---

## Quick Start (3 steps)

### 1. Copy the MCP server file

Copy `mcp-server.js` into your project root. It has two dependencies:
- `@modelcontextprotocol/sdk` (MCP protocol)
- `zod` (schema validation, installed with the SDK)

```bash
npm install @modelcontextprotocol/sdk zod
```

### 2. Create `.mcp.json` in your project root

```json
{
  "mcpServers": {
    "nocodebackend": {
      "command": "node",
      "args": ["mcp-server.js"],
      "env": {
        "NCB_INSTANCE": "YOUR_INSTANCE_ID"
      }
    }
  }
}
```

Replace `YOUR_INSTANCE_ID` with your NoCodeBackend instance (e.g. `53058_luxsocial`).

### 3. Restart your AI tool

Claude Code, Cursor, etc. will detect `.mcp.json` on startup and launch the server automatically. You'll see the NCB tools appear in the tool list.

---

## What You Get — 7 Database Tools

| Tool | What it does |
|------|-------------|
| `list_tables` | Lists all known tables in the instance |
| `read_records` | Read records with optional filters (`column=value&column2=value2`) |
| `create_record` | Insert a new record (pass JSON data) |
| `update_record` | Update fields on an existing record by ID |
| `delete_record` | Delete a record by ID |
| `count_records` | Count records with optional filters |
| `describe_table` | Sample a table to show column names, types, and example values |

### Example Usage (what you'd ask the AI)

```
"Read all users from the database"
"Count how many active dilemmas we have"
"Describe the votes table schema"
"Create a new dilemma: 'Pizza or Sushi?' with options 'Pizza forever' and 'Sushi forever', category Food"
"Update user ID 1 to set role=admin"
"Delete record 42 from the notifications table"
```

---

## How NoCodeBackend's API Works

NCB is a hosted REST backend — no server code needed. Each project is an **instance** identified by an ID string.

### API Endpoints

All operations go through `https://app.nocodebackend.com`:

| Operation | Method | URL |
|-----------|--------|-----|
| **Read** | `GET` | `/api/data/read/{table}?Instance={id}` |
| **Create** | `POST` | `/api/data/create/{table}?Instance={id}` |
| **Update** | `PUT` | `/api/data/update/{table}/{record_id}?Instance={id}` |
| **Delete** | `DELETE` | `/api/data/delete/{table}/{record_id}?Instance={id}` |

Every request needs:
- Query param: `Instance=YOUR_INSTANCE_ID`
- Header: `X-Database-Instance: YOUR_INSTANCE_ID`
- Header: `Content-Type: application/json`

### Response Format

All responses are wrapped:
```json
{
  "status": "success",
  "data": [ ... ]    // array for reads, object for create/update
}
```

### Read Filters

Append filters as query params:
```
GET /api/data/read/users?Instance=xxx&role=admin
GET /api/data/read/dilemmas?Instance=xxx&category=Lifestyle&record_status=active
GET /api/data/read/votes?Instance=xxx&user_id=1&dilemma_id=3
```

Filter operators:
- `column=value` — exact match
- `column=like:partial` — contains text
- `column=gt:N` — greater than
- `column=lt:N` — less than

### Authentication (for apps)

NCB includes **Better-Auth** for user authentication:
- `POST /api/user-auth/sign-up/email` — `{ name, email, password }`
- `POST /api/user-auth/sign-in/email` — `{ email, password }`
- `GET /api/user-auth/get-session` — returns session + user
- `POST /api/user-auth/sign-out` — ends session

Auth uses session cookies with `credentials: 'include'` on fetch calls.

> **Note**: The MCP server does **not** use auth cookies — it accesses the Data API directly (which is open for the instance). This is fine for development and admin tools. For production apps, your frontend uses the auth flow.

---

## Development Proxy (Vite)

In development, proxy all `/api/*` requests to NCB so cookies work on localhost:

```js
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api/user-auth': {
        target: 'https://app.nocodebackend.com',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            // Strip __Secure- prefix from cookies for localhost
            const cookies = proxyRes.headers['set-cookie'];
            if (cookies) {
              proxyRes.headers['set-cookie'] = cookies.map(c =>
                c.replace('__Secure-', '').replace('__Host-', '')
                 .replace(/domain=[^;]+;?/gi, '')
                 .replace(/;\s*secure/gi, '')
              );
            }
          });
        },
      },
      '/api/data': {
        target: 'https://app.nocodebackend.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

---

## Frontend API Pattern (React Example)

```js
const NCB_INSTANCE = import.meta.env.VITE_NCB_INSTANCE || 'YOUR_INSTANCE_ID';
const NCB_DATA_URL = '/api/data';  // proxied in dev

function dataUrl(action, table, id) {
  const base = id
    ? `${NCB_DATA_URL}/${action}/${table}/${id}`
    : `${NCB_DATA_URL}/${action}/${table}`;
  return `${base}?Instance=${NCB_INSTANCE}`;
}

async function request(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Database-Instance': NCB_INSTANCE,
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!res.ok) throw new Error(`API Error ${res.status}`);
  const json = await res.json();
  // NCB wraps: { status: "success", data: [...] }
  return json?.status === 'success' ? json.data : json;
}

// CRUD helpers
const read    = (table, filters) => request(dataUrl('read', table) + (filters ? `&${filters}` : ''));
const create  = (table, body)    => request(dataUrl('create', table), { method: 'POST', body: JSON.stringify(body) });
const update  = (table, id, body)=> request(dataUrl('update', table, id), { method: 'PUT', body: JSON.stringify(body) });
const remove  = (table, id)      => request(dataUrl('delete', table, id), { method: 'DELETE' });

// Usage
const users = await read('users', 'role=admin');
const newPost = await create('posts', { title: 'Hello', content: 'World' });
await update('posts', newPost.id, { title: 'Updated' });
await remove('posts', newPost.id);
```

---

## Environment Variables

```env
# .env
VITE_NCB_INSTANCE=YOUR_INSTANCE_ID
VITE_NCB_AUTH_URL=https://app.nocodebackend.com/api/user-auth
VITE_NCB_DATA_URL=https://app.nocodebackend.com/api/data
VITE_NCB_APP_URL=https://app.nocodebackend.com
```

---

## Setting Up a New Project from Scratch

1. Go to [app.nocodebackend.com](https://app.nocodebackend.com) and create a new instance
2. Note your instance ID (shown in the dashboard URL or settings)
3. Create your tables in the NCB dashboard (or use the AI builder)
4. Copy `mcp-server.js` to your project
5. Create `.mcp.json` with your instance ID
6. Install deps: `npm install @modelcontextprotocol/sdk zod`
7. Start your AI tool — it now has full database access

Then just tell your AI assistant: *"Read the users table"* or *"Create a products table with name, price, and category columns"* — it handles the rest.

---

## Customizing the MCP Server

### Adding new tools

Open `mcp-server.js` and add tools using the pattern:

```js
server.tool(
  'tool_name',                    // unique name
  'Description of what it does',  // shown to AI
  {                               // input schema (zod)
    param: z.string().describe('What this param is'),
  },
  async ({ param }) => {          // handler
    // do something
    return { content: [{ type: 'text', text: 'result' }] };
  }
);
```

### Changing the instance at runtime

Set the `NCB_INSTANCE` env var in `.mcp.json`:

```json
{
  "mcpServers": {
    "nocodebackend": {
      "command": "node",
      "args": ["mcp-server.js"],
      "env": {
        "NCB_INSTANCE": "99999_my_other_project"
      }
    }
  }
}
```

### Multiple instances

You can run multiple MCP servers for different NCB instances:

```json
{
  "mcpServers": {
    "ncb-production": {
      "command": "node",
      "args": ["mcp-server.js"],
      "env": { "NCB_INSTANCE": "53058_luxsocial" }
    },
    "ncb-staging": {
      "command": "node",
      "args": ["mcp-server.js"],
      "env": { "NCB_INSTANCE": "53059_luxsocial_staging" }
    }
  }
}
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Cannot find module zod" | Run `npm install zod` |
| "Cannot find module @modelcontextprotocol/sdk" | Run `npm install @modelcontextprotocol/sdk` |
| Empty arrays returned | Table might not exist yet — create it in NCB dashboard first |
| 500 errors on create/update | Check that your JSON fields match the table columns |
| MCP server not detected | Restart your AI tool after adding `.mcp.json` |
| Tools work but auth doesn't | MCP server uses Data API (no auth). Auth is for your frontend app only. |

---

## File Checklist for New Projects

```
your-project/
├── .mcp.json              ← MCP server config (points to mcp-server.js)
├── mcp-server.js          ← MCP server (copy from this project)
├── .env                   ← NCB instance + other env vars
├── src/
│   └── services/
│       └── api.js         ← Frontend API layer (CRUD helpers)
└── vite.config.js         ← Dev proxy to NCB (if using Vite)
```
