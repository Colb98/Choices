import type { ContentBundle, EndingDefinition, MetaSave } from '../engine/types';

/** The safety-net ending is not a destination; it does not count toward the goal. */
export const UNLISTED_ENDINGS = new Set(['ending_fallback']);

export function listedEndings(content: ContentBundle): EndingDefinition[] {
  return content.endings.filter((e) => !UNLISTED_ENDINGS.has(e.id));
}

export function discoveredCount(content: ContentBundle, meta: MetaSave): number {
  const listed = new Set(listedEndings(content).map((e) => e.id));
  return meta.discoveredEndings.filter((id) => listed.has(id)).length;
}

/**
 * One undiscovered ending to tease on the credits screen. Rotates with the
 * number of completed runs so each replay points at a different door;
 * deterministic, no randomness.
 */
/** Counted, but never dangled as a goal: running out of money is not a door worth pointing at. */
const UNTEASED_ENDINGS = new Set(['ending_bankrupt']);

export function endingToTease(content: ContentBundle, meta: MetaSave): EndingDefinition | undefined {
  // Lowest priority first: the mid-tier fates are the nearest doors for a
  // player who has just seen one; the grand endings come round later.
  const undiscovered = listedEndings(content)
    .filter((e) => !meta.discoveredEndings.includes(e.id) && !UNTEASED_ENDINGS.has(e.id))
    .sort((a, b) => a.priority - b.priority);
  if (undiscovered.length === 0) return undefined;
  return undiscovered[Math.max(0, meta.completedRuns - 1) % undiscovered.length];
}
