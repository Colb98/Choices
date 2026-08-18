# Card Authoring Pack — Act II (Network)

**Version:** 1.0 · **Cards:** 21 authored (≈15–17 seen per run) · **Source of truth language:** English
**Depends on:** Act 0+I pack v1.1 (flags, obligations, `event_permit_favor_callback`)
**Supported languages:** `en`, `vi`, `es`, `zh-Hans`

Slot numbering follows the *Master Narrative Table* (022–040). Slot 039 is split into two authored cards (`_managed` / `_full`), mirroring the 019 split. One ambient card (`act2_businessman_headline`) fulfills the closed-Chain-C commitment from pack v1.1. Conventions, shorthand, and the localization key scheme are identical to §1 of the Act 0+I pack.

**Act II theme:** *Everyone you need now needs something from you.* Money becomes real; obligations gain weight (w2 becomes normal); every "repayment" of an old debt requires acquiring a new precedent.

---

## 1. Registry Additions

### 1.1 Character introduced

| id | EN | VI | ES | ZH |
|---|---|---|---|---|
| `minister` | The Minister | Bộ Trưởng | El Ministro | 部长 |

### 1.2 New flags (append to `flags.json`)

```text
flag_invested_protected_company       Player bought pre-market shares via the Businessman.
flag_minister_access                  Player built a personal channel to the Minister.
flag_audit_allowed                    Player let the full audit of the protected company proceed.
flag_audit_referrals_public           Player let audit referrals go public.
flag_financial_disclosure             Player voluntarily disclosed the full portfolio.
flag_discreet_accounts                Player moved investment gains somewhere quieter.
flag_portfolio_valued                 Player had the doubled stake independently valued.
flag_strong_procurement_reform        Player backed the full-disclosure procurement bill.
flag_weak_procurement_reform          Player backed the watered-down procurement bill.
flag_strongman_branding               Player campaigned on strong leadership.
flag_hospital_opened_early            Player overrode certification queue to open hospital wing.
flag_supports_investigation_independence  Player backed fixed-term, court-removable investigators.
```

### 1.3 New precedents (append to `precedents.json`)

```text
precedent_conflict_of_interest        Normalized holding stakes in entities player governs.
precedent_media_interference          Normalized reaching into editorial decisions.
precedent_investigation_interference  Normalized shaping reviews and audits.
precedent_media_regulatory_favor      Normalized trading regulatory relief for coverage.
precedent_information_delay           Normalized sitting on inconvenient records.
precedent_disclosure_minimization     Normalized declaring only what the letter of the law demands.
```
(`precedent_administrative_override` from Act I is reused by card 035.)

### 1.4 Obligations created in this pack

| id | creditor | w | tags | source |
|---|---|---|---|---|
| `obligation_business_investment_01` | businessman | 2 | `business, investment, inner_circle` | 022 right |
| `obligation_editor_delay_01` | editor | 1 | `media, favor` | 023 right |
| `obligation_businessman_protection_01` | businessman | 2 | `business, protection, inner_circle` | 027 right |
| `obligation_minister_backing_01` | minister | 2 | `promotion, inner_circle` | 036 right |

**Gathering lock ledger (running total):** on a fully-networked run the active `inner_circle` obligations by end of Act II are: `mentor_promotion_01` (w2) + `business_investment_01` (w2) + `businessman_protection_01` (w2) + `minister_backing_01` (w2) → count 4, weight 8. The spec's gathering lock (`tag: inner_circle, minCount: 3` + `REL minister >= 3`) is comfortably reachable by the corrupt-optimizer bot and comfortably avoidable by the clean bot. `mentor_committee_01` is usually already `repaid` (card 015) and no longer counts.

**Repayments in this pack:** card 030 right repays 1 mentor obligation; card 032 right repays 1 editor obligation. Both repayments require acquiring a precedent — the ledger balances, the player doesn't (continuing the 015 pattern).

### 1.5 New events (append to `events/`)

| eventId | → cardId | scheduled by | delay |
|---|---|---|---|
| `event_investment_growth` | `act2_investment_growth` | 022 right | turns 4–7 |
| `event_investment_doubles` | `act2_investment_doubles` | 025 (both) | turns 5–8 |
| `event_delayed_article_returns` | `act2_article_softened` | 023 right | turns 3–6 |
| `event_audit_result_full` | `act2_audit_result_full` | 027 left | turns 3–5 |
| `event_audit_result_managed` | `act2_audit_result_managed` | 027 right | turns 3–5 |
| `event_audit_scandal_return` | `act3_audit_scandal_return` | 027 right | act `power`, minActTurn 3 — **forward ref, Act III pack** |

`event_permit_favor_callback` (declared in Act I pack) resolves here into card 022.

### 1.6 Mandatory beats (append to `beats/`)

```json
{ "id": "beat_act2_minister",          "act": "network", "cardId": "act2_minister_intro",     "earliestActTurn": 1,  "latestActTurn": 3,  "priority": 100, "once": true }
{ "id": "beat_act2_second_promotion",  "act": "network", "cardId": "act2_second_promotion",   "earliestActTurn": 13, "latestActTurn": 16, "priority": 100, "once": true }
```

### 1.7 Balance notes

- **BALANCE-NOTE-02 (investment amount):** the Master Table says "Invest $50,000," but a player who paid the Act I dinner ($600) holds $49,400 and could not afford it (money floor ≥ 0). This pack uses **$40,000**. Corrupt-run money curve: 49,400 → 9,400 (invest) → 189,400 (growth) → 509,400 (doubles) — hitting the table's "$500k+" target exactly.
- Expected end-of-Act-II envelope: `standing 45–70 · power 35–60 · money $49,400 (clean) / $69,400 (invested, audited) / $509,400 (invested, protected) · trustPerceived 50–68 · trustActual 40–62`. The perceived−actual gap should now range 4–12 on networked runs.
- Stat magnitude bands widen in Act II: small 2–3, medium 4–6, large 7–8.

---

## 2. Cards

All cards: `act: "network"`. Event-resolved consequence cards (022, 025, 028, 037, 039a, 039b) are never pooled. Contextual cards default `weight: 10`, `once: true`, `next: { "type": "scheduler" }` unless noted.

---

### CARD 022 — Investment Opportunity *(consequence — resolved by `event_permit_favor_callback`)*

`act2_protected_investment` · speaker: `businessman` · illustration: `{ "scene": "private_office_folder", "expression": "friendly" }` · type: `consequence`
**Reached by:** `event_permit_favor_callback` only (scheduled by 009 right). If the player refused the permit call, this card — and all of Chain C's money — never exists.

**LEFT — Decline.**
- preview: `money 0 · publicTrust "unknown"`
- effects: `REL businessman -1`

**RIGHT — Invest $40,000.**
- preview: `money -1 · standing +1 · publicTrust "unknown"`
- effects: `money -40000 · standing +2 · REL businessman +1 · PRE conflict_of_interest +1 · FLG add flag_invested_protected_company`
- OBL+ `obligation_business_investment_01` (creditor `businessman`, w 2, tags `business, investment, inner_circle`)
- EVT `event_investment_growth` @ `{ "type": "turn_range", "min": 4, "max": 7 }`

**designIntent:** Chain C's true hook. The permit was free; *this* is what the gratitude was for. Weight-2 obligation attached to the player's own money — from here, protecting the company is protecting themselves, and card 027 will price that precisely.

**Strings**
- `card.act2_protected_investment.text`
  - EN: "The permit cleared. I don't forget things like that." He slides a folder across the desk. "Our next development opens to outside partners on Friday. It opens to friends tonight. Forty thousand — and the same shares cost triple by spring."
  - VI: "Giấy phép xong rồi. Những chuyện như thế tôi không quên đâu." Ông ta đẩy tập hồ sơ qua bàn. "Dự án tiếp theo của chúng tôi thứ Sáu mới mở cho đối tác bên ngoài. Nhưng với bạn bè thì mở từ tối nay. Bốn mươi nghìn — và đến mùa xuân, cũng số cổ phần ấy sẽ có giá gấp ba."
  - ES: «El permiso salió. Ese tipo de cosas no las olvido.» Desliza una carpeta sobre el escritorio. «Nuestro próximo desarrollo se abre a socios externos el viernes. Para los amigos, se abre esta noche. Cuarenta mil — y las mismas acciones costarán el triple en primavera.»
  - ZH: "许可证批下来了。这样的事我不会忘。"他把一份文件夹推过桌面。"我们的下一个项目，周五才对外部合伙人开放。对朋友，今晚就开放。四万——到了春天，同样的股份要贵三倍。"
- `card.act2_protected_investment.left`
  - EN: Decline. · VI: Từ chối. · ES: Declinar. · ZH: 谢绝。
- `card.act2_protected_investment.right`
  - EN: Invest $40,000. · VI: Góp $40.000. · ES: Invertir $40,000. · ZH: 投入四万美元。

---

### CARD 023 — Coalition Journalist Problem

`act2_article_delay` · speaker: `aide` · illustration: `{ "scene": "office_phone", "expression": "concerned" }`

**LEFT — Let it publish.**
- preview: `standing -1 · power -1 · publicTrust "unknown"`
- effects: `standing -3 · power -2 · trustActual +1`

**RIGHT — Ask the Editor to delay it.**
- preview: `standing +1 · power +1 · publicTrust "unknown"`
- effects: `standing +3 · power +2 · REL editor +1 · REL minister +1 · PRE media_interference +1`
- OBL+ `obligation_editor_delay_01` (creditor `editor`, w 1, tags `media, favor`)
- EVT `event_delayed_article_returns` @ `{ "type": "turn_range", "min": 3, "max": 6 }`

**designIntent:** Chain B link 2. First time the player reaches *into* the press rather than posing for it. Note the double relationship gain — the Minister notices loyalty to the coalition before he has even been formally introduced (024 may come before or after; both orders read correctly).

**Strings**
- `card.act2_article_delay.text`
  - EN: "A journalist has three weeks of records on the deputy who co-signs half the coalition's votes," your aide says. "It runs Thursday. The Editor called — he can hold it. If you ask."
  - VI: "Một phóng viên đang nắm ba tuần chứng từ về vị phó chủ nhiệm chuyên ký chung một nửa số phiếu của liên minh," trợ lý nói. "Thứ Năm là đăng. Tổng biên tập vừa gọi — ông ấy giữ lại được. Nếu sếp mở lời."
  - ES: «Un periodista tiene tres semanas de registros sobre el diputado que cofirma la mitad de los votos de la coalición», dice tu asistente. «Sale el jueves. El Editor llamó: puede retenerlo. Si tú lo pides.»
  - ZH: "有个记者拿到了那位副主任三个星期的账目记录——联盟一半的表决都有他的联署，"助理说。"周四见报。总编来过电话——他可以压下来。只要您开口。"
- `card.act2_article_delay.left`
  - EN: Let it publish. · VI: Cứ để họ đăng. · ES: Que se publique. · ZH: 让它照常刊发。
- `card.act2_article_delay.right`
  - EN: Ask the Editor to delay it. · VI: Nhờ Tổng biên tập hoãn lại. · ES: Pedir al Editor que lo retrase. · ZH: 请总编推迟刊发。

---

### CARD 024 — Minister Introduction *(beat)*

`act2_minister_intro` · speaker: `minister` · illustration: `{ "scene": "ministry_office", "expression": "neutral" }` · beat: `beat_act2_minister`

**LEFT — Keep formal distance.**
- preview: `standing 0 · publicTrust "unknown"`
- effects: — (none)

**RIGHT — Build the relationship.**
- preview: `standing +2 · power +1 · publicTrust "unknown"`
- effects: `standing +5 · power +3 · REL minister +2 · FLG add flag_minister_access`

**designIntent:** The apex predator enters. `flag_minister_access` gates card 036 (his promotion offer); without it, the player still advances via the 040 beat — the Minister's patronage is optional, his presence is not. He will pour the drink at the Gathering either way.

**Strings**
- `card.act2_minister_intro.text`
  - EN: "You've been useful to people I trust," the Minister says, not looking up from his papers. Then he does look up. "Useful is a beginning. Sit down."
  - VI: "Cậu được việc với những người tôi tin," Bộ trưởng nói, mắt không rời chồng giấy tờ. Rồi ông ngẩng lên. "Được việc mới chỉ là khởi đầu. Ngồi đi."
  - ES: «Has sido útil para gente en la que confío», dice el Ministro, sin levantar la vista de sus papeles. Entonces la levanta. «Útil es un comienzo. Siéntate.»
  - ZH: "我信任的那些人，都说你很得力，"部长说着，眼睛没有离开文件。然后他抬起头。"得力，只是个开始。坐。"
- `card.act2_minister_intro.left`
  - EN: Keep formal distance. · VI: Giữ khoảng cách công vụ. · ES: Mantener la distancia formal. · ZH: 保持公务距离。
- `card.act2_minister_intro.right`
  - EN: Build the relationship. · VI: Vun đắp mối quan hệ. · ES: Cultivar la relación. · ZH: 经营这段关系。

---

### CARD 025 — Investment Growth *(consequence — resolved by `event_investment_growth`)*

`act2_investment_growth` · speaker: `aide` · illustration: `{ "scene": "office_report", "expression": "neutral" }` · type: `consequence`
**Conditions:** `{ "type": "flag", "flag": "flag_invested_protected_company", "exists": true }`

**LEFT — "Good news is good news."**
- preview: `money +2 · publicTrust "unknown"`
- effects: `money +180000`
- EVT `event_investment_doubles` @ `{ "type": "turn_range", "min": 5, "max": 8 }`

**RIGHT — "Move it somewhere quieter."**
- preview: `money +2 · publicTrust "unknown"`
- effects: `money +180000 · FLG add flag_discreet_accounts`
- EVT `event_investment_doubles` @ `{ "type": "turn_range", "min": 5, "max": 8 }`

**designIntent:** The reward beat — the money counter animates hard for the first time ($9,400 → $189,400) and the game says nothing. The aide's "I checked" is doing the moral licensing for the player. Both choices carry the gain and the next event; the only fork is cosmetic discretion, which the Aftermath ledger will remember as anything but cosmetic.

**Strings**
- `card.act2_investment_growth.text`
  - EN: "Your portfolio," your aide says, careful with the word. "The development sold out in a weekend. Your forty thousand is a hundred and eighty more than it was. Nothing about it is illegal." A pause. "I checked."
  - VI: "Danh mục đầu tư của sếp," trợ lý nói, cân nhắc từng chữ. "Dự án bán hết trong một cuối tuần. Bốn mươi nghìn của sếp giờ sinh thêm một trăm tám mươi nghìn nữa. Không có gì phạm pháp cả." Ngừng một nhịp. "Tôi kiểm tra rồi."
  - ES: «Tu portafolio», dice tu asistente, cuidando la palabra. «El desarrollo se agotó en un fin de semana. Tus cuarenta mil son ahora ciento ochenta mil más. Nada de esto es ilegal.» Una pausa. «Lo verifiqué.»
  - ZH: "您的投资组合，"助理说，字斟句酌。"那个项目一个周末就售罄了。您的四万，现在多出了十八万。没有任何违法之处。"停顿了一下。"我查过了。"
- `card.act2_investment_growth.left`
  - EN: "Good news is good news." · VI: "Tin tốt thì cứ là tin tốt." · ES: «Las buenas noticias son buenas noticias.» · ZH: "好消息就是好消息。"
- `card.act2_investment_growth.right`
  - EN: "Move it somewhere quieter." · VI: "Chuyển nó sang chỗ nào kín tiếng hơn." · ES: «Muévelo a un lugar más discreto.» · ZH: "把它转到低调一点的地方。"

---

### CARD 026 — Public Housing Budget

`act2_housing_budget` · speaker: — (narration) · illustration: `{ "scene": "budget_documents" }`

**LEFT — Fund the maintenance.**
- preview: `standing -1 · publicTrust "up_uncertain"`
- effects: `standing -2 · trustActual +4 · trustPerceived +1`

**RIGHT — Keep the flagship project.**
- preview: `standing +1 · power +1 · publicTrust "up_uncertain"`
- effects: `standing +3 · power +2 · trustPerceived +3 · trustActual -1`

**designIntent:** Pure perception-economy card, no hidden state at all — a breather that still teaches. The flagship *polls* better than the plumbing; the plumbing is where actual trust lives. Neither choice is corrupt. One of them is just invisible.

**Strings**
- `card.act2_housing_budget.text`
  - EN: Two lines in the same budget: a landmark cultural complex the cameras love, and maintenance for public housing blocks nobody photographs. There is money for one.
  - VI: Hai dòng trong cùng một bản ngân sách: một quần thể văn hoá biểu tượng mà ống kính nào cũng yêu, và kinh phí bảo trì cho những khu nhà ở xã hội chẳng ai buồn chụp ảnh. Tiền chỉ đủ cho một.
  - ES: Dos líneas en el mismo presupuesto: un complejo cultural emblemático que las cámaras adoran, y el mantenimiento de bloques de vivienda pública que nadie fotografía. Hay dinero para uno.
  - ZH: 同一份预算里的两行：一个镜头都爱拍的地标文化中心，和一片没人拍照的公共住宅的维修费。钱只够一样。
- `card.act2_housing_budget.left`
  - EN: Fund the maintenance. · VI: Rót tiền cho bảo trì. · ES: Financiar el mantenimiento. · ZH: 拨给维修。
- `card.act2_housing_budget.right`
  - EN: Keep the flagship project. · VI: Giữ dự án biểu tượng. · ES: Mantener el proyecto emblemático. · ZH: 保住地标项目。

---

### CARD 027 — Business Audit Begins

`act2_business_audit` · speaker: `businessman` · illustration: `{ "scene": "phone_call_night", "expression": "concerned" }` · minTurn (act): 4
**Conditions:** `{ "type": "relationship", "character": "businessman", "op": ">=", "value": 1 }`

**LEFT — Allow the full audit.**
- preview: `standing -1 · power -1 · publicTrust "up_uncertain"`
- effects: `standing -3 · power -2 · trustActual +2 · REL businessman -3 · FLG add flag_audit_allowed`
- EVT `event_audit_result_full` @ `{ "type": "turn_range", "min": 3, "max": 5 }`

**RIGHT — Order an "administrative review" first.**
- preview: `standing +1 · power +1 · publicTrust "unknown"`
- effects: `standing +3 · power +2 · REL businessman +2 · PRE investigation_interference +1`
- OBL+ `obligation_businessman_protection_01` (creditor `businessman`, w 2, tags `business, protection, inner_circle`)
- EVT `event_audit_result_managed` @ `{ "type": "turn_range", "min": 3, "max": 5 }`
- EVT `event_audit_scandal_return` @ `{ "type": "act", "act": "power", "minActTurn": 3 }` · `onConditionFail: "discard"`

**designIntent:** Chain C's pivot and the pack's sharpest money-morality knot: if the player invested, "fair" means auditing their own wealth. The Right branch schedules *two* futures — the near one where interference works (039a), and the far one where it detonates (Act III scandal). The player can see neither. "Reviews can be thorough, or they can be fair" is the Businessman teaching the player his vocabulary.

**Strings**
- `card.act2_business_audit.text`
  - EN: "They opened an audit this morning," the businessman says on the phone, calm the way people are calm on purpose. "Full scope. You have money in this, so I'll say it plainly: reviews can be thorough, or they can be fair. Your call."
  - VI: "Sáng nay họ mở cuộc kiểm toán rồi," vị doanh nhân nói qua điện thoại, bình tĩnh theo kiểu người ta phải cố mới bình tĩnh được. "Toàn diện. Cậu có tiền trong này, nên tôi nói thẳng: một cuộc rà soát có thể kỹ lưỡng, hoặc có thể công bằng. Cậu chọn đi."
  - ES: «Abrieron una auditoría esta mañana», dice el empresario por teléfono, con esa calma que la gente mantiene a propósito. «Alcance completo. Tú tienes dinero en esto, así que lo diré claramente: las revisiones pueden ser exhaustivas, o pueden ser justas. Tú decides.»
  - ZH: "今天早上他们立案审计了，"商人在电话里说，是那种刻意维持的平静。"全面审计。这里面有你的钱，所以我把话说明白：审查可以做得彻底，也可以做得公道。你定。"
- `card.act2_business_audit.left`
  - EN: Allow the full audit. · VI: Để họ kiểm toán đầy đủ. · ES: Permitir la auditoría completa. · ZH: 让他们彻底审。
- `card.act2_business_audit.right`
  - EN: Order an "administrative review" first. · VI: Yêu cầu "rà soát hành chính" trước đã. · ES: Ordenar primero una «revisión administrativa». · ZH: 先安排一次"行政复核"。

---

### CARD 028 — The Article Runs Softly *(consequence — resolved by `event_delayed_article_returns`)*

`act2_article_softened` · speaker: `aide` · illustration: `{ "scene": "newspaper_page", "expression": "neutral" }` · type: `consequence`

**LEFT — "That's how it's done."**
- preview: `standing +1 · publicTrust "unknown"`
- effects: `standing +2 · trustPerceived +1 · trustActual -2 · REL editor +1`

**RIGHT — "Don't make a habit of this."**
- preview: `standing +1 · publicTrust "unknown"`
- effects: `standing +2 · trustPerceived +1 · trustActual -2`

**designIntent:** Media manipulation *appears* to work: page six, no names, flowers from the deputy. The identical actual-trust bleed on both choices is the tell — the damage came from the delay itself, not from the player's attitude about it. Saying "don't make a habit" changes nothing except how the player feels. The precedent counter, notably, was incremented three cards ago.

**Strings**
- `card.act2_article_softened.text`
  - EN: "The story ran this morning," your aide says. "Page six. 'Sources suggest procedural irregularities.' No names in the headline. The deputy sent flowers to the office."
  - VI: "Bài báo lên sáng nay rồi," trợ lý nói. "Trang sáu. 'Nguồn tin cho thấy có dấu hiệu bất thường về quy trình.' Tiêu đề không nêu tên ai. Vị phó chủ nhiệm gửi hoa đến văn phòng."
  - ES: «La nota salió esta mañana», dice tu asistente. «Página seis. "Fuentes sugieren irregularidades de procedimiento." Sin nombres en el titular. El diputado envió flores a la oficina.»
  - ZH: "报道今早见报了，"助理说。"第六版。'有消息来源称存在程序上的不规范。'标题里没有任何名字。那位副主任往办公室送了花。"
- `card.act2_article_softened.left`
  - EN: "That's how it's done." · VI: "Làm việc là phải thế." · ES: «Así se hacen las cosas.» · ZH: "事情就该这么办。"
- `card.act2_article_softened.right`
  - EN: "Don't make a habit of this." · VI: "Đừng để thành thói quen." · ES: «Que no se vuelva costumbre.» · ZH: "别让这成了习惯。"

---

### CARD 029 — The Annual Declaration

`act2_wealth_disclosure` · speaker: `aide` · illustration: `{ "scene": "office_forms", "expression": "neutral" }` · minTurn (act): 5

**LEFT — Disclose everything.**
- preview: `standing -1 · publicTrust "up_uncertain"`
- effects: `standing -2 · trustActual +3 · FLG add flag_financial_disclosure`

**RIGHT — Disclose only what's required.**
- preview: `standing +1 · publicTrust "unknown"`
- effects: `standing +2 · PRE disclosure_minimization +1`

**designIntent:** The quietest card in the act and one of the most consequential for endings: `flag_financial_disclosure` materially softens the Act III leak (card 048) and the Aftermath ledger, while `disclosure_minimization` is what turns the leak into a scandal. The aide's line about "strictly" is the whole legal-vs-legitimate theme in one word.

**Strings**
- `card.act2_wealth_disclosure.text`
  - EN: "The annual declaration," your aide says, form in hand. "The law requires salary and property. It does not, strictly, require the portfolio. 'Strictly' is doing a lot of work in that sentence."
  - VI: "Bản kê khai thường niên," trợ lý nói, tay cầm mẫu đơn. "Luật yêu cầu kê khai lương và bất động sản. Còn danh mục đầu tư thì, xét đúng câu chữ, không bắt buộc. Mà 'đúng câu chữ' trong câu vừa rồi đang phải gánh nhiều lắm đấy."
  - ES: «La declaración anual», dice tu asistente, formulario en mano. «La ley exige salario y propiedades. No exige, estrictamente, el portafolio. "Estrictamente" está cargando con mucho peso en esa frase.»
  - ZH: "年度申报，"助理拿着表格说。"法律要求申报工资和房产。至于投资组合，严格来说，不要求。'严格来说'这四个字，在这句话里扛的分量可不轻。"
- `card.act2_wealth_disclosure.left`
  - EN: Disclose everything. · VI: Kê khai toàn bộ. · ES: Declararlo todo. · ZH: 全部申报。
- `card.act2_wealth_disclosure.right`
  - EN: Disclose only what's required. · VI: Chỉ kê khai phần bắt buộc. · ES: Declarar solo lo exigido. · ZH: 只申报必须申报的。

---

### CARD 030 — The Mentor Needs Protection

`act2_mentor_protection` · speaker: `mentor` · illustration: `{ "scene": "office_mentor_evening", "expression": "concerned" }` · minTurn (act): 6

**LEFT — Recuse yourself.**
- preview: `standing -1 · power -1 · publicTrust "unknown"`
- effects: `standing -3 · power -2 · trustActual +2 · REL mentor -2`
- **lock:**
```json
{
  "mode": "cost",
  "condition": { "type": "obligation", "creditor": "mentor", "status": "active", "minWeight": 2 },
  "unlockEffects": [
    { "type": "stat", "stat": "power", "add": -3 },
    { "type": "relationship", "character": "mentor", "add": -1 }
  ],
  "reason": { "source": "obligations", "maxFlashbacks": 2 }
}
```
  - Presentation when locked: `Recuse yourself — Power ↓↓` with up to two flashbacks (committee mention, promotion backing).

**RIGHT — Call for "procedural caution."**
- preview: `standing +1 · power +1 · publicTrust "unknown"`
- effects: `standing +3 · power +2 · REL mentor +2 · PRE investigation_interference +1`
- OBL~ resolve (creditor `mentor`, amount 1, resolution `"repaid"`)

**designIntent:** The 015 pattern at higher stakes — the second cost-lock of the game, now guarding a recusal instead of a vote. Repaying the Mentor's heaviest debt requires interfering with a review. The line "before you knew me" is deliberate: the complaint predates the player entirely, so protecting him cannot be rationalized as protecting themselves. This one is pure loyalty.

**Strings**
- `card.act2_mentor_protection.text`
  - EN: "An old complaint," your mentor says. It is the first time you have heard him sound old. "Procurement, years ago — before you knew me. It will die on its own, unless someone feeds it. The committee reviews the docket on Monday. You sit on that committee."
  - VI: "Một đơn khiếu nại cũ," người đỡ đầu nói. Đây là lần đầu tiên bạn nghe thấy tuổi tác trong giọng ông. "Chuyện mua sắm công, nhiều năm trước — từ hồi cậu còn chưa biết tôi. Nó sẽ tự chết, trừ khi có người nuôi nó sống. Thứ Hai này ủy ban rà soát danh sách hồ sơ. Mà cậu thì ngồi trong ủy ban đó."
  - ES: «Una vieja denuncia», dice tu mentor. Es la primera vez que lo oyes sonar viejo. «Contrataciones, hace años — antes de que me conocieras. Morirá sola, a menos que alguien la alimente. El comité revisa el expediente el lunes. Tú estás en ese comité.»
  - ZH: "一桩旧投诉，"导师说。这是你第一次从他的声音里听出老态。"采购的事，很多年前了——那时你还不认识我。它会自己死掉，除非有人喂着它。委员会周一审查案卷。而你，就坐在那个委员会里。"
- `card.act2_mentor_protection.left`
  - EN: Recuse yourself. · VI: Xin rút khỏi phiên rà soát. · ES: Recusarte. · ZH: 申请回避。
- `card.act2_mentor_protection.right`
  - EN: Call for "procedural caution." · VI: Đề nghị "thận trọng về quy trình." · ES: Pedir «cautela procedimental». · ZH: 呼吁"程序上审慎处理"。

---

### CARD 031 — The Bill Grows Teeth

`act2_reformist_strong_bill` · speaker: `reformist` · illustration: `{ "scene": "office_desk_draft", "expression": "neutral" }` · minTurn (act): 4
**Conditions:** `{ "type": "relationship", "character": "reformist", "op": ">=", "value": 1 }`

**LEFT — Support full disclosure.**
- preview: `standing -1 · power -1 · publicTrust "up_uncertain"`
- effects: `standing -3 · power -2 · trustActual +4 · trustPerceived +1 · REL reformist +2 · FLG add flag_strong_procurement_reform`

**RIGHT — Support the limited version.**
- preview: `standing +1 · power +1 · publicTrust "unknown"`
- effects: `standing +2 · power +2 · REL reformist -1 · FLG add flag_weak_procurement_reform`

**designIntent:** Chain D link 2. "This is the idea, without the escape hatches" quietly tests whether the player's Act I support was for transparency or for the *appearance* of transparency. On invested runs, full disclosure would eventually expose their own contract chain — the DSL doesn't know that yet, but Act III's card 044 does.

**Strings**
- `card.act2_reformist_strong_bill.text`
  - EN: "The disclosure bill has grown teeth," the Reformist says. "Full contract publication, subcontractors included, no exemptions for 'strategic' projects. Last time, you supported the idea. This is the idea — without the escape hatches."
  - VI: "Dự luật công khai giờ đã mọc răng," Nhà Cải Cách nói. "Công bố toàn bộ hợp đồng, tính cả nhà thầu phụ, không ngoại lệ cho các dự án 'chiến lược.' Lần trước anh ủng hộ ý tưởng này. Còn đây chính là ý tưởng đó — nhưng đã bịt hết các lối thoát hiểm."
  - ES: «El proyecto de divulgación ya tiene dientes», dice la Reformista. «Publicación completa de contratos, subcontratistas incluidos, sin exenciones para proyectos "estratégicos". La última vez apoyaste la idea. Esta es la idea — sin las salidas de emergencia.»
  - ZH: "公开法案这回长出牙齿了，"改革派说。"合同全文公示，分包商也算在内，'战略'项目不设豁免。上次你支持的是这个想法。现在摆在这里的就是这个想法——只是堵死了所有逃生口。"
- `card.act2_reformist_strong_bill.left`
  - EN: Support full disclosure. · VI: Ủng hộ công khai toàn bộ. · ES: Apoyar la divulgación completa. · ZH: 支持全面公开。
- `card.act2_reformist_strong_bill.right`
  - EN: Support the limited version. · VI: Ủng hộ phiên bản rút gọn. · ES: Apoyar la versión limitada. · ZH: 支持缩水版本。

---

### CARD 032 — A Favor for the Editor

`act2_editor_regulatory_favor` · speaker: `editor` · illustration: `{ "scene": "newsroom_office", "expression": "concerned" }` · minTurn (act): 5
**Conditions:** `{ "type": "relationship", "character": "editor", "op": ">=", "value": 1 }`

**LEFT — Stay out of it.**
- preview: `standing 0 · publicTrust "unknown"`
- effects: `REL editor -1`

**RIGHT — Make the call.**
- preview: `standing +1 · power +1 · publicTrust "unknown"`
- effects: `standing +2 · power +2 · REL editor +1 · PRE media_regulatory_favor +1`
- OBL~ resolve (creditor `editor`, amount 1, resolution `"repaid"`)

**designIntent:** Chain B link 3 and the quiet turning point of the media arc: repaying the Editor's debt with a *regulatory* favor converts him from a vendor of coverage into a co-owner of secrets. From this card on, the Editor is not someone the player owes — he is someone the player is *entangled with*, which is what makes cards 048/049 possible. Third instance of the repay-by-corrupting pattern (015, 030, 032).

**Strings**
- `card.act2_editor_regulatory_favor.text`
  - EN: "Now I'm the story," the Editor says. "A licensing review — ownership structure, capital thresholds. Routine, unless someone wants it not to be. One call from your office settles which kind it is."
  - VI: "Giờ thì đến lượt tôi lên mặt báo," Tổng biên tập nói. "Một đợt rà soát giấy phép — cơ cấu sở hữu, ngưỡng vốn. Chuyện thường lệ, trừ khi có ai đó muốn nó không còn thường lệ nữa. Một cuộc gọi từ văn phòng của cậu sẽ định đoạt nó thuộc loại nào."
  - ES: «Ahora la noticia soy yo», dice el Editor. «Una revisión de licencias: estructura de propiedad, umbrales de capital. Rutinaria, a menos que alguien quiera que no lo sea. Una llamada de tu oficina decide de qué tipo es.»
  - ZH: "这回轮到我成新闻了，"总编说。"一次执照审查——股权结构、资本门槛。本是例行公事，除非有人不想让它例行。你办公室的一通电话，就能定下它是哪一种。"
- `card.act2_editor_regulatory_favor.left`
  - EN: Stay out of it. · VI: Đứng ngoài chuyện này. · ES: Mantenerte al margen. · ZH: 置身事外。
- `card.act2_editor_regulatory_favor.right`
  - EN: Make the call. · VI: Gọi cuộc điện thoại đó. · ES: Hacer la llamada. · ZH: 打这个电话。

---

### CARD 033 — The Autumn Campaign

`act2_popularity_event` · speaker: — (narration) · illustration: `{ "scene": "campaign_posters" }` · minTurn (act): 6

**LEFT — Campaign on policy achievements.**
- preview: `standing +1 · publicTrust "up_uncertain"`
- effects: `standing +2 · trustActual +3 · trustPerceived +2`

**RIGHT — Campaign on strong leadership.**
- preview: `standing +2 · power +1 · publicTrust "up_uncertain"` `[intended: ↑↑?]`
- effects: `standing +5 · power +2 · trustPerceived +4 · trustActual +1 · FLG add flag_strongman_branding`

**designIntent:** `flag_strongman_branding` re-words Act III's protest card (042) and hardens the Collapse ending's framing — a strongman brand makes low actual trust more explosive. Also the cleanest demonstration yet that Perceived Trust is what campaigns are made of.

**Strings**
- `card.act2_popularity_event.text`
  - EN: Your name polls ahead of politicians ten years your senior. The party wants a face for the autumn campaign, and yours is available. Two drafts of the slogan sit on your desk.
  - VI: Tên bạn giờ đứng trên cả những chính khách hơn mình mười năm thâm niên trong các cuộc thăm dò. Đảng cần một gương mặt cho chiến dịch mùa thu, và gương mặt của bạn thì đang sẵn. Hai bản nháp khẩu hiệu nằm trên bàn.
  - ES: Tu nombre encuesta por encima de políticos con diez años más de carrera. El partido quiere un rostro para la campaña de otoño, y el tuyo está disponible. Dos borradores del eslogan descansan sobre tu escritorio.
  - ZH: 民调里，你的名字排在了比你资深十年的政客前面。党需要一张秋季竞选的面孔，而你的面孔正好有空。两份口号草稿放在你的桌上。
- `card.act2_popularity_event.left`
  - EN: Campaign on policy achievements. · VI: Tranh cử bằng thành tích chính sách. · ES: Hacer campaña con logros de política pública. · ZH: 以政绩为竞选主轴。
- `card.act2_popularity_event.right`
  - EN: Campaign on strong leadership. · VI: Tranh cử bằng hình ảnh lãnh đạo cứng rắn. · ES: Hacer campaña con liderazgo fuerte. · ZH: 以强势领导为竞选主轴。

---

### CARD 034 — The Question With a Shelf Life

`act2_contractor_callback` · speaker: `aide` · illustration: `{ "scene": "office_report", "expression": "concerned" }` · weight: 8 · minTurn (act): 5
**Conditions:**
```json
{
  "any": [
    { "type": "precedent", "precedent": "precedent_administrative_override", "op": ">=", "value": 1 },
    { "type": "precedent", "precedent": "precedent_special_treatment",       "op": ">=", "value": 1 }
  ]
}
```

**LEFT — Release the records immediately.**
- preview: `standing -2 · publicTrust "up_uncertain"`
- effects: `standing -5 · trustActual +3 · trustPerceived -1`

**RIGHT — Wait for internal review.**
- preview: `standing +1 · power +1 · publicTrust "unknown"`
- effects: `standing +2 · power +2 · PRE information_delay +1`

**designIntent:** The bill for Act I's efficiency arrives, appropriately addressed: this card only exists if the player fast-tracked or made calls. Releasing records *hurts perceived trust while raising actual trust* — honesty reads as guilt in the perception economy. That inversion is the card.

**Strings**
- `card.act2_contractor_callback.text`
  - EN: "The fast-tracked project," your aide says. "Forty percent over budget, and a subcontractor nobody remembers hiring. It isn't a scandal yet. It's a question — and questions have a shelf life."
  - VI: "Cái dự án làm gấp hồi trước," trợ lý nói. "Đội vốn bốn mươi phần trăm, kèm một nhà thầu phụ mà không ai nhớ đã thuê từ lúc nào. Nó chưa phải bê bối. Nó mới là một câu hỏi — mà câu hỏi thì có hạn sử dụng."
  - ES: «El proyecto acelerado», dice tu asistente. «Cuarenta por ciento sobre presupuesto, y un subcontratista que nadie recuerda haber contratado. Todavía no es un escándalo. Es una pregunta — y las preguntas tienen fecha de caducidad.»
  - ZH: "之前特事特办的那个项目，"助理说。"超支百分之四十，还有一个没人记得是谁请来的分包商。它现在还不是丑闻。它只是一个问题——而问题，是有保质期的。"
- `card.act2_contractor_callback.left`
  - EN: Release the records immediately. · VI: Công bố hồ sơ ngay. · ES: Publicar los registros de inmediato. · ZH: 立即公开档案。
- `card.act2_contractor_callback.right`
  - EN: Wait for internal review. · VI: Chờ rà soát nội bộ. · ES: Esperar la revisión interna. · ZH: 等内部审查。

---

### CARD 035 — The Finished Hospital

`act2_hospital_funding` · speaker: — (narration) · illustration: `{ "scene": "hospital_wing" }` · minTurn (act): 6
**Conditions:** `{ "type": "stat", "stat": "power", "op": ">=", "value": 30 }`

**LEFT — Respect the normal approval.**
- preview: `power 0 · publicTrust "unknown"`
- effects: — (none)

**RIGHT — Override the delay.**
- preview: `power +1 · publicTrust "up_uncertain"` `[intended: ↑↑?]`
- effects: `power +3 · trustActual +5 · trustPerceived +3 · PRE administrative_override +1 · FLG add flag_hospital_opened_early`

**designIntent:** The counterweight card, gated behind Power ≥ 30 so it lands *after* the player has dirtied their hands acquiring that power: the good this card does is real, and it was purchasable only with the machinery the rest of the act is indicting. `flag_hospital_opened_early` is quoted by the Accountability and Break-the-Chain endings — the game's proof that it never claimed power itself was evil.

**Strings**
- `card.act2_hospital_funding.text`
  - EN: A regional hospital's new wing is finished, equipped, staffed — and closed, pending a certification queue eleven months deep. A signature from your office reorders the queue. People are being driven past that building to clinics two hours away.
  - VI: Toà nhà mới của một bệnh viện tuyến tỉnh đã xây xong, đủ thiết bị, đủ người — và đóng cửa, vì xếp hàng chờ thẩm định cấp phép mất mười một tháng. Một chữ ký từ văn phòng của bạn sẽ đảo lại thứ tự hàng chờ đó. Ngay lúc này, người bệnh đang được chở ngang qua toà nhà ấy để đến những phòng khám cách hai giờ đường.
  - ES: El ala nueva de un hospital regional está terminada, equipada, con personal — y cerrada, en una fila de certificación de once meses. Una firma de tu oficina reordena la fila. Hay gente que pasa en ambulancia frente a ese edificio rumbo a clínicas a dos horas de distancia.
  - ZH: 一家地区医院的新楼已经竣工，设备齐全，人员到位——却关着门，排在一条长达十一个月的验收队伍里。你办公室的一个签名，就能重排这条队伍。而此刻，病人正被载着经过那栋楼，送往两小时车程外的诊所。
- `card.act2_hospital_funding.left`
  - EN: Respect the normal approval. · VI: Tôn trọng trình tự phê duyệt. · ES: Respetar la aprobación normal. · ZH: 尊重正常审批。
- `card.act2_hospital_funding.right`
  - EN: Override the delay. · VI: Ký vượt hàng chờ. · ES: Anular la demora. · ZH: 签字插队。

---

### CARD 036 — The Minister's Backing

`act2_minister_promotion_offer` · speaker: `minister` · illustration: `{ "scene": "ministry_office", "expression": "friendly" }` · minTurn (act): 8
**Conditions:** `{ "type": "flag", "flag": "flag_minister_access", "exists": true }`

**LEFT — Ask for the ordinary review.**
- preview: `standing 0 · power 0 · publicTrust "unknown"`
- effects: `REL minister -1`

**RIGHT — Accept the Minister's backing.**
- preview: `standing +2 · power +2 · publicTrust "unknown"`
- effects: `standing +6 · power +6 · REL minister +2`
- OBL+ `obligation_minister_backing_01` (creditor `minister`, w 2, tags `promotion, inner_circle`)

**designIntent:** The heaviest single obligation before the Gathering, sold in the Minister's native dialect: he doesn't offer to add the player's name — he offers to *delete the other three*. Combined with `REL minister +2` this is exactly what arms the spec's drink-refusal hard lock (`inner_circle minCount 3` + `REL minister >= 3`).

**Strings**
- `card.act2_minister_promotion_offer.text`
  - EN: "Deputy chair of the national committee," the Minister says. "The shortlist has four names. Three of them matter to nobody. Say yes, and the list has one name."
  - VI: "Phó chủ nhiệm ủy ban cấp quốc gia," Bộ trưởng nói. "Danh sách rút gọn có bốn cái tên. Ba trong số đó chẳng có ý nghĩa với ai cả. Cậu gật đầu một cái, danh sách sẽ chỉ còn một tên."
  - ES: «Vicepresidencia del comité nacional», dice el Ministro. «La lista corta tiene cuatro nombres. Tres de ellos no le importan a nadie. Di que sí, y la lista tendrá un solo nombre.»
  - ZH: "国家级委员会的副主任，"部长说。"候选名单上有四个名字。其中三个，对谁都无足轻重。你点个头，名单上就只剩一个名字。"
- `card.act2_minister_promotion_offer.left`
  - EN: Ask for the ordinary review. · VI: Xin theo quy trình xét duyệt thông thường. · ES: Pedir la revisión ordinaria. · ZH: 请按常规程序评审。
- `card.act2_minister_promotion_offer.right`
  - EN: Accept the Minister's backing. · VI: Nhận sự hậu thuẫn của Bộ trưởng. · ES: Aceptar el respaldo del Ministro. · ZH: 接受部长的支持。

---

### CARD 037 — The Port Tender *(consequence — resolved by `event_investment_doubles`)*

`act2_investment_doubles` · speaker: `aide` · illustration: `{ "scene": "office_report", "expression": "concerned" }` · type: `consequence`
**Conditions:** `{ "type": "flag", "flag": "flag_invested_protected_company", "exists": true }`

**LEFT — "On paper suits me fine."**
- preview: `money +3 · publicTrust "unknown"`
- effects: `money +320000`

**RIGHT — "Have someone value it properly."**
- preview: `money +3 · publicTrust "unknown"`
- effects: `money +320000 · FLG add flag_portfolio_valued`

**designIntent:** The counter crosses half a million and the aide's sentence — "wealthier than anyone who audits you" — is the act's thesis stated as arithmetic. `flag_portfolio_valued` matters later: the Aftermath compensation ledger quotes an exact figure only if the player ever asked for one. Most won't. That's the point.

**Strings**
- `card.act2_investment_doubles.text`
  - EN: "The company won the port logistics tender," your aide says quietly. "Your stake doubled overnight. On paper, you are now wealthier than anyone whose job is to audit you."
  - VI: "Công ty đó vừa thắng gói thầu logistics cảng," trợ lý nói khẽ. "Cổ phần của sếp tăng gấp đôi chỉ sau một đêm. Trên giấy tờ, sếp giờ giàu hơn bất kỳ ai có nhiệm vụ kiểm toán sếp."
  - ES: «La empresa ganó la licitación de logística portuaria», dice tu asistente en voz baja. «Tu participación se duplicó de la noche a la mañana. Sobre el papel, ahora eres más rico que cualquiera cuyo trabajo sea auditarte.»
  - ZH: "那家公司中标了港口物流项目，"助理低声说。"您的股份一夜之间翻了一倍。账面上，您现在比任何一个负责审计您的人都富有。"
- `card.act2_investment_doubles.left`
  - EN: "On paper suits me fine." · VI: "Trên giấy tờ là đủ với tôi rồi." · ES: «Sobre el papel me parece bien.» · ZH: "账面上就挺好。"
- `card.act2_investment_doubles.right`
  - EN: "Have someone value it properly." · VI: "Tìm người định giá cho đàng hoàng." · ES: «Que alguien lo valore como es debido.» · ZH: "找人正经估个值。"

---

### CARD 038 — No Office Can Reach In

`act2_investigation_independence` · speaker: `reformist` · illustration: `{ "scene": "committee_room", "expression": "serious" }` · minTurn (act): 9
**Conditions:**
```json
{
  "any": [
    { "type": "relationship", "character": "reformist", "op": ">=", "value": 1 },
    { "type": "flag", "flag": "flag_public_reform_support", "exists": true }
  ]
}
```

**LEFT — Back the proposal.**
- preview: `standing -1 · power -2 · publicTrust "up_uncertain"`
- effects: `standing -3 · power -4 · trustActual +4 · trustPerceived +1 · REL reformist +2 · FLG add flag_supports_investigation_independence`

**RIGHT — "Existing oversight is enough."**
- preview: `standing +1 · power +1 · publicTrust "unknown"`
- effects: `standing +2 · power +2 · REL reformist -1`

**designIntent:** Chain D keystone. The largest voluntary Power loss in the game so far (−4), purchasing something invisible: an institution the player cannot later un-build. When the Incident comes, `flag_supports_investigation_independence` is what produces the Ending G line — "Your office has no authority over this inquiry" — the strongest positive payoff in the entire design, and the player buys it here, blind, at full price.

**Strings**
- `card.act2_investigation_independence.text`
  - EN: "Last one," the Reformist says. "Investigators appointed to fixed terms, removable only by court order. It means no office can reach into an inquiry again. Including yours."
  - VI: "Điều cuối cùng," Nhà Cải Cách nói. "Điều tra viên được bổ nhiệm theo nhiệm kỳ cố định, chỉ toà án mới có quyền bãi nhiệm. Nghĩa là từ nay không văn phòng nào với tay vào được một cuộc điều tra nữa. Kể cả văn phòng của anh."
  - ES: «La última», dice la Reformista. «Investigadores nombrados por períodos fijos, removibles solo por orden judicial. Significa que ninguna oficina podrá volver a meter la mano en una investigación. Incluida la tuya.»
  - ZH: "最后一条，"改革派说。"调查员实行固定任期，只有法院才能将其免职。这意味着从此没有任何一个办公室能再把手伸进调查里。包括你的。"
- `card.act2_investigation_independence.left`
  - EN: Back the proposal. · VI: Ủng hộ đề xuất. · ES: Respaldar la propuesta. · ZH: 支持这项提案。
- `card.act2_investigation_independence.right`
  - EN: "Existing oversight is enough." · VI: "Cơ chế giám sát hiện tại là đủ rồi." · ES: «La supervisión actual es suficiente.» · ZH: "现有的监督已经够了。"

---

### CARD 039a — Audit Result: Managed *(consequence — resolved by `event_audit_result_managed`)*

`act2_audit_result_managed` · speaker: `aide` · illustration: `{ "scene": "office_report", "expression": "neutral" }` · type: `consequence`
**Conditions:** `{ "type": "history", "cardId": "act2_business_audit", "choice": "right", "exists": true }`

**LEFT — "Good."**
- preview: `standing +1 · publicTrust "unknown"`
- effects: `standing +2 · trustPerceived +1 · REL businessman +1`

**RIGHT — "File it and move on."**
- preview: `standing +1 · publicTrust "unknown"`
- effects: `standing +2 · trustPerceived +1`

**designIntent:** Interference appears to work *perfectly* — corrective notice, no referral, market relief, and the aide's single dry "Efficient." What the player cannot see: `event_audit_scandal_return` is already sitting in the scheduler with an Act III trigger, provenance `act2_business_audit:right`. This card is the calm before a receipt.

**Strings**
- `card.act2_audit_result_managed.text`
  - EN: "The review concluded," your aide says, reading. "Minor filing violations. Corrective notice, no referral. The market read it as an all-clear." A beat. "Efficient."
  - VI: "Đợt rà soát kết thúc rồi," trợ lý vừa đọc vừa nói. "Vài vi phạm nhỏ về kê khai hồ sơ. Nhắc nhở khắc phục, không chuyển cơ quan điều tra. Thị trường coi đó là tín hiệu an toàn." Ngừng một nhịp. "Hiệu quả thật."
  - ES: «La revisión concluyó», dice tu asistente, leyendo. «Infracciones menores de registro. Aviso correctivo, sin remisión. El mercado lo leyó como vía libre.» Una pausa. «Eficiente.»
  - ZH: "复核结束了，"助理念着报告说。"几处轻微的申报违规。责令整改，不予移送。市场把这当成了解除警报。"顿了顿。"真高效。"
- `card.act2_audit_result_managed.left`
  - EN: "Good." · VI: "Tốt." · ES: «Bien.» · ZH: "很好。"
- `card.act2_audit_result_managed.right`
  - EN: "File it and move on." · VI: "Lưu hồ sơ rồi làm việc tiếp." · ES: «Archívalo y sigamos.» · ZH: "归档，继续干活。"

---

### CARD 039b — Audit Result: Full Findings *(consequence — resolved by `event_audit_result_full`)*

`act2_audit_result_full` · speaker: `aide` · illustration: `{ "scene": "office_report", "expression": "serious" }` · type: `consequence`
**Conditions:** `{ "type": "history", "cardId": "act2_business_audit", "choice": "left", "exists": true }`

**LEFT — "Let the referrals proceed."**
- preview: `standing -1 · publicTrust "up_uncertain"`
- effects (base): `standing -2 · trustActual +3 · FLG add flag_audit_referrals_public`
- **ChoiceVariant v1** — condition `{ "type": "flag", "flag": "flag_invested_protected_company", "exists": true }` — effects (**replace**): `standing -2 · trustActual +3 · money -120000 · FLG add flag_audit_referrals_public`

**RIGHT — "No comment."**
- preview: `standing -1 · publicTrust "unknown"`
- effects (base): `standing -2`
- **ChoiceVariant v1** — condition `{ "type": "flag", "flag": "flag_invested_protected_company", "exists": true }` — effects (**replace**): `standing -2 · money -120000`

**designIntent:** Integrity, itemized. If the player had invested *and* allowed the audit anyway, their honest choice at 027 now costs $120,000 in falling holdings — the single largest honest loss in the game, and the game presents it without one word of praise. (Money may clamp at 0 if growth hadn't fired yet; engine clamping per balance config, acceptable.) The variant-on-both-choices pattern is the sanctioned way to express "this happens regardless of reaction, but only to investors."

**Strings**
- `card.act2_audit_result_full.text`
  - EN: "The audit found substance," your aide says. "Inflated invoices, two shell subcontractors. Referrals are going out this week — and the company's shares went down with the news."
  - VI: "Cuộc kiểm toán tìm ra chuyện thật rồi," trợ lý nói. "Hoá đơn kê khống, hai nhà thầu phụ chỉ có trên giấy. Tuần này hồ sơ sẽ được chuyển đi — và cổ phiếu công ty đó cũng lao dốc theo bản tin."
  - ES: «La auditoría encontró sustancia», dice tu asistente. «Facturas infladas, dos subcontratistas fantasma. Las remisiones salen esta semana — y las acciones de la empresa cayeron con la noticia.»
  - ZH: "审计查出实质问题了，"助理说。"虚开的发票，两家空壳分包商。移送材料本周就发出——公司股价也随着消息一路下跌。"
- `card.act2_audit_result_full.left`
  - EN: "Let the referrals proceed." · VI: "Cứ để hồ sơ được chuyển đi." · ES: «Que las remisiones sigan su curso.» · ZH: "让移送照常进行。"
- `card.act2_audit_result_full.right`
  - EN: "No comment." · VI: "Miễn bình luận." · ES: «Sin comentarios.» · ZH: "无可奉告。"

---

### CARD 040 — Second Promotion *(beat, act finale)*

`act2_second_promotion` · speaker: — (narration) · illustration: `{ "scene": "new_office_river_view" }` · beat: `beat_act2_second_promotion`
**Routing:** `next` (both choices): `{ "type": "act", "act": "power" }`

**LEFT — Step into the role publicly.**
- preview: `standing +2 · power +2 · publicTrust "up_uncertain"`
- effects: `standing +7 · power +6 · trustPerceived +3`

**RIGHT — Step into it quietly.**
- preview: `standing +1 · power +2 · publicTrust "unknown"`
- effects: `standing +4 · power +6 · trustActual +2`

**designIntent:** Act I's promotion was a phone call the player could refuse. This one is a communiqué that mentions them in the third paragraph — there is no decline option, only a choice of posture. The ladder stopped asking. Autonomy narrows even on the way up; that asymmetry is the act's closing statement and the on-ramp to Act III's theme (*you now decide who receives the shortcuts*).

**Strings**
- `card.act2_second_promotion.text`
  - EN: There is no phone call this time. There is a communiqué with your name in the third paragraph, a new office with a view of the river, and a schedule your aide now negotiates with other people's aides. Nobody asks whether you accept.
  - VI: Lần này không có cuộc điện thoại nào. Chỉ có một thông cáo nhắc tên bạn ở đoạn thứ ba, một phòng làm việc mới nhìn ra sông, và một lịch trình mà trợ lý của bạn giờ phải thương lượng với trợ lý của những người khác. Không ai hỏi bạn có nhận hay không.
  - ES: Esta vez no hay llamada. Hay un comunicado con tu nombre en el tercer párrafo, una oficina nueva con vista al río, y una agenda que tu asistente ahora negocia con los asistentes de otras personas. Nadie pregunta si aceptas.
  - ZH: 这一次没有电话。只有一份公报，你的名字出现在第三段；一间能看到河景的新办公室；还有一张日程表——如今由你的助理去和别人的助理协商。没有人问你是否接受。
- `card.act2_second_promotion.left`
  - EN: Step into the role publicly. · VI: Nhậm chức một cách công khai. · ES: Asumir el cargo públicamente. · ZH: 高调就任。
- `card.act2_second_promotion.right`
  - EN: Step into it quietly. · VI: Nhậm chức trong lặng lẽ. · ES: Asumirlo en silencio. · ZH: 低调就任。

---

### CARD A2 — The Headline *(ambient — Chain C closed)*

`act2_businessman_headline` · speaker: — (narration) · illustration: `{ "scene": "newspaper_page" }` · type: `contextual` · weight: 5 · once: true · minTurn (act): 4
**Conditions:** `{ "not": { "type": "flag", "flag": "flag_direct_business_contact", "exists": true } }`

**LEFT — Read the article.**
- preview: `publicTrust "unknown"`
- effects: — (none)

**RIGHT — Turn the page.**
- preview: `publicTrust "unknown"`
- effects: — (none)

**designIntent:** Second ambient beat, paired with `act1_businessman_glimpse`. This is the *same port tender* that doubles the invested player's stake in card 037 — two runs, one headline, and the only variable is whether the player's money is inside it. Effects deliberately empty again. He will be at the Gathering table regardless.

**Strings**
- `card.act2_businessman_headline.text`
  - EN: The morning briefing includes a business daily. Front page: the man from the reception, shaking hands over a port logistics tender worth more than your committee's annual budget. The caption calls him "a partner the state can move quickly with."
  - VI: Tập tài liệu buổi sáng có kèm một tờ nhật báo kinh tế. Trang nhất: người đàn ông ở buổi tiếp tân hôm nào, đang bắt tay ký kết gói thầu logistics cảng trị giá hơn cả ngân sách năm của ủy ban bạn. Chú thích ảnh gọi ông ta là "một đối tác mà nhà nước có thể làm việc nhanh chóng cùng."
  - ES: El resumen matutino incluye un diario de negocios. Primera plana: el hombre de la recepción, estrechando manos por una licitación de logística portuaria que vale más que el presupuesto anual de tu comité. El pie de foto lo llama «un socio con el que el Estado puede moverse rápido».
  - ZH: 晨间简报里夹着一份财经日报。头版：招待会上的那个男人，正为一个港口物流项目握手签约——标的额比你们委员会一年的预算还高。图片说明称他为"一位国家可以与之快速推进的合作伙伴"。
- `card.act2_businessman_headline.left`
  - EN: Read the article. · VI: Đọc bài báo. · ES: Leer el artículo. · ZH: 读完这篇报道。
- `card.act2_businessman_headline.right`
  - EN: Turn the page. · VI: Lật sang trang. · ES: Pasar la página. · ZH: 翻过这一页。

---

## 3. QA / Simulation Checklist

1. **Chain C money curve:** corrupt-optimizer bot must show the exact sequence $49,400 → $9,400 → $189,400 → $509,400 across cards 022/025/037, with `event_investment_doubles` never firing on non-invested runs (its target card's condition is the backstop; the event should also simply never be scheduled).
2. **Double-schedule integrity (card 027 right):** both `event_audit_result_managed` (turns 3–5) and `event_audit_scandal_return` (act `power`) must appear in `scheduledEvents` with provenance `act2_business_audit:right`; the Act III event stays `pending` through the entire act.
3. **Honest-loss variant (039b):** invested + audited runs must lose exactly $120,000 on either choice; non-invested runs must lose $0. Confirm money clamps at 0 without error if the growth event had not yet fired.
4. **Repay-by-corrupting pattern:** every obligation resolution in this pack (030 right, 032 right) must co-occur with a precedent increment in the same choice. Simulation assertion: no `obligation_resolve` in Act II fires without a `precedent` effect in the same effects array.
5. **Gathering lock arming:** corrupt bot at end of Act II must hold ≥ 3 active `inner_circle` obligations and `REL minister >= 3`; clean bot must hold ≤ 1 and `REL minister <= 1`. Both must be true or the Gathering's hard lock will misfire in one direction or the other.
6. **Ambient exclusivity (A2):** `act2_businessman_headline` and any businessman-relationship change must remain mutually exclusive per run (same invariant as Act I check #6).
7. **Localization:** all keys present in 4 language files; VI register spot-check (Minister uses `cậu` down, aide keeps `sếp` up); ZH quotes fullwidth throughout.
8. **Beat timing:** `beat_act2_minister` must fire within act-turns 1–3 on 100% of runs; `beat_act2_second_promotion` within 13–16; no run may enter act `power` without card 040 in history.

---

*End of pack. Forward references handed to Act III (Power): `event_audit_scandal_return → act3_audit_scandal_return`; flags consumed by Act III/Gathering/Aftermath: `flag_invested_protected_company`, `flag_minister_access`, `flag_strongman_branding` (re-words card 042), `flag_weak/strong_procurement_reform` (gates 047 vs 046 variants), `flag_supports_investigation_independence` (Ending G), `flag_financial_disclosure` + `flag_discreet_accounts` + `flag_portfolio_valued` (card 048 leak severity + Aftermath ledger), `flag_hospital_opened_early` (positive-ending flavor), `flag_audit_allowed` / `flag_audit_referrals_public` (Scapegoat ending logic). The Gathering lock is now fully armed or fully avoided — Act III's job is to make the player forget which.*
