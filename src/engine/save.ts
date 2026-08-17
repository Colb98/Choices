import type { GameState, MetaSave, SaveData } from './types';

const SAVE_KEY = 'choices.run';
const META_KEY = 'choices.meta';
export const CURRENT_SAVE_VERSION = 1;
export const CURRENT_META_VERSION = 1;

export class SaveManager {
  saveRun(state: GameState, language: string) {
    const data: SaveData = { version: CURRENT_SAVE_VERSION, state, language };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch {
      // Storage may be unavailable (private mode); the game stays playable.
    }
  }

  loadRun(): SaveData | undefined {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return undefined;
      const data = JSON.parse(raw) as SaveData;
      return this.migrateRun(data);
    } catch {
      return undefined;
    }
  }

  clearRun() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      /* ignore */
    }
  }

  private migrateRun(data: SaveData): SaveData | undefined {
    if (data.version === CURRENT_SAVE_VERSION) return data;
    // No older versions shipped; unknown versions are discarded.
    return undefined;
  }

  loadMeta(): MetaSave {
    try {
      const raw = localStorage.getItem(META_KEY);
      if (raw) {
        const meta = JSON.parse(raw) as MetaSave;
        if (meta.version === CURRENT_META_VERSION) return meta;
      }
    } catch {
      /* ignore */
    }
    return {
      version: CURRENT_META_VERSION,
      completedRuns: 0,
      discoveredEndings: [],
      quoteUnlocked: false,
    };
  }

  saveMeta(meta: MetaSave) {
    try {
      localStorage.setItem(META_KEY, JSON.stringify(meta));
    } catch {
      /* ignore */
    }
  }

  recordCompletion(endingId: string): MetaSave {
    const meta = this.loadMeta();
    meta.completedRuns += 1;
    if (!meta.discoveredEndings.includes(endingId)) meta.discoveredEndings.push(endingId);
    if (!meta.firstCompletedAt) meta.firstCompletedAt = Date.now();
    meta.quoteUnlocked = true;
    this.saveMeta(meta);
    return meta;
  }
}
