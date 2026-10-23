// Minimal THREE + DOM stub to smoke-test construction logic (not rendering)
function vec(){const v={x:0,y:0,z:0};const fn={set(x,y,z){v.x=x;v.y=y;v.z=z;return p;},copy(o){v.x=o.x;v.y=o.y;v.z=o.z;return p;},clone(){return mkv(v.x,v.y,v.z);},setY(y){v.y=y;return p;},setScalar(s){v.x=v.y=v.z=s;return p;},add(o){v.x+=o.x;v.y+=o.y;v.z+=o.z;return p;},lerpVectors(a,b,k){v.x=a.x+(b.x-a.x)*k;v.y=a.y+(b.y-a.y)*k;v.z=a.z+(b.z-a.z)*k;return p;},addScaledVector(o,s){v.x+=o.x*s;v.y+=o.y*s;v.z+=o.z*s;return p;},multiplyScalar(s){v.x*=s;v.y*=s;v.z*=s;return p;},randomDirection(){v.x=Math.random()-.5;v.y=Math.random()-.5;v.z=Math.random()-.5;return p;},toArray(){return[v.x,v.y,v.z];}};
 const p=new Proxy(v,{get(t,k){if(k in fn)return fn[k];return t[k];},set(t,k,val){t[k]=val;return true;}});return p;}
function mkv(x,y,z){const p=vec();p.set(x,y,z);return p;}
function obj(){const o={position:vec(),rotation:vec(),scale:mkv(1,1,1),children:[],userData:{},material:null,geometry:null,castShadow:false,receiveShadow:false,isMesh:false,
  add(...c){c.forEach(x=>{if(!x)throw new Error('add undefined');o.children.push(x);});return o;},remove(c){o.children=o.children.filter(x=>x!==c);return o;},traverse(f){f(o);o.children.forEach(c=>c.traverse&&c.traverse(f));},lookAt(){},updateProjectionMatrix(){},updateMatrix(){},setMatrixAt(){},getY(i){return 0;}};
 return o;}
function geo(){const g=obj();g.attributes={position:{array:new Float32Array(30),count:10,needsUpdate:false,getY(){return 0;}},uv:{array:new Float32Array(48),count:24,needsUpdate:false}};g.translate=()=>g;g.scale=(a,b,c)=>g;g.setAttribute=()=>g;return g;}
const THREE=new Proxy({},{get(t,name){
 if(name==='Vector3')return function(x=0,y=0,z=0){return mkv(x,y,z);};
 if(name==='Vector2')return function(x,y){return{x,y};};
 if(name==='Color')return function(c){const o={r:1,g:1,b:1,set(){return o;},clone(){return o;},lerp(){return o;},convertSRGBToLinear(){return o;}};return o;};
 if(name==='Object3D'||name==='Group'||name==='Scene'||name==='Sprite'||name==='Points'||name==='PerspectiveCamera')return function(){const o=obj();o.matrix={};if(name==='Sprite'){o.material=arguments[0]||{};}return o;};
 if(name==='Mesh'||name==='InstancedMesh')return function(g,m){const o=obj();o.isMesh=true;o.geometry=g;o.material=m;o.instanceMatrix={};return o;};
 if(/Geometry$/.test(name))return function(){return geo();};
 if(/Material$/.test(name))return function(p){const o=Object.assign({color:{set(){}},emissive:{set(){}},opacity:1},p||{});return o;};
 if(/Light$/.test(name))return function(){const o=obj();o.color={set(){}};o.groundColor={set(){}};o.intensity=1;o.shadow={mapSize:{set(){}},camera:{updateProjectionMatrix(){}},bias:0,normalBias:0};return o;};
 if(name==='WebGLRenderer')return function(){return{domElement:{},setPixelRatio(){},setSize(){},render(){},shadowMap:{},outputEncoding:0,toneMapping:0,toneMappingExposure:1};};
 if(name==='CanvasTexture')return function(){return{needsUpdate:false,anisotropy:1,encoding:0,wrapS:0,wrapT:0,repeat:{set(){}}};};
 if(name==='Float32BufferAttribute')return function(){return{};};
 if(name==='Fog')return function(){return{};};
 if(name==='Clock')return function(){let t=0;return{getDelta(){t+=.016;return .016;},get elapsedTime(){return t;}};};
 return 1;}});
const els={};function el(){return{textContent:'',innerText:'',innerHTML:'',style:{setProperty(){},width:''},classList:{toggle(){},add(){},remove(){}},appendChild(){},addEventListener(){},remove(){},dataset:{},querySelectorAll(){return[];},firstChild:{textContent:''},getContext(){return new Proxy({},{get(){return()=>{};}});},width:0,height:0};}
global.document={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),body:el()};
global.window=global;global.addEventListener=()=>{};global.innerWidth=1440;global.innerHeight=900;global.devicePixelRatio=1;global.matchMedia=()=>({matches:false});global.requestAnimationFrame=()=>{};global.setTimeout=(f)=>{};
global.THREE=THREE;
const fs=require('fs');const s=fs.readFileSync(require('path').join(__dirname,'habitat-3d.html'),'utf8');const code=s.match(/<script>\n([\s\S]*?)<\/script>/)[1];
// expose internals by stripping the IIFE wrapper
const inner=code.replace(/^\(function\(\)\{\n/,'').replace(/\}\)\(\);\s*$/,'');
new Function('THREE',inner+`
;['jungle','dino','space','town'].forEach(k=>{loadScene(k);Object.keys(CHAR_BUILDERS).forEach(id=>buildChar(id));Object.keys(HAB).forEach(c=>HAB[c].forEach(f=>f()));BOSS[k]();summonBoss();
 const reds=players.filter(p=>p.userData.p.team===0),blues=players.filter(p=>p.userData.p.team===1);attack(reds[0],blues[0],3);levelUp(reds[1]);knockOut(blues[1]);revive(blues[1]);
 for(let i=0;i<80;i++){const dt=.03,t=i*dt;anims.forEach(a=>{a.t+=dt;a.fn(Math.min(1,a.t/a.dur));});for(let j=anims.length-1;j>=0;j--)if(anims[j].t>=anims[j].dur){const a=anims.splice(j,1)[0];a.done&&a.done();}env.tick(dt,t);}
 resetAll();});loadScene('space');summonBoss();for(let i=0;i<5;i++)loop();console.log('smoke ok: scenes, chars, habitats, bosses, actions');`)(THREE);
