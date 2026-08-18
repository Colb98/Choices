import type {
  BalanceConfig,
  Effect,
  GameState,
  Obligation,
  PromiseDefinition,
  PromiseDomain,
  PromiseId,
  PromiseState,
  ResolvedEffectRecord,
} from './types';

export interface EffectApplication {
  records: ResolvedEffectRecord[];
  obligationsCreated: string[];
  obligationsResolved: string[];
  flagsAdded: string[];
  flagsRemoved: string[];
  promisesMade: PromiseId[];
  promisesBroken: PromiseId[];
  promisesHonored: PromiseId[];
}

/**
 * The Record's domain priority. Equality first because it is the game's
 * load-bearing pledge — the one the political thesis rests on. Used both to
 * resolve `'highest_held'` targets and to pick which pledge the witness shows
 * when one swipe breaks several.
 */
export const PROMISE_DOMAIN_PRIORITY: PromiseDomain[] = [
  'equality',
  'constituents',
  'transparency',
  'independence',
  'reform',
];

export function promisePriority(domain: PromiseDomain | undefined): number {
  const idx = domain ? PROMISE_DOMAIN_PRIORITY.indexOf(domain) : -1;
  return idx < 0 ? PROMISE_DOMAIN_PRIORITY.length : idx;
}

/** Unbroken promises (held or honored), highest domain priority first (ties: earliest made first). */
export function heldPromisesByPriority(
  state: GameState,
  promises: Record<PromiseId, PromiseDefinition>,
): PromiseState[] {
  return (state.promises ?? [])
    .filter((p) => p.status !== 'broken')
    .sort(
      (a, b) =>
        promisePriority(promises[a.id]?.domain) - promisePriority(promises[b.id]?.domain) ||
        a.madeAt.turn - b.madeAt.turn,
    );
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Applies effects in order, mutating state. All clamping lives here —
 * narrative data never clamps values itself.
 */
export function applyEffects(
  state: GameState,
  effects: Effect[] | undefined,
  balance: BalanceConfig,
  context: {
    sourceCardId: string;
    sourceChoice: 'left' | 'right';
    /** Promise registry; required to resolve `'highest_held'` targets. */
    promises?: Record<PromiseId, PromiseDefinition>;
  },
): EffectApplication {
  const app: EffectApplication = {
    records: [],
    obligationsCreated: [],
    obligationsResolved: [],
    flagsAdded: [],
    flagsRemoved: [],
    promisesMade: [],
    promisesBroken: [],
    promisesHonored: [],
  };
  if (!effects) return app;

  const resolvePromiseTarget = (target: PromiseId | 'highest_held'): PromiseState | undefined => {
    if (target === 'highest_held') {
      return heldPromisesByPriority(state, context.promises ?? {})[0];
    }
    return (state.promises ?? []).find((p) => p.id === target);
  };

  effects.forEach((effect, index) => {
    switch (effect.type) {
      case 'stat': {
        const before = state.stats[effect.stat];
        let after = effect.set !== undefined ? effect.set : before + (effect.add ?? 0);
        if (effect.stat === 'money') {
          after = Math.max(balance.money.min, after);
        } else {
          const bounds = balance.stats[effect.stat];
          after = clamp(after, bounds.min, bounds.max);
        }
        state.stats[effect.stat] = after;
        app.records.push({ type: 'stat', target: effect.stat, before, after, sourceEffectIndex: index });
        break;
      }
      case 'stat_converge': {
        const before = state.stats[effect.from];
        const target = state.stats[effect.to];
        let after = Math.round(before + (target - before) * effect.fraction);
        const bounds = balance.stats[effect.from];
        after = clamp(after, bounds.min, bounds.max);
        state.stats[effect.from] = after;
        app.records.push({
          type: 'stat_converge',
          target: effect.from,
          before,
          after,
          sourceEffectIndex: index,
        });
        break;
      }
      case 'money_pressure': {
        const before = state.stats.money;
        const requestedLoss = clamp(
          Math.round(before * effect.percent),
          effect.minLoss,
          effect.maxLoss,
        );
        const after = before <= balance.economy.statusPressureFloor
          ? before
          : Math.max(balance.economy.statusPressureFloor, before - requestedLoss);
        state.stats.money = after;
        app.records.push({
          type: 'money_pressure',
          target: 'money',
          before,
          after,
          sourceEffectIndex: index,
        });
        break;
      }
      case 'flag': {
        const has = state.flags.includes(effect.flag);
        if (effect.action === 'add' && !has) {
          state.flags.push(effect.flag);
          app.flagsAdded.push(effect.flag);
        } else if (effect.action === 'remove' && has) {
          state.flags = state.flags.filter((f) => f !== effect.flag);
          app.flagsRemoved.push(effect.flag);
        }
        app.records.push({ type: 'flag', target: effect.flag, before: has, after: effect.action === 'add', sourceEffectIndex: index });
        break;
      }
      case 'relationship': {
        const before = state.relationships[effect.character] ?? 0;
        const after = clamp(before + effect.add, balance.relationships.min, balance.relationships.max);
        state.relationships[effect.character] = after;
        app.records.push({ type: 'relationship', target: effect.character, before, after, sourceEffectIndex: index });
        break;
      }
      case 'precedent': {
        const before = state.precedents[effect.precedent] ?? 0;
        const after = Math.max(0, before + effect.add);
        state.precedents[effect.precedent] = after;
        app.records.push({ type: 'precedent', target: effect.precedent, before, after, sourceEffectIndex: index });
        break;
      }
      case 'obligation_add': {
        // Idempotent per obligation id: re-accepting the same authored favor
        // does not duplicate the debt object.
        if (!state.obligations.some((o) => o.id === effect.id)) {
          const obligation: Obligation = {
            id: effect.id,
            creditor: effect.creditor,
            sourceCardId: context.sourceCardId,
            sourceChoice: context.sourceChoice,
            createdTurn: state.run.turn,
            weight: effect.weight,
            tags: effect.tags ?? [],
            status: 'active',
          };
          state.obligations.push(obligation);
          app.obligationsCreated.push(effect.id);
          app.records.push({ type: 'obligation_add', target: effect.id, sourceEffectIndex: index });
        }
        break;
      }
      case 'obligation_resolve': {
        const candidates = state.obligations
          .filter((o) => o.status === 'active')
          .filter((o) => (effect.obligationId ? o.id === effect.obligationId : true))
          .filter((o) => (effect.creditor ? o.creditor === effect.creditor : true))
          .filter((o) => (effect.tag ? o.tags.includes(effect.tag) : true))
          .sort((a, b) => a.createdTurn - b.createdTurn);
        const amount = effect.obligationId ? 1 : (effect.amount ?? 1);
        for (const o of candidates.slice(0, amount)) {
          o.status = effect.resolution;
          o.resolvedTurn = state.run.turn;
          o.resolvedByCardId = context.sourceCardId;
          app.obligationsResolved.push(o.id);
          app.records.push({ type: 'obligation_resolve', target: o.id, after: effect.resolution, sourceEffectIndex: index });
        }
        break;
      }
      case 'thread': {
        const active = state.narrative.activeThreads;
        if (effect.action === 'activate' && !active.includes(effect.thread)) active.push(effect.thread);
        if (effect.action !== 'activate') {
          state.narrative.activeThreads = active.filter((t) => t !== effect.thread);
        }
        app.records.push({ type: 'thread', target: effect.thread, after: effect.action, sourceEffectIndex: index });
        break;
      }
      case 'promise_make': {
        // A promise is only made once; re-pledging the same words is not a
        // second promise. It is recorded at the card that made it, in the
        // player's own words, so it can be thrown back verbatim.
        state.promises ??= [];
        if (!state.promises.some((p) => p.id === effect.promise)) {
          state.promises.push({
            id: effect.promise,
            madeAt: { cardId: context.sourceCardId, choice: context.sourceChoice, turn: state.run.turn },
            status: 'held',
          });
          app.promisesMade.push(effect.promise);
          app.records.push({ type: 'promise_make', target: effect.promise, after: 'held', sourceEffectIndex: index });
        }
        break;
      }
      case 'promise_break':
      case 'promise_honor': {
        // Never a lock, never priced. Only an unbroken promise can be broken,
        // and only a plainly held one can be honored; a card that can break a
        // promise plays identically for a player who never made it — no
        // witness, no trace.
        const target = resolvePromiseTarget(effect.promise);
        if (!target || target.status === 'broken') break;
        if (effect.type === 'promise_honor' && target.status !== 'held') break;
        const before = target.status;
        const after = effect.type === 'promise_break' ? 'broken' : 'honored_under_pressure';
        target.status = after;
        target.resolvedTurn = state.run.turn;
        target.resolvedByCardId = context.sourceCardId;
        (effect.type === 'promise_break' ? app.promisesBroken : app.promisesHonored).push(target.id);
        app.records.push({ type: effect.type, target: target.id, before, after, sourceEffectIndex: index });
        break;
      }
    }
  });

  return app;
}
