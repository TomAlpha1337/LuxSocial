import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, Flame, Shield, Trophy, Users, TrendingUp,
  Zap, Rocket, Moon, Sunrise, X, Star, Sparkles,
} from 'lucide-react';
import { BADGE_DEFINITIONS, BADGE_RARITY } from '../utils/constants';

// ── Color tokens ────────────────────────────────────────────
const GOLD = '#00D4FF';

// ── Icon map (badge id -> lucide icon component) ────────────
const ICON_MAP = {
  Vote: Award,
  Flame: Flame,
  Shield: Shield,
  Trophy: Trophy,
  Users: Users,
  TrendingUp: TrendingUp,
  Zap: Zap,
  Rocket: Rocket,
  Moon: Moon,
  Sunrise: Sunrise,
};

function getBadgeIcon(iconName, size = 24, color = GOLD) {
  const Icon = ICON_MAP[iconName] || Star;
  return <Icon size={size} color={color} strokeWidth={2.2} />;
}

// ── Inject keyframes ────────────────────────────────────────
const KEYFRAMES_ID = 'achievement-toast-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(KEYFRAMES_ID)) {
  const style = document.createElement('style');
  style.id = KEYFRAMES_ID;
  style.textContent = `
    @keyframes at-glow-pulse {
      0%, 100% { box-shadow: 0 0 20px rgba(0,212,255,0.15), 0 8px 24px rgba(0,0,0,0.3); }
      50% { box-shadow: 0 0 40px rgba(0,212,255,0.3), 0 8px 32px rgba(0,0,0,0.4); }
    }
    @keyframes at-shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes at-badge-spin {
      0% { transform: rotateY(0deg) scale(1); }
      25% { transform: rotateY(90deg) scale(1.05); }
      50% { transform: rotateY(180deg) scale(1); }
      75% { transform: rotateY(270deg) scale(1.05); }
      100% { transform: rotateY(360deg) scale(1); }
    }
    @keyframes at-particle-burst {
      0% { transform: scale(0); opacity: 1; }
      100% { transform: scale(2); opacity: 0; }
    }
    @keyframes at-icon-bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }
  `;
  document.head.appendChild(style);
}

// ── Toast Context (so any component can trigger a toast) ────
const AchievementToastContext = createContext(null);

export function useAchievementToast() {
  const ctx = useContext(AchievementToastContext);
  if (!ctx) throw new Error('useAchievementToast must be inside AchievementToastProvider');
  return ctx;
}

// ── Individual Toast Component ──────────────────────────────
function Toast({ badge, onDismiss, index }) {
  const badgeDef = BADGE_DEFINITIONS[badge.badge_id] || badge;
  const rarity = BADGE_RARITY[badgeDef.rarity || 'common'];
  const badgeColor = badgeDef.color || GOLD;

  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 320, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 320, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      style={{
        width: 340,
        maxWidth: 'calc(100vw - 32px)',
        padding: '14px 16px',
        borderRadius: 18,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        background: 'linear-gradient(135deg, rgba(20, 20, 35, 0.97) 0%, rgba(15, 15, 28, 0.98) 100%)',
        border: `1px solid ${badgeColor}35`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${badgeColor}15`,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        marginBottom: 8,
      }}
      onClick={onDismiss}
    >
      {/* Background shimmer */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(90deg, transparent 0%, ${badgeColor}08 50%, transparent 100%)`,
        backgroundSize: '200% 100%',
        animation: 'at-shimmer 3s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* Glow particle */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: 40,
        width: 60,
        height: 60,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${badgeColor}15, transparent)`,
        transform: 'translate(-50%, -50%)',
        animation: 'at-particle-burst 2s ease-out infinite',
        pointerEvents: 'none',
      }} />

      {/* Badge Icon */}
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 14,
        background: `linear-gradient(135deg, ${badgeColor}20, ${badgeColor}08)`,
        border: `1px solid ${badgeColor}40`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
        zIndex: 1,
        animation: 'at-icon-bounce 2s ease-in-out infinite',
      }}>
        {getBadgeIcon(badgeDef.icon, 22, badgeColor)}
      </div>

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
        {/* Achievement unlocked label */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          marginBottom: 3,
        }}>
          <Sparkles size={11} color={GOLD} />
          <span style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: GOLD,
          }}>
            Achievement Unlocked
          </span>
        </div>

        {/* Badge name */}
        <div style={{
          fontSize: 15,
          fontWeight: 800,
          color: '#fff',
          marginBottom: 2,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {badgeDef.name}
        </div>

        {/* Description + rarity */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{
            fontSize: 11,
            color: '#94a3b8',
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {badgeDef.description}
          </span>
          <span style={{
            fontSize: 9,
            fontWeight: 800,
            padding: '2px 6px',
            borderRadius: 6,
            background: `${rarity.border}18`,
            color: rarity.border,
            border: `1px solid ${rarity.border}30`,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            flexShrink: 0,
          }}>
            {rarity.label}
          </span>
        </div>
      </div>

      {/* Close X */}
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(); }}
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          color: '#64748b',
          transition: 'all 0.2s',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <X size={12} />
      </button>
    </motion.div>
  );
}

// ── Provider Component (renders toast stack + provides showToast) ──
export function AchievementToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showAchievementToast = useCallback((badge) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...badge, _toastId: id }]);
  }, []);

  const dismissToast = useCallback((toastId) => {
    setToasts((prev) => prev.filter((t) => t._toastId !== toastId));
  }, []);

  return (
    <AchievementToastContext.Provider value={{ showAchievementToast }}>
      {children}

      {/* Toast stack (fixed, top-right) */}
      <div style={{
        position: 'fixed',
        top: 64,
        right: 16,
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: 'none',
      }}>
        <AnimatePresence mode="popLayout">
          {toasts.map((toast, i) => (
            <div key={toast._toastId} style={{ pointerEvents: 'auto' }}>
              <Toast
                badge={toast}
                index={i}
                onDismiss={() => dismissToast(toast._toastId)}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </AchievementToastContext.Provider>
  );
}
