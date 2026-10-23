/* ===== characters: low-poly diorama people (round head, hair cap, blocky body) ~2.7 units tall, facing +z ===== */
const EYE_W=GLOSS(0xffffff),EYE_B=GLOSS(0x1e1a18),BLUSH=M(0xff8fa3,{transparent:true,opacity:.6});
const SKINS=[0xffd9b3,0xf2c29b,0xe0a97e,0xc98a5e];
function trapezoid(wTop,wBot,h,dTop,dBot){const g=new THREE.BufferGeometry();const t=wTop/2,b=wBot/2,dt=dTop/2,db=dBot/2;
 const v=[[-b,0,db],[b,0,db],[t,h,dt],[-t,h,dt],[-b,0,-db],[b,0,-db],[t,h,-dt],[-t,h,-dt]];
 const f=[[0,1,2,3],[5,4,7,6],[1,5,6,2],[4,0,3,7],[3,2,6,7],[4,5,1,0]];const pos=[];f.forEach(q=>{const[a,b2,c,d]=q.map(i=>v[i]);pos.push(...a,...b2,...c,...a,...c,...d);});
 g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();return g;}
function dotEyes(h,y=.08,z=.44,dx=.17,r=.055){for(const s of[-1,1])h.add(mesh(SPH(r,6,5),EYE_B,s*dx,y,z));}
function mouth(h,y=-.12,z=.47){const m=mesh(new THREE.TorusGeometry(.08,.02,5,10,Math.PI),EYE_B,0,y,z);m.rotation.z=Math.PI;h.add(m);}
/* body: legs + torso + arms + round head; returns group with userData.head (head group, y 0 = head centre) */
function person(o={}){const g=new THREE.Group();const skin=o.skin??SKINS[0],legC=o.legs??0x3b5bdb,torC=o.torso??0xe03131,armC=o.arms??torC,shoeC=o.shoes??0x3b2a22;
 for(const s of[-1,1]){g.add(mesh(BOX(.4,.78,.46),GLOSS(legC),s*.24,.5,0));g.add(mesh(BOX(.44,.2,.6),GLOSS(shoeC),s*.24,.1,.05));}
 g.add(mesh(trapezoid(1.02,.84,.95,.56,.5),GLOSS(torC),0,.88,0));
 if(o.print){g.add(mesh(BOX(.46,.4,.04),GLOSS(o.print),0,1.32,.28));}
 for(const s of[-1,1]){const arm=mesh(CYL(.14,.13,.8,7),GLOSS(armC),s*.62,1.32,0);arm.rotation.z=s*.22;g.add(arm);g.add(mesh(SPH(.15,7,5),GLOSS(skin),s*.7,.9,.02));}
 g.add(mesh(CYL(.16,.16,.16,8),GLOSS(skin),0,1.9,0));
 const head=new THREE.Group();head.position.set(0,2.4,0);g.add(head);g.userData.head=head;
 head.add(mesh(SPH(.52,10,8),GLOSS(skin),0,0,0));
 if(o.hair!==null){const hairC=o.hair??0x3b2a22;const cap=mesh(SPH(.56,10,8,0,6.28,0,1.35),GLOSS(hairC),0,.05,-.03);head.add(cap);if(o.bangs!==false)head.add(mesh(BOX(.6,.18,.2),GLOSS(hairC),0,.3,.42));}
 dotEyes(head);if(o.mouth!=='none')mouth(head);for(const s of[-1,1]){const b=mesh(SPH(.09,6,5),BLUSH,s*.3,-.08,.42,false);b.scale.z=.4;head.add(b);}
 g.userData.skin=skin;return g;}
/* animal hoods keep the human face visible (costume style) */
function hood(head,color,extra){head.add(mesh(SPH(.6,10,8,0,6.28,0,1.95),GLOSS(color),0,.08,-.04));extra&&extra(head);}
const CHAR_BUILDERS={
 /* ---- jungle animals and dinosaurs are real creatures (quadrupeds / birds), not people in costumes ---- */
 monkey(){const g=new THREE.Group();const fur=GLOSS(0x9a5f2e),skin=GLOSS(0xf2cfa0);g.add(mesh(SPH(.62,9,7),fur,0,1.15,0)).scale.set(1,1.15,.9);g.add(mesh(SPH(.42,8,6),skin,0,1.05,.35)).scale.set(1,1.1,.5);
  for(const s of[-1,1]){const a=mesh(CYL(.13,.12,1.2,7),fur,s*.62,1.05,.1);a.rotation.z=s*.5;g.add(a);g.add(mesh(SPH(.17,7,5),skin,s*.92,.45,.15));g.add(mesh(BOX(.34,.5,.34),fur,s*.3,.35,0));g.add(mesh(BOX(.4,.16,.5),skin,s*.3,.08,.08));}
  const head=new THREE.Group();head.position.set(0,2.2,.05);g.add(head);g.userData.head=head;head.add(mesh(SPH(.55,9,7),fur));const face=mesh(SPH(.46,8,6),skin,0,-.05,.3);face.scale.set(1.15,.9,.6);head.add(face);for(const s of[-1,1]){head.add(mesh(SPH(.2,7,5),fur,s*.6,.05,0));head.add(mesh(SPH(.12,7,5),skin,s*.62,.05,.1));}dotEyes(head,.08,.6,.18,.06);mouth(head,-.2,.62);
  const tail=mesh(new THREE.TorusGeometry(.5,.07,6,14,4.2),fur,.2,1,-.7);tail.rotation.y=Math.PI/2;g.add(tail);return g;},
 elephant(){const g=new THREE.Group();const sk=GLOSS(0x9fb4d8),pk=GLOSS(0xffc2d9);g.add(mesh(SPH(.95,9,7),sk,0,1.25,-.1)).scale.set(1,.85,1.25);for(const s of[-1,1])for(const u of[-1,1]){g.add(mesh(CYL(.26,.3,.95,8),sk,s*.5,.5,u*.6));g.add(mesh(CYL(.3,.3,.14,8),GLOSS(0xdfe6f2),s*.5,.07,u*.6));}
  const head=new THREE.Group();head.position.set(0,2.05,.9);g.add(head);g.userData.head=head;head.add(mesh(SPH(.62,9,7),sk));for(const s of[-1,1]){const e=mesh(SPH(.5,8,6),sk,s*.72,.05,-.1);e.scale.set(.3,1,1);head.add(e);const i=mesh(SPH(.36,8,6),pk,s*.76,.05,-.1);i.scale.set(.2,.8,.8);head.add(i);}
  const tr=mesh(CYL(.13,.2,1.2,8),sk,0,-.55,.5);tr.rotation.x=.45;head.add(tr);head.add(mesh(SPH(.17,7,5),sk,0,-1.05,.85));for(const s of[-1,1])head.add(mesh(CONE(.08,.5,6),GLOSS(0xfff6e0),s*.28,-.3,.5)).rotation.x=Math.PI/2;dotEyes(head,.12,.52,.2,.06);
  g.add(mesh(CYL(.05,.05,.9,5),sk,0,1.3,-1.3)).rotation.x=.5;return g;},
 tiger(){const g=new THREE.Group();const fur=GLOSS(0xf08c2e),dk=GLOSS(0x3b2a22),wh=GLOSS(0xfff6e0);g.add(mesh(SPH(.8,9,7),fur,0,1.15,-.1)).scale.set(.9,.8,1.5);g.add(mesh(SPH(.55,8,6),wh,0,.95,.1)).scale.set(.8,.6,1.4);
  for(let i=0;i<5;i++){const st=mesh(BOX(.7,.16,.14),dk,0,1.5+Math.sin(i)*.1,-1+i*.45);st.rotation.x=.4;g.add(st);}
  for(const s of[-1,1])for(const u of[-1,1]){g.add(mesh(CYL(.17,.2,.85,7),fur,s*.42,.45,u*.65));g.add(mesh(SPH(.22,7,5),wh,s*.42,.1,u*.65+.05)).scale.y=.6;}
  const head=new THREE.Group();head.position.set(0,1.95,1.05);g.add(head);g.userData.head=head;head.add(mesh(SPH(.58,9,7),fur));const mz=mesh(SPH(.36,8,6),wh,0,-.15,.42);mz.scale.set(1.2,.8,.8);head.add(mz);head.add(mesh(SPH(.09,6,5),dk,0,-.05,.76));for(const s of[-1,1]){head.add(mesh(SPH(.18,7,5),fur,s*.42,.45,-.05));head.add(mesh(BOX(.12,.3,.1),dk,s*.3,.35,.38));}dotEyes(head,.12,.5,.22,.06);
  const tail=mesh(CYL(.07,.05,1.4,6),fur,0,1.2,-1.6);tail.rotation.x=1.2;g.add(tail);return g;},
 toucan(){const g=new THREE.Group();const bk=GLOSS(0x1e1a18),ye=GLOSS(0xffd43b),or=GLOSS(0xff922b);g.add(mesh(SPH(.78,9,7),bk,0,1.25,0)).scale.set(.9,1.1,1.1);g.add(mesh(SPH(.5,8,6),ye,0,1.2,.45)).scale.set(.9,1,.5);
  for(const s of[-1,1]){const w=mesh(SPH(.5,8,6),bk,s*.7,1.3,-.1);w.scale.set(.35,.8,1.2);w.rotation.z=s*.3;g.add(w);g.add(mesh(CYL(.06,.06,.6,5),or,s*.25,.35,0));g.add(mesh(BOX(.36,.08,.5),or,s*.25,.05,.12));}
  const head=new THREE.Group();head.position.set(0,2.25,.15);g.add(head);g.userData.head=head;head.add(mesh(SPH(.5,9,7),bk));head.add(mesh(SPH(.4,8,6),ye,0,-.05,.25)).scale.set(.9,.8,.6);
  const beak=mesh(CONE(.3,1.5,8),or,0,-.05,1.05);beak.rotation.x=Math.PI/2;beak.scale.set(1,1,.7);head.add(beak);head.add(mesh(CONE(.3,.5,8),GLOSS(0xe03131),0,-.05,1.75)).rotation.x=Math.PI/2;dotEyes(head,.12,.42,.2,.07);
  g.add(mesh(BOX(.3,.1,.9),bk,0,1.1,-.95)).rotation.x=.3;return g;},
 trex(){const g=new THREE.Group();const sk=GLOSS(0x5bc85b),be=GLOSS(0xd9f7b1);g.add(mesh(SPH(.85,9,7),sk,0,1.5,-.2)).scale.set(.9,1,1.4);g.add(mesh(SPH(.55,8,6),be,0,1.3,.25)).scale.set(.8,.9,.9);
  for(const s of[-1,1]){g.add(mesh(CYL(.28,.32,1.1,8),sk,s*.5,.6,-.2));g.add(mesh(BOX(.5,.2,.8),sk,s*.5,.1,0));for(let k=0;k<3;k++)g.add(mesh(CONE(.07,.2,4),GLOSS(0xfff6e0),s*.5-.15+k*.15,.08,.45)).rotation.x=Math.PI/2;const a=mesh(CYL(.08,.07,.5,6),sk,s*.45,1.5,.6);a.rotation.x=-1;g.add(a);}
  const tail=mesh(CONE(.42,2,8),sk,0,1.5,-1.9);tail.rotation.x=-Math.PI/2;g.add(tail);for(let i=0;i<5;i++)g.add(mesh(CONE(.1,.3,4),GLOSS(0x2f9e44),0,2.3-i*.15,-.3-i*.35)).rotation.x=-1;
  const head=new THREE.Group();head.position.set(0,2.65,.65);g.add(head);g.userData.head=head;head.add(mesh(SPH(.62,9,7),sk,0,0,0)).scale.set(.9,.85,1.3);const jaw=mesh(SPH(.42,8,6),sk,0,-.32,.45);jaw.scale.set(.9,.5,1.2);head.add(jaw);for(let i=0;i<6;i++)head.add(mesh(CONE(.06,.18,4),GLOSS(0xfff6e0),-.3+i*.12,-.2,.75)).rotation.x=Math.PI;for(const s of[-1,1]){head.add(mesh(SPH(.12,7,5),EYE_W,s*.3,.2,.5));head.add(mesh(SPH(.06,6,5),EYE_B,s*.3,.2,.6));}return g;},
 bronto(){const g=new THREE.Group();const sk=GLOSS(0x74b9ff),be=GLOSS(0xdff4ff);g.add(mesh(SPH(1,9,7),sk,0,1.3,-.2)).scale.set(.9,.8,1.3);g.add(mesh(SPH(.7,8,6),be,0,1.05,0)).scale.set(.8,.5,1.2);for(const s of[-1,1])for(const u of[-1,1]){g.add(mesh(CYL(.24,.28,1,8),sk,s*.5,.5,u*.6));}
  const neck=mesh(CYL(.22,.36,1.9,8),sk,0,2.3,.75);neck.rotation.x=-.5;g.add(neck);const head=new THREE.Group();head.position.set(0,3.2,1.35);g.add(head);g.userData.head=head;head.add(mesh(SPH(.4,8,6),sk)).scale.set(1,.85,1.25);for(const s of[-1,1]){head.add(mesh(SPH(.09,7,5),EYE_W,s*.2,.12,.32));head.add(mesh(SPH(.045,6,5),EYE_B,s*.2,.12,.4));}mouth(head,-.15,.45);
  for(let i=0;i<6;i++)g.add(mesh(SPH(.1,6,5),GLOSS(0x3b5bdb),0,2.1-i*.02,.3-i*.45));const tail=mesh(CONE(.3,2.2,8),sk,0,1.3,-1.9);tail.rotation.x=-Math.PI/2+.15;g.add(tail);return g;},
 triceratops(){const g=new THREE.Group();const sk=GLOSS(0xd9a35c),dk=GLOSS(0xb0782f);g.add(mesh(SPH(.95,9,7),sk,0,1.25,-.2)).scale.set(1,.85,1.35);for(const s of[-1,1])for(const u of[-1,1]){g.add(mesh(CYL(.26,.3,.95,8),sk,s*.52,.5,u*.6));}
  const head=new THREE.Group();head.position.set(0,1.75,1.1);g.add(head);g.userData.head=head;head.add(mesh(SPH(.6,9,7),sk)).scale.set(.95,.8,1.2);const frill=mesh(CYL(1.05,1.05,.18,8),dk,0,.35,-.35);frill.rotation.x=-.5;head.add(frill);for(let i=0;i<7;i++){const a=i/6*Math.PI;head.add(mesh(SPH(.12,6,5),GLOSS(0xe03131),Math.cos(a)*1,.35+Math.sin(a)*.9,-.6));}
  for(const s of[-1,1])head.add(mesh(CONE(.09,.9,6),GLOSS(0xfff6e0),s*.35,.3,.55)).rotation.x=Math.PI/2-.3;head.add(mesh(CONE(.08,.5,6),GLOSS(0xfff6e0),0,-.05,.75)).rotation.x=Math.PI/2-.2;head.add(mesh(SPH(.28,8,6),dk,0,-.25,.55)).scale.set(1.1,.6,.8);for(const s of[-1,1]){head.add(mesh(SPH(.11,7,5),EYE_W,s*.33,.05,.45));head.add(mesh(SPH(.055,6,5),EYE_B,s*.33,.05,.55));}
  const tail=mesh(CONE(.3,1.6,8),sk,0,1.2,-1.7);tail.rotation.x=-Math.PI/2+.2;g.add(tail);return g;},
 stego(){const g=new THREE.Group();const sk=GLOSS(0x7cb342),pl=GLOSS(0xe8744a);g.add(mesh(SPH(1,9,7),sk,0,1.3,-.1)).scale.set(.9,.9,1.4);for(const s of[-1,1])for(const u of[-1,1]){g.add(mesh(CYL(.22,.28,.95,8),sk,s*.5,.5,u*.65));}
  for(let i=0;i<5;i++){for(const s of[-1,1]){const p=mesh(CONE(.42,.9,4),pl,s*.18,2.1-Math.abs(i-2)*.15,.9-i*.5);p.rotation.y=Math.PI/4;p.scale.z=.3;g.add(p);}}
  const head=new THREE.Group();head.position.set(0,1.45,1.35);g.add(head);g.userData.head=head;head.add(mesh(SPH(.4,8,6),sk)).scale.set(.9,.75,1.3);for(const s of[-1,1]){head.add(mesh(SPH(.09,7,5),EYE_W,s*.2,.12,.32));head.add(mesh(SPH(.045,6,5),EYE_B,s*.2,.12,.4));}mouth(head,-.12,.45);
  const tail=mesh(CONE(.3,1.8,8),sk,0,1.3,-1.8);tail.rotation.x=-Math.PI/2+.2;g.add(tail);for(const s of[-1,1])for(const u of[0,1])g.add(mesh(CONE(.07,.5,5),GLOSS(0xfff6e0),s*.25,1.5+u*.3,-2.2-u*.3)).rotation.x=-Math.PI/2;return g;},
 astro(){const g=person({torso:0xf8f9fa,legs:0xf8f9fa,arms:0xf8f9fa,print:0x74c0fc,shoes:0xdee2e6,hair:0x5c4030});const h=g.userData.head;h.add(mesh(SPH(.7,10,8),new THREE.MeshStandardMaterial({color:0xa5d8ff,transparent:true,opacity:.28,roughness:.1}),0,.05,0)).castShadow=false;h.add(mesh(new THREE.TorusGeometry(.64,.1,7,20),GLOSS(0xf8f9fa),0,-.5,0)).rotation.x=Math.PI/2;
  g.add(mesh(BOX(.8,.9,.4),GLOSS(0xdee2e6),0,1.25,-.5));return g;},
 rocket(){const g=person({torso:0xf8f9fa,legs:0xff6b6b,arms:0xff6b6b,print:0x74c0fc,hair:null});const h=g.userData.head;h.add(mesh(CYL(.54,.54,.5,10),GLOSS(0xf8f9fa),0,.25,0));h.add(mesh(CONE(.56,.9,10),GLOSS(0xff6b6b),0,.95,0));
  for(let i=0;i<3;i++){const a=i/3*6.28+Math.PI/2;const fin=mesh(BOX(.1,.5,.4),GLOSS(0xff6b6b),Math.cos(a)*.55,.3,Math.sin(a)*.55);fin.rotation.y=-a;g.add(fin);}
  for(let i=0;i<4;i++){const f=mesh(CONE(.12,.45,6),GLOW(0xffb703,0xff922b,1),rnd(-.25,.25),-.15,rnd(-.2,.2));f.rotation.x=Math.PI;f.userData.flame=true;g.add(f);}return g;},
 alien(){const g=person({skin:0x69db7c,torso:0xd3f9d8,legs:0x69db7c,arms:0x69db7c,print:0x2f9e44,hair:null});const h=g.userData.head;for(const s of[-1,1]){const a=mesh(CYL(.04,.04,.6,5),GLOSS(0x69db7c),s*.25,.7,0);a.rotation.z=s*-.4;h.add(a);h.add(mesh(SPH(.1,7,5),GLOW(0xffd43b,0xffd43b,.9),s*.38,.98,0));}return g;},
 robot(){const g=person({skin:0xadb5bd,torso:0x868e96,legs:0x495057,arms:0xadb5bd,print:0x74c0fc,shoes:0x343a40,hair:null,mouth:'none'});const h=g.userData.head;h.add(mesh(BOX(.9,.5,.12),GLOSS(0x1e2433),0,.05,.45));for(const s of[-1,1])h.add(mesh(SPH(.1,7,5),GLOW(0x74c0fc,0x4dabf7,1.2),s*.22,.08,.52));h.add(mesh(CYL(.05,.05,.5,6),GLOSS(0xadb5bd),0,.65,0));h.add(mesh(SPH(.11,7,5),GLOW(0xff6b6b,0xff6b6b,1),0,.92,0));
  g.add(mesh(BOX(.9,.3,.1),GLOW(0x74c0fc,0x4dabf7,.8),0,1.1,.3));return g;},
 /* ---- Hsinchu: ordinary townsfolk, no uniforms — a kid, a teen, a grown-up, a grandparent ---- */
 kid(){const g=person({skin:SKINS[1],torso:0xffd43b,legs:0x3b5bdb,shoes:0xe03131,hair:0x3b2a22,print:0x74c0fc});const h=g.userData.head;h.add(mesh(SPH(.56,10,8,0,6.28,0,1.2),GLOSS(0xe03131),0,.1,.02));h.add(mesh(BOX(.7,.1,.5),GLOSS(0xe03131),0,.2,.55));g.add(mesh(BOX(.7,.9,.35),GLOSS(0x74c0fc),0,1.3,-.45));g.scale.setScalar(.88);return g;},
 teen(){const g=person({skin:SKINS[0],torso:0xf06595,legs:0x343a40,shoes:0xf8f9fa,hair:0x5c4030,print:0xfff0f6});const h=g.userData.head;const tail=mesh(SPH(.22,7,5),GLOSS(0x5c4030),0,.1,-.55);tail.scale.set(1,1.8,1);h.add(tail);h.add(mesh(SPH(.16,6,5),GLOSS(0x5c4030),0,-.35,-.6));
  for(const sx of[-1,1])h.add(mesh(new THREE.TorusGeometry(.14,.025,5,10),GLOSS(0x1e2433),sx*.17,.08,.5));h.add(mesh(BOX(.1,.02,.02),GLOSS(0x1e2433),0,.08,.5));return g;},
 adult(){const g=person({skin:SKINS[2],torso:0x4dabf7,legs:0x495057,shoes:0x3b2a22,hair:0x1e1a18,print:0xe7f5ff});g.add(mesh(BOX(.9,.08,.55),GLOSS(0x8d6e4a),0,.88,0));const bag=mesh(BOX(.5,.6,.25),GLOSS(0x8d6e4a),.75,1.0,.1);g.add(bag);g.add(mesh(CYL(.03,.03,.9,4),GLOSS(0x8d6e4a),.7,1.5,.1));g.scale.setScalar(1.04);return g;},
 grandma(){const g=person({skin:SKINS[1],torso:0xb197fc,legs:0x5f3dc4,shoes:0x3b2a22,hair:0xdee2e6,print:0xf3f0ff});const h=g.userData.head;h.add(mesh(SPH(.3,7,5),GLOSS(0xdee2e6),0,.42,-.25));for(const sx of[-1,1])h.add(mesh(new THREE.TorusGeometry(.15,.03,5,10),GLOSS(0x8d6e4a),sx*.17,.08,.5));
  const cane=mesh(CYL(.05,.05,1.6,5),GLOSS(0x8d6e4a),.9,.8,.3);g.add(cane);g.add(mesh(new THREE.TorusGeometry(.14,.04,5,10,Math.PI),GLOSS(0x8d6e4a),.9,1.62,.3));g.scale.setScalar(.95);return g;}
};
const CHAR_CLASS={monkey:'animal',elephant:'animal',tiger:'animal',toucan:'animal',trex:'dino',bronto:'dino',triceratops:'dino',stego:'dino',astro:'space',rocket:'space',alien:'space',robot:'space',kid:'hero',teen:'hero',adult:'hero',grandma:'hero'};
/* who lives where: the stage shows scene-native creatures, 4 per world */
const CHAR_SETS={jungle:['monkey','elephant','tiger','toucan'],dino:['trex','bronto','triceratops','stego'],space:['astro','rocket','alien','robot'],town:['kid','teen','adult','grandma']};
function buildChar(id){const g=(CHAR_BUILDERS[id]||CHAR_BUILDERS.monkey)();g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return g;}
