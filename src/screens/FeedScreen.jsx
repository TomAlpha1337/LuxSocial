import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw, MessageCircle, Heart, Share2, Flame, Trophy, Zap, Star,
  Eye, EyeOff, Lock, TrendingUp, ChevronDown, ChevronUp, Send,
  Award, Crown, Sparkles, Users, Globe,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  auth as authApi,
  activities as activitiesApi,
  reactions as reactionsApi,
  comments as commentsApi,
  events as eventsApi,
  friendships as friendshipsApi,
} from '../services/api';
import { REACTION_TYPES, ACTIVITY_VERBS, POINTS, ENERGY_MAX } from '../utils/constants';
import { shareContent } from '../utils/share';
import Mascot from '../components/Mascot';

// ============================================================
// Keyframe Animations (style tag injection)
// ============================================================
const keyframesId = 'lux-feed-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(keyframesId)) {
  const style = document.createElement('style');
  style.id = keyframesId;
  style.textContent = `
    @keyframes feedPulseGold {
      0%, 100% { box-shadow: 0 0 8px rgba(0,212,255,0.15); }
      50%      { box-shadow: 0 0 22px rgba(0,212,255,0.35); }
    }
    @keyframes feedPulseCyan {
      0%, 100% { box-shadow: 0 0 8px rgba(0,212,255,0.15); }
      50%      { box-shadow: 0 0 22px rgba(0,212,255,0.35); }
    }
    @keyframes feedPulsePurple {
      0%, 100% { box-shadow: 0 0 8px rgba(191,90,242,0.15); }
      50%      { box-shadow: 0 0 22px rgba(191,90,242,0.35); }
    }
    @keyframes feedPulseOrange {
      0%, 100% { box-shadow: 0 0 8px rgba(255,107,53,0.15); }
      50%      { box-shadow: 0 0 22px rgba(255,107,53,0.35); }
    }
    @keyframes feedShimmer {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes feedFloat {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-6px); }
    }
    @keyframes feedStaggerIn {
      0%   { opacity: 0; transform: translateY(24px) scale(0.97); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes feedSpinnerRotate {
      0%   { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes feedRingPulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50%      { transform: scale(1.08); opacity: 0.85; }
    }
    @keyframes feedHeartPop {
      0%   { transform: scale(1); }
      30%  { transform: scale(1.35); }
      60%  { transform: scale(0.9); }
      100% { transform: scale(1); }
    }
    @keyframes feedTabSlide {
      0%   { transform: scaleX(0); }
      100% { transform: scaleX(1); }
    }
    @keyframes feedEmptyFloat {
      0%, 100% { transform: translateY(0) rotate(-2deg); }
      50%      { transform: translateY(-12px) rotate(2deg); }
    }
    @keyframes feedGlowBorder {
      0%, 100% { border-color: rgba(0,212,255,0.1); }
      50%      { border-color: rgba(0,212,255,0.3); }
    }
    @keyframes feedBannerShimmer {
      0%   { background-position: -300% center; }
      100% { background-position: 300% center; }
    }
    @keyframes feedProgressGlow {
      0%, 100% { filter: brightness(1); }
      50%      { filter: brightness(1.4); }
    }
    @keyframes feedReactionBounce {
      0%   { transform: scale(1); }
      50%  { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
    @keyframes feedCommentSlideIn {
      0%   { opacity: 0; transform: translateY(10px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes feedFabPulse {
      0%, 100% { box-shadow: 0 4px 20px rgba(0,212,255,0.3); }
      50%      { box-shadow: 0 4px 35px rgba(0,212,255,0.6); }
    }
    .feed-card-hover:hover {
      border-color: rgba(0,212,255,0.2) !important;
      background: rgba(255,255,255,0.06) !important;
    }
    .feed-reaction-btn:hover {
      background: rgba(255,255,255,0.1) !important;
      transform: translateY(-1px);
    }
    .feed-reaction-btn:active .feed-reaction-emoji {
      animation: feedReactionBounce 0.3s ease;
    }
    .feed-tab-btn:hover {
      color: #ffffff !important;
    }
    .feed-comment-input:focus {
      border-color: rgba(191,90,242,0.5) !important;
      outline: none;
    }
    .feed-refresh-btn:hover {
      background: rgba(0,212,255,0.12) !important;
      border-color: rgba(0,212,255,0.4) !important;
    }
    @keyframes feedFloatReaction {
      0% { transform: translateY(0) scale(1); opacity: 1; }
      20% { transform: translateY(-20px) scale(1.2); opacity: 1; }
      80% { transform: translateY(-120px) scale(0.9); opacity: 0.6; }
      100% { transform: translateY(-160px) scale(0.6); opacity: 0; }
    }
    @keyframes feedHotPulse {
      0%, 100% { box-shadow: 0 0 8px rgba(255,107,53,0.2); }
      50% { box-shadow: 0 0 18px rgba(255,107,53,0.5); }
    }
    @keyframes feedTrendingShimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    .feed-card-enter {
      animation: feedStaggerIn 0.5s ease-out forwards;
    }
    .feed-share-btn:hover {
      background: rgba(191,90,242,0.15) !important;
      color: #BF5AF2 !important;
    }
  `;
  document.head.appendChild(style);
}

// ============================================================
// Theme Constants
// ============================================================
const GOLD = '#00D4FF';
const GOLD_DIM = 'rgba(0,212,255,0.15)';
const PURPLE = '#BF5AF2';
const PURPLE_DIM = 'rgba(191,90,242,0.15)';
const CYAN = '#00D4FF';
const CYAN_DIM = 'rgba(0,212,255,0.15)';
const ORANGE = '#FF6B35';
const ORANGE_DIM = 'rgba(255,107,53,0.15)';
const BG = '#0a0a0f';
const CARD_BG = 'rgba(255,255,255,0.05)';
const CARD_BORDER = 'rgba(255,255,255,0.08)';
const MUTED = '#64748b';
const TEXT = '#e2e8f0';
const TEXT_DIM = '#94a3b8';

// Activity type -> accent color mapping
const ACTIVITY_ACCENT = {
  answered: { color: CYAN, dim: CYAN_DIM, label: 'vote', pulse: 'feedPulseCyan' },
  asked: { color: CYAN, dim: CYAN_DIM, label: 'vote', pulse: 'feedPulseCyan' },
  streak: { color: ORANGE, dim: ORANGE_DIM, label: 'streak', pulse: 'feedPulseOrange' },
  badge: { color: GOLD, dim: GOLD_DIM, label: 'achievement', pulse: 'feedPulseGold' },
  milestone: { color: GOLD, dim: GOLD_DIM, label: 'achievement', pulse: 'feedPulseGold' },
  leveled_up: { color: PURPLE, dim: PURPLE_DIM, label: 'level-up', pulse: 'feedPulsePurple' },
  direct_sent: { color: PURPLE, dim: PURPLE_DIM, label: 'direct', pulse: 'feedPulsePurple' },
  direct_answered: { color: CYAN, dim: CYAN_DIM, label: 'vote', pulse: 'feedPulseCyan' },
  friend_with: { color: PURPLE, dim: PURPLE_DIM, label: 'social', pulse: 'feedPulsePurple' },
};

const ACTIVITY_ICON = {
  answered: Zap,
  asked: MessageCircle,
  streak: Flame,
  badge: Award,
  milestone: Trophy,
  leveled_up: Crown,
  direct_sent: Send,
  direct_answered: Zap,
  friend_with: Users,
};

const DEFAULT_ACCENT = { color: GOLD, dim: GOLD_DIM, label: 'activity', pulse: 'feedPulseGold' };

// ============================================================
// Helpers
// ============================================================
function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function getAccent(verb) {
  return ACTIVITY_ACCENT[verb] || DEFAULT_ACCENT;
}

function getActivityIcon(verb) {
  return ACTIVITY_ICON[verb] || Star;
}

// ============================================================
// Visibility Badge Component
// ============================================================
function VisibilityBadge({ visibility }) {
  if (visibility === 'public') return null;
  const isFriends = visibility === 'friends';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        fontSize: 10,
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: 8,
        marginLeft: 8,
        verticalAlign: 'middle',
        background: isFriends ? PURPLE_DIM : 'rgba(239,68,68,0.12)',
        color: isFriends ? '#c4b5fd' : '#f87171',
        border: `1px solid ${isFriends ? 'rgba(191,90,242,0.25)' : 'rgba(239,68,68,0.2)'}`,
        letterSpacing: 0.3,
      }}
    >
      {isFriends ? <Users size={9} /> : <Lock size={9} />}
      {isFriends ? 'Friends' : 'Private'}
    </span>
  );
}

// ============================================================
// Comment Section Component
// ============================================================
function CommentSection({ activityId, commentCount }) {
  const [expanded, setExpanded] = useState(false);
  const [commentsList, setCommentsList] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const toggleComments = async () => {
    if (!expanded && commentsList.length === 0) {
      setLoadingComments(true);
      try {
        const data = await commentsApi.getByActivity(activityId);
        setCommentsList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn('[NCB] toggleComments failed:', err.message);
        setCommentsList([]);
      } finally {
        setLoadingComments(false);
      }
    }
    setExpanded(!expanded);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    try {
      await commentsApi.add({ activity_id: activityId, body: newComment.trim(), user_id: user?.id, is_deleted: 0, created_at: new Date().toISOString() });
      setNewComment('');
      const data = await commentsApi.getByActivity(activityId);
      setCommentsList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('[NCB] handleSubmitComment failed:', err.message);
    }
  };

  return (
    <div style={{ marginTop: 10 }}>
      <button
        onClick={toggleComments}
        className="feed-reaction-btn"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 14px',
          borderRadius: 20,
          border: `1px solid ${CARD_BORDER}`,
          background: 'rgba(255,255,255,0.03)',
          color: TEXT_DIM,
          fontSize: 13,
          cursor: 'pointer',
          transition: 'all 0.2s',
          fontWeight: 500,
          marginLeft: 'auto',
        }}
      >
        <MessageCircle size={14} />
        <span>{commentCount || 0}</span>
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              marginTop: 12,
              padding: '12px 14px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: 14,
              border: `1px solid ${CARD_BORDER}`,
            }}>
              {loadingComments ? (
                <div style={{ textAlign: 'center', padding: '12px 0', color: MUTED, fontSize: 13 }}>
                  Loading comments...
                </div>
              ) : commentsList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '12px 0', color: MUTED, fontSize: 13 }}>
                  No comments yet -- be the first!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                  {commentsList.map((c, i) => (
                    <div
                      key={c.id || i}
                      style={{
                        animation: `feedCommentSlideIn 0.3s ease-out ${i * 0.05}s forwards`,
                        opacity: 0,
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start',
                      }}
                    >
                      <div style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${PURPLE}, ${CYAN})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#fff',
                        flexShrink: 0,
                      }}>
                        {(c.author_name || c.username || '?')[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>
                          {c.author_name || c.username || 'User'}
                        </span>
                        <p style={{ fontSize: 13, color: TEXT_DIM, margin: '2px 0 0', lineHeight: 1.45 }}>
                          {c.body || c.text || c.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Comment Input */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  className="feed-comment-input"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                  placeholder="Write a comment..."
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${CARD_BORDER}`,
                    borderRadius: 12,
                    padding: '9px 14px',
                    color: '#fff',
                    fontSize: 13,
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                />
                <button
                  onClick={handleSubmitComment}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    border: 'none',
                    background: newComment.trim()
                      ? `linear-gradient(135deg, ${PURPLE}, ${CYAN})`
                      : 'rgba(255,255,255,0.05)',
                    color: newComment.trim() ? '#fff' : MUTED,
                    cursor: newComment.trim() ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Floating Reaction Emojis (Instagram Live style)
// ============================================================
function FloatingReactions({ reactions }) {
  // reactions is an array of { id, emoji, timestamp }
  return (
    <div style={{
      position: 'absolute', bottom: 60, right: 16, width: 40,
      height: 180, pointerEvents: 'none', zIndex: 30, overflow: 'visible',
    }}>
      <AnimatePresence>
        {reactions.map((r) => (
          <motion.div
            key={r.id}
            initial={{ y: 0, x: 0, scale: 0.5, opacity: 0 }}
            animate={{
              y: -140 - Math.random() * 40,
              x: -10 + Math.random() * 30,
              scale: [0.5, 1.3, 1, 0.7],
              opacity: [0, 1, 1, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6 + Math.random() * 0.5, ease: 'easeOut' }}
            style={{
              position: 'absolute', bottom: 0,
              fontSize: 24, userSelect: 'none',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            }}
          >
            {r.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Trending Section Component
// ============================================================
function TrendingSection({ feed }) {
  // Pick activities with the most total reactions as "trending"
  const trending = [...feed]
    .map((item) => {
      const totalReactions = Object.values(item.reactions || {}).reduce((a, b) => a + b, 0);
      return { ...item, totalReactions };
    })
    .filter((item) => item.totalReactions > 0)
    .sort((a, b) => b.totalReactions - a.totalReactions)
    .slice(0, 5);

  if (trending.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ padding: '0 16px', marginBottom: 8 }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 12,
          background: 'linear-gradient(135deg, rgba(255,107,53,0.15), rgba(0,212,255,0.08))',
          border: '1px solid rgba(255,107,53,0.25)',
        }}>
          <TrendingUp size={14} color="#FB923C" />
          <span style={{
            fontSize: 12, fontWeight: 800, color: '#FB923C',
            textTransform: 'uppercase', letterSpacing: 1,
          }}>Trending Now</span>
        </div>
      </div>

      <div style={{
        display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8,
        WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
      }}>
        {trending.map((item, i) => {
          const accent = getAccent(item.verb);
          return (
            <motion.div
              key={item.id || i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              style={{
                minWidth: 200, maxWidth: 220, flexShrink: 0,
                padding: '14px 16px', borderRadius: 16,
                background: `linear-gradient(135deg, ${accent.color}12, ${accent.color}06)`,
                border: `1px solid ${accent.color}25`,
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Shimmer */}
              <div style={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(90deg, transparent, ${accent.color}08, transparent)`,
                backgroundSize: '200% 100%',
                animation: 'feedTrendingShimmer 3s ease-in-out infinite',
                pointerEvents: 'none',
              }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Flame size={12} color="#FB923C" />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#FB923C' }}>
                  {item.totalReactions} reactions
                </span>
              </div>
              <p style={{
                fontSize: 13, fontWeight: 600, color: '#e2e8f0', lineHeight: 1.4,
                margin: 0, display: '-webkit-box', WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {item.context || item.description || item.verb}
              </p>
              <div style={{ marginTop: 8, fontSize: 11, color: MUTED, fontWeight: 500 }}>
                {item.actor?.username || 'User'} -- {relativeTime(item.created_at)}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ============================================================
// Activity Card Component
// ============================================================
function ActivityCard({ activity, index }) {
  const { user } = useAuth();
  const [localReactions, setLocalReactions] = useState(activity.reactions || {});
  const [myReactions, setMyReactions] = useState({});
  const [myReactionIds, setMyReactionIds] = useState({});
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const floatIdRef = useRef(0);

  // Calculate if "hot" (many reactions)
  const totalReactionCount = Object.values(localReactions).reduce((a, b) => a + b, 0);
  const isHot = totalReactionCount >= 5;

  const handleReaction = async (type) => {
    const isActive = myReactions[type];

    // Launch floating emoji if adding reaction
    if (!isActive) {
      const emojiData = REACTION_TYPES[type];
      if (emojiData) {
        const newId = ++floatIdRef.current;
        setFloatingEmojis((prev) => [...prev.slice(-6), { id: newId, emoji: emojiData.emoji, timestamp: Date.now() }]);
        // Auto cleanup after animation
        setTimeout(() => {
          setFloatingEmojis((prev) => prev.filter((e) => e.id !== newId));
        }, 2200);
      }
    }

    // Optimistic UI update
    setMyReactions((prev) => ({ ...prev, [type]: !isActive }));
    setLocalReactions((prev) => {
      const current = prev[type] || 0;
      return { ...prev, [type]: isActive ? Math.max(0, current - 1) : current + 1 };
    });

    try {
      if (isActive) {
        // Remove the reaction
        const reactionId = myReactionIds[type];
        if (reactionId) {
          await reactionsApi.remove(reactionId);
          setMyReactionIds((prev) => {
            const next = { ...prev };
            delete next[type];
            return next;
          });
        }
      } else {
        // Add the reaction
        const result = await reactionsApi.add({
          activity_id: activity.id,
          user_id: user?.id,
          type: type,
          created_at: new Date().toISOString(),
        });
        if (result?.id) {
          setMyReactionIds((prev) => ({ ...prev, [type]: result.id }));
        }
      }
    } catch (err) {
      console.warn('[NCB] handleReaction failed:', err.message);
      // Revert optimistic update on failure
      setMyReactions((prev) => ({ ...prev, [type]: isActive }));
      setLocalReactions((prev) => {
        const current = prev[type] || 0;
        return { ...prev, [type]: isActive ? current + 1 : Math.max(0, current - 1) };
      });
    }
  };

  const actor = activity.actor || {};
  const verbText = ACTIVITY_VERBS[activity.verb] || activity.verb;
  const accent = getAccent(activity.verb);
  const IconComponent = getActivityIcon(activity.verb);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="feed-card-hover"
      style={{
        background: CARD_BG,
        border: `1px solid ${CARD_BORDER}`,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(12px)',
      }}
      whileHover={{ y: -2 }}
    >
      {/* Accent glow stripe at top */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        height: 2,
        background: `linear-gradient(90deg, transparent, ${accent.color}, transparent)`,
        opacity: 0.5,
        borderRadius: '0 0 2px 2px',
      }} />

      {/* Floating Reaction Emojis */}
      <FloatingReactions reactions={floatingEmojis} />

      {/* Hot Indicator */}
      {isHot && (
        <div style={{
          position: 'absolute', top: 12, right: 12, zIndex: 10,
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '3px 10px', borderRadius: 10,
          background: 'linear-gradient(135deg, rgba(255,107,53,0.2), rgba(255,69,0,0.1))',
          border: '1px solid rgba(255,107,53,0.3)',
          animation: 'feedHotPulse 2s ease-in-out infinite',
        }}>
          <Flame size={11} color="#FB923C" />
          <span style={{ fontSize: 10, fontWeight: 800, color: '#FB923C', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Hot
          </span>
        </div>
      )}

      {/* Card Top: Avatar + Meta + Type Badge + Timestamp */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 14,
      }}>
        {/* Avatar with colored ring */}
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          padding: 2.5,
          background: `linear-gradient(135deg, ${accent.color}, ${accent.color}88)`,
          flexShrink: 0,
          animation: 'feedRingPulse 3s ease-in-out infinite',
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: actor.avatar_color
              ? `linear-gradient(135deg, ${actor.avatar_color}, ${actor.avatar_color}cc)`
              : `linear-gradient(135deg, #1a1a2e, #16162a)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 700,
            color: actor.avatar_color ? '#0a0a0f' : GOLD,
            letterSpacing: 0.5,
            overflow: 'hidden',
          }}>
            {actor.avatar_url ? (
              <img
                src={actor.avatar_url}
                alt={actor.username}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'inline'; }}
              />
            ) : null}
            <span style={{ display: actor.avatar_url ? 'none' : 'inline' }}>
              {(actor.username || '?')[0].toUpperCase()}
            </span>
          </div>
        </div>

        {/* Username + Verb */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{
              fontWeight: 700,
              fontSize: 15,
              color: '#ffffff',
              lineHeight: 1.3,
            }}>
              {actor.username}
            </span>
            <VisibilityBadge visibility={activity.visibility} />
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            marginTop: 3,
          }}>
            <IconComponent size={12} color={accent.color} style={{ flexShrink: 0 }} />
            <span style={{
              fontSize: 13,
              color: TEXT_DIM,
              lineHeight: 1.3,
            }}>
              {verbText}
            </span>
          </div>
        </div>

        {/* Activity type badge + Timestamp */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 6,
          flexShrink: 0,
        }}>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 1,
            color: accent.color,
            background: accent.dim,
            padding: '3px 8px',
            borderRadius: 8,
            border: `1px solid ${accent.color}33`,
          }}>
            {accent.label}
          </span>
          <span style={{
            fontSize: 11,
            color: MUTED,
            fontWeight: 500,
          }}>
            {relativeTime(activity.created_at)}
          </span>
        </div>
      </div>

      {/* Enhanced dilemma display for vote activities */}
      {(activity.verb === 'answered' || activity.verb === 'asked' || activity.verb === 'direct_answered') && activity.dilemma ? (
        <div style={{
          margin: '0 0 16px', padding: '14px 16px', borderRadius: 14,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
          border: `1px solid ${accent.color}20`,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Question */}
          <p style={{
            fontSize: 14, fontWeight: 700, color: '#e2e8f0', margin: '0 0 12px',
            lineHeight: 1.5,
          }}>
            "{activity.dilemma.question || activity.context}"
          </p>
          {/* Options with highlight on chosen */}
          <div style={{ display: 'flex', gap: 8 }}>
            {activity.dilemma.option_a && (
              <div style={{
                flex: 1, padding: '8px 12px', borderRadius: 10,
                fontSize: 12, fontWeight: 600, lineHeight: 1.4,
                background: activity.chosen_option === 'a'
                  ? 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,212,255,0.06))'
                  : 'rgba(255,255,255,0.03)',
                border: activity.chosen_option === 'a'
                  ? '1px solid rgba(0,212,255,0.4)'
                  : '1px solid rgba(255,255,255,0.06)',
                color: activity.chosen_option === 'a' ? CYAN : TEXT_DIM,
              }}>
                {activity.chosen_option === 'a' && (
                  <span style={{ fontSize: 10, fontWeight: 800, color: CYAN, display: 'block', marginBottom: 3 }}>
                    CHOSE THIS
                  </span>
                )}
                {activity.dilemma.option_a}
              </div>
            )}
            {activity.dilemma.option_b && (
              <div style={{
                flex: 1, padding: '8px 12px', borderRadius: 10,
                fontSize: 12, fontWeight: 600, lineHeight: 1.4,
                background: activity.chosen_option === 'b'
                  ? 'linear-gradient(135deg, rgba(255,45,120,0.15), rgba(255,45,120,0.06))'
                  : 'rgba(255,255,255,0.03)',
                border: activity.chosen_option === 'b'
                  ? '1px solid rgba(255,45,120,0.4)'
                  : '1px solid rgba(255,255,255,0.06)',
                color: activity.chosen_option === 'b' ? '#FF2D78' : TEXT_DIM,
              }}>
                {activity.chosen_option === 'b' && (
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#FF2D78', display: 'block', marginBottom: 3 }}>
                    CHOSE THIS
                  </span>
                )}
                {activity.dilemma.option_b}
              </div>
            )}
          </div>
        </div>
      ) : activity.context ? (
        <div style={{
          fontSize: 14,
          color: '#cbd5e1',
          lineHeight: 1.6,
          margin: '0 0 16px',
          padding: '12px 16px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 14,
          borderLeft: `3px solid ${accent.color}55`,
          position: 'relative',
        }}>
          {activity.context}
        </div>
      ) : activity.description ? (
        <div style={{
          fontSize: 14,
          color: '#cbd5e1',
          lineHeight: 1.6,
          margin: '0 0 16px',
          padding: '12px 16px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 14,
          borderLeft: `3px solid ${accent.color}55`,
          position: 'relative',
        }}>
          {activity.description}
        </div>
      ) : null}

      {/* Actions Row: Reactions + Share + Comments */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
      }}>
        {Object.entries(REACTION_TYPES).map(([key, { emoji, label }]) => {
          const count = localReactions[key] || 0;
          const active = myReactions[key];
          return (
            <motion.button
              key={key}
              onClick={() => handleReaction(key)}
              className="feed-reaction-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '7px 12px',
                borderRadius: 20,
                border: `1px solid ${active ? `${accent.color}44` : CARD_BORDER}`,
                background: active ? accent.dim : 'rgba(255,255,255,0.03)',
                color: active ? accent.color : TEXT_DIM,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                fontWeight: active ? 600 : 500,
                outline: 'none',
              }}
              whileTap={{ scale: 0.9 }}
              title={label}
            >
              <span
                className="feed-reaction-emoji"
                style={{
                  display: 'inline-block',
                  animation: active ? 'feedHeartPop 0.4s ease' : 'none',
                }}
              >
                {emoji}
              </span>
              {count > 0 && <span style={{ fontSize: 12 }}>{count}</span>}
            </motion.button>
          );
        })}

        {/* Share button */}
        <motion.button
          className="feed-share-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '7px 12px',
            borderRadius: 20,
            border: `1px solid ${CARD_BORDER}`,
            background: 'rgba(255,255,255,0.03)',
            color: TEXT_DIM,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            fontWeight: 500,
            outline: 'none',
          }}
          whileTap={{ scale: 0.9 }}
          title="Share"
          onClick={() => {
            const dilemmaText = activity.dilemma
              ? `${activity.dilemma.question}: ${activity.dilemma.option_a} or ${activity.dilemma.option_b}?`
              : activity.description || '';
            shareContent({
              title: "Social Dilemma's",
              text: dilemmaText || `Check out what's happening on Social Dilemma's!`,
              url: window.location.origin,
            });
          }}
        >
          <Share2 size={13} />
        </motion.button>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Comment Section */}
        <CommentSection
          activityId={activity.id}
          commentCount={activity.comment_count}
        />
      </div>
    </motion.div>
  );
}

// ============================================================
// Loading Skeleton
// ============================================================
function FeedSkeleton() {
  return (
    <div style={{ padding: '8px 16px' }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            background: CARD_BG,
            border: `1px solid ${CARD_BORDER}`,
            borderRadius: 20,
            padding: 20,
            marginBottom: 16,
            animation: `feedStaggerIn 0.5s ease-out ${i * 0.15}s forwards`,
            opacity: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
              backgroundSize: '200% 100%',
              animation: 'feedShimmer 1.8s ease-in-out infinite',
            }} />
            <div style={{ flex: 1 }}>
              <div style={{
                width: '60%', height: 14, borderRadius: 7,
                background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
                backgroundSize: '200% 100%',
                animation: 'feedShimmer 1.8s ease-in-out infinite',
                marginBottom: 8,
              }} />
              <div style={{
                width: '40%', height: 10, borderRadius: 5,
                background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
                backgroundSize: '200% 100%',
                animation: 'feedShimmer 1.8s ease-in-out infinite',
              }} />
            </div>
          </div>
          <div style={{
            width: '90%', height: 48, borderRadius: 14,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.02) 75%)',
            backgroundSize: '200% 100%',
            animation: 'feedShimmer 1.8s ease-in-out infinite',
            marginBottom: 14,
          }} />
          <div style={{ display: 'flex', gap: 8 }}>
            {[0, 1, 2].map((j) => (
              <div key={j} style={{
                width: 60, height: 30, borderRadius: 20,
                background: 'linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.02) 75%)',
                backgroundSize: '200% 100%',
                animation: 'feedShimmer 1.8s ease-in-out infinite',
              }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Empty State
// ============================================================
function EmptyState({ onStartPlaying }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '60px 30px',
    }}>
      <div style={{ margin: '0 auto 24px' }}>
        <Mascot mood="waving" size={80} message="No activity yet — go play!" />
      </div>
      <h3 style={{
        fontSize: 20,
        fontWeight: 700,
        margin: '0 0 10px',
        background: `linear-gradient(135deg, ${GOLD}, ${PURPLE})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        No activity yet
      </h3>
      <p style={{
        fontSize: 15,
        color: MUTED,
        margin: '0 0 28px',
        lineHeight: 1.5,
        maxWidth: 280,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        Be the first to play! Start a dilemma and watch the feed come alive.
      </p>
      <div
        onClick={onStartPlaying}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 28px',
          borderRadius: 28,
          background: `linear-gradient(135deg, ${GOLD}, ${ORANGE})`,
          color: '#fff',
          fontWeight: 700,
          fontSize: 14,
          cursor: 'pointer',
          border: 'none',
          boxShadow: `0 4px 20px ${GOLD}44`,
          letterSpacing: 0.3,
        }}
      >
        <Zap size={16} />
        Start Playing
      </div>
    </div>
  );
}

// ============================================================
// FeedScreen -- Main Export
// ============================================================
export default function FeedScreen() {
  const { user, energy } = useAuth();
  const navigate = useNavigate();
  const [allFeed, setAllFeed] = useState([]);
  const [friendIds, setFriendIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [eventActive, setEventActive] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);
  const [activeTab, setActiveTab] = useState('everyone');
  const streak = user?.current_streak ?? 0;
  const displayName = user?.username || user?.display_name || 'Explorer';

  // -- Load feed ------------------------------------------------
  const loadFeed = useCallback(async () => {
    try {
      const [data, eventsData, friendsData] = await Promise.all([
        activitiesApi.getFeed(),
        eventsApi.getActive().catch((err) => { console.warn('[NCB] getActive events:', err.message); return []; }),
        user?.id ? friendshipsApi.getFriends(user.id).catch((err) => { console.warn('[NCB] getFriends:', err.message); return []; }) : Promise.resolve([]),
      ]);
      // Enrich activities with user profiles
      const rawFeed = Array.isArray(data) ? data : [];
      const uniqueActorIds = [...new Set(rawFeed.map(a => a.actor_id).filter(Boolean))];
      const userMap = {};
      await Promise.all(uniqueActorIds.map(async (id) => {
        try {
          const u = await authApi.getUser(id);
          if (u) userMap[id] = u;
        } catch (err) { console.warn('[NCB] getUser for feed actor:', err.message); }
      }));
      setAllFeed(rawFeed.map(a => ({
        ...a,
        actor: userMap[a.actor_id] || { username: 'User', id: a.actor_id },
        description: a.context_text || a.description || '',
      })));
      const eventsList = Array.isArray(eventsData) ? eventsData : [];
      setEventActive(eventsList.length > 0);
      setActiveEvent(eventsList.length > 0 ? eventsList[0] : null);

      // Build friend ID set for filtering
      const fList = Array.isArray(friendsData) ? friendsData : [];
      const ids = new Set();
      fList.forEach(f => {
        const fid = f.user_id === user?.id ? f.friend_id : f.user_id;
        if (fid) ids.add(fid);
      });
      setFriendIds(ids);
    } catch (err) {
      console.warn('[NCB] loadFeed failed:', err.message);
      setAllFeed([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setTimeout(() => setRefreshing(false), 600);
  };

  // Filter feed by active tab
  const feed = activeTab === 'friends'
    ? allFeed.filter(item => friendIds.has(item.actor_id) || item.actor_id === user?.id)
    : allFeed;

  const energyPercent = (energy / ENERGY_MAX) * 100;

  // -- Render ---------------------------------------------------
  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(180deg, ${BG} 0%, #0d0d18 50%, ${BG} 100%)`,
      color: TEXT,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      paddingBottom: 100,
      position: 'relative',
    }}>
      {/* ---- Ambient Background Glow ---- */}
      <div style={{
        position: 'fixed',
        top: -100,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${GOLD}08 0%, transparent 70%)`,
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* ============================================ */}
      {/* HEADER                                       */}
      {/* ============================================ */}
      <div style={{
        padding: '20px 20px 0',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'linear-gradient(180deg, #0a0a0f 85%, transparent)',
        backdropFilter: 'blur(16px)',
      }}>
        {/* Welcome Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <p style={{
              fontSize: 13,
              color: MUTED,
              margin: 0,
              fontWeight: 500,
              letterSpacing: 0.5,
            }}>
              Welcome back
            </p>
            <h1 style={{
              fontSize: 24,
              fontWeight: 800,
              margin: '2px 0 0',
              background: `linear-gradient(135deg, #ffffff 0%, ${GOLD} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: -0.5,
            }}>
              {displayName}
            </h1>
          </div>

          {/* Streak Badge */}
          <motion.div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: `linear-gradient(135deg, ${ORANGE_DIM}, rgba(0,212,255,0.1))`,
              border: `1px solid ${ORANGE}33`,
              borderRadius: 24,
              padding: '8px 16px',
              cursor: 'pointer',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Flame size={18} color={ORANGE} style={{ animation: 'feedFloat 2s ease-in-out infinite' }} />
            <span style={{
              fontSize: 16,
              fontWeight: 700,
              color: ORANGE,
              letterSpacing: 0.3,
            }}>
              {streak}
            </span>
            <span style={{
              fontSize: 11,
              color: TEXT_DIM,
              fontWeight: 500,
            }}>
              streak
            </span>
          </motion.div>
        </div>

        {/* Energy Progress */}
        <div style={{
          margin: '14px 0 0',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}>
            <Zap size={13} color={energy < 20 ? '#FF6B35' : GOLD} />
            <span style={{
              fontSize: 12,
              color: TEXT_DIM,
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}>
              {energy}/{ENERGY_MAX} energy
            </span>
          </div>
          <div style={{
            flex: 1,
            height: 6,
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 4,
            overflow: 'hidden',
            position: 'relative',
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${energyPercent}%` }}
              transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
              style={{
                height: '100%',
                borderRadius: 4,
                background: `linear-gradient(90deg, ${GOLD}, ${PURPLE})`,
                animation: 'feedProgressGlow 2s ease-in-out infinite',
                position: 'relative',
              }}
            />
          </div>
        </div>

        {/* ---- Tab Bar ---- */}
        <div style={{
          display: 'flex',
          gap: 0,
          marginTop: 16,
          position: 'relative',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          {[
            { key: 'everyone', label: 'Everyone', icon: Globe },
            { key: 'friends', label: 'Friends', icon: Users },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="feed-tab-btn"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 7,
                  padding: '12px 0',
                  border: 'none',
                  background: 'transparent',
                  color: isActive ? '#ffffff' : MUTED,
                  fontSize: 14,
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'color 0.25s ease',
                  outline: 'none',
                }}
              >
                <TabIcon size={15} color={isActive ? GOLD : MUTED} />
                {tab.label}
                {/* Animated underline indicator */}
                {isActive && (
                  <motion.div
                    layoutId="feedTabIndicator"
                    style={{
                      position: 'absolute',
                      bottom: -1,
                      left: '15%',
                      right: '15%',
                      height: 3,
                      borderRadius: 3,
                      background: `linear-gradient(90deg, ${GOLD}, ${PURPLE})`,
                      boxShadow: `0 0 10px ${GOLD}55`,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================ */}
      {/* EVENT BANNER                                 */}
      {/* ============================================ */}
      {eventActive && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            margin: '16px 16px 0',
            padding: '16px 18px',
            borderRadius: 16,
            background: `linear-gradient(135deg, ${GOLD_DIM}, ${PURPLE_DIM})`,
            border: `1px solid ${GOLD}33`,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Shimmer overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(90deg, transparent 0%, ${GOLD}0a 50%, transparent 100%)`,
            backgroundSize: '200% 100%',
            animation: 'feedBannerShimmer 4s ease-in-out infinite',
            pointerEvents: 'none',
          }} />

          <div style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${GOLD}22, ${PURPLE}22)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: `1px solid ${GOLD}22`,
          }}>
            <Zap size={22} color={GOLD} style={{ animation: 'feedFloat 2s ease-in-out infinite' }} />
          </div>
          <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
            <p style={{
              fontSize: 14,
              fontWeight: 700,
              color: GOLD,
              margin: 0,
              letterSpacing: 0.3,
            }}>
              {activeEvent?.title || activeEvent?.name || 'Event Active!'}
            </p>
            <p style={{
              fontSize: 12,
              color: TEXT_DIM,
              margin: '3px 0 0',
            }}>
              {activeEvent?.description || ''}
            </p>
          </div>
          {activeEvent?.badge_label && (
            <div style={{
              fontSize: 13,
              fontWeight: 700,
              color: GOLD,
              background: `${GOLD}15`,
              padding: '5px 12px',
              borderRadius: 10,
              border: `1px solid ${GOLD}22`,
              whiteSpace: 'nowrap',
            }}>
              {activeEvent.badge_label}
            </div>
          )}
        </motion.div>
      )}

      {/* ============================================ */}
      {/* REFRESH BUTTON                               */}
      {/* ============================================ */}
      <motion.button
        className="feed-refresh-btn"
        onClick={handleRefresh}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          margin: '16px auto 6px',
          padding: '9px 24px',
          border: `1px solid ${GOLD}33`,
          borderRadius: 28,
          background: `${GOLD}08`,
          color: GOLD,
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          outline: 'none',
          letterSpacing: 0.3,
        }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 0.6, ease: 'linear', repeat: refreshing ? Infinity : 0 }}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <RefreshCw size={14} />
        </motion.div>
        {refreshing ? 'Refreshing...' : 'Refresh Feed'}
      </motion.button>

      {/* ============================================ */}
      {/* TRENDING SECTION                              */}
      {/* ============================================ */}
      {!loading && feed.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <TrendingSection feed={feed} />
        </div>
      )}

      {/* ============================================ */}
      {/* FEED CONTENT                                 */}
      {/* ============================================ */}
      <div style={{ padding: '8px 16px', position: 'relative', zIndex: 1 }}>
        {loading ? (
          <FeedSkeleton />
        ) : feed.length === 0 ? (
          <EmptyState onStartPlaying={() => navigate('/play')} />
        ) : (
          <AnimatePresence>
            {feed.map((item, i) => (
              <ActivityCard key={item.id || i} activity={item} index={i} />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* ============================================ */}
      {/* FLOATING SCROLL-TO-TOP BUTTON                */}
      {/* ============================================ */}
      <FloatingScrollTop />
    </div>
  );
}

// ============================================================
// Floating Scroll-to-Top Button
// ============================================================
function FloatingScrollTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: 110,
            right: 20,
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${GOLD}, ${ORANGE})`,
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            animation: 'feedFabPulse 3s ease-in-out infinite',
            boxShadow: `0 4px 20px ${GOLD}44`,
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronUp size={22} strokeWidth={2.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
