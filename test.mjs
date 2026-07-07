import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const FILE = pathToFileURL(path.resolve('./index.html')).href;
const results = [];

function check(name, cond, detail=''){
  results.push({ name, ok: !!cond, detail });
  console.log(`${cond ? '✓' : '✗'} ${name}${cond ? '' : `  — ${detail}`}`);
}

function num(el) { return parseInt(el.replace(/[^0-9]/g, '')); }

const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('pageerror', e => console.log('PAGE ERROR:', e.message));
  page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE ERROR:', m.text()); });

  await page.goto(FILE);
  await page.waitForSelector('#ageSlider');
  await page.waitForTimeout(500);

  async function scrape() {
    return {
      normal: num(await page.$eval('#normalPremiumText', el => el.innerText)),
      deductible: num(await page.$eval('#deductiblePremiumText', el => el.innerText)),
      diff: num(await page.$eval('#diffPerYear', el => el.innerText)),
      principal: num(await page.$eval('#totalSaved10Y', el => el.innerText)),
      fv: num(await page.$eval('#futureValue', el => el.innerText)),
      fv5: num(await page.$eval('#fvYear5', el => el.innerText)),
    };
  }

  async function act(fn) { await fn(); await page.waitForTimeout(400); }

  // ---- AGE 25, MALE, 1M, 30KDEDUCT, 7% ----
  console.log('\n-- Baseline: age=25, male, 1M, 30k ded, 7% --');
  const base = await scrape();
  check('normal premium = 17,500', base.normal === 17500, `${base.normal}`);
  check('deductible premium = 5,200', base.deductible === 5200, `${base.deductible}`);
  check('annual savings = 12,300', base.diff === 12300, `${base.diff}`);
  check('principal 10yr = 123,000', base.principal === 123000, `${base.principal}`);

  const fv10Expected = Math.round(12300 * ((Math.pow(1.07, 10) - 1) / 0.07));
  const fv5Expected = Math.round(12300 * ((Math.pow(1.07, 5) - 1) / 0.07));
  check(`FV 10yr ≈ ${fv10Expected}`, Math.abs(base.fv - fv10Expected) < 5, `${base.fv}`);
  check(`FV 5yr ≈ ${fv5Expected}`, Math.abs(base.fv5 - fv5Expected) < 5, `${base.fv5}`);

  // ---- SWITCH TO FEMALE ----
  console.log('\n-- Switch to female --');
  await act(() => page.click('#btn-gender-female'));
  const female = await scrape();
  check('normal = 21,000', female.normal === 21000, `${female.normal}`);
  check('deductible = 6,800', female.deductible === 6800, `${female.deductible}`);
  check('savings = 14,200', female.diff === 14200, `${female.diff}`);
  await act(() => page.click('#btn-gender-male'));

  // ---- SWITCH TO 5M COVERAGE ----
  console.log('\n-- Switch to 5M coverage --');
  await act(() => page.click('#btn-cov-5m'));
  const cov5 = await scrape();
  check('normal = 23,000', cov5.normal === 23000, `${cov5.normal}`);
  check('deductible = 9,800', cov5.deductible === 9800, `${cov5.deductible}`);
  check('savings = 13,200', cov5.diff === 13200, `${cov5.diff}`);
  await act(() => page.click('#btn-cov-1m'));

  // ---- CHANGE AGE TO 35 ----
  console.log('\n-- Age 35 (multiplier = 1.4) --');
  await act(() => page.evaluate(() => {
    const s = document.getElementById('ageSlider');
    s.value = 35;
    s.dispatchEvent(new Event('input', { bubbles: true }));
  }));
  const age35 = await scrape();
  check('normal = 24,500', age35.normal === 24500, `${age35.normal}`);
  check('deductible = 7,280', age35.deductible === 7280, `${age35.deductible}`);
  check('savings = 17,220', age35.diff === 17220, `${age35.diff}`);

  // ---- CHANGE DEDUCTIBLE TO 20k ----
  console.log('\n-- Change deductible to 20k --');
  await act(() => page.click('#deductibleDropdown'));
  await act(() => page.click('[data-value="20000"]'));
  const ded20 = await scrape();
  check('normal = 24,500', ded20.normal === 24500, `${ded20.normal}`);
  check('deductible = 10,500', ded20.deductible === 10500, `${ded20.deductible}`);
  check('savings = 14,000', ded20.diff === 14000, `${ded20.diff}`);

  // ---- CHANGE DEDUCTIBLE TO 50k ----
  console.log('\n-- Change deductible to 50k --');
  await act(() => page.click('#deductibleDropdown'));
  await act(() => page.click('[data-value="50000"]'));
  const ded50 = await scrape();
  check('normal = 24,500', ded50.normal === 24500, `${ded50.normal}`);
  check('deductible = 5,320', ded50.deductible === 5320, `${ded50.deductible}`);
  check('savings = 19,180', ded50.diff === 19180, `${ded50.diff}`);

  // ---- TVM PRINCIPAL MODE ----
  console.log('\n-- TVM: principal mode --');
  await act(() => page.click('#btn-tvm-principal'));
  const principal = await scrape();
  check('principal 10yr = 191,800', principal.principal === 191800, `${principal.principal}`);
  check('FV = principal (no compound)', principal.fv === principal.principal, `FV=${principal.fv}, principal=${principal.principal}`);
  check('FV5 = 5yr principal', principal.fv5 === 19180 * 5, `${principal.fv5}`);
  await act(() => page.click('#btn-tvm-tvm'));

} finally {
  await browser.close();
}

const failed = results.filter(r => !r.ok);
const pass = results.length - failed.length;
console.log(`\n=== ${pass}/${results.length} passed, ${failed.length} failed ===`);
if (failed.length) console.log('\nFAILURES:', failed.map(r => `  ✗ ${r.name} — ${r.detail}`).join('\n'));
process.exit(failed.length ? 1 : 0);
