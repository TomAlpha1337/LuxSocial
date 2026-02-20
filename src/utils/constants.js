// ============================================================
// Social Dilemma's — Constants & Configuration
// ============================================================

export const APP_NAME = "Social Dilemma's";
export const APP_TAGLINE = 'Choose. Compare. Connect.';

// Energy system
export const ENERGY_MAX = 100;
export const ENERGY_PER_PLAY = 10;
export const ENERGY_REGEN_PER_HOUR = 10;

// Point values (fallback if point_rules table is unavailable)
export const POINTS = {
  answer_dilemma: 10,
  answer_direct: 15,
  send_direct: 5,
  daily_streak: 20,
  streak_7: 100,
  streak_30: 500,
  receive_like: 2,
  receive_comment: 3,
  first_answer: 50,
  share_dilemma: 5,
  milestone_bonus: 50,
  create_dilemma: 10,
  friend_added: 5,
  badge_earned: 25,
  level_up: 100,
  event_multiplier: 2,
};

// XP levels (fallback)
export const XP_LEVELS = [
  { level: 1, xp: 0, title: 'Newcomer' },
  { level: 2, xp: 100, title: 'Curious' },
  { level: 3, xp: 250, title: 'Decider' },
  { level: 4, xp: 500, title: 'Thinker' },
  { level: 5, xp: 800, title: 'Explorer' },
  { level: 6, xp: 1200, title: 'Debater' },
  { level: 7, xp: 1700, title: 'Influencer' },
  { level: 8, xp: 2300, title: 'Trendsetter' },
  { level: 9, xp: 3000, title: 'Philosopher' },
  { level: 10, xp: 3800, title: 'Mastermind' },
  { level: 11, xp: 4800, title: 'Visionary' },
  { level: 12, xp: 6000, title: 'Oracle' },
  { level: 13, xp: 7500, title: 'Sage' },
  { level: 14, xp: 9200, title: 'Legend' },
  { level: 15, xp: 11200, title: 'Titan' },
  { level: 16, xp: 13500, title: 'Champion' },
  { level: 17, xp: 16200, title: 'Overlord' },
  { level: 18, xp: 19500, title: 'Sovereign' },
  { level: 19, xp: 23500, title: 'Immortal' },
  { level: 20, xp: 28000, title: 'Ascended' },
];

// Reaction types with emojis
export const REACTION_TYPES = {
  like: { emoji: '👍', label: 'Like' },
  fire: { emoji: '🔥', label: 'Fire' },
  wow: { emoji: '😮', label: 'Wow' },
  sad: { emoji: '😢', label: 'Sad' },
};

// Activity verbs
export const ACTIVITY_VERBS = {
  answered: 'answered a dilemma',
  asked: 'asked a dilemma',
  direct_sent: 'sent a direct dilemma',
  direct_answered: 'answered a direct dilemma',
  streak: 'is on a streak',
  badge: 'earned a badge',
  milestone: 'reached a milestone',
  friend_with: 'became friends with',
  leveled_up: 'leveled up',
};

// Dilemma categories
export const CATEGORIES = [
  'lifestyle', 'food', 'travel', 'relationships',
  'money', 'hypothetical', 'fun', 'deep', 'sport', 'tech', 'other',
];

// Share platforms
export const SHARE_PLATFORMS = ['whatsapp', 'instagram', 'twitter', 'link'];

// Notification types
export const NOTIFICATION_TYPES = [
  'friend_request', 'friend_accepted', 'direct_dilemma',
  'reaction', 'comment', 'milestone', 'badge', 'streak', 'system',
];

// ============================================================
// DAILY LOGIN BONUS
// ============================================================
// Day 1–6: 10 * day, Day 7: 100 XP, then cycle resets
export const DAILY_BONUS_XP = [10, 20, 30, 40, 50, 60, 100];

// ============================================================
// BADGE / ACHIEVEMENT DEFINITIONS
// ============================================================
export const BADGE_DEFINITIONS = {
  first_vote: {
    id: 'first_vote',
    name: 'First Vote',
    description: 'Answer your first dilemma',
    icon: 'Vote',
    color: '#00D4FF',
    rarity: 'common',
    condition: { type: 'total_votes', threshold: 1 },
  },
  on_fire: {
    id: 'on_fire',
    name: 'On Fire',
    description: '3-day login streak',
    icon: 'Flame',
    color: '#f97316',
    rarity: 'common',
    condition: { type: 'streak', threshold: 3 },
  },
  week_warrior: {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: '7-day login streak',
    icon: 'Shield',
    color: '#BF5AF2',
    rarity: 'rare',
    condition: { type: 'streak', threshold: 7 },
  },
  century_club: {
    id: 'century_club',
    name: 'Century Club',
    description: '100 total votes',
    icon: 'Trophy',
    color: '#00D4FF',
    rarity: 'epic',
    condition: { type: 'total_votes', threshold: 100 },
  },
  social_butterfly: {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Add 5 friends',
    icon: 'Users',
    color: '#FF2D78',
    rarity: 'rare',
    condition: { type: 'friends_count', threshold: 5 },
  },
  trendsetter: {
    id: 'trendsetter',
    name: 'Trendsetter',
    description: '10 votes where you are in the majority',
    icon: 'TrendingUp',
    color: '#39FF14',
    rarity: 'rare',
    condition: { type: 'majority_votes', threshold: 10 },
  },
  bold_move: {
    id: 'bold_move',
    name: 'Bold Move',
    description: '10 votes where you are in the minority',
    icon: 'Zap',
    color: '#EF4444',
    rarity: 'rare',
    condition: { type: 'minority_votes', threshold: 10 },
  },
  speed_demon: {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Answer 10 dilemmas in one session',
    icon: 'Rocket',
    color: '#FF6B35',
    rarity: 'rare',
    condition: { type: 'session_votes', threshold: 10 },
  },
  night_owl: {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Vote after midnight',
    icon: 'Moon',
    color: '#BF5AF2',
    rarity: 'common',
    condition: { type: 'time_range', start: 0, end: 5 },
  },
  early_bird: {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Vote before 7am',
    icon: 'Sunrise',
    color: '#FF6B35',
    rarity: 'common',
    condition: { type: 'time_range', start: 5, end: 7 },
  },
};

// Badge rarity tiers for display styling
export const BADGE_RARITY = {
  common: { label: 'Common', glow: 'rgba(148,163,184,0.3)', border: '#64748b' },
  rare: { label: 'Rare', glow: 'rgba(191,90,242,0.4)', border: '#BF5AF2' },
  epic: { label: 'Epic', glow: 'rgba(0,212,255,0.4)', border: '#00D4FF' },
  legendary: { label: 'Legendary', glow: 'rgba(239,68,68,0.5)', border: '#EF4444' },
};

// ============================================================
// STREAK MILESTONES & REWARDS
// ============================================================
export const STREAK_MILESTONES = {
  3:   { xp: 50,   label: 'Hot Start',       emoji: '\u{1F525}' },
  7:   { xp: 150,  label: 'Week Warrior',     emoji: '\u{1F6E1}\uFE0F' },
  14:  { xp: 500,  label: 'Two-Week Titan',   emoji: '\u{26A1}' },
  30:  { xp: 1500, label: 'Monthly Master',   emoji: '\u{1F451}' },
  60:  { xp: 3000, label: 'Unstoppable',      emoji: '\u{1F680}' },
  100: { xp: 5000, label: 'Legendary Streak', emoji: '\u{1F3C6}' },
};

// Streak freeze: user gets 1 free freeze per week
export const STREAK_FREEZE_PER_WEEK = 1;

// Featured Question of the Day XP multiplier
export const FEATURED_XP_MULTIPLIER = 2;
