import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const FILE = pathToFileURL(path.resolve('./index.html')).href;
const results = [];

function check(name, cond, detail=''){
  results.push({ name, ok: !!cond, detail });
  console.log(`${cond ? '✓' : '✗'} ${name}${cond ? '' : `  — ${detail}`}`);
}

const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('pageerror', e => console.log('PAGE ERROR:', e.message));
  page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE ERROR:', m.text()); });

  await page.goto(FILE);
  await page.waitForSelector('#ageSlider');

  // ---- TEST 1: page loads without errors ----
  const ageSlider = await page.$('#ageSlider');
  check('age slider exists', !!ageSlider);

  // ---- TEST 2: animation function exists ----
  const hasAnimate = await page.evaluate(() => typeof animateValue === 'function');
  check('animateValue is a function', hasAnimate);

  // ---- TEST 3: initial values are set ----
  const initialNormal = await page.$eval('#normalPremiumText', el => el.innerText);
  check('initial normal premium set', initialNormal !== '- บาท', initialNormal);

  // ---- TEST 4: slider change triggers intermediate values ----
  // Set age to 25 (default), let page stabilize
  await page.evaluate(() => { document.getElementById('ageSlider').value = 25; });
  await page.waitForTimeout(300);

  // Now jump age to 55 and capture the text during the animation window
  await page.evaluate(() => {
    const slider = document.getElementById('ageSlider');
    slider.value = 55;
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  });

  // Read the premium text immediately after the event fires
  const rightAfter = await page.$eval('#normalPremiumText', el => el.innerText);
  console.log('  value right after event:', rightAfter);

  // Wait 50ms and read again
  await page.waitForTimeout(50);
  const at50ms = await page.$eval('#normalPremiumText', el => el.innerText);
  console.log('  value at 50ms:', at50ms);

  // Wait 100ms and read again
  await page.waitForTimeout(100);
  const at150ms = await page.$eval('#normalPremiumText', el => el.innerText);
  console.log('  value at 150ms:', at150ms);

  // Wait for full animation (250ms total)
  await page.waitForTimeout(150);
  const finalVal = await page.$eval('#normalPremiumText', el => el.innerText);
  console.log('  final value at 300ms:', finalVal);

  // The value right after event should NOT equal the final value
  // (if animation works, the first read should still show the old value)
  const stillOld = rightAfter !== finalVal;
  check('value did not jump instantly to final', stillOld,
    `right after: "${rightAfter}", final: "${finalVal}"`);

  // ---- TEST 5: verify the calculated value is correct for age 55 ----
  const finalNum = parseInt(finalVal.replace(/[^0-9]/g, ''));
  // At age 55, male, 1M coverage: 17500 * (1 + (55-25)*0.04) = 17500 * 2.2 = 38500
  check('age 55 premium is ~38,500', Math.abs(finalNum - 38500) < 1000, `got ${finalNum}`);

} finally {
  await browser.close();
}

const failed = results.filter(r => !r.ok);
const pass = results.length - failed.length;
console.log(`\n=== ${pass}/${results.length} passed, ${failed.length} failed ===`);
process.exit(failed.length ? 1 : 0);
