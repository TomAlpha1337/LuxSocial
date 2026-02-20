import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, UserPlus, UserMinus, Check, X,
  Star, Flame, Users, ChevronRight, Loader,
  Heart, Sparkles, UserCheck, Bell, Send,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as API from '../services/api';
import { XP_LEVELS } from '../utils/constants';

// ── Keyframes ───────────────────────────────────────────────
const keyframesId = 'lux-friends-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(keyframesId)) {
  const style = document.createElement('style');
  style.id = keyframesId;
  style.textContent = `
    @keyframes frPulse {
      0%, 100% { transform: scale(1); }
      50%      { transform: scale(1.08); }
    }
    @keyframes frGlow {
      0%, 100% { box-shadow: 0 0 10px rgba(191,90,242,0.1); }
      50%      { box-shadow: 0 0 25px rgba(191,90,242,0.25); }
    }
    @keyframes frOnlinePulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(57,255,20,0.5); }
      50%      { box-shadow: 0 0 0 4px rgba(57,255,20,0); }
    }
    @keyframes frShimmer {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes frSearchGlow {
      0%, 100% { box-shadow: 0 0 15px rgba(0,212,255,0.08), inset 0 0 15px rgba(0,212,255,0.02); }
      50%      { box-shadow: 0 0 25px rgba(0,212,255,0.15), inset 0 0 20px rgba(0,212,255,0.04); }
    }
    @keyframes frAcceptPop {
      0%   { transform: scale(1); }
      40%  { transform: scale(0.85); }
      70%  { transform: scale(1.15); }
      100% { transform: scale(1); }
    }
    @keyframes frRejectShake {
      0%, 100% { transform: translateX(0); }
      20%  { transform: translateX(-3px); }
      40%  { transform: translateX(3px); }
      60%  { transform: translateX(-2px); }
      80%  { transform: translateX(2px); }
    }
    @keyframes frCardEnter {
      0%   { opacity: 0; transform: translateY(16px) scale(0.96); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes frFloat {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-4px); }
    }
    @keyframes frSparkle {
      0%, 100% { opacity: 0.3; transform: scale(0.8) rotate(0deg); }
      50%      { opacity: 1; transform: scale(1.2) rotate(180deg); }
    }
    @keyframes frBadgeBounce {
      0%, 100% { transform: scale(1); }
      50%      { transform: scale(1.2); }
    }
    @keyframes frSendSuccess {
      0%   { transform: scale(1); }
      30%  { transform: scale(0.9); }
      60%  { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    @keyframes frTabUnderline {
      0%   { transform: scaleX(0); }
      100% { transform: scaleX(1); }
    }
  `;
  document.head.appendChild(style);
}

// ── Theme ────────────────────────────────────────────────────
const GOLD = '#00D4FF';
const PURPLE = '#BF5AF2';
const PURPLE_LIGHT = '#D48EFF';
const CYAN = '#00D4FF';
const CYAN_LIGHT = '#33E0FF';
const BG = '#050510';
const MUTED = 'rgba(255,255,255,0.3)';
const RED = '#ef4444';
const GREEN = '#39FF14';

// ── Helpers ──────────────────────────────────────────────────
function getLevelInfo(xp) {
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= XP_LEVELS[i].xp) return XP_LEVELS[i];
  }
  return XP_LEVELS[0];
}

function getInitials(name) {
  if (!name) return '?';
  return name.slice(0, 2).toUpperCase();
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

// ── Tab Enum ─────────────────────────────────────────────────
const TABS = [
  { key: 'friends',  label: 'Friends',  icon: Users },
  { key: 'requests', label: 'Requests', icon: Bell },
  { key: 'find',     label: 'Find',     icon: Search },
];

// ── Component ────────────────────────────────────────────────
export default function FriendsScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [sentRequests, setSentRequests] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [suggestedLoading, setSuggestedLoading] = useState(false);
  const searchTimeout = useRef(null);

  // Load friends and requests
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (!user?.id) {
          setFriends([]);
          setRequests([]);
          setLoading(false);
          return;
        }

        const [friendsRes, requestsRes] = await Promise.allSettled([
          API.friendships.getFriends(user.id),
          API.friendships.getRequests(user.id),
        ]);

        if (friendsRes.status === 'fulfilled') {
          const list = Array.isArray(friendsRes.value) ? friendsRes.value : [];
          // Enrich with user data
          const enriched = await Promise.all(
            list.map(async (f) => {
              const friendId = f.user_id === user.id ? f.friend_id : f.user_id;
              try {
                const u = await API.auth.getUser(friendId);
                return { ...u, friendship_id: f.id };
              } catch {
                return { id: friendId, username: 'User', friendship_id: f.id, xp: 0, current_streak: 0 };
              }
            })
          );
          setFriends(enriched);
        }

        if (requestsRes.status === 'fulfilled') {
          const list = Array.isArray(requestsRes.value) ? requestsRes.value : [];
          const enriched = await Promise.all(
            list.map(async (r) => {
              try {
                const u = await API.auth.getUser(r.user_id);
                return { ...r, username: u.username, avatar_url: u.avatar_url };
              } catch {
                return { ...r, username: 'User', avatar_url: null };
              }
            })
          );
          setRequests(enriched);
        }
      } catch (err) {
        console.error('Friends load error:', err);
        setFriends([]);
        setRequests([]);
      }
      setLoading(false);
    }
    load();
  }, [user?.id]);

  // Load suggested friends when Find tab is active
  useEffect(() => {
    if (activeTab !== 'find' || !user?.id) return;
    let cancelled = false;
    (async () => {
      setSuggestedLoading(true);
      try {
        // Fetch all users AND all friendships for current user (any status)
        const [allUsers, allFriendshipsRaw] = await Promise.all([
          API.admin.getAllUsers(),
          API.friendships.getAllForUser(user.id),
        ]);
        const usersArr = Array.isArray(allUsers) ? allUsers : [];
        const friendIds = new Set(friends.map((f) => f.id));

        // Pre-populate sentRequests with users who already have a pending/accepted friendship
        const allFriendships = Array.isArray(allFriendshipsRaw) ? allFriendshipsRaw : [];
        const pendingOrAccepted = new Set();
        allFriendships.forEach(f => {
          const otherId = f.user_id === user.id ? f.friend_id : f.user_id;
          if (f.record_status === 'pending' || f.record_status === 'accepted') {
            pendingOrAccepted.add(otherId);
          }
        });
        if (!cancelled) setSentRequests(prev => {
          const merged = new Set([...prev, ...pendingOrAccepted]);
          return merged;
        });

        const suggestions = usersArr.filter(
          (u) => u.id !== user.id && !friendIds.has(u.id) && !pendingOrAccepted.has(u.id) && u.record_status !== 'banned'
        );
        // Sort by XP descending so most active users show first
        suggestions.sort((a, b) => (b.xp || 0) - (a.xp || 0));
        if (!cancelled) setSuggestedUsers(suggestions.slice(0, 10));
      } catch {
        if (!cancelled) setSuggestedUsers([]);
      }
      if (!cancelled) setSuggestedLoading(false);
    })();
    return () => { cancelled = true; };
  }, [activeTab, user?.id, friends]);

  // Search debounced
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        if (!user?.id) {
          setSearchResults([]);
          setSearchLoading(false);
          return;
        }
        // NCB like: filter is unreliable — fetch all users and filter client-side
        const allUsers = await API.admin.getAllUsers();
        const usersArr = Array.isArray(allUsers) ? allUsers : [];
        const q = query.toLowerCase();
        const res = usersArr.filter((u) =>
          u.id !== user.id &&
          (u.username || '').toLowerCase().includes(q)
        );
        setSearchResults(res);
      } catch {
        setSearchResults([]);
      }
      setSearchLoading(false);
    }, 400);
  }, [user?.id]);

  // Accept friend request
  const handleAccept = async (request) => {
    try {
      if (user?.id && request.id) {
        await API.friendships.update(request.id, { record_status: 'accepted', accepted_at: new Date().toISOString() });
        // Create activity
        await API.activities.create({
          actor_id: user.id,
          verb: 'friend_with',
          object_type: 'user',
          object_id: request.user_id,
          context_text: `became friends with ${request.username}`,
          visibility: 'public',
          is_deleted: 0,
          created_at: new Date().toISOString(),
        });
        // Notify the sender that their request was accepted
        await API.notifications.create({
          user_id: request.user_id,
          type: 'friend_accepted',
          message: `${user.username || user.name} accepted your friend request`,
          is_read: false,
          reference_id: user.id,
          created_at: new Date().toISOString(),
        }).catch((err) => console.warn('[NCB]', err.message));
      }
    } catch (err) {
      console.error('Accept friend error:', err);
    }
    // Optimistic update
    setRequests((prev) => prev.filter((r) => r.id !== request.id));
    setFriends((prev) => [
      { id: request.user_id, username: request.username, avatar_url: request.avatar_url, xp: 0, current_streak: 0 },
      ...prev,
    ]);
  };

  // Reject friend request
  const handleReject = async (request) => {
    try {
      if (user?.id && request.id) {
        await API.friendships.update(request.id, { record_status: 'rejected' });
      }
    } catch (err) {
      console.error('Reject friend error:', err);
    }
    setRequests((prev) => prev.filter((r) => r.id !== request.id));
  };

  // Unfriend
  const handleUnfriend = async (friend, e) => {
    e.stopPropagation();
    try {
      if (friend.friendship_id) {
        await API.friendships.remove(friend.friendship_id);
      }
    } catch (err) {
      console.error('Unfriend error:', err);
    }
    setFriends((prev) => prev.filter((f) => f.id !== friend.id));
  };

  // Send friend request (with duplicate check + notification)
  const handleAddFriend = async (target) => {
    if (!user?.id) return;
    try {
      // Check for existing friendship/request (both directions)
      const existing = await API.friendships.checkExisting(user.id, target.id);
      if (existing.length > 0) {
        // Already have a pending or accepted friendship
        setSentRequests((prev) => new Set([...prev, target.id]));
        return;
      }

      setSentRequests((prev) => new Set([...prev, target.id]));
      await API.friendships.sendRequest({
        user_id: user.id,
        friend_id: target.id,
        record_status: 'pending',
        requested_at: new Date().toISOString(),
      });

      // Notify the target user
      await API.notifications.create({
        user_id: target.id,
        type: 'friend_request',
        message: `${user.username || user.name} sent you a friend request`,
        is_read: false,
        reference_id: user.id,
        created_at: new Date().toISOString(),
      }).catch((err) => console.warn('[NCB]', err.message));
    } catch (err) {
      console.error('Add friend error:', err);
    }
  };

  // ── Renderers ──────────────────────────────────────────────
  const renderFriendsList = () => {
    if (loading) return renderLoader();
    if (friends.length === 0) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '56px 24px', textAlign: 'center',
        }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(191,90,242,0.1), rgba(0,212,255,0.08))',
              border: '1px solid rgba(191,90,242,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 20, animation: 'frFloat 3s ease-in-out infinite',
            }}
          >
            <Heart size={32} color={PURPLE_LIGHT} style={{ opacity: 0.6 }} />
          </motion.div>
          <div style={{
            fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: 8,
          }}>
            No friends yet
          </div>
          <div style={{
            fontSize: 14, color: MUTED, maxWidth: 280, lineHeight: 1.6,
          }}>
            Head to the <span style={{ color: CYAN }}>Find</span> tab to discover people and start building your circle.
          </div>
        </div>
      );
    }

    return (
      <div style={{ padding: '12px 20px 100px' }}>
        {friends.map((friend, i) => {
          const level = getLevelInfo(friend.xp ?? 0);
          const isOnline = friend.is_online;
          return (
            <motion.div
              key={friend.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.05, ease: 'easeOut' }}
              onClick={() => navigate(`/profile/${friend.id}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 18px', borderRadius: 18,
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(191,90,242,0.08)',
                marginBottom: 10, cursor: 'pointer',
                transition: 'all 0.25s ease',
                position: 'relative', overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(191,90,242,0.25)';
                e.currentTarget.style.background = 'rgba(191,90,242,0.04)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(191,90,242,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(191,90,242,0.08)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.025)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Avatar with online status */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: '50%',
                  padding: 2,
                  background: 'linear-gradient(135deg, rgba(191,90,242,0.4), rgba(0,212,255,0.3))',
                }}>
                  <div style={{
                    width: '100%', height: '100%', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 700, color: GOLD, letterSpacing: 0.5,
                    background: 'linear-gradient(135deg, rgba(191,90,242,0.2), rgba(0,212,255,0.15))',
                    overflow: 'hidden',
                  }}>
                    {friend.avatar_url ? (
                      <img
                        src={friend.avatar_url}
                        alt={friend.username}
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      getInitials(friend.username)
                    )}
                  </div>
                </div>
                {/* Online indicator */}
                {isOnline && (
                  <div style={{
                    position: 'absolute', bottom: 1, right: 1,
                    width: 14, height: 14, borderRadius: '50%',
                    background: GREEN, border: '3px solid #0a0a0f',
                    animation: 'frOnlinePulse 2s ease-in-out infinite',
                  }} />
                )}
              </div>

              {/* Friend info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 16, fontWeight: 600, color: '#eee', letterSpacing: -0.2,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {friend.username}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '2px 10px', borderRadius: 10,
                    background: 'rgba(191,90,242,0.1)',
                    border: '1px solid rgba(191,90,242,0.15)',
                    fontSize: 11, fontWeight: 600, color: PURPLE_LIGHT,
                  }}>
                    <Star size={10} color={PURPLE_LIGHT} fill={PURPLE_LIGHT} />
                    Lv.{level.level}
                  </span>
                  {(friend.current_streak ?? 0) > 0 && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                      fontSize: 12, fontWeight: 600, color: '#f97316',
                    }}>
                      <Flame size={12} color="#f97316" fill="#f97316" />
                      {friend.current_streak}
                    </span>
                  )}
                  {isOnline && (
                    <span style={{
                      fontSize: 11, fontWeight: 500, color: GREEN,
                    }}>
                      Online
                    </span>
                  )}
                </div>
              </div>

              {/* Unfriend button */}
              <button
                onClick={(e) => handleUnfriend(friend, e)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 38, height: 38, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: 'rgba(239,68,68,0.06)', transition: 'all 0.25s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
                  e.currentTarget.style.transform = 'scale(1.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.06)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                title="Remove friend"
              >
                <UserMinus size={16} color={RED} />
              </button>

              {/* Chevron */}
              <ChevronRight size={16} color="rgba(255,255,255,0.15)" style={{ flexShrink: 0 }} />
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderRequestsList = () => {
    if (loading) return renderLoader();
    if (requests.length === 0) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '56px 24px', textAlign: 'center',
        }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(191,90,242,0.08))',
              border: '1px solid rgba(0,212,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 20, animation: 'frFloat 3s ease-in-out infinite',
            }}
          >
            <Sparkles size={32} color={CYAN_LIGHT} style={{ opacity: 0.6, animation: 'frSparkle 3s ease-in-out infinite' }} />
          </motion.div>
          <div style={{
            fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: 8,
          }}>
            No pending requests
          </div>
          <div style={{
            fontSize: 14, color: MUTED, maxWidth: 280, lineHeight: 1.6,
            fontStyle: 'italic',
          }}>
            You're all caught up! When someone sends you a friend request, it will appear here.
          </div>
        </div>
      );
    }

    return (
      <div style={{ padding: '12px 20px 100px' }}>
        {requests.map((req, i) => (
          <motion.div
            key={req.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.06, ease: 'easeOut' }}
            layout
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '16px 18px', borderRadius: 18,
              background: 'linear-gradient(135deg, rgba(0,212,255,0.03), rgba(191,90,242,0.02))',
              border: '1px solid rgba(0,212,255,0.1)',
              marginBottom: 10,
              position: 'relative', overflow: 'hidden',
            }}
          >
            {/* Subtle left accent bar */}
            <div style={{
              position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3,
              borderRadius: '0 3px 3px 0',
              background: 'linear-gradient(180deg, #00D4FF, #BF5AF2)',
            }} />

            {/* Avatar */}
            <div style={{
              width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
              padding: 2,
              background: 'linear-gradient(135deg, rgba(0,212,255,0.4), rgba(191,90,242,0.3))',
            }}>
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, fontWeight: 700, color: GOLD, letterSpacing: 0.5,
                background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(191,90,242,0.1))',
                overflow: 'hidden',
              }}>
                {req.avatar_url ? (
                  <img
                    src={req.avatar_url}
                    alt={req.username}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  getInitials(req.username)
                )}
              </div>
            </div>

            {/* Request info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 15, fontWeight: 600, color: '#eee', letterSpacing: -0.2,
              }}>
                {req.username}
              </div>
              <div style={{
                fontSize: 12, color: MUTED, marginTop: 3,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <UserPlus size={11} color={MUTED} />
                {timeAgo(req.created_at)}
              </div>
            </div>

            {/* Accept / Reject buttons */}
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => handleAccept(req)}
                title="Accept"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  height: 40, padding: '0 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: `linear-gradient(135deg, ${GREEN}, #16a34a)`,
                  boxShadow: '0 2px 12px rgba(57,255,20,0.3)',
                  transition: 'all 0.2s ease',
                  fontSize: 13, fontWeight: 600, color: '#fff',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(57,255,20,0.4)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(57,255,20,0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Check size={16} strokeWidth={2.5} />
                Accept
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => handleReject(req)}
                title="Decline"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 40, height: 40, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: 'rgba(239,68,68,0.08)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.18)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
                }}
              >
                <X size={16} color={RED} strokeWidth={2.5} />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderFindTab = () => {
    return (
      <>
        {/* Search Input with glow */}
        <div style={{ padding: '18px 20px 8px' }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'rgba(0,212,255,0.04)',
              borderRadius: 16, padding: '0 16px',
              border: '1px solid rgba(0,212,255,0.12)',
              transition: 'all 0.3s ease',
              animation: 'frSearchGlow 3s ease-in-out infinite',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0,212,255,0.35)';
              e.currentTarget.style.background = 'rgba(0,212,255,0.06)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0,212,255,0.12)';
              e.currentTarget.style.background = 'rgba(0,212,255,0.04)';
            }}
          >
            <Search size={20} color={CYAN} style={{ opacity: 0.7, flexShrink: 0 }} />
            <input
              style={{
                flex: 1, border: 'none', background: 'transparent',
                color: '#fff', fontSize: 15, padding: '14px 0',
                outline: 'none', fontFamily: 'inherit', fontWeight: 500,
              }}
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
            />
            {searchLoading && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader size={18} color={CYAN} />
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Results */}
        <div style={{ padding: '8px 20px 100px' }}>
          {searchResults.length === 0 && searchQuery.trim() === '' && (
            <>
              {/* Suggested Friends Section */}
              {suggestedLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                    style={{
                      width: 28, height: 28,
                      border: '3px solid rgba(191,90,242,0.1)',
                      borderTopColor: PURPLE,
                      borderRadius: '50%',
                    }}
                  />
                </div>
              ) : suggestedUsers.length > 0 ? (
                <div style={{ paddingTop: 8 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
                  }}>
                    <Sparkles size={16} color={PURPLE_LIGHT} />
                    <span style={{
                      fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.8)',
                      letterSpacing: -0.2,
                    }}>
                      Suggested for you
                    </span>
                  </div>
                  {suggestedUsers.map((sUser, i) => {
                    const level = getLevelInfo(sUser.xp ?? 0);
                    const alreadySent = sentRequests.has(sUser.id);
                    return (
                      <motion.div
                        key={sUser.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, ease: 'easeOut' }}
                        onClick={() => navigate(`/profile/${sUser.id}`)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 14,
                          padding: '14px 16px', borderRadius: 18,
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(191,90,242,0.08)',
                          marginBottom: 10, cursor: 'pointer',
                          transition: 'all 0.25s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(191,90,242,0.25)';
                          e.currentTarget.style.background = 'rgba(191,90,242,0.04)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(191,90,242,0.08)';
                          e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                        }}
                      >
                        {/* Avatar */}
                        <div style={{
                          width: 46, height: 46, borderRadius: '50%', flexShrink: 0, padding: 2,
                          background: 'linear-gradient(135deg, rgba(191,90,242,0.4), rgba(0,212,255,0.3))',
                        }}>
                          <div style={{
                            width: '100%', height: '100%', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 15, fontWeight: 700, color: GOLD, letterSpacing: 0.5,
                            background: 'linear-gradient(135deg, rgba(191,90,242,0.15), rgba(0,212,255,0.1))',
                            overflow: 'hidden',
                          }}>
                            {sUser.avatar_url ? (
                              <img src={sUser.avatar_url} alt={sUser.username}
                                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : getInitials(sUser.username)}
                          </div>
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 15, fontWeight: 600, color: '#eee',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {sUser.username || 'User'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 3,
                              padding: '2px 8px', borderRadius: 10,
                              background: 'rgba(191,90,242,0.1)',
                              border: '1px solid rgba(191,90,242,0.15)',
                              fontSize: 11, fontWeight: 600, color: PURPLE_LIGHT,
                            }}>
                              <Star size={10} color={PURPLE_LIGHT} fill={PURPLE_LIGHT} />
                              Lv.{level.level}
                            </span>
                            <span style={{ fontSize: 12, color: MUTED, fontWeight: 500 }}>
                              {sUser.xp || 0} XP
                            </span>
                          </div>
                        </div>

                        {/* Add button */}
                        {alreadySent ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontSize: 12, fontWeight: 600, color: CYAN, padding: '8px 12px',
                            borderRadius: 12, background: 'rgba(0,212,255,0.08)',
                            border: '1px solid rgba(0,212,255,0.15)',
                          }}>
                            <Send size={13} /> Sent
                          </span>
                        ) : (
                          <motion.button
                            whileTap={{ scale: 0.92 }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 5,
                              padding: '8px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
                              fontSize: 12, fontWeight: 700, flexShrink: 0,
                              background: 'linear-gradient(135deg, #BF5AF2, #9B30E0)',
                              color: '#fff', boxShadow: '0 2px 12px rgba(191,90,242,0.3)',
                            }}
                            onClick={(e) => { e.stopPropagation(); handleAddFriend(sUser); }}
                          >
                            <UserPlus size={14} /> Add
                          </motion.button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', padding: '48px 20px', textAlign: 'center',
                }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    style={{
                      width: 80, height: 80, borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(191,90,242,0.08))',
                      border: '1px solid rgba(0,212,255,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 20, animation: 'frFloat 3s ease-in-out infinite',
                    }}
                  >
                    <Users size={32} color={CYAN_LIGHT} style={{ opacity: 0.6 }} />
                  </motion.div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
                    No suggestions yet
                  </div>
                  <div style={{ fontSize: 14, color: MUTED, maxWidth: 280, lineHeight: 1.6 }}>
                    Search for users by their username and grow your social circle.
                  </div>
                </div>
              )}
            </>
          )}
          {searchResults.length === 0 && searchQuery.trim() !== '' && !searchLoading && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '48px 20px', textAlign: 'center',
            }}>
              <div style={{
                fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 8,
              }}>
                No results found
              </div>
              <div style={{
                fontSize: 14, color: MUTED, maxWidth: 260, lineHeight: 1.5,
              }}>
                Try a different username or check your spelling.
              </div>
            </div>
          )}
          <AnimatePresence>
            {searchResults.map((result, i) => {
              const level = getLevelInfo(result.xp ?? 0);
              const alreadySent = sentRequests.has(result.id);
              const alreadyFriend = friends.some((f) => f.id === result.id);
              return (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05, ease: 'easeOut' }}
                  onClick={() => navigate(`/profile/${result.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '16px 18px', borderRadius: 18,
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid rgba(191,90,242,0.08)',
                    marginBottom: 10, cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    position: 'relative', overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(191,90,242,0.25)';
                    e.currentTarget.style.background = 'rgba(191,90,242,0.04)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(191,90,242,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(191,90,242,0.08)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.025)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 50, height: 50, borderRadius: '50%', flexShrink: 0,
                    padding: 2,
                    background: 'linear-gradient(135deg, rgba(191,90,242,0.4), rgba(0,212,255,0.3))',
                  }}>
                    <div style={{
                      width: '100%', height: '100%', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 700, color: GOLD, letterSpacing: 0.5,
                      background: 'linear-gradient(135deg, rgba(191,90,242,0.15), rgba(0,212,255,0.1))',
                      overflow: 'hidden',
                    }}>
                      {result.avatar_url ? (
                        <img
                          src={result.avatar_url}
                          alt={result.username}
                          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        getInitials(result.username)
                      )}
                    </div>
                  </div>

                  {/* User info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 16, fontWeight: 600, color: '#eee', letterSpacing: -0.2,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {result.username}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '2px 10px', borderRadius: 10,
                        background: 'rgba(191,90,242,0.1)',
                        border: '1px solid rgba(191,90,242,0.15)',
                        fontSize: 11, fontWeight: 600, color: PURPLE_LIGHT,
                      }}>
                        <Star size={10} color={PURPLE_LIGHT} fill={PURPLE_LIGHT} />
                        Lv.{level.level}
                      </span>
                      {(result.mutual_friends ?? 0) > 0 && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 3,
                          fontSize: 12, fontWeight: 500, color: MUTED,
                        }}>
                          <Users size={11} color={MUTED} />
                          {result.mutual_friends} mutual
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action button */}
                  {alreadyFriend ? (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontSize: 12, fontWeight: 700, color: GREEN, padding: '8px 14px',
                      borderRadius: 12, background: 'rgba(57,255,20,0.08)',
                      border: '1px solid rgba(57,255,20,0.15)',
                    }}>
                      <UserCheck size={14} />
                      Friends
                    </span>
                  ) : alreadySent ? (
                    <motion.span
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        fontSize: 12, fontWeight: 600, color: CYAN, padding: '8px 14px',
                        borderRadius: 12, background: 'rgba(0,212,255,0.08)',
                        border: '1px solid rgba(0,212,255,0.15)',
                      }}
                    >
                      <Send size={13} />
                      Sent
                    </motion.span>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.92 }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '10px 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
                        fontSize: 13, fontWeight: 700, flexShrink: 0,
                        background: 'linear-gradient(135deg, #BF5AF2, #9B30E0)',
                        color: '#fff',
                        boxShadow: '0 2px 12px rgba(191,90,242,0.3)',
                        transition: 'box-shadow 0.2s ease',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddFriend(result);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 24px rgba(191,90,242,0.45)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 2px 12px rgba(191,90,242,0.3)';
                      }}
                    >
                      <UserPlus size={15} />
                      Add Friend
                    </motion.button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </>
    );
  };

  const renderLoader = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 56, gap: 12 }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        style={{
          width: 36, height: 36,
          border: '3px solid rgba(191,90,242,0.1)',
          borderTopColor: PURPLE,
          borderRadius: '50%',
        }}
      />
      <span style={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>Loading...</span>
    </div>
  );

  // ── Main Render ────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0f 0%, #0d0a18 50%, #0a0a0f 100%)',
      color: '#fff', fontFamily: "'Inter', sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: -100, right: -100,
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(191,90,242,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '18px 20px 14px', gap: 14,
      }}>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 40, height: 40, borderRadius: 14,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            cursor: 'pointer', transition: 'all 0.2s ease',
          }}
        >
          <ArrowLeft size={20} color="rgba(255,255,255,0.7)" />
        </motion.button>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 22, fontWeight: 800, letterSpacing: -0.5, color: '#fff',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Heart size={20} color={PURPLE_LIGHT} style={{ opacity: 0.7 }} />
            Friends
          </div>
        </div>
        {/* Friend count badge */}
        {!loading && friends.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 14px', borderRadius: 20,
              background: 'rgba(191,90,242,0.1)',
              border: '1px solid rgba(191,90,242,0.2)',
            }}
          >
            <Users size={14} color={PURPLE_LIGHT} />
            <span style={{ fontSize: 14, fontWeight: 700, color: PURPLE_LIGHT }}>
              {friends.length}
            </span>
          </motion.div>
        )}
      </div>

      {/* Tab Bar */}
      <div style={{
        display: 'flex', margin: '0 20px', gap: 4,
        background: 'rgba(255,255,255,0.025)',
        borderRadius: 16, padding: 5,
        border: '1px solid rgba(255,255,255,0.04)',
      }}>
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          const isRequests = tab.key === 'requests';
          const count = requests.length;
          const Icon = tab.icon;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                padding: '12px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 600, transition: 'all 0.3s ease',
                position: 'relative', fontFamily: "'Inter', sans-serif",
                background: active
                  ? 'linear-gradient(135deg, rgba(191,90,242,0.15), rgba(0,212,255,0.08))'
                  : 'transparent',
                color: active ? '#fff' : MUTED,
                boxShadow: active ? '0 2px 12px rgba(191,90,242,0.1)' : 'none',
              }}
            >
              <Icon size={15} style={{ opacity: active ? 0.9 : 0.5 }} />
              <span>{tab.label}</span>
              {isRequests && count > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  style={{
                    minWidth: 20, height: 20, borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, lineHeight: 1,
                    padding: '0 6px',
                    background: active
                      ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                      : 'rgba(239,68,68,0.5)',
                    color: '#fff',
                    boxShadow: active ? '0 0 8px rgba(239,68,68,0.4)' : 'none',
                    animation: active ? 'frBadgeBounce 2s ease-in-out infinite' : 'none',
                  }}
                >
                  {count}
                </motion.span>
              )}
              {/* Active tab underline */}
              {active && (
                <motion.div
                  layoutId="friendsTabIndicator"
                  style={{
                    position: 'absolute', bottom: 2, left: '25%', right: '25%',
                    height: 2, borderRadius: 1,
                    background: 'linear-gradient(90deg, #BF5AF2, #00D4FF)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {activeTab === 'friends' && renderFriendsList()}
          {activeTab === 'requests' && renderRequestsList()}
          {activeTab === 'find' && renderFindTab()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
