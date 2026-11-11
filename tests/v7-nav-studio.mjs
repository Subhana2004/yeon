import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {Script} from 'node:vm';
import {chromium} from 'playwright';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),dir=resolve(root,'app-v7-fieldwork');
const js=readFileSync(resolve(dir,'nav-lab.js'),'utf8'),css=readFileSync(resolve(dir,'nav-lab.css'),'utf8');
new Script(js,{filename:'nav-lab.js'});
assert.match(css,/prefers-reduced-motion:reduce/);
const output=resolve(root,'artifacts/nav-studio');mkdirSync(output,{recursive:true});
const url=pathToFileURL(resolve(dir,'index.html')).href;
const widths=[1440,1024,768,390,320],browser=await chromium.launch({headless:true,args:['--no-sandbox']});
async function noOverflow(page,width,label){
 const extra=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 if(extra>2)console.log('OVERFLOW',width,label,await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(n=>n.getBoundingClientRect().right>innerWidth+2).slice(0,7).map(n=>n.className)));
 assert.ok(extra<=2,label+' overflows by '+extra+'px at '+width);
}
async function choose(page,name){
 await page.locator('[data-nav-mode="'+name+'"]').click();
 assert.equal(await page.locator('[data-nav-mode="'+name+'"]').getAttribute('aria-pressed'),'true');
 assert.equal(await page.locator('body').getAttribute('data-nav-mode'),name);
}
async function home(page){await page.locator('.wordmark').click();assert.equal(new URL(page.url()).hash,'#discover')}
async function screenshot(page,name){
 await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
 await page.waitForTimeout(260);
 await page.screenshot({path:resolve(output,name+'.png'),fullPage:false,animations:'disabled'});
}
try{
 for(const width of widths){
  const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.locator('#nav-lab-switcher').waitFor();
  assert.equal(await page.locator('[data-nav-mode]').count(),4);
  assert.equal(await page.locator('[data-nav-mode="morph"]').getAttribute('aria-pressed'),'true');
  assert.ok(await page.locator('#tools-trigger').isVisible());
  await noOverflow(page,width,'initial');
  await choose(page,'morph');await page.locator('#tools-trigger').click();
  assert.equal(await page.locator('#tools-trigger').getAttribute('aria-expanded'),'true');
  if(width>980){
   assert.ok(await page.locator('#nav-morph').isVisible());
   assert.equal(await page.locator('.primary-nav').isVisible(),false);
   assert.equal(await page.locator('#nav-morph a').count(),4);
  }else{
   assert.equal(await page.locator('.mobile-bottom-nav a').count(),4);
   assert.ok((await page.locator('.mobile-bottom-nav').innerText()).includes('Open Doors'));
   assert.equal(await page.locator('#tools-trigger').getAttribute('aria-controls'),'mobile-quick-nav');
  }
  await noOverflow(page,width,'morph');
  if([1440,390].includes(width))await screenshot(page,'01-morph-'+width);
  await (width>980?page.locator('#nav-morph [data-route="topics"]'):page.locator('.mobile-bottom-nav [data-route="topics"]')).click();
  assert.equal(new URL(page.url()).hash,'#topics');assert.equal(await page.locator('#tools-trigger').getAttribute('aria-expanded'),'false');
  await home(page);
  await choose(page,'ribbon');
  const before=await page.locator('#content').evaluate(x=>x.getBoundingClientRect().top);
  await page.locator('#tools-trigger').click();
  assert.ok(await page.locator('#nav-ribbon').isVisible());assert.equal(await page.locator('#nav-ribbon a').count(),4);
  const after=await page.locator('#content').evaluate(x=>x.getBoundingClientRect().top);
  assert.ok(after-before>65,'ribbon should push content');
  await noOverflow(page,width,'ribbon');
  if([1440,390].includes(width))await screenshot(page,'02-ribbon-'+width);
  await page.locator('#nav-ribbon [data-route="fit"]').click();
  assert.equal(new URL(page.url()).hash,'#fit');assert.equal(await page.locator('#nav-ribbon').isHidden(),true);
  await home(page);
  await choose(page,'command');await page.locator('#tools-trigger').click();
  assert.ok(await page.locator('#nav-command').isVisible());
  assert.equal(await page.locator('#nav-command-query').evaluate(x=>x===document.activeElement),true);
  await page.locator('#nav-command-query').fill('Research Face-Off');
  assert.ok(await page.locator('#nav-command-results [data-route="faceoff"]').isVisible());
  await noOverflow(page,width,'command');
  if([1440,390].includes(width))await screenshot(page,'03-command-'+width);
  await page.keyboard.press('Enter');assert.equal(new URL(page.url()).hash,'#faceoff');
  await home(page);
  await page.keyboard.press('Control+k');assert.ok(await page.locator('#nav-command').isVisible());
  await page.keyboard.press('Escape');assert.equal(await page.locator('#nav-command').isHidden(),true);
  assert.equal(await page.locator('#tools-trigger').evaluate(x=>x===document.activeElement),true);
  await choose(page,'side');await page.locator('#tools-trigger').click();
  assert.ok(await page.locator('#nav-side').isVisible());assert.ok(await page.locator('#nav-side-shade').isVisible());
  assert.equal(await page.locator('#nav-side').getAttribute('aria-modal'),'true');
  assert.equal(await page.locator('body').evaluate(x=>x.classList.contains('nav-lab-side-open')),true);
  assert.equal(await page.locator('#nav-side-close').evaluate(x=>x===document.activeElement),true);
  await page.keyboard.press('Shift+Tab');
  assert.equal(await page.locator('#nav-side .nav-side-items a').last().evaluate(x=>x===document.activeElement),true);
  await noOverflow(page,width,'side');
  if([1440,390].includes(width))await screenshot(page,'04-index-'+width);
  await page.keyboard.press('Escape');assert.equal(await page.locator('#nav-side').isHidden(),true);
  assert.equal(await page.locator('body').evaluate(x=>x.classList.contains('nav-lab-side-open')),false);
  await page.locator('#tools-trigger').click();
  await page.locator('#nav-side [data-route="doors"]').click();
  assert.equal(new URL(page.url()).hash,'#doors');assert.equal(await page.locator('#nav-side').isHidden(),true);
  await page.reload({waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('[data-nav-mode="side"]').getAttribute('aria-pressed'),'true','choice persists after reload');
  await noOverflow(page,width,'final');
  assert.deepEqual(errors,[],'unexpected browser errors');
  console.log('PASS '+width+'px / four navigation mechanisms, focus, routing, persistence and no overflow');
  await page.close();
 }
 console.log('PASS four in-site navigation variants');
}finally{await browser.close()}
