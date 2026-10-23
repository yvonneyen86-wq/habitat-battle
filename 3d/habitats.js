/* ===== habitats: HAB[class][level-1]() -> Group (base at y=0) ===== */
/* LEAF palette lives in scenes.js */
function canopy(g,list){list.forEach(([x,y,z,r],i)=>{const b=mesh(SPH(1,24,16),M(LEAF[i%3],{roughness:.7}),x,y,z);b.scale.setScalar(r);g.add(b);});}
function window_(g,x,y,z,w=.6,h=.6){g.add(mesh(BOX(w,h,.12),GLOW(0xfff3bf,0xffd43b,.9),x,y,z));}
const HAB={
 animal:[
  ()=>{const g=new THREE.Group();const n=mesh(new THREE.TorusGeometry(1.05,.48,16,32),M(0xd9a35c,{roughness:.9}));n.rotation.x=Math.PI/2;n.position.y=.45;g.add(n);g.add(mesh(CYL(1,.7,.4,24),M(0xb98a4a,{roughness:.9}),0,.2,0));
   for(let i=0;i<10;i++){const s=mesh(CYL(.05,.05,1.4,6),M(0xf2c078),Math.cos(i*.63)*1.1,.45,Math.sin(i*.63)*1.1);s.rotation.z=Math.cos(i)*1.2;s.rotation.x=Math.sin(i)*1.2;g.add(s);}
   [[0xa5d8ff,0],[0xffd6e0,2.1],[0xfff3bf,4.2]].forEach(([c,a])=>{const e=mesh(SPH(.36),GLOSS(c),Math.cos(a)*.38,.78,Math.sin(a)*.38);e.scale.y=1.3;g.add(e);});return g;},
  ()=>{const g=new THREE.Group();g.add(mesh(SPH(1.6,28,18,0,6.28,0,1.65),M(0xa9794e,{roughness:.8})));const door=mesh(CYL(.55,.55,.5,20),M(0x3b2416),0,.55,1.4);door.rotation.x=Math.PI/2;g.add(door);
   g.add(mesh(CONE(1.95,1.1,28),GLOSS(0xffb703),0,1.75,0));g.add(mesh(SPH(.22),GLOSS(0xff6b6b),0,2.35,0));for(let i=0;i<7;i++)g.add(mesh(SPH(.26,12,8),M(0x8a6a4a),Math.cos(i*.9)*1.62,.18,Math.sin(i*.9)*1.62));
   g.add(mesh(SPH(.3,14,10),GLOW(0xfff3bf,0xffd43b),1.05,1.15,1.15));return g;},
  ()=>{const g=new THREE.Group();g.add(mesh(CYL(.5,.75,3.4,16),GLOSS(0x9a5f2e),0,1.7,0));canopy(g,[[0,4.5,0,2.3],[1.5,3.8,.7,1.5],[-1.4,4.1,-.6,1.45],[.4,5.9,-.4,1.4]]);
   g.add(mesh(BOX(2,1.5,1.8),GLOSS(0xffd8a8),0,3.1,1.1));const roof=mesh(CONE(1.75,1.1,4),GLOSS(0xe03131),0,4.35,1.1);roof.rotation.y=Math.PI/4;g.add(roof);window_(g,.35,3.2,2.02);g.add(mesh(BOX(.5,.9,.1),GLOSS(0x9a5f2e),-.5,2.8,2.02));
   for(let i=0;i<5;i++)g.add(mesh(BOX(.75,.1,.3),GLOSS(0xffe08a),.9,.5+i*.5,1.95-i*.08));g.add(mesh(CYL(.06,.06,2.9,8),GLOSS(0xfff6e0),.55,1.6,2));g.add(mesh(CYL(.06,.06,2.9,8),GLOSS(0xfff6e0),1.25,1.6,2));return g;}],
 dino:[
  ()=>{const g=new THREE.Group();g.add(mesh(CYL(1.3,1.1,.5,24),M(0xc98a4e,{roughness:.9}),0,.25,0));for(let i=0;i<9;i++)g.add(mesh(SPH(.3,10,8),M(0x9aa5a0,{roughness:.9}),Math.cos(i*.7)*1.3,.5,Math.sin(i*.7)*1.3));
   [[0xd3f9d8,0,.5],[0xfff3bf,2.1,.45],[0xd0ebff,4.2,.48]].forEach(([c,a,r])=>{const e=mesh(SPH(r,20,14),GLOSS(c),Math.cos(a)*.55,.5+r*.9,Math.sin(a)*.55);e.scale.y=1.3;g.add(e);for(let k=0;k<3;k++)g.add(mesh(SPH(.08,8,6),GLOSS(0x69db7c),Math.cos(a)*.55+Math.cos(k*2)*r*.6,.6+r*.9+Math.sin(k)*r*.4,Math.sin(a)*.55+Math.sin(k*2)*r*.6));});return g;},
  ()=>{const g=new THREE.Group();const rock=M(0x8d8f8a,{roughness:.95});g.add(tw(mesh(SPH(1.8,20,14),rock,0,.9,0),o=>o.scale.set(1.2,.9,1)));g.add(mesh(SPH(1.1,16,12),rock,1.4,.7,.5));g.add(mesh(SPH(.9,16,12),rock,-1.5,.6,-.3));
   const cave=mesh(CYL(.7,.7,.8,20),M(0x1f1a17),0,.75,1.6);cave.rotation.x=Math.PI/2;g.add(cave);g.add(mesh(SPH(.25,12,8),GLOW(0xff922b,0xff6b35,1.2),0,.5,1.5));for(let i=0;i<3;i++)g.add(mesh(CONE(.18,.6,6),GLOSS(0xfff6e0),-.8+i*.8,2.2,.4));return g;},
  ()=>{const g=new THREE.Group();g.add(mesh(lathe([[0,0],[2.4,0],[2,1.6],[1.4,3.2],[1.1,3.6],[0,3.6]],28),M(0x7d4a2b,{roughness:.9})));g.add(mesh(CYL(1.1,1.1,.3,24),GLOW(0xff922b,0xff5c1a,1.4),0,3.6,0));
   g.add(mesh(SPH(.5,14,10),GLOW(0xffd43b,0xff922b,1.2),0,3.9,0));for(let i=0;i<4;i++){const l=mesh(SPH(.3,10,8),GLOW(0xff6b35,0xff5c1a,1.2),Math.cos(i*1.6)*1.1,3.4-i*.3,Math.sin(i*1.6)*1.1);l.scale.set(1,1.8,.5);g.add(l);}
   const door=mesh(CYL(.55,.55,.6,18),M(0x2b1d12),0,.6,2.1);door.rotation.x=Math.PI/2;g.add(door);g.add(mesh(BOX(1,.6,.8),GLOSS(0xffd43b),1.6,.3,1.4));g.add(mesh(CONE(.3,.7,6),GLOSS(0xfff6e0),-1.7,.35,1.2));return g;}],
 space:[
  ()=>{const g=new THREE.Group();g.add(mesh(SPH(1.1,24,18),GLOSS(0xdee2e6,{metalness:.4,roughness:.3}),0,1.1,0));g.add(mesh(SPH(.6,18,12),new THREE.MeshStandardMaterial({color:0xa5d8ff,transparent:true,opacity:.6,roughness:.1}),0,1.3,.85));
   for(let i=0;i<3;i++){const a=i/3*6.28;g.add(tw(mesh(CYL(.1,.1,1.2,8),GLOSS(0x868e96),Math.cos(a)*1,.5,Math.sin(a)*1),o=>o.rotation.set(Math.sin(a)*.5,0,-Math.cos(a)*.5)));g.add(mesh(SPH(.2,10,8),GLOSS(0x868e96),Math.cos(a)*1.3,.1,Math.sin(a)*1.3));}
   g.add(mesh(SPH(.15,10,8),GLOW(0x51cf66,0x40c057,1.3),0,2.3,0));g.add(mesh(CYL(.04,.04,.5,6),GLOSS(0x868e96),0,2,0));return g;},
  ()=>{const g=new THREE.Group();const dome=mesh(SPH(1.7,28,18,0,6.28,0,1.57),new THREE.MeshStandardMaterial({color:0xd0ebff,transparent:true,opacity:.55,roughness:.1,metalness:.1}),0,.4,0);dome.castShadow=false;g.add(dome);
   g.add(mesh(CYL(1.8,1.9,.4,32),GLOSS(0xadb5bd,{metalness:.5,roughness:.3}),0,.2,0));g.add(mesh(BOX(1.2,.9,1),GLOSS(0xf8f9fa),0,.85,0));window_(g,0,.9,.52,.5,.4);g.add(tw(mesh(CYL(.5,.5,1,12),GLOSS(0xadb5bd,{metalness:.5}),1.2,.8,1.2),o=>o.rotation.x=Math.PI/2));
   g.add(mesh(CYL(.08,.08,2.2,8),GLOSS(0x868e96),-1.2,1.5,-.6));g.add(mesh(new THREE.TorusGeometry(.5,.05,8,24),GLOSS(0xff6b6b),-1.2,2.6,-.6));g.add(tw(mesh(BOX(1,.1,.7),GLOW(0x4dabf7,0x1c7ed6,1),1.2,1.4,-.8),o=>o.rotation.x=-.6));return g;},
  ()=>{const g=new THREE.Group();const met=GLOSS(0xdee2e6,{metalness:.5,roughness:.3});g.add(mesh(CYL(.6,.6,3.6,20),met,0,1.8,0));g.add(tw(mesh(new THREE.TorusGeometry(1.9,.35,14,40),met,0,2.6,0),o=>o.rotation.x=Math.PI/2));
   for(let i=0;i<4;i++){const a=i/4*6.28;g.add(mesh(BOX(.5,.25,.5),GLOW(0x4dabf7,0x1c7ed6,1),Math.cos(a)*1.9,2.95,Math.sin(a)*1.9));g.add(tw(mesh(CYL(.06,.06,1.9,6),met,Math.cos(a)*.95,2.6,Math.sin(a)*.95),o=>o.rotation.set(0,-a,Math.PI/2)));}
   g.add(mesh(SPH(.9,22,16),met,0,4.1,0));window_(g,0,4.1,.86,.5,.35);g.add(mesh(BOX(2.6,.08,1),GLOW(0x1e3a8a,0x4dabf7,.6),0,4.9,0));g.add(mesh(CYL(.05,.05,.8,6),met,0,5.3,0));g.add(mesh(SPH(.14,10,8),GLOW(0xff6b6b,0xff6b6b,1.4),0,5.75,0));
   for(let i=0;i<3;i++){const a=i/3*6.28;g.add(tw(mesh(CYL(.12,.12,1.4,8),met,Math.cos(a)*.8,.6,Math.sin(a)*.8),o=>o.rotation.set(Math.sin(a)*.4,0,-Math.cos(a)*.4)));}return g;}],
 hero:[
  ()=>{const g=new THREE.Group();const t=mesh(CONE(1.5,1.9,4),GLOSS(0xff922b),0,.95,0);t.rotation.y=Math.PI/4;g.add(t);g.add(tw(mesh(CONE(1.52,.8,4),GLOSS(0xfff6e0),0,1.5,0),o=>o.rotation.y=Math.PI/4));
   const door=mesh(CONE(.6,1.2,3),M(0x3b2416),0,.6,1.05);door.rotation.y=Math.PI;g.add(door);g.add(mesh(CYL(.04,.04,2.4,6),GLOSS(0x8d6e4a),0,1.2,0));g.add(mesh(BOX(.5,.3,.05),GLOSS(0xe03131),.25,2.3,0));
   for(let i=0;i<5;i++)g.add(mesh(SPH(.18,8,6),M(0x8d8f8a),1.6+Math.cos(i*1.3)*.4,.15,1+Math.sin(i*1.3)*.4));g.add(mesh(CONE(.25,.6,8),GLOW(0xff922b,0xff5c1a,1.4),1.6,.45,1));return g;},
  ()=>{const g=new THREE.Group();g.add(mesh(BOX(2.4,1.8,2),GLOSS(0xffd8a8),0,.9,0));const roof=mesh(CONE(2,1.2,4),GLOSS(0xe03131),0,2.4,0);roof.rotation.y=Math.PI/4;g.add(roof);g.add(mesh(BOX(.6,1,.12),GLOSS(0x9a5f2e),0,.5,1.02));
   window_(g,-.75,1.1,1.02);window_(g,.75,1.1,1.02);g.add(mesh(BOX(.4,.7,.4),GLOSS(0xadb5bd),.7,2.9,-.3));g.add(mesh(BOX(2.8,.15,.8),GLOSS(0xfff6e0),0,.05,1.4));for(let i=0;i<3;i++)g.add(mesh(SPH(.22,10,8),GLOSS([0xff6b6b,0xffd43b,0xff8fb8][i]),-1+i*1,.3,1.5));return g;},
  ()=>{const g=new THREE.Group();g.add(mesh(CYL(1.3,1.5,3.6,24),GLOSS(0xf1f3f5),0,1.8,0));g.add(mesh(CYL(1.6,1.6,.5,24),GLOSS(0x4dabf7),0,3.85,0));for(let i=0;i<8;i++){const a=i/8*6.28;g.add(mesh(BOX(.5,.5,.5),GLOSS(0x4dabf7),Math.cos(a)*1.45,4.35,Math.sin(a)*1.45));}
   for(let i=0;i<3;i++){const a=i/3*6.28;window_(g,Math.cos(a)*1.32,2.4,Math.sin(a)*1.32,.45,.7);g.children[g.children.length-1].rotation.y=-a;}g.add(mesh(BOX(.8,1.2,.12),GLOSS(0x9a5f2e),0,.6,1.45));
   g.add(mesh(CYL(.05,.05,2,6),GLOSS(0xffd43b),0,5.1,0));g.add(mesh(BOX(1,.6,.05),GLOSS(0xe03131),.5,5.8,0));g.add(mesh(new THREE.OctahedronGeometry(.4),GLOW(0xffd43b,0xffd43b,1),0,4.9,0));return g;}]
};
/* ===== bosses ===== */
function bossFur(c){return M(c,{roughness:.85});}
const BOSS={
 jungle(){const g=new THREE.Group();const fur=bossFur(0x4a3b8f),fur2=bossFur(0x3a2d73),skin=GLOSS(0xb9a5e8);const body=mesh(SPH(2.4,28,20),fur,0,2.8,0);body.scale.set(1,1.1,.9);g.add(body);g.add(mesh(SPH(1.5,24,16),fur2,0,5.2,.4));g.add(tw(mesh(SPH(1,20,14),skin,0,4.8,1.5),o=>o.scale.set(1.3,.9,.7)));
  for(const s of[-1,1]){g.add(mesh(SPH(.3,14,10),EYE_W,s*.5,5.45,1.6));g.add(mesh(SPH(.14,10,8),EYE_B,s*.5,5.45,1.85));g.add(mesh(SPH(.45,14,10),fur2,s*1.5,6.1,.3));const arm=mesh(CYL(.55,.75,3.6,16),fur,s*2.8,2.6,.6);arm.rotation.z=s*.35;g.add(arm);g.add(mesh(SPH(.9,18,12),fur2,s*3.45,.75,1));g.add(mesh(CYL(.65,.75,1.7,16),fur2,s*1.2,.85,0));}
  g.add(tw(mesh(SPH(1.4,20,14),skin,0,2.6,1.4),o=>o.scale.set(1.2,1.3,.6)));for(const s of[-1,1])g.add(tw(mesh(CONE(.25,.8,10),EYE_W,s*.5,4.3,1.9),o=>o.rotation.x=Math.PI));return g;},
 dino(){const g=new THREE.Group();const sc=GLOSS(0xe03131),belly=GLOSS(0xffb703);const body=mesh(SPH(2.3,28,20),sc,0,2.8,0);body.scale.set(1,1.1,1.2);g.add(body);g.add(tw(mesh(SPH(1.5,22,16),belly,0,2.4,1.5),o=>o.scale.set(1,1.3,.6)));
  const neck=mesh(CYL(.8,1.1,2.4,18),sc,0,4.8,.6);neck.rotation.x=-.4;g.add(neck);const head=mesh(SPH(1.3,22,16),sc,0,6.2,1.6);head.scale.set(1,.9,1.3);g.add(head);for(const s of[-1,1]){g.add(mesh(SPH(.28,14,10),GLOW(0xffd43b,0xff922b,1),s*.6,6.5,2.5));g.add(mesh(SPH(.12,10,8),EYE_B,s*.6,6.5,2.75));g.add(tw(mesh(CONE(.3,1,8),GLOSS(0xffd43b),s*.6,7.2,1.2),o=>o.rotation.x=-.4));
   const w=mesh(CONE(1.2,2.6,3),GLOSS(0xb02020),s*2.2,4.2,-.6);w.rotation.z=s*-1.2;w.scale.z=.25;g.add(w);g.add(mesh(CYL(.6,.8,1.8,14),sc,s*1.4,.9,.2));}
  for(let i=0;i<6;i++)g.add(tw(mesh(CONE(.35,.9,6),GLOSS(0xffd43b),0,4.6-i*.5,-1.2-i*.6),o=>o.rotation.x=-1.4));for(let i=0;i<4;i++)g.add(tw(mesh(CONE(.12,.5,6),EYE_W,-.45+i*.3,5.6,2.6),o=>o.rotation.x=Math.PI));g.add(mesh(SPH(.5,12,8),GLOW(0xff922b,0xff5c1a,1.5),0,5.7,2.9));return g;},
 space(){const g=new THREE.Group();const sl=GLOSS(0x51cf66),dk=GLOSS(0x2b8a3e);const body=mesh(SPH(2.6,28,20),sl,0,3.2,0);body.scale.set(1.1,1,1);g.add(body);const eye=mesh(SPH(1.1,22,16),EYE_W,0,3.6,2);g.add(eye);g.add(mesh(SPH(.6,16,12),GLOSS(0x7048e8),0,3.6,2.8));g.add(mesh(SPH(.3,12,8),EYE_B,0,3.6,3.2));
  for(let i=0;i<8;i++){const a=i/8*6.28;const t=mesh(CYL(.35,.15,3,10),dk,Math.cos(a)*2.4,1.2,Math.sin(a)*2.4);t.rotation.set(Math.sin(a)*.7,0,-Math.cos(a)*.7);g.add(t);g.add(mesh(SPH(.3,10,8),GLOW(0xd3f9d8,0x69db7c,1),Math.cos(a)*3.4,.4,Math.sin(a)*3.4));}
  for(let i=0;i<5;i++)g.add(tw(mesh(CONE(.25,.7,6),EYE_W,-.8+i*.4,2.1,2.3),o=>o.rotation.x=Math.PI));for(const s of[-1,1]){g.add(tw(mesh(CYL(.08,.08,1.6,6),dk,s*1,6,0),o=>o.rotation.z=s*-.5));g.add(mesh(SPH(.3,12,8),GLOW(0xffd43b,0xffd43b,1.2),s*1.4,6.7,0));}return g;},
 town(){const g=new THREE.Group();const sk=GLOSS(0x74b816),dk=GLOSS(0x5c940d);const body=mesh(SPH(2.4,28,20),sk,0,2.8,0);body.scale.set(1.1,1.15,1);g.add(body);g.add(tw(mesh(SPH(1.8,24,16),GLOSS(0x8d6e4a),0,2.2,.9),o=>o.scale.set(1.1,1.1,.7)));
  g.add(mesh(SPH(1.5,22,16),sk,0,5.4,.3));g.add(tw(mesh(SPH(.7,16,12),dk,0,5.2,1.5),o=>o.scale.set(1.2,.8,1)));for(const s of[-1,1]){g.add(mesh(SPH(.32,14,10),EYE_W,s*.55,5.8,1.5));g.add(mesh(SPH(.14,10,8),EYE_B,s*.55,5.8,1.78));g.add(tw(mesh(CONE(.3,.9,8),GLOSS(0xfff6e0),s*1.2,6.2,.4),o=>o.rotation.z=s*-.5));
   const arm=mesh(CYL(.55,.7,3.4,14),sk,s*2.7,2.8,.4);arm.rotation.z=s*.4;g.add(arm);g.add(mesh(SPH(.85,16,12),sk,s*3.3,1,.8));g.add(mesh(CYL(.7,.8,1.6,14),dk,s*1.2,.8,0));}
  for(const s of[-1,1])g.add(mesh(CONE(.2,.6,6),EYE_W,s*.5,4.6,1.9));const club=mesh(CYL(.25,.55,3.2,10),GLOSS(0x8d6e4a),3.6,2.6,1.2);club.rotation.z=-.4;g.add(club);for(let i=0;i<5;i++)g.add(mesh(CONE(.12,.35,5),GLOSS(0xadb5bd),3.9+Math.cos(i*1.3)*.5,3.6+i*.25,1.2+Math.sin(i*1.3)*.5));return g;}
};
