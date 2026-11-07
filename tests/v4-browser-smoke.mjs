/**
 * YEON V4 Finesse: basic visual-geometry and interaction smoke checks.
 * Run locally: npm install --no-save playwright@1.56.1
 *              npx playwright install chromium
 *              node tests/v4-browser-smoke.mjs
 * All content here is fictional demo data; no real lab records are tested.
 */
import assert from 'node:assert/strict';
import {readFileSync, mkdirSync} from 'node:fs';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {resolve, dirname} from 'node:path';
import {Script} from 'node:vm';
import {chromium} from 'playwright';

const here=dirname(fileURLToPath(import.meta.url));
const htmlPath=resolve(here,'../app-v4-finesse/index.html');
const cssPath=resolve(here,'../app-v4-finesse/finesse.css');
const html=readFileSync(htmlPath,'utf8');
const css=readFileSync(cssPath,'utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(js,'Expected inline application JavaScript');
new Script(js,{filename:'v4-finesse-inline.js'});
assert.match(html,/href="\.\/finesse\.css"/);
assert.match(css,/--yeon-focus:/);
assert.match(css,/@media\(max-width:420px\)/);
assert.match(js,/countBadge\.textContent/);
assert.doesNotMatch(js,/max-width: 820px/);
assert.equal((html.match(/data-nav="/g)||[]).length,7);

const widths=[1440,1024,840,768,390,320];
const outputDir=resolve(here,'../artifacts/v4-smoke');
mkdirSync(outputDir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try {
  for(const width of widths) {
    const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});
    page.on('pageerror',error=>{throw error;});
    await page.goto(pathToFileURL(htmlPath).href,{waitUntil:'domcontentloaded'});
    await page.locator('.v4-workspace').waitFor();
    const measure=await page.evaluate(()=>({
      overflow:document.documentElement.scrollWidth-window.innerWidth,
      topGridColumns:getComputedStyle(document.querySelector('.v4-top-grid')).gridTemplateColumns,
      count:getComputedStyle(document.querySelector('.v4-fields-list')).gridTemplateColumns
    }));
    assert.ok(measure.overflow<=2,
      `Unexpected document horizontal overflow at ${width}px: ${measure.overflow}px`);
    await page.screenshot({path:resolve(outputDir,`v4-${width}.png`),fullPage:true});
    if(width===1440) {
      const first=page.locator('.index-row[data-select-lab="arbor"]');
      await first.focus();
      await page.keyboard.press('ArrowDown');
      const focused=await page.evaluate(()=>document.activeElement?.dataset?.selectLab);
      assert.equal(focused,'mosaic','ArrowDown should move list focus to next lab');
    }
    if(width===390) {
      await page.locator('[data-browse-toggle]').click();
      assert.notEqual(await page.locator('#lab-index').evaluate(el=>getComputedStyle(el).display),'none');
      await page.locator('#lab-search').fill('___no_matching_lab___');
      assert.equal((await page.locator('.v4-count').textContent())?.trim(),'00',
        'Search count must match filtered rows');
      await page.locator('[data-reset-search]').click();
      assert.ok(Number((await page.locator('.v4-count').textContent())?.trim())>0);
      await page.locator('.index-row[data-select-lab="mosaic"]').click();
      assert.match(await page.locator('#selected-lab-heading').innerText(),/Mosaic/i);
      await page.locator('[data-v4-mode="investigate"]').click();
      await page.locator('.v4-reading-strip').waitFor();
      const noteLight=await page.locator('.v4-live-note').evaluate(el=>getComputedStyle(el).backgroundColor);
      await page.locator('#theme-toggle').click();
      const noteDark=await page.locator('.v4-live-note').evaluate(el=>getComputedStyle(el).backgroundColor);
      assert.notEqual(noteLight,noteDark,'Theme switch must change the note surface');
      await page.locator('[data-nav="compare"]').click();
      await page.locator('.standard-view').waitFor();
    }
    await page.close();
    console.log(`PASS ${width}px: no document overflow; viewport snapshot captured`);
  }
  console.log('PASS V4 smoke: syntax, navigation, filtering, study modes, theme, breakpoints');
} finally {
  await browser.close();
}
