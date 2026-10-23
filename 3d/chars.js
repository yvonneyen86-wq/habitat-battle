/* ===== characters: big-head island villagers with hand-drawn faces, cute jungle animals, film-style dinosaurs; ~2.9 units tall, facing +z ===== */
const EYE_W=GLOSS(0xffffff),EYE_B=GLOSS(0x1e1a18);
const SKINS=[0xffdcc0,0xf5c9a3,0xd9a27a,0xa8724d];
/* student look picked on the join screen ({sk,hs,hc,sh,pt,n}); index.html keeps the same tables as CSS colours — change both together */
const AV={SKIN:SKINS,HAIR:[0x2b1a12,0x5c4030,0xf76707,0xe9c46a,0x845ef7,0x1c7ed6],HS:['boy','part','mop','bob','bun','tails'],SHIRT:[0xe03131,0xf08c00,0xffd43b,0x40c057,0x1c7ed6,0x845ef7,0xf06595,0xf8f9fa],PAT:['plain','stripes','dots','star','num']};
const LEGS=[0x3b5bdb,0x343a40,0xf8f9fa,0x8d6e4a,0x2c3e75,0xe8590c],SHOES=[0xe03131,0xf8f9fa,0x3b2a22,0x1c7ed6];
function avOpts(av){if(!av)return{};const i=(v,n)=>Number.isInteger(v)&&v>=0&&v<n?v:0;const sh=i(av.sh,8);return{skin:AV.SKIN[i(av.sk,4)],hair:AV.HAIR[i(av.hc,6)],style:AV.HS[i(av.hs,6)],torso:AV.SHIRT[sh],accent:sh===7?0x1c7ed6:0xffffff,pattern:AV.PAT[i(av.pt,5)],num:String(av.n||7),legs:LEGS[(i(av.hs,6)+sh)%LEGS.length],shoes:SHOES[(i(av.hc,6)+i(av.sk,4))%SHOES.length]};}
const hex6=c=>'#'+(c>>>0).toString(16).padStart(6,'0');
const rgba=(c,a)=>`rgba(${c>>16&255},${c>>8&255},${c&255},${a})`;
/* ---- drawn faces: a thin sphere patch on the front of the head carries a canvas face, so expressions can switch instantly ---- */
const FACE_TEX={};
function faceTex(o,e){const key=(o.style||'human')+'|'+(o.iris||'')+'|'+(o.mouth===false?0:1)+'|'+e;if(FACE_TEX[key])return FACE_TEX[key];
 const t=canvasTex((x,W,H)=>{const st=o.style||'human',iris=o.iris||'#3b2414',ink='#2a1a12';const ey=H*.42,ex=[W*.33,W*.67];
  x.lineCap='round';x.lineJoin='round';
  /* cheeks */
  x.fillStyle='rgba(255,120,140,.42)';for(const cx of[W*.2,W*.8]){x.beginPath();x.ellipse(cx,H*.63,26,13,0,0,6.283);x.fill();}
  /* eyes */
  const open=['smile','talk','sad','wow'].includes(e);
  ex.forEach((cx,i)=>{const s=i?1:-1;x.strokeStyle=ink;x.fillStyle=ink;
   if(open){if(st==='alien'){x.save();x.translate(cx,ey);x.rotate(-s*.45);x.fillStyle='#10131a';x.beginPath();x.ellipse(0,0,26,40,0,0,6.283);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(-7,-14,8,0,6.283);x.fill();x.restore();return;}
    if(st==='human'){x.fillStyle='#fff';x.beginPath();x.ellipse(cx,ey,28,36,0,0,6.283);x.fill();x.lineWidth=4;x.stroke();}
    x.fillStyle=st==='human'?iris:'#1b120c';x.beginPath();x.ellipse(cx,ey+(st==='human'?4:0),st==='human'?21:19,st==='human'?28:27,0,0,6.283);x.fill();
    if(st==='human'){x.fillStyle=ink;x.beginPath();x.ellipse(cx,ey+6,11,15,0,0,6.283);x.fill();}
    x.fillStyle='#fff';x.beginPath();x.arc(cx-7,ey-9,8.5,0,6.283);x.fill();x.beginPath();x.arc(cx+7,ey+12,3.6,0,6.283);x.fill();
    if(st==='human'){x.lineWidth=5;x.beginPath();x.moveTo(cx-26,ey-30);x.quadraticCurveTo(cx,ey-44,cx+26,ey-30);x.stroke();}}
   else if(e==='happy'){x.lineWidth=9;x.beginPath();x.arc(cx,ey+12,21,Math.PI*1.12,Math.PI*1.88);x.stroke();}
   else if(e==='blink'){x.lineWidth=7;x.beginPath();x.arc(cx,ey-6,18,Math.PI*.15,Math.PI*.85);x.stroke();}
   else if(e==='ouch'){x.lineWidth=8;x.beginPath();x.moveTo(cx-s*16,ey-16);x.lineTo(cx+s*14,ey);x.lineTo(cx-s*16,ey+16);x.stroke();}
   else if(e==='ko'){x.lineWidth=8;x.beginPath();x.moveTo(cx-14,ey-14);x.lineTo(cx+14,ey+14);x.moveTo(cx+14,ey-14);x.lineTo(cx-14,ey+14);x.stroke();}
   /* brows */
   if(st==='human'||st==='animal'){x.strokeStyle=o.brow||'#5a3a22';x.lineWidth=7;const by=ey-(st==='human'?56:44);x.beginPath();
    if(e==='sad'){x.moveTo(cx-s*20,by-8);x.lineTo(cx+s*16,by+6);}else if(e==='ouch'){x.moveTo(cx-s*20,by+6);x.lineTo(cx+s*16,by-4);}else{x.moveTo(cx-16,by+2);x.quadraticCurveTo(cx,by-8,cx+16,by+2);}x.stroke();}});
  /* mouth */
  if(o.mouth===false)return;const my=H*.75,mx=W/2;x.strokeStyle=ink;x.lineWidth=5;
  const dmouth=(w,d)=>{x.fillStyle='#8a2b2b';x.beginPath();x.moveTo(mx-w,my-4);x.quadraticCurveTo(mx,my+d*1.6,mx+w,my-4);x.closePath();x.fill();x.stroke();x.fillStyle='#ff8a8a';x.beginPath();x.ellipse(mx,my+d*.55,w*.5,d*.28,0,0,6.283);x.fill();};
  if(e==='smile'||e==='blink')dmouth(18,16);else if(e==='happy')dmouth(28,26);
  else if(e==='talk'||e==='wow'){x.fillStyle='#8a2b2b';x.beginPath();x.ellipse(mx,my+6,15,19,0,0,6.283);x.fill();x.stroke();x.fillStyle='#ff8a8a';x.beginPath();x.ellipse(mx,my+14,9,7,0,0,6.283);x.fill();}
  else if(e==='sad'){x.beginPath();x.moveTo(mx-16,my+12);x.quadraticCurveTo(mx,my-6,mx+16,my+12);x.stroke();}
  else if(e==='ouch'){x.beginPath();x.moveTo(mx-20,my+4);for(let k=0;k<4;k++)x.quadraticCurveTo(mx-15+k*10,my+(k%2?-6:12),mx-10+k*10,my+4);x.stroke();}
  else if(e==='ko'){x.beginPath();x.ellipse(mx,my+6,8,10,0,0,6.283);x.stroke();}
 },384,224);FACE_TEX[key]=t;return t;}
const FACE_GEO={};
function addFace(head,o={}){const r=o.r||.6;const geo=FACE_GEO[r]||(FACE_GEO[r]=new THREE.SphereGeometry(r,32,20,Math.PI/2-1.1,2.2,.95,1.3));
 const m=bendMat(new THREE.MeshStandardMaterial({map:faceTex(o,'smile'),transparent:true,roughness:.55,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4}));
 const f=new THREE.Mesh(geo,m);f.position.set(0,o.y||0,o.z||0);f.userData.noInk=true;f.userData.noShadow=true;f.userData.fo=o;f.renderOrder=2;head.add(f);head.userData.face=f;return f;}
/* ---- clothes: canvas fabric wrapped round the torso (front of shirt = middle of the canvas) ---- */
const FAB={};
function fabricTex(kind,base,acc,txt){const key=[kind,base,acc,txt].join();if(FAB[key])return FAB[key];
 const t=canvasTex((x,W,H)=>{x.fillStyle=hex6(base);x.fillRect(0,0,W,H);x.fillStyle=hex6(acc);x.strokeStyle=hex6(acc);
  if(kind==='stripes'){for(let y=10;y<H;y+=34)x.fillRect(0,y,W,14);}
  else if(kind==='dots'){for(let r=0;r*30<H+30;r++)for(let c=0;c*40<W+40;c++){x.beginPath();x.arc(c*40+(r%2?20:0),r*30+8,9,0,6.283);x.fill();}}
  else if(kind==='leaves'){for(let i=0;i<34;i++){const lx=(i*73)%W,ly=(i*41)%H;x.save();x.translate(lx,ly);x.rotate(i*1.7);x.fillStyle=i%3?hex6(acc):'#2b8a3e';x.beginPath();x.ellipse(0,0,16,7,0,0,6.283);x.fill();x.restore();}}
  else if(kind==='flower'){const cx=W/2,cy=H*.55;x.fillStyle='#fff';for(let k=0;k<6;k++){const a=k/6*6.283;x.beginPath();x.ellipse(cx+Math.cos(a)*22,cy+Math.sin(a)*22,15,15,0,0,6.283);x.fill();}x.fillStyle='#ffd43b';x.beginPath();x.arc(cx,cy,14,0,6.283);x.fill();}
  else if(kind==='num'){x.font='900 92px Nunito,"Baloo 2",sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(txt||'7',W/2,H*.56);}
  else if(kind==='star'){x.font='900 86px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('★',W/2,H*.56);}
 },512,150);FAB[key]=t;return t;}
/* ---- villager body: short legs, round torso, big head (radius .66) ---- */
function person(o={}){const g=new THREE.Group();const skin=o.skin??SKINS[0],legC=o.legs??0x3b5bdb,top=o.torso??0xe03131,shoeC=o.shoes??0xf8f9fa;const SK=GLOSS(skin);
 const tm=bendMat(new THREE.MeshStandardMaterial({map:fabricTex(o.pattern||'plain',top,o.accent??0xffffff,o.num),roughness:.8}));
 for(const s of[-1,1]){g.add(mesh(CYL(.11,.1,.52,10),o.longPants?GLOSS(legC):SK,s*.17,.4,0));const sh=mesh(SPH(.16,10,8),GLOSS(shoeC),s*.17,.1,.06);sh.scale.set(1,.62,1.35);g.add(sh);}
 if(!o.dress)g.add(mesh(CYL(.32,.35,.3,12),GLOSS(legC),0,.74,0));
 const tor=mesh(o.dress?CYL(.29,.52,.8,14):CYL(.29,.34,.6,14),tm,0,o.dress?.99:1.12,0);tor.rotation.y=Math.PI;g.add(tor);
 const sho=mesh(new THREE.SphereGeometry(.29,24,10,0,6.283,0,1.5708),tm,0,o.dress?1.39:1.42,0);sho.scale.y=.42;g.add(sho);
 for(const s of[-1,1]){const arm=mesh(CYL(.085,.08,.5,8),SK,s*.46,1.15,0);arm.rotation.z=s*.55;g.add(arm);const sl=mesh(CYL(.13,.12,.2,10),tm,s*.37,1.29,0);sl.rotation.z=s*.55;g.add(sl);g.add(mesh(SPH(.11,8,6),SK,s*.6,.92,.02));}
 const head=new THREE.Group();head.position.set(0,2.02,0);g.add(head);g.userData.head=head;
 if(o.robot)return g;
 head.add(mesh(SPH(.66,14,10),SK,0,0,0));for(const s of[-1,1]){const e=mesh(SPH(.13,8,6),SK,s*.64,-.03,0);e.scale.set(.55,1,.8);head.add(e);}
 head.add(mesh(SPH(.07,8,6),GLOSS(skin),0,-.1,.66,false));
 if(o.hair!=null)hairdo(head,o.hair,o.style||'boy');
 addFace(head,{r:.665,style:o.face||'human',iris:o.iris,brow:o.brow});
 if(o.glasses){const gm=GLOSS(o.glasses);for(const s of[-1,1]){const rg=mesh(new THREE.TorusGeometry(.17,.025,8,24),gm,s*.24,.05,.66,false);rg.userData.noInk=true;head.add(rg);}head.add(mesh(BOX(.14,.03,.03),gm,0,.08,.7,false));}
 g.userData.top=2.7;return g;}
function hairdo(h,c,style){const m=GLOSS(c);
 h.add(mesh(new THREE.SphereGeometry(.71,28,14,0,6.283,0,1.2),m,0,.03,-.03));
 h.add(mesh(new THREE.SphereGeometry(.7,28,14,Math.PI,Math.PI,0,2.05),m,0,0,-.04));
 const bang=(x,y,z,sx,rz)=>{const b=mesh(SPH(.22,10,8),m,x,y,z);b.scale.set(sx,.55,.6);b.rotation.z=rz;h.add(b);};
 if(style==='part'){bang(.16,.44,.5,1.9,-.25);bang(-.36,.36,.48,.9,.4);}
 else{bang(-.3,.42,.48,1.1,.35);bang(0,.47,.52,1.2,0);bang(.3,.42,.48,1.1,-.35);}
 if(style==='mop'){for(let i=0;i<9;i++){const an=i/9*6.283,r=i%2?.52:.3;h.add(mesh(SPH(.24,10,8),m,Math.cos(an)*r,.4+(i%2?0:.18),Math.sin(an)*r*.9));}}
 if(style==='bun'){h.add(mesh(SPH(.27,12,10),m,0,.66,-.22));}
 if(style==='tails'){for(const s of[-1,1]){h.add(tw(mesh(SPH(.2,10,8),m,s*.66,.05,-.25),o=>o.scale.set(.9,1.3,.9)));h.add(mesh(SPH(.07,8,6),GLOSS(0xff6b9d),s*.6,.25,-.2));}}
 if(style==='bob'){for(const s of[-1,1]){const p=mesh(SPH(.3,10,8),m,s*.56,-.12,-.05);p.scale.set(.55,1.25,.95);h.add(p);}}}
/* ---- film-style dinosaurs: one continuous lofted body (Catmull-Rom spine with elliptical sections), real proportions, skin stripes and ink outlines ---- */
function loftGeo(cp,seg=18,sub=4){const cr=(a,b,c,d,t)=>.5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);
 const P=[];for(let i=0;i<cp.length-1;i++){const a=cp[Math.max(0,i-1)],b=cp[i],c=cp[i+1],d=cp[Math.min(cp.length-1,i+2)];for(let s=0;s<sub;s++)P.push(b.map((_,k)=>cr(a[k],b[k],c[k],d[k],s/sub)));}P.push(cp[cp.length-1].slice());
 const n=P.length,pos=[],uv=[],idx=[];let px=1,pz=0;
 for(let i=0;i<n;i++){const p=P[i],q=P[Math.min(n-1,i+1)],o=P[Math.max(0,i-1)];let tx=q[0]-o[0],ty=q[1]-o[1],tz=q[2]-o[2];const tl=Math.hypot(tx,ty,tz)||1;tx/=tl;ty/=tl;tz/=tl;
  let sx=tz,sz=-tx,sl=Math.hypot(sx,sz);if(sl<.05){sx=px;sz=pz;sl=Math.hypot(sx,sz)||1;}sx/=sl;sz/=sl;if(sx*px+sz*pz<0){sx=-sx;sz=-sz;}px=sx;pz=sz;
  const ux=ty*sz,uy=tz*sx-tx*sz,uz=-ty*sx;
  for(let j=0;j<=seg;j++){const a=-Math.PI/2+j/seg*6.2832,c=Math.cos(a)*p[3],s=Math.sin(a)*p[4];pos.push(p[0]+sx*c+ux*s,p[1]+uy*s,p[2]+sz*c+uz*s);uv.push(j/seg,i/(n-1));}}
 const R=seg+1;for(let i=0;i<n-1;i++)for(let j=0;j<seg;j++){const a=i*R+j,b=a+1,c=a+R,d=c+1;idx.push(a,b,c,b,d,c);}
 const c0=pos.length/3;pos.push(...P[0].slice(0,3));uv.push(.5,0);const c1=c0+1;pos.push(...P[n-1].slice(0,3));uv.push(.5,1);
 for(let j=0;j<seg;j++){idx.push(c0,j+1,j);const a=(n-1)*R+j;idx.push(c1,a,a+1);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
const SKIN_TEX={};
function dinoSkin(base,back,belly,kind){const key=[base,back,belly,kind].join();if(SKIN_TEX[key])return SKIN_TEX[key];
 const t=canvasTex((x,W,H)=>{const gr=x.createLinearGradient(0,0,W,0);gr.addColorStop(0,hex6(belly));gr.addColorStop(.2,hex6(base));gr.addColorStop(.5,hex6(back));gr.addColorStop(.8,hex6(base));gr.addColorStop(1,hex6(belly));x.fillStyle=gr;x.fillRect(0,0,W,H);
  x.fillStyle=rgba(back,.85);if(kind!=='mottle'){for(let y=6;y<H;y+=22){const w=W*(.13+.05*Math.sin(y));x.beginPath();x.moveTo(W/2-w,y);x.quadraticCurveTo(W/2,y+16,W/2+w,y);x.lineTo(W/2+w*.6,y+7);x.quadraticCurveTo(W/2,y+12,W/2-w*.6,y+7);x.closePath();x.fill();}}
  for(let i=0;i<260;i++){const u=Math.random(),v=Math.random();const top=Math.max(0,1-Math.abs(u-.5)*2.6);if(Math.random()>top+.15)continue;x.fillStyle=rgba(i%3?back:0xffffff,i%3?.35:.08);x.beginPath();x.ellipse(u*W,v*H,kind==='mottle'?rnd(4,9):rnd(1.5,3.5),kind==='mottle'?rnd(3,6):rnd(1.5,3),0,0,6.283);x.fill();}},256,256);t.wrapS=THREE.RepeatWrapping;SKIN_TEX[key]=t;return t;}
const INK=(()=>{const m=new THREE.MeshBasicMaterial({color:0x22170f,side:THREE.BackSide});m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>','vec3 transformed = vec3( position ) + normal * 0.03;');};m.customProgramCacheKey=()=>'ink';return bendMat(m);})();
function inkify(root){const L=[];root.traverse(o=>{if(o.isMesh&&!o.userData.noInk)L.push(o);});L.forEach(o=>{const s=new THREE.Mesh(o.geometry,INK);s.userData.noInk=true;s.userData.noShadow=true;o.add(s);});return root;}
const fine=o=>{o.userData.noInk=true;return o;};
function dinoParts(skinM){const loft=(cp,par,m=skinM,seg=18)=>{const o=mesh(loftGeo(cp,seg),m);par.add(o);return o;};
 const claw=(par,x,y,z,rx=Math.PI/2,s=1)=>{const c=fine(mesh(CONE(.045*s,.16*s,5),GLOSS(0x2a221a),x,y,z));c.rotation.x=rx;par.add(c);return c;};
 const eye=(par,x,y,z,r=.06)=>{const s=Math.sign(x);par.add(mesh(SPH(r,10,8),GLOSS(0xe8a92a,{roughness:.3}),x,y,z));const p=fine(mesh(SPH(r*.55,8,6),GLOSS(0x0c0a08),x+s*r*.72,y,z+r*.15));p.scale.set(.35,1.15,.55);par.add(p);par.add(fine(mesh(SPH(r*.22,6,5),GLOSS(0xffffff),x+s*r*.8,y+r*.35,z+r*.3)));};
 return{loft,claw,eye};}
function dinoMat(b,k,l,kind){return bendMat(new THREE.MeshStandardMaterial({map:dinoSkin(b,k,l,kind),roughness:.82}));}
const CHAR_BUILDERS={
 /* ---- jungle animals are real creatures (cute, drawn faces) ---- */
 monkey(){const g=new THREE.Group();const fur=GLOSS(0x9a5f2e),skin=GLOSS(0xf2cfa0);g.add(tw(mesh(SPH(.62,9,7),fur,0,1.15,0),o=>o.scale.set(1,1.15,.9)));g.add(tw(mesh(SPH(.42,8,6),skin,0,1.05,.35),o=>o.scale.set(1,1.1,.5)));
  for(const s of[-1,1]){const a=mesh(CYL(.13,.12,1.2,7),fur,s*.62,1.05,.1);a.rotation.z=s*.5;g.add(a);g.add(mesh(SPH(.17,7,5),skin,s*.92,.45,.15));g.add(mesh(BOX(.34,.5,.34),fur,s*.3,.35,0));g.add(mesh(BOX(.4,.16,.5),skin,s*.3,.08,.08));}
  const head=new THREE.Group();head.position.set(0,2.2,.05);g.add(head);g.userData.head=head;head.add(mesh(SPH(.55,9,7),fur));const face=mesh(SPH(.46,8,6),skin,0,-.05,.3);face.scale.set(1.15,.9,.6);head.add(face);for(const s of[-1,1]){head.add(mesh(SPH(.2,7,5),fur,s*.6,.05,0));head.add(mesh(SPH(.12,7,5),skin,s*.62,.05,.1));}addFace(head,{r:.6,style:'animal',iris:'#2b1a10'});
  const tail=mesh(new THREE.TorusGeometry(.5,.07,6,14,4.2),fur,.2,1,-.7);tail.rotation.y=Math.PI/2;g.add(tail);return g;},
 elephant(){const g=new THREE.Group();const sk=GLOSS(0x9fb4d8),pk=GLOSS(0xffc2d9);g.add(tw(mesh(SPH(.95,9,7),sk,0,1.25,-.1),o=>o.scale.set(1,.85,1.25)));for(const s of[-1,1])for(const u of[-1,1]){g.add(mesh(CYL(.26,.3,.95,8),sk,s*.5,.5,u*.6));g.add(mesh(CYL(.3,.3,.14,8),GLOSS(0xdfe6f2),s*.5,.07,u*.6));}
  const head=new THREE.Group();head.position.set(0,2.05,.9);g.add(head);g.userData.head=head;head.add(mesh(SPH(.62,9,7),sk));for(const s of[-1,1]){const e=mesh(SPH(.5,8,6),sk,s*.72,.05,-.1);e.scale.set(.3,1,1);head.add(e);const i=mesh(SPH(.36,8,6),pk,s*.76,.05,-.1);i.scale.set(.2,.8,.8);head.add(i);}
  const tr=mesh(CYL(.13,.2,1.2,8),sk,0,-.55,.5);tr.rotation.x=.45;head.add(tr);head.add(mesh(SPH(.17,7,5),sk,0,-1.05,.85));for(const s of[-1,1])head.add(tw(mesh(CONE(.08,.5,6),GLOSS(0xfff6e0),s*.28,-.3,.5),o=>o.rotation.x=Math.PI/2));addFace(head,{r:.64,style:'animal',iris:'#1e2a44',mouth:false});
  g.add(tw(mesh(CYL(.05,.05,.9,5),sk,0,1.3,-1.3),o=>o.rotation.x=.5));return g;},
 tiger(){const g=new THREE.Group();const fur=GLOSS(0xf08c2e),dk=GLOSS(0x3b2a22),wh=GLOSS(0xfff6e0);g.add(tw(mesh(SPH(.8,9,7),fur,0,1.15,-.1),o=>o.scale.set(.9,.8,1.5)));g.add(tw(mesh(SPH(.55,8,6),wh,0,.95,.1),o=>o.scale.set(.8,.6,1.4)));
  for(let i=0;i<5;i++){const st=mesh(BOX(.7,.16,.14),dk,0,1.5+Math.sin(i)*.1,-1+i*.45);st.rotation.x=.4;g.add(st);}
  for(const s of[-1,1])for(const u of[-1,1]){g.add(mesh(CYL(.17,.2,.85,7),fur,s*.42,.45,u*.65));g.add(tw(mesh(SPH(.22,7,5),wh,s*.42,.1,u*.65+.05),o=>o.scale.y=.6));}
  const head=new THREE.Group();head.position.set(0,1.95,1.05);g.add(head);g.userData.head=head;head.add(mesh(SPH(.58,9,7),fur));const mz=mesh(SPH(.36,8,6),wh,0,-.24,.4);mz.scale.set(1.2,.8,.8);head.add(mz);head.add(mesh(SPH(.09,6,5),dk,0,-.12,.72));for(const s of[-1,1]){head.add(mesh(SPH(.18,7,5),fur,s*.42,.45,-.05));head.add(mesh(BOX(.12,.22,.1),dk,s*.22,.42,.42));}addFace(head,{r:.62,y:.04,style:'animal',iris:'#3a2a12',mouth:false});
  const tail=mesh(CYL(.07,.05,1.4,6),fur,0,1.2,-1.6);tail.rotation.x=1.2;g.add(tail);return g;},
 toucan(){const g=new THREE.Group();const bk=GLOSS(0x1e1a18),ye=GLOSS(0xffd43b),or=GLOSS(0xff922b);g.add(tw(mesh(SPH(.78,9,7),bk,0,1.25,0),o=>o.scale.set(.9,1.1,1.1)));g.add(tw(mesh(SPH(.5,8,6),ye,0,1.2,.45),o=>o.scale.set(.9,1,.5)));
  for(const s of[-1,1]){const w=mesh(SPH(.5,8,6),bk,s*.7,1.3,-.1);w.scale.set(.35,.8,1.2);w.rotation.z=s*.3;g.add(w);g.add(mesh(CYL(.06,.06,.6,5),or,s*.25,.35,0));g.add(mesh(BOX(.36,.08,.5),or,s*.25,.05,.12));}
  const head=new THREE.Group();head.position.set(0,2.25,.15);g.add(head);g.userData.head=head;head.add(mesh(SPH(.5,9,7),bk));head.add(tw(mesh(SPH(.4,8,6),ye,0,-.05,.25),o=>o.scale.set(.9,.8,.6)));
  const beak=mesh(CONE(.3,1.5,8),or,0,-.05,1.05);beak.rotation.x=Math.PI/2;beak.scale.set(1,1,.7);head.add(beak);head.add(tw(mesh(CONE(.3,.5,8),GLOSS(0xe03131),0,-.05,1.75),o=>o.rotation.x=Math.PI/2));addFace(head,{r:.53,style:'animal',iris:'#14324a',mouth:false});
  g.add(tw(mesh(BOX(.3,.1,.9),bk,0,1.1,-.95),o=>o.rotation.x=.3));return g;},
 /* ---- dinosaurs: real silhouettes (horizontal T. rex, long-neck Brachiosaurus, frilled Triceratops, plated Stegosaurus) ---- */
 trex(){const g=new THREE.Group();const sk=dinoMat(0x7d6b4f,0x4b3c2b,0xcbb894),{loft,claw,eye}=dinoParts(sk);
  loft([[0,1.45,-3.3,.03,.03],[0,1.6,-2.6,.14,.16],[0,1.82,-1.8,.28,.32],[0,2.0,-1.0,.44,.5],[0,2.05,-.3,.56,.68],[0,1.95,.4,.5,.64],[0,2.05,.95,.36,.44],[0,2.42,1.25,.28,.32]],g);
  for(const s of[-1,1]){loft([[s*.42,2.05,-.35,.3,.4],[s*.56,1.55,-.12,.29,.33],[s*.6,1.1,.06,.19,.21],[s*.53,.6,-.3,.12,.13],[s*.5,.2,-.16,.1,.1],[s*.5,.1,.15,.11,.07],[s*.5,.08,.42,.07,.05]],g,sk,14);
   for(const dx of[-.09,0,.09])claw(g,s*.5+dx,.07,.5);claw(g,s*.5,.1,-.24,-Math.PI/2,.8);
   loft([[s*.36,1.85,.72,.09,.09],[s*.47,1.62,.86,.07,.07],[s*.46,1.56,1.08,.05,.05]],g,sk,10);claw(g,s*.47,1.55,1.14,Math.PI/2,.7);claw(g,s*.42,1.55,1.12,Math.PI/2,.7);}
  const head=new THREE.Group();head.position.set(0,2.55,1.3);g.add(head);g.userData.head=head;
  loft([[0,.1,-.18,.26,.3],[0,.17,.25,.33,.35],[0,.13,.7,.28,.28],[0,.05,1.05,.2,.2],[0,.01,1.24,.11,.12]],head);
  const jaw=new THREE.Group();jaw.position.set(0,-.08,0);head.add(jaw);g.userData.jaw=jaw;jaw.rotation.x=.12;
  loft([[0,-.04,-.05,.24,.12],[0,-.1,.5,.21,.1],[0,-.08,.95,.13,.07],[0,-.06,1.13,.06,.04]],jaw);
  jaw.add(fine(mesh(BOX(.3,.02,.9),GLOSS(0xb0475a),0,-.0,.5)));
  for(let i=0;i<7;i++){const z=.3+i*.12,w=.3-i*.025;for(const s of[-1,1]){const t=fine(mesh(CONE(.028,.11,4),GLOSS(0xfff4dc),s*w*.82,-.1,z));t.rotation.x=Math.PI;head.add(t);const b=fine(mesh(CONE(.022,.08,4),GLOSS(0xfff4dc),s*w*.7,-.02,z-.02));jaw.add(b);}}
  for(const s of[-1,1]){eye(head,s*.28,.3,.45);const br=mesh(SPH(.12,10,8),sk,s*.24,.42,.42);br.scale.set(.9,.42,1.7);br.rotation.z=-s*.25;head.add(br);head.add(fine(mesh(SPH(.03,6,5),GLOSS(0x1b120c),s*.08,.13,1.22)));}
  g.userData.top=3;return inkify(g);},
 bronto(){const g=new THREE.Group();const sk=dinoMat(0x8a8f72,0x575c45,0xc9c6a6,'mottle'),{loft,claw,eye}=dinoParts(sk);
  loft([[0,1.6,-3.9,.04,.04],[0,1.8,-3.1,.16,.18],[0,2.1,-2.2,.34,.38],[0,2.45,-1.3,.62,.66],[0,2.65,-.4,.78,.82],[0,2.75,.5,.74,.8],[0,3.05,1.2,.5,.55],[0,3.7,1.65,.32,.34],[0,4.5,1.95,.24,.26],[0,5.25,2.1,.2,.21],[0,5.55,2.15,.17,.18]],g);
  for(const s of[-1,1]){for(const [z,top,w] of[[.55,2.6,.27],[-.6,2.45,.31]]){loft([[s*.5,top,z,w,w*1.05],[s*.55,1.5,z+.03,w*.75,w*.75],[s*.55,.5,z-.03,w*.66,w*.66],[s*.55,.12,z+.03,w*.78,w*.72],[s*.55,.0,z+.03,w*.74,w*.68]],g,sk,14);for(const dx of[-.12,0,.12])claw(g,s*.55+dx,.06,z+w*.7,Math.PI/2,.7);}}
  const head=new THREE.Group();head.position.set(0,5.6,2.2);g.add(head);g.userData.head=head;
  loft([[0,0,-.18,.19,.19],[0,.05,.12,.22,.22],[0,0,.42,.16,.14],[0,-.05,.62,.1,.09]],head);const cr=mesh(SPH(.13,10,8),sk,0,.2,.12);cr.scale.set(1,.8,1.4);head.add(cr);
  for(const s of[-1,1])eye(head,s*.19,.09,.14,.045);head.add(fine(mesh(BOX(.2,.012,.25),GLOSS(0x3b2a22),0,-.06,.5)));
  g.scale.setScalar(.72);g.userData.top=5.8;return inkify(g);},
 triceratops(){const g=new THREE.Group();const sk=dinoMat(0x8b6f4e,0x5a4532,0xcdb48e),{loft,claw,eye}=dinoParts(sk);
  loft([[0,.95,-3.0,.04,.04],[0,1.1,-2.3,.17,.19],[0,1.35,-1.5,.42,.45],[0,1.6,-.7,.72,.72],[0,1.55,.2,.7,.68],[0,1.38,.85,.48,.48],[0,1.36,1.15,.4,.42]],g);
  for(const s of[-1,1])for(const [z,top,w,k] of[[.55,1.4,.22,.06],[-.75,1.55,.3,-.05]]){loft([[s*.5,top,z,w,w*1.1],[s*.6,.92,z+k,w*.8,w*.8],[s*.58,.45,z-k,w*.66,w*.66],[s*.58,.1,z,w*.82,w*.72],[s*.58,0,z,w*.8,w*.7]],g,sk,14);for(const dx of[-.1,0,.1])claw(g,s*.58+dx,.06,z+w*.7,Math.PI/2,.7);}
  const head=new THREE.Group();head.position.set(0,1.45,1.25);g.add(head);g.userData.head=head;
  loft([[0,0,-.12,.42,.42],[0,-.02,.3,.36,.38],[0,-.12,.7,.24,.28],[0,-.26,1.0,.14,.18],[0,-.36,1.14,.05,.08]],head);
  const beak=fine(mesh(CONE(.09,.28,8),GLOSS(0x3b2a22),0,-.36,1.15));beak.rotation.x=Math.PI/2+.5;head.add(beak);
  const fs=new THREE.Shape();fs.moveTo(-1.0,-.1);for(let i=0;i<=12;i++){const a=Math.PI*(1-i/12),r=1+(i%2?.07:0);fs.lineTo(Math.cos(a)*r*1.02,Math.sin(a)*r*.92);}fs.lineTo(1.0,-.1);fs.closePath();
  const frill=mesh(new THREE.ExtrudeGeometry(fs,{depth:.07,bevelEnabled:true,bevelThickness:.03,bevelSize:.03,bevelSegments:2,curveSegments:6}),GLOSS(0xa6552e),0,.22,-.28);frill.rotation.x=-.62;head.add(frill);
  for(const s of[-1,1]){const sp=fine(mesh(new THREE.CircleGeometry(.2,20),GLOSS(0xf0c46a),s*.48,.45,.11));frill.add(sp);const sp2=fine(mesh(new THREE.CircleGeometry(.1,16),GLOSS(0x5a2a14),s*.48,.45,.12));frill.add(sp2);}
  for(const s of[-1,1]){const h=mesh(CONE(.075,.95,10),GLOSS(0xf1e4c6),s*.2,.28+.34*.47,.25+.94*.47);h.rotation.x=Math.PI/2-.35;head.add(h);eye(head,s*.33,.12,.38,.055);}
  const nh=mesh(CONE(.06,.36,10),GLOSS(0xf1e4c6),0,.05,.86);nh.rotation.x=.5;head.add(nh);
  g.userData.top=2.6;return inkify(g);},
 stego(){const g=new THREE.Group();const sk=dinoMat(0x7d8450,0x4d5534,0xcdc59a),{loft,claw,eye}=dinoParts(sk);
  const sp=[[0,.85,-3.2,.03,.03],[0,1.15,-2.4,.15,.17],[0,1.6,-1.6,.36,.42],[0,2.0,-.8,.6,.75],[0,1.85,.1,.55,.62],[0,1.45,.8,.34,.38],[0,1.05,1.3,.18,.2]];loft(sp,g);
  for(const s of[-1,1]){loft([[s*.38,1.4,.7,.17,.19],[s*.42,.85,.75,.14,.14],[s*.4,.4,.7,.12,.12],[s*.4,.08,.75,.15,.13],[s*.4,0,.75,.14,.12]],g,sk,12);loft([[s*.45,1.9,-.85,.3,.36],[s*.5,1.2,-.7,.22,.22],[s*.5,.55,-.85,.15,.15],[s*.5,.08,-.8,.19,.16],[s*.5,0,-.8,.18,.15]],g,sk,12);
   for(const dx of[-.08,.08]){claw(g,s*.4+dx,.05,.86,Math.PI/2,.6);claw(g,s*.5+dx,.05,-.66,Math.PI/2,.7);}}
  const topAt=z=>{for(let i=0;i<sp.length-1;i++){const a=sp[i],b=sp[i+1];if(z>=a[2]&&z<=b[2]){const k=(z-a[2])/(b[2]-a[2]);return a[1]+(b[1]-a[1])*k+(a[4]+(b[4]-a[4])*k);}}return 1;};
  const pm=GLOSS(0xc0603a);let n=0;for(let z=1.05;z>-2.5;z-=.36,n++){const sz=.35+.55*Math.exp(-Math.pow((z+.75)/1.15,2));const ps=new THREE.Shape();ps.moveTo(0,-.1);ps.quadraticCurveTo(.55*sz,.45*sz,.12*sz,1.15*sz);ps.lineTo(-.12*sz,1.15*sz);ps.quadraticCurveTo(-.55*sz,.45*sz,0,-.1);
   const geo=new THREE.ExtrudeGeometry(ps,{depth:.06,bevelEnabled:true,bevelThickness:.02,bevelSize:.02,bevelSegments:1,curveSegments:6});geo.translate(0,0,-.03);const p=mesh(geo,pm,(n%2?.09:-.09),topAt(z)-.12,z);p.rotation.y=Math.PI/2;p.rotation.x=(n%2?.12:-.12);g.add(p);}
  for(const s of[-1,1])for(const [z,y] of[[-2.55,1.25],[-2.85,1.08]]){const k=mesh(CONE(.06,.6,8),GLOSS(0xf1e4c6),s*.28,y+.18,z);k.rotation.z=-s*.9;k.rotation.x=-.3;g.add(k);}
  const head=new THREE.Group();head.position.set(0,.98,1.5);g.add(head);g.userData.head=head;loft([[0,0,-.12,.16,.16],[0,-.02,.15,.15,.14],[0,-.07,.4,.09,.08]],head);for(const s of[-1,1])eye(head,s*.13,.05,.06,.035);
  g.userData.top=2.9;return inkify(g);},
 /* ---- space crew: every student keeps their own look (suit colour, hair, number) so a whole team of astronauts stays tellable apart ---- */
 astro(av){const o=avOpts(av),suit=o.torso??0xf8f9fa;const g=person(Object.assign({torso:0xf8f9fa,legs:0xdee2e6,longPants:true,pattern:'star',accent:0x4dabf7,shoes:0x868e96,hair:0x5c4030,style:'boy',iris:'#2c5aa0'},o,{torso:suit,legs:suit,accent:suit===0xf8f9fa?0x4dabf7:0xffffff,pattern:o.pattern==='plain'?'star':o.pattern}));const h=g.userData.head;
  const hel=mesh(SPH(.82,16,12),new THREE.MeshStandardMaterial({color:0xcfeaff,transparent:true,opacity:.22,roughness:.05,depthWrite:false}),0,.05,0,false);bendMat(hel.material);hel.renderOrder=3;hel.userData.noInk=true;h.add(hel);
  h.add(tw(mesh(new THREE.TorusGeometry(.72,.1,10,32),GLOSS(0xf8f9fa),0,-.62,0),o=>o.rotation.x=Math.PI/2));g.add(mesh(BOX(.7,.8,.36),GLOSS(0xdee2e6),0,1.15,-.42));return g;},
 rocket(av){const o=avOpts(av),c=o.torso??0xff6b6b;const g=person(Object.assign({skin:SKINS[2],torso:0xff6b6b,legs:0xf8f9fa,longPants:true,pattern:'stripes',accent:0xffffff,shoes:0xf8f9fa,hair:0x1e1a18,style:'bob',iris:'#3b2414'},o));const h=g.userData.head;
  h.add(mesh(CYL(.5,.66,.34,16),GLOSS(0xf8f9fa),0,.66,-.02));h.add(mesh(CONE(.5,.75,16),GLOSS(c),0,1.2,-.02));h.add(mesh(SPH(.12,10,8),GLOW(0x74c0fc,0x4dabf7,.8),0,.7,.55));
  const pack=new THREE.Group();pack.position.set(0,1.15,-.42);g.add(pack);pack.add(mesh(CYL(.2,.2,.8,14),GLOSS(0xf8f9fa),-.18,0,0));pack.add(mesh(CYL(.2,.2,.8,14),GLOSS(0xf8f9fa),.18,0,0));
  for(const s of[-1,1]){const f=mesh(CONE(.15,.5,10),GLOW(0xffb703,0xff922b,1.1),s*.18,-.66,0,false);f.rotation.x=Math.PI;f.userData.flame=true;f.userData.noInk=true;pack.add(f);}return g;},
 alien(av){const o=avOpts(av);const g=person(Object.assign({torso:0xb197fc,legs:0x5f3dc4,pattern:'dots',accent:0xe5dbff,shoes:0x5f3dc4},o,{skin:0x7bdc7f,hair:null,face:'alien'}));const h=g.userData.head;
  for(const s of[-1,1]){const a=mesh(CYL(.035,.035,.6,6),GLOSS(0x7bdc7f),s*.25,.86,0);a.rotation.z=s*-.4;h.add(a);h.add(mesh(SPH(.11,8,6),GLOW(0xffd43b,0xffd43b,.9),s*.38,1.15,0));}return g;},
 robot(av){const o=avOpts(av),lamp=o.hair??0xff6b6b;const g=person(Object.assign({torso:0x74c0fc,legs:0x495057,accent:0xffffff,shoes:0x343a40},o,{skin:0xadb5bd,robot:true,pattern:'num',num:av?String(av.n||7):'R2'}));const h=g.userData.head;
  h.add(mesh(new THREE.BoxGeometry(1.15,.95,.95,4,4,4),GLOSS(0xced4da),0,0,0));h.add(mesh(BOX(.95,.55,.06),GLOSS(0x1e2433),0,.02,.48));
  for(const s of[-1,1]){const e=mesh(SPH(.1,10,8),GLOW(0x74c0fc,0x4dabf7,1.4),s*.22,.06,.5,false);e.scale.z=.4;h.add(e);}h.add(mesh(BOX(.3,.05,.03),GLOW(0x74c0fc,0x4dabf7,1.2),0,-.14,.52,false));
  h.add(mesh(CYL(.04,.04,.4,6),GLOSS(0xadb5bd),0,.66,0));h.add(mesh(SPH(.1,8,6),GLOW(lamp,lamp,1),0,.9,0));for(const s of[-1,1])h.add(tw(mesh(CYL(.12,.12,.12,12),GLOSS(0x868e96),s*.62,0,0),o=>o.rotation.z=Math.PI/2));
  g.userData.top=2.7;return g;},
 /* ---- Hsinchu: students; without a chosen look the four slots fall back to neutral presets ---- */
 kid(av,x={}){const g=person(Object.assign({skin:SKINS[1],torso:0xffd43b,accent:0x40c057,pattern:'stripes',legs:0x3b5bdb,shoes:0xe03131,hair:0x4a2c1a,style:'boy',iris:'#3b2414'},avOpts(av),x.glasses&&!av?{glasses:0x1e2433}:{}));const h=g.userData.head;
  if(x.cap&&!av){h.add(mesh(new THREE.SphereGeometry(.74,28,12,0,6.283,0,1.05),GLOSS(x.cap),0,.08,-.02));h.add(tw(mesh(CYL(.4,.4,.05,20),GLOSS(x.cap),0,.52,.42),o=>o.scale.set(1,1,.8)));}
  if(x.bag)g.add(mesh(BOX(.6,.7,.3),GLOSS(x.bag),0,1.12,-.42));return g;},
 kidA(av){return CHAR_BUILDERS.kid(av||{sk:1,hs:0,hc:1,sh:2,pt:1,n:1},{cap:0x339af0,bag:0xff922b});},
 kidB(av){return CHAR_BUILDERS.kid(av||{sk:0,hs:2,hc:2,sh:5,pt:4,n:7},{});},
 kidC(av){return CHAR_BUILDERS.kid(av||{sk:2,hs:3,hc:0,sh:3,pt:2,n:3},{glasses:true});},
 kidD(av){return CHAR_BUILDERS.kid(av||{sk:3,hs:4,hc:0,sh:0,pt:3,n:5},{bag:0x40c057});}
};
const CHAR_CLASS={monkey:'animal',elephant:'animal',tiger:'animal',toucan:'animal',trex:'dino',bronto:'dino',triceratops:'dino',stego:'dino',astro:'space',rocket:'space',alien:'space',robot:'space',kidA:'hero',kidB:'hero',kidC:'hero',kidD:'hero'};
/* who lives where: the stage shows scene-native creatures, 4 per world */
const CHAR_SETS={jungle:['monkey','elephant','tiger','toucan'],dino:['trex','bronto','triceratops','stego'],space:['astro','rocket','alien','robot'],town:['kidA','kidB','kidC','kidD']};
function buildChar(id,av){const g=(CHAR_BUILDERS[id]||CHAR_BUILDERS.monkey)(av);g.traverse(o=>{if(o.isMesh&&!o.userData.noShadow){o.castShadow=true;o.receiveShadow=true;}});return g;}
