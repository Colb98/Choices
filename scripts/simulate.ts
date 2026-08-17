// Headless narrative simulation: runs bot playthroughs to detect softlocks,
// unreachable endings, missing incident, and pathological run lengths.
import { loadContentNode } from './load';
import { NarrativeEngine } from '../src/engine/engine';
import { Rng } from '../src/engine/rng';
import type { GameState } from '../src/engine/types';

type Strategy = (
  engine: NarrativeEngine,
  state: GameState,
  rng: Rng,
) => { side: 'left' | 'right'; payCost: boolean };

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
};

const content = loadContentNode();
const engine = new NarrativeEngine(content);

const RUNS_PER_STRATEGY = Number(process.argv[2] ?? 200);
const MAX_TURNS = 400;

let failures = 0;
const endingCounts: Record<string, number> = {};
const turnCounts: number[] = [];
let incidentMisses = 0;
const lockObservations = { hard: 0, cost: 0 };

for (const [name, strategy] of Object.entries(strategies)) {
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
      if (!sawIncident) incidentMisses++;
      endingCounts[state.run.endingId!] = (endingCounts[state.run.endingId!] ?? 0) + 1;
      turnCounts.push(state.run.turn);
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
console.log(`Lock states observed: hard ${lockObservations.hard}, cost ${lockObservations.cost}`);
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
console.log('\nSIMULATION OK');
