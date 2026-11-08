import assert from 'node:assert/strict';
import {resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {readFileSync,mkdirSync} from 'node:fs';
import {Script} from 'node:vm';
import {chromium} from 'playwright';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(resolve(root,'app-v5/index.html'),'utf8');
const app=readFileSync(resolve(root,'app-v5/app.js'),'utf8');
const data=readFileSync(resolve(root,'app-v5/data.js'),'utf8');
const style=readFileSync(resolve(root,'app-v5/style.css'),'utf8');
assert.match(html,/YEON — The Research Atlas/);
assert.match(html,/app\.js/);
assert.match(html,/data\.js/);
assert.match(html,/style\.css/);
new Script(app,{filename:'app.js'});
new Script(data,{filename:'data.js'});
assert.match(style,/prefers-reduced-motion/);
assert.match(style,/\.atlas-map/);
assert.match(app,/Open Doors/);
const widths=[1440,1200,1024,840,768,390,320];
const output=resolve(root,'artifacts/v5');
mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
for(const width of widths){
 const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});
 const failures=[];page.on('pageerror',e=>failures.push(e.message));
 await page.goto(pathToFileURL(resolve(root,'app-v5/index.html')).href,{waitUntil:'domcontentloaded'});
 await page.locator('.atlas-map').waitFor();
 const over=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 if(over>2){
  const off=await page.evaluate(()=>Array.from(document.querySelectorAll('body *')).map(el=>{const r=el.getBoundingClientRect();return{tag:el.tagName,cls:String(el.className||'').slice(0,40),right:Math.round(r.right)}}).filter(e=>e.right>innerWidth+2).slice(0,14));
  console.error('V5 OVERFLOW',width,JSON.stringify(off));
 }
 assert.ok(over<=2,'horizontal overflow at '+width+'px: '+over);
 assert.equal(await page.locator('.atlas-node').count(),8,'eight accessible map nodes');
 assert.ok(await page.locator('.selected-strip').isVisible());
 assert.ok(await page.getByRole('button',{name:/Select Prism Multimodal Group/}).isVisible());
 await page.screenshot({path:resolve(output,'v5-'+width+'.png'),fullPage:true});
 if(width===1440){
  await page.getByRole('button',{name:/Select Prism Multimodal Group/}).click();
  assert.match(await page.locator('.atlas-selected').innerText(),/Prism/);
  assert.match(await page.locator('.selected-left h2').innerText(),/Prism/);
  await page.locator('[data-lens="method"]').click();
  assert.match(await page.locator('.selected-content').innerText(),/Feature alignment/);
  await page.locator('[data-lens="limits"]').click();
  assert.match(await page.locator('.selected-content').innerText(),/Missing inputs/);
  await page.locator('.selected-left [data-follow="prism"]').click();
  assert.equal(await page.locator('#nav-saved-count').innerText(),'1');
  await page.locator('.header-nav [data-nav="dna"]').click();
  await page.locator('.chapters').waitFor();
  assert.match(await page.locator('.page-head h1').innerText(),/Lab DNA/);
  await page.locator('[data-select-field="selected"]').selectOption('mosaic');
  assert.match(await page.locator('.panel .eyebrow').allInnerTexts().then(a=>a.join(' ')),/THE CENTRAL QUESTION/);
  await page.locator('.header-nav [data-nav="compare"]').click();
  await page.locator('[data-select-field="compareA"]').selectOption('delta');
  await page.locator('[data-select-field="compareB"]').selectOption('prism');
  assert.match(await page.locator('.compare-grid').innerText(),/Delta Computing/);
  await page.locator('[data-swap="compare"]').click();
  assert.equal(await page.locator('[data-select-field="compareA"]').inputValue(),'prism');
  await page.locator('[data-go="faceoff"]').first().click();
  assert.match(await page.locator('.page-head h1').innerText(),/Research Face-Off/);
  await page.locator('[data-scenario-value="missing"]').click();
  assert.match(await page.locator('.panel h2').first().innerText(),/information is missing/);
  await page.locator('.header-nav [data-nav="constellation"]').click();
  await page.locator('.network-holder').waitFor();
  assert.equal(await page.locator('.network-holder .atlas-node').count(),8);
  await page.locator('.network-holder [data-select="vertex"]').click();
  assert.match(await page.locator('.network-inspector h2').innerText(),/Vertex/);
  await page.locator('#global-search').click();
  await page.locator('#quick-input').fill('reproducible');
  assert.match(await page.locator('#quick-results').innerText(),/Delta/);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#search-dialog').isHidden(),true);
 }
 if(width===390){
  await page.locator('.mobile-nav [data-nav="desk"]').click();
  await page.locator('#desk-notes').fill('Questions before conclusions.');
  assert.equal(await page.locator('#note-status').innerText(),'Saved locally in this browser.');
  await page.reload();
  await page.locator('#desk-notes').waitFor();
  assert.equal(await page.locator('#desk-notes').inputValue(),'Questions before conclusions.');
  await page.locator('.mobile-nav [data-nav="explore"]').click();
  await page.locator('[data-thread="vertex"]').click();
  assert.match(await page.locator('.selected-left h2').innerText(),/Vertex/);
  await page.locator('#theme-toggle').click();
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'dark');
  await page.locator('.mobile-nav [data-nav="compare"]').click();
  await page.locator('.compare-grid').waitFor();
  await page.locator('.mobile-nav [data-nav="desk"]').click();
  assert.equal(await page.locator('#desk-notes').inputValue(),'Questions before conclusions.');
  await page.locator('.mobile-nav [data-nav="explore"]').click();
  await page.locator('[data-go="doors"]').first().click();
  assert.match(await page.locator('.page-head h1').innerText(),/Open Doors/);
  await page.locator('[data-check="0"]').check();
  assert.match(await page.locator('.panel-top .pill').first().innerText(),/1 \/ 5/);
  await page.locator('[data-clear-checks]').click();
  assert.match(await page.locator('.panel-top .pill').first().innerText(),/0 \/ 5/);
  await page.locator('[data-go="fit"]').first().click().catch(async()=>{
    await page.evaluate(()=>location.hash='#fit');
  });
  await page.locator('.page-head h1').waitFor();
  assert.match(await page.locator('.page-head h1').innerText(),/Fit Lens/);
  await page.locator('[data-interest="Language"]').click();
  assert.match(await page.locator('.fit-grid').innerText(),/Shared interests/);
 }
 assert.deepEqual(failures,[],'uncaught page errors at '+width+'px');
 console.log('PASS YEON V5 '+width+'px: no overflow, working atlas, no runtime error');
 await page.close();
}
console.log('PASS YEON V5: full interactive journeys and seven responsive widths');
} finally {await browser.close();}
