/* ===== demo game layer ===== */
const TEAM_DEFS=[{name:'Red',color:0xe03131,css:'#e03131'},{name:'Blue',color:0x3b5bdb,css:'#3b5bdb'},{name:'Green',color:0x2f9e44,css:'#2f9e44'},{name:'Yellow',color:0xf08c00,css:'#f08c00'}];
let teamCount=2,teamSite=[0,1,2,3];const TEAMS=TEAM_DEFS;
const HPMAX=[10,15,20];
/* sample students; the creature each one appears as is picked per world (CHAR_SETS) so every scene shows its own inhabitants */
const ROSTER=[{name:'Amy',i:0,lv:2},{name:'Ben',i:1,lv:1},{name:'Cindy',i:2,lv:1},{name:'David',i:3,lv:3},{name:'Emma',i:0,lv:3},{name:'Frank',i:1,lv:2},{name:'Leo',i:2,lv:1},{name:'Zoe',i:3,lv:2}];
const SCENE_CLASS={jungle:'animal',dino:'dino',space:'space',town:'hero'};
let players=[],env=null,boss=null,current='jungle',baseDecos=[];
function flag(color){const g=new THREE.Group();g.add(mesh(CYL(.07,.07,3,12),GLOSS(0xfff6e0),0,1.5,0));g.add(mesh(SPH(.16,12,8),GLOSS(0xffd43b),0,3.05,0));const geo=new THREE.PlaneGeometry(1.5,.95,10,3);geo.translate(.75,0,0);const f=new THREE.Mesh(geo,GLOSS(color,{side:THREE.DoubleSide}));f.position.set(0,2.5,0);f.castShadow=true;f.userData.base=geo.attributes.position.array.slice();g.add(f);g.userData.cloth=f;return g;}
function habFor(p){const cls=p.cls||CHAR_CLASS[p.id]||'animal';return HAB[cls][p.lv-1]();}
function makePlayer(p,site,k,n){p.id=(CHAR_SETS[current]||CHAR_SETS.jungle)[p.i%4];const g=new THREE.Group();const t=TEAMS[p.team];const ang=(k/Math.max(1,n))*6.283+.8,rr=n>4?site.slotR+1.2:site.slotR;const dx=Math.cos(ang)*rr,dz=Math.sin(ang)*rr;const y=site.yAt?site.yAt(dx,dz):site.y;g.position.set(site.x+dx,y-.5,site.z+dz);
 const hab=habFor(p);hab.position.y=.5;g.add(hab);g.userData.hab=hab;
 const f=flag(t.color);f.position.set(2.1,.5,-.7);g.add(f);g.userData.flag=f;
 const ch=buildChar(p.id);ch.scale.setScalar(1.05);ch.position.set(-2.3,.5,2);ch.rotation.y=.4;g.add(ch);g.userData.ch=ch;
 const lab=bubbleSprite(p.name,t.css);lab.position.set(-2.3,4.9,2);g.add(lab);g.userData.lab=lab;const hp=hpSprite();hp.position.set(0,5.6,0);g.add(hp);g.userData.hp=hp;
 Object.assign(g.userData,{p,hp0:HPMAX[p.lv-1],hpv:HPMAX[p.lv-1],down:false,shake:0,bob:Math.random()*6});world.add(g);players.push(g);return g;}
function loadScene(key){current=key;clearWorld();players=[];boss=null;baseDecos=[];env=ENV[key]();
 if(key!=='dino'){sun.color.set(0xfff6e0);}if(key!=='space')sun.intensity=1.5;
 teamSite=teamSite.map((v,i)=>i<env.sites.length?v:i);buildTeams();overview();
 document.querySelectorAll('.sc button').forEach(b=>b.classList.toggle('sel',b.dataset.s===key));
 const names={jungle:'🌴 Jungle Safari',dino:'🌋 Dino Valley',space:'🪐 Solar System',town:'🏙️ Hsinchu'};document.getElementById('title').textContent=names[key];}
/* every team lives at the base it picked: flag + coloured name sign at the site, players arranged around it */
function buildTeams(){players.forEach(g=>world.remove(g));players=[];baseDecos.forEach(d=>world.remove(d));baseDecos=[];
 env.sites.forEach(st=>{st.sign.userData.lab.visible=true;if(st.claim)st.claim(null);});
 for(let i=0;i<teamCount;i++){const t=TEAMS[i],site=siteOf(env.sites,teamSite[i]);if(site.claim)site.claim(t);site.sign.userData.lab.visible=false;
  const deco=new THREE.Group();const f=flag(t.color);f.scale.setScalar(1.7);f.position.set(0,0,0);deco.add(f);const lab=bubbleSprite(t.name+' Base',t.css);lab.position.set(0,6.6,0);lab.scale.set(5.4,1.86,1);deco.add(lab);
  deco.position.set(site.x,site.yAt?site.yAt(0,0):site.y,site.z);world.add(deco);baseDecos.push(deco);
  const mine=ROSTER.filter((p,k)=>k%teamCount===i);mine.forEach((p,k)=>makePlayer(Object.assign({},p,{team:i}),site,k,mine.length));}
 players.forEach(g=>setHp(g,g.userData.hp0));if(boss){world.add(boss);}renderHud();}
function setTeamCount(n){teamCount=Math.max(2,Math.min(TEAM_DEFS.length,n));const used=new Set();teamSite=teamSite.map((v,i)=>{let s=v%env.sites.length;while(used.has(s))s=(s+1)%env.sites.length;used.add(s);return s;});buildTeams();}
function chooseSite(team,siteIdx){const other=teamSite.findIndex((v,i)=>i<teamCount&&i!==team&&v===siteIdx);if(other>=0)teamSite[other]=teamSite[team];teamSite[team]=siteIdx;buildTeams();focusSite(env.sites[siteIdx]);banner(TEAMS[team].name+' → '+env.sites[siteIdx].name,TEAMS[team].css);}
function renderHud(){const tc=document.getElementById('tcards');if(tc)tc.innerHTML=TEAMS.slice(0,teamCount).map((t,i)=>`<div class="tcard" style="--tc:${t.css};cursor:pointer;pointer-events:auto" title="Zoom to this base"><b>${t.name} Team</b><small>${siteOf(env.sites,teamSite[i]).name}</small><div class="bar"><i id="hp${i}" style="width:100%"></i></div></div>`).join('');
 const b=document.getElementById('bases');if(b)b.innerHTML=`<div class="row"><b>Teams</b>${[2,3,4].map(n=>`<button data-n="${n}" class="${n===teamCount?'sel':''}" style="--tc:#3b5bdb">${n}</button>`).join('')}<button data-ov="1" style="--tc:#1f8a4c">🌍 Overview</button></div>`+TEAMS.slice(0,teamCount).map((t,i)=>`<div class="row" style="--tc:${t.css}"><span class="chip">${t.name}</span>${env.sites.map((st,k)=>{const owner=teamSite.findIndex((v,j)=>j<teamCount&&v===k);return `<button data-t="${i}" data-k="${k}" class="${owner===i?'sel':owner>=0?'taken':''}">${st.name}</button>`;}).join('')}</div>`).join('');
 TEAMS.slice(0,teamCount).forEach((t,i)=>setTeamBar(i));}
function setTeamBar(i){const ps=players.filter(q=>q.userData.p.team===i);const pct=ps.reduce((a,q)=>a+q.userData.hpv,0)/Math.max(1,ps.reduce((a,q)=>a+q.userData.hp0,0));const el=document.getElementById('hp'+i);if(el)el.style.width=Math.round(pct*100)+'%';}
function setHp(g,v){g.userData.hpv=Math.max(0,Math.min(g.userData.hp0,v));g.userData.hp.userData.draw(g.userData.hpv/g.userData.hp0);
 setTeamBar(g.userData.p.team);}
const GREY=M(0x9aa0a6,{roughness:.9});
function knockOut(g){g.userData.down=true;g.userData.hab.traverse(o=>{if(o.isMesh){o.userData.mat=o.material;o.material=GREY;}});animate(.6,k=>{g.userData.hab.scale.set(1+k*.2,1-k*.7,1+k*.2);g.userData.hab.rotation.z=k*.25;});const z=textSprite('💤',1.7);z.position.set(0,3,0);g.add(z);g.userData.zz=z;spawn(g.position.clone().setY(2.5),0xced4da,24,4,4,1.4);
 animate(.5,k=>{g.userData.ch.rotation.z=k*1.3;g.userData.ch.position.y=.5-k*.3;});}
function revive(g){if(!g.userData.down)return;g.userData.down=false;g.userData.hab.traverse(o=>{if(o.isMesh&&o.userData.mat)o.material=o.userData.mat;});g.userData.hab.scale.set(1,1,1);g.userData.hab.rotation.z=0;if(g.userData.zz){g.remove(g.userData.zz);g.userData.zz=null;}g.userData.ch.rotation.z=0;g.userData.ch.position.y=.5;setHp(g,Math.ceil(g.userData.hp0/2));spawn(g.position.clone().setY(3),0xffd43b,18,4,5,1);ring(g.position,0x51cf66);}
function jump(g){animate(.5,k=>{g.userData.ch.position.y=.5+Math.sin(k*Math.PI)*1.2;g.userData.ch.scale.setScalar(1.05*(1+Math.sin(k*Math.PI)*.15));});}
/* ---- attacks look different in every world: coconut lob (jungle), lava boulder (dino), laser bolts (space), water balloon (Hsinchu) ---- */
function landHit(to,dmg,color,extra){const b=to.position.clone().setY(2.6);spawn(b,color,70,11,9,2.2);spawn(b,0xffd43b,40,8,8,2);ring(to.position,color,14,1.8);setTimeout(()=>ring(to.position,0xffffff,10,1.4),250);const fl=mesh(SPH(1.5,10,8),GLOW(color,color,2,{transparent:true,opacity:.9}),b.x,b.y,b.z,false);scene.add(fl);animate(1.2,k=>{fl.scale.setScalar(1+k*5);fl.material.opacity=.9*(1-k);},()=>scene.remove(fl));extra&&extra(b);to.userData.shake=2;setHp(to,to.userData.hpv-dmg);shakeCam=1.4;if(to.userData.hpv<=0&&!to.userData.down){knockOut(to);setTimeout(()=>banner('KO!','#495057'),150);}}
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
function attack(from,to,dmg=3){jump(from);(ATTACKS[current]||ATTACKS.jungle)(from,to,dmg);}
function levelUp(g){const p=g.userData.p;if(p.lv>=3||g.userData.down)return false;const lv=p.lv;p.lv=lv+1;const old=g.userData.hab;jump(g);
 animate(.7,k=>{old.rotation.y=k*12;old.scale.setScalar(1-k*.9);old.position.y=.5+k*2.5;},()=>{g.remove(old);const h=habFor(p);h.position.y=.5;h.scale.setScalar(.01);g.add(h);g.userData.hab=h;g.userData.hp0=HPMAX[lv];setHp(g,HPMAX[lv]);spawn(g.position.clone().setY(3),0xffd43b,44,6,8,1.5);spawn(g.position.clone().setY(3),0xffffff,20,5,6,1.2);ring(g.position,0xffd43b);banner('LEVEL UP!','#f08c00');
  animate(1,k=>{const s=k<.6?k/.6*1.3:1.3-(k-.6)/.4*.3;h.scale.setScalar(Math.max(.01,s));h.rotation.y=(1-k)*6;});});return true;}
const BOSS_NAME={jungle:'Jungle Giant',dino:'Lava Dragon',space:'Galaxy Monster',town:'Grumpy Ogre'};
function summonBoss(){if(boss)return;boss=BOSS[current]();const bp=env.bossAt||{x:0,z:-9};boss.position.set(bp.x,1.2,bp.z);boss.scale.setScalar(.01);boss.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});world.add(boss);banner('BOSS BATTLE!','#7048e8');
 animate(.8,k=>{boss.scale.setScalar(Math.min(1.3,k*1.4));},()=>{animate(.3,k=>boss.scale.setScalar(1.3-k*.3));spawn(boss.position.clone().setY(1.5),0x9775fa,44,8,6,1.3);ring(boss.position,0x9775fa);shakeCam=1;setTimeout(bossAttack,900);});}
function bossAttack(){if(!boss)return;const alive=players.filter(p=>!p.userData.down);if(!alive.length)return;const target=alive[Math.floor(Math.random()*alive.length)];animate(.5,k=>{boss.scale.setScalar(1+Math.sin(k*Math.PI)*.25);boss.rotation.z=Math.sin(k*Math.PI*2)*.15;},()=>{const a=boss.position.clone().setY(5),b=target.position.clone().setY(2.6);const f=mesh(SPH(.6,14,10),GLOW(0xff6b6b,0xff922b,1));f.position.copy(a);scene.add(f);animate(.8,k=>{f.position.lerpVectors(a,b,k);f.position.y+=Math.sin(k*Math.PI)*5;f.scale.setScalar(1+Math.sin(k*20)*.15);},()=>{scene.remove(f);spawn(b,0xff6b6b,26,7,6,1);ring(target.position,0xff6b6b);target.userData.shake=1;setHp(target,target.userData.hpv-2);shakeCam=.8;if(target.userData.hpv<=0&&!target.userData.down)knockOut(target);});});}
function resetAll(){players.forEach(g=>{revive(g);setHp(g,g.userData.hp0);});if(boss){world.remove(boss);boss=null;}}
document.querySelector('.ctr').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.a;
 if(a==='attack'){const ti=Math.floor(Math.random()*teamCount),tj=(ti+1+Math.floor(Math.random()*(teamCount-1)))%teamCount;const A=players.filter(p=>p.userData.p.team===ti&&!p.userData.down),B=players.filter(p=>p.userData.p.team===tj&&!p.userData.down);if(!A.length||!B.length)return;const from=A[Math.floor(Math.random()*A.length)];const to=B.sort((x,y)=>y.userData.hpv-x.userData.hpv)[0];attack(from,to,3);banner('ACTION!',TEAMS[ti].css);}
 if(a==='level'){const c=players.filter(p=>p.userData.p.lv<3&&!p.userData.down);if(c.length)levelUp(c[Math.floor(Math.random()*c.length)]);}
 if(a==='heal'){const c=players.filter(p=>p.userData.down||p.userData.hpv<p.userData.hp0);if(!c.length)return;const g=c[Math.floor(Math.random()*c.length)];if(g.userData.down)revive(g);else{setHp(g,g.userData.hpv+4);spawn(g.position.clone().setY(3),0x69db7c,16,4,5,1);ring(g.position,0x51cf66);}}
 if(a==='boss')summonBoss();if(a==='reset')resetAll();if(a==='cheer')players.forEach((g,i)=>setTimeout(()=>jump(g),i*120));});
document.querySelector('.sc').addEventListener('click',e=>{const b=e.target.closest('button');if(b&&ENV[b.dataset.s])loadScene(b.dataset.s);});
document.getElementById('bases').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.ov)overview();else if(b.dataset.n)setTeamCount(+b.dataset.n);else chooseSite(+b.dataset.t,+b.dataset.k);});
document.getElementById('tcards').addEventListener('click',e=>{const c=e.target.closest('.tcard');if(!c)return;const i=[...c.parentNode.children].indexOf(c);focusSite(siteOf(env.sites,teamSite[i]));});
/* camera: orbit, drag, pinch */
let theta=.5,phi=.5,radius=64,shakeCam=0,auto=true,idle=0;const ptrs=new Map();let pinch0=0,rad0=0;
const target=new THREE.Vector3(0,2,0);const camGoal={t:new THREE.Vector3(0,2,0),r:64,phi:.5};
/* panorama → zoom: the whole world first, then fly to a base when it is chosen */
function overview(){const v=(env&&env.view)||{};camGoal.t.set(v.x||0,v.y??2,v.z||0);camGoal.r=v.r||64;camGoal.phi=v.phi||.5;}
function focusSite(site){if(!site)return;camGoal.t.set(site.x,(site.yAt?site.yAt(0,0):site.y)+1.5,site.z);camGoal.r=(env&&env.focusR)||30;camGoal.phi=.42;}
stage.addEventListener('pointerdown',e=>{ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});auto=false;idle=0;camGoal.r=radius;camGoal.phi=phi;if(ptrs.size===2){const[a,b]=[...ptrs.values()];pinch0=Math.hypot(a.x-b.x,a.y-b.y);rad0=radius;}});
const endPtr=e=>ptrs.delete(e.pointerId);addEventListener('pointerup',endPtr);addEventListener('pointercancel',endPtr);
addEventListener('pointermove',e=>{const p=ptrs.get(e.pointerId);if(!p)return;if(ptrs.size===1){theta-=(e.clientX-p.x)*.006;phi=Math.max(.2,Math.min(1.05,phi+(e.clientY-p.y)*.004));camGoal.phi=phi;}p.x=e.clientX;p.y=e.clientY;if(ptrs.size===2){const[a,b]=[...ptrs.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch0){radius=Math.max(16,Math.min(190,rad0*pinch0/d));camGoal.r=radius;}}});
stage.addEventListener('wheel',e=>{radius=Math.max(16,Math.min(190,radius+e.deltaY*.05));camGoal.r=radius;},{passive:true});
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
addEventListener('resize',resize);resize();
/* loop */
const clock=new THREE.Clock();
function loop(){requestAnimationFrame(loop);const dt=Math.min(.05,clock.getDelta()),t=clock.elapsedTime;
 if(!ptrs.size){idle+=dt;if(idle>5)auto=true;}if(auto&&!RM)theta+=dt*.07;
 const kk=1-Math.exp(-3*dt);target.lerp(camGoal.t,kk);radius+=(camGoal.r-radius)*kk;phi+=(camGoal.phi-phi)*kk;
 const sh=shakeCam>0?(shakeCam-=dt*1.6,Math.sin(t*60)*shakeCam*.35):0;
 camera.position.set(target.x+Math.sin(theta)*Math.cos(phi)*radius,target.y+Math.sin(phi)*radius+sh,target.z+Math.cos(theta)*Math.cos(phi)*radius);camera.lookAt(target);
 if(!RM){envAnim.trees.forEach(p=>{p.rotation.z=Math.sin(t*1.1+p.userData.sway)*.025;p.rotation.x=Math.cos(t*.9+p.userData.sway)*.02;});
  envAnim.clouds.forEach(c=>{c.position.x+=c.userData.v*dt;if(c.position.x>130)c.position.x=-130;});envAnim.extra.forEach(o=>{if(o.userData&&o.userData.ph!=null&&o.position)o.position.y=.1+Math.sin(t*1.3+o.userData.ph)*.12;});envAnim.coins.forEach(c=>{c.rotation.y=t*2.5+c.userData.ph;c.position.y+=Math.sin(t*2+c.userData.ph)*.004;});
  if(env&&env.tick)env.tick(dt,t);
  players.forEach(g=>{const u=g.userData;if(!u.down){u.hab.position.y=.5+Math.sin(t*1.6+u.bob)*.05;const ch=u.ch;if(!anims.some(a=>a.g===g)){ch.position.y=.5+Math.abs(Math.sin(t*2.4+u.bob))*.18;}u.lab.position.y=4.9+Math.sin(t*2+u.bob)*.12;ch.rotation.y=.35+Math.sin(t*.8+u.bob)*.25;if(ch.userData.head)ch.userData.head.rotation.z=Math.sin(t*1.7+u.bob)*.08;ch.traverse(o=>{if(o.userData.flame)o.scale.y=1+Math.sin(t*25+o.position.x*9)*.4;});}
   const cl=u.flag.userData.cloth,pa=cl.geometry.attributes.position.array,ba=cl.userData.base;for(let i=0;i<pa.length;i+=3){pa[i+2]=Math.sin(t*5+ba[i]*3)*.12*ba[i];}cl.geometry.attributes.position.needsUpdate=true;
   if(u.shake>0){u.shake-=dt*2.2;g.rotation.z=Math.sin(t*50)*u.shake*.12;g.rotation.x=Math.cos(t*47)*u.shake*.08;}else{g.rotation.z=0;g.rotation.x=0;}});
  if(boss){boss.position.y=1.2+Math.abs(Math.sin(t*2))*.25;boss.rotation.y=Math.sin(t*.8)*.25;}}
 for(let i=anims.length-1;i>=0;i--){const a=anims[i];a.t+=dt;const k=Math.min(1,a.t/a.dur);a.fn(k);if(k>=1){anims.splice(i,1);a.done&&a.done();}}
 for(let i=parts.length-1;i>=0;i--){const o=parts[i],u=o.userData;u.life-=dt;if(u.life<=0||o.position.y<-4){scene.remove(o);parts.splice(i,1);continue;}u.v.y-=(u.g??18)*dt;o.position.addScaledVector(u.v,dt);o.rotation.x+=u.rot.x*dt;o.rotation.y+=u.rot.y*dt;o.scale.setScalar(Math.min(1,u.life*2));}
 renderer.render(scene,camera);}
loadScene('jungle');loop();
