import assert from 'node:assert/strict';
import { loadContentNode } from './load';
import { evaluateCondition } from '../src/engine/conditions';
import { NarrativeEngine } from '../src/engine/engine';

const content = loadContentNode();
const engine = new NarrativeEngine(content);

for (const id of ['coalition_whip', 'foundation_director']) {
  assert.ok(content.characters[id], `new character ${id} should be registered`);
}

const storyIds = [
  'sp_sponsor_withdrawal',
  'sp_empty_press_room',
  'sp_regional_coalition_invitation',
  'sp_civic_foundation_partnership',
  'sp_political_succession_request',
  'sp_private_capital_council',
  'sp_kingmaker',
  'sp_figurehead',
  'sp_feared_technocrat',
  'sp_marginal_officeholder',
] as const;
for (const id of storyIds) assert.ok(content.cards[id], `story ${id} should exist`);

const state = engine.newRun('standing-power-gates');
const eligible = (id: (typeof storyIds)[number], standing: number, power: number) => {
  state.stats.standing = standing;
  state.stats.power = power;
  return evaluateCondition(state, content.cards[id].conditions);
};

assert.equal(eligible('sp_sponsor_withdrawal', 24, 50), true);
assert.equal(eligible('sp_sponsor_withdrawal', 25, 50), false);
assert.equal(eligible('sp_regional_coalition_invitation', 25, 10), true);
assert.equal(eligible('sp_regional_coalition_invitation', 60, 10), false);
assert.equal(eligible('sp_private_capital_council', 60, 10), true);
assert.equal(eligible('sp_kingmaker', 60, 60), true);
assert.equal(eligible('sp_kingmaker', 60, 59), false);
assert.equal(eligible('sp_figurehead', 60, 24), true);
assert.equal(eligible('sp_feared_technocrat', 24, 60), true);
assert.equal(eligible('sp_marginal_officeholder', 24, 24), true);

state.flags.push('flag_sold_minor_office_access');
assert.equal(
  eligible('sp_feared_technocrat', 80, 10),
  true,
  'the enforcement-network route should guarantee its later callback',
);
state.flags = state.flags.filter((flag) => flag !== 'flag_sold_minor_office_access');
assert.equal(content.events.event_feared_technocrat_callback.cardId, 'sp_feared_technocrat');
assert.equal(
  content.cards.sp_marginal_officeholder.right.delayedEffects?.[0]?.eventId,
  'event_feared_technocrat_callback',
);

const pressureCards = storyIds
  .map((id) => content.cards[id])
  .filter((card) => [...(card.left.effects ?? []), ...(card.right.effects ?? [])]
    .some((effect) => effect.type === 'money_pressure'));
assert.deepEqual(
  pressureCards.map((card) => card.id).sort(),
  ['sp_empty_press_room', 'sp_figurehead', 'sp_sponsor_withdrawal'],
  'only the intended low-status stories should apply nonlethal money pressure',
);

const powerVariants: Array<[string, 'left' | 'right', string, number]> = [
  ['act1_constituent_case_callback', 'left', 'card.act1_constituent_case_callback.left.powerful', -6],
  ['act2_business_audit', 'left', 'card.act2_business_audit.left.powerful', -12],
  ['act2_hospital_funding', 'right', 'card.act2_hospital_funding.right.powerful', -12],
  ['act3_protected_contract', 'left', 'card.act3_protected_contract.left.powerful', -6],
  ['act3_authority_vote', 'left', 'card.act3_authority_vote.left.powerful', -20],
  ['aftermath_records', 'left', 'card.aftermath_records.left.powerful', -12],
];
state.stats.power = 60;
state.flags = state.flags.filter((flag) => flag !== 'flag_invested_protected_company');
for (const [cardId, side, key, powerSpend] of powerVariants) {
  const choice = engine.resolveChoice(state, content.cards[cardId], side);
  assert.equal(choice.textKey, key, `${cardId} should resolve its high-Power text`);
  const powerEffect = choice.effects?.find(
    (effect) => effect.type === 'stat' && effect.stat === 'power',
  );
  assert.equal(
    powerEffect?.type === 'stat' ? powerEffect.add : undefined,
    powerSpend,
    `${cardId} should spend the authored Power amount`,
  );
}

console.log('STANDING/POWER TESTS OK');
