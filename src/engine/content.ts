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
} from './types';

import actsJson from '../data/acts.json';
import balanceJson from '../data/config/balance.json';
import { normalizeCard } from './cards';
import endingsJson from '../data/endings.json';

// Vite eagerly bundles every pack fragment; packs are merged here so the rest
// of the engine sees one flat ContentBundle.
const cardModules = import.meta.glob<{ default: CardDefinition[] }>('../data/cards/*.json', { eager: true });
const registryModules = import.meta.glob<{ default: RegistryFragment }>('../data/registry/*.json', { eager: true });

export function loadContent(): ContentBundle {
  const cards: Record<string, CardDefinition> = {};
  for (const mod of Object.values(cardModules)) {
    for (const card of mod.default) {
      if (cards[card.id]) throw new Error(`Duplicate card id: ${card.id}`);
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

  for (const mod of Object.values(registryModules)) {
    const frag = mod.default;
    for (const p of frag.promises ?? []) {
      if (promises[p.id]) throw new Error(`Duplicate promise id: ${p.id}`);
      promises[p.id] = p;
    }
    for (const e of frag.events ?? []) {
      if (events[e.id]) throw new Error(`Duplicate event id: ${e.id}`);
      events[e.id] = e;
    }
    for (const b of frag.beats ?? []) beats.push(b);
    for (const c of frag.characters ?? []) characters[c.id] = characters[c.id] ?? c;
    for (const f of frag.flags ?? []) flags[f.id] = flags[f.id] ?? f;
    for (const p of frag.precedents ?? []) precedents[p.id] = precedents[p.id] ?? p;
    for (const a of frag.articles ?? []) {
      if (articles[a.id]) throw new Error(`Duplicate article id: ${a.id}`);
      articles[a.id] = a;
    }
  }

  return {
    cards,
    events,
    beats,
    endings: endingsJson as unknown as EndingDefinition[],
    articles,
    characters,
    flags,
    precedents,
    promises,
    acts: actsJson as unknown as ActDefinition[],
    balance: balanceJson as unknown as BalanceConfig,
  };
}
