# Choices — Political Life Narrative Game

Card-swipe narrative game (Phaser 3 + TypeScript + Vite), portrait 540×960, browser-only, saves in localStorage. Languages: en (source of truth), vi, es, zh-Hans.

## Commands

- `npm run dev` — dev server (port 5180)
- `npm run validate` — narrative data validator (run after ANY data change; build runs it too)
- `npm run simulate [runsPerStrategy]` — headless bot playthroughs (softlocks, ending reachability, incident coverage)
- `npm run build` — validate + typecheck + vite build

## Architecture

- `src/engine/` — pure narrative engine, no Phaser imports. `types.ts` is the DSL schema (source docs: the three "Political Life Narrative Game — *" specs in repo root). `engine.ts` = scheduler/locks/flashbacks/commit. All randomness goes through the seeded `Rng` (`rngState` persisted in the save; never `Math.random()` in narrative flow).
- `src/data/` — ALL narrative content, transcribed from the `Card_Authoring_Pack__*.md` docs (packs win over the Master Table on conflicts; the design specs remain the guiding principles).
  - `cards/<pack>.json` — arrays of `CardDefinition`; text fields hold i18n KEYS (`card.<id>.text/.left/.right`), never display strings.
  - `registry/<pack>.json` — per-pack `RegistryFragment` (flags/precedents/events/beats/characters/articles), merged at load; duplicate event ids across fragments are a hard error.
  - `i18n/<lang>/<pack>.json` — flat key→string maps, merged at load. en is fallback; validator errors on keys missing from en, warns for other languages.
- `src/scenes/` — Phaser scenes (Boot, MainMenu, Game, Ending, Credits). UI never decides narrative progression; it only calls `NarrativeEngine`.
- `scripts/` — node-side mirror loader (`load.ts`) + `validate.ts` + `simulate.ts`.

## Invariants

- Every hard lock must be explainable: flashbacks trace to concrete obligations/history (`lock.reason`). Validator enforces this.
- Delayed events roll their trigger turn at scheduling time and persist it — reload never rerolls.
- The incident occurs in every run; player-caused vs ally-caused is derived from `flag_drank_at_gathering` + `flag_self_driving`, never a morality scalar.
- HUD shows `publicTrustPerceived`, not actual.
- Debug overlay: F1 in the Game scene.
