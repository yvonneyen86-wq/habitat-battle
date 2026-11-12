/* A whole lesson played by bots: Learning Time (4 activities) → Question Card → coins/shop → Practice Rush → Battle → End game.
   usage: node tools/e2e/lesson.js [LEVEL=OD1] [UNITS=1] [pRight=.75] [ROUNDS=14]   (SHOTS=dir saves screenshots)
   Prints a line starting with !! for every page error, broken invariant, or 'undefined' / NaN / non-English text on any screen. */
const {setup}=require('./join');const {sleep,btns,shot}=require('./lib');const bot=require('./bot');const {check}=require('./inv');
const LV=process.argv[2]||'OD1',UNITS=(process.argv[3]||'1').split(','),PR=+(process.argv[4]||.75),ROUNDS=+(process.argv[5]||14);
const hc=async(host,sel)=>host.evaluate(sel=>{const b=[...document.querySelectorAll(sel)].filter(x=>!x.disabled&&x.offsetParent!==null);if(!b.length)return false;b[Math.floor(Math.random()*b.length)].click();return true;},sel);
(async()=>{
  const {w,host,studs}=await setup([['Amy'],['Ben','Cal'],['Dan'],['Eve'],['Fay','Gus','Hal'],['Ivy']]);const seen=new Set();const ck=l=>check(l,host,studs,w.errors,seen);
  const T0=Date.now();const allBot=async(n,pr=PR)=>{let acted=0;for(let i=0;i<n;i++){let any=0;for(const s of studs){const r=await s.evaluate(bot,pr).catch(e=>'ERR '+e.message);if(r){any++;acted++;}}await sleep(40);if(!any)break;}return acted;};
  await host.click('[data-act="bank"]');await host.click(`[data-act="bk-level"][data-k="${LV}"]`);for(const u of UNITS)await host.click(`[data-act="bk-unit"][data-n="${u}"]`);await host.click('[data-act="bk-use"]');await sleep(300);await ck('bank');
  const cats=await host.evaluate(()=>[...document.querySelectorAll('[data-act="lt-cat"]')].map(b=>b.dataset.k));console.log('cats',cats);
  for(const k of cats){
    await host.click(`[data-act="lt-cat"][data-k="${k}"]`);await sleep(250);await ck('lt-'+k+'-start');
    for(let step=0;step<40;step++){
      const n=await allBot(k==='reading'?14:45);await ck(`lt-${k}-s${step}`);
      // teacher: grade anything gradable, toggle board text, then next
      for(let g=0;g<12;g++){if(!(await hc(host,'[data-act="lt-grade"]')))break;await sleep(30);}
      if(step%3===0)await hc(host,'[data-act="lt-text"]');
      if(step%4===1)await hc(host,'[data-act="show-ans"]');
      await ck(`lt-${k}-g${step}`);
      const nx=await hc(host,'[data-act="lt-next"]');await sleep(120);
      if(!nx&&(!n||step>=1))break;
    }
    if(Math.random()<.5){await hc(host,'[data-act="lt-prev"]');await sleep(100);await allBot(10);await ck(`lt-${k}-prev`);}
    console.log(((Date.now()-T0)/1000|0)+'s  lt',k,'prog',await host.evaluate(()=>S.lt?JSON.stringify(S.lt.prog).slice(0,200)+' i='+S.lt.i:'null'),'coins',await host.evaluate(()=>Object.values(S.players).map(p=>p.coins).join(',')));
    await hc(host,'[data-act="lt-stop"]');await sleep(150);await ck('lt-'+k+'-stop');
  }
  // question card
  if(await hc(host,'[data-act="card"]')){await sleep(200);await ck('card');await hc(host,'[data-act="show-cue"]');await hc(host,'[data-act="show-ans"]');await sleep(100);await ck('card-ans');await hc(host,'[data-act="card"]');await sleep(100);await hc(host,'[data-act="card-close"]');await sleep(100);}
  // teacher coins
  for(let i=0;i<6;i++){await hc(host,'[data-act="coin"]');await hc(host,'[data-act="great"]');}await hc(host,'[data-act="all-coin"]');await hc(host,'[data-act="team-coin"]');await hc(host,'[data-act="coin-minus"]');await sleep(100);await ck('coins');
  {for(let i=0;i<25;i++){for(const s of studs)await s.evaluate(bot,{p:PR,shop:true}).catch(()=>{});await sleep(30);}for(const s of studs)await s.evaluate(()=>{const b=document.querySelector('[data-sact="shop-close"]');if(b&&b.offsetParent)b.click();});}await ck('shop');
  // practice rush
  if(await hc(host,'[data-act="rush-start"]')){await sleep(400);await ck('rush-start');const n=await allBot(90);console.log('rush actions',n,await host.evaluate(()=>S.rush?JSON.stringify(S.rush).slice(0,300):'no rush'));await ck('rush-play');await shot(host,`rush-${LV}-host`);await shot(studs[0],`rush-${LV}-stu`);
    await hc(host,'[data-act="rush-stop"]');await sleep(300);await ck('rush-stop');await shot(host,`rush-${LV}-report`);console.log('after rush btns',(await btns(host,'#modal-root,#overlay,.rush-ovl')).slice(0,300));await hc(host,'[data-act="rush-close"]');await sleep(200);await ck('rush-close');}
  else console.log('rush-start not available');
  // battle
  await host.click('[data-act="start-battle"]');await sleep(500);await ck('battle-start');
  for(let r=0;r<ROUNDS;r++){
    for(let t=0;t<40;t++){if(await hc(host,'[data-act="next-round"]'))break;await sleep(250);}
    await sleep(250);const qt=await host.evaluate(()=>S.battle&&S.battle.q?S.battle.q.type+' | '+(S.battle.q.text||'').slice(0,50):'none');
    await ck(`r${r}-q`);
    await allBot(25);await ck(`r${r}-ans`);
    // teacher grades
    if(Math.random()<.5)await hc(host,'[data-act="approve-good"]');
    for(let g=0;g<5;g++){await hc(host,'[data-act="tier"]');if(Math.random()<.2)await hc(host,'[data-act="no"]');}
    await hc(host,'[data-act="spell-ok"]');if(Math.random()<.3)await hc(host,'[data-act="spell-no"]');
    await sleep(80);await ck(`r${r}-graded`);
    await allBot(20);await ck(`r${r}-acted`);
    if(r%4===2){await hc(host,'[data-act="boss"]');await sleep(900);await ck(`r${r}-boss`);}
    if(r%5===3&&await hc(host,'[data-act="vote-open"]')){await sleep(200);await allBot(8);await ck(`r${r}-vote`);await hc(host,'[data-act="vote-reveal"]');await sleep(300);await ck(`r${r}-reveal`);await hc(host,'[data-act="vote-close"]');await sleep(200);}
    if(r%3===1&&await hc(host,'[data-act="defense"]')){await sleep(300);await ck(`r${r}-def`);await allBot(15);for(let g=0;g<3;g++)await hc(host,'[data-act="block"]');await ck(`r${r}-blocked`);}
    await hc(host,'[data-act="resolve"]');
    await host.waitForFunction(()=>!S.battle||(!H.busy&&S.battle.step!=='resolving')||S.phase!=='battle',null,{timeout:30000}).catch(()=>console.log('!! resolve never finished, step',r));
    await ck(`r${r}-resolved`);
    console.log(`  round ${r} ${qt} → hp ${await host.evaluate(()=>Object.values(S.players).map(p=>(p.down?'x':'')+p.hp+'/'+p.armor).join(' '))} step=${await host.evaluate(()=>S.battle&&S.battle.step)} phase=${await host.evaluate(()=>S.phase)}`);
    if(r===3){await shot(host,`battle-${LV}-host`);await shot(studs[1],`battle-${LV}-stu`);}
    if(await host.evaluate(()=>S.phase)!=='battle')break;
  }
  await hc(host,'[data-act="end-battle"]');await sleep(1500);await ck('end');await shot(host,`end-${LV}-host`);await shot(studs[0],`end-${LV}-stu`);
  console.log('end btns',(await btns(host)).slice(0,400));
  await hc(host,'[data-act="end-game"]');await sleep(300);await ck('eg-dialog');await shot(host,`eg-${LV}`);await hc(host,'[data-act="eg-go"]');await sleep(500);await ck('eg-done');
  console.log('after end game',await host.evaluate(()=>S.phase+' '+Object.values(S.players).map(p=>p.name+':'+p.coins+':lv'+p.lv+':'+p.hp).join(' ')));
  await allBot(5);await ck('after-eg-bot');
  console.log(seen.size?`\n${seen.size} problem(s) found`:'\nLesson finished with no problems');await w.close();process.exit(seen.size?1:0);
})().catch(e=>{console.error('SCRIPT FAIL',e);process.exit(1);});
