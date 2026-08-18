import { hashSeed } from './rng';
import type {
  AllCondition,
  AnyCondition,
  CompareOp,
  Condition,
  ConditionExpression,
  GameState,
  NotCondition,
  ObligationCondition,
  PromiseCondition,
} from './types';

function cmp(op: CompareOp, a: number, b: number): boolean {
  switch (op) {
    case '>': return a > b;
    case '>=': return a >= b;
    case '<': return a < b;
    case '<=': return a <= b;
    case '==': return a === b;
    case '!=': return a !== b;
  }
}

function isAll(e: ConditionExpression): e is AllCondition {
  return 'all' in e;
}
function isAny(e: ConditionExpression): e is AnyCondition {
  return 'any' in e;
}
function isNot(e: ConditionExpression): e is NotCondition {
  return 'not' in e;
}

export function matchingObligations(state: GameState, c: ObligationCondition) {
  const status = c.status ?? 'active';
  return state.obligations.filter((o) => {
    if (o.status !== status) return false;
    if (c.creditor && o.creditor !== c.creditor) return false;
    if (c.tag && !o.tags.includes(c.tag)) return false;
    return true;
  });
}

function evaluatePrimitive(state: GameState, c: Condition, explain?: string[]): boolean {
  switch (c.type) {
    case 'stat': {
      const v = state.stats[c.stat];
      const r = cmp(c.op, v, c.value);
      explain?.push(`stat ${c.stat} ${c.op} ${c.value}: ${r ? 'PASS' : 'FAIL'} (${v})`);
      return r;
    }
    case 'trust_gap': {
      const v = state.stats.publicTrustPerceived - state.stats.publicTrustActual;
      const r = cmp(c.op, v, c.value);
      explain?.push(`trust gap ${c.op} ${c.value}: ${r ? 'PASS' : 'FAIL'} (${v})`);
      return r;
    }
    case 'flag': {
      const has = state.flags.includes(c.flag);
      const r = has === c.exists;
      explain?.push(`flag ${c.flag} exists=${c.exists}: ${r ? 'PASS' : 'FAIL'}`);
      return r;
    }
    case 'relationship': {
      const v = state.relationships[c.character] ?? 0;
      const r = cmp(c.op, v, c.value);
      explain?.push(`rel ${c.character} ${c.op} ${c.value}: ${r ? 'PASS' : 'FAIL'} (${v})`);
      return r;
    }
    case 'precedent': {
      const v =
        c.precedent === '*'
          ? Object.values(state.precedents).reduce((sum, n) => sum + Math.max(0, n), 0)
          : state.precedents[c.precedent] ?? 0;
      const r = cmp(c.op, v, c.value);
      explain?.push(`pre ${c.precedent} ${c.op} ${c.value}: ${r ? 'PASS' : 'FAIL'} (${v})`);
      return r;
    }
    case 'obligation': {
      const matches = matchingObligations(state, c);
      const totalWeight = matches.reduce((s, o) => s + o.weight, 0);
      let r = true;
      if (c.minWeight !== undefined && totalWeight < c.minWeight) r = false;
      if (c.minCount !== undefined && matches.length < c.minCount) r = false;
      if (c.minWeight === undefined && c.minCount === undefined && matches.length === 0) r = false;
      explain?.push(
        `obligation ${c.creditor ?? '*'}/${c.tag ?? '*'}: ${r ? 'PASS' : 'FAIL'} (count=${matches.length}, weight=${totalWeight})`,
      );
      return r;
    }
    case 'history': {
      const found = state.history.some(
        (h) => h.cardId === c.cardId && (c.choice === undefined || h.choice === c.choice),
      );
      const r = found === c.exists;
      explain?.push(`history ${c.cardId}${c.choice ? ':' + c.choice : ''} exists=${c.exists}: ${r ? 'PASS' : 'FAIL'}`);
      return r;
    }
    case 'turn': {
      const v = c.scope === 'run' ? state.run.turn : state.run.actTurn;
      const r = cmp(c.op, v, c.value);
      explain?.push(`turn(${c.scope}) ${c.op} ${c.value}: ${r ? 'PASS' : 'FAIL'} (${v})`);
      return r;
    }
    case 'act': {
      const r = state.run.currentAct === c.act;
      explain?.push(`act == ${c.act}: ${r ? 'PASS' : 'FAIL'} (${state.run.currentAct})`);
      return r;
    }
    case 'seen_card': {
      const n = state.seenCards[c.cardId] ?? 0;
      let r = true;
      if (c.minCount !== undefined && n < c.minCount) r = false;
      if (c.maxCount !== undefined && n > c.maxCount) r = false;
      if (c.minCount === undefined && c.maxCount === undefined) r = n > 0;
      explain?.push(`seen ${c.cardId}: ${r ? 'PASS' : 'FAIL'} (${n})`);
      return r;
    }
    case 'seed_bucket': {
      const v = seedBucket(state.run.seed, c.buckets);
      const r = v === c.bucket;
      explain?.push(`seed_bucket ${c.bucket}/${c.buckets}: ${r ? 'PASS' : 'FAIL'} (${v})`);
      return r;
    }
    case 'promise': {
      const n = matchingPromises(state, c).length;
      const r = n >= (c.minCount ?? 1);
      explain?.push(
        `promise ${c.promise ?? '*'}/${c.status ?? 'kept'} >= ${c.minCount ?? 1}: ${r ? 'PASS' : 'FAIL'} (${n})`,
      );
      return r;
    }
  }
}

/** Which of `buckets` this run's seed falls into (salted so it decorrelates from the RNG stream). */
export function seedBucket(seed: string, buckets: number): number {
  const n = Math.max(1, Math.floor(buckets));
  return hashSeed(`bucket:${seed}`) % n;
}

export function matchingPromises(state: GameState, c: PromiseCondition) {
  const status = c.status ?? 'kept';
  return (state.promises ?? []).filter((p) => {
    if (c.promise && p.id !== c.promise) return false;
    if (status === 'any') return true;
    if (status === 'kept') return p.status !== 'broken';
    return p.status === status;
  });
}

export function evaluateCondition(
  state: GameState,
  expr: ConditionExpression | undefined,
  explain?: string[],
): boolean {
  if (!expr) return true;
  if (isAll(expr)) return expr.all.every((e) => evaluateCondition(state, e, explain));
  if (isAny(expr)) {
    // evaluate all for complete explanations, then OR
    const results = expr.any.map((e) => evaluateCondition(state, e, explain));
    return results.some(Boolean);
  }
  if (isNot(expr)) return !evaluateCondition(state, expr.not, explain);
  return evaluatePrimitive(state, expr, explain);
}

/** Collect primitive conditions of a given type anywhere in an expression tree. */
export function collectConditions<T extends Condition['type']>(
  expr: ConditionExpression | undefined,
  type: T,
  out: Extract<Condition, { type: T }>[] = [],
): Extract<Condition, { type: T }>[] {
  if (!expr) return out;
  if (isAll(expr)) expr.all.forEach((e) => collectConditions(e, type, out));
  else if (isAny(expr)) expr.any.forEach((e) => collectConditions(e, type, out));
  else if (isNot(expr)) collectConditions(expr.not, type, out);
  else if ((expr as Condition).type === type) out.push(expr as Extract<Condition, { type: T }>);
  return out;
}
