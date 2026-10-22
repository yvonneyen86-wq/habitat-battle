t=open('index.html').read()
for x in ['<!doctype html>\n','<html lang="en">\n','<head>\n','<meta charset="utf-8">\n','<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n','</head>\n','<body>\n','</body>\n','</html>\n']:
    assert x in t,x; t=t.replace(x,'',1)
t=t.replace('<title>Habitat Battle</title>','<title>Habitat Battle Preview</title>')
a="applyScene(S.scene);hostShell();render();startHost();"; assert a in t; t=t.replace(a,"applyScene(S.scene);hostShell();render();previewStart();")
b="changed();startHost();}"; assert b in t; t=t.replace(b,"changed();previewStart();}")
t=t.replace("store('habitat-host'","store('habitat-preview4'").replace("function save(){store('habitat-host',S);}","function save(){store('habitat-preview4',S);}")
t=t.replace("function initHost(){","""function previewStart(){
  H.status='wait';H.statusText='Preview mode';
  if(!Object.keys(S.players).length){
    [['Amy','lion',0,9,1,{atk:1,def:0,heal:1}],['Ben','trex',1,3,1,{atk:1,def:1,heal:0}],['Cindy','astro',0,1,1,{atk:0,def:2,heal:0}],['David','chef',1,6,3,{atk:1,def:0,heal:2}],['Emma','panda',0,2,3,{atk:1,def:1,heal:1}],['Frank','alien',1,0,2,{atk:2,def:0,heal:0}]]
      .forEach(([n,c,t,coins,lv,inv])=>{const pid=newPlayer(n,c,t,true);Object.assign(S.players[pid],{coins,lv,hp:HPMAX[lv],inv});});
    S.players.p1.items=2;S.showQR=false;S.log.push('Preview: press 📱 Student view to see the tablet screen.');
  }
  changed();renderHeader();
  setTimeout(()=>{if(!document.body.classList.contains('sv-on'))openStudentView(Object.keys(S.players)[0]);},400);
}
function initHost(){""",1)
open('preview.html','w').write(t)
print('preview built')
