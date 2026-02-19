// LuxSocial — Row Level Security Setup Script
// Uses the @nocodebackend/mcp package to set RLS policies on all 24 tables

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const NCB_TOKEN = process.env.NCB_TOKEN || 'ncb_8bb785d0f6f3c17ce43caee59c4e819835b9e029f0967517';
const DATABASE = '53058_luxsocial';

// Define RLS policies for all 24 tables
// The set_rls_policy tool accepts comma-separated combinations like "shared_read,public_read"
const rlsPolicies = [
  // PUBLIC READ tables (anyone can browse + authenticated create/write)
  { table: 'dilemmas',        policy: 'shared_readwrite,public_read' },
  { table: 'activities',      policy: 'shared_readwrite,public_read' },
  { table: 'reactions',       policy: 'shared_readwrite,public_read' },
  { table: 'comments',        policy: 'shared_readwrite,public_read' },
  { table: 'leaderboards',    policy: 'shared_readwrite,public_read' },
  { table: 'milestones',      policy: 'shared_read,public_read' },
  { table: 'badges',          policy: 'shared_read,public_read' },
  { table: 'xp_levels',       policy: 'shared_read,public_read' },
  { table: 'seasons',         policy: 'shared_read,public_read' },
  { table: 'events',          policy: 'shared_read,public_read' },
  { table: 'point_rules',     policy: 'shared_read,public_read' },
  { table: 'users',           policy: 'shared_readwrite,public_read' },
  { table: 'user_milestones', policy: 'shared_read,public_read' },
  { table: 'streaks',         policy: 'shared_readwrite,public_read' },

  // AUTHENTICATED-ONLY tables
  { table: 'votes',            policy: 'shared_readwrite' },
  { table: 'friendships',      policy: 'shared_readwrite' },
  { table: 'direct_dilemmas',  policy: 'shared_readwrite' },
  { table: 'notifications',    policy: 'shared_readwrite' },
  { table: 'blocks',           policy: 'shared_readwrite' },
  { table: 'reports',          policy: 'shared_readwrite' },
  { table: 'daily_counters',   policy: 'shared_readwrite' },
  { table: 'sessions',         policy: 'shared_readwrite' },
  { table: 'session_dilemmas', policy: 'shared_readwrite' },
  { table: 'shares',           policy: 'shared_readwrite' },
];

async function main() {
  console.log('=== LuxSocial RLS Policy Setup ===\n');
  console.log(`Database instance: ${DATABASE}`);
  console.log(`Tables to configure: ${rlsPolicies.length}\n`);
  console.log('Starting NoCodeBackend MCP client...');

  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['@nocodebackend/mcp'],
    env: { ...process.env, NCB_TOKEN },
  });

  const client = new Client({ name: 'luxsocial-rls-setup', version: '1.0.0' });
  await client.connect(transport);
  console.log('Connected to MCP server.\n');

  // Step 1: Login
  console.log('--- Logging in ---');
  const loginResult = await client.callTool({ name: 'login', arguments: { token: NCB_TOKEN } });
  console.log('Login:', loginResult.content[0].text);

  // Step 2: Set RLS policies on all 24 tables
  console.log('\n--- Setting RLS policies on all 24 tables ---\n');

  let successCount = 0;
  let errorCount = 0;

  for (const { table, policy } of rlsPolicies) {
    try {
      const result = await client.callTool({
        name: 'set_rls_policy',
        arguments: {
          database: DATABASE,
          table: table,
          policy: policy,
        },
      });

      const text = result.content?.[0]?.text || JSON.stringify(result.content);
      const isError = text.toLowerCase().includes('error') || result.isError;

      if (isError) {
        console.error(`[FAIL] ${table} -> ${policy}: ${text}`);
        errorCount++;
      } else {
        console.log(`[OK]   ${table} -> ${policy}: ${text}`);
        successCount++;
      }
    } catch (e) {
      console.error(`[FAIL] ${table} -> ${policy}: ${e.message}`);
      errorCount++;
    }
  }

  // Summary
  console.log('\n========================================');
  console.log('            RLS Setup Summary            ');
  console.log('========================================');
  console.log(`Total tables:     ${rlsPolicies.length}`);
  console.log(`Successful:       ${successCount}`);
  console.log(`Failed:           ${errorCount}`);
  console.log('========================================');

  await client.close();
  console.log('\nDone!');
}

main().catch(console.error);
