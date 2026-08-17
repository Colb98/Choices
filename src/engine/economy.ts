import type { BalanceConfig, CardDefinition, Effect, GameState, Trend } from './types';

export interface EconomyBreakdown {
  baseTurnCost: number;
  activeObligationWeight: number;
  activeObligationCost: number;
  betrayedObligationWeight: number;
  betrayedObligationCost: number;
  /** Signed money delta applied after the authored choice effects. */
  total: number;
}

function isExempt(card: CardDefinition): boolean {
  return card.tags?.includes('economy_exempt') ?? false;
}

/**
 * Recurring pressure is derived from authored state instead of detecting
 * "random" input. Incoherent runs accumulate or betray more obligations and
 * therefore become more expensive in a way the player can understand.
 */
export function economyBreakdown(
  state: GameState,
  balance: BalanceConfig,
  card: CardDefinition,
): EconomyBreakdown {
  const act = state.run.currentAct;
  if (isExempt(card)) {
    return {
      baseTurnCost: 0,
      activeObligationWeight: 0,
      activeObligationCost: 0,
      betrayedObligationWeight: 0,
      betrayedObligationCost: 0,
      total: 0,
    };
  }

  const activeObligationWeight = state.obligations
    .filter((o) => o.status === 'active')
    .reduce((sum, o) => sum + o.weight, 0);
  const betrayedObligationWeight = state.obligations
    .filter((o) => o.status === 'betrayed')
    .reduce((sum, o) => sum + o.weight, 0);
  const baseTurnCost = balance.economy.baseTurnCosts[act] ?? 0;
  const activeObligationCost =
    activeObligationWeight * (balance.economy.activeObligationCostPerWeight[act] ?? 0);
  const betrayedObligationCost =
    betrayedObligationWeight * (balance.economy.betrayedObligationCostPerWeight[act] ?? 0);

  return {
    baseTurnCost,
    activeObligationWeight,
    activeObligationCost,
    betrayedObligationWeight,
    betrayedObligationCost,
    total: -(baseTurnCost + activeObligationCost + betrayedObligationCost),
  };
}

function applyMoneyEffects(money: number, effects: Effect[] | undefined): number {
  let next = money;
  for (const effect of effects ?? []) {
    if (effect.type !== 'stat' || effect.stat !== 'money') continue;
    next = effect.set !== undefined ? effect.set : next + (effect.add ?? 0);
  }
  return next;
}

export function projectedMoneyDelta(
  state: GameState,
  balance: BalanceConfig,
  card: CardDefinition,
  effects: Effect[] | undefined,
  extraEffects: Effect[] = [],
): number {
  const afterAuthored = applyMoneyEffects(state.stats.money, [...(effects ?? []), ...extraEffects]);
  return afterAuthored - state.stats.money + economyBreakdown(state, balance, card).total;
}

export function moneyTrend(delta: number, safeReserve: number): Trend {
  if (delta === 0) return 0;
  const ratio = Math.abs(delta) / Math.max(1, safeReserve);
  const magnitude: 1 | 2 | 3 = ratio >= 0.5 ? 3 : ratio >= 0.15 ? 2 : 1;
  return (delta > 0 ? magnitude : -magnitude) as Trend;
}

export function runwayRatio(money: number, balance: BalanceConfig): number {
  return Math.max(0, Math.min(1, money / Math.max(1, balance.economy.safeReserve)));
}

export function isFinancialPressureAct(state: GameState, balance: BalanceConfig): boolean {
  return balance.economy.pressureActs.includes(state.run.currentAct);
}
