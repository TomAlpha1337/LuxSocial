import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { auth as authApi, dailyLogins, streaks as streaksApi, recordXp } from '../services/api';
import { DAILY_BONUS_XP, STREAK_MILESTONES, ENERGY_MAX, ENERGY_PER_PLAY } from '../utils/constants';
import { calculateEnergy } from '../utils/energy';

const AuthContext = createContext(null);

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Daily bonus state -- consumed by DailyBonusModal in Layout
  const [dailyBonusInfo, setDailyBonusInfo] = useState(null);
  // Streak milestone hit this login (consumed by DailyBonusModal)
  const [streakMilestone, setStreakMilestone] = useState(null);

  // Energy system state
  const [energy, setEnergy] = useState(ENERGY_MAX);
  const energyDbRef = useRef({ current: ENERGY_MAX, lastUpdate: null });

  // --- Record daily login & compute bonus -----------------------
  const recordDailyLogin = useCallback(async (userId) => {
    const today = getTodayStr();
    try {
      // Check if already logged in today
      const existing = await dailyLogins.getToday(userId, today);
      const existingArr = Array.isArray(existing) ? existing : existing ? [existing] : [];

      if (existingArr.length > 0) {
        return null;
      }

      // Fetch user's login history to compute consecutive streak
      const allLogins = await dailyLogins.getByUser(userId);
      const loginsArr = Array.isArray(allLogins) ? allLogins : [];

      const dates = loginsArr
        .map((l) => l.login_date)
        .filter(Boolean)
        .sort()
        .reverse();

      let consecutiveDays = 0;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      let checkDate = yesterday.toISOString().slice(0, 10);

      for (const d of dates) {
        if (d === checkDate) {
          consecutiveDays++;
          const prev = new Date(checkDate);
          prev.setDate(prev.getDate() - 1);
          checkDate = prev.toISOString().slice(0, 10);
        } else if (d < checkDate) {
          break;
        }
      }

      const streakDay = consecutiveDays % 7;
      const bonusXp = DAILY_BONUS_XP[streakDay];
      const newStreak = consecutiveDays + 1;

      await dailyLogins.record({
        user_id: userId,
        login_date: today,
        streak_day: streakDay + 1,
        bonus_xp: bonusXp,
        consecutive_days: newStreak,
      });

      // Update streak record
      try {
        const streakData = await streaksApi.get(userId);
        const streakArr = Array.isArray(streakData) ? streakData : streakData ? [streakData] : [];
        if (streakArr.length > 0) {
          const s = streakArr[0];
          await streaksApi.update(s.id, {
            current_streak: newStreak,
            last_login_date: today,
            longest_streak: Math.max(s.longest_streak || 0, newStreak),
          });
        } else {
          await streaksApi.create({
            user_id: userId,
            current_streak: newStreak,
            longest_streak: newStreak,
            last_login_date: today,
          });
        }
      } catch (err) {
        console.warn('[NCB] Streak update failed:', err.message);
      }

      // Award bonus XP
      try {
        const u = await authApi.getUser(userId);
        if (u && u.id) {
          const currentXp = u.xp || 0;
          let milestoneBonus = 0;
          let milestoneInfo = null;
          if (STREAK_MILESTONES[newStreak]) {
            milestoneBonus = STREAK_MILESTONES[newStreak].xp;
            milestoneInfo = { ...STREAK_MILESTONES[newStreak], day: newStreak };
          }
          const totalBonus = bonusXp + milestoneBonus;
          await authApi.updateUser(u.id, { xp: currentXp + totalBonus });
          recordXp(u.id, totalBonus, u).catch((err) => console.warn('[NCB] recordXp:', err.message));
          if (milestoneInfo) setStreakMilestone(milestoneInfo);
        }
      } catch (err) {
        console.warn('[NCB] XP bonus update failed:', err.message);
      }

      const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weekDays = [];
      for (let i = 0; i < 7; i++) {
        const slotDate = new Date();
        slotDate.setDate(slotDate.getDate() - (streakDay - i));
        weekDays.push({
          day: i + 1,
          xp: DAILY_BONUS_XP[i],
          completed: i < streakDay,
          isToday: i === streakDay,
          label: DAY_LABELS[slotDate.getDay()],
        });
      }

      return { bonusXp, streakDay: streakDay + 1, consecutiveDays: newStreak, weekDays };
    } catch (err) {
      console.warn('[NCB] recordDailyLogin failed:', err.message);
      return null;
    }
  }, []);

  // --- Energy helpers (stores on users table: energy_current, energy_last_update) ---
  const initEnergy = useCallback((userData) => {
    // If the users table has energy columns, use them; otherwise default to max
    const dbCurrent = userData.energy_current != null ? Number(userData.energy_current) : ENERGY_MAX;
    const dbLastUpdate = userData.energy_last_update || new Date().toISOString();
    energyDbRef.current = { current: dbCurrent, lastUpdate: dbLastUpdate };
    const computed = calculateEnergy(dbCurrent, dbLastUpdate, ENERGY_MAX);
    setEnergy(computed);
    if (userData.energy_current != null) {
      console.log('[NCB] Energy loaded from DB:', dbCurrent, '→ computed:', computed);
    } else {
      console.warn('[NCB] energy_current column not found on user profile — using default', ENERGY_MAX,
        '. Add energy_current (int) and energy_last_update (varchar) columns to the users table in NCB dashboard.');
    }
  }, []);

  const spendEnergy = useCallback(async (amount = ENERGY_PER_PLAY) => {
    const now = new Date().toISOString();
    const current = calculateEnergy(energyDbRef.current.current, energyDbRef.current.lastUpdate, ENERGY_MAX);
    const newEnergy = Math.max(0, current - amount);
    energyDbRef.current = { current: newEnergy, lastUpdate: now };
    setEnergy(newEnergy);

    if (user?.id) {
      try {
        await authApi.updateUser(user.id, { energy_current: newEnergy, energy_last_update: now });
        console.log('[NCB] Energy spent:', amount, '→', newEnergy);
      } catch (err) {
        console.error('[NCB] spendEnergy failed:', err.message,
          '— if "Unknown column", add energy_current (int) and energy_last_update (varchar) to users table in NCB dashboard');
      }
    }
  }, [user]);

  const refillEnergy = useCallback(async () => {
    const now = new Date().toISOString();
    energyDbRef.current = { current: ENERGY_MAX, lastUpdate: now };
    setEnergy(ENERGY_MAX);

    if (user?.id) {
      try {
        await authApi.updateUser(user.id, { energy_current: ENERGY_MAX, energy_last_update: now });
        console.log('[NCB] Energy refilled to', ENERGY_MAX);
      } catch (err) {
        console.error('[NCB] refillEnergy failed:', err.message);
      }
    }
  }, [user]);

  // Tick energy regen every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const { current, lastUpdate } = energyDbRef.current;
      if (lastUpdate) {
        setEnergy(calculateEnergy(current, lastUpdate, ENERGY_MAX));
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  // --- Session bootstrap (NO localStorage — always from NCB) ----------
  useEffect(() => {
    const refreshProfile = async (baseUser) => {
      try {
        const profile = baseUser.email
          ? await authApi.getByEmail(baseUser.email)
          : baseUser.id ? await authApi.getUser(baseUser.id) : null;
        if (profile && profile.id) {
          return { ...baseUser, ...profile, authId: baseUser.authId || baseUser.id, email: baseUser.email || profile.email };
        }
      } catch (err) {
        console.warn('[NCB] refreshProfile failed:', err.message);
      }
      return baseUser;
    };

    authApi.getSession()
      .then(async (res) => {
        const sessionUser = res?.user || null;
        if (sessionUser) {
          const appUser = await refreshProfile(sessionUser);
          setUser(appUser);
          initEnergy(appUser);
          console.log('[NCB] Session loaded, user:', appUser.id, appUser.username || appUser.name);

          const bonus = await recordDailyLogin(appUser.id);
          if (bonus) setDailyBonusInfo(bonus);
        } else {
          console.log('[NCB] No active session');
          setUser(null);
        }
      })
      .catch((err) => {
        console.error('[NCB] getSession failed:', err.message);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (userData) => {
    setUser(userData);
    initEnergy(userData);
    console.log('[NCB] Login, user:', userData.id, userData.username || userData.name);

    const bonus = await recordDailyLogin(userData.id);
    if (bonus) setDailyBonusInfo(bonus);
  }, [recordDailyLogin, initEnergy]);

  const logout = () => {
    setUser(null);
    setDailyBonusInfo(null);
    setStreakMilestone(null);
    setEnergy(ENERGY_MAX);
    energyDbRef.current = { current: ENERGY_MAX, lastUpdate: null };
  };

  const updateUser = (updates) => {
    setUser((prev) => prev ? { ...prev, ...updates } : prev);
  };

  const dismissDailyBonus = useCallback(() => setDailyBonusInfo(null), []);
  const dismissStreakMilestone = useCallback(() => setStreakMilestone(null), []);

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout, updateUser,
      dailyBonusInfo, dismissDailyBonus,
      streakMilestone, dismissStreakMilestone,
      energy, spendEnergy, refillEnergy,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
