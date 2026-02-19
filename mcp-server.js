#!/usr/bin/env node
// ============================================================
// NoCodeBackend MCP Server
// ============================================================
// Exposes NCB database operations as MCP tools so AI assistants
// (Claude Code, Cursor, etc.) can directly read/write tables.
//
// Usage:  node mcp-server.js
// Config: Set NCB_INSTANCE env var or defaults to 53058_luxsocial
// ============================================================

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const NCB_INSTANCE = process.env.NCB_INSTANCE || '53058_luxsocial';
const NCB_BASE = process.env.NCB_BASE_URL || 'https://app.nocodebackend.com';

// ── HTTP helpers ─────────────────────────────────────────────

function dataUrl(action, table, id) {
  const base = id
    ? `${NCB_BASE}/api/data/${action}/${table}/${id}`
    : `${NCB_BASE}/api/data/${action}/${table}`;
  return `${base}?Instance=${NCB_INSTANCE}`;
}

async function request(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Database-Instance': NCB_INSTANCE,
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`NCB API ${res.status}: ${text}`);
  }
  if (!text) return null;

  const json = JSON.parse(text);
  if (json && json.status === 'success' && json.data !== undefined) {
    return json.data;
  }
  return json;
}

// ── MCP Server ───────────────────────────────────────────────

const server = new McpServer({
  name: 'nocodebackend',
  version: '1.0.0',
});

// --- Tool: list_tables ---
server.tool(
  'list_tables',
  'List all tables in the NoCodeBackend instance. Returns table names.',
  {},
  async () => {
    try {
      // NCB doesn't have a dedicated "list tables" endpoint,
      // so we'll read from the schema endpoint or return known tables
      const url = `${NCB_BASE}/api/data/tables?Instance=${NCB_INSTANCE}`;
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'X-Database-Instance': NCB_INSTANCE,
        },
      });

      if (res.ok) {
        const text = await res.text();
        const json = JSON.parse(text);
        const tables = json.data || json;
        return { content: [{ type: 'text', text: JSON.stringify(tables, null, 2) }] };
      }

      // Fallback: return known tables from the schema
      const knownTables = [
        'users', 'dilemmas', 'votes', 'direct_dilemmas', 'friendships',
        'activities', 'reactions', 'comments', 'notifications', 'streaks',
        'streak_freezes', 'daily_counters', 'daily_logins', 'leaderboards',
        'milestones', 'user_milestones', 'badges', 'achievements',
        'seasons', 'events', 'shares', 'reports', 'blocks',
        'point_rules', 'xp_levels', 'xp_transactions',
        'sessions', 'session_dilemmas', 'featured_tracking',
      ];
      return {
        content: [{
          type: 'text',
          text: `NCB doesn't expose a table listing endpoint. Known tables for ${NCB_INSTANCE}:\n\n${knownTables.join('\n')}`,
        }],
      };
    } catch (err) {
      return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
    }
  }
);

// --- Tool: read_records ---
server.tool(
  'read_records',
  'Read records from a NoCodeBackend table. Supports optional filters like "column=value&column2=value2".',
  {
    table: z.string().describe('Table name (e.g. "users", "dilemmas", "votes")'),
    filters: z.string().optional().describe('Query filters as key=value pairs joined by &. Examples: "user_id=abc-123", "record_status=active", "category=lifestyle"'),
    limit: z.number().optional().describe('Max number of records to return (applied client-side)'),
  },
  async ({ table, filters, limit }) => {
    try {
      let url = dataUrl('read', table);
      if (filters) url += `&${filters}`;
      let data = await request(url, { method: 'GET' });
      if (limit && Array.isArray(data)) data = data.slice(0, limit);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `Error reading ${table}: ${err.message}` }], isError: true };
    }
  }
);

// --- Tool: create_record ---
server.tool(
  'create_record',
  'Create a new record in a NoCodeBackend table.',
  {
    table: z.string().describe('Table name'),
    data: z.string().describe('JSON string of the record to create. Example: {"name":"Test","category":"fun"}'),
  },
  async ({ table, data: dataStr }) => {
    try {
      const body = JSON.parse(dataStr);
      const result = await request(dataUrl('create', table), {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return { content: [{ type: 'text', text: `Created in ${table}:\n${JSON.stringify(result, null, 2)}` }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `Error creating in ${table}: ${err.message}` }], isError: true };
    }
  }
);

// --- Tool: update_record ---
server.tool(
  'update_record',
  'Update an existing record in a NoCodeBackend table by ID.',
  {
    table: z.string().describe('Table name'),
    id: z.string().describe('Record ID to update'),
    data: z.string().describe('JSON string of fields to update. Example: {"name":"Updated Name"}'),
  },
  async ({ table, id, data: dataStr }) => {
    try {
      const body = JSON.parse(dataStr);
      const result = await request(dataUrl('update', table, id), {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      return { content: [{ type: 'text', text: `Updated ${table}/${id}:\n${JSON.stringify(result, null, 2)}` }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `Error updating ${table}/${id}: ${err.message}` }], isError: true };
    }
  }
);

// --- Tool: delete_record ---
server.tool(
  'delete_record',
  'Delete a record from a NoCodeBackend table by ID.',
  {
    table: z.string().describe('Table name'),
    id: z.string().describe('Record ID to delete'),
  },
  async ({ table, id }) => {
    try {
      const result = await request(dataUrl('delete', table, id), { method: 'DELETE' });
      return { content: [{ type: 'text', text: `Deleted ${table}/${id}:\n${JSON.stringify(result, null, 2)}` }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `Error deleting ${table}/${id}: ${err.message}` }], isError: true };
    }
  }
);

// --- Tool: count_records ---
server.tool(
  'count_records',
  'Count records in a table (with optional filters).',
  {
    table: z.string().describe('Table name'),
    filters: z.string().optional().describe('Optional filters like "record_status=active"'),
  },
  async ({ table, filters }) => {
    try {
      let url = dataUrl('read', table);
      if (filters) url += `&${filters}`;
      const data = await request(url, { method: 'GET' });
      const count = Array.isArray(data) ? data.length : (data ? 1 : 0);
      return { content: [{ type: 'text', text: `${table}: ${count} record(s)${filters ? ` (filter: ${filters})` : ''}` }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `Error counting ${table}: ${err.message}` }], isError: true };
    }
  }
);

// --- Tool: describe_table ---
server.tool(
  'describe_table',
  'Read a few records from a table to infer its schema/columns. Returns field names and sample values.',
  {
    table: z.string().describe('Table name to describe'),
  },
  async ({ table }) => {
    try {
      const data = await request(dataUrl('read', table), { method: 'GET' });
      const rows = Array.isArray(data) ? data : (data ? [data] : []);
      if (rows.length === 0) {
        return { content: [{ type: 'text', text: `${table}: empty table (no records to infer schema from)` }] };
      }
      const sample = rows[0];
      const columns = Object.keys(sample).map(key => ({
        column: key,
        type: typeof sample[key],
        sample: String(sample[key]).slice(0, 100),
      }));
      return {
        content: [{
          type: 'text',
          text: `${table} — ${rows.length} total record(s), ${columns.length} columns:\n\n${columns.map(c => `  ${c.column} (${c.type}): ${c.sample}`).join('\n')}`,
        }],
      };
    } catch (err) {
      return { content: [{ type: 'text', text: `Error describing ${table}: ${err.message}` }], isError: true };
    }
  }
);

// ── Start ────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`[NCB MCP] Connected — instance: ${NCB_INSTANCE}`);
}

main().catch((err) => {
  console.error('[NCB MCP] Fatal:', err);
  process.exit(1);
});
