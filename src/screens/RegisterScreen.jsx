import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Zap, Shield, Users, Trophy, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../services/api';

// ── Keyframes injected once ────────────────────────────────
const keyframesId = 'lux-register-keyframes';
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
    @keyframes checkPop {
      0%   { transform: scale(0); opacity: 0; }
      60%  { transform: scale(1.2); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes regDotGrid {
      0%   { background-position: 0 0; }
      100% { background-position: 32px 32px; }
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
    top: '10%',
    right: '10%',
    width: 320,
    height: 320,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(191,90,242,0.15) 0%, transparent 70%)',
    filter: 'blur(60px)',
    animation: 'floatOrb1 20s ease-in-out infinite',
    pointerEvents: 'none',
    zIndex: 0,
  },
  bgOrb2: {
    position: 'absolute',
    bottom: '15%',
    left: '5%',
    width: 350,
    height: 350,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%)',
    filter: 'blur(60px)',
    animation: 'floatOrb2 24s ease-in-out infinite',
    pointerEvents: 'none',
    zIndex: 0,
  },
  bgOrb3: {
    position: 'absolute',
    top: '50%',
    left: '60%',
    width: 280,
    height: 280,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)',
    filter: 'blur(50px)',
    animation: 'floatOrb3 16s ease-in-out infinite',
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
    background: '#00D4FF',
    borderRadius: '50%',
    boxShadow: '0 0 6px 2px rgba(0,212,255,0.6)',
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
    padding: '36px 32px 32px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 80px rgba(191,90,242,0.05), 0 0 80px rgba(0,212,255,0.05)',
  },
  logoWrap: {
    textAlign: 'center',
    marginBottom: 28,
    position: 'relative',
  },
  orb: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 200,
    height: 200,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(191,90,242,0.18) 0%, rgba(0,212,255,0.1) 40%, transparent 70%)',
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
    border: '1px solid rgba(191,90,242,0.15)',
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
    marginBottom: 24,
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
    gap: 14,
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
    padding: '15px 48px 15px 46px',
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
  inputError: {
    borderColor: 'rgba(255,60,60,0.5)',
    boxShadow: '0 0 0 3px rgba(255,60,60,0.08), 0 0 15px rgba(255,60,60,0.04)',
  },
  inputValid: {
    borderColor: 'rgba(57,255,20,0.4)',
    boxShadow: '0 0 0 3px rgba(57,255,20,0.06)',
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
  fieldHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
    marginTop: 6,
    paddingLeft: 6,
    letterSpacing: 0.2,
  },
  fieldError: {
    fontSize: 11,
    color: '#ff6b6b',
    marginTop: 6,
    paddingLeft: 6,
    letterSpacing: 0.2,
  },
  fieldValid: {
    fontSize: 11,
    color: '#39FF14',
    marginTop: 6,
    paddingLeft: 6,
    letterSpacing: 0.2,
    animation: 'checkPop 0.3s ease-out',
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
    marginTop: 6,
    letterSpacing: '0.5px',
    boxShadow: '0 4px 20px rgba(0,212,255,0.3), 0 0 40px rgba(255,45,120,0.1)',
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
    marginTop: 24,
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
    marginTop: 16,
    animation: 'socialProofFade 1s ease-out 0.6s both',
  },
  ctaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 0.5,
  },
  strengthBar: {
    display: 'flex',
    gap: 4,
    marginTop: 8,
    paddingLeft: 6,
  },
  strengthSegment: {
    height: 3,
    flex: 1,
    borderRadius: 2,
    background: 'rgba(255,255,255,0.06)',
    transition: 'background 0.3s',
  },
  // Animated dot grid overlay
  dotGrid: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none',
    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
    backgroundSize: '32px 32px',
    animation: 'regDotGrid 30s linear infinite',
    opacity: 0.7,
  },
  // Enhanced subtitle
  subtitle: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 15,
    marginTop: 6,
    letterSpacing: 1,
    position: 'relative',
    zIndex: 1,
    fontWeight: 600,
    background: 'linear-gradient(90deg, rgba(255,255,255,0.55) 0%, #BF5AF2 50%, rgba(255,255,255,0.55) 100%)',
    backgroundSize: '200% 100%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: 'subtitleShine 4s ease-in-out infinite',
  },
  // Dynamic social proof
  socialProofDynamic: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
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

// ── Validation helpers ─────────────────────────────────────
const isUsernameValid = (v) => /^[a-zA-Z0-9_]{3,}$/.test(v);
const isPasswordValid = (v) => /^[a-zA-Z0-9]{6,}$/.test(v);
const doPasswordsMatch = (a, b) => a === b && a.length > 0;

export default function RegisterScreen() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [touched, setTouched] = useState({});

  // Cycling social proof messages
  const socialProofMessages = [
    { text: <><span style={s.socialProofCount}>2,400+</span> players already competing</> },
    { text: <>New players earn <span style={s.socialProofCount}>50 XP</span> bonus on signup</> },
    { text: <><span style={s.socialProofCount}>10,000+</span> dilemmas answered this week</> },
    { text: <>Join the #1 social decision game</> },
  ];
  const [proofIndex, setProofIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProofIndex((prev) => (prev + 1) % socialProofMessages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const markTouched = (field) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  // Per-field validation messages (only shown after blur)
  const fieldErrors = {
    username:
      touched.username && username && !isUsernameValid(username)
        ? '3+ characters, letters, numbers, and underscores only'
        : '',
    password:
      touched.password && password && !isPasswordValid(password)
        ? 'Letters and numbers only, at least 6 characters'
        : '',
    confirm:
      touched.confirm && confirm && !doPasswordsMatch(password, confirm)
        ? 'Passwords do not match'
        : '',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!username.trim() || !email.trim() || !password.trim() || !confirm.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (!isUsernameValid(username)) {
      setError('Username must be at least 3 characters and contain only letters, numbers, or underscores.');
      return;
    }
    if (!isPasswordValid(password)) {
      setError('Password must be at least 6 characters, using only letters and numbers.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await auth.signUp(email.trim(), password, username.trim());
      const user = res?.user || res?.data?.user || res;

      if (!user || !user.id) {
        throw new Error('Registration failed. Please try again.');
      }

      // Create app profile in users table
      let appUser = user;
      try {
        await auth.createProfile({
          username: username.trim(),
          email: email.trim(),
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
        // Fetch the profile to get the integer id
        const profile = await auth.getByEmail(email.trim());
        if (profile && profile.id) {
          appUser = { ...user, ...profile, authId: user.id, email: email.trim() };
        }
      } catch (err) {
        console.warn('[NCB] Could not create user profile:', err.message);
      }

      login(appUser);
      navigate('/feed');
    } catch (err) {
      const msg = err.message?.toLowerCase() || '';
      if (msg.includes('already exists') || msg.includes('already registered')) {
        setError('This email is already registered. Please sign in instead.');
      } else {
        console.error('Registration failed:', err.message);
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field, hasFieldError) => ({
    ...s.input,
    ...(focusedField === field ? s.inputFocus : {}),
    ...(hasFieldError ? s.inputError : {}),
  });

  // Password strength for visual indicator
  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    return strength;
  };

  const strengthColors = ['#ff6b6b', '#FF6B35', '#00D4FF', '#39FF14'];
  const pwStrength = getPasswordStrength();

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
        { top: '8%',  left: '12%', size: 3, bg: 'rgba(191,90,242,0.4)', dur: '14s', delay: '0s' },
        { top: '20%', left: '88%', size: 2, bg: 'rgba(0,212,255,0.5)',  dur: '18s', delay: '2s' },
        { top: '65%', left: '8%',  size: 2, bg: 'rgba(0,212,255,0.4)',  dur: '16s', delay: '4s' },
        { top: '85%', left: '80%', size: 3, bg: 'rgba(191,90,242,0.3)', dur: '20s', delay: '1s' },
        { top: '40%', left: '95%', size: 2, bg: 'rgba(0,212,255,0.4)',  dur: '22s', delay: '3s' },
        { top: '50%', left: '3%',  size: 2, bg: 'rgba(0,212,255,0.3)',  dur: '17s', delay: '5s' },
        { top: '5%',  left: '55%', size: 3, bg: 'rgba(191,90,242,0.35)',dur: '19s', delay: '6s' },
        { top: '92%', left: '35%', size: 2, bg: 'rgba(0,212,255,0.35)', dur: '15s', delay: '2s' },
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
        { top: '15%', left: '25%', dur: '3.5s', delay: '0.5s' },
        { top: '28%', left: '80%', dur: '4s',   delay: '1s' },
        { top: '72%', left: '18%', dur: '3s',   delay: '2s' },
        { top: '88%', left: '72%', dur: '4.5s', delay: '0s' },
        { top: '5%',  left: '60%', dur: '3s',   delay: '3s' },
        { top: '55%', left: '90%', dur: '3.5s', delay: '1.5s' },
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
            <Zap size={28} style={{ color: '#BF5AF2', filter: 'drop-shadow(0 0 8px rgba(191,90,242,0.5))' }} />
          </span>
          <h1 style={s.logo}>Social Dilemma's</h1>
          <p style={s.subtitle}>Choose Your Side</p>
          <p style={s.tagline}>Create your account. Start playing.</p>
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
              <Sparkles size={10} color="rgba(0,212,255,0.6)" />
              Free to Play
            </span>
            <span style={s.socialProofMetaItem}>
              <Shield size={10} color="rgba(191,90,242,0.6)" />
              No Spam
            </span>
            <span style={s.socialProofMetaItem}>
              <Trophy size={10} color="rgba(0,212,255,0.6)" />
              Win Rewards
            </span>
          </div>
        </div>

        {/* ── Error ─────────────────────────────── */}
        {error && <div style={s.error}>{error}</div>}

        {/* ── Form ──────────────────────────────── */}
        <form onSubmit={handleSubmit} style={s.form}>
          {/* Username */}
          <div>
            <div style={s.fieldWrap}>
              <User
                size={18}
                style={{
                  ...s.icon,
                  ...(focusedField === 'username' ? s.iconFocused : {}),
                }}
              />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setFocusedField('username')}
                onBlur={() => {
                  setFocusedField(null);
                  markTouched('username');
                }}
                style={inputStyle('username', !!fieldErrors.username)}
                autoComplete="username"
              />
            </div>
            {fieldErrors.username ? (
              <p style={s.fieldError}>{fieldErrors.username}</p>
            ) : touched.username && username && isUsernameValid(username) ? (
              <p style={s.fieldValid}>Username looks good!</p>
            ) : (
              touched.username === undefined && (
                <p style={s.fieldHint}>Letters, numbers, underscores. Min 3 chars.</p>
              )
            )}
          </div>

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
              style={inputStyle('email', false)}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
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
                placeholder="Password (letters & numbers, 6+)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => {
                  setFocusedField(null);
                  markTouched('password');
                }}
                style={inputStyle('password', !!fieldErrors.password)}
                autoComplete="new-password"
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
            {fieldErrors.password && (
              <p style={s.fieldError}>{fieldErrors.password}</p>
            )}
            {/* Password strength bar */}
            {password && (
              <div style={s.strengthBar}>
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={`str-${i}`}
                    style={{
                      ...s.strengthSegment,
                      background: i < pwStrength
                        ? strengthColors[Math.min(pwStrength - 1, 3)]
                        : 'rgba(255,255,255,0.06)',
                      boxShadow: i < pwStrength
                        ? `0 0 6px ${strengthColors[Math.min(pwStrength - 1, 3)]}40`
                        : 'none',
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <div style={s.fieldWrap}>
              <Lock
                size={18}
                style={{
                  ...s.icon,
                  ...(focusedField === 'confirm' ? s.iconFocused : {}),
                }}
              />
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onFocus={() => setFocusedField('confirm')}
                onBlur={() => {
                  setFocusedField(null);
                  markTouched('confirm');
                }}
                style={inputStyle('confirm', !!fieldErrors.confirm)}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                style={s.eyeBtn}
                tabIndex={-1}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.confirm ? (
              <p style={s.fieldError}>{fieldErrors.confirm}</p>
            ) : touched.confirm && confirm && doPasswordsMatch(password, confirm) ? (
              <p style={s.fieldValid}>Passwords match!</p>
            ) : null}
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
              <>Creating account...</>
            ) : (
              <>
                <Zap size={18} />
                Create Account
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
          Already have an account?
          <Link
            to="/login"
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
            Sign In
          </Link>
        </p>

        {/* ── CTA ──────────────────────────────────── */}
        <div style={s.ctaWrap}>
          <span style={s.ctaText}>
            <Zap size={12} style={{ color: '#00D4FF', verticalAlign: 'middle', marginRight: 4 }} />
            Your first dilemma awaits -- will you dare to choose?
          </span>
        </div>
      </div>
    </div>
  );
}
