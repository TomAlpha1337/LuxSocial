import { useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAchievementToast } from '../components/AchievementToast';
import {
  achievements as achievementsApi,
  votes as votesApi,
  friendships as friendshipsApi,
  badges as badgesApi,
} from '../services/api';
import { BADGE_DEFINITIONS, POINTS } from '../utils/constants';

/**
 * useAchievements -- hook that provides checkAchievements()
 *
 * Call checkAchievements(context) after each vote with context like:
 *   { sessionVoteCount, chosenOption, dilemma, userPct }
 *
 * It will check all badge conditions and award any newly unlocked badges,
 * firing toast notifications for each.
 */
export function useAchievements() {
  const { user } = useAuth();
  const { showAchievementToast } = useAchievementToast();

  // Track which badges we've already awarded this session to avoid dupes
  const awardedThisSession = useRef(new Set());
  // Track session vote count internally
  const sessionVoteCount = useRef(0);
  // Track majority/minority counts for this session
  const majorityCount = useRef(0);
  const minorityCount = useRef(0);

  const checkAchievements = useCallback(async (context = {}) => {
    if (!user?.id) return;

    const userId = user.id;

    try {
      // Fetch user's existing achievements
      const existingData = await achievementsApi.getByUser(userId);
      const existingArr = Array.isArray(existingData) ? existingData : [];
      const earnedBadgeIds = new Set(existingArr.map((a) => a.badge_id));

      // Merge session-awarded to avoid double-awards within same session
      for (const id of awardedThisSession.current) {
        earnedBadgeIds.add(id);
      }

      // Increment session vote count
      sessionVoteCount.current += 1;

      // Track majority/minority from context
      if (context.userPct !== undefined) {
        if (context.userPct > 55) majorityCount.current += 1;
        if (context.userPct < 45) minorityCount.current += 1;
      }

      // Gather stats (lazy -- only fetch what's needed)
      let totalVotes = null;
      let friendsCount = null;
      let allVotes = null;

      const getTotalVotes = async () => {
        if (totalVotes !== null) return totalVotes;
        const v = await votesApi.getByUser(userId);
        totalVotes = Array.isArray(v) ? v.length : 0;
        allVotes = Array.isArray(v) ? v : [];
        return totalVotes;
      };

      const getFriendsCount = async () => {
        if (friendsCount !== null) return friendsCount;
        const f = await friendshipsApi.getFriends(userId);
        friendsCount = Array.isArray(f) ? f.length : 0;
        return friendsCount;
      };

      // Check if we can compute majority/minority from historical data
      const getHistoricalMajority = async () => {
        // We use session-tracked counts for quick checks
        // For historical, we'd need per-vote analysis which is expensive
        // So we use a hybrid: session counts + any stored progress
        const stored = existingArr.find((a) => a.badge_id === 'trendsetter');
        const storedProgress = stored?.progress || 0;
        return storedProgress + majorityCount.current;
      };

      const getHistoricalMinority = async () => {
        const stored = existingArr.find((a) => a.badge_id === 'bold_move');
        const storedProgress = stored?.progress || 0;
        return storedProgress + minorityCount.current;
      };

      const currentHour = new Date().getHours();
      const streak = user.current_streak || user.streak || 0;

      // Now check each badge
      const newBadges = [];

      for (const [badgeId, def] of Object.entries(BADGE_DEFINITIONS)) {
        if (earnedBadgeIds.has(badgeId)) continue;

        let earned = false;
        const cond = def.condition;

        switch (cond.type) {
          case 'total_votes': {
            const count = await getTotalVotes();
            // +1 because current vote may not be persisted yet
            if (count + 1 >= cond.threshold) earned = true;
            break;
          }
          case 'streak': {
            if (streak >= cond.threshold) earned = true;
            break;
          }
          case 'friends_count': {
            const count = await getFriendsCount();
            if (count >= cond.threshold) earned = true;
            break;
          }
          case 'majority_votes': {
            const count = await getHistoricalMajority();
            if (count >= cond.threshold) earned = true;
            break;
          }
          case 'minority_votes': {
            const count = await getHistoricalMinority();
            if (count >= cond.threshold) earned = true;
            break;
          }
          case 'session_votes': {
            if (sessionVoteCount.current >= cond.threshold) earned = true;
            break;
          }
          case 'time_range': {
            if (currentHour >= cond.start && currentHour < cond.end) earned = true;
            break;
          }
          default:
            break;
        }

        if (earned) {
          newBadges.push(badgeId);
          awardedThisSession.current.add(badgeId);
        }
      }

      // Award new badges
      for (const badgeId of newBadges) {
        const def = BADGE_DEFINITIONS[badgeId];

        try {
          // Save to achievements table
          await achievementsApi.award({
            user_id: userId,
            badge_id: badgeId,
            badge_name: def.name,
            earned_at: new Date().toISOString(),
          });

          // Also save to badges table (only valid columns)
          await badgesApi.award({
            user_id: userId,
            badge_name: def.name,
            badge_icon: def.icon,
            source: badgeId,
            earned_at: new Date().toISOString(),
          });
        } catch (err) {
          console.warn('[NCB]', err.message);
          // Non-critical -- badge may have been awarded by another session
        }

        // Show toast notification
        showAchievementToast({
          badge_id: badgeId,
          ...def,
        });
      }

      // Update progress for majority/minority tracking
      if (context.userPct !== undefined) {
        try {
          if (context.userPct > 55) {
            const existing = existingArr.find((a) => a.badge_id === 'trendsetter');
            if (existing) {
              await achievementsApi.updateProgress(existing.id, {
                progress: (existing.progress || 0) + 1,
              });
            } else if (!earnedBadgeIds.has('trendsetter')) {
              await achievementsApi.award({
                user_id: userId,
                badge_id: 'trendsetter_progress',
                badge_name: 'Trendsetter Progress',
                progress: 1,
              });
            }
          }
          if (context.userPct < 45) {
            const existing = existingArr.find((a) => a.badge_id === 'bold_move');
            if (existing) {
              await achievementsApi.updateProgress(existing.id, {
                progress: (existing.progress || 0) + 1,
              });
            } else if (!earnedBadgeIds.has('bold_move')) {
              await achievementsApi.award({
                user_id: userId,
                badge_id: 'bold_move_progress',
                badge_name: 'Bold Move Progress',
                progress: 1,
              });
            }
          }
        } catch (err) {
          console.warn('[NCB]', err.message);
          // Non-critical
        }
      }

      return newBadges;
    } catch (err) {
      console.warn('[NCB]', err.message);
      return [];
    }
  }, [user, showAchievementToast]);

  // Reset session counters (call when starting a new play session)
  const resetSession = useCallback(() => {
    sessionVoteCount.current = 0;
    majorityCount.current = 0;
    minorityCount.current = 0;
  }, []);

  return { checkAchievements, resetSession };
}
