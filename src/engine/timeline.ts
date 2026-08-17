import type { BalanceConfig, CardDefinition, GameState } from './types';

/**
 * Fictional chronology is authored in balance data and optional card metadata.
 * It never reads Date.now(), animation time, or the player's session duration.
 */
export function storyElapsedDays(state: GameState, balance: BalanceConfig): number {
  if (state.run.elapsedStoryDays !== undefined) return state.run.elapsedStoryDays;
  const actStart = balance.timeline.actStartDays[state.run.currentAct] ?? balance.timeline.initialDay;
  const perCard = balance.timeline.defaultCardAdvanceDays[state.run.currentAct] ?? 0;
  return Math.max(balance.timeline.initialDay, actStart + state.run.actTurn * perCard);
}

export function cardStoryAdvanceDays(
  state: GameState,
  balance: BalanceConfig,
  card: CardDefinition,
): number {
  return card.metadata?.storyTimeAdvanceDays
    ?? balance.timeline.defaultCardAdvanceDays[state.run.currentAct]
    ?? 0;
}

export function storyYear(elapsedDays: number): number {
  return Math.floor((Math.max(1, elapsedDays) - 1) / 365) + 1;
}
