# Card Authoring Pack — Act 0 (Entry) + Act I (Rise)

**Version:** 1.1 · **Cards:** 23 (6 + 17) · **Source of truth language:** English
**Supported languages:** English (`en`), Vietnamese (`vi`), Spanish (`es`), Simplified Chinese (`zh-Hans`)

This pack is written to be mechanically transcribable into the JSON `CardDefinition` schema defined in *Data Schema & Narrative DSL Specification*. Every field name below matches the DSL exactly. Slot numbering follows the *Master Narrative Table*; slot 019 is split into two authored cards because the schema intentionally has no conditional text templating.

---

## 1. Conventions Used in This Pack

### 1.1 Localization key scheme (schema amendment required)

To support multi-language, all `text` fields in card JSON hold **localization keys**, not display strings. The i18n layer resolves them at render time.

```text
card.<card_id>.text          → narrative body
card.<card_id>.left          → left choice label
card.<card_id>.right         → right choice label
card.<card_id>.left.v1       → left choice variant 1 label (only if a ChoiceVariant overrides text)
char.<character_id>.name     → character display name
```

- Language files: `src/data/i18n/en.json`, `vi.json`, `es.json`, `zh-Hans.json`. Flat key → string maps.
- `en` is the fallback language. The validator must fail the build if any key referenced by a card is missing from `en.json`, and warn if missing from other languages.
- `ChoiceHistoryEntry.choiceText` stores the **key**, not the resolved string, so flashbacks render in the player's current language.
- Format parameters use `{0}`, `{1}` placeholders. No card in this pack uses parameters yet.

### 1.2 Preview notation

`ChoicePreview` trends use the DSL's numeric scale (`-3…+3`) for `money / standing / power` and `TrustTrend` strings for `publicTrust`.

> **Schema gap flagged:** the Master Table uses `T ↑↑?` (strong-but-uncertain), which the current `TrustTrend` enum cannot express. This pack maps `↑↑?` → `"up_uncertain"` for now. **Recommended enum extension:** add `"strong_up_uncertain"` and `"strong_down_uncertain"`; cards below that intend `↑↑?` are marked `[intended: ↑↑?]` so they can be upgraded with a find-replace once the enum lands.

### 1.3 Effect shorthand

Effects are listed in compact form; each line maps 1:1 to one DSL effect object.

```text
standing +4                    → { "type":"stat", "stat":"standing", "add":4 }
trustActual +2                 → { "type":"stat", "stat":"publicTrustActual", "add":2 }
trustPerceived +4              → { "type":"stat", "stat":"publicTrustPerceived", "add":4 }
money -600                     → { "type":"stat", "stat":"money", "add":-600 }
REL mentor +1                  → { "type":"relationship", "character":"mentor", "add":1 }
PRE special_treatment +1       → { "type":"precedent", "precedent":"precedent_special_treatment", "add":1 }
FLG add flag_x                 → { "type":"flag", "flag":"flag_x", "action":"add" }
OBL+ <id> (creditor, w, tags)  → obligation_add
OBL~ resolve (creditor, n, res)→ obligation_resolve
EVT <event_id> @ <delay>       → delayedEffects entry
```

### 1.4 Balance envelope (for QA / simulation)

Starting state: `money 50,000 · standing 15 · power 5 · trustActual 40 · trustPerceived 40`.

Expected state at end of Act I (median run): `standing 32–46 · power 14–26 · trustPerceived 46–58 · trustActual 42–54 · money 49,400–50,000`. Money is intentionally near-static until Act II (Chain C payoff).

Magnitude bands used in this pack: small = 2–3, medium = 4–6, large = 7+ (large is not used before Act II).

---

## 2. Registries Introduced by This Pack

### 2.1 Characters used

| id | EN | VI | ES | ZH |
|---|---|---|---|---|
| `mentor` | The Mentor | Người Đỡ Đầu | El Mentor | 导师 |
| `businessman` | The Businessman | Doanh Nhân | El Empresario | 商人 |
| `editor` | The Editor | Tổng Biên Tập | El Editor | 总编 |
| `reformist` | The Reformist | Nhà Cải Cách | La Reformista | 改革派 |
| `aide` | The Aide | Trợ Lý | La Asesora | 助理 |

(`minister` first appears in Act II — not used in this pack.)

### 2.2 Flags defined (add to `flags.json`)

```text
flag_ambitious_public_image        Player publicly promised major change on day one.
flag_requested_transparency_early  Player pulled the full land-compensation case file.
flag_early_transparency_position   Player's first speech proposed transparent procedures.
flag_early_case_public             Player published the compensation audit findings.
flag_entered_inner_social_circle   Player attended the first private dinner.
flag_direct_business_contact       Player exchanged private contacts with the Businessman.
flag_public_reform_support         Player publicly co-sponsored procurement disclosure.
flag_self_promotional_style        Player publicly claimed sole credit for a win.
flag_loyal_committee_member        The Mentor's candidate is committee secretary.
flag_declined_first_promotion      Player declined the deputy-chair promotion.
```

### 2.3 Precedents defined (add to `precedents.json`)

```text
precedent_political_punishment     Normalized using punishment of rivals as politics.
precedent_special_treatment        Normalized informal acceleration for connected people.
precedent_quiet_resolution         Normalized settling misconduct without publicity.
precedent_nepotism                 Normalized relationship-based appointments.
precedent_administrative_override  Normalized bypassing procedure by authority.
precedent_loyalty_appointments     Normalized voting for loyalty over merit.
precedent_media_management         Normalized shaping coverage of oneself.
```

### 2.4 Obligations created in this pack

| id | creditor | w | tags | source |
|---|---|---|---|---|
| `obligation_mentor_committee_01` | mentor | 1 | `political, committee, inner_circle` | 007 right |
| `obligation_editor_profile_01` | editor | 1 | `media, favor` | 011 right |
| `obligation_businessman_hospitality_01` | businessman | 1 | `business, hospitality` | 017 right |
| `obligation_mentor_promotion_01` | mentor | 2 | `promotion, inner_circle` | 021 left (variant) |

All four feed the Final Gathering lock (`tag: inner_circle` count / creditor weights) per Chains A–C.

### 2.5 Events defined (add to `events/`)

| eventId | → cardId | once | notes |
|---|---|---|---|
| `event_constituent_case_followup` | `act1_constituent_case_callback` | yes | Chain: card 002 → 010 |
| `event_committee_vote_supported` | `act1_committee_result_supported` | yes | Chain: 015 right → 019a |
| `event_committee_vote_refused` | `act1_committee_result_refused` | yes | Chain: 015 left → 019b |
| `event_permit_favor_callback` | `act2_protected_investment` | yes | **Forward ref** — target card authored in the Act II pack (Chain C: 009 → 022). Validator must treat as unresolved-until-Act-II. |

### 2.6 Mandatory beats (add to `beats/`)

```json
{ "id": "beat_act1_committee",  "act": "rise", "cardId": "act1_committee_opportunity", "earliestActTurn": 1,  "latestActTurn": 2,  "priority": 100, "once": true }
{ "id": "beat_act1_promotion",  "act": "rise", "cardId": "act1_first_promotion",       "earliestActTurn": 10, "latestActTurn": 13, "priority": 100, "once": true }
```

Act 0 needs no beats: its six cards are hard-chained with `next` directives (tutorial routing per spec §45).

### 2.7 Vietnamese register note (translation-critical)

Vietnamese second-person address encodes power distance; this pack uses it deliberately and translators/localization QA must preserve it:

| Speaker → player | Pronoun | Effect |
|---|---|---|
| Mentor | `cậu` | Senior-to-junior warmth; paternal, slightly diminishing |
| Businessman | `cậu` | Presumes familiarity he has not earned |
| Aide | `sếp` | Workplace deference |
| Reporter (narration) | `ngài` | Public formality |
| Reformist | `anh` | Peer-to-peer, deliberately no deference |

Spanish uses `tú` for allies/staff and `usted` for the reporter and the Businessman's first meeting. Chinese uses 您 only from the aide and the reporter.

---

## 3. ACT 0 — ENTRY (6 cards, hard-chained)

All Act 0 cards: `act: "entry"`, `type: "story"`, `once: true`, no `conditions`, no `weight` (never pooled — reached only by `next` chaining).

---

### CARD 001 — Appointment Day

`act0_appointment_day` · speaker: `mentor` · illustration: `{ "scene": "assembly_hall_oath", "expression": "friendly" }`
**Routing:** forced first card of every run. `next` (both choices): `{ "type": "card", "cardId": "act0_constituent_land_case" }`

**LEFT — Keep the speech modest.**
- preview: `standing +1 · publicTrust "up_uncertain"`
- effects: `standing +3 · trustActual +1 · trustPerceived +1`

**RIGHT — Promise major change.**
- preview: `standing +2 · publicTrust "up_uncertain"` `[intended: ↑↑?]`
- effects: `standing +5 · trustPerceived +4 · trustActual +2 · FLG add flag_ambitious_public_image`

**designIntent:** Teach preview UI. Seed the perceived/actual trust gap on turn 1: promises inflate perception more than reality. `flag_ambitious_public_image` is referenced by Act II media cards ("Whatever happened to the big change?").

**Strings**
- `card.act0_appointment_day.text`
  - EN: Your mentor finds you right after the oath, a hand on your shoulder. "Congratulations. People expect things from someone in your position now — starting with your first words to the press."
  - VI: Người đỡ đầu tìm gặp bạn ngay sau lễ tuyên thệ, tay đặt lên vai bạn. "Chúc mừng. Từ giờ, người ta sẽ kỳ vọng vào vị trí của cậu đấy — bắt đầu từ những lời đầu tiên cậu nói với báo chí."
  - ES: Tu mentor te encuentra justo después del juramento, con una mano en tu hombro. «Felicidades. A partir de ahora la gente espera cosas de alguien en tu posición — empezando por tus primeras palabras a la prensa.»
  - ZH: 宣誓仪式刚结束，导师就找到了你，手搭在你肩上。"祝贺你。从现在起，人们会对你这个位置有所期待——从你对媒体说的第一句话开始。"
- `card.act0_appointment_day.left`
  - EN: Keep the speech modest. · VI: Phát biểu khiêm tốn. · ES: Un discurso modesto. · ZH: 发言保持低调。
- `card.act0_appointment_day.right`
  - EN: Promise major change. · VI: Hứa hẹn thay đổi lớn. · ES: Promete grandes cambios. · ZH: 承诺重大变革。

---

### CARD 002 — First Constituent Complaint

`act0_constituent_land_case` · speaker: — (narration) · illustration: `{ "scene": "office_letters" }`
**Routing:** `next` (both): `{ "type": "card", "cardId": "act0_first_parliament_speech" }`

**LEFT — Request the complete case file.**
- preview: `standing 0 · publicTrust "up_uncertain"`
- effects: `trustActual +2`
- FLG add `flag_requested_transparency_early`
- EVT `event_constituent_case_followup` @ `{ "type": "turn_range", "min": 4, "max": 7 }` · `onConditionFail: "discard"`

**RIGHT — Forward it to the local office.**
- preview: `standing 0 · publicTrust "unknown"`
- effects: — (none)

**designIntent:** Responsible action = more work, delayed payoff. The scheduled event lands early in Act I (card 010). Right is not punished — silence is the realistic default and its cost is invisible.

**Strings**
- `card.act0_constituent_land_case.text`
  - EN: A family from your district writes to you: compensation for land taken by a public project was calculated three different ways in three different documents. They are not asking for money. They are asking which number is real.
  - VI: Một gia đình trong khu vực bạn phụ trách gửi đơn: tiền đền bù đất cho một dự án công được tính theo ba cách khác nhau trong ba văn bản khác nhau. Họ không xin tiền. Họ chỉ hỏi con số nào mới là thật.
  - ES: Una familia de tu distrito te escribe: la compensación por un terreno expropiado para una obra pública fue calculada de tres maneras distintas en tres documentos distintos. No piden dinero. Preguntan cuál de las cifras es la verdadera.
  - ZH: 你选区的一户人家来信：一项公共工程的征地补偿，在三份文件里用了三种算法。他们不是来要钱的。他们只想知道哪个数字才是真的。
- `card.act0_constituent_land_case.left`
  - EN: Request the complete case file. · VI: Yêu cầu toàn bộ hồ sơ vụ việc. · ES: Solicitar el expediente completo. · ZH: 调阅完整案卷。
- `card.act0_constituent_land_case.right`
  - EN: Forward it to the local office. · VI: Chuyển về văn phòng địa phương. · ES: Remitirlo a la oficina local. · ZH: 转交地方办公室。

---

### CARD 003 — First Parliamentary Speech

`act0_first_parliament_speech` · speaker: — (narration) · illustration: `{ "scene": "parliament_podium", "expression": "serious" }`
**Routing:** `next` (both): `{ "type": "card", "cardId": "act0_first_interview" }`

**LEFT — Propose transparent complaint procedures.**
- preview: `standing +1 · power 0 · publicTrust "up_uncertain"`
- effects: `standing +3 · trustActual +3 · trustPerceived +2 · REL reformist +1 · FLG add flag_early_transparency_position`

**RIGHT — Demand harsher punishment for the guilty.**
- preview: `standing +1 · power +1 · publicTrust "up_uncertain"` `[intended: ↑↑?]`
- effects: `standing +3 · power +3 · trustPerceived +5 · trustActual +3 · REL mentor +1 · PRE political_punishment +1`

**designIntent:** Both options are crowd-pleasers; the right one is *more* popular and grants Power — punishment politics pays better than procedure politics. First precedent of the run, invisible.

**Strings**
- `card.act0_first_parliament_speech.text`
  - EN: Your first scheduled address to the chamber. Two drafts sit on your desk — one proposes transparent complaint procedures, the other demands harsher punishment for the officials named in last month's scandal.
  - VI: Bài phát biểu đầu tiên của bạn trước nghị trường. Hai bản thảo nằm trên bàn — một đề xuất minh bạch hoá quy trình khiếu nại, một đòi xử lý nặng tay các quan chức bị nêu tên trong vụ bê bối tháng trước.
  - ES: Tu primer discurso programado ante la cámara. Dos borradores sobre tu escritorio: uno propone procedimientos transparentes de denuncia; el otro exige castigos más duros para los funcionarios señalados en el escándalo del mes pasado.
  - ZH: 你在议会的首次正式发言。桌上放着两份讲稿——一份提议公开透明的申诉程序，另一份要求严惩上月丑闻中被点名的官员。
- `card.act0_first_parliament_speech.left`
  - EN: Propose transparent complaint procedures. · VI: Đề xuất minh bạch quy trình khiếu nại. · ES: Proponer procedimientos transparentes de denuncia. · ZH: 提议透明的申诉程序。
- `card.act0_first_parliament_speech.right`
  - EN: Demand harsher punishment for the guilty. · VI: Đòi xử nặng những người sai phạm. · ES: Exigir castigos más duros para los culpables. · ZH: 要求严惩涉事官员。

---

### CARD 004 — Media Interview

`act0_first_interview` · speaker: — (narration) · illustration: `{ "scene": "corridor_press" }`
**Routing:** `next` (both): `{ "type": "card", "cardId": "act0_mentor_advice" }`

**LEFT — "Rules should apply equally."**
- preview: `standing +1 · publicTrust "up_uncertain"`
- effects: `standing +2 · trustActual +3 · trustPerceived +1 · REL reformist +1`

**RIGHT — "Reform requires cooperation."**
- preview: `standing +1 · power +1 · publicTrust "unknown"`
- effects: `standing +3 · power +2 · REL mentor +1`

**designIntent:** First alignment fork: public principle vs. establishment signal. Neither is corrupt. The Right answer is what every real politician says — and it is genuinely how things pass.

**Strings**
- `card.act0_first_interview.text`
  - EN: The reporter catches you in the corridor, recorder already running. "One question. When the rules and senior people collide — which side are you on?"
  - VI: Phóng viên chặn bạn ở hành lang, máy ghi âm đã bật sẵn. "Một câu hỏi thôi. Khi luật lệ và những người có vai vế va vào nhau — ngài đứng về phía nào?"
  - ES: La reportera lo intercepta en el pasillo, con la grabadora ya encendida. «Una sola pregunta. Cuando las reglas chocan con la gente importante, ¿de qué lado está usted?»
  - ZH: 记者在走廊拦住你，录音笔已经打开。"就一个问题。当规则和大人物相撞时——您站在哪一边？"
- `card.act0_first_interview.left`
  - EN: "Rules should apply equally." · VI: "Luật phải công bằng với tất cả." · ES: «Las reglas deben aplicarse a todos por igual.» · ZH: "规则应当对所有人平等。"
- `card.act0_first_interview.right`
  - EN: "Reform requires cooperation." · VI: "Cải cách cần sự hợp tác." · ES: «La reforma requiere cooperación.» · ZH: "改革需要合作。"

---

### CARD 005 — The Mentor's Advice

`act0_mentor_advice` · speaker: `mentor` · illustration: `{ "scene": "tea_room", "expression": "friendly" }`
**Routing:** `next` (both): `{ "type": "card", "cardId": "act0_private_dinner_invitation" }`

**LEFT — Listen carefully.**
- preview: `standing +1 · publicTrust "unknown"`
- effects: `standing +2 · REL mentor +1`

**RIGHT — "Independence matters more."**
- preview: `standing 0 · publicTrust "up_uncertain"`
- effects: `trustActual +2 · trustPerceived +1 · REL mentor -1 · REL reformist +1`

**designIntent:** The Mentor's thesis is the game's thesis, inverted: he is *right* that relationships pass reforms. The game never argues with him. It just remembers.

**Strings**
- `card.act0_mentor_advice.text`
  - EN: "You have good instincts," your mentor says over tea. "But instincts don't pass votes. Relationships do. Build them first. Reform later — from a position where your refusal costs them something."
  - VI: "Cậu có trực giác tốt," người đỡ đầu nói bên chén trà. "Nhưng trực giác không giúp thông qua được lá phiếu nào. Quan hệ mới làm được. Xây quan hệ trước đi. Cải cách để sau — khi cậu đã ở vị thế mà một lời từ chối của cậu cũng khiến người khác phải trả giá."
  - ES: «Tienes buen instinto», dice tu mentor mientras sirve el té. «Pero el instinto no aprueba votaciones. Las relaciones sí. Constrúyelas primero. Reforma después — desde una posición en la que tu negativa les cueste algo.»
  - ZH: "你的直觉不错，"导师一边斟茶一边说。"但直觉通不过任何表决，关系才可以。先把关系建起来。改革以后再说——等到你的拒绝能让别人付出代价的时候。"
- `card.act0_mentor_advice.left`
  - EN: Listen carefully. · VI: Lắng nghe cẩn thận. · ES: Escuchar con atención. · ZH: 认真听取。
- `card.act0_mentor_advice.right`
  - EN: "Independence matters more." · VI: "Độc lập quan trọng hơn." · ES: «La independencia importa más.» · ZH: "独立更重要。"

---

### CARD 006 — First Invitation

`act0_private_dinner_invitation` · speaker: — (narration) · illustration: `{ "scene": "envelope_invitation" }`
**Routing:** `next` (both): `{ "type": "act", "act": "rise" }`

**LEFT — Attend.**
- preview: `standing +1 · power +1 · publicTrust "unknown"`
- effects: `standing +3 · power +2 · REL mentor +1 · FLG add flag_entered_inner_social_circle`

**RIGHT — Decline politely.**
- preview: `standing -1 · publicTrust "unknown"`
- effects: `standing -2`

**designIntent:** End of Act 0. Attending creates no obligation — deliberately. The room costs nothing to enter. That is the point of the room.

**Strings**
- `card.act0_private_dinner_invitation.text`
  - EN: An envelope with no letterhead. A private dinner: eight names, three of which you have only ever seen on television. No agenda is mentioned. None is needed.
  - VI: Một phong bì không tiêu đề. Một bữa tối riêng tư: tám cái tên, ba trong số đó bạn mới chỉ thấy trên truyền hình. Không ai nhắc đến mục đích. Mà cũng chẳng cần.
  - ES: Un sobre sin membrete. Una cena privada: ocho nombres, tres de los cuales solo has visto en televisión. Nadie menciona la agenda. No hace falta.
  - ZH: 一只没有落款的信封。一场私人晚宴：八个名字，其中三个你只在电视上见过。没人提议程。也不需要提。
- `card.act0_private_dinner_invitation.left`
  - EN: Attend. · VI: Tham dự. · ES: Asistir. · ZH: 赴宴。
- `card.act0_private_dinner_invitation.right`
  - EN: Decline politely. · VI: Từ chối khéo. · ES: Declinar con cortesía. · ZH: 婉言谢绝。

---

## 4. ACT I — RISE (17 cards)

All Act I cards: `act: "rise"`. Cards 007 and 021 are beats (`type: "story"`); 010, 019a, 019b are `type: "consequence"` (event-resolved, never pooled); the rest are `type: "contextual"`, `once: true`, default `weight: 10` unless noted, `next: { "type": "scheduler" }` unless noted.

---

### CARD 007 — Committee Opportunity *(beat)*

`act1_committee_opportunity` · speaker: `mentor` · illustration: `{ "scene": "office_mentor", "expression": "friendly" }` · beat: `beat_act1_committee`

**LEFT — Let the process decide.**
- preview: `standing 0 · power 0 · publicTrust "unknown"`
- effects: `REL mentor -1`

**RIGHT — "I'd appreciate the mention."**
- preview: `standing +2 · power +1 · publicTrust "unknown"`
- effects: `standing +6 · power +3 · REL mentor +2`
- OBL+ `obligation_mentor_committee_01` (creditor `mentor`, w 1, tags `political, committee, inner_circle`)

**designIntent:** Chain A root. The first real obligation of the run, priced generously: +6 Standing for one word. Refusing costs nothing visible — only the Mentor's warmth.

**Strings**
- `card.act1_committee_opportunity.text`
  - EN: "The Budget Oversight seat opens next week," your mentor says. "The selection process is a formality — if the right person mentions your name. Shall I?"
  - VI: "Ghế Giám sát Ngân sách sẽ trống vào tuần tới," người đỡ đầu nói. "Quy trình tuyển chọn chỉ là hình thức thôi — nếu có đúng người nhắc đến tên cậu. Tôi nhắc nhé?"
  - ES: «El puesto en Supervisión Presupuestaria queda libre la próxima semana», dice tu mentor. «El proceso de selección es una formalidad… si la persona adecuada menciona tu nombre. ¿Lo hago?»
  - ZH: "预算监督委员会下周有个空缺，"导师说。"遴选流程只是走个形式——只要有合适的人提一句你的名字。要我提吗？"
- `card.act1_committee_opportunity.left`
  - EN: Let the process decide. · VI: Để quy trình tự quyết định. · ES: Que decida el proceso. · ZH: 让流程自己决定。
- `card.act1_committee_opportunity.right`
  - EN: "I'd appreciate the mention." · VI: "Vậy nhờ ông nhắc giúp tôi." · ES: «Te agradecería la mención.» · ZH: "那就有劳您了。"

---

### CARD 008 — Businessman Introduction

`act1_businessman_intro` · speaker: `businessman` · illustration: `{ "scene": "reception_hall", "expression": "friendly" }`
**Conditions:** `{ "type": "flag", "flag": "flag_entered_inner_social_circle", "exists": true }` — **RESOLVED (v1.1):** if the player skipped the Act 0 dinner, Chain C stays closed permanently. The Businessman still appears in the run as a background presence via card 008b (`act1_businessman_glimpse`) — visible, functioning, out of reach. Declining the room closes the room; it does not empty it.

**LEFT — Keep the conversation formal.**
- preview: `standing 0 · publicTrust "unknown"`
- effects: — (none)

**RIGHT — Exchange private contacts.**
- preview: `standing +1 · publicTrust "unknown"`
- effects: `standing +2 · REL businessman +1 · FLG add flag_direct_business_contact`

**designIntent:** Chain C root. No request, no obligation, no money. The corrupt network's first move is always free.

**Strings**
- `card.act1_businessman_intro.text`
  - EN: At a reception, your mentor steers a man in a quiet, expensive suit toward you. "We fund what governments are too slow to fund," the man says. "And I admire people who move faster than their institutions."
  - VI: Tại một buổi tiếp tân, người đỡ đầu dẫn đến trước mặt bạn một người đàn ông mặc bộ vest kín đáo nhưng đắt tiền. "Chúng tôi rót vốn vào những thứ mà nhà nước làm quá chậm," ông ta nói. "Và tôi quý những người đi nhanh hơn chính bộ máy của mình."
  - ES: En una recepción, tu mentor conduce hacia ti a un hombre de traje discreto y caro. «Financiamos lo que los gobiernos tardan demasiado en financiar», dice el hombre. «Y admiro a la gente que se mueve más rápido que sus instituciones.»
  - ZH: 招待会上，导师把一个穿着低调却昂贵西装的男人领到你面前。"政府来不及出钱的事，我们来出钱，"那人说。"我欣赏跑得比自己的体制还快的人。"
- `card.act1_businessman_intro.left`
  - EN: Keep the conversation formal. · VI: Giữ câu chuyện ở mức xã giao. · ES: Mantener la conversación formal. · ZH: 保持公事公办。
- `card.act1_businessman_intro.right`
  - EN: Exchange private contacts. · VI: Trao đổi liên lạc riêng. · ES: Intercambiar contactos privados. · ZH: 交换私人联系方式。

---

### CARD 008b — A Man You Almost Met *(ambient — Chain C closed)*

`act1_businessman_glimpse` · speaker: — (narration) · illustration: `{ "scene": "reception_hall" }` · type: `contextual` · weight: 5 · once: true · minTurn (act): 5
**Conditions:** `{ "not": { "type": "flag", "flag": "flag_direct_business_contact", "exists": true } }`
*(Fires whether the player declined the Act 0 dinner entirely or attended but kept card 008 formal — either way, Chain C is closed and this is all the Businessman will ever be to this run.)*

**LEFT — Watch a moment longer.**
- preview: `publicTrust "unknown"`
- effects: — (none)

**RIGHT — Return to your conversation.**
- preview: `publicTrust "unknown"`
- effects: — (none)

**designIntent:** The declined network keeps functioning without the player. The permit still went through — someone else made the call. Both choices are deliberately empty: watching costs nothing and changes nothing, which is exactly the sentence this card is writing. Refusal removes you from the machine; it does not stop the machine. No relationship, no flag, no follow-up — he never looks the player's way again for the rest of the run.

**Strings**
- `card.act1_businessman_glimpse.text`
  - EN: Two receptions later, you see him again — the quiet, expensive suit, laughing at something a deputy from the appropriations committee has said. A fragment drifts past: "…went through last week. I won't forget it." He does not look your way.
  - VI: Hai buổi tiếp tân sau, bạn lại thấy ông ta — vẫn bộ vest kín đáo mà đắt tiền, đang cười trước câu nói của một phó chủ nhiệm bên ủy ban ngân sách. Một mẩu chuyện trôi ngang qua: "…tuần trước được duyệt rồi. Tôi sẽ không quên đâu." Ông ta không nhìn về phía bạn.
  - ES: Dos recepciones después, vuelves a verlo: el mismo traje discreto y caro, riéndose de algo que dijo un diputado del comité de presupuesto. Un fragmento flota hasta ti: «…se aprobó la semana pasada. No lo olvidaré.» Él no mira en tu dirección.
  - ZH: 两场招待会之后，你又见到了他——还是那身低调而昂贵的西装，正对着拨款委员会的一位副主任说笑。一句话的碎片飘了过来："……上周批下来了，这份情我记着。"他没有朝你这边看一眼。
- `card.act1_businessman_glimpse.left`
  - EN: Watch a moment longer. · VI: Đứng nhìn thêm một lát. · ES: Observar un momento más. · ZH: 多看一会儿。
- `card.act1_businessman_glimpse.right`
  - EN: Return to your conversation. · VI: Quay lại câu chuyện của mình. · ES: Volver a tu conversación. · ZH: 回到自己的谈话中。

---

### CARD 009 — Delayed Permit

`act1_business_permit` · speaker: `businessman` · illustration: `{ "scene": "restaurant_private_room", "expression": "friendly" }` · weight: 8
**Conditions:** `{ "type": "flag", "flag": "flag_direct_business_contact", "exists": true }`

**LEFT — Let the process run its course.**
- preview: `power -1 · publicTrust "unknown"`
- effects: `power -2 · REL businessman -1`

**RIGHT — "I'll make a call."**
- preview: `standing +1 · power +1 · publicTrust "unknown"`
- effects: `standing +2 · power +3 · REL businessman +1 · PRE special_treatment +1`
- EVT `event_permit_favor_callback` @ `{ "type": "act", "act": "network", "minActTurn": 1 }` · `onConditionFail: "discard"`

**designIntent:** Chain C link 2. **Deliberately no obligation and no money** — after this favor, *he* owes *you*. Gratitude is the hook: it converts into "access" (card 022, protected investment) which is where the real capture happens. The player should feel generous here, not bribed.

**Strings**
- `card.act1_business_permit.text`
  - EN: "One permit," the businessman says. "Environmental compliance — approved once, resubmitted after a form change, sitting on someone's desk for five months. Nothing illegal. Just gravity. You could remove the gravity."
  - VI: "Một giấy phép thôi," vị doanh nhân nói. "Đánh giá môi trường — từng được duyệt một lần, phải nộp lại vì đổi biểu mẫu, rồi nằm trên bàn ai đó suốt năm tháng nay. Không có gì phạm pháp cả. Chỉ là sức ì. Mà cậu thì gỡ được sức ì đó."
  - ES: «Un solo permiso», dice el empresario. «Cumplimiento ambiental: aprobado una vez, presentado de nuevo por un cambio de formulario, y cinco meses en el escritorio de alguien. Nada ilegal. Solo gravedad. Usted podría quitar la gravedad.»
  - ZH: "就一张许可证，"商人说。"环评——批过一次，因为表格改版重新提交，在某人桌上压了五个月。没什么违法的，只是惯性。而你，能消除这份惯性。"
- `card.act1_business_permit.left`
  - EN: Let the process run its course. · VI: Cứ để quy trình tự chạy. · ES: Que el trámite siga su curso. · ZH: 让流程照常走。
- `card.act1_business_permit.right`
  - EN: "I'll make a call." · VI: "Để tôi gọi một cuộc." · ES: «Haré una llamada.» · ZH: "我打个电话。"

---

### CARD 010 — Constituent Case Callback *(consequence — event-resolved only)*

`act1_constituent_case_callback` · speaker: `aide` · illustration: `{ "scene": "office_files", "expression": "concerned" }`
**Reached by:** `event_constituent_case_followup` (scheduled by 002 left). Never pooled.
**Conditions:** `{ "type": "flag", "flag": "flag_requested_transparency_early", "exists": true }` (belt-and-suspenders; event already implies it)

**LEFT — Publish the findings.**
- preview: `standing -1 · publicTrust "up_uncertain"` `[intended: ↑↑?]`
- effects: `standing -3 · trustActual +6 · trustPerceived +2 · FLG add flag_early_case_public`

**RIGHT — Resolve it quietly.**
- preview: `standing +1 · power +1 · publicTrust "up_uncertain"`
- effects: `standing +3 · power +2 · trustActual +1 · trustPerceived +2 · PRE quiet_resolution +1`

**designIntent:** The pack's cleanest actual/perceived split. Publishing: elites recoil (Standing −), the real public quietly banks it (Actual ++, but Perceived lags — no one polls gratitude). Quiet resolution genuinely helps the family too — the promoted official is simply never named. Both defensible. That's the trap working as intended.

**Strings**
- `card.act1_constituent_case_callback.text`
  - EN: The complete file arrives, heavier than expected. The audit confirms it: three valuations, two signatures that don't match, and one official who has since been promoted. Your aide waits by the door, her notes already clipped to the cover.
  - VI: Bộ hồ sơ đầy đủ được chuyển đến, dày hơn dự đoán. Kết quả rà soát xác nhận: ba mức định giá, hai chữ ký không khớp, và một cán bộ liên quan thì vừa mới được thăng chức. Trợ lý của bạn đứng chờ bên cửa, ghi chú của cô ấy đã được kẹp sẵn trên bìa.
  - ES: El expediente completo llega, más pesado de lo esperado. La revisión lo confirma: tres avalúos, dos firmas que no coinciden y un funcionario que desde entonces fue ascendido. Tu asesora espera junto a la puerta, con sus notas ya sujetas a la portada.
  - ZH: 完整的案卷送到了，比想象中更厚。核查结果证实：三种估价、两处对不上的签名，还有一位事后升了职的官员。你的助理在门边等着，她的笔记已经夹在封面上。
- `card.act1_constituent_case_callback.left`
  - EN: Publish the findings. · VI: Công bố kết quả. · ES: Publicar los hallazgos. · ZH: 公布核查结果。
- `card.act1_constituent_case_callback.right`
  - EN: Resolve it quietly. · VI: Xử lý êm thấm. · ES: Resolverlo discretamente. · ZH: 低调处理。

---

### CARD 011 — Favorable Profile

`act1_editor_profile_offer` · speaker: `editor` · illustration: `{ "scene": "newsroom_office", "expression": "friendly" }`

**LEFT — No special treatment.**
- preview: `standing 0 · publicTrust "unknown"`
- effects: — (none)

**RIGHT — Accept the feature.**
- preview: `standing +2 · publicTrust "up_uncertain"`
- effects: `standing +6 · trustPerceived +3 · trustActual +1 · REL editor +1`
- OBL+ `obligation_editor_profile_01` (creditor `editor`, w 1, tags `media, favor`)

**designIntent:** Chain B root. The line "I choose the questions" is the entire media-capture arc in six words; the player will re-read it very differently at card 049.

**Strings**
- `card.act1_editor_profile_offer.text`
  - EN: The editor's office smells of coffee and fresh proofs. "We're running a series on the new generation in politics. You would open it. Good photos, better questions — and I choose the questions."
  - VI: Phòng làm việc của tổng biên tập thoảng mùi cà phê và mùi giấy in còn mới. "Chúng tôi sắp chạy loạt bài về thế hệ chính khách mới. Cậu sẽ là người mở màn. Ảnh đẹp, câu hỏi còn đẹp hơn — và tôi là người chọn câu hỏi."
  - ES: La oficina del editor huele a café y a pruebas de imprenta recién hechas. «Vamos a publicar una serie sobre la nueva generación política. Tú la abrirías. Buenas fotos, mejores preguntas — y las preguntas las elijo yo.»
  - ZH: 总编办公室里飘着咖啡和新校样的味道。"我们要做一个政坛新生代系列，由你打头。照片会很好，问题会更好——而问题由我来定。"
- `card.act1_editor_profile_offer.left`
  - EN: No special treatment. · VI: Không cần ưu ái. · ES: Sin trato preferencial. · ZH: 不需要特殊关照。
- `card.act1_editor_profile_offer.right`
  - EN: Accept the feature. · VI: Nhận lời. · ES: Aceptar el reportaje. · ZH: 接受专访。

---

### CARD 012 — Reformist Introduction

`act1_reformist_bill_intro` · speaker: `reformist` · illustration: `{ "scene": "office_desk_draft", "expression": "neutral" }`

**LEFT — Co-sponsor it publicly.**
- preview: `standing -1 · power -1 · publicTrust "up_uncertain"`
- effects: `standing -3 · power -2 · trustActual +4 · trustPerceived +1 · REL reformist +2 · FLG add flag_public_reform_support`

**RIGHT — Support it privately.**
- preview: `standing 0 · power 0 · publicTrust "unknown"`
- effects: `REL reformist +1`

**designIntent:** Chain D root. The only Act I card where the "good" option visibly costs two stats at once. `flag_public_reform_support` gates cards 031/038/052 and ultimately the Ending G payoff line: "Your office has no authority over this inquiry."

**Strings**
- `card.act1_reformist_bill_intro.text`
  - EN: "Procurement disclosure," the Reformist says, sliding a draft across your desk. "Every contract above the threshold, published within thirty days. Half the chamber will hate it — the important half."
  - VI: "Công khai mua sắm công," Nhà Cải Cách nói, đẩy bản thảo qua mặt bàn. "Mọi hợp đồng trên ngưỡng quy định đều phải công bố trong vòng ba mươi ngày. Nửa nghị trường sẽ ghét dự luật này — cái nửa quan trọng."
  - ES: «Divulgación de contrataciones públicas», dice la Reformista, deslizando un borrador sobre tu escritorio. «Todo contrato por encima del umbral, publicado en treinta días. La mitad de la cámara lo odiará — la mitad importante.»
  - ZH: "公共采购公开，"改革派把草案推过桌面。"超过限额的合同，三十天内一律公示。半个议会会恨这个法案——是重要的那一半。"
- `card.act1_reformist_bill_intro.left`
  - EN: Co-sponsor it publicly. · VI: Công khai đồng bảo trợ. · ES: Copatrocinarlo públicamente. · ZH: 公开联署。
- `card.act1_reformist_bill_intro.right`
  - EN: Support it privately. · VI: Ủng hộ trong âm thầm. · ES: Apoyarlo en privado. · ZH: 私下支持。

---

### CARD 013 — Staff Hiring

`act1_staff_hiring` · speaker: `aide` · illustration: `{ "scene": "office_cv_pile", "expression": "neutral" }`

**LEFT — Run open recruitment.**
- preview: `power 0 · publicTrust "up_uncertain"`
- effects: `trustActual +1`

**RIGHT — Hire the recommended candidate.**
- preview: `standing +1 · power +1 · publicTrust "unknown"`
- effects: `standing +2 · power +2 · REL mentor +1 · PRE nepotism +1`

**designIntent:** The nephew is *genuinely qualified* — stated twice. Nepotism's first step never requires hiring anyone unqualified. The precedent is what matters, and precedents don't check CVs.

**Strings**
- `card.act1_staff_hiring.text`
  - EN: Your aide flags one CV in the pile. "The committee vice-chair's nephew. Genuinely qualified — he'd top my shortlist even without the name. But the name is on it."
  - VI: Trợ lý đánh dấu một bộ hồ sơ trong chồng giấy. "Cháu của phó chủ nhiệm ủy ban. Năng lực thật sự — không có cái tên đó thì cậu ta vẫn đứng đầu danh sách của tôi. Nhưng cái tên thì vẫn nằm đó."
  - ES: Tu asistente marca un currículum de la pila. «El sobrino del vicepresidente del comité. Realmente calificado: encabezaría mi lista incluso sin el apellido. Pero el apellido está ahí.»
  - ZH: 助理从一摞简历里抽出一份。"委员会副主任的侄子。确实有能力——就算没这层关系，也是我名单上的第一名。可这层关系就摆在那里。"
- `card.act1_staff_hiring.left`
  - EN: Run open recruitment. · VI: Tuyển dụng công khai. · ES: Convocatoria abierta. · ZH: 公开招聘。
- `card.act1_staff_hiring.right`
  - EN: Hire the recommended candidate. · VI: Nhận người được gửi gắm. · ES: Contratar al recomendado. · ZH: 录用这位被推荐的人。

---

### CARD 014 — Local Infrastructure Request

`act1_local_project` · speaker: — (narration) · illustration: `{ "scene": "flooded_district" }`

**LEFT — Require the normal review.**
- preview: `power 0 · publicTrust "unknown"`
- effects: — (none)

**RIGHT — Fast-track it.**
- preview: `power +1 · publicTrust "up_uncertain"`
- effects: `power +3 · trustActual +4 · trustPerceived +3 · PRE administrative_override +1`

**designIntent:** **The most important card in Act I.** Bypassing procedure produces real, unambiguous good — dry homes, grateful residents, deserved trust. The mechanism that drains a flooded district is the same mechanism that will later bury an investigation. The game must never say this. The precedent counter says it.

**Strings**
- `card.act1_local_project.text`
  - EN: The district's drainage system has failed twice this month. Normal review takes a season the district doesn't have. Your committee seat can move it to the top of the queue — one signature, entirely within your authority.
  - VI: Hệ thống thoát nước của khu vực đã vỡ hai lần trong tháng. Quy trình thẩm định thông thường mất trọn một mùa — thứ mà khu dân cư này không có. Ghế ủy ban của bạn có thể đưa nó lên đầu danh sách: một chữ ký, hoàn toàn trong thẩm quyền của bạn.
  - ES: El sistema de drenaje del distrito ha fallado dos veces este mes. La revisión normal toma una temporada que el distrito no tiene. Tu puesto en el comité puede ponerlo al principio de la fila: una firma, totalmente dentro de tu autoridad.
  - ZH: 这个街区的排水系统本月已经瘫痪两次。正常审批要一个季度，而这个街区等不起。你在委员会的席位可以把它排到最前面——一个签名，完全在你的职权之内。
- `card.act1_local_project.left`
  - EN: Require the normal review. · VI: Yêu cầu thẩm định như thường lệ. · ES: Exigir la revisión normal. · ZH: 按正常流程审查。
- `card.act1_local_project.right`
  - EN: Fast-track it. · VI: Cho làm gấp. · ES: Acelerarlo. · ZH: 特事特办。

---

### CARD 015 — Mentor Requests Vote *(first cost lock of the game)*

`act1_mentor_vote_request` · speaker: `mentor` · illustration: `{ "scene": "office_mentor", "expression": "neutral" }` · minTurn (act): 4

**LEFT — Vote independently.**
- preview: `standing -1 · power -1 · publicTrust "unknown"`
- effects: `standing -3 · power -2 · REL mentor -2`
- **lock:**
```json
{
  "mode": "cost",
  "condition": {
    "type": "obligation",
    "creditor": "mentor",
    "status": "active",
    "minCount": 1
  },
  "unlockEffects": [
    { "type": "stat", "stat": "power", "add": -4 },
    { "type": "relationship", "character": "mentor", "add": -1 }
  ],
  "reason": { "source": "obligations", "maxFlashbacks": 1 }
}
```
  - Presentation when locked: `Vote independently — Power ↓↓` with a single flashback (card 007 right: *"Shall I?" — YOU SAID YES.*)
- EVT `event_committee_vote_refused` @ `{ "type": "turn_range", "min": 2, "max": 4 }`

**RIGHT — Support the candidate.**
- preview: `standing +1 · power +1 · publicTrust "unknown"`
- effects: `standing +3 · power +3 · REL mentor +1 · PRE loyalty_appointments +1`
- OBL~ resolve (creditor `mentor`, amount 1, resolution `"repaid"`)
- EVT `event_committee_vote_supported` @ `{ "type": "turn_range", "min": 2, "max": 4 }`

**designIntent:** The mechanical thesis in miniature: free refusal has already quietly expired if you took card 007. And the sting — the *only way to clear* the Mentor's debt is to do the thing he wants: you repay an obligation by acquiring a precedent. The ledger balances; the player doesn't. First cost-lock must land before turn ~10 so the Milestone-3 experience ("choice → advantage → obligation → later resistance") is proven inside Act I.

**Strings**
- `card.act1_mentor_vote_request.text`
  - EN: "The committee elects its secretary on Thursday," your mentor says. "Vote for my candidate. Reliable. Knows how things are done." A pause. "I don't ask often."
  - VI: "Thứ Năm này ủy ban bầu thư ký," người đỡ đầu nói. "Bỏ phiếu cho người của tôi. Đáng tin cậy. Hiểu cách mọi việc vận hành." Ông ngừng một nhịp. "Tôi không hay nhờ vả đâu."
  - ES: «El comité elige secretario el jueves», dice tu mentor. «Vota por mi candidato. Confiable. Sabe cómo se hacen las cosas.» Una pausa. «No pido favores a menudo.»
  - ZH: "委员会周四选秘书，"导师说。"投我的人。可靠，懂规矩。"他顿了顿。"我不常开口求人。"
- `card.act1_mentor_vote_request.left`
  - EN: Vote independently. · VI: Bỏ phiếu theo ý mình. · ES: Votar con independencia. · ZH: 按自己的判断投票。
- `card.act1_mentor_vote_request.right`
  - EN: Support the candidate. · VI: Ủng hộ ứng viên đó. · ES: Apoyar al candidato. · ZH: 支持这位人选。

---

### CARD 016 — Good Legislative Win

`act1_small_reform_success` · speaker: — (narration) · illustration: `{ "scene": "corridor_press" }` · minTurn (act): 5

**LEFT — Credit the committee.**
- preview: `standing +1 · publicTrust "up_uncertain"`
- effects: `standing +2 · trustActual +3 · trustPerceived +1`

**RIGHT — Take ownership of the win.**
- preview: `standing +2 · publicTrust "up_uncertain"` `[intended: ↑↑?]`
- effects: `standing +5 · trustPerceived +4 · trustActual +1 · FLG add flag_self_promotional_style`

**designIntent:** A palate-cleanser that still teaches the perception economy: claiming credit *works*, and Perceived Trust is the stat advisors will quote back later. `flag_self_promotional_style` modulates Act II media card wording.

**Strings**
- `card.act1_small_reform_success.text`
  - EN: Your amendment passes — small, procedural, genuinely useful. Complaint response deadlines are now binding. In the corridor, the cameras find you.
  - VI: Tu chính án của bạn được thông qua — nhỏ, thuần thủ tục, nhưng hữu ích thật sự. Thời hạn phản hồi khiếu nại giờ đây là bắt buộc. Ngoài hành lang, ống kính tìm đến bạn.
  - ES: Tu enmienda se aprueba: pequeña, procedimental, genuinamente útil. Los plazos de respuesta a denuncias ahora son vinculantes. En el pasillo, las cámaras te encuentran.
  - ZH: 你的修正案通过了——很小，纯程序性，却实实在在有用。申诉答复期限从此具有约束力。走廊里，镜头找到了你。
- `card.act1_small_reform_success.left`
  - EN: Credit the committee. · VI: Nhường công cho ủy ban. · ES: Dar el crédito al comité. · ZH: 把功劳归给委员会。
- `card.act1_small_reform_success.right`
  - EN: Take ownership of the win. · VI: Nhận chiến công về mình. · ES: Adjudicarte la victoria. · ZH: 把胜利归于自己。

---

### CARD 017 — Business Dinner

`act1_business_dinner` · speaker: `businessman` · illustration: `{ "scene": "restaurant_private_room", "expression": "friendly" }`
**Conditions:** `{ "type": "relationship", "character": "businessman", "op": ">=", "value": 1 }`

**LEFT — Pay your own share.**
- preview: `money -1 · publicTrust "unknown"`
- effects: `money -600`

**RIGHT — Let him host.**
- preview: `money 0 · standing +1 · publicTrust "unknown"`
- effects: `standing +2 · REL businessman +1`
- OBL+ `obligation_businessman_hospitality_01` (creditor `businessman`, w 1, tags `business, hospitality`)

**designIntent:** The cheapest obligation in the game — weight 1, attached to a dinner. Teaches that obligations attach to *comfort*, not just contracts. Also the run's first meaningful money interaction: paying your own way should feel slightly, memorably annoying ($600 against $50,000 — the pain is symbolic and that's the lesson).

**Strings**
- `card.act1_business_dinner.text`
  - EN: A private room above the city. The businessman orders without opening the menu. Toward the end of the evening, the waiter hovers with the bill, uncertain where to set it down.
  - VI: Một phòng riêng trên tầng cao nhìn xuống thành phố. Vị doanh nhân gọi món mà không cần mở thực đơn. Gần cuối bữa, người phục vụ cầm hoá đơn đứng lưỡng lự, không biết nên đặt xuống phía bên nào.
  - ES: Un salón privado con vista a la ciudad. El empresario ordena sin abrir el menú. Hacia el final de la velada, el mesero duda con la cuenta en la mano, sin saber dónde dejarla.
  - ZH: 俯瞰全城的私人包间。商人点菜时连菜单都没翻开。晚宴将尽，服务生拿着账单犹豫着，不知道该放在哪一边。
- `card.act1_business_dinner.left`
  - EN: Pay your own share. · VI: Tự trả phần mình. · ES: Pagar tu parte. · ZH: 自己付自己那份。
- `card.act1_business_dinner.right`
  - EN: Let him host. · VI: Để ông ấy mời. · ES: Dejar que él invite. · ZH: 让他做东。

---

### CARD 018 — First Rumor

`act1_minor_rumor` · speaker: `aide` · illustration: `{ "scene": "office_phone", "expression": "concerned" }` · minTurn (act): 5

**LEFT — Ignore it.**
- preview: `publicTrust "down_uncertain"`
- effects: `trustActual -2`

**RIGHT — Ask the Editor for clarifying coverage.**
- preview: `standing +1 · publicTrust "up_uncertain"`
- effects: `standing +2 · trustPerceived +3 · trustActual -1 · REL editor +1 · PRE media_management +1`

**designIntent:** First divergence where "fixing" trust *lowers* actual trust: managed coverage reads as managed. The aide's "wrong on the details — mostly" is written to sting precisely when the rumor is half-true (player took 007 right) while remaining innocuous otherwise — one line, two readings, zero conditional text.

**Strings**
- `card.act1_minor_rumor.text`
  - EN: "It's small," your aide says, phone in hand. "A forum thread claims your committee seat was arranged. Two hundred comments so far. It's wrong on the details — mostly."
  - VI: "Chuyện nhỏ thôi," trợ lý nói, tay cầm điện thoại. "Một chủ đề trên diễn đàn nói ghế ủy ban của sếp là được sắp xếp trước. Đã hai trăm bình luận rồi. Họ sai về chi tiết — phần lớn là sai."
  - ES: «Es algo menor», dice tu asistente, teléfono en mano. «Un hilo en un foro afirma que tu puesto en el comité fue arreglado. Doscientos comentarios hasta ahora. Se equivoca en los detalles… en su mayoría.»
  - ZH: "小事一桩，"助理拿着手机说。"论坛上有个帖子，说您的委员会席位是安排好的。目前已有两百条评论。细节上说错了——大部分说错了。"
- `card.act1_minor_rumor.left`
  - EN: Ignore it. · VI: Kệ nó. · ES: Ignorarlo. · ZH: 不理会。
- `card.act1_minor_rumor.right`
  - EN: Ask the Editor for clarifying coverage. · VI: Nhờ Tổng biên tập đăng bài nói lại cho rõ. · ES: Pedir al Editor una cobertura aclaratoria. · ZH: 请总编发篇澄清报道。

---

### CARD 019a — The Candidate Wins (supported) *(consequence — event-resolved only)*

`act1_committee_result_supported` · speaker: `aide` · illustration: `{ "scene": "office_phone", "expression": "neutral" }`
**Reached by:** `event_committee_vote_supported` (scheduled by 015 right). Never pooled.
**Conditions:** `{ "type": "history", "cardId": "act1_mentor_vote_request", "choice": "right", "exists": true }`

**LEFT — "Good. Move our items up."**
- preview: `power +1 · publicTrust "unknown"`
- effects: `power +3 · REL mentor +1 · FLG add flag_loyal_committee_member`

**RIGHT — Keep a polite distance.**
- preview: `power 0 · publicTrust "unknown"`
- effects: `FLG add flag_loyal_committee_member`

**designIntent:** The loyalty machine pays out immediately and asks nothing. Both choices set the world-state flag (the secretary exists either way); only Left *uses* him — a small distinction the Aftermath remembers.

**Strings**
- `card.act1_committee_result_supported.text`
  - EN: "The vote went through," your aide reports. "Your mentor's candidate is committee secretary now. He asked me to pass along that the agenda office will always find room for your items."
  - VI: "Cuộc bỏ phiếu xong rồi," trợ lý báo. "Người của ông đỡ đầu giờ là thư ký ủy ban. Ông ấy nhờ tôi nhắn lại: văn phòng nghị trình lúc nào cũng sắp xếp được chỗ cho các đề mục của sếp."
  - ES: «La votación salió», informa tu asistente. «El candidato de tu mentor ya es secretario del comité. Me pidió transmitirte que la oficina de agenda siempre encontrará espacio para tus asuntos.»
  - ZH: "表决通过了，"助理汇报。"导师的人选现在是委员会秘书。他托我带话：议程办公室永远能给您的议题腾出位置。"
- `card.act1_committee_result_supported.left`
  - EN: "Good. Move our items up." · VI: "Tốt. Đẩy các đề mục của ta lên." · ES: «Bien. Adelanta nuestros asuntos.» · ZH: "很好，把我们的议题往前排。"
- `card.act1_committee_result_supported.right`
  - EN: Keep a polite distance. · VI: Giữ khoảng cách lịch sự. · ES: Mantener una distancia cortés. · ZH: 保持礼貌的距离。

---

### CARD 019b — The Candidate Wins Anyway (refused) *(consequence — event-resolved only)*

`act1_committee_result_refused` · speaker: `aide` · illustration: `{ "scene": "office_phone", "expression": "concerned" }`
**Reached by:** `event_committee_vote_refused` (scheduled by 015 left). Never pooled.
**Conditions:** `{ "type": "history", "cardId": "act1_mentor_vote_request", "choice": "left", "exists": true }`

**LEFT — File a formal objection.**
- preview: `standing -1 · publicTrust "up_uncertain"`
- effects: `standing -1 · trustActual +1`

**RIGHT — Let it go.**
- preview: `publicTrust "unknown"`
- effects: — (none)

**designIntent:** Independence rendered as friction, not catastrophe: your items just… wait. The machine doesn't punish; it deprioritizes. Neither choice fixes it — the point is that the vote you didn't cast still governs your Thursday.

**Strings**
- `card.act1_committee_result_refused.text`
  - EN: "The vote went through anyway," your aide says. "Without you. The new secretary read the agenda this morning — your two items moved from Thursday to 'pending review.'"
  - VI: "Cuộc bỏ phiếu vẫn xong," trợ lý nói. "Không cần đến phiếu của sếp. Sáng nay tân thư ký rà lại nghị trình — hai đề mục của sếp bị chuyển từ thứ Năm sang diện 'chờ xem xét.'"
  - ES: «La votación salió de todos modos», dice tu asistente. «Sin ti. El nuevo secretario revisó la agenda esta mañana: tus dos asuntos pasaron del jueves a "pendiente de revisión".»
  - ZH: "表决还是通过了，"助理说。"没有您的票。新秘书今早重排了议程——您的两个议题从周四被挪进了'待审议'。"
- `card.act1_committee_result_refused.left`
  - EN: File a formal objection. · VI: Gửi kiến nghị chính thức. · ES: Presentar una objeción formal. · ZH: 提交正式异议。
- `card.act1_committee_result_refused.right`
  - EN: Let it go. · VI: Cho qua. · ES: Dejarlo pasar. · ZH: 算了。

---

### CARD 020 — Reformist Warning

`act1_reformist_warning` · speaker: `reformist` · illustration: `{ "scene": "corridor_walk", "expression": "concerned" }` · weight: 6 · minTurn (act): 6
**Conditions:**
```json
{
  "any": [
    { "type": "precedent", "precedent": "precedent_special_treatment",       "op": ">=", "value": 1 },
    { "type": "precedent", "precedent": "precedent_nepotism",                "op": ">=", "value": 1 },
    { "type": "precedent", "precedent": "precedent_administrative_override", "op": ">=", "value": 1 },
    { "type": "precedent", "precedent": "precedent_media_management",        "op": ">=", "value": 1 }
  ]
}
```

**LEFT — Acknowledge the concern.**
- preview: `publicTrust "unknown"`
- effects: `REL reformist +1`

**RIGHT — Defend practical politics.**
- preview: `standing +1 · publicTrust "unknown"`
- effects: `standing +2 · REL reformist -1`

**designIntent:** The single permitted moment of near-commentary in Act I, delivered as a character's opinion, conditional on the player having actually earned it, and mechanically toothless — no stat punishes ignoring her. If the player's precedent counters are all zero, this card never appears: clean runs get no sermon.

**Strings**
- `card.act1_reformist_warning.text`
  - EN: The Reformist falls into step beside you. "You get things done. I've noticed — everyone has. Efficiency is useful. It also becomes a habit very quickly, and habits get inherited by people worse than you."
  - VI: Nhà Cải Cách sải bước song song với bạn. "Anh làm được việc. Tôi để ý rồi — mà ai cũng để ý cả. Sự hiệu quả rất hữu ích. Nhưng nó cũng thành thói quen rất nhanh, và thói quen thì sẽ được kế thừa bởi những kẻ tệ hơn anh."
  - ES: La Reformista se pone a caminar a tu lado. «Consigues resultados. Lo he notado — todos lo han notado. La eficiencia es útil. También se vuelve hábito muy rápido, y los hábitos los heredan personas peores que tú.»
  - ZH: 改革派与你并肩而行。"你办事很有效率。我注意到了——所有人都注意到了。效率很有用，但它也会很快变成习惯，而习惯，会被比你更糟的人继承下去。"
- `card.act1_reformist_warning.left`
  - EN: Acknowledge the concern. · VI: Ghi nhận lời nhắc. · ES: Reconocer la preocupación. · ZH: 接受这份提醒。
- `card.act1_reformist_warning.right`
  - EN: Defend practical politics. · VI: Bảo vệ lối làm chính trị thực dụng. · ES: Defender la política práctica. · ZH: 为务实政治辩护。

---

### CARD 021 — First Promotion *(beat, act finale)*

`act1_first_promotion` · speaker: — (narration) · illustration: `{ "scene": "office_phone_call" }` · beat: `beat_act1_promotion`
**Routing:** `next` (both choices): `{ "type": "act", "act": "network" }`

**LEFT — Accept.**
- preview: `standing +2 · power +2 · publicTrust "unknown"`
- effects (base — clean route): `standing +6 · power +6`
- **ChoiceVariant v1** (network route) — condition:
```json
{ "type": "history", "cardId": "act1_committee_opportunity", "choice": "right", "exists": true }
```
  - variant effects (**replace** base — engine rule: a matched variant's `effects` fully replace the default `effects`):
    `standing +6 · power +6 · REL mentor +1`
    OBL+ `obligation_mentor_promotion_01` (creditor `mentor`, w 2, tags `promotion, inner_circle`)
  - No variant text override: the promotion reads identically either way. **The player cannot see which version they received.** That is the design: at the moment of accepting, a clean promotion and a bought one feel exactly the same. Only the Gathering's flashback will disclose which one it was.

**RIGHT — Decline, for now.**
- preview: `standing -1 · publicTrust "up_uncertain"`
- effects: `standing -3 · trustActual +3 · trustPerceived +1 · FLG add flag_declined_first_promotion`

**designIntent:** Act I closes on the run's largest stat jump, sourced ambiguously on purpose ("the unofficial version depends on who is telling it"). The variant obligation is weight 2 — the heaviest debt so far — attached to the most flattering moment so far. Declining is rare but must stay viable (Standing −3, not a death sentence) and is remembered by Act II wording.

**Strings**
- `card.act1_first_promotion.text`
  - EN: The call comes on a Tuesday: deputy chair of the committee. The official letter cites your legislative record. The unofficial version depends on who is telling it.
  - VI: Cuộc gọi đến vào một sáng thứ Ba: phó chủ nhiệm ủy ban. Văn bản chính thức viện dẫn thành tích lập pháp của bạn. Còn phiên bản không chính thức thì tuỳ vào người kể.
  - ES: La llamada llega un martes: vicepresidencia del comité. La carta oficial cita tu historial legislativo. La versión extraoficial depende de quién la cuente.
  - ZH: 电话在一个周二打来：委员会副主任。正式函件列举了你的立法成绩。至于非正式的版本，就要看是谁在讲了。
- `card.act1_first_promotion.left`
  - EN: Accept. · VI: Nhận. · ES: Aceptar. · ZH: 接受。
- `card.act1_first_promotion.right`
  - EN: Decline, for now. · VI: Khoan đã, để sau. · ES: Declinar, por ahora. · ZH: 暂缓，以后再说。

---

## 5. Full JSON Transcription Example — Card 015

Reference conversion so the whole pack can be transcribed unambiguously. Note `text` fields hold localization keys per §1.1.

```json
{
  "id": "act1_mentor_vote_request",
  "act": "rise",
  "type": "contextual",
  "speaker": "mentor",
  "text": "card.act1_mentor_vote_request.text",
  "illustration": { "scene": "office_mentor", "expression": "neutral" },
  "minTurn": 4,
  "once": true,
  "weight": 10,
  "tags": ["mentor", "loyalty", "chain_a"],

  "left": {
    "text": "card.act1_mentor_vote_request.left",
    "preview": { "standing": -1, "power": -1, "publicTrust": "unknown" },
    "effects": [
      { "type": "stat", "stat": "standing", "add": -3 },
      { "type": "stat", "stat": "power", "add": -2 },
      { "type": "relationship", "character": "mentor", "add": -2 }
    ],
    "lock": {
      "mode": "cost",
      "condition": { "type": "obligation", "creditor": "mentor", "status": "active", "minCount": 1 },
      "unlockEffects": [
        { "type": "stat", "stat": "power", "add": -4 },
        { "type": "relationship", "character": "mentor", "add": -1 }
      ],
      "reason": { "source": "obligations", "maxFlashbacks": 1 }
    },
    "delayedEffects": [
      { "delay": { "type": "turn_range", "min": 2, "max": 4 }, "eventId": "event_committee_vote_refused", "onConditionFail": "discard" }
    ]
  },

  "right": {
    "text": "card.act1_mentor_vote_request.right",
    "preview": { "standing": 1, "power": 1, "publicTrust": "unknown" },
    "effects": [
      { "type": "stat", "stat": "standing", "add": 3 },
      { "type": "stat", "stat": "power", "add": 3 },
      { "type": "relationship", "character": "mentor", "add": 1 },
      { "type": "precedent", "precedent": "precedent_loyalty_appointments", "add": 1 },
      { "type": "obligation_resolve", "creditor": "mentor", "amount": 1, "resolution": "repaid" }
    ],
    "delayedEffects": [
      { "delay": { "type": "turn_range", "min": 2, "max": 4 }, "eventId": "event_committee_vote_supported", "onConditionFail": "discard" }
    ]
  },

  "metadata": {
    "designIntent": "First cost lock. Repaying the Mentor's debt requires acquiring precedent_loyalty_appointments: the ledger balances, the player doesn't.",
    "expectedDurationSeconds": 25
  }
}
```

---

## 6. QA / Simulation Checklist for This Pack

1. **Chain A proof (Milestone 3):** run `Always Right` bot — by card 015 the cost lock must fire with flashback source `act1_committee_opportunity:right`; by 021 the player must hold 2 mentor obligations totalling weight ≥ 2 (committee repaid at 015, promotion w2 added at 021).
2. **Clean run proof:** run `Avoid Obligations` bot — card 015 left must be free (no lock), card 020 must never appear if all four precedents are 0, and 021 left must apply the **base** effects (no obligation).
3. **Event integrity:** `event_permit_favor_callback` remains `pending` through Act I and resolves only in `network` — validator must accept the forward reference to `act2_protected_investment` once the Act II pack lands, and flag it until then.
4. **Localization:** every key in §3–4 present in all four language files; `vi` register table (§2.7) spot-checked; `zh-Hans` strings contain no half-width quote mismatches.
5. **Balance envelope:** 1,000 random-bot runs should land end-of-Act-I medians inside §1.4 ranges; flag if trustPerceived − trustActual median gap falls outside 2–8 (the gap is the story).
6. **Ambient exclusivity (card 008b):** in any single run, `act1_businessman_glimpse` and `act1_business_permit` must be mutually exclusive (their conditions are logical complements over `flag_direct_business_contact`). Simulation must confirm no run shows both, and no run where Chain C is closed ever creates a `businessman` relationship value ≠ 0 or any businessman obligation.

---

*End of pack. Act II (Network) authoring should begin from the forward references declared here: `event_permit_favor_callback → act2_protected_investment`, plus the flags `flag_ambitious_public_image`, `flag_self_promotional_style`, `flag_declined_first_promotion`, and `flag_early_case_public`, all of which Act II media/consequence cards are expected to consume. Act II should also carry one more Businessman ambient beat for closed-Chain-C runs (suggested: `act2_businessman_headline` — his company wins a major contract in a news card; still no interaction), so the closed network stays visible right up to the Gathering, where he will be at the table either way.*
