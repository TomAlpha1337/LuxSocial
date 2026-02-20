import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, SkipForward, ChevronRight, Award, Sparkles, Zap,
  ArrowRight, Target, Clock, Trophy, Star, RefreshCw, Share2, Crown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  dilemmas as dilemmasApi, votes as votesApi, activities as activitiesApi,
  auth as authApi, featuredTracking, events as eventsApi, recordXp,
} from '../services/api';
import { CATEGORIES, POINTS, ENERGY_MAX, ENERGY_PER_PLAY, FEATURED_XP_MULTIPLIER } from '../utils/constants';
import { timeUntilNextEnergy } from '../utils/energy';
import { useAchievements } from '../hooks/useAchievements';
import { shareContent } from '../utils/share';

// ============================================================
// Inject Global Keyframe Animations
// ============================================================
const KEYFRAMES_ID = 'play-screen-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(KEYFRAMES_ID)) {
  const style = document.createElement('style');
  style.id = KEYFRAMES_ID;
  style.textContent = `
    @keyframes ps-pulse-cyan {
      0%, 100% { box-shadow: 0 0 20px rgba(0,212,255,0.15), inset 0 0 20px rgba(0,212,255,0.05); }
      50% { box-shadow: 0 0 40px rgba(0,212,255,0.3), inset 0 0 30px rgba(0,212,255,0.1); }
    }
    @keyframes ps-pulse-pink {
      0%, 100% { box-shadow: 0 0 20px rgba(255,45,120,0.15), inset 0 0 20px rgba(255,45,120,0.05); }
      50% { box-shadow: 0 0 40px rgba(255,45,120,0.3), inset 0 0 30px rgba(255,45,120,0.1); }
    }
    @keyframes ps-vs-glow {
      0%, 100% { box-shadow: 0 0 15px rgba(0,212,255,0.3), 0 0 30px rgba(0,212,255,0.1); transform: translate(-50%, -50%) scale(1); }
      50% { box-shadow: 0 0 25px rgba(0,212,255,0.5), 0 0 50px rgba(0,212,255,0.2); transform: translate(-50%, -50%) scale(1.1); }
    }
    @keyframes ps-shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes ps-float-up {
      0% { transform: translateY(0) scale(1); opacity: 1; }
      100% { transform: translateY(-80px) scale(1.2); opacity: 0; }
    }
    @keyframes ps-sparkle-burst {
      0% { transform: scale(0) rotate(0deg); opacity: 1; }
      50% { transform: scale(1.2) rotate(180deg); opacity: 0.8; }
      100% { transform: scale(0) rotate(360deg); opacity: 0; }
    }
    @keyframes ps-confetti-fall {
      0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
      100% { transform: translateY(60px) rotate(360deg); opacity: 0; }
    }
    @keyframes ps-glow-ring {
      0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
      50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.2; }
      100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
    }
    @keyframes ps-bg-drift {
      0%, 100% { transform: translate(0, 0); }
      25% { transform: translate(30px, -20px); }
      50% { transform: translate(-20px, 30px); }
      75% { transform: translate(20px, 20px); }
    }
    @keyframes ps-progress-glow {
      0%, 100% { box-shadow: 0 0 4px rgba(0,212,255,0.3); }
      50% { box-shadow: 0 0 12px rgba(0,212,255,0.6); }
    }
    @keyframes ps-skeleton-wave {
      0% { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    @keyframes ps-card-idle-glow {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.7; }
    }
    @keyframes ps-bounce-in {
      0% { transform: scale(0); }
      50% { transform: scale(1.15); }
      70% { transform: scale(0.95); }
      100% { transform: scale(1); }
    }
    @keyframes ps-text-reveal {
      0% { clip-path: inset(0 100% 0 0); }
      100% { clip-path: inset(0 0% 0 0); }
    }
    @keyframes ps-streak-fire {
      0%, 100% { text-shadow: 0 0 8px rgba(0,212,255,0.4); }
      50% { text-shadow: 0 0 16px rgba(0,212,255,0.8), 0 0 30px rgba(255,107,53,0.3); }
    }
    @keyframes ps-dot-bounce {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
      40% { transform: scale(1); opacity: 1; }
    }
    @keyframes ps-winner-shine {
      0% { left: -100%; }
      100% { left: 200%; }
    }
    @keyframes ps-timer-countdown {
      0% { width: 100%; }
      100% { width: 0%; }
    }
    @keyframes ps-timer-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    @keyframes ps-screen-shake {
      0%, 100% { transform: translateX(0) translateY(0); }
      10% { transform: translateX(-6px) translateY(3px); }
      20% { transform: translateX(6px) translateY(-3px); }
      30% { transform: translateX(-5px) translateY(-2px); }
      40% { transform: translateX(5px) translateY(2px); }
      50% { transform: translateX(-3px) translateY(3px); }
      60% { transform: translateX(3px) translateY(-2px); }
      70% { transform: translateX(-2px) translateY(1px); }
      80% { transform: translateX(2px) translateY(-1px); }
      90% { transform: translateX(-1px) translateY(0); }
    }
    @keyframes ps-swipe-hint {
      0%, 100% { transform: translateX(0); opacity: 0.6; }
      50% { transform: translateX(4px); opacity: 1; }
    }
    @keyframes ps-combo-pop {
      0% { transform: scale(0) rotate(-12deg); opacity: 0; }
      50% { transform: scale(1.3) rotate(3deg); opacity: 1; }
      70% { transform: scale(0.9) rotate(-1deg); }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    @keyframes ps-combo-glow {
      0%, 100% { text-shadow: 0 0 8px rgba(0,212,255,0.4), 0 0 16px rgba(0,212,255,0.2); }
      50% { text-shadow: 0 0 20px rgba(0,212,255,0.8), 0 0 40px rgba(0,212,255,0.4), 0 0 60px rgba(255,107,53,0.2); }
    }
    @keyframes ps-fire-border {
      0%, 100% { box-shadow: 0 0 15px rgba(255,107,53,0.3), 0 0 30px rgba(255,69,0,0.15), inset 0 0 15px rgba(255,107,53,0.05); border-color: rgba(255,107,53,0.5); }
      50% { box-shadow: 0 0 25px rgba(255,107,53,0.5), 0 0 50px rgba(255,69,0,0.25), inset 0 0 25px rgba(255,107,53,0.1); border-color: rgba(255,107,53,0.7); }
    }
    @keyframes ps-digit-slot {
      0% { transform: translateY(100%); opacity: 0; }
      60% { transform: translateY(-8%); opacity: 1; }
      80% { transform: translateY(3%); }
      100% { transform: translateY(0); opacity: 1; }
    }
    @keyframes ps-share-slide {
      0% { transform: translateY(10px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    @keyframes ps-big-celebration {
      0% { transform: scale(0); opacity: 0; }
      40% { transform: scale(1.3); opacity: 1; }
      70% { transform: scale(0.9); }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes ps-insight-glow {
      0%, 100% { box-shadow: 0 0 0 rgba(0,212,255,0); }
      50% { box-shadow: 0 0 20px rgba(0,212,255,0.1), 0 0 40px rgba(0,212,255,0.05); }
    }
  `;
  document.head.appendChild(style);
}

// ============================================================
// Category Colors (matching the existing color map)
// ============================================================
const CATEGORY_COLORS = {
  lifestyle: '#00D4FF',
  food: '#FF6B35',
  travel: '#00D4FF',
  relationships: '#FF2D78',
  money: '#39FF14',
  hypothetical: '#BF5AF2',
  fun: '#FF6B35',
  deep: '#BF5AF2',
  sport: '#39FF14',
  tech: '#00D4FF',
  other: '#64748b',
};

// ============================================================
// Category Emoji Mapping
// ============================================================
// ============================================================
// Category Card Tints (RGBA overlays for card background)
// ============================================================
const CATEGORY_TINTS = {
  food: { from: 'rgba(255,107,53,0.06)', to: 'rgba(255,107,53,0.02)', accent: '#FF6B35' },
  tech: { from: 'rgba(0,212,255,0.06)', to: 'rgba(0,212,255,0.02)', accent: '#00D4FF' },
  relationships: { from: 'rgba(255,45,120,0.06)', to: 'rgba(255,45,120,0.02)', accent: '#FF2D78' },
  lifestyle: { from: 'rgba(0,212,255,0.06)', to: 'rgba(0,212,255,0.02)', accent: '#00D4FF' },
  travel: { from: 'rgba(0,212,255,0.06)', to: 'rgba(0,212,255,0.02)', accent: '#00D4FF' },
  money: { from: 'rgba(57,255,20,0.06)', to: 'rgba(57,255,20,0.02)', accent: '#39FF14' },
  hypothetical: { from: 'rgba(191,90,242,0.06)', to: 'rgba(191,90,242,0.02)', accent: '#BF5AF2' },
  fun: { from: 'rgba(255,107,53,0.06)', to: 'rgba(255,107,53,0.02)', accent: '#FF6B35' },
  deep: { from: 'rgba(191,90,242,0.06)', to: 'rgba(191,90,242,0.02)', accent: '#BF5AF2' },
  sport: { from: 'rgba(57,255,20,0.06)', to: 'rgba(57,255,20,0.02)', accent: '#39FF14' },
  other: { from: 'rgba(100,116,139,0.06)', to: 'rgba(100,116,139,0.02)', accent: '#64748b' },
};

const CATEGORY_EMOJIS = {
  lifestyle: '\u{1F3AF}',  // direct hit / target
  food: '\u{1F355}',       // pizza
  travel: '\u{2708}\uFE0F',// airplane
  relationships: '\u{2764}\uFE0F', // heart
  money: '\u{1F4B0}',      // money bag
  hypothetical: '\u{1F914}',// thinking face
  fun: '\u{1F602}',        // laughing face
  deep: '\u{1F9E0}',       // brain
  sport: '\u{1F4AA}',      // flexed bicep
  tech: '\u{1F4BB}',       // laptop
  other: '\u{2728}',       // sparkles
};

// ============================================================
// Timer Bar Component (visual countdown for urgency)
// ============================================================
function TimerBar({ isActive, duration = 30 }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(duration);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    setTimeLeft(duration);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, duration]);

  const pct = (timeLeft / duration) * 100;
  const isLow = timeLeft <= 10;
  const barColor = isLow
    ? 'linear-gradient(90deg, #EF4444, #f97316)'
    : 'linear-gradient(90deg, #00D4FF, #FF2D78, #BF5AF2)';

  return (
    <div style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 8,
      marginBottom: 8,
    }}>
      <Clock size={13} color={isLow ? '#EF4444' : '#00D4FF'} style={isLow ? { animation: 'ps-timer-pulse 0.5s ease-in-out infinite' } : {}} />
      <div style={{
        flex: 1, height: 4, background: 'rgba(255,255,255,0.06)',
        borderRadius: 2, overflow: 'hidden', position: 'relative',
      }}>
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            height: '100%', borderRadius: 2,
            background: barColor,
            boxShadow: isLow ? '0 0 8px rgba(239,68,68,0.4)' : '0 0 4px rgba(0,212,255,0.3)',
          }}
        />
      </div>
      <span style={{
        fontSize: 12, fontWeight: 800, minWidth: 28, textAlign: 'right',
        color: isLow ? '#EF4444' : '#00D4FF',
        animation: isLow ? 'ps-timer-pulse 0.5s ease-in-out infinite' : 'none',
      }}>
        {timeLeft}s
      </span>
    </div>
  );
}

// ============================================================
// Animated Counter Hook
// ============================================================
function useCountUp(target, duration = 1200, start = false) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!start) {
      setValue(0);
      return;
    }
    const startTime = performance.now();
    // Slot-machine effect: fast spin then dramatic deceleration
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Overshoot easing for slot-machine feel
      const eased = progress < 0.7
        ? (progress / 0.7) * 1.15  // overshoot slightly
        : 1.15 - 0.15 * ((progress - 0.7) / 0.3); // settle back
      const finalEased = Math.min(eased, 1.0) * (1 - Math.pow(1 - Math.min(progress, 1), 3));
      setValue(Math.min(Math.round(finalEased * target * 1.08), target)); // slight bounce
      if (progress >= 1) {
        setValue(target); // ensure final value is exact
      }
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, start]);

  return value;
}

// ============================================================
// Sparkle / Confetti Particle Layer  (celebratory micro-anim)
// ============================================================
function CelebrationBurst({ show }) {
  if (!show) return null;

  const particles = Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * 360;
    const dist = 40 + Math.random() * 80;
    const x = Math.cos((angle * Math.PI) / 180) * dist;
    const y = Math.sin((angle * Math.PI) / 180) * dist;
    const colors = ['#00D4FF', '#FF2D78', '#39FF14', '#BF5AF2', '#FF6B35', '#33E0FF'];
    const color = colors[i % colors.length];
    const size = 4 + Math.random() * 6;
    const delay = Math.random() * 0.3;

    return (
      <motion.div
        key={i}
        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
        animate={{ x, y, opacity: 0, scale: 0 }}
        transition={{ duration: 0.8 + Math.random() * 0.4, delay, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '2px' : '50%',
          background: color,
          top: '50%',
          left: '50%',
          pointerEvents: 'none',
          boxShadow: `0 0 6px ${color}`,
        }}
      />
    );
  });

  return (
    <div style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 50, pointerEvents: 'none' }}>
      {particles}
    </div>
  );
}

// ============================================================
// Floating Confetti Rain (post-vote celebration)
// ============================================================
function ConfettiRain({ show }) {
  if (!show) return null;

  const pieces = Array.from({ length: 18 }, (_, i) => {
    const colors = ['#00D4FF', '#FF2D78', '#39FF14', '#BF5AF2', '#FF6B35'];
    const color = colors[i % colors.length];
    const left = 5 + Math.random() * 90;
    const delay = Math.random() * 0.6;
    const duration = 1.5 + Math.random() * 1;
    const size = 5 + Math.random() * 5;

    return (
      <motion.div
        key={i}
        initial={{ y: -20, opacity: 1, rotate: 0 }}
        animate={{ y: 200, opacity: 0, rotate: 360 + Math.random() * 360 }}
        transition={{ duration, delay, ease: 'easeIn' }}
        style={{
          position: 'absolute',
          top: 0,
          left: `${left}%`,
          width: size,
          height: size * (i % 2 === 0 ? 1 : 0.5),
          borderRadius: i % 3 === 0 ? '50%' : '1px',
          background: color,
          pointerEvents: 'none',
        }}
      />
    );
  });

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', overflow: 'hidden', pointerEvents: 'none', zIndex: 45 }}>
      {pieces}
    </div>
  );
}

// ============================================================
// Skeleton Loader for shimmer loading state
// ============================================================
function SkeletonCard() {
  const shimmerBg = 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)';
  const shimmerStyle = {
    backgroundImage: shimmerBg,
    backgroundSize: '400px 100%',
    animation: 'ps-skeleton-wave 1.8s infinite linear',
    borderRadius: 12,
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: 500,
      padding: '0 20px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 20,
      marginTop: 40,
    }}>
      {/* Category badge skeleton */}
      <div style={{ ...shimmerStyle, width: 100, height: 28 }} />
      {/* Question skeleton */}
      <div style={{ ...shimmerStyle, width: '80%', height: 28 }} />
      <div style={{ ...shimmerStyle, width: '60%', height: 28 }} />
      {/* Cards skeleton */}
      <div style={{ display: 'flex', gap: 16, width: '100%', marginTop: 16 }}>
        <div style={{
          ...shimmerStyle,
          flex: 1,
          height: 180,
          borderRadius: 20,
          border: '1px solid rgba(0,212,255,0.1)',
        }} />
        <div style={{
          ...shimmerStyle,
          flex: 1,
          height: 180,
          borderRadius: 20,
          border: '1px solid rgba(255,45,120,0.1)',
        }} />
      </div>
    </div>
  );
}

// ============================================================
// Progress Dots Component
// ============================================================
function ProgressDots({ current, total, answeredIds, dilemmasList }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', maxWidth: 300 }}>
      {Array.from({ length: total }, (_, i) => {
        const dilemma = dilemmasList[i];
        const isAnswered = dilemma && answeredIds.has(dilemma.id);
        const isCurrent = i === current;

        return (
          <motion.div
            key={i}
            animate={isCurrent ? { scale: [1, 1.3, 1] } : {}}
            transition={isCurrent ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : {}}
            style={{
              width: isCurrent ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: isAnswered
                ? 'linear-gradient(90deg, #00D4FF, #FF2D78)'
                : isCurrent
                  ? 'linear-gradient(90deg, #00D4FF, #BF5AF2)'
                  : 'rgba(255,255,255,0.1)',
              transition: 'all 0.3s ease',
              boxShadow: isCurrent
                ? '0 0 8px rgba(0,212,255,0.5)'
                : isAnswered
                  ? '0 0 4px rgba(0,212,255,0.3)'
                  : 'none',
            }}
          />
        );
      })}
    </div>
  );
}

// ============================================================
// Result Bar with animated count-up & winner highlight
// ============================================================
function ResultBar({ label, percentage, color, gradientFrom, gradientTo, isUserChoice, isWinner, showResults, letterLabel }) {
  const displayPct = useCountUp(percentage, 1400, showResults);

  return (
    <motion.div
      style={{ marginBottom: 20, position: 'relative' }}
      initial={{ opacity: 0, x: letterLabel === 'A' ? -30 : 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: letterLabel === 'A' ? 0.1 : 0.25 }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <span style={{
            fontSize: 11,
            fontWeight: 800,
            color: '#fff',
            background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
            width: 24,
            height: 24,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            {letterLabel}
          </span>
          <span style={{
            fontSize: 14,
            fontWeight: 700,
            color: '#fff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {label}
          </span>
          {isUserChoice && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, delay: 0.5 }}
              style={{
                fontSize: 10,
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: 6,
                background: `linear-gradient(135deg, ${gradientFrom}33, ${gradientTo}22)`,
                color: gradientFrom,
                border: `1px solid ${gradientFrom}44`,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                flexShrink: 0,
              }}
            >
              Your pick
            </motion.span>
          )}
        </div>
        <motion.span
          style={{
            fontSize: 28,
            fontWeight: 900,
            background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginLeft: 12,
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'baseline',
            overflow: 'hidden',
          }}
        >
          {String(displayPct).split('').map((digit, di) => (
            <motion.span
              key={`${letterLabel}-${di}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 0.3 + di * 0.08,
                duration: 0.4,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              style={{ display: 'inline-block' }}
            >
              {digit}
            </motion.span>
          ))}
          <motion.span
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            style={{ display: 'inline-block' }}
          >
            %
          </motion.span>
        </motion.span>
      </div>

      {/* Bar track */}
      <div style={{
        width: '100%',
        height: 16,
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: showResults ? `${percentage}%` : 0 }}
          transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
          style={{
            height: '100%',
            borderRadius: 8,
            background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Shine sweep on winner bar */}
          {isWinner && (
            <div style={{
              position: 'absolute',
              top: 0,
              width: '40%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              animation: 'ps-winner-shine 2s ease-in-out 1.5s infinite',
            }} />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ============================================================
// EnergyRegenTimer -- shows countdown to next energy point
// ============================================================
function EnergyRegenTimer({ energy, user, regenTimer, setRegenTimer }) {
  useEffect(() => {
    if (energy >= ENERGY_MAX) {
      setRegenTimer('');
      return;
    }
    const tick = () => {
      const dbCurrent = user?.energy_current != null ? Number(user.energy_current) : ENERGY_MAX;
      const dbLastUpdate = user?.energy_last_update || null;
      const ms = timeUntilNextEnergy(dbCurrent, dbLastUpdate, ENERGY_MAX);
      if (ms <= 0) {
        setRegenTimer('now');
      } else {
        const mins = Math.floor(ms / 60000);
        const secs = Math.floor((ms % 60000) / 1000);
        setRegenTimer(`${mins}:${secs.toString().padStart(2, '0')}`);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [energy, user?.energy_current, user?.energy_last_update, setRegenTimer]);

  if (!regenTimer || energy >= ENERGY_MAX) return null;

  return (
    <div style={{
      fontSize: 13, color: '#BF5AF2', fontWeight: 700,
      marginBottom: 16, letterSpacing: 0.3,
    }}>
      Next energy in {regenTimer}
    </div>
  );
}

// ============================================================
// PlayScreen -- Main Export
// ============================================================
export default function PlayScreen() {
  const { user, updateUser, energy, spendEnergy, refillEnergy } = useAuth();
  const { checkAchievements, resetSession } = useAchievements();

  const [dilemmasList, setDilemmasList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [chosen, setChosen] = useState(null); // 'a' | 'b' | null
  const [showResults, setShowResults] = useState(false);
  const [showXp, setShowXp] = useState(false);
  const [answeredIds, setAnsweredIds] = useState(new Set());
  const [totalXpEarned, setTotalXpEarned] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [direction, setDirection] = useState(1);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hoverA, setHoverA] = useState(false);
  const [hoverB, setHoverB] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [screenShake, setScreenShake] = useState(false);

  // Energy modal state
  const [showEnergyModal, setShowEnergyModal] = useState(false);
  const [regenTimer, setRegenTimer] = useState('');

  // Combo counter: increases when answering within 5 seconds
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const cardShownTimeRef = useRef(Date.now());

  // Hot streak: consecutive answers without skipping
  const [hotStreak, setHotStreak] = useState(0);

  // ── Question of the Day (Featured) state ──────────────────
  const [featuredDilemma, setFeaturedDilemma] = useState(null);
  const [featuredAnswered, setFeaturedAnswered] = useState(false);
  const [showFeatured, setShowFeatured] = useState(false);
  const [featuredChosen, setFeaturedChosen] = useState(null);
  const [featuredShowResults, setFeaturedShowResults] = useState(false);
  const [featuredShowXp, setFeaturedShowXp] = useState(false);
  const [featuredHoverA, setFeaturedHoverA] = useState(false);
  const [featuredHoverB, setFeaturedHoverB] = useState(false);
  const [featuredCelebration, setFeaturedCelebration] = useState(false);

  // ── Active Event (XP multiplier) ─────────────────────────
  const [activeEvent, setActiveEvent] = useState(null);
  const eventMultiplier = activeEvent?.multiplier > 1 ? activeEvent.multiplier : 1;

  const streak = user?.current_streak || 5;
  const answeredCount = answeredIds.size;
  const totalCount = dilemmasList.length;

  const [loading, setLoading] = useState(true);

  // ── Load dilemmas + featured + filter already answered + daily limit ──
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    resetSession(); // Reset achievement session counters

    (async () => {
      try {
        const todayStr = new Date().toISOString().slice(0, 10);

        // Fetch dilemmas, votes, featured, and featured tracking in parallel
        const [allDilemmas, userVotes, featuredData, featuredTrack, activeEventsData] = await Promise.all([
          dilemmasApi.getAll(),
          votesApi.getByUser(user.id),
          dilemmasApi.getFeatured().catch(() => []),
          featuredTracking.check(user.id, todayStr).catch(() => []),
          eventsApi.getActive().catch(() => []),
        ]);

        // ── Active Event (for XP multiplier) ──
        const eventsArr = Array.isArray(activeEventsData) ? activeEventsData : activeEventsData ? [activeEventsData] : [];
        const now = new Date();
        const liveEvent = eventsArr.find(e => {
          if (e.status !== 'active' && e.record_status !== 'active') return false;
          if (e.start_date && new Date(e.start_date) > now) return false;
          if (e.end_date && new Date(e.end_date) < now) return false;
          return (e.multiplier || 1) > 1;
        }) || null;
        setActiveEvent(liveEvent);

        const dilemmasArr = Array.isArray(allDilemmas) ? allDilemmas : [];
        const votesArr = Array.isArray(userVotes) ? userVotes : [];

        // ── Featured Question of the Day ──
        const featuredArr = Array.isArray(featuredData) ? featuredData : featuredData ? [featuredData] : [];
        const featuredTrackArr = Array.isArray(featuredTrack) ? featuredTrack : featuredTrack ? [featuredTrack] : [];
        const hasAnsweredFeaturedToday = featuredTrackArr.length > 0;

        if (featuredArr.length > 0 && !hasAnsweredFeaturedToday) {
          setFeaturedDilemma(featuredArr[0]);
          setShowFeatured(true);
          setFeaturedAnswered(false);
        }

        // Build set of already-answered dilemma IDs
        const previouslyAnsweredIds = new Set(votesArr.map((v) => v.dilemma_id));

        // Filter out already-answered dilemmas (and exclude the featured one)
        const featuredId = featuredArr.length > 0 ? featuredArr[0].id : null;
        const unanswered = dilemmasArr.filter((d) =>
          !previouslyAnsweredIds.has(d.id) && d.id !== featuredId
        );

        // Shuffle using Fisher-Yates so users don't always see the same order
        for (let i = unanswered.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [unanswered[i], unanswered[j]] = [unanswered[j], unanswered[i]];
        }

        setDilemmasList(unanswered);
      } catch {
        setDilemmasList([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const dilemma = dilemmasList[currentIndex];

  // ── Handle choosing an option ──────────────────────────
  const handleChoice = useCallback(
    (option) => {
      if (chosen || !dilemma) return;

      // Energy gate: check if user has enough energy
      if (energy < ENERGY_PER_PLAY) {
        setShowEnergyModal(true);
        return;
      }

      // Deduct energy
      spendEnergy(ENERGY_PER_PLAY);

      // Combo logic: if answered within 5 seconds, increase combo
      const elapsed = (Date.now() - cardShownTimeRef.current) / 1000;
      if (elapsed <= 5) {
        setCombo((prev) => prev + 1);
        setShowCombo(true);
        setTimeout(() => setShowCombo(false), 1800);
      } else {
        setCombo(0);
      }

      // Hot streak: increment consecutive answers
      setHotStreak((prev) => prev + 1);

      setChosen(option);
      setShowCelebration(true);
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 500);

      // Fire-and-forget: save vote to API
      // user.id is the integer profile ID from the users table (resolved at login)
      votesApi.cast({
        user_id: user.id,
        dilemma_id: dilemma.id,
        chosen_option: option,
      }).catch((err) => console.warn('Vote cast failed:', err.message));

      // Fire-and-forget: create feed activity for this vote
      const chosenText = option === 'a' ? dilemma.option_a : dilemma.option_b;
      activitiesApi.create({
        actor_id: user.id,
        actor_name: user.username || user.name || user.email || 'User',
        verb: 'answered',
        description: `chose "${chosenText.length > 60 ? chosenText.slice(0, 57) + '...' : chosenText}"`,
        target_type: 'dilemma',
        target_id: dilemma.id,
        visibility: 'public',
        is_deleted: 0,
        created_at: new Date().toISOString(),
      }).catch(() => {});

      // Fire-and-forget: update the dilemma's vote counts
      const voteField = option === 'a' ? 'votes_a_count' : 'votes_b_count';
      const currentCount = option === 'a' ? (dilemma.votes_a_count || 0) : (dilemma.votes_b_count || 0);
      dilemmasApi.update(dilemma.id, {
        [voteField]: currentCount + 1,
        total_votes: (dilemma.total_votes || 0) + 1,
      }).catch((err) => console.warn('Vote count update failed:', err.message));

      setTimeout(() => {
        setShowResults(true);
        setShowXp(true);
        setAnsweredIds((prev) => new Set(prev).add(dilemma.id));
        setTotalXpEarned((prev) => prev + Math.round(POINTS.answer_dilemma * eventMultiplier));

        // Check achievements after vote (with slight delay for results to compute)
        setTimeout(() => {
          const extraA = option === 'a' ? 1 : 0;
          const extraB = option === 'b' ? 1 : 0;
          const totalA = (dilemma.votes_a_count || 0) + extraA;
          const totalB = (dilemma.votes_b_count || 0) + extraB;
          const total = totalA + totalB || 1;
          const userPct = option === 'a'
            ? Math.round((totalA / total) * 100)
            : Math.round((totalB / total) * 100);
          checkAchievements({ chosenOption: option, dilemma, userPct }).catch(() => {});
        }, 200);
      }, 400);

      setTimeout(() => setShowXp(false), 2200);
      setTimeout(() => setShowCelebration(false), 1500);
    },
    [chosen, dilemma, user, checkAchievements, energy, spendEnergy],
  );

  // ── Advance to next dilemma ────────────────────────────
  const handleNext = useCallback(() => {
    if (currentIndex >= dilemmasList.length - 1) {
      setCompleted(true);
      return;
    }
    setDirection(1);
    setChosen(null);
    setShowResults(false);
    setShowXp(false);
    setShowCelebration(false);
    setCurrentIndex((i) => i + 1);
    cardShownTimeRef.current = Date.now();
  }, [currentIndex, dilemmasList.length]);

  // ── Skip ───────────────────────────────────────────────
  const handleSkip = useCallback(() => {
    if (currentIndex >= dilemmasList.length - 1) {
      setCompleted(true);
      return;
    }
    setDirection(1);
    setChosen(null);
    setShowResults(false);
    setShowXp(false);
    setShowCelebration(false);
    setCurrentIndex((i) => i + 1);
    cardShownTimeRef.current = Date.now();
    // Skipping breaks both combo and hot streak
    setCombo(0);
    setHotStreak(0);
  }, [currentIndex, dilemmasList.length]);

  // ── Persist XP & activity when session completes ───────
  useEffect(() => {
    if (!completed || !user?.id || totalXpEarned === 0) return;

    // Update user's XP in the database
    const newXp = (user.xp || 0) + totalXpEarned;
    authApi.updateUser(user.id, { xp: newXp })
      .then(() => {
        // Also update local auth context so UI reflects new XP
        updateUser({ xp: newXp });
      })
      .catch(() => {}); // silently ignore

    // Record XP in leaderboard entries (daily/weekly/season)
    recordXp(user.id, totalXpEarned, user).catch(() => {});

    // Create an activity record for the feed
    activitiesApi.create({
      actor_id: user.id,
      actor_name: user.name || user.email || 'User',
      verb: 'answered',
      description: `Answered ${answeredCount} dilemmas and earned ${totalXpEarned} XP`,
      visibility: 'public',
      is_deleted: 0,
    }).catch(() => {}); // silently ignore

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed]);

  // ── Handle Featured Question Choice ─────────────────────
  const handleFeaturedChoice = useCallback((option) => {
    if (featuredChosen || !featuredDilemma) return;

    setFeaturedChosen(option);
    setFeaturedCelebration(true);
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 500);

    // Save the vote (user.id is integer profile ID)
    votesApi.cast({
      user_id: user.id,
      dilemma_id: featuredDilemma.id,
      chosen_option: option,
    }).catch((err) => console.warn('Featured vote failed:', err.message));

    // Update vote count
    const voteField = option === 'a' ? 'votes_a_count' : 'votes_b_count';
    const currentCount = option === 'a' ? (featuredDilemma.votes_a_count || 0) : (featuredDilemma.votes_b_count || 0);
    dilemmasApi.update(featuredDilemma.id, {
      [voteField]: currentCount + 1,
      total_votes: (featuredDilemma.total_votes || 0) + 1,
    }).catch((err) => console.warn('Featured vote count update failed:', err.message));

    // Create activity for featured answer
    const chosenText = option === 'a' ? featuredDilemma.option_a : featuredDilemma.option_b;
    activitiesApi.create({
      actor_id: user.id,
      actor_name: user.username || user.name || 'Anonymous',
      verb: 'answered',
      description: `answered featured: chose "${chosenText.length > 60 ? chosenText.slice(0, 57) + '...' : chosenText}"`,
      target_type: 'dilemma',
      target_id: featuredDilemma.id,
      visibility: 'public',
      is_deleted: 0,
      created_at: new Date().toISOString(),
    }).catch(() => {});

    // Record featured tracking (no user_id)
    const todayStr = new Date().toISOString().slice(0, 10);
    featuredTracking.record({
      tracking_date: todayStr,
      dilemma_id: featuredDilemma.id,
      chosen_option: option,
    }).catch((err) => console.warn('Featured tracking failed:', err.message));

    // Award 2x XP for featured question
    const featuredXp = Math.round(POINTS.answer_dilemma * FEATURED_XP_MULTIPLIER * eventMultiplier);

    setTimeout(() => {
      setFeaturedShowResults(true);
      setFeaturedShowXp(true);
      setTotalXpEarned((prev) => prev + featuredXp);
      setFeaturedAnswered(true);

      // Check achievements
      setTimeout(() => {
        const extraA = option === 'a' ? 1 : 0;
        const extraB = option === 'b' ? 1 : 0;
        const totalA = (featuredDilemma.votes_a_count || 0) + extraA;
        const totalB = (featuredDilemma.votes_b_count || 0) + extraB;
        const total = totalA + totalB || 1;
        const userPct = option === 'a'
          ? Math.round((totalA / total) * 100)
          : Math.round((totalB / total) * 100);
        checkAchievements({ chosenOption: option, dilemma: featuredDilemma, userPct }).catch(() => {});
      }, 200);
    }, 400);

    setTimeout(() => setFeaturedShowXp(false), 2200);
    setTimeout(() => setFeaturedCelebration(false), 1500);
  }, [featuredChosen, featuredDilemma, user, checkAchievements]);

  const dismissFeatured = useCallback(() => {
    setShowFeatured(false);
  }, []);

  // ── Play again ─────────────────────────────────────────
  const handlePlayAgain = () => {
    setCurrentIndex(0);
    setChosen(null);
    setShowResults(false);
    setShowXp(false);
    setShowCelebration(false);
    setAnsweredIds(new Set());
    setTotalXpEarned(0);
    setCompleted(false);
    // Reset featured states
    setFeaturedChosen(null);
    setFeaturedShowResults(false);
    setFeaturedShowXp(false);
    setFeaturedCelebration(false);
    setShowFeatured(false);
    setFeaturedAnswered(false);
  };

  // ── Calculate percentages ──────────────────────────────
  let pctA = 50,
    pctB = 50;
  if (dilemma && showResults) {
    const extraA = chosen === 'a' ? 1 : 0;
    const extraB = chosen === 'b' ? 1 : 0;
    const totalA = (dilemma.votes_a_count || 0) + extraA;
    const totalB = (dilemma.votes_b_count || 0) + extraB;
    const total = totalA + totalB || 1;
    pctA = Math.round((totalA / total) * 100);
    pctB = 100 - pctA;
  }

  const catColor = CATEGORY_COLORS[dilemma?.category] || '#00D4FF';
  const catTint = CATEGORY_TINTS[dilemma?.category] || CATEGORY_TINTS.other;
  const isHotStreak = hotStreak >= 3;

  // ── Card animation variants (Tinder-like swipe) ─────────
  const cardVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 400 : -400,
      opacity: 0,
      scale: 0.88,
      rotateZ: dir > 0 ? 6 : -6,
      rotateY: dir > 0 ? 12 : -12,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateZ: 0,
      rotateY: 0,
    },
    exit: (dir) => ({
      x: dir > 0 ? -400 : 400,
      opacity: 0,
      scale: 0.85,
      rotateZ: dir > 0 ? -8 : 8,
      rotateY: dir > 0 ? -12 : 12,
    }),
  };

  const energyDisplay = energy;

  // ── Render ─────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0f 0%, #0d0d18 30%, #0a0a12 60%, #0a0a0f 100%)',
      color: '#e2e8f0',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingBottom: 100,
      overflow: 'hidden',
      position: 'relative',
      animation: screenShake ? 'ps-screen-shake 0.5s ease-out' : 'none',
    }}>

      {/* ── Background Ambient Orbs ─────────────────────── */}
      <div style={{
        position: 'absolute', top: '5%', left: '-8%',
        width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)',
        animation: 'ps-bg-drift 20s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '-10%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(191,90,242,0.05) 0%, transparent 70%)',
        animation: 'ps-bg-drift 25s ease-in-out infinite reverse',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,45,120,0.03) 0%, transparent 70%)',
        animation: 'ps-bg-drift 18s ease-in-out infinite',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }} />

      {/* ── Active Event Banner ────────────────────────── */}
      {activeEvent && (
        <div style={{
          width: '100%', maxWidth: 520, margin: '12px auto 0', padding: '0 20px', boxSizing: 'border-box',
          zIndex: 10, position: 'relative',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,215,0,0.10) 0%, rgba(255,165,0,0.08) 100%)',
            border: '1px solid rgba(255,215,0,0.25)',
            borderRadius: 14, padding: '12px 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 12, animation: 'ps-shimmer 3s linear infinite',
            backgroundSize: '200% 100%',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Sparkles size={18} color="#FFD700" />
              <span style={{
                fontSize: 14, fontWeight: 700,
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                {activeEvent.name}
              </span>
            </div>
            <span style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              color: '#000', fontSize: 12, fontWeight: 800,
              padding: '4px 10px', borderRadius: 20,
              letterSpacing: 0.5,
            }}>
              {activeEvent.multiplier}x XP
            </span>
          </div>
        </div>
      )}

      {/* ── Question of the Day Modal ────────────────────── */}
      <AnimatePresence>
        {showFeatured && featuredDilemma && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 16,
            }}
          >
            <motion.div
              initial={{ scale: 0.8, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              style={{
                width: '100%', maxWidth: 460,
                borderRadius: 28,
                padding: '28px 22px 24px',
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(160deg, rgba(30,25,10,0.98) 0%, rgba(15,12,5,0.99) 100%)',
                border: '2px solid rgba(0,212,255,0.35)',
                boxShadow: '0 0 60px rgba(0,212,255,0.15), 0 24px 80px rgba(0,0,0,0.5), inset 0 0 40px rgba(0,212,255,0.03)',
              }}
            >
              {/* Gold shimmer border effect */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: 'linear-gradient(90deg, transparent, #00D4FF, #FFE44D, #00D4FF, transparent)',
                backgroundSize: '200% 100%',
                animation: 'ps-shimmer 3s ease-in-out infinite',
              }} />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
                background: 'linear-gradient(90deg, transparent, #00D4FF, #FFE44D, #00D4FF, transparent)',
                backgroundSize: '200% 100%',
                animation: 'ps-shimmer 3s ease-in-out infinite 1.5s',
              }} />

              {/* Ambient gold glow */}
              <div style={{
                position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
                width: 300, height: 300, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 60%)',
                pointerEvents: 'none',
              }} />

              {/* "QUESTION OF THE DAY" badge */}
              <motion.div
                initial={{ y: -20, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
                style={{ textAlign: 'center', marginBottom: 16, position: 'relative', zIndex: 2 }}
              >
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '8px 20px', borderRadius: 20,
                  fontSize: 11, fontWeight: 900,
                  textTransform: 'uppercase', letterSpacing: 2,
                  background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,212,255,0.08))',
                  color: '#00D4FF',
                  border: '1px solid rgba(0,212,255,0.4)',
                  boxShadow: '0 0 20px rgba(0,212,255,0.15)',
                }}>
                  <Crown size={14} color="#00D4FF" />
                  Question of the Day
                  <Crown size={14} color="#00D4FF" />
                </span>
              </motion.div>

              {/* 2x XP badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.35, type: 'spring', stiffness: 500 }}
                style={{ textAlign: 'center', marginBottom: 14 }}
              >
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '4px 12px', borderRadius: 12,
                  fontSize: 12, fontWeight: 800,
                  background: 'linear-gradient(135deg, #00D4FF, #BF5AF2)',
                  color: '#fff',
                  boxShadow: '0 0 12px rgba(0,212,255,0.3)',
                }}>
                  <Zap size={12} /> 2x XP BONUS
                </span>
              </motion.div>

              {/* Category */}
              {featuredDilemma.category && (
                <div style={{ textAlign: 'center', marginBottom: 12 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: '#94a3b8',
                    textTransform: 'uppercase', letterSpacing: 1,
                  }}>
                    {CATEGORY_EMOJIS[featuredDilemma.category] || ''} {featuredDilemma.category}
                  </span>
                </div>
              )}

              {/* Question */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  fontSize: 22, fontWeight: 800, color: '#ffffff',
                  textAlign: 'center', lineHeight: 1.4,
                  margin: '0 0 24px', position: 'relative', zIndex: 2,
                  textShadow: '0 2px 20px rgba(0,212,255,0.15)',
                }}
              >
                {featuredDilemma.question}
              </motion.h2>

              {/* Voting Cards or Results */}
              {!featuredShowResults ? (
                <div style={{
                  display: 'flex', gap: 14, alignItems: 'stretch', position: 'relative',
                }}>
                  {/* Option A */}
                  <motion.button
                    onMouseEnter={() => setFeaturedHoverA(true)}
                    onMouseLeave={() => setFeaturedHoverA(false)}
                    onClick={() => handleFeaturedChoice('a')}
                    whileTap={{ scale: 0.95 }}
                    animate={
                      featuredChosen === 'a'
                        ? { scale: 1.05, borderColor: '#00D4FF' }
                        : featuredChosen === 'b'
                          ? { opacity: 0.3, scale: 0.93 }
                          : {}
                    }
                    style={{
                      flex: 1, border: '2px solid rgba(0,212,255,0.25)',
                      borderRadius: 20, padding: '24px 14px',
                      cursor: featuredChosen ? 'default' : 'pointer',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      textAlign: 'center', minHeight: 130,
                      background: featuredHoverA && !featuredChosen
                        ? 'linear-gradient(160deg, rgba(0,212,255,0.15) 0%, rgba(0,212,255,0.05) 100%)'
                        : 'linear-gradient(160deg, rgba(0,212,255,0.08) 0%, rgba(0,212,255,0.02) 100%)',
                      animation: !featuredChosen ? 'ps-pulse-cyan 3s ease-in-out infinite' : 'none',
                      transition: 'background 0.3s',
                      position: 'relative', overflow: 'hidden',
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 0, left: '20%', right: '20%', height: 2,
                      background: 'linear-gradient(90deg, transparent, #00D4FF, transparent)', borderRadius: 1,
                    }} />
                    <span style={{
                      fontSize: 12, fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase',
                      marginBottom: 10, color: '#00D4FF',
                    }}>Option A</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', lineHeight: 1.35 }}>
                      {featuredDilemma.option_a}
                    </span>
                  </motion.button>

                  {/* VS */}
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1a1a0f, #201d10)',
                    border: '2px solid rgba(0,212,255,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 10,
                    animation: 'ps-vs-glow 2.5s ease-in-out infinite',
                    fontSize: 13, fontWeight: 900, color: '#00D4FF',
                    transform: 'translate(-50%, -50%)',
                  }}>VS</div>

                  {/* Option B */}
                  <motion.button
                    onMouseEnter={() => setFeaturedHoverB(true)}
                    onMouseLeave={() => setFeaturedHoverB(false)}
                    onClick={() => handleFeaturedChoice('b')}
                    whileTap={{ scale: 0.95 }}
                    animate={
                      featuredChosen === 'b'
                        ? { scale: 1.05, borderColor: '#00D4FF' }
                        : featuredChosen === 'a'
                          ? { opacity: 0.3, scale: 0.93 }
                          : {}
                    }
                    style={{
                      flex: 1, border: '2px solid rgba(0,212,255,0.25)',
                      borderRadius: 20, padding: '24px 14px',
                      cursor: featuredChosen ? 'default' : 'pointer',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      textAlign: 'center', minHeight: 130,
                      background: featuredHoverB && !featuredChosen
                        ? 'linear-gradient(160deg, rgba(0,212,255,0.15) 0%, rgba(0,212,255,0.05) 100%)'
                        : 'linear-gradient(160deg, rgba(0,212,255,0.08) 0%, rgba(0,212,255,0.02) 100%)',
                      animation: !featuredChosen ? 'ps-pulse-pink 3s ease-in-out infinite' : 'none',
                      transition: 'background 0.3s',
                      position: 'relative', overflow: 'hidden',
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 0, left: '20%', right: '20%', height: 2,
                      background: 'linear-gradient(90deg, transparent, #00D4FF, transparent)', borderRadius: 1,
                    }} />
                    <span style={{
                      fontSize: 12, fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase',
                      marginBottom: 10, color: '#00D4FF',
                    }}>Option B</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', lineHeight: 1.35 }}>
                      {featuredDilemma.option_b}
                    </span>
                  </motion.button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ position: 'relative' }}
                >
                  <CelebrationBurst show={featuredCelebration} />

                  {/* Featured Results */}
                  {(() => {
                    const extraA = featuredChosen === 'a' ? 1 : 0;
                    const extraB = featuredChosen === 'b' ? 1 : 0;
                    const fTotalA = (featuredDilemma.votes_a_count || 0) + extraA;
                    const fTotalB = (featuredDilemma.votes_b_count || 0) + extraB;
                    const fTotal = fTotalA + fTotalB || 1;
                    const fPctA = Math.round((fTotalA / fTotal) * 100);
                    const fPctB = 100 - fPctA;

                    return (
                      <>
                        <ResultBar
                          label={featuredDilemma.option_a} percentage={fPctA}
                          gradientFrom="#00D4FF" gradientTo="#FF2D78" color="#00D4FF"
                          isUserChoice={featuredChosen === 'a'} isWinner={fPctA >= fPctB}
                          showResults={featuredShowResults} letterLabel="A"
                        />
                        <ResultBar
                          label={featuredDilemma.option_b} percentage={fPctB}
                          gradientFrom="#00D4FF" gradientTo="#FF2D78" color="#00D4FF"
                          isUserChoice={featuredChosen === 'b'} isWinner={fPctB > fPctA}
                          showResults={featuredShowResults} letterLabel="B"
                        />
                      </>
                    );
                  })()}

                  {/* Featured XP float celebration */}
                  <AnimatePresence>
                    {featuredShowXp && (
                      <motion.div
                        style={{
                          position: 'absolute', top: -40, left: '50%',
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                          pointerEvents: 'none', zIndex: 20,
                        }}
                        initial={{ opacity: 0, x: '-50%', y: 20, scale: 0.3 }}
                        animate={{ opacity: 1, x: '-50%', y: -50, scale: 1 }}
                        exit={{ opacity: 0, x: '-50%', y: -90, scale: 0.6 }}
                        transition={{ duration: 1.8, ease: 'easeOut' }}
                      >
                        {/* Star burst for featured */}
                        {[...Array(12)].map((_, i) => (
                          <motion.div
                            key={i}
                            style={{
                              position: 'absolute',
                              width: i % 3 === 0 ? 8 : 5,
                              height: i % 3 === 0 ? 8 : 5,
                              borderRadius: '50%',
                              background: ['#00D4FF', '#FFE44D', '#FF2D78', '#BF5AF2'][i % 4],
                              boxShadow: `0 0 8px ${['#00D4FF', '#FFE44D', '#FF2D78', '#BF5AF2'][i % 4]}`,
                            }}
                            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                            animate={{
                              x: Math.cos((i * Math.PI) / 6) * 60,
                              y: Math.sin((i * Math.PI) / 6) * 60,
                              opacity: 0, scale: 0,
                            }}
                            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.05 * i }}
                          />
                        ))}
                        {/* Double glow rings */}
                        <motion.div
                          style={{ position: 'absolute', width: 90, height: 90, borderRadius: '50%', border: '2px solid rgba(255,228,77,0.5)' }}
                          initial={{ scale: 0.3, opacity: 0.8 }}
                          animate={{ scale: 2.2, opacity: 0 }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                        <motion.div
                          style={{ position: 'absolute', width: 90, height: 90, borderRadius: '50%', border: '1px solid rgba(0,212,255,0.3)' }}
                          initial={{ scale: 0.5, opacity: 0.6 }}
                          animate={{ scale: 2.5, opacity: 0 }}
                          transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
                        />
                        {/* XP text */}
                        <motion.div
                          style={{
                            fontSize: 36, fontWeight: 900,
                            background: 'linear-gradient(135deg, #FFE44D, #00D4FF, #FFE44D)',
                            backgroundSize: '200% 100%',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 0 24px rgba(255,228,77,0.6))',
                            letterSpacing: 2,
                          }}
                          initial={{ scale: 0.5 }}
                          animate={{ scale: [0.5, 1.4, 1.05] }}
                          transition={{ duration: 0.6, times: [0, 0.5, 1] }}
                        >
                          +{Math.round(POINTS.answer_dilemma * FEATURED_XP_MULTIPLIER * eventMultiplier)} XP
                        </motion.div>
                        <motion.span
                          style={{
                            fontSize: 11, fontWeight: 800, color: '#FFE44D',
                            marginTop: 2, letterSpacing: 1,
                            textShadow: '0 0 8px rgba(255,228,77,0.4)',
                          }}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          FEATURED BONUS{eventMultiplier > 1 ? ` + ${eventMultiplier}x EVENT` : ''}
                        </motion.span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Continue to session button */}
                  <motion.button
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={dismissFeatured}
                    style={{
                      width: '100%', marginTop: 20, padding: '16px 24px',
                      borderRadius: 16, border: 'none',
                      background: 'linear-gradient(135deg, #00D4FF, #FF2D78)',
                      color: '#fff', fontSize: 17, fontWeight: 800,
                      cursor: 'pointer', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: 10,
                      boxShadow: '0 4px 20px rgba(0,212,255,0.2)',
                    }}
                  >
                    <ArrowRight size={18} />
                    Continue to Today's Session
                  </motion.button>
                </motion.div>
              )}

              {/* Skip featured */}
              {!featuredShowResults && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  onClick={dismissFeatured}
                  style={{
                    display: 'block', margin: '16px auto 0', padding: '8px 20px',
                    borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)',
                    background: 'transparent', color: '#64748b',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Skip to regular session
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Energy Bar + Stats ────────────────────────── */}
      <div style={{
        width: '100%', maxWidth: 520, padding: '12px 20px 0', boxSizing: 'border-box',
      }}>
        {/* Energy bar visual */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${energyDisplay < 20 ? 'rgba(255,107,53,0.15)' : 'rgba(57,255,20,0.08)'}`,
          borderRadius: 16, padding: '10px 14px',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Background glow */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: energyDisplay < 20
              ? 'radial-gradient(ellipse at 30% 50%, rgba(255,107,53,0.06) 0%, transparent 70%)'
              : 'radial-gradient(ellipse at 30% 50%, rgba(57,255,20,0.04) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1,
          }}>
            {/* Zap icon */}
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: energyDisplay < 20 ? 'rgba(255,107,53,0.12)' : 'rgba(57,255,20,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Zap size={16} color={energyDisplay < 20 ? '#FF6B35' : '#39FF14'}
                style={energyDisplay < 20 ? { animation: 'energyLowPulse 1.5s ease-in-out infinite' } : {}}
              />
            </div>

            {/* Bar + label */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5,
              }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 0.5, textTransform: 'uppercase',
                }}>Energy</span>
                <span style={{
                  fontSize: 12, fontWeight: 800,
                  color: energyDisplay < 20 ? '#FF6B35' : '#39FF14',
                }}>{energyDisplay}<span style={{ color: '#475569', fontWeight: 600 }}>/{ENERGY_MAX}</span></span>
              </div>
              {/* Bar track */}
              <div style={{
                width: '100%', height: 6, background: 'rgba(255,255,255,0.06)',
                borderRadius: 3, overflow: 'hidden', position: 'relative',
              }}>
                <motion.div
                  animate={{ width: `${(energyDisplay / ENERGY_MAX) * 100}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{
                    height: '100%', borderRadius: 3,
                    background: energyDisplay < 20
                      ? 'linear-gradient(90deg, #FF6B35, #FF2D78)'
                      : 'linear-gradient(90deg, #39FF14, #00D4FF)',
                    boxShadow: energyDisplay < 20
                      ? '0 0 8px rgba(255,107,53,0.4)'
                      : '0 0 8px rgba(57,255,20,0.3)',
                  }}
                />
              </div>
            </div>

            {/* Session stats pills */}
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              {streak > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 3,
                  padding: '4px 8px', borderRadius: 10,
                  background: 'rgba(255,107,53,0.08)',
                  border: '1px solid rgba(255,107,53,0.12)',
                }}>
                  <Flame size={11} color="#FF6B35" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#FF6B35' }}>{streak}</span>
                </div>
              )}
              {totalXpEarned > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 3,
                  padding: '4px 8px', borderRadius: 10,
                  background: 'rgba(0,212,255,0.08)',
                  border: '1px solid rgba(0,212,255,0.12)',
                }}>
                  <Star size={11} color="#00D4FF" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#00D4FF' }}>+{totalXpEarned}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content Area ──────────────────────────── */}
      {completed ? (
        /* ── Completion Screen ─────────────────────────── */
        <motion.div
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', textAlign: 'center', padding: '50px 30px', flex: 1,
            position: 'relative', overflow: 'hidden',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Celebration confetti particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`confetti-${i}`}
              style={{
                position: 'absolute',
                top: 0,
                left: `${5 + Math.random() * 90}%`,
                width: 4 + Math.random() * 6,
                height: i % 3 === 1 ? 3 : 4 + Math.random() * 6,
                borderRadius: i % 3 === 0 ? '50%' : '2px',
                background: ['#00D4FF', '#FF2D78', '#BF5AF2', '#FFE44D', '#39FF14', '#FF6B35'][i % 6],
                boxShadow: `0 0 4px ${['#00D4FF', '#FF2D78', '#BF5AF2', '#FFE44D', '#39FF14', '#FF6B35'][i % 6]}`,
                zIndex: 0,
              }}
              initial={{ y: -20, opacity: 1, rotate: 0 }}
              animate={{ y: 400, opacity: 0, rotate: 720 }}
              transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 1.5, ease: 'easeIn' }}
            />
          ))}

          {/* Trophy with glow */}
          <motion.div
            style={{ position: 'relative', marginBottom: 8, zIndex: 1 }}
            animate={{ rotate: [0, 5, -5, 5, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 1.2, delay: 0.3 }}
          >
            {/* Pulsing glow ring */}
            <motion.div
              style={{
                position: 'absolute', top: '50%', left: '50%',
                width: 100, height: 100, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,212,255,0.2) 0%, transparent 70%)',
                transform: 'translate(-50%, -50%)',
              }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <Trophy size={60} color="#00D4FF" style={{ filter: 'drop-shadow(0 0 20px rgba(0,212,255,0.4))' }} />
          </motion.div>

          <motion.h2
            style={{
              fontSize: 32, fontWeight: 900, margin: '16px 0 8px',
              background: 'linear-gradient(135deg, #00D4FF, #FF2D78, #BF5AF2, #00D4FF)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              position: 'relative', zIndex: 1,
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Session Complete!
          </motion.h2>

          <motion.p
            style={{ fontSize: 15, color: '#94a3b8', margin: '0 0 28px', lineHeight: 1.6, position: 'relative', zIndex: 1 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            You crushed it! Here is a summary of your session.
          </motion.p>

          {/* Stats cards */}
          {[
            { icon: <Award size={22} />, label: `${answeredCount} dilemmas answered`, color: '#00D4FF', delay: 0.4 },
            { icon: <Zap size={22} />, label: `+${totalXpEarned} XP earned${eventMultiplier > 1 ? ` (${eventMultiplier}x event boost!)` : ''}`, color: '#00D4FF', delay: 0.5, highlight: true },
            { icon: <Flame size={22} />, label: `${streak}-day streak maintained`, color: '#FF2D78', delay: 0.6 },
            ...(activeEvent ? [{ icon: <Sparkles size={22} />, label: `${activeEvent.name} — ${activeEvent.multiplier}x XP active`, color: '#FFD700', delay: 0.7 }] : []),
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: stat.delay, duration: 0.4 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: stat.highlight
                  ? `linear-gradient(135deg, ${stat.color}18, ${stat.color}08)`
                  : `linear-gradient(135deg, ${stat.color}0D, ${stat.color}05)`,
                border: `1px solid ${stat.color}${stat.highlight ? '40' : '25'}`,
                borderRadius: 16, padding: '14px 24px',
                marginBottom: 10, fontSize: 16, fontWeight: 700,
                color: stat.color, width: '100%', maxWidth: 320,
                position: 'relative', zIndex: 1,
                boxShadow: stat.highlight ? `0 0 20px ${stat.color}15` : 'none',
              }}
            >
              {stat.icon}
              {stat.label}
            </motion.div>
          ))}

          <motion.button
            onClick={handlePlayAgain}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(0,212,255,0.25)' }}
            whileTap={{ scale: 0.96 }}
            style={{
              marginTop: 24, padding: '16px 48px', borderRadius: 16, border: 'none',
              background: 'linear-gradient(135deg, #00D4FF, #FF2D78)',
              color: '#fff', fontSize: 17, fontWeight: 800, cursor: 'pointer',
              letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: '0 4px 20px rgba(0,212,255,0.2)',
            }}
          >
            <RefreshCw size={18} />
            Play Again
          </motion.button>
        </motion.div>

      ) : loading ? (
        /* ── Loading Skeleton ──────────────────────────── */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <SkeletonCard />
          <div style={{
            display: 'flex', gap: 8, marginTop: 30, alignItems: 'center',
          }}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#00D4FF',
                }}
                animate={{ scale: [0.6, 1, 0.6], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
              />
            ))}
          </div>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 12, fontWeight: 500 }}>Loading dilemmas...</p>
        </div>

      ) : dilemmasList.length === 0 ? (
        /* ── Empty State ───────────────────────────────── */
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', padding: '60px 30px',
          }}
        >
          <div style={{
            width: 120, height: 120, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(191,90,242,0.1))',
            border: '2px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 24, position: 'relative',
          }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              animation: 'ps-glow-ring 3s ease-in-out infinite',
              border: '1px solid rgba(0,212,255,0.2)',
            }} />
            <Target size={48} color="#475569" />
          </div>

          <h2 style={{
            fontSize: 22, fontWeight: 800, color: '#ffffff', margin: '0 0 10px',
          }}>
            No Dilemmas Yet!
          </h2>
          <p style={{
            fontSize: 15, color: '#64748b', margin: '0 0 8px', lineHeight: 1.6, maxWidth: 280,
          }}>
            The arena is being prepared with fresh dilemmas for you to conquer.
          </p>
          <p style={{
            fontSize: 13, color: '#BF5AF2', fontWeight: 600, margin: 0,
          }}>
            Check back soon -- new dilemmas drop daily!
          </p>

          <motion.div
            style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 6, color: '#00D4FF', fontSize: 14, fontWeight: 600 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Clock size={16} />
            Next refresh in a few hours
          </motion.div>
        </motion.div>

      ) : dilemma ? (
        /* ── Dilemma Card ──────────────────────────────── */
        <div style={{
          width: '100%', maxWidth: 520, padding: '0 20px', boxSizing: 'border-box',
          flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          position: 'relative', marginTop: 16,
        }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={dilemma.id}
              custom={direction}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              style={{
                background: `linear-gradient(160deg, ${catTint.from} 0%, rgba(255,255,255,0.03) 40%, ${catTint.to} 100%)`,
                border: isHotStreak ? `2px solid rgba(255,107,53,0.5)` : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 28,
                padding: '28px 22px 24px',
                position: 'relative',
                overflow: 'hidden',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 60px rgba(191,90,242,0.03)',
                animation: isHotStreak ? 'ps-fire-border 1.5s ease-in-out infinite' : 'none',
              }}
            >
              {/* Card ambient glow */}
              <div style={{
                position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
                width: 280, height: 280, borderRadius: '50%',
                background: `radial-gradient(circle, ${catColor}0A 0%, transparent 70%)`,
                pointerEvents: 'none', animation: 'ps-card-idle-glow 4s ease-in-out infinite',
              }} />

              {/* Hot Streak Fire Badge */}
              <AnimatePresence>
                {isHotStreak && !showResults && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    style={{
                      position: 'absolute', top: 12, right: 14, zIndex: 20,
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '5px 12px', borderRadius: 14,
                      background: 'linear-gradient(135deg, rgba(255,107,53,0.2), rgba(255,69,0,0.1))',
                      border: '1px solid rgba(255,107,53,0.4)',
                      boxShadow: '0 0 16px rgba(255,107,53,0.2)',
                    }}
                  >
                    <Flame size={14} color="#FF6B35" style={{ animation: 'ps-streak-fire 1s ease-in-out infinite' }} />
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#FF6B35', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                      Hot Streak {hotStreak}x
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Combo Counter Popup */}
              <AnimatePresence>
                {showCombo && combo >= 1 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0, rotate: -12 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: -30 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    style={{
                      position: 'absolute', top: isHotStreak ? 46 : 12, left: 14, zIndex: 20,
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '5px 14px', borderRadius: 14,
                      background: combo >= 5
                        ? 'linear-gradient(135deg, rgba(255,45,120,0.25), rgba(191,90,242,0.15))'
                        : combo >= 3
                          ? 'linear-gradient(135deg, rgba(0,212,255,0.25), rgba(249,115,22,0.15))'
                          : 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(191,90,242,0.1))',
                      border: `1px solid ${combo >= 5 ? 'rgba(255,45,120,0.5)' : combo >= 3 ? 'rgba(0,212,255,0.5)' : 'rgba(0,212,255,0.4)'}`,
                      boxShadow: `0 0 20px ${combo >= 5 ? 'rgba(255,45,120,0.3)' : combo >= 3 ? 'rgba(0,212,255,0.3)' : 'rgba(0,212,255,0.2)'}`,
                      animation: 'ps-combo-glow 1s ease-in-out infinite',
                    }}
                  >
                    <Zap size={14} color={combo >= 5 ? '#FF2D78' : combo >= 3 ? '#00D4FF' : '#00D4FF'} />
                    <span style={{
                      fontSize: combo >= 5 ? 15 : 13, fontWeight: 900,
                      color: combo >= 5 ? '#FF2D78' : combo >= 3 ? '#00D4FF' : '#00D4FF',
                      letterSpacing: 0.5,
                    }}>
                      {combo + 1}x COMBO!
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Timer Bar */}
              {!showResults && !chosen && (
                <TimerBar isActive={!chosen && !showResults} duration={30} />
              )}

              {/* Category Badge with Emoji */}
              <div style={{ textAlign: 'center', marginBottom: 16, position: 'relative', zIndex: 2 }}>
                <motion.span
                  initial={{ y: -10, opacity: 0, scale: 0.8 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 400 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '6px 16px', borderRadius: 20,
                    fontSize: 12, fontWeight: 800,
                    textTransform: 'uppercase', letterSpacing: 1,
                    background: `${catColor}15`,
                    color: catColor,
                    border: `1px solid ${catColor}35`,
                    boxShadow: `0 0 12px ${catColor}15`,
                  }}
                >
                  <span style={{ fontSize: 14 }}>{CATEGORY_EMOJIS[dilemma.category] || '\u{2728}'}</span>
                  {dilemma.category}
                </motion.span>
              </div>

              {/* Question Text */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                style={{
                  fontSize: 22, fontWeight: 800, color: '#ffffff',
                  textAlign: 'center', lineHeight: 1.4,
                  margin: '0 0 28px', position: 'relative', zIndex: 2,
                  textShadow: '0 2px 20px rgba(0,0,0,0.3)',
                }}
              >
                {dilemma.question}
              </motion.h2>

              {/* ── Voting Cards (pre-answer) ────────────── */}
              {!showResults && (
                <div style={{
                  display: 'flex', gap: 14, alignItems: 'stretch', position: 'relative',
                }}>
                  {/* Option A Card */}
                  <motion.button
                    onMouseEnter={() => setHoverA(true)}
                    onMouseLeave={() => setHoverA(false)}
                    onClick={() => handleChoice('a')}
                    whileTap={{ scale: 0.95 }}
                    animate={
                      chosen === 'a'
                        ? { scale: 1.05, borderColor: '#00D4FF' }
                        : chosen === 'b'
                          ? { opacity: 0.3, scale: 0.93 }
                          : {}
                    }
                    transition={{ duration: 0.3 }}
                    style={{
                      flex: 1, border: '2px solid rgba(0,212,255,0.25)',
                      borderRadius: 20, padding: '24px 14px',
                      cursor: chosen ? 'default' : 'pointer',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      textAlign: 'center', minHeight: 150,
                      background: hoverA && !chosen
                        ? 'linear-gradient(160deg, rgba(0,212,255,0.18) 0%, rgba(0,212,255,0.06) 100%)'
                        : 'linear-gradient(160deg, rgba(0,212,255,0.10) 0%, rgba(0,212,255,0.03) 100%)',
                      boxShadow: hoverA && !chosen
                        ? '0 0 30px rgba(0,212,255,0.2), inset 0 0 20px rgba(0,212,255,0.05)'
                        : 'none',
                      animation: !chosen ? 'ps-pulse-cyan 3s ease-in-out infinite' : 'none',
                      transition: 'background 0.3s, box-shadow 0.3s',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Subtle top gradient line */}
                    <div style={{
                      position: 'absolute', top: 0, left: '20%', right: '20%', height: 2,
                      background: 'linear-gradient(90deg, transparent, #00D4FF, transparent)',
                      borderRadius: 1,
                    }} />

                    <span style={{
                      fontSize: 12, fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase',
                      marginBottom: 10,
                      background: 'linear-gradient(135deg, #00D4FF, #22d3ee)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                      Option A
                    </span>
                    <span style={{
                      fontSize: 16, fontWeight: 700, color: '#ffffff', lineHeight: 1.35,
                    }}>
                      {dilemma.option_a}
                    </span>

                    {/* Hover / swipe hint */}
                    <motion.div
                      animate={{ opacity: hoverA && !chosen ? 1 : 0, y: hoverA ? 0 : 5 }}
                      style={{
                        marginTop: 12,
                        display: 'flex', alignItems: 'center', gap: 4,
                        fontSize: 11, fontWeight: 600, color: '#00D4FF',
                      }}
                    >
                      Tap to choose <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1, repeat: Infinity }}><ChevronRight size={12} /></motion.span>
                    </motion.div>
                  </motion.button>

                  {/* VS Badge */}
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    width: 48, height: 48, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0a0a0f, #13131f)',
                    border: '2px solid rgba(0,212,255,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 10,
                    animation: 'ps-vs-glow 2.5s ease-in-out infinite',
                    fontSize: 14, fontWeight: 900, color: '#00D4FF',
                    letterSpacing: 0.5,
                  }}>
                    VS
                  </div>

                  {/* Option B Card */}
                  <motion.button
                    onMouseEnter={() => setHoverB(true)}
                    onMouseLeave={() => setHoverB(false)}
                    onClick={() => handleChoice('b')}
                    whileTap={{ scale: 0.95 }}
                    animate={
                      chosen === 'b'
                        ? { scale: 1.05, borderColor: '#FF2D78' }
                        : chosen === 'a'
                          ? { opacity: 0.3, scale: 0.93 }
                          : {}
                    }
                    transition={{ duration: 0.3 }}
                    style={{
                      flex: 1, border: '2px solid rgba(255,45,120,0.25)',
                      borderRadius: 20, padding: '24px 14px',
                      cursor: chosen ? 'default' : 'pointer',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      textAlign: 'center', minHeight: 150,
                      background: hoverB && !chosen
                        ? 'linear-gradient(160deg, rgba(255,45,120,0.18) 0%, rgba(191,90,242,0.08) 100%)'
                        : 'linear-gradient(160deg, rgba(255,45,120,0.10) 0%, rgba(191,90,242,0.04) 100%)',
                      boxShadow: hoverB && !chosen
                        ? '0 0 30px rgba(255,45,120,0.2), inset 0 0 20px rgba(255,45,120,0.05)'
                        : 'none',
                      animation: !chosen ? 'ps-pulse-pink 3s ease-in-out infinite' : 'none',
                      transition: 'background 0.3s, box-shadow 0.3s',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Subtle top gradient line */}
                    <div style={{
                      position: 'absolute', top: 0, left: '20%', right: '20%', height: 2,
                      background: 'linear-gradient(90deg, transparent, #FF2D78, transparent)',
                      borderRadius: 1,
                    }} />

                    <span style={{
                      fontSize: 12, fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase',
                      marginBottom: 10,
                      background: 'linear-gradient(135deg, #FF2D78, #BF5AF2)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                      Option B
                    </span>
                    <span style={{
                      fontSize: 16, fontWeight: 700, color: '#ffffff', lineHeight: 1.35,
                    }}>
                      {dilemma.option_b}
                    </span>

                    {/* Hover / swipe hint */}
                    <motion.div
                      animate={{ opacity: hoverB && !chosen ? 1 : 0, y: hoverB ? 0 : 5 }}
                      style={{
                        marginTop: 12,
                        display: 'flex', alignItems: 'center', gap: 4,
                        fontSize: 11, fontWeight: 600, color: '#FF2D78',
                      }}
                    >
                      Tap to choose <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1, repeat: Infinity }}><ChevronRight size={12} /></motion.span>
                    </motion.div>
                  </motion.button>
                </div>
              )}

              {/* ── Results (post-answer) ───────────────── */}
              {showResults && (
                <motion.div
                  style={{ marginTop: 4, position: 'relative' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Celebration Burst */}
                  <CelebrationBurst show={showCelebration} />
                  <ConfettiRain show={showCelebration} />

                  {/* Your choice summary line */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                      textAlign: 'center', marginBottom: 22, fontSize: 13, fontWeight: 600,
                      color: '#94a3b8',
                    }}
                  >
                    You chose{' '}
                    <span style={{
                      fontWeight: 800,
                      color: chosen === 'a' ? '#00D4FF' : '#FF2D78',
                    }}>
                      Option {chosen === 'a' ? 'A' : 'B'}
                    </span>
                    {' '} -- let's see how others voted!
                  </motion.div>

                  <ResultBar
                    label={dilemma.option_a}
                    percentage={pctA}
                    gradientFrom="#00D4FF"
                    gradientTo="#22d3ee"
                    color="#00D4FF"
                    isUserChoice={chosen === 'a'}
                    isWinner={pctA >= pctB}
                    showResults={showResults}
                    letterLabel="A"
                  />
                  <ResultBar
                    label={dilemma.option_b}
                    percentage={pctB}
                    gradientFrom="#FF2D78"
                    gradientTo="#BF5AF2"
                    color="#FF2D78"
                    isUserChoice={chosen === 'b'}
                    isWinner={pctB > pctA}
                    showResults={showResults}
                    letterLabel="B"
                  />

                  {/* "X% agree with you" insight message */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 1.0, type: 'spring', stiffness: 300, damping: 15 }}
                    style={{
                      textAlign: 'center', fontSize: 13, fontWeight: 700,
                      marginTop: 4, marginBottom: 8,
                      padding: '10px 18px', borderRadius: 14,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      animation: 'ps-insight-glow 3s ease-in-out infinite',
                    }}
                  >
                    {(() => {
                      const userPct = chosen === 'a' ? pctA : pctB;
                      if (userPct > 60) return (
                        <span style={{ color: '#00D4FF' }}>
                          <Star size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} color="#00D4FF" />
                          {userPct}% agree with you! You're with the majority!
                        </span>
                      );
                      if (userPct < 40) return (
                        <span style={{ color: '#BF5AF2' }}>
                          <Zap size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} color="#BF5AF2" />
                          Only {userPct}% chose this -- you're in the minority! Bold move!
                        </span>
                      );
                      return (
                        <span style={{ color: '#00D4FF' }}>
                          <Target size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} color="#00D4FF" />
                          {userPct}% agree -- the community is evenly split!
                        </span>
                      );
                    })()}
                  </motion.div>

                  {/* Share Result Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.4 }}
                    whileHover={{
                      scale: 1.03,
                      background: 'linear-gradient(135deg, rgba(191,90,242,0.2), rgba(0,212,255,0.12))',
                      borderColor: 'rgba(191,90,242,0.5)',
                    }}
                    whileTap={{ scale: 0.96 }}
                    onClick={async () => {
                      const ok = await shareContent({
                        title: `Social Dilemma's — ${dilemma.question}`,
                        text: `${dilemma.option_a} or ${dilemma.option_b}? I chose ${chosen === 'a' ? dilemma.option_a : dilemma.option_b}! What would you pick?`,
                        url: window.location.origin,
                      });
                      if (ok && !navigator.share) {
                        setShareCopied(true);
                        setTimeout(() => setShareCopied(false), 2000);
                      }
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      width: '100%', padding: '12px 20px', marginTop: 10,
                      borderRadius: 14,
                      border: '1px solid rgba(191,90,242,0.3)',
                      background: 'linear-gradient(135deg, rgba(191,90,242,0.1), rgba(0,212,255,0.06))',
                      color: '#BF5AF2', fontSize: 14, fontWeight: 700,
                      cursor: 'pointer', letterSpacing: 0.3,
                      transition: 'all 0.25s ease',
                    }}
                  >
                    <Share2 size={16} />
                    {shareCopied ? 'Link Copied!' : 'Share This Result'}
                  </motion.button>

                  {/* +XP float celebration with particles */}
                  <AnimatePresence>
                    {showXp && (
                      <motion.div
                        style={{
                          position: 'absolute', top: -40, left: '50%',
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                          pointerEvents: 'none', zIndex: 20,
                        }}
                        initial={{ opacity: 0, x: '-50%', y: 20, scale: 0.3 }}
                        animate={{ opacity: 1, x: '-50%', y: -50, scale: 1 }}
                        exit={{ opacity: 0, x: '-50%', y: -90, scale: 0.6 }}
                        transition={{ duration: 1.8, ease: 'easeOut' }}
                      >
                        {/* Particle burst */}
                        {[...Array(8)].map((_, i) => (
                          <motion.div
                            key={i}
                            style={{
                              position: 'absolute',
                              width: 6, height: 6, borderRadius: '50%',
                              background: i % 2 === 0 ? '#00D4FF' : '#FF2D78',
                              boxShadow: `0 0 8px ${i % 2 === 0 ? '#00D4FF' : '#FF2D78'}`,
                            }}
                            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                            animate={{
                              x: Math.cos((i * Math.PI) / 4) * 50,
                              y: Math.sin((i * Math.PI) / 4) * 50,
                              opacity: 0,
                              scale: 0,
                            }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                          />
                        ))}
                        {/* Glow ring */}
                        <motion.div
                          style={{
                            position: 'absolute',
                            width: 80, height: 80, borderRadius: '50%',
                            border: '2px solid rgba(0,212,255,0.4)',
                          }}
                          initial={{ scale: 0.3, opacity: 0.8 }}
                          animate={{ scale: 2, opacity: 0 }}
                          transition={{ duration: 0.7, ease: 'easeOut' }}
                        />
                        {/* XP text */}
                        <motion.div
                          style={{
                            fontSize: 32, fontWeight: 900,
                            background: 'linear-gradient(135deg, #00D4FF, #FF2D78, #BF5AF2)',
                            backgroundSize: '200% 100%',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 0 20px rgba(0,212,255,0.6))',
                            letterSpacing: 1.5,
                            textShadow: 'none',
                          }}
                          initial={{ scale: 0.5 }}
                          animate={{ scale: [0.5, 1.3, 1] }}
                          transition={{ duration: 0.5, times: [0, 0.6, 1] }}
                        >
                          +{Math.round(POINTS.answer_dilemma * eventMultiplier)} XP
                        </motion.div>
                        {eventMultiplier > 1 && (
                          <motion.span
                            style={{
                              fontSize: 12, fontWeight: 800, color: '#FFE44D',
                              marginTop: 2, letterSpacing: 0.5,
                              textShadow: '0 0 8px rgba(255,228,77,0.4)',
                            }}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            {eventMultiplier}x EVENT BOOST
                          </motion.span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Next / Finish Button */}
                  <motion.button
                    onClick={handleNext}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.4 }}
                    whileHover={{
                      scale: 1.03,
                      boxShadow: '0 0 40px rgba(0,212,255,0.25), 0 4px 20px rgba(0,212,255,0.15)',
                    }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      width: '100%', marginTop: 20, padding: '16px 24px',
                      borderRadius: 16, border: 'none',
                      background: 'linear-gradient(135deg, #00D4FF, #FF2D78, #00D4FF)',
                      backgroundSize: '200% 100%',
                      color: '#fff', fontSize: 17, fontWeight: 800,
                      cursor: 'pointer', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: 10, letterSpacing: 0.5,
                      boxShadow: '0 4px 20px rgba(0,212,255,0.15)',
                    }}
                  >
                    {currentIndex >= dilemmasList.length - 1 ? (
                      <>
                        <Trophy size={18} />
                        Finish Session
                      </>
                    ) : (
                      <>
                        Next Dilemma
                        <ArrowRight size={18} />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* ── Skip Button ──────────────────────────────── */}
          {!showResults && !chosen && (
            <motion.button
              onClick={handleSkip}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{
                borderColor: 'rgba(255,255,255,0.2)',
                color: '#94a3b8',
                background: 'rgba(255,255,255,0.03)',
              }}
              whileTap={{ scale: 0.95 }}
              style={{
                marginTop: 18, padding: '10px 28px', borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'transparent', color: '#475569',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                alignSelf: 'center', transition: 'all 0.2s',
                letterSpacing: 0.3,
              }}
            >
              <SkipForward size={14} />
              Skip this one
            </motion.button>
          )}
        </div>
      ) : null}

      {/* ── Not Enough Energy Modal ──────────────────────── */}
      <AnimatePresence>
        {showEnergyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 20,
            }}
            onClick={() => setShowEnergyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'linear-gradient(145deg, #0f0f1e, #0a0a18)',
                border: '1px solid rgba(255,107,53,0.2)',
                borderRadius: 24, padding: 32, width: '100%', maxWidth: 380,
                textAlign: 'center',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(255,107,53,0.1)',
                border: '2px solid rgba(255,107,53,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <Zap size={28} color="#FF6B35" />
              </div>

              <h3 style={{
                fontSize: 20, fontWeight: 800, color: '#f0f0f8', margin: '0 0 8px',
              }}>Not Enough Energy</h3>

              <p style={{
                fontSize: 14, color: '#94a3b8', margin: '0 0 20px', lineHeight: 1.5,
              }}>
                You need {ENERGY_PER_PLAY} energy to answer a dilemma.
                You currently have <span style={{ color: '#FF6B35', fontWeight: 700 }}>{energy}</span> energy.
              </p>

              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '10px 16px', borderRadius: 12,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                marginBottom: 20, fontSize: 13, color: '#94a3b8',
              }}>
                <Clock size={14} color="#BF5AF2" />
                <span>Regenerates <span style={{ color: '#BF5AF2', fontWeight: 700 }}>+10/hour</span></span>
              </div>

              <EnergyRegenTimer
                energy={energy}
                user={user}
                regenTimer={regenTimer}
                setRegenTimer={setRegenTimer}
              />

              <button
                onClick={() => { refillEnergy(); setShowEnergyModal(false); }}
                style={{
                  width: '100%', padding: '14px 24px', borderRadius: 14,
                  border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #FF6B35, #FF2D78)',
                  color: '#fff', fontSize: 15, fontWeight: 800,
                  boxShadow: '0 4px 20px rgba(255,107,53,0.25)',
                  marginBottom: 10, letterSpacing: 0.3,
                }}
              >
                Refill Energy (Test)
              </button>

              <button
                onClick={() => setShowEnergyModal(false)}
                style={{
                  width: '100%', padding: '12px 24px', borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'transparent', color: '#94a3b8',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  letterSpacing: 0.3,
                }}
              >
                Come back later
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
