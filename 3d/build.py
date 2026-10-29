import re, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
head=r'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Yvonne English Arena 3D</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Nunito:wght@700;900&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<style>
/* Layout: full-bleed 3D stage for an interactive whiteboard; HUD plates float on top */
:root{color-scheme:light;--ink:#1e2433;--muted:#667085;--deep:#1f8a4c;--gold:#ffb703;--display:"Baloo 2","Arial Rounded MT Bold",system-ui,sans-serif;--body:"Nunito","Segoe UI",system-ui,sans-serif;--bg:#6fc8ff}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#1b2a3a}}
:root[data-theme="dark"]{--bg:#1b2a3a}
html,body{height:100%}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--body);font-weight:700;overflow:hidden;touch-action:none}
#stage{position:fixed;inset:0}
canvas{display:block}
.hud{position:fixed;left:0;right:0;top:0;padding:12px max(14px,env(safe-area-inset-right,0px)) 0 max(14px,env(safe-area-inset-left,0px));display:flex;gap:10px;align-items:flex-start;pointer-events:none;transition:opacity .45s,transform .45s}
.glass{background:rgba(255,255,255,.82);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.9);box-shadow:0 6px 18px rgba(30,36,51,.16)}
.plate{border-radius:99px;padding:6px 16px 6px 10px;display:flex;align-items:center;gap:8px}
.plate h1{font-family:var(--display);margin:0;font-size:1.25rem;color:var(--deep);line-height:1}
.plate p{display:none}
.sp{flex:1}
.q{border-radius:18px;padding:8px 14px;max-width:min(460px,60vw)}
.q .k{display:inline-block;background:#3b5bdb;color:#fff;border-radius:99px;padding:1px 10px;font-size:.68rem;letter-spacing:.05em}
.q .t{font-family:var(--display);font-size:1.12rem;line-height:1.1;margin-top:3px}
.fab{pointer-events:auto;font:inherit;font-family:var(--display);font-size:1rem;border-radius:99px;padding:8px 16px;cursor:pointer;color:var(--ink);border:1px solid rgba(255,255,255,.9)}
.fab:hover{background:#fff}
/* drawer */
.drawer{position:fixed;top:0;right:0;bottom:0;width:min(420px,92vw);z-index:20;padding:16px;display:flex;flex-direction:column;gap:12px;overflow:auto;border-radius:24px 0 0 24px;transform:translateX(105%);transition:transform .35s cubic-bezier(.2,.9,.3,1)}
.drawer.open{transform:none}
.drawer .dh{display:flex;align-items:center;justify-content:space-between}.drawer .dh b{font-family:var(--display);font-size:1.3rem}
.drawer .dh button{font:inherit;border:0;background:#f1f3f5;border-radius:99px;width:36px;height:36px;cursor:pointer;font-size:1rem}
.drawer h3{margin:4px 0 0;font-family:var(--display);font-size:1rem;color:var(--muted)}
.sc{pointer-events:auto;display:grid;grid-template-columns:1fr 1fr;gap:8px}
.sc button{font:inherit;font-family:var(--display);font-size:1rem;border:2px solid #e9ecef;border-radius:14px;padding:10px;cursor:pointer;background:#fff;color:var(--ink)}
.sc button.sel{background:#3b5bdb;border-color:#3b5bdb;color:#fff}
.bases{pointer-events:auto;display:grid;gap:10px;font-size:.88rem}
.bases .row{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.bases .row>b{font-family:var(--display);margin-right:4px}
.bases .chip{font-family:var(--display);color:#fff;background:var(--tc);border-radius:99px;padding:3px 12px;min-width:70px;text-align:center}
.bases button{font:inherit;font-size:.84rem;border:2px solid #e9ecef;background:#fff;border-radius:10px;padding:5px 10px;cursor:pointer;color:var(--ink)}
.bases button.sel{background:var(--tc);border-color:var(--tc);color:#fff}.bases button.taken{opacity:.35}
.scrim{position:fixed;inset:0;z-index:19;background:rgba(20,24,40,.18);opacity:0;pointer-events:none;transition:opacity .3s}.scrim.open{opacity:1;pointer-events:auto}
/* bottom: slim team chips + control dock */
.teams{position:fixed;left:0;right:0;bottom:0;padding:0 max(14px,env(safe-area-inset-right,0px)) calc(12px + env(safe-area-inset-bottom,0px)) max(14px,env(safe-area-inset-left,0px));display:flex;gap:10px;justify-content:space-between;align-items:flex-end;pointer-events:none;flex-wrap:wrap;transition:opacity .45s,transform .45s}
.tcards{display:flex;gap:8px;flex-wrap:wrap}
.tcard{border-radius:16px;padding:6px 12px;min-width:132px;border-left:6px solid var(--tc)}
.tcard b{font-family:var(--display);font-size:1rem;color:var(--tc)}.tcard small{display:block;color:var(--muted);font-size:.72rem;line-height:1.1}
.bar{height:8px;border-radius:99px;background:#e9ecef;overflow:hidden;margin-top:4px}
.bar i{display:block;height:100%;background:linear-gradient(180deg,#8ce99a,#2f9e44);transition:width .5s}
.ctr{pointer-events:auto;display:flex;gap:8px;flex-wrap:wrap;justify-content:center;border-radius:20px;padding:8px}
.ctr button{font:inherit;font-family:var(--display);font-size:1.05rem;border:0;border-radius:14px;padding:10px 16px;cursor:pointer;background:#f1f3f5;color:var(--ink);box-shadow:0 3px 0 rgba(0,0,0,.16)}
.ctr button:active{transform:translateY(3px);box-shadow:none}
.ctr button.war{background:#e03131;color:#fff}.ctr button.gold{background:var(--gold);color:#3a2a00}.ctr button.boss{background:#7048e8;color:#fff}.ctr button.ok{background:#40c057;color:#fff}
.ctr button.sky{background:#1c7ed6;color:#fff}.ctr button.back{display:none;background:#343a40;color:#fff}body.spot .ctr button.back{display:inline-block}
.spottag{position:fixed;left:50%;top:96px;transform:translateX(-50%);z-index:6;display:none;font-family:var(--display);font-size:1.5rem;font-weight:900;color:#fff;background:var(--tc,#1c7ed6);padding:10px 26px;border-radius:999px;box-shadow:0 6px 18px rgba(0,0,0,.18),inset 0 -4px 0 rgba(0,0,0,.15);pointer-events:none}body.spot .spottag{display:block}body.spot .tcards{opacity:0;pointer-events:none}
.ctr button:focus-visible,.sc button:focus-visible,.fab:focus-visible{outline:3px solid #3b5bdb}
/* cinematic mode: HUD slides away, letterbox bars slide in */
.lb{position:fixed;left:0;right:0;height:9vh;background:#0b0d14;z-index:15;pointer-events:none;transition:transform .5s cubic-bezier(.2,.9,.3,1)}
.lb.top{top:0;transform:translateY(-100%)}.lb.bot{bottom:0;transform:translateY(100%)}
body.cine .lb{transform:none}
body.cine .hud{opacity:0;transform:translateY(-30px)}
body.cine .teams{opacity:0;transform:translateY(30px);pointer-events:none}
body.cine .teams *{pointer-events:none}
.banner{position:fixed;left:0;right:0;top:30%;z-index:16;text-align:center;pointer-events:none;animation:ban 2s cubic-bezier(.2,1,.3,1) forwards}
.banner span{display:inline-block;font-family:var(--display);font-size:clamp(2.4rem,9vw,6rem);line-height:1;color:#fff;background:var(--bc,#e03131);padding:.18em .7em;border-radius:.45em;box-shadow:0 .22em 0 rgba(0,0,0,.22);border:.1em solid #fff;transform:rotate(-2deg)}
@keyframes ban{0%{opacity:0;transform:scale(.3)}15%{opacity:1;transform:scale(1.1)}25%{transform:scale(1)}80%{opacity:1}100%{opacity:0;transform:scale(1.3)}}
@media (prefers-reduced-motion:reduce){.banner{animation:none}}
</style>
</head>
<body>
<div id="stage"></div>
<div class="lb top"></div><div class="lb bot"></div>
<div class="hud"><div class="plate glass"><h1 id="title">🌴 Jungle Safari</h1><p class="note">3D prototype with sample students</p></div><span class="sp"></span><div class="q glass"><span class="k">⌨️ TYPE A FULL SENTENCE · ROUND 3</span><div class="t">What did you do last weekend?</div></div><button class="fab glass" id="fab">🗺️ Worlds &amp; Bases</button></div>
<div class="scrim" id="scrim"></div>
<div class="spottag" id="spottag"></div>
<aside class="drawer glass" id="drawer" aria-label="Worlds and bases"><div class="dh"><b>🗺️ Worlds &amp; Bases</b><button id="dclose" aria-label="Close">✕</button></div>
 <h3>World</h3><div class="sc"><button data-s="jungle" class="sel">🌴 Jungle</button><button data-s="dino">🌋 Dino</button><button data-s="space">🪐 Solar System</button><button data-s="town">🏙️ Hsinchu</button></div>
 <h3>Teams &amp; bases</h3><div class="bases" id="bases"></div></aside>
<div class="teams">
  <div class="tcards" id="tcards"></div>
  <div class="ctr glass"><button class="war" data-a="attack">⚔️ Attack</button><button class="gold" data-a="level">🔨 Level up</button><button class="ok" data-a="heal">❤️ Repair</button><button class="boss" data-a="boss">👹 Boss</button><button class="sky" data-a="one">🎤 Student</button><button class="sky" data-a="team">👥 Team</button><button class="ok" data-a="ok">✅ Correct</button><button data-a="no">❌ Wrong</button><button class="back" data-a="back">↩ Island</button><button data-a="reset">↺ Reset</button></div>
</div>
<script>
(function(){
if(typeof THREE==='undefined'){document.querySelector('.note').textContent='3D library could not load.';return;}
'''
js=''.join(open(f).read()+'\n' for f in ['core.js','chars.js','habitats.js','scenes.js','game.js'])
out=head+js+'})();\n</script>\n</body>\n</html>\n'
open('habitat-3d.html','w').write(out)
# ---- embed the same bundle into ../index.html between the 3D-BUNDLE markers (index sets window.HB3D_EMBED before calling HB3D_INIT) ----
import os
ip=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html')
if os.path.exists(ip):
    h=open(ip).read();B='/*3D-BUNDLE-BEGIN*/';E='/*3D-BUNDLE-END*/'
    if B in h and E in h:
        a=h.index(B)+len(B);b=h.index(E)
        h=h[:a]+'\nwindow.HB3D_INIT=function(){\n'+js+'\nreturn HB3D_API;};\n'+h[b:]
        open(ip,'w').write(h);print('embedded into index.html',len(h))
print(len(out))
