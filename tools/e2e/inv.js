// invariant checks on host + students
const badTxt=()=>{const t=document.body.innerText;const out=[];const m=t.match(/.{0,40}(\bundefined\b|\bNaN\b|\[object Object\]|[㐀-鿿]).{0,40}/g);if(m)out.push(...m.slice(0,4));return out;};
const hostInv=()=>{const out=[];const walk=(o,p)=>{if(typeof o==='number'){if(!isFinite(o))out.push('non-finite '+p);return;}if(o&&typeof o==='object'){if(p.split('.').length>7)return;for(const k in o){if(k==='qText'||k==='bText'||k==='ltUnits')continue;walk(o[k],p+'.'+k);}}};walk(S,'S');
  Object.values(S.players).forEach(p=>{const mx=[0,10,15,20][p.lv]||0;if(!(p.coins>=0)||p.coins%1)out.push(p.name+' coins '+p.coins);if(!(p.hp>=0&&p.hp<=mx))out.push(p.name+' hp '+p.hp+'/'+mx+' lv '+p.lv);if(!(p.armor>=0&&p.armor<=12))out.push(p.name+' armor '+p.armor);['atk','def','heal'].forEach(k=>{if(!(p.inv[k]>=0&&p.inv[k]<=5))out.push(p.name+' inv.'+k+' '+p.inv[k]);});if(p.down&&p.hp>0&&S.phase==='battle')out.push(p.name+' down with hp '+p.hp);});
  return out;};
async function check(label,host,studs,errs,seen){
  const push=(x)=>{if(!seen.has(x)){seen.add(x);console.log('!! '+label+' :: '+x);}};
  for(const pg of [host,...studs]){if(pg.isClosed())continue;try{(await pg.evaluate(badTxt)).forEach(x=>push(`[${pg._name}] TEXT ${JSON.stringify(x)}`));}catch(e){push(`[${pg._name}] eval fail ${e.message.slice(0,80)}`);}}
  try{(await host.evaluate(hostInv)).forEach(x=>push('INV '+x));}catch(e){push('hostInv fail '+e.message.slice(0,200));}
  while(errs.length){push(errs.shift());}
}
module.exports={check};
