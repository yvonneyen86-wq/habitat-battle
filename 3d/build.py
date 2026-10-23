import re, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
head=r'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Habitat Battle 3D</title>
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
.hud{position:fixed;left:0;right:0;top:0;padding:14px max(16px,env(safe-area-inset-right,0px)) 0 max(16px,env(safe-area-inset-left,0px));display:flex;gap:12px;align-items:flex-start;pointer-events:none;flex-wrap:wrap}
.plate{background:#fff;border-radius:22px;padding:10px 18px;box-shadow:0 6px 0 rgba(0,0,0,.14);border:4px solid #ffe08a}
.plate h1{font-family:var(--display);margin:0;font-size:1.7rem;color:var(--deep);line-height:1.05}
.plate p{margin:0;font-size:.85rem;color:var(--muted)}
.sp{flex:1}
.sc{pointer-events:auto;display:flex;gap:6px;background:#fff;border:4px solid #a5d8ff;border-radius:20px;padding:6px;box-shadow:0 6px 0 rgba(0,0,0,.14)}
.sc button{font:inherit;font-family:var(--display);font-size:1rem;border:0;border-radius:12px;padding:8px 12px;cursor:pointer;background:#f1f3f5;color:var(--ink)}
.sc button.sel{background:#3b5bdb;color:#fff}
.q{background:#fff;border-radius:20px;padding:10px 16px;max-width:min(560px,100%);box-shadow:0 6px 0 rgba(0,0,0,.14);border:4px solid #a5d8ff}
.q .k{display:inline-block;background:#3b5bdb;color:#fff;border-radius:99px;padding:2px 12px;font-size:.75rem;letter-spacing:.05em}
.q .t{font-family:var(--display);font-size:1.3rem;line-height:1.1;margin-top:4px}
.teams{position:fixed;left:0;right:0;bottom:0;padding:0 max(16px,env(safe-area-inset-right,0px)) calc(14px + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px));display:flex;gap:12px;justify-content:space-between;align-items:flex-end;pointer-events:none;flex-wrap:wrap}
.tcard{background:#fff;border-radius:20px;padding:10px 16px;border:4px solid var(--tc);min-width:170px;box-shadow:0 6px 0 rgba(0,0,0,.14)}
.tcard b{font-family:var(--display);font-size:1.2rem;color:var(--tc)}.tcard small{display:block;color:var(--muted);font-size:.78rem}.tcards{display:flex;gap:10px;flex-wrap:wrap}
.bases{pointer-events:auto;background:#fff;border:4px solid #ffe08a;border-radius:20px;padding:8px 12px;box-shadow:0 6px 0 rgba(0,0,0,.14);display:grid;gap:6px;font-size:.88rem}
.bases .row{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.bases .row>b{font-family:var(--display);margin-right:4px}
.bases .chip{font-family:var(--display);color:#fff;background:var(--tc);border-radius:99px;padding:2px 10px;min-width:62px;text-align:center}
.bases button{font:inherit;font-size:.82rem;border:2px solid #dee2e6;background:#f8f9fa;border-radius:10px;padding:4px 9px;cursor:pointer;color:var(--ink)}
.bases button.sel{background:var(--tc);border-color:var(--tc);color:#fff}.bases button.taken{opacity:.4}
.bar{height:12px;border-radius:99px;background:#e9ecef;overflow:hidden;margin-top:5px;box-shadow:inset 0 2px 0 rgba(0,0,0,.08)}
.bar i{display:block;height:100%;background:linear-gradient(180deg,#8ce99a,#2f9e44);transition:width .5s}
.ctr{pointer-events:auto;display:flex;gap:10px;flex-wrap:wrap;justify-content:center;background:#fff;border:4px solid #ffe08a;border-radius:22px;padding:10px;box-shadow:0 6px 0 rgba(0,0,0,.14)}
.ctr button{font:inherit;font-family:var(--display);font-size:1.15rem;border:0;border-radius:14px;padding:12px 18px;cursor:pointer;background:#f1f3f5;color:var(--ink);box-shadow:0 4px 0 rgba(0,0,0,.18)}
.ctr button:active{transform:translateY(3px);box-shadow:none}
.ctr button.war{background:#e03131;color:#fff}.ctr button.gold{background:var(--gold);color:#3a2a00}.ctr button.boss{background:#7048e8;color:#fff}.ctr button.ok{background:#40c057;color:#fff}
.ctr button:focus-visible,.sc button:focus-visible{outline:3px solid #3b5bdb}
.banner{position:fixed;left:0;right:0;top:38%;text-align:center;pointer-events:none;animation:ban 2s cubic-bezier(.2,1,.3,1) forwards}
.banner span{display:inline-block;font-family:var(--display);font-size:clamp(2.4rem,9vw,6rem);line-height:1;color:#fff;background:var(--bc,#e03131);padding:.18em .7em;border-radius:.45em;box-shadow:0 .22em 0 rgba(0,0,0,.22);border:.1em solid #fff;transform:rotate(-2deg)}
@keyframes ban{0%{opacity:0;transform:scale(.3)}15%{opacity:1;transform:scale(1.1)}25%{transform:scale(1)}80%{opacity:1}100%{opacity:0;transform:scale(1.3)}}
@media (prefers-reduced-motion:reduce){.banner{animation:none}}
</style>
</head>
<body>
<div id="stage"></div>
<div class="hud"><div class="plate"><h1 id="title">🌴 Jungle Safari</h1><p class="note">3D prototype with sample students · drag to look around · pinch or scroll to zoom</p></div><div class="sc"><button data-s="jungle" class="sel">🌴 Jungle</button><button data-s="dino">🌋 Dino</button><button data-s="space">🪐 Solar System</button><button data-s="town">🏙️ Hsinchu</button></div><div class="bases" id="bases"></div><span class="sp"></span><div class="q"><span class="k">⌨️ TYPE A FULL SENTENCE · ROUND 3</span><div class="t">What did you do last weekend?</div></div></div>
<div class="teams">
  <div class="tcards" id="tcards"></div>
  <div class="ctr"><button class="war" data-a="attack">⚔️ Attack</button><button class="gold" data-a="level">🔨 Level up</button><button class="ok" data-a="heal">❤️ Repair</button><button class="boss" data-a="boss">👹 Boss</button><button data-a="cheer">🎉 Cheer</button><button data-a="reset">↺ Reset</button></div>
</div>
<script>
(function(){
if(typeof THREE==='undefined'){document.querySelector('.note').textContent='3D library could not load.';return;}
'''
js=''.join(open(f).read()+'\n' for f in ['core.js','chars.js','habitats.js','scenes.js','game.js'])
out=head+js+'})();\n</script>\n</body>\n</html>\n'
open('habitat-3d.html','w').write(out)
print(len(out))
