import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, UserPlus, MessageCircle, Trophy, Flame, Star,
  CheckCheck, BellOff, Sparkles, Heart, Award, Shield,
  TrendingUp, Zap, Crown, Gift,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notifications as notificationsApi } from '../services/api';

// ── Keyframes ───────────────────────────────────────────────
const keyframesId = 'lux-notif-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(keyframesId)) {
  const style = document.createElement('style');
  style.id = keyframesId;
  style.textContent = `
    @keyframes notifSlideIn {
      from { opacity: 0; transform: translateX(-12px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes bellSwing {
      0%, 100% { transform: rotate(0deg); }
      15% { transform: rotate(14deg); }
      30% { transform: rotate(-12deg); }
      45% { transform: rotate(8deg); }
      60% { transform: rotate(-6deg); }
      75% { transform: rotate(3deg); }
    }
    @keyframes bellRing {
      0%, 100% { transform: rotate(0deg) scale(1); }
      10% { transform: rotate(15deg) scale(1.1); }
      20% { transform: rotate(-13deg) scale(1.1); }
      30% { transform: rotate(10deg) scale(1.05); }
      40% { transform: rotate(-8deg) scale(1.05); }
      50% { transform: rotate(5deg) scale(1); }
    }
    @keyframes unreadGlow {
      0%, 100% { box-shadow: 0 0 0 0 rgba(0,212,255,0), border-color: rgba(0,212,255,0.15); }
      50% { box-shadow: 0 0 16px 2px rgba(0,212,255,0.06); border-color: rgba(0,212,255,0.25); }
    }
    @keyframes readFade {
      0% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(0.98); }
      100% { opacity: 0.55; transform: scale(1); }
    }
    @keyframes iconPop {
      0% { transform: scale(0.5) rotate(-20deg); opacity: 0; }
      60% { transform: scale(1.15) rotate(5deg); opacity: 1; }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    @keyframes dotPulse {
      0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0,212,255,0.6); }
      50% { transform: scale(1.2); box-shadow: 0 0 8px 3px rgba(0,212,255,0.2); }
    }
    @keyframes markAllRipple {
      0% { box-shadow: 0 0 0 0 rgba(0,212,255,0.3); }
      100% { box-shadow: 0 0 0 12px rgba(0,212,255,0); }
    }
    @keyframes confetti {
      0% { opacity: 1; transform: translateY(0) rotate(0deg); }
      100% { opacity: 0; transform: translateY(-30px) rotate(180deg); }
    }
    @keyframes shimmerBg {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `;
  document.head.appendChild(style);
}

// ── Notification type configuration with proper accents ─────
const NOTIF_TYPE_MAP = {
  'friend_request':  { icon: UserPlus,       color: '#3B82F6', bg: 'rgba(59,130,246,0.10)',  borderAccent: 'rgba(59,130,246,0.25)',  label: 'Friend Request' },
  'friend_accepted': { icon: Heart,          color: '#FF2D78', bg: 'rgba(255,45,120,0.10)',  borderAccent: 'rgba(255,45,120,0.25)',  label: 'Friend' },
  'direct_dilemma':  { icon: MessageCircle,  color: '#00D4FF', bg: 'rgba(0,212,255,0.10)',   borderAccent: 'rgba(0,212,255,0.25)',   label: 'Dilemma' },
  'reaction':        { icon: Heart,          color: '#FF2D78', bg: 'rgba(255,45,120,0.10)',  borderAccent: 'rgba(255,45,120,0.25)',  label: 'Reaction' },
  'comment':         { icon: MessageCircle,  color: '#00D4FF', bg: 'rgba(0,212,255,0.10)',   borderAccent: 'rgba(0,212,255,0.25)',   label: 'Comment' },
  'milestone':       { icon: Trophy,         color: '#00D4FF', bg: 'rgba(0,212,255,0.10)',   borderAccent: 'rgba(0,212,255,0.25)',   label: 'Milestone' },
  'badge':           { icon: Award,          color: '#00D4FF', bg: 'rgba(0,212,255,0.10)',   borderAccent: 'rgba(0,212,255,0.25)',   label: 'Achievement' },
  'streak':          { icon: Flame,          color: '#F97316', bg: 'rgba(249,115,22,0.10)',  borderAccent: 'rgba(249,115,22,0.25)',  label: 'Streak' },
  'level_up':        { icon: Crown,          color: '#BF5AF2', bg: 'rgba(191,90,242,0.10)',  borderAccent: 'rgba(191,90,242,0.25)',  label: 'Level Up' },
  'system':          { icon: Bell,           color: '#00D4FF', bg: 'rgba(0,212,255,0.10)',   borderAccent: 'rgba(0,212,255,0.25)',   label: 'System' },
  'vote_result':     { icon: TrendingUp,     color: '#00D4FF', bg: 'rgba(0,212,255,0.10)',   borderAccent: 'rgba(0,212,255,0.25)',   label: 'Vote Result' },
};

// Fallback icon map for icon field on notification objects
const ICON_FALLBACK = {
  'bell':            'system',
  'user-plus':       'friend_request',
  'message-circle':  'direct_dilemma',
  'trophy':          'milestone',
  'flame':           'streak',
  'star':            'badge',
  'heart':           'reaction',
  'award':           'badge',
  'crown':           'level_up',
  'trending-up':     'vote_result',
};

function getNotifConfig(item) {
  // Try type field first
  if (item.type && NOTIF_TYPE_MAP[item.type]) return NOTIF_TYPE_MAP[item.type];
  // Fallback to icon field
  if (item.icon && ICON_FALLBACK[item.icon]) return NOTIF_TYPE_MAP[ICON_FALLBACK[item.icon]];
  // Default
  return NOTIF_TYPE_MAP['system'];
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

function getTimeGroup(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart - 86400000);
  if (d >= todayStart) return 'Today';
  if (d >= yesterdayStart) return 'Yesterday';
  return 'Earlier';
}

function groupByTime(items) {
  const groups = { Today: [], Yesterday: [], Earlier: [] };
  items.forEach((item) => {
    const group = getTimeGroup(item.created_at);
    groups[group].push(item);
  });
  return groups;
}

// ── Styles ──────────────────────────────────────────────────
const s = {
  page: {
    minHeight: '100vh',
    background: '#0a0a0f',
    fontFamily: "'Inter', sans-serif",
    color: '#fff',
    paddingBottom: 40,
    position: 'relative',
    overflow: 'hidden',
  },
  bgGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    background: 'radial-gradient(ellipse at 30% -10%, rgba(191,90,242,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 5%, rgba(0,212,255,0.05) 0%, transparent 50%)',
    pointerEvents: 'none',
  },

  /* ── Header ────────────────────────────────── */
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '36px 20px 0',
    position: 'relative',
    zIndex: 2,
  },
  titleWrap: {
    display: 'flex',
    flexDirection: 'column',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  bellContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    background: 'linear-gradient(135deg, rgba(0,212,255,0.12), rgba(255,165,0,0.06))',
    border: '1px solid rgba(0,212,255,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    background: '#ef4444',
    color: '#fff',
    fontSize: 10,
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 5px',
    boxShadow: '0 0 8px rgba(239,68,68,0.4)',
    border: '2px solid #0a0a0f',
  },
  title: {
    fontSize: 28,
    fontWeight: 900,
    margin: 0,
    background: 'linear-gradient(135deg, #00D4FF 0%, #FF2D78 40%, #00D4FF 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    marginTop: 8,
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontWeight: 600,
  },

  /* ── Mark All Read ─────────────────────────── */
  markAllBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    padding: '10px 16px',
    borderRadius: 12,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.25s',
    fontFamily: "'Inter', sans-serif",
    flexShrink: 0,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  markAllBtnActive: {
    borderColor: 'rgba(0,212,255,0.2)',
    color: '#00D4FF',
    background: 'rgba(0,212,255,0.05)',
  },

  /* ── Unread Counter ────────────────────────── */
  unreadCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    padding: '16px 20px 0',
    position: 'relative',
    zIndex: 2,
    fontWeight: 500,
    maxWidth: 520,
    margin: '0 auto',
  },
  caughtUp: {
    color: '#22c55e',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  },

  /* ── Time Group Headers ────────────────────── */
  groupHeader: {
    fontSize: 11,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.3)',
    textTransform: 'uppercase',
    letterSpacing: 2,
    padding: '18px 4px 10px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  groupLine: {
    flex: 1,
    height: 1,
    background: 'rgba(255,255,255,0.04)',
  },

  /* ── List ───────────────────────────────────── */
  list: {
    padding: '10px 16px 0',
    maxWidth: 520,
    margin: '0 auto',
    position: 'relative',
    zIndex: 2,
  },

  /* ── Notification Item ─────────────────────── */
  item: {
    display: 'flex',
    gap: 14,
    padding: '16px 18px',
    borderRadius: 16,
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.04)',
    marginBottom: 10,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
  },
  itemUnread: {
    background: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(0,212,255,0.12)',
    animation: 'unreadGlow 3s ease-in-out infinite',
  },
  itemRead: {
    opacity: 0.55,
  },
  itemShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },

  /* ── Icon ───────────────────────────────────── */
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    position: 'relative',
  },
  iconInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── Content ────────────────────────────────── */
  content: {
    flex: 1,
    minWidth: 0,
  },
  itemTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  itemTitle: {
    fontWeight: 700,
    fontSize: 14,
    color: '#fff',
  },
  itemTypeBadge: {
    fontSize: 9,
    fontWeight: 700,
    padding: '2px 7px',
    borderRadius: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  itemBody: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 1.5,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  itemTime: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.2)',
    marginTop: 5,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },

  /* ── Unread Dot ─────────────────────────────── */
  unreadDot: {
    position: 'absolute',
    top: 20,
    right: 16,
    width: 9,
    height: 9,
    borderRadius: '50%',
    background: '#00D4FF',
    animation: 'dotPulse 2s ease-in-out infinite',
  },

  /* ── Empty State ────────────────────────────── */
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    color: 'rgba(255,255,255,0.35)',
  },
  emptyIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 28,
    background: 'rgba(34,197,94,0.04)',
    border: '1px solid rgba(34,197,94,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
  },
  emptyCheck: {
    fontSize: 36,
    marginBottom: 4,
  },
};

// ── Component ───────────────────────────────────────────────
export default function NotificationsScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = user?.id;

  useEffect(() => {
    if (userId) loadNotifications();
  }, [userId]);

  async function loadNotifications() {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await notificationsApi.getAll(userId);
      const data = Array.isArray(res) ? res : res ? [res] : [];
      setItems(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) {
      console.warn('[NCB]', err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  function handleMarkAllRead() {
    setItems((prev) =>
      prev.map((item) => ({ ...item, is_read: true }))
    );
    // Fire API calls
    items
      .filter((item) => !item.is_read)
      .forEach((item) => {
        notificationsApi.markRead(item.id).catch((err) => console.warn('[NCB]', err.message));
      });
  }

  function handleMarkRead(id) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_read: true } : item))
    );
    notificationsApi.markRead(id).catch((err) => console.warn('[NCB]', err.message));
  }

  const unreadCount = items.filter((item) => !item.is_read).length;
  const grouped = groupByTime(items);

  return (
    <div style={s.page}>
      {/* Background glow */}
      <div style={s.bgGlow} />

      {/* Header */}
      <div style={s.header}>
        <div style={s.titleWrap}>
          <div style={s.titleRow}>
            {/* Animated Bell */}
            <motion.div
              style={s.bellContainer}
              animate={unreadCount > 0 ? {
                rotate: [0, 14, -12, 8, -6, 3, 0],
              } : {}}
              transition={{
                duration: 1.2,
                repeat: unreadCount > 0 ? Infinity : 0,
                repeatDelay: 3,
                ease: 'easeInOut',
              }}
            >
              <Bell size={22} color="#00D4FF" />
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={s.bellBadge}
                >
                  {unreadCount}
                </motion.div>
              )}
            </motion.div>
            <h1 style={s.title}>Notifications</h1>
          </div>
          <p style={s.subtitle}>Rewards & updates</p>
        </div>

        {unreadCount > 0 && (
          <motion.button
            whileHover={{ scale: 1.03, borderColor: 'rgba(0,212,255,0.35)' }}
            whileTap={{ scale: 0.96 }}
            style={{ ...s.markAllBtn, ...s.markAllBtnActive }}
            onClick={handleMarkAllRead}
          >
            <CheckCheck size={15} />
            Mark all read
          </motion.button>
        )}
      </div>

      {/* Unread counter */}
      {!loading && items.length > 0 && (
        <div style={s.unreadCount}>
          {unreadCount > 0 ? (
            <span>
              <span style={{ color: '#00D4FF', fontWeight: 700 }}>{unreadCount}</span>
              {' '}unread notification{unreadCount > 1 ? 's' : ''}
            </span>
          ) : (
            <span style={s.caughtUp}>
              <Sparkles size={13} />
              All caught up!
            </span>
          )}
        </div>
      )}

      {/* List */}
      <div style={s.list}>
        {loading ? (
          <div style={s.emptyState}>
            <motion.div
              animate={{ rotate: [0, 14, -12, 8, -6, 3, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.5 }}
              style={{ display: 'inline-block', marginBottom: 16 }}
            >
              <Bell size={28} color="#00D4FF" />
            </motion.div>
            <p style={{ fontSize: 13, fontWeight: 500 }}>Loading notifications...</p>
          </div>
        ) : items.length === 0 ? (
          <div style={s.emptyState}>
            <div style={s.emptyIconContainer}>
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <CheckCheck size={40} color="rgba(34,197,94,0.4)" />
              </motion.div>
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
              You're all caught up!
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.5 }}>
              When something happens, you'll see it here.
            </p>
          </div>
        ) : (
          <>
            {['Today', 'Yesterday', 'Earlier'].map((groupName) => {
              const groupItems = grouped[groupName];
              if (groupItems.length === 0) return null;

              return (
                <div key={groupName}>
                  {/* Group Header */}
                  <div style={s.groupHeader}>
                    {groupName}
                    <div style={s.groupLine} />
                    <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10, fontWeight: 600 }}>
                      {groupItems.length}
                    </span>
                  </div>

                  {/* Notifications in group */}
                  <AnimatePresence>
                    {groupItems.map((item, idx) => {
                      const config = getNotifConfig(item);
                      const IconComponent = config.icon;
                      const isUnread = !item.is_read;

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20, scale: 0.97 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 20, scale: 0.97 }}
                          transition={{
                            delay: Math.min(idx * 0.05, 0.3),
                            type: 'spring',
                            stiffness: 200,
                            damping: 25,
                          }}
                          style={{
                            ...s.item,
                            ...(isUnread ? s.itemUnread : s.itemRead),
                          }}
                          onClick={() => handleMarkRead(item.id)}
                          whileHover={{ x: 4, transition: { duration: 0.15 } }}
                        >
                          {/* Top accent line for unread */}
                          {isUnread && (
                            <div style={{
                              ...s.itemShine,
                              background: `linear-gradient(90deg, transparent, ${config.borderAccent}, transparent)`,
                            }} />
                          )}

                          {/* Icon */}
                          <motion.div
                            style={{
                              ...s.iconWrap,
                              background: config.bg,
                              border: `1px solid ${isUnread ? config.borderAccent : 'rgba(255,255,255,0.04)'}`,
                            }}
                            initial={isUnread ? { scale: 0.5, rotate: -20 } : {}}
                            animate={isUnread ? { scale: 1, rotate: 0 } : {}}
                            transition={{ delay: Math.min(idx * 0.05, 0.3) + 0.1, type: 'spring', stiffness: 300 }}
                          >
                            <div style={s.iconInner}>
                              <IconComponent size={21} color={config.color} />
                            </div>
                          </motion.div>

                          {/* Content */}
                          <div style={s.content}>
                            <div style={s.itemTitleRow}>
                              <div style={{
                                ...s.itemTitle,
                                color: isUnread ? '#fff' : 'rgba(255,255,255,0.6)',
                              }}>
                                {item.title}
                              </div>
                              <span style={{
                                ...s.itemTypeBadge,
                                background: config.bg,
                                color: config.color,
                                border: `1px solid ${config.borderAccent}`,
                              }}>
                                {config.label}
                              </span>
                            </div>
                            <div style={{
                              ...s.itemBody,
                              color: isUnread ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.35)',
                            }}>
                              {item.body}
                            </div>
                            <div style={s.itemTime}>
                              <span style={{
                                width: 4,
                                height: 4,
                                borderRadius: '50%',
                                background: config.color,
                                opacity: 0.4,
                                display: 'inline-block',
                              }} />
                              {timeAgo(item.created_at)}
                            </div>
                          </div>

                          {/* Unread dot */}
                          {isUnread && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              style={s.unreadDot}
                            />
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
