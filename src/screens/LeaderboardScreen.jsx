import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Crown, ChevronUp, ChevronDown, Flame, Star, TrendingUp, TrendingDown, Award, Zap, Medal, Swords, Clock, Minus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { leaderboards, admin, seasons } from '../services/api';
import { XP_LEVELS } from '../utils/constants';

// ── Keyframes ───────────────────────────────────────────────
const keyframesId = 'lux-leaderboard-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(keyframesId)) {
  const style = document.createElement('style');
  style.id = keyframesId;
  style.textContent = `
    @keyframes lbShimmer {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes lbGlow {
      0%, 100% { box-shadow: 0 0 20px rgba(0,212,255,0.15), 0 0 40px rgba(0,212,255,0.05); }
      50%      { box-shadow: 0 0 30px rgba(0,212,255,0.35), 0 0 60px rgba(0,212,255,0.12); }
    }
    @keyframes lbFloat {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-6px); }
    }
    @keyframes lbXpPop {
      0%   { opacity: 1; transform: translateY(0) scale(1); }
      100% { opacity: 0; transform: translateY(-40px) scale(1.3); }
    }
    @keyframes lbCrownBob {
      0%, 100% { transform: translateY(0) rotate(-5deg); }
      25%  { transform: translateY(-3px) rotate(2deg); }
      50%  { transform: translateY(-1px) rotate(-2deg); }
      75%  { transform: translateY(-4px) rotate(3deg); }
    }
    @keyframes lbPulseRing {
      0%   { transform: scale(1); opacity: 0.5; }
      100% { transform: scale(1.8); opacity: 0; }
    }
    @keyframes lbGoldShine {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes lbPodiumRise {
      0%   { transform: scaleY(0); opacity: 0; }
      60%  { transform: scaleY(1.05); opacity: 1; }
      100% { transform: scaleY(1); opacity: 1; }
    }
    @keyframes lbTrophySpin {
      0%   { transform: rotateY(0deg); }
      100% { transform: rotateY(360deg); }
    }
    @keyframes lbTabSlide {
      0%   { transform: scaleX(0); }
      100% { transform: scaleX(1); }
    }
    @keyframes lbNumberPop {
      0%   { transform: scale(0.5); opacity: 0; }
      60%  { transform: scale(1.15); }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes lbStarTwinkle {
      0%, 100% { opacity: 0.4; transform: scale(0.8); }
      50%      { opacity: 1; transform: scale(1.2); }
    }
    @keyframes lbBorderGlow {
      0%, 100% { border-color: rgba(0,212,255,0.2); }
      50%      { border-color: rgba(0,212,255,0.5); }
    }
    @keyframes lbSilverGlow {
      0%, 100% { box-shadow: 0 0 15px rgba(192,192,192,0.1); }
      50%      { box-shadow: 0 0 25px rgba(192,192,192,0.25); }
    }
    @keyframes lbBronzeGlow {
      0%, 100% { box-shadow: 0 0 15px rgba(255,107,53,0.1); }
      50%      { box-shadow: 0 0 25px rgba(255,107,53,0.25); }
    }
    @keyframes lbParticleRise {
      0% { transform: translateY(0) scale(1); opacity: 0.8; }
      50% { opacity: 1; }
      100% { transform: translateY(-60px) scale(0); opacity: 0; }
    }
    @keyframes lbParticleDrift {
      0% { transform: translate(0, 0) scale(0.5); opacity: 0; }
      30% { opacity: 1; transform: scale(1); }
      100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
    }
    @keyframes lbRankUp {
      0% { transform: translateY(4px); opacity: 0; }
      50% { transform: translateY(-2px); opacity: 1; }
      100% { transform: translateY(0); opacity: 1; }
    }
    @keyframes lbRankDown {
      0% { transform: translateY(-4px); opacity: 0; }
      50% { transform: translateY(2px); opacity: 1; }
      100% { transform: translateY(0); opacity: 1; }
    }
    @keyframes lbChallengePulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(191,90,242,0.2); }
      50% { box-shadow: 0 0 0 4px rgba(191,90,242,0); }
    }
    @keyframes lbTimerTick {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    @keyframes lbTimerGlow {
      0%, 100% { text-shadow: 0 0 4px rgba(0,212,255,0.2); }
      50% { text-shadow: 0 0 12px rgba(0,212,255,0.5); }
    }
    .lb-challenge-btn:hover {
      background: linear-gradient(135deg, rgba(191,90,242,0.25), rgba(0,212,255,0.15)) !important;
      border-color: rgba(191,90,242,0.5) !important;
      transform: scale(1.05);
    }
    .lb-rank-row:hover {
      background: rgba(255,255,255,0.04) !important;
      border-color: rgba(255,255,255,0.1) !important;
    }
  `;
  document.head.appendChild(style);
}

const PERIODS = [
  { key: 'daily',  label: 'Daily',    icon: Zap },
  { key: 'weekly', label: 'Weekly',   icon: Flame },
  { key: 'season', label: 'Season',   icon: Award },
  { key: 'all',    label: 'All Time', icon: Trophy },
];

const MEDAL_COLORS = {
  1: {
    border: '#00D4FF',
    bg: 'linear-gradient(180deg, rgba(0,212,255,0.12) 0%, rgba(0,212,255,0.04) 100%)',
    shadow: 'rgba(0,212,255,0.35)',
    glow: 'lbGlow',
    text: '#00D4FF',
    avatarBorder: 'linear-gradient(135deg, #00D4FF, #FF2D78)',
  },
  2: {
    border: '#C0C0C0',
    bg: 'linear-gradient(180deg, rgba(192,192,192,0.10) 0%, rgba(192,192,192,0.03) 100%)',
    shadow: 'rgba(192,192,192,0.25)',
    glow: 'lbSilverGlow',
    text: '#E0E0E0',
    avatarBorder: 'linear-gradient(135deg, #C0C0C0, #A0A0A0)',
  },
  3: {
    border: '#FF6B35',
    bg: 'linear-gradient(180deg, rgba(255,107,53,0.10) 0%, rgba(255,107,53,0.03) 100%)',
    shadow: 'rgba(255,107,53,0.25)',
    glow: 'lbBronzeGlow',
    text: '#FF6B35',
    avatarBorder: 'linear-gradient(135deg, #FF6B35, #FF2D78)',
  },
};

function getLevelInfo(level) {
  const info = XP_LEVELS.find((l) => l.level === level);
  return info || { level, title: 'Unknown', xp: 0 };
}

function getInitials(username) {
  return (username || '?').slice(0, 2).toUpperCase();
}

function formatPoints(pts) {
  if (pts >= 10000) return (pts / 1000).toFixed(1) + 'K';
  return pts.toLocaleString();
}

// ── Podium Particle Effects ──────────────────────────────────
function PodiumParticles({ rank, color }) {
  const particleCount = rank === 1 ? 8 : rank === 2 ? 5 : 4;
  const particles = Array.from({ length: particleCount }, (_, i) => {
    const angle = (i / particleCount) * 360;
    const dist = 30 + Math.random() * 50;
    const dx = Math.cos((angle * Math.PI) / 180) * dist;
    const dy = -(20 + Math.random() * 40);
    const size = 3 + Math.random() * 4;
    const dur = 2 + Math.random() * 2;
    const delay = Math.random() * 2;

    return (
      <motion.div
        key={i}
        animate={{
          y: [0, dy, dy - 10],
          x: [0, dx * 0.3, dx * 0.6],
          opacity: [0, 1, 0],
          scale: [0.5, 1, 0],
        }}
        transition={{
          duration: dur, delay, repeat: Infinity,
          ease: 'easeOut',
        }}
        style={{
          position: 'absolute',
          bottom: '50%', left: '50%',
          width: size, height: size,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 6px ${color}`,
          pointerEvents: 'none',
        }}
      />
    );
  });

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible', zIndex: 1 }}>
      {particles}
    </div>
  );
}

// ── Season Countdown Timer ──────────────────────────────────
function SeasonCountdown() {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    function update() {
      // Season ends at end of current month
      const now = new Date();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const diff = endOfMonth - now;
      if (diff <= 0) {
        setTimeLeft('Season ended!');
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${days}d ${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`);
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 10, padding: '10px 20px', margin: '12px 16px 0',
        borderRadius: 14,
        background: 'linear-gradient(135deg, rgba(0,212,255,0.06), rgba(191,90,242,0.04))',
        border: '1px solid rgba(0,212,255,0.15)',
      }}
    >
      <Clock size={14} color="#00D4FF" style={{ animation: 'lbTimerTick 2s ease-in-out infinite' }} />
      <span style={{
        fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase', letterSpacing: 1.5,
      }}>
        Season ends in
      </span>
      <span style={{
        fontSize: 14, fontWeight: 900, color: '#00D4FF',
        fontVariantNumeric: 'tabular-nums', letterSpacing: 0.5,
        animation: 'lbTimerGlow 3s ease-in-out infinite',
      }}>
        {timeLeft}
      </span>
    </motion.div>
  );
}

// ── Rank Change Indicator ───────────────────────────────────
function RankChange({ change }) {
  if (!change || change === 0) {
    return (
      <span style={{
        fontSize: 10, color: 'rgba(255,255,255,0.2)', fontWeight: 600,
        display: 'flex', alignItems: 'center', gap: 2,
      }}>
        <Minus size={10} /> --
      </span>
    );
  }
  const isUp = change > 0;
  return (
    <motion.span
      initial={{ opacity: 0, y: isUp ? 4 : -4 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        fontSize: 11, fontWeight: 700,
        color: isUp ? '#22c55e' : '#ef4444',
        display: 'flex', alignItems: 'center', gap: 1,
      }}
    >
      {isUp ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      {Math.abs(change)}
    </motion.span>
  );
}

// ── Component ───────────────────────────────────────────────
export default function LeaderboardScreen() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('all');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const userRowRef = useRef(null);

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  async function loadLeaderboard() {
    setLoading(true);
    try {
      let data;
      const now = new Date();
      const today = now.toISOString().slice(0, 10);
      const jan4 = new Date(now.getFullYear(), 0, 4);
      const weekNum = Math.ceil(((now - jan4) / 86400000 + jan4.getDay() + 1) / 7);
      const weekKey = `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;

      if (period === 'daily') {
        data = await leaderboards.getDaily(today);
      } else if (period === 'weekly') {
        data = await leaderboards.getWeekly(weekKey);
      } else if (period === 'season') {
        // Find active season dynamically
        const activeSeason = await seasons.getActive().catch(() => []);
        const seasonArr = Array.isArray(activeSeason) ? activeSeason : activeSeason ? [activeSeason] : [];
        if (seasonArr.length > 0) {
          data = await leaderboards.getSeason(`season-${seasonArr[0].id}`);
        } else {
          data = [];
        }
      } else {
        // "All Time" — read from users table directly
        const users = await admin.getAllUsers();
        const usersArr = Array.isArray(users) ? users : [];
        data = usersArr
          .filter((u) => u.record_status !== 'banned')
          .map((u) => ({
            id: u.id,
            user_id: u.id,
            username: u.username,
            avatar_url: u.avatar_url,
            points: u.xp || 0,
            xp: u.xp || 0,
            level: u.level || 1,
            current_streak: u.current_streak || 0,
          }));
      }

      let rows = Array.isArray(data) ? data : data ? [data] : [];

      // For period-based entries, enrich with user data if username missing
      if (period !== 'all' && rows.length > 0 && !rows[0].username) {
        const allUsers = await admin.getAllUsers().catch(() => []);
        const usersMap = {};
        (Array.isArray(allUsers) ? allUsers : []).forEach((u) => { usersMap[u.id] = u; });
        rows = rows.map((r) => {
          const u = usersMap[r.user_id] || {};
          return { ...r, id: r.user_id || r.id, username: r.username || u.username || 'User', avatar_url: r.avatar_url || u.avatar_url };
        });
      }

      setEntries(rows.sort((a, b) => (b.points || 0) - (a.points || 0)));
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }

  // Compute current user rank
  const userId = user?.id;
  const userIdx = entries.findIndex((e) => e.id === userId);
  const userRank = userIdx >= 0 ? userIdx + 1 : entries.length + 1;
  const userEntry = userIdx >= 0 ? entries[userIdx] : null;
  const nextEntry = userIdx > 0 ? entries[userIdx - 1] : null;
  const pointsToNext = nextEntry && userEntry ? nextEntry.points - userEntry.points : 0;
  const progressPct = nextEntry && userEntry && pointsToNext > 0
    ? Math.min(100, Math.max(0, ((userEntry.points) / (nextEntry.points)) * 100))
    : 100;

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  // Scroll to user row after load
  useEffect(() => {
    if (!loading && userRowRef.current) {
      userRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [loading, period]);

  // Podium order: #2 (left), #1 (center, tallest), #3 (right)
  const podiumOrder = [top3[1], top3[0], top3[2]];
  const podiumConfigs = [
    { rank: 2, pedestalH: 90,  avatarSize: 56, delay: 0.3 },
    { rank: 1, pedestalH: 120, avatarSize: 72, delay: 0.1 },
    { rank: 3, pedestalH: 70,  avatarSize: 50, delay: 0.5 },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0f 0%, #0d0a18 40%, #0a0a0f 100%)',
      fontFamily: "'Inter', sans-serif",
      color: '#fff',
      paddingBottom: 110,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Your Rank Banner */}
      {!loading && userEntry && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '12px 20px',
            background: 'linear-gradient(90deg, rgba(0,212,255,0.08) 0%, rgba(191,90,242,0.06) 50%, rgba(0,212,255,0.08) 100%)',
            borderBottom: '1px solid rgba(0,212,255,0.1)',
          }}
        >
          <Medal size={16} color="#00D4FF" />
          <span style={{
            fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.5)',
          }}>
            Your Rank
          </span>
          <span style={{
            fontSize: 22, fontWeight: 900, color: '#00D4FF',
            textShadow: '0 0 20px rgba(0,212,255,0.4)',
            animation: 'lbNumberPop 0.6s ease-out',
          }}>
            #{userRank}
          </span>
          <span style={{
            fontSize: 13, color: 'rgba(255,255,255,0.35)', fontWeight: 500,
          }}>
            of {entries.length}
          </span>
        </motion.div>
      )}

      {/* Header */}
      <div style={{ textAlign: 'center', padding: '28px 20px 0', position: 'relative' }}>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontSize: 32, fontWeight: 900, margin: 0, letterSpacing: -0.5,
            background: 'linear-gradient(135deg, #00D4FF 0%, #33E0FF 40%, #00D4FF 60%, #FF2D78 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-flex', alignItems: 'center', gap: 12,
            animation: 'lbGoldShine 3s linear infinite',
          }}
        >
          <motion.span
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 2, delay: 0.5, ease: 'easeInOut' }}
            style={{ display: 'inline-flex', WebkitTextFillColor: 'initial' }}
          >
            <Trophy size={30} color="#00D4FF" style={{ filter: 'drop-shadow(0 0 8px rgba(0,212,255,0.5))' }} />
          </motion.span>
          Leaderboard
        </motion.h1>
        <p style={{
          color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 6,
          letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: 500,
        }}>
          Compete for the Crown
        </p>
      </div>

      {/* Period Tabs with animated underline */}
      <div style={{
        display: 'flex', gap: 4, justifyContent: 'center',
        padding: '22px 16px 0', position: 'relative',
      }}>
        {PERIODS.map((p) => {
          const active = period === p.key;
          const Icon = p.icon;
          return (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              style={{
                padding: '10px 20px', borderRadius: 24, cursor: 'pointer',
                border: active ? '1px solid rgba(0,212,255,0.4)' : '1px solid rgba(255,255,255,0.06)',
                background: active
                  ? 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(191,90,242,0.08))'
                  : 'rgba(255,255,255,0.02)',
                color: active ? '#00D4FF' : 'rgba(255,255,255,0.4)',
                fontSize: 13, fontWeight: 700, fontFamily: "'Inter', sans-serif",
                transition: 'all 0.3s ease',
                display: 'flex', alignItems: 'center', gap: 6,
                position: 'relative', overflow: 'hidden',
                boxShadow: active ? '0 0 20px rgba(0,212,255,0.1)' : 'none',
              }}
            >
              <Icon size={14} style={{ opacity: active ? 1 : 0.5 }} />
              {p.label}
              {active && (
                <motion.div
                  layoutId="tabIndicator"
                  style={{
                    position: 'absolute', bottom: 0, left: '20%', right: '20%',
                    height: 2, borderRadius: 1,
                    background: 'linear-gradient(90deg, #00D4FF, #BF5AF2)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Season Countdown Timer */}
      {(period === 'season' || period === 'weekly') && <SeasonCountdown />}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: 'rgba(255,255,255,0.3)' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ display: 'inline-block' }}
          >
            <Flame size={32} color="#00D4FF" style={{ filter: 'drop-shadow(0 0 10px rgba(0,212,255,0.5))' }} />
          </motion.div>
          <p style={{ marginTop: 16, fontSize: 14, fontWeight: 500, letterSpacing: 0.5 }}>Loading rankings...</p>
        </div>
      ) : entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: 'rgba(255,255,255,0.3)' }}>
          <Trophy size={56} style={{ marginBottom: 20, opacity: 0.2 }} />
          <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'rgba(255,255,255,0.4)' }}>
            No rankings yet
          </p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.25)' }}>
            Start playing to claim your spot on the leaderboard!
          </p>
        </div>
      ) : (
        <>
          {/* ===== PODIUM SECTION ===== */}
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
            gap: 10, padding: '40px 16px 20px', position: 'relative',
          }}>
            {podiumOrder.map((entry, i) => {
              if (!entry) return <div key={i} style={{ width: 110 }} />;
              const cfg = podiumConfigs[i];
              const medal = MEDAL_COLORS[cfg.rank];

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 60, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: cfg.delay,
                    type: 'spring', stiffness: 180, damping: 14,
                  }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    width: cfg.rank === 1 ? 130 : 110,
                    position: 'relative',
                  }}
                >
                  {/* Particle Effects */}
                  <PodiumParticles rank={cfg.rank} color={medal.border} />

                  {/* Crown for #1 */}
                  {cfg.rank === 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.7, type: 'spring', stiffness: 300 }}
                      style={{
                        marginBottom: -8, zIndex: 2,
                        animation: 'lbCrownBob 3s ease-in-out infinite',
                        filter: 'drop-shadow(0 0 8px rgba(0,212,255,0.6))',
                      }}
                    >
                      <Crown size={28} color="#00D4FF" fill="#00D4FF" />
                    </motion.div>
                  )}

                  {/* Avatar container with pulse ring for #1 */}
                  <div style={{ position: 'relative', marginBottom: 10 }}>
                    {cfg.rank === 1 && (
                      <div style={{
                        position: 'absolute', inset: -8,
                        borderRadius: '50%', border: '2px solid rgba(0,212,255,0.3)',
                        animation: 'lbPulseRing 2s ease-out infinite',
                      }} />
                    )}
                    <div style={{
                      width: cfg.avatarSize, height: cfg.avatarSize,
                      borderRadius: '50%',
                      padding: 3,
                      background: medal.avatarBorder,
                      boxShadow: `0 0 20px ${medal.shadow}`,
                    }}>
                      <div style={{
                        width: '100%', height: '100%', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: cfg.rank === 1 ? 22 : 17,
                        color: '#fff',
                        background: entry.avatar_url
                          ? `url(${entry.avatar_url}) center/cover`
                          : 'linear-gradient(135deg, #BF5AF2, #6D28D9)',
                        overflow: 'hidden',
                      }}>
                        {!entry.avatar_url && getInitials(entry.username)}
                      </div>
                    </div>
                  </div>

                  {/* Username */}
                  <div style={{
                    fontWeight: 700, fontSize: cfg.rank === 1 ? 15 : 13,
                    color: '#fff', textAlign: 'center',
                    maxWidth: cfg.rank === 1 ? 120 : 100,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    marginBottom: 4,
                  }}>
                    {entry.username}
                  </div>

                  {/* Points */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: cfg.delay + 0.3, type: 'spring', stiffness: 300 }}
                    style={{
                      fontSize: cfg.rank === 1 ? 20 : 16,
                      fontWeight: 900, color: medal.text,
                      textShadow: `0 0 15px ${medal.shadow}`,
                      marginBottom: 10,
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    <Star size={cfg.rank === 1 ? 16 : 13} fill={medal.text} color={medal.text}
                      style={{ animation: 'lbStarTwinkle 2s ease-in-out infinite' }} />
                    {formatPoints(entry.points)}
                  </motion.div>

                  {/* Pedestal */}
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: cfg.delay + 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                    style={{
                      width: '100%', height: cfg.pedestalH,
                      borderRadius: '14px 14px 0 0',
                      background: medal.bg,
                      border: `1px solid ${medal.border}`,
                      borderBottom: 'none',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      transformOrigin: 'bottom center',
                      animation: `${medal.glow} 3s ease-in-out infinite`,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Decorative shimmer line */}
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                      background: `linear-gradient(90deg, transparent, ${medal.border}, transparent)`,
                      opacity: 0.6,
                    }} />
                    <span style={{
                      fontSize: cfg.rank === 1 ? 36 : 28,
                      fontWeight: 900,
                      color: medal.text,
                      opacity: 0.25,
                      lineHeight: 1,
                    }}>
                      {cfg.rank}
                    </span>
                    <span style={{
                      fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: 2, color: medal.text, opacity: 0.35,
                      marginTop: 4,
                    }}>
                      {cfg.rank === 1 ? 'Champion' : cfg.rank === 2 ? 'Runner Up' : 'Third'}
                    </span>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Divider */}
          <div style={{
            maxWidth: 500, margin: '0 auto', padding: '0 16px',
          }}>
            <div style={{
              height: 1, width: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(191,90,242,0.3), rgba(0,212,255,0.2), rgba(191,90,242,0.3), transparent)',
              marginBottom: 6,
            }} />
          </div>

          {/* ===== RANKINGS LIST ===== */}
          <div style={{ padding: '12px 16px 0', maxWidth: 500, margin: '0 auto' }}>
            <AnimatePresence>
              {rest.map((entry, i) => {
                const rank = i + 4;
                const isUser = entry.id === userId;
                const levelInfo = getLevelInfo(entry.level || 1);

                return (
                  <motion.div
                    key={entry.id}
                    ref={isUser ? userRowRef : undefined}
                    className={!isUser ? 'lb-rank-row' : ''}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.6), ease: 'easeOut' }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 18px', borderRadius: 16, marginBottom: 8,
                      background: isUser
                        ? 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(191,90,242,0.04))'
                        : 'rgba(255,255,255,0.025)',
                      border: isUser
                        ? '1px solid rgba(0,212,255,0.35)'
                        : '1px solid rgba(255,255,255,0.05)',
                      transition: 'all 0.25s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      ...(isUser ? {
                        animation: 'lbBorderGlow 3s ease-in-out infinite',
                        boxShadow: '0 0 25px rgba(0,212,255,0.08)',
                      } : {}),
                    }}
                  >
                    {/* Highlight shimmer for current user */}
                    {isUser && (
                      <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.03), transparent)',
                        backgroundSize: '200% 100%',
                        animation: 'lbShimmer 4s linear infinite',
                        pointerEvents: 'none',
                      }} />
                    )}

                    {/* Rank Number + Change Indicator */}
                    <div style={{
                      width: 38, textAlign: 'center', flexShrink: 0,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                    }}>
                      <span style={{
                        fontWeight: 800,
                        fontSize: isUser ? 18 : 15,
                        color: isUser ? '#00D4FF' : rank <= 10 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.35)',
                        fontVariantNumeric: 'tabular-nums', lineHeight: 1,
                      }}>
                        {rank}
                      </span>
                      <RankChange change={entry.rank_change ?? (entry.prev_rank ? entry.prev_rank - rank : 0)} />
                    </div>

                    {/* Avatar */}
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                      padding: 2,
                      background: isUser
                        ? 'linear-gradient(135deg, #00D4FF, #BF5AF2)'
                        : 'linear-gradient(135deg, rgba(191,90,242,0.4), rgba(0,212,255,0.3))',
                    }}>
                      <div style={{
                        width: '100%', height: '100%', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 14, color: '#fff',
                        background: isUser
                          ? 'linear-gradient(135deg, #00D4FF, #FF2D78)'
                          : 'linear-gradient(135deg, #BF5AF2, #6D28D9)',
                        overflow: 'hidden',
                      }}>
                        {entry.avatar_url ? (
                          <img
                            src={entry.avatar_url} alt=""
                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <span style={{ color: isUser ? '#0a0a0f' : '#fff' }}>
                            {getInitials(entry.username)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 700, fontSize: 15,
                        color: isUser ? '#00D4FF' : '#fff',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                        {entry.username}
                        {isUser && (
                          <span style={{
                            fontSize: 10, fontWeight: 600, color: '#fff',
                            background: '#00D4FF', borderRadius: 6, padding: '1px 6px',
                          }}>
                            YOU
                          </span>
                        )}
                      </div>
                      <div style={{ marginTop: 3 }}>
                        <span style={{
                          display: 'inline-block', padding: '2px 10px',
                          borderRadius: 10,
                          background: 'rgba(191,90,242,0.12)',
                          border: '1px solid rgba(191,90,242,0.2)',
                          color: '#C084FC',
                          fontSize: 10, fontWeight: 700,
                          letterSpacing: 0.5,
                        }}>
                          Lv.{levelInfo.level} {levelInfo.title}
                        </span>
                      </div>
                    </div>

                    {/* Points */}
                    <div style={{
                      fontWeight: 800, fontSize: 17, flexShrink: 0,
                      color: isUser ? '#00D4FF' : '#00D4FF',
                      display: 'flex', alignItems: 'center', gap: 5,
                      textShadow: isUser ? '0 0 12px rgba(0,212,255,0.3)' : 'none',
                    }}>
                      <Star size={14} fill={isUser ? '#00D4FF' : '#00D4FF'} color={isUser ? '#00D4FF' : '#00D4FF'} />
                      {formatPoints(entry.points)}
                    </div>

                    {/* Challenge Button */}
                    {!isUser && userId && (
                      <motion.button
                        className="lb-challenge-btn"
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          // Placeholder for challenge functionality
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                          border: '1px solid rgba(191,90,242,0.3)',
                          background: 'linear-gradient(135deg, rgba(191,90,242,0.1), rgba(0,212,255,0.06))',
                          cursor: 'pointer', transition: 'all 0.25s ease',
                          animation: 'lbChallengePulse 3s ease-in-out infinite',
                        }}
                        title={`Challenge ${entry.username}`}
                      >
                        <Swords size={14} color="#BF5AF2" />
                      </motion.button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* ===== YOUR RANK FOOTER ===== */}
      {!loading && userEntry && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(180deg, rgba(10,10,15,0.0) 0%, #0a0a0f 20%, #0d0a18 100%)',
          padding: '35px 16px 22px', zIndex: 50,
        }}>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 150, damping: 18 }}
            style={{
              maxWidth: 500, margin: '0 auto',
              background: 'linear-gradient(135deg, rgba(0,212,255,0.06), rgba(191,90,242,0.04))',
              border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: 18, padding: '18px 22px',
              display: 'flex', alignItems: 'center', gap: 18,
              backdropFilter: 'blur(20px)',
              boxShadow: '0 -4px 30px rgba(0,0,0,0.4), 0 0 30px rgba(0,212,255,0.05)',
            }}
          >
            {/* Rank circle */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0,
              position: 'relative',
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(191,90,242,0.1))',
                border: '2px solid rgba(0,212,255,0.3)',
              }}>
                <div style={{
                  fontSize: 22, fontWeight: 900, color: '#00D4FF',
                  lineHeight: 1, display: 'flex', alignItems: 'center',
                }}>
                  <ChevronUp size={14} style={{ marginRight: -2, opacity: 0.7 }} />
                  {userRank}
                </div>
              </div>
              <div style={{
                fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
                letterSpacing: 1.5, marginTop: 4, fontWeight: 700,
              }}>
                Your Rank
              </div>
            </div>

            {/* Progress section */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontWeight: 700, fontSize: 15, marginBottom: 8,
                color: '#fff',
              }}>
                {userEntry.username}
              </div>
              <div style={{
                width: '100%', height: 8, borderRadius: 4,
                background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
                position: 'relative',
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ delay: 0.8, duration: 1, ease: 'easeOut' }}
                  style={{
                    height: '100%', borderRadius: 4,
                    background: 'linear-gradient(90deg, #00D4FF, #BF5AF2)',
                    boxShadow: '0 0 10px rgba(0,212,255,0.3)',
                  }}
                />
              </div>
              <div style={{
                fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 5, fontWeight: 500,
              }}>
                {pointsToNext > 0
                  ? `${formatPoints(pointsToNext)} pts to rank #${userRank - 1}`
                  : 'You are #1! Defend your crown!'}
              </div>
            </div>

            {/* Points display */}
            <div style={{
              textAlign: 'right', flexShrink: 0,
            }}>
              <div style={{
                fontWeight: 900, fontSize: 22, color: '#00D4FF',
                display: 'flex', alignItems: 'center', gap: 4,
                textShadow: '0 0 15px rgba(0,212,255,0.3)',
              }}>
                <TrendingUp size={18} style={{ opacity: 0.7 }} />
                {formatPoints(userEntry.points)}
              </div>
              <div style={{
                fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
                letterSpacing: 1, fontWeight: 600, marginTop: 2,
              }}>
                Points
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
