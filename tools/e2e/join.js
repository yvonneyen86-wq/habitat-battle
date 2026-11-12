// shared setup: host + students joined via the real UI
const {world,sleep,btns}=require('./lib');
async function setup(names=[['Amy'],['Ben','Cal'],['Dan'],['Eve']],opts={}){
  const w=await world(opts);
  const host=await w.mk('host',w.BASE+(opts.hostQ||''));
  await host.waitForFunction(()=>typeof S!=='undefined'&&S&&S.code&&H.status==='on');
  const code=await host.evaluate(()=>S.code);
  const studs=[];
  for(let i=0;i<names.length;i++){
    const n=names[i];const p=await w.mk('stu-'+n[0],w.BASE+'?join='+code,{width:1024,height:768});
    await p.waitForSelector('#j-name');
    await p.fill('#j-name',n[0]);if(n[1])await p.fill('#j-pair',n[1]);if(n[2])await p.fill('#j-pair2',n[2]);
    await p.click('[data-jnav="1"]');await p.click(`[data-team="${i%2}"]`);await p.waitForSelector('[data-char]');
    const chars=['lion','trex','astro','wizard','panda','robot'];
    await p.click(`[data-char="${chars[i%chars.length]}"]`);await p.waitForSelector('#j-go');await p.click('#j-go');
    await p.waitForFunction(()=>ST.me&&ST.view!=='join');
    studs.push(p);
  }
  return {w,host,studs,code};
}
module.exports={setup};
if(require.main===module)(async()=>{
  const {w,host,studs}=await setup();
  console.log('players',await host.evaluate(()=>Object.values(S.players).map(p=>p.name+':'+p.team+':'+p.online)));
  console.log('HOST BTNS',await btns(host));
  console.log('STU BTNS',await btns(studs[0]));
  console.log('ERRORS',w.errors);await w.close();
})();
