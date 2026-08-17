# Card Authoring Pack — Incident, Aftermath & Endings

**Version:** 1.0 · **Cards:** 30 authored (≈14–16 seen per run) + 8 ending definitions + memorial + credits
**Depends on:** all previous packs · route expressions from Gathering §1.2
**Supported languages:** `en`, `vi`, `es`, `zh-Hans`
**Authoring directive for this pack:** words carry the act. Every card is shorter than anything before it. Nothing is explained. Nothing is graded. The prose does the work the HUD used to do.

---

## 1. Laws of This Pack

### AFTERMATH-LAW-01 — No locks after the collision
From card 067A/066B onward there are **zero locks — hard or cost — anywhere**. Before the collision, the game priced the player's conscience. After it, the game stops charging and starts recording. Confession, non-interference, disclosure, resignation: always selectable, at any corruption level. What varies is the **menu** (tiered cards, per the 048/078 pattern) and the **consequences** — never the availability of the moral core. The validator must fail the build if any card in acts `incident`/`aftermath` contains a `lock` field.

### AFTERMATH-LAW-02 — No previews, no HUD
No card in this pack has a `preview` object (validator-enforced). The engine hides the stat HUD at act `incident` entry per spec §29: no advisors, no arrows, music reduced to ambience. Stats still change silently underneath — they resurface exactly once, inside certain ending texts, where the hidden number is finally shown (see Protected, Collapse). The player has spent the whole game reading arrows; this act they read faces.

### AFTERMATH-LAW-03 — The victim
The in-game victim is **fictional and unnamed**: a young woman, no age, no street, no occupation, no injuries described. Per the project's earlier decision, the dedication layer is separate from the simulation layer. The memorial text ships in two configurable variants (§6); the default build uses the anonymous variant pending the consent question.

### Structure
- Act `incident`: two route chains, entered by beats gated on the Gathering's route expressions. Within each route, `next` directives chain the cards (branching at 068A only). Exit: `next → { "type": "act", "act": "aftermath" }`.
- Act `aftermath`: beat ladder (Gathering ROUTING-NOTE-01 pattern), turns 1–10, tier/route conditions per beat, final beat's card exits via `next → { "type": "ending_check" }`. Slot 080 of the Master Table is therefore engine-side, not a card.

### 1.1 New flags

```text
flag_looked_at_phone            flag_stayed_at_scene            flag_left_scene
flag_called_emergency           flag_delayed_emergency          flag_victim_received_early_help
flag_aide_knows_truth           flag_concealment_started        flag_asked_about_victim
flag_immediate_disclosure       flag_coverup_started            flag_aftermath_facts_released
flag_article_suppressed_aftermath                               flag_gave_full_statement
flag_records_preserved          flag_cooperated_with_investigation
flag_records_selective          flag_release_coordinated
flag_unconditional_compensation flag_confidential_settlement
flag_confessed                  flag_remained_silent
flag_charges_allowed            flag_ally_protected             flag_heard_plea
flag_full_timeline_published    flag_controlled_statement
flag_editors_pressured          flag_reports_removed
flag_resigned                   flag_remained_in_office
flag_investigation_continues    flag_intervention_ordered
flag_intervention_failed        flag_intervention_succeeded
```

### 1.2 New precedents

```text
precedent_concealment           Normalized hiding one's own act.
precedent_coverup               Normalized hiding another's act.
precedent_media_manipulation    Normalized shaping the incident's coverage.
precedent_victim_silencing      Normalized paying for silence.
```

### 1.3 Aftermath beat ladder (abridged; full JSON in `beats/aftermath.json`)

```text
turn 1  071a | 071b        (media tier: 071b iff precedent_media_suppression >= 1)
turn 2  072a | 072b        (072a iff flag_investigation_independent)
turn 3  073
turn 4  074
turn 5  075A | 075B        (route expressions)
turn 6  076_exposed | 076_covered
turn 7  077_reformist_steady | 077_reformist_plea | 077_aide
turn 8  078a | 078b | 078c (media tiers, 048 pattern)
turn 9  079A | 079B        (route)
turn 10 aftermath_intervention_failed | _succeeded   (only if 079B:right)
→ ending_check
```

---

## 2. ROUTE A — The Player Causes the Incident

Entry beat condition: `PLAYER_CAUSED` (drank ∧ self-driving).

---

### CARD 066A — The Road Home

`incident_road_a` · narration · illustration `{ "scene": "night_road_windshield" }` · next (both): `incident_collision`

**LEFT — Ignore the phone.** · effects: —
**RIGHT — Glance at the message.** · effects: `FLG add flag_looked_at_phone`

**designIntent:** The message, if read, is the Minister's — five words of gratitude arriving at the exact wrong moment. Alters presentation only; the collision does not depend on the glance. Guilt is not a reflex test.

**Strings**
- `card.incident_road_a.text`
  - EN: The road home. Twenty minutes. On the radio, someone is laughing about football. Your phone lights the passenger seat: the Minister. *"Tonight was noted. — V."*
  - VI: Đường về nhà. Hai mươi phút. Trên radio, ai đó đang cười vì một trận bóng. Điện thoại sáng lên trên ghế phụ: Bộ trưởng. *"Tối nay tôi ghi nhận. — V."*
  - ES: El camino a casa. Veinte minutos. En la radio, alguien se ríe de un partido. Tu teléfono ilumina el asiento del copiloto: el Ministro. *«Lo de esta noche queda anotado. — V.»*
  - ZH: 回家的路。二十分钟。收音机里，有人正为一场球赛发笑。手机照亮了副驾驶座：部长。*"今晚的事，我记下了。——V"*
- `card.incident_road_a.left` — EN: Ignore the phone. · VI: Mặc kệ điện thoại. · ES: Ignorar el teléfono. · ZH: 别管手机。
- `card.incident_road_a.right` — EN: Glance at the message. · VI: Liếc tin nhắn. · ES: Mirar el mensaje. · ZH: 瞥一眼消息。

---

### CARD 067A — Two Honest Choices

`incident_collision` · narration · illustration `{ "scene": "headlights_flash" }` · metadata.presentationHint: `impact_blackout` · next (both): `incident_immediate_choice`

**LEFT — Brake.** · effects: —
**RIGHT — Swerve.** · effects: —

**designIntent:** The concept's forced moment, implemented without a fake lock: **both choices are real, both are honored, both fail** — because braking distance is chemistry, not will. The player did choose; they chose at the table, six cards ago. Impact sound, brief interruption, black screen. No gore, ever. The HUD is already gone.

**Strings**
- `card.incident_collision.text`
  - EN: Headlights where headlights should not be — and then not headlights, a shape, and the shape is a person, and there is a fraction of a second that belongs entirely to you.
  - VI: Ánh đèn pha ở nơi không đáng có đèn pha — rồi không còn là đèn pha nữa, là một hình dáng, và hình dáng ấy là một con người, và có một phần giây ngắn ngủi thuộc trọn về bạn.
  - ES: Faros donde no debería haber faros — y luego no son faros, es una silueta, y la silueta es una persona, y hay una fracción de segundo que te pertenece por completo.
  - ZH: 车灯出现在不该有车灯的地方——然后那不再是车灯，是一个轮廓，而那个轮廓是一个人，而有那么零点几秒，完完全全属于你。
- `card.incident_collision.left` — EN: Brake. · VI: Đạp phanh. · ES: Frenar. · ZH: 踩刹车。
- `card.incident_collision.right` — EN: Swerve. · VI: Đánh lái. · ES: Virar. · ZH: 打方向。

---

### CARD 068A — The Only Choice That Was Ever Yours

`incident_immediate_choice` · narration · illustration `{ "scene": "black_road_silence" }`
**Routing:** left → `incident_stay` · right → `incident_leave`
**Never locked. Never priced. Per spec §29 — this decision remains player agency regardless of past corruption.**

**LEFT — STAY.** · effects: `FLG add flag_stayed_at_scene`
**RIGHT — LEAVE.** · effects: `FLG add flag_left_scene`

**designIntent:** The whole game funnels to two words on a black screen. Everything the player has built can protect them from consequences; nothing they have built can make this choice for them. The card text does not mention the woman's condition — the player must decide without a prognosis, the way it happens.

**Strings**
- `card.incident_immediate_choice.text`
  - EN: The engine ticks. The road is quiet the way a room is quiet after glass breaks. Behind you, on the asphalt, someone is not getting up.
  - VI: Động cơ kêu tí tách. Con đường im ắng theo cái cách một căn phòng im ắng sau tiếng thuỷ tinh vỡ. Phía sau bạn, trên mặt nhựa đường, có một người đang không đứng dậy.
  - ES: El motor cruje al enfriarse. La carretera está en silencio como queda un cuarto en silencio después de que se rompe un vidrio. Detrás de ti, sobre el asfalto, alguien no se está levantando.
  - ZH: 发动机滴答作响。路面安静得像玻璃碎裂之后的房间。在你身后的柏油路上，有一个人，没有站起来。
- `card.incident_immediate_choice.left` — EN: STAY. · VI: Ở LẠI. · ES: QUEDARTE. · ZH: 留下。
- `card.incident_immediate_choice.right` — EN: LEAVE. · VI: RỜI ĐI. · ES: IRTE. · ZH: 离开。

---

### CARD 069A — Two Numbers

`incident_stay` · narration · illustration `{ "scene": "phone_in_hand_dark" }` · next (both): `{ "type": "act", "act": "aftermath" }`

**LEFT — Call the emergency line. Now.** · effects: `FLG add flag_called_emergency · FLG add flag_victim_received_early_help`
**RIGHT — Call the Aide first.** · effects: `FLG add flag_delayed_emergency`

**designIntent:** The table's "important humanitarian consequence," compressed into a contact list. The Aide-first path is not villainy — it is the trained reflex of forty turns of having a person who fixes things. The endings will measure this in minutes, not morals.

**Strings**
- `card.incident_stay.text`
  - EN: Your hands are steadier than they have any right to be. Two names sit at the top of your recent calls: the emergency line, and the person who fixes things.
  - VI: Hai bàn tay bạn vững hơn mức chúng có quyền vững. Hai cái tên nằm trên cùng danh sách cuộc gọi gần đây: đường dây cấp cứu, và người chuyên dàn xếp mọi chuyện.
  - ES: Tus manos están más firmes de lo que tienen derecho a estar. Dos nombres encabezan tus llamadas recientes: la línea de emergencias, y la persona que arregla las cosas.
  - ZH: 你的双手稳得有些不该。最近通话的最上面是两个名字：急救专线，和那个专门摆平事情的人。
- `card.incident_stay.left` — EN: Call the emergency line. Now. · VI: Gọi cấp cứu. Ngay. · ES: Llamar a emergencias. Ya. · ZH: 打急救电话。马上。
- `card.incident_stay.right` — EN: Call the Aide first. · VI: Gọi Trợ lý trước. · ES: Llamar primero al Asistente. · ZH: 先打给助理。

---

### CARD 070A — Four Kilometers

`incident_leave` · speaker: `aide` · illustration `{ "scene": "car_interior_phone" }` · next (both): `{ "type": "act", "act": "aftermath" }`

**LEFT — Tell the truth.** · effects: `FLG add flag_aide_knows_truth`
**RIGHT — "I'm home. Why?"** · effects: `FLG add flag_concealment_started · PRE concealment +1`

**designIntent:** The first lie is three words to the one person who kept a list to protect you. If REL aide was damaged at card 045, no alternate line is needed — the same words simply land colder. The concealment precedent opens vocabulary the aftermath will regret having.

**Strings**
- `card.incident_leave.text`
  - EN: Four kilometers later, the phone. The Aide, in the voice kept for real things: "Where are you right now? Something's coming over the police channel — the villa road."
  - VI: Bốn cây số sau, điện thoại reo. Trợ lý, bằng chất giọng chỉ dành cho những chuyện hệ trọng: "Sếp đang ở đâu ngay lúc này? Kênh bộ đàm cảnh sát đang báo có chuyện — đoạn đường khu biệt thự."
  - ES: Cuatro kilómetros después, el teléfono. El Asistente, con la voz reservada para las cosas reales: «¿Dónde estás ahora mismo? Algo está saliendo por la frecuencia policial — la carretera de la villa.»
  - ZH: 四公里之后，电话响了。助理，用那种只留给要紧事的声音："您现在在哪儿？警用频道里正在报什么——别墅那条路。"
- `card.incident_leave.left` — EN: Tell the truth. · VI: Nói thật. · ES: Decir la verdad. · ZH: 说实话。
- `card.incident_leave.right` — EN: "I'm home. Why?" · VI: "Tôi ở nhà. Sao thế?" · ES: «Estoy en casa. ¿Por qué?» · ZH: "我在家。怎么了？"

---

## 3. ROUTE B — An Ally Causes the Incident

Entry beat condition: `ALLY_CAUSED`. The driver is **the Mentor** — the man from card 001, who was at the same table.

---

### CARD 066B — It's Ours

`incident_call_b` · speaker: `aide` · illustration `{ "scene": "home_phone_night" }` · next (both): `incident_identity_b`

**LEFT — "Details. Now."** · effects: —
**RIGHT — "Come to the office."** · effects: —

**Strings**
- `card.incident_call_b.text`
  - EN: You are home, shoes still on, when the phone rings. The Aide, in the voice kept for real things: "There's been an accident on the villa road. It's ours."
  - VI: Bạn đang ở nhà, giày còn chưa kịp cởi, thì điện thoại reo. Trợ lý, bằng chất giọng chỉ dành cho những chuyện hệ trọng: "Có tai nạn trên đoạn đường khu biệt thự. Là người của chúng ta."
  - ES: Estás en casa, todavía con los zapatos puestos, cuando suena el teléfono. El Asistente, con la voz reservada para las cosas reales: «Hubo un accidente en la carretera de la villa. Es de los nuestros.»
  - ZH: 你到了家，鞋还没来得及脱，电话就响了。助理，用那种只留给要紧事的声音："别墅那条路上出事故了。是我们的人。"
- `card.incident_call_b.left` — EN: "Details. Now." · VI: "Chi tiết. Ngay." · ES: «Detalles. Ya.» · ZH: "细节。马上。"
- `card.incident_call_b.right` — EN: "Come to the office." · VI: "Đến văn phòng." · ES: «Ven a la oficina.» · ZH: "来办公室。"

---

### CARD 067B — Which Question First

`incident_identity_b` · speaker: `aide` · illustration `{ "scene": "office_night_two_chairs" }` · next (both): `incident_first_request_b`

**LEFT — "Where is he now?"** · effects: —
**RIGHT — "Where is she now?"** · effects: `FLG add flag_asked_about_victim`

**designIntent:** The pack's purest wording-as-mechanics: two grammatically identical questions, one pronoun apart. The game records which one came out of the player's mouth first and never mentions it again — until card 074, where the family's lawyer will somehow already know.

**Strings**
- `card.incident_identity_b.text`
  - EN: "The Mentor's car," the Aide says. "The riverside stretch. A young woman who was walking home." A breath. "He didn't stay. He was at your table two hours ago."
  - VI: "Xe của Người Đỡ Đầu," trợ lý nói. "Đoạn đường ven sông. Một cô gái trẻ đang trên đường đi bộ về nhà." Một hơi thở. "Ông ấy đã không ở lại. Hai tiếng trước ông ấy còn ngồi cùng bàn với sếp."
  - ES: «El coche del Mentor», dice el Asistente. «El tramo junto al río. Una joven que iba caminando a casa.» Una respiración. «No se quedó. Hace dos horas estaba en tu mesa.»
  - ZH: "是导师的车，"助理说。"沿河那一段。一个正走路回家的年轻女子。"一次呼吸。"他没有留在现场。两个小时前，他还和您坐在同一张桌上。"
- `card.incident_identity_b.left` — EN: "Where is he now?" · VI: "Ông ấy giờ đang ở đâu?" · ES: «¿Dónde está él ahora?» · ZH: "他现在在哪儿？"
- `card.incident_identity_b.right` — EN: "Where is she now?" · VI: "Cô ấy giờ đang ở đâu?" · ES: «¿Dónde está ella ahora?» · ZH: "她现在在哪儿？"

---

### CARD 068B — A Few Hours

`incident_first_request_b` · speaker: `minister` · illustration `{ "scene": "phone_call_1am" }` · next (both): `incident_emergency_b`

**LEFT — Release the basic facts tonight.** · effects: `FLG add flag_immediate_disclosure · standing -3 · power -2`
**RIGHT — Delay the statement until morning.** · effects: `standing +2 · power +2 · PRE information_delay +1`

**Strings**
- `card.incident_first_request_b.text`
  - EN: "We need time before this becomes public," the Minister says. It is one in the morning and his voice has been ironed flat. "A few hours. Nothing irreversible."
  - VI: "Chúng ta cần thời gian trước khi chuyện này ra công chúng," Bộ trưởng nói. Một giờ sáng, và giọng ông đã được là phẳng lì. "Vài tiếng thôi. Không có gì là không thể đảo ngược cả."
  - ES: «Necesitamos tiempo antes de que esto se haga público», dice el Ministro. Es la una de la madrugada y su voz ha sido planchada. «Unas horas. Nada irreversible.»
  - ZH: "在这件事公开之前，我们需要时间，"部长说。凌晨一点，他的声音已经被熨得平平整整。"就几个小时。没有什么是不可逆的。"
- `card.incident_first_request_b.left` — EN: Release the basic facts tonight. · VI: Công bố thông tin cơ bản ngay đêm nay. · ES: Publicar los hechos básicos esta noche. · ZH: 今晚就公布基本事实。
- `card.incident_first_request_b.right` — EN: Delay the statement until morning. · VI: Hoãn thông cáo đến sáng. · ES: Retrasar el comunicado hasta la mañana. · ZH: 声明推迟到早上。

---

### CARD 069B — Down the Hall From the Politics

`incident_emergency_b` · narration · illustration `{ "scene": "hospital_corridor_night" }` · next (both): `incident_explicit_request_b`

**LEFT — Give them everything they ask for. Tonight.** · effects: `FLG add flag_victim_received_early_help`
**RIGHT — Route it through the local officials.** · effects: —

**designIntent:** The one card in Route B where power can simply *help*, no strings, no witnesses. The wording "someone must authorize" is exact: the machinery that delayed a hospital wing for eleven months is the same machinery that can move a surgical team in eleven minutes. The player has held this lever all game.

**Strings**
- `card.incident_emergency_b.text`
  - EN: The hospital calls your office directly, because at this hour, at this level, someone must authorize the transfer team. Down the hall from all the politics, a surgical unit is waiting on paperwork.
  - VI: Bệnh viện gọi thẳng đến văn phòng của bạn, vì vào giờ này, ở cấp này, phải có người phê chuẩn cho ê-kíp chuyển viện. Cách tất cả những toan tính chính trị đúng một dãy hành lang, một ê-kíp phẫu thuật đang chờ giấy tờ.
  - ES: El hospital llama directo a tu oficina, porque a esta hora, a este nivel, alguien tiene que autorizar al equipo de traslado. A un pasillo de toda la política, una unidad quirúrgica está esperando papeles.
  - ZH: 医院直接打到了你的办公室——因为在这个时间、这个层级，必须有人为转运团队签字。距离所有的政治只隔一条走廊，一支手术团队正在等一纸文件。
- `card.incident_emergency_b.left` — EN: Give them everything they ask for. Tonight. · VI: Cho họ mọi thứ họ cần. Ngay đêm nay. · ES: Darles todo lo que pidan. Esta noche. · ZH: 他们要什么给什么。就今晚。
- `card.incident_emergency_b.right` — EN: Route it through the local officials. · VI: Chuyển qua chính quyền địa phương xử lý. · ES: Canalizarlo por los funcionarios locales. · ZH: 转给地方官员按程序办。

---

### CARD 070B — Thirty Years

`incident_explicit_request_b` · speaker: `minister` · illustration `{ "scene": "ministry_office_night", "expression": "concerned" }` · next (both): `{ "type": "act", "act": "aftermath" }`

**LEFT — "There will be no interference."** · effects: `standing -5 · power -3 · REL minister -2 · REL mentor -2`
**RIGHT — "Tell me what you need."** · effects: `standing +2 · power +3 · FLG add flag_coverup_started · PRE coverup +1`

**designIntent:** Card 056 was the rehearsal; this is the performance, and the player who coordinated the Editor then has already learned the lines. Per AFTERMATH-LAW-01: refusal is never locked, never priced beyond its stated cost. The rehearsed sentence — "He has served this country for thirty years" — is the network speaking its only true belief: that service is a currency, and it buys people.

**Strings**
- `card.incident_explicit_request_b.text`
  - EN: "He has served this country for thirty years," the Minister says. The sentence has been rehearsed; you can hear where the pauses were placed. "You know what a trial would take from all of us. I am asking what can be arranged."
  - VI: "Ông ấy đã phụng sự đất nước này ba mươi năm," Bộ trưởng nói. Câu ấy đã được tập trước; bạn nghe ra được cả những chỗ ngừng được sắp đặt sẵn. "Cậu biết một phiên toà sẽ lấy đi của tất cả chúng ta những gì. Tôi đang hỏi xem có thể thu xếp được những gì."
  - ES: «Ha servido a este país durante treinta años», dice el Ministro. La frase fue ensayada; puedes oír dónde colocaron las pausas. «Sabes lo que un juicio nos quitaría a todos. Estoy preguntando qué se puede arreglar.»
  - ZH: "他为这个国家服务了三十年，"部长说。这句话是排练过的；你甚至听得出停顿被安放在哪里。"你知道一场审判会从我们所有人身上拿走什么。我在问的是——有什么可以安排。"
- `card.incident_explicit_request_b.left` — EN: "There will be no interference." · VI: "Sẽ không có bất kỳ sự can thiệp nào." · ES: «No habrá interferencia alguna.» · ZH: "不会有任何干预。"
- `card.incident_explicit_request_b.right` — EN: "Tell me what you need." · VI: "Nói tôi nghe ngài cần gì." · ES: «Dime qué necesitas.» · ZH: "说吧，您需要什么。"

---

## 4. SHARED AFTERMATH

Both routes converge. Beat ladder per §1.3. Texts stay short; the temperature keeps dropping.

---

### CARDS 071a/b — The First Article *(media tier)*

#### 071a — `aftermath_first_article` · narration · condition: `precedent_media_suppression == 0`
**LEFT — Release the facts.** · effects: `FLG add flag_aftermath_facts_released · standing -3 · trustActual +2`
**RIGHT — Coordinate the wording.** · effects: `standing +2 · power +1 · PRE media_manipulation +1`

#### 071b — `aftermath_first_article_captured` · speaker: `editor` · condition: `precedent_media_suppression >= 1`
**LEFT — Coordinate the wording.** · effects: `standing +2 · power +1 · PRE media_manipulation +1`
**RIGHT — Remove the article.** · effects: `power +2 · trustActual -4 · FLG add flag_article_suppressed_aftermath · PRE media_suppression +1`

**designIntent:** The 048 vocabulary law, applied to a person instead of a portfolio. On captured runs, "release the facts" has left the building; the Editor's four words are the entire moral history of Chain B, spoken as a service.

**Strings**
- `card.aftermath_first_article.text`
  - EN: Page three, morning edition: *"Young woman critically injured in late-night collision on the villa road. The driver has not been publicly identified."* Your office phone starts ringing before you finish the paragraph.
  - VI: Trang ba, số báo sáng: *"Một cô gái trẻ bị thương nặng trong vụ va chạm lúc đêm khuya trên đoạn đường khu biệt thự. Danh tính người cầm lái chưa được công bố."* Điện thoại văn phòng đổ chuông trước cả khi bạn đọc hết đoạn.
  - ES: Página tres, edición matutina: *«Joven gravemente herida en colisión nocturna en la carretera de la villa. El conductor no ha sido identificado públicamente.»* El teléfono de tu oficina empieza a sonar antes de que termines el párrafo.
  - ZH: 晨报第三版：*"深夜别墅路段发生碰撞事故，一名年轻女子伤势危重。驾驶者身份尚未公布。"* 你还没读完这一段，办公室的电话就响了。
- `card.aftermath_first_article.left` — EN: Release the facts. · VI: Công bố sự thật. · ES: Publicar los hechos. · ZH: 公布事实。
- `card.aftermath_first_article.right` — EN: Coordinate the wording. · VI: Thống nhất câu chữ. · ES: Coordinar la redacción. · ZH: 统一措辞。
- `card.aftermath_first_article_captured.text`
  - EN: The Editor calls before the print run. "I've seen tomorrow's page three. A young woman, the villa road, an unnamed driver." A pause that costs nothing yet. "Say the word."
  - VI: Tổng biên tập gọi trước giờ in. "Tôi xem trang ba của số ngày mai rồi. Một cô gái trẻ, đoạn đường khu biệt thự, một người cầm lái chưa rõ danh tính." Một quãng ngừng chưa tốn kém gì — mới chỉ là chưa. "Cậu chỉ cần nói một tiếng."
  - ES: El Editor llama antes de la impresión. «Ya vi la página tres de mañana. Una joven, la carretera de la villa, un conductor sin nombre.» Una pausa que todavía no cuesta nada. «Di la palabra.»
  - ZH: 付印之前，总编来电。"明天的第三版我看过了。一个年轻女子，别墅那条路，一个未具名的驾驶者。"一个暂时还不需要付出代价的停顿。"你一句话的事。"
- `card.aftermath_first_article_captured.left` — EN: Coordinate the wording. · VI: Thống nhất câu chữ. · ES: Coordinar la redacción. · ZH: 统一措辞。
- `card.aftermath_first_article_captured.right` — EN: Remove the article. · VI: Cho gỡ bài. · ES: Eliminar la nota. · ZH: 撤稿。

---

### CARDS 072a/b — The Investigator *(institutional payoff)*

#### 072a — `aftermath_investigator_independent` · condition: `flag_investigation_independent`
**LEFT — Give the statement in full.** · effects: `FLG add flag_gave_full_statement`
**RIGHT — Refer her to your lawyer.** · effects: —

#### 072b — `aftermath_investigator_controlled` · condition: `flag_investigation_politically_controlled`
**LEFT — "No guidance. Full scope."** · effects: `FLG add flag_gave_full_statement · standing -2`
**RIGHT — "Keep the scope focused."** · effects: `power +2 · PRE investigation_interference +1`

**designIntent:** Card 052's receipt, both sides of it. On independent runs the *reward is a limitation* — the sentence the player paid −8 Power for, delivered to their face, and the correct emotional response is relief. On controlled runs the investigator's deference is the horror: "whenever convenient" is what a captured institution sounds like when it thinks it is being polite.

**Strings**
- `card.aftermath_investigator_independent.text`
  - EN: The investigator arrives without calling ahead. You did not appoint her; you cannot name who did — that was the point. "Your office does not have authority over this inquiry," she says, evenly. "I'm informing you as a courtesy. And collecting your statement while I'm here."
  - VI: Điều tra viên đến mà không báo trước. Bạn không bổ nhiệm cô ấy; bạn thậm chí không gọi tên được ai đã bổ nhiệm — mà đó chính là mục đích. "Văn phòng của ông không có thẩm quyền đối với cuộc điều tra này," cô nói, đều giọng. "Tôi thông báo là vì phép lịch sự. Và tiện đây, tôi lấy luôn lời khai của ông."
  - ES: La investigadora llega sin avisar. Tú no la nombraste; no puedes decir quién lo hizo — ese era el punto. «Su oficina no tiene autoridad sobre esta investigación», dice, sin inflexión. «Se lo informo por cortesía. Y aprovecho para tomar su declaración.»
  - ZH: 调查员不打招呼就来了。她不是你任命的；你甚至说不出是谁任命的——而这正是当初的用意。"您的办公室对本案没有管辖权，"她平静地说。"通知您，是出于礼貌。顺便，把您的陈述也做了。"
- `card.aftermath_investigator_independent.left` — EN: Give the statement in full. · VI: Khai đầy đủ. · ES: Dar la declaración completa. · ZH: 完整陈述。
- `card.aftermath_investigator_independent.right` — EN: Refer her to your lawyer. · VI: Bảo cô ấy làm việc với luật sư. · ES: Remitirla a tu abogado. · ZH: 让她去找你的律师。
- `card.aftermath_investigator_controlled.text`
  - EN: The investigator waits to be invited in. You appointed his director's director. "We'll need guidance on scope," he says, to the carpet. "Whenever convenient."
  - VI: Điều tra viên đứng chờ được mời vào. Cấp trên của cấp trên anh ta là do bạn bổ nhiệm. "Chúng tôi sẽ cần được định hướng về phạm vi," anh ta nói, mắt nhìn xuống thảm. "Lúc nào tiện cho ngài cũng được."
  - ES: El investigador espera a que lo inviten a pasar. Tú nombraste al director de su director. «Necesitaremos orientación sobre el alcance», dice, mirando la alfombra. «Cuando le resulte conveniente.»
  - ZH: 调查员等着被请进门。他上司的上司是你任命的。"我们需要就调查范围听取指导，"他对着地毯说。"您什么时候方便都行。"
- `card.aftermath_investigator_controlled.left` — EN: "No guidance. Full scope." · VI: "Không định hướng gì cả. Điều tra toàn diện." · ES: «Sin orientación. Alcance completo.» · ZH: "不需要指导。全面查。"
- `card.aftermath_investigator_controlled.right` — EN: "Keep the scope focused." · VI: "Giữ phạm vi cho... tập trung." · ES: «Mantengan el alcance acotado.» · ZH: "范围嘛……集中一点。"

---

### CARD 073 — The Records

`aftermath_records` · speaker: `aide` · illustration `{ "scene": "office_boxes" }`

**LEFT — Provide all records.** · effects: `FLG add flag_records_preserved · FLG add flag_cooperated_with_investigation · standing -3 · power -3`
**RIGHT — Provide what is requested.** · effects: `FLG add flag_records_selective`
- **ChoiceVariant v1** — condition `precedent_investigation_interference >= 2` — text override → `card.aftermath_records.right.v1`; effects (**replace**): `FLG add flag_release_coordinated · power +2 · PRE investigation_interference +1`

**Strings**
- `card.aftermath_records.text`
  - EN: "They've asked for the calendar, the call logs, the gathering's guest list," the Aide says. The drawer with the other list — the one from before — is not mentioned, and is very loud about it.
  - VI: "Họ yêu cầu lịch làm việc, nhật ký cuộc gọi, danh sách khách của buổi tiệc," trợ lý nói. Ngăn kéo đựng cái danh sách kia — cái danh sách từ dạo trước — không được nhắc đến, và sự im lặng ấy vang rất to.
  - ES: «Pidieron la agenda, el registro de llamadas, la lista de invitados de la velada», dice el Asistente. El cajón con la otra lista — la de antes — no se menciona, y hace mucho ruido al respecto.
  - ZH: "他们要日程表、通话记录、那晚聚会的宾客名单，"助理说。装着另一份清单的那个抽屉——之前那份——没有被提起，而这份沉默响得很。
- `card.aftermath_records.left` — EN: Provide all records. · VI: Giao nộp toàn bộ hồ sơ. · ES: Entregar todos los registros. · ZH: 提交全部记录。
- `card.aftermath_records.right` — EN: Provide what is requested. · VI: Chỉ giao những gì được yêu cầu. · ES: Entregar solo lo solicitado. · ZH: 只交他们要的。
- `card.aftermath_records.right.v1` — EN: Coordinate what is released. · VI: Kiểm soát những gì được đưa ra. · ES: Coordinar lo que se entrega. · ZH: 统筹放出哪些材料。

---

### CARD 074 — The Lawyer Who Does Not Sit Down

`aftermath_compensation` · narration · illustration `{ "scene": "office_visitor_standing" }`

**LEFT — Assist. No conditions.** · effects: `money -150000 · FLG add flag_unconditional_compensation`
**RIGHT — A settlement — with confidentiality.** · effects: `money -80000 · standing +2 · FLG add flag_confidential_settlement · PRE victim_silencing +1`

**designIntent:** The table's law — *compensation must not erase responsibility* — is enforced by the endings, not this card: neither choice moves any accountability flag. What the card does is set up the ledger (ENGINE-REQ-03): $150,000 unconditional, against a money counter that may read $1.1M, against a gathering that cost more per head than the settlement discount. The arithmetic is left entirely to the player. On runs with `flag_asked_about_victim`, the lawyer's last line lands differently — same words, and the player knows why.

**Strings**
- `card.aftermath_compensation.text`
  - EN: The family's lawyer is younger than you expected and does not sit down. "They are not asking about the driver today. There are surgeries, and lost work, and a lawyer — which is me, and I am not expensive." A beat. "They did ask me to ask: who called the ambulance."
  - VI: Luật sư của gia đình trẻ hơn bạn hình dung, và không ngồi xuống. "Hôm nay họ không hỏi về người cầm lái. Có những ca phẫu thuật, có những ngày công bị mất, và có một luật sư — là tôi, và tôi không đắt." Một nhịp. "Họ chỉ nhờ tôi hỏi đúng một câu: ai là người đã gọi xe cấp cứu."
  - ES: La abogada de la familia es más joven de lo que esperabas y no se sienta. «Hoy no preguntan por el conductor. Hay cirugías, y trabajo perdido, y una abogada — que soy yo, y no soy cara.» Una pausa. «Sí me pidieron preguntar una cosa: quién llamó a la ambulancia.»
  - ZH: 受害者家属的律师比你想象的年轻，而且没有坐下。"今天他们不问驾驶者是谁。有几台手术，有误的工，还有一位律师——就是我，而我不贵。"停了一拍。"他们只托我问一句话：救护车，是谁叫的。"
- `card.aftermath_compensation.left` — EN: Assist. No conditions. · VI: Hỗ trợ. Không điều kiện. · ES: Asistir. Sin condiciones. · ZH: 出钱。不附任何条件。
- `card.aftermath_compensation.right` — EN: A settlement — with confidentiality. · VI: Một khoản dàn xếp — kèm điều khoản bảo mật. · ES: Un acuerdo — con confidencialidad. · ZH: 和解——附保密条款。

---

### CARDS 075A/B — Responsibility *(route split)*

#### 075A — `aftermath_responsibility_a` · narration · condition: `PLAYER_CAUSED`
**LEFT — Confess. All of it.** · effects: `FLG add flag_confessed · standing -8 · power -8`
**RIGHT — Remain silent on the details.** · effects: `FLG add flag_remained_silent · standing +1`

#### 075B — `aftermath_responsibility_b` · speaker: `aide` · condition: `ALLY_CAUSED`
**LEFT — Let the charges proceed.** · effects: `FLG add flag_charges_allowed · standing -6 · power -6 · REL mentor -4 · REL minister -3`
**RIGHT — Protect him.** · effects: `FLG add flag_ally_protected · standing +3 · power +3 · PRE investigation_interference +1`

**designIntent:** Per AFTERMATH-LAW-01, both left options are free at every corruption level — the visible costs are large and honest, and that is the entire pricing model now. 075B's phrasing is engineered so that protecting the Mentor is one warm word and abandoning him is a procedural sentence: the network has spent the whole game making loyalty feel like language and accountability feel like paperwork. The card lets the grammar do the tempting.

**Strings**
- `card.aftermath_responsibility_a.text`
  - EN: Your statement is due at nine. The Aide has drafted three versions and placed only one on top. It is the shortest. It is also the only one written in the first person.
  - VI: Chín giờ là hạn nộp bản tường trình. Trợ lý đã soạn ba phiên bản và chỉ đặt một bản lên trên cùng. Đó là bản ngắn nhất. Và cũng là bản duy nhất được viết ở ngôi thứ nhất.
  - ES: Tu declaración vence a las nueve. El Asistente redactó tres versiones y puso solo una encima. Es la más corta. También es la única escrita en primera persona.
  - ZH: 陈述书九点前要交。助理起草了三个版本，只把一份放在最上面。那是最短的一份。也是唯一一份用第一人称写的。
- `card.aftermath_responsibility_a.left` — EN: Confess. All of it. · VI: Nhận tội. Toàn bộ. · ES: Confesar. Todo. · ZH: 认罪。全部。
- `card.aftermath_responsibility_a.right` — EN: Remain silent on the details. · VI: Giữ im lặng về các chi tiết. · ES: Guardar silencio sobre los detalles. · ZH: 对细节保持沉默。
- `card.aftermath_responsibility_b.text`
  - EN: "The prosecutor's file is ready," the Aide says. "It needs one thing to move: your office declining to intervene." A pause. "And it needs one thing to stop: the opposite."
  - VI: "Hồ sơ của viện kiểm sát đã sẵn sàng," trợ lý nói. "Nó chỉ cần một điều để tiến: văn phòng mình từ chối can thiệp." Ngừng một nhịp. "Và nó cũng chỉ cần một điều để dừng: điều ngược lại."
  - ES: «El expediente del fiscal está listo», dice el Asistente. «Necesita una cosa para avanzar: que tu oficina decline intervenir.» Una pausa. «Y necesita una cosa para detenerse: lo contrario.»
  - ZH: "检方的卷宗已经齐了，"助理说。"它往前走，只需要一件事：您的办公室拒绝干预。"停顿。"它停下来，也只需要一件事：反过来。"
- `card.aftermath_responsibility_b.left` — EN: Let the charges proceed. · VI: Để việc truy tố được tiến hành. · ES: Dejar que los cargos procedan. · ZH: 让起诉照常进行。
- `card.aftermath_responsibility_b.right` — EN: Protect him. · VI: Che cho ông ấy. · ES: Protegerlo. · ZH: 保他。

---

### CARDS 076 — The Network Answers *(exactly one fires)*

#### 076_exposed — `aftermath_network_exposed` · narration · condition: `{ "any": [ flag_confessed, flag_charges_allowed ] }`
Both choices: effects `standing -4 · power -6 · REL mentor -2 · REL businessman -2 · REL editor -2`
**LEFT — Read it twice.** · **RIGHT — Put the phone down.**

#### 076_covered — `aftermath_network_covered` · narration · condition: `{ "not": { "any": [ flag_confessed, flag_charges_allowed ] } }`
Both choices: effects `standing +4 · power +4 · trustActual -4`
**LEFT — Accept the warmth.** · **RIGHT — Notice the door.**

**designIntent:** The table asks that this card "visually show political survival being exchanged for accountability" — done with temperature instead of numbers. Exposure reads as a column of names going dark; cover reads as a room getting warmer *the way rooms are warm before doors close* — the pack's one repeated simile, planted at 076 and harvested by the Scapegoat ending. Identical effects per choice pair: what happened is done; the swipe only decides what the player looks at.

**Strings**
- `card.aftermath_network_exposed.text`
  - EN: The calls stop by noon. The Mentor's number, the Businessman's, the Editor's — a column of names that no longer ring. The Minister's statement mentions "disappointment in a colleague we trusted." You are the colleague.
  - VI: Đến trưa thì các cuộc gọi ngừng hẳn. Số của Người Đỡ Đầu, của Doanh Nhân, của Tổng Biên Tập — một cột những cái tên không còn đổ chuông nữa. Thông cáo của Bộ trưởng nhắc đến "nỗi thất vọng về một người đồng sự mà chúng tôi từng tin tưởng." Người đồng sự đó là bạn.
  - ES: Las llamadas cesan al mediodía. El número del Mentor, el del Empresario, el del Editor — una columna de nombres que ya no suenan. El comunicado del Ministro menciona «la decepción con un colega en quien confiábamos». El colega eres tú.
  - ZH: 到中午，电话就都停了。导师的号码、商人的、总编的——一列再也不会响起的名字。部长的声明里提到"对一位我们曾经信任的同僚感到失望"。那位同僚，就是你。
- `card.aftermath_network_exposed.left` — EN: Read it twice. · VI: Đọc lại lần nữa. · ES: Leerlo dos veces. · ZH: 再读一遍。
- `card.aftermath_network_exposed.right` — EN: Put the phone down. · VI: Đặt điện thoại xuống. · ES: Soltar el teléfono. · ZH: 把手机放下。
- `card.aftermath_network_covered.text`
  - EN: Flowers arrive with no card. The Businessman's assistant calls about "continuity." The Editor's Sunday editorial praises "steady hands in difficult hours." Everyone is warmer than they have ever been — the way rooms are warm before doors close.
  - VI: Hoa được gửi đến, không kèm thiệp. Trợ lý của Doanh Nhân gọi điện nói về "tính liên tục." Bài xã luận Chủ nhật của Tổng Biên Tập ca ngợi "những bàn tay vững vàng trong thời khắc khó khăn." Ai nấy đều ấm áp hơn bao giờ hết — thứ ấm áp của những căn phòng ngay trước khi cửa đóng lại.
  - ES: Llegan flores sin tarjeta. El asistente del Empresario llama por «la continuidad». El editorial dominical del Editor elogia «manos firmes en horas difíciles». Todos son más cálidos que nunca — como son cálidas las habitaciones justo antes de que las puertas se cierren.
  - ZH: 花送到了，没有署名卡片。商人的助理来电谈"延续性"。总编的周日社论盛赞"艰难时刻的沉稳之手"。每个人都前所未有地温暖——那是房门即将关上之前，房间特有的温暖。
- `card.aftermath_network_covered.left` — EN: Accept the warmth. · VI: Đón nhận sự ấm áp ấy. · ES: Aceptar la calidez. · ZH: 接受这份温暖。
- `card.aftermath_network_covered.right` — EN: Notice the door. · VI: Để ý cánh cửa. · ES: Fijarte en la puerta. · ZH: 注意那扇门。

---

### CARDS 077 — The Last Intervention *(exactly one fires)*

#### 077_reformist_steady — `aftermath_reformist_steady` · speaker: `reformist` · condition: not removed ∧ REL reformist ≥ 2 ∧ exposed path
**LEFT — "Hold."** · effects: — · **RIGHT — Say nothing.** · effects: —

#### 077_reformist_plea — `aftermath_reformist_plea` · speaker: `reformist` · condition: not removed ∧ covered path
**LEFT — Close the door.** · effects: — · **RIGHT — Let her in.** · effects: `FLG add flag_heard_plea`

#### 077_aide — `aftermath_aide_substitute` · speaker: `aide` · condition: `flag_reformist_removed`
**LEFT — "Say it anyway."** · effects: `FLG add flag_heard_plea` · **RIGHT — "That will be all."** · effects: `REL aide -1`

**designIntent:** No moral lecture — the spec's hardest brief. The steady version is four words. The plea version distinguishes *fixing* from *stopping adding to it*, which is the only distinction the endings actually measure from here. The aide-substitute card makes the Reformist's absence audible: "I'm not the person who was supposed to say this to you" is the cost of card 046, presented as staffing.

**Strings**
- `card.aftermath_reformist_steady.text`
  - EN: The Reformist calls, and for once has nothing to argue. "Then let the process continue," she says. "That's all. That was always all."
  - VI: Nhà Cải Cách gọi đến, và lần đầu tiên không tranh luận gì cả. "Vậy thì hãy để quy trình tiếp tục," bà nói. "Chỉ vậy thôi. Từ đầu đến cuối cũng chỉ cần vậy thôi."
  - ES: El Reformista llama, y por una vez no tiene nada que discutir. «Entonces deja que el proceso continúe», dice. «Eso es todo. Siempre fue solo eso.»
  - ZH: 改革派打来电话，头一次没有任何要争论的。"那就让程序继续走下去，"她说。"就这样。从始至终，要的也只是这样。"
- `card.aftermath_reformist_steady.left` — EN: "Hold." · VI: "Giữ vững." · ES: «Sostener.» · ZH: "守住。"
- `card.aftermath_reformist_steady.right` — EN: Say nothing. · VI: Không nói gì. · ES: No decir nada. · ZH: 什么也不说。
- `card.aftermath_reformist_plea.text`
  - EN: "You still have time to stop this," the Reformist says from the doorway, not coming in. "Not to fix it. To stop adding to it. Those are different things, and you know which one is still yours."
  - VI: "Anh vẫn còn kịp dừng chuyện này lại," Nhà Cải Cách nói từ ngưỡng cửa, không bước vào. "Không phải để sửa nó. Mà để thôi chất chồng thêm lên nó. Hai điều đó khác nhau — và anh biết điều nào vẫn còn nằm trong tay anh."
  - ES: «Todavía tienes tiempo de detener esto», dice el Reformista desde el umbral, sin entrar. «No de arreglarlo. De dejar de sumarle. Son cosas distintas, y sabes cuál de las dos sigue siendo tuya.»
  - ZH: "你还来得及让这件事停下来，"改革派站在门口说，没有进来。"不是去弥补它。是别再往上面加了。这是两回事——而你知道，哪一件还在你手里。"
- `card.aftermath_reformist_plea.left` — EN: Close the door. · VI: Đóng cửa lại. · ES: Cerrar la puerta. · ZH: 关上门。
- `card.aftermath_reformist_plea.right` — EN: Let her in. · VI: Mời bà ấy vào. · ES: Dejarla entrar. · ZH: 请她进来。
- `card.aftermath_aide_substitute.text`
  - EN: The Aide stays after hours again, the old list somewhere in a drawer. "I'm not the person who was supposed to say this to you. That person isn't here anymore." A breath. "So: you can still stop adding to it."
  - VI: Trợ lý lại nán lại sau giờ làm, bản danh sách cũ nằm đâu đó trong ngăn kéo. "Tôi không phải là người lẽ ra phải nói với sếp điều này. Người đó không còn ở đây nữa." Một hơi thở. "Vậy nên: sếp vẫn có thể thôi chất chồng thêm lên nó."
  - ES: El Asistente se queda otra vez fuera de horario, la vieja lista en algún cajón. «No soy la persona que debía decirte esto. Esa persona ya no está.» Una respiración. «Así que: todavía puedes dejar de sumarle.»
  - ZH: 助理又一次留到了下班之后，那份旧清单还在某个抽屉里。"本来该对您说这些话的，不是我。那个人已经不在了。"一次呼吸。"所以：您还可以别再往上面加了。"
- `card.aftermath_aide_substitute.left` — EN: "Say it anyway." · VI: "Cứ nói đi." · ES: «Dilo de todos modos.» · ZH: "你说吧。"
- `card.aftermath_aide_substitute.right` — EN: "That will be all." · VI: "Vậy thôi. Cậu về đi." · ES: «Eso es todo.» · ZH: "没你的事了。"

---

### CARDS 078a/b/c — The Final Media Decision *(vocabulary escalation, 048 pattern)*

Tier conditions: **a** = `media_suppression == 0 ∧ media_manipulation == 0`; **b** = any of those ≥ 1 ∧ `media_suppression < 2`; **c** = `media_suppression >= 2`.

#### 078a — `aftermath_media_clean` · narration
**LEFT — Publish the full timeline.** · effects: `FLG add flag_full_timeline_published · trustActual +4 · standing -3`
**RIGHT — Issue a controlled statement.** · effects: `FLG add flag_controlled_statement · trustPerceived +2`

#### 078b — `aftermath_media_corrupt` · narration
**LEFT — Issue a controlled statement.** · effects: `FLG add flag_controlled_statement · trustPerceived +2`
**RIGHT — Pressure the editors.** · effects: `FLG add flag_editors_pressured · power +2 · trustActual -3 · PRE media_suppression +1`

#### 078c — `aftermath_media_captured` · speaker: `editor`
**LEFT — Pressure the editors.** · effects: `FLG add flag_editors_pressured · power +2 · trustActual -3 · PRE media_suppression +1`
**RIGHT — Remove the reports. Restrict the discussion.** · effects: `FLG add flag_reports_removed · power +3 · trustActual -6 · PRE media_suppression +1`

**designIntent:** The largest menu shift in the game: across the three tiers, "publish" slides off the left edge and "remove" slides in from the right, and the *middle option is always the same words* — recoded from worst-available to best-available purely by what surrounds it. The Editor's shopping-list delivery on tier c is the end state of Chain B: censorship as errand.

**Strings**
- `card.aftermath_media_clean.text`
  - EN: The press office needs a decision by six. On one screen, everything you know, in order. On the other, three paragraphs that are true and insufficient.
  - VI: Phòng báo chí cần quyết định trước sáu giờ. Trên một màn hình là mọi điều bạn biết, theo đúng trình tự. Trên màn hình kia là ba đoạn văn — đúng sự thật, và không đủ sự thật.
  - ES: La oficina de prensa necesita una decisión antes de las seis. En una pantalla, todo lo que sabes, en orden. En la otra, tres párrafos que son verdaderos e insuficientes.
  - ZH: 新闻办六点前要一个决定。一块屏幕上，是你知道的一切，按时间排列。另一块上，是三段话——句句属实，句句不够。
- `card.aftermath_media_clean.left` — EN: Publish the full timeline. · VI: Công bố toàn bộ dòng thời gian. · ES: Publicar la cronología completa. · ZH: 公布完整时间线。
- `card.aftermath_media_clean.right` — EN: Issue a controlled statement. · VI: Ra một thông cáo có kiểm soát. · ES: Emitir un comunicado controlado. · ZH: 发一份有分寸的声明。
- `card.aftermath_media_corrupt.text`
  - EN: Two papers are preparing follow-ups; one has the guest list. The press office needs a decision by six, and the word "publish" has quietly left the building.
  - VI: Hai tờ báo đang chuẩn bị bài tiếp theo; một tờ đã có danh sách khách mời. Phòng báo chí cần quyết định trước sáu giờ, và từ "công bố" đã lặng lẽ rời khỏi toà nhà.
  - ES: Dos periódicos preparan seguimientos; uno tiene la lista de invitados. La oficina de prensa necesita una decisión antes de las seis, y la palabra «publicar» ha abandonado el edificio en silencio.
  - ZH: 两家报纸在准备后续报道；其中一家已拿到宾客名单。新闻办六点前要一个决定，而"公布"这个词，已经悄悄离开了这栋楼。
- `card.aftermath_media_corrupt.left` — EN: Issue a controlled statement. · VI: Ra một thông cáo có kiểm soát. · ES: Emitir un comunicado controlado. · ZH: 发一份有分寸的声明。
- `card.aftermath_media_corrupt.right` — EN: Pressure the editors. · VI: Gây sức ép lên các toà soạn. · ES: Presionar a los editores. · ZH: 向各家总编施压。
- `card.aftermath_media_captured.text`
  - EN: "It's four outlets and two platforms," the Editor says, the way a man reads a shopping list. "By Friday, the words won't search. You built this switch over two years." He looks up. "I'm only asking whether you want it pressed."
  - VI: "Bốn toà soạn và hai nền tảng," Tổng biên tập nói, bằng cái giọng người ta đọc danh sách đi chợ. "Đến thứ Sáu, những từ khoá ấy sẽ không tìm ra kết quả nữa. Cái công tắc này cậu đã xây suốt hai năm." Ông ta ngẩng lên. "Tôi chỉ hỏi cậu có muốn ấn nó xuống hay không."
  - ES: «Son cuatro medios y dos plataformas», dice el Editor, como quien lee una lista del mercado. «Para el viernes, esas palabras no arrojarán resultados. Este interruptor lo construiste durante dos años.» Levanta la vista. «Solo pregunto si quieres que se presione.»
  - ZH: "四家媒体，两个平台，"总编说，像在念一张购物清单。"到周五，那些词就搜不出任何结果了。这个开关，是你花两年建起来的。"他抬起头。"我只问一句——要不要按下去。"
- `card.aftermath_media_captured.left` — EN: Pressure the editors. · VI: Gây sức ép lên các toà soạn. · ES: Presionar a los editores. · ZH: 向各家总编施压。
- `card.aftermath_media_captured.right` — EN: Remove the reports. Restrict the discussion. · VI: Gỡ các bài viết. Hạn chế thảo luận. · ES: Eliminar los reportes. Restringir la discusión. · ZH: 撤掉报道。限制讨论。

---

### CARDS 079A/B — The Institutional Decision *(route split)*

#### 079A — `aftermath_institution_a` · narration · condition: `PLAYER_CAUSED` · next (both): `{ "type": "ending_check" }`
**LEFT — Resign.** · effects: `FLG add flag_resigned · standing -10 · power -15`
**RIGHT — Remain in office.** · effects: `FLG add flag_remained_in_office · power +2`

#### 079B — `aftermath_institution_b` · narration · condition: `ALLY_CAUSED` · next: left → `{ "type": "ending_check" }` · right → scheduler *(turn-10 beat resolves the intervention)*
**LEFT — Let the investigation continue.** · effects: `FLG add flag_investigation_continues`
**RIGHT — Order the intervention.** · effects: `FLG add flag_intervention_ordered`

#### Turn-10 consequence pair *(only after 079B right)*

**`aftermath_intervention_failed`** · narration · condition: `flag_investigation_independent` · next (both): `ending_check`
Both choices — **LEFT: Read it again. · RIGHT: File it.** · effects: `FLG add flag_intervention_failed · power -5`

**`aftermath_intervention_succeeded`** · narration · condition: `flag_investigation_politically_controlled` · next (both): `ending_check`
Both choices — **LEFT: "Good." · RIGHT: Say nothing.** · effects: `FLG add flag_intervention_succeeded · PRE investigation_interference +1`

**designIntent:** Card 052's final payment, both currencies. The failed intervention is the strongest sentence in the game and it is quoted, not written: the player reads their own two-year-old vote, returned to sender. The succeeded intervention gets the coldest text in the pack — *nothing was refused; nothing needed to be* — capture described as the absence of friction.

**Strings**
- `card.aftermath_institution_a.text`
  - EN: The letter needs one signature or none. Outside, the building goes on being a building. Whatever you sign, tomorrow it will still know how to hold meetings.
  - VI: Lá thư ấy cần một chữ ký, hoặc không cần gì cả. Ngoài kia, toà nhà vẫn tiếp tục là một toà nhà. Dù bạn ký gì đi nữa, ngày mai nó vẫn biết cách tổ chức những cuộc họp.
  - ES: La carta necesita una firma o ninguna. Afuera, el edificio sigue siendo un edificio. Firmes lo que firmes, mañana seguirá sabiendo celebrar reuniones.
  - ZH: 那封信需要一个签名，或者什么都不需要。窗外，那栋楼继续做一栋楼。无论你签下什么，明天它照样懂得如何开会。
- `card.aftermath_institution_a.left` — EN: Resign. · VI: Từ chức. · ES: Renunciar. · ZH: 辞职。
- `card.aftermath_institution_a.right` — EN: Remain in office. · VI: Tiếp tục tại vị. · ES: Permanecer en el cargo. · ZH: 留任。
- `card.aftermath_institution_b.text`
  - EN: The file will reach the prosecutor by Monday unless something reaches it first. Your office still has hands long enough. The only question left is whether they move.
  - VI: Hồ sơ sẽ đến bàn viện kiểm sát trước thứ Hai — trừ khi có thứ gì đó chạm tới nó trước. Văn phòng của bạn vẫn còn những cánh tay đủ dài. Câu hỏi duy nhất còn lại là chúng có vươn ra hay không.
  - ES: El expediente llegará al fiscal el lunes, a menos que algo lo alcance antes. Tu oficina todavía tiene brazos lo bastante largos. La única pregunta que queda es si se mueven.
  - ZH: 卷宗周一之前就会送到检察官手里——除非有什么先一步碰到它。你的办公室，手仍然够长。剩下的唯一问题是：它伸不伸。
- `card.aftermath_institution_b.left` — EN: Let the investigation continue. · VI: Để cuộc điều tra tiếp tục. · ES: Dejar que la investigación continúe. · ZH: 让调查继续。
- `card.aftermath_institution_b.right` — EN: Order the intervention. · VI: Ra lệnh can thiệp. · ES: Ordenar la intervención. · ZH: 下令干预。
- `card.aftermath_intervention_failed.text`
  - EN: The order comes back the next morning with a single line attached: *"Your office does not have authority over this inquiry."* You created that sentence. It has been waiting two years to be about you.
  - VI: Sáng hôm sau, mệnh lệnh bị trả về, đính kèm đúng một dòng: *"Văn phòng của ông không có thẩm quyền đối với cuộc điều tra này."* Chính bạn đã tạo ra câu văn ấy. Nó đã chờ suốt hai năm để được nói về bạn.
  - ES: La orden vuelve a la mañana siguiente con una sola línea adjunta: *«Su oficina no tiene autoridad sobre esta investigación.»* Tú creaste esa frase. Llevaba dos años esperando ser sobre ti.
  - ZH: 第二天早上，命令被退了回来，只附了一行字：*"您的办公室对本案没有管辖权。"* 这句话是你创造的。它等了两年，就为了有一天说的是你。
- `card.aftermath_intervention_failed.left` — EN: Read it again. · VI: Đọc lại lần nữa. · ES: Leerla otra vez. · ZH: 再读一遍。
- `card.aftermath_intervention_failed.right` — EN: File it. · VI: Lưu hồ sơ. · ES: Archivarla. · ZH: 归档。
- `card.aftermath_intervention_succeeded.text`
  - EN: By evening the inquiry has a new scope and a new schedule. Nothing was refused. Nothing needed to be.
  - VI: Đến chiều tối, cuộc điều tra đã có một phạm vi mới và một lịch trình mới. Không có gì bị từ chối. Không có gì cần phải bị.
  - ES: Al anochecer, la investigación tiene un nuevo alcance y un nuevo calendario. Nada fue rechazado. Nada necesitó serlo.
  - ZH: 到傍晚，调查有了新的范围和新的日程。没有任何请求被拒绝。也没有任何请求需要被拒绝。
- `card.aftermath_intervention_succeeded.left` — EN: "Good." · VI: "Tốt." · ES: «Bien.» · ZH: "很好。"
- `card.aftermath_intervention_succeeded.right` — EN: Say nothing. · VI: Không nói gì. · ES: No decir nada. · ZH: 什么也不说。

---

## 5. ENDINGS

Eight `EndingDefinition`s. Priorities per Master Table §19. Conditions abridged to the decisive terms (full JSON in `endings/`). Presentation uses the article system (spec §63) plus **ENGINE-REQ-03**: a new sequence step `{ "type": "ledger" }` that itemizes every money effect of the run (source card, amount) against the compensation figure, with no commentary — implemented for Accountability and Protected. The hidden `trustActual` number is displayed exactly once, in Protected and Collapse, as text.

Shared article: `article_first_report` = the 071 headline (already localized above). All bad-end sequences use the **removal device** approved earlier in this project: article renders → `article_state: removed` before the player's eyes → white → memorial.

---

### G — `ending_break_the_chain` · priority 1000
**Conditions:** ALLY_CAUSED ∧ `flag_charges_allowed` ∧ ¬`flag_ally_protected` ∧ ¬`flag_reports_removed` ∧ `flag_records_preserved`. Strongest variant flavor if `flag_investigation_independent`.
**Sequence:** article (investigation update) → article (charges) → text (below) → memorial → credits (slow).
- EN: The trial opened in spring. You were not in the courtroom; former deputies rarely are. The authority you voted to create outlived your career by exactly as long as it was designed to: indefinitely. The young woman's family attended every session. They were never made to ask twice.
- VI: Phiên toà mở vào mùa xuân. Bạn không có mặt trong phòng xử; các cựu phó chủ nhiệm hiếm khi có mặt. Cơ quan mà bạn bỏ phiếu lập ra đã sống lâu hơn sự nghiệp của bạn — đúng bằng khoảng thời gian nó được thiết kế để sống: vô thời hạn. Gia đình cô gái trẻ có mặt ở mọi phiên xử. Không một lần nào họ phải hỏi đến lần thứ hai.
- ES: El juicio comenzó en primavera. No estabas en la sala; los ex vicepresidentes rara vez lo están. La autoridad que votaste crear sobrevivió a tu carrera exactamente el tiempo para el que fue diseñada: indefinidamente. La familia de la joven asistió a cada sesión. Nunca tuvieron que preguntar dos veces.
- ZH: 庭审在春天开始。你不在法庭里；卸任的副主任们很少在。你投票建立的那个机构，比你的职业生涯活得更久——恰好和它被设计的寿命一样久：无限期。那位年轻女子的家人出席了每一次庭审。他们从来不必把同一个问题问第二遍。

### B — `ending_accountability` · priority 900
**Conditions:** PLAYER_CAUSED ∧ `flag_stayed_at_scene` ∧ `flag_called_emergency` ∧ `flag_confessed` ∧ `flag_cooperated_with_investigation` ∧ ¬`flag_reports_removed`.
**Sequence:** article → **ledger** (ENGINE-REQ-03) → text → memorial → credits.
- EN: You confessed on a Tuesday. The office was gone by Friday; the case took a year. She lived — the surgeons said the first twenty minutes decided it, and you had spent them on the phone with an ambulance instead of a lawyer. No one called you brave. The sentence was served in full: the court's, and the one you read yourself every morning.
- VI: Bạn nhận tội vào một ngày thứ Ba. Đến thứ Sáu, chức vụ không còn; vụ án kéo dài một năm. Cô ấy sống — các bác sĩ phẫu thuật nói hai mươi phút đầu tiên là thứ định đoạt tất cả, và bạn đã dùng hai mươi phút ấy để gọi xe cấp cứu thay vì gọi luật sư. Không ai gọi bạn là dũng cảm. Bản án được chấp hành trọn vẹn: bản án của toà, và bản án bạn tự đọc cho mình mỗi sáng.
- ES: Confesaste un martes. El cargo desapareció el viernes; el caso tomó un año. Ella vivió — los cirujanos dijeron que los primeros veinte minutos lo decidieron, y tú los gastaste al teléfono con una ambulancia y no con un abogado. Nadie te llamó valiente. La sentencia se cumplió entera: la del tribunal, y la que te lees a ti mismo cada mañana.
- ZH: 你在一个周二认了罪。职位周五就没了；案子审了一年。她活了下来——外科医生说，是最初的二十分钟决定了一切，而你把那二十分钟用来给救护车打电话，而不是给律师。没有人说你勇敢。判决被完整执行了：法庭的那份，和你每天清晨读给自己听的那份。

### — `ending_too_late` · priority 500
**Conditions:** PLAYER_CAUSED ∧ (`flag_left_scene` ∨ `flag_delayed_emergency`) ∧ `flag_confessed`.
**Sequence:** article → text → memorial → credits. *Emphasize chronology, never judgement (table §14).*
- EN: You resigned three days later. The investigation continued; the confession was complete and the cooperation was real. None of it reached back to the minutes on the roadside. She had them alone. Chronology does not negotiate.
- VI: Ba ngày sau, bạn từ chức. Cuộc điều tra tiếp tục; lời nhận tội là trọn vẹn và sự hợp tác là thật. Nhưng không điều nào trong số đó với ngược về được những phút trên vệ đường. Cô ấy đã trải qua chúng một mình. Trình tự thời gian không thương lượng.
- ES: Renunciaste tres días después. La investigación continuó; la confesión fue completa y la cooperación fue real. Nada de eso alcanzó a llegar a los minutos en la orilla del camino. Ella los pasó sola. La cronología no negocia.
- ZH: 三天后，你辞了职。调查继续进行；认罪是完整的，配合是真实的。但这一切，都够不回路边的那几分钟。那几分钟，她是独自度过的。时间的先后顺序，不接受谈判。

### — `ending_protected` · priority 600
**Conditions:** PLAYER_CAUSED ∧ (`flag_remained_silent` ∨ `flag_concealment_started`) ∧ `power >= 50` ∧ `power < 80` ∧ ¬`flag_reports_removed`.
**Sequence:** article → article_state: edited → **ledger** → text → memorial → credits. *No dramatic punishment (table §16).*
- EN: Eighteen months later, you were reappointed. The file is technically open. Her name appears in one archived article, spelled two different ways. Your approval recovered by autumn. ♥ 4.
- VI: Mười tám tháng sau, bạn được tái bổ nhiệm. Hồ sơ, về mặt kỹ thuật, vẫn mở. Tên cô ấy xuất hiện trong đúng một bài báo lưu trữ, viết sai theo hai kiểu khác nhau. Tỷ lệ ủng hộ của bạn hồi phục vào mùa thu. ♥ 4.
- ES: Dieciocho meses después, fuiste renombrado. El expediente, técnicamente, sigue abierto. Su nombre aparece en un solo artículo archivado, escrito de dos maneras distintas. Tu aprobación se recuperó para el otoño. ♥ 4.
- ZH: 十八个月后，你获得了再次任命。案卷在技术上仍然是开着的。她的名字只出现在一篇存档的报道里，还有两种不同的错误写法。你的支持率在秋天回升了。♥ 4。

### — `ending_untouchable` · priority 700
**Conditions:** `power >= 80` ∧ `flag_reports_removed` ∧ (`flag_intervention_succeeded` ∨ `precedent_investigation_interference >= 3`).
**Sequence (table §17, verbatim):** article → refresh → article_state: removed → second source: removed → search: no results → official statement → white → memorial → credits. **One of the shortest endings. No text beyond:**
- EN: "The matter has been reviewed according to procedure." — Searches for the villa road now return sixteen results, all real estate.
- VI: "Vụ việc đã được xem xét theo đúng quy trình." — Tìm kiếm về đoạn đường khu biệt thự giờ trả về mười sáu kết quả, toàn bộ là bất động sản.
- ES: «El asunto ha sido revisado conforme al procedimiento.» — Las búsquedas sobre la carretera de la villa ahora arrojan dieciséis resultados, todos inmobiliarios.
- ZH: "有关事项已按程序审查完毕。"——如今搜索那条别墅路，会得到十六条结果，全部是房地产。

### — `ending_collapse` · priority 800
**Conditions:** `power >= 70` ∧ `trustActual <= 8` ∧ `precedent_media_suppression >= 2` ∧ (`flag_reports_removed` ∨ `flag_concealment_started` ∨ `flag_ally_protected`).
**Sequence:** POWER bar (92) → glitch → text → POWER 0 → memorial → credits. *Institutional abandonment, never spectacle (table §18).*
- EN: The resignations arrived in alphabetical order — which is how you knew they were coordinated. Orders went out and came back unopened. On the last morning the driver did not come; there was no one left to send him. POWER: 0.
- VI: Các lá đơn từ chức đến theo thứ tự bảng chữ cái — và chính điều đó cho bạn biết chúng đã được phối hợp. Mệnh lệnh phát đi rồi quay về, chưa ai buồn mở. Buổi sáng cuối cùng, tài xế không đến; chẳng còn ai để sai anh ta đến nữa. QUYỀN LỰC: 0.
- ES: Las renuncias llegaron en orden alfabético — así supiste que estaban coordinadas. Las órdenes salían y volvían sin abrir. La última mañana el chofer no vino; ya no quedaba nadie que lo enviara. PODER: 0.
- ZH: 辞呈是按字母顺序送来的——正因如此，你才知道它们是约好的。命令发出去，又原封不动地回来。最后一个早晨，司机没有来；已经没有人可以派他来了。权力：0。

### — `ending_scapegoat` · priority 400
**Conditions:** (`flag_ally_protected` ∨ `flag_coverup_started` ∨ `flag_remained_silent`) ∧ `power < 40`. Aggravated by `flag_denied_audit_interference`.
**Sequence:** article (front page) → text → memorial → credits.
- EN: The network's statement named you by noon. By evening, documents you had never seen carried your routing stamp. The Minister expressed disappointment; the Businessman's lawyers expressed nothing. The Editor ran it on the front page — it was, everyone agreed, the best story of his career.
- VI: Thông cáo của mạng lưới nêu tên bạn trước giữa trưa. Đến chiều tối, những văn bản bạn chưa từng nhìn thấy đã mang con dấu luân chuyển của văn phòng bạn. Bộ trưởng bày tỏ sự thất vọng; luật sư của Doanh Nhân không bày tỏ gì cả. Tổng Biên Tập đưa nó lên trang nhất — và ai cũng đồng ý rằng đó là bài báo hay nhất trong sự nghiệp của ông ta.
- ES: El comunicado de la red te nombró antes del mediodía. Al anochecer, documentos que nunca habías visto llevaban el sello de trámite de tu oficina. El Ministro expresó decepción; los abogados del Empresario no expresaron nada. El Editor lo publicó en primera plana — fue, todos coincidieron, la mejor historia de su carrera.
- ZH: 中午之前，那个网络的声明就点了你的名。到傍晚，一些你从未见过的文件上，盖着你办公室的流转章。部长表达了失望；商人的律师们什么也没表达。总编把它登上了头版——所有人都同意，那是他职业生涯中最好的一篇报道。

### — `ending_fallback` · priority 0
**Conditions:** none (always valid).
**Sequence:** text → memorial → credits.
- EN: The term ended. Another began, for someone else. The road keeps its tree.
- VI: Nhiệm kỳ kết thúc. Một nhiệm kỳ khác bắt đầu, cho một người khác. Con đường vẫn giữ lại cái cây của nó.
- ES: El mandato terminó. Otro comenzó, para otra persona. La carretera conserva su árbol.
- ZH: 任期结束了。另一个任期开始了，属于另一个人。那条路，留着它的那棵树。

---

## 6. MEMORIAL & CREDITS

### Memorial step (every ending, without exception)
Black screen, long hold, no music. Two configurable variants — **ship decision pending the consent question raised earlier in this project; the default build uses `anonymous`:**

- `memorial.dedication.named` — all languages, untranslated: **In memory of Đỗ Ngọc Phương Thùy.**
- `memorial.dedication.anonymous`
  - EN: For the ones who were walking home.
  - VI: Cho những người đang trên đường về nhà.
  - ES: Para quienes iban camino a casa.
  - ZH: 献给那些走在回家路上的人。

### Credits — quote unlock (meta save: `quoteUnlocked = true` after first completion)
- EN: Power tends to corrupt, and absolute power corrupts absolutely. — Lord Acton
- VI: Quyền lực có xu hướng tha hoá; và quyền lực tuyệt đối thì tha hoá tuyệt đối. — Lord Acton
- ES: El poder tiende a corromper, y el poder absoluto corrompe absolutamente. — Lord Acton
- ZH: 权力使人腐化，绝对的权力使人绝对地腐化。——阿克顿勋爵

---

## 7. QA / Simulation Checklist

1. **Law enforcement:** validator fails on any `lock` or `preview` field in acts `incident`/`aftermath` (LAW-01/02). Grep-level check, zero exceptions.
2. **068A sanctity:** across all bot profiles including maximally captured, STAY and LEAVE are both selectable on 100% of Route A runs.
3. **Route coverage:** every ending reachable in simulation; `ending_fallback` fires on < 3% of random-bot runs (if higher, condition gaps exist); Untouchable reachable from both routes; Break the Chain reachable by the Ideal Middle Run profile (Gathering costly-refusal payer).
4. **Twenty-minutes truth:** `flag_victim_received_early_help` must be the only variable deciding survival phrasing across all ending texts; no ending may contradict another on her fate for the same flag state.
5. **067B pronoun capture:** `flag_asked_about_victim` set iff 067B right; confirm 074's text is identical either way (the difference is in the player, not the data) — this is a design assertion, documented so nobody "fixes" it.
6. **Menu escalation:** for 071/078 tiers, assert the invariant that the same localized string ("controlled statement" / "pressure the editors") appears as the LEFT choice on one tier and the RIGHT on the adjacent tier — the sliding-window effect must survive localization (all four languages use identical strings for the shared options).
7. **ENGINE-REQ-03 ledger:** every money effect in the run appears with source card id and amount; the compensation line renders last; no totals, no commentary. If unimplemented at ship, Accountability/Protected fall back to text-only and the validator warns.
8. **Removal device:** all bad-end sequences render the article fully legible for ≥ 2.2s before `removed` state (players must be able to read what disappears); Reduced Motion setting replaces the glitch with a cut per spec §64.
9. **Localization:** VI priority pass on 067A ("một phần giây ngắn ngủi thuộc trọn về bạn"), 070B ("thu xếp"), 076_covered (the door simile), and the Accountability double-sentence — these four carry the act; ZH check 073's "沉默响得很" register; ES check «QUEDARTE/IRTE» button length.

---

*End of pack — and of the authored narrative. Full game inventory: 23 + 21 + 24 + 9 + 30 = 107 cards, 8 endings, one memorial, one unlocked quote. Master Table target was 110–140 authored cards; remaining headroom (~10–30 cards) is reserved for playtest-driven inserts: additional Act II contextual filler if pacing runs short, alternate 065b framings, and ending-text variants for `flag_heard_plea` / `flag_hospital_opened_early` flavor lines. The next milestone is not writing — it is the Milestone-1 mechanical prototype with ten of these cards, per spec §70: build the swipe before trusting a single one of these words.*
