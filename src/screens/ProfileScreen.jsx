import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Edit3, UserPlus, UserMinus, Shield, Flag,
  Flame, Trophy, Star, Award, Eye, EyeOff, LogOut, ChevronRight,
  Zap, MessageCircle, Heart, Target, Crown, Sparkles,
  Swords, TrendingUp, Calendar, BarChart3, Lock, Share2, Grid,
  Camera, Save, Loader, Snowflake, Rocket, Moon, Sunrise, Users, Vote,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as API from '../services/api';
import { uploadImage } from '../services/cloudinary';
import { XP_LEVELS, POINTS, CATEGORIES, STREAK_FREEZE_PER_WEEK } from '../utils/constants';
import { shareContent } from '../utils/share';

// ── Theme ────────────────────────────────────────────────────
const GOLD = '#00D4FF';
const GOLD_DIM = '#0099BB';
const PURPLE = '#BF5AF2';
const PURPLE_LIGHT = '#D48EFF';
const CYAN = '#00D4FF';
const CYAN_DIM = '#0099BB';
const BG = '#050510';
const CARD = 'rgba(0, 212, 255, 0.03)';
const CARD_BORDER = 'rgba(0, 212, 255, 0.08)';
const MUTED = 'rgba(255,255,255,0.3)';
const MUTED_LIGHT = 'rgba(255,255,255,0.6)';
const RED = '#ef4444';
const GREEN = '#39FF14';
const SURFACE = '#08081a';

// ── Helpers ──────────────────────────────────────────────────
function getLevelInfo(xp) {
  let current = XP_LEVELS[0];
  let next = XP_LEVELS[1];
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= XP_LEVELS[i].xp) {
      current = XP_LEVELS[i];
      next = XP_LEVELS[i + 1] || null;
      break;
    }
  }
  const progress = next ? (xp - current.xp) / (next.xp - current.xp) : 1;
  return { current, next, progress };
}

function getInitials(name) {
  if (!name) return '?';
  return name.slice(0, 2).toUpperCase();
}

function getLevelColor(level) {
  if (level >= 18) return '#FF6B6B';
  if (level >= 15) return GOLD;
  if (level >= 12) return PURPLE;
  if (level >= 9) return CYAN;
  if (level >= 6) return '#34D399';
  if (level >= 3) return '#60A5FA';
  return '#9CA3AF';
}

function getWinRate(profile) {
  const total = profile?.total_answers ?? 0;
  const wins = profile?.total_wins ?? profile?.correct_answers ?? 0;
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
}

// Category colors and emojis for Top Categories display
const PROFILE_CAT_COLORS = {
  lifestyle: '#00D4FF', food: '#FF6B35', travel: '#00D4FF',
  relationships: '#FF2D78', money: '#39FF14', hypothetical: '#BF5AF2',
  fun: '#FF6B35', deep: '#BF5AF2', sport: '#39FF14', tech: '#00D4FF', other: '#64748b',
};
const PROFILE_CAT_EMOJIS = {
  lifestyle: '\u{1F3AF}', food: '\u{1F355}', travel: '\u{2708}\uFE0F',
  relationships: '\u{2764}\uFE0F', money: '\u{1F4B0}', hypothetical: '\u{1F914}',
  fun: '\u{1F602}', deep: '\u{1F9E0}', sport: '\u{1F4AA}', tech: '\u{1F4BB}', other: '\u{2728}',
};

const badgeIconMap = {
  flame: Flame,
  fire: Flame,
  target: Target,
  heart: Heart,
  crown: Crown,
  zap: Zap,
  star: Star,
  sparkles: Sparkles,
  trophy: Trophy,
  shield: Shield,
  users: Users,
  trendingup: TrendingUp,
  rocket: Rocket,
  moon: Moon,
  sunrise: Sunrise,
  vote: Vote,
  award: Award,
};

// ── Keyframe Animations (injected once) ─────────────────────
const STYLE_ID = 'profile-rpg-keyframes';
function injectKeyframes() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes rpg-avatar-ring-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes rpg-glow-pulse {
      0%, 100% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.08); }
    }
    @keyframes rpg-flame-flicker {
      0%, 100% { transform: translateY(0) scaleY(1); opacity: 1; }
      25% { transform: translateY(-2px) scaleY(1.1); opacity: 0.9; }
      50% { transform: translateY(-1px) scaleY(0.95); opacity: 1; }
      75% { transform: translateY(-3px) scaleY(1.05); opacity: 0.85; }
    }
    @keyframes rpg-xp-shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes rpg-badge-shine {
      0% { background-position: -100% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes rpg-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    @keyframes rpg-streak-fire {
      0%, 100% { text-shadow: 0 0 8px rgba(255,107,53,0.6), 0 0 16px rgba(255,45,120,0.3); }
      50% { text-shadow: 0 0 16px rgba(255,107,53,0.9), 0 0 32px rgba(255,45,120,0.5), 0 0 48px rgba(191,90,242,0.2); }
    }
    @keyframes rpg-card-border-glow {
      0%, 100% { border-color: rgba(191,90,242,0.12); }
      50% { border-color: rgba(191,90,242,0.25); }
    }
    @keyframes rpg-level-badge-glow {
      0%, 100% { box-shadow: 0 0 12px rgba(0,212,255,0.2), inset 0 1px 0 rgba(255,255,255,0.1); }
      50% { box-shadow: 0 0 24px rgba(0,212,255,0.4), 0 0 48px rgba(0,212,255,0.1), inset 0 1px 0 rgba(255,255,255,0.15); }
    }
    @keyframes rpg-bar-glow {
      0%, 100% { filter: brightness(1) drop-shadow(0 0 4px rgba(191,90,242,0.3)); }
      50% { filter: brightness(1.2) drop-shadow(0 0 8px rgba(191,90,242,0.5)); }
    }
    @keyframes rpg-particle-rise {
      0% { transform: translateY(0) scale(1); opacity: 1; }
      100% { transform: translateY(-20px) scale(0); opacity: 0; }
    }
    @keyframes rpg-scan-line {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100vh); }
    }
    @keyframes rpg-badge-case-glow {
      0%, 100% { box-shadow: 0 0 12px rgba(0,212,255,0.1), inset 0 0 20px rgba(0,212,255,0.03); }
      50% { box-shadow: 0 0 24px rgba(0,212,255,0.2), inset 0 0 30px rgba(0,212,255,0.06); }
    }
    @keyframes rpg-category-bar-fill {
      0% { width: 0; }
    }
    @keyframes rpg-share-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(191,90,242,0.2); }
      50% { box-shadow: 0 0 0 6px rgba(191,90,242,0); }
    }
    @keyframes rpg-title-shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    .rpg-share-btn:hover {
      background: linear-gradient(135deg, rgba(191,90,242,0.2), rgba(0,212,255,0.12)) !important;
      border-color: rgba(191,90,242,0.5) !important;
      transform: translateY(-1px);
    }
    .rpg-title-option:hover {
      border-color: rgba(0,212,255,0.4) !important;
      background: rgba(0,212,255,0.08) !important;
    }
    .rpg-stat-card:hover {
      transform: translateY(-2px) !important;
      border-color: rgba(0,212,255,0.2) !important;
      box-shadow: 0 4px 24px rgba(0,212,255,0.08), 0 0 0 1px rgba(0,212,255,0.1) !important;
    }
    .rpg-badge-item:hover {
      transform: scale(1.1) !important;
    }
    .rpg-btn-edit:hover {
      background: linear-gradient(135deg, rgba(0,212,255,0.15), rgba(191,90,242,0.1)) !important;
      border-color: rgba(0,212,255,0.5) !important;
      box-shadow: 0 0 20px rgba(0,212,255,0.15) !important;
    }
    .rpg-btn-logout:hover {
      background: rgba(239,68,68,0.15) !important;
      border-color: rgba(239,68,68,0.5) !important;
    }
    .rpg-xp-bar-inner {
      animation: rpg-bar-glow 2s ease-in-out infinite;
    }
    .rpg-activity-row:hover {
      background: rgba(255,255,255,0.02) !important;
    }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.15); border-radius: 4px; }
  `;
  document.head.appendChild(style);
}

// ── Component ────────────────────────────────────────────────
export default function ProfileScreen() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState([]);
  const [activities, setActivities] = useState([]);
  const [streakData, setStreakData] = useState(null);
  const [freezesUsedThisWeek, setFreezesUsedThisWeek] = useState(0);
  const [freezeLoading, setFreezeLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [friendStatus, setFriendStatus] = useState(null); // 'friends' | 'pending' | null
  const [visibility, setVisibility] = useState('public');
  const [showTitlePicker, setShowTitlePicker] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef(null);

  // Edit profile state
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [profileShareCopied, setProfileShareCopied] = useState(false);

  const isOwnProfile = !userId || userId === user?.id;

  // Inject CSS keyframes
  useEffect(() => { injectKeyframes(); }, []);

  // Fetch profile data
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const targetId = isOwnProfile ? user?.id : userId;

        if (!targetId) {
          setProfile(null);
          setLoading(false);
          return;
        }

        const [profileRes, badgesRes, actRes, streakRes, freezeRes] = await Promise.allSettled([
          API.auth.getUser(targetId),
          API.badges.getByUser(targetId),
          API.activities.getByUser(targetId),
          API.streaks.get(targetId),
          isOwnProfile ? API.streakFreezes.getThisWeek(targetId) : Promise.resolve([]),
        ]);

        if (profileRes.status === 'fulfilled') setProfile(profileRes.value);
        if (badgesRes.status === 'fulfilled') setBadges(Array.isArray(badgesRes.value) ? badgesRes.value : []);
        if (actRes.status === 'fulfilled') {
          const list = Array.isArray(actRes.value) ? actRes.value : [];
          setActivities(list);
        }
        if (streakRes.status === 'fulfilled') {
          const streaks = Array.isArray(streakRes.value) ? streakRes.value[0] : streakRes.value;
          setStreakData(streaks || null);
        }
        if (freezeRes.status === 'fulfilled') {
          const freezes = Array.isArray(freezeRes.value) ? freezeRes.value : [];
          setFreezesUsedThisWeek(freezes.length);
        }

        // If viewing another user, check friendship
        if (!isOwnProfile && user?.id) {
          try {
            const friends = await API.friendships.getFriends(user.id);
            const isFriend = Array.isArray(friends) && friends.some(
              (f) => f.friend_id === userId || f.user_id === userId
            );
            if (isFriend) {
              setFriendStatus('friends');
            } else {
              const reqs = await API.friendships.getRequests(userId);
              const hasPending = Array.isArray(reqs) && reqs.some((r) => r.user_id === user.id);
              setFriendStatus(hasPending ? 'pending' : null);
            }
          } catch {
            setFriendStatus(null);
          }
        }
      } catch (err) {
        console.error('Profile load error:', err);
        setProfile(null);
        setBadges([]);
        setActivities([]);
        setStreakData(null);
      }
      setLoading(false);
    }
    load();
  }, [userId, user?.id, isOwnProfile]);

  // Level info
  const levelInfo = useMemo(() => {
    const xp = profile?.xp ?? 0;
    return getLevelInfo(xp);
  }, [profile?.xp]);

  // Compute top categories from activities
  const topCategories = useMemo(() => {
    if (!Array.isArray(activities) || activities.length === 0) return [];
    const catCounts = {};
    for (const act of activities) {
      const cat = act.category || act.dilemma_category;
      if (cat) {
        catCounts[cat] = (catCounts[cat] || 0) + 1;
      }
    }
    const sorted = Object.entries(catCounts)
      .map(([cat, count]) => ({ cat, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    const maxCount = sorted.length > 0 ? sorted[0].count : 1;
    return sorted.map((s) => ({ ...s, pct: (s.count / maxCount) * 100 }));
  }, [activities]);

  // Available titles based on current level (all titles up to current level)
  const availableTitles = useMemo(() => {
    const currentLevel = levelInfo?.current?.level || 1;
    return XP_LEVELS.filter((l) => l.level <= currentLevel);
  }, [levelInfo]);

  // Compute weekly activity data from real activities (must be before early returns)
  const { weeklyVotes, maxWeeklyVote } = useMemo(() => {
    const now = new Date();
    const counts = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      counts[key] = 0;
    }
    if (Array.isArray(activities)) {
      for (const act of activities) {
        const dateStr = (act.created_at || '').slice(0, 10);
        if (dateStr in counts) {
          counts[dateStr]++;
        }
      }
    }
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const entries = Object.entries(counts).map(([dateStr, count]) => {
      const dayIndex = new Date(dateStr + 'T00:00:00').getDay();
      return { day: dayNames[dayIndex], count };
    });
    const maxVal = Math.max(...entries.map(e => e.count), 1);
    return { weeklyVotes: entries, maxWeeklyVote: maxVal };
  }, [activities]);

  // Handlers
  const handleToggleVisibility = async () => {
    const next = visibility === 'public' ? 'private' : 'public';
    setVisibility(next);
    if (user?.id) {
      try {
        await API.auth.updateUser(user.id, { profile_visibility: next });
        updateUser({ profile_visibility: next });
      } catch (err) {
        console.error('Failed to update visibility:', err);
        setVisibility(visibility); // revert
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddFriend = async () => {
    if (!user?.id || !userId) return;
    try {
      await API.friendships.sendRequest({
        user_id: user.id,
        friend_id: userId,
        status: 'pending',
        requested_at: new Date().toISOString(),
      });
      setFriendStatus('pending');
    } catch (err) {
      console.error('Add friend error:', err);
    }
  };

  const handleRemoveFriend = async () => {
    if (!user?.id || !userId) return;
    try {
      const friends = await API.friendships.getFriends(user.id);
      const friendship = Array.isArray(friends) && friends.find(
        (f) => f.friend_id === userId || f.user_id === userId
      );
      if (friendship) {
        await API.friendships.remove(friendship.id);
        setFriendStatus(null);
      }
    } catch (err) {
      console.error('Remove friend error:', err);
    }
  };

  const handleBlock = async () => {
    if (!user?.id || !userId) return;
    try {
      await API.blocks.create({
        blocker_id: user.id,
        blocked_id: userId,
        created_at: new Date().toISOString(),
      });
      navigate(-1);
    } catch (err) {
      console.error('Block error:', err);
    }
  };

  const handleReport = async () => {
    if (!user?.id || !userId) return;
    try {
      await API.reports.create({
        reporter_id: user.id,
        reported_id: userId,
        reason: 'user_report',
        status: 'pending',
        created_at: new Date().toISOString(),
      });
      alert('Report submitted. Thank you.');
    } catch (err) {
      console.error('Report error:', err);
    }
  };

  // Photo upload handler
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setPhotoUploading(true);
    setImgError(false);
    try {
      const url = await uploadImage(file);
      await API.auth.updateUser(user.id, { avatar_url: url });
      updateUser({ avatar_url: url });
      setProfile((prev) => prev ? { ...prev, avatar_url: url } : prev);
    } catch (err) {
      console.error('Photo upload error:', err);
      alert(err.message || 'Failed to upload photo. Please try again.');
    } finally {
      setPhotoUploading(false);
      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Edit profile save handler
  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setEditSaving(true);
    try {
      const updates = {};
      if (editUsername.trim() && editUsername.trim() !== profile?.username) {
        updates.username = editUsername.trim();
      }
      if (editBio.trim() !== (profile?.bio || '')) {
        updates.bio = editBio.trim();
      }
      if (Object.keys(updates).length > 0) {
        await API.auth.updateUser(user.id, updates);
        updateUser(updates);
        setProfile((prev) => prev ? { ...prev, ...updates } : prev);
      }
      setShowEditProfile(false);
    } catch (err) {
      console.error('Save profile error:', err);
      alert('Failed to save profile. Please try again.');
    } finally {
      setEditSaving(false);
    }
  };

  // ── Derived values ──────────────────────────────────────────
  const levelColor = levelInfo ? getLevelColor(levelInfo.current.level) : GOLD;

  // Streak freeze handler
  const freezesRemaining = STREAK_FREEZE_PER_WEEK - freezesUsedThisWeek;
  const handleUseFreeze = async () => {
    if (freezeLoading || freezesRemaining <= 0) return;
    setFreezeLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      await API.streakFreezes.use({
        user_id: user.id,
        used_date: today,
      });
      setFreezesUsedThisWeek((prev) => prev + 1);
    } catch (err) {
      console.warn('Freeze use failed:', err.message);
    }
    setFreezeLoading(false);
  };

  // ── Render ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: BG, display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16,
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 48, height: 48,
            border: `3px solid rgba(0,212,255,0.1)`,
            borderTopColor: GOLD,
            borderRadius: '50%',
          }}
        />
        <span style={{ color: MUTED, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase' }}>
          Loading Character Sheet...
        </span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{
        minHeight: '100vh', background: BG, color: '#fff',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        {!isOwnProfile && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            display: 'flex', alignItems: 'center', padding: '16px 20px 8px', gap: 12,
          }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 40, height: 40, borderRadius: 12,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={18} color="#ccc" />
            </button>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#ccc' }}>Profile</span>
          </div>
        )}
        <Shield size={48} color={MUTED} style={{ marginBottom: 16, opacity: 0.5 }} />
        <div style={{ fontSize: 16, color: MUTED, textAlign: 'center' }}>
          Character not found
        </div>
      </div>
    );
  }

  const p = profile;
  const streak = streakData || { current_streak: p.current_streak || 0, best_streak: p.best_streak || 0 };
  const currentXP = p.xp ?? 0;
  const winRate = getWinRate(p);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div style={{
      minHeight: '100vh',
      background: BG,
      color: '#fff',
      paddingBottom: 40,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient background gradients */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0,
      }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: `radial-gradient(circle, ${levelColor}08 0%, transparent 70%)`,
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '-10%',
          width: 400, height: 400, borderRadius: '50%',
          background: `radial-gradient(circle, ${PURPLE}06 0%, transparent 70%)`,
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* ── Top Bar ── */}
        {!isOwnProfile ? (
          <div style={{
            display: 'flex', alignItems: 'center', padding: '16px 20px 8px', gap: 12,
          }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 40, height: 40, borderRadius: 12,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={18} color="#ccc" />
            </button>
            <span style={{
              fontSize: 14, fontWeight: 600, color: MUTED_LIGHT,
              textTransform: 'uppercase', letterSpacing: 2,
            }}>Character Sheet</span>
          </div>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '18px 20px 4px',
          }}>
            <span style={{
              fontSize: 12, fontWeight: 600, color: MUTED,
              textTransform: 'uppercase', letterSpacing: 3,
            }}>Character Sheet</span>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            HERO SECTION — Avatar, Name, Level, XP
           ══════════════════════════════════════════════════════════ */}
        <motion.div
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '12px 20px 24px', textAlign: 'center',
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Avatar with animated ring */}
          <motion.div
            style={{ position: 'relative', marginBottom: 4 }}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1, type: 'spring', stiffness: 180 }}
          >
            {/* Outer glow */}
            <div style={{
              position: 'absolute', inset: -8,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${levelColor}25 0%, transparent 70%)`,
              animation: 'rpg-glow-pulse 3s ease-in-out infinite',
            }} />

            {/* Spinning ring */}
            <div style={{
              width: 108, height: 108, borderRadius: '50%',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: `conic-gradient(from 0deg, ${levelColor}, ${PURPLE}, ${CYAN}, ${levelColor})`,
                animation: 'rpg-avatar-ring-spin 6s linear infinite',
              }} />
              {/* Inner mask */}
              <div style={{
                position: 'absolute', inset: 3, borderRadius: '50%',
                background: '#0d0d14',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}>
                {p.avatar_url && !imgError ? (
                  <img
                    src={p.avatar_url}
                    alt={p.username}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <span style={{
                    fontSize: 32, fontWeight: 800, color: levelColor,
                    letterSpacing: 1,
                    textShadow: `0 0 20px ${levelColor}40`,
                  }}>
                    {getInitials(p.username)}
                  </span>
                )}
                {/* Photo upload loading spinner overlay */}
                {photoUploading && (
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader size={28} color={GOLD} />
                    </motion.div>
                  </div>
                )}
                {/* Edit photo overlay (own profile only) */}
                {isOwnProfile && !photoUploading && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      position: 'absolute', inset: 0, borderRadius: '50%',
                      background: 'rgba(0,0,0,0.0)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; e.currentTarget.querySelector('.cam-icon').style.opacity = '1'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.0)'; e.currentTarget.querySelector('.cam-icon').style.opacity = '0'; }}
                  >
                    <Camera className="cam-icon" size={22} color="#fff" style={{ opacity: 0, transition: 'opacity 0.2s ease' }} />
                  </div>
                )}
              </div>
              {/* Hidden file input for photo upload */}
              {isOwnProfile && (
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handlePhotoUpload}
                />
              )}
            </div>

            {/* Level badge overlay (bottom-right) */}
            <motion.div
              style={{
                position: 'absolute', bottom: -2, right: -2,
                width: 36, height: 36, borderRadius: '50%',
                background: `linear-gradient(135deg, ${GOLD}, #FF2D78)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `3px solid ${BG}`,
                boxShadow: `0 0 16px ${GOLD}40`,
                animation: 'rpg-level-badge-glow 2s ease-in-out infinite',
                zIndex: 2,
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 260, damping: 15 }}
            >
              <span style={{
                fontSize: 14, fontWeight: 900, color: '#fff',
                lineHeight: 1,
              }}>{levelInfo.current.level}</span>
            </motion.div>
          </motion.div>

          {/* Username */}
          <motion.h1
            style={{
              fontSize: 28, fontWeight: 800, marginTop: 16, letterSpacing: -0.5, lineHeight: 1.2,
              background: `linear-gradient(135deg, #FFFFFF 0%, #E0E0E0 50%, ${GOLD}88 100%)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              margin: '16px 0 0',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            {p.username}
          </motion.h1>

          {/* Title / Class - clickable for own profile to pick title */}
          <motion.div
            onClick={isOwnProfile ? () => setShowTitlePicker(!showTitlePicker) : undefined}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              marginTop: 8, padding: '6px 16px', borderRadius: 20,
              background: `linear-gradient(135deg, ${levelColor}15, ${PURPLE}10)`,
              border: `1px solid ${levelColor}30`,
              animation: 'rpg-level-badge-glow 3s ease-in-out infinite',
              cursor: isOwnProfile ? 'pointer' : 'default',
              position: 'relative',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
            whileHover={isOwnProfile ? { scale: 1.05 } : {}}
            whileTap={isOwnProfile ? { scale: 0.97 } : {}}
          >
            <Crown size={14} color={GOLD} fill={GOLD} />
            <span style={{
              fontSize: 13, fontWeight: 700, color: levelColor,
              textTransform: 'uppercase', letterSpacing: 1.5,
            }}>
              {p.selected_title || levelInfo.current.title}
            </span>
            <span style={{ fontSize: 11, color: MUTED_LIGHT }}>
              Lv.{levelInfo.current.level}
            </span>
            {isOwnProfile && (
              <Edit3 size={10} color={MUTED_LIGHT} style={{ marginLeft: 2 }} />
            )}
          </motion.div>

          {/* Title Picker Dropdown */}
          <AnimatePresence>
            {showTitlePicker && isOwnProfile && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -5 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -5 }}
                transition={{ duration: 0.25 }}
                style={{
                  marginTop: 8, width: '100%', maxWidth: 320, overflow: 'hidden',
                }}
              >
                <div style={{
                  padding: '12px 14px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(0,212,255,0.12)',
                  display: 'flex', flexWrap: 'wrap', gap: 6,
                  justifyContent: 'center',
                }}>
                  <span style={{ width: '100%', textAlign: 'center', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>
                    Select Your Title
                  </span>
                  {availableTitles.map((t) => (
                    <motion.button
                      key={t.level}
                      className="rpg-title-option"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        // Optimistically update local state
                        setProfile((prev) => ({ ...prev, selected_title: t.title }));
                        setShowTitlePicker(false);
                        // Persist to server (fire-and-forget)
                        if (user?.id) {
                          API.auth.updateUser(user.id, { selected_title: t.title }).catch(() => {});
                        }
                      }}
                      style={{
                        padding: '5px 12px', borderRadius: 10,
                        border: `1px solid ${(p.selected_title || levelInfo.current.title) === t.title ? `${GOLD}50` : 'rgba(255,255,255,0.08)'}`,
                        background: (p.selected_title || levelInfo.current.title) === t.title
                          ? `linear-gradient(135deg, ${GOLD}15, ${PURPLE}08)`
                          : 'rgba(255,255,255,0.02)',
                        color: (p.selected_title || levelInfo.current.title) === t.title ? GOLD : MUTED_LIGHT,
                        fontSize: 11, fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {t.title}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Share Profile Button */}
          {isOwnProfile && (
            <motion.button
              className="rpg-share-btn"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                const ok = await shareContent({
                  title: `${p.display_name || p.username}'s Profile — Social Dilemma's`,
                  text: `Check out ${p.display_name || p.username} on Social Dilemma's! Level ${p.level || 1} player.`,
                  url: `${window.location.origin}/profile/${p.id}`,
                });
                if (ok && !navigator.share) {
                  setProfileShareCopied(true);
                  setTimeout(() => setProfileShareCopied(false), 2000);
                }
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginTop: 14, padding: '10px 24px', borderRadius: 14,
                border: '1px solid rgba(191,90,242,0.3)',
                background: 'linear-gradient(135deg, rgba(191,90,242,0.1), rgba(0,212,255,0.06))',
                color: PURPLE, fontSize: 13, fontWeight: 700,
                cursor: 'pointer', letterSpacing: 0.3,
                transition: 'all 0.25s ease',
              }}
            >
              <Share2 size={15} />
              {profileShareCopied ? 'Link Copied!' : 'Share Profile'}
            </motion.button>
          )}

          {/* Bio */}
          {p.bio && (
            <motion.p
              style={{
                fontSize: 14, color: MUTED_LIGHT, marginTop: 10,
                maxWidth: 320, lineHeight: 1.6, fontStyle: 'italic',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              "{p.bio}"
            </motion.p>
          )}

          {/* ── XP Progress Bar ── */}
          <motion.div
            style={{ width: '100%', maxWidth: 320, marginTop: 20 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              marginBottom: 8,
            }}>
              <span style={{ fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                Experience
              </span>
              <span style={{ fontSize: 12, color: MUTED_LIGHT, fontWeight: 600 }}>
                {currentXP.toLocaleString()}
                {levelInfo.next ? ` / ${levelInfo.next.xp.toLocaleString()} XP` : ' XP (MAX)'}
              </span>
            </div>
            <div style={{
              width: '100%', height: 12, borderRadius: 6,
              background: 'rgba(255,255,255,0.06)',
              overflow: 'hidden',
              position: 'relative',
              border: '1px solid rgba(255,255,255,0.04)',
            }}>
              <motion.div
                className="rpg-xp-bar-inner"
                style={{
                  height: '100%', borderRadius: 5,
                  background: `linear-gradient(90deg, ${PURPLE}, ${CYAN}, ${GOLD})`,
                  backgroundSize: '200% 100%',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${levelInfo.progress * 100}%` }}
                transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
              >
                {/* Shimmer overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'rpg-xp-shimmer 2s linear infinite',
                }} />
              </motion.div>
            </div>
            {levelInfo.next && (
              <div style={{
                fontSize: 11, color: GOLD_DIM, marginTop: 6, textAlign: 'center', fontWeight: 600,
              }}>
                {(levelInfo.next.xp - currentXP).toLocaleString()} XP to Level {levelInfo.next.level}
                <span style={{ color: MUTED, fontWeight: 400 }}> ({levelInfo.next.title})</span>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════
            STATS GRID — 4 glowing cards
           ══════════════════════════════════════════════════════════ */}
        <motion.div
          style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 12, margin: '0 20px',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {[
            {
              icon: <Swords size={18} color={CYAN} />,
              value: (p.total_answers ?? 0).toLocaleString(),
              label: 'Total Votes',
              color: CYAN,
            },
            {
              icon: <Target size={18} color={GREEN} />,
              value: `${winRate}%`,
              label: 'Win Rate',
              color: GREEN,
            },
            {
              icon: <Flame size={18} color="#FF6B35" />,
              value: streak.current_streak ?? 0,
              label: 'Current Streak',
              color: '#FF6B35',
              isStreak: true,
            },
            {
              icon: <Trophy size={18} color={GOLD} />,
              value: streak.best_streak ?? 0,
              label: 'Best Streak',
              color: GOLD,
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="rpg-stat-card"
              style={{
                background: `linear-gradient(135deg, ${stat.color}08, ${stat.color}03)`,
                border: `1px solid ${stat.color}18`,
                borderRadius: 16, padding: '18px 16px',
                display: 'flex', flexDirection: 'column', gap: 8,
                position: 'relative', overflow: 'hidden',
                transition: 'all 0.3s ease',
                cursor: 'default',
              }}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.55 + i * 0.08 }}
            >
              {/* Corner glow */}
              <div style={{
                position: 'absolute', top: -20, right: -20,
                width: 60, height: 60, borderRadius: '50%',
                background: `radial-gradient(circle, ${stat.color}10, transparent)`,
              }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {stat.icon}
                <span style={{
                  fontSize: 11, color: MUTED, textTransform: 'uppercase',
                  letterSpacing: 1, fontWeight: 600,
                }}>{stat.label}</span>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{
                  fontSize: 28, fontWeight: 800, color: '#fff',
                  letterSpacing: -1,
                  ...(stat.isStreak && (streak.current_streak ?? 0) > 0
                    ? { animation: 'rpg-streak-fire 2s ease-in-out infinite' }
                    : {}),
                }}>
                  {stat.value}
                </span>
                {stat.isStreak && (streak.current_streak ?? 0) >= 3 && (
                  <motion.div
                    style={{ display: 'flex' }}
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  >
                    <Flame size={20} color="#FF6B35" fill="#FF6B35" style={{
                      filter: 'drop-shadow(0 0 4px rgba(255,107,53,0.5))',
                      animation: 'rpg-flame-flicker 0.8s ease-in-out infinite',
                    }} />
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Streak Freeze Card (own profile only) ── */}
        {isOwnProfile && (streak.current_streak ?? 0) > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            style={{
              margin: '12px 16px 0',
              padding: '16px 20px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(99,179,237,0.08), rgba(99,179,237,0.03))',
              border: '1px solid rgba(99,179,237,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(99,179,237,0.15), rgba(99,179,237,0.05))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Snowflake size={22} color="#63B3ED" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#E2E8F0', marginBottom: 3 }}>
                Streak Freeze
              </div>
              <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.4 }}>
                {freezesRemaining > 0
                  ? `${freezesRemaining} freeze available this week. Protect your ${streak.current_streak}-day streak!`
                  : 'No freezes left this week. Come back Monday!'}
              </div>
            </div>
            <button
              onClick={handleUseFreeze}
              disabled={freezesRemaining <= 0 || freezeLoading}
              style={{
                padding: '10px 18px',
                borderRadius: 12,
                border: 'none',
                background: freezesRemaining > 0
                  ? 'linear-gradient(135deg, #63B3ED, #4299E1)'
                  : 'rgba(255,255,255,0.05)',
                color: freezesRemaining > 0 ? '#fff' : MUTED,
                fontSize: 13,
                fontWeight: 700,
                cursor: freezesRemaining > 0 ? 'pointer' : 'default',
                opacity: freezeLoading ? 0.6 : 1,
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}
            >
              {freezeLoading ? 'Using...' : freezesRemaining > 0 ? 'Activate' : 'Used'}
            </button>
          </motion.div>
        )}

        {/* ── Action buttons for other user's profile ── */}
        {!isOwnProfile && (
          <motion.div
            style={{
              display: 'flex', gap: 10, margin: '16px 20px 0', flexWrap: 'wrap',
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            {friendStatus === 'friends' ? (
              <button
                style={{
                  flex: 1, minWidth: 100, padding: '12px 16px', borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none',
                  background: 'rgba(239,68,68,0.1)', color: RED,
                  transition: 'all 0.2s ease',
                }}
                onClick={handleRemoveFriend}
              >
                <UserMinus size={16} /> Unfriend
              </button>
            ) : friendStatus === 'pending' ? (
              <button
                style={{
                  flex: 1, minWidth: 100, padding: '12px 16px', borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  fontSize: 14, fontWeight: 600, border: 'none',
                  background: 'rgba(255,255,255,0.05)', color: MUTED,
                  cursor: 'default',
                }}
                disabled
              >
                <UserPlus size={16} /> Pending
              </button>
            ) : (
              <button
                style={{
                  flex: 1, minWidth: 100, padding: '12px 16px', borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none',
                  background: `linear-gradient(135deg, ${GOLD}, #FF2D78)`,
                  color: '#fff',
                  transition: 'all 0.2s ease',
                }}
                onClick={handleAddFriend}
              >
                <UserPlus size={16} /> Add Friend
              </button>
            )}
            <button
              style={{
                padding: '12px 16px', borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', border: 'none',
                background: 'rgba(255,255,255,0.04)',
                color: '#777', minWidth: 48,
                transition: 'all 0.2s ease',
              }}
              onClick={handleBlock}
              title="Block user"
            >
              <Shield size={16} />
            </button>
            <button
              style={{
                padding: '12px 16px', borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', border: 'none',
                background: 'rgba(255,255,255,0.04)',
                color: '#777', minWidth: 48,
                transition: 'all 0.2s ease',
              }}
              onClick={handleReport}
              title="Report user"
            >
              <Flag size={16} />
            </button>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════
            STREAK DISPLAY — with flame animation
           ══════════════════════════════════════════════════════════ */}
        <motion.div
          style={{
            margin: '20px 20px 0', borderRadius: 16, padding: 20,
            background: `linear-gradient(135deg, rgba(255,107,53,0.06) 0%, rgba(0,212,255,0.04) 50%, rgba(191,90,242,0.03) 100%)`,
            border: '1px solid rgba(255,107,53,0.12)',
            display: 'flex', alignItems: 'center', gap: 20,
            position: 'relative', overflow: 'hidden',
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {/* Background fire glow */}
          {(streak.current_streak ?? 0) >= 3 && (
            <div style={{
              position: 'absolute', bottom: -20, left: 20,
              width: 100, height: 100, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,107,53,0.15), transparent)',
              animation: 'rpg-glow-pulse 2s ease-in-out infinite',
            }} />
          )}

          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80,
            position: 'relative',
          }}>
            <motion.div style={{ position: 'relative' }}>
              {/* Flames behind the number */}
              {(streak.current_streak ?? 0) >= 1 && (
                <motion.div
                  style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  }}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  <Flame size={28} color="#FF6B35" fill="#FF6B35" style={{
                    filter: 'drop-shadow(0 0 8px rgba(255,107,53,0.6))',
                    animation: 'rpg-flame-flicker 0.6s ease-in-out infinite',
                    opacity: 0.7,
                  }} />
                </motion.div>
              )}
              <motion.span
                style={{
                  fontSize: 48, fontWeight: 900, lineHeight: 1,
                  background: `linear-gradient(135deg, #00D4FF 0%, #FF6B35 50%, #FF4500 100%)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  position: 'relative',
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: 'spring', stiffness: 200, damping: 12 }}
              >
                {streak.current_streak ?? 0}
              </motion.span>
            </motion.div>
            <span style={{
              fontSize: 10, color: MUTED, marginTop: 4,
              textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700,
            }}>Day Streak</span>
          </div>

          <div style={{ flex: 1, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Flame size={16} color={GOLD} fill={GOLD} />
              <span style={{
                fontSize: 15, fontWeight: 700,
                color: (streak.current_streak ?? 0) >= 3 ? GOLD : MUTED_LIGHT,
              }}>
                {(streak.current_streak ?? 0) >= 7 ? 'UNSTOPPABLE!'
                  : (streak.current_streak ?? 0) >= 3 ? 'On Fire!'
                  : (streak.current_streak ?? 0) >= 1 ? 'Keep it going!'
                  : 'Start your streak!'}
              </span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 14, color: MUTED_LIGHT,
            }}>
              <Trophy size={14} color={MUTED} />
              <span>Best: <strong style={{ color: GOLD }}>{streak.best_streak ?? 0}</strong> days</span>
            </div>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════
            SEASON STATS
           ══════════════════════════════════════════════════════════ */}
        <motion.div
          style={{
            margin: '16px 20px 0', borderRadius: 16, padding: 20,
            background: `linear-gradient(135deg, ${PURPLE}0A 0%, ${GOLD}06 100%)`,
            border: `1px solid ${PURPLE}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'relative', overflow: 'hidden',
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          {/* Decorative corner */}
          <div style={{
            position: 'absolute', top: -30, right: -30,
            width: 80, height: 80, borderRadius: '50%',
            background: `radial-gradient(circle, ${PURPLE}10, transparent)`,
          }} />

          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4,
            }}>
              <Zap size={14} color={PURPLE_LIGHT} />
              <span style={{
                fontSize: 11, color: MUTED, textTransform: 'uppercase',
                letterSpacing: 1.2, fontWeight: 600,
              }}>Season Points</span>
            </div>
            <span style={{
              fontSize: 28, fontWeight: 800, color: PURPLE_LIGHT,
              letterSpacing: -0.5,
            }}>
              {(p.season_points ?? 0).toLocaleString()}
            </span>
          </div>

          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
          }}>
            <span style={{
              fontSize: 11, color: MUTED, textTransform: 'uppercase',
              letterSpacing: 1.2, fontWeight: 600, marginBottom: 4,
            }}>Season Rank</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Crown size={20} color={GOLD} fill={GOLD} style={{
                filter: `drop-shadow(0 0 6px ${GOLD}40)`,
              }} />
              <span style={{
                fontSize: 28, fontWeight: 800, color: GOLD,
                letterSpacing: -0.5,
              }}>
                #{p.season_rank ?? '--'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════
            TOP CATEGORIES — what the user votes in most
           ══════════════════════════════════════════════════════════ */}
        {topCategories.length > 0 && (
          <motion.div
            style={{
              margin: '16px 20px 0', borderRadius: 16, padding: '18px 20px',
              background: CARD,
              border: `1px solid ${CARD_BORDER}`,
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.67 }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
            }}>
              <Grid size={14} color={PURPLE_LIGHT} />
              <span style={{
                fontSize: 12, fontWeight: 700, color: MUTED,
                textTransform: 'uppercase', letterSpacing: 1.2,
              }}>Top Categories</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topCategories.map((tc, i) => {
                const color = PROFILE_CAT_COLORS[tc.cat] || '#64748b';
                const emoji = PROFILE_CAT_EMOJIS[tc.cat] || '\u{2728}';
                return (
                  <motion.div
                    key={tc.cat}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.72 + i * 0.06 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                  >
                    <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                        marginBottom: 4,
                      }}>
                        <span style={{
                          fontSize: 13, fontWeight: 700, color: '#e2e8f0',
                          textTransform: 'capitalize',
                        }}>{tc.cat}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: MUTED_LIGHT }}>
                          {tc.count} votes
                        </span>
                      </div>
                      <div style={{
                        width: '100%', height: 6, borderRadius: 3,
                        background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
                      }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${tc.pct}%` }}
                          transition={{ duration: 0.8, delay: 0.8 + i * 0.06, ease: 'easeOut' }}
                          style={{
                            height: '100%', borderRadius: 3,
                            background: `linear-gradient(90deg, ${color}, ${color}88)`,
                            boxShadow: `0 0 6px ${color}30`,
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════
            ACTIVITY SUMMARY — Weekly votes bar chart
           ══════════════════════════════════════════════════════════ */}
        <motion.div
          style={{
            margin: '16px 20px 0', borderRadius: 16, padding: '18px 20px',
            background: CARD,
            border: `1px solid ${CARD_BORDER}`,
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
          }}>
            <BarChart3 size={14} color={CYAN} />
            <span style={{
              fontSize: 12, fontWeight: 700, color: MUTED,
              textTransform: 'uppercase', letterSpacing: 1.2,
            }}>Activity This Week</span>
          </div>

          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: 8,
            height: 80, paddingBottom: 0,
          }}>
            {weeklyVotes.map((d, i) => (
              <div key={d.day} style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 4, height: '100%',
                justifyContent: 'flex-end',
              }}>
                <motion.div
                  style={{
                    width: '100%', borderRadius: 4,
                    background: i === 6
                      ? `linear-gradient(180deg, ${CYAN}, ${CYAN}80)`
                      : `linear-gradient(180deg, ${PURPLE}60, ${PURPLE}30)`,
                    minHeight: 4,
                    boxShadow: i === 6 ? `0 0 8px ${CYAN}30` : 'none',
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.count / maxWeeklyVote) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.8 + i * 0.05, ease: 'easeOut' }}
                />
                <span style={{
                  fontSize: 9, color: i === 6 ? CYAN : MUTED,
                  fontWeight: i === 6 ? 700 : 500,
                  textTransform: 'uppercase', letterSpacing: 0.5,
                }}>{d.day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════
            BADGES / ACHIEVEMENTS
           ══════════════════════════════════════════════════════════ */}
        <motion.div
          style={{
            margin: '16px 20px 0', borderRadius: 16, padding: '18px 20px',
            background: `linear-gradient(160deg, rgba(0,212,255,0.04) 0%, ${CARD} 40%, rgba(191,90,242,0.03) 100%)`,
            border: `1px solid ${CARD_BORDER}`,
            animation: 'rpg-badge-case-glow 4s ease-in-out infinite',
            position: 'relative', overflow: 'hidden',
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
        >
          {/* Badge case decorative corners */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: 40, height: 40,
            borderTop: `2px solid ${GOLD}30`, borderLeft: `2px solid ${GOLD}30`,
            borderRadius: '16px 0 0 0', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: 0, right: 0, width: 40, height: 40,
            borderTop: `2px solid ${GOLD}30`, borderRight: `2px solid ${GOLD}30`,
            borderRadius: '0 16px 0 0', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, width: 40, height: 40,
            borderBottom: `2px solid ${GOLD}20`, borderLeft: `2px solid ${GOLD}20`,
            borderRadius: '0 0 0 16px', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: 0, right: 0, width: 40, height: 40,
            borderBottom: `2px solid ${GOLD}20`, borderRight: `2px solid ${GOLD}20`,
            borderRadius: '0 0 16px 0', pointerEvents: 'none',
          }} />

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: `linear-gradient(135deg, ${GOLD}20, ${GOLD}08)`,
                border: `1px solid ${GOLD}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Award size={14} color={GOLD} />
              </div>
              <div>
                <span style={{
                  fontSize: 13, fontWeight: 800, color: '#e2e8f0',
                  display: 'block', letterSpacing: 0.3,
                }}>Badge Case</span>
                <span style={{
                  fontSize: 10, color: MUTED, fontWeight: 500,
                }}>Collection Showcase</span>
              </div>
            </div>
            <div style={{
              padding: '4px 12px', borderRadius: 10,
              background: `linear-gradient(135deg, ${GOLD}15, ${GOLD}08)`,
              border: `1px solid ${GOLD}25`,
            }}>
              <span style={{
                fontSize: 12, color: GOLD, fontWeight: 800,
              }}>
                {badges.length}
              </span>
              <span style={{ fontSize: 10, color: GOLD_DIM, fontWeight: 500, marginLeft: 4 }}>
                earned
              </span>
            </div>
          </div>

          {badges.length > 0 ? (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
              gap: 14, paddingBottom: 6,
            }}>
              {badges.map((badge, i) => {
                const iconKey = badge.icon || (badge.badge_icon || '').toLowerCase();
                const Icon = badgeIconMap[iconKey] || Award;
                const color = badge.color || badge.badge_color || GOLD;
                return (
                  <motion.div
                    key={badge.id}
                    className="rpg-badge-item"
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: 8, cursor: 'default',
                      transition: 'transform 0.2s ease',
                      padding: '10px 6px',
                      borderRadius: 14,
                      background: `radial-gradient(ellipse at center, ${color}08, transparent)`,
                    }}
                    initial={{ opacity: 0, scale: 0.6, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.07, type: 'spring', stiffness: 200 }}
                  >
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `2px solid ${color}`,
                      background: `radial-gradient(circle at 30% 30%, ${color}20, ${color}08)`,
                      boxShadow: `0 0 20px ${color}25, inset 0 0 12px ${color}10`,
                      position: 'relative',
                      overflow: 'hidden',
                    }}>
                      {/* Shine effect */}
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: `linear-gradient(135deg, transparent 30%, ${color}15 50%, transparent 70%)`,
                        backgroundSize: '300% 100%',
                        animation: 'rpg-badge-shine 3s ease-in-out infinite',
                      }} />
                      <Icon size={24} color={color} style={{
                        filter: `drop-shadow(0 0 6px ${color}60)`,
                        position: 'relative',
                      }} />
                    </div>
                    <span style={{
                      fontSize: 10, color: MUTED_LIGHT, textAlign: 'center',
                      maxWidth: 80, whiteSpace: 'nowrap', overflow: 'hidden',
                      textOverflow: 'ellipsis', fontWeight: 600,
                    }}>{badge.label || badge.badge_name || badge.badge_type || badge.badge_id}</span>
                  </motion.div>
                );
              })}

              {/* Locked badge placeholders */}
              {Array.from({ length: Math.max(0, 4 - badges.length) }).map((_, i) => (
                <div
                  key={`locked-${i}`}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 8, opacity: 0.25, padding: '10px 6px',
                  }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px dashed rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.02)',
                  }}>
                    <Lock size={18} color={MUTED} />
                  </div>
                  <span style={{
                    fontSize: 10, color: MUTED, textAlign: 'center', fontWeight: 500,
                  }}>Locked</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '24px 0', gap: 8,
            }}>
              {/* Show locked placeholders when no badges */}
              <div style={{ display: 'flex', gap: 14, marginBottom: 8 }}>
                {[Award, Star, Crown, Zap, Trophy].map((Icon, i) => (
                  <div
                    key={i}
                    style={{
                      width: 48, height: 48, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px dashed rgba(255,255,255,0.06)',
                      background: 'rgba(255,255,255,0.02)',
                      opacity: 0.25 + (i === 2 ? 0.1 : 0),
                    }}
                  >
                    <Lock size={16} color={MUTED} />
                  </div>
                ))}
              </div>
              <span style={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>
                No achievements unlocked yet
              </span>
              <span style={{ fontSize: 11, color: MUTED, opacity: 0.6 }}>
                Keep playing to earn badges!
              </span>
            </div>
          )}
        </motion.div>

        {/* ══════════════════════════════════════════════════════════
            RECENT ACTIVITY
           ══════════════════════════════════════════════════════════ */}
        <motion.div
          style={{
            margin: '16px 20px 0', borderRadius: 16, padding: '18px 20px',
            background: CARD,
            border: `1px solid ${CARD_BORDER}`,
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
          }}>
            <TrendingUp size={14} color={PURPLE_LIGHT} />
            <span style={{
              fontSize: 12, fontWeight: 700, color: MUTED,
              textTransform: 'uppercase', letterSpacing: 1.2,
            }}>Recent Activity</span>
          </div>

          {activities.length === 0 ? (
            <div style={{
              fontSize: 13, color: MUTED, textAlign: 'center', padding: '20px 0',
            }}>
              No recent activity
            </div>
          ) : activities.slice(0, 5).map((act, i, arr) => (
            <div
              key={act.id || i}
              className="rpg-activity-row"
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 8px', borderRadius: 8,
                borderBottom: i === arr.length - 1
                  ? 'none' : '1px solid rgba(255,255,255,0.03)',
                transition: 'background 0.2s ease',
              }}
            >
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: `linear-gradient(135deg, ${PURPLE}, ${CYAN})`,
                boxShadow: `0 0 6px ${PURPLE}40`,
                flexShrink: 0,
              }} />
              <div style={{
                flex: 1, fontSize: 14, color: '#ccc', lineHeight: 1.5,
              }}>
                {act.description || act.verb}
              </div>
              <div style={{ fontSize: 11, color: MUTED, flexShrink: 0, fontWeight: 500 }}>
                {act.time || act.created_at || ''}
              </div>
            </div>
          ))}
        </motion.div>

        {/* ══════════════════════════════════════════════════════════
            SETTINGS (own profile only)
           ══════════════════════════════════════════════════════════ */}
        {isOwnProfile && (
          <motion.div
            style={{
              margin: '16px 20px 0', borderRadius: 16, padding: '18px 20px',
              background: CARD,
              border: `1px solid ${CARD_BORDER}`,
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
            }}>
              <Shield size={14} color={MUTED_LIGHT} />
              <span style={{
                fontSize: 12, fontWeight: 700, color: MUTED,
                textTransform: 'uppercase', letterSpacing: 1.2,
              }}>Settings</span>
            </div>

            {/* Visibility Toggle */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 0',
              borderBottom: '1px solid rgba(255,255,255,0.03)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: '#ddd' }}>
                {visibility === 'public' ? (
                  <Eye size={18} color={GOLD} />
                ) : (
                  <EyeOff size={18} color={MUTED} />
                )}
                <span>Profile Visibility</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: 12, fontWeight: 600,
                  color: visibility === 'public' ? GREEN : MUTED,
                }}>
                  {visibility === 'public' ? 'Public' : 'Private'}
                </span>
                <button
                  style={{
                    width: 48, height: 26, borderRadius: 13, padding: 2,
                    cursor: 'pointer', border: 'none', position: 'relative',
                    transition: 'background 0.3s ease',
                    background: visibility === 'public'
                      ? `linear-gradient(135deg, ${GOLD}, #FF2D78)`
                      : 'rgba(255,255,255,0.1)',
                  }}
                  onClick={handleToggleVisibility}
                  aria-label="Toggle visibility"
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', background: '#fff',
                    transition: 'transform 0.3s ease',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                    transform: visibility === 'public' ? 'translateX(22px)' : 'translateX(0px)',
                  }} />
                </button>
              </div>
            </div>

            {/* Edit Profile Button / Section */}
            {!showEditProfile ? (
              <button
                className="rpg-btn-edit"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  width: '100%', padding: '14px 0', borderRadius: 12,
                  border: `1px solid ${GOLD}50`,
                  background: `linear-gradient(135deg, rgba(0,212,255,0.08), rgba(191,90,242,0.04))`,
                  color: GOLD, fontSize: 15, fontWeight: 700, letterSpacing: 0.3,
                  cursor: 'pointer', marginTop: 16,
                  transition: 'all 0.3s ease',
                  boxShadow: `0 0 12px rgba(0,212,255,0.06)`,
                }}
                onClick={() => {
                  setEditUsername(p.username || '');
                  setEditBio(p.bio || '');
                  setShowEditProfile(true);
                }}
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  marginTop: 16, padding: '18px 16px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(0,212,255,0.12)',
                }}
              >
                <div style={{
                  fontSize: 13, fontWeight: 700, color: MUTED,
                  textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 14,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <Edit3 size={13} color={GOLD} />
                  Edit Profile
                </div>

                {/* Username field */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{
                    fontSize: 11, fontWeight: 600, color: MUTED_LIGHT,
                    display: 'block', marginBottom: 6,
                  }}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    maxLength={30}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 10,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#fff', fontSize: 14, fontFamily: 'inherit',
                      outline: 'none', boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = `${GOLD}50`; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  />
                </div>

                {/* Bio/about field */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{
                    fontSize: 11, fontWeight: 600, color: MUTED_LIGHT,
                    display: 'flex', justifyContent: 'space-between', marginBottom: 6,
                  }}>
                    <span>Bio</span>
                    <span style={{ color: MUTED, fontWeight: 400 }}>{editBio.length}/150</span>
                  </label>
                  <textarea
                    value={editBio}
                    onChange={(e) => {
                      if (e.target.value.length <= 150) setEditBio(e.target.value);
                    }}
                    maxLength={150}
                    rows={3}
                    placeholder="Tell the world about yourself..."
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 10,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#fff', fontSize: 14, fontFamily: 'inherit',
                      outline: 'none', resize: 'none', boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = `${GOLD}50`; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  />
                </div>

                {/* Save / Cancel buttons */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={handleSaveProfile}
                    disabled={editSaving}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '12px 0', borderRadius: 10, border: 'none',
                      background: `linear-gradient(135deg, ${GOLD}, #FF2D78)`,
                      color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                      opacity: editSaving ? 0.6 : 1,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    {editSaving ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        style={{ display: 'flex' }}
                      >
                        <Loader size={16} />
                      </motion.div>
                    ) : (
                      <>
                        <Save size={15} />
                        Save
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowEditProfile(false)}
                    style={{
                      padding: '12px 20px', borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.04)',
                      color: MUTED_LIGHT, fontSize: 14, fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

            {/* Sign Out Button */}
            <button
              className="rpg-btn-logout"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                width: '100%', padding: '14px 0', borderRadius: 12,
                border: `1px solid rgba(239,68,68,0.2)`,
                background: 'rgba(239,68,68,0.06)',
                color: RED, fontSize: 15, fontWeight: 600, letterSpacing: 0.3,
                cursor: 'pointer', marginTop: 12,
                transition: 'all 0.3s ease',
              }}
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </motion.div>
        )}

        {/* Bottom spacer */}
        <div style={{ height: 90 }} />
      </div>
    </div>
  );
}
