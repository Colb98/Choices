# ART TODO — image-generation brief

Card art = **the man the player is talking to** (one neutral portrait per character, reused everywhere).
Scene illustrations exist only for a handful of key moments. Everything else (phone calls, letters, reports, budgets…) gets **no art** — text carries it.

---

## 0. PRINCIPLE RULES (apply to every image)

**STYLE PREFIX (prepend to all prompts):**

> Minimalist flat vector illustration in the style of narrative mobile card games (Lapse-like). Muted, desaturated palette — deep navy, slate grey, warm paper beige — one restrained accent color. Clean geometric shapes, subtle grain, soft directional light, generous negative space. All human figures are FACELESS: heads are blank silhouettes or simple skin-tone shapes with NO eyes, NO mouth, NO nose, NO eyebrows. Identity is expressed only through clothing, build, posture and props. Politically neutral and fictional: no real politicians, no flags, no national symbols, no party logos, no readable text anywhere.

**NEGATIVE PROMPT:**

> faces, eyes, mouth, nose, facial features, photorealism, 3D render, readable text, letters, watermarks, logos, flags, national emblems, real people, gore, blood

**Rules:**
1. No faces, ever. One **neutral** pose per character — no expression variants.
2. The player is never depicted. The portrait is the other man, chest-up, facing the viewer.
3. Characters are told apart by silhouette and props only — keep each man's clothing/props identical across regenerations.
4. Portraits: **512 × 512**, plain single-color background → `public/art/portraits/<id>.webp`
   Scenes: **1024 × 1024** (square source; displayed cover-cropped into a near-square card ~440×470, so keep the key subject inside the central ~90%) → `public/art/scenes/<id>.webp`

---

## 1. PORTRAITS — the cast (one image each, neutral pose)

Prompt: `STYLE PREFIX + "Chest-up neutral portrait: <description>, plain background."`

| File | Character | Description for the prompt |
|---|---|---|
| `mentor` | The Mentor — senior politician, 60s | Heavyset, silver-grey hair, classic double-breasted charcoal suit, pocket square, old wristwatch. Settled, comfortable, takes up space |
| `minister` | The Minister — top official, 50s | Tall and lean, immaculate slim charcoal suit, perfect white cuffs, expensive minimal watch. Symmetrical, controlled, hands clasped |
| `businessman` | The Businessman — quiet money, late 40s | Midnight-blue suit with no tie, open collar, luxury watch, phone face-down in one hand. Relaxed, leaned slightly back |
| `editor` | The Editor — veteran newsman, 50s | Rolled-up shirt sleeves, loosened dark tie, reading glasses hanging from a cord on his chest, slight stoop, coffee cup. Worn, experienced |
| `journalist` | The Journalist — field reporter, late 20s | Same press "family" as the Editor but clearly junior: lanyard with blank badge, voice recorder held out, blazer over sneakers, canvas bag. Lighter, eager |
| `reformist` | The Reformist — principled legislator, 40s | Plain functional grey suit, no accessories at all, thick document folder held upright under one arm, rigid straight posture |
| `aide` | The Aide — the player's aide, late 20s | **Young man in a vest (waistcoat)** over a white shirt, slim dark tie, sleeves buttoned, tablet or folder in hand, neat short hair, slight deferential bow |
| `family_rep` | Family representative — constituent, 50s | Father figure in a worn everyday jacket over a plain shirt, holding a thin plastic document folder with both hands. Modest, dignified, standing very straight |
| `lawyer` | The family's lawyer — young, 30s | Slim off-the-rack dark suit, coat still on, thin folder held at their side, standing formally. Younger than expected, deliberately plain. **Keep the silhouette androgynous** — the Spanish localization reads the lawyer as a woman |
| `doctor` | Hospital doctor — 40s | White coat over scrubs, stethoscope around neck, ID clip, paper mask pulled down under the chin, arms at sides. Tired, upright |
| `investigator` | State investigator — 40s | Plain trench coat, flat briefcase, ID card held out in one hand, perfectly vertical stance. Institutional, unreadable. **Keep the silhouette androgynous** — one portrait serves both routes, and the independent-route investigator is written as a woman |
| `press_officer` | Press officer — 30s | Shirt and lanyard, earpiece, two phones held in one hand, clipboard in the other. Waiting for a decision |

Usage rule: a card shows the portrait of its `speaker`. Cards with no speaker show no portrait (text only), except the key scenes below.
`journalist`, `family_rep`, `lawyer`, `doctor`, `investigator`, `press_officer` are narration-card figures — wire them as speakers or scene art where they appear (`act0_first_interview`, `act3_constituent_return_*`, `aftermath_compensation`, `incident_emergency_b`, `aftermath_investigator_*`, `aftermath_media_*`).

---

## 2. KEY SCENES — only these (8 images)

| File | Moment | Prompt |
|---|---|---|
| `villa_evening` | The Gathering — arrival | Grand private villa room in golden lamplight; the familiar silhouettes of the Mentor, Minister, Businessman and Editor loosely grouped with glasses in hand, seen from the entrance; warm, expensive, closed |
| `villa_toast` | The Gathering — the toast | Long candle-lit dinner table; the Editor on his feet, glass raised, other silhouettes turned toward him |
| `villa_glass` | The Drink (climax card) | Extreme close-up: the Minister's hands pouring dark liquor into a glass directly in front of the viewer; everything else warm blur |
| `villa_driveway` | Leaving the gathering | Villa driveway at night: parked cars, cold blue air against the warm doorway behind, a long shadow on gravel |
| `night_road` | The last ride | Through a windshield at night: empty two-lane road, cone of headlights, dashboard glow, a phone lighting up on the passenger seat |
| `headlights` | The collision | Almost abstract: a white flare of headlights consuming half of a black frame, a dark shape implied at the light's edge — geometry only, nothing explicit |
| `black_road` | After the impact | Nearly black: roadside at night, one low headlight beam across asphalt, breath or steam rising through it; total stillness |
| `newspaper` | The article (ending motif) | A morning newspaper on a doorstep, headline and photo as abstract grey bars, dawn light |

Scene → card wiring (update `illustration.scene` in card JSON when art lands):
`villa_evening` → `gathering_arrival` · `villa_toast` → `gathering_editor_toast_*` · `villa_glass` → `gathering_drink` · `villa_driveway` → `gathering_transport_*` · `night_road` → `incident_road_a` · `headlights` → `incident_collision` · `black_road` → `incident_immediate_choice` · `newspaper` → `aftermath_first_article` + ending article view background.

**Total: 12 portraits + 8 scenes = 20 images.**

---

## 3. DESKTOP PRESENTATION

| File | Purpose | Status |
|---|---|---|
| `public/art/backgrounds/political-city-desktop.png` | Warm fictional capital skyline surrounding the centered portrait canvas on landscape screens | Complete |

The center is intentionally dark and low-detail because the portrait canvas covers it. The background is hidden in portrait orientation.
