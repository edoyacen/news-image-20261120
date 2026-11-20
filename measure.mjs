import { writeFileSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

let h = readFileSync('page.html', 'utf8');
h = h.replace('</body>', `<script>
window.addEventListener('load',()=>{
  const out={docH:document.documentElement.scrollHeight,docW:document.documentElement.scrollWidth,items:[]};
  for (const el of document.querySelectorAll('.lbl, .sub, .wNote b, .wNote span, .foot div, .stamp, .leadNotes span, .tick .sm, .wTitle')) {
    if (el.scrollWidth > el.clientWidth + 1) out.items.push({c:'CLIP ' + el.className, x:0, y:0, w:el.clientWidth, h:0, sh:0, ch:0, sw:el.scrollWidth, cw:el.clientWidth});
  }
  for (const el of document.querySelectorAll('.page > header, main, .lead, .weather, .rows, .r1, .r2, .bottom, .card, .story, .date, .leadCopy h1, .wNotes, .deck')) {
    const r=el.getBoundingClientRect();
    out.items.push({c:el.className||el.tagName,x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),sh:el.scrollHeight,ch:el.clientHeight,sw:el.scrollWidth,cw:el.clientWidth});
  }
  document.title='MEASURE'+JSON.stringify(out);
});
</script></body>`);
writeFileSync('measure.html', h);

const r = spawnSync('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--virtual-time-budget=3000',
  '--dump-dom', pathToFileURL(process.cwd() + '/measure.html').href,
], { encoding: 'utf8', maxBuffer: 1e8 });

const m = r.stdout.match(/MEASURE(\{[\s\S]*?\})<\/title>/);
if (!m) { console.log(r.stdout.slice(0, 2000)); process.exit(1); }
const d = JSON.parse(m[1]);
console.log('docH', d.docH, 'docW', d.docW);
for (const i of d.items) {
  const over = i.sh > i.ch + 1 || i.sw > i.cw + 1;
  console.log((over ? 'OVER ' : 'ok   ') + i.c.padEnd(18), 'x' + i.x, 'y' + i.y, i.w + 'x' + i.h, 'scroll', i.sw + 'x' + i.sh);
}
