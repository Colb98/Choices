# Political Life Narrative Game — Master Narrative Table

## 1. Purpose

This document defines the canonical narrative spine for a 30–60 minute playthrough.

The game should contain approximately:

- **75–85 cards per run**
- **120–140 authored cards total**
- **7 major ending families**

Most playthroughs follow the same structural spine while individual cards, callbacks, locks, and consequences vary based on player state.

The table below defines approximately **80 narrative slots**.

Not every slot must correspond to exactly one authored card. Some may have several state-dependent variants.

---

# 2. Legend

### Visible Stats

```text
M = Money
S = Standing
P = Power
T = Public Trust
```

Magnitude:

```text
↑   small increase
↑↑  medium increase
↑↑↑ large increase

↓   small decrease
↓↓  medium decrease
↓↓↓ large decrease
```

### Hidden State

Common categories:

```text
REL = Relationship
OBL = Obligation
PRE = Precedent
FLG = Flag
EVT = Delayed Event
```

### Core Characters

```text
MENTOR
MINISTER
BUSINESSMAN
EDITOR
REFORMIST
AIDE
```

---

# 3. ACT 0 — ENTRY

## Authored Political Timeline

```text
Day 1        Entry begins
Day 181      Rise begins
Day 731      Network begins
Day 1461     Power begins
Day 2191     Final Gathering and Incident
Day 2192     Aftermath begins
```

Normal card pacing is 21 / 30 / 35 / 35 days across Entry, Rise, Network, and Power. Gathering and Incident cards consume zero days because they are one continuous night. Aftermath cards advance three days by default. A card may specify `metadata.storyTimeAdvanceDays` when its prose establishes a different interval.

Target:

**6 cards / ~3–5 minutes**

The player should feel largely free and morally uncomplicated.

---

## Card 001 — Appointment Day

**ID**

```text
act0_appointment_day
```

**Situation**

The player officially enters national politics.

The Mentor congratulates them.

> “People expect things from someone in your position now.”

### Left

**Keep the speech modest.**

Effects:

```text
S ↑
T ↑?
```

### Right

**Promise major change.**

Effects:

```text
S ↑↑
T ↑↑?
```

Hidden:

```text
FLG ambitious_public_image
```

Callback:

Future media cards may reference the promise.

---

## Card 002 — First Constituent Complaint

**ID**

```text
act0_constituent_land_case
```

A family complains that compensation documents for a public project are unclear.

### Left

**Request the complete case file.**

```text
S —
T ↑?
```

Hidden:

```text
FLG requested_transparency_early
EVT constituent_case_followup
```

### Right

**Forward it to the local office.**

```text
S —
T —
```

No immediate consequence.

Design purpose:

Teach that responsible action may simply create more work.

---

## Card 003 — First Parliamentary Speech

**ID**

```text
act0_first_parliament_speech
```

### Left

**Propose transparent complaint procedures.**

```text
S ↑
P —
T ↑?
```

Hidden:

```text
FLG early_transparency_position
REL REFORMIST +1
```

### Right

**Demand stronger punishment for officials in recent scandals.**

```text
S ↑
P ↑
T ↑↑?
```

Hidden:

```text
REL MENTOR +1
PRE political_punishment +1
```

---

## Card 004 — Media Interview

**ID**

```text
act0_first_interview
```

A reporter asks whether the player intends to challenge senior officials.

### Left

**“Rules should apply equally.”**

```text
S ↑
T ↑?
```

Hidden:

```text
REL REFORMIST +1
```

### Right

**“Reform requires cooperation.”**

```text
S ↑
P ↑
```

Hidden:

```text
REL MENTOR +1
```

---

## Card 005 — The Mentor's Advice

**ID**

```text
act0_mentor_advice
```

Mentor advises the player to build relationships before trying major reforms.

### Left

**Listen carefully.**

```text
S ↑
```

Hidden:

```text
REL MENTOR +1
```

### Right

**Say independence matters more.**

```text
T ↑?
```

Hidden:

```text
REL MENTOR -1
REL REFORMIST +1
```

---

## Card 006 — First Invitation

**ID**

```text
act0_private_dinner_invitation
```

A private dinner with several senior politicians.

### Left

**Attend.**

```text
S ↑
P ↑
```

Hidden:

```text
REL MENTOR +1
FLG entered_inner_social_circle
```

### Right

**Decline politely.**

```text
S ↓
T ?
```

No obligation.

---

# 4. ACT I — RISE

Target:

**14–16 cards / ~8–10 minutes**

Theme:

> Favors are more efficient than institutions.

---

## Card 007 — Committee Opportunity

**ID**

```text
act1_committee_opportunity
```

The Mentor can recommend the player for an important committee.

### Left

**Let the normal selection process decide.**

```text
S —
P —
```

Hidden:

```text
REL MENTOR -1
```

### Right

**Accept the recommendation.**

```text
S ↑↑
P ↑
```

Hidden:

```text
REL MENTOR +2
OBL mentor_committee_favor weight 1
```

Major future callback.

---

## Card 008 — Businessman Introduction

**ID**

```text
act1_businessman_intro
```

The Mentor introduces the player to a businessman.

No obviously corrupt request yet.

### Left

**Keep the conversation formal.**

```text
S —
```

### Right

**Exchange private contact details.**

```text
S ↑
```

Hidden:

```text
REL BUSINESSMAN +1
FLG direct_business_contact
```

---

## Card 009 — Delayed Permit

**ID**

```text
act1_business_permit
```

Businessman says one permit has been waiting for months.

### Left

**Let the process continue.**

```text
P ↓
REL BUSINESSMAN -1
```

### Right

**Make a call.**

```text
S ↑
P ↑
```

Hidden:

```text
REL BUSINESSMAN +1
PRE special_treatment +1
EVT permit_favor_callback
```

No money.

---

## Card 010 — Constituent Case Callback

Conditional:

```text
requested_transparency_early
```

Officials discover inconsistencies in the original compensation case.

### Left

**Publish findings.**

```text
S ↓
T ↑↑?
```

Hidden:

```text
FLG early_case_public
```

### Right

**Resolve quietly.**

```text
S ↑
P ↑
T ↑?
```

Hidden:

```text
PRE quiet_resolution +1
```

---

## Card 011 — Favorable Profile

**ID**

```text
act1_editor_profile_offer
```

The Editor offers a flattering profile.

### Left

**Decline special treatment.**

```text
S —
```

### Right

**Accept the feature.**

```text
S ↑↑
T ↑?
```

Hidden:

```text
REL EDITOR +1
OBL editor_profile_favor weight 1
```

---

## Card 012 — Reformist Introduction

**ID**

```text
act1_reformist_bill_intro
```

The Reformist proposes procurement disclosure reform.

### Left

**Co-sponsor publicly.**

```text
S ↓
P ↓
T ↑?
```

Hidden:

```text
REL REFORMIST +2
FLG public_reform_support
```

### Right

**Support privately.**

```text
S —
P —
```

Hidden:

```text
REL REFORMIST +1
```

---

## Card 013 — Staff Hiring

**ID**

```text
act1_staff_hiring
```

A relative of a political ally applies for an aide position.

They are reasonably qualified.

### Left

**Use open recruitment.**

```text
P —
T ↑?
```

### Right

**Hire the recommended candidate.**

```text
S ↑
P ↑
```

Hidden:

```text
PRE nepotism +1
REL MENTOR +1
```

---

## Card 014 — Local Infrastructure Request

**ID**

```text
act1_local_project
```

A district requests emergency funding.

### Left

**Require normal review.**

```text
P —
T ?
```

### Right

**Fast-track it.**

```text
P ↑
T ↑?
```

Hidden:

```text
PRE administrative_override +1
```

Important:

Shows that bypassing procedure can create genuinely good outcomes.

---

## Card 015 — Mentor Requests Vote

**ID**

```text
act1_mentor_vote_request
```

The Mentor wants support for a “reliable” committee candidate.

If player owes Mentor:

Refusal may have a cost.

### Left

**Vote independently.**

```text
S ↓
P ↓
```

Potential cost lock if `mentor_committee_favor`.

Hidden:

```text
REL MENTOR -2
```

### Right

**Support the candidate.**

```text
S ↑
P ↑
```

Hidden:

```text
REL MENTOR +1
PRE loyalty_appointments +1
```

May repay Mentor obligation.

---

## Card 016 — Good Legislative Win

**ID**

```text
act1_small_reform_success
```

A minor reform proposed by the player succeeds.

### Left

**Credit the committee.**

```text
S ↑
T ↑?
```

### Right

**Take public ownership of the victory.**

```text
S ↑↑
T ↑↑?
```

Hidden:

```text
FLG self_promotional_style
```

---

## Card 017 — Business Dinner

**ID**

```text
act1_business_dinner
```

Businessman invites player to an expensive dinner.

### Left

**Pay your own bill.**

```text
M ↓
```

### Right

**Let him host.**

```text
M —
S ↑
```

Hidden:

```text
OBL businessman_hospitality weight 1
REL BUSINESSMAN +1
```

---

## Card 018 — First Rumor

**ID**

```text
act1_minor_rumor
```

A small online rumor claims the player received special treatment.

### Left

**Ignore it.**

```text
T ↓?
```

### Right

**Ask Editor for clarification coverage.**

```text
S ↑
T ↑?
```

Hidden:

```text
REL EDITOR +1
PRE media_management +1
```

---

## Card 019 — Mentor's Candidate Wins

Callback from Card 015.

If player supported candidate:

```text
P ↑
S ↑
```

The candidate later becomes useful.

Hidden:

```text
FLG loyal_committee_member
```

If player refused:

No bonus.

---

## Card 020 — Reformist Warning

Conditional if precedents accumulating.

Reformist says:

> “Efficiency is useful. It also becomes habit very quickly.”

No moral confrontation yet.

### Left

**Acknowledge the concern.**

```text
REL REFORMIST +1
```

### Right

**Defend practical politics.**

```text
S ↑
REL REFORMIST -1
```

---

## Card 021 — First Promotion

**Major Beat**

The player is offered a higher committee role.

Outcome source varies.

Clean route:

Public work + Standing.

Network route:

Mentor intervention.

### Left

**Accept.**

```text
S ↑↑
P ↑↑
```

Possible:

```text
OBL mentor_promotion
```

depending on route.

### Right

**Decline for now.**

```text
S ↓
P —
T ↑?
```

Rare but valid.

---

# 5. ACT II — NETWORK

Target:

**16–18 cards / ~10–15 minutes**

Theme:

> Everyone you need now needs something from you.

Money becomes important.

---

## Card 022 — Investment Opportunity

**ID**

```text
act2_protected_investment
```

Businessman offers pre-market investment access.

### Left

**Decline.**

```text
M —
REL BUSINESSMAN -1
```

### Right

**Invest $50,000.**

Immediate:

```text
M ↓
S ↑
```

Hidden:

```text
FLG invested_protected_company
OBL business_investment_access weight 2
PRE conflict_of_interest +1
EVT investment_growth
```

---

## Card 023 — Coalition Journalist Problem

**ID**

```text
act2_article_delay
```

A journalist is preparing a damaging story about a coalition ally.

### Left

**Let it publish.**

```text
S ↓
P ↓
T ?
```

### Right

**Ask Editor to delay publication.**

```text
S ↑
P ↑
```

Hidden:

```text
REL EDITOR +1
REL MINISTER +1
OBL editor_delay_favor weight 1
PRE media_interference +1
EVT delayed_article_returns
```

---

## Card 024 — Minister Introduction

**ID**

```text
act2_minister_intro
```

Player enters closer political contact with the Minister.

### Left

**Keep formal distance.**

```text
S —
```

### Right

**Build the relationship.**

```text
S ↑↑
P ↑
```

Hidden:

```text
REL MINISTER +2
FLG minister_access
```

---

## Card 025 — Investment Growth

Conditional:

```text
invested_protected_company
```

Portfolio value rises sharply.

No choice initially.

```text
M +$150k–$300k
```

The player should feel rewarded.

---

## Card 026 — Public Housing Budget

**ID**

```text
act2_housing_budget
```

Money can be moved from a politically visible project into less visible housing maintenance.

### Left

**Fund maintenance.**

```text
S ↓
T ↑?
```

### Right

**Keep flagship project.**

```text
S ↑
P ↑
T ↑?
```

Neither obviously evil.

---

## Card 027 — Business Audit Begins

**ID**

```text
act2_business_audit
```

Businessman's company faces an aggressive audit.

### Left

**Allow full investigation.**

```text
M ↓↓ if invested
S ↓
P ↓
T ↑?
```

Hidden:

```text
REL BUSINESSMAN -3
FLG audit_allowed
```

### Right

**Order administrative review first.**

```text
M protected
S ↑
P ↑
```

Hidden:

```text
REL BUSINESSMAN +2
PRE investigation_interference +1
OBL businessman_protection weight 2
EVT audit_scandal_return
```

---

## Card 028 — Delayed Article Appears

Callback from Card 023.

The article publishes later with softer framing.

Advisor:

> “Handled well.”

Effect:

```text
S ↑
T ?
```

No choice.

Purpose:

Teach that media manipulation appears effective.

---

## Card 029 — Family/Personal Wealth Question

Aide asks whether growing investments should be disclosed publicly.

### Left

**Disclose everything.**

```text
S ↓
T ↑?
```

Hidden:

```text
FLG financial_disclosure
```

### Right

**Disclose only legally required assets.**

```text
S ↑
M —
```

Hidden:

```text
PRE disclosure_minimization +1
```

---

## Card 030 — Mentor Needs Protection

An old complaint involving the Mentor resurfaces.

### Left

**Recuse yourself.**

```text
S ↓
P ↓
REL MENTOR -2
```

### Right

**Call for “procedural caution.”**

```text
S ↑
P ↑
```

Hidden:

```text
PRE investigation_interference +1
REL MENTOR +2
```

Potential obligation repayment.

---

## Card 031 — Reformist Pushes Stronger Bill

Procurement transparency bill returns.

### Left

**Support full disclosure.**

```text
S ↓
P ↓
T ↑?
```

Hidden:

```text
FLG strong_procurement_reform
REL REFORMIST +2
```

### Right

**Support limited disclosure.**

```text
S ↑
P ↑
```

Hidden:

```text
FLG weak_procurement_reform
```

---

## Card 032 — A Favor for the Editor

The Editor needs help with a regulatory matter affecting the newspaper company.

### Left

**Stay out of it.**

```text
REL EDITOR -1
```

### Right

**Make the call.**

```text
S ↑
P ↑
```

Hidden:

```text
PRE media_regulatory_favor +1
```

May repay one Editor obligation.

---

## Card 033 — Election/Popularity Event

Player's public profile has grown.

### Left

**Campaign on policy achievements.**

```text
T ↑?
S ↑
```

### Right

**Campaign on strong leadership.**

```text
S ↑↑
P ↑
T ↑?
```

Hidden:

```text
FLG strongman_branding
```

---

## Card 034 — Contractor Scandal Callback

Conditional from previous fast-track or business decisions.

A project is over budget.

### Left

**Release records immediately.**

```text
S ↓↓
T ↑?
```

### Right

**Wait for internal review.**

```text
S ↑
P ↑
```

Hidden:

```text
PRE information_delay +1
```

---

## Card 035 — Emergency Hospital Funding

A hospital upgrade is blocked administratively.

If Power high enough:

### Left

**Respect normal approval.**

```text
P —
```

### Right

**Override the delay.**

```text
P ↑
T ↑↑?
```

Hidden:

```text
PRE administrative_override +1
FLG hospital_opened_early
```

Purpose:

Demonstrate that power can genuinely help people.

---

## Card 036 — Minister Offers Promotion

Major role becomes available.

### Left

**Ask for ordinary review.**

```text
P —
S —
```

### Right

**Accept Minister's backing.**

```text
S ↑↑
P ↑↑
```

Hidden:

```text
REL MINISTER +2
OBL minister_promotion weight 2
```

---

## Card 037 — Business Investment Doubles

Conditional:

```text
invested_protected_company
```

```text
M ↑↑↑
```

Potential balance:

Player may now exceed:

```text
$500,000+
```

No moral punishment.

---

## Card 038 — Reformist Asks for Investigation Independence

The Reformist argues that investigators must be insulated from political offices.

### Left

**Back the proposal.**

```text
P ↓
S ↓
T ↑?
```

Hidden:

```text
FLG supports_investigation_independence
```

### Right

**Say existing oversight is enough.**

```text
P ↑
S ↑
```

---

## Card 039 — Audit Result

If player interfered:

Audit finds only minor violations.

If player did not:

Serious violations may emerge.

Different state outcomes.

Important:

Interference should appear to “work” in the short term.

---

## Card 040 — Second Promotion

**Act Transition Beat**

Player reaches serious national political relevance.

```text
S ~45–70
P ~35–60
M potentially $200k–$1M+
```

Promotion conditions vary.

Player generally advances regardless of moral route.

---

# 6. ACT III — POWER

Target:

**16–18 cards / ~10–15 minutes**

Theme:

> People no longer offer you shortcuts. You now decide who receives them.

---

## Card 041 — Regulatory Appointment

Player nominates head of an important agency.

### Left

**Career official.**

```text
P ↓
T ↑?
```

Hidden:

```text
FLG independent_regulator
```

### Right

**Loyal ally.**

```text
S ↑
P ↑↑
```

Hidden:

```text
FLG loyal_regulator
PRE loyalist_appointments +1
```

---

## Card 042 — Protest Begins

A controversial policy leads to a demonstration.

### Left

**Meet representatives publicly.**

```text
S ↓
P ↓
T ↑?
```

### Right

**Restrict gathering temporarily.**

```text
S ↑
P ↑
T ↓?
```

Hidden:

```text
PRE public_suppression +1
```

---

## Card 043 — Editor Requests Access

Editor asks for an exclusive interview in exchange for favorable positioning.

### Left

**Give all outlets equal access.**

```text
S —
T ↑?
```

### Right

**Give Editor the exclusive.**

```text
S ↑↑
T ↑?
```

Hidden:

```text
REL EDITOR +1
PRE media_management +1
```

---

## Card 044 — Protected Company Contract

Businessman's company becomes eligible for a major government contract.

If player invested, conflict is direct.

### Left

**Recuse and require open tender.**

```text
M ↓↓
S ↓
P ↓
T ↑?
```

Hidden:

```text
FLG recused_from_contract
```

### Right

**Approve strategic exemption.**

```text
M ↑↑
S ↑
P ↑↑
```

Hidden:

```text
PRE protected_business +1
OBL business_contract_benefit weight 2
```

---

## Card 045 — Aide Raises Concern

Aide quietly points out conflicts accumulating around player.

### Left

**Ask for a full internal review.**

```text
S ↓
P ↓
```

Hidden:

```text
FLG self_review_started
```

### Right

**Tell Aide to focus on operations.**

```text
P ↑
```

Hidden:

```text
REL AIDE -1
```

---

## Card 046 — Reformist Confrontation Variant

If bad precedents high:

> “You used to argue rules mattered even when they were inconvenient.”

### Left

**Let Reformist continue criticizing publicly.**

```text
S ↓
P ↓
```

### Right

**Remove them from committee leadership.**

```text
S ↑
P ↑↑
```

Hidden:

```text
PRE retaliation +1
REL REFORMIST -5
FLG reformist_removed
```

---

## Card 047 — Reformist Cooperation Variant

If player remains relatively institutionalist:

Reformist proposes final investigation-independence bill.

### Left

**Push it now.**

```text
S ↓
P ↓↓
T ↑?
```

Hidden:

```text
FLG final_reform_in_progress
```

### Right

**Wait for a safer moment.**

```text
S ↑
P ↑
```

---

## Card 048 — Leak About Player

Journalists obtain information about player investments or favors.

Available choices depend on media precedent.

Possible choices:

### Clean state

**Release documents**

vs.

**Issue statement**

### Moderate precedent

**Ask Editor for time**

vs.

**Release documents**

### High precedent

**Remove the story**

vs.

**Coordinate coverage**

Extreme options only appear if player normalized them previously.

---

## Card 049 — Media Suppression Escalation

Conditional card if player chose suppression.

```text
PRE media_suppression +1
REL EDITOR +2
P ↑
S ↑
T perceived ↑
T actual ↓?
```

Creates major future flashback source.

---

## Card 050 — Popular Policy Opportunity

A widely beneficial policy is blocked by internal politics.

### Left

**Negotiate normally.**

```text
P —
T ↑?
```

### Right

**Use political leverage.**

```text
P ↑
S ↑
T ↑↑?
```

Hidden:

```text
PRE coercive_bargaining +1
```

Purpose:

Again show that forceful power can produce good outcomes.

---

## Card 051 — Minister's Relative

Minister wants someone close to him appointed to a state enterprise.

Candidate is competent but clearly connected.

### Left

**Require competitive process.**

```text
S ↓↓
P ↓
REL MINISTER -2
```

Potential cost lock.

### Right

**Approve appointment.**

```text
S ↑
P ↑
```

Hidden:

```text
PRE nepotism +1
OBL minister_family_appointment
```

---

## Card 052 — Investigation Authority Vote

**Critical Beat**

Final version of investigation-independence reform.

### Left

**Create independent authority.**

```text
P ↓↓↓
S ↓
T ↑?
```

Hidden:

```text
FLG investigation_independent
```

### Right

**Keep investigations under existing oversight.**

```text
P ↑↑
S ↑
```

Hidden:

```text
FLG investigation_politically_controlled
```

One of the most important choices in the game.

---

## Card 053 — Public Poll

Advisor presents favorable polling.

Actual trust may differ.

### Left

**Commission independent polling.**

```text
M ↓
```

Hidden:

```text
publicTrustPerceived moves toward actual
```

### Right

**Trust internal polling.**

```text
S ↑
```

Potentially increases information bubble.

---

## Card 054 — Business Wealth Spike

If protected investments exist:

```text
M may exceed $1M
```

Businessman offers further stake.

### Left

**Divest gradually.**

```text
M ↓
```

### Right

**Remain invested.**

```text
M potential ↑↑↑
OBL business_financial_dependency +1
```

---

## Card 055 — Old Constituent Returns

The family from the beginning may reappear.

If player helped:

> “We finally received the records.”

If ignored:

> “They told us to stop asking.”

Player sees a human-scale callback to early politics.

No huge stat shift.

---

## Card 056 — Minister Needs Media Help

A scandal involving Minister.

### Left

**Refuse involvement.**

```text
S ↓
P ↓
REL MINISTER -2
```

### Right

**Coordinate Editor response.**

```text
S ↑
P ↑
```

Hidden:

```text
PRE media_suppression +1
OBL minister_media_protection
```

Potential major flashback source.

---

## Card 057 — Reformist Fate

Depending on relationship:

- remains ally;
- becomes opposition;
- has been removed;
- resigns.

Their final line should reflect player's history, not morality scoring.

---

## Card 058 — Invitation to Final Gathering

Minister invites player to a private evening.

### Left

**Attend.**

Usually required for story progression.

```text
S ↑
```

### Right

**Say you're unavailable.**

If Power/Standing low:

possible.

If highly networked:

costly or locked due obligations.

Eventually gathering still occurs through alternate framing if necessary.

---

# 7. FINAL GATHERING

Target:

**6–8 cards**

Mechanical climax of obligations.

---

## Card 059 — Arrival

Luxury environment.

All recurring power actors appear.

No meaningful choice.

The player realizes these separate relationships form one network.

---

## Card 060 — Strategic Development Project

Businessman + Minister support a major project.

### Left

**Require open tender.**

Possible states:

```text
FREE
COSTLY
LOCKED
```

Effects if selected:

```text
P ↓
S ↓
```

### Right

**Grant strategic exemption.**

```text
M ↑?
S ↑
P ↑↑
```

Hidden:

```text
PRE protected_business +1
```

---

## Card 061 — Investment Conflict

Player's company stake may benefit from the project.

### Left

**Divest immediately.**

```text
M ↓↓↓
S ↓
```

### Right

**Keep the position.**

```text
M ↑↑↑ potential
S ↑
```

Hidden:

```text
PRE conflict_of_interest +1
```

---

## Card 062 — Minister Asks for Future Support

A future appointment vote.

### Left

**Make no promise.**

```text
S ↓
REL MINISTER -1
```

### Right

**Promise support.**

```text
S ↑
P ↑
```

Hidden:

```text
OBL future_support_commitment
```

---

## Card 063 — Editor Toast

Editor jokes about previous media favors.

Dialogue changes based on history.

This should serve as a subtle recap.

Possible callback lines referencing:

- flattering profile;
- delayed article;
- removed story;
- coordinated scandal response.

No major decision.

---

## Card 064 — The Drink

**Core Mechanical Climax**

Minister offers alcohol.

### State A — Free

```text
REFUSE
ACCEPT
```

### State B — Costly

```text
REFUSE
P ↓↓↓
S ↓

ACCEPT
S ↑
```

### State C — Locked

```text
REFUSE 🔒
ACCEPT
```

Lock sources can include:

- Mentor promotion;
- Minister promotion;
- protected investment;
- article suppression;
- protected business contract.

When player attempts locked refusal:

Flash 2–4 exact historical choices.

---

## Card 065 — Transport Home

If sober:

### Left

**Drive yourself.**

No negative consequence.

### Right

**Use official driver / taxi.**

Small Money or Standing cost.

Creates:

```text
FLG safe_transport
```

If intoxicated:

Driving options depend on previous state.

Potential:

```text
CALL DRIVER
```

may remain possible for partially captured player.

For heavily captured route, social/logistical circumstances may make driving self the available path.

Avoid arbitrary lock without traceable cause.

---

# 8. INCIDENT ROUTE SPLIT

---

## Route Resolution

```text
IF intoxicated
AND self_driving
→ PLAYER_CAUSED

ELSE
→ ALLY_CAUSED
```

No morality scalar.

---

# 9. ROUTE A — PLAYER CAUSES INCIDENT

---

## Card 066A — Night Road

Minimal text.

No stat HUD emphasis.

Possible micro-choice:

**Ignore phone**

vs.

**Look at message**

This may alter presentation but should not turn accident into reflex gameplay.

---

## Card 067A — Collision

Sound.

Brief visual interruption.

Black screen.

No graphic depiction.

---

## Card 068A — Immediate Choice

Stat HUD disappears.

```text
STAY
```

vs.

```text
LEAVE
```

Never locked.

This decision remains player agency regardless of past corruption.

---

## Card 069A — If Stay

Choices:

### Left

**Call emergency services immediately.**

Hidden:

```text
FLG called_emergency
FLG victim_received_early_help
```

### Right

**Call Aide first.**

Hidden:

```text
FLG delayed_emergency
```

Important humanitarian consequence.

---

## Card 070A — If Leave

Aide calls.

### Left

**Tell Aide the truth.**

```text
FLG aide_knows_truth
```

### Right

**Say nothing yet.**

```text
FLG concealment_started
PRE concealment +1
```

---

# 10. ROUTE B — ALLY CAUSES INCIDENT

---

## Card 066B — Late-Night Call

Player is safely elsewhere.

Aide:

> “There's been an accident.”

---

## Card 067B — Identity Revealed

A senior ally caused the collision.

The ally may have left the scene.

No real-world identifying details.

---

## Card 068B — First Request

Minister:

> “We need time before this becomes public.”

### Left

**Release basic facts tonight.**

```text
S ↓
P ↓
```

Hidden:

```text
FLG immediate_disclosure
```

### Right

**Delay statement until morning.**

```text
S ↑
P ↑
```

Hidden:

```text
PRE information_delay +1
```

---

## Card 069B — Emergency Assistance

### Left

**Make sure emergency services receive everything they need.**

```text
T ↑?
```

Hidden:

```text
FLG victim_received_early_help
```

### Right

**Leave operational details to local officials.**

Potential delayed response depending on other state.

---

## Card 070B — The Request Becomes Explicit

Minister:

> “He has served this country for thirty years.”

### Left

**There will be no interference.**

```text
S ↓↓
P ↓
```

### Right

**Ask what can be done.**

```text
S ↑
P ↑
```

Hidden:

```text
PRE coverup_started +1
```

---

# 11. SHARED AFTERMATH

Target:

**8–12 cards**

Both routes converge here through variants.

---

## Card 071 — First Article

A fictional newspaper publishes the initial report.

Player must choose response.

### Open Route

**Release facts.**

```text
S ↓
T ?
```

### Manipulation Route

**Coordinate wording.**

```text
S ↑
P ↑
```

Hidden:

```text
PRE media_manipulation +1
```

### High Suppression Route

**Remove the article.**

Only available if prior precedent/network supports it.

```text
P ↑
T actual ↓?
```

Hidden:

```text
FLG article_suppressed
PRE media_suppression +1
```

---

## Card 072 — Investigator Contact

If:

```text
investigation_independent
```

Investigator says:

> “Your office does not have authority over this inquiry.”

This is a positive systemic payoff.

Choices may become limited precisely because the institution is independent.

If politically controlled:

Player has far more influence.

---

## Card 073 — Investigation Response

### Left

**Provide all records.**

```text
S ↓
P ↓
```

Hidden:

```text
FLG records_preserved
FLG cooperated_with_investigation
```

### Right

**Provide only requested material.**

```text
S ↑
P ↑
```

Neutral/mixed.

High corruption variant:

**Coordinate what is released.**

```text
PRE investigation_interference +1
```

---

## Card 074 — Victim Compensation

Representative discusses compensation.

### Left

**Provide assistance without conditions.**

```text
M ↓↓
T ↑?
```

Hidden:

```text
FLG unconditional_compensation
```

### Right

**Offer settlement with confidentiality.**

```text
M ↓
S ↑
```

Hidden:

```text
PRE victim_silencing +1
```

Important:

Compensation must not erase responsibility.

---

## Card 075 — Responsibility Decision

### Route A

Options may include:

```text
CONFESS
REMAIN SILENT
PARTIAL ADMISSION
```

### Route B

Options:

```text
ALLOW CHARGES
ASK ALLY TO RESIGN
PROTECT ALLY
```

Creates major ending flags.

---

## Card 076 — Network Response

NPCs react according to player decision.

If player exposes truth:

- Minister anger;
- Businessman withdraws support;
- Editor becomes distant;
- Mentor may call it betrayal.

If player covers:

- network becomes more supportive;
- obligations deepen.

This card should visually show that political survival is being exchanged for accountability.

---

## Card 077 — Reformist/Aide Final Intervention

Depending on route:

Reformist may say:

> “Then let the process continue.”

or:

> “You still have time to stop this.”

If removed earlier, Reformist may not be available at all.

Aide fills equivalent narrative role.

No moral lecture.

---

## Card 078 — Final Media Decision

This is the largest media choice.

Possible options depend on precedents.

### Clean

**Publish the full timeline.**

### Moderate

**Issue controlled statement.**

### Corrupt

**Pressure editors.**

### Captured/Authoritarian

**Remove reports and restrict discussion.**

The option vocabulary itself shows escalation.

---

## Card 079 — Final Institutional Decision

Possible:

### Route A

**Accept suspension/resignation**

vs.

**Remain in office**

### Route B

**Allow investigation to continue**

vs.

**Order intervention**

If independent institutions exist, intervention may simply fail.

This should feel like a payoff to Card 052.

---

## Card 080 — Ending Resolution

No player-facing choice.

Engine evaluates:

```text
route
immediate humanitarian conduct
responsibility
media actions
investigation actions
institutional state
Power
Public Trust
```

Then selects ending.

---

# 12. ENDING MATRIX

## Ending 0 — BANKRUPTCY

This ending can occur before the incident and therefore has the highest evaluation priority.

```text
Money reaches 0
↓
One-time lifeline is offered
↓
Refuse it, or reach 0 again after accepting it
↓
BANKRUPTCY
```

Accepting the lifeline restores `$60,000`, creates a weight-3 obligation to the Mentor, and resumes the card that the crisis interrupted. The crisis card itself has no operating cost.

The ending should read as the political machine losing interest when the player can no longer finance participation—not as an arcade-style failure screen.

## Ending 1 — BREAK THE CHAIN

Primary route:

```text
ALLY_CAUSED
```

Required core behavior:

```text
protectedAlly = false
investigationInterference = false
recordsPreserved = true
```

Strongest version if:

```text
investigation_independent = true
```

Outcome:

- ally investigated;
- player loses coalition support;
- Power collapses;
- Standing drops;
- investigation remains public;
- player may resign.

Final sequence:

```text
ARTICLE
↓
INVESTIGATION UPDATE
↓
CHARGES / COURT UPDATE
↓
PLAYER RESIGNATION
↓
MEMORIAL
↓
CREDITS
```

---

# 13. Ending 2 — ACCOUNTABILITY

Primary route:

```text
PLAYER_CAUSED
```

Core conditions:

```text
stayedAtScene
calledEmergency
acceptedResponsibility
cooperatedWithInvestigation
!majorMediaSuppression
```

Outcome:

- office lost;
- investigation continues;
- victim receives timely assistance;
- no heroic framing.

The player does not “win.”

They stop making the harm worse.

---

# 14. Ending 3 — TOO LATE

Primary route:

```text
PLAYER_CAUSED
```

Possible state:

```text
leftScene
OR delayedEmergency

THEN

laterConfessed
cooperatedEventually
```

Outcome:

Player ultimately accepts responsibility, but some consequences are irreversible.

Ending should emphasize chronology rather than judgement.

Example:

> You resigned three days later.

> The investigation continued.

> Emergency response could not recover the time already lost.

---

# 15. Ending 4 — SCAPEGOAT

Conditions:

```text
participatedInCoverup
Power < protectionThreshold
strongerNetworkActorsRemain
```

Outcome:

- Minister publicly distances himself;
- Editor releases selective information;
- Businessman claims player acted independently;
- player becomes the official explanation for a larger network.

Theme:

> Being inside the network does not mean being equal within it.

---

# 16. Ending 5 — PROTECTED

Conditions approximately:

```text
PLAYER_CAUSED
coverupSuccessful
Power >= 50
Power < 80
```

Outcome:

- investigation weakens;
- player avoids major consequences;
- some reporting remains;
- Public Trust may be extremely low;
- political career survives.

Possible final line:

> Eighteen months later, you were reappointed.

No dramatic punishment.

---

# 17. Ending 6 — UNTOUCHABLE

Conditions:

```text
Power >= 80
highMediaSuppression
highInvestigationInterference
institutionalCapture
```

Either incident route can reach this.

Presentation:

```text
ARTICLE APPEARS
↓
REFRESH
↓
ARTICLE UNAVAILABLE
↓
SECOND SOURCE DISAPPEARS
↓
SEARCH RETURNS NOTHING
↓
OFFICIAL STATEMENT
```

Possible official line:

> “The matter has been reviewed according to procedure.”

Then:

```text
WHITE
↓
MEMORIAL
↓
CREDITS
```

One of the shortest endings.

---

# 18. Ending 7 — COLLAPSE

Conditions approximately:

```text
Power >= 70
PublicTrustActual <= 5
multipleSuppressionPrecedents
majorIncidentScandal
```

Outcome:

- leaks spread;
- old scandals return;
- allies defect;
- administration stops obeying;
- media control fails;
- player discovers Power existed only while others participated.

Possible final UI:

```text
POWER
████████████████ 92
```

Glitch.

```text
POWER
0
```

Credits.

Avoid revenge-fantasy spectacle.

---

# 19. Ending Priority

Recommended initial priority:

```text
1. Bankruptcy
2. Break the Chain
3. Accountability
4. Collapse
5. Untouchable
6. Protected
7. Too Late
8. Scapegoat
9. Fallback
```

This should be adjusted during simulation testing.

---

# 20. Major Causal Chains

The most important cards should create multi-step causal chains.

---

## Chain A — Mentor Capture

```text
Card 007
Accept committee help
↓
OBL Mentor
↓
Card 015
Vote request
↓
Support candidate
↓
PRE loyal appointment
↓
Card 021 / 036
Promotion support
↓
More OBL
↓
Card 064
Refusal at gathering becomes costly/locked
```

---

# 21. Chain B — Media Capture

```text
Card 011
Accept favorable profile
↓
Relationship Editor
↓
Card 023
Delay article
↓
OBL Editor
↓
Card 032
Regulatory favor
↓
PRE media management
↓
Card 048
Coordinate own scandal
↓
Card 049
Suppress story
↓
Card 071 / 078
Article removal becomes available
```

---

# 22. Chain C — Business Capture

```text
Card 009
Speed up permit
↓
Relationship Businessman
↓
Card 022
Protected investment
↓
Money ↑
↓
Card 027
Business audit
↓
Protect company
↓
Investment preserved
↓
Card 044
Government contract
↓
Conflict of interest
↓
Card 061
Divest now costs millions
```

This chain should make Money psychologically meaningful.

---

# 23. Chain D — Institutional Independence

```text
Card 012
Support procurement reform
↓
Card 031
Strong disclosure
↓
Card 038
Support investigation independence
↓
Card 052
Create independent authority
↓
Power ↓
↓
Incident
↓
Card 072
Investigator says:
"Your office has no authority over this inquiry."
```

This is one of the strongest positive systemic payoffs.

---

# 24. Chain E — Political Suppression

```text
Card 042
Restrict protest
↓
PRE public suppression
↓
Card 046
Remove Reformist
↓
PRE retaliation
↓
Card 048/049
Suppress reporting
↓
Power becomes easier to maintain
↓
PublicTrustActual collapses
↓
Incident coverup
↓
Potential Collapse ending
```

---

# 25. Route Profiles for Debugging Only

Do not expose these to the player.

---

## Institutional

Typical state:

```text
few obligations
low interference precedent
independent investigation
moderate Power
```

---

## Pragmatic

```text
some favors
some obligations
limited media manipulation
institutional safeguards remain
```

Often produces the most interesting good ending.

---

## Networked

```text
multiple obligations
business relationships
media favors
high Standing
high Power
```

---

## Captured

```text
heavy obligations
multiple costly choices
some hard locks
```

---

## Authoritarian

```text
high Power
retaliation
media suppression
investigation interference
very low actual Trust
```

These profiles should be derived, never stored as morality classes.

---

# 26. Ideal Good Run

A good run should **not require perfect behavior**.

Example:

```text
Accept one early Mentor favor
↓
Use influence for hospital funding
↓
Accept positive media coverage
↓
Refuse protected investment
↓
Allow business investigation
↓
Support investigation independence
↓
Use some political leverage elsewhere
↓
Reach final gathering
↓
Refusing alcohol costs Power
↓
Player chooses to pay that cost
↓
ALLY_CAUSED incident
↓
Player refuses cover-up
↓
Independent investigator proceeds anyway
↓
Player loses office
↓
Break the Chain
```

Target:

A good ending should remain possible after approximately:

```text
20–30% pragmatic compromises
```

provided critical institutions have not been destroyed.

---

# 27. Ideal Corrupted Run

Target final wealth for an optimized version of this route:

```text
Money $1B+
```

The number should become part of the moral pressure: the machine does not only protect the player; it makes leaving feel financially irrational.

A rational optimizer may naturally create:

```text
Mentor favor
↓
Business permit
↓
Editor profile
↓
Protected investment
↓
Article delay
↓
Audit interference
↓
Minister promotion
↓
Loyal regulator
↓
Media suppression
↓
Protected contract
↓
Final gathering
↓
Refuse drink locked
↓
PLAYER_CAUSED incident
↓
Leave
↓
Network helps
↓
Suppress article
↓
Interfere investigation
↓
Protected / Untouchable
```

No individual early decision should read:

> Become corrupt.

---

# 28. Ideal Middle Run

Possibly the most emotionally effective route:

Player has:

```text
Power 72
Standing 65
Money $1.4M
moderate obligations
```

At the gathering:

```text
REFUSE DRINK
Power ↓↓↓
```

Player voluntarily sacrifices:

```text
Power 72 → 39
```

Later:

Ally causes incident.

Player is asked to protect them.

Expose route costs:

```text
Power 39 → 12
```

Player chooses it anyway.

This route communicates:

> Redemption does not require having always been pure.

The important question is whether the player can still choose to stop.

---

# 29. Narrative Writing Rule

Every card should primarily fulfill at least one of these functions:

```text
1. Establish relationship
2. Create temptation
3. Create obligation
4. Repay obligation
5. Establish precedent
6. Callback previous choice
7. Demonstrate usefulness of Power
8. Demonstrate cost of integrity
9. Change institution
10. Advance final incident
```

Avoid filler cards that exist only to increase runtime.

---

# 30. Core Principle

The complete game should structurally produce:

```text
Small favor
↓
Useful result
↓
Relationship
↓
Obligation
↓
Another useful result
↓
Precedent
↓
More Power
↓
Greater personal benefit
↓
Refusal becomes expensive
↓
Refusal becomes impossible
↓
Flashback
↓
Recognition
```

Then, after the incident:

```text
HARM
↓
Power becomes available as protection
↓
Player chooses whether to use it
```

The final question is therefore not:

> Were you a good person?

It is:

> **Now that power can protect you or someone close to you from accountability, what will you do with it?**

The game should allow the player's answer to emerge entirely from their actions.
