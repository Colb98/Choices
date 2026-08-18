import type { BalanceConfig, CardDefinition, Effect, GameState, Trend } from './types';

export interface EconomyBreakdown {
  baseTurnCost: number;
  institutionalIncome: number;
  civicIncome: number;
  capitalRelationshipPoints: number;
  precedentPoints: number;
  leverageScore: number;
  leverageIncome: number;
  precedentExposureCost: number;
  activeObligationWeight: number;
  activeObligationCost: number;
  betrayedObligationWeight: number;
  betrayedObligationCost: number;
  /** Signed money delta applied after the authored choice effects. */
  total: number;
}

/**
 * Exempt cards consume no operating runway. `continue` beats are exempt by
 * nature: a setup or consequence screen is the same turn continued, not a new
 * one — see the pacing addendum §32 (informational interaction is not a
 * political commitment).
 */
function isExempt(card: CardDefinition): boolean {
  return card.interaction === 'continue' || (card.tags?.includes('economy_exempt') ?? false);
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
      institutionalIncome: 0,
      civicIncome: 0,
      capitalRelationshipPoints: 0,
      precedentPoints: 0,
      leverageScore: 0,
      leverageIncome: 0,
      precedentExposureCost: 0,
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
  const institutionalIncome =
    state.stats.standing * balance.economy.incomePerPoint.standing +
    state.stats.power * balance.economy.incomePerPoint.power +
    state.stats.publicTrustPerceived * balance.economy.incomePerPoint.publicTrustPerceived;
  const capitalRelationshipPoints = balance.economy.leverageCapitalCharacters
    .reduce((sum, character) => sum + Math.max(0, state.relationships[character] ?? 0), 0);
  const precedentPoints = Object.values(state.precedents)
    .reduce((sum, value) => sum + Math.max(0, value), 0);
  const civicIncome = Math.round(
    state.stats.publicTrustActual * balance.economy.civicIncomePerActualTrust /
    (1 + precedentPoints),
  );
  const relationshipBase =
    capitalRelationshipPoints * balance.economy.leverageWeights.capitalRelationship;
  // Shortcuts only become private wealth when the player also maintains a
  // capital network capable of monetizing them. This keeps random precedent
  // accumulation far below a coherent, optimized corruption route.
  const leverageScore = relationshipBase * (
    1 + precedentPoints * balance.economy.leverageWeights.precedent
  );
  const compoundingScore = Math.max(
    0,
    leverageScore - balance.economy.leverageCompoundingThreshold,
  );
  const leverageIncome = Math.round(
    leverageScore * (balance.economy.leverageIncomePerScore[act] ?? 0) +
    compoundingScore * compoundingScore * compoundingScore *
      (balance.economy.leverageIncomePerScoreCubed[act] ?? 0),
  );
  const precedentExposureCost = Math.round(
    precedentPoints * (balance.economy.precedentExposureCostPerPoint[act] ?? 0),
  );
  const activeObligationCost =
    activeObligationWeight * (balance.economy.activeObligationCostPerWeight[act] ?? 0);
  const betrayedObligationCost =
    betrayedObligationWeight * (balance.economy.betrayedObligationCostPerWeight[act] ?? 0);

  return {
    baseTurnCost,
    institutionalIncome,
    civicIncome,
    capitalRelationshipPoints,
    precedentPoints,
    leverageScore,
    leverageIncome,
    precedentExposureCost,
    activeObligationWeight,
    activeObligationCost,
    betrayedObligationWeight,
    betrayedObligationCost,
    total:
      institutionalIncome + civicIncome + leverageIncome - baseTurnCost - precedentExposureCost -
      activeObligationCost - betrayedObligationCost,
  };
}

/**
 * The invisible wealth multiplier created by normalized shortcuts and positive
 * relationships with actors who control political or commercial capital.
 * Clean civic relationships deliberately do not produce private leverage.
 */
export function leverageScore(state: GameState, balance: BalanceConfig): number {
  const capitalRelationshipPoints = balance.economy.leverageCapitalCharacters
    .reduce((sum, character) => sum + Math.max(0, state.relationships[character] ?? 0), 0);
  const precedentPoints = Object.values(state.precedents)
    .reduce((sum, value) => sum + Math.max(0, value), 0);
  const relationshipBase =
    capitalRelationshipPoints * balance.economy.leverageWeights.capitalRelationship;
  return relationshipBase * (
    1 + precedentPoints * balance.economy.leverageWeights.precedent
  );
}

function applyMoneyEffects(
  money: number,
  effects: Effect[] | undefined,
  balance: BalanceConfig,
): number {
  let next = money;
  for (const effect of effects ?? []) {
    if (effect.type === 'stat' && effect.stat === 'money') {
      next = Math.max(
        balance.money.min,
        effect.set !== undefined ? effect.set : next + (effect.add ?? 0),
      );
    } else if (effect.type === 'money_pressure') {
      const requestedLoss = Math.max(
        effect.minLoss,
        Math.min(effect.maxLoss, Math.round(next * effect.percent)),
      );
      if (next > balance.economy.statusPressureFloor) {
        next = Math.max(balance.economy.statusPressureFloor, next - requestedLoss);
      }
    }
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
  const afterAuthored = applyMoneyEffects(
    state.stats.money,
    [...(effects ?? []), ...extraEffects],
    balance,
  );
  const afterRecurring = Math.max(
    balance.money.min,
    afterAuthored + economyBreakdown(state, balance, card).total,
  );
  return afterRecurring - state.stats.money;
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
