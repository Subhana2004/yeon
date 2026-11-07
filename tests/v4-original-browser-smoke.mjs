/**
 * Original YEON V4 smoke tests — intentionally tests app-v4/, not Finesse.
 * Run with Node 22 and Playwright 1.56.1 + installed Chromium.
 */
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {dirname,resolve} from 'node:path';
import {Script} from 'node:vm';
import {chromium} from 'playwright';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const htmlPath=resolve(root,'app-v4/index.html');
const html=readFileSync(htmlPath,'utf8');
const css=readFileSync(resolve(root,'app-v4/archive-refined.css'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script,'original V4 application script required');
new Script(script,{filename:'original-v4.js'});
assert.match(html,/href="\.\/archive-refined\.css"/);
assert.match(css,/\.archive-preview/);
assert.match(script,/has-no-results/);
assert.doesNotMatch(script,/max-width: 820px/);
assert.equal((html.match(/data-nav="/g)||[]).length,7);

const widths=[1440,1024,840,768,390,320];
const output=resolve(root,'artifacts/v4-original');
mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try {
  for(const width of widths){
    const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(pathToFileURL(htmlPath).href,{waitUntil:'domcontentloaded'});
    await page.locator('.archive-library').waitFor();
    const info=await page.evaluate(()=>({
      overflow:document.documentElement.scrollWidth-window.innerWidth,
      grid:getComputedStyle(document.querySelector('.archive-grid')).gridTemplateColumns,
      archiveVisible:getComputedStyle(document.querySelector('.archive-library')).display,
      body:document.querySelector('.archive-body').getBoundingClientRect().width
    }));
    if(info.overflow>2){
      const offending=await page.evaluate(()=>[...document.querySelectorAll('body *')].map(el=>{
        const b=el.getBoundingClientRect();
        return {tag:el.tagName,cls:String(el.className||'').slice(0,80),left:Math.round(b.left),right:Math.round(b.right)};
      }).filter(el=>el.right>innerWidth+1||el.left< -1).slice(0,12));
      console.error('OVERFLOW',width,JSON.stringify(offending));
    }
    assert.ok(info.overflow<=2,`horizontal page overflow at ${width}: ${info.overflow}px`);
    assert.ok(info.body>0,'archive body must have width');
    assert.notEqual(info.archiveVisible,'none','original V4 archive must remain visible');
    await page.screenshot({path:resolve(output,`original-v4-${width}.png`),fullPage:true});
    if(width===1440){
      await page.locator('.archive-entry[data-select-lab="arbor"]').focus();
      await page.keyboard.press('ArrowRight');
      assert.equal(await page.evaluate(()=>document.activeElement?.dataset?.selectLab),'mosaic',
        'keyboard moves focus to next lab card');
      assert.match(await page.locator('#archive-preview-heading').innerText(),/Mosaic/);
      assert.equal(await page.locator('.archive-entry[data-select-lab="mosaic"]').getAttribute('aria-pressed'),'true');
    }
    if(width===390){
      const search=page.locator('#lab-search');
      await search.fill('mosaic');
      assert.equal((await page.locator('.archive-match-count').innerText()).trim(),'01');
      assert.match(await page.locator('#archive-preview-heading').innerText(),/Mosaic/);
      assert.equal(await search.evaluate(el=>document.activeElement===el),true,'typing keeps input focus');
      await search.fill('___no_such_lab___');
      assert.equal((await page.locator('.archive-match-count').innerText()).trim(),'00');
      assert.equal(await page.locator('#archive-preview').isHidden(),true);
      assert.equal(await page.locator('.archive-body').evaluate(el=>el.classList.contains('has-no-results')),true);
      await page.locator('[data-reset-search]').first().click();
      assert.ok(Number(await page.locator('.archive-match-count').innerText())>1);
      await page.locator('.archive-entry[data-select-lab="mosaic"]').click();
      assert.match(await page.locator('#archive-preview-heading').innerText(),/Mosaic/);
      const bgLight=await page.locator('.archive-preview').evaluate(el=>getComputedStyle(el).backgroundColor);
      await page.locator('#theme-toggle').click();
      const bgDark=await page.locator('.archive-preview').evaluate(el=>getComputedStyle(el).backgroundColor);
      assert.notEqual(bgLight,bgDark,'preview surface should switch with dark theme');
      await page.locator('[data-v4-mode="investigate"]').click();
      assert.ok(await page.locator('.v4-reading-strip').isVisible());
      await page.locator('[data-nav="compare"]').click();
      await page.locator('.standard-view').waitFor();
    }
    assert.deepEqual(errors,[],'no browser JS exceptions');
    console.log(`PASS original V4 ${width}px: archive visible, no horizontal overflow`);
    await page.close();
  }
  console.log('PASS ORIGINAL V4: CSS/JS syntax, filtering, preview sync, focus, reading, theme, navigation');
}finally{await browser.close()}
