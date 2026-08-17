import assert from 'node:assert/strict';
import { loadContentNode } from './load';
import { NarrativeEngine } from '../src/engine/engine';
import { cardStoryAdvanceDays, storyElapsedDays, storyYear } from '../src/engine/timeline';

const content = loadContentNode();
const engine = new NarrativeEngine(content);

{
  const state = engine.newRun('timeline-opening');
  assert.equal(engine.getStoryElapsedDays(state), 1);
  assert.equal(engine.getStoryYear(state), 1);
  engine.commitChoice(state, 'left');
  assert.equal(engine.getStoryElapsedDays(state), 22, 'entry choice should advance the authored 21 days');
}

{
  const state = engine.newRun('timeline-old-save');
  state.run.currentAct = 'network';
  state.run.actTurn = 2;
  state.run.elapsedStoryDays = undefined;
  assert.equal(storyElapsedDays(state, content.balance), 801, 'old saves should derive time from act chronology');
}

{
  const state = engine.newRun('timeline-card-override');
  state.run.currentAct = 'power';
  const crisis = content.cards[content.balance.economy.rescue.cardId];
  assert.equal(cardStoryAdvanceDays(state, content.balance, crisis), 1);
  const normalPowerCard = Object.values(content.cards).find(
    (card) => card.act === 'power' && card.metadata?.storyTimeAdvanceDays === undefined,
  );
  assert.ok(normalPowerCard);
  assert.equal(cardStoryAdvanceDays(state, content.balance, normalPowerCard), 35);
}

assert.equal(storyYear(1), 1);
assert.equal(storyYear(365), 1);
assert.equal(storyYear(366), 2);
assert.equal(storyYear(2191), 7);

console.log('TIMELINE TESTS OK');
