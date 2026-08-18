# Choices — Political Life Narrative Game

Card-swipe narrative game (Phaser 3 + TypeScript + Vite), portrait 540×960, browser-only, saves in localStorage. Languages: en (source of truth), vi, es, zh-Hans.

## Commands

- `npm run dev` — dev server (port 5180)
- `npm run validate` — narrative data validator (run after ANY data change; build runs it too)
- `npm run simulate [runsPerStrategy]` — headless bot playthroughs (softlocks, ending reachability, incident coverage, economy guards, The Record invariants)
- `npm run test:promises` / `npm run test:dilemmas` / `npm run test:replay` (plus `test:economy`, `test:gathering`, `test:timeline`, `test:standing-power`, `test:public-trust`) — targeted engine/content checks
- `node scripts/smoke-record.mjs` — Playwright visual smoke of the witness overlay, continue cards, 052b and the ending ledger (needs `npm run dev`)
- `npm run build` — validate + typecheck + vite build

## Architecture

- `src/engine/` — pure narrative engine, no Phaser imports. `types.ts` is the DSL schema (source docs: the three "Political Life Narrative Game — *" specs in repo root). `engine.ts` = scheduler/locks/flashbacks/commit. All randomness goes through the seeded `Rng` (`rngState` persisted in the save; never `Math.random()` in narrative flow).
- `src/data/` — ALL narrative content, transcribed from the `Card_Authoring_Pack__*.md` docs (packs win over the Master Table on conflicts; the design specs remain the guiding principles).
  - `cards/<pack>.json` — arrays of `CardDefinition`; text fields hold i18n KEYS (`card.<id>.text/.left/.right`), never display strings.
  - `registry/<pack>.json` — per-pack `RegistryFragment` (flags/precedents/events/beats/characters/articles/promises), merged at load; duplicate event/promise ids across fragments are a hard error.
  - `cards/promises.json` + `registry/promises.json` — The Record (System Pack: Promise & Betrayal). `cards/dilemmas.json` + `registry/dilemmas.json` — ambiguity dilemmas (Ambiguity & Pacing Addendum).
  - `i18n/<lang>/<pack>.json` — flat key→string maps, merged at load. en is fallback; validator errors on keys missing from en, warns for other languages.
- `src/scenes/` — Phaser scenes (Boot, MainMenu, Game, Ending, Credits). UI never decides narrative progression; it only calls `NarrativeEngine`.
- `scripts/` — node-side mirror loader (`load.ts`) + `validate.ts` + `simulate.ts`.

## Invariants

- Every hard lock must be explainable: flashbacks trace to concrete obligations/history (`lock.reason`). Validator enforces this.
- Delayed events roll their trigger turn at scheduling time and persist it — reload never rerolls.
- The incident occurs in every run; player-caused vs ally-caused is derived from `flag_drank_at_gathering` + `flag_self_driving`, never a morality scalar.
- HUD shows `publicTrustPerceived`, not actual.
- **The Record** (`promises` state, `promise_make/break/honor` effects, `promise` condition): a promise is only made by an active idealistic choice; breaking one is never locked and never priced — the engine returns a `witness` on the commit and the UI shows the player's own words; a card that can break a promise plays identically for a player who never made it; no promise mechanics on `incident`/`aftermath` cards; every ending renders `record_ledger`. Validator + `test-promises` + simulate enforce all of this.
- **`continue` cards** (`interaction: 'continue'`): author `left` only (loader mirrors it), no lock, no promise effects; they are the same turn continued — no turn/act-turn/story-time/economy advance. Use them for setup and consequence beats, never to fake a decision.
- Card `textVariants` pick the body key by state (first match wins); history records the key that was shown, so flashbacks and The Record quote the card as it read then.
- **Replay variety comes from state, never dice.** `seed_bucket` (hash of the run seed, reload-stable, independent of the RNG stream) may only choose *which* of several equivalent scenes fills a slot — validator requires slot alternatives to partition the buckets. Act 0 = `appointment_day` → 4 pledge scenes in seeded order + 2 seeded slots (act-turns 2, 4) → `private_dinner_invitation` (act-turn 7). `ending_fallback` is a safety net: simulate fails if it exceeds 2% of runs; every aftermath state must resolve to an authored ending. Ending progress (`ui/endings.ts`) counts listed endings only and never teases bankruptcy.
- Debug overlay: F1 in the Game scene.
