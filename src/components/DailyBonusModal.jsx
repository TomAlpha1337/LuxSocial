import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Check, Flame, Star, Crown, Sparkles, X, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ── Color tokens ────────────────────────────────────────────
const GOLD = '#00D4FF';
const GOLD_LIGHT = '#33E0FF';
const PURPLE = '#BF5AF2';
const CYAN = '#00D4FF';
const PINK = '#FF2D78';

// ── Inject keyframes ────────────────────────────────────────
const KEYFRAMES_ID = 'daily-bonus-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(KEYFRAMES_ID)) {
  const style = document.createElement('style');
  style.id = KEYFRAMES_ID;
  style.textContent = `
    @keyframes db-float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }
    @keyframes db-shine {
      0% { left: -100%; }
      100% { left: 200%; }
    }
    @keyframes db-pulse-gold {
      0%, 100% { box-shadow: 0 0 20px rgba(0,212,255,0.2), 0 0 40px rgba(0,212,255,0.1); }
      50% { box-shadow: 0 0 30px rgba(0,212,255,0.4), 0 0 60px rgba(0,212,255,0.2); }
    }
    @keyframes db-sparkle {
      0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
      50% { opacity: 1; transform: scale(1) rotate(180deg); }
    }
    @keyframes db-coin-spin {
      0% { transform: rotateY(0deg); }
      100% { transform: rotateY(360deg); }
    }
    @keyframes db-confetti-drift {
      0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
      100% { transform: translateY(120px) rotate(720deg); opacity: 0; }
    }
    @keyframes db-counter-pop {
      0% { transform: scale(0.5); opacity: 0; }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes db-glow-ring {
      0% { transform: scale(0.8); opacity: 0.6; }
      50% { transform: scale(1.3); opacity: 0.15; }
      100% { transform: scale(1.6); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

// ── Confetti particles ──────────────────────────────────────
function Confetti() {
  const pieces = Array.from({ length: 30 }, (_, i) => {
    const colors = [GOLD, CYAN, PINK, PURPLE, '#10b981', '#f97316'];
    return {
      id: i,
      color: colors[i % colors.length],
      left: `${5 + Math.random() * 90}%`,
      delay: Math.random() * 1.5,
      duration: 2 + Math.random() * 2,
      size: 4 + Math.random() * 6,
      shape: i % 3,
    };
  });

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: 300, opacity: 0, rotate: 720 }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          style={{
            position: 'absolute',
            top: 0,
            left: p.left,
            width: p.size,
            height: p.shape === 1 ? p.size * 0.4 : p.size,
            borderRadius: p.shape === 0 ? '50%' : p.shape === 1 ? '1px' : '2px',
            background: p.color,
            boxShadow: `0 0 4px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
}

// ── Sparkle dots ────────────────────────────────────────────
function SparkleField() {
  const sparkles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    top: `${10 + Math.random() * 80}%`,
    left: `${5 + Math.random() * 90}%`,
    delay: Math.random() * 2,
    size: 3 + Math.random() * 4,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      {sparkles.map((s) => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: GOLD,
            animation: `db-sparkle 2s ease-in-out ${s.delay}s infinite`,
            boxShadow: `0 0 6px ${GOLD}`,
          }}
        />
      ))}
    </div>
  );
}

// ── Week Calendar Row ───────────────────────────────────────
function WeekCalendar({ weekDays }) {
  return (
    <div style={{
      display: 'flex',
      gap: 6,
      justifyContent: 'center',
      padding: '16px 0 8px',
    }}>
      {weekDays.map((d, i) => {
        const isCompleted = d.completed;
        const isToday = d.isToday;
        const isFuture = !isCompleted && !isToday;
        const isDay7 = i === 6;

        return (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 400 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              minWidth: 40,
            }}
          >
            {/* Day label — uses actual day of week from data */}
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              color: isToday ? GOLD : '#64748b',
              letterSpacing: 0.5,
            }}>
              {d.label || `D${i + 1}`}
            </span>

            {/* Day circle */}
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              background: isCompleted
                ? `linear-gradient(135deg, ${GOLD}, ${PINK})`
                : isToday
                  ? `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`
                  : 'rgba(255,255,255,0.04)',
              border: isToday
                ? `2px solid ${GOLD}`
                : isCompleted
                  ? '2px solid transparent'
                  : '1px solid rgba(255,255,255,0.08)',
              boxShadow: isToday
                ? `0 0 16px rgba(0,212,255,0.4), 0 0 32px rgba(0,212,255,0.15)`
                : isCompleted
                  ? `0 0 8px rgba(0,212,255,0.2)`
                  : 'none',
              animation: isToday ? 'db-pulse-gold 2s ease-in-out infinite' : 'none',
            }}>
              {/* Glow ring for today */}
              {isToday && (
                <div style={{
                  position: 'absolute',
                  inset: -4,
                  borderRadius: '50%',
                  border: `1px solid ${GOLD}40`,
                  animation: 'db-glow-ring 2s ease-in-out infinite',
                }} />
              )}

              {isCompleted ? (
                <Check size={16} color="#fff" strokeWidth={3} />
              ) : isToday ? (
                <motion.div
                  animate={{ rotateY: [0, 360] }}
                  transition={{ duration: 2, delay: 1, repeat: Infinity, repeatDelay: 3 }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {isDay7 ? (
                    <Crown size={16} color="#fff" strokeWidth={2.5} />
                  ) : (
                    <Star size={14} color="#fff" strokeWidth={2.5} />
                  )}
                </motion.div>
              ) : isFuture ? (
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: isDay7 ? '#BF5AF2' : '#475569',
                }}>
                  {isDay7 ? (
                    <Crown size={12} color="#BF5AF2" />
                  ) : (
                    <Gift size={12} color="#475569" />
                  )}
                </span>
              ) : null}
            </div>

            {/* XP label */}
            <span style={{
              fontSize: 9,
              fontWeight: 800,
              color: isCompleted || isToday ? GOLD : isDay7 ? '#BF5AF2' : '#475569',
              letterSpacing: 0.3,
            }}>
              +{d.xp}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Main Modal Component ────────────────────────────────────
export default function DailyBonusModal() {
  const { dailyBonusInfo, dismissDailyBonus, streakMilestone, dismissStreakMilestone } = useAuth();
  const [showXpCounter, setShowXpCounter] = useState(false);
  const [phase, setPhase] = useState('bonus'); // 'bonus' | 'milestone'

  // Show XP counter with delay for dramatic effect
  useEffect(() => {
    if (dailyBonusInfo) {
      const timer = setTimeout(() => setShowXpCounter(true), 800);
      return () => clearTimeout(timer);
    }
    setShowXpCounter(false);
  }, [dailyBonusInfo]);

  const handleDismiss = () => {
    if (phase === 'bonus' && streakMilestone) {
      setPhase('milestone');
    } else {
      dismissDailyBonus();
      dismissStreakMilestone();
      setPhase('bonus');
    }
  };

  const isVisible = !!dailyBonusInfo || (phase === 'milestone' && !!streakMilestone);

  if (!isVisible) return null;

  const showMilestone = phase === 'milestone' && streakMilestone;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            padding: 20,
          }}
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 380,
              borderRadius: 28,
              padding: '32px 24px 24px',
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(160deg, rgba(20, 20, 35, 0.98) 0%, rgba(10, 10, 18, 0.99) 100%)',
              border: showMilestone
                ? '1px solid rgba(191, 90, 242, 0.3)'
                : '1px solid rgba(0, 212, 255, 0.2)',
              boxShadow: showMilestone
                ? '0 24px 80px rgba(191, 90, 242, 0.2), 0 0 60px rgba(191, 90, 242, 0.08)'
                : '0 24px 80px rgba(0, 212, 255, 0.15), 0 0 60px rgba(0, 212, 255, 0.05)',
            }}
          >
            {/* Confetti */}
            <Confetti />
            <SparkleField />

            {/* Close button */}
            <button
              onClick={handleDismiss}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10,
                color: '#64748b',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.color = '#64748b';
              }}
            >
              <X size={16} />
            </button>

            {/* ── Milestone View ──────────────────── */}
            {showMilestone ? (
              <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                {/* Big emoji */}
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                  style={{ fontSize: 64, marginBottom: 8, filter: 'drop-shadow(0 0 20px rgba(191,90,242,0.4))' }}
                >
                  {streakMilestone.emoji}
                </motion.div>

                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    fontSize: 26,
                    fontWeight: 900,
                    margin: '0 0 6px',
                    background: `linear-gradient(135deg, ${PURPLE}, ${PINK})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Streak Milestone!
                </motion.h2>

                <motion.p
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  style={{ fontSize: 15, color: '#94a3b8', margin: '0 0 16px', fontWeight: 600 }}
                >
                  {streakMilestone.label} -- {streakMilestone.day}-day streak!
                </motion.p>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring', stiffness: 400 }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '14px 28px',
                    borderRadius: 16,
                    background: `linear-gradient(135deg, ${PURPLE}22, ${PINK}15)`,
                    border: `1px solid ${PURPLE}44`,
                    fontSize: 28,
                    fontWeight: 900,
                    color: PURPLE,
                  }}
                >
                  <Zap size={24} color={PURPLE} />
                  +{streakMilestone.xp} XP
                </motion.div>

                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDismiss}
                  style={{
                    width: '100%',
                    marginTop: 20,
                    padding: '14px 24px',
                    borderRadius: 14,
                    border: 'none',
                    background: `linear-gradient(135deg, ${PURPLE}, ${PINK})`,
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 800,
                    cursor: 'pointer',
                    letterSpacing: 0.5,
                  }}
                >
                  Amazing!
                </motion.button>
              </div>
            ) : dailyBonusInfo ? (
              /* ── Daily Bonus View ──────────────── */
              <div style={{ position: 'relative', zIndex: 2 }}>
                {/* Header icon */}
                <div style={{ textAlign: 'center', marginBottom: 4 }}>
                  <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 400, delay: 0.15 }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${GOLD}, ${PINK})`,
                      boxShadow: `0 0 30px rgba(0,212,255,0.3), 0 8px 24px rgba(0,212,255,0.15)`,
                      animation: 'db-float 3s ease-in-out infinite',
                      position: 'relative',
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      inset: -6,
                      borderRadius: '50%',
                      border: `1px solid ${GOLD}30`,
                      animation: 'db-glow-ring 2s ease-in-out infinite',
                    }} />
                    <Gift size={32} color="#fff" strokeWidth={2.2} />
                  </motion.div>
                </div>

                {/* Title */}
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    textAlign: 'center',
                    margin: '12px 0 4px',
                    background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 50%, ${GOLD} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: -0.3,
                  }}
                >
                  Daily Login Bonus!
                </motion.h2>

                {/* Subtitle */}
                <motion.p
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  style={{
                    textAlign: 'center',
                    fontSize: 14,
                    color: '#94a3b8',
                    margin: '0 0 6px',
                    fontWeight: 500,
                  }}
                >
                  Day <span style={{ color: GOLD, fontWeight: 800 }}>{dailyBonusInfo.streakDay}</span> of your weekly streak
                </motion.p>

                {/* Streak info */}
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    marginBottom: 12,
                  }}
                >
                  <Flame size={16} color="#FF6B35" />
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#FF6B35' }}>
                    {dailyBonusInfo.consecutiveDays}-day streak
                  </span>
                </motion.div>

                {/* Week Calendar */}
                <WeekCalendar weekDays={dailyBonusInfo.weekDays} />

                {/* XP Earned Banner */}
                <AnimatePresence>
                  {showXpCounter && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        margin: '16px 0',
                        padding: '16px 24px',
                        borderRadius: 18,
                        background: `linear-gradient(135deg, ${GOLD}15, ${GOLD}08)`,
                        border: `1px solid ${GOLD}30`,
                        boxShadow: `0 0 20px ${GOLD}15`,
                      }}
                    >
                      <Sparkles size={22} color={GOLD} />
                      <span style={{
                        fontSize: 32,
                        fontWeight: 900,
                        background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: 1,
                      }}>
                        +{dailyBonusInfo.bonusXp} XP
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* CTA Button */}
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.0 }}
                  whileHover={{ scale: 1.03, boxShadow: `0 0 40px rgba(0,212,255,0.3)` }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDismiss}
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    borderRadius: 14,
                    border: 'none',
                    background: `linear-gradient(135deg, ${GOLD}, ${PINK})`,
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 800,
                    cursor: 'pointer',
                    letterSpacing: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: `0 4px 20px rgba(0,212,255,0.2)`,
                  }}
                >
                  <Zap size={18} />
                  {streakMilestone ? 'Next: Streak Milestone!' : 'Claim & Play!'}
                </motion.button>

                {/* Keep it going hint */}
                {dailyBonusInfo.streakDay < 7 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    style={{
                      textAlign: 'center',
                      fontSize: 12,
                      color: '#64748b',
                      marginTop: 12,
                      fontWeight: 500,
                    }}
                  >
                    Come back tomorrow for <span style={{ color: GOLD, fontWeight: 700 }}>
                      +{dailyBonusInfo.weekDays[dailyBonusInfo.streakDay]?.xp || '?'} XP
                    </span>!
                    {dailyBonusInfo.streakDay < 6 && (
                      <span style={{ color: '#475569' }}> Day 7 = <span style={{ color: PURPLE }}>100 XP bonus</span>!</span>
                    )}
                  </motion.p>
                )}
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
