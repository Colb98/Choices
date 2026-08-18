import assert from 'node:assert/strict';
import { loadContentNode } from './load';
import { NarrativeEngine } from '../src/engine/engine';
import { leverageScore } from '../src/engine/economy';
import { formatCompactMoney, formatMoney, formatSignedMoney } from '../src/ui/format';

const content = loadContentNode();
const engine = new NarrativeEngine(content);
const { economy } = content.balance;

assert.equal(formatMoney(183_027), '$183,027');
assert.equal(formatMoney(1_341_364_449), '$1,341,364,449');
assert.equal(formatMoney(12_134_624_820), '$12,134,624,820');
assert.equal(formatCompactMoney(1_341_364_449), '$1.34B');
assert.equal(formatSignedMoney(12_134_624_820), '+$12.1B');

// Every authored decision in a pressure act has deterministic cash flow,
// unless the card explicitly opts out (incident and crisis interruptions do)
// or is a `continue` beat (the same turn, continued — never a charged turn).
for (const card of Object.values(content.cards)) {
  if (card.interaction === 'continue') {
    const state = engine.newRun(`coverage-${card.id}`);
    state.run.currentAct = card.act;
    assert.equal(engine.getEconomyBreakdown(state, card).total, 0, `${card.id}: continue beats consume no runway`);
    continue;
  }
  if (!economy.pressureActs.includes(card.act) || card.tags?.includes('economy_exempt')) continue;
  const state = engine.newRun(`coverage-${card.id}`);
  state.run.currentAct = card.act;
  state.run.currentCardId = card.id;
  const breakdown = engine.getEconomyBreakdown(state, card);
  assert.ok(breakdown.baseTurnCost > 0, `${card.id} should incur operating cost`);
  assert.ok(Number.isFinite(breakdown.total), `${card.id} should have deterministic cash flow`);
}

{
  const state = engine.newRun('capital-leverage');
  state.run.currentAct = 'power';
  state.relationships.mentor = 1;
  state.relationships.businessman = 2;
  state.relationships.reformist = 5;
  state.precedents.precedent_special_treatment = 1;
  state.precedents.precedent_media_interference = 1;
  const breakdown = engine.getEconomyBreakdown(state, engine.currentCard(state));

  assert.equal(leverageScore(state, content.balance), 4.5);
  assert.equal(breakdown.capitalRelationshipPoints, 3);
  assert.equal(breakdown.precedentPoints, 2);
  assert.equal(breakdown.civicIncome, 1_333);
  assert.equal(breakdown.leverageIncome, 450);
  assert.equal(breakdown.precedentExposureCost, 5_000);
  assert.equal(
    breakdown.total,
    breakdown.institutionalIncome + 1_333 + 450 - breakdown.baseTurnCost - 5_000,
  );
}

{
  const state = engine.newRun('preview');
  const card = engine.currentCard(state);
  assert.equal(engine.projectMoneyDelta(state, card, 'left'), 4035);
  assert.equal(engine.resolveChoice(state, card, 'left').preview?.money, 1);
}

{
  const state = engine.newRun('status-pressure');
  const pressureCard = {
    ...engine.currentCard(state),
    id: 'test_status_pressure',
    tags: ['economy_exempt'],
    left: {
      text: 'test.left',
      effects: [{ type: 'money_pressure' as const, percent: 0.25, minLoss: 15_000, maxLoss: 1_000_000 }],
    },
    right: { text: 'test.right' },
  };
  state.run.currentCardId = pressureCard.id;
  content.cards[pressureCard.id] = pressureCard;
  state.stats.money = 200_000;
  assert.equal(engine.projectMoneyDelta(state, pressureCard, 'left'), -50_000);
  engine.commitChoice(state, 'left');
  assert.equal(state.stats.money, 150_000);

  state.run.currentCardId = pressureCard.id;
  state.run.completed = false;
  state.stats.money = 45_000;
  assert.equal(engine.projectMoneyDelta(state, pressureCard, 'left'), -5_000);
  engine.commitChoice(state, 'left');
  assert.equal(state.stats.money, economy.statusPressureFloor);
  assert.equal(state.run.endingId, undefined, 'status pressure cannot directly bankrupt the player');
  delete content.cards[pressureCard.id];
}

{
  const state = engine.newRun('obligation-pressure');
  state.run.currentAct = 'rise';
  state.obligations.push({
    id: 'test_obligation', creditor: 'mentor', weight: 3, tags: [], status: 'active',
    sourceCardId: content.balance.start.firstCardId, sourceChoice: 'left', createdTurn: 0,
  });
  const cost = engine.getEconomyBreakdown(state, engine.currentCard(state));
  assert.equal(cost.baseTurnCost, 500);
  assert.equal(cost.activeObligationCost, 300);
  assert.equal(cost.institutionalIncome, 535);
  assert.equal(cost.civicIncome, 4000);
  assert.equal(cost.total, 3735);
}

{
  const state = engine.newRun('rescue-then-bankruptcy');
  const intendedNext = 'act0_constituent_land_case';
  state.stats.money = 1;
  state.stats.standing = 0;
  state.stats.power = 0;
  state.stats.publicTrustActual = 0;
  state.stats.publicTrustPerceived = 0;
  engine.commitChoice(state, 'left');

  assert.equal(state.run.currentCardId, economy.rescue.cardId, 'first insolvency should force the lifeline');
  assert.equal(state.narrative.financialResumeCardId, intendedNext, 'the interrupted route should be retained');
  assert.equal(state.stats.money, 0);

  engine.commitChoice(state, 'left');
  assert.equal(state.stats.money, 60_000);
  assert.ok(state.flags.includes(economy.rescue.rescueFlag));
  assert.ok(state.obligations.some((o) => o.id === 'obligation_emergency_lifeline_01' && o.status === 'active'));
  assert.equal(state.run.currentCardId, intendedNext, 'accepting rescue should resume the interrupted story');

  state.run.currentAct = content.balance.start.act;
  state.run.currentCardId = content.balance.start.firstCardId;
  state.stats.money = 1;
  state.stats.standing = 0;
  state.stats.power = 0;
  state.stats.publicTrustActual = 0;
  state.stats.publicTrustPerceived = 0;
  const result = engine.commitChoice(state, 'left');
  assert.equal(result.endingId, 'ending_bankrupt', 'second insolvency should end the run');
  assert.equal(state.run.completed, true);
  assert.ok(state.flags.includes(economy.rescue.bankruptcyFlag));
}

console.log('ECONOMY TESTS OK');
