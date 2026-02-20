import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox, Send, Plus, Clock, CheckCircle, XCircle, X,
  ChevronDown, User, MessageCircle, Eye, EyeOff, Zap, ArrowRight,
  Swords, Shield, Target, Crosshair, Flame, Crown, Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth as authApi, directDilemmas, friendships } from '../services/api';
import { POINTS } from '../utils/constants';

// ── Keyframes ───────────────────────────────────────────────
const keyframesId = 'lux-direct-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(keyframesId)) {
  const style = document.createElement('style');
  style.id = keyframesId;
  style.textContent = `
    @keyframes directXpPop {
      0%   { opacity: 1; transform: translateY(0) scale(1); }
      60%  { opacity: 1; transform: translateY(-30px) scale(1.2); }
      100% { opacity: 0; transform: translateY(-50px) scale(1.4); }
    }
    @keyframes directPulse {
      0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0,212,255,0.4); }
      50%      { transform: scale(1.02); box-shadow: 0 0 20px 4px rgba(0,212,255,0.15); }
    }
    @keyframes directFabGlow {
      0%, 100% { box-shadow: 0 0 20px rgba(0,212,255,0.3), 0 0 40px rgba(0,212,255,0.1); }
      50%      { box-shadow: 0 0 30px rgba(0,212,255,0.5), 0 0 60px rgba(0,212,255,0.2); }
    }
    @keyframes directFabSpin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes swordsCross {
      0%, 100% { transform: rotate(0deg) scale(1); }
      25% { transform: rotate(-8deg) scale(1.1); }
      75% { transform: rotate(8deg) scale(1.1); }
    }
    @keyframes pendingPulseGlow {
      0%, 100% { border-color: rgba(0,212,255,0.15); box-shadow: 0 0 0 0 rgba(0,212,255,0); }
      50% { border-color: rgba(0,212,255,0.4); box-shadow: 0 0 18px 2px rgba(0,212,255,0.08); }
    }
    @keyframes arenaParticle {
      0% { opacity: 0; transform: translateY(0) scale(0); }
      20% { opacity: 1; transform: translateY(-10px) scale(1); }
      100% { opacity: 0; transform: translateY(-40px) scale(0.5); }
    }
    @keyframes tabSlideIndicator {
      0% { transform: scaleX(0.6); }
      100% { transform: scaleX(1); }
    }
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes modalGlassReveal {
      0% { backdrop-filter: blur(0px); background: rgba(0,0,0,0); }
      100% { backdrop-filter: blur(16px); background: rgba(0,0,0,0.6); }
    }
  `;
  document.head.appendChild(style);
}

function getInitials(name) {
  return (name || '?').slice(0, 2).toUpperCase();
}

function timeRemaining(expiresAt) {
  const diff = new Date(expiresAt) - Date.now();
  if (diff <= 0) return null;
  const hrs = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const STATUS_STYLES = {
  pending:  { bg: 'rgba(0,212,255,0.08)', border: 'rgba(0,212,255,0.25)', color: '#00D4FF', label: 'Awaiting', icon: Target },
  answered: { bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.25)',  color: '#22c55e', label: 'Settled', icon: CheckCircle },
  expired:  { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)',  color: '#ef4444', label: 'Expired', icon: XCircle },
};

// ── Styles ──────────────────────────────────────────────────
const s = {
  page: {
    minHeight: '100vh',
    background: '#0a0a0f',
    fontFamily: "'Inter', sans-serif",
    color: '#fff',
    paddingBottom: 100,
    position: 'relative',
    overflow: 'hidden',
  },
  arenaBgTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 320,
    background: 'radial-gradient(ellipse at 50% -20%, rgba(191,90,242,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 10%, rgba(0,212,255,0.06) 0%, transparent 50%)',
    pointerEvents: 'none',
  },
  arenaBgBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    background: 'radial-gradient(ellipse at 50% 120%, rgba(0,212,255,0.06) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  header: {
    position: 'relative',
    textAlign: 'center',
    padding: '36px 20px 0',
    zIndex: 2,
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: 900,
    margin: 0,
    background: 'linear-gradient(135deg, #00D4FF 0%, #FF2D78 40%, #00D4FF 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: -0.5,
  },
  swordsIcon: {
    animation: 'swordsCross 2s ease-in-out infinite',
    filter: 'drop-shadow(0 0 8px rgba(0,212,255,0.4))',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontWeight: 600,
  },

  /* ── Tabs ──────────────────────────────────── */
  tabsContainer: {
    position: 'relative',
    display: 'flex',
    maxWidth: 340,
    margin: '24px auto 0',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    padding: 4,
    border: '1px solid rgba(255,255,255,0.05)',
    zIndex: 2,
  },
  tab: {
    flex: 1,
    padding: '11px 0',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    fontFamily: "'Inter', sans-serif",
    background: 'none',
    color: 'rgba(255,255,255,0.35)',
    border: 'none',
    borderRadius: 11,
    position: 'relative',
    zIndex: 2,
    letterSpacing: 0.3,
  },
  tabActive: {
    color: '#fff',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    borderRadius: 11,
    background: 'linear-gradient(135deg, #00D4FF, #FF2D78)',
    transition: 'left 0.35s cubic-bezier(0.4, 0, 0.2, 1), right 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 1,
    boxShadow: '0 2px 12px rgba(0,212,255,0.25)',
  },
  tabBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    background: '#ef4444',
    color: '#fff',
    fontSize: 10,
    fontWeight: 800,
    marginLeft: 6,
    padding: '0 6px',
    boxShadow: '0 0 8px rgba(239,68,68,0.4)',
  },

  /* ── List ──────────────────────────────────── */
  list: {
    padding: '20px 16px 0',
    maxWidth: 520,
    margin: '0 auto',
    position: 'relative',
    zIndex: 2,
  },

  /* ── Card ──────────────────────────────────── */
  card: {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 18,
    padding: '18px',
    marginBottom: 14,
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    position: 'relative',
    overflow: 'hidden',
  },
  cardPending: {
    animation: 'pendingPulseGlow 2.5s ease-in-out infinite',
    borderColor: 'rgba(0,212,255,0.2)',
  },
  cardAnswered: {
    borderColor: 'rgba(34,197,94,0.15)',
  },
  cardShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    background: 'linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.2) 50%, transparent 100%)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    background: 'linear-gradient(135deg, #BF5AF2, #9B30E0)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: 14,
    flexShrink: 0,
    color: '#fff',
    boxShadow: '0 4px 12px rgba(191,90,242,0.25)',
    position: 'relative',
  },
  avatarRing: {
    position: 'absolute',
    inset: -2,
    borderRadius: 16,
    border: '2px solid rgba(191,90,242,0.3)',
  },
  cardUserInfo: {
    flex: 1,
    minWidth: 0,
  },
  cardUsername: {
    fontWeight: 700,
    fontSize: 15,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  challengeLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: '#00D4FF',
    background: 'rgba(0,212,255,0.1)',
    padding: '2px 7px',
    borderRadius: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cardTime: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
    marginTop: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    letterSpacing: 0.3,
  },
  cardQuestion: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 1.55,
    marginBottom: 10,
    fontWeight: 500,
  },
  expiryTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 11,
    fontWeight: 600,
    color: '#00D4FF',
    background: 'rgba(0,212,255,0.06)',
    padding: '5px 12px',
    borderRadius: 10,
    border: '1px solid rgba(0,212,255,0.1)',
  },

  /* ── Option Buttons (Duel Style) ───────────── */
  optionBtns: {
    display: 'flex',
    gap: 12,
    marginTop: 14,
  },
  optionBtn: {
    flex: 1,
    padding: '16px 14px',
    borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.02)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Inter', sans-serif",
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  optionBtnA: {
    borderColor: 'rgba(0,212,255,0.25)',
    background: 'linear-gradient(135deg, rgba(0,212,255,0.06) 0%, rgba(0,212,255,0.02) 100%)',
  },
  optionBtnB: {
    borderColor: 'rgba(191,90,242,0.25)',
    background: 'linear-gradient(135deg, rgba(191,90,242,0.06) 0%, rgba(191,90,242,0.02) 100%)',
  },
  optionLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 26,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 6,
  },
  optionLabelA: {
    background: 'rgba(0,212,255,0.15)',
    color: '#00D4FF',
  },
  optionLabelB: {
    background: 'rgba(191,90,242,0.15)',
    color: '#BF5AF2',
  },
  vsText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: 11,
    fontWeight: 900,
    color: 'rgba(255,255,255,0.15)',
    letterSpacing: 1,
    pointerEvents: 'none',
    zIndex: 0,
  },

  /* ── Choices shown ─────────────────────────── */
  choicesRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  chosenBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 14px',
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 600,
  },
  yourChoice: {
    background: 'rgba(34,197,94,0.08)',
    border: '1px solid rgba(34,197,94,0.2)',
    color: '#22c55e',
  },
  senderChoice: {
    background: 'rgba(191,90,242,0.08)',
    border: '1px solid rgba(191,90,242,0.2)',
    color: '#c084fc',
  },
  matchBadge: {
    background: 'rgba(0,212,255,0.08)',
    border: '1px solid rgba(0,212,255,0.2)',
    color: '#00D4FF',
    padding: '5px 10px',
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },

  /* ── XP Popup ──────────────────────────────── */
  xpPopup: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -40,
    marginTop: -15,
    color: '#00D4FF',
    fontWeight: 900,
    fontSize: 20,
    animation: 'directXpPop 1.2s ease-out forwards',
    pointerEvents: 'none',
    zIndex: 10,
    textShadow: '0 0 16px rgba(0,212,255,0.5)',
    letterSpacing: 1,
  },

  /* ── FAB ────────────────────────────────────── */
  fab: {
    position: 'fixed',
    bottom: 28,
    right: 28,
    width: 64,
    height: 64,
    borderRadius: 20,
    background: 'linear-gradient(135deg, #00D4FF, #FF2D78)',
    border: 'none',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    animation: 'directFabGlow 2.5s ease-in-out infinite',
    zIndex: 100,
    transition: 'transform 0.2s',
    flexDirection: 'column',
    gap: 2,
  },
  fabLabel: {
    fontSize: 8,
    fontWeight: 800,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    lineHeight: 1,
  },

  /* ── Overlay & Modal ───────────────────────── */
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 460,
    background: 'linear-gradient(180deg, rgba(22,18,35,0.95) 0%, rgba(14,12,23,0.98) 100%)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: '28px 24px',
    position: 'relative',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    boxShadow: '0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
  },
  modalGlow: {
    position: 'absolute',
    top: -1,
    left: 20,
    right: 20,
    height: 2,
    background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.4), rgba(191,90,242,0.4), transparent)',
    borderRadius: 2,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 800,
    marginBottom: 24,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    letterSpacing: -0.3,
  },
  modalClose: {
    position: 'absolute',
    top: 18,
    right: 18,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.06)',
    color: 'rgba(255,255,255,0.5)',
    width: 34,
    height: 34,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  formGroup: {
    marginBottom: 18,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  formInput: {
    width: '100%',
    padding: '13px 16px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
    color: '#fff',
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    transition: 'border-color 0.25s, box-shadow 0.25s',
    boxSizing: 'border-box',
  },
  formSelect: {
    width: '100%',
    padding: '13px 16px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
    color: '#fff',
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    appearance: 'none',
    boxSizing: 'border-box',
    cursor: 'pointer',
    transition: 'border-color 0.25s',
  },
  sendBtn: {
    width: '100%',
    padding: '15px 0',
    border: 'none',
    borderRadius: 14,
    background: 'linear-gradient(135deg, #00D4FF, #FF2D78)',
    color: '#fff',
    fontSize: 15,
    fontWeight: 800,
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    transition: 'all 0.2s',
    letterSpacing: 0.3,
    boxShadow: '0 4px 20px rgba(0,212,255,0.2)',
  },

  /* ── Empty State ───────────────────────────── */
  emptyState: {
    textAlign: 'center',
    padding: '70px 20px',
    color: 'rgba(255,255,255,0.35)',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    background: 'rgba(0,212,255,0.04)',
    border: '1px solid rgba(0,212,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },

  /* ── Loader ────────────────────────────────── */
  loader: {
    textAlign: 'center',
    padding: '70px 20px',
    color: 'rgba(255,255,255,0.35)',
  },
};

// ── Component ───────────────────────────────────────────────
export default function DirectScreen() {
  const { user } = useAuth();
  const [tab, setTab] = useState('inbox');
  const [inbox, setInbox] = useState([]);
  const [sent, setSent] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [xpAnim, setXpAnim] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal form state
  const [formFriend, setFormFriend] = useState('');
  const [formQuestion, setFormQuestion] = useState('');
  const [formOptionA, setFormOptionA] = useState('');
  const [formOptionB, setFormOptionB] = useState('');
  const [formVisibility, setFormVisibility] = useState('private');
  const [sending, setSending] = useState(false);

  const userId = user?.id;

  useEffect(() => {
    if (userId) loadData();
  }, [userId]);

  async function loadData() {
    if (!userId) return;
    setLoading(true);
    try {
      const [inboxRes, sentRes, friendsRes] = await Promise.all([
        directDilemmas.getInbox(userId),
        directDilemmas.getSent(userId),
        friendships.getFriends(userId),
      ]);
      const parseRes = (r) => Array.isArray(r) ? r : r ? [r] : [];
      setInbox(parseRes(inboxRes));
      setSent(parseRes(sentRes));
      // Enrich friendship records with user profile data
      const friendRecords = parseRes(friendsRes);
      const enriched = await Promise.all(
        friendRecords.map(async (f) => {
          const friendId = f.user_id === userId ? f.friend_id : f.user_id;
          try {
            const u = await authApi.getUser(friendId);
            return u ? { ...u, friendship_id: f.id } : null;
          } catch { return null; }
        })
      );
      setFriends(enriched.filter(Boolean));
    } catch {
      setInbox([]);
      setSent([]);
      setFriends([]);
    } finally {
      setLoading(false);
    }
  }

  function handleAnswer(dilemmaId, choice) {
    setInbox((prev) =>
      prev.map((d) =>
        d.id === dilemmaId ? { ...d, status: 'answered', receiver_choice: choice } : d
      )
    );
    setXpAnim(dilemmaId);
    setTimeout(() => setXpAnim(null), 1300);

    // Fire and forget API call
    directDilemmas.answer(dilemmaId, {
      receiver_choice: choice,
      status: 'answered',
      answered_at: new Date().toISOString(),
    }).catch((err) => console.warn('[NCB]', err.message));
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!userId || !formFriend || !formQuestion.trim() || !formOptionA.trim() || !formOptionB.trim()) return;

    setSending(true);
    try {
      await directDilemmas.send({
        sender_id: userId,
        receiver_id: formFriend,
        question: formQuestion.trim(),
        option_a: formOptionA.trim(),
        option_b: formOptionB.trim(),
        visibility: formVisibility,
        status: 'pending',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      });
      await loadData();
    } catch {
      // Send failed — do nothing
    } finally {
      setSending(false);
      setShowModal(false);
      setFormFriend('');
      setFormQuestion('');
      setFormOptionA('');
      setFormOptionB('');
      setFormVisibility('private');
    }
  }

  const pendingCount = inbox.filter((d) => d.status === 'pending').length;

  const renderCard = (item, idx, isSent = false) => {
    const statusStyle = STATUS_STYLES[item.status] || STATUS_STYLES.pending;
    const StatusIcon = statusStyle.icon;
    const remaining = item.status === 'pending' ? timeRemaining(item.expires_at) : null;
    const isExpanded = expandedId === item.id && item.status === 'pending' && !isSent;
    const isPending = item.status === 'pending';
    const isAnswered = item.status === 'answered';
    const displayName = isSent ? item.receiver_username : item.sender_username;
    const matched = isAnswered && item.sender_choice && item.receiver_choice && item.sender_choice === item.receiver_choice;

    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: idx * 0.06, type: 'spring', stiffness: 200, damping: 25 }}
        style={{
          ...s.card,
          ...(isPending && !isSent ? s.cardPending : {}),
          ...(isAnswered ? s.cardAnswered : {}),
          position: 'relative',
        }}
        onClick={() => {
          if (isPending && !isSent) setExpandedId(isExpanded ? null : item.id);
        }}
        whileHover={{ y: -2, transition: { duration: 0.15 } }}
      >
        {/* Top shine line */}
        <div style={s.cardShine} />

        {/* XP animation */}
        {xpAnim === item.id && (
          <div style={s.xpPopup}>+{POINTS.answer_direct} XP</div>
        )}

        {/* Card Header */}
        <div style={s.cardHeader}>
          <div style={{ ...s.avatar, overflow: 'hidden' }}>
            <div style={s.avatarRing} />
            {(isSent ? item.receiver_avatar_url : item.sender_avatar_url) ? (
              <img
                src={isSent ? item.receiver_avatar_url : item.sender_avatar_url}
                alt={displayName}
                style={{ width: '100%', height: '100%', borderRadius: 14, objectFit: 'cover', position: 'relative', zIndex: 1 }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              getInitials(displayName)
            )}
          </div>
          <div style={s.cardUserInfo}>
            <div style={s.cardUsername}>
              {isSent && (
                <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 500, fontSize: 12 }}>To </span>
              )}
              {displayName}
              {isPending && !isSent && (
                <span style={s.challengeLabel}>DUEL</span>
              )}
            </div>
            <div style={s.cardTime}>
              <Swords size={10} style={{ opacity: 0.5 }} />
              {timeAgo(item.created_at)}
            </div>
          </div>
          <div
            style={{
              ...s.statusBadge,
              background: statusStyle.bg,
              border: `1px solid ${statusStyle.border}`,
              color: statusStyle.color,
            }}
          >
            <StatusIcon size={12} />
            {statusStyle.label}
          </div>
        </div>

        {/* Question */}
        <div style={s.cardQuestion}>{item.question}</div>

        {/* Pending: expiry */}
        {isPending && remaining && (
          <div style={s.expiryTag}>
            <Clock size={12} />
            {remaining} remaining
          </div>
        )}

        {/* Expanded: show duel options */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: 'hidden', position: 'relative' }}
            >
              <div style={s.optionBtns}>
                <motion.button
                  whileHover={{ scale: 1.03, borderColor: 'rgba(0,212,255,0.5)' }}
                  whileTap={{ scale: 0.96 }}
                  style={{ ...s.optionBtn, ...s.optionBtnA }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAnswer(item.id, 'A');
                    setExpandedId(null);
                  }}
                >
                  <div style={{ ...s.optionLabel, ...s.optionLabelA }}>A</div>
                  <div>{item.option_a}</div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03, borderColor: 'rgba(191,90,242,0.5)' }}
                  whileTap={{ scale: 0.96 }}
                  style={{ ...s.optionBtn, ...s.optionBtnB }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAnswer(item.id, 'B');
                    setExpandedId(null);
                  }}
                >
                  <div style={{ ...s.optionLabel, ...s.optionLabelB }}>B</div>
                  <div>{item.option_b}</div>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Answered: show choices */}
        {isAnswered && item.receiver_choice && (
          <div style={s.choicesRow}>
            <div style={{ ...s.chosenBadge, ...s.yourChoice }}>
              <CheckCircle size={13} />
              {isSent ? 'They' : 'You'}: {item.receiver_choice === 'A' ? item.option_a : item.option_b}
            </div>
            {item.sender_choice && (
              <div style={{ ...s.chosenBadge, ...s.senderChoice }}>
                <User size={13} />
                {isSent ? 'You' : 'They'}: {item.sender_choice === 'A' ? item.option_a : item.option_b}
              </div>
            )}
            {matched && (
              <div style={s.matchBadge}>
                <Sparkles size={12} />
                Match!
              </div>
            )}
          </div>
        )}

        {/* Expired */}
        {item.status === 'expired' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, fontSize: 12, color: '#ef4444', fontWeight: 500 }}>
            <XCircle size={13} />
            {isSent ? 'Expired without answer' : 'This challenge has expired'}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div style={s.page}>
      {/* Arena Background Effects */}
      <div style={s.arenaBgTop} />
      <div style={s.arenaBgBottom} />

      {/* Header */}
      <div style={s.header}>
        <div style={s.titleRow}>
          <Swords size={26} color="#00D4FF" style={s.swordsIcon} />
          <h1 style={s.title}>Direct Duels</h1>
          <Swords size={26} color="#00D4FF" style={{ ...s.swordsIcon, transform: 'scaleX(-1)' }} />
        </div>
        <p style={s.subtitle}>Challenge your friends</p>
      </div>

      {/* Tabs with sliding indicator */}
      <div style={s.tabsContainer}>
        {/* Sliding indicator */}
        <div
          style={{
            ...s.tabIndicator,
            left: tab === 'inbox' ? 4 : '50%',
            right: tab === 'inbox' ? '50%' : 4,
          }}
        />
        <button
          onClick={() => setTab('inbox')}
          style={{ ...s.tab, ...(tab === 'inbox' ? s.tabActive : {}) }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, position: 'relative', zIndex: 2 }}>
            <Inbox size={15} />
            Inbox
            {pendingCount > 0 && <span style={s.tabBadge}>{pendingCount}</span>}
          </span>
        </button>
        <button
          onClick={() => setTab('sent')}
          style={{ ...s.tab, ...(tab === 'sent' ? s.tabActive : {}) }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, position: 'relative', zIndex: 2 }}>
            <Send size={14} />
            Sent
          </span>
        </button>
      </div>

      {/* Content */}
      <div style={s.list}>
        {loading ? (
          <div style={s.loader}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              style={{ display: 'inline-block', marginBottom: 16 }}
            >
              <Swords size={28} color="#00D4FF" />
            </motion.div>
            <p style={{ fontSize: 13, fontWeight: 500 }}>Entering the arena...</p>
          </div>
        ) : tab === 'inbox' ? (
          /* ── Inbox ─────────────────────────────────── */
          inbox.length === 0 ? (
            <div style={s.emptyState}>
              <div style={s.emptyIconContainer}>
                <Swords size={36} color="rgba(0,212,255,0.3)" />
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
                No challenges yet
              </p>
              <p style={{ fontSize: 13, lineHeight: 1.5 }}>
                Dare a friend to a dilemma duel!
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {inbox.map((item, idx) => renderCard(item, idx, false))}
            </AnimatePresence>
          )
        ) : (
          /* ── Sent ──────────────────────────────────── */
          sent.length === 0 ? (
            <div style={s.emptyState}>
              <div style={s.emptyIconContainer}>
                <Send size={36} color="rgba(0,212,255,0.3)" />
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
                No duels sent
              </p>
              <p style={{ fontSize: 13, lineHeight: 1.5 }}>
                Tap the button below to challenge someone!
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {sent.map((item, idx) => renderCard(item, idx, true))}
            </AnimatePresence>
          )
        )}
      </div>

      {/* FAB — Send Challenge */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        style={s.fab}
        onClick={() => setShowModal(true)}
      >
        <Swords size={24} strokeWidth={2.5} />
        <span style={s.fabLabel}>Duel</span>
      </motion.button>

      {/* Send Modal (Glassmorphism) */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={s.overlay}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              style={s.modal}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top glow bar */}
              <div style={s.modalGlow} />

              <button
                style={s.modalClose}
                onClick={() => setShowModal(false)}
                onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={(e) => { e.target.style.background = 'rgba(255,255,255,0.06)'; }}
              >
                <X size={16} />
              </button>

              <div style={s.modalTitle}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(255,165,0,0.1))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Swords size={20} color="#00D4FF" />
                </div>
                Send Challenge
              </div>

              <form onSubmit={handleSend}>
                {/* Friend Select */}
                <div style={s.formGroup}>
                  <label style={s.formLabel}>
                    <Target size={12} color="#BF5AF2" />
                    Challenge who?
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={formFriend}
                      onChange={(e) => setFormFriend(e.target.value)}
                      style={s.formSelect}
                      onFocus={(e) => { e.target.style.borderColor = 'rgba(191,90,242,0.4)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                    >
                      <option value="" disabled>Pick your opponent...</option>
                      {friends.map((f) => (
                        <option key={f.id} value={f.id} style={{ background: '#1a1825', color: '#fff' }}>
                          {f.username}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      style={{
                        position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                        color: 'rgba(255,255,255,0.25)', pointerEvents: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Question */}
                <div style={s.formGroup}>
                  <label style={s.formLabel}>
                    <MessageCircle size={12} color="#00D4FF" />
                    The Dilemma
                  </label>
                  <input
                    type="text"
                    placeholder="Would you rather..."
                    value={formQuestion}
                    onChange={(e) => setFormQuestion(e.target.value)}
                    style={s.formInput}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(0,212,255,0.4)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0,212,255,0.08)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                      e.target.style.boxShadow = 'none';
                    }}
                    maxLength={200}
                  />
                </div>

                {/* Option A */}
                <div style={s.formGroup}>
                  <label style={s.formLabel}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 18, height: 18, borderRadius: 6, background: 'rgba(0,212,255,0.15)',
                      color: '#00D4FF', fontSize: 10, fontWeight: 800,
                    }}>A</span>
                    First Choice
                  </label>
                  <input
                    type="text"
                    placeholder="First option..."
                    value={formOptionA}
                    onChange={(e) => setFormOptionA(e.target.value)}
                    style={{ ...s.formInput, borderColor: 'rgba(0,212,255,0.12)' }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(0,212,255,0.4)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0,212,255,0.06)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(0,212,255,0.12)';
                      e.target.style.boxShadow = 'none';
                    }}
                    maxLength={100}
                  />
                </div>

                {/* Option B */}
                <div style={s.formGroup}>
                  <label style={s.formLabel}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 18, height: 18, borderRadius: 6, background: 'rgba(191,90,242,0.15)',
                      color: '#BF5AF2', fontSize: 10, fontWeight: 800,
                    }}>B</span>
                    Second Choice
                  </label>
                  <input
                    type="text"
                    placeholder="Second option..."
                    value={formOptionB}
                    onChange={(e) => setFormOptionB(e.target.value)}
                    style={{ ...s.formInput, borderColor: 'rgba(191,90,242,0.12)' }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(191,90,242,0.4)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(191,90,242,0.06)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(191,90,242,0.12)';
                      e.target.style.boxShadow = 'none';
                    }}
                    maxLength={100}
                  />
                </div>

                {/* Visibility */}
                <div style={s.formGroup}>
                  <label style={s.formLabel}>
                    <Eye size={12} color="rgba(255,255,255,0.4)" />
                    Visibility
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={formVisibility}
                      onChange={(e) => setFormVisibility(e.target.value)}
                      style={s.formSelect}
                      onFocus={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                    >
                      <option value="private" style={{ background: '#1a1825', color: '#fff' }}>Private (only you two)</option>
                      <option value="friends" style={{ background: '#1a1825', color: '#fff' }}>Friends only</option>
                      <option value="public" style={{ background: '#1a1825', color: '#fff' }}>Public</option>
                    </select>
                    <ChevronDown
                      size={16}
                      style={{
                        position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                        color: 'rgba(255,255,255,0.25)', pointerEvents: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Expiry note */}
                <div style={{
                  fontSize: 11, color: 'rgba(255,255,255,0.25)', marginBottom: 14,
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '8px 12px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <Clock size={12} color="rgba(0,212,255,0.5)" />
                  Challenge expires automatically in 24 hours
                </div>

                {/* Send Button */}
                <motion.button
                  whileHover={{ boxShadow: '0 6px 28px rgba(0,212,255,0.3)' }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={sending || !formFriend || !formQuestion.trim() || !formOptionA.trim() || !formOptionB.trim()}
                  style={{
                    ...s.sendBtn,
                    ...(sending || !formFriend || !formQuestion.trim() ? { opacity: 0.4, cursor: 'not-allowed' } : {}),
                  }}
                >
                  {sending ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      style={{ display: 'inline-flex' }}
                    >
                      <Zap size={18} />
                    </motion.span>
                  ) : (
                    <>
                      <Swords size={18} />
                      Send Challenge
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
