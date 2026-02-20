// ============================================================
// Social Dilemma's — NoCodeBackend API Integration Layer
// ============================================================
// Instance: 53058_luxsocial
// Auth API: /api/user-auth
// Data API: /api/data
// ============================================================

const NCB_INSTANCE = import.meta.env.VITE_NCB_INSTANCE || '53058_luxsocial';
// Use relative paths — Vite proxy (dev) or Netlify edge function (prod) forwards to NCB
const NCB_DATA_URL = '/api/data';
const NCB_AUTH_URL = '/api/user-auth';

// ── NCB Data API endpoints ─────────────────────────────────
// Read:   GET  /api/data/read/{table}?Instance=xxx&filters...
// Create: POST /api/data/create/{table}?Instance=xxx
// Update: PUT  /api/data/update/{table}/{id}?Instance=xxx
// Delete: DELETE /api/data/delete/{table}/{id}?Instance=xxx

function dataUrl(action, table, id) {
  const base = id
    ? `${NCB_DATA_URL}/${action}/${table}/${id}`
    : `${NCB_DATA_URL}/${action}/${table}`;
  return `${base}?Instance=${NCB_INSTANCE}`;
}

function authUrl(path) {
  return `${NCB_AUTH_URL}/${path}?Instance=${NCB_INSTANCE}`;
}

// ── Generic fetch wrapper ──────────────────────────────────
async function request(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Database-Instance': NCB_INSTANCE,
    ...options.headers,
  };

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let message = '';
    if (text) {
      try {
        const json = JSON.parse(text);
        message = json.message || json.error || '';
      } catch {
        message = text;
      }
    }
    if (!message) {
      message = res.status === 500
        ? 'Server error — please check your input and try again.'
        : `API Error ${res.status}`;
    }
    throw new Error(message);
  }

  const text = await res.text();
  if (!text) return null;
  const json = JSON.parse(text);
  // NCB wraps data responses in { status, data, metadata }
  // Unwrap so callers get the data directly
  if (json && json.status === 'success' && json.data !== undefined) {
    return json.data;
  }
  return json;
}

// ── CRUD helpers ───────────────────────────────────────────
function read(table, filters = '') {
  const url = dataUrl('read', table) + (filters ? `&${filters}` : '');
  return request(url, { method: 'GET' });
}

// Resilient read: returns [] if table doesn't exist yet
function safeRead(table, filters) {
  return read(table, filters).catch(() => []);
}

function create(table, body) {
  return request(dataUrl('create', table), {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

function update(table, id, body) {
  return request(dataUrl('update', table, id), {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

function remove(table, id) {
  return request(dataUrl('delete', table, id), { method: 'DELETE' });
}

// ============================================================
// AUTH (NCB Better-Auth)
// ============================================================
export const auth = {
  signUp: (email, password, name) =>
    request(authUrl('sign-up/email'), {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),
  signIn: (email, password) =>
    request(authUrl('sign-in/email'), {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getSession: () => request(authUrl('get-session'), { method: 'GET' }),
  signOut: () =>
    request(authUrl('sign-out'), { method: 'POST', body: '{}' }),
  // App-level user profile (stored in users table)
  // These return a single object (first match) since id/email are unique
  getUser: (id) => read('users', `id=${id}`).then(r => Array.isArray(r) ? r[0] || null : r),
  getByEmail: (email) => read('users', `email=${email}`).then(r => Array.isArray(r) ? r[0] || null : r),
  searchByUsername: (query) => read('users', `username=${query}`),
  updateUser: (id, data) => update('users', id, data),
  createProfile: (data) => create('users', data),
};

// ============================================================
// DILEMMAS
// ============================================================
export const dilemmas = {
  getAll: () => read('dilemmas', 'record_status=active&limit=500'),
  getById: (id) => read('dilemmas', `id=${id}`),
  create: (data) => create('dilemmas', data),
  update: (id, data) => update('dilemmas', id, data),
  delete: (id) => update('dilemmas', id, { record_status: 'deleted' }),
  getByCategory: (cat) => read('dilemmas', `category=${cat}&record_status=active`),
  getFeatured: () => read('dilemmas', 'is_featured=1&record_status=active'),
  getMystery: () => read('dilemmas', 'is_mystery=1&record_status=active'),
};

// ============================================================
// VOTES
// ============================================================
export const votes = {
  cast: (data) => create('votes', data),
  getByUser: (userId) => read('votes', `user_id=${userId}&limit=500`),
  getByDilemma: (dilemmaId) => read('votes', `dilemma_id=${dilemmaId}`),
  check: (userId, dilemmaId) => read('votes', `user_id=${userId}&dilemma_id=${dilemmaId}`),
};

// ============================================================
// DIRECT DILEMMAS
// ============================================================
export const directDilemmas = {
  send: (data) => create('direct_dilemmas', data),
  getInbox: (userId) => read('direct_dilemmas', `receiver_id=${userId}&record_status=pending`),
  getSent: (userId) => read('direct_dilemmas', `sender_id=${userId}`),
  answer: (id, data) => update('direct_dilemmas', id, data),
  getById: (id) => read('direct_dilemmas', `id=${id}`),
};

// ============================================================
// FRIENDSHIPS
// ============================================================
export const friendships = {
  sendRequest: (data) => create('friendships', data),
  getRequests: (userId) => read('friendships', `friend_id=${userId}&status=pending`),
  getFriends: async (userId) => {
    const [sent, received] = await Promise.all([
      safeRead('friendships', `user_id=${userId}&status=accepted`),
      safeRead('friendships', `friend_id=${userId}&status=accepted`),
    ]);
    const map = new Map();
    [...(Array.isArray(sent) ? sent : []), ...(Array.isArray(received) ? received : [])]
      .forEach(f => map.set(f.id, f));
    return [...map.values()];
  },
  // Check if a friendship already exists between two users (either direction)
  checkExisting: async (userId, friendId) => {
    const [dir1, dir2] = await Promise.all([
      safeRead('friendships', `user_id=${userId}&friend_id=${friendId}`),
      safeRead('friendships', `user_id=${friendId}&friend_id=${userId}`),
    ]);
    const all = [
      ...(Array.isArray(dir1) ? dir1 : []),
      ...(Array.isArray(dir2) ? dir2 : []),
    ];
    // Return non-rejected friendships
    return all.filter(f => f.status !== 'rejected' && f.record_status !== 'rejected');
  },
  update: (id, data) => update('friendships', id, data),
  remove: (id) => remove('friendships', id),
};

// ============================================================
// ACTIVITIES (Feed)
// ============================================================
export const activities = {
  getFeed: () => read('activities', 'visibility=public&is_deleted=0&limit=100'),
  getFriendsFeed: (vis) => read('activities', `visibility=${vis}&is_deleted=0`),
  getByUser: (userId) => read('activities', `actor_id=${userId}&is_deleted=0`),
  create: (data) => create('activities', data),
  delete: (id) => update('activities', id, { is_deleted: 1 }),
};

// ============================================================
// REACTIONS & COMMENTS
// ============================================================
export const reactions = {
  add: (data) => create('reactions', data),
  getByActivity: (activityId) => read('reactions', `activity_id=${activityId}`),
  remove: (id) => remove('reactions', id),
};

export const comments = {
  add: (data) => create('comments', data),
  getByActivity: (activityId) => read('comments', `activity_id=${activityId}&is_deleted=0`),
  delete: (id) => update('comments', id, { is_deleted: 1 }),
};

// ============================================================
// NOTIFICATIONS
// ============================================================
export const notifications = {
  getAll: (userId) => read('notifications', `user_id=${userId}`),
  getUnread: (userId) => read('notifications', `user_id=${userId}&is_read=0`),
  markRead: (id) => update('notifications', id, { is_read: 1 }),
  create: (data) => create('notifications', data),
};

// ============================================================
// STREAKS
// ============================================================
export const streaks = {
  get: (userId) => safeRead('streaks', `user_id=${userId}`),
  update: (id, data) => update('streaks', id, data),
  create: (data) => create('streaks', data),
};

// ============================================================
// DAILY COUNTERS
// ============================================================
export const dailyCounters = {
  get: (userId, date) => read('daily_counters', `user_id=${userId}&counter_date=${date}`),
  create: (data) => create('daily_counters', data),
  update: (id, data) => update('daily_counters', id, data),
};

// ============================================================
// LEADERBOARDS
// ============================================================
export const leaderboards = {
  getDaily: (key) => read('leaderboards', `period_type=daily&period_key=${key}&limit=100`),
  getWeekly: (key) => read('leaderboards', `period_type=weekly&period_key=${key}&limit=100`),
  getSeason: (key) => read('leaderboards', `period_type=season&period_key=${key}&limit=100`),
  getOverall: () => read('leaderboards', 'period_type=overall&limit=100'),
  getByUserAndPeriod: (userId, periodType, periodKey) =>
    read('leaderboards', `user_id=${userId}&period_type=${periodType}&period_key=${periodKey}`),
  update: (id, data) => update('leaderboards', id, data),
  create: (data) => create('leaderboards', data),
};

// ── Leaderboard upsert helper ────────────────────────────
// Finds existing entry for user+period or creates one, then adds points.
async function upsertLeaderboard(userId, periodType, periodKey, pointsToAdd, username, avatarUrl) {
  try {
    const existing = await leaderboards.getByUserAndPeriod(userId, periodType, periodKey);
    const arr = Array.isArray(existing) ? existing : existing ? [existing] : [];
    if (arr.length > 0) {
      const entry = arr[0];
      await leaderboards.update(entry.id, {
        points: (entry.points || 0) + pointsToAdd,
        updated_at: new Date().toISOString(),
      });
    } else {
      await leaderboards.create({
        user_id: userId,
        period_type: periodType,
        period_key: periodKey,
        points: pointsToAdd,
        rank: 0,
        username: username || '',
        avatar_url: avatarUrl || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  } catch { /* non-critical */ }
}

// ── Record XP helper ─────────────────────────────────────
// Updates user XP and writes leaderboard entries for all active periods.
export async function recordXp(userId, xpAmount, user = {}) {
  if (!userId || !xpAmount) return;
  const now = new Date();
  const dailyKey = now.toISOString().slice(0, 10);
  // ISO week: YYYY-Www
  const jan4 = new Date(now.getFullYear(), 0, 4);
  const weekNum = Math.ceil(((now - jan4) / 86400000 + jan4.getDay() + 1) / 7);
  const weeklyKey = `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
  const username = user.username || user.name || '';
  const avatarUrl = user.avatar_url || '';

  // Write leaderboard entries (fire-and-forget)
  const promises = [
    upsertLeaderboard(userId, 'daily', dailyKey, xpAmount, username, avatarUrl),
    upsertLeaderboard(userId, 'weekly', weeklyKey, xpAmount, username, avatarUrl),
  ];

  // If there's an active season, write a season entry too
  try {
    const activeSeason = await seasons.getActive();
    const seasonArr = Array.isArray(activeSeason) ? activeSeason : activeSeason ? [activeSeason] : [];
    if (seasonArr.length > 0) {
      const s = seasonArr[0];
      promises.push(upsertLeaderboard(userId, 'season', `season-${s.id}`, xpAmount, username, avatarUrl));
    }
  } catch { /* no active season */ }

  await Promise.allSettled(promises);
}

// ============================================================
// MILESTONES & BADGES
// ============================================================
export const milestones = {
  getAll: () => read('milestones'),
  getUserMilestones: (userId) => read('user_milestones', `user_id=${userId}`),
  award: (data) => create('user_milestones', data),
};

export const badges = {
  getByUser: (userId) => read('badges', `user_id=${userId}`),
  award: (data) => create('badges', data),
};

// ============================================================
// SEASONS & EVENTS
// ============================================================
export const seasons = {
  getActive: () => read('seasons', 'status=active'),
  getAll: () => read('seasons', 'limit=50'),
  create: (data) => create('seasons', data),
  update: (id, data) => update('seasons', id, data),
};

export const events = {
  getActive: () => read('events', 'record_status=active'),
  getAll: () => read('events'),
  create: (data) => create('events', data),
  update: (id, data) => update('events', id, data),
};

// ============================================================
// SHARES
// ============================================================
export const shares = {
  create: (data) => create('shares', data),
  getByUser: (userId) => read('shares', `user_id=${userId}`),
  trackClick: (id, current) => update('shares', id, { clicks: current + 1 }),
};

// ============================================================
// REPORTS & BLOCKS
// ============================================================
export const reports = {
  create: (data) => create('reports', data),
  getAll: () => read('reports'),
  getPending: () => read('reports', 'record_status=pending'),
  update: (id, data) => update('reports', id, data),
};

export const blocks = {
  create: (data) => create('blocks', data),
  getByUser: (userId) => read('blocks', `blocker_id=${userId}`),
  remove: (id) => remove('blocks', id),
};

// ============================================================
// POINT RULES & XP LEVELS
// ============================================================
export const pointRules = {
  getAll: () => read('point_rules'),
};

export const xpLevels = {
  getAll: () => read('xp_levels'),
};

// ============================================================
// SESSIONS
// ============================================================
export const sessions = {
  get: (userId, date) => read('sessions', `user_id=${userId}&session_date=${date}`),
  create: (data) => create('sessions', data),
  update: (id, data) => update('sessions', id, data),
};

export const sessionDilemmas = {
  getBySession: (sessionId) => read('session_dilemmas', `session_id=${sessionId}`),
  add: (data) => create('session_dilemmas', data),
};

// ============================================================
// ADMIN (dashboard helpers)
// ============================================================
export const admin = {
  getStats: () => read('admin_stats'),
  getActivity: () => read('admin_activity'),
  getBannedUsers: () => read('users', 'is_banned=1'),
  getAllUsers: () => read('users', 'limit=500'),
  searchUsers: (query) => read('users', `username=${query}`),
  banUser: (id) => update('users', id, { is_banned: 1 }),
  unbanUser: (id) => update('users', id, { is_banned: 0 }),
  giveXP: (id, currentXP, amount) => update('users', id, { xp: currentXP + amount }),
  getAllVotes: () => read('votes', 'limit=500'),
  getAllDilemmas: () => read('dilemmas', 'limit=500'),
};

// ============================================================
// DAILY LOGINS -- NoCodeBackend (daily_logins table)
// ============================================================
export const dailyLogins = {
  getByUser: (userId) => safeRead('daily_logins', `user_id=${userId}`),
  getToday: (userId, date) => safeRead('daily_logins', `user_id=${userId}&login_date=${date}`),
  record: (data) => create('daily_logins', data),
  update: (id, data) => update('daily_logins', id, data),
};

// ============================================================
// ACHIEVEMENTS -- NoCodeBackend (achievements table)
// ============================================================
export const achievements = {
  getByUser: (userId) => safeRead('achievements', `user_id=${userId}`),
  getByBadge: (userId, badgeId) => safeRead('achievements', `user_id=${userId}&badge_id=${badgeId}`),
  award: (data) => create('achievements', {
    ...data,
    earned_at: new Date().toISOString(),
  }),
  updateProgress: (id, data) => update('achievements', id, data),
};

// ============================================================
// FEATURED TRACKING -- NoCodeBackend (featured_tracking table)
// ============================================================
export const featuredTracking = {
  check: (userId, date) => safeRead('featured_tracking', `user_id=${userId}&tracking_date=${date}`),
  record: (data) => create('featured_tracking', data),
};

// ============================================================
// STREAK FREEZES -- NoCodeBackend (streak_freezes table)
// ============================================================
export const streakFreezes = {
  getByUser: (userId) => safeRead('streak_freezes', `user_id=${userId}`),
  getThisWeek: (userId) => {
    const now = new Date();
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    const weekStart = monday.toISOString().slice(0, 10);
    return safeRead('streak_freezes', `user_id=${userId}&used_date_gte=${weekStart}`);
  },
  use: (data) => create('streak_freezes', data),
};
