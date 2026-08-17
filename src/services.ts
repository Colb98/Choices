// Module-level singletons shared by all scenes.
import { loadContent } from './engine/content';
import { NarrativeEngine } from './engine/engine';
import { SaveManager } from './engine/save';
import { detectLanguage, setLanguage } from './engine/i18n';
import type { ContentBundle, GameState, MetaSave } from './engine/types';

export const content: ContentBundle = loadContent();
export const engine = new NarrativeEngine(content);
export const saves = new SaveManager();

export interface Session {
  state?: GameState;
  meta: MetaSave;
}

export const session: Session = {
  meta: saves.loadMeta(),
};

setLanguage(session.meta.language ?? detectLanguage());

export function persistLanguage(lang: string) {
  session.meta.language = lang;
  saves.saveMeta(session.meta);
}
