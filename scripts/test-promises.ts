// The Record — promise & betrayal system checks (System Pack §8 QA list).
import assert from 'node:assert/strict';
import { evaluateCondition } from '../src/engine/conditions';
import { applyEffects } from '../src/engine/effects';
import { NarrativeEngine } from '../src/engine/engine';
import { normalizeCard } from '../src/engine/cards';
import type { CardDefinition, GameState } from '../src/engine/types';
import { loadContentNode } from './load';

const content = loadContentNode();
const engine = new NarrativeEngine(content);

const PLEDGE_SIDES: Record<string, 'left' | 'right'> = {
  act0_first_interview: 'left',
  act0_first_parliament_speech: 'left',
  act0_constituent_land_case: 'left',
  act0_appointment_day: 'right',
  act0_mentor_advice: 'right',
};
const other = (s: 'left' | 'right') => (s === 'left' ? 'right' : 'left');

/** Play the Act 0 chain, taking (or refusing) every pledge. */
function playEntry(state: GameState, pledge: boolean) {
  let guard = 0;
  while (state.run.currentAct === 'entry' && guard++ < 20) {
    const card = engine.currentCard(state);
    const pledgeSide = PLEDGE_SIDES[card.id];
    let side: 'left' | 'right' = 'left';
    if (pledgeSide) side = pledge ? pledgeSide : other(pledgeSide);
    const lock = engine.getLockState(state, card, side);
    if (lock.kind === 'hard') side = other(side);
    const res = engine.commitChoice(state, side, { payCost: engine.getLockState(state, card, side).kind === 'cost' });
    assert.equal(res.witness, undefined, `no witness can fire in Act 0 (${card.id})`);
  }
}

// ---------------------------------------------------------------- registry
assert.equal(Object.keys(content.promises).length, 5, 'five promises are registered');
for (const p of Object.values(content.promises)) assert.ok(p.pledgeKey.startsWith('promise.'), `pledge key for ${p.id}`);

// ---------------------------------------------------------------- QA #2 — silent for the uncommitted
{
  const state = engine.newRun('record-cynic');
  playEntry(state, false);
  assert.deepEqual(state.promises, [], 'a cynical opening records nothing');
  const c046 = content.cards['act3_reformist_confrontation'];
  assert.equal(
    engine.resolveCardTextKey(state, c046),
    'card.act3_reformist_confrontation.text.v_none',
    '046 names the absence for a player who never pledged',
  );
  const echo = content.cards['act_echo_inaugural'];
  state.precedents['precedent_special_treatment'] = 2;
  assert.equal(evaluateCondition(state, echo.conditions), false, '016b never appears without a promise');
  const vote = content.cards['act3_authority_vote'];
  const right = engine.resolveChoice(state, vote, 'right');
  assert.equal(right.next, undefined, '052 RIGHT is just a vote for a player holding neither pledge');
  assert.deepEqual(engine.promiseLedger(state), [], 'empty Record → record.empty line');
  // A card that can break a promise plays identically: apply the effect, nothing changes.
  const app = applyEffects(state, [{ type: 'promise_break', promise: 'promise_equal_rules' }], content.balance, {
    sourceCardId: 'x', sourceChoice: 'right', promises: content.promises,
  });
  assert.deepEqual(app.promisesBroken, []);
  assert.equal(app.records.length, 0, 'no trace for a promise never made');
}

// ---------------------------------------------------------------- maximal idealist
{
  const state = engine.newRun('record-idealist');
  playEntry(state, true);
  assert.equal(state.promises.length, 5, 'a maximal-idealist opening holds all five');
  assert.ok(state.promises.every((p) => p.status === 'held'));
  const c046 = content.cards['act3_reformist_confrontation'];
  assert.equal(engine.resolveCardTextKey(state, c046), 'card.act3_reformist_confrontation.text.v_equality');
  const echo = content.cards['act_echo_inaugural'];
  assert.equal(evaluateCondition(state, echo.conditions), false, '016b waits for the first precedent');
  state.precedents['precedent_special_treatment'] = 1;
  assert.equal(evaluateCondition(state, echo.conditions), true, '016b appears once a promise-holder has compromised');

  // Priority: one swipe breaking several promises witnesses equality first.
  state.run.currentAct = 'power';
  state.run.currentCardId = 'act3_reformist_confrontation';
  const res = engine.commitChoice(state, 'right', {});
  assert.ok(res.witness, 'breaking a held promise fires the witness');
  assert.equal(res.witness!.promiseId, 'promise_equal_rules', 'equality is witnessed first');
  assert.equal(res.witness!.pledgeKey, 'promise.equal_rules.pledge');
  assert.equal(res.witness!.madeAtCardId, 'act0_first_interview');
  const byId = Object.fromEntries(state.promises.map((p) => [p.id, p.status]));
  assert.equal(byId['promise_equal_rules'], 'broken');
  assert.equal(byId['promise_transparency'], 'broken');
  assert.equal(byId['promise_independence'], 'broken');
  assert.equal(byId['promise_constituents'], 'held');
  assert.equal(byId['promise_major_change'], 'held');
  assert.deepEqual(res.entry.promisesBroken, ['promise_equal_rules', 'promise_transparency', 'promise_independence']);
  // 046 now quotes nothing kept among the load-bearing three → base text.
  assert.equal(engine.resolveCardTextKey(state, c046), c046.text);

  // Ledger fidelity: every promise once, in the order made, correct fate —
  // and, for a broken one, the exact card and swipe that broke it.
  const ledger = engine.promiseLedger(state);
  assert.equal(ledger.length, 5);
  assert.deepEqual(ledger.map((l) => l.promiseId), state.promises.map((p) => p.id));
  assert.equal(ledger.filter((l) => l.status === 'broken').length, 3);
  const eq = ledger.find((l) => l.promiseId === 'promise_equal_rules')!;
  assert.equal(eq.moment?.cardId, 'act3_reformist_confrontation');
  assert.equal(eq.moment?.choice, 'right');
  assert.equal(eq.moment?.choiceTextKey, 'card.act3_reformist_confrontation.right');
  assert.equal(eq.moment?.cardTextKey, 'card.act3_reformist_confrontation.text.v_equality', 'the moment quotes the card as it read then');
  assert.equal(ledger.find((l) => l.promiseId === 'promise_constituents')!.moment, undefined, 'a held promise has no moment');

  // A second break of the same promise is a no-op: no witness, no record.
  const again = applyEffects(state, [{ type: 'promise_break', promise: 'promise_equal_rules' }], content.balance, {
    sourceCardId: 'y', sourceChoice: 'right', promises: content.promises,
  });
  assert.deepEqual(again.promisesBroken, []);
}

// ---------------------------------------------------------------- honor, then break
{
  const state = engine.newRun('record-honor');
  playEntry(state, true);
  const ctx = { sourceCardId: 'z', sourceChoice: 'left' as const, promises: content.promises };
  applyEffects(state, [{ type: 'promise_honor', promise: 'promise_independence' }], content.balance, ctx);
  assert.equal(state.promises.find((p) => p.id === 'promise_independence')!.status, 'honored_under_pressure');
  // Honoring twice does nothing more; honoring counts as kept for conditions.
  applyEffects(state, [{ type: 'promise_honor', promise: 'promise_independence' }], content.balance, ctx);
  assert.equal(evaluateCondition(state, { type: 'promise', promise: 'promise_independence' }), true);
  assert.equal(evaluateCondition(state, { type: 'promise', promise: 'promise_independence', status: 'held' }), false);
  // Keeping your word once is not keeping it: a later break still lands.
  const app = applyEffects(state, [{ type: 'promise_break', promise: 'promise_independence' }], content.balance, ctx);
  assert.deepEqual(app.promisesBroken, ['promise_independence']);
  assert.equal(state.promises.find((p) => p.id === 'promise_independence')!.status, 'broken');
  // highest_held resolves by domain priority among unbroken promises.
  const top = engine.heldPromises(state)[0];
  assert.equal(top.id, 'promise_equal_rules');
  applyEffects(state, [{ type: 'promise_break', promise: 'promise_equal_rules' }], content.balance, ctx);
  assert.equal(engine.heldPromises(state)[0].id, 'promise_constituents', 'constituents outranks transparency');
}

// ---------------------------------------------------------------- QA #3 — mandatory-node integrity (052b)
function voteState(seed: string) {
  const state = engine.newRun(seed);
  playEntry(state, true);
  state.run.currentAct = 'power';
  state.run.actTurn = 9;
  state.run.currentCardId = 'act3_authority_vote';
  return state;
}
{
  // Cast the vote: flag set, transparency + independence broken, witnessed.
  const state = voteState('record-vote-cast');
  const r1 = engine.commitChoice(state, 'right', {});
  assert.equal(r1.witness, undefined, '052 RIGHT itself does not break the word yet');
  assert.equal(state.flags.includes('flag_investigation_politically_controlled'), false, 'flag deferred to 052b');
  assert.equal(state.run.currentCardId, 'act3_authority_vote_betrayal', 'promise-holder is routed through 052b');
  const r2 = engine.commitChoice(state, 'right', {});
  assert.ok(r2.witness && r2.witness.promiseId === 'promise_transparency', 'casting the vote witnesses transparency');
  assert.equal(state.flags.includes('flag_investigation_politically_controlled'), true);
  const st = Object.fromEntries(state.promises.map((p) => [p.id, p.status]));
  assert.equal(st['promise_transparency'], 'broken');
  assert.equal(st['promise_independence'], 'broken');
}
{
  // Abstain: flag still set, word kept, Power paid.
  const state = voteState('record-vote-abstain');
  engine.commitChoice(state, 'right', {});
  const powerBefore = state.stats.power;
  const r2 = engine.commitChoice(state, 'left', {});
  assert.equal(r2.witness, undefined, 'abstaining is not a betrayal');
  assert.equal(state.flags.includes('flag_investigation_politically_controlled'), true, 'the room still wins');
  assert.ok(state.stats.power < powerBefore, 'abstaining costs Power');
  const st = Object.fromEntries(state.promises.map((p) => [p.id, p.status]));
  assert.equal(st['promise_transparency'], 'held');
  assert.equal(st['promise_independence'], 'held');
}
{
  // Neither pledge held (both broken earlier): 052 RIGHT is a plain vote.
  const state = voteState('record-vote-plain');
  const ctx = { sourceCardId: 'q', sourceChoice: 'right' as const, promises: content.promises };
  applyEffects(state, [
    { type: 'promise_break', promise: 'promise_transparency' },
    { type: 'promise_break', promise: 'promise_independence' },
  ], content.balance, ctx);
  const r = engine.commitChoice(state, 'right', {});
  assert.equal(r.witness, undefined);
  assert.equal(state.flags.includes('flag_investigation_politically_controlled'), true);
  assert.notEqual(state.run.currentCardId, 'act3_authority_vote_betrayal');
}
{
  // Independent authority: honored under pressure — a real Power cost.
  const state = voteState('record-vote-independent');
  const r = engine.commitChoice(state, 'left', {});
  assert.equal(r.witness, undefined);
  const st = Object.fromEntries(state.promises.map((p) => [p.id, p.status]));
  assert.equal(st['promise_transparency'], 'honored_under_pressure');
  assert.equal(st['promise_independence'], 'honored_under_pressure');
  const honored = engine.promiseLedger(state).filter((l) => l.status === 'honored_under_pressure');
  assert.equal(honored.length, 2);
  assert.ok(honored.every((l) => l.moment?.cardId === 'act3_authority_vote' && l.moment.choice === 'left'), 'kept-when-it-cost-you remembers the vote');
}

// ---------------------------------------------------------------- 016b — the same podium
{
  const state = engine.newRun('record-echo');
  playEntry(state, true);
  state.run.currentAct = 'network';
  state.precedents['precedent_special_treatment'] = 1;
  state.run.currentCardId = 'act_echo_inaugural';
  const r = engine.commitChoice(state, 'right', {});
  assert.ok(r.witness && r.witness.promiseId === 'promise_equal_rules', 'the podium hands back the load-bearing pledge');
  const state2 = engine.newRun('record-echo-2');
  playEntry(state2, true);
  state2.run.currentAct = 'network';
  state2.run.currentCardId = 'act_echo_inaugural';
  const r2 = engine.commitChoice(state2, 'left', {});
  assert.equal(r2.witness, undefined);
  assert.equal(state2.promises.find((p) => p.id === 'promise_equal_rules')!.status, 'honored_under_pressure');
}

// ---------------------------------------------------------------- QA #1 — no-lock invariant (grep-level)
for (const card of Object.values(content.cards)) {
  for (const side of [card.left, card.right]) {
    const parts = [side, ...(side.variants ?? [])];
    for (const part of parts) {
      const breaks = (part.effects ?? []).some((e) => e.type === 'promise_break');
      if (breaks) assert.equal(part.lock, undefined, `${card.id}: promise_break must never carry a lock`);
      const priced = (part.lock?.unlockEffects ?? []).some((e) => e.type.startsWith('promise_'));
      assert.equal(priced, false, `${card.id}: promise effects must never sit on an unlock price`);
    }
  }
  if (card.act === 'incident' || card.act === 'aftermath') {
    for (const side of [card.left, card.right]) {
      const all = [side.effects, ...(side.variants ?? []).map((v) => v.effects)];
      assert.equal(
        all.some((effs) => (effs ?? []).some((e) => e.type.startsWith('promise_'))),
        false,
        `${card.id}: no promise mechanics after the collision`,
      );
    }
  }
}

// ---------------------------------------------------------------- continue cards
{
  const raw = {
    id: 'x_continue', act: 'rise', interaction: 'continue', text: 'k',
    left: { text: 'k.left', next: { type: 'scheduler' } },
  } as unknown as CardDefinition;
  const norm = normalizeCard(raw);
  assert.equal(norm.right, norm.left, 'continue cards mirror the single choice to both sides');
  for (const card of Object.values(content.cards)) {
    if (card.interaction === 'continue') {
      assert.deepEqual(card.right, card.left, `${card.id}: continue card sides are identical after load`);
    }
  }
}

// ---------------------------------------------------------------- legacy save shape
{
  const state = engine.newRun('record-legacy') as Omit<GameState, 'promises'> & { promises?: GameState['promises'] };
  delete state.promises;
  assert.equal(evaluateCondition(state as GameState, { type: 'promise' }), false, 'a save without promises reads as an empty Record');
  assert.deepEqual(engine.promiseLedger(state as GameState), []);
}

console.log('PROMISE TESTS OK');
