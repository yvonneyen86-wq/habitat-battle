/* ===== demo game layer ===== */
const TEAM_DEFS=[{name:'Red',color:0xe03131,css:'#e03131'},{name:'Blue',color:0x3b5bdb,css:'#3b5bdb'},{name:'Green',color:0x2f9e44,css:'#2f9e44'},{name:'Yellow',color:0xf08c00,css:'#f08c00'}];
let teamCount=2,teamSite=[0,1,2,3];let TEAMS=TEAM_DEFS;
/* host game (index.html) → stage: its character ids mapped onto the 16 builders; HOST_ROSTER replaces the demo ROSTER when embedded */
let HOST_ROSTER=null;const CHAR_MAP={lion:'tiger',panda:'monkey',monkey:'monkey',elephant:'elephant',trex:'trex',bronto:'bronto',egg:'stego',dragon:'triceratops',astro:'astro',rocket:'rocket',alien:'alien',robot:'robot',detective:'kidA',chef:'kidB',wizard:'kidC',firefighter:'kidD'};
function hostIdx(p){const set=CHAR_SETS[current]||CHAR_SETS.jungle;let i=set.indexOf(CHAR_MAP[p.char]);if(i<0){let h=0;for(const c of String(p.pid||p.name))h=(h*31+c.charCodeAt(0))>>>0;i=h%4;}return i;}
const HPMAX=[10,15,20];
/* sample students; the creature each one appears as is picked per world (CHAR_SETS) so every scene shows its own inhabitants */
const ROSTER=[{name:'Amy',i:0,lv:2,av:{sk:1,hs:5,hc:1,sh:0,pt:4,n:7}},{name:'Ben',i:1,lv:1,av:{sk:0,hs:0,hc:3,sh:4,pt:1,n:2}},{name:'Cindy',i:2,lv:1,av:{sk:2,hs:3,hc:0,sh:6,pt:2,n:3}},{name:'David',i:3,lv:3,av:{sk:3,hs:2,hc:0,sh:2,pt:3,n:4}},{name:'Emma',i:0,lv:3,av:{sk:0,hs:4,hc:2,sh:5,pt:0,n:5}},{name:'Frank',i:1,lv:2,av:{sk:1,hs:1,hc:5,sh:7,pt:4,n:9}},{name:'Leo',i:2,lv:1,av:{sk:2,hs:0,hc:4,sh:3,pt:1,n:1}},{name:'Zoe',i:3,lv:2,av:{sk:3,hs:5,hc:1,sh:1,pt:4,n:8}}];
const SCENE_CLASS={jungle:'animal',dino:'dino',space:'space',town:'hero'};
let players=[],env=null,boss=null,current='jungle',baseDecos=[];
function flag(color){const g=new THREE.Group();g.add(mesh(CYL(.07,.07,3,12),GLOSS(0xfff6e0),0,1.5,0));g.add(mesh(SPH(.16,12,8),GLOSS(0xffd43b),0,3.05,0));const geo=new THREE.PlaneGeometry(1.5,.95,10,3);geo.translate(.75,0,0);const f=new THREE.Mesh(geo,GLOSS(color,{side:THREE.DoubleSide}));f.position.set(0,2.5,0);f.castShadow=true;f.userData.base=geo.attributes.position.array.slice();g.add(f);g.userData.cloth=f;return g;}
const YARD=[0,2.2,3,3.8],ANNEX={x:-1.9,z:-1.8};
function habFor(p){const cls=p.cls||CHAR_CLASS[p.id]||'animal';return bendTree(HAB[cls][p.lv-1]());}
function makePlayer(p,site,k,n){if(p.i==null)p.i=hostIdx(p);p.id=(CHAR_SETS[current]||CHAR_SETS.jungle)[p.i%4];const g=new THREE.Group();const t=TEAMS[p.team];const ang=(k/Math.max(1,n))*6.283+.8,rr=n>4?site.slotR+1.2:site.slotR;const dx=Math.cos(ang)*rr,dz=Math.sin(ang)*rr;const y=site.yAt?site.yAt(dx,dz):site.y;g.position.set(site.x+dx,y-.5,site.z+dz);
 const hab=habFor(p);hab.position.y=.5;g.add(hab);g.userData.hab=hab;const yard=mesh(new THREE.CircleGeometry(1,24),M(0xe9dcc0),0,.52,0,false);yard.rotation.x=-Math.PI/2;yard.scale.setScalar(YARD[p.lv]);g.add(yard);g.userData.yard=yard;
 if(p.lv>1){const an=habFor(Object.assign({},p,{lv:p.lv-1}));an.position.set(ANNEX.x,.5,ANNEX.z);an.scale.setScalar(.62);g.add(an);g.userData.annex=an;}
 const f=flag(t.color);f.position.set(2.1,.5,-.7);g.add(f);g.userData.flag=f;
 const ch=buildChar(p.id,p.av);ch.scale.multiplyScalar(1.05);ch.position.set(-2.3,.5,2);ch.rotation.y=.4;g.add(ch);g.userData.ch=ch;
 const top=(ch.userData.top||2.7)*ch.scale.y,home={x:-2.3,y:.5,z:2};Object.assign(g.userData,{top,home,at:Object.assign({},home),site,look:null,ry:.4});
 const lab=bubbleSprite(p.name,t.css);lab.position.set(-2.3,.5+top+1.3,2);g.add(lab);g.userData.lab=lab;const hp=hpSprite();hp.position.set(0,5.6,0);g.add(hp);g.userData.hp=hp;
 Object.assign(g.userData,{p,hp0:HPMAX[p.lv-1],hpv:HPMAX[p.lv-1],down:false,shake:0,bob:Math.random()*6});world.add(g);players.push(g);return g;}
function loadScene(key){current=key;spot=null;spotBack=null;document.body.classList.remove('spot');clearWorld();players=[];boss=null;baseDecos=[];env=ENV[key]();
 if(key!=='dino'){sun.color.set(0xfff6e0);}if(key!=='space')sun.intensity=1.5;
 teamSite=teamSite.map((v,i)=>i<env.sites.length?v:i);buildTeams();overview();
 document.querySelectorAll('.sc button').forEach(b=>b.classList.toggle('sel',b.dataset.s===key));
 const names={jungle:'🌴 Jungle Safari',dino:'🌋 Dino Valley',space:'🪐 Solar System',town:'🏙️ Hsinchu'};const tt=document.getElementById('title');if(tt)tt.textContent=names[key];}
/* every team lives at the base it picked: flag + coloured name sign at the site, players arranged around it */
function buildTeams(){players.forEach(g=>world.remove(g));players=[];baseDecos.forEach(d=>world.remove(d));baseDecos=[];
 env.sites.forEach(st=>{st.sign.userData.lab.visible=true;if(st.claim)st.claim(null);});
 for(let i=0;i<teamCount;i++){const t=TEAMS[i],site=siteOf(env.sites,teamSite[i]);if(site.claim)site.claim(t);site.sign.userData.lab.visible=false;
  const deco=new THREE.Group();const f=flag(t.color);f.scale.setScalar(1.7);f.position.set(0,0,0);deco.add(f);const lab=bubbleSprite(t.name+' Base',t.css);lab.position.set(0,6.6,0);lab.scale.set(5.4,1.86,1);deco.add(lab);
  deco.position.set(site.x,site.yAt?site.yAt(0,0):site.y,site.z);world.add(deco);baseDecos.push(deco);
  const src=HOST_ROSTER||ROSTER;const mine=HOST_ROSTER?src.filter(p=>p.team===i):src.filter((p,k)=>k%teamCount===i);mine.forEach((p,k)=>makePlayer(Object.assign({},p,{team:i}),site,k,mine.length));}
 players.forEach(g=>setHp(g,g.userData.hp0));if(boss){world.add(boss);}bendTree(world);renderHud();}
function setTeamCount(n){teamCount=Math.max(2,Math.min(TEAM_DEFS.length,n));const used=new Set();teamSite=teamSite.map((v,i)=>{let s=v%env.sites.length;while(used.has(s))s=(s+1)%env.sites.length;used.add(s);return s;});buildTeams();}
/* drawer + cinematic mode */
const drawerEl=document.getElementById('drawer'),scrimEl=document.getElementById('scrim');
function drawer(open){if(drawerEl)drawerEl.classList.toggle('open',open);if(scrimEl)scrimEl.classList.toggle('open',open);}
const fabEl=document.getElementById('fab'),dcloseEl=document.getElementById('dclose');if(fabEl)fabEl.addEventListener('click',()=>drawer(true));if(dcloseEl)dcloseEl.addEventListener('click',()=>drawer(false));if(scrimEl)scrimEl.addEventListener('click',()=>drawer(false));
let cineId=0,cleanShot=false;function cinema(ms,clean){drawer(false);if(!MINI)document.body.classList.add('cine');cleanShot=!!clean;const id=++cineId;animate(ms/1000,()=>{},()=>{if(id===cineId){document.body.classList.remove('cine');cleanShot=false;}});}
/* briefly fly the camera to a spot, then go back to where it was */
/* close-up: shoot from the world centre side (open plaza) toward the base so scenery on the rim never blocks it */
let camBack=null,peekId=0;function peek(pos,r,ms){if(!camBack)camBack={t:camGoal.t.clone(),r:camGoal.r,phi:camGoal.phi};camGoal.t.set(pos.x,pos.y,pos.z);camGoal.r=r;camGoal.phi=.78;const d=Math.hypot(pos.x,pos.z);camGoal.th=d>1?Math.atan2(-pos.x,-pos.z):theta;const id=++peekId;animate(ms/1000,()=>{},()=>{if(id===peekId&&camBack){camGoal.t.copy(camBack.t);camGoal.r=camBack.r;camGoal.phi=camBack.phi;camGoal.th=null;camBack=null;}});}
function chooseSite(team,siteIdx){setTimeout(()=>drawer(false),350);const other=teamSite.findIndex((v,i)=>i<teamCount&&i!==team&&v===siteIdx);if(other>=0)teamSite[other]=teamSite[team];teamSite[team]=siteIdx;buildTeams();focusSite(env.sites[siteIdx]);banner(TEAMS[team].name+' → '+env.sites[siteIdx].name,TEAMS[team].css);if(EMBED&&HB3D_API.onSite)HB3D_API.onSite(teamSite.slice(0,teamCount));}
function renderHud(){const tc=document.getElementById('tcards');if(tc)tc.innerHTML=TEAMS.slice(0,teamCount).map((t,i)=>`<div class="tcard glass" style="--tc:${t.css};cursor:pointer;pointer-events:auto" title="Zoom to this base"><b>${t.name} Team</b><small>${siteOf(env.sites,teamSite[i]).name}</small><div class="bar"><i id="hp${i}" style="width:100%"></i></div></div>`).join('');
 const b=document.getElementById('bases');if(b)b.innerHTML=(EMBED?`<div class="row"><b>Bases</b><button data-ov="1" style="--tc:#1f8a4c">🌍 Overview</button></div>`:`<div class="row"><b>Teams</b>${[2,3,4].map(n=>`<button data-n="${n}" class="${n===teamCount?'sel':''}" style="--tc:#3b5bdb">${n}</button>`).join('')}<button data-ov="1" style="--tc:#1f8a4c">🌍 Overview</button></div>`)+TEAMS.slice(0,teamCount).map((t,i)=>`<div class="row" style="--tc:${t.css}"><span class="chip">${t.name}</span>${env.sites.map((st,k)=>{const owner=teamSite.findIndex((v,j)=>j<teamCount&&v===k);return `<button data-t="${i}" data-k="${k}" class="${owner===i?'sel':owner>=0?'taken':''}">${st.name}</button>`;}).join('')}</div>`).join('');
 TEAMS.slice(0,teamCount).forEach((t,i)=>setTeamBar(i));}
function setTeamBar(i){const ps=players.filter(q=>q.userData.p.team===i);const pct=ps.reduce((a,q)=>a+q.userData.hpv,0)/Math.max(1,ps.reduce((a,q)=>a+q.userData.hp0,0));const el=document.getElementById('hp'+i);if(el)el.style.width=Math.round(pct*100)+'%';}
function setHp(g,v){g.userData.hpv=Math.max(0,Math.min(g.userData.hp0,v));g.userData.hp.userData.draw(g.userData.hpv/g.userData.hp0);
 setTeamBar(g.userData.p.team);}
const GREY=M(0x9aa0a6,{roughness:.9});
function knockOut(g){g.userData.down=true;[g.userData.hab,g.userData.annex].forEach(h=>h&&h.traverse(o=>{if(o.isMesh){o.userData.mat=o.material;o.material=GREY;}}));animate(.6,k=>{g.userData.hab.scale.set(1+k*.2,1-k*.7,1+k*.2);g.userData.hab.rotation.z=k*.25;});const z=textSprite('💤',1.7);z.position.set(0,3,0);g.add(z);g.userData.zz=z;spawn(g.position.clone().setY(2.5),0xced4da,24,4,4,1.4);
 animate(.5,k=>{g.userData.ch.rotation.z=k*1.3;g.userData.ch.position.y=g.userData.at.y-k*.3;});}
function revive(g){if(!g.userData.down)return;g.userData.down=false;[g.userData.hab,g.userData.annex].forEach(h=>h&&h.traverse(o=>{if(o.isMesh&&o.userData.mat)o.material=o.userData.mat;}));g.userData.hab.scale.set(1,1,1);g.userData.hab.rotation.z=0;if(g.userData.zz){g.remove(g.userData.zz);g.userData.zz=null;}g.userData.ch.rotation.z=0;g.userData.ch.position.y=g.userData.at.y;setHp(g,Math.ceil(g.userData.hp0/2));spawn(g.position.clone().setY(3),0xffd43b,18,4,5,1);ring(g.position,0x51cf66);}
function jump(g){animate(.5,k=>{g.userData.ch.position.y=g.userData.at.y+Math.sin(k*Math.PI)*1.2;g.userData.ch.scale.setScalar(1.05*(1+Math.sin(k*Math.PI)*.15));});}
/* ---- attacks look different in every world: coconut lob (jungle), lava boulder (dino), laser bolts (space), water balloon (Hsinchu) ---- */
function landHit(to,dmg,color,extra){const b=to.position.clone().setY(2.6);spawn(b,color,70,11,9,2.2);spawn(b,0xffd43b,40,8,8,2);ring(to.position,color,14,1.8);setTimeout(()=>ring(to.position,0xffffff,10,1.4),250);const fl=mesh(SPH(1.5,10,8),GLOW(color,color,2,{transparent:true,opacity:.9}),b.x,b.y,b.z,false);scene.add(fl);animate(1.2,k=>{fl.scale.setScalar(1+k*5);fl.material.opacity=.9*(1-k);},()=>scene.remove(fl));extra&&extra(b);setFace(to.userData.ch,'ouch',2200);to.userData.shake=2;shakeCam=1.4;if(EMBED){to.userData.inFlight=false;if(to.userData.onLand){const f=to.userData.onLand;to.userData.onLand=null;f();}return;}setHp(to,to.userData.hpv-dmg);if(to.userData.hpv<=0&&!to.userData.down){knockOut(to);setTimeout(()=>banner('KO!','#495057'),150);}}
function lob(a,b,proj,trailFn,dur,done){proj.position.copy(a);proj.scale.multiplyScalar(2.2);scene.add(proj);const trail=[];animate(dur*3.2,k=>{proj.position.lerpVectors(a,b,k);proj.position.y+=Math.sin(k*Math.PI)*16;proj.rotation.x+=.12;proj.rotation.z+=.07;if(trail.length<120&&Math.random()<.85){const s=trailFn(proj.position);if(s){scene.add(s);trail.push(s);}}},()=>{scene.remove(proj);trail.forEach(s=>scene.remove(s));done();});}
const ATTACKS={
 jungle(from,to,dmg){const a=from.position.clone().add(new THREE.Vector3(0,3,0)),b=to.position.clone().setY(2.6);const nut=new THREE.Group();nut.add(mesh(SPH(.42,8,6),GLOSS(0x7a5236)));for(let i=0;i<3;i++)nut.add(mesh(SPH(.09,5,4),GLOSS(0x3b2a22),Math.cos(i*2.1)*.2,.38,Math.sin(i*2.1)*.2));
  lob(a,b,nut,p=>mesh(SPH(.11,5,4),M(0x8fc06a,{transparent:true,opacity:.8}),p.x,p.y,p.z,false),.95,()=>landHit(to,dmg,0xff922b,p=>{for(let i=0;i<16;i++){const leaf=mesh(CONE(.4,1.1,4),M(0x6aa84f),p.x,p.y,p.z,false);leaf.scale.z=.3;leaf.userData={v:new THREE.Vector3(rnd(-7,7),rnd(4,10),rnd(-7,7)),life:2.4,rot:new THREE.Vector3(rnd(-4,4),rnd(-4,4),0)};scene.add(leaf);parts.push(leaf);}}));},
 dino(from,to,dmg){const a=from.position.clone().add(new THREE.Vector3(0,3.2,0)),b=to.position.clone().setY(2.6);const rock=mesh(new THREE.DodecahedronGeometry(.62,0),GLOW(0xff6b35,0xff5c1a,1.5));
  lob(a,b,rock,p=>{const e=mesh(SPH(.14,5,4),GLOW(0xffb703,0xff5c1a,1.4),p.x+rnd(-.3,.3),p.y+rnd(-.3,.3),p.z+rnd(-.3,.3),false);e.userData={v:new THREE.Vector3(rnd(-1,1),rnd(-3,-1),rnd(-1,1)),life:.6,rot:new THREE.Vector3()};parts.push(e);return e;},.9,()=>landHit(to,dmg,0xff5c1a,p=>{for(let i=0;i<28;i++){const sm=mesh(SPH(rnd(.7,1.5),6,5),M(0x5c5c5c,{transparent:true,opacity:.75}),p.x,p.y,p.z,false);sm.userData={v:new THREE.Vector3(rnd(-3,3),rnd(2,6),rnd(-3,3)),life:2.6,rot:new THREE.Vector3(),g:-16};scene.add(sm);parts.push(sm);}for(let i=0;i<24;i++){const lv=mesh(SPH(rnd(.25,.5),5,4),GLOW(0xff7b2e,0xff5c1a,1.6),p.x,p.y,p.z,false);lv.userData={v:new THREE.Vector3(rnd(-9,9),rnd(5,13),rnd(-9,9)),life:2,rot:new THREE.Vector3()};scene.add(lv);parts.push(lv);}}));},
 space(from,to,dmg){const a=from.position.clone().add(new THREE.Vector3(0,3,0)),b=to.position.clone().setY(2.6);const dir=b.clone().sub(a).normalize(),dist=a.distanceTo(b);
  const flash=mesh(SPH(1.6,8,6),GLOW(0x00d4ff,0x00d4ff,2,{transparent:true,opacity:.9}),a.x,a.y,a.z,false);scene.add(flash);animate(.8,k=>{flash.scale.setScalar(1+k*3);flash.material.opacity=.9*(1-k);},()=>scene.remove(flash));
  for(let n=0;n<5;n++){setTimeout(()=>{const bolt=mesh(CYL(.32,.32,7,6),GLOW(n%2?0xff5cf2:0x00d4ff,n%2?0xff5cf2:0x00d4ff,2.2),a.x,a.y,a.z,false);bolt.lookAt(b);bolt.rotateX(Math.PI/2);scene.add(bolt);const halo=mesh(CYL(.7,.7,7.5,6),GLOW(n%2?0xff5cf2:0x00d4ff,n%2?0xff5cf2:0x00d4ff,1.5,{transparent:true,opacity:.3}),0,0,0,false);bolt.add(halo);
   animate(Math.min(2.6,Math.max(1.4,dist/40)),k=>{bolt.position.lerpVectors(a,b,k);},()=>{scene.remove(bolt);if(n===4)landHit(to,dmg,0x00d4ff,p=>{for(let i=0;i<40;i++){const sp=mesh(BOX(.14,.14,rnd(1,2.6)),GLOW(0x00d4ff,0x00d4ff,2),p.x,p.y,p.z,false);const v=randDir().multiplyScalar(rnd(8,16));sp.lookAt(p.clone().add(v));sp.userData={v,life:1.8,rot:new THREE.Vector3(),g:0};scene.add(sp);parts.push(sp);}});});},n*260);}},
 town(from,to,dmg){const a=from.position.clone().add(new THREE.Vector3(0,3,0)),b=to.position.clone().setY(2.6);const balloon=mesh(SPH(.5,8,6),GLOSS(0x4dabf7,{transparent:true,opacity:.92}));balloon.scale.set(1,1.2,1);
  lob(a,b,balloon,p=>mesh(SPH(.08,5,4),GLOSS(0xa5d8ff,{transparent:true,opacity:.7}),p.x,p.y-.3,p.z,false),.95,()=>landHit(to,dmg,0x4dabf7,p=>{for(let i=0;i<50;i++){const d=mesh(SPH(rnd(.15,.4),5,4),GLOSS(0x74c0fc,{transparent:true,opacity:.85}),p.x,p.y,p.z,false);d.userData={v:new THREE.Vector3(rnd(-10,10),rnd(3,11),rnd(-10,10)),life:2,rot:new THREE.Vector3()};scene.add(d);parts.push(d);}const puddle=mesh(new THREE.CircleGeometry(4,12),GLOSS(0x74c0fc,{transparent:true,opacity:.6}),to.position.x,to.position.y+.55,to.position.z,false);puddle.rotation.x=-Math.PI/2;scene.add(puddle);animate(4,k=>{puddle.scale.setScalar(.4+k*.9);puddle.material.opacity=.6*(1-k);},()=>scene.remove(puddle));}));}
};
function attack(from,to,dmg=3){spotEnd();cinema(5800);jump(from);setFace(from.userData.ch,'talk',2500);(ATTACKS[current]||ATTACKS.jungle)(from,to,dmg);}
/* timers on the render clock, so multi-step effects stay in sync even when frames are slow */
function later(fn,ms){animate(ms/1000,()=>{},fn);}
/* ---- level up = the home EXPANDS: yard grows outward, the old home moves aside and stays as an annex,
   scaffolding goes up and the bigger home is built piece by piece from the ground up ---- */
let lvTarget=null;
function levelUp(g){const p=g.userData.p;if(p.lv>=3||g.userData.down)return false;spotEnd(false);lvTarget=g;setFace(g.userData.ch,'happy',7000);const lv=p.lv;p.lv=lv+1;const u=g.userData,old=u.hab,T=TEAMS[p.team];const base=g.position.clone().setY(g.position.y+.5);
 cinema(7200,true);peek(base.clone().setY(base.y+3),MINI?13:26,6800);jump(g);u.building=true;later(()=>{u.building=false;},7300);
 const ADD={transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending};
 const glow=mesh(new THREE.CircleGeometry(1,24),new THREE.MeshBasicMaterial(Object.assign({color:0xffc94d},ADD)),base.x,base.y+.06,base.z,false);glow.rotation.x=-Math.PI/2;scene.add(glow);
 const light=new THREE.PointLight(0xffd43b,0,30,2);light.position.set(base.x,base.y+4,base.z);scene.add(light);
 /* 1) 0–1.2 s: the yard spreads outward in rings; the old home slides aside and becomes the annex */
 const r0=YARD[lv],r1=YARD[lv+1];
 for(let i=0;i<3;i++)later(()=>ring(base,i===1?T.color:0xffd43b,r1*1.1,1),i*260);
 const oldAnnex=u.annex;if(oldAnnex)animate(.6,k=>{oldAnnex.scale.setScalar(.62*(1-k));oldAnnex.position.y=.5-k*.4;},()=>g.remove(oldAnnex));
 const fromP=old.position.clone();
 animate(1.2,k=>{const e=1-Math.pow(1-k,3);u.yard.scale.setScalar(r0+(r1-r0)*e);glow.scale.setScalar(.5+e*r1*1.05);glow.material.opacity=.5*Math.sin(k*Math.PI*.9);light.intensity=k*2.4;
  old.position.set(fromP.x+(ANNEX.x-fromP.x)*e,.5+Math.sin(k*Math.PI)*1.2,fromP.z+(ANNEX.z-fromP.z)*e);old.scale.setScalar(1-.38*e);old.rotation.y=Math.sin(k*Math.PI)*.6;
  if(Math.random()<.5){const a=rnd(0,6.28),rr=r0+(r1-r0)*e;const d=mesh(SPH(.18,5,4),M(0xd9c7a0),base.x+Math.cos(a)*rr,base.y+.3,base.z+Math.sin(a)*rr,false);d.userData={v:new THREE.Vector3(Math.cos(a)*2,rnd(1.5,3),Math.sin(a)*2),life:.8,rot:new THREE.Vector3()};scene.add(d);parts.push(d);}},
 ()=>{u.annex=old;old.rotation.y=0;
  /* 2) 1.2–1.8 s: scaffolding pops up around the build spot */
  const sc=new THREE.Group();const wood=GLOSS(0xc9a070);const R=1.7,H=4.6;
  for(let i=0;i<4;i++){const a=i/4*6.283+.785;sc.add(mesh(CYL(.07,.07,H,5),wood,Math.cos(a)*R,H/2,Math.sin(a)*R));}
  for(let y=1.4;y<H;y+=1.6)for(let i=0;i<4;i++){const a0=i/4*6.283+.785,a1=a0+1.571;const ax=Math.cos(a0)*R,az=Math.sin(a0)*R,bx=Math.cos(a1)*R,bz=Math.sin(a1)*R;const bar=mesh(BOX(.08,.08,Math.hypot(bx-ax,bz-az)),wood,(ax+bx)/2,y,(az+bz)/2);bar.rotation.y=Math.atan2(bx-ax,bz-az);sc.add(bar);}
  sc.position.y=.5;sc.scale.set(1,.01,1);g.add(sc);animate(.5,k=>sc.scale.set(1,Math.max(.01,k*(1.15-.15*k)),1));
  /* 3) 1.8–4.4 s: the new home is built piece by piece, lowest pieces first */
  const h=habFor(p);h.position.y=.5;g.add(h);u.hab=h;u.hp0=HPMAX[lv];
  const pieces=[];h.traverse(o=>{if(o.isMesh)pieces.push(o);});pieces.forEach(o=>{o.userData.s0=o.scale.clone();o.userData.y0=o.position.y;o.scale.setScalar(.001);});
  pieces.sort((a,b)=>(a.userData.y0-b.userData.y0)||(Math.hypot(a.position.x,a.position.z)-Math.hypot(b.position.x,b.position.z)));
  const span=2.4,step=span/Math.max(1,pieces.length);
  pieces.forEach((o,i)=>later(()=>{const s0=o.userData.s0,y0=o.userData.y0;animate(.42,k=>{const b=k<.7?k/.7*1.18:1.18-(k-.7)/.3*.18;o.scale.set(s0.x*b,s0.y*b,s0.z*b);o.position.y=y0+(1-k)*1.6;},()=>{o.scale.copy(s0);o.position.y=y0;});
   if(i%2===0){const wp=new THREE.Vector3();o.getWorldPosition(wp);spawn(wp,0xffd43b,5,2.5,2.5,.5);}if(i%5===0)u.shake=.25;},600+i*step*1000));
  setHp(g,Math.round(u.hpv/(HPMAX[lv-1]||1)*HPMAX[lv]));
  /* 4) 4.4 s: scaffolding comes down, the finished home bounces, celebration */
  later(()=>{animate(.45,k=>sc.scale.set(1,Math.max(.01,1-k),1),()=>g.remove(sc));
   animate(.8,k=>{const s=k<.35?1+k/.35*.22:1.22-(k-.35)/.65*.22;h.scale.setScalar(s);});setHp(g,HPMAX[lv]);
   shakeCam=1.2;ring(base,0xffd43b,10,1.2);later(()=>ring(base,0xffffff,14,1.4),180);later(()=>ring(base,T.color,18,1.6),360);
   spawn(base.clone().setY(base.y+2),0xffd43b,70,9,10,2.2);spawn(base.clone().setY(base.y+2),0xffffff,34,8,9,1.8);spawn(base.clone().setY(base.y+2),T.color,34,9,9,2);
   const stars='★'.repeat(lv+1)+'☆'.repeat(2-lv);const tag=labelSprite('LEVEL '+(lv+1)+'  '+stars,'#f08c00');tag.scale.set(9,2.8,1);tag.position.set(base.x,base.y+5.2,base.z);tag.renderOrder=10;tag.material.depthTest=false;scene.add(tag);
   animate(2.6,k=>{tag.position.y=base.y+5.2+k*1.4;tag.material.opacity=k<.75?1:1-(k-.75)/.25;const s=k<.12?k/.12:1;tag.scale.set(9*s,2.8*s,1);},()=>scene.remove(tag));
   banner('LEVEL UP!','#f08c00');
   [0,350,700].forEach((d,i)=>later(()=>{const fp=base.clone().add(new THREE.Vector3(rnd(-4,4),rnd(8,11),rnd(-4,4)));const c=[0xffd43b,0xff6b6b,0x74c0fc][i];spawn(fp,c,40,8,3,1.5);ring(fp,c,6,.8);},d));
   animate(1.4,k=>{light.intensity=2.4*(1-k);},()=>{scene.remove(light);scene.remove(glow);});},600+span*1000+300);});
 return true;}
const BOSS_NAME={jungle:'Jungle Giant',dino:'Lava Dragon',space:'Galaxy Monster',town:'Grumpy Ogre'};
function summonBoss(name){if(boss)return;spotEnd();cinema(4200);boss=bendTree(BOSS[current]());boss.userData.name=name||BOSS_NAME[current];const bp=env.bossAt||{x:0,z:-9};boss.position.set(bp.x,1.2,bp.z);boss.scale.setScalar(.01);boss.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});world.add(boss);banner('BOSS BATTLE!','#7048e8');
 animate(.8,k=>{boss.scale.setScalar(Math.min(1.3,k*1.4));},()=>{animate(.3,k=>boss.scale.setScalar(1.3-k*.3));spawn(boss.position.clone().setY(1.5),0x9775fa,44,8,6,1.3);ring(boss.position,0x9775fa);shakeCam=1;if(!EMBED)setTimeout(bossAttack,900);});}
function bossAttack(target){if(!boss)return;if(!target){const alive=players.filter(p=>!p.userData.down);if(!alive.length)return;target=alive[Math.floor(Math.random()*alive.length)];}animate(.5,k=>{boss.scale.setScalar(1+Math.sin(k*Math.PI)*.25);boss.rotation.z=Math.sin(k*Math.PI*2)*.15;},()=>{const a=boss.position.clone().setY(5),b=target.position.clone().setY(2.6);const f=mesh(SPH(.6,14,10),GLOW(0xff6b6b,0xff922b,1));f.position.copy(a);scene.add(f);animate(.8,k=>{f.position.lerpVectors(a,b,k);f.position.y+=Math.sin(k*Math.PI)*5;f.scale.setScalar(1+Math.sin(k*20)*.15);},()=>{scene.remove(f);spawn(b,0xff6b6b,26,7,6,1);ring(target.position,0xff6b6b);target.userData.shake=1;setFace(target.userData.ch,'ouch',2000);shakeCam=.8;if(EMBED){target.userData.inFlight=false;if(target.userData.onLand){const f=target.userData.onLand;target.userData.onLand=null;f();}return;}setHp(target,target.userData.hpv-2);if(target.userData.hpv<=0&&!target.userData.down)knockOut(target);});});}
function bossDefeated(){if(!boss)return;const b=boss;boss=null;const at=b.position.clone().setY(4);spawn(at,0xffd43b,60,10,9,2);spawn(at,0x9775fa,40,9,8,1.8);ring(b.position,0xffd43b,14,1.4);shakeCam=1.2;animate(1.1,k=>{b.rotation.y+=.25;b.scale.setScalar(Math.max(.01,1.3*(1-k)));b.position.y=1.2+k*4;},()=>world.remove(b));players.forEach((g,i)=>later(()=>{jump(g);setFace(g.userData.ch,'happy',2500);},i*120));}
function resetAll(){players.forEach(g=>{revive(g);setHp(g,g.userData.hp0);});if(boss){world.remove(boss);boss=null;}}
const ctrEl=document.querySelector('.ctr');if(ctrEl)ctrEl.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.a;
 if(['attack','level','heal','boss','reset','back'].includes(a))spotEnd();
 if(a==='one'){const c=players.filter(p=>!p.userData.down);if(c.length){oneIdx=(oneIdx+1)%c.length;spotOne(c[oneIdx]);}}
 if(a==='team'){teamIdx=(teamIdx+1)%teamCount;spotTeam(teamIdx);}
 if(a==='ok')react(true);if(a==='no')react(false);
 if(a==='attack'){const ti=Math.floor(Math.random()*teamCount),tj=(ti+1+Math.floor(Math.random()*(teamCount-1)))%teamCount;const A=players.filter(p=>p.userData.p.team===ti&&!p.userData.down),B=players.filter(p=>p.userData.p.team===tj&&!p.userData.down);if(!A.length||!B.length)return;const from=A[Math.floor(Math.random()*A.length)];const to=B.sort((x,y)=>y.userData.hpv-x.userData.hpv)[0];attack(from,to,3);banner('ACTION!',TEAMS[ti].css);}
 if(a==='level'){const c=players.filter(p=>p.userData.p.lv<3&&!p.userData.down);if(c.length)levelUp(c[Math.floor(Math.random()*c.length)]);}
 if(a==='heal'){const c=players.filter(p=>p.userData.down||p.userData.hpv<p.userData.hp0);if(!c.length)return;const g=c[Math.floor(Math.random()*c.length)];if(g.userData.down)revive(g);else{setHp(g,g.userData.hpv+4);spawn(g.position.clone().setY(3),0x69db7c,16,4,5,1);ring(g.position,0x51cf66);}}
 if(a==='boss')summonBoss();if(a==='reset')resetAll();});
const scEl=document.querySelector('.sc');if(scEl)scEl.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&ENV[b.dataset.s]){loadScene(b.dataset.s);setTimeout(()=>drawer(false),300);}});
const basesEl=document.getElementById('bases');if(basesEl)basesEl.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.ov)overview();else if(b.dataset.n)setTeamCount(+b.dataset.n);else chooseSite(+b.dataset.t,+b.dataset.k);});
const tcardsEl=document.getElementById('tcards');if(tcardsEl)tcardsEl.addEventListener('click',e=>{const c=e.target.closest('.tcard');if(!c)return;const i=[...c.parentNode.children].indexOf(c);spotTeam(i);});
/* ---- spotlight: the student who answers walks out in front of their home and faces the camera; a team answer lines the whole team up for a group shot ---- */
let spot=null,spotBack=null,oneIdx=-1,teamIdx=-1,nowT=0,tap={x:0,y:0,t:0,n:0};
const spotTagEl=document.getElementById('spottag');
function groundAt(site,x,z){return site&&site.yAt?site.yAt(x-site.x,z-site.z):(site?site.y:0);}
function walkTo(g,x,z){const u=g.userData,st=u.site,mr=st.stageR||st.slotR*2.1;const dx=x-st.x,dz=z-st.z,l=Math.hypot(dx,dz);if(l>mr){x=st.x+dx/l*mr;z=st.z+dz/l*mr;}u.at={x:x-g.position.x,y:groundAt(st,x,z)-g.position.y,z:z-g.position.z};return u.at;}
function inward(x,z){const l=Math.hypot(x,z);return l>1?{x:-x/l,z:-z/l}:{x:Math.sin(theta),z:Math.cos(theta)};}
function saveBack(){if(!spotBack)spotBack={t:camGoal.t.clone(),r:camGoal.r,phi:camGoal.phi};}
function spotOn(gs,pt,txt,css,w=1){spot={gs,pt,w};document.body.classList.add('spot');if(spotTagEl){spotTagEl.textContent=txt;spotTagEl.style.setProperty('--tc',css);}auto=false;idle=-30;}
function spotOne(g){if(!g||g.userData.down)return;if(spot)spot.gs.forEach(q=>{if(q!==g){q.userData.at=Object.assign({},q.userData.home);q.userData.look=null;}});saveBack();drawer(false);
 const u=g.userData,d=inward(g.position.x,g.position.z),th=Math.atan2(d.x,d.z),sp=env.curve===0;const at=walkTo(g,g.position.x+d.x*(sp?2.4:4.8),g.position.z+d.z*(sp?2.4:4.8));u.look=th;
 const px=g.position.x+at.x,py=g.position.y+at.y,pz=g.position.z+at.z;camGoal.t.set(px,py+u.top*(EMBED?.95:.55),pz);camGoal.r=4.6+u.top*1.15;camGoal.phi=sp?.3:.12;camGoal.th=th;
 spotOn([g],new THREE.Vector3(px,py+1,pz),'🎤 '+u.p.name+' is answering',TEAMS[u.p.team].css);setFace(u.ch,'happy',1100);jump(g);}
function spotTeam(i){const gs=players.filter(g=>g.userData.p.team===i&&!g.userData.down);if(!gs.length)return;if(spot)spot.gs.forEach(q=>{q.userData.at=Object.assign({},q.userData.home);q.userData.look=null;});saveBack();drawer(false);
 const site=siteOf(env.sites,teamSite[i]),d=inward(site.x,site.z),th=Math.atan2(d.x,d.z),pr={x:d.z,z:-d.x};const cls=SCENE_CLASS[current],sp=env.curve===0,gap=cls==='dino'?2.5:cls==='animal'?2.2:sp?1.3:1.75;
 const out=Math.min(site.slotR+2.6,(site.stageR||site.slotR*2.1)*.8),F={x:site.x+d.x*out,z:site.z+d.z*out};
 gs.forEach((g,k)=>{const off=(k-(gs.length-1)/2)*gap;walkTo(g,F.x+pr.x*off,F.z+pr.z*off);g.userData.look=th;setFace(g.userData.ch,'happy',1200+k*150);});
 const top=Math.max(...gs.map(g=>g.userData.top)),fy=groundAt(site,F.x,F.z);camGoal.t.set(F.x,fy+top*(EMBED?1:.55),F.z);camGoal.r=4+gs.length*gap*1.05+top*.9;camGoal.phi=sp?.3:.12;camGoal.th=th;
 spotOn(gs,new THREE.Vector3(F.x,fy+1,F.z),'👥 '+TEAMS[i].name+' Team is answering',TEAMS[i].css,(gs.length-1)/2*gap+1.2);}
function spotEnd(back=true){if(!spot)return;spot.gs.forEach(g=>{g.userData.at=Object.assign({},g.userData.home);g.userData.look=null;});spot=null;document.body.classList.remove('spot');
 if(back&&spotBack){camGoal.t.copy(spotBack.t);camGoal.r=spotBack.r;camGoal.phi=spotBack.phi;}camGoal.th=null;spotBack=null;idle=0;}
/* teacher marks the answer: happy jump + sparkles, or a sad face */
function react(ok){const gs=spot?spot.gs:players.filter(g=>!g.userData.down);gs.forEach((g,k)=>later(()=>{const u=g.userData,hp=g.position.clone().add(new THREE.Vector3(u.at.x,u.at.y+u.top,u.at.z));
 if(ok){setFace(u.ch,'happy',2400);jump(g);spawn(hp,0xffd43b,22,4,6,1.2);spawn(hp,TEAMS[u.p.team].color,12,4,6,1.1);}else{setFace(u.ch,'sad',2400);u.shake=.5;}},k*140));
 banner(ok?'GREAT JOB!':'TRY AGAIN!',ok?'#2f9e44':'#868e96');}
/* faces: base expression, short-lived reactions, blinking; the T. rex opens its jaw to roar */
function setFace(ch,e,ms){if(!ch)return;const c=ch.userData;if(ms){c.fTemp=e;c.fUntil=nowT+ms/1000;}else{c.fBase=e;c.fTemp=null;}}
function faceTick(g,t){const u=g.userData,c=u.ch.userData,f=c.head&&c.head.userData.face;let e=u.down?'ko':(c.fTemp&&t<c.fUntil?c.fTemp:(c.fBase||'smile'));
 if(e==='smile'){if(t>(c.nextBlink||0)){c.blinkEnd=t+.14;c.nextBlink=t+rnd(2.2,5);}if(t<(c.blinkEnd||0))e='blink';}
 if(c.jaw){const tg=(e==='happy'||e==='talk'||e==='ouch')?.5+Math.sin(t*9)*.08:.12;c.jaw.rotation.x+=(tg-c.jaw.rotation.x)*.2;}
 if(f&&c.fCur!==e){c.fCur=e;f.material.map=faceTex(f.userData.fo,e);}}
/* scenery between the camera and the focus is hidden while a close-up runs (trees, rocks, statues; never the ground) */
let occOn=false;
function occluders(){if(env.occ)return env.occ;const L=[];env.occ=L;if(typeof THREE.Box3!=='function')return L;const skip=new Set([...players,...baseDecos]);const B=new THREE.Box3(),c=new THREE.Vector3(),sz=new THREE.Vector3();
 const walk=(root,d)=>root.children.forEach(o=>{if(skip.has(o)||o.isLight||o.isSprite)return;B.setFromObject(o);if(B.isEmpty())return;B.getCenter(c);B.getSize(sz);const r=Math.hypot(sz.x,sz.z)/2;if(r>7){if(d<3&&o.children.length)walk(o,d+1);return;}if(B.max.y<1.4)return;L.push({o,x:c.x,z:c.z,r,top:B.max.y});});walk(world,0);return L;}
function hideOccluders(fpt,w){const occ=occluders(),a=camera.position,vx=fpt.x-a.x,vz=fpt.z-a.z,L2=vx*vx+vz*vz||1;occ.forEach(q=>{const k=((q.x-a.x)*vx+(q.z-a.z)*vz)/L2,kk=Math.max(0,Math.min(1,k)),dx=a.x+vx*kk-q.x,dz=a.z+vz*kk-q.z;q.o.visible=!(k<.95&&k>-.2&&Math.hypot(dx,dz)<q.r*.8+.9+w*kk&&q.top>fpt.y-.4);});occOn=true;}
/* a neighbour blocks the shot when its character (not its home) sits on the camera→focus line */
const _cw=new THREE.Vector3();function onLine(px,pz,fpt,r,w,kmax=.97){const a=camera.position,vx=fpt.x-a.x,vz=fpt.z-a.z,L2=vx*vx+vz*vz||1;const k=((px-a.x)*vx+(pz-a.z)*vz)/L2;if(k>kmax||k<-.3)return false;const kk=Math.max(0,Math.min(1,k));return Math.hypot(a.x+vx*kk-px,a.z+vz*kk-pz)<r+w*kk;}
function blocks(g,fpt,w){const u=g.userData;if(env.curve===0&&spot&&spot.gs[0].userData.site===u.site)return true;u.ch.getWorldPosition(_cw);return onLine(_cw.x,_cw.z,fpt,(SCENE_CLASS[current]==='dino'?3.2:2.2)*1.05,w)||onLine(g.position.x,g.position.z,fpt,YARD[u.p.lv]+1.2,w);}
/* tap a character on the board to spotlight it (projects with the same rolling-horizon bend as the shader) */
function pick(cx,cy){let best=null,bd=80;const v=new THREE.Vector3();players.forEach(g=>{if(!g.visible||g.userData.down)return;const u=g.userData;u.ch.getWorldPosition(v);v.y+=u.top*.55;v.applyMatrix4(camera.matrixWorldInverse);if(v.z>-.5)return;v.y-=BEND.value*v.z*v.z;v.applyMatrix4(camera.projectionMatrix);
 const rc=EMBED?stage.getBoundingClientRect():{left:0,top:0,width:innerWidth,height:innerHeight};const sx=rc.left+(v.x+1)/2*rc.width,sy=rc.top+(1-v.y)/2*rc.height,dd=Math.hypot(sx-cx,sy-cy);if(dd<bd){bd=dd;best=g;}});return best;}
/* camera: orbit, drag, pinch */
let theta=.5,phi=.5,radius=64,shakeCam=0,auto=true,idle=0;const ptrs=new Map();let pinch0=0,rad0=0;
const target=new THREE.Vector3(0,2,0);const camGoal={t:new THREE.Vector3(0,2,0),r:64,phi:.5,th:null};
/* panorama → zoom: the whole world first, then fly to a base when it is chosen */
function overview(){const v=(env&&env.view)||{};camGoal.t.set(v.x||0,v.y??2,v.z||0);camGoal.r=v.r||50;camGoal.phi=v.phi||.32;camGoal.th=null;}
function focusSite(site){if(!site)return;camGoal.t.set(site.x,(site.yAt?site.yAt(0,0):site.y)+1.5,site.z);camGoal.r=(env&&env.focusR)||24;camGoal.phi=(env&&env.focusPhi)||.24;}
function bindStage(el){el.addEventListener('pointerdown',e=>{ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});tap={x:e.clientX,y:e.clientY,t:performance.now(),n:ptrs.size};auto=false;idle=0;camGoal.r=radius;camGoal.phi=phi;if(ptrs.size===2){const[a,b]=[...ptrs.values()];pinch0=Math.hypot(a.x-b.x,a.y-b.y);rad0=radius;}});
const endPtr=e=>{if(ptrs.has(e.pointerId)&&e.type==='pointerup'&&tap.n===1&&ptrs.size===1&&Math.hypot(e.clientX-tap.x,e.clientY-tap.y)<10&&performance.now()-tap.t<450){const g=pick(e.clientX,e.clientY);if(g)spotOne(g);else if(spot)spotEnd();}ptrs.delete(e.pointerId);};addEventListener('pointerup',endPtr);addEventListener('pointercancel',endPtr);
addEventListener('pointermove',e=>{const p=ptrs.get(e.pointerId);if(!p)return;if(ptrs.size===1){theta-=(e.clientX-p.x)*.006;phi=Math.max(.06,Math.min(1.05,phi+(e.clientY-p.y)*.004));camGoal.phi=phi;if(Math.hypot(e.clientX-tap.x,e.clientY-tap.y)>10)camGoal.th=null;}p.x=e.clientX;p.y=e.clientY;if(ptrs.size===2){const[a,b]=[...ptrs.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch0){radius=Math.max(MINI?6:16,Math.min(190,rad0*pinch0/d));camGoal.r=radius;}}});
el.addEventListener('wheel',e=>{radius=Math.max(MINI?6:16,Math.min(190,radius+e.deltaY*.05));camGoal.r=radius;},{passive:true});}
bindStage(stage);
function resize(){const w=EMBED?(stage.clientWidth||innerWidth):innerWidth,h=EMBED?(stage.clientHeight||innerHeight):innerHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
let ro=null;addEventListener('resize',resize);if(EMBED&&typeof ResizeObserver==='function'){try{ro=new ResizeObserver(resize);ro.observe(stage);}catch(e){}}resize();
/* loop */
const clock=new THREE.Clock();
/* ?fast (screenshot testing on slow software GL only): let one frame cover more time */
const DTMAX=(typeof location!=='undefined'&&/[?&]fast/.test(location.search))?.5:.05;
let running=false,fpsN=0,fpsT=0,fpsV=0;
function loop(){if(!running)return;requestAnimationFrame(loop);const dt=Math.min(DTMAX,clock.getDelta());fpsN++;if(clock.elapsedTime-fpsT>1){fpsV=fpsN/(clock.elapsedTime-fpsT);fpsN=0;fpsT=clock.elapsedTime;}const t=clock.elapsedTime;
 if(!ptrs.size){idle+=dt;if(idle>5)auto=true;}if(auto&&!RM&&camGoal.th==null)theta+=dt*.07;
 /* rolling horizon: strong when close, flatter for wide panoramas */
 BEND.value=((env&&env.curve!=null)?env.curve:.0012)*Math.min(1.3,Math.pow(48/Math.max(1,radius),1.4));
 const kk=1-Math.exp(-3*dt);target.lerp(camGoal.t,kk);radius+=(camGoal.r-radius)*kk;phi+=(camGoal.phi-phi)*kk;if(camGoal.th!=null){const dd=Math.atan2(Math.sin(camGoal.th-theta),Math.cos(camGoal.th-theta));theta+=dd*kk;}
 const sh=shakeCam>0?(shakeCam-=dt*1.6,Math.sin(t*60)*shakeCam*.35):0;
 camera.position.set(target.x+Math.sin(theta)*Math.cos(phi)*radius,target.y+Math.sin(phi)*radius+sh,target.z+Math.cos(theta)*Math.cos(phi)*radius);camera.lookAt(target);
 if(!RM){envAnim.trees.forEach(p=>{p.rotation.z=Math.sin(t*1.1+p.userData.sway)*.025;p.rotation.x=Math.cos(t*.9+p.userData.sway)*.02;});
  envAnim.clouds.forEach(c=>{const a=Math.atan2(c.position.z,c.position.x)+c.userData.v*dt*.006,r=Math.hypot(c.position.x,c.position.z);c.position.x=Math.cos(a)*r;c.position.z=Math.sin(a)*r;});envAnim.extra.forEach(o=>{if(o.userData&&o.userData.ph!=null&&o.position)o.position.y=.1+Math.sin(t*1.3+o.userData.ph)*.12;});envAnim.coins.forEach(c=>{c.rotation.y=t*2.5+c.userData.ph;c.position.y+=Math.sin(t*2+c.userData.ph)*.004;});
  if(env&&env.tick)env.tick(dt,t);
  nowT=t;const fpt=spot?spot.pt:(cleanShot&&lvTarget?lvTarget.position:null),keep=spot?spot.gs:(lvTarget?[lvTarget]:[]);const dT=fpt?camera.position.distanceTo(fpt):0;if(fpt)hideOccluders(fpt,spot?spot.w||0:1.5);else if(occOn){(env.occ||[]).forEach(q=>q.o.visible=true);occOn=false;}
  baseDecos.forEach(d=>{if(d.children[1])d.children[1].visible=!cleanShot&&!spot;d.visible=!(fpt&&camera.position.distanceTo(d.position)<dT&&d.position.distanceTo(fpt)<10);});
  players.forEach(g=>{const u=g.userData,focus=keep.includes(g);g.visible=!(fpt&&!focus&&blocks(g,fpt,spot?spot.w||0:1.5));u.lab.visible=!MINI&&!cleanShot&&(!spot||focus);{const ls=spot?.6:1;u.lab.scale.set(3.6*ls,1.24*ls,1);}
   /* on the tiny planets a student's own home can stand between the camera and the line-up: hide the buildings, keep the student */
   {const hb=!!(spot&&focus&&onLine(g.position.x,g.position.z,fpt,YARD[u.p.lv]+1.6,spot.w||0,spot.gs.length>1?1.7:1.25));[u.hab,u.annex,u.flag,u.yard].forEach(o=>{if(o)o.visible=!hb;});}u.hp.visible=!MINI&&!spot&&(!cleanShot||g===lvTarget);faceTick(g,t);
   if(!u.down){u.hab.position.y=.5+Math.sin(t*1.6+u.bob)*.05;const ch=u.ch,at=u.at;const dx=at.x-ch.position.x,dz=at.z-ch.position.z,dd=Math.hypot(dx,dz);let want;
    if(dd>.03){const st=Math.min(dd,dt*6);ch.position.x+=dx/dd*st;ch.position.z+=dz/dd*st;u.walk=(u.walk||0)+dt*13;want=Math.atan2(dx,dz);}else{u.walk=0;want=u.look!=null?u.look:.35+Math.sin(t*.8+u.bob)*.25;}
    u.ry+=Math.atan2(Math.sin(want-u.ry),Math.cos(want-u.ry))*Math.min(1,dt*7);ch.rotation.y=u.ry;
    if(!anims.some(a=>a.g===g))ch.position.y=at.y+(u.walk?Math.abs(Math.sin(u.walk))*.28:Math.abs(Math.sin(t*2.4+u.bob))*(u.look!=null?.06:.18));
    u.lab.position.set(ch.position.x,at.y+u.top+1.3+Math.sin(t*2+u.bob)*.12,ch.position.z);if(ch.userData.head)ch.userData.head.rotation.z=Math.sin(t*1.7+u.bob)*.08;ch.traverse(o=>{if(o.userData.flame)o.scale.y=1+Math.sin(t*25+o.position.x*9)*.4;});}
   const cl=u.flag.userData.cloth,pa=cl.geometry.attributes.position.array,ba=cl.userData.base;for(let i=0;i<pa.length;i+=3){pa[i+2]=Math.sin(t*5+ba[i]*3)*.12*ba[i];}cl.geometry.attributes.position.needsUpdate=true;
   if(u.shake>0){u.shake-=dt*2.2;g.rotation.z=Math.sin(t*50)*u.shake*.12;g.rotation.x=Math.cos(t*47)*u.shake*.08;}else{g.rotation.z=0;g.rotation.x=0;}});
  if(boss){boss.position.y=1.2+Math.abs(Math.sin(t*2))*.25;boss.rotation.y=Math.sin(t*.8)*.25;}}
 for(let i=anims.length-1;i>=0;i--){const a=anims[i];a.t+=dt;const k=Math.min(1,a.t/a.dur);a.fn(k);if(k>=1){anims.splice(i,1);a.done&&a.done();}}
 for(let i=parts.length-1;i>=0;i--){const o=parts[i],u=o.userData;u.life-=dt;if(u.life<=0||o.position.y<-4){scene.remove(o);parts.splice(i,1);continue;}u.v.y-=(u.g??18)*dt;o.position.addScaledVector(u.v,dt);o.rotation.x+=u.rot.x*dt;o.rotation.y+=u.rot.y*dt;o.scale.setScalar(Math.min(1,u.life*2));}
 renderer.render(scene,camera);}
/* ===== embed API: index.html owns the game state and pushes it in with sync(); the stage only animates ===== */
function byPid(pid){return players.find(g=>g.userData.p.pid===pid)||null;}
function parseCol(c){if(typeof c==='number')return c;const m=/^#?([0-9a-f]{6})$/i.exec(String(c||''));return m?parseInt(m[1],16):0x888888;}
let lastKey='',syncing=false;
function sync(h){if(syncing)return;syncing=true;try{
 const tc=Math.max(2,Math.min(4,h.teamCount||2));
 TEAMS=(h.teams||[]).slice(0,tc).map((t,i)=>({name:String(t.name||'Team '+(i+1)).replace(/\s+Team$/i,''),color:parseCol(t.color),css:t.color||'#888'}));while(TEAMS.length<tc)TEAMS.push(TEAM_DEFS[TEAMS.length]);
 const list=Object.values(h.players||{}).filter(p=>p.team>=0&&p.team<tc).map(p=>({pid:p.pid,name:p.name,char:p.char,cls:p.cls||'animal',team:p.team,lv:Math.max(1,Math.min(3,p.lv||1)),av:p.av||null}));
 const sites=TEAMS.map((t,i)=>{const s=h.teams[i]&&h.teams[i].site;return Number.isInteger(s)&&s>=0?s:i;});
 const sceneKey=ENV[h.scene]?h.scene:'jungle';
 const key=[sceneKey,tc,sites.join(),list.map(p=>[p.pid,p.name,p.char,p.team,p.cls,JSON.stringify(p.av)].join('|')).join(';')].join('#');
 /* a player whose level went DOWN (reset) is rebuilt; a level UP plays the expansion animation below */
 const downs=players.filter(g=>{const q=h.players&&h.players[g.userData.p.pid];return q&&q.lv<g.userData.p.lv;});
 if(sceneKey!==current||!env||key!==lastKey||downs.length){lastKey=key;HOST_ROSTER=list.map(p=>{const g=byPid(p.pid);const cur=g?g.userData.p.lv:p.lv;return Object.assign({},p,{lv:Math.max(1,Math.min(3,Math.min(cur,p.lv)))});});
  teamCount=tc;teamSite=sites.concat([0,1,2,3].slice(sites.length));
  spotEnd(false);if(sceneKey!==current||!env)loadScene(sceneKey);else buildTeams();}
 players.forEach(g=>{const u=g.userData,q=h.players&&h.players[u.p.pid];if(!q)return;
  if(q.lv>u.p.lv&&!u.down&&!u.building){if(!levelUp(g))u.p.lv=q.lv;}
  if(u.inFlight||u.building)return;
  u.hp0=q.max||HPMAX[u.p.lv-1];if(q.down&&!u.down)knockOut(g);else if(!q.down&&u.down)revive(g);setHp(g,q.down?0:Math.max(0,Math.min(u.hp0,q.hp|0)));});
 const hb=h.boss;if(hb&&!boss)summonBoss(hb.name);if(!hb&&boss){world.remove(boss);boss=null;}
}finally{syncing=false;}}
function hitPromise(g,go,ms){return new Promise(res=>{if(!g){res();return;}g.userData.inFlight=true;g.userData.onLand=()=>{g.userData.inFlight=false;g.userData.onLand=null;res();};go();later(()=>{if(g.userData.onLand){const f=g.userData.onLand;g.userData.onLand=null;g.userData.inFlight=false;f();}},ms);});}
/* ---- mini stage (student tablet): the student's own home and character on a small island, same animations as the whiteboard ---- */
const MINI_GROUND={jungle:[0x6fcf4f,0xb98f63,0x58b947],dino:[0xf3e2b0,0xb98a5c,0xc9a070],space:[0xd0d4e4,0x8d93ad,0xb0b6cc],town:[0x9fdb6e,0xb98f63,0x58b947]};
const MINI_SKY={jungle:[0x4db8ff,0xcfeeff,0xd8f1ff],dino:[0xff9e6b,0xffe6bf,0xffe0c2],space:[0x070b2a,0x1d2060,0x10133a],town:[0x4db8ff,0xcfeeff,0xd8f1ff]};
let mp=null,miniKey='';
function miniScene(key){current=ENV[key]?key:'jungle';clearWorld();players=[];mp=null;miniKey='';boss=null;const[g1,g2,g3]=MINI_GROUND[current],[a,b,c]=MINI_SKY[current];setSky(a,b,c,40,120);
 world.add(mesh(new THREE.CylinderGeometry(9,9.6,1.2,40),M(g2),0,-.1,0,false));const top=mesh(new THREE.CircleGeometry(9,40),M(g1),0,.51,0,false);top.rotation.x=-Math.PI/2;world.add(top);
 for(let i=0;i<6;i++){const an=i/6*6.283+.5,r=6.4+(i%2)*1.2;const bsh=mesh(SPH(.6+(i%3)*.2,12,8),M(g3),Math.cos(an)*r,.7,Math.sin(an)*r);bsh.scale.y=.8;world.add(bsh);}
 env={sites:[{name:'Home',x:0,z:0,y:.55,k:0,yAt:null,slotR:0,stageR:6,claim:null,sign:null}],curve:0,bossAt:{x:0,z:-4},view:{x:-.8,y:1.7,z:1,r:10.5,phi:.24},focusR:11,tick:null};bendTree(world);
 sun.color.set(current==='dino'?0xffd0a0:0xfff0d0);sun.intensity=current==='space'?1.1:1.4;overview();camGoal.th=.3;theta=.3;auto=false;}
function miniShow(v){const key=ENV[v.scene]?v.scene:'jungle';if(key!==current||!env||!world||!env.view||env.view.r!==10.5)miniScene(key);
 TEAMS=[{name:String(v.teamName||'Team').replace(/\s+Team$/i,''),color:parseCol(v.teamColor),css:v.teamColor||'#888'}];
 const k=[v.pid,v.name,v.char,v.cls,JSON.stringify(v.av||0),v.teamColor].join('|');
 if(!mp||k!==miniKey){if(mp){world.remove(mp);players=players.filter(g=>g!==mp);}miniKey=k;mp=makePlayer({pid:v.pid,name:v.name,char:v.char,cls:v.cls||'animal',team:0,lv:Math.max(1,Math.min(3,v.lv||1)),av:v.av||null,i:null},env.sites[0],0,1);bendTree(mp);mp.userData.hp0=v.max||HPMAX[mp.userData.p.lv-1];setHp(mp,v.down?0:v.hp|0);if(v.down)knockOut(mp);return;}
 const u=mp.userData;if(v.lv>u.p.lv&&!u.down&&!u.building){if(!levelUp(mp))u.p.lv=v.lv;}else if(v.lv<u.p.lv){miniKey='';return miniShow(v);}
 if(u.building)return;u.hp0=v.max||HPMAX[u.p.lv-1];if(v.down&&!u.down)knockOut(mp);else if(!v.down&&u.down)revive(mp);setHp(mp,v.down?0:Math.max(0,Math.min(u.hp0,v.hp|0)));}
function miniReact(kind,tier){if(!mp||mp.userData.down)return;const u=mp.userData,hp=mp.position.clone().add(new THREE.Vector3(u.at.x,u.at.y+u.top,u.at.z));
 if(kind==='happy'){setFace(u.ch,'happy',2600);jump(mp);spawn(hp,0xffd43b,10+(tier||1)*8,4,6,1.2);if((tier||1)>=2)spawn(hp,TEAMS[0].color,10,4,6,1.1);if(tier===3)ring(mp.position,0xffd43b,6,.9);}
 else if(kind==='ouch'){setFace(u.ch,'ouch',2200);u.shake=1.2;shakeCam=.8;spawn(hp,0xff6b6b,14,5,5,1);}
 else if(kind==='sad'){setFace(u.ch,'sad',2200);u.shake=.4;}}
const HB3D_API=EMBED?{
 sync,onSite:null,fps(){return fpsV;},
 mount(el){if(!el||el===stage)return;stage=el;el.appendChild(renderer.domElement);bindStage(el);if(ro){try{ro.observe(el);}catch(e){}}resize();},
 show:miniShow,react:miniReact,
 start(){if(running)return;running=true;clock.getDelta();loop();},stop(){running=false;spotEnd(false);cleanShot=false;lvTarget=null;if(!MINI)document.body.classList.remove('cine','spot');},
 resize,overview(){spotEnd();overview();},renderBases(){renderHud();},
 correct(pid,tier){const g=byPid(pid);if(!g)return;const u=g.userData;setFace(u.ch,'happy',2600);jump(g);const hp=g.position.clone().add(new THREE.Vector3(u.at.x,u.at.y+u.top,u.at.z));spawn(hp,0xffd43b,8+tier*10,5,7,1.3);if(tier>=2)spawn(hp,TEAMS[u.p.team].color,12,5,7,1.2);if(tier===3){ring(g.position,0xffd43b,9,1);shakeCam=.5;}},
 wrong(pid){const g=byPid(pid);if(g){setFace(g.userData.ch,'sad',2200);g.userData.shake=.5;}},
 attack(fromPid,toPid,dmg){const a=byPid(fromPid);if(!a)return Promise.resolve();
  if(toPid==='boss'){if(!boss)return Promise.resolve();const d={position:boss.position.clone(),userData:{}};return hitPromise(d,()=>{spotEnd();cinema(5800);jump(a);setFace(a.userData.ch,'talk',2500);(ATTACKS[current]||ATTACKS.jungle)(a,d,dmg);},6500).then(()=>{if(boss){animate(.5,k=>{boss.rotation.z=Math.sin(k*Math.PI*2)*.2;boss.scale.setScalar(1.3-Math.sin(k*Math.PI)*.2);});}});}
  const b=byPid(toPid);return hitPromise(b,()=>attack(a,b,dmg),6500);},
 blocked(pid){const g=byPid(pid);if(g){ring(g.position,0x4dabf7,8,.9);ring(g.position,0xffffff,5,.7);setFace(g.userData.ch,'wow',1500);}},
 bossHit(pid){const g=byPid(pid);if(!boss)return Promise.resolve();return hitPromise(g,()=>bossAttack(g),3200);},
 bossDefeated(){bossDefeated();},
 spotOne(pid){const g=byPid(pid);if(g)spotOne(g);},spotTeam(i){spotTeam(i);},spotEnd(){spotEnd();},react(ok){react(ok);},
 cheer(pid){const g=byPid(pid);if(!g)return;spotOne(g);const u=g.userData;later(()=>{const hp=g.position.clone().add(new THREE.Vector3(u.at.x,u.at.y+u.top,u.at.z));spawn(hp,0xffd43b,40,7,8,1.6);spawn(hp,0xff6b6b,20,7,8,1.5);spawn(hp,0x74c0fc,20,7,8,1.5);setFace(u.ch,'happy',4000);jump(g);},900);later(()=>spotEnd(),5200);}
}:null;
if(!EMBED){running=true;loadScene('jungle');loop();}
