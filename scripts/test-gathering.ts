import assert from 'node:assert/strict';
import { loadContentNode } from './load';
import { NarrativeEngine } from '../src/engine/engine';
import type { ChoiceHistoryEntry, GameState, Obligation } from '../src/engine/types';

const content = loadContentNode();
const engine = new NarrativeEngine(content);
const card = content.cards.gathering_transport_drunk;

const historyEntry = (
  turn: number,
  cardId: string,
  choiceTextKey: string,
): ChoiceHistoryEntry => ({
  turn,
  cardId,
  choice: 'right',
  choiceTextKey,
  timestamp: turn,
  effectsApplied: [],
  obligationsCreated: [],
  obligationsResolved: [],
  flagsAdded: [],
  flagsRemoved: [],
  scheduledEventIds: [],
});

const obligation = (index: number): Obligation => ({
  id: `test_inner_circle_${index}`,
  creditor: 'minister',
  sourceCardId: 'gathering_future_support',
  sourceChoice: 'right',
  createdTurn: index + 1,
  weight: 1,
  tags: ['inner_circle'],
  status: 'active',
});

function transportState(): GameState {
  const state = engine.newRun('gathering-lock');
  state.run.currentAct = 'gathering';
  state.run.currentCardId = card.id;
  state.flags.push('flag_dismissed_driver', 'flag_drank_at_gathering');
  state.history.push(
    historyEntry(1, 'gathering_arrival', 'card.gathering_arrival.right'),
    historyEntry(2, 'gathering_drink', 'card.gathering_drink.right'),
  );
  return state;
}

{
  const state = transportState();
  state.obligations.push(obligation(0), obligation(1), obligation(2));
  assert.equal(
    engine.resolveChoice(state, card, 'left').textKey,
    'card.gathering_transport_drunk.left.locked',
  );
  const lock = engine.getLockState(state, card, 'left');
  assert.equal(lock.kind, 'hard');
  if (lock.kind === 'hard') {
    assert.deepEqual(
      lock.flashbacks.map((item) => [item.cardId, item.choiceTextKey]),
      [
        ['gathering_arrival', 'card.gathering_arrival.right'],
        ['gathering_drink', 'card.gathering_drink.right'],
      ],
    );
  }
}

{
  const state = transportState();
  state.obligations.push(obligation(0), obligation(1));
  assert.equal(
    engine.resolveChoice(state, card, 'left').textKey,
    'card.gathering_transport_drunk.left.costly',
  );
  assert.equal(engine.getLockState(state, card, 'left').kind, 'cost');
}

{
  const state = transportState();
  state.flags = state.flags.filter((flag) => flag !== 'flag_dismissed_driver');
  assert.equal(
    engine.resolveChoice(state, card, 'left').textKey,
    'card.gathering_transport_drunk.left',
  );
  assert.equal(engine.getLockState(state, card, 'left').kind, 'free');
}

console.log('GATHERING LOCK TESTS OK');
