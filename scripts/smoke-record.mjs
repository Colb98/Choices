// Visual smoke for The Record + continue beats: witness overlay, continue card,
// 052b routing and the ending ledger. Needs `npm run dev` on :5180.
// Usage: node scripts/smoke-record.mjs [edge|chrome path]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const OUT = process.env.SMOKE_OUT ?? 'smoke-out';
mkdirSync(OUT, { recursive: true });
const exe = process.argv[2] ?? (process.platform === 'win32'
  ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
  : '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge');

const browser = await chromium.launch({ executablePath: exe, headless: true });
const page = await browser.newPage({ viewport: { width: 600, height: 1000 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('favicon')) errors.push(m.text()); });

await page.goto('http://localhost:5180', { waitUntil: 'load' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'load' });
await page.waitForTimeout(2000);
const canvas = page.locator('canvas');
const box = await canvas.boundingBox();
const gx = (x) => box.x + (x / 540) * box.width;
const gy = (y) => box.y + (y / 960) * box.height;

// New game to obtain a valid save, then edit it.
await page.mouse.click(gx(270), gy(420));
await page.waitForTimeout(1200);
const base = await page.evaluate(() => JSON.parse(localStorage.getItem('choices.run')));
if (!base) throw new Error('no save after new game');

const withState = async (patch) => {
  const data = structuredClone(base);
  patch(data.state);
  await page.evaluate((d) => localStorage.setItem('choices.run', JSON.stringify(d)), data);
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(1200);
  await page.mouse.click(gx(270), gy(420)); // CONTINUE
  await page.waitForTimeout(900);
};
const swipe = async (dir) => {
  await page.mouse.move(gx(270), gy(700));
  await page.mouse.down();
  for (let i = 1; i <= 12; i++) await page.mouse.move(gx(270 + dir * i * 16), gy(700 + i * 2), { steps: 1 });
  await page.mouse.up();
};
const promises = [
  { id: 'promise_equal_rules', madeAt: { cardId: 'act0_first_interview', choice: 'left', turn: 3 }, status: 'held' },
  { id: 'promise_transparency', madeAt: { cardId: 'act0_first_parliament_speech', choice: 'left', turn: 2 }, status: 'held' },
  { id: 'promise_independence', madeAt: { cardId: 'act0_mentor_advice', choice: 'right', turn: 4 }, status: 'honored_under_pressure' },
];

// 1. Witness: 046 with equality held → RIGHT breaks it.
await withState((s) => {
  s.run.currentAct = 'power'; s.run.actTurn = 6; s.run.currentCardId = 'act3_reformist_confrontation';
  s.promises = structuredClone(promises);
});
await page.screenshot({ path: `${OUT}/01_046_quoting.png` });
await swipe(+1);
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT}/02_witness.png` });
await page.waitForTimeout(2200);
await page.screenshot({ path: `${OUT}/03_after_witness.png` });
let save = await page.evaluate(() => JSON.parse(localStorage.getItem('choices.run')));
console.log('after 046 RIGHT promises:', save.state.promises.map((p) => `${p.id}:${p.status}`).join(' '));

// 2. Continue card: dilemma setup, tap to advance.
await withState((s) => {
  s.run.currentAct = 'rise'; s.run.actTurn = 4; s.run.currentCardId = 'dil_queue_setup';
});
await page.screenshot({ path: `${OUT}/04_continue_card.png` });
await page.mouse.click(gx(270), gy(700));
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT}/05_after_continue.png` });
save = await page.evaluate(() => JSON.parse(localStorage.getItem('choices.run')));
console.log('after continue tap → card:', save.state.run.currentCardId, 'turn', save.state.run.turn);

// 3. 052 RIGHT with transparency held → 052b.
await withState((s) => {
  s.run.currentAct = 'power'; s.run.actTurn = 9; s.run.currentCardId = 'act3_authority_vote';
  s.promises = structuredClone(promises);
});
await swipe(+1);
await page.waitForTimeout(900);
await page.screenshot({ path: `${OUT}/06_052b.png` });
save = await page.evaluate(() => JSON.parse(localStorage.getItem('choices.run')));
console.log('after 052 RIGHT → card:', save.state.run.currentCardId);

// 4. Ending ledger: last aftermath card → ending → tap through to THE RECORD.
await withState((s) => {
  s.run.currentAct = 'aftermath'; s.run.actTurn = 9; s.run.currentCardId = 'aftermath_institution_a';
  s.flags = ['flag_drank_at_gathering', 'flag_self_driving'];
  s.promises = [
    { id: 'promise_equal_rules', madeAt: { cardId: 'act0_first_interview', choice: 'left', turn: 3 }, status: 'broken', resolvedTurn: 31, resolvedByCardId: 'act3_reformist_confrontation' },
    { id: 'promise_transparency', madeAt: { cardId: 'act0_first_parliament_speech', choice: 'left', turn: 2 }, status: 'held' },
    { id: 'promise_independence', madeAt: { cardId: 'act0_mentor_advice', choice: 'right', turn: 4 }, status: 'honored_under_pressure', resolvedTurn: 33, resolvedByCardId: 'act3_authority_vote' },
    { id: 'promise_constituents', madeAt: { cardId: 'act0_constituent_land_case', choice: 'left', turn: 1 }, status: 'broken', resolvedTurn: 36, resolvedByCardId: 'act3_constituent_return_ignored' },
  ];
  const h = (turn, cardId, choice, extra = {}) => ({
    turn, cardId, choice, choiceTextKey: `card.${cardId}.${choice}`, cardTextKey: `card.${cardId}.text`, timestamp: 0,
    effectsApplied: [], obligationsCreated: [], obligationsResolved: [], flagsAdded: [], flagsRemoved: [], scheduledEventIds: [], ...extra,
  });
  s.history = [
    h(31, 'act3_reformist_confrontation', 'right', { cardTextKey: 'card.act3_reformist_confrontation.text.v_equality', promisesBroken: ['promise_equal_rules'] }),
    h(33, 'act3_authority_vote', 'left', { promisesHonored: ['promise_independence'] }),
    h(36, 'act3_constituent_return_ignored', 'right', { promisesBroken: ['promise_constituents'] }),
  ];
});
await swipe(-1);
await page.waitForTimeout(1600);
for (let i = 0; i < 12; i++) {
  await page.screenshot({ path: `${OUT}/07_ending_step${i}.png` });
  await page.mouse.click(gx(270), gy(480));
  await page.waitForTimeout(2600);
}

// 5. Act 0 opening: swipe through the first four screens of a fresh run and record the order.
await page.evaluate(() => localStorage.removeItem('choices.run'));
await page.reload({ waitUntil: 'load' });
await page.waitForTimeout(1200);
await page.mouse.click(gx(270), gy(420)); // NEW GAME (no save → first button)
await page.waitForTimeout(900);
const opening = [];
for (let i = 0; i < 4; i++) {
  save = await page.evaluate(() => JSON.parse(localStorage.getItem('choices.run')));
  opening.push(save.state.run.currentCardId);
  if (i === 2) await page.screenshot({ path: `${OUT}/08_act0_slot_a.png` });
  await swipe(i % 2 === 0 ? -1 : +1);
  await page.waitForTimeout(700);
}
console.log('opening order:', opening.join(' > '));

console.log('errors:', errors.length ? errors : 'none');
await browser.close();
