import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 600, height: 1000 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('favicon')) errors.push(m.text()); });

await page.goto('http://localhost:5180', { waitUntil: 'load' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'load' });
await page.waitForTimeout(2500);

const canvas = page.locator('canvas');
const box = await canvas.boundingBox();
const gx = (x) => box.x + (x / 540) * box.width;
const gy = (y) => box.y + (y / 960) * box.height;

// NEW GAME
await page.mouse.click(gx(270), gy(420));
await page.waitForTimeout(1500);
await page.screenshot({ path: '/tmp/ux_card.png' });

// Free drag: down-right diagonal, hold past arrow threshold to see HUD arrows
await page.mouse.move(gx(270), gy(728));
await page.mouse.down();
for (let i = 1; i <= 10; i++) await page.mouse.move(gx(270 + i * 11), gy(728 + i * 6), { steps: 1 });
await page.waitForTimeout(300);
await page.screenshot({ path: '/tmp/ux_drag.png' });
for (let i = 1; i <= 4; i++) await page.mouse.move(gx(380 + i * 10), gy(788), { steps: 1 });
await page.mouse.up();
await page.waitForTimeout(1200);
await page.screenshot({ path: '/tmp/ux_after.png' });

const save = await page.evaluate(() => localStorage.getItem('choices.run'));
if (save) {
  const parsed = JSON.parse(save);
  console.log('TURN:', parsed.state.run.turn, 'CARD:', parsed.state.run.currentCardId);
}

// Regression: the headline balance keeps every digit at billion scale while
// the recurring flow beside it remains compact.
await page.evaluate(() => {
  const raw = localStorage.getItem('choices.run');
  if (!raw) return;
  const parsed = JSON.parse(raw);
  parsed.state.stats.money = 12_134_624_820;
  localStorage.setItem('choices.run', JSON.stringify(parsed));
});
await page.reload({ waitUntil: 'load' });
await page.waitForTimeout(500);
await page.mouse.click(gx(270), gy(420));
await page.waitForTimeout(700);
await page.screenshot({ path: '/tmp/ux_billions.png' });

// Regression: an existing English run must continue in the language currently
// selected on the menu, not the language stored when the run was created.
await page.reload({ waitUntil: 'load' });
await page.waitForTimeout(700);
const menuCanvas = page.locator('canvas');
const menuBox = await menuCanvas.boundingBox();
const mx = (x) => menuBox.x + (x / 540) * menuBox.width;
const my = (y) => menuBox.y + (y / 960) * menuBox.height;
await page.mouse.click(mx(270), my(654)); // English -> Vietnamese
await page.waitForTimeout(250);
await page.mouse.click(mx(270), my(420)); // Continue
await page.waitForTimeout(700);
const continuedLanguage = await page.evaluate(() => {
  const raw = localStorage.getItem('choices.run');
  return raw ? JSON.parse(raw).language : undefined;
});
console.log('CONTINUE_LANGUAGE:', continuedLanguage);
if (continuedLanguage !== 'vi') errors.push(`Continue used ${continuedLanguage ?? 'no language'} instead of vi`);
console.log('PAGE_ERRORS:', errors.length ? errors : 'none');
await browser.close();
