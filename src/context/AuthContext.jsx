import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth as authApi, dailyLogins, streaks as streaksApi, recordXp } from '../services/api';
import { DAILY_BONUS_XP, STREAK_MILESTONES } from '../utils/constants';

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

  // --- Record daily login & compute bonus -----------------------
  const recordDailyLogin = useCallback(async (userId) => {
    const today = getTodayStr();
    try {
      // Check if already logged in today
      const existing = await dailyLogins.getToday(userId, today);
      const existingArr = Array.isArray(existing) ? existing : existing ? [existing] : [];

      if (existingArr.length > 0) {
        // Already recorded today -- do not show modal again this session
        return null;
      }

      // Fetch user's login history to compute consecutive streak
      const allLogins = await dailyLogins.getByUser(userId);
      const loginsArr = Array.isArray(allLogins) ? allLogins : [];

      // Sort dates descending to find consecutive streak
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

      // consecutiveDays = how many days in a row BEFORE today
      // The streak day index (0-based within the 7-day cycle)
      const streakDay = consecutiveDays % 7; // 0-6
      const bonusXp = DAILY_BONUS_XP[streakDay];
      const newStreak = consecutiveDays + 1; // including today

      // Record today's login
      await dailyLogins.record({
        user_id: userId,
        login_date: today,
        streak_day: streakDay + 1,
        bonus_xp: bonusXp,
        consecutive_days: newStreak,
      });

      // Update streak record in streaks table
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
      } catch {
        // Streak update is non-critical
      }

      // Award bonus XP to the user
      try {
        const u = await authApi.getUser(userId);
        if (u && u.id) {
          const currentXp = u.xp || 0;

          // Check if we hit a streak milestone for extra XP
          let milestoneBonus = 0;
          let milestoneInfo = null;
          if (STREAK_MILESTONES[newStreak]) {
            milestoneBonus = STREAK_MILESTONES[newStreak].xp;
            milestoneInfo = { ...STREAK_MILESTONES[newStreak], day: newStreak };
          }

          const totalBonus = bonusXp + milestoneBonus;
          await authApi.updateUser(u.id, { xp: currentXp + totalBonus });

          // Record in leaderboard entries
          recordXp(u.id, totalBonus, u).catch(() => {});

          if (milestoneInfo) {
            setStreakMilestone(milestoneInfo);
          }
        }
      } catch {
        // XP update non-critical
      }

      // Build the week calendar data with real day-of-week labels
      const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weekDays = [];
      for (let i = 0; i < 7; i++) {
        // Calculate the actual date for this slot in the streak cycle
        const slotDate = new Date();
        slotDate.setDate(slotDate.getDate() - (streakDay - i));
        weekDays.push({
          day: i + 1,
          xp: DAILY_BONUS_XP[i],
          completed: i < streakDay, // days before today in cycle
          isToday: i === streakDay,
          label: DAY_LABELS[slotDate.getDay()],
        });
      }

      return {
        bonusXp,
        streakDay: streakDay + 1, // 1-based for display
        consecutiveDays: newStreak,
        weekDays,
      };
    } catch {
      return null;
    }
  }, []);

  // --- Session bootstrap ----------------------------------------
  useEffect(() => {
    let cachedUser = null;
    const saved = localStorage.getItem('luxsocial_user');
    if (saved) {
      try {
        cachedUser = JSON.parse(saved);
        setUser(cachedUser);
      } catch {
        localStorage.removeItem('luxsocial_user');
      }
    }

    // Helper: refresh profile from users table by id or email
    const refreshProfile = async (baseUser) => {
      try {
        const profile = baseUser.email
          ? await authApi.getByEmail(baseUser.email)
          : baseUser.id ? await authApi.getUser(baseUser.id) : null;
        if (profile && profile.id) {
          return { ...baseUser, ...profile, authId: baseUser.authId || baseUser.id, email: baseUser.email || profile.email };
        }
      } catch { /* non-critical */ }
      return baseUser;
    };

    authApi.getSession()
      .then(async (res) => {
        const sessionUser = res?.user || null;
        if (sessionUser) {
          // Resolve the app profile (integer ID) from users table by email
          const appUser = await refreshProfile(sessionUser);
          setUser(appUser);
          localStorage.setItem('luxsocial_user', JSON.stringify(appUser));

          // Record daily login and compute bonus (use integer id)
          const bonus = await recordDailyLogin(appUser.id);
          if (bonus) {
            setDailyBonusInfo(bonus);
          }
        } else if (cachedUser) {
          // Session expired but we have cached data – refresh profile in background
          const refreshed = await refreshProfile(cachedUser);
          setUser(refreshed);
          localStorage.setItem('luxsocial_user', JSON.stringify(refreshed));
        } else {
          setUser(null);
        }
      })
      .catch(async () => {
        // Session check failed – still try to refresh cached profile
        if (cachedUser) {
          try {
            const refreshed = await refreshProfile(cachedUser);
            setUser(refreshed);
            localStorage.setItem('luxsocial_user', JSON.stringify(refreshed));
          } catch { /* keep stale cache */ }
        }
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (userData) => {
    setUser(userData);
    localStorage.setItem('luxsocial_user', JSON.stringify(userData));

    // Record daily login after manual sign-in too
    const bonus = await recordDailyLogin(userData.id);
    if (bonus) {
      setDailyBonusInfo(bonus);
    }
  }, [recordDailyLogin]);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('luxsocial_user');
    setDailyBonusInfo(null);
    setStreakMilestone(null);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('luxsocial_user', JSON.stringify(updated));
  };

  const dismissDailyBonus = useCallback(() => {
    setDailyBonusInfo(null);
  }, []);

  const dismissStreakMilestone = useCallback(() => {
    setStreakMilestone(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      updateUser,
      dailyBonusInfo,
      dismissDailyBonus,
      streakMilestone,
      dismissStreakMilestone,
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
