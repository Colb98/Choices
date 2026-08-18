// Ambiguity dilemmas + `continue` interaction checks (Narrative Ambiguity & Pacing Addendum).
import assert from 'node:assert/strict';
import { NarrativeEngine } from '../src/engine/engine';
import { loadContentNode } from './load';
import type { GameState } from '../src/engine/types';

const content = loadContentNode();
const engine = new NarrativeEngine(content);

function at(state: GameState, act: string, cardId: string, actTurn = 5) {
  state.run.currentAct = act;
  state.run.actTurn = actTurn;
  state.run.currentCardId = cardId;
}

// ---------------------------------------------------------------- continue beats are the same turn, continued
{
  const state = engine.newRun('dil-continue');
  at(state, 'rise', 'dil_queue_setup');
  const turn = state.run.turn;
  const actTurn = state.run.actTurn;
  const days = engine.getStoryElapsedDays(state);
  const money = state.stats.money;
  const res = engine.commitChoice(state, 'right', {}); // either side: same words
  assert.equal(state.run.turn, turn, 'a continue beat does not spend a turn');
  assert.equal(state.run.actTurn, actTurn, 'a continue beat does not spend an act-turn');
  assert.equal(engine.getStoryElapsedDays(state), days, 'no story time passes on a continue beat');
  assert.equal(state.stats.money, money, 'no runway is consumed on a continue beat');
  assert.equal(res.next?.cardId, 'dil_queue_decision', 'setup routes straight to the decision');
  assert.equal(res.entry.choiceTextKey, 'card.dil_queue_setup.continue');
  // The decision is a real turn.
  const r2 = engine.commitChoice(state, 'left', {});
  assert.equal(state.run.turn, turn + 1);
  assert.equal(state.run.actTurn, actTurn + 1);
  assert.ok(state.flags.includes('flag_queue_call_made'));
  assert.equal(state.precedents['precedent_queue_intervention'], 1);
  assert.equal(r2.entry.scheduledEventIds.length, 1, 'the callback is scheduled');
  const ev = state.scheduledEvents.find((e) => e.id === r2.entry.scheduledEventIds[0])!;
  assert.equal(ev.eventId, 'event_queue_callback');
  assert.ok(ev.triggerAtTurn! >= state.run.turn + 2 && ev.triggerAtTurn! <= state.run.turn + 5, 'trigger turn rolled and persisted');
}

// ---------------------------------------------------------------- callbacks read the state they were caused by
{
  const cb = content.cards['dil_queue_callback'];
  const called = engine.newRun('dil-cb-called');
  called.flags.push('flag_queue_call_made');
  assert.equal(engine.resolveCardTextKey(called, cb), 'card.dil_queue_callback.text.v_called');
  const trustBefore = called.stats.publicTrustActual;
  at(called, 'rise', 'dil_queue_callback');
  engine.commitChoice(called, 'left', {});
  assert.equal(called.stats.publicTrustActual, trustBefore - 2, 'called: the queue erodes where the player cannot see it');

  const refused = engine.newRun('dil-cb-refused');
  refused.flags.push('flag_queue_letter_sent');
  assert.equal(engine.resolveCardTextKey(refused, cb), cb.text);
  const perceivedBefore = refused.stats.publicTrustPerceived;
  at(refused, 'rise', 'dil_queue_callback');
  engine.commitChoice(refused, 'left', {});
  assert.equal(refused.stats.publicTrustPerceived, perceivedBefore - 1, 'refused: word spreads that the office does nothing');
}

// ---------------------------------------------------------------- witness safety: four outcomes, all from state
{
  const card = content.cards['dil_witness_aftermath'];
  const mk = (flags: string[], patch: (s: GameState) => void = () => {}) => {
    const s = engine.newRun('dil-witness-' + flags.join('-'));
    s.flags.push(...flags);
    patch(s);
    return s;
  };
  assert.equal(engine.resolveCardTextKey(mk(['flag_case_public'], (s) => { s.relationships.reformist = 2; }), card), 'card.dil_witness_aftermath.text.v_published_safe');
  assert.equal(engine.resolveCardTextKey(mk(['flag_case_public']), card), 'card.dil_witness_aftermath.text.v_published_exposed');
  assert.equal(engine.resolveCardTextKey(mk(['flag_witness_protection_started'], (s) => { s.relationships.minister = 4; }), card), 'card.dil_witness_aftermath.text.v_sealed_lost');
  assert.equal(engine.resolveCardTextKey(mk(['flag_witness_protection_started']), card), card.text);
  // Effects follow the same branches.
  const exposed = mk(['flag_case_public']);
  at(exposed, 'network', 'dil_witness_aftermath');
  engine.commitChoice(exposed, 'left', {});
  assert.ok(exposed.flags.includes('flag_whistleblowers_wary'));
  const lost = mk(['flag_witness_protection_started'], (s) => { s.precedents['precedent_investigation_interference'] = 1; });
  at(lost, 'network', 'dil_witness_aftermath');
  engine.commitChoice(lost, 'left', {});
  assert.ok(lost.flags.includes('flag_sealed_material_lost'));
}

// ---------------------------------------------------------------- privacy vs accountability (aftermath beat)
{
  const beat = content.beats.find((b) => b.id === 'beat_aftermath_privacy')!;
  assert.equal(beat.act, 'aftermath');
  assert.equal(beat.cardId, 'dil_privacy_setup');

  // Sealed under a politically controlled investigation: the record loses its spine.
  const s = engine.newRun('dil-privacy-sealed-lost');
  s.flags.push('flag_investigation_politically_controlled', 'flag_records_preserved');
  at(s, 'aftermath', 'dil_privacy_setup', 4);
  assert.equal(engine.resolveCardTextKey(s, engine.currentCard(s)), 'card.dil_privacy_setup.text.v_controlled', 'the setup names the custody risk out loud');
  engine.commitChoice(s, 'left', {});
  assert.equal(s.run.currentCardId, 'dil_privacy_decision');
  engine.commitChoice(s, 'right', {});
  assert.equal(s.run.currentCardId, 'dil_privacy_consequence');
  assert.equal(engine.resolveCardTextKey(s, engine.currentCard(s)), 'card.dil_privacy_consequence.text.v_sealed_lost');
  engine.commitChoice(s, 'left', {});
  assert.equal(s.flags.includes('flag_records_preserved'), false, 'sealed material in captured custody disappears');
  assert.ok(s.flags.includes('flag_sealed_material_lost'));

  // Sealed under an independent one: private stays private, record intact.
  const k = engine.newRun('dil-privacy-sealed-kept');
  k.flags.push('flag_investigation_independent', 'flag_records_preserved');
  at(k, 'aftermath', 'dil_privacy_setup', 4);
  assert.equal(engine.resolveCardTextKey(k, engine.currentCard(k)), content.cards['dil_privacy_setup'].text);
  engine.commitChoice(k, 'left', {});
  engine.commitChoice(k, 'right', {});
  assert.equal(engine.resolveCardTextKey(k, engine.currentCard(k)), 'card.dil_privacy_consequence.text.v_sealed_kept');
  engine.commitChoice(k, 'left', {});
  assert.ok(k.flags.includes('flag_records_preserved'));

  // Published whole: the record cannot be deleted now; the family pays.
  const p = engine.newRun('dil-privacy-public');
  p.flags.push('flag_investigation_politically_controlled');
  at(p, 'aftermath', 'dil_privacy_setup', 4);
  engine.commitChoice(p, 'left', {});
  engine.commitChoice(p, 'left', {});
  assert.equal(engine.resolveCardTextKey(p, engine.currentCard(p)), 'card.dil_privacy_consequence.text.v_public');
  engine.commitChoice(p, 'left', {});
  assert.ok(p.flags.includes('flag_records_preserved'));
  assert.equal(p.relationships.family_rep, -5);
}

// ---------------------------------------------------------------- the swipe direction is no longer a tell
{
  // Among the five dilemma decisions, the Power-positive option must not always sit on the same side.
  const decisions = ['dil_queue_decision', 'dil_witness_decision', 'dil_reform_decision', 'dil_clinics_decision', 'dil_privacy_decision'];
  const powerSide: string[] = [];
  for (const id of decisions) {
    const c = content.cards[id];
    const pw = (side: 'left' | 'right') =>
      (c[side].effects ?? []).filter((e) => e.type === 'stat' && (e.stat === 'power' || e.stat === 'standing'))
        .reduce((sum, e) => sum + ((e as { add?: number }).add ?? 0), 0);
    powerSide.push(pw('left') > pw('right') ? 'left' : pw('left') < pw('right') ? 'right' : 'even');
  }
  assert.ok(powerSide.includes('left') && powerSide.includes('right'), `dilemmas alternate the status-positive side: ${powerSide.join(',')}`);
}

// ---------------------------------------------------------------- every dilemma decision returns later
for (const id of ['dil_queue_decision', 'dil_witness_decision', 'dil_reform_decision', 'dil_clinics_decision']) {
  const c = content.cards[id];
  for (const side of ['left', 'right'] as const) {
    assert.ok((c[side].delayedEffects ?? []).length > 0, `${id}:${side} schedules a callback`);
  }
}
for (const side of ['left', 'right'] as const) {
  assert.equal(content.cards['dil_privacy_decision'][side].next?.type, 'card', 'the aftermath dilemma carries an immediate consequence beat');
}

console.log('DILEMMA TESTS OK');
