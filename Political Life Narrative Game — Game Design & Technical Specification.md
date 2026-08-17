# Political Life Narrative Game — Game Design & Technical Specification

## 1. High Concept

A short narrative choice game about the political career of a fictional politician.

The player begins as a relatively ordinary public servant with limited money, influence, and connections. Over time, they gain wealth, political standing, institutional power, and relationships with increasingly powerful people.

The central theme is inspired by:

> Power tends to corrupt, and absolute power corrupts absolutely.

However, the game must **never directly preach this message to the player during the main story**.

The theme should emerge naturally from gameplay.

The quote should only appear:

- in the Credits;
- or subtly on the Main Menu after completing the game at least once.

The central gameplay idea is:

> Every favor grants power, but every favor may also create an obligation.

The player can become increasingly powerful while simultaneously losing the ability to freely choose what they want to do.

---

# 2. Design Goals

The game should explore:

- political power;
- personal corruption;
- institutional corruption;
- favors and obligations;
- elite networks;
- media influence;
- conflicts between morality and political survival;
- the difference between public image and actual public trust;
- how seemingly minor compromises accumulate;
- how systems can protect powerful individuals from consequences.

The game should not present the player with obvious:

```text
GOOD
vs
EVIL
```

choices.

Most morally questionable decisions should initially appear reasonable.

The intended player reaction is:

> "It was only one exception."

followed much later by:

> "Why can I no longer refuse?"

---

# 3. Target Experience

## Session Length

Target first playthrough:

**30–60 minutes**

Ideal median:

**~45 minutes**

Approximate structure:

```text
Introduction       3–5 min
Rise               8–10 min
Network            10–15 min
Power              10–15 min
Final Gathering    5–8 min
Incident/Aftermath 7–12 min
```

A typical run should contain approximately:

**65–90 decisions.**

---

# 4. Content Scope

Recommended total authored content:

- 110–140 narrative cards;
- 8–12 major story beats;
- 6–8 ending variants;
- approximately 8,000–12,000 words;
- several recurring political characters;
- a small number of reusable locations.

Do not create a traditional exponentially branching narrative tree.

Use:

```text
Choice
↓
State Change
↓
Return to shared narrative pool
↓
Previous state modifies later events
```

Major branches should only occur around important story events.

---

# 5. Platform

Primary release:

- itch.io
- HTML5
- Desktop browser
- Mobile browser

Primary orientation:

**Portrait**

Recommended logical resolution:

```text
540 × 960
```

or:

```text
1080 × 1920
```

Desktop browsers should display the portrait game centered inside the page.

Mobile should scale to use the available screen.

Render Phaser text from 2× internal text textures. The logical layout remains `540 × 960`, but glyphs must stay sharp when the canvas is fitted to high-DPI or non-integer browser dimensions.

## 5.1 Story-Time Display

Show fictional elapsed time directly beneath the card:

```text
YEAR 3
DAY 842 IN OFFICE
```

This is authored story chronology, not wall-clock play time and not a cosmetic animation counter. Each act defines a minimum start day and a default number of days advanced per card; individual cards may override that value. The Gathering and Incident occur on the same night and therefore advance zero days unless explicitly authored otherwise.

The card should sit immediately below the rendered narrative text. Use a small dynamic vertical adjustment for shorter passages and a capped scroll viewport for long passages, avoiding a large empty block between prose and artwork.

---

# 6. Recommended Technology

## Stack

Use:

```text
Phaser
TypeScript
Vite
```

Optional:

```text
Zod
```

for validating narrative data.

Do not require:

```text
React
Redux
Backend
Database
Authentication
Physics Engine
```

The game should be fully playable locally in the browser.

Save data should use:

```text
localStorage
```

Language is an application-level setting stored in the meta save. When continuing an existing run, the currently selected menu language must win over the historical language recorded in the run save. Card IDs and state remain language-neutral, so the same run can be rendered in any supported locale.

---

# 7. Why Phaser Instead of Unity

Phaser is recommended because the game primarily consists of:

- cards;
- text;
- portraits;
- UI;
- simple animations;
- state management;
- narrative logic;
- audio;
- browser deployment.

The project does not require:

- physics;
- 3D;
- complex character animation;
- navigation;
- advanced rendering;
- native plugins;
- large scene authoring tools.

Unity would work, but most of the engine would remain unused.

Use Unity instead only if the project later expands toward:

- 3D environments;
- interactive driving sequences;
- cinematic character animation;
- extensive VFX;
- native PC/mobile becoming more important than browser deployment.

For the current scope:

**Phaser + TypeScript should be the default.**

---

# 8. Core Gameplay Loop

```text
SHOW CARD
    ↓
PLAYER INSPECTS OPTIONS
    ↓
PREVIEW CONSEQUENCES
    ↓
SWIPE LEFT / RIGHT
    ↓
RESOLVE CHOICE
    ↓
UPDATE STATS
    ↓
CREATE FLAGS / RELATIONSHIPS / OBLIGATIONS
    ↓
SCHEDULE DELAYED CONSEQUENCES
    ↓
SELECT NEXT EVENT
```

The philosophical gameplay loop is:

```text
Small compromise
      ↓
Immediate advantage
      ↓
Relationship / obligation
      ↓
Later favor requested
      ↓
Freedom becomes more expensive
      ↓
More power
      ↓
Less autonomy
```

---

# 9. Main Game UI

Basic layout:

```text
┌─────────────────────────┐
│ $84,300                 │
│                         │
│ Standing █████░░░       │
│ Power    ████░░░░       │
│ ♥        ██████░░       │
│                         │
│ ┌─────────────────────┐ │
│ │                     │ │
│ │    Illustration     │ │
│ │                     │ │
│ │       Speaker       │ │
│ │                     │ │
│ │    Narrative Text   │ │
│ │                     │ │
│ └─────────────────────┘ │
│                         │
│ ← Choice       Choice → │
└─────────────────────────┘
```

The interaction should be inspired by card-swiping narrative games, but the visual identity must remain original.

---

# 10. Visible Player Statistics

The player has four primary visible statistics.

---

## 10.1 Money and Financial Runway

Money is displayed as an actual number together with a compact financial-runway bar. The number is the source of truth; the bar makes danger legible at a glance and is full at the configured safe reserve. Money itself remains uncapped. The main balance always shows every digit, including at million and billion scale; only per-turn cash flow and animated signed changes use compact `M`/`B` notation.

Example progression:

```text
$50,000
$87,000
$230,000
$820,000
$18.6M
$240M
$1.34B
```

Target outcome bands are intentionally extreme: a coherent clean career should usually finish around `$100K–$200K`, while an optimized full-corruption career should reach `$1B+`. The widening gap is thematic, not merely inflation. By late game, refusing the machine must mean walking away from life-changing wealth.

Money should visually communicate both escalation and danger. After every decision, animate the exact signed change beside the balance. While dragging, retain the approximate arrow preview so the player understands direction and magnitude without turning the choice into arithmetic.

Internal representation:

```ts
money: number;
```

Money does not require a fixed maximum.

Every non-exempt decision before the incident settles automatic cash flow. Political Standing, Power, and perceived Public Trust generate ordinary institutional income. Actual Public Trust generates legitimate civic support; each normalized corrupt precedent dilutes that income.

Corrupt wealth uses a separate leverage economy. Positive relationships with the Mentor, Businessman, Editor, and Minister create capital access. Normalized shortcuts multiply the value of those relationships. Below the configured leverage threshold, each connection produces modest access income. Above it, returns compound cubically and accelerate sharply by act, allowing a coherent corruption route to move from thousands to millions and finally billions. Precedents also carry an escalating exposure cost, so random or contradictory corruption can bankrupt the player while a carefully maintained machine grows rich enough to absorb the same cost.

This economy must never be presented as a visible corruption score. The player sees only the exact cash result and learns that the easier relationship-preserving choices keep paying more. Clean civic relationships such as the Reformist and Aide do not create private leverage.

The HUD also shows the recurring cost of the current position (`−$X / turn`). The final incident and aftermath are exempt: those choices should remain moral and institutional decisions, not financial optimization puzzles.

At zero money, the first insolvency interrupts the story with a one-time lifeline choice. Accepting restores runway but creates a heavy obligation and resumes the interrupted route. Refusing ends the run. Reaching zero again after taking the lifeline produces the bankruptcy ending.

---

# 11. Standing

Range:

```text
0–100
```

Standing represents the player's position within political and elite society.

It includes:

- prestige among politicians;
- access to important meetings;
- acceptance among senior officials;
- media prominence;
- relationships with influential business groups;
- perceived importance inside the establishment.

Standing is **not** the same as public popularity.

Example:

A luxurious dinner with senior political figures may increase Standing while having little or negative effect on Public Trust.

---

# 12. Power

Range:

```text
0–100
```

Power represents the player's practical ability to influence institutions and other people.

High Power can allow the player to:

- obtain promotions;
- influence appointments;
- protect allies;
- pressure organizations;
- control administrative decisions;
- influence media;
- interfere with investigations;
- force reforms through institutions.

Power itself is not inherently evil.

A morally good player may also require Power to achieve meaningful reforms.

The important question is:

> How was that power obtained, and how is it used?

---

# 13. Public Trust

Range:

```text
0–100
```

Displayed using a heart icon:

```text
♥
```

Public Trust represents popular support for the player.

It is intentionally the least reliable statistic.

The player can see its approximate current level but cannot perfectly predict changes.

Possible previews:

```text
♥ ?
♥ ↑?
♥ ↓?
♥ ↑↑?
```

The game may internally distinguish:

```ts
actualPublicTrust
perceivedPublicTrust
```

The player's information may be distorted by:

- advisors;
- polling;
- propaganda;
- media framing;
- delayed reactions;
- political information bubbles.

The game must not randomly lie to the player.

Incorrect predictions should always have an understandable systemic reason.

---

# 14. Decision Preview

When the player begins dragging a card toward an option, estimated stat changes appear.

Example:

```text
Money      ↑
Standing   ↑
Power      ↑↑
♥          ↑?
```

Magnitude notation:

```text
↑
↑↑
↑↑↑

↓
↓↓
↓↓↓
```

Do not show exact numeric changes before a decision.

Public Trust predictions should remain less certain than the other statistics.

---

# 15. Limited Stat-Based Game Over

Do not immediately end the game because:

```text
Power = 0
Standing = 0
Trust = 0
```

Money is the deliberate exception. A depleted financial runway triggers the one-time lifeline described in Section 10.1; a second insolvency ends in bankruptcy. The warning bar, recurring-cost label, projected arrow, and exact post-choice settlement must make this outcome foreseeable.

Instead, extreme statistics should alter future events.

Examples:

```text
Power < 10
```

Important people stop answering the player's calls.

```text
Standing < 10
```

The player loses access to political institutions.

```text
Trust < 10
```

Protests, hostility, or legitimacy crises emerge.

```text
Power > 90
```

The player gains access to extremely powerful institutional actions.

All other completion remains narrative-driven. Bankruptcy is itself a narrative ending, not a generic failure screen.

---

# 16. Hidden State

Do not use a single hidden:

```text
Morality = 37
```

value.

Hidden state should instead consist of concrete history:

```ts
flags
relationships
obligations
precedents
delayedConsequences
choiceHistory
```

This allows consequences to originate from specific past decisions.

---

# 17. Obligation System

The Obligation system is one of the core mechanics.

Whenever the player accepts meaningful assistance from another powerful actor, an obligation may be created.

Examples:

- receiving support for a promotion;
- accepting protected investment;
- receiving favorable media coverage;
- asking someone to suppress a scandal;
- accepting political protection;
- getting administrative help;
- protecting someone else's interests.

Example:

```ts
interface Obligation {
    id: string;
    creditor: string;
    sourceCardId: string;
    weight: number;
    tags: string[];
}
```

Example instance:

```ts
{
    id: "debt_minister_03",
    creditor: "minister",
    sourceCardId: "minister_support_vote",
    weight: 2,
    tags: ["political", "promotion"]
}
```

There should be **no visible Obligation meter**.

The player should understand these relationships through narrative memory rather than through a numerical corruption UI.

---

# 18. The Cost of Favors

Early game:

```text
I can refuse.
```

Mid-game:

```text
I can refuse,
but it will cost me politically.
```

Late-game:

```text
REFUSE 🔒
```

A locked decision should never happen simply because:

```text
corruption > 70
```

It should happen because of specific dependencies.

Example:

```ts
innerCircleObligation >= 4
```

or:

```ts
acceptedProtectedInvestment
&&
coveredMinisterScandal
&&
receivedPromotionSupport
```

---

# 19. Locked Choices

Locked choices are a central mechanic.

However, they must never feel like arbitrary narrative cheating.

When the player attempts a locked option:

1. The card moves toward the option.
2. Resistance appears.
3. The option displays a lock.
4. The screen briefly flashes.
5. Several specific past choices appear.
6. The card returns to the center.
7. The player understands why that choice is no longer available.

Example:

```text
REFUSE THE DRINK 🔒
```

Player attempts to select it.

Flashback:

```text
"You support this proposal,
and I'll remember the favor."

YOU SIGNED.
```

Flash.

```text
INVESTMENT RECEIVED
+$120,000
```

Flash.

```text
"Let my editor deal with the article."

YOU AGREED.
```

Return to present:

```text
REFUSE 🔒
```

Optional small caption:

> You owe too many people at this table.

The important realization should be:

> The game did not remove my freedom.  
> My earlier decisions did.

---

# 20. Flashback System

Every locked option must store traceable causes.

Example:

```ts
lockReason: {
    type: "obligation",
    sources: [
        "card_023",
        "card_041",
        "card_058"
    ]
}
```

When the lock triggers, the engine retrieves the exact historical choices associated with those cards.

Do not display random "bad choices."

Flashback duration:

```text
0.5–1 second per memory
```

Total:

```text
2–4 seconds
```

The first occurrence should not be skippable.

Replay mode may allow skipping.

---

# 21. Precedent System

Obligations mean:

> I owe somebody something.

Precedents mean:

> I already accepted this behavior as normal.

Example:

```ts
precedents.mediaSuppression += 1;
precedents.nepotism += 1;
precedents.bribery += 1;
precedents.policeInterference += 1;
```

Precedents affect:

- available actions;
- wording;
- NPC expectations;
- escalation of behavior;
- institutional norms.

Example escalation:

First occurrence:

> Ask the editor to delay publication.

Later:

> Request that the article be removed.

Later:

> Prevent the story from being published.

The escalation should happen without the narrator explaining it.

---

# 22. Relationships

Important recurring characters should have hidden relationship values.

Example:

```ts
relationships = {
    mentor: 0,
    minister: 0,
    businessman: 0,
    mediaEditor: 0,
    reformist: 0,
    innerCircle: 0
};
```

Suggested range:

```text
-5 to +5
```

Relationships are not shown directly.

Dialogue and behavior communicate them.

---

# 23. Narrative Structure

## ACT 0 — Entry

Duration:

**3–5 minutes**

Starting state:

```text
Money      $50,000
Standing   ~15
Power      ~5
Trust      ~40
```

Purpose:

- teach card interaction;
- introduce stats;
- establish the protagonist;
- establish the political world;
- make the player feel fully autonomous.

Approximately:

```text
6–8 cards
```

Choices should initially feel straightforward.

---

# 24. ACT I — Rise

Duration:

**8–10 minutes**

Theme:

> Small compromises.

Possible situations:

- speeches;
- parliamentary proposals;
- constituent issues;
- minor administrative favors;
- networking;
- early media appearances;
- first business contacts.

Avoid obvious corruption.

Bad:

```text
TAKE BRIBE
REFUSE BRIBE
```

Better:

```text
A friend asks you to help
speed up an application.
```

Options:

```text
Follow the normal procedure.
```

versus:

```text
I'll make a call.
```

---

# 25. ACT II — Network

Duration:

**10–15 minutes**

The player now possesses more:

- Money;
- Standing;
- Power;
- relationships;
- obligations.

Earlier characters begin returning.

Past favors create requests.

Delayed consequences become frequent.

Example:

Turn 15:

> Approve a contractor.

Turn 30:

> The contractor is involved in a scandal.

The player should repeatedly feel:

> The game remembers what I did.

---

# 26. ACT III — Power

Duration:

**10–15 minutes**

The player now has meaningful institutional authority.

This is where the game begins creating decisions where morally defensible behavior may damage every visible political statistic.

Example:

### Investigate an ally

```text
Money      -
Standing   ↓↓
Power      ↓↓
♥          ?
```

### Delay the investigation

```text
Money      ↑
Standing   ↑
Power      ↑
♥          ?
```

The UI must never tell the player which choice is morally correct.

---

# 27. Final Gathering

Duration:

**5–8 minutes**

A luxurious private political gathering.

Several previously established relationships converge here.

Possible events:

- being offered alcohol;
- agreeing to support an upcoming proposal;
- joining an investment;
- helping a protected business;
- making promises;
- supporting an ally;
- refusing an influential figure.

This sequence should strongly expose the player's obligations.

Some choices may now be locked.

---

# 28. The Incident

The major traffic incident should occur in every primary route.

However, **the player's relationship to the incident changes depending on previous choices.**

This prevents the story from suggesting:

> If the protagonist is morally good enough, tragedy simply disappears.

Instead, the final question becomes:

> When tragedy happens, what does someone with power do?

---

# 29. Route A — The Player Causes the Incident

Certain previous choices may result in:

```text
Player accepts alcohol
↓
Player drives
↓
Dangerous situation
↓
Collision
```

Some options during this sequence may already be unavailable due to earlier obligations.

After the collision:

Remove all stat previews.

Remove political advisors.

Reduce or remove music.

Present only:

```text
STAY
```

or:

```text
LEAVE
```

This should feel fundamentally different from ordinary political optimization.

---

# 30. Route B — Another Official Causes the Incident

If the player avoids being responsible for the collision, the incident still occurs.

Another powerful political figure causes it.

The player receives a call:

> We have a problem.

Then:

> This needs to be handled quietly.

The player is now asked to use their accumulated influence to protect someone else.

This mirrors Route A.

---

# 31. Mirrored Final Structure

Corrupted route:

```text
YOU CAUSED THE INCIDENT
        ↓
THE SYSTEM OFFERS TO PROTECT YOU
        ↓
WHAT DO YOU DO?
```

Alternative route:

```text
AN ALLY CAUSED THE INCIDENT
        ↓
THE SYSTEM ASKS YOU TO PROTECT THEM
        ↓
WHAT DO YOU DO?
```

The same political machinery exists in both cases.

The difference is only where the player stands inside it.

---

# 32. Final Aftermath Sequence

The incident should not immediately end the game.

It triggers a sequence involving:

```text
Emergency Response
↓
Police
↓
Political Advisors
↓
Media
↓
Political Allies
↓
Victim Support / Compensation
↓
Investigation
↓
Public Reaction
↓
Ending
```

Previous choices determine which actions remain possible.

---

# 33. Accountability State

Track concrete behavior.

Example:

```ts
stayedAtScene
calledEmergency
cooperatedWithInvestigation
suppressedMedia
tamperedEvidence
protectedAlly
compensatedVictim
acceptedResponsibility
preservedRecords
```

Do not calculate endings through a single:

```ts
goodEndingScore
```

variable.

Ending logic should derive from actual actions.

---

# 34. Ending Families

Target:

**6–8 endings**

rather than dozens.

---

## Ending A — Accountability

The player loses political power but allows or supports investigation.

Potential good ending.

---

## Ending B — Personal Remorse

The player caused the incident but:

- stayed;
- called emergency services;
- accepted responsibility;
- cooperated.

The player may lose everything politically.

The ending is not happy, but retains humanity.

---

## Ending C — Protected

The player successfully uses political influence to avoid consequences.

Possible outcome:

```text
Power: High
Standing: High
Public Trust: Very Low
```

The related article later disappears.

---

## Ending D — Untouchable

Extreme Power route.

The player remains politically powerful.

The incident nearly disappears from public discussion.

No celebratory ending.

---

## Ending E — Scapegoat

The player has participated in corruption but does not possess enough Power to protect themselves.

Former allies sacrifice the player to protect the broader network.

---

## Ending F — Collapse

Extremely low Public Trust combined with political instability causes the player's network to collapse.

Avoid making this ending primarily about violent spectacle.

Focus on institutional collapse and abandonment.

---

## Ending G — Break the Chain

A powerful ally causes the incident.

The player is asked to suppress it.

The player instead:

- preserves evidence;
- allows reporting;
- permits investigation;
- refuses interference.

Consequences may include:

```text
Standing ↓↓↓
Power    ↓↓↓
```

The player may lose office.

The investigation continues.

This is the strongest positive ending.

---

# 35. Positive Ending Philosophy

The good ending must not be a perfect utopia.

The player's reward is not:

> You became the perfect ruler and fixed everything.

Instead:

> You were willing to lose power rather than use it to destroy accountability.

The player may leave politics with:

```text
Power    20
Standing 15
Money    Moderate
```

but institutions remain capable of investigating powerful people.

The underlying message becomes:

> A good political system should not depend entirely on having a perfectly good person in power.

---

# 36. Bad Ending Presentation

Bad endings should be:

- short;
- cold;
- bureaucratic;
- emotionally restrained.

Do not directly guilt-trip the player.

Avoid:

> Are you ashamed?

or:

> Was the money worth it?

Instead, use institutional or journalistic language.

---

# 37. News Article Ending

Example:

A fictional news page appears.

Headline:

> SENIOR OFFICIAL INVOLVED IN LATE-NIGHT TRAFFIC COLLISION

The player reads several lines.

The page reloads.

Then:

```text
This article is unavailable.
```

Reload again:

```text
The content you requested may have
been moved or deleted.
```

White screen.

Fade to black.

Memorial card.

Credits.

No narrator judgement is required.

---

# 38. Ending Variations Through Media

Different endings can use the same newspaper motif.

### Weak player

Article remains available.

```text
FORMER OFFICIAL SENTENCED
AFTER TRAFFIC COLLISION
```

---

### Protected player

Article appears.

Then disappears.

---

### Extreme political collapse

Previously suppressed stories begin reappearing.

Multiple headlines surface.

Old records become visible again.

---

### Positive ending

The article remains accessible.

Later updates appear:

```text
DAY 1
Investigation announced.

DAY 12
Relevant records released.

MONTH 3
Official formally charged.

MONTH 11
Court proceedings begin.
```

No text such as:

> Justice prevailed.

The continued existence of the record is the reward.

---

# 39. Memorial

The fictional story must remain separate from the real-world memorial.

Avoid using:

- real politician names;
- recognizable portraits;
- real political parties;
- real institutional logos;
- real vehicle registration numbers;
- real company names;
- specific identifying political titles.

Use a simple memorial card:

> **In memory of the victims of the May 30, 2025 traffic collision.**

or Vietnamese localization:

> **Tưởng nhớ các nạn nhân của vụ tai nạn ngày 30 tháng 5 năm 2025.**

Do not explain the real incident inside the fictional narrative.

---

# 40. Hidden Quote

Before first completion:

```text
NEW GAME
CONTINUE
CREDITS
```

After completing any ending:

```text
NEW GAME
CONTINUE
CREDITS

Power tends to corrupt...
```

The quote should:

- use small typography;
- have no special animation;
- have no achievement popup;
- not be highlighted.

The player should discover it naturally.

---

# 41. Narrative Card Data Model

All narrative content should be data-driven.

Do not hard-code story cards directly inside game logic.

Example:

```ts
interface CardDefinition {
    id: string;

    act: string;
    speaker?: string;

    text: string;

    illustration?: string;

    left: ChoiceDefinition;
    right: ChoiceDefinition;

    conditions?: Condition[];

    weight?: number;

    minTurn?: number;
    maxTurn?: number;

    once?: boolean;

    tags?: string[];
}
```

Choice:

```ts
interface ChoiceDefinition {
    text: string;

    preview?: StatPreview;

    effects?: Effect[];

    lock?: LockCondition;

    nextCard?: string;

    delayedEffects?: DelayedEffect[];
}
```

---

# 42. Example Narrative Card

```json
{
  "id": "act2_business_favor_01",
  "act": "network",
  "speaker": "businessman",
  "text": "The permit has been sitting on someone's desk for months.",
  "left": {
    "text": "Follow the normal process.",
    "preview": {
      "standing": -1,
      "power": -1
    }
  },
  "right": {
    "text": "I'll make a call.",
    "preview": {
      "standing": 1,
      "power": 1
    },
    "effects": [
      {
        "type": "addObligation",
        "creditor": "businessman",
        "weight": 1
      }
    ]
  }
}
```

---

# 43. Effects

Stat effect example:

```json
{
  "money": 120000,
  "standing": 5,
  "power": 8,
  "publicTrust": -3
}
```

Flag effect:

```json
{
  "type": "addFlag",
  "flag": "accepted_protected_investment"
}
```

Obligation effect:

```json
{
  "type": "addObligation",
  "creditor": "business_group",
  "weight": 2
}
```

---

# 44. Delayed Consequences

A significant percentage of meaningful decisions should return later.

Example:

```json
{
  "delayTurns": 8,
  "event": "contract_scandal"
}
```

or:

```json
{
  "delayTurns": [5, 10],
  "event": "journalist_investigation"
}
```

If a random delay is selected, determine it at scheduling time.

Save the result.

Reloading the game must not reroll consequences.

---

# 45. Narrative Scheduler

The narrative scheduler should have three priorities.

## Priority 1 — Mandatory Story Beats

Examples:

- first promotion;
- major political appointment;
- major parliamentary event;
- final gathering;
- incident;
- ending sequence.

---

## Priority 2 — Triggered Consequences

Examples:

- an old ally requesting repayment;
- a journalist investigating an old decision;
- a business scandal;
- a protected person asking for help;
- consequences from previous reforms.

---

## Priority 3 — Contextual Cards

Used for pacing.

Examples:

- parliamentary debates;
- constituents;
- media;
- political relationships;
- business;
- family;
- bureaucracy.

---

# 46. Suggested Scheduler Flow

```text
ACT START
↓
3–5 contextual decisions
↓
MANDATORY BEAT
↓
2–4 contextual decisions
↓
DELAYED CONSEQUENCE
↓
MANDATORY BEAT
↓
ACT TRANSITION
```

Do not allow long stretches of disconnected random cards.

---

# 47. Pacing Rule

Avoid more than approximately:

```text
5 generic cards
```

without a meaningful callback or progression event.

Every 3–5 decisions, ideally include at least one of:

- callback;
- relationship development;
- consequence;
- promotion;
- scandal;
- reveal;
- political escalation.

The player should frequently think:

> That happened because of something I did earlier.

---

# 48. Delayed Consequence Target

Approximately:

**30–40%**

of meaningful decisions should create some later callback.

Not every callback needs to be dramatic.

Even a short dialogue reference can create continuity.

Example:

Early:

> You helped my brother once.

Later:

> My brother still remembers what you did for him.

---

# 49. Choice Writing Principles

Avoid obvious morality tests.

Preferred conflict structures:

### Principle vs Convenience

```text
Follow procedure
vs
Make an exception
```

### Truth vs Stability

```text
Release the findings
vs
Delay publication
```

### Justice vs Political Capital

```text
Investigate the ally
vs
Protect the coalition
```

### Institutional Process vs Immediate Results

```text
Respect procedure
vs
Use your influence
```

### Personal Loyalty vs Public Responsibility

```text
Protect your friend
vs
Allow the investigation
```

The strongest corrupt decisions should feel rational.

---

# 50. Save System

Autosave after every resolved decision.

Example:

```ts
interface SaveData {
    version: number;

    seed: string;

    currentAct: number;
    turn: number;

    stats: Stats;

    flags: string[];

    obligations: Obligation[];
    precedents: Record<string, number>;
    relationships: Record<string, number>;

    history: ChoiceHistory[];

    delayedEvents: ScheduledEvent[];

    seenCards: string[];

    currentCardId: string;
}
```

Use:

```text
localStorage
```

---

# 51. Choice History

Every decision should be recorded.

Example:

```ts
interface ChoiceHistory {
    cardId: string;
    choice: "left" | "right";

    createdObligations: string[];
    createdFlags: string[];
}
```

This data powers:

- flashbacks;
- ending logic;
- narrative callbacks;
- debugging.

---

# 52. Meta Progression

Store meta-state separately.

```ts
interface MetaSave {
    hasCompletedGame: boolean;
    discoveredEndings: string[];
    playthroughCount: number;
}
```

The hidden quote becomes visible when:

```ts
hasCompletedGame === true
```

---

# 53. Phaser Scene Architecture

Recommended scenes:

```text
BootScene
PreloadScene
MainMenuScene
GameScene
EndingScene
CreditsScene
```

Do not create separate Phaser scenes for individual narrative cards.

Cards are data loaded into `GameScene`.

---

# 54. Suggested Project Structure

```text
src/
├── core/
│   ├── GameState.ts
│   ├── SaveManager.ts
│   ├── NarrativeEngine.ts
│   ├── ConditionEvaluator.ts
│   ├── EffectResolver.ts
│   └── EventScheduler.ts
│
├── narrative/
│   ├── CardRepository.ts
│   └── NarrativeValidator.ts
│
├── ui/
│   ├── CardView.ts
│   ├── StatsHUD.ts
│   ├── ChoicePreview.ts
│   ├── FlashbackOverlay.ts
│   └── ArticleView.ts
│
├── scenes/
│   ├── BootScene.ts
│   ├── PreloadScene.ts
│   ├── MainMenuScene.ts
│   ├── GameScene.ts
│   ├── EndingScene.ts
│   └── CreditsScene.ts
│
├── data/
│   ├── cards/
│   ├── endings/
│   ├── characters/
│   └── config/
│
└── main.ts
```

---

# 55. Narrative Engine

`NarrativeEngine` should contain no rendering logic.

Primary API:

```ts
getNextCard(state: GameState): CardDefinition
```

Responsibilities:

```text
Check mandatory story beat
↓
Check triggered consequence
↓
Find valid contextual cards
↓
Evaluate conditions
↓
Remove recently repeated cards
↓
Perform weighted selection
↓
Return card
```

UI should never directly determine narrative progression.

---

# 56. Conditions

The condition system should support:

```text
AND
OR
NOT

stat comparison
flags
relationships
precedents
obligations
current act
current turn
previous history
```

Example:

```json
{
  "all": [
    {
      "stat": "power",
      "gte": 50
    },
    {
      "flag": "knows_editor"
    },
    {
      "notFlag": "editor_arrested"
    }
  ]
}
```

---

# 57. Card Interaction

Desktop controls:

```text
Mouse drag
A / Left Arrow
D / Right Arrow
```

Mobile:

```text
Swipe left
Swipe right
```

Suggested interaction thresholds:

```text
0–20% drag:
No consequence preview.

20–50%:
Choice label appears.

50%+:
Stat preview becomes clear.

Release after threshold:
Commit decision.
```

---

# 58. Locked Card Interaction

Do not simply disable a locked side.

The player should still be allowed to attempt it.

Sequence:

```text
Player drags toward locked option
↓
Card movement becomes resistant
↓
Lock icon appears
↓
Flashback sequence
↓
Card returns to center
```

The inability to choose must itself become part of the emotional experience.

---

# 59. Visual Direction

The game may use the broad interaction language of minimalist card-based narrative games, but must create its own visual identity.

Use:

- original card shapes;
- original typography;
- original icons;
- original color palette;
- original portrait style;
- original transitions.

Current presentation contract:

- use a clean near-black portrait play surface with warm cream text and solid gold, rose, blue, and burgundy accents;
- show an illustrated fictional capital landscape around the portrait canvas on wide desktop screens;
- keep the central landscape quiet so it never competes with the game;
- render card artwork full-bleed with rounded corners and a soft shadow;
- do not place a visible border or inset frame between artwork and the card edge;
- use the same rounded solid-burgundy card when no illustration is available.

Illustrations should be:

```text
Stylized
Minimal
Flat
Generic
Politically ambiguous
Fictional
```

Avoid recognizable:

- politicians;
- national flags;
- political party symbols;
- government logos.

---

# 60. Character Art

Recurring characters only need:

```text
1 base portrait
2–4 expression variants
```

Suggested expressions:

- neutral;
- friendly;
- concerned;
- angry;
- disappointed.

No skeletal animation is required.

Use simple:

- crossfades;
- scale;
- slight movement;
- camera emphasis.

---

# 61. Audio

Keep audio minimal.

Recommended:

- card swipe;
- subtle UI feedback;
- quiet office ambience;
- parliamentary ambience;
- party ambience;
- road ambience;
- article refresh sound;
- subtle impact sound;
- ending ambience.

Voice acting is not required.

The accident should not become audiovisual spectacle.

---

# 62. Incident Presentation

Do not create a driving minigame.

Suggested presentation:

```text
Road illustration
↓
Short narrative interaction
↓
Decision
↓
Headlights / motion
↓
Impact sound
↓
Black screen
```

No gore is required.

The important gameplay begins **after** the collision.

---

# 63. Article System

The news interface can be rendered inside Phaser.

Required states:

```text
Normal article
Loading
Edited article
Removed article
404 / unavailable
Archived article
```

Suggested API:

```ts
article.visible
article.edited
article.removed
article.archived
```

The newspaper interface can become a recurring visual motif throughout the game.

---

# 64. Accessibility

Include:

- Text Size;
- Music Volume;
- SFX Volume;
- Reduced Motion;
- Screen Shake toggle.

Do not use timed moral decisions.

The player should always be allowed to read at their own pace.

When Reduced Motion is enabled, replace glitch-heavy flashbacks with fades or static cuts.

---

# 65. Tutorial

Keep tutorial minimal.

Example:

Card 1:

```text
Drag left.
```

Card 2:

```text
Drag right.
```

Card 3 introduces stat previews.

Afterward, remove tutorial guidance.

---

# 66. Debug Tools

Development builds should have a hidden debug overlay.

Suggested key:

```text
F1
```

Display:

```text
Money
Standing
Power
Actual Trust
Perceived Trust

Flags
Relationships
Obligations
Precedents

Current Act
Current Turn

Queued Events
Next Mandatory Beat
Current Card ID
```

---

# 67. Locked Choice Debugging

In debug mode, locked decisions should expose their exact causes.

Example:

```text
LOCKED BECAUSE:

debt_minister_02
source: card_031

debt_business_01
source: card_044
```

This is especially important for testing flashback logic.

---

# 68. Narrative Validation

Build validation should detect:

- duplicate card IDs;
- missing references;
- invalid character IDs;
- unknown flags;
- invalid effects;
- invalid ending references;
- flashbacks referencing nonexistent cards;
- malformed conditions;
- impossible story dependencies.

Development builds should fail loudly when narrative data is invalid.

Do not silently ignore errors.

---

# 69. Automated Narrative Simulation

Create a simple headless simulation.

Bot strategies:

```text
Always Left
Always Right
Random
Maximize Money
Maximize Power
Maximize Trust
Avoid Obligations
```

Run:

```text
1,000–10,000 simulated playthroughs
```

Validate:

- no softlocks;
- no infinite loops;
- every intended ending is reachable;
- the incident always happens;
- average playthrough length is reasonable;
- mandatory beats trigger correctly;
- no card appears excessively;
- locked options always have valid historical causes.

---

# 70. Development Workflow

Do **not** begin by writing the entire narrative.

First build a small mechanical prototype.

---

## Milestone 1 — Basic Prototype

Implement:

```text
Card swipe
Four stats
JSON card loading
Effect resolution
Save/load
```

Use approximately:

```text
10 placeholder cards
```

No final art required.

---

# 71. Milestone 2 — Narrative Systems

Implement:

```text
Conditions
Scheduler
Flags
Relationships
Obligations
Precedents
Delayed events
```

Expand to approximately:

```text
30 placeholder cards
```

---

# 72. Milestone 3 — Locked Choice System

Implement:

```text
Choice lock
History tracking
Source lookup
Flashback presentation
Card resistance
```

This is one of the most important milestones.

Test the following experience:

```text
Choice A
↓
Gain advantage
↓
Create obligation
↓
20 decisions later
↓
Attempt another choice
↓
Choice is locked
↓
Flashback shows exactly why
```

If this feels emotionally convincing, the central mechanic works.

---

# 73. Milestone 4 — Full Narrative Skeleton

Build the entire game using placeholder writing.

Required playable structure:

```text
Entry
↓
Rise
↓
Network
↓
Power
↓
Final Gathering
↓
Incident
↓
Aftermath
↓
Ending
```

Do not create final art before a complete run is playable.

---

# 74. Milestone 5 — Ending System

Implement:

```text
Incident branching
Aftermath state
News article system
Article removal
Memorial
Credits
Meta save
Quote unlock
```

At least three temporary endings should work before writing full narrative content.

---

# 75. Milestone 6 — Narrative Writing

Once the mechanical skeleton is stable:

Write approximately:

```text
110–140 cards
```

Narrative content should remain data-driven.

Do not move story logic into arbitrary TypeScript conditionals.

---

# 76. Milestone 7 — Art and Audio

Replace placeholders with:

- portraits;
- backgrounds;
- UI icons;
- typography;
- music;
- SFX;
- article presentation.

---

# 77. Milestone 8 — Balance and Playtesting

Run automated simulations first.

Then human playtests.

Target first-run duration:

```text
30–60 minutes
```

Test specifically:

- whether corrupt choices feel tempting;
- whether consequences feel traceable;
- whether locked choices feel deserved;
- whether Public Trust feels intentionally uncertain rather than random;
- whether players understand why their freedom is shrinking;
- whether the ending feels systemic rather than preachy.

---

# 78. Scope Cut Priority

If development scope becomes too large, cut these first:

- animated backgrounds;
- lip sync;
- cinematic animation;
- complex shaders;
- achievement system;
- online analytics;
- cloud saves;
- ending gallery;
- multiple languages;
- downloadable desktop wrapper.

Do **not** cut:

- Obligation system;
- delayed consequences;
- locked choices;
- historical flashbacks;
- mirrored incident routes;
- article ending;
- save system;
- narrative validation.

These systems define the game.

---

# 79. MVP Definition

The MVP is complete when:

- the browser can launch the game;
- the player starts with approximately `$50,000`;
- left/right card decisions work;
- all four statistics work;
- cards load from data;
- the scheduler works;
- decisions create flags and obligations;
- previous choices can return later;
- at least one late-game choice can become locked;
- its flashback correctly identifies the previous causes;
- the incident always occurs;
- the player can react to the incident;
- at least three endings function;
- the article ending works;
- the memorial card appears;
- browser refresh preserves progress;
- one full run takes approximately 30–60 minutes.

Final art quality is **not** required for the MVP.

---

# 80. Core Design Principle

The player should not become corrupt because the game repeatedly asks:

> Do you want to be evil?

Instead, corruption should emerge from repeated decisions that each appear useful, practical, or defensible at the time.

The ideal progression is:

```text
I need this favor.
↓
It is only one exception.
↓
This person helped me before.
↓
I cannot betray them now.
↓
Refusing would destroy everything I built.
↓
Why is this option locked?
↓
Oh.
```

The final realization should not come from a narrator.

It should come from the game remembering the player's own decisions.

---

# 81. Standing and Power Gameplay Layer

Money remains the survival metric. Standing and Power decide which financial and narrative situations the player is allowed to enter.

Standing represents access and social legitimacy:

- `0–24`: sponsors withdraw, press attention must be purchased, and recovery begins with unglamorous local work;
- `25–59`: coalitions and civic foundations begin recruiting the player;
- `60–79`: succession networks and private-capital councils seek the player's endorsement;
- `80–100`: dominant reputation uses the same high-tier stories with stronger economic leverage from the surrounding network.

Power represents executable institutional capacity:

- low Power makes a famous player a figurehead and can impose nonlethal cash pressure;
- high Power changes existing choices, permitting independent audits, protected disclosure, procurement firewalls, and record preservation;
- consequential institutional acts spend Power in authored amounts of approximately `6`, `12`, or `20` rather than treating it as a passive score;
- coercive choices may convert Power into private money, relationships, obligations, and precedents.

The two stats combine into four distinct states:

```text
high Standing + high Power = kingmaker
high Standing + low Power  = figurehead
low Standing  + high Power = feared technocrat
low Standing  + low Power  = marginal officeholder
```

Low-status money pressure uses the dedicated `money_pressure` effect and may never directly trigger rescue or bankruptcy. Only one money-pressure story should be forced or strongly weighted per act.

---

# 82. Public Trust Gameplay Layer

Public Trust represents social cooperation and political consent. Standing determines who takes the player's call; Power determines what the player can execute; Public Trust determines whether citizens help, tolerate, ignore, or resist the result.

The system retains two values:

```text
publicTrustActual     = genuine support
publicTrustPerceived  = the support shown on the HUD
trustGap              = perceived - actual
```

Normal cards may change both values differently. Conditional Trust stories consume those values during play:

- low actual Trust creates empty events, lost volunteers, public noncooperation, and nonlethal financial pressure;
- high actual Trust creates grassroots labor, legitimate fundraising, public defense, and reform opportunities;
- a large positive gap creates a lucrative but fragile popularity bubble;
- a negative gap creates a quiet reserve of support that can later become visible political capacity;
- high Trust plus high Power creates a public mandate;
- high Trust plus low Power creates a beloved figurehead;
- low Trust plus high Power creates coercive stability and the staged Collapse route;
- low Trust plus low Power creates abandonment with both a patient recovery route and an easier corrupt shortcut.

At most one dedicated Trust response story should appear in each of the Rise, Network, and Power acts. This prevents a single threshold crossing from flooding the run with similar consequences.

Accurate polling and public revelations use `stat_converge` to move perceived Trust toward actual Trust. The game must never randomly lie about public response: every misleading preview must come from an authored information bubble, propaganda choice, delayed reaction, or unreliable intermediary.

The per-turn cash-flow tooltip may reveal named categories such as institutional access and civic support, but it must not reveal the numeric actual-Trust stat.

Collapse is staged rather than triggered by a low number alone:

```text
public cooperation deteriorates
→ the player receives a warning or civic-crisis story
→ recovery requires money, transparency, and surrendered Power
→ suppression preserves short-term Power and opens the Collapse route
→ later concealment at extremely low actual Trust causes institutional abandonment
```

Low Trust alone must never immediately end the game.
