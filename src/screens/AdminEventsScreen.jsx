import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Plus, X, Calendar, Zap, ChevronLeft, Clock, Trophy,
  Power, Timer, Flame, Sparkles, Crown, Target, Eye, Users,
  AlertTriangle, CheckCircle, RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as API from '../services/api';
import { CATEGORIES } from '../utils/constants';

// ── Keyframes ────────────────────────────────────────────
const keyframesId = 'lux-admin-events-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(keyframesId)) {
  const style = document.createElement('style');
  style.id = keyframesId;
  style.textContent = `
    @keyframes aeFadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes aePulse {
      0%, 100% { box-shadow: 0 0 20px rgba(0,212,255,0.08); }
      50%      { box-shadow: 0 0 30px rgba(0,212,255,0.15); }
    }
    @keyframes aeGlow {
      0%, 100% { opacity: 0.6; }
      50%      { opacity: 1; }
    }
    @keyframes slideDown {
      from { opacity: 0; max-height: 0; }
      to   { opacity: 1; max-height: 800px; }
    }
    @keyframes countdownPulse {
      0%, 100% { transform: scale(1); }
      50%      { transform: scale(1.05); }
    }
  `;
  document.head.appendChild(style);
}

// ── Color palette ────────────────────────────────────────
const C = {
  gold: '#00D4FF',
  goldLight: '#33E0FF',
  goldDim: 'rgba(0,212,255,0.15)',
  goldGlow: 'rgba(0,212,255,0.25)',
  purple: '#BF5AF2',
  purpleDim: 'rgba(191,90,242,0.15)',
  purpleGlow: 'rgba(191,90,242,0.25)',
  cyan: '#00D4FF',
  cyanDim: 'rgba(0,212,255,0.15)',
  bg: '#050510',
  bgCard: 'rgba(255,255,255,0.03)',
  bgInput: 'rgba(255,255,255,0.05)',
  border: 'rgba(255,255,255,0.08)',
  text: '#ffffff',
  textMuted: 'rgba(255,255,255,0.5)',
  textDim: 'rgba(255,255,255,0.3)',
  green: '#22c55e',
  greenDim: 'rgba(34,197,94,0.15)',
  red: '#ef4444',
  redDim: 'rgba(239,68,68,0.15)',
  orange: '#f97316',
  orangeDim: 'rgba(249,115,22,0.15)',
  blue: '#3b82f6',
  blueDim: 'rgba(59,130,246,0.15)',
};

// ── Styles ───────────────────────────────────────────────
const s = {
  page: {
    minHeight: '100vh',
    background: `linear-gradient(180deg, ${C.bg} 0%, #0d0b14 50%, ${C.bg} 100%)`,
    fontFamily: "'Inter', sans-serif",
    color: C.text,
    paddingBottom: 40,
  },
  denied: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', background: C.bg,
    fontFamily: "'Inter', sans-serif", color: C.text, gap: 16,
  },
  deniedIcon: { color: C.red, marginBottom: 8 },
  deniedTitle: {
    fontSize: 28, fontWeight: 800, margin: 0,
    background: `linear-gradient(135deg, ${C.red}, ${C.orange})`,
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  deniedText: { color: C.textMuted, fontSize: 15, margin: 0 },
  header: {
    padding: '28px 24px 20px', borderBottom: `1px solid ${C.border}`,
    background: 'rgba(255,255,255,0.01)', backdropFilter: 'blur(20px)',
    position: 'sticky', top: 0, zIndex: 50,
  },
  headerTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  headerIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    background: `linear-gradient(135deg, ${C.purple}, ${C.gold})`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22, fontWeight: 800, margin: 0,
    background: `linear-gradient(135deg, ${C.purple} 0%, ${C.gold} 100%)`,
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  headerSub: {
    fontSize: 12, color: C.textDim, margin: 0, marginTop: 2,
    textTransform: 'uppercase', letterSpacing: 1.5,
  },
  backBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 16px', borderRadius: 10, border: `1px solid ${C.border}`,
    background: C.bgCard, color: C.textMuted, fontSize: 13, fontWeight: 600,
    fontFamily: "'Inter', sans-serif", cursor: 'pointer', transition: 'all 0.2s',
  },
  refreshBtn: {
    width: 40, height: 40, borderRadius: 10, border: `1px solid ${C.border}`,
    background: C.bgCard, color: C.textMuted, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
  },
  content: { padding: '24px 20px', maxWidth: 1200, margin: '0 auto', animation: 'aeFadeIn 0.4s ease-out' },
  sectionTitle: { fontSize: 18, fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 10 },
  formCard: {
    background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16,
    padding: 24, marginBottom: 20, animation: 'slideDown 0.3s ease-out', overflow: 'hidden',
  },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  formFull: { gridColumn: '1 / -1' },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 },
  input: {
    width: '100%', padding: '12px 14px', background: C.bgInput, border: `1px solid ${C.border}`,
    borderRadius: 10, color: C.text, fontSize: 14, fontFamily: "'Inter', sans-serif",
    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box',
  },
  inputFocus: { borderColor: 'rgba(0,212,255,0.4)', boxShadow: '0 0 0 3px rgba(0,212,255,0.08)' },
  select: {
    width: '100%', padding: '12px 14px', background: C.bgInput, border: `1px solid ${C.border}`,
    borderRadius: 10, color: C.text, fontSize: 14, fontFamily: "'Inter', sans-serif",
    outline: 'none', cursor: 'pointer', appearance: 'none', boxSizing: 'border-box',
  },
  btnPrimary: {
    padding: '12px 24px', borderRadius: 10, border: 'none',
    background: `linear-gradient(135deg, ${C.gold}, #FF2D78)`, color: '#fff',
    fontSize: 14, fontWeight: 700, fontFamily: "'Inter', sans-serif", cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
  },
  btnSecondary: {
    padding: '10px 18px', borderRadius: 10, border: `1px solid ${C.border}`,
    background: C.bgCard, color: C.textMuted, fontSize: 13, fontWeight: 600,
    fontFamily: "'Inter', sans-serif", cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
  },
  btnDanger: {
    padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)',
    background: C.redDim, color: C.red, fontSize: 12, fontWeight: 600,
    fontFamily: "'Inter', sans-serif", cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 5, transition: 'all 0.2s',
  },
  badge: {
    display: 'inline-flex', alignItems: 'center', padding: '4px 10px',
    borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  badgeActive: { background: C.greenDim, color: C.green },
  badgeInactive: { background: C.orangeDim, color: C.orange },
  badgeFeatured: { background: C.goldDim, color: C.gold },
  badgeCategory: { background: C.blueDim, color: C.blue },
  seasonCard: {
    background: `linear-gradient(135deg, rgba(0,212,255,0.06) 0%, rgba(191,90,242,0.06) 100%)`,
    border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, marginBottom: 20,
    position: 'relative', overflow: 'hidden',
  },
  seasonGlow: {
    position: 'absolute', top: -40, right: -40, width: 120, height: 120,
    borderRadius: '50%', background: C.goldGlow, filter: 'blur(50px)', opacity: 0.3, pointerEvents: 'none',
  },
  eventCard: {
    background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14,
    padding: '18px 20px', marginBottom: 10, display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
  },
  flexBetween: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 },
  flexRow: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  divider: { height: 1, background: C.border, margin: '20px 0', border: 'none' },
  emptyState: { textAlign: 'center', padding: '40px 20px', color: C.textDim, fontSize: 14 },
  chartCard: { background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, marginBottom: 24 },
  toast: {
    position: 'fixed', bottom: 24, right: 24, padding: '14px 22px', borderRadius: 12,
    fontSize: 14, fontWeight: 600, fontFamily: "'Inter', sans-serif", zIndex: 9999,
    animation: 'aeFadeIn 0.3s ease-out', display: 'flex', alignItems: 'center', gap: 8,
  },
  toastSuccess: { background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: C.green },
  toastError: { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: C.red },
};

// ── Helpers ──────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getCountdown(endDate) {
  if (!endDate) return null;
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return { expired: true, text: 'Ended' };
  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return { expired: false, text: `${days}d ${hrs}h remaining` };
  if (hrs > 0) return { expired: false, text: `${hrs}h ${mins}m remaining` };
  return { expired: false, text: `${mins}m remaining` };
}

const EVENT_TYPES = [
  { value: 'xp_multiplier', label: 'XP Multiplier', icon: Zap, color: C.gold },
  { value: 'category_spotlight', label: 'Category Spotlight', icon: Target, color: C.cyan },
  { value: 'mystery_reveal', label: 'Mystery Reveal', icon: Eye, color: C.purple },
  { value: 'bonus_streak', label: 'Bonus Streak', icon: Flame, color: C.orange },
  { value: 'xp_boost', label: 'XP Boost', icon: Sparkles, color: C.green },
  { value: 'challenge', label: 'Challenge', icon: Trophy, color: C.blue },
  { value: 'community', label: 'Community', icon: Users, color: C.purple },
  { value: 'special', label: 'Special', icon: Crown, color: C.gold },
];

// ── Component ────────────────────────────────────────────
export default function AdminEventsScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Seasons & Events state
  const [currentSeason, setCurrentSeason] = useState(null);
  const [eventsList, setEventsList] = useState([]);
  const [eventsHistory, setEventsHistory] = useState([]);
  const [showSeasonForm, setShowSeasonForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [seasonForm, setSeasonForm] = useState({ name: '', start_date: '', end_date: '' });
  const [eventForm, setEventForm] = useState({
    name: '', type: 'xp_multiplier', multiplier: 2, start_date: '', end_date: '', category: '',
  });
  const [focusedInput, setFocusedInput] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const inputStyle = (name) => ({ ...s.input, ...(focusedInput === name ? s.inputFocus : {}) });

  // ── Data fetching ──────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsRes, seasonsRes, allEventsRes] = await Promise.allSettled([
        API.events.getActive(),
        API.seasons.getActive(),
        API.events.getAll ? API.events.getAll() : Promise.reject('no endpoint'),
      ]);

      if (eventsRes.status === 'fulfilled') {
        const data = Array.isArray(eventsRes.value) ? eventsRes.value : eventsRes.value ? [eventsRes.value] : [];
        setEventsList(data);
      }
      if (seasonsRes.status === 'fulfilled') {
        const data = seasonsRes.value;
        const season = Array.isArray(data) ? data[0] || null : data || null;
        setCurrentSeason(season);
      }
      if (allEventsRes.status === 'fulfilled') {
        const data = Array.isArray(allEventsRes.value) ? allEventsRes.value : allEventsRes.value ? [allEventsRes.value] : [];
        setEventsHistory(data.filter(e => e.record_status !== 'active'));
      }
    } catch (err) {
      console.warn('[NCB] fetchData:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Actions ────────────────────────────────────────────
  const handleCreateSeason = async () => {
    if (!seasonForm.name.trim() || !seasonForm.start_date || !seasonForm.end_date) {
      showToast('Please fill in all season fields', 'error'); return;
    }
    const newSeason = {
      name: seasonForm.name,
      start_date: new Date(seasonForm.start_date).toISOString(),
      end_date: new Date(seasonForm.end_date).toISOString(),
      record_status: 'active',
      created_at: new Date().toISOString(),
    };
    try {
      const res = await API.seasons.create(newSeason);
      setCurrentSeason(res || newSeason);
      setShowSeasonForm(false);
      setSeasonForm({ name: '', start_date: '', end_date: '' });
      showToast('New season created');
    } catch (err) { console.warn('[NCB] create season:', err.message); showToast('Failed to create season', 'error'); }
  };

  const handleCreateEvent = async () => {
    if (!eventForm.name.trim() || !eventForm.start_date || !eventForm.end_date) {
      showToast('Please fill in all event fields', 'error'); return;
    }
    const newEvent = {
      name: eventForm.name,
      event_type: eventForm.type,
      multiplier: eventForm.multiplier,
      start_date: new Date(eventForm.start_date).toISOString(),
      end_date: new Date(eventForm.end_date).toISOString(),
      record_status: 'active',
      created_at: new Date().toISOString(),
    };
    try {
      const res = await API.events.create(newEvent);
      setEventsList(prev => [...prev, res || newEvent]);
      setShowEventForm(false);
      setEventForm({ name: '', type: 'xp_multiplier', multiplier: 2, start_date: '', end_date: '', category: '' });
      showToast('Event created');
    } catch (err) { console.warn('[NCB] create event:', err.message); showToast('Failed to create event', 'error'); }
  };

  const handleEndEvent = async (event) => {
    try {
      await API.events.update(event.id, { record_status: 'ended' });
      setEventsList(prev => prev.filter(e => e.id !== event.id));
      setEventsHistory(prev => [...prev, { ...event, record_status: 'ended' }]);
      showToast('Event ended');
    } catch (err) { console.warn('[NCB] end event:', err.message); showToast('Failed to end event', 'error'); }
  };

  // ── Access check ───────────────────────────────────────
  if (!user || user.role !== 'admin') {
    return (
      <div style={s.denied}>
        <Shield size={56} style={s.deniedIcon} />
        <h1 style={s.deniedTitle}>Access Denied</h1>
        <p style={s.deniedText}>You do not have admin privileges to view this page.</p>
        <button style={{ ...s.btnSecondary, marginTop: 12 }} onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────
  return (
    <div style={s.page}>
      {/* Toast */}
      {toast && (
        <div style={{ ...s.toast, ...(toast.type === 'error' ? s.toastError : s.toastSuccess) }}>
          {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div style={s.header}>
        <div style={s.headerTop}>
          <div style={s.headerLeft}>
            <button
              style={s.backBtn}
              onClick={() => navigate('/admin')}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMuted; }}
            >
              <ChevronLeft size={16} /> Back
            </button>
            <div style={s.headerIconWrap}>
              <Zap size={22} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
              <h1 style={s.headerTitle}>Events & Seasons</h1>
              <p style={s.headerSub}>Manage events, seasons & XP multipliers</p>
            </div>
          </div>
          <button
            style={s.refreshBtn} onClick={fetchData} title="Refresh data"
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMuted; }}
          >
            <RefreshCw size={18} style={loading ? { animation: 'aeGlow 1s infinite' } : {}} />
          </button>
        </div>
      </div>

      <div style={s.content}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <RefreshCw size={28} color={C.gold} style={{ animation: 'aeGlow 1s infinite' }} />
            <p style={{ color: C.textMuted, marginTop: 12, fontSize: 14 }}>Loading events data...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* ── Current Season ─────────────────────────────── */}
            <h2 style={s.sectionTitle}><Trophy size={20} color={C.gold} /> Current Season</h2>
            {currentSeason ? (
              <div style={s.seasonCard}>
                <div style={s.seasonGlow} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={s.flexBetween}>
                    <div>
                      <h3 style={{
                        fontSize: 20, fontWeight: 800, margin: '0 0 6px 0',
                        background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                      }}>{currentSeason.name}</h3>
                      <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>{currentSeason.description}</p>
                    </div>
                    <span style={{ ...s.badge, ...s.badgeActive, fontSize: 12, padding: '6px 14px' }}>
                      {(currentSeason.record_status || currentSeason.status || 'active').toUpperCase()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
                    <div>
                      <p style={{ fontSize: 11, color: C.textDim, margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: 1 }}>Start</p>
                      <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: C.text }}>
                        <Calendar size={13} style={{ marginRight: 4, verticalAlign: 'middle', color: C.gold }} />{formatDate(currentSeason.start_date)}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: C.textDim, margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: 1 }}>End</p>
                      <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: C.text }}>
                        <Calendar size={13} style={{ marginRight: 4, verticalAlign: 'middle', color: C.purple }} />{formatDate(currentSeason.end_date)}
                      </p>
                    </div>
                    {currentSeason.end_date && (() => {
                      const cd = getCountdown(currentSeason.end_date);
                      return cd ? (
                        <div>
                          <p style={{ fontSize: 11, color: C.textDim, margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: 1 }}>Remaining</p>
                          <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: cd.expired ? C.red : C.green }}>
                            <Timer size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />{cd.text}
                          </p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>
            ) : <div style={{ ...s.emptyState, ...s.chartCard }}>No active season.</div>}

            <div style={{ marginBottom: 20 }}>
              <button style={s.btnSecondary} onClick={() => setShowSeasonForm(v => !v)}>
                {showSeasonForm ? <X size={14} /> : <Plus size={14} />}
                {showSeasonForm ? 'Cancel' : 'Create New Season'}
              </button>
            </div>

            {showSeasonForm && (
              <div style={s.formCard}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0', color: C.gold }}>New Season</h3>
                <div style={s.formGrid}>
                  <div style={s.formFull}>
                    <label style={s.label}>Season Name *</label>
                    <input style={inputStyle('sn')} placeholder="Season 4: ..."
                      value={seasonForm.name} onChange={e => setSeasonForm(f => ({ ...f, name: e.target.value }))}
                      onFocus={() => setFocusedInput('sn')} onBlur={() => setFocusedInput(null)} />
                  </div>
                  <div>
                    <label style={s.label}>Start Date *</label>
                    <input type="date" style={{ ...inputStyle('ss'), colorScheme: 'dark' }}
                      value={seasonForm.start_date} onChange={e => setSeasonForm(f => ({ ...f, start_date: e.target.value }))}
                      onFocus={() => setFocusedInput('ss')} onBlur={() => setFocusedInput(null)} />
                  </div>
                  <div>
                    <label style={s.label}>End Date *</label>
                    <input type="date" style={{ ...inputStyle('se'), colorScheme: 'dark' }}
                      value={seasonForm.end_date} onChange={e => setSeasonForm(f => ({ ...f, end_date: e.target.value }))}
                      onFocus={() => setFocusedInput('se')} onBlur={() => setFocusedInput(null)} />
                  </div>
                  <div style={s.formFull}>
                    <button style={{ ...s.btnPrimary, width: '100%', justifyContent: 'center', marginTop: 4 }}
                      onClick={handleCreateSeason}><Trophy size={16} /> Create Season</button>
                  </div>
                </div>
              </div>
            )}

            <hr style={s.divider} />

            {/* ── Active Events ──────────────────────────────── */}
            <div style={s.flexBetween}>
              <h2 style={s.sectionTitle}><Zap size={20} color={C.purple} /> Active Events</h2>
              <button style={s.btnSecondary} onClick={() => setShowEventForm(v => !v)}>
                {showEventForm ? <X size={14} /> : <Plus size={14} />}
                {showEventForm ? 'Cancel' : 'Create Event'}
              </button>
            </div>

            {showEventForm && (
              <div style={s.formCard}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0', color: C.purple }}>New Event</h3>
                <div style={s.formGrid}>
                  <div style={s.formFull}>
                    <label style={s.label}>Event Name *</label>
                    <input style={inputStyle('en')} placeholder="Double XP Weekend..."
                      value={eventForm.name} onChange={e => setEventForm(f => ({ ...f, name: e.target.value }))}
                      onFocus={() => setFocusedInput('en')} onBlur={() => setFocusedInput(null)} />
                  </div>
                  <div>
                    <label style={s.label}>Event Type</label>
                    <select style={s.select} value={eventForm.type}
                      onChange={e => setEventForm(f => ({ ...f, type: e.target.value }))}>
                      {EVENT_TYPES.map(t => (
                        <option key={t.value} value={t.value} style={{ background: C.bg, color: C.text }}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={s.label}>Multiplier</label>
                    <input type="number" step="0.5" min="1" max="10" style={inputStyle('em')}
                      value={eventForm.multiplier} onChange={e => setEventForm(f => ({ ...f, multiplier: parseFloat(e.target.value) || 1 }))}
                      onFocus={() => setFocusedInput('em')} onBlur={() => setFocusedInput(null)} />
                  </div>
                  {eventForm.type === 'category_spotlight' && (
                    <div>
                      <label style={s.label}>Spotlight Category</label>
                      <select style={s.select} value={eventForm.category}
                        onChange={e => setEventForm(f => ({ ...f, category: e.target.value }))}>
                        <option value="" style={{ background: C.bg }}>Select category</option>
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat} style={{ background: C.bg }}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label style={s.label}>Start Date *</label>
                    <input type="date" style={{ ...inputStyle('es'), colorScheme: 'dark' }}
                      value={eventForm.start_date} onChange={e => setEventForm(f => ({ ...f, start_date: e.target.value }))}
                      onFocus={() => setFocusedInput('es')} onBlur={() => setFocusedInput(null)} />
                  </div>
                  <div>
                    <label style={s.label}>End Date *</label>
                    <input type="date" style={{ ...inputStyle('ee'), colorScheme: 'dark' }}
                      value={eventForm.end_date} onChange={e => setEventForm(f => ({ ...f, end_date: e.target.value }))}
                      onFocus={() => setFocusedInput('ee')} onBlur={() => setFocusedInput(null)} />
                  </div>
                  <div style={s.formFull}>
                    <button style={{ ...s.btnPrimary, width: '100%', justifyContent: 'center', marginTop: 4 }}
                      onClick={handleCreateEvent}><Zap size={16} /> Create Event</button>
                  </div>
                </div>
              </div>
            )}

            {eventsList.length === 0 ? (
              <div style={{ ...s.emptyState, ...s.chartCard }}>No active events.</div>
            ) : (
              eventsList.map(event => {
                const evtType = EVENT_TYPES.find(t => t.value === event.event_type) || EVENT_TYPES[0];
                const EvtIcon = evtType.icon;
                const cd = getCountdown(event.end_date);
                return (
                  <div key={event.id} style={s.eventCard}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = evtType.color + '55'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: 12,
                        background: evtType.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <EvtIcon size={20} color={evtType.color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{event.name}</p>
                        <p style={{ fontSize: 12, color: C.textMuted, margin: '2px 0 0 0' }}>
                          {formatDate(event.start_date)} — {formatDate(event.end_date)}
                        </p>
                        {cd && !cd.expired && (
                          <p style={{ fontSize: 11, fontWeight: 600, color: C.green, margin: '4px 0 0', animation: 'countdownPulse 2s infinite' }}>
                            <Timer size={11} style={{ marginRight: 3, verticalAlign: 'middle' }} />{cd.text}
                          </p>
                        )}
                      </div>
                    </div>
                    <div style={s.flexRow}>
                      <span style={{ ...s.badge, background: evtType.color + '22', color: evtType.color }}>{evtType.label}</span>
                      {event.multiplier > 1 && <span style={{ ...s.badge, ...s.badgeFeatured }}>{event.multiplier}x</span>}
                      {event.category && <span style={{ ...s.badge, ...s.badgeCategory }}>{event.category}</span>}
                      <span style={{ ...s.badge, ...s.badgeActive }}>{event.record_status || event.status}</span>
                      <button style={s.btnDanger} onClick={() => handleEndEvent(event)}><Power size={13} /> End</button>
                    </div>
                  </div>
                );
              })
            )}

            {/* ── Event History ──────────────────────────────── */}
            {eventsHistory.length > 0 && (
              <>
                <hr style={s.divider} />
                <h2 style={s.sectionTitle}><Clock size={20} color={C.textDim} /> Event History</h2>
                {eventsHistory.slice(0, 10).map(event => (
                  <div key={event.id} style={{ ...s.eventCard, opacity: 0.6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Clock size={20} color={C.textDim} />
                      </div>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{event.name}</p>
                        <p style={{ fontSize: 12, color: C.textMuted, margin: '2px 0 0 0' }}>{formatDate(event.start_date)} — {formatDate(event.end_date)}</p>
                      </div>
                    </div>
                    <span style={{ ...s.badge, ...s.badgeInactive }}>Ended</span>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
