/** YEON Fieldwork consistency acceptance.
 * An intentionally measurable visual design contract, not a claim of aesthetic approval.
 * Consistency != identical layout: shared type tokens, surfaces, controls and motion.
 */
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dir=resolve(root,'app-v7-fieldwork');
const src=readFileSync(resolve(dir,'fieldwork.css'),'utf8');
const html=readFileSync(resolve(dir,'index.html'),'utf8');
assert.match(src,/Cross-page grammar/);
assert.match(src,/--radius-lg:/);
assert.match(src,/--control-h:/);
assert.match(src,/prefers-reduced-motion:reduce/);
assert.match(html,/Manrope/);
function ratio(a,b){
 const rgb=h=>h.match(/[\da-f]{2}/gi).map(v=>parseInt(v,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);
 const val=h=>{let [r,g,b]=rgb(h);return .2126*r+.7152*g+.0722*b};
 const x=val(a),y=val(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
assert.ok(ratio('1b343c','f5f7f5')>=7,'body text contrast should exceed 7:1');
assert.ok(ratio('94331f','fbfcf9')>=4.5,'accent metadata contrast should exceed AA');
assert.ok(ratio('ffffff','bd492f')>=4.5,'coral CTA needs AA text contrast');
const urls=pathToFileURL(resolve(dir,'index.html')).href;
const out=resolve(root,'artifacts/fieldwork-consistency');
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const routes=['discover','index','lab/mosaic','compare','topics','desk','doors','fit','faceoff','about'];
try{
 for(const width of [1440,768,390,320]){
  const page=await browser.newPage({viewport:{width,height:920},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  let typeSystem=null, dark=null;
  for(const route of routes){
   await page.goto(urls+'#'+route,{waitUntil:'domcontentloaded'});
   await page.locator('.view').waitFor();
   const info=await page.evaluate(()=>{
    const get=s=>{const el=document.querySelector(s);return el?getComputedStyle(el):null};
    const props=getComputedStyle(document.documentElement);
    const bg=s=>get(s)?.backgroundColor;
    const title=get('.page-header h1');
    return {
      vw:innerWidth, sw:document.documentElement.scrollWidth,
      bodyFont:get('body')?.fontFamily,
      headingFont:title?.fontFamily,
      headingWeight:title?.fontWeight,
      headingColor:title?.color,
      ink:props.getPropertyValue('--ink').trim(),
      accent:props.getPropertyValue('--accent').trim(),
      radius:props.getPropertyValue('--radius-lg').trim(),
      feature:bg('.hero-feature'),secondary:bg('.secondary-feature'),
      topics:[...document.querySelectorAll('.topic-lane')].map(e=>getComputedStyle(e).backgroundColor),
      compare:[...document.querySelectorAll('.compared')].map(e=>getComputedStyle(e).backgroundColor),
      challenges:[...document.querySelectorAll('.challenge-paper')].map(e=>getComputedStyle(e).backgroundColor),
      darkDesk:bg('.desk-summary'),darkDoors:bg('.doors-stat'),darkVerdict:bg('.challenge-verdict'),
      formHeight:document.querySelector('.select')?.getBoundingClientRect().height||0
    };
   });
   assert.ok(info.sw-info.vw<=2,route+' overflows at '+width+'px by '+(info.sw-info.vw));
   assert.match(info.bodyFont,/Manrope/i);
   assert.equal(info.accent,'#bd492f',route+' unexpectedly changed accent token');
   if(typeSystem&&info.headingFont)assert.equal(info.headingFont,typeSystem.headingFont,'font changes across '+route);
   if(!typeSystem&&info.headingFont)typeSystem=info;
   if(route==='discover')assert.equal(info.feature,info.secondary,'homepage uses disparate decorative surfaces');
   if(route==='topics')assert.equal(new Set(info.topics).size,1,'topics must share one surface material');
   if(route==='compare'){
     assert.equal(new Set(info.compare).size,1,'comparison background should not imply a winner');
     assert.ok(info.formHeight>=44,'form fields need usable touch targets');
   }
   if(route==='faceoff')assert.equal(new Set(info.challenges).size,1,'challenge papers use same color rather than different palettes');
   if(route==='desk')dark=info.darkDesk;
   if(route==='doors')assert.equal(info.darkDoors,dark,'opportunity evidence panel must share dark ink');
   if(route==='faceoff')assert.equal(info.darkVerdict,dark,'faceoff verdict must share dark ink');
   if([1440,390].includes(width)){
    const slug=route.replace('/','-');
    await page.screenshot({path:resolve(out,slug+'-'+width+'.png'),fullPage:true});
   }
  }
  assert.deepEqual(errors,[],'No runtime JS errors at '+width);
  await page.close();
  console.log('PASS consistency @'+width+'px across '+routes.length+' routes, one type and surface system');
 }
 console.log('PASS all Fieldwork design-system invariants');
}finally{await browser.close();}
