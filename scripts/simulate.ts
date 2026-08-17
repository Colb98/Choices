// Headless narrative simulation: runs bot playthroughs to detect softlocks,
// unreachable endings, missing incident, and pathological run lengths.
import { loadContentNode } from './load';
import { NarrativeEngine } from '../src/engine/engine';
import { leverageScore } from '../src/engine/economy';
import { Rng } from '../src/engine/rng';
import type { GameState } from '../src/engine/types';

type Strategy = (
  engine: NarrativeEngine,
  state: GameState,
  rng: Rng,
) => { side: 'left' | 'right'; payCost: boolean };

const precedentFootprint = (state: GameState) => Object.values(state.precedents)
  .reduce((sum, value) => sum + Math.max(0, value), 0);

function pick(
  engine: NarrativeEngine,
  state: GameState,
  prefer: 'left' | 'right' | 'random',
  rng: Rng,
  avoidCost = false,
): { side: 'left' | 'right'; payCost: boolean } {
  const card = engine.currentCard(state);
  const locks = {
    left: engine.getLockState(state, card, 'left'),
    right: engine.getLockState(state, card, 'right'),
  };
  const order: ('left' | 'right')[] =
    prefer === 'random'
      ? rng.next() < 0.5
        ? ['left', 'right']
        : ['right', 'left']
      : prefer === 'left'
        ? ['left', 'right']
        : ['right', 'left'];

  // Prefer a free option when avoiding costs; never take a hard-locked one.
  if (avoidCost) {
    for (const side of order) if (locks[side].kind === 'free') return { side, payCost: false };
  }
  for (const side of order) {
    const lock = locks[side];
    if (lock.kind === 'free') return { side, payCost: false };
    if (lock.kind === 'cost') return { side, payCost: true };
  }
  throw new Error(`Both choices hard-locked on card ${card.id}`);
}

const strategies: Record<string, Strategy> = {
  alwaysLeft: (e, s, r) => pick(e, s, 'left', r),
  alwaysRight: (e, s, r) => pick(e, s, 'right', r),
  random: (e, s, r) => pick(e, s, 'random', r),
  avoidObligations: (e, s, r) => {
    // Prefer the choice that creates no obligations.
    const card = e.currentCard(s);
    const sides: ('left' | 'right')[] = ['left', 'right'];
    const clean = sides.filter((side) => {
      if (e.getLockState(s, card, side).kind === 'hard') return false;
      const choice = e.resolveChoice(s, card, side);
      return !(choice.effects ?? []).some((eff) => eff.type === 'obligation_add');
    });
    if (clean.length > 0) {
      const side = clean[Math.floor(r.next() * clean.length)];
      return { side, payCost: e.getLockState(s, card, side).kind === 'cost' };
    }
    return pick(e, s, 'random', r);
  },
  maximizePower: (e, s, r) => {
    const card = e.currentCard(s);
    const score = (side: 'left' | 'right') => {
      if (e.getLockState(s, card, side).kind === 'hard') return -Infinity;
      const choice = e.resolveChoice(s, card, side);
      return (choice.preview?.power ?? 0) * 2 + (choice.preview?.standing ?? 0);
    };
    const side = score('right') >= score('left') ? 'right' : 'left';
    return { side, payCost: e.getLockState(s, card, side).kind === 'cost' };
  },
  maximizeMoney: (e, s, r) => {
    const card = e.currentCard(s);
    const score = (side: 'left' | 'right') => {
      const lock = e.getLockState(s, card, side);
      if (lock.kind === 'hard') return -Infinity;
      return e.projectMoneyDelta(s, card, side, lock.kind === 'cost');
    };
    const left = score('left');
    const right = score('right');
    const side = right > left ? 'right' : left > right ? 'left' : (r.next() < 0.5 ? 'left' : 'right');
    return { side, payCost: e.getLockState(s, card, side).kind === 'cost' };
  },
  protectRunway: (e, s, r) => {
    const card = e.currentCard(s);
    const score = (side: 'left' | 'right') => {
      const lock = e.getLockState(s, card, side);
      if (lock.kind === 'hard') return -Infinity;
      const projected = structuredClone(s);
      const result = e.commitChoice(projected, side, { payCost: lock.kind === 'cost' });
      if (result.endingId === 'ending_bankrupt') return -Infinity;
      const activeWeight = projected.obligations
        .filter((o) => o.status === 'active')
        .reduce((sum, o) => sum + o.weight, 0);
      const betrayedWeight = projected.obligations
        .filter((o) => o.status === 'betrayed')
        .reduce((sum, o) => sum + o.weight, 0);
      // A runway-minded player prices future servicing and retaliation into
      // today's apparently attractive choice.
      return (
        projected.stats.money - activeWeight * 5_000 - betrayedWeight * 15_000 -
        precedentFootprint(projected) * 50_000
      );
    };
    const left = score('left');
    const right = score('right');
    const side = right > left ? 'right' : left > right ? 'left' : (r.next() < 0.5 ? 'left' : 'right');
    return { side, payCost: e.getLockState(s, card, side).kind === 'cost' };
  },
  cleanCareer: (e, s, r) => {
    const card = e.currentCard(s);
    const score = (side: 'left' | 'right') => {
      const lock = e.getLockState(s, card, side);
      if (lock.kind === 'hard') return -Infinity;
      const projected = structuredClone(s);
      e.commitChoice(projected, side, { payCost: lock.kind === 'cost' });
      // Keeping monetizable leverage at zero is the primary goal. When both
      // options have equal leverage, reject normalized shortcuts too. Then
      // prefer actual public trust and solvency.
      return (
        -leverageScore(projected, content.balance) * 1_000_000_000 +
        -precedentFootprint(projected) * 10_000_000 +
        projected.stats.publicTrustActual * 1_000_000 +
        projected.stats.money
      );
    };
    const left = score('left');
    const right = score('right');
    const side = right > left ? 'right' : left > right ? 'left' : (r.next() < 0.5 ? 'left' : 'right');
    return { side, payCost: e.getLockState(s, card, side).kind === 'cost' };
  },
  fullCorruption: (e, s, r) => {
    const card = e.currentCard(s);
    const score = (side: 'left' | 'right') => {
      const lock = e.getLockState(s, card, side);
      if (lock.kind === 'hard') return -Infinity;
      const projected = structuredClone(s);
      e.commitChoice(projected, side, { payCost: lock.kind === 'cost' });
      // Optimize the network first and current cash second. This models a
      // player who understands that one early favor compounds for acts.
      return (
        leverageScore(projected, content.balance) * 1_000_000_000 +
        projected.stats.power * 1_000_000 +
        projected.stats.money
      );
    };
    const left = score('left');
    const right = score('right');
    const side = right > left ? 'right' : left > right ? 'left' : (r.next() < 0.5 ? 'left' : 'right');
    return { side, payCost: e.getLockState(s, card, side).kind === 'cost' };
  },
};

const content = loadContentNode();
const engine = new NarrativeEngine(content);

const RUNS_PER_STRATEGY = Number(process.argv[2] ?? 200);
const MAX_TURNS = 400;

let failures = 0;
const endingCounts: Record<string, number> = {};
const turnCounts: number[] = [];
let incidentMisses = 0;
let bankruptBeforeIncident = 0;
const lockObservations = { hard: 0, cost: 0 };
const strategyStats: Record<string, {
  completed: number;
  bankrupt: number;
  turns: number[];
  finalMoney: number[];
  finalLeverage: number[];
  betrayedWeight: number[];
  precedentFootprint: number[];
  actualTrust: number[];
}> = {};

for (const [name, strategy] of Object.entries(strategies)) {
  strategyStats[name] = {
    completed: 0, bankrupt: 0, turns: [], finalMoney: [], finalLeverage: [], betrayedWeight: [],
    precedentFootprint: [], actualTrust: [],
  };
  for (let i = 0; i < RUNS_PER_STRATEGY; i++) {
    const seed = `${name}-${i}`;
    const state = engine.newRun(seed);
    const botRng = Rng.fromSeed(`bot-${seed}`);
    let sawIncident = false;
    try {
      let guard = 0;
      while (!state.run.completed && guard++ < MAX_TURNS) {
        const card = engine.currentCard(state);
        if (card.type === 'incident' || card.act === 'incident') sawIncident = true;
        for (const side of ['left', 'right'] as const) {
          const k = engine.getLockState(state, card, side).kind;
          if (k === 'hard') lockObservations.hard++;
          if (k === 'cost') lockObservations.cost++;
        }
        const { side, payCost } = strategy(engine, state, botRng);
        engine.commitChoice(state, side, { payCost });
      }
      if (!state.run.completed) {
        console.error(`FAIL [${name}#${i}] run did not complete within ${MAX_TURNS} turns (stuck at ${state.run.currentCardId}, act ${state.run.currentAct})`);
        failures++;
        continue;
      }
      const bankrupt = state.run.endingId === 'ending_bankrupt';
      if (!sawIncident && bankrupt) bankruptBeforeIncident++;
      else if (!sawIncident) incidentMisses++;
      endingCounts[state.run.endingId!] = (endingCounts[state.run.endingId!] ?? 0) + 1;
      turnCounts.push(state.run.turn);
      strategyStats[name].completed++;
      strategyStats[name].turns.push(state.run.turn);
      strategyStats[name].finalMoney.push(state.stats.money);
      strategyStats[name].finalLeverage.push(leverageScore(state, content.balance));
      strategyStats[name].precedentFootprint.push(precedentFootprint(state));
      strategyStats[name].actualTrust.push(state.stats.publicTrustActual);
      strategyStats[name].betrayedWeight.push(
        state.obligations
          .filter((obligation) => obligation.status === 'betrayed')
          .reduce((sum, obligation) => sum + obligation.weight, 0),
      );
      if (bankrupt) strategyStats[name].bankrupt++;
    } catch (err) {
      console.error(`FAIL [${name}#${i}] turn ${state.run.turn}, card ${state.run.currentCardId}: ${(err as Error).message}`);
      failures++;
    }
  }
}

turnCounts.sort((a, b) => a - b);
const median = turnCounts[Math.floor(turnCounts.length / 2)] ?? 0;
console.log(`\nRuns: ${Object.keys(strategies).length * RUNS_PER_STRATEGY}, failures: ${failures}`);
console.log(`Turns: min ${turnCounts[0] ?? 0}, median ${median}, max ${turnCounts[turnCounts.length - 1] ?? 0}`);
console.log(`Runs that never touched the incident: ${incidentMisses}`);
console.log(`Intended pre-incident bankruptcies: ${bankruptBeforeIncident}`);
console.log(`Lock states observed: hard ${lockObservations.hard}, cost ${lockObservations.cost}`);
console.log('Financial pressure by strategy:');
for (const [name, stat] of Object.entries(strategyStats)) {
  const bankruptcyRate = stat.completed > 0 ? stat.bankrupt / stat.completed : 0;
  const sortedTurns = [...stat.turns].sort((a, b) => a - b);
  const strategyMedian = sortedTurns[Math.floor(sortedTurns.length / 2)] ?? 0;
  const sortedMoney = [...stat.finalMoney].sort((a, b) => a - b);
  const medianMoney = sortedMoney[Math.floor(sortedMoney.length / 2)] ?? 0;
  const maxMoney = sortedMoney[sortedMoney.length - 1] ?? 0;
  const sortedLeverage = [...stat.finalLeverage].sort((a, b) => a - b);
  const sortedBetrayal = [...stat.betrayedWeight].sort((a, b) => a - b);
  const medianLeverage = sortedLeverage[Math.floor(sortedLeverage.length / 2)] ?? 0;
  const medianBetrayal = sortedBetrayal[Math.floor(sortedBetrayal.length / 2)] ?? 0;
  const sortedPrecedents = [...stat.precedentFootprint].sort((a, b) => a - b);
  const sortedTrust = [...stat.actualTrust].sort((a, b) => a - b);
  const medianPrecedents = sortedPrecedents[Math.floor(sortedPrecedents.length / 2)] ?? 0;
  const medianTrust = sortedTrust[Math.floor(sortedTrust.length / 2)] ?? 0;
  console.log(
    `  ${name}: ${(bankruptcyRate * 100).toFixed(1)}% bankrupt, ` +
    `median ${strategyMedian} turns, median $${Math.round(medianMoney).toLocaleString('en-US')}, ` +
    `max $${Math.round(maxMoney).toLocaleString('en-US')}, ` +
    `leverage ${medianLeverage.toFixed(1)}, precedents ${medianPrecedents}, ` +
    `actual trust ${medianTrust}, betrayed ${medianBetrayal}`,
  );
}
console.log('Ending distribution:');
for (const [id, n] of Object.entries(endingCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${id}: ${n}`);
}
const reachable = new Set(Object.keys(endingCounts));
const unreached = content.endings.filter((e) => !reachable.has(e.id));
if (unreached.length) {
  console.log(`Endings never reached by bots: ${unreached.map((e) => e.id).join(', ')}`);
}
if (failures > 0) process.exit(1);
if (incidentMisses > 0) {
  console.error('ERROR: some completed runs never reached the incident');
  process.exit(1);
}
const randomRate = strategyStats.random.bankrupt / Math.max(1, strategyStats.random.completed);
const plannedRate = strategyStats.protectRunway.bankrupt / Math.max(1, strategyStats.protectRunway.completed);
if (randomRate < plannedRate + 0.2) {
  console.error(`ERROR: random play is not punished enough (${(randomRate * 100).toFixed(1)}% vs runway-aware ${(plannedRate * 100).toFixed(1)}% bankruptcy)`);
  process.exit(1);
}
const medianMoney = (name: string) => {
  const values = [...strategyStats[name].finalMoney].sort((a, b) => a - b);
  return values[Math.floor(values.length / 2)] ?? 0;
};
const cleanMoney = medianMoney('cleanCareer');
const corruptMoney = medianMoney('fullCorruption');
if (cleanMoney < 100_000 || cleanMoney > 200_000) {
  console.error(`ERROR: clean career should finish near $100K-$200K (median $${Math.round(cleanMoney).toLocaleString('en-US')})`);
  process.exit(1);
}
if (corruptMoney < 1_000_000_000) {
  console.error(`ERROR: optimized corruption should exceed $1B (median $${Math.round(corruptMoney).toLocaleString('en-US')})`);
  process.exit(1);
}
console.log('\nSIMULATION OK');
