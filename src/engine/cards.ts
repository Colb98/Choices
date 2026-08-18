import type { CardDefinition } from './types';

/**
 * A `continue` card authors ONE choice (`left`); the engine, history and
 * scheduler still see two sides, so mirror it. Same object on both sides —
 * whichever way the player taps, the same words and effects resolve.
 */
export function normalizeCard(card: CardDefinition): CardDefinition {
  if (card.interaction === 'continue' && !card.right) {
    return { ...card, right: card.left };
  }
  return card;
}
