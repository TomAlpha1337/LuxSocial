import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Users, Flame, Trophy, ArrowRight, Sparkles, Crown } from 'lucide-react';
import Mascot from './Mascot';

const GOLD = '#00D4FF';
const GOLD_LIGHT = '#33E0FF';
const PURPLE = '#BF5AF2';
const PINK = '#FF2D78';

const STORAGE_KEY = 'luxsocial_onboarding_done';

const STEPS = [
  {
    icon: Sparkles,
    iconColor: GOLD,
    title: 'Welcome to Social Dilemma\'s!',
    subtitle: 'Choose. Compare. Connect.',
    body: 'Answer fun dilemmas, see how others voted, and climb the leaderboard.',
  },
  {
    icon: Zap,
    iconColor: GOLD,
    title: 'Earn XP & Level Up',
    body: 'Every dilemma you answer earns you XP. Level up to unlock new titles and climb the ranks!',
  },
  {
    icon: Flame,
    iconColor: '#FF6B35',
    title: 'Build Your Streak',
    body: 'Play daily to build your streak. The longer your streak, the bigger your daily bonus — up to 100 XP on day 7!',
  },
  {
    icon: Users,
    iconColor: PURPLE,
    title: 'Connect With Friends',
    body: 'Add friends, send direct dilemmas, and compare your choices. See who thinks like you!',
  },
  {
    icon: Trophy,
    iconColor: PINK,
    title: 'Compete & Collect',
    body: 'Climb the leaderboard, earn badges, and unlock achievements. Your journey starts now!',
  },
];

export default function OnboardingModal() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      // Small delay so the app loads first
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem(STORAGE_KEY, '1');
      setVisible(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  const s = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const Icon = s.icon;
  const mascotMoods = ['waving', 'happy', 'happy', 'thinking', 'excited'];
  const mascotMood = mascotMoods[step] || 'happy';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            padding: 20,
          }}
        >
          <motion.div
            key={step}
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            style={{
              width: '100%',
              maxWidth: 380,
              borderRadius: 28,
              padding: '40px 28px 28px',
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(160deg, rgba(20, 20, 35, 0.98) 0%, rgba(10, 10, 18, 0.99) 100%)',
              border: `1px solid rgba(0, 212, 255, 0.15)`,
              boxShadow: '0 24px 80px rgba(0, 212, 255, 0.12), 0 0 60px rgba(0, 212, 255, 0.04)',
            }}
          >
            {/* Dilly mascot companion */}
            <div style={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              zIndex: 2,
              opacity: 0.85,
              pointerEvents: 'none',
            }}>
              <Mascot mood={mascotMood} size={48} animate={true} />
            </div>

            {/* Ambient glow */}
            <div style={{
              position: 'absolute',
              top: -40,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${s.iconColor}15 0%, transparent 70%)`,
              pointerEvents: 'none',
            }} />

            {/* Step indicator dots */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 28,
              position: 'relative',
              zIndex: 1,
            }}>
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === step ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: i === step
                      ? `linear-gradient(90deg, ${GOLD}, ${PURPLE})`
                      : i < step
                        ? GOLD
                        : 'rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>

            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, delay: 0.1 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${s.iconColor}30, ${s.iconColor}10)`,
                border: `1px solid ${s.iconColor}40`,
                margin: '0 auto 20px',
                boxShadow: `0 0 30px ${s.iconColor}20`,
                position: 'relative',
                zIndex: 1,
              }}
            >
              <Icon size={36} color={s.iconColor} strokeWidth={2} />
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              style={{
                fontSize: 22,
                fontWeight: 900,
                textAlign: 'center',
                margin: '0 0 6px',
                background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 50%, ${GOLD} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: -0.3,
                position: 'relative',
                zIndex: 1,
              }}
            >
              {s.title}
            </motion.h2>

            {/* Subtitle */}
            {s.subtitle && (
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{
                  textAlign: 'center',
                  fontSize: 14,
                  color: PURPLE,
                  fontWeight: 700,
                  margin: '0 0 12px',
                  letterSpacing: 1,
                }}
              >
                {s.subtitle}
              </motion.p>
            )}

            {/* Body */}
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              style={{
                textAlign: 'center',
                fontSize: 15,
                color: '#94a3b8',
                lineHeight: 1.6,
                margin: '0 0 28px',
                fontWeight: 500,
                position: 'relative',
                zIndex: 1,
              }}
            >
              {s.body}
            </motion.p>

            {/* CTA Button */}
            <motion.button
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
              whileHover={{ scale: 1.03, boxShadow: `0 0 40px ${GOLD}30` }}
              whileTap={{ scale: 0.97 }}
              onClick={handleNext}
              style={{
                width: '100%',
                padding: '15px 24px',
                borderRadius: 14,
                border: 'none',
                background: isLast
                  ? `linear-gradient(135deg, ${GOLD}, ${PINK})`
                  : `linear-gradient(135deg, ${GOLD}, ${PURPLE})`,
                color: '#fff',
                fontSize: 16,
                fontWeight: 800,
                cursor: 'pointer',
                letterSpacing: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: `0 4px 20px ${GOLD}25`,
                position: 'relative',
                zIndex: 1,
              }}
            >
              {isLast ? (
                <>
                  <Crown size={18} />
                  Let's Go!
                </>
              ) : (
                <>
                  Next
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>

            {/* Skip button */}
            {!isLast && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={handleSkip}
                style={{
                  width: '100%',
                  marginTop: 10,
                  padding: '10px',
                  background: 'transparent',
                  border: 'none',
                  color: '#475569',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  letterSpacing: 0.3,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                Skip tutorial
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
