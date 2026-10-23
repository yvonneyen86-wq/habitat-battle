/* ===== demo game layer ===== */
const TEAMS=[{name:'Red',color:0xe03131,css:'#e03131',bar:'hpR'},{name:'Blue',color:0x3b5bdb,css:'#3b5bdb',bar:'hpB'}];
const HPMAX=[10,15,20];
const ROSTER=[{name:'Amy',id:'lion',team:0,lv:2,dx:-2.8,dz:2.4},{name:'Cindy',id:'astro',team:0,lv:1,dx:2.6,dz:2.8},{name:'Emma',id:'panda',team:0,lv:3,dx:-.2,dz:-2.8},{name:'Leo',id:'wizard',team:0,lv:1,dx:3,dz:-1.6},
 {name:'Ben',id:'trex',team:1,lv:1,dx:-2.6,dz:-2.6},{name:'David',id:'chef',team:1,lv:3,dx:2.8,dz:-2.4},{name:'Frank',id:'alien',team:1,lv:2,dx:.2,dz:3},{name:'Zoe',id:'robot',team:1,lv:2,dx:-3,dz:1.4}];
const SCENE_CLASS={jungle:'animal',dino:'dino',space:'space',town:'hero'};
let players=[],env=null,boss=null,current='jungle';
function flag(color){const g=new THREE.Group();g.add(mesh(CYL(.07,.07,3,12),GLOSS(0xfff6e0),0,1.5,0));g.add(mesh(SPH(.16,12,8),GLOSS(0xffd43b),0,3.05,0));const geo=new THREE.PlaneGeometry(1.5,.95,10,3);geo.translate(.75,0,0);const f=new THREE.Mesh(geo,GLOSS(color,{side:THREE.DoubleSide}));f.position.set(0,2.5,0);f.castShadow=true;f.userData.base=geo.attributes.position.array.slice();g.add(f);g.userData.cloth=f;return g;}
function habFor(p){const cls=p.cls||CHAR_CLASS[p.id]||'animal';return HAB[cls][p.lv-1]();}
function makePlayer(p,pad){const g=new THREE.Group();const t=TEAMS[p.team];g.position.set(pad.x+p.dx,1.16,pad.z+p.dz);
 g.add(mesh(lathe([[0,.5],[2.4,.5],[2.75,.25],[2.8,0],[0,0]],32),M(current==='space'?0xc3c8de:current==='dino'?0xd9b36b:0x5fd45f,{roughness:.8}),0,0,0,false));
 const hab=habFor(p);hab.position.y=.5;g.add(hab);g.userData.hab=hab;
 const f=flag(t.color);f.position.set(2.1,.5,-.7);g.add(f);g.userData.flag=f;
 const ch=buildChar(p.id);ch.scale.setScalar(1.05);ch.position.set(-2.3,.5,2);ch.rotation.y=.4;g.add(ch);g.userData.ch=ch;
 const lab=bubbleSprite(p.name,t.css);lab.position.set(-2.3,4.9,2);g.add(lab);g.userData.lab=lab;const hp=hpSprite();hp.position.set(0,5.6,0);g.add(hp);g.userData.hp=hp;
 Object.assign(g.userData,{p,hp0:HPMAX[p.lv-1],hpv:HPMAX[p.lv-1],down:false,shake:0,bob:Math.random()*6});world.add(g);players.push(g);return g;}
function loadScene(key){current=key;clearWorld();players=[];boss=null;env=ENV[key]();
 if(key!=='dino'){sun.color.set(0xfff6e0);}if(key!=='space')sun.intensity=1.5;
 ROSTER.forEach(p=>makePlayer(Object.assign({},p,{lv:p.lv}),env.pads[p.team]));
 players.forEach(g=>setHp(g,g.userData.hp0));
 document.querySelectorAll('.sc button').forEach(b=>b.classList.toggle('sel',b.dataset.s===key));
 const names={jungle:'🌴 Jungle Safari',dino:'🌋 Dino Valley',space:'🪐 Space Quest',town:'🏙️ Hero Town'};document.getElementById('title').textContent=names[key];}
function setHp(g,v){g.userData.hpv=Math.max(0,Math.min(g.userData.hp0,v));g.userData.hp.userData.draw(g.userData.hpv/g.userData.hp0);
 TEAMS.forEach((t,i)=>{const ps=players.filter(q=>q.userData.p.team===i);const pct=ps.reduce((a,q)=>a+q.userData.hpv,0)/Math.max(1,ps.reduce((a,q)=>a+q.userData.hp0,0));document.getElementById(t.bar).style.width=Math.round(pct*100)+'%';});}
const GREY=M(0x9aa0a6,{roughness:.9});
function knockOut(g){g.userData.down=true;g.userData.hab.traverse(o=>{if(o.isMesh){o.userData.mat=o.material;o.material=GREY;}});animate(.6,k=>{g.userData.hab.scale.set(1+k*.2,1-k*.7,1+k*.2);g.userData.hab.rotation.z=k*.25;});const z=textSprite('💤',1.7);z.position.set(0,3,0);g.add(z);g.userData.zz=z;spawn(g.position.clone().setY(2.5),0xced4da,24,4,4,1.4);
 animate(.5,k=>{g.userData.ch.rotation.z=k*1.3;g.userData.ch.position.y=.5-k*.3;});}
function revive(g){if(!g.userData.down)return;g.userData.down=false;g.userData.hab.traverse(o=>{if(o.isMesh&&o.userData.mat)o.material=o.userData.mat;});g.userData.hab.scale.set(1,1,1);g.userData.hab.rotation.z=0;if(g.userData.zz){g.remove(g.userData.zz);g.userData.zz=null;}g.userData.ch.rotation.z=0;g.userData.ch.position.y=.5;setHp(g,Math.ceil(g.userData.hp0/2));spawn(g.position.clone().setY(3),0xffd43b,18,4,5,1);ring(g.position,0x51cf66);}
function jump(g){animate(.5,k=>{g.userData.ch.position.y=.5+Math.sin(k*Math.PI)*1.2;g.userData.ch.scale.setScalar(1.05*(1+Math.sin(k*Math.PI)*.15));});}
const PROJ={animal:[0x9a5f2e,'🥥'],dino:[0x8d8f8a,'🪨'],space:[0x74c0fc,'💫'],hero:[0x74d3ff,'💦']};
function attack(from,to,dmg=3){const cls=CHAR_CLASS[from.userData.p.id]||'animal';const a=from.position.clone().add(new THREE.Vector3(-2.3,2.8,2)),b=to.position.clone().setY(2.6);jump(from);
 const proj=mesh(SPH(.45,16,12),GLOW(PROJ[cls][0],PROJ[cls][0],.4));proj.position.copy(a);scene.add(proj);const trail=[];
 animate(.95,k=>{proj.position.lerpVectors(a,b,k);proj.position.y+=Math.sin(k*Math.PI)*8;proj.rotation.x+=.3;if(trail.length<30&&Math.random()<.6){const s=mesh(SPH(.12,6,5),GLOSS(0xffffff,{transparent:true,opacity:.8}),proj.position.x,proj.position.y,proj.position.z,false);scene.add(s);trail.push(s);}},
 ()=>{scene.remove(proj);trail.forEach(s=>scene.remove(s));spawn(b,0xff922b,28,7,6,1);spawn(b,0xffd43b,16,5,5,.9);ring(to.position,0xff922b);to.userData.shake=1;setHp(to,to.userData.hpv-dmg);shakeCam=.6;if(to.userData.hpv<=0&&!to.userData.down){knockOut(to);setTimeout(()=>banner('KO!','#495057'),150);}});}
function levelUp(g){const p=g.userData.p;if(p.lv>=3||g.userData.down)return false;const lv=p.lv;p.lv=lv+1;const old=g.userData.hab;jump(g);
 animate(.7,k=>{old.rotation.y=k*12;old.scale.setScalar(1-k*.9);old.position.y=.5+k*2.5;},()=>{g.remove(old);const h=habFor(p);h.position.y=.5;h.scale.setScalar(.01);g.add(h);g.userData.hab=h;g.userData.hp0=HPMAX[lv];setHp(g,HPMAX[lv]);spawn(g.position.clone().setY(3),0xffd43b,44,6,8,1.5);spawn(g.position.clone().setY(3),0xffffff,20,5,6,1.2);ring(g.position,0xffd43b);banner('LEVEL UP!','#f08c00');
  animate(1,k=>{const s=k<.6?k/.6*1.3:1.3-(k-.6)/.4*.3;h.scale.setScalar(Math.max(.01,s));h.rotation.y=(1-k)*6;});});return true;}
const BOSS_NAME={jungle:'Jungle Giant',dino:'Lava Dragon',space:'Galaxy Monster',town:'Grumpy Ogre'};
function summonBoss(){if(boss)return;boss=BOSS[current]();boss.position.set(0,1.2,-9);boss.scale.setScalar(.01);boss.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});world.add(boss);banner('BOSS BATTLE!','#7048e8');
 animate(.8,k=>{boss.scale.setScalar(Math.min(1.3,k*1.4));},()=>{animate(.3,k=>boss.scale.setScalar(1.3-k*.3));spawn(boss.position.clone().setY(1.5),0x9775fa,44,8,6,1.3);ring(boss.position,0x9775fa);shakeCam=1;setTimeout(bossAttack,900);});}
function bossAttack(){if(!boss)return;const alive=players.filter(p=>!p.userData.down);if(!alive.length)return;const target=alive[Math.floor(Math.random()*alive.length)];animate(.5,k=>{boss.scale.setScalar(1+Math.sin(k*Math.PI)*.25);boss.rotation.z=Math.sin(k*Math.PI*2)*.15;},()=>{const a=boss.position.clone().setY(5),b=target.position.clone().setY(2.6);const f=mesh(SPH(.6,14,10),GLOW(0xff6b6b,0xff922b,1));f.position.copy(a);scene.add(f);animate(.8,k=>{f.position.lerpVectors(a,b,k);f.position.y+=Math.sin(k*Math.PI)*5;f.scale.setScalar(1+Math.sin(k*20)*.15);},()=>{scene.remove(f);spawn(b,0xff6b6b,26,7,6,1);ring(target.position,0xff6b6b);target.userData.shake=1;setHp(target,target.userData.hpv-2);shakeCam=.8;if(target.userData.hpv<=0&&!target.userData.down)knockOut(target);});});}
function resetAll(){players.forEach(g=>{revive(g);setHp(g,g.userData.hp0);});if(boss){world.remove(boss);boss=null;}}
document.querySelector('.ctr').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.a;
 if(a==='attack'){const reds=players.filter(p=>p.userData.p.team===0&&!p.userData.down),blues=players.filter(p=>p.userData.p.team===1&&!p.userData.down);if(!reds.length||!blues.length)return;const from=reds[Math.floor(Math.random()*reds.length)];const to=blues.sort((x,y)=>y.userData.hpv-x.userData.hpv)[0];attack(from,to,3);banner('ACTION!','#e03131');}
 if(a==='level'){const c=players.filter(p=>p.userData.p.lv<3&&!p.userData.down);if(c.length)levelUp(c[Math.floor(Math.random()*c.length)]);}
 if(a==='heal'){const c=players.filter(p=>p.userData.down||p.userData.hpv<p.userData.hp0);if(!c.length)return;const g=c[Math.floor(Math.random()*c.length)];if(g.userData.down)revive(g);else{setHp(g,g.userData.hpv+4);spawn(g.position.clone().setY(3),0x69db7c,16,4,5,1);ring(g.position,0x51cf66);}}
 if(a==='boss')summonBoss();if(a==='reset')resetAll();if(a==='cheer')players.forEach((g,i)=>setTimeout(()=>jump(g),i*120));});
document.querySelector('.sc').addEventListener('click',e=>{const b=e.target.closest('button');if(b&&ENV[b.dataset.s])loadScene(b.dataset.s);});
/* camera: orbit, drag, pinch */
let theta=.5,phi=.4,radius=46,shakeCam=0,auto=true,idle=0;const ptrs=new Map();let pinch0=0,rad0=0;
const target=new THREE.Vector3(0,2,0);
stage.addEventListener('pointerdown',e=>{ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});auto=false;idle=0;if(ptrs.size===2){const[a,b]=[...ptrs.values()];pinch0=Math.hypot(a.x-b.x,a.y-b.y);rad0=radius;}});
const endPtr=e=>ptrs.delete(e.pointerId);addEventListener('pointerup',endPtr);addEventListener('pointercancel',endPtr);
addEventListener('pointermove',e=>{const p=ptrs.get(e.pointerId);if(!p)return;if(ptrs.size===1){theta-=(e.clientX-p.x)*.006;phi=Math.max(.2,Math.min(1.05,phi+(e.clientY-p.y)*.004));}p.x=e.clientX;p.y=e.clientY;if(ptrs.size===2){const[a,b]=[...ptrs.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch0)radius=Math.max(20,Math.min(90,rad0*pinch0/d));}});
stage.addEventListener('wheel',e=>{radius=Math.max(20,Math.min(90,radius+e.deltaY*.03));},{passive:true});
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
addEventListener('resize',resize);resize();
/* loop */
const clock=new THREE.Clock();
function loop(){requestAnimationFrame(loop);const dt=Math.min(.05,clock.getDelta()),t=clock.elapsedTime;
 if(!ptrs.size){idle+=dt;if(idle>5)auto=true;}if(auto&&!RM)theta+=dt*.07;
 const sh=shakeCam>0?(shakeCam-=dt*1.6,Math.sin(t*60)*shakeCam*.35):0;
 camera.position.set(target.x+Math.sin(theta)*Math.cos(phi)*radius,target.y+Math.sin(phi)*radius+sh,target.z+Math.cos(theta)*Math.cos(phi)*radius);camera.lookAt(target);
 if(!RM){envAnim.trees.forEach(p=>{p.rotation.z=Math.sin(t*1.1+p.userData.sway)*.025;p.rotation.x=Math.cos(t*.9+p.userData.sway)*.02;});
  envAnim.clouds.forEach(c=>{c.position.x+=c.userData.v*dt;if(c.position.x>60)c.position.x=-60;});envAnim.coins.forEach(c=>{c.rotation.y=t*2.5+c.userData.ph;c.position.y+=Math.sin(t*2+c.userData.ph)*.004;});
  if(env&&env.tick)env.tick(dt,t);
  players.forEach(g=>{const u=g.userData;if(!u.down){u.hab.position.y=.5+Math.sin(t*1.6+u.bob)*.05;const ch=u.ch;if(!anims.some(a=>a.g===g)){ch.position.y=.5+Math.abs(Math.sin(t*2.4+u.bob))*.18;}u.lab.position.y=4.9+Math.sin(t*2+u.bob)*.12;ch.rotation.y=.35+Math.sin(t*.8+u.bob)*.25;if(ch.userData.head)ch.userData.head.rotation.z=Math.sin(t*1.7+u.bob)*.08;ch.traverse(o=>{if(o.userData.flame)o.scale.y=1+Math.sin(t*25+o.position.x*9)*.4;});}
   const cl=u.flag.userData.cloth,pa=cl.geometry.attributes.position.array,ba=cl.userData.base;for(let i=0;i<pa.length;i+=3){pa[i+2]=Math.sin(t*5+ba[i]*3)*.12*ba[i];}cl.geometry.attributes.position.needsUpdate=true;
   if(u.shake>0){u.shake-=dt*2.2;g.rotation.z=Math.sin(t*50)*u.shake*.12;g.rotation.x=Math.cos(t*47)*u.shake*.08;}else{g.rotation.z=0;g.rotation.x=0;}});
  if(boss){boss.position.y=1.2+Math.abs(Math.sin(t*2))*.25;boss.rotation.y=Math.sin(t*.8)*.25;}}
 for(let i=anims.length-1;i>=0;i--){const a=anims[i];a.t+=dt;const k=Math.min(1,a.t/a.dur);a.fn(k);if(k>=1){anims.splice(i,1);a.done&&a.done();}}
 for(let i=parts.length-1;i>=0;i--){const o=parts[i],u=o.userData;u.life-=dt;if(u.life<=0||o.position.y<-4){scene.remove(o);parts.splice(i,1);continue;}u.v.y-=18*dt;o.position.addScaledVector(u.v,dt);o.rotation.x+=u.rot.x*dt;o.rotation.y+=u.rot.y*dt;o.scale.setScalar(Math.min(1,u.life*2));}
 renderer.render(scene,camera);}
loadScene('jungle');loop();
