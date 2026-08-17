import assert from 'node:assert/strict';
import { evaluateCondition } from '../src/engine/conditions';
import { applyEffects } from '../src/engine/effects';
import { NarrativeEngine } from '../src/engine/engine';
import type { Effect } from '../src/engine/types';
import { loadContentNode } from './load';

const content = loadContentNode();
const engine = new NarrativeEngine(content);

const storyIds = [
  'trust_empty_town_hall',
  'trust_volunteer_wave',
  'trust_polling_bubble',
  'trust_quiet_reservoir',
  'trust_public_mandate',
  'trust_beloved_figurehead',
  'trust_coercive_stability',
  'trust_abandoned_office',
] as const;

for (const id of storyIds) assert.ok(content.cards[id], `Trust story ${id} should exist`);

const state = engine.newRun('public-trust-tests');
state.stats.publicTrustActual = 30;
state.stats.publicTrustPerceived = 55;
assert.equal(
  evaluateCondition(state, { type: 'trust_gap', op: '>=', value: 25 }),
  true,
  'Trust gap should be perceived minus actual',
);
assert.equal(
  evaluateCondition(state, { type: 'trust_gap', op: '<', value: 25 }),
  false,
);

state.stats.publicTrustActual = 20;
state.stats.publicTrustPerceived = 80;
applyEffects(
  state,
  [{
    type: 'stat_converge',
    from: 'publicTrustPerceived',
    to: 'publicTrustActual',
    fraction: 0.75,
  }],
  content.balance,
  { sourceCardId: 'test', sourceChoice: 'left' },
);
assert.equal(state.stats.publicTrustPerceived, 35, '75% convergence should leave 25% of the gap');
assert.equal(state.stats.publicTrustActual, 20, 'convergence should not change the target stat');

const pollEffects = content.cards.act3_public_poll.left.effects ?? [];
assert.ok(
  pollEffects.some((effect) => effect.type === 'stat_converge'),
  'the accurate polling card should use real convergence',
);
assert.equal(
  pollEffects.some(
    (effect) => effect.type === 'stat' && effect.stat === 'publicTrustPerceived' && effect.add === -6,
  ),
  false,
  'the old hardcoded polling fallback should be removed',
);

state.flags = [];
state.stats.publicTrustActual = 30;
state.stats.publicTrustPerceived = 60;
state.stats.power = 70;
assert.equal(evaluateCondition(state, content.cards.trust_empty_town_hall.conditions), true);
assert.equal(evaluateCondition(state, content.cards.trust_polling_bubble.conditions), true);
assert.equal(evaluateCondition(state, content.cards.trust_coercive_stability.conditions), true);
assert.equal(evaluateCondition(state, content.cards.trust_abandoned_office.conditions), false);

state.stats.publicTrustActual = 70;
state.stats.publicTrustPerceived = 50;
state.stats.power = 70;
assert.equal(evaluateCondition(state, content.cards.trust_quiet_reservoir.conditions), true);
assert.equal(evaluateCondition(state, content.cards.trust_public_mandate.conditions), true);
state.stats.power = 20;
assert.equal(evaluateCondition(state, content.cards.trust_beloved_figurehead.conditions), true);
state.stats.publicTrustActual = 70;
state.flags.push('flag_staged_town_hall');
assert.equal(
  evaluateCondition(state, content.cards.trust_abandoned_office.conditions),
  true,
  'staging the empty town hall should guarantee the later low-Power callback',
);
state.flags = state.flags.filter((flag) => flag !== 'flag_staged_town_hall');

for (const id of storyIds) {
  const card = content.cards[id];
  const expectedActFlag = card.act === 'rise'
    ? 'flag_trust_story_rise_seen'
    : card.act === 'network'
      ? 'flag_trust_story_network_seen'
      : 'flag_trust_story_power_seen';
  for (const side of ['left', 'right'] as const) {
    assert.ok(
      card[side].effects?.some(
        (effect) => effect.type === 'flag' && effect.flag === expectedActFlag && effect.action === 'add',
      ),
      `${id}:${side} should close the Trust story slot for its act`,
    );
  }
}

const coercive = content.cards.trust_coercive_stability;
assert.ok(
  coercive.right.effects?.some(
    (effect) => effect.type === 'flag' && effect.flag === 'flag_trust_suppression_escalated',
  ),
  'the suppression branch should explicitly open the Collapse route',
);
assert.ok(
  coercive.left.effects?.some(
    (effect) => effect.type === 'flag' && effect.flag === 'flag_trust_recovery_started',
  ),
  'the costly branch should explicitly begin recovery',
);

const collapseState = engine.newRun('collapse-stage-test');
collapseState.stats.power = 75;
collapseState.stats.publicTrustActual = 12;
collapseState.flags.push('flag_reports_removed');
assert.notEqual(
  engine.evaluateEnding(collapseState).id,
  'ending_collapse',
  'low Trust and removed reports should not collapse without the earlier civic-crisis suppression stage',
);
collapseState.flags.push('flag_trust_suppression_escalated');
assert.equal(
  engine.evaluateEnding(collapseState).id,
  'ending_collapse',
  'staged suppression plus very low Trust and high Power should reach Collapse',
);

// The new effect must remain part of the serializable DSL union.
const serializable: Effect = {
  type: 'stat_converge',
  from: 'publicTrustPerceived',
  to: 'publicTrustActual',
  fraction: 0.5,
};
assert.equal(JSON.parse(JSON.stringify(serializable)).type, 'stat_converge');

console.log('PUBLIC TRUST TESTS OK');
