import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Flame, Zap, Crown, Gem, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ENERGY_MAX } from '../utils/constants';
import BottomNav from './BottomNav';
import DailyBonusModal from './DailyBonusModal';
import OnboardingModal from './OnboardingModal';
import Mascot from './Mascot';

/* ── Color tokens ────────────────────────────────────────── */
const GOLD = '#00D4FF';
const GOLD_LIGHT = '#33E0FF';
const GOLD_DIM = '#0099BB';
const PURPLE = '#BF5AF2';
const CYAN = '#00D4FF';
const PINK = '#FF2D78';

/* ── Inline style objects ────────────────────────────────── */
const styles = {
  /* Root wrapper */
  container: {
    minHeight: '100vh',
    minHeight: '100dvh',
    backgroundColor: '#050510',
    color: '#F0F0F8',
    position: 'relative',
  },

  /* ── Header (compact & game-like) ────────────────────── */
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: 52,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 12px',
    background: 'rgba(5, 5, 16, 0.85)',
    backdropFilter: 'blur(32px) saturate(1.6)',
    WebkitBackdropFilter: 'blur(32px) saturate(1.6)',
    borderBottom: '1px solid rgba(0, 212, 255, 0.08)',
    zIndex: 1000,
    overflow: 'hidden',
  },

  /* Animated gradient line at the very bottom of the header */
  headerGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    background: `linear-gradient(90deg, transparent 0%, ${GOLD}33 20%, ${PURPLE}44 50%, ${CYAN}33 80%, transparent 100%)`,
    backgroundSize: '200% 100%',
    animation: 'shimmer 4s ease-in-out infinite',
    pointerEvents: 'none',
  },

  /* Ambient glow behind header */
  headerAmbient: {
    position: 'absolute',
    top: 0,
    left: '20%',
    width: '60%',
    height: '100%',
    background: `radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.04) 0%, transparent 70%)`,
    pointerEvents: 'none',
  },

  /* ── Left cluster: logo + level ──────────────────────── */
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    position: 'relative',
    zIndex: 1,
  },

  logo: {
    fontSize: 15,
    fontWeight: 900,
    letterSpacing: -0.4,
    background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 45%, ${GOLD} 100%)`,
    backgroundSize: '200% 200%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    cursor: 'default',
    userSelect: 'none',
    animation: 'gradientShift 3s ease infinite',
    textShadow: 'none',
    lineHeight: 1,
    whiteSpace: 'nowrap',
  },

  levelBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minWidth: 32,
    height: 22,
    padding: '0 8px',
    borderRadius: 9999,
    fontSize: '0.68rem',
    fontWeight: 800,
    letterSpacing: '0.04em',
    color: '#fff',
    background: `linear-gradient(135deg, ${GOLD}, ${PINK})`,
    boxShadow: `0 2px 10px rgba(0,212,255,0.25), inset 0 1px 0 rgba(255,255,255,0.25)`,
    textShadow: '0 1px 0 rgba(0,0,0,0.15)',
    position: 'relative',
  },

  levelBadgeGlow: {
    position: 'absolute',
    inset: -3,
    borderRadius: 'inherit',
    background: `linear-gradient(135deg, ${GOLD}, ${PINK})`,
    opacity: 0.2,
    filter: 'blur(5px)',
    pointerEvents: 'none',
  },

  /* XP pill with gem icon */
  xpPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    padding: '3px 8px 3px 5px',
    borderRadius: 9999,
    background: 'rgba(0, 212, 255, 0.08)',
    border: `1px solid rgba(0, 212, 255, 0.15)`,
    cursor: 'default',
    transition: 'all 0.25s ease',
  },

  xpPillText: {
    fontSize: '0.68rem',
    fontWeight: 800,
    color: CYAN,
    letterSpacing: '0.02em',
    lineHeight: 1,
  },

  /* Energy pill */
  energyPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    padding: '3px 8px 3px 5px',
    borderRadius: 9999,
    background: 'rgba(57, 255, 20, 0.08)',
    border: '1px solid rgba(57, 255, 20, 0.15)',
    cursor: 'default',
    transition: 'all 0.25s ease',
  },

  energyPillText: {
    fontSize: '0.68rem',
    fontWeight: 800,
    color: '#39FF14',
    letterSpacing: '0.02em',
    lineHeight: 1,
  },

  /* ── Right cluster: xp + streak + bell ─────────────── */
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    position: 'relative',
    zIndex: 1,
  },

  /* Streak pill */
  streakPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    padding: '3px 8px 3px 5px',
    borderRadius: 9999,
    background: 'rgba(255, 107, 53, 0.1)',
    border: '1px solid rgba(255, 107, 53, 0.15)',
    cursor: 'default',
    transition: 'all 0.25s ease',
  },

  streakCount: {
    fontSize: '0.68rem',
    fontWeight: 800,
    color: '#FF6B35',
    letterSpacing: '0.02em',
    lineHeight: 1,
  },

  /* Bell button */
  bellButton: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(255, 255, 255, 0.04)',
    cursor: 'pointer',
    transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
    WebkitTapHighlightColor: 'transparent',
    outline: 'none',
  },

  /* Notification badge (count) */
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    padding: '0 5px',
    borderRadius: 9999,
    backgroundColor: '#EF4444',
    color: '#fff',
    fontSize: '0.62rem',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid rgba(7, 7, 13, 0.95)',
    boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)',
    animation: 'bounceIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
    lineHeight: 1,
  },

  /* The ping ring behind the notif badge */
  notifPing: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9999,
    backgroundColor: '#EF4444',
    opacity: 0,
    animation: 'notifPing 2s cubic-bezier(0, 0, 0.2, 1) infinite',
    pointerEvents: 'none',
  },

  /* ── XP Bar (sits directly below header) ─────────────── */
  xpBarOuter: {
    position: 'fixed',
    top: 52,
    left: 0,
    right: 0,
    height: 3,
    background: 'rgba(255,255,255,0.03)',
    zIndex: 999,
    overflow: 'hidden',
  },

  xpBarFill: {
    height: '100%',
    borderRadius: '0 2px 2px 0',
    background: `linear-gradient(90deg, ${GOLD_DIM}, ${GOLD}, ${GOLD_LIGHT}, ${GOLD})`,
    backgroundSize: '300% 100%',
    animation: 'shimmer 2.2s ease-in-out infinite',
    transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)',
    position: 'relative',
  },

  xpBarTip: {
    position: 'absolute',
    right: 0,
    top: -2,
    bottom: -2,
    width: 14,
    borderRadius: '50%',
    filter: 'blur(4px)',
    opacity: 0.85,
    pointerEvents: 'none',
  },

  /* ── Main content area ───────────────────────────────── */
  main: {
    paddingTop: 55, /* header 52 + xp bar 3 */
    paddingBottom: 88, /* bottom nav 80 + 8px breathing room */
    minHeight: '100vh',
    minHeight: '100dvh',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
  },

  /* Page wrapper for transitions */
  pageWrapper: {
    animation: 'fadeIn 0.32s cubic-bezier(0.4,0,0.2,1) forwards',
  },
};

/* ── Component ───────────────────────────────────────────── */
export default function Layout({
  children,
  showNotificationBadge = false,
  notificationCount = 0,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, energy } = useAuth();
  const [bellHover, setBellHover] = useState(false);
  const [bellActive, setBellActive] = useState(false);
  const [adminHover, setAdminHover] = useState(false);
  const [profileHover, setProfileHover] = useState(false);
  const isAdmin = user?.role === 'admin';
  const pageRef = useRef(null);

  // Derive game data from user, with safe fallbacks
  const level = user?.level ?? user?.stats?.level ?? 1;
  const xp = user?.xp ?? user?.stats?.xp ?? 0;
  const xpToNext = user?.xpToNext ?? user?.stats?.xpToNext ?? 100;
  const streak = user?.streak ?? user?.stats?.streak ?? 0;
  const xpPercent = xpToNext > 0 ? Math.min((xp / xpToNext) * 100, 100) : 0;

  // XP pulse effect when XP changes
  const [xpPulse, setXpPulse] = useState(false);
  const prevXpRef = useRef(xp);
  useEffect(() => {
    if (xp > prevXpRef.current) {
      setXpPulse(true);
      const t = setTimeout(() => setXpPulse(false), 1200);
      return () => clearTimeout(t);
    }
    prevXpRef.current = xp;
  }, [xp]);

  // Re-trigger page transition on route change
  const [pageKey, setPageKey] = useState(location.pathname);
  useEffect(() => {
    setPageKey(location.pathname);
  }, [location.pathname]);

  return (
    <div style={styles.container}>
      {/* ─── Header ────────────────────────────────────────── */}
      <header style={styles.header}>
        {/* Ambient glow */}
        <div style={styles.headerAmbient} />
        {/* Gradient line at bottom */}
        <div style={styles.headerGlow} />

        {/* Left: Logo + Level badge */}
        <div style={styles.headerLeft}>
          <Mascot
            size={28}
            animate={false}
            mood={energy > 50 ? 'happy' : energy > 20 ? 'thinking' : 'sad'}
          />
          <span style={styles.logo}>Social Dilemma's</span>

          <div
            style={styles.levelBadge}
            title={`Level ${level} — ${xp}/${xpToNext} XP`}
          >
            <div style={styles.levelBadgeGlow} />
            <Crown size={10} strokeWidth={2.8} />
            <span>{level}</span>
          </div>
        </div>

        {/* Center: Profile button */}
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 30,
            height: 30,
            borderRadius: '50%',
            border: profileHover
              ? `1px solid rgba(0, 212, 255, 0.3)`
              : `1px solid rgba(255,255,255,0.1)`,
            background: profileHover
              ? 'rgba(0, 212, 255, 0.1)'
              : 'rgba(255, 255, 255, 0.06)',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            WebkitTapHighlightColor: 'transparent',
            outline: 'none',
            overflow: 'hidden',
            padding: 0,
            position: 'relative',
            zIndex: 1,
          }}
          onClick={() => navigate('/profile')}
          onMouseEnter={() => setProfileHover(true)}
          onMouseLeave={() => setProfileHover(false)}
          aria-label="My Profile"
        >
          {user?.image ? (
            <img
              src={user.image}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%',
              }}
            />
          ) : (
            <User
              size={16}
              color={profileHover ? CYAN : '#9898B0'}
              strokeWidth={1.8}
              style={{ transition: 'color 0.2s ease' }}
            />
          )}
        </button>

        {/* Right: XP + Streak + Bell */}
        <div style={styles.headerRight}>
          {/* XP display with gem */}
          <div
            style={{
              ...styles.xpPill,
              boxShadow: xpPulse ? `0 0 12px ${CYAN}50, 0 0 4px ${CYAN}30` : 'none',
              borderColor: xpPulse ? `${CYAN}40` : `rgba(0, 212, 255, 0.15)`,
              transform: xpPulse ? 'scale(1.08)' : 'scale(1)',
              transition: 'all 0.3s ease',
            }}
            title={`${xp}/${xpToNext} XP to next level`}
          >
            <Gem size={11} color={CYAN} strokeWidth={2.4} />
            <span style={styles.xpPillText}>{xp}</span>
          </div>

          {/* Energy display */}
          <div
            style={{
              ...styles.energyPill,
              ...(energy < 20 ? {
                animation: 'energyLowPulse 1.5s ease-in-out infinite',
                borderColor: 'rgba(255, 107, 53, 0.3)',
                background: 'rgba(255, 107, 53, 0.08)',
              } : {}),
            }}
            title={`${energy}/${ENERGY_MAX} Energy`}
          >
            <Zap size={11} color={energy < 20 ? '#FF6B35' : '#39FF14'} strokeWidth={2.4} />
            <span style={{
              ...styles.energyPillText,
              color: energy < 20 ? '#FF6B35' : '#39FF14',
            }}>{energy}</span>
          </div>

          {/* Streak counter */}
          {streak > 0 && (
            <div
              style={styles.streakPill}
              title={`${streak} day streak`}
            >
              <Flame
                size={13}
                color="#FF6B35"
                strokeWidth={2.4}
                className="streak-flame"
              />
              <span style={styles.streakCount}>{streak}</span>
            </div>
          )}

          {/* Admin button (admins only) */}
          {isAdmin && (
            <button
              style={{
                ...styles.bellButton,
                background: adminHover
                  ? 'rgba(191,90,242,0.15)'
                  : 'rgba(255,255,255,0.04)',
                borderColor: adminHover
                  ? 'rgba(191,90,242,0.3)'
                  : 'rgba(255,255,255,0.06)',
              }}
              onClick={() => navigate('/admin')}
              onMouseEnter={() => setAdminHover(true)}
              onMouseLeave={() => setAdminHover(false)}
              aria-label="Admin Panel"
            >
              <Shield
                size={16}
                color={adminHover ? PURPLE : '#9898B0'}
                strokeWidth={1.8}
                style={{ transition: 'color 0.2s ease' }}
              />
            </button>
          )}

          {/* Notification bell */}
          <button
            style={{
              ...styles.bellButton,
              background: bellHover
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(255,255,255,0.04)',
              borderColor: bellHover
                ? 'rgba(255,255,255,0.12)'
                : 'rgba(255,255,255,0.06)',
              transform: bellActive ? 'scale(0.92)' : 'scale(1)',
            }}
            onClick={() => navigate('/notifications')}
            onMouseEnter={() => setBellHover(true)}
            onMouseLeave={() => { setBellHover(false); setBellActive(false); }}
            onMouseDown={() => setBellActive(true)}
            onMouseUp={() => setBellActive(false)}
            aria-label="Notifications"
          >
            <Bell
              size={17}
              color={bellHover ? '#F0F0F8' : '#9898B0'}
              strokeWidth={1.8}
              style={{ transition: 'color 0.2s ease' }}
            />

            {/* Badge with count */}
            {(showNotificationBadge || notificationCount > 0) && (
              <>
                <div style={styles.notifPing} />
                <div style={styles.notifBadge}>
                  {notificationCount > 0 ? (notificationCount > 9 ? '9+' : notificationCount) : ''}
                </div>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ─── XP Progress Bar ───────────────────────────────── */}
      <div style={{
        ...styles.xpBarOuter,
        boxShadow: xpPulse ? `0 0 12px ${GOLD}40, 0 0 24px ${GOLD}20` : 'none',
        transition: 'box-shadow 0.3s ease',
      }}>
        <div
          style={{
            ...styles.xpBarFill,
            width: `${xpPercent}%`,
            height: xpPulse ? 5 : 3,
            transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1), height 0.3s ease',
          }}
        >
          <div
            style={{
              ...styles.xpBarTip,
              background: GOLD_LIGHT,
            }}
          />
        </div>
      </div>

      {/* ─── Scrollable Content ────────────────────────────── */}
      <main style={styles.main}>
        <div key={pageKey} style={styles.pageWrapper}>
          {children}
        </div>
      </main>

      {/* ─── Bottom Navigation ─────────────────────────────── */}
      <BottomNav />

      {/* ─── Daily Login Bonus Modal ────────────────────────── */}
      <DailyBonusModal />

      {/* ─── First-time Onboarding ─────────────────────────── */}
      <OnboardingModal />
    </div>
  );
}
