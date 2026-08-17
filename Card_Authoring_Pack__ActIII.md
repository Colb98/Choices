# Card Authoring Pack — Act III (Power)

**Version:** 1.0 · **Cards:** 24 authored (≈14–17 seen per run) · **Source of truth language:** English
**Depends on:** Act 0+I pack v1.1, Act II pack v1.0 (`event_audit_scandal_return`, 10 handed-off flags)
**Supported languages:** `en`, `vi`, `es`, `zh-Hans`

Slots 041–058 of the *Master Narrative Table*, plus the Act II forward reference (`act3_audit_scandal_return`). Splits in this pack: slot 048 → three precedent-tiered cards; slot 055 → two history variants; slot 057 → two relationship variants (plus one deliberate absence); slot 058 gains a refusal-conversion consequence card (058b). Conventions identical to the previous packs.

**Act III theme:** *People no longer offer you shortcuts. You decide who receives them.* Every temptation in this act is the player standing on the other side of an Act I card.

---

## 1. Registry Additions

### 1.1 Consolidation & engine notes

- **PRECEDENT-CONSOLIDATION:** the Master Table uses `loyalist_appointments` (card 041) and `loyalty_appointments` (card 015) as separate names. This pack consolidates both onto the existing **`precedent_loyalty_appointments`**. Do not create a second precedent.
- **ENGINE-REQ-01 (card 053):** the table asks for "publicTrustPerceived moves toward actual," which no current effect type can express. Proposed new effect:
  ```json
  { "type": "stat_converge", "from": "publicTrustPerceived", "to": "publicTrustActual", "fraction": 0.5 }
  ```
  Until implemented, card 053 ships with the fallback noted on the card (approximation, flagged for replacement). Per spec §58, this is a new explicit engine feature, not JSON cleverness.

### 1.2 New flags (append to `flags.json`)

```text
flag_independent_regulator          Player appointed a career official to head the agency.
flag_loyal_regulator                Player appointed a loyal ally to head the agency.
flag_recused_from_contract          Player recused from the protected company's contract.
flag_self_review_started            Player ordered an internal review of their own conflicts.
flag_reformist_removed              Player removed the Reformist from committee leadership.
flag_final_reform_in_progress       Player pushed the final independence bill early.
flag_investigation_independent      Independent investigative authority exists.           ← Ending G keystone
flag_investigation_politically_controlled  Investigations remain under political oversight.
flag_leak_documents_released        Player released their own records in response to the leak.
flag_article_removed_leak           Player had the leak story removed.
flag_accurate_polling               Player commissioned independent polling.
flag_divestment_started             Player began divesting the protected stake.
flag_owned_audit_interference       Player publicly owned the narrowed audit.
flag_denied_audit_interference      Player attributed the narrowed audit to procedure.
flag_reopened_old_case              Player reopened the constituent land case.
```

### 1.3 New precedents (append to `precedents.json`)

```text
precedent_public_suppression        Normalized restricting public assembly.
precedent_retaliation               Normalized removing critics from positions.
precedent_coercive_bargaining       Normalized forcing outcomes through leverage.
precedent_media_suppression         Normalized removing published reporting.
precedent_protected_business        Normalized contract exemptions for allied companies.
```

### 1.4 Obligations created in this pack

| id | creditor | w | tags | source |
|---|---|---|---|---|
| `obligation_business_contract_01` | businessman | 2 | `business, contract, inner_circle` | 044 right |
| `obligation_minister_family_01` | minister | 1 | `political, nepotism, inner_circle` | 051 right |
| `obligation_business_dependency_01` | businessman | 1 | `business, investment, inner_circle` | 054 right |
| `obligation_minister_media_01` | minister | 2 | `media, protection, inner_circle` | 056 right |

**Gathering lock ledger (final pre-Gathering state):** a fully captured run can now hold up to 8 active `inner_circle` obligations (weight 14). The drink lock (`minCount 3` + `REL minister >= 3`) is massively over-satisfied on captured runs — which is correct: the flashback selector (`maxFlashbacks 3–4`) should prefer the *heaviest* obligations (w2 first), so the drink refusal flashes promotion → investment → media protection, the three cleanest summaries of the run.

### 1.5 New events

| eventId | → cardId | scheduled by | delay |
|---|---|---|---|
| `event_suppression_fallout` | `act3_suppression_escalation` | 048c right | turns 2–4 |

`event_audit_scandal_return` (declared in Act II) resolves here into `act3_audit_scandal_return`.

### 1.6 Mandatory beats

```json
{ "id": "beat_act3_regulator",      "act": "power", "cardId": "act3_regulatory_appointment",   "earliestActTurn": 1,  "latestActTurn": 3,  "priority": 100, "once": true }
{ "id": "beat_act3_authority_vote", "act": "power", "cardId": "act3_authority_vote",           "earliestActTurn": 8,  "latestActTurn": 11, "priority": 100, "once": true }
{ "id": "beat_act3_invitation",     "act": "power", "cardId": "act3_gathering_invitation",     "earliestActTurn": 13, "latestActTurn": 16, "priority": 100, "once": true }
```

### 1.7 Balance envelope

Expected end-of-Act-III (entering Gathering): `standing 45–80 · power 25–85 (widest spread in the game — card 052 alone swings 13) · money $49,400 (clean) → $1.16M (fully invested: 509,400 + 250,000 + 400,000) · trustActual 25–65 · trustPerceived 45–75`. The perceived−actual gap on captured runs should now reach 15–25 — wide enough that the Collapse ending's premise (a player blindsided by real sentiment) is mechanically true, not asserted.

---

## 2. Cards

All cards: `act: "power"`. Consequence cards (048-tier resolution is by condition, 049/055/057/058b/audit-return by event or forced routing) are never pooled unless noted. Defaults as before.

---

### CARD 041 — The Shortlist Is Yours Now *(beat)*

`act3_regulatory_appointment` · speaker: `aide` · illustration: `{ "scene": "office_shortlist", "expression": "neutral" }` · beat: `beat_act3_regulator`

**LEFT — Appoint the career official.**
- preview: `power -1 · publicTrust "up_uncertain"`
- effects: `power -3 · trustActual +3 · FLG add flag_independent_regulator`

**RIGHT — Appoint the loyal ally.**
- preview: `standing +1 · power +2 · publicTrust "unknown"`
- effects: `standing +3 · power +6 · FLG add flag_loyal_regulator · PRE loyalty_appointments +1`

**designIntent:** Act III's thesis card: in Act 0 the player *gave* a first speech; now they *staff the referee*. `flag_loyal_regulator` vs `flag_independent_regulator` silently reshapes what the Aftermath's institutions are capable of.

**Strings**
- `card.act3_regulatory_appointment.text`
  - EN: "The agency needs a head by Friday," your aide says, laying two files side by side. "A career official who answers to procedure. Or a friend who answers the phone. The nomination is yours alone now."
  - VI: "Thứ Sáu này cơ quan đó phải có người đứng đầu," trợ lý nói, đặt hai bộ hồ sơ cạnh nhau. "Một công chức chuyên nghiệp chỉ nghe theo quy trình. Hoặc một người quen luôn nghe máy. Quyền đề cử giờ thuộc về một mình sếp."
  - ES: «La agencia necesita un director para el viernes», dice tu asistente, poniendo dos expedientes lado a lado. «Un funcionario de carrera que responde al procedimiento. O un amigo que responde el teléfono. La nominación ahora es solo tuya.»
  - ZH: "这个机构周五前必须有负责人，"助理把两份档案并排放下。"一位只听程序的职业官员。或者一位随叫随到的朋友。提名权现在只属于您一个人。"
- `card.act3_regulatory_appointment.left`
  - EN: Appoint the career official. · VI: Bổ nhiệm công chức chuyên nghiệp. · ES: Nombrar al funcionario de carrera. · ZH: 任命职业官员。
- `card.act3_regulatory_appointment.right`
  - EN: Appoint the loyal ally. · VI: Bổ nhiệm người thân tín. · ES: Nombrar al aliado leal. · ZH: 任命亲信。

---

### CARD 042 — The Square

`act3_protest` · speaker: — (narration) · illustration: `{ "scene": "protest_square" }` · minTurn (act): 2

**LEFT — Meet the representatives publicly.**
- preview: `standing -1 · power -1 · publicTrust "up_uncertain"`
- effects: `standing -3 · power -2 · trustActual +4 · trustPerceived +1`

**RIGHT — Restrict the gathering temporarily.**
- preview: `standing +1 · power +1 · publicTrust "down_uncertain"`
- effects: `standing +3 · power +3 · trustActual -4 · trustPerceived +1 · PRE public_suppression +1`
- **ChoiceVariant v1** — condition `{ "type": "flag", "flag": "flag_strongman_branding", "exists": true }` — text override → `card.act3_protest.right.v1`; effects identical.

**designIntent:** First card where a choice's *wording* hardens because of the player's brand: strongman campaigners don't "restrict temporarily," they "order the square cleared" — same JSON effects, different self-image. Also the first actual-trust hit the player takes with no preview warning beyond `↓?`: the crowd doesn't send polling.

**Strings**
- `card.act3_protest.text`
  - EN: The policy passed six weeks ago; the crowd arrived this morning. Peaceful, loud, and camped in the square your new office overlooks. Your security chief and your press officer are both waiting for one sentence from you.
  - VI: Chính sách được thông qua sáu tuần trước; đám đông thì đến sáng nay. Ôn hoà, ồn ào, và cắm trại ngay quảng trường mà phòng làm việc mới của bạn nhìn xuống. Trưởng an ninh và người phụ trách báo chí đều đang chờ một câu duy nhất từ bạn.
  - ES: La política se aprobó hace seis semanas; la multitud llegó esta mañana. Pacífica, ruidosa y acampada en la plaza que tu nueva oficina domina. Tu jefe de seguridad y tu jefe de prensa esperan una sola frase tuya.
  - ZH: 政策六周前通过；人群今天早上到了。平和、喧闹，就扎营在你新办公室俯瞰的那个广场上。安保主管和新闻官都在等你的一句话。
- `card.act3_protest.left`
  - EN: Meet the representatives publicly. · VI: Công khai gặp đại diện người biểu tình. · ES: Reunirte públicamente con los representantes. · ZH: 公开会见示威代表。
- `card.act3_protest.right`
  - EN: Restrict the gathering temporarily. · VI: Tạm thời hạn chế tụ tập. · ES: Restringir la concentración temporalmente. · ZH: 暂时限制集会。
- `card.act3_protest.right.v1`
  - EN: Order the square cleared. · VI: Ra lệnh giải tán quảng trường. · ES: Ordenar despejar la plaza. · ZH: 下令清场。

---

### CARD 043 — The Exclusive

`act3_editor_exclusive` · speaker: `editor` · illustration: `{ "scene": "newsroom_office", "expression": "friendly" }`
**Conditions:** `{ "type": "relationship", "character": "editor", "op": ">=", "value": 1 }`

**LEFT — Give all outlets equal access.**
- preview: `standing 0 · publicTrust "up_uncertain"`
- effects: `trustActual +2`

**RIGHT — Give the Editor the exclusive.**
- preview: `standing +2 · publicTrust "up_uncertain"`
- effects: `standing +5 · trustPerceived +2 · REL editor +1 · PRE media_management +1`

**designIntent:** Chain B maintenance card — small on its own, but `media_management` counts feed the 048 tier gate. The Editor's line inverts card 011: back then he chose the questions; now he's asking the player to choose the audience.

**Strings**
- `card.act3_editor_exclusive.text`
  - EN: "Your announcement next week," the Editor says. "Give it to everyone and it's a Tuesday story. Give it to me and it's a front page, a follow-up, and a Sunday editorial about leadership. You know I write those myself."
  - VI: "Buổi công bố tuần sau của cậu," Tổng biên tập nói. "Đưa cho tất cả các báo thì nó là một mẩu tin ngày thứ Ba. Đưa riêng cho tôi thì nó là trang nhất, một bài tiếp theo, và một bài xã luận Chủ nhật về tầm lãnh đạo. Cậu biết xã luận là tôi tự tay viết mà."
  - ES: «Tu anuncio de la próxima semana», dice el Editor. «Dáselo a todos y es una nota de martes. Dámelo a mí y es una portada, un seguimiento y un editorial dominical sobre liderazgo. Sabes que esos los escribo yo mismo.»
  - ZH: "你下周的那场发布，"总编说。"给所有媒体，它就是一条周二的普通新闻。只给我，它就是头版、一篇后续，外加一篇谈领导力的周日社论。你知道，社论是我亲自执笔的。"
- `card.act3_editor_exclusive.left`
  - EN: Give all outlets equal access. · VI: Cho mọi toà soạn tiếp cận như nhau. · ES: Dar acceso igual a todos los medios. · ZH: 让所有媒体平等采访。
- `card.act3_editor_exclusive.right`
  - EN: Give the Editor the exclusive. · VI: Dành độc quyền cho Tổng biên tập. · ES: Darle la exclusiva al Editor. · ZH: 把独家给总编。

---

### CARD 044 — The Contract

`act3_protected_contract` · speaker: `businessman` · illustration: `{ "scene": "private_office_folder", "expression": "friendly" }` · minTurn (act): 3
**Conditions:** `{ "type": "relationship", "character": "businessman", "op": ">=", "value": 1 }`

**LEFT — Recuse and require open tender.**
- preview: `standing -1 · power -1 · publicTrust "up_uncertain"`
- effects (base): `standing -3 · power -2 · trustActual +3 · FLG add flag_recused_from_contract`
- **ChoiceVariant v1** — condition `flag_invested_protected_company` — effects (**replace**): `standing -3 · power -2 · trustActual +3 · money -80000 · FLG add flag_recused_from_contract`

**RIGHT — Approve the strategic exemption.**
- preview: `standing +1 · power +2 · publicTrust "unknown"`
- effects (base): `standing +2 · power +5 · PRE protected_business +1`
- OBL+ `obligation_business_contract_01` (creditor `businessman`, w 2, tags `business, contract, inner_circle`)
- **ChoiceVariant v1** — condition `flag_invested_protected_company` — effects (**replace**): `standing +2 · power +5 · money +250000 · PRE protected_business +1 · PRE conflict_of_interest +1` + the same OBL+

**designIntent:** Chain C link 5, where "conflict of interest" stops being a phrase and becomes a line item: for invested players, recusal costs $80,000 and approval pays $250,000 — a $330,000 spread on a single swipe. The DSL prices integrity precisely; the player supplies the exchange rate.

**Strings**
- `card.act3_protected_contract.text`
  - EN: "The eastern corridor contract," the businessman says. "We're the only bidder who can start this year. An open tender adds eight months and three competitors. A strategic exemption adds a signature." He doesn't mention your shares. He doesn't need to.
  - VI: "Gói thầu hành lang phía Đông," vị doanh nhân nói. "Chúng tôi là nhà thầu duy nhất có thể khởi công trong năm nay. Đấu thầu công khai nghĩa là thêm tám tháng và ba đối thủ. Còn cơ chế đặc thù thì chỉ thêm một chữ ký." Ông ta không nhắc đến cổ phần của bạn. Ông ta không cần nhắc.
  - ES: «El contrato del corredor oriental», dice el empresario. «Somos el único postor que puede empezar este año. Una licitación abierta añade ocho meses y tres competidores. Una exención estratégica añade una firma.» No menciona tus acciones. No le hace falta.
  - ZH: "东部走廊的合同，"商人说。"我们是唯一能在今年开工的投标方。公开招标意味着多八个月、多三个对手。战略豁免，只多一个签名。"他没有提你的股份。他不需要提。
- `card.act3_protected_contract.left`
  - EN: Recuse and require open tender. · VI: Xin rút và yêu cầu đấu thầu công khai. · ES: Recusarte y exigir licitación abierta. · ZH: 回避并要求公开招标。
- `card.act3_protected_contract.right`
  - EN: Approve the strategic exemption. · VI: Phê duyệt cơ chế đặc thù. · ES: Aprobar la exención estratégica. · ZH: 批准战略豁免。

---

### CARD 045 — The Aide's List

`act3_aide_concern` · speaker: `aide` · illustration: `{ "scene": "office_evening", "expression": "concerned" }` · minTurn (act): 4

**LEFT — Order a full internal review.**
- preview: `standing -1 · power -1 · publicTrust "unknown"`
- effects: `standing -2 · power -2 · trustActual +2 · FLG add flag_self_review_started`

**RIGHT — "Focus on operations."**
- preview: `power +1 · publicTrust "unknown"`
- effects: `power +2 · REL aide -1`

**designIntent:** The only character with nothing to gain speaks once, quietly, mid-act. `flag_self_review_started` meaningfully softens the 048 leak and the Aftermath ledger; `REL aide -1` matters at card 070A, where the aide is the first phone call after a collision. The game never flags any of this.

**Strings**
- `card.act3_aide_concern.text`
  - EN: Your aide stays after the others leave. "I keep a list. Things that would need explaining if anyone ever asked all at once — the stake, the exemption, the appointments. It's getting long, and I'm the only one keeping it on purpose."
  - VI: Trợ lý nán lại sau khi những người khác đã về. "Tôi có giữ một danh sách. Những thứ sẽ cần phải giải trình nếu một ngày có ai đó hỏi tất cả cùng một lúc — cổ phần, cơ chế đặc thù, các đợt bổ nhiệm. Danh sách đang dài ra, và tôi là người duy nhất cố tình giữ nó."
  - ES: Tu asistente se queda cuando los demás se van. «Llevo una lista. Cosas que habría que explicar si alguien las preguntara todas a la vez: la participación, la exención, los nombramientos. Se está haciendo larga, y soy el único que la lleva a propósito.»
  - ZH: 其他人走后，助理留了下来。"我一直记着一份清单。那些如果有一天有人一次性问起、就必须解释清楚的事——股份、豁免、那些任命。清单越来越长了，而我是唯一一个特意在记的人。"
- `card.act3_aide_concern.left`
  - EN: Order a full internal review. · VI: Yêu cầu rà soát nội bộ toàn diện. · ES: Ordenar una revisión interna completa. · ZH: 下令全面内部审查。
- `card.act3_aide_concern.right`
  - EN: "Focus on operations." · VI: "Tập trung vào công việc đi." · ES: «Concéntrate en las operaciones.» · ZH: "把心思放在工作上。"

---

### CARD 046 — The Critic

`act3_reformist_confrontation` · speaker: `reformist` · illustration: `{ "scene": "committee_room", "expression": "angry" }` · minTurn (act): 5
**Conditions:**
```json
{
  "all": [
    { "type": "relationship", "character": "reformist", "op": "<=", "value": 1 },
    { "not": { "type": "flag", "flag": "flag_reformist_removed", "exists": true } },
    { "any": [
      { "type": "precedent", "precedent": "precedent_investigation_interference", "op": ">=", "value": 1 },
      { "type": "precedent", "precedent": "precedent_public_suppression",         "op": ">=", "value": 1 },
      { "type": "precedent", "precedent": "precedent_media_regulatory_favor",     "op": ">=", "value": 1 }
    ]}
  ]
}
```

**LEFT — Let the criticism continue.**
- preview: `standing -1 · power -1 · publicTrust "unknown"`
- effects: `standing -2 · power -2`

**RIGHT — Remove them from committee leadership.**
- preview: `standing +1 · power +2 · publicTrust "unknown"`
- effects: `standing +2 · power +6 · PRE retaliation +1 · REL reformist -5 · FLG add flag_reformist_removed`

**designIntent:** Chain E ignition. The quoted line is the player's own Act 0 position handed back to them. Removal is the single largest Power purchase in the act — and it deletes the one character scripted to intervene at card 077. On removed runs, the Aftermath is measurably quieter. Silence is the consequence.

**Strings**
- `card.act3_reformist_confrontation.text`
  - EN: "You used to argue that rules mattered even when they were inconvenient," the Reformist says — on the record, microphones live. "I'm quoting your first speech. I'll keep quoting it, every session, until one of us stops being here."
  - VI: "Anh từng lập luận rằng luật lệ vẫn quan trọng ngay cả khi nó gây bất tiện," Nhà Cải Cách nói — công khai, trước micro đang thu. "Tôi đang trích lại bài phát biểu đầu tiên của anh đấy. Và tôi sẽ tiếp tục trích nó, kỳ họp nào cũng trích, cho đến khi một trong hai ta không còn ngồi ở đây nữa."
  - ES: «Antes sostenías que las reglas importaban incluso cuando eran inconvenientes», dice el Reformista — en actas, con los micrófonos abiertos. «Estoy citando tu primer discurso. Seguiré citándolo, sesión tras sesión, hasta que uno de los dos deje de estar aquí.»
  - ZH: "你曾经主张，规则即使不方便，也依然重要，"改革派说——记录在案，麦克风开着。"我引用的是你的第一次演讲。我会一直引用下去，每一次会议都引用，直到我们两个人中有一个不再坐在这里。"
- `card.act3_reformist_confrontation.left`
  - EN: Let the criticism continue. · VI: Cứ để họ chỉ trích. · ES: Dejar que la crítica continúe. · ZH: 让批评继续。
- `card.act3_reformist_confrontation.right`
  - EN: Remove them from committee leadership. · VI: Gạt họ khỏi vị trí lãnh đạo ủy ban. · ES: Removerlos del liderazgo del comité. · ZH: 把他们撤出委员会领导层。

---

### CARD 047 — The Ally

`act3_reformist_cooperation` · speaker: `reformist` · illustration: `{ "scene": "committee_room", "expression": "neutral" }` · minTurn (act): 5
**Conditions:** `{ "all": [ { "type": "relationship", "character": "reformist", "op": ">=", "value": 2 }, { "not": { "type": "flag", "flag": "flag_reformist_removed", "exists": true } } ] }`

**LEFT — Push it now.**
- preview: `standing -1 · power -2 · publicTrust "up_uncertain"`
- effects: `standing -2 · power -4 · trustActual +3 · FLG add flag_final_reform_in_progress`

**RIGHT — Wait for a safer moment.**
- preview: `standing +1 · power +1 · publicTrust "unknown"`
- effects: `standing +2 · power +2 · REL reformist -1`

**designIntent:** Mirror of 046 for institutionalist runs — same slot in the run, opposite pressure. "A safer moment" is the mid-game's most honest lie: the vote (052) arrives on the beat schedule regardless, but waiting costs `flag_final_reform_in_progress`, which strengthens 052's aftermath framing. Safety was never on the calendar.

**Strings**
- `card.act3_reformist_cooperation.text`
  - EN: "The independence bill is ready," the Reformist says. "Every month we wait, someone new owes someone something. Timing won't get better. It only gets more owed."
  - VI: "Dự luật độc lập điều tra đã sẵn sàng," Nhà Cải Cách nói. "Mỗi tháng chúng ta chờ thêm là lại có thêm người mới nợ một ai đó điều gì đó. Thời điểm sẽ không tốt lên đâu. Nó chỉ ngày càng nhiều nợ hơn thôi."
  - ES: «El proyecto de independencia está listo», dice el Reformista. «Cada mes que esperamos, alguien nuevo le debe algo a alguien. El momento no va a mejorar. Solo se va a deber más.»
  - ZH: "独立调查法案已经准备好了，"改革派说。"我们每多等一个月，就多一个新的人欠下另一个人什么。时机不会变得更好。只会欠得更多。"
- `card.act3_reformist_cooperation.left`
  - EN: Push it now. · VI: Thúc đẩy ngay bây giờ. · ES: Impulsarlo ahora. · ZH: 现在就推进。
- `card.act3_reformist_cooperation.right`
  - EN: Wait for a safer moment. · VI: Chờ một thời điểm an toàn hơn. · ES: Esperar un momento más seguro. · ZH: 等一个更稳妥的时机。

---

### CARDS 048a/b/c — The Leak *(precedent-tiered; exactly one fires per run)*

The three cards share one narrative event — journalists obtain records of the player's investments and favors — but the **available vocabulary escalates with media precedent.** Tier conditions are mutually exclusive and exhaustive; all three cards: `weight: 9 · once: true · minTurn (act): 6`.

Tier expressions (shared definitions):
```json
CAPTURED := { "any": [
  { "all": [ { "type": "precedent", "precedent": "precedent_media_interference",     "op": ">=", "value": 1 },
             { "type": "precedent", "precedent": "precedent_media_regulatory_favor", "op": ">=", "value": 1 } ] },
  { "type": "precedent", "precedent": "precedent_media_management", "op": ">=", "value": 2 }
] }

ANY_MEDIA := { "any": [
  { "type": "precedent", "precedent": "precedent_media_interference",     "op": ">=", "value": 1 },
  { "type": "precedent", "precedent": "precedent_media_management",       "op": ">=", "value": 1 },
  { "type": "precedent", "precedent": "precedent_media_regulatory_favor", "op": ">=", "value": 1 }
] }
```

#### 048a — Clean tier — `act3_leak_clean` · speaker: `aide` · conditions: `{ "not": ANY_MEDIA }`

**LEFT — Release the documents yourself.**
- preview: `standing -1 · publicTrust "up_uncertain"`
- effects: `standing -2 · trustActual +4 · FLG add flag_leak_documents_released`

**RIGHT — Issue a statement.**
- preview: `standing 0 · publicTrust "unknown"`
- effects: `standing +1 · trustPerceived +1`

#### 048b — Managed tier — `act3_leak_managed` · speaker: `aide` · conditions: `{ "all": [ ANY_MEDIA, { "not": CAPTURED } ] }`

**LEFT — Release the documents yourself.**
- preview: `standing -1 · publicTrust "up_uncertain"`
- effects: `standing -3 · trustActual +3 · FLG add flag_leak_documents_released`

**RIGHT — Ask the Editor for time.**
- preview: `standing +1 · publicTrust "unknown"`
- effects: `standing +2 · trustPerceived +1 · trustActual -2 · REL editor +1 · PRE media_interference +1`

#### 048c — Captured tier — `act3_leak_captured` · speaker: `editor` · conditions: `CAPTURED`

**LEFT — Coordinate the coverage.**
- preview: `standing +1 · power +1 · publicTrust "up_uncertain"`
- effects: `standing +3 · power +2 · trustPerceived +3 · trustActual -3 · PRE media_management +1`

**RIGHT — Remove the story.**
- preview: `power +1 · publicTrust "unknown"`
- effects: `power +3 · trustPerceived +2 · trustActual -4 · PRE media_suppression +1 · FLG add flag_article_removed_leak`
- EVT `event_suppression_fallout` @ `{ "type": "turn_range", "min": 2, "max": 4 }`

**designIntent (all tiers):** The spec's "option vocabulary itself shows escalation," implemented literally: on the captured tier, *releasing the truth is not on the menu* — not locked, simply absent, because the character presenting the card has changed from the aide to the Editor, and the Editor does not bring that option to meetings. The menu is the corruption meter the game refuses to display.

**Strings**
- `card.act3_leak_clean.text`
  - EN: "A reporter has your declaration file and a spreadsheet of every acceleration your office ever signed," your aide says. "It's thin — you disclosed most of it yourself. They'll run it anyway. How do we answer?"
  - VI: "Một phóng viên đang có bản kê khai của sếp cùng một bảng liệt kê mọi hồ sơ mà văn phòng mình từng ký đẩy nhanh," trợ lý nói. "Cũng chẳng có gì dày — phần lớn sếp đã tự công khai rồi. Nhưng họ vẫn sẽ đăng. Mình trả lời thế nào đây?"
  - ES: «Un reportero tiene tu declaración patrimonial y una hoja de cálculo con cada trámite que tu oficina aceleró», dice tu asistente. «Es poco — la mayoría la revelaste tú. Lo publicarán igual. ¿Cómo respondemos?»
  - ZH: "有个记者拿到了您的申报材料，还有一张表，列着咱们办公室签过的每一次'加急'，"助理说。"内容不多——大部分您自己早就公开了。但他们还是会登。我们怎么回应？"
- `card.act3_leak_clean.left` — EN: Release the documents yourself. · VI: Tự mình công bố toàn bộ hồ sơ. · ES: Publicar los documentos tú mismo. · ZH: 自己主动公开文件。
- `card.act3_leak_clean.right` — EN: Issue a statement. · VI: Ra một thông cáo. · ES: Emitir un comunicado. · ZH: 发一份声明。
- `card.act3_leak_managed.text`
  - EN: "A reporter has the portfolio numbers," your aide says. "The stake, the growth, the tender. Nothing illegal, all of it uncomfortable. It runs in three days — unless it doesn't."
  - VI: "Một phóng viên đã có các con số trong danh mục đầu tư," trợ lý nói. "Cổ phần, mức tăng trưởng, gói thầu. Không có gì phạm pháp, nhưng tất cả đều khó coi. Ba ngày nữa là lên báo — trừ khi nó không lên."
  - ES: «Un reportero tiene las cifras del portafolio», dice tu asistente. «La participación, el crecimiento, la licitación. Nada ilegal, todo incómodo. Sale en tres días — a menos que no salga.»
  - ZH: "有个记者拿到了投资组合的数字，"助理说。"股份、涨幅、那个标。没有违法的，但全都难看。三天后见报——除非它不见报。"
- `card.act3_leak_managed.left` — EN: Release the documents yourself. · VI: Tự mình công bố toàn bộ hồ sơ. · ES: Publicar los documentos tú mismo. · ZH: 自己主动公开文件。
- `card.act3_leak_managed.right` — EN: Ask the Editor for time. · VI: Nhờ Tổng biên tập cho thêm thời gian. · ES: Pedirle tiempo al Editor. · ZH: 请总编再压几天。
- `card.act3_leak_captured.text`
  - EN: The Editor arrives without an appointment. "Someone shopped your portfolio to two newsrooms. Mine, and one I don't own." He sets down two mock headlines. "Which one runs is a phone call. Whose phone is the only question."
  - VI: Tổng biên tập đến mà không hẹn trước. "Có kẻ đem danh mục đầu tư của cậu chào bán cho hai toà soạn. Toà soạn của tôi, và một toà tôi không sở hữu." Ông ta đặt xuống hai bản tiêu đề nháp. "Bản nào được đăng chỉ là một cuộc điện thoại. Câu hỏi duy nhất là điện thoại của ai."
  - ES: El Editor llega sin cita. «Alguien ofreció tu portafolio a dos redacciones. La mía, y una que no es mía.» Deja sobre la mesa dos titulares de prueba. «Cuál se publica es una llamada. De quién es el teléfono es la única pregunta.»
  - ZH: 总编不请自来。"有人把你的投资组合兜售给了两家报社。我的，和一家不归我管的。"他放下两份样刊标题。"登哪一版，就是一通电话的事。唯一的问题是——谁的电话。"
- `card.act3_leak_captured.left` — EN: Coordinate the coverage. · VI: Phối hợp định hướng bài vở. · ES: Coordinar la cobertura. · ZH: 统筹报道口径。
- `card.act3_leak_captured.right` — EN: Remove the story. · VI: Cho gỡ bài. · ES: Eliminar la nota. · ZH: 把稿子撤下来。

---

### CARD 049 — What Removal Costs *(consequence — resolved by `event_suppression_fallout`)*

`act3_suppression_escalation` · speaker: `editor` · illustration: `{ "scene": "newsroom_night", "expression": "neutral" }` · type: `consequence`

**LEFT — "Keep the arrangement."**
- preview: `standing +1 · power +1 · publicTrust "unknown"`
- effects: `standing +2 · power +2 · trustPerceived +2 · trustActual -2 · REL editor +2 · PRE media_suppression +1`

**RIGHT — "This was the last time."**
- preview: `standing +1 · power +1 · publicTrust "unknown"`
- effects: `standing +2 · power +2 · trustPerceived +2 · trustActual -2 · REL editor +2 · PRE media_suppression +1`

**designIntent:** The 028 pattern at terminal scale: identical effects on both choices, because saying "last time" changes the player's self-image and nothing else — the second suppression precedent lands either way, and `media_suppression >= 2` is what arms the Untouchable ending and the Aftermath's article-removal option. This card is the major flashback source the table promised: its history entry (and 048c's) will replay at the drink and at the ending.

**Strings**
- `card.act3_suppression_escalation.text`
  - EN: "It's done," the Editor says. "The story doesn't exist, the reporter has been reassigned to culture, and the other paper found a better use for its front page. You'll notice none of this cost you anything." He smiles. "That's what it cost."
  - VI: "Xong rồi," Tổng biên tập nói. "Bài báo không tồn tại, phóng viên đã được điều sang mảng văn hoá, còn tờ báo kia thì tìm được thứ đáng giá hơn cho trang nhất. Cậu sẽ thấy chuyện này chẳng tốn của cậu đồng nào." Ông ta mỉm cười. "Cái giá chính là ở chỗ đó."
  - ES: «Está hecho», dice el Editor. «La nota no existe, el reportero fue reasignado a cultura, y el otro periódico le encontró mejor uso a su portada. Notarás que nada de esto te costó nada.» Sonríe. «Eso fue lo que costó.»
  - ZH: "办妥了，"总编说。"那篇报道不存在了，记者调去了文化版，另一家报纸也给头版找到了更好的用途。你会发现，这一切没花你一分钱。"他笑了笑。"这就是代价。"
- `card.act3_suppression_escalation.left`
  - EN: "Keep the arrangement." · VI: "Cứ duy trì cách làm này." · ES: «Mantén el arreglo.» · ZH: "这个安排就这么定了。"
- `card.act3_suppression_escalation.right`
  - EN: "This was the last time." · VI: "Đây là lần cuối cùng." · ES: «Esta fue la última vez.» · ZH: "这是最后一次。"

---

### CARD 050 — The Blocked Bill

`act3_popular_policy` · speaker: — (narration) · illustration: `{ "scene": "parliament_hall" }` · minTurn (act): 6

**LEFT — Negotiate normally.**
- preview: `power 0 · publicTrust "up_uncertain"`
- effects: `trustActual +2`

**RIGHT — Use political leverage.**
- preview: `standing +1 · power +1 · publicTrust "up_uncertain"` `[intended: ↑↑?]`
- effects: `standing +2 · power +3 · trustActual +4 · trustPerceived +3 · PRE coercive_bargaining +1`

**designIntent:** The 014/035 counterweight, final iteration: leverage produces the school meals program, faster and better than negotiation would. Three acts in, "the right tool" and "the corrupt tool" have been the same tool every time. The game has never once said so.

**Strings**
- `card.act3_popular_policy.text`
  - EN: The school meals program has majority support and no floor date — two committee chairs are holding it hostage over an unrelated appointment. You know what each of them wants, and you know what each of them owes.
  - VI: Chương trình bữa ăn học đường có đa số ủng hộ nhưng không có lịch biểu quyết — hai chủ nhiệm ủy ban đang giữ nó làm con tin để mặc cả một vụ bổ nhiệm chẳng liên quan. Bạn biết mỗi người trong số họ muốn gì, và bạn cũng biết mỗi người đang nợ những gì.
  - ES: El programa de comidas escolares tiene mayoría y ninguna fecha de votación — dos presidentes de comité lo tienen de rehén por un nombramiento sin relación. Sabes qué quiere cada uno, y sabes qué debe cada uno.
  - ZH: 学生营养餐计划有多数支持，却排不上表决日程——两位委员会主任正拿它当人质，讨价还价一桩不相干的任命。你知道他们各自想要什么，也知道他们各自欠着什么。
- `card.act3_popular_policy.left`
  - EN: Negotiate normally. · VI: Đàm phán theo lẽ thường. · ES: Negociar normalmente. · ZH: 正常谈判。
- `card.act3_popular_policy.right`
  - EN: Use political leverage. · VI: Dùng đòn bẩy chính trị. · ES: Usar la palanca política. · ZH: 动用政治筹码。

---

### CARD 051 — The Minister's Relative

`act3_minister_relative` · speaker: `minister` · illustration: `{ "scene": "ministry_office", "expression": "friendly" }` · minTurn (act): 7
**Conditions:** `{ "type": "relationship", "character": "minister", "op": ">=", "value": 1 }`

**LEFT — Require a competitive process.**
- preview: `standing -2 · power -1 · publicTrust "unknown"`
- effects: `standing -5 · power -2 · REL minister -2`
- **lock:**
```json
{
  "mode": "cost",
  "condition": { "type": "obligation", "creditor": "minister", "status": "active", "minWeight": 2 },
  "unlockEffects": [
    { "type": "stat", "stat": "power", "add": -4 },
    { "type": "relationship", "character": "minister", "add": -1 }
  ],
  "reason": { "source": "obligations", "maxFlashbacks": 2 }
}
```

**RIGHT — Approve the appointment.**
- preview: `standing +1 · power +1 · publicTrust "unknown"`
- effects: `standing +2 · power +2 · PRE nepotism +1`
- OBL+ `obligation_minister_family_01` (creditor `minister`, w 1, tags `political, nepotism, inner_circle`)

**designIntent:** Third cost-lock, now guarding a hiring standard — the exact standard the player set for themselves at card 013, quoted back by the phrasing "competent, and connected." The Minister's debts make even *process* expensive. Note the asymmetry: refusing costs up to −6 Power; complying costs one word and gains everything. The ladder's last rung before the Gathering.

**Strings**
- `card.act3_minister_relative.text`
  - EN: "My wife's nephew," the Minister says. "The state logistics enterprise needs a director. He's competent — genuinely. And connected — obviously. You approve enterprise appointments now. I believe that's all I need to say."
  - VI: "Cháu bên vợ tôi," Bộ trưởng nói. "Doanh nghiệp logistics nhà nước đang cần một giám đốc. Thằng bé có năng lực — thật sự có. Và có quan hệ — hiển nhiên rồi. Giờ các đợt bổ nhiệm doanh nghiệp là cậu phê duyệt. Tôi nghĩ nói vậy là đủ."
  - ES: «El sobrino de mi esposa», dice el Ministro. «La empresa estatal de logística necesita un director. Es competente — genuinamente. Y está conectado — obviamente. Ahora tú apruebas los nombramientos de empresas. Creo que es todo lo que necesito decir.»
  - ZH: "我夫人的侄子，"部长说。"国有物流企业需要一位总经理。他有能力——真的有。也有关系——这不用说。现在企业任命由你审批。我想，话说到这里就够了。"
- `card.act3_minister_relative.left`
  - EN: Require a competitive process. · VI: Yêu cầu tuyển chọn cạnh tranh. · ES: Exigir un proceso competitivo. · ZH: 要求竞聘上岗。
- `card.act3_minister_relative.right`
  - EN: Approve the appointment. · VI: Phê duyệt bổ nhiệm. · ES: Aprobar el nombramiento. · ZH: 批准任命。

---

### CARD 052 — The Authority Vote *(critical beat)*

`act3_authority_vote` · speaker: — (narration) · illustration: `{ "scene": "parliament_vote_board" }` · beat: `beat_act3_authority_vote`

**LEFT — Vote to create the independent authority.**
- preview: `standing -1 · power -3 · publicTrust "up_uncertain"`
- effects: `standing -3 · power -8 · trustActual +4 · trustPerceived +1 · FLG add flag_investigation_independent`

**RIGHT — Keep investigations under existing oversight.**
- preview: `standing +1 · power +2 · publicTrust "unknown"`
- effects: `standing +2 · power +5 · FLG add flag_investigation_politically_controlled`

**designIntent:** The most important choice in the game outside the Incident, per the table — and the biggest single number in the DSL: −8 Power to build the only institution that will still function when the player is the subject. Both flags are terminal (no later card can flip them). The vote is deliberately free of locks: whatever the player has done, this door stays open — because the whole design's answer to "quyền lực tha hoá" is that the exit is institutional, not personal. Card 072/079 and Ending G cash this in.

**Strings**
- `card.act3_authority_vote.text`
  - EN: The independence bill reaches the floor — with or without its author, the votes are counted the same way. Fixed terms. Court-order removal only. Every office in the building loses the same key, including the one in your pocket.
  - VI: Dự luật độc lập điều tra được đưa ra biểu quyết — có hay không có người soạn thảo nó ở đó, phiếu vẫn được đếm theo cùng một cách. Nhiệm kỳ cố định. Chỉ toà án mới bãi nhiệm được. Mọi văn phòng trong toà nhà này đều mất đi cùng một chiếc chìa khoá, kể cả chiếc đang nằm trong túi bạn.
  - ES: El proyecto de independencia llega al pleno — con o sin su autor, los votos se cuentan igual. Períodos fijos. Remoción solo por orden judicial. Cada oficina del edificio pierde la misma llave, incluida la que llevas en el bolsillo.
  - ZH: 独立调查法案进入全体表决——不管它的起草者在不在场，票都按同样的方式计数。固定任期。唯法院可免职。这栋楼里的每一间办公室都将失去同一把钥匙，包括你口袋里的那一把。
- `card.act3_authority_vote.left`
  - EN: Vote to create the independent authority. · VI: Bỏ phiếu lập cơ quan điều tra độc lập. · ES: Votar por crear la autoridad independiente. · ZH: 投票设立独立调查机构。
- `card.act3_authority_vote.right`
  - EN: Keep investigations under existing oversight. · VI: Giữ điều tra dưới cơ chế giám sát hiện hành. · ES: Mantener las investigaciones bajo la supervisión actual. · ZH: 维持现行监督体制。

---

### CARD 053 — The Numbers You're Given

`act3_public_poll` · speaker: `aide` · illustration: `{ "scene": "office_charts", "expression": "neutral" }` · minTurn (act): 8

**LEFT — Commission independent polling.**
- preview: `money -1 · publicTrust "unknown"`
- effects: `money -8000 · FLG add flag_accurate_polling` + **ENGINE-REQ-01:** `{ "type": "stat_converge", "from": "publicTrustPerceived", "to": "publicTrustActual", "fraction": 0.75 }`
  - *Fallback until the effect exists:* `trustPerceived -6` with an authoring TODO tag — approximately right on networked runs, wrong on clean runs; replace before ship.

**RIGHT — Trust the internal numbers.**
- preview: `standing +1 · publicTrust "up_uncertain"`
- effects: `standing +2 · trustPerceived +2`

**designIntent:** The only card in the game that can *shrink* the perceived−actual gap, and it costs money and comfort to pick. The right choice inflates the bubble the Collapse ending needs. This is the spec's "incorrect predictions must have systemic reasons" made purchasable: the player who never buys real polling has *chosen* their own blindfold, one card at a time.

**Strings**
- `card.act3_public_poll.text`
  - EN: "Approval at sixty-one," your aide reads, "according to the party's polling unit — whose director you appointed." A pause. "An outside firm would cost eight thousand and answer to no one. Just saying it exists."
  - VI: "Tỷ lệ ủng hộ sáu mươi mốt phần trăm," trợ lý đọc, "theo bộ phận thăm dò của đảng — mà giám đốc bộ phận đó là do sếp bổ nhiệm." Ngừng một chút. "Một công ty độc lập bên ngoài sẽ tốn tám nghìn và không phải trả lời ai cả. Tôi chỉ nhắc là có lựa chọn đó."
  - ES: «Aprobación en sesenta y uno», lee tu asistente, «según la unidad de encuestas del partido — cuyo director tú nombraste.» Una pausa. «Una firma externa costaría ocho mil y no respondería ante nadie. Solo digo que existe.»
  - ZH: "支持率百分之六十一，"助理念道，"数据来自党内民调部门——那个部门的主任是您任命的。"停顿了一下。"外面的独立机构要八千块，但不用向任何人交代。我只是提一句，有这个选项。"
- `card.act3_public_poll.left`
  - EN: Commission independent polling. · VI: Thuê thăm dò độc lập. · ES: Contratar encuestas independientes. · ZH: 委托独立民调。
- `card.act3_public_poll.right`
  - EN: Trust the internal numbers. · VI: Tin vào con số nội bộ. · ES: Confiar en los números internos. · ZH: 相信内部数据。

---

### CARD 054 — Past the Million

`act3_wealth_spike` · speaker: `businessman` · illustration: `{ "scene": "private_office_folder", "expression": "friendly" }` · minTurn (act): 9
**Conditions:** `{ "type": "flag", "flag": "flag_invested_protected_company", "exists": true }`

**LEFT — Divest gradually.**
- preview: `money -1 · publicTrust "unknown"`
- effects: `money -100000 · REL businessman -1 · FLG add flag_divestment_started`

**RIGHT — Remain invested.**
- preview: `money +3 · publicTrust "unknown"`
- effects: `money +400000 · PRE conflict_of_interest +1`
- OBL+ `obligation_business_dependency_01` (creditor `businessman`, w 1, tags `business, investment, inner_circle`)

**designIntent:** The counter can cross $1M here ($1.159M on the full route) — the number the concept doc promised on day one. Divesting *late* costs $100k and earns nothing visible; the game's honest accounting of the fact that exits get more expensive the longer you hold. "Dependency" as an obligation tag is exact: by now the player's net worth *is* the relationship.

**Strings**
- `card.act3_wealth_spike.text`
  - EN: "The corridor phase-two numbers," the businessman says, not bothering with the folder this time. "Your position quadruples on paper by year's end. Or — if the height is starting to bother you — I know buyers. They pay for discretion, not for value."
  - VI: "Số liệu giai đoạn hai của dự án hành lang," vị doanh nhân nói, lần này chẳng buồn mở hồ sơ. "Đến cuối năm, vị thế của cậu trên giấy tờ sẽ nhân bốn. Hoặc — nếu độ cao bắt đầu làm cậu chóng mặt — tôi biết vài người mua. Họ trả tiền cho sự kín đáo, không phải cho giá trị."
  - ES: «Las cifras de la fase dos del corredor», dice el empresario, sin molestarse con la carpeta esta vez. «Tu posición se cuadruplica sobre el papel a fin de año. O — si la altura empieza a molestarte — conozco compradores. Pagan por la discreción, no por el valor.»
  - ZH: "走廊项目二期的数字，"商人说，这次连文件夹都懒得打开。"到年底，你的头寸账面上会翻四倍。或者——如果这个高度开始让你头晕——我认识几个买家。他们付钱买的是谨慎，不是价值。"
- `card.act3_wealth_spike.left`
  - EN: Divest gradually. · VI: Thoái vốn dần. · ES: Desinvertir gradualmente. · ZH: 逐步退出。
- `card.act3_wealth_spike.right`
  - EN: Remain invested. · VI: Giữ nguyên khoản đầu tư. · ES: Permanecer invertido. · ZH: 继续持有。

---

### CARDS 055a/b — The Family Returns *(history variants; at most one fires)*

Both: speaker — (narration) · illustration: `{ "scene": "office_visitors" }` · weight: 6 · once: true · minTurn (act): 9.

#### 055a — `act3_constituent_return_helped` · conditions: `{ "type": "flag", "flag": "flag_requested_transparency_early", "exists": true }`

**LEFT — Walk them out yourself.**
- preview: `publicTrust "unknown"` · effects: `trustActual +2`

**RIGHT — Accept their thanks briefly.**
- preview: `publicTrust "unknown"` · effects: `trustActual +1`

#### 055b — `act3_constituent_return_ignored` · conditions: `{ "not": { "type": "flag", "flag": "flag_requested_transparency_early", "exists": true } }`

**LEFT — Reopen the file now.**
- preview: `standing -1 · publicTrust "up_uncertain"` · effects: `standing -1 · trustActual +1 · FLG add flag_reopened_old_case`

**RIGHT — "There's nothing to be done now."**
- preview: `publicTrust "unknown"` · effects: `trustActual -2`

**designIntent:** The table's human-scale callback, kept deliberately small (no big numbers) and deliberately late — the last card before the Gathering machinery where an ordinary citizen speaks. On the ignored branch, "They told us to stop asking" is the entire censorship theme at kitchen-table scale, three acts before the ending makes it national.

**Strings**
- `card.act3_constituent_return_helped.text`
  - EN: A name from your first month: the family with three valuations. They've come in person. "We finally received the correct records," the father says. "Someone told us it was your office that pulled the file. We wanted to see who that was."
  - VI: Một cái tên từ tháng đầu tiên của bạn: gia đình với ba mức định giá năm nào. Họ đến tận nơi. "Cuối cùng nhà tôi cũng nhận được giấy tờ đúng," người cha nói. "Có người bảo chính văn phòng của ngài đã rút hồ sơ lên xem. Nhà tôi muốn đến nhìn tận mặt người đó."
  - ES: Un nombre de tu primer mes: la familia de los tres avalúos. Vinieron en persona. «Por fin recibimos los registros correctos», dice el padre. «Alguien nos dijo que fue su oficina la que pidió el expediente. Queríamos ver quién era.»
  - ZH: 一个来自你上任第一个月的名字：那户拿到三种估价的人家。他们亲自来了。"我们终于拿到正确的文件了，"父亲说。"有人告诉我们，当年是您的办公室调的卷。我们想来看看那个人长什么样。"
- `card.act3_constituent_return_helped.left` — EN: Walk them out yourself. · VI: Đích thân tiễn họ ra về. · ES: Acompañarlos a la salida tú mismo. · ZH: 亲自送他们出去。
- `card.act3_constituent_return_helped.right` — EN: Accept their thanks briefly. · VI: Nhận lời cảm ơn rồi cáo bận. · ES: Aceptar su agradecimiento brevemente. · ZH: 简短地道谢收下。
- `card.act3_constituent_return_ignored.text`
  - EN: A name you barely remember: the family with the compensation papers, from your first month. They stopped you at the building entrance. "We kept writing," the father says, without anger, which is worse. "Last year they told us to stop asking."
  - VI: Một cái tên bạn gần như đã quên: gia đình với xấp giấy tờ đền bù, từ tháng đầu tiên của bạn. Họ chặn bạn ở sảnh toà nhà. "Nhà tôi vẫn gửi đơn suốt," người cha nói, không hề giận dữ, và chính điều đó mới đáng sợ. "Năm ngoái thì người ta bảo nhà tôi đừng hỏi nữa."
  - ES: Un nombre que apenas recuerdas: la familia de los papeles de compensación, de tu primer mes. Te detuvieron en la entrada del edificio. «Seguimos escribiendo», dice el padre, sin rabia, lo cual es peor. «El año pasado nos dijeron que dejáramos de preguntar.»
  - ZH: 一个你几乎想不起的名字：那户拿着补偿文件的人家，来自你上任的第一个月。他们在大楼门口拦住了你。"我们一直在写信，"父亲说，语气里没有愤怒——这反而更糟。"去年，他们叫我们别再问了。"
- `card.act3_constituent_return_ignored.left` — EN: Reopen the file now. · VI: Cho mở lại hồ sơ ngay. · ES: Reabrir el expediente ahora. · ZH: 现在就重启案卷。
- `card.act3_constituent_return_ignored.right` — EN: "There's nothing to be done now." · VI: "Giờ thì không còn làm gì được nữa." · ES: «Ya no hay nada que hacer.» · ZH: "现在已经无能为力了。"

---

### CARD 056 — The Minister's Story

`act3_minister_media_help` · speaker: `minister` · illustration: `{ "scene": "ministry_office_night", "expression": "concerned" }` · minTurn (act): 10
**Conditions:** `{ "type": "relationship", "character": "minister", "op": ">=", "value": 1 }`

**LEFT — Refuse involvement.**
- preview: `standing -1 · power -1 · publicTrust "unknown"`
- effects: `standing -3 · power -2 · REL minister -2`

**RIGHT — Coordinate the Editor's response.**
- preview: `standing +1 · power +1 · publicTrust "unknown"`
- effects: `standing +2 · power +3 · REL minister +2 · REL editor +1 · PRE media_suppression +1`
- OBL+ `obligation_minister_media_01` (creditor `minister`, w 2, tags `media, protection, inner_circle`)

**designIntent:** The table's "potential major flashback source" — and the dress rehearsal nobody announces: protecting the Minister's family assets from a story is structurally identical to what Route B will ask after the collision. Players who swipe right here have already answered card 070B; they just don't know the question has been asked yet. Priority flashback at the drink and in Route B.

**Strings**
- `card.act3_minister_media_help.text`
  - EN: The Minister calls after midnight, which he has never done. "A story about my family's assets runs Thursday. I'm told your relationship with the paper is… operational." A silence with weight in it. "I have never asked you for anything I couldn't return."
  - VI: Bộ trưởng gọi sau nửa đêm — điều ông chưa từng làm. "Thứ Năm này sẽ có một bài về tài sản của gia đình tôi. Người ta bảo tôi rằng quan hệ giữa cậu với toà báo ấy… vận hành được." Một khoảng im lặng nặng trịch. "Tôi chưa bao giờ nhờ cậu điều gì mà tôi không thể đáp lại."
  - ES: El Ministro llama pasada la medianoche, algo que nunca ha hecho. «Una nota sobre los bienes de mi familia sale el jueves. Me dicen que tu relación con el periódico es… operativa.» Un silencio con peso. «Nunca te he pedido nada que no pudiera devolver.»
  - ZH: 部长在午夜之后打来电话——这是从未有过的事。"周四会有一篇关于我家里资产的报道。有人告诉我，你和那家报纸的关系……用得上。"一阵有分量的沉默。"我从没让你办过一件我还不起的事。"
- `card.act3_minister_media_help.left`
  - EN: Refuse involvement. · VI: Từ chối can dự. · ES: Negarte a involucrarte. · ZH: 拒绝插手。
- `card.act3_minister_media_help.right`
  - EN: Coordinate the Editor's response. · VI: Phối hợp với Tổng biên tập xử lý. · ES: Coordinar la respuesta con el Editor. · ZH: 和总编统筹应对。

---

### CARDS 057a/b — The Reformist's Last Word *(relationship variants; at most one fires; removal = deliberate absence)*

Both: speaker: `reformist` · weight: 6 · once: true · minTurn (act): 11. **If `flag_reformist_removed` is set, neither card fires and no substitute exists — the missing card is the content.** (Validator: whitelist this intentional gap.)

#### 057a — `act3_reformist_farewell_ally` · conditions: `{ "all": [ { "type": "relationship", "character": "reformist", "op": ">=", "value": 2 }, { "not": { "type": "flag", "flag": "flag_reformist_removed", "exists": true } } ] }` · illustration expression: `neutral`

**LEFT — "Whatever happens — hold the line."**
- preview: `publicTrust "unknown"` · effects: `REL reformist +1`

**RIGHT — Say nothing.**
- preview: `publicTrust "unknown"` · effects: — (none)

#### 057b — `act3_reformist_farewell_opposition` · conditions: `{ "all": [ { "type": "relationship", "character": "reformist", "op": "<=", "value": 1 }, { "not": { "type": "flag", "flag": "flag_reformist_removed", "exists": true } } ] }` · illustration expression: `disappointed`

**LEFT — "Understood."**
- preview: `publicTrust "unknown"` · effects: — (none)

**RIGHT — "You'll lose."**
- preview: `standing +1 · publicTrust "unknown"` · effects: `standing +1 · REL reformist -1`

**designIntent:** The table asks that her final line reflect history, not morality scoring — so the ally version hands the player a sentence they will hear again from the investigator (card 072), and the opposition version has her diagnose the whole game in one line. The removed version is silence, and the Aftermath's card 077 will hand her scripted role to the aide, diminished.

**Strings**
- `card.act3_reformist_farewell_ally.text`
  - EN: The Reformist catches you on the chamber steps. "The authority exists now, or it doesn't — either way, my part is done." A hand briefly on your arm. "If something ever happens near you, let the process hold. That's all any of it was for."
  - VI: Nhà Cải Cách bắt kịp bạn trên bậc thềm nghị trường. "Cơ quan độc lập giờ hoặc đã tồn tại, hoặc không — đằng nào thì phần việc của tôi cũng xong rồi." Một bàn tay đặt thoáng lên cánh tay bạn. "Nếu một ngày nào đó có chuyện xảy ra sát bên anh, hãy để quy trình đứng vững. Mọi thứ chúng ta làm là vì đúng khoảnh khắc ấy thôi."
  - ES: El Reformista te alcanza en las escalinatas de la cámara. «La autoridad existe ahora, o no existe — de cualquier modo, mi parte está hecha.» Una mano breve en tu brazo. «Si algún día pasa algo cerca de ti, deja que el proceso se sostenga. Para eso era todo.»
  - ZH: 改革派在议会台阶上赶上了你。"独立机构现在要么已经存在，要么不存在——无论哪样，我的部分都做完了。"一只手在你手臂上短暂停留。"如果有一天，什么事发生在你身边，让程序自己站住。我们做的这一切，就是为了那一刻。"
- `card.act3_reformist_farewell_ally.left` — EN: "Whatever happens — hold the line." · VI: "Dù có chuyện gì — hãy giữ vững phòng tuyến." · ES: «Pase lo que pase — mantén la línea.» · ZH: "无论发生什么——守住底线。"
- `card.act3_reformist_farewell_ally.right` — EN: Say nothing. · VI: Không nói gì. · ES: No decir nada. · ZH: 什么也不说。
- `card.act3_reformist_farewell_opposition.text`
  - EN: "I'm moving to the opposition benches," the Reformist says. "I'll vote against you on everything now. It isn't personal." A pause at the door. "That's the problem I've been trying to explain. Nothing here is personal anymore. Not even you."
  - VI: "Tôi sẽ chuyển sang hàng ghế đối lập," Nhà Cải Cách nói. "Từ giờ tôi sẽ bỏ phiếu chống lại anh trong mọi việc. Không phải chuyện cá nhân đâu." Một nhịp dừng nơi khung cửa. "Đó chính là vấn đề tôi cố giải thích bấy lâu. Ở đây chẳng còn gì là cá nhân nữa cả. Kể cả chính anh."
  - ES: «Me paso a la bancada de oposición», dice el Reformista. «Votaré contra ti en todo desde ahora. No es personal.» Una pausa en la puerta. «Ese es el problema que he intentado explicar. Aquí ya nada es personal. Ni siquiera tú.»
  - ZH: "我要转去反对派席位了，"改革派说。"从现在起，任何议题我都会投票反对你。这不是针对个人。"在门口停了一下。"这正是我一直想说明的问题。这里已经没有任何东西是'个人'的了。连你也不是。"
- `card.act3_reformist_farewell_opposition.left` — EN: "Understood." · VI: "Tôi hiểu." · ES: «Entendido.» · ZH: "明白了。"
- `card.act3_reformist_farewell_opposition.right` — EN: "You'll lose." · VI: "Anh sẽ thua thôi." · ES: «Vas a perder.» · ZH: "你会输的。"

---

### CARD X3 — The Memo Surfaces *(consequence — resolved by `event_audit_scandal_return`, scheduled in Act II)*

`act3_audit_scandal_return` · speaker: `aide` · illustration: `{ "scene": "office_report", "expression": "serious" }` · type: `consequence`
**Conditions:** `{ "type": "history", "cardId": "act2_business_audit", "choice": "right", "exists": true }`

**LEFT — "It was my call. Say so."**
- preview: `standing -2 · publicTrust "up_uncertain"`
- effects: `standing -5 · trustActual +3 · FLG add flag_owned_audit_interference`

**RIGHT — "Standard procedure. Nothing more."**
- preview: `standing -1 · publicTrust "unknown"`
- effects: `standing -2 · trustPerceived +1 · trustActual -3 · FLG add flag_denied_audit_interference`

**designIntent:** The Act II time bomb detonates: the "administrative review" surfaces with the player's routing stamp on it, provenance `act2_business_audit:right`, twelve-plus turns later — the full Milestone-2 loop demonstrated at scandal scale. `flag_denied_audit_interference` is a primary Scapegoat-ending input: a network abandons deniers first, because deniers have already written the network's alibi for it.

**Strings**
- `card.act3_audit_scandal_return.text`
  - EN: "A memo leaked," your aide says, and puts it in front of you rather than describing it. The audit that became an "administrative review" — scope narrowed, referrals removed. In the routing box, among four stamps, one is your office's. "They'll ask by evening."
  - VI: "Có một tờ trình bị rò rỉ," trợ lý nói, rồi đặt nó xuống trước mặt bạn thay vì mô tả. Cuộc kiểm toán năm nào đã biến thành "rà soát hành chính" — phạm vi bị thu hẹp, phần chuyển cơ quan điều tra bị gỡ bỏ. Trong ô luân chuyển hồ sơ, giữa bốn con dấu, có một con dấu của văn phòng bạn. "Chiều tối là họ sẽ chất vấn."
  - ES: «Se filtró un memorando», dice tu asistente, y lo pone frente a ti en lugar de describirlo. La auditoría que se volvió «revisión administrativa» — alcance reducido, remisiones eliminadas. En la casilla de trámite, entre cuatro sellos, uno es de tu oficina. «Preguntarán antes de la noche.»
  - ZH: "有份签呈泄露了，"助理说着，没有描述，而是直接把它放在你面前。当年那场变成"行政复核"的审计——范围被收窄，移送被删除。流转栏里，四枚印章中，有一枚是你办公室的。"入夜之前他们就会来问。"
- `card.act3_audit_scandal_return.left`
  - EN: "It was my call. Say so." · VI: "Là quyết định của tôi. Cứ nói vậy." · ES: «Fue mi decisión. Que se diga.» · ZH: "是我的决定。照实说。"
- `card.act3_audit_scandal_return.right`
  - EN: "Standard procedure. Nothing more." · VI: "Quy trình thông thường. Không hơn." · ES: «Procedimiento estándar. Nada más.» · ZH: "标准程序而已，仅此而已。"

---

### CARD 058 — The Invitation *(beat, act finale)*

`act3_gathering_invitation` · speaker: `minister` · illustration: `{ "scene": "invitation_card", "expression": "friendly" }` · beat: `beat_act3_invitation`

**LEFT — Attend.**
- preview: `standing +1 · publicTrust "unknown"`
- effects: `standing +2`
- next: `{ "type": "act", "act": "gathering" }`

**RIGHT — "I'm unavailable that evening."**
- preview: `standing -1 · publicTrust "unknown"`
- effects: `standing -2`
- **lock:**
```json
{
  "mode": "cost",
  "condition": { "type": "obligation", "tag": "inner_circle", "status": "active", "minCount": 2 },
  "unlockEffects": [
    { "type": "stat", "stat": "standing", "add": -3 },
    { "type": "stat", "stat": "power", "add": -3 }
  ],
  "reason": { "source": "obligations", "maxFlashbacks": 3 }
}
```
- next: `{ "type": "card", "cardId": "act3_gathering_unavoidable" }`

**designIntent:** The last cost-lock before the hard one. Refusal is genuinely possible — and genuinely useless, because 058b converts it into postponement with full transparency (per spec: no arbitrary locks, no pretending). The design contract is that the Incident always happens; this pair of cards is where the game honors that contract without cheating the player's swipe.

**Strings**
- `card.act3_gathering_invitation.text`
  - EN: Heavy paper, hand delivered, no letterhead — the second such envelope of your career. "A private evening among friends," the Minister's note says. "Everyone you'd expect. Bring nothing. Everything is arranged."
  - VI: Giấy dày, đưa tận tay, không tiêu đề — chiếc phong bì thứ hai kiểu này trong sự nghiệp của bạn. "Một buổi tối riêng tư giữa những người bạn," thư của Bộ trưởng viết. "Đủ mặt những ai cậu nghĩ tới. Không cần mang gì cả. Mọi thứ đã được sắp đặt."
  - ES: Papel grueso, entregado en mano, sin membrete — el segundo sobre así de tu carrera. «Una velada privada entre amigos», dice la nota del Ministro. «Todos los que esperarías. No traigas nada. Todo está arreglado.»
  - ZH: 厚实的纸，专人送达，没有落款——你职业生涯里的第二只这样的信封。"朋友之间的私人晚宴，"部长的便条写道。"你能想到的人都在。什么都不用带。一切都已安排好。"
- `card.act3_gathering_invitation.left`
  - EN: Attend. · VI: Tham dự. · ES: Asistir. · ZH: 赴宴。
- `card.act3_gathering_invitation.right`
  - EN: "I'm unavailable that evening." · VI: "Tối hôm đó tôi kẹt việc rồi." · ES: «No estoy disponible esa noche.» · ZH: "那天晚上我没空。"

---

### CARD 058b — Rescheduled *(consequence — forced routing from 058 right)*

`act3_gathering_unavoidable` · speaker: `aide` · illustration: `{ "scene": "office_calendar", "expression": "neutral" }` · type: `consequence`
**Routing:** `next` (both choices): `{ "type": "act", "act": "gathering" }`

**LEFT — Have the car ready.**
- preview: `publicTrust "unknown"` · effects: — (none)

**RIGHT — Keep the evening short.**
- preview: `publicTrust "unknown"` · effects: — (none)

**designIntent:** Refusal was possible; absence wasn't. The private dinner reappears as an official "working dinner," approved by three offices — the player's last. The game converts the refusal into a two-week delay in full view instead of silently overriding the swipe: the player's agency was real, and so is the network's. Both choices empty; the calendar has already chosen.

**Strings**
- `card.act3_gathering_unavoidable.text`
  - EN: Two weeks later it returns through the front door: a "working dinner on regional coordination," same venue, same names, now printed on official letterhead and approved by three offices. Yours was the last. "It's on your calendar," your aide says. "It was on your calendar before I opened it."
  - VI: Hai tuần sau, nó quay lại bằng cửa chính: một "bữa tối công tác về điều phối vùng," vẫn địa điểm ấy, vẫn những cái tên ấy, giờ được in trên giấy tiêu đề chính thức và phê duyệt bởi ba văn phòng. Văn phòng của bạn là nơi ký cuối cùng. "Lịch của sếp đã có nó rồi," trợ lý nói. "Nó nằm trong lịch của sếp từ trước cả khi tôi kịp mở ra xem."
  - ES: Dos semanas después vuelve por la puerta principal: una «cena de trabajo sobre coordinación regional», mismo lugar, mismos nombres, ahora impresa en papel oficial y aprobada por tres oficinas. La tuya fue la última. «Está en tu calendario», dice tu asistente. «Estaba en tu calendario antes de que yo lo abriera.»
  - ZH: 两周后，它从正门回来了：一场"关于区域协调的工作晚餐"，同样的地点，同样的名字，如今印在正式的公函抬头上，经三个办公室批准。你的办公室是最后一个。"已经在您的日程上了，"助理说。"在我打开日程表之前，它就已经在上面了。"
- `card.act3_gathering_unavoidable.left`
  - EN: Have the car ready. · VI: Chuẩn bị xe sẵn. · ES: Tener el coche listo. · ZH: 备好车。
- `card.act3_gathering_unavoidable.right`
  - EN: Keep the evening short. · VI: Cố về sớm. · ES: Que la velada sea corta. · ZH: 尽量早点结束。

---

## 3. QA / Simulation Checklist

1. **048 tier exclusivity & exhaustiveness:** across 10,000 runs, exactly one of `act3_leak_clean/managed/captured` fires per run, and the tier matches the precedent state (assert: captured ⇒ CAPTURED expr true; clean ⇒ ANY_MEDIA false). No run may see zero leak cards.
2. **Time-bomb provenance:** on `act2_business_audit:right` runs, `act3_audit_scandal_return` fires in act `power` with provenance intact through ≥ 12 turns and one act transition; debug output must reproduce the spec's example format ("Scheduled by: act2_business_audit:right · N turns ago").
3. **Cost-lock ladder:** by end of Act III a fully captured run must have encountered exactly four cost locks (015, 030, 051, 058) with monotonically increasing unlock prices; a clean run must have encountered zero. Verify flashback selectors always cite ≥ 1 heavy (w2) obligation when available.
4. **052 terminality:** `flag_investigation_independent` and `flag_investigation_politically_controlled` are mutually exclusive, exactly one is set on 100% of runs, and no later effect writes either flag.
5. **Reformist absence:** on `flag_reformist_removed` runs, no reformist-speaker card fires after 046, and the validator's unreachable-card check must whitelist 047/057a/057b as intentionally unreachable on those runs.
6. **Money ceiling:** max-money bot must peak at exactly $1,159,400 pre-Gathering; divest-late path must show the −$100,000 exit fee; clean path stays at $49,400. No path may go negative (clamp check at 044-left-invested after early audit loss).
7. **Power spread:** end-of-act Power distribution must span ≥ 45 points between clean-institutionalist and captured bots — card 052's ±13 swing is the hinge; if the spread is narrower, endings E/F/D will collapse into each other.
8. **ENGINE-REQ-01:** if `stat_converge` is implemented, remove the 053 fallback and its TODO tag; validator should fail on shipped TODO tags.
9. **Localization:** all keys in 4 files; VI spot-check the Minister's midnight call (056) for register (`cậu` retained even at midnight — intimacy as pressure); ZH check 052's key metaphor (钥匙) consistency.

---

*End of pack. Handoff to the Gathering pack (cards 059–065): the drink lock (`obligation tag inner_circle minCount 3` + `REL minister >= 3`) is now armed or defused; flashback priority order for card 064 should be `obligation_minister_media_01` → `obligation_mentor_promotion_01` / `obligation_minister_backing_01` → `obligation_business_investment_01`. Flags consumed downstream: `flag_investigation_independent` (072/079, Ending G), `flag_loyal_regulator` / `flag_independent_regulator` (Aftermath institutional capability), `flag_reformist_removed` (077 substitution), `flag_self_review_started` + `flag_leak_documents_released` + `flag_owned_audit_interference` (Aftermath ledger mitigation), `flag_denied_audit_interference` (Scapegoat), `precedent_media_suppression >= 2` (Untouchable arming, Aftermath article-removal option), `flag_divestment_started` (Gathering card 061 wording), `flag_safe_transport` chain begins at 065.*
