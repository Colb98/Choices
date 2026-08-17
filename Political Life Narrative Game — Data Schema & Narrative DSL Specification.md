# Political Life Narrative Game — Data Schema & Narrative DSL Specification

## 1. Goals

The narrative system should be:

- fully data-driven;
- deterministic after a choice is committed;
- easy to author in JSON;
- strongly validated;
- easy to debug;
- traceable from consequence back to the exact previous decision;
- resistant to branching explosion;
- independent from Phaser rendering code.

Narrative JSON should describe:

> **What should happen.**

TypeScript systems should decide:

> **How that behavior is executed and presented.**

Avoid arbitrary executable expressions inside JSON.

Bad:

```json
{
  "condition": "state.power > 50 && state.flags.includes('knows_editor')"
}
```

Preferred:

```json
{
  "all": [
    {
      "type": "stat",
      "stat": "power",
      "op": ">=",
      "value": 50
    },
    {
      "type": "flag",
      "flag": "knows_editor",
      "exists": true
    }
  ]
}
```

This makes narrative data:

- statically validatable;
- refactorable;
- searchable;
- testable;
- safe from arbitrary code execution.

---

# 2. High-Level Runtime Model

The game runtime state should be divided into five categories:

```ts
interface GameState {
    run: RunState;
    stats: PlayerStats;

    flags: Set<string>;
    relationships: Record<CharacterId, number>;
    precedents: Record<PrecedentId, number>;

    obligations: Obligation[];
    history: ChoiceHistoryEntry[];

    scheduledEvents: ScheduledEvent[];
    seenCards: Record<CardId, number>;

    narrative: NarrativeRuntimeState;
}
```

These categories have different purposes.

### Stats

Visible player resources.

### Flags

Binary facts about the world.

### Relationships

How recurring characters currently relate to the player.

### Precedents

How normalized certain behaviors have become.

### Obligations

Specific favors and debts owed to other actors.

### History

Exact decisions previously made.

### Scheduled Events

Consequences that will occur later.

### Narrative State

Current act, mandatory story beats, and scheduler state.

---

# 3. Identifier Types

Use semantic string IDs everywhere.

Example TypeScript aliases:

```ts
type CardId = string;
type CharacterId = string;
type FlagId = string;
type EventId = string;
type EndingId = string;
type ObligationId = string;
type PrecedentId = string;
type ActId = string;
```

Recommended naming convention:

```text
act1_constituent_factory_01
act2_business_permit_02
act3_media_scandal_01

flag_knows_editor
flag_supported_reform_bill

precedent_media_suppression
precedent_nepotism

event_contract_scandal
event_editor_calls_back
```

IDs must be:

- lowercase;
- snake_case;
- globally unique within their data type;
- stable after release.

Never use display text as an identifier.

---

# 4. Player Stats

```ts
interface PlayerStats {
    money: number;

    standing: number;
    power: number;

    publicTrustActual: number;
    publicTrustPerceived: number;
}
```

Constraints:

```text
standing: 0–100
power: 0–100
publicTrustActual: 0–100
publicTrustPerceived: 0–100
money: >= 0 unless debt is intentionally supported
```

All bounded values should be clamped by `EffectResolver`.

Narrative data should not manually clamp values.

---

# 5. Run State

```ts
interface RunState {
    runId: string;
    seed: string;

    turn: number;

    currentAct: ActId;
    actTurn: number;

    startedAt: number;

    currentCardId?: CardId;

    completed: boolean;
}
```

`turn` increments after every committed choice.

`actTurn` increments only within the current act.

When changing act:

```ts
actTurn = 0;
```

---

# 6. Narrative Runtime State

```ts
interface NarrativeRuntimeState {
    completedBeats: string[];

    activeThreads: NarrativeThreadId[];

    recentCards: CardId[];

    forcedNextCardId?: CardId;

    pendingEndingId?: EndingId;
}
```

`recentCards` is used to prevent repetition.

Recommended recent history size:

```text
5–8 cards
```

---

# 7. Card Definition

The primary authored unit is a `CardDefinition`.

```ts
interface CardDefinition {
    id: CardId;

    act: ActId;

    type?: CardType;

    speaker?: CharacterId;

    title?: string;
    text: string;

    illustration?: IllustrationRef;
    background?: string;

    left: ChoiceDefinition;
    right: ChoiceDefinition;

    conditions?: ConditionExpression;

    weight?: number;

    once?: boolean;

    cooldownTurns?: number;

    minTurn?: number;
    maxTurn?: number;

    tags?: string[];

    metadata?: CardMetadata;
}
```

---

# 8. Card Types

```ts
type CardType =
    | "contextual"
    | "story"
    | "consequence"
    | "incident"
    | "aftermath"
    | "ending";
```

### contextual

Reusable narrative event from a pool.

### story

Major mandatory story beat.

### consequence

Usually triggered by a previous decision.

### incident

Part of the final collision sequence.

### aftermath

Post-incident political and moral decisions.

### ending

Final narrative result.

Card type primarily assists:

- scheduler priority;
- debugging;
- analytics;
- authoring organization.

---

# 9. Card Metadata

Metadata is ignored by gameplay.

```ts
interface CardMetadata {
    authorNote?: string;
    designIntent?: string;

    expectedDurationSeconds?: number;

    contentWarnings?: string[];

    debugTags?: string[];
}
```

Example:

```json
{
  "metadata": {
    "designIntent": "Tempt the player with first meaningful political shortcut.",
    "expectedDurationSeconds": 20
  }
}
```

Useful for narrative production without affecting runtime.

---

# 10. Choice Definition

```ts
interface ChoiceDefinition {
    id?: string;

    text: string;

    preview?: ChoicePreview;

    effects?: Effect[];

    delayedEffects?: DelayedEffect[];

    lock?: ChoiceLock;

    next?: NextDirective;

    tags?: string[];
}
```

A choice should normally contain only:

- visible wording;
- estimated consequences;
- actual effects;
- optional delayed consequences;
- optional lock;
- optional explicit next narrative instruction.

---

# 11. Choice Preview

Preview is intentionally separate from actual effects.

```ts
interface ChoicePreview {
    money?: Trend;
    standing?: Trend;
    power?: Trend;
    publicTrust?: TrustTrend;
}
```

```ts
type Trend =
    | -3
    | -2
    | -1
    | 0
    | 1
    | 2
    | 3;
```

Meaning:

```text
-3 = ↓↓↓
-2 = ↓↓
-1 = ↓
 0 = —
+1 = ↑
+2 = ↑↑
+3 = ↑↑↑
```

Public Trust:

```ts
type TrustTrend =
    | "unknown"
    | "down_uncertain"
    | "up_uncertain"
    | "down"
    | "up"
    | "strong_down"
    | "strong_up";
```

The preview does not have to match the actual effect exactly.

Example:

```json
{
  "preview": {
    "standing": 1,
    "power": 2,
    "publicTrust": "up_uncertain"
  }
}
```

Actual effects:

```json
{
  "effects": [
    {
      "type": "stat",
      "stat": "standing",
      "add": 4
    },
    {
      "type": "stat",
      "stat": "power",
      "add": 9
    },
    {
      "type": "stat",
      "stat": "publicTrustActual",
      "add": -2
    },
    {
      "type": "stat",
      "stat": "publicTrustPerceived",
      "add": 4
    }
  ]
}
```

This can represent:

> The political class believes the move is popular, but the real public response is somewhat negative.

---

# 12. Condition DSL

Every conditional system should use one shared DSL.

```ts
type ConditionExpression =
    | Condition
    | AllCondition
    | AnyCondition
    | NotCondition;
```

---

# 13. Boolean Composition

### ALL

```ts
interface AllCondition {
    all: ConditionExpression[];
}
```

Example:

```json
{
  "all": [
    {
      "type": "stat",
      "stat": "power",
      "op": ">=",
      "value": 50
    },
    {
      "type": "flag",
      "flag": "flag_knows_editor",
      "exists": true
    }
  ]
}
```

---

### ANY

```ts
interface AnyCondition {
    any: ConditionExpression[];
}
```

Example:

```json
{
  "any": [
    {
      "type": "flag",
      "flag": "flag_editor_friend",
      "exists": true
    },
    {
      "type": "relationship",
      "character": "editor",
      "op": ">=",
      "value": 3
    }
  ]
}
```

---

### NOT

```ts
interface NotCondition {
    not: ConditionExpression;
}
```

Example:

```json
{
  "not": {
    "type": "flag",
    "flag": "flag_editor_arrested",
    "exists": true
  }
}
```

---

# 14. Primitive Condition Types

Recommended primitive condition types:

```ts
type Condition =
    | StatCondition
    | FlagCondition
    | RelationshipCondition
    | PrecedentCondition
    | ObligationCondition
    | HistoryCondition
    | TurnCondition
    | ActCondition
    | SeenCardCondition;
```

Do not add new condition types unless there is a concrete narrative requirement.

---

# 15. Stat Condition

```ts
interface StatCondition {
    type: "stat";

    stat:
        | "money"
        | "standing"
        | "power"
        | "publicTrustActual"
        | "publicTrustPerceived";

    op:
        | ">"
        | ">="
        | "<"
        | "<="
        | "=="
        | "!=";

    value: number;
}
```

Example:

```json
{
  "type": "stat",
  "stat": "power",
  "op": ">=",
  "value": 70
}
```

---

# 16. Flag Condition

```ts
interface FlagCondition {
    type: "flag";

    flag: FlagId;

    exists: boolean;
}
```

Example:

```json
{
  "type": "flag",
  "flag": "flag_accepted_protected_investment",
  "exists": true
}
```

---

# 17. Relationship Condition

```ts
interface RelationshipCondition {
    type: "relationship";

    character: CharacterId;

    op:
        | ">"
        | ">="
        | "<"
        | "<="
        | "==";

    value: number;
}
```

Example:

```json
{
  "type": "relationship",
  "character": "minister",
  "op": ">=",
  "value": 3
}
```

---

# 18. Precedent Condition

```ts
interface PrecedentCondition {
    type: "precedent";

    precedent: PrecedentId;

    op:
        | ">"
        | ">="
        | "<"
        | "<="
        | "==";

    value: number;
}
```

Example:

```json
{
  "type": "precedent",
  "precedent": "precedent_media_suppression",
  "op": ">=",
  "value": 2
}
```

---

# 19. Obligation Condition

Obligations require richer filtering.

```ts
interface ObligationCondition {
    type: "obligation";

    creditor?: CharacterId;

    tag?: string;

    minWeight?: number;

    minCount?: number;

    status?: ObligationStatus;
}
```

Example:

```json
{
  "type": "obligation",
  "creditor": "minister",
  "minWeight": 3,
  "status": "active"
}
```

Meaning:

> The player currently owes the Minister at least weight 3.

Example:

```json
{
  "type": "obligation",
  "tag": "inner_circle",
  "minCount": 3,
  "status": "active"
}
```

Meaning:

> At least three active obligations exist toward members of the inner circle.

---

# 20. History Condition

History should support exact narrative callbacks.

```ts
interface HistoryCondition {
    type: "history";

    cardId: CardId;

    choice?: "left" | "right";

    exists: boolean;
}
```

Example:

```json
{
  "type": "history",
  "cardId": "act1_first_media_favor",
  "choice": "right",
  "exists": true
}
```

---

# 21. Turn Condition

```ts
interface TurnCondition {
    type: "turn";

    scope: "run" | "act";

    op:
        | ">"
        | ">="
        | "<"
        | "<="
        | "==";

    value: number;
}
```

Use this sparingly.

Narrative logic should usually depend on story state rather than absolute turn count.

---

# 22. Act Condition

```ts
interface ActCondition {
    type: "act";

    act: ActId;
}
```

---

# 23. Seen Card Condition

```ts
interface SeenCardCondition {
    type: "seen_card";

    cardId: CardId;

    minCount?: number;
    maxCount?: number;
}
```

This is useful primarily for:

- repetition control;
- alternate versions;
- callback cards.

---

# 24. Effects DSL

All state mutation should go through `EffectResolver`.

```ts
type Effect =
    | StatEffect
    | FlagEffect
    | RelationshipEffect
    | PrecedentEffect
    | ObligationEffect
    | ObligationResolveEffect
    | ScheduleEventEffect
    | CancelEventEffect
    | NarrativeEffect;
```

Narrative JSON must never directly mutate `GameState`.

---

# 25. Stat Effect

```ts
interface StatEffect {
    type: "stat";

    stat: keyof PlayerStats;

    add?: number;
    set?: number;
}
```

Exactly one of:

```text
add
set
```

must exist.

Example:

```json
{
  "type": "stat",
  "stat": "money",
  "add": 120000
}
```

---

# 26. Flag Effect

```ts
interface FlagEffect {
    type: "flag";

    flag: FlagId;

    action:
        | "add"
        | "remove";
}
```

Example:

```json
{
  "type": "flag",
  "flag": "flag_knows_editor",
  "action": "add"
}
```

---

# 27. Relationship Effect

```ts
interface RelationshipEffect {
    type: "relationship";

    character: CharacterId;

    add: number;
}
```

Example:

```json
{
  "type": "relationship",
  "character": "minister",
  "add": 1
}
```

Relationship values should be clamped by engine configuration.

Recommended:

```text
-5 to +5
```

---

# 28. Precedent Effect

```ts
interface PrecedentEffect {
    type: "precedent";

    precedent: PrecedentId;

    add: number;
}
```

Example:

```json
{
  "type": "precedent",
  "precedent": "precedent_media_suppression",
  "add": 1
}
```

Most precedent effects should use:

```text
+1
```

because their meaning is primarily cumulative.

---

# 29. Obligation Model

An obligation must be a concrete object, not only a numeric relationship.

```ts
interface Obligation {
    id: ObligationId;

    creditor: CharacterId;

    sourceCardId: CardId;
    sourceChoice: "left" | "right";

    createdTurn: number;

    weight: number;

    tags: string[];

    status: ObligationStatus;

    resolvedTurn?: number;
    resolvedByCardId?: CardId;
}
```

```ts
type ObligationStatus =
    | "active"
    | "repaid"
    | "forgiven"
    | "betrayed"
    | "expired";
```

---

# 30. Create Obligation Effect

```ts
interface ObligationEffect {
    type: "obligation_add";

    id: ObligationId;

    creditor: CharacterId;

    weight: number;

    tags?: string[];
}
```

The engine automatically fills:

```text
sourceCardId
sourceChoice
createdTurn
status
```

Example:

```json
{
  "type": "obligation_add",
  "id": "obligation_minister_promotion_01",
  "creditor": "minister",
  "weight": 2,
  "tags": [
    "promotion",
    "inner_circle"
  ]
}
```

---

# 31. Resolve Obligation Effect

```ts
interface ObligationResolveEffect {
    type: "obligation_resolve";

    obligationId?: ObligationId;

    creditor?: CharacterId;
    tag?: string;

    amount?: number;

    resolution:
        | "repaid"
        | "forgiven"
        | "betrayed"
        | "expired";
}
```

Example:

```json
{
  "type": "obligation_resolve",
  "creditor": "minister",
  "amount": 1,
  "resolution": "repaid"
}
```

The engine selects the oldest matching active obligation unless explicitly configured otherwise.

---

# 32. Why Obligations Are Objects

Do not reduce this system to:

```ts
ministerDebt += 3;
```

because individual obligations need provenance.

The game must know:

> Which choices caused this debt?

This enables:

- specific flashbacks;
- dialogue callbacks;
- exact debugging;
- obligation repayment;
- betrayal consequences;
- ending analysis.

---

# 33. Delayed Effect Definition

A choice may schedule future consequences.

```ts
interface DelayedEffect {
    delay: DelayDefinition;

    eventId: EventId;

    priority?: number;

    conditionsAtTrigger?: ConditionExpression;

    onConditionFail?: DelayedFailurePolicy;
}
```

---

# 34. Delay Definitions

```ts
type DelayDefinition =
    | {
        type: "turns";
        turns: number;
      }
    | {
        type: "turn_range";
        min: number;
        max: number;
      }
    | {
        type: "act";
        act: ActId;
        minActTurn?: number;
      };
```

Example:

```json
{
  "delay": {
    "type": "turn_range",
    "min": 5,
    "max": 9
  },
  "eventId": "event_contract_scandal"
}
```

For `turn_range`, randomize the exact trigger turn **when scheduling the event**.

Save the resulting trigger turn.

Never reroll after reload.

---

# 35. Scheduled Event Runtime Model

```ts
interface ScheduledEvent {
    id: string;

    eventId: EventId;

    sourceCardId: CardId;
    sourceChoice: "left" | "right";

    scheduledAtTurn: number;

    triggerAtTurn?: number;

    triggerAct?: ActId;
    minActTurn?: number;

    priority: number;

    status:
        | "pending"
        | "triggered"
        | "cancelled"
        | "expired";
}
```

Again, provenance is important.

The engine should always know:

> Why does this event exist?

---

# 36. Delayed Failure Policy

A future event may no longer make sense when its trigger time arrives.

Example:

A journalist is supposed to confront the player, but the journalist has already left the country.

Possible policies:

```ts
type DelayedFailurePolicy =
    | "discard"
    | "retry_later"
    | "replace";
```

For `"replace"`:

```ts
interface ReplacementEventConfig {
    replacementEventId: EventId;
}
```

Keep this feature uncommon.

Most events should simply use:

```text
discard
```

if their trigger conditions become invalid.

---

# 37. Event Definition

Events are normally resolved into cards.

```ts
interface EventDefinition {
    id: EventId;

    cardId: CardId;

    conditions?: ConditionExpression;

    once?: boolean;

    metadata?: {
        description?: string;
    };
}
```

Example:

```json
{
  "id": "event_contract_scandal",
  "cardId": "act2_contract_scandal_01"
}
```

Do not duplicate narrative text inside events.

Events should point toward cards.

---

# 38. Choice Lock

```ts
interface ChoiceLock {
    condition: ConditionExpression;

    mode: ChoiceLockMode;

    reason?: LockReasonDefinition;
}
```

```ts
type ChoiceLockMode =
    | "hard"
    | "cost";
```

---

# 39. Hard Lock

A hard lock means the player cannot perform the action.

Example:

```json
{
  "lock": {
    "mode": "hard",
    "condition": {
      "type": "obligation",
      "tag": "inner_circle",
      "minWeight": 5,
      "status": "active"
    }
  }
}
```

Player attempts the choice.

The game triggers the flashback system.

---

# 40. Cost Lock

Not all declining autonomy should immediately become binary.

A cost lock means:

> You may still do this, but refusing now has a serious cost.

Schema:

```ts
interface CostChoiceLock extends ChoiceLock {
    mode: "cost";

    unlockEffects: Effect[];
}
```

Example:

```json
{
  "lock": {
    "mode": "cost",
    "condition": {
      "type": "obligation",
      "creditor": "minister",
      "minWeight": 2,
      "status": "active"
    },
    "unlockEffects": [
      {
        "type": "stat",
        "stat": "power",
        "add": -15
      },
      {
        "type": "relationship",
        "character": "minister",
        "add": -3
      }
    ]
  }
}
```

Presentation:

> Refuse anyway  
> Power ↓↓↓

This allows progression:

```text
Free refusal
↓
Expensive refusal
↓
Locked refusal
```

which is preferable to suddenly removing autonomy.

---

# 41. Lock Reason

The lock system must be able to construct flashbacks automatically.

```ts
interface LockReasonDefinition {
    source:
        | "obligations"
        | "history"
        | "explicit";

    maxFlashbacks?: number;

    explicitSources?: LockSource[];
}
```

Example:

```json
{
  "reason": {
    "source": "obligations",
    "maxFlashbacks": 3
  }
}
```

The engine:

1. evaluates which obligations satisfy the lock;
2. retrieves their `sourceCardId`;
3. retrieves the corresponding history entries;
4. builds the flashback sequence.

---

# 42. Explicit Lock Sources

Some locks are not obligation-based.

Example:

The player previously signed a binding public commitment.

```ts
interface LockSource {
    cardId: CardId;
    choice?: "left" | "right";
}
```

Example:

```json
{
  "reason": {
    "source": "explicit",
    "explicitSources": [
      {
        "cardId": "act2_public_commitment_01",
        "choice": "right"
      }
    ]
  }
}
```

---

# 43. Choice History

History must preserve enough information for replay and flashbacks.

```ts
interface ChoiceHistoryEntry {
    turn: number;

    cardId: CardId;

    choice: "left" | "right";

    choiceText: string;

    timestamp: number;

    effectsApplied: ResolvedEffectRecord[];

    obligationsCreated: ObligationId[];

    obligationsResolved: ObligationId[];

    flagsAdded: FlagId[];

    flagsRemoved: FlagId[];

    scheduledEventIds: string[];
}
```

Do not rely solely on current state.

History is immutable once written.

---

# 44. Resolved Effect Record

Useful for debugging.

```ts
interface ResolvedEffectRecord {
    type: string;

    before?: unknown;
    after?: unknown;

    sourceEffectIndex?: number;
}
```

This does not need to be exposed in production UI.

---

# 45. Next Directive

Most choices should allow the scheduler to choose the next card.

Default:

```text
scheduler
```

But major sequences need explicit routing.

```ts
type NextDirective =
    | {
        type: "scheduler";
      }
    | {
        type: "card";
        cardId: CardId;
      }
    | {
        type: "event";
        eventId: EventId;
      }
    | {
        type: "act";
        act: ActId;
      }
    | {
        type: "ending_check";
      };
```

Example:

```json
{
  "next": {
    "type": "card",
    "cardId": "incident_road_02"
  }
}
```

Use explicit routing primarily for:

- tutorials;
- final gathering;
- incident;
- aftermath;
- ending sequences.

Normal cards should return to the scheduler.

---

# 46. Mandatory Story Beat Definition

Mandatory beats should not be hard-coded inside `NarrativeEngine`.

```ts
interface StoryBeatDefinition {
    id: string;

    act: ActId;

    cardId: CardId;

    conditions?: ConditionExpression;

    earliestActTurn?: number;

    latestActTurn?: number;

    priority: number;

    once: boolean;
}
```

Example:

```json
{
  "id": "beat_first_promotion",
  "act": "rise",
  "cardId": "act1_first_promotion",
  "earliestActTurn": 5,
  "latestActTurn": 8,
  "priority": 100,
  "once": true
}
```

If the beat has not occurred by `latestActTurn`, scheduler should force it when valid.

---

# 47. Contextual Card Weighting

Cards may have base weights:

```json
{
  "weight": 10
}
```

Narrative scheduler can then modify weights based on:

- recent tags;
- current stats;
- active threads;
- relationship relevance;
- repeated speakers.

Do not encode every dynamic weight modifier in card JSON initially.

Keep weighting logic centralized.

---

# 48. Narrative Threads

Optional but recommended.

A thread represents an ongoing topic.

Examples:

```text
media_reform
business_network
minister_relationship
public_transparency
family_pressure
```

Runtime:

```ts
type NarrativeThreadId = string;
```

Effects:

```ts
interface NarrativeThreadEffect {
    type: "thread";

    thread: NarrativeThreadId;

    action:
        | "activate"
        | "complete"
        | "cancel";
}
```

This can later help scheduler prefer relevant cards.

Do not make threads mandatory for MVP.

---

# 49. Precedent Definitions

Keep precedent IDs in a registry.

Example:

```json
[
  {
    "id": "precedent_media_suppression",
    "description": "Player has normalized interfering with reporting."
  },
  {
    "id": "precedent_nepotism",
    "description": "Player has normalized personal appointments."
  },
  {
    "id": "precedent_protected_business",
    "description": "Player has normalized granting special treatment to businesses."
  },
  {
    "id": "precedent_investigation_interference",
    "description": "Player has normalized interfering with investigations."
  }
]
```

Player never sees these descriptions.

They exist for authors and debugging.

---

# 50. Character Definition

```ts
interface CharacterDefinition {
    id: CharacterId;

    displayName: string;

    role: string;

    portrait: {
        neutral: string;
        friendly?: string;
        angry?: string;
        concerned?: string;
    };

    tags?: string[];

    metadata?: {
        narrativeRole?: string;
    };
}
```

Example:

```json
{
  "id": "minister",
  "displayName": "Minister V.",
  "role": "Senior Official",
  "portrait": {
    "neutral": "characters/minister/neutral.webp",
    "friendly": "characters/minister/friendly.webp",
    "angry": "characters/minister/angry.webp"
  },
  "tags": [
    "inner_circle",
    "political"
  ]
}
```

Characters should remain fictional and generic.

---

# 51. Illustration Reference

Do not hard-code asset behavior into card definitions.

```ts
interface IllustrationRef {
    scene: string;

    expression?: string;

    variant?: string;
}
```

Example:

```json
{
  "illustration": {
    "scene": "parliament_speech",
    "expression": "serious"
  }
}
```

An asset resolver maps this to actual files.

This allows changing art filenames without editing 100 narrative cards.

---

# 52. Ending Definition

Endings should be evaluated separately from cards.

```ts
interface EndingDefinition {
    id: EndingId;

    priority: number;

    conditions: ConditionExpression;

    presentation: EndingPresentation;

    meta?: {
        category:
            | "positive"
            | "mixed"
            | "negative";
    };
}
```

Do not expose the category to the player.

---

# 53. Ending Presentation

```ts
interface EndingPresentation {
    sequence: EndingSequenceStep[];
}
```

```ts
type EndingSequenceStep =
    | ArticleStep
    | TextStep
    | DelayStep
    | MemorialStep
    | CreditsStep;
```

Example:

```json
{
  "sequence": [
    {
      "type": "article",
      "articleId": "article_official_collision"
    },
    {
      "type": "delay",
      "milliseconds": 2200
    },
    {
      "type": "article_state",
      "state": "removed"
    },
    {
      "type": "memorial"
    },
    {
      "type": "credits"
    }
  ]
}
```

---

# 54. Ending Priority

Multiple endings may satisfy conditions simultaneously.

Therefore each ending requires priority.

Example:

```text
Break the Chain     1000
Untouchable          900
Protected            800
Personal Remorse     700
Scapegoat            600
Fallback              0
```

At ending resolution:

1. filter valid endings;
2. sort by priority descending;
3. choose highest priority.

Always include a fallback ending.

---

# 55. Example Full Card

```json
{
  "id": "act2_business_permit_01",
  "act": "network",
  "type": "contextual",

  "speaker": "businessman",

  "text": "The permit has been sitting on someone's desk for months. Nothing illegal. Just paperwork.",

  "illustration": {
    "scene": "restaurant_private_room",
    "expression": "friendly"
  },

  "conditions": {
    "all": [
      {
        "type": "relationship",
        "character": "businessman",
        "op": ">=",
        "value": 0
      },
      {
        "not": {
          "type": "flag",
          "flag": "flag_businessman_hostile",
          "exists": true
        }
      }
    ]
  },

  "left": {
    "text": "It should follow the normal process.",

    "preview": {
      "standing": -1,
      "power": -1,
      "publicTrust": "unknown"
    },

    "effects": [
      {
        "type": "relationship",
        "character": "businessman",
        "add": -1
      }
    ]
  },

  "right": {
    "text": "I'll make a call.",

    "preview": {
      "standing": 1,
      "power": 1,
      "publicTrust": "unknown"
    },

    "effects": [
      {
        "type": "relationship",
        "character": "businessman",
        "add": 1
      },
      {
        "type": "precedent",
        "precedent": "precedent_protected_business",
        "add": 1
      },
      {
        "type": "obligation_add",
        "id": "obligation_businessman_permit_01",
        "creditor": "businessman",
        "weight": 1,
        "tags": [
          "business",
          "favor"
        ]
      }
    ],

    "delayedEffects": [
      {
        "delay": {
          "type": "turn_range",
          "min": 6,
          "max": 10
        },
        "eventId": "event_businessman_returns_favor"
      }
    ]
  },

  "weight": 8,
  "once": true,

  "tags": [
    "business",
    "favor",
    "early_corruption"
  ]
}
```

---

# 56. Example Locked Choice

Late game:

```json
{
  "id": "gathering_drink_01",
  "act": "gathering",
  "type": "story",

  "speaker": "minister",

  "text": "One glass. You aren't going to make everyone at this table uncomfortable, are you?",

  "left": {
    "text": "No. I'm driving.",

    "lock": {
      "mode": "hard",

      "condition": {
        "all": [
          {
            "type": "obligation",
            "tag": "inner_circle",
            "minCount": 3,
            "status": "active"
          },
          {
            "type": "relationship",
            "character": "minister",
            "op": ">=",
            "value": 3
          }
        ]
      },

      "reason": {
        "source": "obligations",
        "maxFlashbacks": 3
      }
    },

    "next": {
      "type": "card",
      "cardId": "gathering_leave_sober"
    }
  },

  "right": {
    "text": "Just one.",

    "effects": [
      {
        "type": "flag",
        "flag": "flag_drank_at_gathering",
        "action": "add"
      }
    ],

    "next": {
      "type": "card",
      "cardId": "gathering_after_drink"
    }
  },

  "once": true
}
```

Important behavior:

If the lock condition is false:

> Player may freely choose "No. I'm driving."

If the lock condition is true:

> The same option becomes unavailable and triggers flashbacks.

---

# 57. Conditional Choice Variants

Avoid creating duplicate cards merely to change a line of dialogue.

Support optional choice variants:

```ts
interface ChoiceVariant {
    conditions: ConditionExpression;

    text?: string;

    preview?: ChoicePreview;

    effects?: Effect[];

    lock?: ChoiceLock;
}
```

Example:

Default:

> I'll think about it.

If Standing > 70:

> Have my office prepare it.

However, use variants sparingly.

If a card becomes substantially different, create another card instead.

---

# 58. Do Not Make JSON Too Smart

Avoid building an entire programming language in narrative data.

Do not add:

- arithmetic formulas;
- loops;
- arbitrary variable assignment;
- JavaScript expressions;
- nested branching scripts;
- custom inline functions.

If a behavior becomes too complex for the schema:

> Implement a new explicit engine feature.

Example:

Bad:

```json
{
  "script": "for (const debt of debts) ..."
}
```

Better:

```json
{
  "type": "obligation_resolve",
  "creditor": "minister",
  "amount": 2,
  "resolution": "repaid"
}
```

---

# 59. Registry Files

Recommended data organization:

```text
src/data/
│
├── cards/
│   ├── act0/
│   ├── act1/
│   ├── act2/
│   ├── act3/
│   ├── gathering/
│   ├── incident/
│   └── aftermath/
│
├── events/
│
├── endings/
│
├── beats/
│
├── characters/
│
├── precedents.json
├── flags.json
├── acts.json
│
└── config/
    └── balance.json
```

Do not store every card in one enormous JSON file.

---

# 60. Flag Registry

Although flags are runtime strings, define them centrally.

Example:

```json
[
  {
    "id": "flag_knows_editor",
    "description": "Player has established direct access to the editor."
  },
  {
    "id": "flag_drank_at_gathering",
    "description": "Player consumed alcohol during the final gathering."
  }
]
```

The validator rejects references to unknown flags.

This prevents typo bugs such as:

```text
flag_knows_edtor
```

silently becoming a new state variable.

---

# 61. Global Balance Config

Do not bury balance constants throughout code.

```json
{
  "stats": {
    "standing": {
      "min": 0,
      "max": 100
    },
    "power": {
      "min": 0,
      "max": 100
    },
    "publicTrustActual": {
      "min": 0,
      "max": 100
    },
    "publicTrustPerceived": {
      "min": 0,
      "max": 100
    }
  },

  "relationships": {
    "min": -5,
    "max": 5
  },

  "scheduler": {
    "recentCardWindow": 6,
    "defaultCardWeight": 10
  }
}
```

---

# 62. Validation Rules

The build validator must check:

### IDs

- no duplicate card ID;
- no duplicate event ID;
- no duplicate obligation ID definitions where uniqueness is expected;
- IDs use correct format.

### References

Every referenced:

- card;
- event;
- character;
- flag;
- precedent;
- ending;
- act

must exist.

### Conditions

Validate:

- valid stat name;
- valid operator;
- values in reasonable ranges;
- non-empty `all` / `any`;
- no impossible primitive structure.

### Effects

Validate:

- correct fields for effect type;
- no `add` and `set` simultaneously;
- valid relationship target;
- valid precedent;
- valid obligation creditor.

### Delayed Events

Validate:

```text
min <= max
turns >= 1
event exists
```

### Locks

Every hard lock should have a valid reason source.

A lock that cannot explain itself should produce a warning or build failure.

---

# 63. Semantic Validation

Beyond schema validation, add custom semantic checks.

Examples:

### Unreachable card

A story card is referenced by no:

- pool;
- event;
- next directive;
- mandatory beat.

Warn:

```text
CARD MAY BE UNREACHABLE:
act3_hidden_scandal_02
```

### Impossible flashback

A lock references a source card that cannot occur before the locked card.

Fail validation.

### Missing fallback ending

Fail build.

### Impossible ending

An ending contains contradictory conditions.

Example:

```text
Power >= 80
AND
Power < 30
```

This can eventually be detected by simple semantic analysis.

---

# 64. Debug Explanation API

Every condition evaluation should optionally produce an explanation.

Instead of only:

```ts
true
```

debug mode may return:

```ts
{
    result: false,

    explanation: [
        "power >= 50: PASS (67)",
        "flag_knows_editor: PASS",
        "minister relationship >= 3: FAIL (2)"
    ]
}
```

This will be extremely useful while authoring 100+ cards.

---

# 65. Effect Resolution Log

In debug builds:

```text
CARD: act2_business_permit_01
CHOICE: right

relationship.businessman:
0 → 1

precedent_protected_business:
0 → 1

created obligation:
obligation_businessman_permit_01

scheduled:
event_businessman_returns_favor
turn 31
```

Narrative bugs should be inspectable without stepping through TypeScript.

---

# 66. Scheduler Query API

Recommended API:

```ts
interface NarrativeEngine {
    getNextCard(
        state: GameState
    ): NarrativeSelectionResult;
}
```

Result:

```ts
interface NarrativeSelectionResult {
    cardId: CardId;

    source:
        | "forced"
        | "mandatory_beat"
        | "scheduled_event"
        | "contextual";

    reason?: string;
}
```

Debug example:

```text
Selected:
act2_contract_scandal_01

Source:
scheduled_event

Scheduled by:
act1_contract_approval_02:right

12 turns ago
```

Traceability should exist across the entire narrative engine.

---

# 67. Deterministic RNG

All random behavior should use a seeded random generator.

Never call:

```ts
Math.random()
```

directly from narrative systems.

Use:

```ts
rng.next()
```

Seed stored in save data.

Random behavior includes:

- contextual card selection;
- delayed event ranges;
- equivalent event variation.

This allows reproducing bugs from a save file.

---

# 68. Save Versioning

Save structure must include:

```ts
version: number;
```

Example:

```ts
const CURRENT_SAVE_VERSION = 1;
```

Future schema changes should use migrations.

```ts
migrateSave(
    save: UnknownSaveData
): CurrentSaveData
```

Never assume saves created during development remain permanently compatible without migration.

---

# 69. Meta Save

Separate from run state.

```ts
interface MetaSave {
    version: number;

    completedRuns: number;

    discoveredEndings: EndingId[];

    firstCompletedAt?: number;

    quoteUnlocked: boolean;
}
```

Do not store first-playthrough state inside meta save.

---

# 70. Recommended MVP Schema Scope

Implement these first:

```text
CardDefinition
ChoiceDefinition

PlayerStats

Flags
Relationships
Precedents

Obligations
History

Condition DSL

Effect DSL

Delayed Events

Choice Locks

Mandatory Beats

Ending Conditions
```

Do **not** initially implement:

- complex narrative threads;
- conditional text templating;
- procedural dialogue;
- localization DSL;
- dynamic expressions;
- advanced event replacement;
- complicated AI-generated narrative.

Add those only if production proves they are necessary.

---

# 71. First Vertical Slice Dataset

Before writing the real story, build approximately **12–15 test cards** that specifically test this chain:

```text
CARD 01
Meet Minister
↓
CARD 03
Minister helps promotion
↓
Create Obligation A
↓
CARD 05
Businessman offers investment
↓
Create Obligation B
↓
CARD 08
Editor suppresses embarrassing story
↓
Create Obligation C
↓
Several unrelated cards
↓
FINAL GATHERING
↓
Player attempts:
REFUSE DRINK
↓
LOCK CONDITION PASSES
↓
Flashbacks:
Promotion
Investment
Suppressed Article
↓
Choice remains locked
```

Also create an alternate run where the player rejects one or more favors.

Then:

```text
REFUSE DRINK
```

remains available.

This vertical slice validates nearly every important narrative system before full production begins.

---

# 72. Core Architecture Rule

The engine should always be able to answer three questions:

### Why is this card appearing?

Example:

> Because card X scheduled event Y twelve turns ago.

### Why is this option unavailable?

Example:

> Because three active obligations created by cards A, B, and C satisfy this lock.

### Why did this ending happen?

Example:

> Because the player suppressed media, interfered with the investigation, remained in office, and had Power >= 80.

If the engine cannot answer these questions programmatically, the narrative system is becoming too opaque.

---

# 73. Final Principle

The most important property of the schema is **causal traceability**.

The game should never merely say:

```text
You became corrupt.
```

The runtime should instead contain evidence such as:

```text
You accepted this favor.
↓
That created this obligation.
↓
That obligation created this later request.
↓
You accepted that request.
↓
That established this precedent.
↓
This choice is now unavailable.
```

The player's loss of autonomy should be reconstructable from actual history.

That causal chain is not only a technical requirement.

It is one of the central narrative mechanics of the game.