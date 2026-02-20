import { ENERGY_MAX, ENERGY_REGEN_PER_HOUR } from './constants';

/**
 * Calculate current energy based on stored value + time elapsed since last update.
 * Energy regenerates at ENERGY_REGEN_PER_HOUR per hour, capped at maxEnergy.
 */
export function calculateEnergy(energyCurrent, energyLastUpdate, maxEnergy = ENERGY_MAX) {
  if (energyCurrent == null || energyLastUpdate == null) return maxEnergy;
  if (energyCurrent >= maxEnergy) return maxEnergy;

  const elapsed = Date.now() - new Date(energyLastUpdate).getTime();
  if (elapsed <= 0) return Math.min(energyCurrent, maxEnergy);

  const hoursElapsed = elapsed / (1000 * 60 * 60);
  const regen = Math.floor(hoursElapsed * ENERGY_REGEN_PER_HOUR);
  return Math.min(energyCurrent + regen, maxEnergy);
}

/**
 * Returns milliseconds until the next +1 energy point regenerates.
 * Returns 0 if energy is already at max.
 */
export function timeUntilNextEnergy(energyCurrent, energyLastUpdate, maxEnergy = ENERGY_MAX) {
  if (energyCurrent == null || energyLastUpdate == null) return 0;

  const current = calculateEnergy(energyCurrent, energyLastUpdate, maxEnergy);
  if (current >= maxEnergy) return 0;

  // Each point takes (60 / ENERGY_REGEN_PER_HOUR) minutes = 6 minutes for 10/hr
  const msPerPoint = (60 * 60 * 1000) / ENERGY_REGEN_PER_HOUR;

  const elapsed = Date.now() - new Date(energyLastUpdate).getTime();
  const pointsRegenned = Math.floor(elapsed / msPerPoint);
  const msIntoCurrentPoint = elapsed - pointsRegenned * msPerPoint;
  return Math.max(0, msPerPoint - msIntoCurrentPoint);
}
