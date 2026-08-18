// Core narrative DSL types.
// Follows "Political Life Narrative Game — Data Schema & Narrative DSL Specification"
// with amendments from the Card Authoring Packs (v1.1):
//  - all player-facing `text` fields hold i18n KEYS, resolved at render time
//  - TrustTrend extended with strong_up_uncertain / strong_down_uncertain

export type CardId = string;
export type CharacterId = string;
export type FlagId = string;
export type EventId = string;
export type EndingId = string;
export type ObligationId = string;
export type PrecedentId = string;
export type ActId = string;
export type NarrativeThreadId = string;
export type PromiseId = string;

// ---------------------------------------------------------------------------
// Stats

export interface PlayerStats {
  money: number;
  standing: number;
  power: number;
  publicTrustActual: number;
  publicTrustPerceived: number;
}

export type StatName = keyof PlayerStats;

// ---------------------------------------------------------------------------
// Conditions

export type ConditionExpression =
  | Condition
  | AllCondition
  | AnyCondition
  | NotCondition;

export interface AllCondition {
  all: ConditionExpression[];
}
export interface AnyCondition {
  any: ConditionExpression[];
}
export interface NotCondition {
  not: ConditionExpression;
}

export type Condition =
  | StatCondition
  | TrustGapCondition
  | FlagCondition
  | RelationshipCondition
  | PrecedentCondition
  | ObligationCondition
  | HistoryCondition
  | TurnCondition
  | ActCondition
  | SeenCardCondition
  | PromiseCondition;

export type CompareOp = '>' | '>=' | '<' | '<=' | '==' | '!=';

export interface StatCondition {
  type: 'stat';
  stat: StatName;
  op: CompareOp;
  value: number;
}

/**
 * Difference between the Trust shown to the player and genuine public support.
 * Positive values are an inflated image; negative values are underestimated
 * grassroots support.
 */
export interface TrustGapCondition {
  type: 'trust_gap';
  op: CompareOp;
  value: number;
}

export interface FlagCondition {
  type: 'flag';
  flag: FlagId;
  exists: boolean;
}

export interface RelationshipCondition {
  type: 'relationship';
  character: CharacterId;
  op: CompareOp;
  value: number;
}

export interface PrecedentCondition {
  type: 'precedent';
  /** A precedent id, or '*' for the sum of every precedent the run has set. */
  precedent: PrecedentId | '*';
  op: CompareOp;
  value: number;
}

export type ObligationStatus = 'active' | 'repaid' | 'forgiven' | 'betrayed' | 'expired';

export interface ObligationCondition {
  type: 'obligation';
  creditor?: CharacterId;
  tag?: string;
  minWeight?: number;
  minCount?: number;
  status?: ObligationStatus;
}

export interface HistoryCondition {
  type: 'history';
  cardId: CardId;
  choice?: 'left' | 'right';
  exists: boolean;
}

export interface TurnCondition {
  type: 'turn';
  scope: 'run' | 'act';
  op: CompareOp;
  value: number;
}

export interface ActCondition {
  type: 'act';
  act: ActId;
}

export interface SeenCardCondition {
  type: 'seen_card';
  cardId: CardId;
  minCount?: number;
  maxCount?: number;
}

/**
 * The Record. Matches promises the player has made. `status` defaults to
 * 'kept' (held or honored under pressure — i.e. not yet broken); 'any'
 * matches every promise ever made regardless of fate. With no `promise`,
 * counts every matching promise; `minCount` defaults to 1.
 */
export interface PromiseCondition {
  type: 'promise';
  promise?: PromiseId;
  status?: PromiseStatus | 'kept' | 'any';
  minCount?: number;
}

// ---------------------------------------------------------------------------
// Effects

export type Effect =
  | StatEffect
  | StatConvergeEffect
  | MoneyPressureEffect
  | FlagEffect
  | RelationshipEffect
  | PrecedentEffect
  | ObligationEffect
  | ObligationResolveEffect
  | NarrativeThreadEffect
  | PromiseMakeEffect
  | PromiseBreakEffect
  | PromiseHonorEffect;

export interface StatEffect {
  type: 'stat';
  stat: StatName;
  add?: number;
  set?: number;
}

/** Move one stat a fraction of the distance toward another stat. */
export interface StatConvergeEffect {
  type: 'stat_converge';
  from: Exclude<StatName, 'money'>;
  to: Exclude<StatName, 'money'>;
  fraction: number;
}

/**
 * A visible, balance-scaled cash loss used by low-status and low-Trust stories.
 * Unlike an ordinary money stat effect, it cannot reduce the player below the
 * configured status-pressure floor and therefore cannot directly end a run.
 */
export interface MoneyPressureEffect {
  type: 'money_pressure';
  percent: number;
  minLoss: number;
  maxLoss: number;
}

export interface FlagEffect {
  type: 'flag';
  flag: FlagId;
  action: 'add' | 'remove';
}

export interface RelationshipEffect {
  type: 'relationship';
  character: CharacterId;
  add: number;
}

export interface PrecedentEffect {
  type: 'precedent';
  precedent: PrecedentId;
  add: number;
}

export interface ObligationEffect {
  type: 'obligation_add';
  id: ObligationId;
  creditor: CharacterId;
  weight: number;
  tags?: string[];
}

export interface ObligationResolveEffect {
  type: 'obligation_resolve';
  obligationId?: ObligationId;
  creditor?: CharacterId;
  tag?: string;
  amount?: number;
  resolution: 'repaid' | 'forgiven' | 'betrayed' | 'expired';
}

export interface NarrativeThreadEffect {
  type: 'thread';
  thread: NarrativeThreadId;
  action: 'activate' | 'complete' | 'cancel';
}

/**
 * The Record — recorded only by an active idealistic choice, never assigned.
 * No-op if the promise was already made this run.
 */
export interface PromiseMakeEffect {
  type: 'promise_make';
  promise: PromiseId;
}

/**
 * Declares that taking this choice breaks a promise IF it is held. Never a
 * lock, never priced: the swipe stays free; the game only witnesses it. No-op
 * when the promise was never made or is already broken. `'highest_held'`
 * targets the held promise with the highest domain priority.
 */
export interface PromiseBreakEffect {
  type: 'promise_break';
  promise: PromiseId | 'highest_held';
}

/**
 * The mirror case: the player refused corruption at real cost. held →
 * honored_under_pressure. An honored promise can still be broken later — the
 * ledger then reads "broken"; keeping your word once is not keeping it.
 */
export interface PromiseHonorEffect {
  type: 'promise_honor';
  promise: PromiseId | 'highest_held';
}

// ---------------------------------------------------------------------------
// Delayed effects / scheduled events

export type DelayDefinition =
  | { type: 'turns'; turns: number }
  | { type: 'turn_range'; min: number; max: number }
  | { type: 'act'; act: ActId; minActTurn?: number };

export type DelayedFailurePolicy = 'discard' | 'retry_later' | 'replace';

export interface DelayedEffect {
  delay: DelayDefinition;
  eventId: EventId;
  priority?: number;
  conditionsAtTrigger?: ConditionExpression;
  onConditionFail?: DelayedFailurePolicy;
  replacementEventId?: EventId;
}

export interface EventDefinition {
  id: EventId;
  cardId: CardId;
  conditions?: ConditionExpression;
  once?: boolean;
  metadata?: { description?: string };
}

export interface ScheduledEvent {
  id: string;
  eventId: EventId;
  sourceCardId: CardId;
  sourceChoice: 'left' | 'right';
  scheduledAtTurn: number;
  triggerAtTurn?: number;
  triggerAct?: ActId;
  minActTurn?: number;
  priority: number;
  conditionsAtTrigger?: ConditionExpression;
  onConditionFail?: DelayedFailurePolicy;
  replacementEventId?: EventId;
  status: 'pending' | 'triggered' | 'cancelled' | 'expired';
}

// ---------------------------------------------------------------------------
// Choices / cards

export type Trend = -3 | -2 | -1 | 0 | 1 | 2 | 3;

export type TrustTrend =
  | 'unknown'
  | 'down_uncertain'
  | 'up_uncertain'
  | 'strong_down_uncertain'
  | 'strong_up_uncertain'
  | 'down'
  | 'up'
  | 'strong_down'
  | 'strong_up';

export interface ChoicePreview {
  money?: Trend;
  standing?: Trend;
  power?: Trend;
  publicTrust?: TrustTrend;
}

export type ChoiceLockMode = 'hard' | 'cost';

export interface LockSource {
  cardId: CardId;
  choice?: 'left' | 'right';
}

export interface LockReasonDefinition {
  source: 'obligations' | 'history' | 'explicit';
  maxFlashbacks?: number;
  explicitSources?: LockSource[];
}

export interface ChoiceLock {
  mode: ChoiceLockMode;
  condition: ConditionExpression;
  reason?: LockReasonDefinition;
  /** cost mode only: extra effects applied when the player pays to refuse anyway */
  unlockEffects?: Effect[];
}

export type NextDirective =
  | { type: 'scheduler' }
  | { type: 'card'; cardId: CardId }
  | { type: 'event'; eventId: EventId }
  | { type: 'act'; act: ActId }
  | { type: 'ending_check' };

export interface ChoiceVariant {
  conditions: ConditionExpression;
  /** i18n key override */
  text?: string;
  preview?: ChoicePreview;
  effects?: Effect[];
  delayedEffects?: DelayedEffect[];
  lock?: ChoiceLock;
  next?: NextDirective;
}

export interface ChoiceDefinition {
  id?: string;
  /** i18n key, e.g. card.act0_appointment_day.left */
  text: string;
  preview?: ChoicePreview;
  effects?: Effect[];
  delayedEffects?: DelayedEffect[];
  lock?: ChoiceLock;
  next?: NextDirective;
  variants?: ChoiceVariant[];
  tags?: string[];
}

export type CardType =
  | 'contextual'
  | 'story'
  | 'consequence'
  | 'incident'
  | 'aftermath'
  | 'ending';

export interface IllustrationRef {
  scene: string;
  expression?: string;
  variant?: string;
}

export interface CardMetadata {
  authorNote?: string;
  designIntent?: string;
  expectedDurationSeconds?: number;
  /** Authored amount of story time consumed by this card; overrides the act default. */
  storyTimeAdvanceDays?: number;
  contentWarnings?: string[];
  debugTags?: string[];
}

/** State-dependent card body; the first matching variant wins, else `text`. */
export interface CardTextVariant {
  conditions: ConditionExpression;
  /** i18n key */
  text: string;
}

/**
 * `decision` (default): a real Left/Right choice with previews and effects.
 * `continue`: a single progression action — one authored choice (`left`), no
 * fake pair; the loader mirrors it to `right` so the engine sees both sides.
 * Presented without stat preview or commit weight so the player learns that
 * not every interaction is a political commitment.
 */
export type CardInteraction = 'decision' | 'continue';

export interface CardDefinition {
  id: CardId;
  act: ActId;
  type?: CardType;
  interaction?: CardInteraction;
  speaker?: CharacterId;
  /** i18n key */
  title?: string;
  /** i18n key, e.g. card.act0_appointment_day.text */
  text: string;
  textVariants?: CardTextVariant[];
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
  /** minimum act-turn before this contextual card may appear */
  minActTurn?: number;
  tags?: string[];
  metadata?: CardMetadata;
}

// ---------------------------------------------------------------------------
// Obligations / history

export interface Obligation {
  id: ObligationId;
  creditor: CharacterId;
  sourceCardId: CardId;
  sourceChoice: 'left' | 'right';
  createdTurn: number;
  weight: number;
  tags: string[];
  status: ObligationStatus;
  resolvedTurn?: number;
  resolvedByCardId?: CardId;
}

// ---------------------------------------------------------------------------
// The Record (promises)

export type PromiseDomain = 'equality' | 'transparency' | 'constituents' | 'reform' | 'independence';
export type PromiseStatus = 'held' | 'broken' | 'honored_under_pressure';

export interface PromiseDefinition {
  id: PromiseId;
  /** i18n key of the pledge — the exact words, quotable, thrown back verbatim */
  pledgeKey: string;
  domain: PromiseDomain;
  description?: string;
}

export interface PromiseState {
  id: PromiseId;
  madeAt: { cardId: CardId; choice: 'left' | 'right'; turn: number };
  status: PromiseStatus;
  resolvedTurn?: number;
  resolvedByCardId?: CardId;
}

export interface ResolvedEffectRecord {
  type: string;
  target?: string;
  before?: unknown;
  after?: unknown;
  sourceEffectIndex?: number;
}

export interface ChoiceHistoryEntry {
  turn: number;
  cardId: CardId;
  choice: 'left' | 'right';
  /** i18n key of the chosen option, so flashbacks render in current language */
  choiceTextKey: string;
  /** i18n key of the card body as it read at the time (text variant resolved), for flashbacks and The Record */
  cardTextKey?: string;
  /** true when a cost-lock was paid to take this choice */
  paidCost?: boolean;
  timestamp: number;
  effectsApplied: ResolvedEffectRecord[];
  obligationsCreated: ObligationId[];
  obligationsResolved: ObligationId[];
  flagsAdded: FlagId[];
  flagsRemoved: FlagId[];
  scheduledEventIds: string[];
  promisesMade?: PromiseId[];
  promisesBroken?: PromiseId[];
  promisesHonored?: PromiseId[];
}

// ---------------------------------------------------------------------------
// Story beats / acts / endings

export interface StoryBeatDefinition {
  id: string;
  act: ActId;
  cardId: CardId;
  conditions?: ConditionExpression;
  earliestActTurn?: number;
  latestActTurn?: number;
  priority: number;
  once: boolean;
}

export interface ActDefinition {
  id: ActId;
  /** order of the act in the run */
  order: number;
  /** i18n key for act title (optional interstitial) */
  title?: string;
  /** contextual cards drawn before scheduler may advance act (soft target) */
  targetCards?: number;
}

export type EndingSequenceStep =
  | { type: 'article'; articleId: string }
  | { type: 'article_state'; state: 'normal' | 'edited' | 'removed' | 'unavailable' | 'archived'; articleId?: string }
  | { type: 'article_updates'; articleId: string; updateKeys: string[] }
  | { type: 'ending_card'; artId: string; titleKey: string; textKey: string }
  | { type: 'text'; textKey: string }
  | { type: 'stat_glitch'; stat: StatName; finalValue: number }
  | { type: 'delay'; milliseconds: number }
  | { type: 'memorial' }
  | { type: 'record_ledger' }
  | { type: 'credits' };

export interface EndingPresentation {
  sequence: EndingSequenceStep[];
}

export interface EndingDefinition {
  id: EndingId;
  priority: number;
  conditions: ConditionExpression;
  /** i18n key for the ending name shown in meta/endings list */
  titleKey: string;
  presentation: EndingPresentation;
  meta?: { category: 'positive' | 'mixed' | 'negative' };
}

export interface ArticleDefinition {
  id: string;
  headlineKey: string;
  bodyKeys: string[];
  sourceKey?: string;
}

// ---------------------------------------------------------------------------
// Characters / registries

export interface CharacterDefinition {
  id: CharacterId;
  /** i18n key: char.<id>.name */
  nameKey: string;
  role?: string;
  portrait?: Record<string, string>;
  tags?: string[];
  metadata?: { narrativeRole?: string };
}

export interface FlagDefinition {
  id: FlagId;
  description: string;
}

export interface PrecedentDefinition {
  id: PrecedentId;
  description: string;
}

// ---------------------------------------------------------------------------
// Runtime state

export interface RunState {
  runId: string;
  seed: string;
  turn: number;
  currentAct: ActId;
  actTurn: number;
  startedAt: number;
  /** Fictional chronology, independent of wall-clock play time. Optional for v1 save compatibility. */
  elapsedStoryDays?: number;
  currentCardId?: CardId;
  /** which incident route this run resolved to (set at route split) */
  incidentRoute?: 'player_caused' | 'ally_caused';
  completed: boolean;
  endingId?: EndingId;
}

export interface NarrativeRuntimeState {
  completedBeats: string[];
  activeThreads: NarrativeThreadId[];
  recentCards: CardId[];
  forcedNextCardId?: CardId;
  /** Explicit route temporarily displaced by the forced financial-rescue card. */
  financialResumeCardId?: CardId;
  pendingEndingId?: EndingId;
}

export interface GameState {
  run: RunState;
  stats: PlayerStats;
  flags: string[];
  relationships: Record<CharacterId, number>;
  precedents: Record<PrecedentId, number>;
  obligations: Obligation[];
  /** The Record: every promise made this run, in the order made. */
  promises: PromiseState[];
  history: ChoiceHistoryEntry[];
  scheduledEvents: ScheduledEvent[];
  seenCards: Record<CardId, number>;
  narrative: NarrativeRuntimeState;
  /** RNG stream position for deterministic resume */
  rngState: number;
}

// ---------------------------------------------------------------------------
// Save

export interface SaveData {
  version: number;
  state: GameState;
  language: string;
}

export interface MetaSave {
  version: number;
  completedRuns: number;
  discoveredEndings: EndingId[];
  firstCompletedAt?: number;
  quoteUnlocked: boolean;
  language?: string;
  settings?: {
    textScale?: number;
    musicVolume?: number;
    sfxVolume?: number;
    reducedMotion?: boolean;
    screenShake?: boolean;
  };
}

// ---------------------------------------------------------------------------
// Engine surface types

export interface NarrativeSelectionResult {
  cardId: CardId;
  source: 'forced' | 'mandatory_beat' | 'scheduled_event' | 'contextual' | 'ending';
  reason?: string;
}

export interface ConditionExplanation {
  result: boolean;
  explanation: string[];
}

/** Per-pack registry fragment; all fragments are merged at load time. */
export interface RegistryFragment {
  characters?: CharacterDefinition[];
  flags?: FlagDefinition[];
  precedents?: PrecedentDefinition[];
  events?: EventDefinition[];
  beats?: StoryBeatDefinition[];
  articles?: ArticleDefinition[];
  promises?: PromiseDefinition[];
}

export interface BalanceConfig {
  stats: Record<Exclude<StatName, 'money'>, { min: number; max: number }>;
  money: { min: number };
  economy: {
    /** Dollar balance at which the danger/runway bar reads full. Wealth remains uncapped. */
    safeReserve: number;
    lowThreshold: number;
    criticalThreshold: number;
    /** Money-pressure effects cannot reduce an otherwise-solvent run below this amount. */
    statusPressureFloor: number;
    /** Automatic operating cost paid after each non-exempt decision in the current act. */
    baseTurnCosts: Record<ActId, number>;
    /** Recurring fundraising/access income produced by visible political capital. */
    incomePerPoint: {
      standing: number;
      power: number;
      publicTrustPerceived: number;
    };
    /** Legitimate grassroots income, diluted as corrupt precedents accumulate. */
    civicIncomePerActualTrust: number;
    /** Network actors whose positive relationship points can be monetized as access. */
    leverageCapitalCharacters: CharacterId[];
    /** Relationship base and per-precedent accelerator for monetized access. */
    leverageWeights: {
      capitalRelationship: number;
      precedent: number;
    };
    /** Every capital relationship produces some access income, even below the compounding tier. */
    leverageIncomePerScore: Record<ActId, number>;
    /** Score above which an established network begins producing explosive returns. */
    leverageCompoundingThreshold: number;
    /** Act-specific return applied to leverage above the threshold, cubed. */
    leverageIncomePerScoreCubed: Record<ActId, number>;
    /** Recurring legal, reputational, and patronage cost of normalized shortcuts. */
    precedentExposureCostPerPoint: Record<ActId, number>;
    /** Additional per-turn cost for each point of unresolved obligation weight. */
    activeObligationCostPerWeight: Record<ActId, number>;
    /** Additional per-turn cost for each point of betrayed obligation weight. */
    betrayedObligationCostPerWeight: Record<ActId, number>;
    /** Acts in which reaching zero can force rescue or bankruptcy. */
    pressureActs: ActId[];
    rescue: {
      cardId: CardId;
      rescueFlag: FlagId;
      bankruptcyFlag: FlagId;
    };
  };
  relationships: { min: number; max: number };
  timeline: {
    /** Story day shown on the opening card. */
    initialDay: number;
    /** Minimum elapsed day when each act begins. */
    actStartDays: Record<ActId, number>;
    /** Authored pacing used unless a card supplies metadata.storyTimeAdvanceDays. */
    defaultCardAdvanceDays: Record<ActId, number>;
  };
  scheduler: {
    recentCardWindow: number;
    defaultCardWeight: number;
    /** contextual cards between beats, min/max pacing */
    maxConsecutiveContextual: number;
  };
  start: {
    stats: PlayerStats;
    act: ActId;
    firstCardId: CardId;
  };
}

export interface ContentBundle {
  cards: Record<CardId, CardDefinition>;
  events: Record<EventId, EventDefinition>;
  beats: StoryBeatDefinition[];
  endings: EndingDefinition[];
  articles: Record<string, ArticleDefinition>;
  characters: Record<CharacterId, CharacterDefinition>;
  flags: Record<FlagId, FlagDefinition>;
  precedents: Record<PrecedentId, PrecedentDefinition>;
  promises: Record<PromiseId, PromiseDefinition>;
  acts: ActDefinition[];
  balance: BalanceConfig;
}
