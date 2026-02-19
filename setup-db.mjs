// LuxSocial — NoCodeBackend Database Setup Script
// Uses the @nocodebackend/mcp package to create the database

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const NCB_TOKEN = process.env.NCB_TOKEN || 'ncb_8bb785d0f6f3c17ce43caee59c4e819835b9e029f0967517';

async function main() {
  console.log('Starting NoCodeBackend MCP client...');

  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['@nocodebackend/mcp'],
    env: { ...process.env, NCB_TOKEN },
  });

  const client = new Client({ name: 'luxsocial-setup', version: '1.0.0' });
  await client.connect(transport);
  console.log('Connected to MCP server.');

  // Step 1: Login
  console.log('\n--- Logging in ---');
  const loginResult = await client.callTool({ name: 'login', arguments: { token: NCB_TOKEN } });
  console.log('Login:', loginResult.content[0].text);

  // Step 2: Create LuxSocial database
  // NOTE: Renamed MySQL reserved keywords:
  //   status → record_status
  //   type → reaction_type / notification_type
  //   rank → position
  console.log('\n--- Creating LuxSocial database (24 tables) ---');

  const schema = {
    name: 'LuxSocial',
    tables: [
      {
        name: 'users',
        columns: [
          { name: 'username', type: 'varchar' },
          { name: 'email', type: 'varchar' },
          { name: 'password_hash', type: 'password' },
          { name: 'avatar_url', type: 'varchar' },
          { name: 'bio', type: 'varchar' },
          { name: 'profile_visibility', type: 'varchar' },
          { name: 'role', type: 'varchar' },
          { name: 'xp', type: 'int' },
          { name: 'level', type: 'int' },
          { name: 'current_streak', type: 'int' },
          { name: 'best_streak', type: 'int' },
          { name: 'season_points', type: 'int' },
          { name: 'total_points', type: 'int' },
          { name: 'record_status', type: 'varchar' },
          { name: 'created_at', type: 'datetime' },
          { name: 'updated_at', type: 'datetime' }
        ]
      },
      {
        name: 'friendships',
        columns: [
          { name: 'user_id', type: 'int' },
          { name: 'friend_id', type: 'int' },
          { name: 'record_status', type: 'varchar' },
          { name: 'requested_at', type: 'datetime' },
          { name: 'accepted_at', type: 'datetime' }
        ]
      },
      {
        name: 'blocks',
        columns: [
          { name: 'blocker_id', type: 'int' },
          { name: 'blocked_id', type: 'int' },
          { name: 'created_at', type: 'datetime' }
        ]
      },
      {
        name: 'dilemmas',
        columns: [
          { name: 'question_text', type: 'varchar' },
          { name: 'option_a', type: 'varchar' },
          { name: 'option_b', type: 'varchar' },
          { name: 'category', type: 'varchar' },
          { name: 'created_by', type: 'int' },
          { name: 'is_mystery', type: 'int' },
          { name: 'is_featured', type: 'int' },
          { name: 'record_status', type: 'varchar' },
          { name: 'votes_a_count', type: 'int' },
          { name: 'votes_b_count', type: 'int' },
          { name: 'total_votes', type: 'int' },
          { name: 'created_at', type: 'datetime' }
        ]
      },
      {
        name: 'votes',
        columns: [
          { name: 'user_id', type: 'int' },
          { name: 'dilemma_id', type: 'int' },
          { name: 'chosen_option', type: 'varchar' },
          { name: 'voted_at', type: 'datetime' }
        ]
      },
      {
        name: 'direct_dilemmas',
        columns: [
          { name: 'sender_id', type: 'int' },
          { name: 'receiver_id', type: 'int' },
          { name: 'question_text', type: 'varchar' },
          { name: 'option_a', type: 'varchar' },
          { name: 'option_b', type: 'varchar' },
          { name: 'sender_choice', type: 'varchar' },
          { name: 'receiver_choice', type: 'varchar' },
          { name: 'record_status', type: 'varchar' },
          { name: 'visibility', type: 'varchar' },
          { name: 'expires_at', type: 'datetime' },
          { name: 'created_at', type: 'datetime' }
        ]
      },
      {
        name: 'activities',
        columns: [
          { name: 'actor_id', type: 'int' },
          { name: 'verb', type: 'varchar' },
          { name: 'object_type', type: 'varchar' },
          { name: 'object_id', type: 'int' },
          { name: 'context_text', type: 'varchar' },
          { name: 'visibility', type: 'varchar' },
          { name: 'reaction_count', type: 'int' },
          { name: 'comment_count', type: 'int' },
          { name: 'is_deleted', type: 'int' },
          { name: 'created_at', type: 'datetime' }
        ]
      },
      {
        name: 'reactions',
        columns: [
          { name: 'user_id', type: 'int' },
          { name: 'activity_id', type: 'int' },
          { name: 'reaction_type', type: 'varchar' },
          { name: 'created_at', type: 'datetime' }
        ]
      },
      {
        name: 'comments',
        columns: [
          { name: 'user_id', type: 'int' },
          { name: 'activity_id', type: 'int' },
          { name: 'body', type: 'varchar' },
          { name: 'is_deleted', type: 'int' },
          { name: 'created_at', type: 'datetime' }
        ]
      },
      {
        name: 'notifications',
        columns: [
          { name: 'user_id', type: 'int' },
          { name: 'notification_type', type: 'varchar' },
          { name: 'title', type: 'varchar' },
          { name: 'body', type: 'varchar' },
          { name: 'is_read', type: 'int' },
          { name: 'reference_type', type: 'varchar' },
          { name: 'reference_id', type: 'int' },
          { name: 'created_at', type: 'datetime' }
        ]
      },
      {
        name: 'streaks',
        columns: [
          { name: 'user_id', type: 'int' },
          { name: 'current_streak', type: 'int' },
          { name: 'best_streak', type: 'int' },
          { name: 'last_activity_date', type: 'datetime' },
          { name: 'streak_saver_available', type: 'int' },
          { name: 'streak_saver_used_date', type: 'datetime' },
          { name: 'updated_at', type: 'datetime' }
        ]
      },
      {
        name: 'daily_counters',
        columns: [
          { name: 'user_id', type: 'int' },
          { name: 'counter_date', type: 'datetime' },
          { name: 'plays_used', type: 'int' },
          { name: 'plays_limit', type: 'int' },
          { name: 'bonus_plays', type: 'int' },
          { name: 'created_at', type: 'datetime' }
        ]
      },
      {
        name: 'sessions',
        columns: [
          { name: 'user_id', type: 'int' },
          { name: 'session_date', type: 'datetime' },
          { name: 'dilemmas_answered_count', type: 'int' },
          { name: 'xp_earned', type: 'int' },
          { name: 'created_at', type: 'datetime' }
        ]
      },
      {
        name: 'session_dilemmas',
        columns: [
          { name: 'session_id', type: 'int' },
          { name: 'dilemma_id', type: 'int' },
          { name: 'answered_at', type: 'datetime' }
        ]
      },
      {
        name: 'leaderboards',
        columns: [
          { name: 'user_id', type: 'int' },
          { name: 'period_type', type: 'varchar' },
          { name: 'period_key', type: 'varchar' },
          { name: 'points', type: 'int' },
          { name: 'position', type: 'int' },
          { name: 'created_at', type: 'datetime' },
          { name: 'updated_at', type: 'datetime' }
        ]
      },
      {
        name: 'milestones',
        columns: [
          { name: 'name', type: 'varchar' },
          { name: 'description', type: 'varchar' },
          { name: 'threshold', type: 'int' },
          { name: 'milestone_type', type: 'varchar' },
          { name: 'points_reward', type: 'int' },
          { name: 'badge_icon', type: 'varchar' },
          { name: 'created_at', type: 'datetime' }
        ]
      },
      {
        name: 'user_milestones',
        columns: [
          { name: 'user_id', type: 'int' },
          { name: 'milestone_id', type: 'int' },
          { name: 'achieved_at', type: 'datetime' }
        ]
      },
      {
        name: 'badges',
        columns: [
          { name: 'user_id', type: 'int' },
          { name: 'badge_name', type: 'varchar' },
          { name: 'badge_icon', type: 'varchar' },
          { name: 'source', type: 'varchar' },
          { name: 'earned_at', type: 'datetime' }
        ]
      },
      {
        name: 'xp_levels',
        columns: [
          { name: 'level', type: 'int' },
          { name: 'xp_required', type: 'int' },
          { name: 'title', type: 'varchar' }
        ]
      },
      {
        name: 'seasons',
        columns: [
          { name: 'name', type: 'varchar' },
          { name: 'start_date', type: 'datetime' },
          { name: 'end_date', type: 'datetime' },
          { name: 'record_status', type: 'varchar' },
          { name: 'created_at', type: 'datetime' }
        ]
      },
      {
        name: 'events',
        columns: [
          { name: 'name', type: 'varchar' },
          { name: 'description', type: 'varchar' },
          { name: 'event_type', type: 'varchar' },
          { name: 'multiplier', type: 'float' },
          { name: 'start_date', type: 'datetime' },
          { name: 'end_date', type: 'datetime' },
          { name: 'record_status', type: 'varchar' },
          { name: 'created_at', type: 'datetime' }
        ]
      },
      {
        name: 'shares',
        columns: [
          { name: 'user_id', type: 'int' },
          { name: 'dilemma_id', type: 'int' },
          { name: 'platform', type: 'varchar' },
          { name: 'share_url', type: 'varchar' },
          { name: 'clicks', type: 'int' },
          { name: 'installs', type: 'int' },
          { name: 'created_at', type: 'datetime' }
        ]
      },
      {
        name: 'reports',
        columns: [
          { name: 'reporter_id', type: 'int' },
          { name: 'reported_user_id', type: 'int' },
          { name: 'content_type', type: 'varchar' },
          { name: 'content_id', type: 'int' },
          { name: 'reason', type: 'varchar' },
          { name: 'record_status', type: 'varchar' },
          { name: 'resolution', type: 'varchar' },
          { name: 'reviewed_by', type: 'int' },
          { name: 'created_at', type: 'datetime' },
          { name: 'reviewed_at', type: 'datetime' }
        ]
      },
      {
        name: 'point_rules',
        columns: [
          { name: 'action_type', type: 'varchar' },
          { name: 'points_awarded', type: 'int' },
          { name: 'description', type: 'varchar' }
        ]
      }
    ]
  };

  try {
    const result = await client.callTool({
      name: 'create_database',
      arguments: schema
    });
    console.log('Create database result:', JSON.stringify(result, null, 2));
  } catch (e) {
    console.error('Create database error:', e.message);
  }

  // Verify by getting schema
  console.log('\n--- Verifying schema ---');
  try {
    const schemaResult = await client.callTool({
      name: 'get_schema',
      arguments: { database: 'LuxSocial' }
    });
    console.log('Schema:', JSON.stringify(schemaResult, null, 2));
  } catch (e) {
    console.log('Schema check error:', e.message);
  }

  // Get the Swagger/API info
  console.log('\n--- Getting API info ---');
  try {
    const swaggerResult = await client.callTool({
      name: 'get_swagger',
      arguments: { database: 'LuxSocial' }
    });
    console.log('Swagger:', JSON.stringify(swaggerResult, null, 2));
  } catch (e) {
    console.log('Swagger error:', e.message);
  }

  // List databases to confirm
  console.log('\n--- Listing databases ---');
  try {
    const dbs = await client.callTool({ name: 'list_databases', arguments: {} });
    console.log('Databases:', JSON.stringify(dbs, null, 2));
  } catch (e) {
    console.log('List error:', e.message);
  }

  await client.close();
  console.log('\nDone!');
}

main().catch(console.error);
