import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Users, CheckCircle, Activity, HelpCircle,
  Plus, Edit3, Trash2, Star, Eye, EyeOff, AlertTriangle,
  Calendar, Zap, ChevronDown, X, Search, Filter,
  BarChart3, Flag, UserX, RefreshCw, Clock, Trophy,
  Ban, MessageSquare, TrendingUp, Gift, ArrowUpDown,
  Hash, Percent, Target, Award, ChevronRight,
  Power, Timer, Flame, Sparkles, Crown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as API from '../services/api';
import { CATEGORIES } from '../utils/constants';

// ── Keyframes ────────────────────────────────────────────
const keyframesId = 'lux-admin-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(keyframesId)) {
  const style = document.createElement('style');
  style.id = keyframesId;
  style.textContent = `
    @keyframes adminFadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes adminPulse {
      0%, 100% { box-shadow: 0 0 20px rgba(0,212,255,0.08); }
      50%      { box-shadow: 0 0 30px rgba(0,212,255,0.15); }
    }
    @keyframes adminGlow {
      0%, 100% { opacity: 0.6; }
      50%      { opacity: 1; }
    }
    @keyframes barGrow {
      from { transform: scaleY(0); }
      to   { transform: scaleY(1); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes slideDown {
      from { opacity: 0; max-height: 0; }
      to   { opacity: 1; max-height: 800px; }
    }
    @keyframes countdownPulse {
      0%, 100% { transform: scale(1); }
      50%      { transform: scale(1.05); }
    }
  `;
  document.head.appendChild(style);
}

// ── Color palette ────────────────────────────────────────
const C = {
  gold: '#00D4FF',
  goldLight: '#33E0FF',
  goldDim: 'rgba(0,212,255,0.15)',
  goldGlow: 'rgba(0,212,255,0.25)',
  purple: '#BF5AF2',
  purpleDim: 'rgba(191,90,242,0.15)',
  purpleGlow: 'rgba(191,90,242,0.25)',
  cyan: '#00D4FF',
  cyanDim: 'rgba(0,212,255,0.15)',
  cyanGlow: 'rgba(0,212,255,0.25)',
  bg: '#050510',
  bgCard: 'rgba(255,255,255,0.03)',
  bgCardHover: 'rgba(255,255,255,0.06)',
  bgInput: 'rgba(255,255,255,0.05)',
  border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.12)',
  text: '#ffffff',
  textMuted: 'rgba(255,255,255,0.5)',
  textDim: 'rgba(255,255,255,0.3)',
  green: '#22c55e',
  greenDim: 'rgba(34,197,94,0.15)',
  red: '#ef4444',
  redDim: 'rgba(239,68,68,0.15)',
  orange: '#f97316',
  orangeDim: 'rgba(249,115,22,0.15)',
  blue: '#3b82f6',
  blueDim: 'rgba(59,130,246,0.15)',
};

// ── Styles ───────────────────────────────────────────────
const s = {
  page: {
    minHeight: '100vh',
    background: `linear-gradient(180deg, ${C.bg} 0%, #0d0b14 50%, ${C.bg} 100%)`,
    fontFamily: "'Inter', sans-serif",
    color: C.text,
    paddingBottom: 40,
  },
  denied: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', background: C.bg,
    fontFamily: "'Inter', sans-serif", color: C.text, gap: 16,
  },
  deniedIcon: { color: C.red, marginBottom: 8 },
  deniedTitle: {
    fontSize: 28, fontWeight: 800, margin: 0,
    background: `linear-gradient(135deg, ${C.red}, ${C.orange})`,
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  deniedText: { color: C.textMuted, fontSize: 15, margin: 0 },
  header: {
    padding: '28px 24px 20px', borderBottom: `1px solid ${C.border}`,
    background: 'rgba(255,255,255,0.01)', backdropFilter: 'blur(20px)',
    position: 'sticky', top: 0, zIndex: 50,
  },
  headerTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  headerIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22, fontWeight: 800, margin: 0,
    background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldLight} 100%)`,
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  headerSub: {
    fontSize: 12, color: C.textDim, margin: 0, marginTop: 2,
    textTransform: 'uppercase', letterSpacing: 1.5,
  },
  refreshBtn: {
    width: 40, height: 40, borderRadius: 10, border: `1px solid ${C.border}`,
    background: C.bgCard, color: C.textMuted, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
  },
  tabs: {
    display: 'flex', gap: 4, overflowX: 'auto', scrollbarWidth: 'none',
    msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch',
  },
  tab: {
    padding: '10px 18px', borderRadius: 10, border: 'none', background: 'transparent',
    color: C.textMuted, fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif",
    cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
    display: 'flex', alignItems: 'center', gap: 7,
  },
  tabActive: { background: C.goldDim, color: C.gold },
  content: { padding: '24px 20px', maxWidth: 1200, margin: '0 auto', animation: 'adminFadeIn 0.4s ease-out' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 28 },
  statCard: {
    background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16,
    padding: '20px 18px', position: 'relative', overflow: 'hidden',
    animation: 'adminPulse 4s ease-in-out infinite', transition: 'transform 0.2s, border-color 0.2s',
  },
  statIconWrap: { width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statNumber: { fontSize: 28, fontWeight: 800, margin: 0, lineHeight: 1, marginBottom: 4 },
  statLabel: { fontSize: 12, color: C.textMuted, margin: 0, fontWeight: 500 },
  statGlow: {
    position: 'absolute', top: -20, right: -20, width: 80, height: 80,
    borderRadius: '50%', filter: 'blur(30px)', opacity: 0.3, pointerEvents: 'none',
  },
  chartCard: { background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, marginBottom: 24 },
  chartTitle: { fontSize: 16, fontWeight: 700, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 8 },
  chartContainer: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 160, gap: 8, padding: '0 8px' },
  chartBarWrap: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' },
  chartBar: {
    width: '100%', maxWidth: 48, borderRadius: '8px 8px 4px 4px', transformOrigin: 'bottom',
    animation: 'barGrow 0.8s ease-out forwards', position: 'relative', cursor: 'pointer', transition: 'filter 0.2s',
  },
  chartLabel: { fontSize: 11, color: C.textDim, fontWeight: 600, textTransform: 'uppercase' },
  chartValue: { fontSize: 11, color: C.textMuted, fontWeight: 600 },
  sectionTitle: { fontSize: 18, fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 10 },
  formCard: {
    background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16,
    padding: 24, marginBottom: 20, animation: 'slideDown 0.3s ease-out', overflow: 'hidden',
  },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  formFull: { gridColumn: '1 / -1' },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 },
  input: {
    width: '100%', padding: '12px 14px', background: C.bgInput, border: `1px solid ${C.border}`,
    borderRadius: 10, color: C.text, fontSize: 14, fontFamily: "'Inter', sans-serif",
    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box',
  },
  inputFocus: { borderColor: 'rgba(0,212,255,0.4)', boxShadow: '0 0 0 3px rgba(0,212,255,0.08)' },
  textarea: {
    width: '100%', padding: '12px 14px', background: C.bgInput, border: `1px solid ${C.border}`,
    borderRadius: 10, color: C.text, fontSize: 14, fontFamily: "'Inter', sans-serif",
    outline: 'none', resize: 'vertical', minHeight: 60, transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box',
  },
  select: {
    width: '100%', padding: '12px 14px', background: C.bgInput, border: `1px solid ${C.border}`,
    borderRadius: 10, color: C.text, fontSize: 14, fontFamily: "'Inter', sans-serif",
    outline: 'none', cursor: 'pointer', appearance: 'none', boxSizing: 'border-box',
  },
  checkRow: { display: 'flex', alignItems: 'center', gap: 10 },
  checkbox: { width: 18, height: 18, accentColor: C.gold, cursor: 'pointer' },
  checkLabel: { fontSize: 14, color: C.textMuted, cursor: 'pointer' },
  btnPrimary: {
    padding: '12px 24px', borderRadius: 10, border: 'none',
    background: `linear-gradient(135deg, ${C.gold}, #FF2D78)`, color: '#fff',
    fontSize: 14, fontWeight: 700, fontFamily: "'Inter', sans-serif", cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
  },
  btnSecondary: {
    padding: '10px 18px', borderRadius: 10, border: `1px solid ${C.border}`,
    background: C.bgCard, color: C.textMuted, fontSize: 13, fontWeight: 600,
    fontFamily: "'Inter', sans-serif", cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
  },
  btnDanger: {
    padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)',
    background: C.redDim, color: C.red, fontSize: 12, fontWeight: 600,
    fontFamily: "'Inter', sans-serif", cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 5, transition: 'all 0.2s',
  },
  btnSuccess: {
    padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(34,197,94,0.3)',
    background: C.greenDim, color: C.green, fontSize: 12, fontWeight: 600,
    fontFamily: "'Inter', sans-serif", cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 5, transition: 'all 0.2s',
  },
  btnWarning: {
    padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(249,115,22,0.3)',
    background: C.orangeDim, color: C.orange, fontSize: 12, fontWeight: 600,
    fontFamily: "'Inter', sans-serif", cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 5, transition: 'all 0.2s',
  },
  btnSmall: {
    padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.border}`,
    background: C.bgCard, color: C.textMuted, fontSize: 12, fontWeight: 600,
    fontFamily: "'Inter', sans-serif", cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 5, transition: 'all 0.2s',
  },
  btnCyan: {
    padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(0,212,255,0.3)',
    background: C.cyanDim, color: C.cyan, fontSize: 12, fontWeight: 600,
    fontFamily: "'Inter', sans-serif", cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 5, transition: 'all 0.2s',
  },
  listCard: {
    background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14,
    padding: '18px 20px', marginBottom: 10, transition: 'border-color 0.2s, background 0.2s',
  },
  badge: {
    display: 'inline-flex', alignItems: 'center', padding: '4px 10px',
    borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  badgeActive: { background: C.greenDim, color: C.green },
  badgeInactive: { background: C.orangeDim, color: C.orange },
  badgeDeleted: { background: C.redDim, color: C.red },
  badgeFeatured: { background: C.goldDim, color: C.gold },
  badgeMystery: { background: C.purpleDim, color: C.purple },
  badgeCategory: { background: C.blueDim, color: C.blue },
  badgePending: { background: C.orangeDim, color: C.orange },
  badgeCyan: { background: C.cyanDim, color: C.cyan },
  filterBar: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  filterBtn: {
    padding: '8px 16px', borderRadius: 20, border: `1px solid ${C.border}`,
    background: 'transparent', color: C.textMuted, fontSize: 12, fontWeight: 600,
    fontFamily: "'Inter', sans-serif", cursor: 'pointer', transition: 'all 0.2s',
  },
  filterBtnActive: { background: C.goldDim, borderColor: 'rgba(0,212,255,0.3)', color: C.gold },
  divider: { height: 1, background: C.border, margin: '20px 0', border: 'none' },
  emptyState: { textAlign: 'center', padding: '40px 20px', color: C.textDim, fontSize: 14 },
  flexBetween: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 },
  flexRow: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  actionRow: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  voteBar: { height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginTop: 10, display: 'flex' },
  voteBarA: { height: '100%', background: `linear-gradient(90deg, ${C.gold}, ${C.goldLight})`, transition: 'width 0.5s ease' },
  voteBarB: { height: '100%', background: `linear-gradient(90deg, ${C.purple}, #a78bfa)`, transition: 'width 0.5s ease' },
  seasonCard: {
    background: `linear-gradient(135deg, rgba(0,212,255,0.06) 0%, rgba(191,90,242,0.06) 100%)`,
    border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, marginBottom: 20,
    position: 'relative', overflow: 'hidden',
  },
  seasonGlow: {
    position: 'absolute', top: -40, right: -40, width: 120, height: 120,
    borderRadius: '50%', background: C.goldGlow, filter: 'blur(50px)', opacity: 0.3, pointerEvents: 'none',
  },
  eventCard: {
    background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14,
    padding: '18px 20px', marginBottom: 10, display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
  },
  toast: {
    position: 'fixed', bottom: 24, right: 24, padding: '14px 22px', borderRadius: 12,
    fontSize: 14, fontWeight: 600, fontFamily: "'Inter', sans-serif", zIndex: 9999,
    animation: 'adminFadeIn 0.3s ease-out', display: 'flex', alignItems: 'center', gap: 8,
  },
  toastSuccess: { background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: C.green },
  toastError: { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: C.red },
  searchBar: {
    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
    background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: 12,
    padding: '0 14px', transition: 'border-color 0.2s',
  },
  searchInput: {
    flex: 1, padding: '12px 0', background: 'transparent', border: 'none',
    color: C.text, fontSize: 14, fontFamily: "'Inter', sans-serif", outline: 'none',
  },
};

// ── Helpers ──────────────────────────────────────────────
function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return n.toString();
}

function formatDate(dateStr) {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function getCountdown(endDate) {
  if (!endDate) return null;
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return { expired: true, text: 'Ended' };
  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return { expired: false, text: `${days}d ${hrs}h remaining` };
  if (hrs > 0) return { expired: false, text: `${hrs}h ${mins}m remaining` };
  return { expired: false, text: `${mins}m remaining` };
}

function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function isThisWeek(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  return d >= weekAgo && d <= now;
}

const CATEGORY_COLORS = [
  C.gold, C.purple, C.cyan, C.green, C.orange, C.blue, C.red,
  C.goldLight, '#a78bfa', '#2dd4bf', '#fb923c', '#60a5fa',
];

const EVENT_TYPES = [
  { value: 'xp_multiplier', label: 'XP Multiplier', icon: Zap, color: C.gold },
  { value: 'category_spotlight', label: 'Category Spotlight', icon: Target, color: C.cyan },
  { value: 'mystery_reveal', label: 'Mystery Reveal', icon: Eye, color: C.purple },
  { value: 'bonus_streak', label: 'Bonus Streak', icon: Flame, color: C.orange },
  { value: 'xp_boost', label: 'XP Boost', icon: Sparkles, color: C.green },
  { value: 'challenge', label: 'Challenge', icon: Trophy, color: C.blue },
  { value: 'community', label: 'Community', icon: Users, color: C.purple },
  { value: 'special', label: 'Special', icon: Crown, color: C.gold },
];

// ── Component ────────────────────────────────────────────
export default function AdminScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Dashboard state
  const [stats, setStats] = useState({ totalUsers: 0, totalAnswers: 0, activeToday: 0, totalDilemmas: 0 });
  const [activity, setActivity] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [allVotes, setAllVotes] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // Dilemmas state
  const [dilemmaList, setDilemmaList] = useState([]);
  const [dilemmaFilter, setDilemmaFilter] = useState('all');
  const [dilemmaSearch, setDilemmaSearch] = useState('');
  const [dilemmaCategoryFilter, setDilemmaCategoryFilter] = useState('all');
  const [dilemmaSort, setDilemmaSort] = useState('newest');
  const [selectedDilemmas, setSelectedDilemmas] = useState(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDilemma, setEditingDilemma] = useState(null);
  const [dilemmaForm, setDilemmaForm] = useState({
    question: '', option_a: '', option_b: '', category: 'lifestyle',
    is_mystery: false, is_featured: false,
  });

  // Moderation state
  const [reportsList, setReportsList] = useState([]);
  const [bannedList, setBannedList] = useState([]);

  // Seasons & Events state
  const [currentSeason, setCurrentSeason] = useState(null);
  const [eventsList, setEventsList] = useState([]);
  const [eventsHistory, setEventsHistory] = useState([]);
  const [showSeasonForm, setShowSeasonForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [seasonForm, setSeasonForm] = useState({ name: '', start_date: '', end_date: '' });
  const [eventForm, setEventForm] = useState({
    name: '', type: 'xp_multiplier', multiplier: 2, start_date: '', end_date: '', category: '',
  });

  // Users state
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserVotes, setSelectedUserVotes] = useState([]);
  const [bonusXPAmount, setBonusXPAmount] = useState(100);

  const [focusedInput, setFocusedInput] = useState(null);

  // ── Computed data ──────────────────────────────────────
  const votesToday = useMemo(() => allVotes.filter(v => isToday(v.created_at)).length, [allVotes]);
  const votesThisWeek = useMemo(() => allVotes.filter(v => isThisWeek(v.created_at)).length, [allVotes]);
  const avgVotesPerUser = useMemo(() => {
    if (!allUsers.length) return 0;
    return Math.round((allVotes.length / allUsers.length) * 10) / 10;
  }, [allVotes, allUsers]);

  const mostPopularDilemma = useMemo(() => {
    if (!dilemmaList.length) return null;
    return dilemmaList.reduce((best, d) => {
      const total = (d.votes_a || 0) + (d.votes_b || 0);
      const bestTotal = (best.votes_a || 0) + (best.votes_b || 0);
      return total > bestTotal ? d : best;
    }, dilemmaList[0]);
  }, [dilemmaList]);

  const mostControversialDilemma = useMemo(() => {
    if (!dilemmaList.length) return null;
    return dilemmaList.reduce((best, d) => {
      const total = (d.votes_a || 0) + (d.votes_b || 0);
      if (total < 5) return best;
      const ratio = Math.min((d.votes_a || 0), (d.votes_b || 0)) / Math.max((d.votes_a || 0), (d.votes_b || 0), 1);
      const bestTotal = (best.votes_a || 0) + (best.votes_b || 0);
      if (bestTotal < 5) return d;
      const bestRatio = Math.min((best.votes_a || 0), (best.votes_b || 0)) / Math.max((best.votes_a || 0), (best.votes_b || 0), 1);
      return ratio > bestRatio ? d : best;
    }, dilemmaList[0]);
  }, [dilemmaList]);

  const categoryBreakdown = useMemo(() => {
    const map = {};
    dilemmaList.forEach(d => {
      const cat = d.category || 'other';
      if (!map[cat]) map[cat] = { name: cat, votes: 0, count: 0 };
      map[cat].votes += (d.votes_a || 0) + (d.votes_b || 0);
      map[cat].count += 1;
    });
    return Object.values(map).sort((a, b) => b.votes - a.votes);
  }, [dilemmaList]);

  const maxCategoryVotes = useMemo(() => Math.max(...categoryBreakdown.map(c => c.votes), 1), [categoryBreakdown]);

  // Filtered & sorted dilemmas
  const filteredDilemmas = useMemo(() => {
    let list = [...dilemmaList];
    if (dilemmaFilter !== 'all') list = list.filter(d => d.status === dilemmaFilter);
    if (dilemmaCategoryFilter !== 'all') list = list.filter(d => d.category === dilemmaCategoryFilter);
    if (dilemmaSearch.trim()) {
      const q = dilemmaSearch.toLowerCase();
      list = list.filter(d =>
        (d.question || '').toLowerCase().includes(q) ||
        (d.option_a || '').toLowerCase().includes(q) ||
        (d.option_b || '').toLowerCase().includes(q)
      );
    }
    switch (dilemmaSort) {
      case 'newest': list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)); break;
      case 'oldest': list.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0)); break;
      case 'most_voted': list.sort((a, b) => ((b.votes_a || 0) + (b.votes_b || 0)) - ((a.votes_a || 0) + (a.votes_b || 0))); break;
      case 'controversial': list.sort((a, b) => {
        const aT = (a.votes_a || 0) + (a.votes_b || 0);
        const bT = (b.votes_a || 0) + (b.votes_b || 0);
        if (aT < 5 && bT < 5) return 0;
        if (aT < 5) return 1;
        if (bT < 5) return -1;
        const aR = Math.min(a.votes_a || 0, a.votes_b || 0) / Math.max(a.votes_a || 0, a.votes_b || 0, 1);
        const bR = Math.min(b.votes_a || 0, b.votes_b || 0) / Math.max(b.votes_a || 0, b.votes_b || 0, 1);
        return bR - aR;
      }); break;
      default: break;
    }
    return list;
  }, [dilemmaList, dilemmaFilter, dilemmaCategoryFilter, dilemmaSearch, dilemmaSort]);

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return allUsers;
    const q = userSearch.toLowerCase();
    return allUsers.filter(u =>
      (u.username || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.name || '').toLowerCase().includes(q)
    );
  }, [allUsers, userSearch]);

  const maxActivity = useMemo(() => Math.max(...activity.map(a => a.value), 1), [activity]);

  // ── Access check ───────────────────────────────────────
  if (!user || user.role !== 'admin') {
    return (
      <div style={s.denied}>
        <Shield size={56} style={s.deniedIcon} />
        <h1 style={s.deniedTitle}>Access Denied</h1>
        <p style={s.deniedText}>You do not have admin privileges to view this page.</p>
        <button style={{ ...s.btnSecondary, marginTop: 12 }} onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  // ── Actions ────────────────────────────────────────────
  const refreshData = async () => {
    setLoadingStats(true);
    try {
      const [statsRes, activityRes, dilemmasRes, reportsRes, eventsRes, seasonsRes, bannedRes, usersRes, votesRes, allEventsRes] = await Promise.allSettled([
        API.admin?.getStats ? API.admin.getStats() : Promise.reject('no endpoint'),
        API.admin?.getActivity ? API.admin.getActivity() : Promise.reject('no endpoint'),
        API.admin?.getAllDilemmas ? API.admin.getAllDilemmas() : API.dilemmas.getAll(),
        API.reports.getPending(),
        API.events.getActive(),
        API.seasons.getActive(),
        API.admin?.getBannedUsers ? API.admin.getBannedUsers() : Promise.reject('no endpoint'),
        API.admin?.getAllUsers ? API.admin.getAllUsers() : Promise.reject('no endpoint'),
        API.admin?.getAllVotes ? API.admin.getAllVotes() : Promise.reject('no endpoint'),
        API.events?.getAll ? API.events.getAll() : Promise.reject('no endpoint'),
      ]);

      if (statsRes.status === 'fulfilled') {
        const data = statsRes.value || {};
        setStats({
          totalUsers: data.totalUsers || data.total_users || 0,
          totalAnswers: data.totalAnswers || data.total_answers || 0,
          activeToday: data.activeToday || data.active_today || 0,
          totalDilemmas: data.totalDilemmas || data.total_dilemmas || 0,
        });
      }
      if (activityRes.status === 'fulfilled') {
        const data = Array.isArray(activityRes.value) ? activityRes.value : activityRes.value ? [activityRes.value] : [];
        setActivity(data);
      }
      if (dilemmasRes.status === 'fulfilled') {
        const data = Array.isArray(dilemmasRes.value) ? dilemmasRes.value : dilemmasRes.value ? [dilemmasRes.value] : [];
        setDilemmaList(data);
      }
      if (reportsRes.status === 'fulfilled') {
        const data = Array.isArray(reportsRes.value) ? reportsRes.value : reportsRes.value ? [reportsRes.value] : [];
        setReportsList(data);
      }
      if (eventsRes.status === 'fulfilled') {
        const data = Array.isArray(eventsRes.value) ? eventsRes.value : eventsRes.value ? [eventsRes.value] : [];
        setEventsList(data);
      }
      if (seasonsRes.status === 'fulfilled') {
        const data = seasonsRes.value;
        const season = Array.isArray(data) ? data[0] || null : data || null;
        setCurrentSeason(season);
      }
      if (bannedRes.status === 'fulfilled') {
        const data = Array.isArray(bannedRes.value) ? bannedRes.value : bannedRes.value ? [bannedRes.value] : [];
        setBannedList(data);
      }
      if (usersRes.status === 'fulfilled') {
        const data = Array.isArray(usersRes.value) ? usersRes.value : usersRes.value ? [usersRes.value] : [];
        setAllUsers(data);
        if (statsRes.status !== 'fulfilled') {
          setStats(prev => ({ ...prev, totalUsers: data.length, activeToday: data.filter(u => isToday(u.last_active || u.updated_at)).length }));
        }
      }
      if (votesRes.status === 'fulfilled') {
        const data = Array.isArray(votesRes.value) ? votesRes.value : votesRes.value ? [votesRes.value] : [];
        setAllVotes(data);
        if (statsRes.status !== 'fulfilled') {
          setStats(prev => ({ ...prev, totalAnswers: data.length }));
        }
      }
      if (allEventsRes.status === 'fulfilled') {
        const data = Array.isArray(allEventsRes.value) ? allEventsRes.value : allEventsRes.value ? [allEventsRes.value] : [];
        setEventsHistory(data.filter(e => e.status !== 'active' && e.record_status !== 'active'));
      }
      if (statsRes.status !== 'fulfilled' && dilemmasRes.status === 'fulfilled') {
        const dilemmaData = Array.isArray(dilemmasRes.value) ? dilemmasRes.value : [];
        setStats(prev => ({ ...prev, totalDilemmas: dilemmaData.length }));
      }
      showToast('Data refreshed successfully');
    } catch {
      showToast('Failed to refresh data', 'error');
    } finally {
      setLoadingStats(false);
    }
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => { refreshData(); }, []);

  // Dilemma actions
  const handleCreateDilemma = async () => {
    if (!dilemmaForm.question.trim() || !dilemmaForm.option_a.trim() || !dilemmaForm.option_b.trim()) {
      showToast('Please fill in all required fields', 'error'); return;
    }
    const newDilemma = {
      id: 'd_' + Date.now(), ...dilemmaForm,
      is_mystery: dilemmaForm.is_mystery ? 1 : 0,
      is_featured: dilemmaForm.is_featured ? 1 : 0,
      status: 'active', votes_a: 0, votes_b: 0, created_at: new Date().toISOString(),
    };
    try {
      const res = await API.dilemmas.create(newDilemma);
      setDilemmaList(prev => [res || newDilemma, ...prev]);
      setDilemmaForm({ question: '', option_a: '', option_b: '', category: 'lifestyle', is_mystery: false, is_featured: false });
      setShowCreateForm(false);
      showToast('Dilemma created successfully');
    } catch { showToast('Failed to create dilemma', 'error'); }
  };

  const handleUpdateDilemma = async () => {
    if (!editingDilemma) return;
    const updated = { ...editingDilemma, ...dilemmaForm, is_mystery: dilemmaForm.is_mystery ? 1 : 0, is_featured: dilemmaForm.is_featured ? 1 : 0 };
    try {
      await API.dilemmas.update(editingDilemma.id, updated);
      setDilemmaList(prev => prev.map(d => d.id === editingDilemma.id ? updated : d));
      setEditingDilemma(null);
      setDilemmaForm({ question: '', option_a: '', option_b: '', category: 'lifestyle', is_mystery: false, is_featured: false });
      showToast('Dilemma updated successfully');
    } catch { showToast('Failed to update dilemma', 'error'); }
  };

  const handleDeleteDilemma = async (dilemma) => {
    try {
      await API.dilemmas.delete(dilemma.id);
      setDilemmaList(prev => prev.map(d => d.id === dilemma.id ? { ...d, status: 'deleted' } : d));
      showToast('Dilemma deleted');
    } catch { showToast('Failed to delete dilemma', 'error'); }
  };

  const handleToggleFeatured = async (dilemma) => {
    const newVal = dilemma.is_featured ? 0 : 1;
    try {
      await API.dilemmas.update(dilemma.id, { is_featured: newVal });
      setDilemmaList(prev => prev.map(d => d.id === dilemma.id ? { ...d, is_featured: newVal } : d));
      showToast(newVal ? 'Dilemma featured' : 'Dilemma unfeatured');
    } catch { showToast('Failed to update dilemma', 'error'); }
  };

  const handleFeatureAsQOTD = async (dilemma) => {
    try {
      // Clear all featured first
      const featuredOnes = dilemmaList.filter(d => d.is_featured && d.id !== dilemma.id);
      await Promise.all(featuredOnes.map(d => API.dilemmas.update(d.id, { is_featured: 0 })));
      await API.dilemmas.update(dilemma.id, { is_featured: 1 });
      setDilemmaList(prev => prev.map(d => d.id === dilemma.id ? { ...d, is_featured: 1 } : { ...d, is_featured: 0 }));
      showToast('Set as Question of the Day!');
    } catch { showToast('Failed to set QOTD', 'error'); }
  };

  const handleToggleActive = async (dilemma) => {
    const newStatus = dilemma.status === 'active' ? 'inactive' : 'active';
    try {
      await API.dilemmas.update(dilemma.id, { status: newStatus });
      setDilemmaList(prev => prev.map(d => d.id === dilemma.id ? { ...d, status: newStatus } : d));
      showToast(`Dilemma ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    } catch { showToast('Failed to toggle status', 'error'); }
  };

  // Bulk actions
  const handleBulkFeature = async () => {
    if (selectedDilemmas.size === 0) return;
    try {
      const ids = [...selectedDilemmas];
      await Promise.all(dilemmaList.filter(d => d.is_featured && !ids.includes(d.id)).map(d => API.dilemmas.update(d.id, { is_featured: 0 })));
      await Promise.all(ids.map(id => API.dilemmas.update(id, { is_featured: 1 })));
      setDilemmaList(prev => prev.map(d => ids.includes(d.id) ? { ...d, is_featured: 1 } : { ...d, is_featured: 0 }));
      setSelectedDilemmas(new Set());
      showToast(`${ids.length} dilemma(s) featured`);
    } catch { showToast('Bulk feature failed', 'error'); }
  };

  const handleBulkDeactivate = async () => {
    if (selectedDilemmas.size === 0) return;
    try {
      const ids = [...selectedDilemmas];
      await Promise.all(ids.map(id => API.dilemmas.update(id, { status: 'inactive' })));
      setDilemmaList(prev => prev.map(d => ids.includes(d.id) ? { ...d, status: 'inactive' } : d));
      setSelectedDilemmas(new Set());
      showToast(`${ids.length} dilemma(s) deactivated`);
    } catch { showToast('Bulk deactivate failed', 'error'); }
  };

  // Report actions
  const handleDismissReport = async (report) => {
    try {
      await API.reports.update(report.id, { status: 'dismissed' });
      setReportsList(prev => prev.filter(r => r.id !== report.id));
      showToast('Report dismissed');
    } catch { showToast('Failed to dismiss report', 'error'); }
  };

  const handleWarnUser = async (report) => {
    try {
      await API.reports.update(report.id, { status: 'warned' });
      setReportsList(prev => prev.filter(r => r.id !== report.id));
      showToast(`Warning sent to ${report.reported_username}`);
    } catch { showToast('Failed to warn user', 'error'); }
  };

  const handleBanUser = async (report) => {
    try {
      await API.reports.update(report.id, { status: 'banned' });
      setBannedList(prev => [...prev, {
        id: 'b_' + Date.now(), report_id: report.id,
        username: report.reported_username, banned_at: new Date().toISOString(), reason: report.reason,
      }]);
      setReportsList(prev => prev.filter(r => r.id !== report.id));
      showToast(`${report.reported_username} has been banned`, 'error');
    } catch { showToast('Failed to ban user', 'error'); }
  };

  const handleUnbanUser = async (banned) => {
    try {
      if (banned.report_id) await API.reports.update(banned.report_id, { status: 'unbanned' });
      if (banned.user_id) await API.admin.unbanUser(banned.user_id);
    } catch (err) { console.error('Unban API error:', err); }
    setBannedList(prev => prev.filter(b => b.id !== banned.id));
    showToast(`${banned.username} has been unbanned`);
  };

  // User management actions
  const handleBanUserDirect = async (u) => {
    try {
      await API.admin.banUser(u.id);
      setAllUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_banned: 1 } : x));
      setBannedList(prev => [...prev, { id: 'b_' + Date.now(), user_id: u.id, username: u.username, banned_at: new Date().toISOString(), reason: 'Admin action' }]);
      showToast(`${u.username} has been banned`, 'error');
    } catch { showToast('Failed to ban user', 'error'); }
  };

  const handleUnbanUserDirect = async (u) => {
    try {
      await API.admin.unbanUser(u.id);
      setAllUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_banned: 0 } : x));
      setBannedList(prev => prev.filter(b => b.user_id !== u.id && b.username !== u.username));
      showToast(`${u.username} has been unbanned`);
    } catch { showToast('Failed to unban user', 'error'); }
  };

  const handleGiveXP = async (u) => {
    if (!bonusXPAmount || bonusXPAmount <= 0) { showToast('Enter a valid XP amount', 'error'); return; }
    try {
      await API.admin.giveXP(u.id, u.xp || 0, bonusXPAmount);
      setAllUsers(prev => prev.map(x => x.id === u.id ? { ...x, xp: (x.xp || 0) + bonusXPAmount } : x));
      showToast(`Gave ${bonusXPAmount} XP to ${u.username}`);
    } catch { showToast('Failed to give XP', 'error'); }
  };

  const handleViewUserActivity = async (u) => {
    setSelectedUser(u);
    try {
      const votes = await API.votes.getByUser(u.id);
      setSelectedUserVotes(Array.isArray(votes) ? votes : votes ? [votes] : []);
    } catch { setSelectedUserVotes([]); }
  };

  // Season & event actions
  const handleCreateSeason = async () => {
    if (!seasonForm.name.trim() || !seasonForm.start_date || !seasonForm.end_date) {
      showToast('Please fill in all season fields', 'error'); return;
    }
    try {
      const res = await API.seasons.create({
        name: seasonForm.name,
        start_date: seasonForm.start_date,
        end_date: seasonForm.end_date,
        status: 'active',
        created_at: new Date().toISOString(),
      });
      setCurrentSeason(res || { ...seasonForm, status: 'active' });
      setShowSeasonForm(false);
      setSeasonForm({ name: '', start_date: '', end_date: '' });
      showToast('New season created');
    } catch { showToast('Failed to create season', 'error'); }
  };

  const handleEndSeason = async () => {
    if (!currentSeason?.id) return;
    try {
      await API.seasons.update(currentSeason.id, { status: 'completed' });
      showToast('Season ended');
      setCurrentSeason(null);
    } catch { showToast('Failed to end season', 'error'); }
  };

  const handleCreateEvent = async () => {
    if (!eventForm.name.trim() || !eventForm.start_date || !eventForm.end_date) {
      showToast('Please fill in all event fields', 'error'); return;
    }
    const newEvent = { id: 'e_' + Date.now(), ...eventForm, status: 'active' };
    try {
      const res = await API.events.create(newEvent);
      setEventsList(prev => [...prev, res || newEvent]);
      setShowEventForm(false);
      setEventForm({ name: '', type: 'xp_multiplier', multiplier: 2, start_date: '', end_date: '', category: '' });
      showToast('Event created');
    } catch { showToast('Failed to create event', 'error'); }
  };

  const handleEndEvent = async (event) => {
    try {
      await API.events.update(event.id, { status: 'ended', record_status: 'ended' });
      setEventsList(prev => prev.filter(e => e.id !== event.id));
      setEventsHistory(prev => [...prev, { ...event, status: 'ended' }]);
      showToast('Event ended');
    } catch { showToast('Failed to end event', 'error'); }
  };

  const startEditDilemma = (d) => {
    setEditingDilemma(d);
    setDilemmaForm({ question: d.question, option_a: d.option_a, option_b: d.option_b, category: d.category, is_mystery: !!d.is_mystery, is_featured: !!d.is_featured });
    setShowCreateForm(true);
  };

  const cancelForm = () => {
    setShowCreateForm(false);
    setEditingDilemma(null);
    setDilemmaForm({ question: '', option_a: '', option_b: '', category: 'lifestyle', is_mystery: false, is_featured: false });
  };

  const inputStyle = (name) => ({ ...s.input, ...(focusedInput === name ? s.inputFocus : {}) });
  const textareaStyle = (name) => ({ ...s.textarea, ...(focusedInput === name ? s.inputFocus : {}) });

  const toggleSelectDilemma = (id) => {
    setSelectedDilemmas(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Tab definitions ────────────────────────────────────
  const TABS = [
    { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { key: 'dilemmas', label: 'Questions', icon: HelpCircle },
    { key: 'events', label: 'Events', icon: Zap },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'moderation', label: 'Moderation', icon: Flag },
  ];

  // ── RENDER ─────────────────────────────────────────────
  return (
    <div style={s.page}>
      {/* Toast */}
      {toast && (
        <div style={{ ...s.toast, ...(toast.type === 'error' ? s.toastError : s.toastSuccess) }}>
          {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div style={s.header}>
        <div style={s.headerTop}>
          <div style={s.headerLeft}>
            <div style={s.headerIconWrap}>
              <Shield size={22} color={C.bg} strokeWidth={2.5} />
            </div>
            <div>
              <h1 style={s.headerTitle}>Admin Panel</h1>
              <p style={s.headerSub}>Social Dilemma's Control Center</p>
            </div>
          </div>
          <button
            style={s.refreshBtn} onClick={refreshData} title="Refresh data"
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMuted; }}
          >
            <RefreshCw size={18} style={loadingStats ? { animation: 'adminGlow 1s infinite' } : {}} />
          </button>
        </div>
        <div style={s.tabs}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              style={{ ...s.tab, ...(activeTab === key ? s.tabActive : {}) }}
              onClick={() => key === 'events' ? navigate('/admin/events') : setActiveTab(key)}
              onMouseEnter={e => { if (activeTab !== key) e.currentTarget.style.color = C.text; }}
              onMouseLeave={e => { if (activeTab !== key) e.currentTarget.style.color = C.textMuted; }}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div style={s.content} key={activeTab}>

        {/* ━━━ TAB: DASHBOARD ━━━ */}
        {activeTab === 'dashboard' && (
          <>
            {loadingStats && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <RefreshCw size={28} color={C.gold} style={{ animation: 'adminGlow 1s infinite' }} />
                <p style={{ color: C.textMuted, marginTop: 12, fontSize: 14 }}>Loading dashboard data...</p>
              </div>
            )}

            {/* Main stat cards */}
            <div style={s.statsGrid}>
              {[
                { icon: Users, label: 'Total Users', value: allUsers.length || stats.totalUsers, color: C.gold, bg: C.goldDim, glow: C.goldGlow },
                { icon: CheckCircle, label: 'All Time Votes', value: allVotes.length || stats.totalAnswers, color: C.green, bg: C.greenDim, glow: 'rgba(34,197,94,0.25)' },
                { icon: Flame, label: 'Votes Today', value: votesToday, color: C.orange, bg: C.orangeDim, glow: 'rgba(249,115,22,0.25)' },
                { icon: TrendingUp, label: 'Votes This Week', value: votesThisWeek, color: C.cyan, bg: C.cyanDim, glow: C.cyanGlow },
                { icon: Activity, label: 'Active Today', value: stats.activeToday, color: C.purple, bg: C.purpleDim, glow: C.purpleGlow },
                { icon: Hash, label: 'Avg Votes/User', value: avgVotesPerUser, color: C.blue, bg: C.blueDim, glow: 'rgba(59,130,246,0.25)' },
                { icon: HelpCircle, label: 'Total Dilemmas', value: dilemmaList.length || stats.totalDilemmas, color: C.gold, bg: C.goldDim, glow: C.goldGlow },
              ].map(({ icon: Icon, label, value, color, bg, glow }, i) => (
                <div
                  key={label} style={{ ...s.statCard, animationDelay: `${i * 0.5}s` }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = color; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = C.border; }}
                >
                  <div style={s.statIconWrap}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={20} color={color} />
                    </div>
                  </div>
                  <p style={{ ...s.statNumber, color }}>{formatNumber(typeof value === 'number' ? value : 0)}</p>
                  <p style={s.statLabel}>{label}</p>
                  <div style={{ ...s.statGlow, background: glow }} />
                </div>
              ))}
            </div>

            {/* Most Popular & Controversial */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div style={{ ...s.chartCard, marginBottom: 0 }}>
                <h3 style={s.chartTitle}><Trophy size={18} color={C.gold} /> Most Popular</h3>
                {mostPopularDilemma ? (
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 8px', lineHeight: 1.4 }}>{mostPopularDilemma.question}</p>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: C.textMuted }}>
                      <span style={{ color: C.gold }}>{mostPopularDilemma.votes_a || 0} votes A</span>
                      <span style={{ color: C.purple }}>{mostPopularDilemma.votes_b || 0} votes B</span>
                    </div>
                    <p style={{ fontSize: 24, fontWeight: 800, color: C.gold, margin: '8px 0 0' }}>
                      {formatNumber((mostPopularDilemma.votes_a || 0) + (mostPopularDilemma.votes_b || 0))} <span style={{ fontSize: 13, fontWeight: 500, color: C.textMuted }}>total votes</span>
                    </p>
                  </div>
                ) : <p style={{ color: C.textDim, fontSize: 13, margin: 0 }}>No data yet</p>}
              </div>

              <div style={{ ...s.chartCard, marginBottom: 0 }}>
                <h3 style={s.chartTitle}><Target size={18} color={C.red} /> Most Controversial</h3>
                {mostControversialDilemma ? (() => {
                  const total = (mostControversialDilemma.votes_a || 0) + (mostControversialDilemma.votes_b || 0);
                  const pctA = total > 0 ? ((mostControversialDilemma.votes_a || 0) / total * 100).toFixed(1) : 50;
                  const pctB = total > 0 ? ((mostControversialDilemma.votes_b || 0) / total * 100).toFixed(1) : 50;
                  return (
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 8px', lineHeight: 1.4 }}>{mostControversialDilemma.question}</p>
                      <div style={s.voteBar}>
                        <div style={{ ...s.voteBarA, width: `${pctA}%` }} />
                        <div style={{ ...s.voteBarB, width: `${pctB}%` }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12 }}>
                        <span style={{ color: C.gold }}>{pctA}% A</span>
                        <span style={{ color: C.textDim }}>{total} votes</span>
                        <span style={{ color: C.purple }}>{pctB}% B</span>
                      </div>
                    </div>
                  );
                })() : <p style={{ color: C.textDim, fontSize: 13, margin: 0 }}>No data yet</p>}
              </div>
            </div>

            {/* Category Breakdown */}
            <div style={s.chartCard}>
              <h3 style={s.chartTitle}><BarChart3 size={18} color={C.cyan} /> Category Breakdown</h3>
              {categoryBreakdown.length > 0 ? (
                <div>
                  {categoryBreakdown.map((cat, i) => {
                    const pct = (cat.votes / maxCategoryVotes) * 100;
                    const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
                    return (
                      <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, width: 90, textTransform: 'capitalize', flexShrink: 0 }}>
                          {cat.name}
                        </span>
                        <div style={{ flex: 1, height: 24, background: 'rgba(255,255,255,0.04)', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                          <div style={{
                            height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}88)`,
                            borderRadius: 6, transition: 'width 0.8s ease', minWidth: pct > 0 ? 4 : 0,
                          }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color, width: 55, textAlign: 'right', flexShrink: 0 }}>
                          {formatNumber(cat.votes)}
                        </span>
                        <span style={{ fontSize: 11, color: C.textDim, width: 50, textAlign: 'right', flexShrink: 0 }}>
                          {cat.count} Q
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : <div style={s.emptyState}><p style={{ margin: 0 }}>No category data available.</p></div>}
            </div>

            {/* Activity chart */}
            <div style={s.chartCard}>
              <h3 style={s.chartTitle}><TrendingUp size={18} color={C.gold} /> Activity — Last 7 Days</h3>
              {activity.length > 0 ? (
                <div style={s.chartContainer}>
                  {activity.map((item, i) => {
                    const pct = (item.value / maxActivity) * 100;
                    const isHighest = item.value === Math.max(...activity.map(a => a.value));
                    return (
                      <div key={item.day} style={s.chartBarWrap}>
                        <span style={s.chartValue}>{item.value}</span>
                        <div
                          style={{
                            ...s.chartBar, height: `${pct}%`,
                            background: isHighest ? `linear-gradient(180deg, ${C.gold}, #FF2D78)` : `linear-gradient(180deg, ${C.purple}, rgba(191,90,242,0.4))`,
                            animationDelay: `${i * 0.1}s`,
                            boxShadow: isHighest ? `0 0 20px ${C.goldGlow}` : 'none',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.3)'; }}
                          onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
                        />
                        <span style={{ ...s.chartLabel, color: isHighest ? C.gold : C.textDim }}>{item.day}</span>
                      </div>
                    );
                  })}
                </div>
              ) : <div style={s.emptyState}><BarChart3 size={28} color={C.textDim} style={{ marginBottom: 8 }} /><p style={{ margin: 0 }}>No activity data available yet.</p></div>}
            </div>

            {/* Platform Health */}
            <div style={s.chartCard}>
              <h3 style={s.chartTitle}><Activity size={18} color={C.purple} /> Platform Health</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                {[
                  { label: 'Pending Reports', value: reportsList.length.toString(), change: reportsList.length > 5 ? 'High' : 'Normal', up: reportsList.length <= 5 },
                  { label: 'Active Events', value: eventsList.filter(e => e.status === 'active').length.toString(), change: 'Running', up: true },
                  { label: 'Total Dilemmas', value: dilemmaList.length.toString(), change: dilemmaList.filter(d => d.status === 'active').length + ' active', up: true },
                  { label: 'Banned Users', value: bannedList.length.toString(), change: bannedList.length > 0 ? 'Enforced' : 'None', up: bannedList.length === 0 },
                ].map(({ label, value, change, up }) => (
                  <div key={label} style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: `1px solid ${C.border}` }}>
                    <p style={{ fontSize: 12, color: C.textDim, margin: '0 0 6px 0', fontWeight: 500 }}>{label}</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontSize: 22, fontWeight: 800, color: C.text }}>{value}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: up ? C.green : C.red }}>{change}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ━━━ TAB: QUESTIONS / DILEMMAS ━━━ */}
        {activeTab === 'dilemmas' && (
          <>
            <div style={s.flexBetween}>
              <h2 style={s.sectionTitle}><HelpCircle size={20} color={C.gold} /> Manage Questions</h2>
              <button style={s.btnPrimary} onClick={() => { cancelForm(); setShowCreateForm(v => !v); }}>
                {showCreateForm && !editingDilemma ? <X size={16} /> : <Plus size={16} />}
                {showCreateForm && !editingDilemma ? 'Cancel' : 'Create Dilemma'}
              </button>
            </div>

            {/* Create / Edit form */}
            {showCreateForm && (
              <div style={s.formCard}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 18px 0', color: editingDilemma ? C.orange : C.gold }}>
                  {editingDilemma ? 'Edit Dilemma' : 'New Dilemma'}
                </h3>
                <div style={s.formGrid}>
                  <div style={s.formFull}>
                    <label style={s.label}>Question *</label>
                    <textarea style={textareaStyle('dq')} placeholder="Would you rather..."
                      value={dilemmaForm.question}
                      onChange={e => setDilemmaForm(f => ({ ...f, question: e.target.value }))}
                      onFocus={() => setFocusedInput('dq')} onBlur={() => setFocusedInput(null)} />
                  </div>
                  <div>
                    <label style={s.label}>Option A *</label>
                    <input style={inputStyle('da')} placeholder="First option"
                      value={dilemmaForm.option_a}
                      onChange={e => setDilemmaForm(f => ({ ...f, option_a: e.target.value }))}
                      onFocus={() => setFocusedInput('da')} onBlur={() => setFocusedInput(null)} />
                  </div>
                  <div>
                    <label style={s.label}>Option B *</label>
                    <input style={inputStyle('db')} placeholder="Second option"
                      value={dilemmaForm.option_b}
                      onChange={e => setDilemmaForm(f => ({ ...f, option_b: e.target.value }))}
                      onFocus={() => setFocusedInput('db')} onBlur={() => setFocusedInput(null)} />
                  </div>
                  <div>
                    <label style={s.label}>Category</label>
                    <select style={s.select} value={dilemmaForm.category}
                      onChange={e => setDilemmaForm(f => ({ ...f, category: e.target.value }))}>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat} style={{ background: C.bg, color: C.text }}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
                    <div style={s.checkRow}>
                      <input type="checkbox" id="isMystery" style={s.checkbox} checked={dilemmaForm.is_mystery}
                        onChange={e => setDilemmaForm(f => ({ ...f, is_mystery: e.target.checked }))} />
                      <label htmlFor="isMystery" style={s.checkLabel}>Is Mystery</label>
                    </div>
                    <div style={s.checkRow}>
                      <input type="checkbox" id="isFeatured" style={s.checkbox} checked={dilemmaForm.is_featured}
                        onChange={e => setDilemmaForm(f => ({ ...f, is_featured: e.target.checked }))} />
                      <label htmlFor="isFeatured" style={s.checkLabel}>Is Featured</label>
                    </div>
                  </div>
                  <div style={s.formFull}>
                    <button
                      style={{ ...s.btnPrimary, width: '100%', justifyContent: 'center', marginTop: 6 }}
                      onClick={editingDilemma ? handleUpdateDilemma : handleCreateDilemma}>
                      {editingDilemma ? <Edit3 size={16} /> : <Plus size={16} />}
                      {editingDilemma ? 'Update Dilemma' : 'Create Dilemma'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Search */}
            <div style={s.searchBar}>
              <Search size={16} color={C.textDim} />
              <input style={s.searchInput} placeholder="Search questions, options..."
                value={dilemmaSearch} onChange={e => setDilemmaSearch(e.target.value)} />
              {dilemmaSearch && <X size={14} color={C.textDim} style={{ cursor: 'pointer' }} onClick={() => setDilemmaSearch('')} />}
            </div>

            {/* Filters & Sort */}
            <div style={{ ...s.filterBar, justifyContent: 'space-between' }}>
              <div style={s.flexRow}>
                <Filter size={14} color={C.textDim} />
                {['all', 'active', 'inactive', 'deleted'].map(f => (
                  <button key={f} style={{ ...s.filterBtn, ...(dilemmaFilter === f ? s.filterBtnActive : {}) }}
                    onClick={() => setDilemmaFilter(f)}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                    {f !== 'all' && <span style={{ marginLeft: 4, opacity: 0.6 }}>({dilemmaList.filter(d => d.status === f).length})</span>}
                  </button>
                ))}
                <span style={{ color: C.textDim, margin: '0 4px' }}>|</span>
                <select style={{ ...s.select, width: 'auto', padding: '6px 10px', fontSize: 12, borderRadius: 20 }}
                  value={dilemmaCategoryFilter} onChange={e => setDilemmaCategoryFilter(e.target.value)}>
                  <option value="all" style={{ background: C.bg }}>All Categories</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat} style={{ background: C.bg }}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div style={s.flexRow}>
                <ArrowUpDown size={14} color={C.textDim} />
                <select style={{ ...s.select, width: 'auto', padding: '6px 10px', fontSize: 12, borderRadius: 20 }}
                  value={dilemmaSort} onChange={e => setDilemmaSort(e.target.value)}>
                  <option value="newest" style={{ background: C.bg }}>Newest</option>
                  <option value="oldest" style={{ background: C.bg }}>Oldest</option>
                  <option value="most_voted" style={{ background: C.bg }}>Most Voted</option>
                  <option value="controversial" style={{ background: C.bg }}>Most Controversial</option>
                </select>
              </div>
            </div>

            {/* Bulk actions */}
            {selectedDilemmas.size > 0 && (
              <div style={{ ...s.formCard, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.gold }}>{selectedDilemmas.size} selected</span>
                <button style={s.btnSuccess} onClick={handleBulkFeature}><Star size={13} /> Feature Selected</button>
                <button style={s.btnWarning} onClick={handleBulkDeactivate}><EyeOff size={13} /> Deactivate Selected</button>
                <button style={s.btnSmall} onClick={() => setSelectedDilemmas(new Set())}><X size={13} /> Clear Selection</button>
              </div>
            )}

            {/* Dilemma list */}
            {filteredDilemmas.length === 0 ? (
              <div style={s.emptyState}>No dilemmas found for this filter.</div>
            ) : (
              filteredDilemmas.map(d => {
                const totalVotes = (d.votes_a || 0) + (d.votes_b || 0);
                const pctA = totalVotes > 0 ? ((d.votes_a || 0) / totalVotes) * 100 : 50;
                const isSelected = selectedDilemmas.has(d.id);
                return (
                  <div key={d.id}
                    style={{ ...s.listCard, ...(isSelected ? { borderColor: 'rgba(0,212,255,0.4)', background: 'rgba(0,212,255,0.03)' } : {}) }}
                    onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = C.borderLight; e.currentTarget.style.background = C.bgCardHover; } }}
                    onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bgCard; } }}
                  >
                    <div style={s.flexBetween}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1 }}>
                        <input type="checkbox" style={{ ...s.checkbox, marginTop: 3 }} checked={isSelected}
                          onChange={() => toggleSelectDilemma(d.id)} />
                        <p style={{ fontSize: 15, fontWeight: 600, margin: 0, flex: 1, paddingRight: 12, lineHeight: 1.4 }}>{d.question}</p>
                      </div>
                      <div style={s.flexRow}>
                        <span style={{ ...s.badge, ...s.badgeCategory }}>{d.category}</span>
                        <span style={{ ...s.badge, ...(d.status === 'active' ? s.badgeActive : d.status === 'inactive' ? s.badgeInactive : s.badgeDeleted) }}>{d.status}</span>
                        {!!d.is_featured && <span style={{ ...s.badge, ...s.badgeFeatured }}>QOTD</span>}
                        {!!d.is_mystery && <span style={{ ...s.badge, ...s.badgeMystery }}>Mystery</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 24, marginTop: 10, fontSize: 13, color: C.textMuted }}>
                      <span style={{ color: C.gold }}>A: {d.option_a}</span>
                      <span style={{ color: C.textDim }}>vs</span>
                      <span style={{ color: C.purple }}>B: {d.option_b}</span>
                    </div>
                    {totalVotes > 0 && (
                      <>
                        <div style={s.voteBar}>
                          <div style={{ ...s.voteBarA, width: `${pctA}%` }} />
                          <div style={{ ...s.voteBarB, width: `${100 - pctA}%` }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: C.textDim }}>
                          <span>{d.votes_a} votes ({pctA.toFixed(0)}%)</span>
                          <span>{totalVotes} total</span>
                          <span>{d.votes_b} votes ({(100 - pctA).toFixed(0)}%)</span>
                        </div>
                      </>
                    )}
                    <div style={s.actionRow}>
                      <button style={s.btnSmall} onClick={() => startEditDilemma(d)}
                        onMouseEnter={e => { e.currentTarget.style.color = C.gold; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = C.textMuted; e.currentTarget.style.borderColor = C.border; }}>
                        <Edit3 size={13} /> Edit
                      </button>
                      <button style={d.status === 'active' ? s.btnWarning : s.btnSuccess} onClick={() => handleToggleActive(d)}>
                        {d.status === 'active' ? <EyeOff size={13} /> : <Eye size={13} />}
                        {d.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button style={s.btnCyan} onClick={() => handleFeatureAsQOTD(d)}><Crown size={13} /> Set as QOTD</button>
                      {d.status !== 'deleted' && (
                        <button style={s.btnDanger} onClick={() => handleDeleteDilemma(d)}><Trash2 size={13} /> Delete</button>
                      )}
                      <button style={d.is_featured ? s.btnWarning : s.btnSuccess} onClick={() => handleToggleFeatured(d)}>
                        <Star size={13} /> {d.is_featured ? 'Unfeature' : 'Feature'}
                      </button>
                      <span style={{ marginLeft: 'auto', fontSize: 11, color: C.textDim }}>
                        <Clock size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />{timeAgo(d.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        {/* ━━━ TAB: EVENTS ━━━ */}
        {activeTab === 'events' && (
          <>
            {/* Current Season */}
            <h2 style={s.sectionTitle}><Trophy size={20} color={C.gold} /> Current Season</h2>
            {currentSeason ? (
              <>
                <div style={s.seasonCard}>
                  <div style={s.seasonGlow} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={s.flexBetween}>
                      <div>
                        <h3 style={{
                          fontSize: 20, fontWeight: 800, margin: '0 0 6px 0',
                          background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
                          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>{currentSeason.name}</h3>
                        <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>{currentSeason.description}</p>
                      </div>
                      <span style={{ ...s.badge, ...s.badgeActive, fontSize: 12, padding: '6px 14px' }}>
                        {currentSeason.status?.toUpperCase() || 'ACTIVE'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
                      <div>
                        <p style={{ fontSize: 11, color: C.textDim, margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: 1 }}>Start</p>
                        <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: C.text }}>
                          <Calendar size={13} style={{ marginRight: 4, verticalAlign: 'middle', color: C.gold }} />{formatDate(currentSeason.start_date)}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: 11, color: C.textDim, margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: 1 }}>End</p>
                        <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: C.text }}>
                          <Calendar size={13} style={{ marginRight: 4, verticalAlign: 'middle', color: C.purple }} />{formatDate(currentSeason.end_date)}
                        </p>
                      </div>
                      {currentSeason.end_date && (() => {
                        const cd = getCountdown(currentSeason.end_date);
                        return cd ? (
                          <div>
                            <p style={{ fontSize: 11, color: C.textDim, margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: 1 }}>Remaining</p>
                            <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: cd.expired ? C.red : C.green }}>
                              <Timer size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />{cd.text}
                            </p>
                          </div>
                        ) : null;
                      })()}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                      <button
                        onClick={handleEndSeason}
                        style={{
                          padding: '8px 18px', borderRadius: 10, border: `1px solid ${C.red}33`,
                          background: `${C.red}15`, color: C.red, fontSize: 13, fontWeight: 700,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                        }}
                      >
                        <Power size={14} /> End Season
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : <div style={{ ...s.emptyState, ...s.chartCard }}>No active season. Create one below.</div>}

            <div style={{ marginBottom: 20 }}>
              <button style={s.btnSecondary} onClick={() => setShowSeasonForm(v => !v)}>
                {showSeasonForm ? <X size={14} /> : <Plus size={14} />}
                {showSeasonForm ? 'Cancel' : 'Create New Season'}
              </button>
            </div>

            {showSeasonForm && (
              <div style={s.formCard}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0', color: C.gold }}>New Season</h3>
                <div style={s.formGrid}>
                  <div style={s.formFull}>
                    <label style={s.label}>Season Name *</label>
                    <input style={inputStyle('sn')} placeholder="Season 4: ..."
                      value={seasonForm.name} onChange={e => setSeasonForm(f => ({ ...f, name: e.target.value }))}
                      onFocus={() => setFocusedInput('sn')} onBlur={() => setFocusedInput(null)} />
                  </div>
                  <div>
                    <label style={s.label}>Start Date *</label>
                    <input type="date" style={{ ...inputStyle('ss'), colorScheme: 'dark' }}
                      value={seasonForm.start_date} onChange={e => setSeasonForm(f => ({ ...f, start_date: e.target.value }))}
                      onFocus={() => setFocusedInput('ss')} onBlur={() => setFocusedInput(null)} />
                  </div>
                  <div>
                    <label style={s.label}>End Date *</label>
                    <input type="date" style={{ ...inputStyle('se'), colorScheme: 'dark' }}
                      value={seasonForm.end_date} onChange={e => setSeasonForm(f => ({ ...f, end_date: e.target.value }))}
                      onFocus={() => setFocusedInput('se')} onBlur={() => setFocusedInput(null)} />
                  </div>
                  <div style={s.formFull}>
                    <button style={{ ...s.btnPrimary, width: '100%', justifyContent: 'center', marginTop: 4 }}
                      onClick={handleCreateSeason}><Trophy size={16} /> Create Season</button>
                  </div>
                </div>
              </div>
            )}

            <hr style={s.divider} />

            {/* Events */}
            <div style={s.flexBetween}>
              <h2 style={s.sectionTitle}><Zap size={20} color={C.purple} /> Active Events</h2>
              <button style={s.btnSecondary} onClick={() => setShowEventForm(v => !v)}>
                {showEventForm ? <X size={14} /> : <Plus size={14} />}
                {showEventForm ? 'Cancel' : 'Create Event'}
              </button>
            </div>

            {showEventForm && (
              <div style={s.formCard}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0', color: C.purple }}>New Event</h3>
                <div style={s.formGrid}>
                  <div style={s.formFull}>
                    <label style={s.label}>Event Name *</label>
                    <input style={inputStyle('en')} placeholder="Double XP Weekend..."
                      value={eventForm.name} onChange={e => setEventForm(f => ({ ...f, name: e.target.value }))}
                      onFocus={() => setFocusedInput('en')} onBlur={() => setFocusedInput(null)} />
                  </div>
                  <div>
                    <label style={s.label}>Event Type</label>
                    <select style={s.select} value={eventForm.type}
                      onChange={e => setEventForm(f => ({ ...f, type: e.target.value }))}>
                      {EVENT_TYPES.map(t => (
                        <option key={t.value} value={t.value} style={{ background: C.bg, color: C.text }}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={s.label}>Multiplier</label>
                    <input type="number" step="0.5" min="1" max="10" style={inputStyle('em')}
                      value={eventForm.multiplier} onChange={e => setEventForm(f => ({ ...f, multiplier: parseFloat(e.target.value) || 1 }))}
                      onFocus={() => setFocusedInput('em')} onBlur={() => setFocusedInput(null)} />
                  </div>
                  {eventForm.type === 'category_spotlight' && (
                    <div>
                      <label style={s.label}>Spotlight Category</label>
                      <select style={s.select} value={eventForm.category}
                        onChange={e => setEventForm(f => ({ ...f, category: e.target.value }))}>
                        <option value="" style={{ background: C.bg }}>Select category</option>
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat} style={{ background: C.bg }}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label style={s.label}>Start Date *</label>
                    <input type="date" style={{ ...inputStyle('es'), colorScheme: 'dark' }}
                      value={eventForm.start_date} onChange={e => setEventForm(f => ({ ...f, start_date: e.target.value }))}
                      onFocus={() => setFocusedInput('es')} onBlur={() => setFocusedInput(null)} />
                  </div>
                  <div>
                    <label style={s.label}>End Date *</label>
                    <input type="date" style={{ ...inputStyle('ee'), colorScheme: 'dark' }}
                      value={eventForm.end_date} onChange={e => setEventForm(f => ({ ...f, end_date: e.target.value }))}
                      onFocus={() => setFocusedInput('ee')} onBlur={() => setFocusedInput(null)} />
                  </div>
                  <div style={s.formFull}>
                    <button style={{ ...s.btnPrimary, width: '100%', justifyContent: 'center', marginTop: 4 }}
                      onClick={handleCreateEvent}><Zap size={16} /> Create Event</button>
                  </div>
                </div>
              </div>
            )}

            {eventsList.length === 0 ? (
              <div style={{ ...s.emptyState, ...s.chartCard }}>No active events.</div>
            ) : (
              eventsList.map(event => {
                const evtType = EVENT_TYPES.find(t => t.value === event.type) || EVENT_TYPES[0];
                const EvtIcon = evtType.icon;
                const cd = getCountdown(event.end_date);
                return (
                  <div key={event.id} style={s.eventCard}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = evtType.color + '55'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: 12,
                        background: evtType.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <EvtIcon size={20} color={evtType.color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{event.name}</p>
                        <p style={{ fontSize: 12, color: C.textMuted, margin: '2px 0 0 0' }}>
                          {formatDate(event.start_date)} — {formatDate(event.end_date)}
                        </p>
                        {cd && !cd.expired && (
                          <p style={{ fontSize: 11, fontWeight: 600, color: C.green, margin: '4px 0 0', animation: 'countdownPulse 2s infinite' }}>
                            <Timer size={11} style={{ marginRight: 3, verticalAlign: 'middle' }} />{cd.text}
                          </p>
                        )}
                      </div>
                    </div>
                    <div style={s.flexRow}>
                      <span style={{ ...s.badge, background: evtType.color + '22', color: evtType.color }}>{evtType.label}</span>
                      {event.multiplier > 1 && <span style={{ ...s.badge, ...s.badgeFeatured }}>{event.multiplier}x</span>}
                      {event.category && <span style={{ ...s.badge, ...s.badgeCategory }}>{event.category}</span>}
                      <span style={{ ...s.badge, ...s.badgeActive }}>{event.status}</span>
                      <button style={s.btnDanger} onClick={() => handleEndEvent(event)}><Power size={13} /> End</button>
                    </div>
                  </div>
                );
              })
            )}

            {/* Event History */}
            {eventsHistory.length > 0 && (
              <>
                <hr style={s.divider} />
                <h2 style={s.sectionTitle}><Clock size={20} color={C.textDim} /> Event History</h2>
                {eventsHistory.slice(0, 10).map(event => (
                  <div key={event.id} style={{ ...s.eventCard, opacity: 0.6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Clock size={20} color={C.textDim} />
                      </div>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{event.name}</p>
                        <p style={{ fontSize: 12, color: C.textMuted, margin: '2px 0 0 0' }}>{formatDate(event.start_date)} — {formatDate(event.end_date)}</p>
                      </div>
                    </div>
                    <span style={{ ...s.badge, ...s.badgeInactive }}>Ended</span>
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {/* ━━━ TAB: USERS ━━━ */}
        {activeTab === 'users' && (
          <>
            <h2 style={s.sectionTitle}><Users size={20} color={C.cyan} /> User Management</h2>

            {/* User detail modal */}
            {selectedUser && (
              <div style={s.formCard}>
                <div style={s.flexBetween}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: C.cyan }}>
                    User Details: {selectedUser.username || selectedUser.name}
                  </h3>
                  <button style={s.btnSmall} onClick={() => setSelectedUser(null)}><X size={13} /> Close</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginTop: 16 }}>
                  {[
                    { label: 'XP', value: formatNumber(selectedUser.xp || 0), color: C.gold },
                    { label: 'Level', value: selectedUser.level || 1, color: C.purple },
                    { label: 'Streak', value: selectedUser.streak || 0, color: C.orange },
                    { label: 'Total Votes', value: selectedUserVotes.length, color: C.green },
                    { label: 'Joined', value: formatDate(selectedUser.created_at), color: C.blue },
                    { label: 'Status', value: selectedUser.is_banned ? 'Banned' : 'Active', color: selectedUser.is_banned ? C.red : C.green },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: `1px solid ${C.border}` }}>
                      <p style={{ fontSize: 11, color: C.textDim, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</p>
                      <p style={{ fontSize: 18, fontWeight: 800, margin: 0, color }}>{value}</p>
                    </div>
                  ))}
                </div>
                {/* Recent votes */}
                {selectedUserVotes.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.textMuted, margin: '0 0 8px' }}>Recent Votes ({selectedUserVotes.length} total)</p>
                    {selectedUserVotes.slice(0, 5).map((v, i) => (
                      <div key={v.id || i} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, marginBottom: 4, fontSize: 12, color: C.textMuted }}>
                        Dilemma: {v.dilemma_id} — Chose: <span style={{ color: v.choice === 'a' ? C.gold : C.purple, fontWeight: 700 }}>Option {(v.choice || '?').toUpperCase()}</span>
                        <span style={{ marginLeft: 8, color: C.textDim }}>{timeAgo(v.created_at)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {/* Give XP */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
                  <Gift size={16} color={C.gold} />
                  <input type="number" min="1" style={{ ...inputStyle('bxp'), width: 100 }}
                    value={bonusXPAmount} onChange={e => setBonusXPAmount(parseInt(e.target.value) || 0)}
                    onFocus={() => setFocusedInput('bxp')} onBlur={() => setFocusedInput(null)} />
                  <button style={s.btnSuccess} onClick={() => handleGiveXP(selectedUser)}>
                    <Gift size={13} /> Give XP
                  </button>
                </div>
              </div>
            )}

            {/* Search */}
            <div style={s.searchBar}>
              <Search size={16} color={C.textDim} />
              <input style={s.searchInput} placeholder="Search users by name, username, email..."
                value={userSearch} onChange={e => setUserSearch(e.target.value)} />
              {userSearch && <X size={14} color={C.textDim} style={{ cursor: 'pointer' }} onClick={() => setUserSearch('')} />}
            </div>

            <p style={{ fontSize: 12, color: C.textDim, margin: '0 0 12px' }}>{filteredUsers.length} users found</p>

            {filteredUsers.length === 0 ? (
              <div style={{ ...s.emptyState, ...s.chartCard }}>
                {allUsers.length === 0 ? 'Loading users...' : 'No users match your search.'}
              </div>
            ) : (
              filteredUsers.slice(0, 50).map(u => (
                <div key={u.id} style={{ ...s.listCard, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderLight; e.currentTarget.style.background = C.bgCardHover; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bgCard; }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: u.is_banned ? C.redDim : `linear-gradient(135deg, ${C.goldDim}, ${C.purpleDim})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `2px solid ${u.is_banned ? C.red + '44' : C.border}`,
                    }}>
                      {u.is_banned ? <Ban size={16} color={C.red} /> : <Users size={16} color={C.gold} />}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, margin: 0, color: u.is_banned ? C.red : C.text }}>{u.username || u.name || 'Unknown'}</p>
                      <p style={{ fontSize: 11, color: C.textDim, margin: '2px 0 0' }}>
                        Lv.{u.level || 1} | {formatNumber(u.xp || 0)} XP | Streak: {u.streak || 0}
                        {u.email && <span> | {u.email}</span>}
                      </p>
                    </div>
                  </div>
                  <div style={s.flexRow}>
                    <button style={s.btnCyan} onClick={() => handleViewUserActivity(u)}>
                      <Eye size={13} /> View
                    </button>
                    {u.is_banned ? (
                      <button style={s.btnSuccess} onClick={() => handleUnbanUserDirect(u)}><RefreshCw size={13} /> Unban</button>
                    ) : (
                      <button style={s.btnDanger} onClick={() => handleBanUserDirect(u)}><Ban size={13} /> Ban</button>
                    )}
                  </div>
                </div>
              ))
            )}
            {filteredUsers.length > 50 && (
              <p style={{ textAlign: 'center', fontSize: 12, color: C.textDim, marginTop: 12 }}>
                Showing 50 of {filteredUsers.length} users. Refine your search to see more.
              </p>
            )}
          </>
        )}

        {/* ━━━ TAB: MODERATION ━━━ */}
        {activeTab === 'moderation' && (
          <>
            {/* Pending Reports */}
            <h2 style={s.sectionTitle}>
              <Flag size={20} color={C.orange} /> Pending Reports
              {reportsList.length > 0 && <span style={{ ...s.badge, ...s.badgePending, marginLeft: 4 }}>{reportsList.length}</span>}
            </h2>

            {reportsList.length === 0 ? (
              <div style={{ ...s.emptyState, ...s.chartCard }}>
                <CheckCircle size={32} color={C.green} style={{ marginBottom: 12 }} />
                <p style={{ margin: 0 }}>No pending reports. All clear!</p>
              </div>
            ) : (
              reportsList.map(report => (
                <div key={report.id} style={s.listCard}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}>
                  <div style={s.flexBetween}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <AlertTriangle size={16} color={C.orange} />
                        <span style={{ fontSize: 14, fontWeight: 700 }}>
                          <span style={{ color: C.textMuted }}>Reported:</span>{' '}
                          <span style={{ color: C.red }}>{report.reported_username}</span>
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: C.textMuted, margin: '0 0 4px 0' }}>
                        <span style={{ fontWeight: 600 }}>Reporter:</span> {report.reporter_username}
                        <span style={{ margin: '0 8px', color: C.textDim }}>|</span>
                        <span style={{ fontWeight: 600 }}>Type:</span>{' '}
                        <span style={{ ...s.badge, ...s.badgeCategory, padding: '2px 8px' }}>{report.content_type}</span>
                      </p>
                      <p style={{ fontSize: 13, color: C.text, margin: '8px 0 0 0', lineHeight: 1.4, fontStyle: 'italic', opacity: 0.8 }}>
                        "{report.reason}"
                      </p>
                    </div>
                    <span style={{ fontSize: 11, color: C.textDim, whiteSpace: 'nowrap' }}>{timeAgo(report.created_at)}</span>
                  </div>
                  <div style={s.actionRow}>
                    <button style={s.btnSecondary} onClick={() => handleDismissReport(report)}><X size={13} /> Dismiss</button>
                    <button style={s.btnWarning} onClick={() => handleWarnUser(report)}><AlertTriangle size={13} /> Warn User</button>
                    <button style={s.btnDanger} onClick={() => handleBanUser(report)}><Ban size={13} /> Ban User</button>
                  </div>
                </div>
              ))
            )}

            <hr style={s.divider} />

            {/* Flagged Dilemmas */}
            <h2 style={s.sectionTitle}><AlertTriangle size={20} color={C.red} /> Flagged Dilemmas</h2>
            {(() => {
              const flagged = dilemmaList.filter(d => d.is_flagged || d.status === 'flagged');
              return flagged.length === 0 ? (
                <div style={{ ...s.emptyState, ...s.chartCard }}>
                  <CheckCircle size={32} color={C.green} style={{ marginBottom: 12 }} />
                  <p style={{ margin: 0 }}>No flagged dilemmas.</p>
                </div>
              ) : (
                flagged.map(d => (
                  <div key={d.id} style={s.listCard}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}>
                    <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 8px', lineHeight: 1.4 }}>{d.question}</p>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: C.textMuted }}>
                      <span style={{ color: C.gold }}>A: {d.option_a}</span>
                      <span style={{ color: C.purple }}>B: {d.option_b}</span>
                    </div>
                    <div style={s.actionRow}>
                      <button style={s.btnSuccess} onClick={() => handleToggleActive(d)}><CheckCircle size={13} /> Approve</button>
                      <button style={s.btnDanger} onClick={() => handleDeleteDilemma(d)}><Trash2 size={13} /> Remove</button>
                    </div>
                  </div>
                ))
              );
            })()}

            <hr style={s.divider} />

            {/* User-Submitted Questions */}
            <h2 style={s.sectionTitle}><MessageSquare size={20} color={C.cyan} /> User-Submitted Questions</h2>
            {(() => {
              const pending = dilemmaList.filter(d => d.status === 'pending' || d.submitted_by);
              return pending.length === 0 ? (
                <div style={{ ...s.emptyState, ...s.chartCard }}>
                  <p style={{ margin: 0 }}>No user-submitted questions awaiting review.</p>
                </div>
              ) : (
                pending.map(d => (
                  <div key={d.id} style={s.listCard}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.cyanGlow; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}>
                    <div style={s.flexBetween}>
                      <p style={{ fontSize: 14, fontWeight: 600, margin: 0, lineHeight: 1.4, flex: 1 }}>{d.question}</p>
                      <span style={{ ...s.badge, ...s.badgePending }}>Pending</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12, color: C.textMuted }}>
                      <span style={{ color: C.gold }}>A: {d.option_a}</span>
                      <span style={{ color: C.purple }}>B: {d.option_b}</span>
                    </div>
                    {d.submitted_by && (
                      <p style={{ fontSize: 11, color: C.textDim, margin: '6px 0 0' }}>Submitted by: {d.submitted_by}</p>
                    )}
                    <div style={s.actionRow}>
                      <button style={s.btnSuccess} onClick={async () => {
                        try {
                          await API.dilemmas.update(d.id, { status: 'active' });
                          setDilemmaList(prev => prev.map(x => x.id === d.id ? { ...x, status: 'active' } : x));
                          showToast('Question approved');
                        } catch { showToast('Failed to approve', 'error'); }
                      }}><CheckCircle size={13} /> Approve</button>
                      <button style={s.btnDanger} onClick={() => handleDeleteDilemma(d)}><Trash2 size={13} /> Reject</button>
                      <button style={s.btnSmall} onClick={() => startEditDilemma(d)}><Edit3 size={13} /> Edit & Approve</button>
                    </div>
                  </div>
                ))
              );
            })()}

            <hr style={s.divider} />

            {/* Banned Users */}
            <h2 style={s.sectionTitle}>
              <UserX size={20} color={C.red} /> Banned Users
              {bannedList.length > 0 && <span style={{ ...s.badge, ...s.badgeDeleted, marginLeft: 4 }}>{bannedList.length}</span>}
            </h2>

            {bannedList.length === 0 ? (
              <div style={{ ...s.emptyState, ...s.chartCard }}><p style={{ margin: 0 }}>No banned users.</p></div>
            ) : (
              bannedList.map(banned => (
                <div key={banned.id}
                  style={{ ...s.listCard, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: C.redDim, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <UserX size={16} color={C.red} />
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, margin: 0, color: C.red }}>{banned.username}</p>
                        <p style={{ fontSize: 11, color: C.textDim, margin: '2px 0 0 0' }}>
                          Banned {formatDate(banned.banned_at)} — {banned.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button style={s.btnSuccess} onClick={() => handleUnbanUser(banned)}>
                    <RefreshCw size={13} /> Unban
                  </button>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
