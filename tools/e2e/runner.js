/* Classroom-runner check: loads the runner's own testbench page (https://reading-cert.vercel.app/cr-kit/testbench.html,
   or a saved copy given as TESTBENCH=path) with this repo's index.html as the activity, plays one battle question
   and reads the testbench checklist (items 2–8; item 1 "opens alone" is what tests.js / lesson.js cover).
   usage: node tools/e2e/runner.js */
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');const http=require('http');
const MOCK=fs.readFileSync(path.join(__dirname,'mockpeer.js'),'utf8');const ROOT=path.join(__dirname,'..','..');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const BENCH_URL='https://reading-cert.vercel.app/cr-kit/testbench.html';
(async()=>{
  /* the testbench is served from the same local server (an https page may not embed http://127.0.0.1 frames) */
  const bench=process.env.TESTBENCH?fs.readFileSync(process.env.TESTBENCH):Buffer.from(await (await fetch(BENCH_URL)).arrayBuffer());
  const srv=http.createServer((q,r)=>{let f=decodeURIComponent(q.url.split('?')[0]);if(f==='/__bench.html'){r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});return r.end(bench);}if(f==='/')f='/index.html';const fp=path.join(ROOT,f);if(!fp.startsWith(ROOT))return r.writeHead(403).end();fs.readFile(fp,(e,d)=>{if(e)return r.writeHead(404).end();r.writeHead(200,{'Content-Type':fp.endsWith('.html')?'text/html; charset=utf-8':'text/plain; charset=utf-8'});r.end(d);});});
  await new Promise(r=>srv.listen(0,'127.0.0.1',r));const game=`http://127.0.0.1:${srv.address().port}/index.html`;
  const browser=await chromium.launch();const ctx=await browser.newContext({viewport:{width:1500,height:1000}});const errors=[];const reg=new Map();
  await ctx.route(/cdn\.jsdelivr|cdnjs\.cloudflare|fonts\.g|drive\.google|googleusercontent/,r=>r.abort());
  /* board and tablets are iframes of one page: route the mock PeerJS by frame */
  await ctx.exposeBinding('__net',async({frame},m)=>{
    if(m.k==='reg'){reg.set(m.id,frame);return;}if(m.k==='unreg'){if(reg.get(m.id)===frame)reg.delete(m.id);return;}
    const t=reg.get(m.to);if(!t||t.isDetached()){if(m.k==='connect')frame.evaluate(x=>window.__recv(x),{k:'nopeer',to:m.from}).catch(()=>{});return;}
    t.evaluate(x=>window.__recv(x),m).catch(()=>{});});
  await ctx.addInitScript(MOCK);
  const page=await ctx.newPage();
  page.on('pageerror',e=>errors.push('PAGEERROR '+e.message));page.on('console',m=>{if(m.type()==='error'&&!/ERR_FAILED|Failed to load resource/.test(m.text()))errors.push('console.error '+m.text().slice(0,300));});
  await page.goto(`http://127.0.0.1:${srv.address().port}/__bench.html`);await page.fill('#url',game);await page.click('#go');
  const board=()=>page.frames().find(f=>/screen=board/.test(f.url()));const tabs=()=>page.frames().filter(f=>/screen=tablet/.test(f.url()));
  await page.waitForFunction(()=>document.querySelector('#check li[data-k="ready"]').classList.contains('ok'),null,{timeout:20000});
  await board().waitForFunction(()=>typeof S!=='undefined'&&S&&Object.values(S.players).filter(p=>p.online).length>=2,null,{timeout:20000});
  const noJoinUI=await board().evaluate(()=>!document.querySelector('#qr canvas,#qr img')&&!/New class/.test(document.body.innerText));
  await board().evaluate(()=>document.querySelector('[data-act="start-battle"]').click());await sleep(400);
  await board().evaluate(()=>nextRound(battleQs().find(q=>q.type==='T')));await sleep(900);
  for(const t of tabs())await t.evaluate(()=>{const a=document.querySelector('#ans');if(a){a.value='Bears eat fish and berries.';a.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('[data-sact="send"]').click();}});
  await sleep(500);await board().evaluate(()=>{const b=document.querySelector('[data-act="tier"]');if(b)b.click();});await sleep(400);
  await page.click('#end');await sleep(2500);
  const res=await page.evaluate(()=>[...document.querySelectorAll('#check li')].map(li=>[li.dataset.k,li.classList.contains('ok')?'ok':li.classList.contains('bad')?'BAD':'-',(li.querySelector('.hint')||{}).textContent||'']));
  let bad=0;for(const [k,st,hint] of res){if(k==='solo')continue;if(st!=='ok')bad++;console.log((st==='ok'?'PASS ':'FAIL ')+k+(hint?'  · '+hint.trim().slice(0,80):''));}
  console.log((noJoinUI?'PASS ':'FAIL ')+'board shows no QR / New class inside the runner');if(!noJoinUI)bad++;
  console.log((errors.length?'FAIL ':'PASS ')+'no page errors'+(errors.length?'  · '+errors.join(' | ').slice(0,300):''));if(errors.length)bad++;
  console.log(bad?`\n${bad} check(s) failed`:'\nRunner testbench: all green');
  await browser.close();srv.close();process.exit(bad?1:0);
})().catch(e=>{console.error('SCRIPT FAIL',e);process.exit(2);});
