// Node-side content loader for validation/simulation scripts.
// Mirrors src/engine/content.ts (which uses Vite's import.meta.glob).
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type {
  ActDefinition,
  ArticleDefinition,
  BalanceConfig,
  CardDefinition,
  CharacterDefinition,
  ContentBundle,
  EndingDefinition,
  EventDefinition,
  FlagDefinition,
  PrecedentDefinition,
  PromiseDefinition,
  RegistryFragment,
  StoryBeatDefinition,
} from '../src/engine/types';
import { normalizeCard } from '../src/engine/cards';

const DATA = join(import.meta.dirname, '../src/data');

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

function readDir<T>(dir: string): { file: string; data: T }[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({ file: f, data: readJson<T>(join(dir, f)) }));
}

export function loadContentNode(): ContentBundle {
  const cards: Record<string, CardDefinition> = {};
  for (const { file, data } of readDir<CardDefinition[]>(join(DATA, 'cards'))) {
    for (const card of data) {
      if (cards[card.id]) throw new Error(`Duplicate card id ${card.id} (in ${file})`);
      cards[card.id] = normalizeCard(card);
    }
  }

  const events: Record<string, EventDefinition> = {};
  const beats: StoryBeatDefinition[] = [];
  const characters: Record<string, CharacterDefinition> = {};
  const flags: Record<string, FlagDefinition> = {};
  const precedents: Record<string, PrecedentDefinition> = {};
  const articles: Record<string, ArticleDefinition> = {};
  const promises: Record<string, PromiseDefinition> = {};

  for (const { file, data } of readDir<RegistryFragment>(join(DATA, 'registry'))) {
    for (const p of data.promises ?? []) {
      if (promises[p.id]) throw new Error(`Duplicate promise id ${p.id} (in ${file})`);
      promises[p.id] = p;
    }
    for (const e of data.events ?? []) {
      if (events[e.id]) throw new Error(`Duplicate event id ${e.id} (in ${file})`);
      events[e.id] = e;
    }
    for (const b of data.beats ?? []) beats.push(b);
    for (const c of data.characters ?? []) characters[c.id] = characters[c.id] ?? c;
    for (const f of data.flags ?? []) flags[f.id] = flags[f.id] ?? f;
    for (const p of data.precedents ?? []) precedents[p.id] = precedents[p.id] ?? p;
    for (const a of data.articles ?? []) {
      if (articles[a.id]) throw new Error(`Duplicate article id ${a.id} (in ${file})`);
      articles[a.id] = a;
    }
  }

  return {
    cards,
    events,
    beats,
    endings: readJson<EndingDefinition[]>(join(DATA, 'endings.json')),
    articles,
    characters,
    flags,
    precedents,
    promises,
    acts: readJson<ActDefinition[]>(join(DATA, 'acts.json')),
    balance: readJson<BalanceConfig>(join(DATA, 'config', 'balance.json')),
  };
}

export function loadI18nNode(): Record<string, Record<string, string>> {
  const root = join(DATA, 'i18n');
  const tables: Record<string, Record<string, string>> = {};
  for (const lang of readdirSync(root)) {
    const dir = join(root, lang);
    try {
      for (const { data } of readDir<Record<string, string>>(dir)) {
        tables[lang] = { ...(tables[lang] ?? {}), ...data };
      }
    } catch {
      /* not a directory */
    }
  }
  return tables;
}
