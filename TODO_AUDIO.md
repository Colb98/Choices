# AUDIO TODO

Philosophy: the player reads and chooses — audio must never pull them out of that.
**BGM carries the whole game. A handful of short event SFX. No per-scene ambience.**

Format: OGG + M4A fallback, loops seamless, ~−14 LUFS. Location: `public/audio/`.

---

## 1. BGM (3 tracks)

| File | Plays | Direction |
|---|---|---|
| `bgm/menu.ogg` | Main menu, credits | Quiet, patient, single instrument |
| `bgm/main.ogg` | Acts: entry, rise, network, power, gathering | Neutral, understated loop that can run for 40 minutes without demanding attention. Read-friendly |
| `bgm/aftermath.ogg` | Aftermath act + endings | Sparse, colder, almost-silence (single piano or drone) |

**Silence is part of the score:** BGM cuts to nothing at `incident_collision` and stays silent through the whole incident act. `bgm/aftermath.ogg` fades in at the first aftermath card. The memorial is always fully silent.

## 2. THE core SFX

| File | Trigger | Direction |
|---|---|---|
| `sfx/choice_paper.ogg` | Every committed choice (swipe completes) | **A sheet of paper sliding across a desk / a page being moved onto a pile.** Dry, short (<400 ms), satisfying. This is the sound of the game — every decision is paperwork. Worth iterating until it feels right |

## 3. Event SFX (short, rare — the only other sounds in the game)

| File | Trigger | Direction |
|---|---|---|
| `sfx/lock.ogg` | Player drags into a hard-locked choice | Soft dead thud — a drawer that won't open |
| `sfx/flash.ogg` | Each memory during a flashback sequence | Quick sub-second whoosh/flash |
| `sfx/crash.ogg` | `incident_collision` card appears | High-pitch brake screech (~1.5 s) → one muffled impact → then the total silence of §1. No glass spectacle, no screams |
| `sfx/article.ogg` | Ending: article loads / reloads | Quiet page-load click |
| `sfx/removed.ogg` | Ending: article becomes unavailable | Small cold UI glitch — bureaucratic, not dramatic |

**Total: 3 BGM + 6 SFX = 9 files.** Everything else in the game is intentionally silent over the music.
