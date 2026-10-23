/* ===== characters: chibi figures built from primitives. Each returns a Group ~2.3 units tall, facing +z ===== */
const EYE_W=GLOSS(0xffffff),EYE_B=GLOSS(0x111111),BLUSH=M(0xff8fa3,{transparent:true,opacity:.7});
function eyes(g,y,z,dx=.26,r=.17,pr=.09){for(const s of[-1,1]){g.add(mesh(SPH(r,14,10),EYE_W,s*dx,y,z));g.add(mesh(SPH(pr,10,8),EYE_B,s*dx,y+.01,z+r*.75));g.add(mesh(SPH(pr*.35,6,5),EYE_W,s*dx+pr*.3,y+pr*.35,z+r*.95));}}
function smile(g,y,z,w=.22){const t=new THREE.TorusGeometry(w,.035,6,16,Math.PI);const m=mesh(t,EYE_B,0,y,z);m.rotation.z=Math.PI;g.add(m);}
function blush(g,y,z,dx=.42){for(const s of[-1,1]){const b=mesh(SPH(.09,8,6),BLUSH,s*dx,y,z,false);b.scale.z=.4;g.add(b);}}
function limbs(g,bodyMat,y,dx,len=.5,r=.13){for(const s of[-1,1]){const a=mesh(CYL(r,r*.9,len,10),bodyMat,s*dx,y,0);a.rotation.z=s*.35;g.add(a);g.add(mesh(SPH(r*1.15,10,8),bodyMat,s*(dx+.12),y-len/2,0));}}
function feet(g,mat,dx=.28,z=.15){for(const s of[-1,1]){const f=mesh(SPH(.22,12,8),mat,s*dx,.12,z);f.scale.set(1,.55,1.3);g.add(f);}}
/* base body: returns {g, body material}. headY = center of head */
function base(bodyC,bellyC){const g=new THREE.Group();const bm=GLOSS(bodyC);const body=mesh(SPH(.62,22,16),bm,0,.95,0);body.scale.set(1,1.1,.9);g.add(body);
 if(bellyC!=null){const b=mesh(SPH(.45,18,12),GLOSS(bellyC),0,.85,.3);b.scale.set(1,1.1,.6);g.add(b);}
 feet(g,bm);limbs(g,bm,1.05,.62);const head=mesh(SPH(.78,24,18),bm,0,2.05,0);g.add(head);g.userData.head=head;g.userData.bm=bm;return g;}
const CHAR_BUILDERS={
 lion(){const g=base(0xf4c542,0xfff0c2);const mane=mesh(new THREE.TorusGeometry(.78,.34,14,28),GLOSS(0xe8742b),0,2.05,-.15);g.add(mane);for(let i=0;i<10;i++){const a=i/10*6.28;const t=mesh(CONE(.22,.5,8),GLOSS(0xe8742b),Math.cos(a)*1.05,2.05+Math.sin(a)*1.05,-.1);t.rotation.z=-a-Math.PI/2;g.add(t);}
  for(const s of[-1,1])g.add(mesh(SPH(.2,10,8),GLOSS(0xf4c542),s*.55,2.7,0));g.add(mesh(SPH(.3,14,10),GLOSS(0xfff0c2),0,1.85,.6)).scale.set(1.3,.8,.8);g.add(mesh(SPH(.1,8,6),GLOSS(0x3b2416),0,1.98,.86));eyes(g,2.2,.62);blush(g,1.95,.6,.5);
  const tail=mesh(CYL(.06,.06,1,8),GLOSS(0xf4c542),.4,.9,-.7);tail.rotation.x=1.1;g.add(tail);g.add(mesh(SPH(.16,10,8),GLOSS(0xe8742b),.4,1.3,-1.15));return g;},
 panda(){const g=base(0xffffff,null);const k=GLOSS(0x222222);for(const s of[-1,1]){g.add(mesh(SPH(.24,12,8),k,s*.6,2.65,0));const p=mesh(SPH(.26,12,8),k,s*.3,2.2,.62);p.scale.set(1,1.3,.5);g.add(p);}
  eyes(g,2.2,.75,.3,.13,.08);g.add(mesh(SPH(.1,8,6),k,0,1.95,.78));smile(g,1.82,.75,.16);limbs(g,k,1.05,.62);feet(g,k);blush(g,1.95,.72,.55);return g;},
 monkey(){const g=base(0x9a5f2e,0xf2cfa0);for(const s of[-1,1])g.add(mesh(SPH(.26,12,8),GLOSS(0x9a5f2e),s*.78,2.15,0)),g.add(mesh(SPH(.16,10,8),GLOSS(0xf2cfa0),s*.8,2.15,.12));
  const face=mesh(SPH(.5,18,12),GLOSS(0xf2cfa0),0,1.95,.45);face.scale.set(1.15,.9,.6);g.add(face);eyes(g,2.2,.7);smile(g,1.78,.85,.2);
  const tail=mesh(new THREE.TorusGeometry(.35,.06,8,20,4.5),GLOSS(0x9a5f2e),.3,1,-.75);tail.rotation.y=Math.PI/2;g.add(tail);return g;},
 elephant(){const g=base(0x9fb4d8,0xd6e2f5);for(const s of[-1,1]){const e=mesh(SPH(.5,16,12),GLOSS(0x9fb4d8),s*.85,2.15,-.1);e.scale.set(.35,1,1);g.add(e);const inner=mesh(SPH(.36,14,10),GLOSS(0xffc2d9),s*.9,2.15,-.1);inner.scale.set(.25,.8,.8);g.add(inner);}
  const trunk=mesh(CYL(.16,.22,.9,12),GLOSS(0x9fb4d8),0,1.65,.65);trunk.rotation.x=.5;g.add(trunk);g.add(mesh(SPH(.2,10,8),GLOSS(0x9fb4d8),0,1.25,.85));eyes(g,2.25,.68);blush(g,1.98,.65,.5);return g;},
 trex(){const g=base(0x5bc85b,0xd9f7b1);g.userData.head.scale.set(1.15,1,1.25);g.add(mesh(SPH(.42,16,12),GLOSS(0x5bc85b),0,1.85,.75)).scale.set(1.2,.7,1);
  for(let i=0;i<4;i++)g.add(mesh(CONE(.07,.18,6),EYE_W,-.3+i*.2,1.72,1.15)).rotation.x=Math.PI;eyes(g,2.3,.62,.3);for(let i=0;i<4;i++)g.add(mesh(CONE(.12,.3,6),GLOSS(0x2f9e44),0,2.6+i*-.0,-.25-i*.22)).rotation.x=-.6-i*.2;
  const tail=mesh(CONE(.25,1.3,10),GLOSS(0x5bc85b),0,.8,-.9);tail.rotation.x=-Math.PI/2+.4;g.add(tail);limbs(g,g.userData.bm,1.2,.55,.3,.09);return g;},
 bronto(){const g=base(0x74b9ff,0xdff4ff);g.remove(g.userData.head);const neck=mesh(CYL(.26,.4,1.6,14),GLOSS(0x74b9ff),0,2,-.1);neck.rotation.x=-.25;g.add(neck);const head=mesh(SPH(.5,18,12),GLOSS(0x74b9ff),0,2.95,.25);head.scale.set(1,.85,1.2);g.add(head);g.userData.head=head;
  eyes(g,3.05,.6,.22,.13,.07);smile(g,2.78,.72,.14);for(let i=0;i<5;i++)g.add(mesh(SPH(.1,8,6),GLOSS(0x3b5bdb),0,2.1+i*.2,-.45+i*.05));const tail=mesh(CONE(.25,1.4,10),GLOSS(0x74b9ff),0,.9,-.95);tail.rotation.x=-Math.PI/2+.5;g.add(tail);return g;},
 egg(){const g=new THREE.Group();const shell=GLOSS(0xfff3bf);const bottom=mesh(SPH(.8,24,18,0,6.28,1.2,2),shell,0,1.05,0);bottom.scale.set(1,1.3,1);g.add(bottom);for(let i=0;i<8;i++){const a=i/8*6.28;g.add(mesh(CONE(.22,.4,4),shell,Math.cos(a)*.78,1.35,Math.sin(a)*.78)).rotation.set(0,-a,0);}
  const chick=mesh(SPH(.62,20,14),GLOSS(0xffd43b),0,1.7,0);g.add(chick);g.userData.head=chick;const top=mesh(SPH(.6,24,18,0,6.28,0,1.2),shell,0,2.05,0);top.scale.set(1,1.2,1);g.add(top);eyes(g,1.8,.5,.22,.12,.07);g.add(mesh(CONE(.12,.25,6),GLOSS(0xff922b),0,1.6,.68)).rotation.x=Math.PI/2;feet(g,GLOSS(0xff922b),.25,.1);blush(g,1.6,.48,.42);return g;},
 dragon(){const g=base(0x9775fa,0xe5dbff);for(const s of[-1,1]){const w=mesh(CONE(.9,1.4,3),GLOSS(0x7048e8),s*1,1.5,-.4);w.rotation.z=s*-1.1;w.rotation.x=-.3;w.scale.z=.3;g.add(w);g.add(mesh(CONE(.12,.45,8),GLOSS(0xffd43b),s*.35,2.8,-.1)).rotation.z=s*-.3;}
  for(let i=0;i<4;i++)g.add(mesh(CONE(.12,.3,6),GLOSS(0xffd43b),0,1.6-i*.15,-.6-i*.2)).rotation.x=-1.2;const tail=mesh(CONE(.22,1.3,10),GLOSS(0x9775fa),0,.8,-1);tail.rotation.x=-Math.PI/2+.4;g.add(tail);g.add(mesh(CONE(.2,.4,4),GLOSS(0xffd43b),0,.75,-1.65)).rotation.x=-Math.PI/2;
  g.add(mesh(SPH(.36,14,10),GLOSS(0xe5dbff),0,1.85,.6)).scale.set(1.2,.7,.9);eyes(g,2.25,.62,.3);for(const s of[-1,1])g.add(mesh(SPH(.06,6,5),GLOSS(0x5f3dc4),s*.12,1.82,.95));return g;},
 astro(){const g=base(0xf8f9fa,null);const suit=GLOSS(0xf8f9fa);g.add(mesh(new THREE.TorusGeometry(.6,.08,8,24),GLOSS(0xff6b6b),0,1.3,0)).rotation.x=Math.PI/2;g.add(mesh(BOX(.5,.35,.15),GLOSS(0x74c0fc),0,1.05,.56));
  const face=mesh(SPH(.6,20,14),GLOSS(0xffd8a8),0,2.05,.1);g.add(face);eyes(g,2.15,.6,.22,.13,.07);smile(g,1.85,.62,.16);
  const glass=mesh(SPH(.82,24,18),new THREE.MeshStandardMaterial({color:0xa5d8ff,transparent:true,opacity:.35,roughness:.1,metalness:.1}),0,2.05,0);glass.castShadow=false;g.add(glass);g.add(mesh(new THREE.TorusGeometry(.8,.1,10,32),suit,0,1.35,0)).rotation.x=Math.PI/2;
  g.add(mesh(BOX(.8,.9,.4),GLOSS(0xdee2e6),0,1.05,-.65));g.add(mesh(SPH(.14,8,6),GLOSS(0xff6b6b),0,2.9,-.2));return g;},
 rocket(){const g=new THREE.Group();const body=mesh(CYL(.6,.7,1.6,20),GLOSS(0xf8f9fa),0,1.2,0);g.add(body);const nose=mesh(CONE(.6,.9,20),GLOSS(0xff6b6b),0,2.45,0);g.add(nose);g.userData.head=nose;
  for(let i=0;i<3;i++){const a=i/3*6.28+Math.PI/2;const fin=mesh(BOX(.12,.7,.6),GLOSS(0xff6b6b),Math.cos(a)*.7,.55,Math.sin(a)*.7);fin.rotation.y=-a;g.add(fin);}g.add(mesh(CYL(.4,.5,.3,16),GLOSS(0x495057),0,.3,0));
  const win=mesh(new THREE.TorusGeometry(.26,.07,10,24),GLOSS(0x74c0fc),0,1.5,.6);g.add(win);g.add(mesh(SPH(.25,14,10),GLOSS(0xd0ebff),0,1.5,.55));eyes(g,1.55,.72,.1,.08,.045);
  for(let i=0;i<5;i++){const f=mesh(CONE(.14,.5,8),GLOW(0xffb703,0xff922b,1),rnd(-.25,.25),-.1,rnd(-.25,.25));f.rotation.x=Math.PI;f.userData.flame=true;g.add(f);}return g;},
 alien(){const g=base(0x69db7c,0xd3f9d8);g.userData.head.scale.set(1.15,1.2,1);for(const s of[-1,1]){const e=mesh(SPH(.3,16,12),EYE_B,s*.34,2.2,.6);e.scale.set(.8,1.3,.6);g.add(e);g.add(mesh(SPH(.09,8,6),EYE_W,s*.3,2.32,.78));}
  smile(g,1.78,.72,.18);for(const s of[-1,1]){const a=mesh(CYL(.04,.04,.7,6),GLOSS(0x69db7c),s*.3,3.1,0);a.rotation.z=s*-.4;g.add(a);g.add(mesh(SPH(.12,10,8),GLOW(0xffd43b,0xffd43b,.9),s*.45,3.42,0));}return g;},
 robot(){const g=new THREE.Group();const m=GLOSS(0xadb5bd,{metalness:.5,roughness:.3});g.add(mesh(BOX(1.2,1.1,.9),m,0,.95,0));g.add(mesh(BOX(.9,.3,.1),GLOW(0x74c0fc,0x4dabf7,.8),0,1.05,.46));for(const s of[-1,1]){g.add(mesh(BOX(.3,.8,.3),m,s*.85,.95,0));g.add(mesh(BOX(.4,.3,.5),m,s*.35,.15,.1));}
  const head=mesh(BOX(1.3,1,1),m,0,2,0);g.add(head);g.userData.head=head;g.add(mesh(BOX(1,.55,.1),GLOSS(0x1e2433),0,2.05,.51));for(const s of[-1,1])g.add(mesh(SPH(.13,10,8),GLOW(0x74c0fc,0x4dabf7,1.2),s*.28,2.1,.6));g.add(mesh(BOX(.5,.08,.06),GLOW(0x74c0fc,0x4dabf7,1),0,1.85,.6));
  g.add(mesh(CYL(.05,.05,.5,8),m,0,2.7,0));g.add(mesh(SPH(.13,10,8),GLOW(0xff6b6b,0xff6b6b,1),0,2.98,0));for(const s of[-1,1])g.add(mesh(CYL(.12,.12,.25,10),m,s*.72,2.05,0)).rotation.z=Math.PI/2;return g;},
 detective(){const g=base(0xd9b38c,0xfff0c2);g.add(mesh(SPH(.6,20,14),GLOSS(0xffd8a8),0,2.05,.12));eyes(g,2.15,.6,.22,.13,.07);smile(g,1.82,.65,.14);
  const brim=mesh(CYL(1.05,1.05,.1,28),GLOSS(0x8d6e4a),0,2.55,0);g.add(brim);g.add(mesh(CYL(.6,.65,.55,24),GLOSS(0x8d6e4a),0,2.85,0));g.add(mesh(CYL(.63,.63,.12,24),GLOSS(0x3b2416),0,2.66,0));
  const mag=new THREE.Group();mag.add(mesh(new THREE.TorusGeometry(.3,.06,8,24),GLOSS(0xffd43b)));mag.add(mesh(CYL(.26,.26,.02,20),new THREE.MeshStandardMaterial({color:0xd0ebff,transparent:true,opacity:.5})));mag.add(mesh(CYL(.06,.06,.6,8),GLOSS(0x8d6e4a),0,-.55,0));mag.position.set(.95,1.1,.35);mag.rotation.set(.4,0,-.3);g.add(mag);return g;},
 chef(){const g=base(0xffffff,null);g.add(mesh(SPH(.6,20,14),GLOSS(0xffd8a8),0,2.05,.12));eyes(g,2.15,.6,.22,.13,.07);smile(g,1.8,.65,.16);
  g.add(mesh(CYL(.55,.6,.45,24),GLOSS(0xffffff),0,2.75,0));const puff=mesh(SPH(.75,20,14),GLOSS(0xffffff),0,3.15,0);puff.scale.y=.75;g.add(puff);for(const s of[-1,1])g.add(mesh(SPH(.45,16,12),GLOSS(0xffffff),s*.5,3.1,0)).scale.y=.7;
  for(const s of[-1,1]){const m=mesh(SPH(.14,10,8),GLOSS(0x3b2416),s*.16,1.92,.68);m.scale.set(1.4,.6,.6);g.add(m);}g.add(mesh(new THREE.TorusGeometry(.55,.08,8,24),GLOSS(0xff6b6b),0,1.4,0)).rotation.x=Math.PI/2;
  for(let i=0;i<3;i++)g.add(mesh(SPH(.07,8,6),GLOSS(0x495057),0,1.2-i*.25,.6));return g;},
 wizard(){const g=new THREE.Group();const robe=mesh(CONE(.95,1.9,24),GLOSS(0x7048e8),0,.95,0);g.add(robe);g.add(mesh(new THREE.TorusGeometry(.5,.07,8,24),GLOSS(0xffd43b),0,1.25,0)).rotation.x=Math.PI/2;limbs(g,GLOSS(0x7048e8),1.1,.6);
  const head=mesh(SPH(.68,22,16),GLOSS(0xffd8a8),0,2.05,0);g.add(head);g.userData.head=head;eyes(g,2.15,.55,.22,.13,.07);const beard=mesh(SPH(.42,16,12),GLOSS(0xf8f9fa),0,1.65,.45);beard.scale.set(1.1,1.4,.7);g.add(beard);
  g.add(mesh(CYL(1,1,.1,28),GLOSS(0x5f3dc4),0,2.6,0));const hat=mesh(CONE(.7,1.6,24),GLOSS(0x5f3dc4),0,3.4,0);hat.rotation.z=.15;g.add(hat);for(let i=0;i<4;i++)g.add(mesh(new THREE.OctahedronGeometry(.1),GLOW(0xffd43b,0xffd43b,.8),Math.cos(i*1.6)*.45,2.8+i*.3,Math.sin(i*1.6)*.45));
  const staff=mesh(CYL(.06,.06,2.4,8),GLOSS(0x8d6e4a),1,1.3,.3);g.add(staff);g.add(mesh(SPH(.2,14,10),GLOW(0x74c0fc,0x4dabf7,1.2),1,2.6,.3));return g;},
 firefighter(){const g=base(0xe03131,null);g.add(mesh(BOX(1.2,.22,.95),GLOSS(0xffd43b),0,1.05,0));g.add(mesh(BOX(1.2,.22,.95),GLOSS(0xffd43b),0,.7,0));g.add(mesh(SPH(.6,20,14),GLOSS(0xffd8a8),0,2.05,.12));eyes(g,2.15,.6,.22,.13,.07);smile(g,1.82,.65,.16);
  const helm=mesh(SPH(.82,24,18,0,6.28,0,1.5),GLOSS(0xffd43b),0,2.15,0);g.add(helm);g.add(mesh(CYL(1.05,1.05,.1,28),GLOSS(0xffd43b),0,2.4,-.1));g.add(mesh(BOX(.4,.3,.1),GLOSS(0xe03131),0,2.6,.68));
  const hose=mesh(CYL(.1,.14,.9,10),GLOSS(0x495057),.9,1.1,.4);hose.rotation.x=-1.2;g.add(hose);g.add(mesh(CYL(.16,.1,.2,10),GLOSS(0xadb5bd),.9,1.45,.78)).rotation.x=-1.2;return g;}
};
const CHAR_CLASS={lion:'animal',panda:'animal',monkey:'animal',elephant:'animal',trex:'dino',bronto:'dino',egg:'dino',dragon:'dino',astro:'space',rocket:'space',alien:'space',robot:'space',detective:'hero',chef:'hero',wizard:'hero',firefighter:'hero'};
function buildChar(id){const g=(CHAR_BUILDERS[id]||CHAR_BUILDERS.lion)();g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return g;}
