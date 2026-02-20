import React from 'react';
import { motion } from 'framer-motion';

// ============================================================
// Dilly — Animated Crystal Mascot Companion
// A cute faceted gem creature with expressive eyes, stubby
// arms, tiny feet, and a glowing crown shard on top.
// ============================================================

const CYAN = '#00D4FF';
const PURPLE = '#BF5AF2';
const PINK = '#FF2D78';
const GOLD = '#FFE44D';

const MOODS = {
  happy: {
    leftEye: { scaleY: 1 },
    rightEye: { scaleY: 1 },
    sparkle: true,
    mouth: 'smile',
    blush: true,
  },
  excited: {
    leftEye: { scaleY: 1.2 },
    rightEye: { scaleY: 1.2 },
    sparkle: true,
    mouth: 'grin',
    star: true,
    blush: true,
    bounce: true,
  },
  sad: {
    leftEye: { scaleY: 0.65, y: 2 },
    rightEye: { scaleY: 0.65, y: 2 },
    sparkle: false,
    mouth: 'frown',
    tear: true,
    blush: false,
    dimBody: true,
  },
  thinking: {
    leftEye: { scaleY: 0.45 },
    rightEye: { scaleY: 1 },
    sparkle: false,
    mouth: 'hmm',
    blush: false,
    tilt: true,
  },
  waving: {
    leftEye: { scaleY: 1 },
    rightEye: { scaleY: 1 },
    sparkle: true,
    mouth: 'smile',
    wave: true,
    blush: true,
  },
};

export default function Mascot({ mood = 'happy', size = 80, message, animate = true }) {
  const m = MOODS[mood] || MOODS.happy;
  const s = size / 80;
  // Unique ID prefix to avoid SVG gradient conflicts when multiple mascots render
  const uid = `dilly-${size}-${mood}`;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6 * s }}>
      <motion.div
        style={{ position: 'relative', width: size, height: size * 1.05 }}
        initial={animate ? { scale: 0, rotate: -10 } : false}
        animate={animate ? {
          scale: 1,
          rotate: m.tilt ? [0, -8, 0] : 0,
          y: m.bounce ? [0, -5 * s, 0, -3 * s, 0] : [0, -3 * s, 0],
        } : { scale: 1 }}
        transition={animate ? {
          scale: { type: 'spring', stiffness: 350, damping: 12 },
          rotate: m.tilt ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.4 },
          y: { duration: m.bounce ? 1.2 : 2.8, repeat: Infinity, ease: 'easeInOut' },
        } : undefined}
      >
        <svg
          viewBox="0 0 80 84"
          width={size}
          height={size * 1.05}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Body gradient — shifts blue when sad */}
            <linearGradient id={`${uid}-body`} x1="15" y1="8" x2="65" y2="75">
              <stop offset="0%" stopColor={m.dimBody ? '#5588AA' : CYAN} />
              <stop offset="45%" stopColor={m.dimBody ? '#4466AA' : '#6B9FFF'} />
              <stop offset="100%" stopColor={m.dimBody ? '#445588' : PURPLE} />
            </linearGradient>
            {/* Inner shine */}
            <radialGradient id={`${uid}-shine`} cx="38%" cy="30%" r="45%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            {/* Aura */}
            <radialGradient id={`${uid}-aura`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={CYAN} stopOpacity="0" />
              <stop offset="55%" stopColor={CYAN} stopOpacity="0.06" />
              <stop offset="100%" stopColor={PURPLE} stopOpacity="0.18" />
            </radialGradient>
            {/* Drop shadow */}
            <filter id={`${uid}-shadow`}>
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor={CYAN} floodOpacity="0.4" />
            </filter>
            {/* Soft glow for crown */}
            <filter id={`${uid}-crownGlow`}>
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── Aura pulse ── */}
          {animate && (
            <motion.circle
              cx="40" cy="44" r="36"
              fill={`url(#${uid}-aura)`}
              animate={{ r: [33, 39, 33], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          {/* ── Ground shadow ── */}
          <ellipse cx="40" cy="79" rx="16" ry="3" fill="rgba(0,0,0,0.25)" />

          {/* ── Feet (tiny rounded nubs) ── */}
          <ellipse cx="33" cy="73" rx="4.5" ry="3" fill={m.dimBody ? '#4466AA' : '#5B7FE0'} opacity="0.85" />
          <ellipse cx="47" cy="73" rx="4.5" ry="3" fill={m.dimBody ? '#3355AA' : '#7B5FE0'} opacity="0.85" />

          {/* ── Crystal body — rounder gem shape ── */}
          <g filter={`url(#${uid}-shadow)`}>
            {/* Main body — rounded hexagonal gem */}
            <path
              d="M40,12 L58,24 L62,44 L55,64 L40,72 L25,64 L18,44 L22,24 Z"
              fill={`url(#${uid}-body)`}
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="0.7"
            />
            {/* Top-left facet highlight */}
            <path
              d="M40,12 L22,24 L18,44 L40,38 Z"
              fill="rgba(255,255,255,0.12)"
            />
            {/* Top-right facet (subtle) */}
            <path
              d="M40,12 L58,24 L62,44 L40,38 Z"
              fill="rgba(255,255,255,0.05)"
            />
            {/* Bottom facet shimmer */}
            <path
              d="M18,44 L40,38 L62,44 L55,64 L40,72 L25,64 Z"
              fill="rgba(0,0,0,0.08)"
            />
            {/* Center facet line */}
            <line x1="40" y1="12" x2="40" y2="72" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
            {/* Horizontal facet line */}
            <line x1="18" y1="44" x2="62" y2="44" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
            {/* Inner shine overlay */}
            <path
              d="M40,14 L57,24 L60,44 L54,63 L40,70 L26,63 L20,44 L23,24 Z"
              fill={`url(#${uid}-shine)`}
            />
          </g>

          {/* ── Crown shard on top ── */}
          <g filter={`url(#${uid}-crownGlow)`}>
            <motion.polygon
              points="40,4 44,14 40,11 36,14"
              fill={GOLD}
              opacity="0.9"
              animate={animate ? { y: [0, -1, 0], opacity: [0.85, 1, 0.85] } : {}}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Tiny side sparkles on crown */}
            <polygon points="36,14 33,10 36,12" fill={GOLD} opacity="0.5" />
            <polygon points="44,14 47,10 44,12" fill={GOLD} opacity="0.5" />
          </g>

          {/* ── Arms ── */}
          {/* Left arm — rounded stub with tiny hand */}
          <motion.g
            animate={m.wave ? {} : (animate ? { rotate: [0, 3, -3, 0] } : {})}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: '22px', originY: '42px' }}
          >
            <motion.path
              d="M20,40 Q12,42 10,48 Q9,50 11,50 Q13,49 14,47"
              stroke={m.dimBody ? '#5588AA' : CYAN}
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              opacity="0.8"
              animate={m.wave ? { d: ['M20,40 Q12,42 10,48 Q9,50 11,50 Q13,49 14,47', 'M20,40 Q10,36 8,30 Q7,28 9,28 Q11,29 12,32', 'M20,40 Q12,42 10,48 Q9,50 11,50 Q13,49 14,47'] } : {}}
              transition={m.wave ? { duration: 0.7, repeat: Infinity, ease: 'easeInOut' } : undefined}
            />
          </motion.g>
          {/* Right arm */}
          <motion.g
            animate={animate && !m.wave ? { rotate: [0, -3, 3, 0] } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            style={{ originX: '58px', originY: '42px' }}
          >
            <motion.path
              d="M60,40 Q68,42 70,48 Q71,50 69,50 Q67,49 66,47"
              stroke={m.dimBody ? '#445588' : PURPLE}
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              opacity="0.8"
              animate={m.wave ? { d: ['M60,40 Q68,42 70,48 Q71,50 69,50 Q67,49 66,47', 'M60,40 Q70,36 72,30 Q73,28 71,28 Q69,29 68,32', 'M60,40 Q68,42 70,48 Q71,50 69,50 Q67,49 66,47'] } : {}}
              transition={m.wave ? { duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: 0.1 } : undefined}
            />
          </motion.g>

          {/* ── Eyes ── */}
          <g>
            {/* Eye white bg (left) */}
            <motion.ellipse
              cx="33" cy="36" rx="5" ry="5.5"
              fill="#fff"
              animate={m.leftEye}
              transition={{ duration: 0.3 }}
            />
            {/* Pupil (left) */}
            <motion.circle
              cx="33.5" cy="36" r="2.8"
              fill="#1a1a2e"
              animate={m.leftEye}
              transition={{ duration: 0.3 }}
            />
            {/* Iris ring */}
            <circle cx="33.5" cy="36" r="2.8" fill="none" stroke={CYAN} strokeWidth="0.4" opacity="0.4" />
            {/* Sparkle highlight */}
            {m.sparkle && (
              <>
                <circle cx="35" cy="34.5" r="1.1" fill="#fff" opacity="0.95" />
                <circle cx="32" cy="37.5" r="0.5" fill="#fff" opacity="0.6" />
              </>
            )}

            {/* Eye white bg (right) */}
            <motion.ellipse
              cx="47" cy="36" rx="5" ry="5.5"
              fill="#fff"
              animate={m.rightEye}
              transition={{ duration: 0.3 }}
            />
            {/* Pupil (right) */}
            <motion.circle
              cx="47.5" cy="36" r="2.8"
              fill="#1a1a2e"
              animate={m.rightEye}
              transition={{ duration: 0.3 }}
            />
            {/* Iris ring */}
            <circle cx="47.5" cy="36" r="2.8" fill="none" stroke={PURPLE} strokeWidth="0.4" opacity="0.4" />
            {/* Sparkle highlight */}
            {m.sparkle && (
              <>
                <circle cx="49" cy="34.5" r="1.1" fill="#fff" opacity="0.95" />
                <circle cx="46" cy="37.5" r="0.5" fill="#fff" opacity="0.6" />
              </>
            )}

            {/* Animated blink (periodic) */}
            {animate && !m.star && (
              <motion.rect
                x="26" y="33" width="28" height="7" rx="3"
                fill={`url(#${uid}-body)`}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                style={{ originY: '36px' }}
              />
            )}

            {/* Star eyes for excited */}
            {m.star && (
              <>
                <motion.text
                  x="33.5" y="38.5" fontSize="8" fill={GOLD} textAnchor="middle" fontWeight="bold"
                  animate={{ scale: [1, 1.25, 1], rotate: [0, 15, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >&#9733;</motion.text>
                <motion.text
                  x="47.5" y="38.5" fontSize="8" fill={GOLD} textAnchor="middle" fontWeight="bold"
                  animate={{ scale: [1, 1.25, 1], rotate: [0, -15, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                >&#9733;</motion.text>
              </>
            )}

            {/* Sad tears — two drips */}
            {m.tear && (
              <>
                <motion.ellipse
                  cx="28" cy="42" rx="1.2" ry="2"
                  fill="#88CCFF" opacity="0.8"
                  animate={{ y: [0, 6, 0], opacity: [0.8, 0, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.ellipse
                  cx="52" cy="42" rx="1.2" ry="2"
                  fill="#88CCFF" opacity="0.6"
                  animate={{ y: [0, 6, 0], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                />
              </>
            )}
          </g>

          {/* ── Blush cheeks ── */}
          {m.blush && (
            <>
              <ellipse cx="25" cy="42" rx="3.5" ry="2" fill={PINK} opacity="0.15" />
              <ellipse cx="55" cy="42" rx="3.5" ry="2" fill={PINK} opacity="0.15" />
            </>
          )}

          {/* ── Mouth ── */}
          <g>
            {m.mouth === 'smile' && (
              <path d="M36,48 Q40,53 44,48" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            )}
            {m.mouth === 'grin' && (
              <>
                <path d="M34,47 Q40,56 46,47" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="rgba(255,255,255,0.12)" />
                {/* Tongue hint */}
                <ellipse cx="40" cy="52" rx="2.5" ry="1.5" fill="#FF8FAA" opacity="0.6" />
              </>
            )}
            {m.mouth === 'frown' && (
              <path d="M35,52 Q40,47 45,52" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            )}
            {m.mouth === 'hmm' && (
              <>
                <line x1="36" y1="50" x2="44" y2="49" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
                {/* Thinking dots */}
                {animate && (
                  <motion.g
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <circle cx="60" cy="28" r="1.5" fill="#fff" opacity="0.4" />
                    <circle cx="64" cy="22" r="2" fill="#fff" opacity="0.3" />
                    <circle cx="66" cy="15" r="2.5" fill="#fff" opacity="0.2" />
                  </motion.g>
                )}
              </>
            )}
          </g>

          {/* ── Sparkle particles ── */}
          {animate && m.sparkle && (
            <>
              <motion.g animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} style={{ originX: '40px', originY: '42px' }}>
                <motion.path d="M10,18 L11.5,21 L10,20 L8.5,21 Z" fill="#fff"
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }} />
              </motion.g>
              <motion.g animate={{ rotate: -360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} style={{ originX: '40px', originY: '42px' }}>
                <motion.path d="M68,22 L69.5,25 L68,24 L66.5,25 Z" fill={CYAN}
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.8 }} />
              </motion.g>
              <motion.path d="M20,68 L21.5,71 L20,70 L18.5,71 Z" fill={PURPLE}
                animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1.4 }} />
              <motion.path d="M60,66 L61.5,69 L60,68 L58.5,69 Z" fill={PINK}
                animate={{ opacity: [0, 0.7, 0], scale: [0.5, 1, 0.5] }}
                transition={{ duration: 2.2, repeat: Infinity, delay: 0.4 }} />
            </>
          )}

          {/* ── Excited burst particles ── */}
          {animate && m.bounce && (
            <>
              {[0, 60, 120, 180, 240, 300].map((angle, i) => {
                const rad = (angle * Math.PI) / 180;
                const cx = 40 + Math.cos(rad) * 32;
                const cy = 42 + Math.sin(rad) * 32;
                return (
                  <motion.circle
                    key={angle} cx={cx} cy={cy} r="1.2"
                    fill={[CYAN, GOLD, PINK, PURPLE, '#39FF14', '#FF6B35'][i]}
                    animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                  />
                );
              })}
            </>
          )}
        </svg>
      </motion.div>

      {/* ── Speech bubble ── */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 280, damping: 18 }}
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(15, 15, 30, 0.9), rgba(20, 15, 35, 0.9))',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 212, 255, 0.25)',
            borderRadius: 14 * s,
            padding: `${8 * s}px ${12 * s}px`,
            maxWidth: size * 3,
            textAlign: 'center',
            fontSize: Math.max(11, 12 * s),
            fontWeight: 600,
            color: '#e0e0f0',
            lineHeight: 1.4,
            boxShadow: '0 6px 24px rgba(0, 0, 0, 0.35), 0 0 12px rgba(0, 212, 255, 0.08)',
          }}
        >
          {/* Bubble arrow */}
          <div style={{
            position: 'absolute',
            top: -6 * s,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: `${6 * s}px solid transparent`,
            borderRight: `${6 * s}px solid transparent`,
            borderBottom: `${6 * s}px solid rgba(15, 15, 30, 0.9)`,
          }} />
          {message}
        </motion.div>
      )}
    </div>
  );
}
