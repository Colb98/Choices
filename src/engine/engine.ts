import { collectConditions, evaluateCondition, matchingObligations } from './conditions';
import { applyEffects } from './effects';
import { Rng, hashSeed, makeRunSeed } from './rng';
import type {
  CardDefinition,
  ChoiceDefinition,
  ChoiceHistoryEntry,
  ChoiceLock,
  ChoicePreview,
  ChoiceVariant,
  ContentBundle,
  DelayedEffect,
  Effect,
  EndingDefinition,
  GameState,
  NarrativeSelectionResult,
  NextDirective,
  ScheduledEvent,
} from './types';

export interface ResolvedChoice {
  textKey: string;
  preview?: ChoicePreview;
  effects?: Effect[];
  delayedEffects?: DelayedEffect[];
  lock?: ChoiceLock;
  next?: NextDirective;
}

export interface FlashbackItem {
  cardId: string;
  choice: 'left' | 'right';
  /** i18n key of the card body at the time of the choice */
  cardTextKey: string;
  /** i18n key of the option the player picked */
  choiceTextKey?: string;
  turn?: number;
}

export type LockState =
  | { kind: 'free' }
  | { kind: 'cost'; unlockEffects: Effect[]; flashbacks: FlashbackItem[] }
  | { kind: 'hard'; flashbacks: FlashbackItem[] };

export interface CommitResult {
  entry: ChoiceHistoryEntry;
  next?: NarrativeSelectionResult;
  endingId?: string;
}

export class NarrativeEngine {
  constructor(private content: ContentBundle) {}

  // -------------------------------------------------------------------------
  // Run lifecycle

  newRun(seed?: string): GameState {
    const runSeed = seed ?? makeRunSeed();
    const { balance } = this.content;
    const state: GameState = {
      run: {
        runId: runSeed,
        seed: runSeed,
        turn: 0,
        currentAct: balance.start.act,
        actTurn: 0,
        startedAt: Date.now(),
        currentCardId: balance.start.firstCardId,
        completed: false,
      },
      stats: { ...balance.start.stats },
      flags: [],
      relationships: {},
      precedents: {},
      obligations: [],
      history: [],
      scheduledEvents: [],
      seenCards: {},
      narrative: {
        completedBeats: [],
        activeThreads: [],
        recentCards: [],
      },
      rngState: hashSeed(runSeed),
    };
    return state;
  }

  card(cardId: string): CardDefinition {
    const card = this.content.cards[cardId];
    if (!card) throw new Error(`Unknown card: ${cardId}`);
    return card;
  }

  currentCard(state: GameState): CardDefinition {
    if (!state.run.currentCardId) throw new Error('No current card');
    return this.card(state.run.currentCardId);
  }

  // -------------------------------------------------------------------------
  // Choice resolution (variants + locks)

  resolveChoice(state: GameState, card: CardDefinition, side: 'left' | 'right'): ResolvedChoice {
    const base: ChoiceDefinition = side === 'left' ? card.left : card.right;
    let variant: ChoiceVariant | undefined;
    if (base.variants) {
      variant = base.variants.find((v) => evaluateCondition(state, v.conditions));
    }
    return {
      textKey: variant?.text ?? base.text,
      preview: variant?.preview ?? base.preview,
      effects: variant?.effects ?? base.effects,
      delayedEffects: variant?.delayedEffects ?? base.delayedEffects,
      lock: variant?.lock ?? base.lock,
      next: variant?.next ?? base.next,
    };
  }

  getLockState(state: GameState, card: CardDefinition, side: 'left' | 'right'): LockState {
    const choice = this.resolveChoice(state, card, side);
    const lock = choice.lock;
    if (!lock) return { kind: 'free' };
    if (!evaluateCondition(state, lock.condition)) return { kind: 'free' };
    const flashbacks = this.buildFlashbacks(state, lock);
    if (lock.mode === 'cost') {
      return { kind: 'cost', unlockEffects: lock.unlockEffects ?? [], flashbacks };
    }
    return { kind: 'hard', flashbacks };
  }

  private buildFlashbacks(state: GameState, lock: ChoiceLock): FlashbackItem[] {
    const reason = lock.reason ?? { source: 'obligations' as const };
    const max = reason.maxFlashbacks ?? 3;
    const sources: { cardId: string; choice: 'left' | 'right'; turn?: number; weight: number }[] = [];

    if (reason.source === 'obligations') {
      const obligationConds = collectConditions(lock.condition, 'obligation');
      const seen = new Set<string>();
      const conds = obligationConds.length > 0 ? obligationConds : [{ type: 'obligation' as const }];
      for (const cond of conds) {
        for (const o of matchingObligations(state, cond)) {
          if (seen.has(o.id)) continue;
          seen.add(o.id);
          sources.push({ cardId: o.sourceCardId, choice: o.sourceChoice, turn: o.createdTurn, weight: o.weight });
        }
      }
      sources.sort((a, b) => b.weight - a.weight || (a.turn ?? 0) - (b.turn ?? 0));
    } else if (reason.source === 'history') {
      const historyConds = collectConditions(lock.condition, 'history');
      for (const cond of historyConds) {
        if (!cond.exists) continue;
        const entry = state.history.find(
          (h) => h.cardId === cond.cardId && (cond.choice === undefined || h.choice === cond.choice),
        );
        if (entry) sources.push({ cardId: entry.cardId, choice: entry.choice, turn: entry.turn, weight: 1 });
      }
    } else {
      for (const src of reason.explicitSources ?? []) {
        const entry = state.history.find(
          (h) => h.cardId === src.cardId && (src.choice === undefined || h.choice === src.choice),
        );
        if (entry) sources.push({ cardId: entry.cardId, choice: entry.choice, turn: entry.turn, weight: 1 });
      }
    }

    // Deduplicate by card, keep chronological order for presentation.
    const byCard = new Map<string, (typeof sources)[number]>();
    for (const s of sources.slice(0, max)) {
      if (!byCard.has(s.cardId)) byCard.set(s.cardId, s);
    }
    return [...byCard.values()]
      .sort((a, b) => (a.turn ?? 0) - (b.turn ?? 0))
      .map((s) => {
        const entry = state.history.find((h) => h.cardId === s.cardId && h.choice === s.choice);
        const card = this.content.cards[s.cardId];
        return {
          cardId: s.cardId,
          choice: s.choice,
          cardTextKey: card?.text ?? '',
          choiceTextKey: entry?.choiceTextKey,
          turn: s.turn,
        };
      });
  }

  // -------------------------------------------------------------------------
  // Committing a choice

  commitChoice(
    state: GameState,
    side: 'left' | 'right',
    opts: { payCost?: boolean } = {},
  ): CommitResult {
    const card = this.currentCard(state);
    const choice = this.resolveChoice(state, card, side);
    const lockState = this.getLockState(state, card, side);
    if (lockState.kind === 'hard') {
      throw new Error(`Choice ${card.id}:${side} is hard-locked`);
    }
    if (lockState.kind === 'cost' && !opts.payCost) {
      throw new Error(`Choice ${card.id}:${side} requires payCost`);
    }

    const rng = new Rng(state.rngState);
    const context = { sourceCardId: card.id, sourceChoice: side };

    const effects: Effect[] = [...(choice.effects ?? [])];
    if (lockState.kind === 'cost' && opts.payCost) {
      effects.push(...lockState.unlockEffects);
    }
    const app = applyEffects(state, effects, this.content.balance, context);

    // Schedule delayed consequences; ranges are rolled NOW and stored, so a
    // reload can never reroll them.
    const scheduledIds: string[] = [];
    for (const d of choice.delayedEffects ?? []) {
      const id = `sch_${state.run.turn}_${card.id}_${d.eventId}`;
      const ev: ScheduledEvent = {
        id,
        eventId: d.eventId,
        sourceCardId: card.id,
        sourceChoice: side,
        scheduledAtTurn: state.run.turn,
        priority: d.priority ?? 50,
        conditionsAtTrigger: d.conditionsAtTrigger,
        onConditionFail: d.onConditionFail ?? 'discard',
        replacementEventId: d.replacementEventId,
        status: 'pending',
      };
      if (d.delay.type === 'turns') ev.triggerAtTurn = state.run.turn + d.delay.turns;
      else if (d.delay.type === 'turn_range') ev.triggerAtTurn = state.run.turn + rng.int(d.delay.min, d.delay.max);
      else {
        ev.triggerAct = d.delay.act;
        ev.minActTurn = d.delay.minActTurn ?? 0;
      }
      state.scheduledEvents.push(ev);
      scheduledIds.push(id);
    }

    const entry: ChoiceHistoryEntry = {
      turn: state.run.turn,
      cardId: card.id,
      choice: side,
      choiceTextKey: choice.textKey,
      paidCost: lockState.kind === 'cost' ? true : undefined,
      timestamp: Date.now(),
      effectsApplied: app.records,
      obligationsCreated: app.obligationsCreated,
      obligationsResolved: app.obligationsResolved,
      flagsAdded: app.flagsAdded,
      flagsRemoved: app.flagsRemoved,
      scheduledEventIds: scheduledIds,
    };
    state.history.push(entry);

    state.seenCards[card.id] = (state.seenCards[card.id] ?? 0) + 1;
    state.narrative.recentCards.push(card.id);
    const window = this.content.balance.scheduler.recentCardWindow;
    if (state.narrative.recentCards.length > window) {
      state.narrative.recentCards = state.narrative.recentCards.slice(-window);
    }

    state.run.turn += 1;
    state.run.actTurn += 1;

    // Explicit routing
    let endingNow = false;
    const next = choice.next ?? { type: 'scheduler' as const };
    switch (next.type) {
      case 'card':
        state.narrative.forcedNextCardId = next.cardId;
        break;
      case 'event': {
        const ev = this.content.events[next.eventId];
        if (ev) state.narrative.forcedNextCardId = ev.cardId;
        break;
      }
      case 'act':
        this.enterAct(state, next.act);
        break;
      case 'ending_check':
        endingNow = true;
        break;
      case 'scheduler':
        break;
    }

    state.rngState = rng.getState();

    if (endingNow) {
      const ending = this.evaluateEnding(state);
      state.narrative.pendingEndingId = ending.id;
      state.run.completed = true;
      state.run.endingId = ending.id;
      state.run.currentCardId = undefined;
      return { entry, endingId: ending.id };
    }

    const selection = this.getNextCard(state);
    if (selection.source === 'ending') {
      return { entry, endingId: state.run.endingId };
    }
    state.run.currentCardId = selection.cardId;
    return { entry, next: selection };
  }

  private enterAct(state: GameState, act: string) {
    state.run.currentAct = act;
    state.run.actTurn = 0;
  }

  // -------------------------------------------------------------------------
  // Scheduler

  getNextCard(state: GameState): NarrativeSelectionResult {
    const rng = new Rng(state.rngState);
    try {
      for (let guard = 0; guard < this.content.acts.length + 2; guard++) {
        // 0. Explicit routing always wins.
        if (state.narrative.forcedNextCardId) {
          const cardId = state.narrative.forcedNextCardId;
          state.narrative.forcedNextCardId = undefined;
          this.markBeatIfAny(state, cardId);
          return { cardId, source: 'forced' };
        }

        // 1. Mandatory story beats for the current act.
        const beat = this.dueBeat(state);
        if (beat) {
          state.narrative.completedBeats.push(beat.id);
          return { cardId: beat.cardId, source: 'mandatory_beat', reason: beat.id };
        }

        // 2. Triggered scheduled consequences.
        const eventCard = this.dueScheduledEvent(state);
        if (eventCard) return eventCard;

        // 3. Contextual pool.
        const pool = this.contextualPool(state);
        if (pool.length > 0) {
          const picked = rng.weighted(pool, (c) => c.weight ?? this.content.balance.scheduler.defaultCardWeight);
          return { cardId: picked.id, source: 'contextual' };
        }

        // 4. Pool exhausted but the act still has pending beats → pull the
        // earliest one forward instead of skipping the act. Beat-ladder acts
        // (gathering / incident / aftermath) have no contextual cards at all
        // and progress exclusively through this path.
        const pending = this.pendingBeats(state);
        if (pending.length > 0) {
          const beat = pending[0];
          state.narrative.completedBeats.push(beat.id);
          return { cardId: beat.cardId, source: 'mandatory_beat', reason: `${beat.id} (forced, pool empty)` };
        }

        // 5. Nothing left in this act → advance act, or end the run.
        const nextAct = this.nextActAfter(state.run.currentAct);
        if (nextAct) {
          this.enterAct(state, nextAct);
          continue;
        }
        const ending = this.evaluateEnding(state);
        state.narrative.pendingEndingId = ending.id;
        state.run.completed = true;
        state.run.endingId = ending.id;
        state.run.currentCardId = undefined;
        return { cardId: '', source: 'ending', reason: ending.id };
      }
      throw new Error('Scheduler failed to select a card');
    } finally {
      state.rngState = rng.getState();
    }
  }

  private markBeatIfAny(state: GameState, cardId: string) {
    const beat = this.content.beats.find((b) => b.cardId === cardId);
    if (beat && !state.narrative.completedBeats.includes(beat.id)) {
      state.narrative.completedBeats.push(beat.id);
    }
  }

  private pendingBeats(state: GameState) {
    return this.content.beats
      .filter((b) => b.act === state.run.currentAct)
      .filter((b) => !(b.once && state.narrative.completedBeats.includes(b.id)))
      .filter((b) => !(b.once && (state.seenCards[b.cardId] ?? 0) > 0))
      .filter((b) => evaluateCondition(state, b.conditions))
      .sort(
        (a, b) =>
          (a.earliestActTurn ?? 0) - (b.earliestActTurn ?? 0) || b.priority - a.priority,
      );
  }

  private dueBeat(state: GameState) {
    const candidates = this.pendingBeats(state)
      .filter((b) => state.run.actTurn >= (b.earliestActTurn ?? 0))
      .sort((a, b) => b.priority - a.priority || (a.earliestActTurn ?? 0) - (b.earliestActTurn ?? 0));
    return candidates[0];
  }

  private dueScheduledEvent(state: GameState): NarrativeSelectionResult | undefined {
    const due = state.scheduledEvents
      .filter((e) => e.status === 'pending')
      .filter((e) =>
        e.triggerAtTurn !== undefined
          ? state.run.turn >= e.triggerAtTurn
          : e.triggerAct === state.run.currentAct && state.run.actTurn >= (e.minActTurn ?? 0),
      )
      .sort((a, b) => b.priority - a.priority || a.scheduledAtTurn - b.scheduledAtTurn);

    for (const ev of due) {
      const def = this.content.events[ev.eventId];
      if (!def) {
        ev.status = 'cancelled';
        continue;
      }
      if (def.once && (state.seenCards[def.cardId] ?? 0) > 0) {
        ev.status = 'expired';
        continue;
      }
      const ok =
        evaluateCondition(state, def.conditions) && evaluateCondition(state, ev.conditionsAtTrigger);
      if (!ok) {
        switch (ev.onConditionFail ?? 'discard') {
          case 'discard':
            ev.status = 'cancelled';
            break;
          case 'retry_later':
            ev.triggerAtTurn = state.run.turn + 2;
            break;
          case 'replace':
            if (ev.replacementEventId) {
              ev.eventId = ev.replacementEventId;
              ev.replacementEventId = undefined;
            } else {
              ev.status = 'cancelled';
            }
            break;
        }
        continue;
      }
      ev.status = 'triggered';
      return {
        cardId: def.cardId,
        source: 'scheduled_event',
        reason: `${ev.sourceCardId}:${ev.sourceChoice} @turn ${ev.scheduledAtTurn}`,
      };
    }
    return undefined;
  }

  private contextualPool(state: GameState): CardDefinition[] {
    return Object.values(this.content.cards).filter((card) => {
      if (card.act !== state.run.currentAct) return false;
      const type = card.type ?? 'contextual';
      if (type !== 'contextual') return false;
      if (card.once && (state.seenCards[card.id] ?? 0) > 0) return false;
      if (state.narrative.recentCards.includes(card.id)) return false;
      if (card.cooldownTurns) {
        const lastSeen = [...state.history].reverse().find((h) => h.cardId === card.id);
        if (lastSeen && state.run.turn - lastSeen.turn < card.cooldownTurns) return false;
      }
      if (card.minTurn !== undefined && state.run.turn < card.minTurn) return false;
      if (card.maxTurn !== undefined && state.run.turn > card.maxTurn) return false;
      if (card.minActTurn !== undefined && state.run.actTurn < card.minActTurn) return false;
      if (!evaluateCondition(state, card.conditions)) return false;
      return true;
    });
  }

  private nextActAfter(actId: string): string | undefined {
    const acts = [...this.content.acts].sort((a, b) => a.order - b.order);
    const idx = acts.findIndex((a) => a.id === actId);
    if (idx < 0 || idx === acts.length - 1) return undefined;
    return acts[idx + 1].id;
  }

  // -------------------------------------------------------------------------
  // Endings

  evaluateEnding(state: GameState): EndingDefinition {
    const valid = this.content.endings
      .filter((e) => evaluateCondition(state, e.conditions))
      .sort((a, b) => b.priority - a.priority);
    if (valid.length === 0) {
      // The validator guarantees a fallback ending exists; this is belt-and-braces.
      const fallback = [...this.content.endings].sort((a, b) => a.priority - b.priority)[0];
      if (!fallback) throw new Error('No endings defined');
      return fallback;
    }
    return valid[0];
  }

  ending(endingId: string): EndingDefinition {
    const e = this.content.endings.find((x) => x.id === endingId);
    if (!e) throw new Error(`Unknown ending: ${endingId}`);
    return e;
  }
}
