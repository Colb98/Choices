# Card Authoring Pack — Final Gathering

**Version:** 1.0 · **Cards:** 9 authored (6–7 seen per run) · **Source of truth language:** English
**Depends on:** Act 0+I v1.1, Act II v1.0, Act III v1.0 (inner_circle ledger, flashback priority list)
**Supported languages:** `en`, `vi`, `es`, `zh-Hans`

Slots 059–065 of the *Master Narrative Table*. Splits: slot 063 → two history variants; slot 065 → sober/intoxicated variants. This pack contains the game's first **hard lock** (card 064) and the traceable-cause setup for the transport card (planted in 059).

**Gathering theme:** the separate relationships were never separate. This is the room where the ledger gets read aloud, disguised as toasts.

---

## 1. Structural Decisions

### 1.1 Beat-sequenced, not next-chained (ROUTING-NOTE-01)

The spec (§45) says the Final Gathering should use explicit routing. This pack implements that with **condition-aware beats** rather than `next` directives, because two slots (061, 063, 065) resolve to different cards depending on state, and `NextDirective` is unconditional. `StoryBeatDefinition` supports both conditions and act-turn windows, so the sequence is expressed as an ordered beat ladder — still fully deterministic, still explicit, and validator-checkable:

```json
{ "id": "beat_g_arrival",    "act": "gathering", "cardId": "gathering_arrival",            "earliestActTurn": 1, "latestActTurn": 1, "priority": 100, "once": true }
{ "id": "beat_g_project",    "act": "gathering", "cardId": "gathering_strategic_project",  "earliestActTurn": 2, "latestActTurn": 2, "priority": 100, "once": true }
{ "id": "beat_g_conflict",   "act": "gathering", "cardId": "gathering_investment_conflict","earliestActTurn": 3, "latestActTurn": 3, "priority": 100, "once": true,
  "conditions": { "type": "flag", "flag": "flag_invested_protected_company", "exists": true } }
{ "id": "beat_g_promise",    "act": "gathering", "cardId": "gathering_future_support",     "earliestActTurn": 3, "latestActTurn": 4, "priority": 90,  "once": true }
{ "id": "beat_g_toast_light","act": "gathering", "cardId": "gathering_editor_toast_light", "earliestActTurn": 4, "latestActTurn": 5, "priority": 80,  "once": true,
  "conditions": { "all": [
    { "type": "precedent", "precedent": "precedent_media_suppression",  "op": "==", "value": 0 },
    { "type": "precedent", "precedent": "precedent_media_interference", "op": "==", "value": 0 } ] } }
{ "id": "beat_g_toast_heavy","act": "gathering", "cardId": "gathering_editor_toast_heavy", "earliestActTurn": 4, "latestActTurn": 5, "priority": 80,  "once": true,
  "conditions": { "any": [
    { "type": "precedent", "precedent": "precedent_media_suppression",  "op": ">=", "value": 1 },
    { "type": "precedent", "precedent": "precedent_media_interference", "op": ">=", "value": 1 } ] } }
{ "id": "beat_g_drink",      "act": "gathering", "cardId": "gathering_drink",              "earliestActTurn": 5, "latestActTurn": 6, "priority": 100, "once": true }
{ "id": "beat_g_transport_sober", "act": "gathering", "cardId": "gathering_transport_sober", "earliestActTurn": 6, "latestActTurn": 7, "priority": 100, "once": true,
  "conditions": { "not": { "type": "flag", "flag": "flag_drank_at_gathering", "exists": true } } }
{ "id": "beat_g_transport_drunk", "act": "gathering", "cardId": "gathering_transport_drunk", "earliestActTurn": 6, "latestActTurn": 7, "priority": 100, "once": true,
  "conditions": { "type": "flag", "flag": "flag_drank_at_gathering", "exists": true } }
```

Non-invested runs skip beat_g_conflict; the ladder compresses by one turn (windows overlap by design). Validator: exactly one toast beat and exactly one transport beat may be satisfiable per run.

### 1.2 Route resolution (no engine change required)

Per spec §8: `intoxicated AND self_driving → PLAYER_CAUSED, else ALLY_CAUSED`. Both inputs are ordinary flags set in this pack (`flag_drank_at_gathering`, `flag_self_driving`), so the Incident pack's entry beats gate directly on:

```json
PLAYER_CAUSED := { "all": [
  { "type": "flag", "flag": "flag_drank_at_gathering", "exists": true },
  { "type": "flag", "flag": "flag_self_driving",       "exists": true } ] }
ALLY_CAUSED   := { "not": PLAYER_CAUSED }
```

The engine *may* cache a derived route flag at act transition for ending-analysis convenience, but nothing in the data requires it.

### 1.3 Three-state choices via ordered variants (VARIANT-ORDER-RULE)

Cards 060 and 064 need FREE / COSTLY / LOCKED states on one choice. Implemented as `ChoiceVariant`s that override `lock`, with a new engine rule this pack formalizes: **variants are evaluated top-to-bottom; the first matching variant applies; no match = base definition.** Author the most-captured state first. The validator should warn if a later variant's condition is a superset of an earlier one (unreachable variant).

### 1.4 New flags

```text
flag_dismissed_driver       Player sent their driver home on arrival.
flag_drank_at_gathering     Player consumed alcohol at the gathering.
flag_self_driving           Player chose to drive themself home.
flag_safe_transport         Player used a driver/official car home.
flag_divested_at_gathering  Player divested the stake during the gathering.
```

### 1.5 New obligation

| id | creditor | w | tags | source |
|---|---|---|---|---|
| `obligation_future_support_01` | minister | 2 | `political, promise, inner_circle` | 062 right |

### 1.6 Balance note

**BALANCE-REVIEW-02 (price of the costly refusal, card 064):** the table's card 064 State B implies a large-band cost (`P ↓↓↓ S ↓` ≈ −8), but the table's Ideal Middle Run (§28) narrates Power 72 → 39, a −33 swing. This pack ships **−15 Power, −3 Standing** as the unlock price — well beyond normal bands, deliberately, because this is the game's climactic voluntary sacrifice and it must *hurt visibly on the HUD*. Tune via simulation with one constraint: the middle-run player who pays it must still reach Break the Chain (Ending G tolerates — in fact expects — collapsed Power).

---

## 2. Cards

All cards: `act: "gathering"`, `type: "story"`, `once: true`, never pooled (beat-resolved only), `next: { "type": "scheduler" }` (the beat ladder does the routing) except 065a/b which exit the act.

---

### CARD 059 — Arrival

`gathering_arrival` · speaker: — (narration) · illustration: `{ "scene": "villa_interior_evening" }`

**LEFT — Keep the driver waiting.**
- preview: `publicTrust "unknown"`
- effects: — (none)

**RIGHT — Send the driver home. Everything is arranged.**
- preview: `publicTrust "unknown"`
- effects: `FLG add flag_dismissed_driver`

**designIntent:** The table calls this slot "no meaningful choice." This pack disagrees by exactly one flag: the driver micro-choice *feels* like flavor — it echoes the invitation's "Bring nothing. Everything is arranged" — and it is the traceable cause the transport card (065b) will need. The spec forbids arbitrary locks; this is where the non-arbitrary one is planted, in plain sight, at the moment the player is busiest looking at the room.

**Strings**
- `card.gathering_arrival.text`
  - EN: The house is on no map you could name. Inside, every thread of your career sits in one room: the Mentor by the window, the Businessman mid-story, the Editor laughing at it, the Minister pouring. Separately, they were relationships. Together, they are a network — and you are standing in it. At the door, your driver asks about the evening.
  - VI: Ngôi nhà không nằm trên bất kỳ tấm bản đồ nào bạn gọi tên được. Bên trong, mọi sợi dây trong sự nghiệp của bạn đang ngồi chung một căn phòng: Người Đỡ Đầu bên cửa sổ, Doanh Nhân đang kể dở một câu chuyện, Tổng Biên Tập cười phụ hoạ, Bộ Trưởng đang rót rượu. Tách riêng ra, họ là những mối quan hệ. Gộp lại, họ là một mạng lưới — và bạn đang đứng giữa nó. Ngoài cửa, tài xế hỏi bạn về kế hoạch tối nay.
  - ES: La casa no está en ningún mapa que puedas nombrar. Adentro, cada hilo de tu carrera está en una sola habitación: el Mentor junto a la ventana, el Empresario a mitad de una anécdota, el Editor riéndose de ella, el Ministro sirviendo. Por separado, eran relaciones. Juntos, son una red — y tú estás parado dentro de ella. En la puerta, tu chofer pregunta por la noche.
  - ZH: 这栋房子不在任何一张你叫得出名字的地图上。屋里，你职业生涯的每一条线都坐在同一个房间：导师在窗边，商人正讲到故事一半，总编在为它发笑，部长在斟酒。分开看，他们是一段段关系。合在一起，他们是一张网——而你正站在网中央。门口，司机在问今晚的安排。
- `card.gathering_arrival.left`
  - EN: Keep the driver waiting. · VI: Bảo tài xế chờ. · ES: Que el chofer espere. · ZH: 让司机等着。
- `card.gathering_arrival.right`
  - EN: Send the driver home. Everything is arranged. · VI: Cho tài xế về. Mọi thứ đã được sắp đặt cả rồi. · ES: Manda al chofer a casa. Todo está arreglado. · ZH: 让司机回去吧。一切都已安排好。

---

### CARD 060 — The Corridor Decree

`gathering_strategic_project` · speaker: `minister` · illustration: `{ "scene": "villa_map_table", "expression": "friendly" }`

**LEFT — "It goes to open tender."**
- preview: `standing -1 · power -1 · publicTrust "unknown"`
- effects (when selectable): `standing -3 · power -3 · REL minister -1 · REL businessman -2`
- **ChoiceVariant v1 (LOCKED)** — condition:
```json
{ "all": [
  { "type": "obligation", "tag": "inner_circle", "status": "active", "minCount": 4 },
  { "type": "obligation", "creditor": "businessman", "status": "active", "minWeight": 3 } ] }
```
  lock override: `{ "mode": "hard", "condition": <same as variant condition>, "reason": { "source": "obligations", "maxFlashbacks": 3 } }`
- **ChoiceVariant v2 (COSTLY)** — condition: `{ "type": "obligation", "tag": "inner_circle", "status": "active", "minCount": 2 }`
  lock override: `{ "mode": "cost", "condition": <same>, "unlockEffects": [ { "type": "stat", "stat": "power", "add": -6 }, { "type": "relationship", "character": "businessman", "add": -2 } ], "reason": { "source": "obligations", "maxFlashbacks": 2 } }`

**RIGHT — Grant the exemption.**
- preview: `standing +1 · power +2 · money 0 · publicTrust "unknown"`
- effects (base): `standing +2 · power +5 · PRE protected_business +1`
- **ChoiceVariant v1** — condition `flag_invested_protected_company` — effects (**replace**): `standing +2 · power +5 · money +150000 · PRE protected_business +1 · PRE conflict_of_interest +1`

**designIntent:** The first choice in the game that can be *hard-locked* — one card before the drink, so the player who has never seen resistance meets it here first, on money, where it reads as politics rather than fate. The flashbacks warm up the mechanic; 064 lands it.

**Strings**
- `card.gathering_strategic_project.text`
  - EN: "The corridor's final phase," the Minister says, and the Businessman spreads the map without being asked — they have clearly discussed this before you arrived. "One decree. Strategic exemption, single contractor, ground broken by spring. Or we let a tender introduce us all to strangers."
  - VI: "Giai đoạn cuối của dự án hành lang," Bộ trưởng nói, và vị Doanh nhân trải tấm bản đồ ra mà chẳng cần ai yêu cầu — rõ ràng họ đã bàn chuyện này trước khi bạn đến. "Một nghị định thôi. Cơ chế đặc thù, một nhà thầu duy nhất, khởi công trước mùa xuân. Hoặc là để một cuộc đấu thầu giới thiệu tất cả chúng ta với những kẻ xa lạ."
  - ES: «La fase final del corredor», dice el Ministro, y el Empresario despliega el mapa sin que nadie se lo pida — claramente lo discutieron antes de que llegaras. «Un decreto. Exención estratégica, un solo contratista, obras antes de primavera. O dejamos que una licitación nos presente a todos a desconocidos.»
  - ZH: "走廊项目的最后一期，"部长说。商人不等任何人开口就把地图铺开了——显然，在你到之前他们已经谈过了。"一纸政令。战略豁免，单一承包商，开春动工。要不然，就让招标把我们大家介绍给一群陌生人。"
- `card.gathering_strategic_project.left`
  - EN: "It goes to open tender." · VI: "Phải đưa ra đấu thầu công khai." · ES: «Va a licitación abierta.» · ZH: "必须公开招标。"
- `card.gathering_strategic_project.right`
  - EN: Grant the exemption. · VI: Duyệt cơ chế đặc thù. · ES: Conceder la exención. · ZH: 批准豁免。

---

### CARD 061 — The Reminder *(invested runs only)*

`gathering_investment_conflict` · speaker: — (narration) · illustration: `{ "scene": "villa_phone_glow" }`

**LEFT — "Divest. Tonight."**
- preview: `money -3 · standing -1 · publicTrust "unknown"`
- effects (base): `money -300000 · standing -2 · REL businessman -2 · FLG add flag_divested_at_gathering`
- OBL~ resolve (creditor `businessman`, tag `investment`, resolution `"betrayed"`)
- **ChoiceVariant v1** — condition `flag_divestment_started` — text override → `card.gathering_investment_conflict.left.v1`; effects (**replace**): `money -100000 · standing -1 · REL businessman -1 · FLG add flag_divested_at_gathering` + same OBL~ resolve

**RIGHT — Keep the position.**
- preview: `standing +1 · publicTrust "unknown"`
- effects: `standing +2 · PRE conflict_of_interest +1`

**designIntent:** The table's "divest now costs millions" beat, priced: a panic exit at the table costs $300k and *betrays* an obligation — the only place in the game where the player can burn an inner_circle debt on purpose, buying back one unit of freedom at maximum price, one card before the drink lock counts debts. Players who started divesting in Act III (054 left) exit for $100k — the game quietly rewards having begun leaving early. The aide's message arriving *here*, in this room, is the aide's list from card 045 doing its job.

**Strings**
- `card.gathering_investment_conflict.text`
  - EN: The map is still on the table when your aide's message arrives: no greeting, just dates and figures — your stake sits precisely inside the corridor's second phase. Nobody in this room needs the reminder. That is exactly why it was sent.
  - VI: Tấm bản đồ vẫn còn trên bàn thì tin nhắn của trợ lý đến: không chào hỏi, chỉ có ngày tháng và những con số — cổ phần của bạn nằm gọn ghẽ ngay trong giai đoạn hai của dự án hành lang. Không một ai trong căn phòng này cần được nhắc. Chính vì thế mà tin nhắn ấy được gửi.
  - ES: El mapa sigue sobre la mesa cuando llega el mensaje de tu asistente: sin saludo, solo fechas y cifras — tu participación cae exactamente dentro de la segunda fase del corredor. Nadie en esta habitación necesita el recordatorio. Exactamente por eso fue enviado.
  - ZH: 地图还摊在桌上，助理的消息就到了：没有问候，只有日期和数字——你的股份恰好落在走廊项目的二期范围之内。这个房间里没有任何人需要这个提醒。而这正是它被发来的原因。
- `card.gathering_investment_conflict.left`
  - EN: "Divest. Tonight." · VI: "Thoái vốn. Ngay tối nay." · ES: «Desinvertir. Esta noche.» · ZH: "退出。就今晚。"
- `card.gathering_investment_conflict.left.v1`
  - EN: Complete the divestment tonight. · VI: Hoàn tất thoái vốn ngay tối nay. · ES: Completar la desinversión esta noche. · ZH: 今晚完成全部退出。
- `card.gathering_investment_conflict.right`
  - EN: Keep the position. · VI: Giữ nguyên vị thế. · ES: Mantener la posición. · ZH: 继续持有。

---

### CARD 062 — The Spring Vote

`gathering_future_support` · speaker: `minister` · illustration: `{ "scene": "villa_balcony", "expression": "neutral" }`

**LEFT — "I don't make promises this early."**
- preview: `standing -1 · publicTrust "unknown"`
- effects: `standing -2 · REL minister -1`

**RIGHT — "You have my support."**
- preview: `standing +1 · power +1 · publicTrust "unknown"`
- effects: `standing +2 · power +2 · REL minister +1`
- OBL+ `obligation_future_support_01` (creditor `minister`, w 2, tags `political, promise, inner_circle`)

**designIntent:** The last acquirable obligation in the game, and the purest: it costs nothing, delivers nothing, and exists entirely in the future tense. A player at 2 inner_circle obligations who says yes here crosses to 3 — arming the drink lock *minutes before the drink*, with a sentence that felt like manners. The balcony staging is deliberate: away from the table, no witnesses, nothing signed. The lock will remember anyway.

**Strings**
- `card.gathering_future_support.text`
  - EN: "Next spring the council seat opens," the Minister says quietly — just the two of you at the balcony rail. "I will put a name forward. When I do, I would like to already know how you'll vote."
  - VI: "Mùa xuân tới, ghế hội đồng sẽ trống," Bộ trưởng nói khẽ — chỉ có hai người bên lan can ban công. "Tôi sẽ đề cử một cái tên. Và khi tôi làm vậy, tôi muốn mình đã biết trước cậu sẽ bỏ phiếu thế nào."
  - ES: «La próxima primavera se abre el puesto del consejo», dice el Ministro en voz baja — solo ustedes dos junto a la baranda del balcón. «Voy a proponer un nombre. Cuando lo haga, me gustaría saber de antemano cómo vas a votar.»
  - ZH: "明年春天，理事会的席位会空出来，"部长轻声说——阳台栏杆边只有你们两个人。"我会提一个名字。而当我提出的时候，我希望自己已经知道，你会怎么投。"
- `card.gathering_future_support.left`
  - EN: "I don't make promises this early." · VI: "Tôi không hứa sớm như vậy." · ES: «No hago promesas tan pronto.» · ZH: "我不这么早许诺。"
- `card.gathering_future_support.right`
  - EN: "You have my support." · VI: "Ngài có phiếu của tôi." · ES: «Cuentas con mi apoyo.» · ZH: "我支持您。"

---

### CARDS 063a/b — The Toast *(history variants; exactly one fires)*

Both: speaker: `editor` · illustration: `{ "scene": "villa_dinner_table", "expression": "friendly" }`.

#### 063a — `gathering_editor_toast_light` *(no suppression, no interference)*

**LEFT — Raise your glass.**
- preview: `publicTrust "unknown"` · effects: `REL editor +1`

**RIGHT — A polite nod.**
- preview: `publicTrust "unknown"` · effects: — (none)

#### 063b — `gathering_editor_toast_heavy` *(any suppression or interference)*

**LEFT — Laugh along.**
- preview: `publicTrust "unknown"` · effects: `REL editor +1`

**RIGHT — Change the subject.**
- preview: `publicTrust "unknown"` · effects: — (none)

**designIntent:** The table's "subtle recap" slot: the run's media history read back as a joke, in front of witnesses. On heavy runs, "the ones we never ran" lands one beat before the drink — the Editor unknowingly (or knowingly; the text never says) rehearsing the flashbacks the lock is about to show. Raising the glass is a confession nobody can quote. The Minister not looking up from pouring is the pack's quietest sentence: he already knows how the toast ends, and what he is pouring is the next card.

**Strings**
- `card.gathering_editor_toast_light.text`
  - EN: The Editor stands, glass out. "To the new generation. I ran the first profile — you all remember. Good photos." Laughter around the table. "Better questions." He holds your eye one beat longer than the joke needs.
  - VI: Tổng biên tập đứng dậy, nâng ly. "Vì thế hệ mới. Tôi là người chạy bài chân dung đầu tiên đấy — cả bàn còn nhớ mà. Ảnh đẹp." Tiếng cười quanh bàn. "Câu hỏi còn đẹp hơn." Ông ta giữ ánh mắt bạn lâu hơn một nhịp so với câu đùa cần.
  - ES: El Editor se pone de pie, copa en alto. «Por la nueva generación. Yo publiqué el primer perfil — todos lo recuerdan. Buenas fotos.» Risas alrededor de la mesa. «Mejores preguntas.» Sostiene tu mirada un instante más de lo que el chiste requiere.
  - ZH: 总编起身举杯。"敬新生代。第一篇人物专访是我做的——各位都记得。照片拍得好。"满桌笑声。"问题问得更好。"他的目光在你身上停留的时间，比这个笑话需要的多了一拍。
- `card.gathering_editor_toast_light.left` — EN: Raise your glass. · VI: Nâng ly đáp lại. · ES: Alzar tu copa. · ZH: 举杯回敬。
- `card.gathering_editor_toast_light.right` — EN: A polite nod. · VI: Gật đầu lịch sự. · ES: Un asentimiento cortés. · ZH: 礼貌地点头。
- `card.gathering_editor_toast_heavy.text`
  - EN: The Editor stands, glass out. "To our friend here — the best stories of my career." A pause tuned like a headline. "Especially the ones we never ran." The table laughs. The Minister does not look up from pouring.
  - VI: Tổng biên tập đứng dậy, nâng ly. "Vì người bạn của chúng ta đây — những bài báo hay nhất sự nghiệp tôi." Một quãng ngừng được căn chỉnh như một dòng tít. "Nhất là những bài chúng tôi chưa từng đăng." Cả bàn cười ồ. Bộ trưởng không ngẩng lên khỏi chai rượu đang rót.
  - ES: El Editor se pone de pie, copa en alto. «Por nuestro amigo aquí presente — las mejores historias de mi carrera.» Una pausa afinada como un titular. «Sobre todo las que nunca publicamos.» La mesa ríe. El Ministro no levanta la vista de lo que sirve.
  - ZH: 总编起身举杯。"敬在座的这位朋友——我职业生涯里最好的那些报道。"一个像标题一样精心校准的停顿。"尤其是那些我们从来没登过的。"满桌大笑。部长没有从斟酒的动作里抬起头来。
- `card.gathering_editor_toast_heavy.left` — EN: Laugh along. · VI: Cười theo. · ES: Reír con ellos. · ZH: 跟着笑。
- `card.gathering_editor_toast_heavy.right` — EN: Change the subject. · VI: Lái sang chuyện khác. · ES: Cambiar de tema. · ZH: 岔开话题。

---

### CARD 064 — The Drink *(core mechanical climax)*

`gathering_drink` · speaker: `minister` · illustration: `{ "scene": "villa_glass_closeup", "expression": "friendly" }`

**LEFT — "No. I'm driving."**
- preview: `standing -1 · publicTrust "unknown"`
- effects (when selectable): `standing -1`
- **ChoiceVariant v1 (LOCKED)** — condition (per spec §56):
```json
{ "all": [
  { "type": "obligation", "tag": "inner_circle", "status": "active", "minCount": 3 },
  { "type": "relationship", "character": "minister", "op": ">=", "value": 3 } ] }
```
  lock override: `{ "mode": "hard", "condition": <same>, "reason": { "source": "obligations", "maxFlashbacks": 3 } }`
  - **Flashback priority (from Act III handoff):** `obligation_minister_media_01` → `obligation_mentor_promotion_01` / `obligation_minister_backing_01` → `obligation_business_investment_01`. First occurrence unskippable, 0.5–1s per memory. Optional caption after return-to-center: → `card.gathering_drink.lock_caption`.
- **ChoiceVariant v2 (COSTLY)** — condition: `{ "type": "obligation", "tag": "inner_circle", "status": "active", "minCount": 2 }`
  lock override: `{ "mode": "cost", "condition": <same>, "unlockEffects": [ { "type": "stat", "stat": "power", "add": -15 }, { "type": "stat", "stat": "standing", "add": -3 } ], "reason": { "source": "obligations", "maxFlashbacks": 2 } }` *(price per BALANCE-REVIEW-02)*
- next: `{ "type": "scheduler" }` *(beat ladder routes to 065a)*

**RIGHT — "Just one."**
- preview: `standing +1 · publicTrust "unknown"`
- effects: `standing +1 · REL minister +1 · FLG add flag_drank_at_gathering`
- next: `{ "type": "scheduler" }` *(beat ladder routes to 065b)*

**designIntent:** The card the entire architecture exists to serve — Milestone 3's test case, verbatim. Three states, one glass: the free player declines and loses one point of Standing, the middling player may buy their refusal for −15 Power (the game's largest voluntary payment, made on a HUD that has trained them for forty turns to protect that number), and the captured player watches their own hand fail — then watches *why*, in their own past choices, in their own past words. Nothing here is punishment. It is arithmetic, performed late. The lock caption is the only near-editorial line permitted in the entire game, and it is seven words of bookkeeping.

**Strings**
- `card.gathering_drink.text`
  - EN: The Minister fills the glass himself and sets it in front of you. "One glass. You're not going to make everyone at this table uncomfortable, are you?" The room has gone conversationally quiet — not silent. Listening.
  - VI: Bộ trưởng tự tay rót đầy ly rượu và đặt xuống trước mặt bạn. "Một ly thôi. Cậu đâu nỡ làm cả bàn này khó xử, đúng không?" Căn phòng chùng xuống — không im lặng hẳn. Chỉ là đang lắng nghe.
  - ES: El Ministro llena la copa él mismo y la coloca frente a ti. «Una copa. No vas a incomodar a todos en esta mesa, ¿verdad?» La habitación ha bajado la voz — no en silencio. Escuchando.
  - ZH: 部长亲手把酒杯斟满，放在你面前。"就一杯。你不会想让这一桌人都下不来台吧？"房间里的谈话声低了下去——没有完全安静。是在听。
- `card.gathering_drink.left`
  - EN: "No. I'm driving." · VI: "Thôi. Tôi còn phải lái xe." · ES: «No. Yo manejo.» · ZH: "不了。我还要开车。"
- `card.gathering_drink.right`
  - EN: "Just one." · VI: "Một ly thôi vậy." · ES: «Solo una.» · ZH: "那就一杯。"
- `card.gathering_drink.lock_caption`
  - EN: You owe too many people at this table. · VI: Bạn nợ quá nhiều người đang ngồi ở bàn này. · ES: Le debes a demasiada gente en esta mesa. · ZH: 这张桌上，你欠的人太多了。

---

### CARD 065a — The Road, Sober

`gathering_transport_sober` · speaker: — (narration) · illustration: `{ "scene": "villa_driveway_night" }`
**Routing:** `next` (both choices): `{ "type": "act", "act": "incident" }`

**LEFT — Drive yourself.**
- preview: `publicTrust "unknown"`
- effects: `FLG add flag_self_driving`

**RIGHT — Take the official car.**
- preview: `money 0 · standing 0 · publicTrust "unknown"`
- effects: `money -200 · FLG add flag_safe_transport`

**designIntent:** No trap here — sober self-driving resolves to ALLY_CAUSED like every other combination except one. The card exists so the sober player *makes* a transport choice rather than being handed safety, keeping the two routes structurally symmetrical: everyone answers the same question; only one prior card changes what the answer can do.

**Strings**
- `card.gathering_transport_sober.text`
  - EN: The cold air outside is the first honest thing all evening. The city is twenty minutes away, the road empty, the keys in your pocket where you left them.
  - VI: Làn không khí lạnh ngoài trời là thứ trung thực đầu tiên của cả buổi tối. Thành phố cách hai mươi phút, con đường vắng tanh, chìa khoá vẫn nằm trong túi bạn, đúng chỗ bạn để.
  - ES: El aire frío de afuera es lo primero honesto en toda la noche. La ciudad está a veinte minutos, la carretera vacía, las llaves en tu bolsillo donde las dejaste.
  - ZH: 屋外的冷空气，是整个晚上第一件诚实的东西。市区在二十分钟车程外，路上空无一人，钥匙还在你口袋里，在你放它的地方。
- `card.gathering_transport_sober.left`
  - EN: Drive yourself. · VI: Tự lái về. · ES: Manejar tú mismo. · ZH: 自己开车回去。
- `card.gathering_transport_sober.right`
  - EN: Take the official car. · VI: Đi xe công vụ. · ES: Tomar el coche oficial. · ZH: 坐公务车。

---

### CARD 065b — The Road, Otherwise

`gathering_transport_drunk` · speaker: — (narration) · illustration: `{ "scene": "villa_driveway_night_blur" }`
**Routing:** `next` (both choices): `{ "type": "act", "act": "incident" }`

**LEFT — Call for a driver.**
- preview: `standing -1 · publicTrust "unknown"`
- effects (base): `standing -2 · FLG add flag_safe_transport`
- **ChoiceVariant v1 (HARD)** — condition:
```json
{ "all": [
  { "type": "flag", "flag": "flag_dismissed_driver", "exists": true },
  { "type": "obligation", "tag": "inner_circle", "status": "active", "minCount": 3 } ] }
```
  text override: `card.gathering_transport_drunk.left.locked`
  lock override: `{ "mode": "hard", "condition": <same>, "reason": { "source": "explicit", "explicitSources": [ { "cardId": "gathering_arrival", "choice": "right" }, { "cardId": "gathering_drink", "choice": "right" } ] } }`
  - Flashback shows exactly two memories: *"Send the driver home. Everything is arranged." — YOU DID.* and *"Just one." — YOU DRANK.* It then explains the combined consequence: the discreet exit was dismissed, an outside driver would create a record of the secret address and time, and the captured player cannot expose the room that owns their obligations.
- **ChoiceVariant v2 (COSTLY)** — condition: `{ "type": "flag", "flag": "flag_dismissed_driver", "exists": true }`
  text override: `card.gathering_transport_drunk.left.costly`
  lock override: `{ "mode": "cost", "condition": <same>, "unlockEffects": [ { "type": "stat", "stat": "standing", "add": -4 } ], "reason": { "source": "explicit", "explicitSources": [ { "cardId": "gathering_arrival", "choice": "right" } ] } }`
  - Costly presentation: waiting forty minutes on the driveway, alone, visibly drunk, while the table watches through the window. The −4 Standing *is* that image.

**RIGHT — Drive. It isn't far.**
- preview: `publicTrust "unknown"`
- effects: `FLG add flag_self_driving`

**designIntent:** The spec's hardest constraint — "avoid arbitrary lock without traceable cause" — honored to the letter: both lock variants cite **explicit sources the player enacted tonight**, in this room, within the last six cards. No dice, no fate; a dismissed driver and a raised glass. The hard-locked flashback is two memories long, followed by a short causal caption tying the secret address, the documentary trace of calling an outsider, and the player's accumulated obligations into one loss of agency. This is also the last card in the game where the stat HUD is fully visible; whatever happens next happens without numbers.

**Strings**
- `card.gathering_transport_drunk.text`
  - EN: The stairs move slightly more than stairs should. Outside, the night is sharp, and your own keys are somehow already in your hand — someone passed them to you as a courtesy on the way out. The city is twenty minutes away.
  - VI: Bậc thang chao nhẹ hơn mức một bậc thang nên chao. Bên ngoài, màn đêm sắc lạnh, và chùm chìa khoá của chính bạn không hiểu sao đã nằm sẵn trong tay — ai đó đã lịch sự dúi nó cho bạn trên đường ra cửa. Thành phố cách hai mươi phút.
  - ES: Las escaleras se mueven un poco más de lo que deberían moverse unas escaleras. Afuera, la noche es filosa, y tus propias llaves ya están, de algún modo, en tu mano — alguien te las pasó por cortesía al salir. La ciudad está a veinte minutos.
  - ZH: 台阶晃动的幅度，比台阶应有的略多了一点。屋外夜色凛冽，而你自己的车钥匙不知怎么已经在你手里了——出门时有人出于礼貌把它递给了你。市区在二十分钟车程外。
- `card.gathering_transport_drunk.left`
  - EN: Call for a driver. · VI: Gọi tài xế. · ES: Llamar a un chofer. · ZH: 叫司机来。
- `card.gathering_transport_drunk.left.locked`
  - EN: Call an outside driver to this private address. · VI: Gọi tài xế bên ngoài đến địa chỉ bí mật này. · ES: Llamar a un chofer externo a esta dirección privada. · ZH: 叫外面的司机来这个秘密地址。
- `card.gathering_transport_drunk.left.costly`
  - EN: Call another driver; wait forty minutes outside the gate. · VI: Gọi tài xế khác; chờ ngoài cổng bốn mươi phút. · ES: Llamar a otro chofer; esperar cuarenta minutos fuera de la entrada. · ZH: 另叫一名司机，在门外等四十分钟。
- `card.gathering_transport_drunk.lock_caption`
  - EN: You sent away the discreet way out that was already waiting, then drank the glass the table poured. Calling an outsider to a house absent from every map would leave your name, the address, and the time. You owe this room too much to create that record.
  - VI: Bạn đã cho tài xế riêng — lối ra kín đáo duy nhất — về trước, rồi nhận ly rượu cả bàn mời. Gọi người ngoài đến căn nhà không có trên bản đồ sẽ lưu lại tên bạn, địa chỉ và thời gian. Bạn mang ơn quá nhiều người trong căn phòng này để dám tạo ra dấu vết ấy.
- `card.gathering_transport_drunk.right`
  - EN: Drive. It isn't far. · VI: Lái thôi. Cũng đâu có xa. · ES: Manejar. No está lejos. · ZH: 开吧。反正不远。

---

## 3. QA / Simulation Checklist

1. **064 tri-state distribution:** across bot profiles — clean bot hits FREE (refuses at cost of −1 Standing); middle bot hits COSTLY and, when it pays, loses exactly 15 Power + 3 Standing; captured bot hits LOCKED with flashbacks drawn from the priority list, heaviest (w2) obligations first, and `flag_drank_at_gathering` set on 100% of its runs. Assert the spec's Milestone-3 sentence end-to-end: choice → advantage → obligation → 20+ turns → resistance → flashback with correct sources.
2. **Route resolution truth table:** four combinations (drank × self_driving) must resolve: (T,T) → PLAYER_CAUSED; (T,F), (F,T), (F,F) → ALLY_CAUSED. No fifth state may exist; `flag_safe_transport` and `flag_self_driving` are mutually exclusive per run.
3. **Traceable-cause audit (065b):** the hard variant may never fire on a run where `gathering_arrival:right` is absent from history — the validator's impossible-flashback check must confirm both explicit sources exist and precede the locked card on every locked run.
4. **061 freedom purchase:** divesting at the gathering must reduce active inner_circle count by exactly the resolved investment obligations, and a run at exactly 3 obligations that divests *before* the drink must downgrade 064 from LOCKED to COSTLY. This interaction is the pack's hidden escape hatch — simulation must prove it exists, and playtesting should confirm almost nobody finds it.
5. **062 arming:** a run entering the gathering at 2 inner_circle obligations that accepts 062-right must hit the 064 hard lock (given REL minister ≥ 3); the same run refusing 062 must hit COSTLY instead. One sentence of manners = the difference between expensive and impossible.
6. **Beat ladder integrity:** exactly one toast beat and one transport beat satisfiable per run; non-invested runs never see 061; no gathering card is ever reachable via the contextual pool; act `incident` is entered on 100% of runs with the HUD-visibility flag ready to drop.
7. **Localization:** VI spot-checks — 064's "Cậu đâu nỡ làm cả bàn này khó xử" (social pressure phrased as consideration, the exact VN drinking-culture register) and 065b's "dúi" (the courtesy that is not one); ZH 064 "下不来台" idiom check; ES «Yo manejo» kept short enough for the card UI.

---

*End of pack. Handoff to the Incident + Aftermath pack (066–080): route expressions defined in §1.2; HUD removal begins at act `incident` entry per spec §29 (no stat previews, no advisors, reduced audio); `flag_safe_transport` / `flag_self_driving` / `flag_drank_at_gathering` / `flag_dismissed_driver` are frozen inputs from here; the aide's relationship value (damaged or not at 045) determines the tone of the first post-collision phone call; `flag_divested_at_gathering` and the betrayed obligation feed Network Response (076) — the Businessman remembers who left the table early.*
