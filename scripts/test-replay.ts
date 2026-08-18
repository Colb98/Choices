// Replay variety checks: seeded slots, the Act 0 pool, ending progress, new endings.
import assert from 'node:assert/strict';
import { evaluateCondition, seedBucket } from '../src/engine/conditions';
import { NarrativeEngine } from '../src/engine/engine';
import { discoveredCount, endingToTease, listedEndings } from '../src/ui/endings';
import type { GameState, MetaSave } from '../src/engine/types';
import { loadContentNode } from './load';

const content = loadContentNode();
const engine = new NarrativeEngine(content);

// ---------------------------------------------------------------- seed_bucket
{
  for (const seed of ['a', 'b', 'run-42', 'x'.repeat(30)]) {
    for (const n of [2, 3, 5]) {
      const b = seedBucket(seed, n);
      assert.ok(b >= 0 && b < n);
      assert.equal(seedBucket(seed, n), b, 'deterministic per seed');
    }
  }
  const state = engine.newRun('bucket-cond');
  const b = seedBucket(state.run.seed, 3);
  assert.equal(evaluateCondition(state, { type: 'seed_bucket', buckets: 3, bucket: b }), true);
  assert.equal(evaluateCondition(state, { type: 'seed_bucket', buckets: 3, bucket: (b + 1) % 3 }), false);
  // Spread: over many seeds every bucket is used.
  const seen = new Set<number>();
  for (let i = 0; i < 60; i++) seen.add(seedBucket(`spread-${i}`, 3));
  assert.equal(seen.size, 3, 'buckets are all reachable');
}

// ---------------------------------------------------------------- Act 0 pool
const PLEDGE = ['act0_constituent_land_case', 'act0_first_parliament_speech', 'act0_first_interview', 'act0_mentor_advice'];
const SLOT_A = ['act0_inherited_staff', 'act0_first_petition', 'act0_ministry_photo'];
const SLOT_B = ['act0_briefing_binder', 'act0_predecessor_call'];
function playAct0(seed: string) {
  const state = engine.newRun(seed);
  const order: string[] = [];
  let g = 0;
  while (state.run.currentAct === 'entry' && g++ < 20) {
    const card = engine.currentCard(state);
    order.push(card.id);
    engine.commitChoice(state, 'left', {});
  }
  return { state, order };
}
{
  const combos = new Set<string>();
  const orders = new Set<string>();
  for (let i = 0; i < 40; i++) {
    const { state, order } = playAct0(`act0-${i}`);
    assert.equal(order.length, 8, `Act 0 is eight turns (${order.join(' > ')})`);
    assert.equal(order[0], 'act0_appointment_day', 'appointment always opens');
    assert.equal(order[7], 'act0_private_dinner_invitation', 'the dinner always closes');
    assert.ok(SLOT_A.includes(order[2]), `slot A at act-turn 2 (${order[2]})`);
    assert.ok(SLOT_B.includes(order[4]), `slot B at act-turn 4 (${order[4]})`);
    for (const p of PLEDGE) assert.ok(order.includes(p), `every pledge scene appears (${p})`);
    assert.equal(state.run.currentAct, 'rise');
    combos.add(`${order[2]}+${order[4]}`);
    orders.add(order.filter((id) => PLEDGE.includes(id)).join('>'));
    // Determinism: replaying the same seed gives the same Act 0.
    assert.deepEqual(playAct0(`act0-${i}`).order, order);
  }
  assert.ok(combos.size >= 5, `slot combinations vary across seeds (${combos.size} of 6 seen)`);
  assert.ok(orders.size >= 6, `pledge order varies across seeds (${orders.size} orders seen)`);
}

// ---------------------------------------------------------------- endings & progress
{
  const ids = new Set(content.endings.map((e) => e.id));
  for (const id of ['ending_open_file', 'ending_arrangement', 'ending_statement', 'ending_settled']) assert.ok(ids.has(id), id);
  const listed = listedEndings(content);
  assert.equal(listed.length, content.endings.length - 1, 'fallback is unlisted');
  const meta: MetaSave = { version: 1, completedRuns: 0, discoveredEndings: [], quoteUnlocked: false };
  assert.equal(discoveredCount(content, meta), 0);
  meta.discoveredEndings.push('ending_fallback', 'ending_settled');
  meta.completedRuns = 2;
  assert.equal(discoveredCount(content, meta), 1, 'fallback does not count');
  const tease = endingToTease(content, meta)!;
  assert.ok(tease && tease.id !== 'ending_settled' && tease.id !== 'ending_fallback');
  meta.completedRuns = 3;
  const tease2 = endingToTease(content, meta)!;
  assert.notEqual(tease2.id, tease.id, 'the tease rotates between runs');
  assert.notEqual(tease.id, 'ending_bankrupt', 'bankruptcy is never dangled as a goal');
  meta.discoveredEndings = listed.map((e) => e.id).filter((id) => id !== 'ending_bankrupt');
  assert.equal(endingToTease(content, meta), undefined, 'nothing left to tease');
  for (const e of listed) assert.ok(content.endings.find((x) => x.id === e.id), e.id);

  // Every ending reachable from the aftermath resolves to an authored fate: A/B × the fork flags.
  const base = (): GameState => {
    const s = engine.newRun('ending-matrix');
    s.stats.power = 45; // below protected/untouchable, above scapegoat
    return s;
  };
  const eval_ = (flags: string[]) => { const s = base(); s.flags.push(...flags); return engine.evaluateEnding(s).id; };
  assert.equal(eval_(['flag_charges_allowed']), 'ending_open_file');
  assert.equal(eval_(['flag_ally_protected']), 'ending_arrangement');
  assert.equal(eval_([]), 'ending_arrangement');
  assert.equal(eval_(['flag_drank_at_gathering', 'flag_self_driving', 'flag_confessed']), 'ending_statement');
  assert.equal(eval_(['flag_drank_at_gathering', 'flag_self_driving']), 'ending_settled');
  // Existing endings still win when their conditions hold.
  assert.equal(eval_(['flag_charges_allowed', 'flag_records_preserved']), 'ending_break_the_chain');
  assert.equal(eval_(['flag_drank_at_gathering', 'flag_self_driving', 'flag_confessed', 'flag_left_scene']), 'ending_too_late');
}

// ---------------------------------------------------------------- text variants on the always-seen beats
{
  const s = engine.newRun('variants');
  s.promises.push({ id: 'promise_major_change', madeAt: { cardId: 'act0_appointment_day', choice: 'right', turn: 0 }, status: 'held' });
  assert.equal(engine.resolveCardTextKey(s, content.cards['act1_committee_opportunity']), 'card.act1_committee_opportunity.text.v_promised');
  s.relationships.mentor = 3;
  assert.equal(engine.resolveCardTextKey(s, content.cards['act2_minister_intro']), 'card.act2_minister_intro.text.v_referred');
  s.relationships.minister = 2;
  assert.equal(engine.resolveCardTextKey(s, content.cards['act2_second_promotion']), 'card.act2_second_promotion.text.v_by_minister');
  s.precedents['precedent_special_treatment'] = 2;
  assert.equal(engine.resolveCardTextKey(s, content.cards['act1_first_promotion']), 'card.act1_first_promotion.text.v_networked');
  const plain = engine.newRun('variants-plain');
  assert.equal(engine.resolveCardTextKey(plain, content.cards['act1_first_promotion']), content.cards['act1_first_promotion'].text, 'no state, base text');
}

console.log('REPLAY TESTS OK');
