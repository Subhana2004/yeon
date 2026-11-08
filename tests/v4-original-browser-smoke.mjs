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
const archiveCss=readFileSync(resolve(root,'app-v4/archive-reading-room.css'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script,'original V4 application script required');
new Script(script,{filename:'original-v4.js'});
assert.match(html,/href="\.\/archive-refined\.css"/);
assert.match(css,/\.archive-preview/);
assert.match(html,/href="\.\/archive-reading-room\.css"/);
assert.match(archiveCss,/\.ar-workspace/);
assert.match(archiveCss,/\.ar-reader/);
assert.doesNotMatch(html,/<div id="v4-evidence-inspector">/);
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
      const diagnostics=await page.evaluate(()=>({
        html:{scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth},
        body:{scroll:document.body.scrollWidth,client:document.body.clientWidth},
        elements:[...document.querySelectorAll('body *')].map(el=>{
          const rect=el.getBoundingClientRect(),css=getComputedStyle(el);
          return {tag:el.tagName,cls:String(el.className||'').slice(0,70),
            scroll:el.scrollWidth,client:el.clientWidth,
            left:Math.round(rect.left),right:Math.round(rect.right),
            overflowX:css.overflowX,position:css.position};
        }).filter(x=>x.scroll>x.client+4).sort((a,b)=>(b.scroll-b.client)-(a.scroll-a.client)).slice(0,24)
      }));
      console.error('SCROLL_DIAGNOSTICS',width,JSON.stringify(diagnostics));
      const isolate=await page.evaluate(()=>{
        const blocks=['.v4-top','.v4-live-note','.v4-fields','.v4-integrity',
        '.v4-section-head','.v4-layout','.archive-library','.v4-dossier-area',
        '#v4-evidence-inspector','.site-header','.site-footer'];
        return blocks.map(selector=>{
          const el=document.querySelector(selector);if(!el)return {selector,missing:true};
          const original=el.style.display;el.style.display='none';
          const width=document.documentElement.scrollWidth-innerWidth;
          el.style.display=original;return {selector,overflowWithout:width};
        });
      });
      console.error('ISOLATE_BLOCKS',width,JSON.stringify(isolate));
      const archiveParts=await page.evaluate(()=>{
        const items=['.archive-library-top','.archive-toolbar','.archive-filter-row',
          '.archive-library-rule','.archive-body','.archive-collection','.archive-grid',
          '.archive-preview','.archive-preview-body','.archive-preview-foot'];
        return items.map(selector=>{
          const e=document.querySelector(selector);if(!e)return {selector,missing:true};
          const original=e.style.display;e.style.display='none';
          const remain=document.documentElement.scrollWidth-innerWidth;
          e.style.display=original;return {selector,overflowWithout:remain};
        });
      });
      console.error('ARCHIVE_ISOLATION',width,JSON.stringify(archiveParts));
    }
    assert.ok(info.overflow<=2,`horizontal page overflow at ${width}: ${info.overflow}px`);
    assert.ok(info.body>0,'archive body must have width');
    assert.notEqual(info.archiveVisible,'none','original V4 archive must remain visible');
    await page.screenshot({path:resolve(output,`original-v4-${width}.png`),fullPage:true});
    if(width===1440||width===390||width===320){
      await page.locator('.ar-library').screenshot({path:resolve(output,`archive-reading-room-${width}.png`)});
    }
    assert.equal(await page.locator('.ar-entry').count(),8);
    assert.ok(await page.locator('.ar-reader').isVisible());
    assert.equal(await page.locator('.ar-tabs [role="tab"]').count(),3);
    assert.equal(await page.locator('.ar-reading-controls').isVisible(),true);
    if(width===1440){
      await page.locator('.archive-entry[data-select-lab="arbor"]').focus();
      await page.keyboard.press('ArrowRight');
      assert.equal(await page.evaluate(()=>document.activeElement?.dataset?.selectLab),'mosaic',
        'keyboard moves focus to next lab card');
      assert.match(await page.locator('#archive-preview-heading').innerText(),/Mosaic/);
      assert.equal(await page.locator('.archive-entry[data-select-lab="mosaic"]').getAttribute('aria-pressed'),'true');
      await page.locator('#archive-preview [data-v4-idea="1"]').click();
      assert.equal(await page.locator('#archive-preview [data-v4-idea="1"]').getAttribute('aria-selected'),'true');
      assert.match(await page.locator('.ar-lens-panel').innerText(),/METHODS|APPROACH|Assumptions/i);
      await page.locator('#archive-preview [data-v4-idea="1"]').focus();
      await page.keyboard.press('ArrowRight');
      assert.equal(await page.locator('#archive-preview [data-v4-idea="2"]').getAttribute('aria-selected'),'true');
      await page.keyboard.press('Home');
      assert.equal(await page.locator('#archive-preview [data-v4-idea="0"]').getAttribute('aria-selected'),'true');
      await page.locator('.ar-notebook summary').click();
      await page.locator('#ar-note-input').fill('What independent evidence supports this?');
      assert.match(await page.locator('#ar-note-status').innerText(),/Saved locally/);
      await page.locator('#archive-preview [data-follow="mosaic"]').click();
      assert.equal(await page.locator('#archive-preview [data-follow="mosaic"]').getAttribute('aria-pressed'),'true');
      await page.locator('#archive-preview [data-v4-jump="selected-dossier"]').click();
      assert.equal(await page.locator('#ar-full-dossier').evaluate(el=>el.open),true);
      assert.ok(await page.locator('#selected-dossier').isVisible());
      await page.locator('#archive-preview [data-compare-from="mosaic"]').click();
      await page.locator('.comparison-grid').waitFor();
      assert.ok(await page.locator('.comparison-grid').isVisible());
      await page.locator('[data-nav="explore"]').click();
      await page.locator('.ar-reader').waitFor();
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
      assert.ok(await page.locator('.ar-reader').isVisible());
      await page.locator('.ar-reader [data-archive-step="1"]').click();
      assert.match(await page.locator('.ar-reader-heading h3').innerText(),/Horizon/);
      await page.locator('.ar-reader [data-archive-step="-1"]').click();
      assert.match(await page.locator('.ar-reader-heading h3').innerText(),/Mosaic/);
      await page.locator('.ar-notebook summary').click();
      assert.equal(await page.locator('#ar-note-input').inputValue(),'What independent evidence supports this?');

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
