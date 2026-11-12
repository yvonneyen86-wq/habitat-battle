/* Regression tests for bugs fixed in the 2026-11 audit (battle, Learning Time, joining/connection, bank parser).
   usage: node tools/e2e/tests.js   → prints PASS/FAIL per check, exit code 1 on any failure */
const {setup}=require('./join');const {sleep}=require('./lib');
const res=[];const T=(name,ok,info='')=>{res.push([name,ok]);console.log((ok?'PASS ':'FAIL ')+name+(info?'  · '+info:''));};
const send=(pg,m)=>pg.evaluate(m=>sSend(m),m);
const useUnit=async(host,lv,n)=>{await host.click('[data-act="bank"]');await host.click(`[data-act="bk-level"][data-k="${lv}"]`);await host.evaluate(()=>document.querySelector('[data-act="bk-none"]').click());await host.click(`[data-act="bk-unit"][data-n="${n}"]`);await host.click('[data-act="bk-use"]');await sleep(250);};
(async()=>{
  // ---------- battle ----------
  {const {w,host,studs}=await setup([['Amy'],['Ben'],['Dan'],['Eve']]);
    await host.click('[data-act="start-battle"]');await sleep(300);
    await host.click('[data-act="next-round"]');await sleep(1300);
    T('next question: buttons come back without a student message',await host.evaluate(()=>!document.querySelector('[data-act="resolve"]').disabled&&!document.querySelector('[data-act="next-round"]').disabled));
    // own question survives a re-render
    await host.fill('#cq','What do birds have');await send(studs[0],{t:'buy',item:'atk'});await sleep(200);
    T('own question text survives a tablet message',await host.evaluate(()=>document.querySelector('#cq').value)==='What do birds have');
    // everyone correct → all attack; end battle while resolving
    await host.evaluate(()=>{Object.keys(S.players).forEach(pid=>markCorrect(pid,1));});
    for(const [i,s] of studs.entries())await send(s,{t:'act',kind:'attack',target:(i+1)%2});
    await sleep(200);await host.click('[data-act="resolve"]');await sleep(700);
    await host.click('[data-act="end-battle"]');await sleep(200);
    T('End Battle waits for the running round',await host.evaluate(()=>S.phase)==='battle');
    // remove a player mid-resolve (support action queued)
    await host.waitForFunction(()=>!H.busy,null,{timeout:30000});
    T('round resolved, damage applied in battle',await host.evaluate(()=>S.phase==='battle'&&S.battle.step==='done'&&Object.values(S.players).some(p=>p.hp<10)));
    await host.click('[data-act="next-round"]');await sleep(900);
    await host.evaluate(()=>{Object.keys(S.players).forEach(pid=>markCorrect(pid,1));});
    for(const s of studs)await send(s,{t:'act',kind:'build'});await sleep(150);
    await host.click('[data-act="resolve"]');await sleep(500);
    await host.evaluate(()=>{const pid=Object.keys(S.players)[3];delete S.players[pid];changed();});
    const freed=await host.waitForFunction(()=>!H.busy&&S.battle.step==='done',null,{timeout:15000}).then(()=>true).catch(()=>false);
    T('removing a player during a round does not freeze the battle',freed);
    // empty team cannot be attacked
    await host.evaluate(()=>{S.teamCount=3;changed();});await host.click('[data-act="next-round"]');await sleep(900);
    await host.evaluate(()=>{Object.keys(S.players).forEach(pid=>markCorrect(pid,1));});await sleep(200);
    T('tablet does not offer an empty team as a target',await studs[0].evaluate(()=>![...document.querySelectorAll('[data-sact="act"][data-k="attack"]')].some(b=>b.dataset.t==='2')&&document.querySelectorAll('[data-sact="act"][data-k="attack"]').length===1));
    await send(studs[0],{t:'act',kind:'attack',target:2});await sleep(150);
    T('host refuses an attack on an empty team',await host.evaluate(()=>!S.battle.acts[Object.keys(S.players)[0]]));
    // gear kept when the boss is already dead
    await host.evaluate(()=>{S.teamCount=2;summonBoss();S.battle.boss.hp=1;Object.values(S.players).forEach(p=>{p.inv.atk=2;});changed();});
    for(const s of studs.slice(0,3))await send(s,{t:'act',kind:'attack',target:'boss'});await sleep(150);
    await host.click('[data-act="resolve"]');await host.waitForFunction(()=>!H.busy,null,{timeout:30000});
    T('only the attack that lands spends gear',await host.evaluate(()=>Object.values(S.players).reduce((a,p)=>a+p.inv.atk,0))===5,'atk gear left '+await host.evaluate(()=>Object.values(S.players).map(p=>p.inv.atk).join(',')));
    // approved pool + vote
    await host.evaluate(()=>{nextRound({type:'T',text:'Write a sentence.',model:''});});await sleep(900);
    await send(studs[0],{t:'answer',text:'I like cats because they are soft.'});await send(studs[1],{t:'answer',text:'Dogs can run fast and they are fun.'});await sleep(200);
    await host.evaluate(()=>{const ids=Object.keys(S.players);markCorrect(ids[0],1);markCorrect(ids[1],1);markCorrect(ids[0],0);markCorrect(ids[0],2);markCorrect(ids[1],0);});
    T('rejected sentence leaves the vote pool, re-approval adds one copy',await host.evaluate(()=>S.battle.approved.length)===1);
    await host.evaluate(()=>{markCorrect(Object.keys(S.players)[1],1);openVote();});await sleep(200);
    await host.evaluate(()=>revealVote());await sleep(150);
    T('no votes → nobody wins yet',await host.evaluate(()=>S.battle.vote&&!S.battle.vote.revealed));
    // upgrade in battle
    await host.evaluate(()=>{const p=Object.values(S.players)[0];p.coins=10;p.hp=2;p.lv=1;changed();});await send(studs[0],{t:'buy',item:'upgrade'});await sleep(200);
    T('upgrade in battle adds 5 hearts, not a full heal',await host.evaluate(()=>Object.values(S.players)[0].hp)===7);
    T('no page errors (battle)',w.errors.length===0,w.errors.join(' | ').slice(0,300));await w.close();}
  // ---------- learning time ----------
  {const {w,host,studs}=await setup([['Amy'],['Ben','Cal'],['Dan']]);
    await useUnit(host,'OPW1',8);await host.click('[data-act="lt-cat"][data-k="words"]');await sleep(300);
    // alphabet level: finish all pictures by always tapping the right letter
    const done=await studs[0].evaluate(async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));for(let n=0;n<80;n++){const lt=ST.s.lt,L=ST.lt;const w=lt.words[L.i];if(!w||(ST.my.lt.ok>=lt.words.length))break;const want=alphaL(w,lt.letters);const b=[...document.querySelectorAll('[data-sact="lt-letter"]')].find(x=>String(x.dataset.b).toLowerCase()===want);if(b)b.click();await sl(60);}return ST.my.lt.ok+'/'+ST.s.lt.words.length;});
    T('Phonics 1 U8 letters: every picture can be answered',done==='15/15',done);
    T('board letter cards: Xx shows its pictures',await host.evaluate(()=>{H.ltHideText=false;render();const c=[...document.querySelectorAll('#ovl .ltwords.alpha .wc')].find(x=>/Xx/.test(x.textContent));return c?c.querySelectorAll('.pics > *').length:0;})>=3);
    await host.click('[data-act="lt-stop"]');
    await host.click('[data-act="lt-cat"][data-k="sw"]');await sleep(200);await host.evaluate(()=>{H.ltHideText=false;render();});
    T('phonics Say & Build can be shown on the board',await host.evaluate(()=>!document.querySelector('#ovl').hidden&&/Say/.test(document.querySelector('#ovl').textContent)));
    await host.click('[data-act="lt-stop"]');
    // reading: board options shuffled, late answers ignored, speak marks done
    await useUnit(host,'OD1',1);await host.click('[data-act="lt-cat"][data-k="reading"]');await sleep(200);await host.click('[data-act="lt-next"]');await sleep(200);
    const firsts=await host.evaluate(()=>{const u=ltUnit();return u.reading.qs.filter(q=>q.type==='C').map((q,i)=>seedShuffle(q.opts,'board|'+u.n+'|'+i).indexOf(q.opts[0]));});
    T('board options are shuffled (answer not always first)',firsts.some(x=>x!==0),firsts.join(','));
    T('board options carry no letters',await host.evaluate(()=>!/A\.\s/.test(document.querySelector('#ovl .opts')?.textContent||'A. ')));
    await host.click('[data-act="lt-next"]');await sleep(150);
    await send(studs[0],{t:'lt',k:'choice',i:0,c:0});await sleep(150);
    T('late answer for the previous question is ignored',await host.evaluate(()=>!S.lt.prog.p1||S.lt.prog.p1.done[1]==null));
    await host.evaluate(()=>{S.lt.i=6;changed();});await send(studs[0],{t:'lt',k:'hand',i:6});await sleep(150);
    await host.evaluate(()=>document.querySelector('[data-act="coin"][data-pid="p1"]').click());await sleep(150);
    T('speak question: teacher ✓ marks it done and lowers the hand',await host.evaluate(()=>S.lt.prog.p1.done[6]===1&&S.lt.prog.p1.hand===undefined));
    T('speak question: tablet shows it is done',await studs[0].evaluate(()=>/Well said/.test(document.querySelector('#s-dock').textContent)));
    // stop, then a late message
    await host.click('[data-act="lt-stop"]');await send(studs[0],{t:'lt',k:'word',i:0,ok:true});await sleep(200);
    T('late Learning Time message after Stop is harmless',w.errors.length===0,w.errors.join(' | ').slice(0,200));
    // Speak & Write: late joiner gets a partner
    await host.click('[data-act="lt-cat"][data-k="sw"]');await sleep(200);
    const code=await host.evaluate(()=>S.code);const late=await w.mk('stu-Zed',w.BASE+'?join='+code,{width:1024,height:768});
    await late.waitForSelector('#j-name');await late.fill('#j-name','Zed');await late.click('[data-jnav="1"]');await late.click('[data-team="0"]');await late.waitForSelector('[data-char]');await late.click('[data-char="robot"]');await late.waitForSelector('#j-go');await late.click('#j-go');await late.waitForFunction(()=>ST.me&&ST.view!=='join');await sleep(200);
    T('late joiner gets a Speak & Write partner',await late.evaluate(()=>!!(ST.my&&ST.my.lt&&ST.my.lt.partner)),await late.evaluate(()=>JSON.stringify(ST.my.lt)));
    T('no page errors (learning time)',w.errors.length===0,w.errors.join(' | ').slice(0,300));await w.close();}
  // ---------- joining / connection ----------
  {const {w,host,studs}=await setup([['Amy']]);const code=await host.evaluate(()=>S.code);
    const p=await w.mk('stu-typing',w.BASE+'?join='+code,{width:1024,height:768});await p.waitForSelector('#j-name');
    await p.type('#j-name','Am');await host.evaluate(()=>{giveCoins('p1',1);});await sleep(200);await p.keyboard.type('y');
    await p.fill('#j-pair','Be');await p.focus('#j-pair');await p.keyboard.press('End');await host.evaluate(()=>{giveCoins('p1',1);});await sleep(200);await p.keyboard.type('n');
    T('typing a name is not disturbed by other tablets',await p.evaluate(()=>document.querySelector('#j-name').value+'|'+document.querySelector('#j-pair').value)==='Amy|Ben',await p.evaluate(()=>document.querySelector('#j-name').value+'|'+document.querySelector('#j-pair').value));
    // student reload keeps identity and coins
    await host.evaluate(()=>{giveCoins('p1',3);});await sleep(100);await studs[0].reload();await studs[0].waitForFunction(()=>typeof ST!=='undefined'&&ST.me&&ST.view!=='join',null,{timeout:15000});
    T('tablet reload keeps the same player and coins',await studs[0].evaluate(()=>ST.me+':'+ST.s.players[ST.me].coins)==='p1:5');
    // same child on another tablet takes the old player back
    await studs[0].close();await sleep(300);await host.evaluate(()=>{[...H.conns.keys()].forEach(c=>{if(H.conns.get(c).pid==='p1')dropConn(c);});});
    const again=await w.mk('stu-Amy2',w.BASE+'?join='+code,{width:1024,height:768});await again.waitForSelector('#j-name');await again.fill('#j-name','amy');await again.click('[data-jnav="1"]');await again.click('[data-team="0"]');await again.waitForSelector('[data-char]');await again.click('[data-char="panda"]');await again.waitForSelector('#j-go');await again.click('#j-go');await again.waitForFunction(()=>ST.me&&ST.view!=='join');
    T('same name on a new tablet returns to the old player',await again.evaluate(()=>ST.me+':'+ST.s.players[ST.me].coins)==='p1:5',await again.evaluate(()=>ST.me));
    // a tablet that wakes up asks the teacher for a fresh state
    const t0=await again.evaluate(()=>{const t=ST.lastState;document.dispatchEvent(new Event('visibilitychange'));return t;});await sleep(400);
    T('tablet wake-up refreshes its state',await again.evaluate(t0=>ST.lastState>t0&&ST.conn&&ST.conn.open,t0));
    // host reload: state restored, tablets reconnect
    await host.reload();await host.waitForFunction(()=>typeof S!=='undefined'&&S&&H.status==='on');
    T('teacher reload keeps the class',await host.evaluate(()=>S.code+':'+Object.keys(S.players).length)===code+':1');
    T('no page errors (join)',w.errors.length===0,w.errors.join(' | ').slice(0,300));await w.close();}
  // ---------- voice answers + lesson summary ----------
  {const {w,host,studs}=await setup([['Amy'],['Ben','Cal'],['Dan']]);
    await useUnit(host,'OD1',1);
    // Learning Time: one word built, one reading choice, one speak question recorded
    await host.click('[data-act="lt-cat"][data-k="words"]');await sleep(250);
    await studs[0].evaluate(async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const bs=[...document.querySelectorAll('[data-sact="lt-place"]')].sort((a,b)=>a.dataset.k-b.dataset.k);for(const b of bs){document.querySelector(`[data-sact="lt-place"][data-k="${b.dataset.k}"]`).click();await sl(30);}document.querySelector('[data-sact="lt-check"]').click();});await sleep(250);
    await host.click('[data-act="lt-stop"]');await host.click('[data-act="lt-cat"][data-k="reading"]');await sleep(200);
    await host.evaluate(()=>{S.lt.i=6;changed();});await sleep(250);
    T('speak question: tablet offers 🎙️ Record',await studs[0].evaluate(()=>!!document.querySelector('[data-sact="vox-rec"]')));
    await studs[0].click('[data-sact="vox-rec"]');await studs[0].waitForSelector('[data-sact="vox-stop"]',{timeout:8000});await sleep(1300);await studs[0].click('[data-sact="vox-stop"]');
    const got=await host.waitForFunction(()=>H.vox&&H.vox.items.p1&&H.vox.items.p1.url,null,{timeout:10000}).then(()=>true).catch(()=>false);
    T('recording reaches the teacher',got,await host.evaluate(()=>JSON.stringify(H.vox&&{key:H.vox.key,n:Object.keys(H.vox.items).length})));
    T('tablet shows the recording was received',await studs[0].waitForFunction(()=>/has your recording/.test(document.querySelector('#s-dock').textContent),null,{timeout:5000}).then(()=>true).catch(()=>false));
    const size=await host.evaluate(async()=>(await (await fetch(H.vox.items.p1.url)).blob()).size);
    T('recording is real audio data',size>500,size+' bytes');
    await host.click('[data-act="vox-play"][data-pid="p1"]');await sleep(300);
    T('teacher can play it',await host.evaluate(()=>H.voxPlaying==='p1'||H.vox.items.p1.played===true));
    await host.evaluate(()=>document.querySelector('.subs [data-act="coin"][data-pid="p1"]').click());await sleep(200);
    await host.click('[data-act="lt-next"]');await sleep(250);
    T('recordings are dropped at the next question',await host.evaluate(()=>H.vox.key!==''&&Object.keys(H.vox.items).length===0||H.vox.key===''));
    await host.click('[data-act="lt-stop"]');
    // battle: speak question, recording, grade, summary
    await host.click('[data-act="start-battle"]');await sleep(300);await host.evaluate(()=>{nextRound({type:'S',text:'Tell us about your family.',model:''});});await sleep(900);
    await studs[2].click('[data-sact="vox-rec"]');await studs[2].waitForSelector('[data-sact="vox-stop"]',{timeout:8000});await sleep(1000);await studs[2].click('[data-sact="vox-stop"]');
    await host.waitForFunction(()=>H.vox&&H.vox.items.p3,null,{timeout:10000}).catch(()=>{});
    T('battle speak question: recording listed with grade buttons',await host.evaluate(()=>!!document.querySelector('[data-act="vox-play"][data-pid="p3"]')&&!!document.querySelector('.subs [data-act="tier"][data-pid="p3"]')));
    await host.evaluate(()=>document.querySelector('.subs [data-act="tier"][data-t="2"][data-pid="p3"]').click());await sleep(200);
    await host.evaluate(()=>{markCorrect('p3',0);markCorrect('p3',2);});
    await host.evaluate(()=>{S.vox=false;changed();});await sleep(200);
    T('voice answers can be switched off',await studs[0].evaluate(()=>!document.querySelector('[data-sact="vox-rec"]')));
    await host.click('[data-act="resolve"]');await host.waitForFunction(()=>!H.busy,null,{timeout:20000});await host.click('[data-act="end-battle"]');await sleep(400);
    await host.evaluate(()=>document.querySelector('#topbar [data-act="sum-open"]').click());await sleep(200);
    const rec=await host.evaluate(()=>({p1:S.rec.p1,p3:S.rec.p3}));
    T('record: Amy built 1 word, spoke once, 1 recording',rec.p1.w===1&&rec.p1.w1===1&&rec.p1.sp===1&&rec.p1.vo===1,JSON.stringify(rec.p1));
    T('record: Dan 1 of 1 battle rounds, 1 ⭐, counted once after a re-grade',rec.p3.bOk===1&&rec.p3.bN===1&&rec.p3.bGreat===1&&rec.p3.sp===1&&rec.p3.vo===1,JSON.stringify(rec.p3));
    T('summary table lists every student, English only',await host.evaluate(()=>document.querySelectorAll('.sumtab tbody tr').length===3&&!/[\u3400-\u9fff]/.test(document.body.innerText)));
    await host.click('[data-act="sum-copy"][data-pid="p1"]:not([data-zh])');await sleep(200);const en=await host.evaluate(()=>navigator.clipboard.readText());
    T('copy: English summary for one student',/^Amy · Lesson summary/.test(en)&&/Words: built 1/.test(en)&&/1 recording/.test(en),en.replace(/\n/g,' / ').slice(0,160));
    await host.click('[data-act="sum-copy"][data-pid="p3"][data-zh="1"]');await sleep(200);const zh=await host.evaluate(()=>navigator.clipboard.readText());
    T('copy: Chinese summary for parents',/Dan/.test(zh)&&/口說/.test(zh)&&/對戰問答：1 回合答對 1 回合/.test(zh),zh.replace(/\n/g,' / ').slice(0,160));
    await host.click('.modal [data-act="m-close"]');await host.evaluate(()=>document.querySelector('#topbar [data-act="end-game"]').click());await sleep(150);await host.click('[data-act="eg-go"]');await sleep(300);
    T('End game clears the lesson record',await host.evaluate(()=>Object.keys(S.rec).length===0));
    T('no page errors (voice + summary)',w.errors.length===0,w.errors.join(' | ').slice(0,300));await w.close();}
  // ---------- bank parser ----------
  {const {w,host}=await setup([]);
    const r=await host.evaluate(()=>{const us=parseBankText('## U1 | Test |\n# Learn\nC | What is it? | It is a cat.\n#battle:\nS | Say hello.\n# Words\ncat | cat | c/at | x');return us[0].learn.length+','+us[0].battle.length+','+us[0].words.length;});
    T('bank: "# Learn", "#battle:", "# Words" headers are understood',r==='1,1,1',r);
    const ph=await host.evaluate(()=>{const u=OD_BANK.OPW2.units[0];return phonLearn(u).concat(phonBattle(u)).filter(l=>/the picture|^P \|\s*\|/.test(l)).length;});
    T('phonics: no card asks about a picture that is not shown',ph===0,String(ph));
    const gr=await host.evaluate(()=>{const g=crGroups({teams:[{id:'group:red',name:'Red Team',color:'#F06988',members:[{id:'a',name:'Amy'}]},{id:'group:blue',name:'Blue Team',members:[{id:'b',name:'Ben'}]}]},[{id:'group:blue',name:'Blue Team'},{id:'group:red',name:'Red Team'}]);return g?g.of['group:red']+','+g.of['group:blue']+','+g.groups[0].label+','+g.groups[0].color:'null';});
    T('runner: a group listed as a student lands in its own team',gr==='0,1,Red Team,#F06988',gr);
    const mc=await host.evaluate(()=>{const c=[0,0,0,0],f=Array(12).fill(0),N=8000;for(let i=0;i<N;i++){const q=parseQ('M | She ___ a cat. | has | have | haves | having');c[q.ans]++;f[shuf([...Array(12).keys()])[0]]++;}return {c:c.map(x=>Math.round(x/N*100)),f:f.map(x=>Math.round(x/N*100))};});
    T('battle multiple choice: the answer is in each place about 25% of the time',mc.c.every(x=>x>=22&&x<=28),mc.c.join('/')+'%');
    T('question order: each of 12 questions is asked first about 8% of the time',mc.f.every(x=>x>=6&&x<=11),mc.f.join(' '));
    T('no biased sort-shuffle left in the game code',await host.evaluate(()=>!/sort\(\(\)=>Math\.random\(\)-\.5\)/.test([...document.scripts].map(x=>x.textContent).join('').split('/*3D-BUNDLE-BEGIN*/')[0])));
    const sh=await host.evaluate(()=>{const c=[0,0,0];for(let p=1;p<=24;p++)for(let q=0;q<8;q++)c[seedShuffle([0,1,2],'p'+p+q).indexOf(0)]++;return c.join('/');});
    const parts=sh.split('/').map(Number);T('option shuffle is even across students',Math.min(...parts)>40,sh);
    await w.close();}
  const bad=res.filter(r=>!r[1]);console.log(`\n${res.length-bad.length}/${res.length} passed`);process.exit(bad.length?1:0);
})().catch(e=>{console.error('SCRIPT FAIL',e);process.exit(2);});
