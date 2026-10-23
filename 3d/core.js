/* ===== core: renderer, helpers, materials ===== */
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const stage=document.getElementById('stage');
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(2,devicePixelRatio));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
stage.appendChild(renderer.domElement);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(38,1,.1,500);
const sun=new THREE.DirectionalLight(0xfff6e0,1.5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-0.0006;sun.shadow.normalBias=.03;
Object.assign(sun.shadow.camera,{left:-32,right:32,top:32,bottom:-32,near:1,far:120});sun.shadow.camera.updateProjectionMatrix();scene.add(sun);
const hemi=new THREE.HemisphereLight(0xd6f0ff,0x5fae4a,.75);scene.add(hemi);
const fill=new THREE.DirectionalLight(0xbfe3ff,.35);fill.position.set(-20,10,-16);scene.add(fill);
const M=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.6,metalness:0},o));
const GLOSS=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.35,metalness:.05},o));
const GLOW=(c,e,i=.8,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,emissive:e,emissiveIntensity:i,roughness:.4},o));
const rnd=(a,b)=>a+Math.random()*(b-a);
const mesh=(g,m,x=0,y=0,z=0,sh=true)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=sh;o.receiveShadow=true;return o;};
const SPH=(r,a=20,b=14)=>new THREE.SphereGeometry(r,a,b);
const CYL=(a,b,h,s=16)=>new THREE.CylinderGeometry(a,b,h,s);
const BOX=(a,b,c)=>new THREE.BoxGeometry(a,b,c);
const CONE=(r,h,s=16)=>new THREE.ConeGeometry(r,h,s);
function lathe(pts,seg=64){return new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),seg);}
function capsule(r,h,m){const g=new THREE.Group();g.add(mesh(CYL(r,r,h,20),m,0,0,0));g.add(mesh(SPH(r),m,0,h/2,0));g.add(mesh(SPH(r),m,0,-h/2,0));return g;}
/* sky dome with vertex gradient */
let sky=null;
function setSky(top,hor,fogCol,fogNear=60,fogFar=140){if(sky)scene.remove(sky);const g=new THREE.SphereGeometry(220,32,16);const pos=g.attributes.position,col=[];const T=new THREE.Color(top),H=new THREE.Color(hor);
 for(let i=0;i<pos.count;i++){const y=pos.getY(i)/220;const c=H.clone().lerp(T,Math.max(0,Math.min(1,(y+.1)*1.3)));col.push(c.r,c.g,c.b);}
 g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));sky=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,fog:false}));scene.add(sky);scene.fog=new THREE.Fog(fogCol,fogNear,fogFar);}
/* canvas sprites */
function canvasTex(draw,w=512,h=160){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=8;t.encoding=THREE.sRGBEncoding;return t;}
function rr(x,X,Y,W,H,R){if(x.roundRect){x.beginPath();x.roundRect(X,Y,W,H,R);x.fill();}else{x.fillRect(X,Y,W,H);}}
function labelSprite(name,color){const t=canvasTex((x,w,h)=>{x.fillStyle='#fff';rr(x,6,34,w-12,92,46);x.fillStyle=color;rr(x,14,42,w-28,76,38);x.fillStyle='#fff';x.font='900 56px Nunito,"Baloo 2",sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(name,w/2,82);});const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true}));s.scale.set(3.8,1.19,1);return s;}
function bubbleSprite(name,color){const t=canvasTex((x,w,h)=>{x.fillStyle=color;rr(x,10,8,w-20,132,46);x.fillStyle='#fff';rr(x,20,18,w-40,112,38);x.beginPath();x.moveTo(w/2-28,128);x.lineTo(w/2,170);x.lineTo(w/2+28,128);x.closePath();x.fillStyle='#fff';x.fill();x.fillStyle=color;x.font='900 64px Nunito,"Baloo 2",sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(name,w/2,76);},512,176);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true}));s.scale.set(3.6,1.24,1);return s;}
function hpSprite(){const c=document.createElement('canvas');c.width=512;c.height=72;const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true}));s.scale.set(3.2,.45,1);
 s.userData.draw=(pct)=>{const x=c.getContext('2d');x.clearRect(0,0,512,72);x.fillStyle='#fff';rr(x,8,8,496,56,28);x.fillStyle='#e9ecef';rr(x,18,18,476,36,18);x.fillStyle=pct<.35?'#ff6b6b':'#51cf66';rr(x,18,18,Math.max(36,476*Math.max(0,pct)),36,18);t.needsUpdate=true;};s.userData.draw(1);return s;}
function textSprite(txt,size=1.7){const t=canvasTex((x,w,h)=>{x.font='200px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,w/2,h/2+10);},256,256);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true}));s.scale.set(size,size,1);return s;}
/* animation + particles */
const anims=[];function animate(dur,fn,done){anims.push({t:0,dur,fn,done});}
const parts=[];const partGeos=[SPH(.16,8,6),BOX(.24,.24,.24),new THREE.OctahedronGeometry(.2)];const partMats={};
function spawn(pos,color,n=18,speed=6,up=5,life=1.1){const m=partMats[color]||(partMats[color]=GLOSS(color,{emissive:color,emissiveIntensity:.35}));for(let i=0;i<n;i++){const o=new THREE.Mesh(partGeos[i%3],m);o.position.copy(pos);o.userData={v:new THREE.Vector3(rnd(-1,1)*speed,rnd(.3,1)*up+2,rnd(-1,1)*speed),life:life*rnd(.7,1.3),rot:new THREE.Vector3(rnd(-5,5),rnd(-5,5),rnd(-5,5))};scene.add(o);parts.push(o);}}
function ring(pos,color){const r=new THREE.Mesh(new THREE.TorusGeometry(1,.12,10,48),GLOSS(color,{emissive:color,emissiveIntensity:.6,transparent:true}));r.rotation.x=Math.PI/2;r.position.copy(pos);r.position.y+=.3;scene.add(r);animate(.7,k=>{r.scale.setScalar(1+k*5);r.material.opacity=1-k;},()=>scene.remove(r));}
function banner(t,c){const b=document.createElement('div');b.className='banner';b.style.setProperty('--bc',c||'#e03131');b.innerHTML='<span></span>';b.firstChild.textContent=t;document.body.appendChild(b);setTimeout(()=>b.remove(),2000);}
