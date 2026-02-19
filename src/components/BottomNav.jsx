import React, { useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Gamepad2, Swords, Trophy, Users } from 'lucide-react';

/* ── Tab definitions ─────────────────────────────────────── */
const TABS = [
  { label: 'Home',    icon: Home,     path: '/feed' },
  { label: 'Games',   icon: Gamepad2, path: '/play' },
  { label: 'Play',    icon: Swords,   path: '/direct',      isCenter: true },
  { label: 'Ranks',   icon: Trophy,   path: '/leaderboard' },
  { label: 'Friends', icon: Users,    path: '/friends' },
];

/* ── Color tokens ────────────────────────────────────────── */
const GOLD        = '#00D4FF';
const GOLD_LIGHT  = '#33E0FF';
const GOLD_DIM    = '#0099BB';
const PURPLE      = '#BF5AF2';
const CYAN        = '#00D4FF';
const PINK        = '#FF2D78';
const MUTED       = 'rgba(255,255,255,0.3)';
const TEXT_SEC    = 'rgba(255,255,255,0.6)';

/* ── Inline styles ───────────────────────────────────────── */
const styles = {
  /* Outer wrapper — adds horizontal padding so the nav "floats" */
  wrapper: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    padding: '0 10px 8px',
    pointerEvents: 'none',        /* let taps pass through the padding area */
  },

  /* The actual nav bar */
  nav: {
    pointerEvents: 'auto',
    maxWidth: 480,
    margin: '0 auto',
    height: 68,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    background: 'rgba(10, 10, 18, 0.72)',
    backdropFilter: 'blur(28px) saturate(1.6)',
    WebkitBackdropFilter: 'blur(28px) saturate(1.6)',
    borderRadius: 22,
    border: '1px solid rgba(255, 255, 255, 0.07)',
    boxShadow:
      '0 -4px 30px rgba(0,0,0,0.35), ' +
      `0 0 40px rgba(0, 212, 255, 0.03), ` +
      'inset 0 1px 0 rgba(255,255,255,0.04)',
    padding: '0 4px',
    position: 'relative',
    overflow: 'visible',
  },

  /* Gradient glow line at the top of the nav */
  navGlow: {
    position: 'absolute',
    top: -1,
    left: '10%',
    right: '10%',
    height: 1,
    background: `linear-gradient(90deg, transparent, ${GOLD}22, ${PURPLE}33, ${CYAN}22, transparent)`,
    borderRadius: 1,
    pointerEvents: 'none',
  },

  /* Each tab button */
  tab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    position: 'relative',
    padding: 0,
    WebkitTapHighlightColor: 'transparent',
    outline: 'none',
    transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  /* Label text under icon */
  label: {
    fontSize: 10,
    fontWeight: 600,
    marginTop: 3,
    letterSpacing: '0.03em',
    transition: 'color 0.25s ease, opacity 0.25s ease',
    lineHeight: 1,
  },

  /* Active indicator dot/line */
  activeIndicator: {
    position: 'absolute',
    bottom: 6,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 16,
    height: 3,
    borderRadius: 2,
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  /* ── Center "Play" button ──────────────────────────────── */
  centerWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    position: 'relative',
    padding: 0,
    WebkitTapHighlightColor: 'transparent',
    outline: 'none',
  },

  /* The elevated center circle */
  centerButton: {
    width: 54,
    height: 54,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: -24,
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    zIndex: 2,
  },

  /* Outer glow ring for center button */
  centerGlowRing: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 66,
    height: 66,
    borderRadius: '50%',
    border: `2px solid rgba(255, 45, 120, 0.12)`,
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    animation: 'glowPulseRing 2.5s ease-in-out infinite',
  },

  /* Ambient glow behind center button */
  centerAmbient: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 80,
    height: 80,
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    zIndex: 0,
  },

  /* Center button label */
  centerLabel: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginTop: 4,
    lineHeight: 1,
    transition: 'color 0.25s ease',
  },
};

/* ── Component ───────────────────────────────────────────── */
export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [pressedTab, setPressedTab] = useState(null);

  const isActive = useCallback(
    (path) => location.pathname === path,
    [location.pathname]
  );

  const handlePress = useCallback((path) => {
    setPressedTab(path);
    // Quick haptic-like reset
    setTimeout(() => setPressedTab(null), 180);
  }, []);

  return (
    <div style={styles.wrapper}>
      <nav style={styles.nav}>
        {/* Top glow line */}
        <div style={styles.navGlow} />

        {TABS.map((tab) => {
          const active = isActive(tab.path);
          const pressed = pressedTab === tab.path;
          const Icon = tab.icon;

          /* ── Center "Play" button ──────────────────────── */
          if (tab.isCenter) {
            const centerBg = active
              ? `linear-gradient(135deg, ${PINK}, #FF2D78, #FF5C9A)`
              : `linear-gradient(135deg, rgba(255,45,120,0.15), rgba(255,45,120,0.25))`;
            const centerShadow = active
              ? `0 4px 20px rgba(255,45,120,0.4), 0 0 40px rgba(255,45,120,0.15), inset 0 1px 0 rgba(255,255,255,0.25)`
              : `0 2px 12px rgba(255,45,120,0.2), 0 0 20px rgba(255,45,120,0.08)`;
            const centerBorder = active
              ? `2px solid rgba(255,45,120,0.5)`
              : `1px solid rgba(255,45,120,0.2)`;
            const iconColor = active ? '#fff' : PINK;

            return (
              <button
                key={tab.path}
                style={styles.centerWrapper}
                onClick={() => { handlePress(tab.path); navigate(tab.path); }}
                aria-label={tab.label}
                aria-current={active ? 'page' : undefined}
              >
                {/* Ambient glow */}
                <div
                  style={{
                    ...styles.centerAmbient,
                    background: `radial-gradient(circle, rgba(255,45,120,${active ? 0.2 : 0.08}) 0%, transparent 65%)`,
                  }}
                />

                {/* Pulsing ring */}
                <div
                  style={{
                    ...styles.centerGlowRing,
                    opacity: active ? 1 : 0.5,
                    borderColor: active ? 'rgba(255,45,120,0.25)' : 'rgba(255,45,120,0.08)',
                  }}
                />

                {/* The button circle */}
                <div
                  style={{
                    ...styles.centerButton,
                    background: centerBg,
                    boxShadow: centerShadow,
                    border: centerBorder,
                    transform: pressed
                      ? 'scale(0.9)'
                      : active
                        ? 'scale(1)'
                        : 'scale(1)',
                    animation: active ? 'none' : 'float 3s ease-in-out infinite',
                  }}
                >
                  <Icon
                    size={24}
                    color={iconColor}
                    strokeWidth={active ? 2.6 : 2}
                    style={{ transition: 'all 0.25s ease', filter: active ? 'none' : `drop-shadow(0 0 4px rgba(0,212,255,0.3))` }}
                  />
                </div>

                <span
                  style={{
                    ...styles.centerLabel,
                    color: active ? GOLD : TEXT_SEC,
                  }}
                >
                  {tab.label}
                </span>
              </button>
            );
          }

          /* ── Regular tabs ──────────────────────────────── */
          const color = active ? GOLD : MUTED;

          return (
            <button
              key={tab.path}
              style={{
                ...styles.tab,
                transform: pressed ? 'scale(0.88)' : 'scale(1)',
              }}
              onClick={() => { handlePress(tab.path); navigate(tab.path); }}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                size={21}
                color={color}
                strokeWidth={active ? 2.4 : 1.7}
                style={{
                  transition: 'all 0.25s ease',
                  filter: active ? `drop-shadow(0 0 6px rgba(0,212,255,0.35))` : 'none',
                }}
              />

              <span
                style={{
                  ...styles.label,
                  color: active ? GOLD : TEXT_SEC,
                  opacity: active ? 1 : 0.7,
                }}
              >
                {tab.label}
              </span>

              {/* Active indicator line */}
              {active && (
                <div
                  style={{
                    ...styles.activeIndicator,
                    background: `linear-gradient(90deg, ${GOLD_DIM}, ${GOLD}, ${GOLD_DIM})`,
                    boxShadow: `0 0 8px rgba(0,212,255,0.35)`,
                    animation: 'scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards',
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
