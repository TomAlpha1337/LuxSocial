import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Zap, Shield, Users, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../services/api';

// ── Keyframes injected once ────────────────────────────────
const keyframesId = 'lux-login-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(keyframesId)) {
  const style = document.createElement('style');
  style.id = keyframesId;
  style.textContent = `
    @keyframes luxBgShift {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes luxPulse {
      0%, 100% { opacity: 0.35; transform: translate(-50%, -50%) scale(1); }
      50%      { opacity: 0.65; transform: translate(-50%, -50%) scale(1.2); }
    }
    @keyframes luxFadeIn {
      from { opacity: 0; transform: translateY(24px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes floatOrb1 {
      0%   { transform: translate(0, 0) scale(1); }
      25%  { transform: translate(60px, -40px) scale(1.1); }
      50%  { transform: translate(-20px, -80px) scale(0.95); }
      75%  { transform: translate(-60px, -20px) scale(1.05); }
      100% { transform: translate(0, 0) scale(1); }
    }
    @keyframes floatOrb2 {
      0%   { transform: translate(0, 0) scale(1); }
      25%  { transform: translate(-50px, 30px) scale(1.15); }
      50%  { transform: translate(30px, 60px) scale(0.9); }
      75%  { transform: translate(50px, -30px) scale(1.1); }
      100% { transform: translate(0, 0) scale(1); }
    }
    @keyframes floatOrb3 {
      0%   { transform: translate(0, 0) scale(1); }
      33%  { transform: translate(40px, 50px) scale(1.08); }
      66%  { transform: translate(-40px, -30px) scale(0.92); }
      100% { transform: translate(0, 0) scale(1); }
    }
    @keyframes sparkle {
      0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
      50%      { opacity: 1; transform: scale(1) rotate(180deg); }
    }
    @keyframes logoGlow {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes btnShimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes pulseRing {
      0%   { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
      100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
    }
    @keyframes subtleBounce {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-3px); }
    }
    @keyframes socialProofFade {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes loginDotGrid {
      0%   { background-position: 0 0; }
      100% { background-position: 32px 32px; }
    }
    @keyframes socialProofCycle {
      0%, 28%   { opacity: 1; transform: translateY(0); }
      33%, 38%  { opacity: 0; transform: translateY(-8px); }
      43%, 95%  { opacity: 1; transform: translateY(0); }
      100%      { opacity: 0; transform: translateY(-8px); }
    }
    @keyframes subtitleShine {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes livePulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50%      { transform: scale(1.4); opacity: 0.6; }
    }
  `;
  document.head.appendChild(style);
}

// ── Styles ─────────────────────────────────────────────────
const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0b1a 25%, #120e1f 50%, #0d0b1a 75%, #0a0a0f 100%)',
    backgroundSize: '400% 400%',
    animation: 'luxBgShift 20s ease infinite',
    fontFamily: "'Inter', sans-serif",
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
  },
  // Floating background orbs
  bgOrb1: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    width: 300,
    height: 300,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(191,90,242,0.15) 0%, transparent 70%)',
    filter: 'blur(60px)',
    animation: 'floatOrb1 18s ease-in-out infinite',
    pointerEvents: 'none',
    zIndex: 0,
  },
  bgOrb2: {
    position: 'absolute',
    bottom: '10%',
    right: '5%',
    width: 350,
    height: 350,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%)',
    filter: 'blur(60px)',
    animation: 'floatOrb2 22s ease-in-out infinite',
    pointerEvents: 'none',
    zIndex: 0,
  },
  bgOrb3: {
    position: 'absolute',
    top: '60%',
    left: '50%',
    width: 250,
    height: 250,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%)',
    filter: 'blur(50px)',
    animation: 'floatOrb3 15s ease-in-out infinite',
    pointerEvents: 'none',
    zIndex: 0,
  },
  // Floating particles
  particle: {
    position: 'absolute',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: 0,
  },
  // Sparkle elements
  sparkle: {
    position: 'absolute',
    width: 4,
    height: 4,
    background: '#FF2D78',
    borderRadius: '50%',
    boxShadow: '0 0 6px 2px rgba(255,45,120,0.6)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    position: 'relative',
    zIndex: 1,
    animation: 'luxFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 24,
    padding: '40px 32px 36px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 80px rgba(191,90,242,0.05), 0 0 80px rgba(0,212,255,0.05)',
  },
  logoWrap: {
    textAlign: 'center',
    marginBottom: 36,
    position: 'relative',
  },
  orb: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 200,
    height: 200,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,212,255,0.2) 0%, rgba(191,90,242,0.1) 40%, transparent 70%)',
    filter: 'blur(35px)',
    animation: 'luxPulse 4s ease-in-out infinite',
    pointerEvents: 'none',
    zIndex: 0,
  },
  pulseRing: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 120,
    height: 120,
    borderRadius: '50%',
    border: '1px solid rgba(0,212,255,0.15)',
    animation: 'pulseRing 3s ease-out infinite',
    pointerEvents: 'none',
    zIndex: 0,
  },
  logoIcon: {
    fontSize: 32,
    marginBottom: 8,
    display: 'block',
    animation: 'subtleBounce 2s ease-in-out infinite',
  },
  logo: {
    fontSize: 42,
    fontWeight: 800,
    background: 'linear-gradient(135deg, #00D4FF 0%, #BF5AF2 30%, #00D4FF 60%, #00D4FF 100%)',
    backgroundSize: '300% 100%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: 'logoGlow 4s ease-in-out infinite',
    letterSpacing: '-0.5px',
    position: 'relative',
    zIndex: 1,
    margin: 0,
    textShadow: 'none',
  },
  tagline: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    marginTop: 10,
    letterSpacing: 3,
    textTransform: 'uppercase',
    position: 'relative',
    zIndex: 1,
    fontWeight: 500,
  },
  socialProof: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 28,
    animation: 'socialProofFade 1s ease-out 0.4s both',
  },
  socialProofDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#39FF14',
    boxShadow: '0 0 8px rgba(57,255,20,0.6)',
    display: 'inline-block',
  },
  socialProofText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: 500,
    letterSpacing: 0.3,
  },
  socialProofCount: {
    color: '#00D4FF',
    fontWeight: 700,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  fieldWrap: {
    position: 'relative',
  },
  icon: {
    position: 'absolute',
    left: 16,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'rgba(191,90,242,0.6)',
    pointerEvents: 'none',
    transition: 'color 0.3s',
    zIndex: 2,
  },
  iconFocused: {
    color: '#00D4FF',
  },
  input: {
    width: '100%',
    padding: '16px 48px 16px 46px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
    color: '#fff',
    fontSize: 15,
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    transition: 'border-color 0.3s, box-shadow 0.3s, background 0.3s',
    boxSizing: 'border-box',
    letterSpacing: 0.2,
  },
  inputFocus: {
    borderColor: 'rgba(0,212,255,0.5)',
    boxShadow: '0 0 0 3px rgba(0,212,255,0.08), 0 0 20px rgba(0,212,255,0.06)',
    background: 'rgba(255,255,255,0.06)',
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.3)',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.2s',
    borderRadius: 6,
    zIndex: 2,
  },
  submitBtn: {
    width: '100%',
    padding: '17px 0',
    border: 'none',
    borderRadius: 14,
    background: 'linear-gradient(135deg, #00D4FF 0%, #FF2D78 30%, #BF5AF2 60%, #00D4FF 100%)',
    backgroundSize: '300% 100%',
    animation: 'btnShimmer 3s linear infinite',
    color: '#fff',
    fontSize: 16,
    fontWeight: 700,
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    letterSpacing: '0.5px',
    boxShadow: '0 4px 20px rgba(0,212,255,0.25), 0 0 40px rgba(0,212,255,0.1)',
    textTransform: 'uppercase',
    position: 'relative',
    overflow: 'hidden',
  },
  submitBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    animation: 'none',
    boxShadow: 'none',
  },
  error: {
    background: 'rgba(255,60,60,0.06)',
    border: '1px solid rgba(255,60,60,0.2)',
    borderRadius: 12,
    padding: '12px 16px',
    color: '#ff6b6b',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 4,
    backdropFilter: 'blur(10px)',
  },
  dividerWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    margin: '4px 0',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
  },
  dividerText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: 600,
  },
  footer: {
    textAlign: 'center',
    marginTop: 28,
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
  },
  link: {
    color: '#00D4FF',
    textDecoration: 'none',
    fontWeight: 600,
    marginLeft: 4,
    transition: 'color 0.2s, text-shadow 0.2s',
  },
  ctaWrap: {
    textAlign: 'center',
    marginTop: 20,
    animation: 'socialProofFade 1s ease-out 0.6s both',
  },
  ctaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 0.5,
  },
  ctaEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  // Animated dot grid overlay
  dotGrid: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none',
    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
    backgroundSize: '32px 32px',
    animation: 'loginDotGrid 30s linear infinite',
    opacity: 0.7,
  },
  // Enhanced subtitle / tagline
  subtitle: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 15,
    marginTop: 6,
    letterSpacing: 1,
    position: 'relative',
    zIndex: 1,
    fontWeight: 600,
    background: 'linear-gradient(90deg, rgba(255,255,255,0.55) 0%, #00D4FF 50%, rgba(255,255,255,0.55) 100%)',
    backgroundSize: '200% 100%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: 'subtitleShine 4s ease-in-out infinite',
  },
  // Dynamic social proof wrapper
  socialProofDynamic: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
    animation: 'socialProofFade 1s ease-out 0.4s both',
  },
  socialProofRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  socialProofLiveDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#39FF14',
    boxShadow: '0 0 8px rgba(57,255,20,0.6)',
    display: 'inline-block',
    animation: 'livePulse 2s ease-in-out infinite',
  },
  socialProofMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 2,
  },
  socialProofMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: 600,
  },
};

export default function LoginScreen() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  // Cycling social proof messages
  const socialProofMessages = [
    { text: <>Join <span style={s.socialProofCount}>2,400+</span> players worldwide</>, icon: <Users size={13} color="#39FF14" /> },
    { text: <><span style={s.socialProofCount}>847</span> dilemmas answered today</>, icon: <Zap size={13} color="#00D4FF" /> },
    { text: <><span style={s.socialProofCount}>156</span> players online right now</>, icon: <Shield size={13} color="#BF5AF2" /> },
    { text: <>Season 1 rankings are <span style={s.socialProofCount}>LIVE</span></>, icon: <Trophy size={13} color="#00D4FF" /> },
  ];
  const [proofIndex, setProofIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProofIndex((prev) => (prev + 1) % socialProofMessages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await auth.signIn(email, password);
      const user = res?.user || res?.data?.user || res;

      if (!user || !user.id) {
        throw new Error('Invalid email or password.');
      }

      // Resolve app profile (integer ID) from users table by email
      let appUser = user;
      try {
        const profile = await auth.getByEmail(user.email || email);
        if (profile && profile.id) {
          appUser = { ...user, ...profile, authId: user.id, email: user.email || email };
        } else {
          // Create app profile if it doesn't exist
          await auth.createProfile({
            username: user.name || user.email?.split('@')[0] || 'user',
            email: user.email || email,
            role: 'user',
            xp: 0,
            level: 1,
            current_streak: 0,
            best_streak: 0,
            season_points: 0,
            total_points: 0,
            record_status: 'active',
            profile_visibility: 'public',
          });
          // Fetch the newly created profile to get integer id
          const newProfile = await auth.getByEmail(user.email || email);
          if (newProfile && newProfile.id) {
            appUser = { ...user, ...newProfile, authId: user.id, email: user.email || email };
          }
        }
      } catch (err) {
        console.warn('[NCB]', err.message);
        console.warn('Could not verify/create user profile');
      }

      login(appUser);
      navigate('/feed');
    } catch (err) {
      console.error('Login failed:', err.message);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      {/* ── Animated Dot Grid ──────────────────────── */}
      <div style={s.dotGrid} />

      {/* ── Animated Background Orbs ─────────────── */}
      <div style={s.bgOrb1} />
      <div style={s.bgOrb2} />
      <div style={s.bgOrb3} />

      {/* ── Floating Particles ────────────────────── */}
      {[
        { top: '12%', left: '8%',  size: 3, bg: 'rgba(0,212,255,0.4)',  dur: '12s', delay: '0s' },
        { top: '25%', left: '85%', size: 2, bg: 'rgba(191,90,242,0.5)', dur: '16s', delay: '2s' },
        { top: '70%', left: '15%', size: 2, bg: 'rgba(0,212,255,0.4)',  dur: '14s', delay: '4s' },
        { top: '80%', left: '75%', size: 3, bg: 'rgba(0,212,255,0.3)',  dur: '18s', delay: '1s' },
        { top: '45%', left: '92%', size: 2, bg: 'rgba(191,90,242,0.4)', dur: '20s', delay: '3s' },
        { top: '55%', left: '5%',  size: 2, bg: 'rgba(0,212,255,0.3)',  dur: '15s', delay: '5s' },
        { top: '8%',  left: '50%', size: 3, bg: 'rgba(0,212,255,0.35)', dur: '17s', delay: '6s' },
        { top: '90%', left: '40%', size: 2, bg: 'rgba(191,90,242,0.35)',dur: '13s', delay: '2s' },
      ].map((p, i) => (
        <div
          key={`particle-${i}`}
          style={{
            ...s.particle,
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.bg,
            boxShadow: `0 0 ${p.size * 3}px ${p.bg}`,
            animation: `floatOrb${(i % 3) + 1} ${p.dur} ease-in-out ${p.delay} infinite`,
          }}
        />
      ))}

      {/* ── Sparkle Elements ──────────────────────── */}
      {[
        { top: '18%', left: '20%', dur: '3s', delay: '0s' },
        { top: '30%', left: '78%', dur: '4s', delay: '1.5s' },
        { top: '75%', left: '25%', dur: '3.5s', delay: '0.8s' },
        { top: '85%', left: '80%', dur: '4.5s', delay: '2s' },
        { top: '10%', left: '65%', dur: '3s', delay: '3s' },
      ].map((sp, i) => (
        <div
          key={`sparkle-${i}`}
          style={{
            ...s.sparkle,
            top: sp.top,
            left: sp.left,
            animation: `sparkle ${sp.dur} ease-in-out ${sp.delay} infinite`,
          }}
        />
      ))}

      <div style={s.card}>
        {/* ── Logo ──────────────────────────────── */}
        <div style={s.logoWrap}>
          <div style={s.orb} />
          <div style={s.pulseRing} />
          <span style={s.logoIcon} role="img" aria-hidden="true">
            <Zap size={28} style={{ color: '#00D4FF', filter: 'drop-shadow(0 0 8px rgba(0,212,255,0.5))' }} />
          </span>
          <h1 style={s.logo}>Social Dilemma's</h1>
          <p style={s.subtitle}>The Ultimate Social Game</p>
          <p style={s.tagline}>Choose Your Side. See Who Agrees.</p>
        </div>

        {/* ── Dynamic Social Proof ─────────────────── */}
        <div style={s.socialProofDynamic}>
          <div style={s.socialProofRow} key={proofIndex}>
            <span style={s.socialProofLiveDot} />
            <span style={{
              ...s.socialProofText,
              animation: 'socialProofFade 0.5s ease-out',
            }}>
              {socialProofMessages[proofIndex].text}
            </span>
          </div>
          <div style={s.socialProofMeta}>
            <span style={s.socialProofMetaItem}>
              <Shield size={10} color="rgba(191,90,242,0.6)" />
              Secure
            </span>
            <span style={s.socialProofMetaItem}>
              <Zap size={10} color="rgba(0,212,255,0.6)" />
              Instant Play
            </span>
            <span style={s.socialProofMetaItem}>
              <Trophy size={10} color="rgba(0,212,255,0.6)" />
              Earn XP
            </span>
          </div>
        </div>

        {/* ── Error ─────────────────────────────── */}
        {error && <div style={s.error}>{error}</div>}

        {/* ── Form ──────────────────────────────── */}
        <form onSubmit={handleSubmit} style={s.form}>
          {/* Email */}
          <div style={s.fieldWrap}>
            <Mail
              size={18}
              style={{
                ...s.icon,
                ...(focusedField === 'email' ? s.iconFocused : {}),
              }}
            />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              style={{
                ...s.input,
                ...(focusedField === 'email' ? s.inputFocus : {}),
              }}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div style={s.fieldWrap}>
            <Lock
              size={18}
              style={{
                ...s.icon,
                ...(focusedField === 'password' ? s.iconFocused : {}),
              }}
            />
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              style={{
                ...s.input,
                ...(focusedField === 'password' ? s.inputFocus : {}),
              }}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              style={s.eyeBtn}
              tabIndex={-1}
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...s.submitBtn,
              ...(loading ? s.submitBtnDisabled : {}),
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {loading ? (
              <>Signing in...</>
            ) : (
              <>
                <Zap size={18} />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* ── Divider ──────────────────────────────── */}
        <div style={s.dividerWrap}>
          <div style={s.dividerLine} />
          <span style={s.dividerText}>or</span>
          <div style={s.dividerLine} />
        </div>

        {/* ── Footer ────────────────────────────── */}
        <p style={s.footer}>
          Don&apos;t have an account?
          <Link
            to="/register"
            style={s.link}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#33E0FF';
              e.currentTarget.style.textShadow = '0 0 12px rgba(0,212,255,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#00D4FF';
              e.currentTarget.style.textShadow = 'none';
            }}
          >
            Sign Up
          </Link>
        </p>

        {/* ── CTA ──────────────────────────────────── */}
        <div style={s.ctaWrap}>
          <span style={s.ctaText}>
            <span style={s.ctaEmoji} role="img" aria-label="game">
              <Zap size={12} style={{ color: '#00D4FF', verticalAlign: 'middle', marginRight: 4 }} />
            </span>
            Make your choice today -- the game is waiting
          </span>
        </div>
      </div>
    </div>
  );
}
