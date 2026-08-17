// Narrative content validator. Fails the build loudly on broken data.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadContentNode, loadI18nNode } from './load';
import { collectConditions } from '../src/engine/conditions';
import type {
  CardDefinition,
  ChoiceDefinition,
  ChoiceVariant,
  ConditionExpression,
  ContentBundle,
  DelayedEffect,
  Effect,
} from '../src/engine/types';

const errors: string[] = [];
const warnings: string[] = [];

function err(msg: string) {
  errors.push(msg);
}
function warn(msg: string) {
  warnings.push(msg);
}

let loaded: ContentBundle;
try {
  loaded = loadContentNode();
} catch (e) {
  console.error(`FATAL: ${(e as Error).message}`);
  process.exit(1);
}
const content: ContentBundle = loaded;
const i18n = loadI18nNode();
const en = i18n['en'] ?? {};

const actIds = new Set(content.acts.map((a) => a.id));
const cardIds = new Set(Object.keys(content.cards));
const portraitDir = join(import.meta.dirname, '../public/art/portraits');

// ---------------------------------------------------------------- helpers

function checkKey(key: string | undefined, where: string) {
  if (!key) return;
  if (!en[key]) err(`${where}: i18n key missing from en: ${key}`);
  for (const lang of Object.keys(i18n)) {
    if (lang === 'en') continue;
    if (!i18n[lang][key]) warn(`${where}: i18n key missing from ${lang}: ${key}`);
  }
}

function checkCondition(expr: ConditionExpression | undefined, where: string) {
  if (!expr) return;
  for (const c of collectConditions(expr, 'flag')) {
    if (!content.flags[c.flag]) err(`${where}: unknown flag in condition: ${c.flag}`);
  }
  for (const c of collectConditions(expr, 'precedent')) {
    if (!content.precedents[c.precedent]) err(`${where}: unknown precedent in condition: ${c.precedent}`);
  }
  for (const c of collectConditions(expr, 'relationship')) {
    if (!content.characters[c.character]) err(`${where}: unknown character in condition: ${c.character}`);
  }
  for (const c of collectConditions(expr, 'obligation')) {
    if (c.creditor && !content.characters[c.creditor]) err(`${where}: unknown obligation creditor: ${c.creditor}`);
  }
  for (const c of collectConditions(expr, 'history')) {
    if (!cardIds.has(c.cardId)) err(`${where}: history condition references unknown card: ${c.cardId}`);
  }
  for (const c of collectConditions(expr, 'seen_card')) {
    if (!cardIds.has(c.cardId)) err(`${where}: seen_card condition references unknown card: ${c.cardId}`);
  }
  for (const c of collectConditions(expr, 'act')) {
    if (!actIds.has(c.act)) err(`${where}: unknown act in condition: ${c.act}`);
  }
}

function checkEffects(effects: Effect[] | undefined, where: string) {
  for (const e of effects ?? []) {
    switch (e.type) {
      case 'stat':
        if ((e.add === undefined) === (e.set === undefined)) {
          err(`${where}: stat effect must have exactly one of add/set`);
        }
        break;
      case 'stat_converge':
        if (!Number.isFinite(e.fraction) || e.fraction <= 0 || e.fraction > 1) {
          err(`${where}: stat_converge fraction must satisfy 0 < fraction <= 1`);
        }
        if (e.from === e.to) {
          err(`${where}: stat_converge must use different from/to stats`);
        }
        break;
      case 'money_pressure':
        if (!Number.isFinite(e.percent) || e.percent <= 0 || e.percent > 1) {
          err(`${where}: money_pressure percent must satisfy 0 < percent <= 1`);
        }
        if (!Number.isFinite(e.minLoss) || e.minLoss < 0) {
          err(`${where}: money_pressure minLoss must be non-negative`);
        }
        if (!Number.isFinite(e.maxLoss) || e.maxLoss < e.minLoss) {
          err(`${where}: money_pressure maxLoss must be at least minLoss`);
        }
        break;
      case 'flag':
        if (!content.flags[e.flag]) err(`${where}: unknown flag in effect: ${e.flag}`);
        break;
      case 'relationship':
        if (!content.characters[e.character]) err(`${where}: unknown character in effect: ${e.character}`);
        break;
      case 'precedent':
        if (!content.precedents[e.precedent]) err(`${where}: unknown precedent in effect: ${e.precedent}`);
        break;
      case 'obligation_add':
        if (!content.characters[e.creditor]) err(`${where}: unknown creditor: ${e.creditor}`);
        break;
      case 'obligation_resolve':
        if (e.creditor && !content.characters[e.creditor]) err(`${where}: unknown creditor: ${e.creditor}`);
        break;
    }
  }
}

function checkDelayed(delayed: DelayedEffect[] | undefined, where: string) {
  for (const d of delayed ?? []) {
    if (!content.events[d.eventId]) err(`${where}: delayed effect references unknown event: ${d.eventId}`);
    if (d.delay.type === 'turn_range' && d.delay.min > d.delay.max) err(`${where}: turn_range min > max`);
    if (d.delay.type === 'turns' && d.delay.turns < 1) err(`${where}: delay turns < 1`);
    if (d.delay.type === 'act' && !actIds.has(d.delay.act)) err(`${where}: delay references unknown act: ${d.delay.act}`);
    checkCondition(d.conditionsAtTrigger, `${where} (conditionsAtTrigger)`);
    if (d.onConditionFail === 'replace' && !d.replacementEventId) {
      err(`${where}: replace policy without replacementEventId`);
    }
  }
}

function checkChoicePart(c: ChoiceDefinition | ChoiceVariant, where: string, isVariant: boolean) {
  if (c.text) checkKey(c.text, where);
  else if (!isVariant) err(`${where}: missing text key`);
  checkEffects(c.effects, where);
  checkDelayed(c.delayedEffects, where);
  if (c.lock) {
    checkCondition(c.lock.condition, `${where} (lock)`);
    checkEffects(c.lock.unlockEffects, `${where} (unlockEffects)`);
    if (c.lock.mode === 'hard') {
      const reason = c.lock.reason;
      if (!reason) {
        err(`${where}: hard lock without reason (flashbacks cannot be constructed)`);
      } else if (reason.source === 'explicit') {
        for (const src of reason.explicitSources ?? []) {
          if (!cardIds.has(src.cardId)) err(`${where}: lock explicitSource references unknown card: ${src.cardId}`);
        }
        if ((reason.explicitSources ?? []).length === 0) err(`${where}: explicit lock reason with no sources`);
      } else if (reason.source === 'obligations') {
        if (collectConditions(c.lock.condition, 'obligation').length === 0) {
          warn(`${where}: obligation-sourced lock has no obligation conditions`);
        }
      } else if (reason.source === 'history') {
        if (collectConditions(c.lock.condition, 'history').length === 0) {
          warn(`${where}: history-sourced lock has no history conditions`);
        }
      }
    }
    if (c.lock.mode === 'cost' && (!c.lock.unlockEffects || c.lock.unlockEffects.length === 0)) {
      warn(`${where}: cost lock with no unlockEffects`);
    }
  }
  if (c.next) {
    if (c.next.type === 'card' && !cardIds.has(c.next.cardId)) err(`${where}: next references unknown card: ${c.next.cardId}`);
    if (c.next.type === 'event' && !content.events[c.next.eventId]) err(`${where}: next references unknown event: ${c.next.eventId}`);
    if (c.next.type === 'act' && !actIds.has(c.next.act)) err(`${where}: next references unknown act: ${c.next.act}`);
  }
}

function checkChoice(c: ChoiceDefinition, where: string) {
  checkChoicePart(c, where, false);
  for (const [i, v] of (c.variants ?? []).entries()) {
    checkCondition(v.conditions, `${where} variant[${i}]`);
    checkChoicePart(v, `${where} variant[${i}]`, true);
  }
}

// ---------------------------------------------------------------- cards

for (const character of Object.values(content.characters)) {
  checkKey(character.nameKey, `character ${character.id}`);
  const portrait = join(portraitDir, `${character.id}.webp`);
  if (!existsSync(portrait)) err(`character ${character.id}: missing portrait ${portrait}`);
}

for (const card of Object.values(content.cards)) {
  const where = `card ${card.id}`;
  if (!/^[a-z0-9_]+$/.test(card.id)) err(`${where}: id must be lowercase snake_case`);
  if (!actIds.has(card.act)) err(`${where}: unknown act ${card.act}`);
  if (card.speaker && !content.characters[card.speaker]) err(`${where}: unknown speaker ${card.speaker}`);
  checkKey(card.text, where);
  if (card.title) checkKey(card.title, where);
  checkCondition(card.conditions, where);
  checkChoice(card.left, `${where} left`);
  checkChoice(card.right, `${where} right`);
  if (
    card.metadata?.storyTimeAdvanceDays !== undefined &&
    (!Number.isFinite(card.metadata.storyTimeAdvanceDays) || card.metadata.storyTimeAdvanceDays < 0)
  ) {
    err(`${where}: metadata.storyTimeAdvanceDays must be a non-negative number`);
  }
}

// ---------------------------------------------------------------- events/beats

for (const ev of Object.values(content.events)) {
  if (!cardIds.has(ev.cardId)) err(`event ${ev.id}: unknown card ${ev.cardId}`);
  checkCondition(ev.conditions, `event ${ev.id}`);
}
const beatIds = new Set<string>();
for (const beat of content.beats) {
  if (beatIds.has(beat.id)) err(`duplicate beat id: ${beat.id}`);
  beatIds.add(beat.id);
  if (!cardIds.has(beat.cardId)) err(`beat ${beat.id}: unknown card ${beat.cardId}`);
  if (!actIds.has(beat.act)) err(`beat ${beat.id}: unknown act ${beat.act}`);
  checkCondition(beat.conditions, `beat ${beat.id}`);
  if (
    beat.earliestActTurn !== undefined &&
    beat.latestActTurn !== undefined &&
    beat.earliestActTurn > beat.latestActTurn
  ) {
    err(`beat ${beat.id}: earliestActTurn > latestActTurn`);
  }
}

// ---------------------------------------------------------------- endings

if (content.endings.length === 0) err('no endings defined');
const fallback = content.endings.filter(
  (e) => !e.conditions || (('all' in e.conditions) && (e.conditions as { all: unknown[] }).all.length === 0),
);
if (fallback.length === 0) warn('no unconditional fallback ending found (engine falls back to lowest priority)');
const endingIds = new Set<string>();
for (const ending of content.endings) {
  if (endingIds.has(ending.id)) err(`duplicate ending id: ${ending.id}`);
  endingIds.add(ending.id);
  checkCondition(ending.conditions, `ending ${ending.id}`);
  checkKey(ending.titleKey, `ending ${ending.id}`);
  for (const [i, step] of ending.presentation.sequence.entries()) {
    const where = `ending ${ending.id} step[${i}]`;
    if (step.type === 'article' && !content.articles[step.articleId]) err(`${where}: unknown article ${step.articleId}`);
    if (step.type === 'article_updates') {
      if (!content.articles[step.articleId]) err(`${where}: unknown article ${step.articleId}`);
      step.updateKeys.forEach((k) => checkKey(k, where));
    }
    if (step.type === 'text') checkKey(step.textKey, where);
  }
}

// ---------------------------------------------------------------- articles

for (const a of Object.values(content.articles)) {
  checkKey(a.headlineKey, `article ${a.id}`);
  a.bodyKeys.forEach((k) => checkKey(k, `article ${a.id}`));
}

// ---------------------------------------------------------------- reachability

const referenced = new Set<string>([
  content.balance.start.firstCardId,
  content.balance.economy.rescue.cardId,
]);
for (const card of Object.values(content.cards)) {
  for (const side of [card.left, card.right]) {
    const nexts = [side.next, ...(side.variants ?? []).map((v) => v.next)];
    for (const n of nexts) if (n?.type === 'card') referenced.add(n.cardId);
  }
}
for (const ev of Object.values(content.events)) referenced.add(ev.cardId);
for (const b of content.beats) referenced.add(b.cardId);
for (const card of Object.values(content.cards)) {
  const type = card.type ?? 'contextual';
  if (type !== 'contextual' && !referenced.has(card.id)) {
    warn(`card ${card.id} (${type}) may be unreachable: not referenced by any next/event/beat/start`);
  }
}

// ---------------------------------------------------------------- start card

if (!cardIds.has(content.balance.start.firstCardId)) {
  err(`start.firstCardId unknown: ${content.balance.start.firstCardId}`);
}
if (!actIds.has(content.balance.start.act)) err(`start.act unknown: ${content.balance.start.act}`);

// ---------------------------------------------------------------- timeline

const timeline = content.balance.timeline;
if (!Number.isFinite(timeline.initialDay) || timeline.initialDay < 1) {
  err('timeline.initialDay must be a positive number');
}
let previousActStart = -Infinity;
for (const act of [...content.acts].sort((a, b) => a.order - b.order)) {
  const start = timeline.actStartDays[act.id];
  const advance = timeline.defaultCardAdvanceDays[act.id];
  if (start === undefined) err(`timeline.actStartDays missing act: ${act.id}`);
  else {
    if (!Number.isFinite(start) || start < timeline.initialDay) {
      err(`timeline.actStartDays.${act.id} must be at least initialDay`);
    }
    if (start < previousActStart) err(`timeline act starts are not chronological at: ${act.id}`);
    previousActStart = start;
  }
  if (advance === undefined) err(`timeline.defaultCardAdvanceDays missing act: ${act.id}`);
  else if (!Number.isFinite(advance) || advance < 0) {
    err(`timeline.defaultCardAdvanceDays.${act.id} must be a non-negative number`);
  }
}

// ---------------------------------------------------------------- economy

const economy = content.balance.economy;
if (!(economy.safeReserve > 0)) err('economy.safeReserve must be greater than zero');
if (!(economy.statusPressureFloor > content.balance.money.min)) {
  err('economy.statusPressureFloor must be greater than money.min');
}
if (economy.statusPressureFloor >= economy.safeReserve) {
  err('economy.statusPressureFloor must be less than safeReserve');
}
if (!(economy.criticalThreshold > 0 && economy.criticalThreshold < economy.lowThreshold)) {
  err('economy thresholds must satisfy 0 < criticalThreshold < lowThreshold');
}
if (!(economy.lowThreshold < 1)) err('economy.lowThreshold must be less than 1');
for (const stat of ['standing', 'power', 'publicTrustPerceived'] as const) {
  const value = economy.incomePerPoint[stat];
  if (value === undefined) err(`economy.incomePerPoint missing stat: ${stat}`);
  else if (!Number.isFinite(value) || value < 0) {
    err(`economy.incomePerPoint.${stat} must be a non-negative number`);
  }
}
if (!Number.isFinite(economy.civicIncomePerActualTrust) || economy.civicIncomePerActualTrust < 0) {
  err('economy.civicIncomePerActualTrust must be a non-negative number');
}
if (!Number.isFinite(economy.leverageCompoundingThreshold) || economy.leverageCompoundingThreshold < 0) {
  err('economy.leverageCompoundingThreshold must be a non-negative number');
}
for (const character of economy.leverageCapitalCharacters) {
  if (!content.characters[character]) {
    err(`economy.leverageCapitalCharacters contains unknown character: ${character}`);
  }
}
if (new Set(economy.leverageCapitalCharacters).size !== economy.leverageCapitalCharacters.length) {
  err('economy.leverageCapitalCharacters must not contain duplicates');
}
for (const [name, value] of Object.entries(economy.leverageWeights)) {
  if (!Number.isFinite(value) || value < 0) {
    err(`economy.leverageWeights.${name} must be a non-negative number`);
  }
}
for (const act of actIds) {
  for (const [name, table] of [
    ['baseTurnCosts', economy.baseTurnCosts],
    ['activeObligationCostPerWeight', economy.activeObligationCostPerWeight],
    ['betrayedObligationCostPerWeight', economy.betrayedObligationCostPerWeight],
    ['leverageIncomePerScore', economy.leverageIncomePerScore],
    ['leverageIncomePerScoreCubed', economy.leverageIncomePerScoreCubed],
    ['precedentExposureCostPerPoint', economy.precedentExposureCostPerPoint],
  ] as const) {
    const value = table[act];
    if (value === undefined) err(`economy.${name} missing act: ${act}`);
    else if (value < 0) err(`economy.${name}.${act} must not be negative`);
  }
}
for (const act of economy.pressureActs) {
  if (!actIds.has(act)) err(`economy.pressureActs contains unknown act: ${act}`);
}
if (!cardIds.has(economy.rescue.cardId)) {
  err(`economy.rescue.cardId unknown: ${economy.rescue.cardId}`);
}
if (!content.flags[economy.rescue.rescueFlag]) {
  err(`economy.rescue.rescueFlag unknown: ${economy.rescue.rescueFlag}`);
}
if (!content.flags[economy.rescue.bankruptcyFlag]) {
  err(`economy.rescue.bankruptcyFlag unknown: ${economy.rescue.bankruptcyFlag}`);
}

// ---------------------------------------------------------------- report

console.log(`Validated: ${cardIds.size} cards, ${Object.keys(content.events).length} events, ${content.beats.length} beats, ${content.endings.length} endings, ${Object.keys(content.articles).length} articles, ${Object.keys(content.characters).length} characters, ${Object.keys(content.flags).length} flags, ${Object.keys(content.precedents).length} precedents, languages: ${Object.keys(i18n).join(', ')}`);

if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  for (const w of warnings) console.log(`  WARN ${w}`);
}
if (errors.length) {
  console.error(`\n${errors.length} error(s):`);
  for (const e of errors) console.error(`  ERROR ${e}`);
  process.exit(1);
}
console.log('\nOK');
