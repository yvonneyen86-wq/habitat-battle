// in-page student bot: one action per call, returns a short description ('' = nothing to do)
module.exports=function bot(arg){const pRight=typeof arg==='number'?arg:arg.p,shop=typeof arg==='object'&&arg.shop;
  const root=document.querySelector('#s-root')||document.body;const vis=e=>e&&e.offsetParent!==null&&!e.disabled;
  const q=s=>[...root.querySelectorAll(s)].filter(vis);const rnd=a=>a[Math.floor(Math.random()*a.length)];const right=Math.random()<pRight;
  const click=e=>{e.click();return (e.dataset.sact||e.id)+':'+e.textContent.trim().slice(0,18);};
  const type=(el,txt)=>{el.value=txt;el.dispatchEvent(new Event('input',{bubbles:true}));};
  const SENT=['I like my family because they help me.','She goes to school every day.','We can see many animals in the forest and they are big.','dog','<b>hi</b> & "quotes" \'x\'','   ','I am happy.'];
  // sheets open? close shop sometimes
  let e;
  // Learning Time
  if((e=q('[data-sact="lt-place"]')).length){const s=right?e.sort((a,b)=>(+a.dataset.k)-(+b.dataset.k)):e.sort(()=>Math.random()-.5);return click(s[0])+' place';}
  if((e=q('[data-sact="lt-check"]')).length)return click(e[0]);
  if((e=q('[data-sact="lt-choice"]')).length)return click(rnd(e));
  if((e=q('[data-sact="lt-bucket"]')).length)return click(rnd(e));
  if((e=q('[data-sact="lt-letter"]')).length)return click(rnd(e));
  if((e=q('[data-sact="lt-key"]')).length)return click(rnd(e));
  if((e=q('#lt-ans')).length&&q('[data-sact="lt-send"],[data-sact="lt-write"]').length){type(e[0],rnd(SENT));return click(q('[data-sact="lt-send"],[data-sact="lt-write"]')[0]);}
  if((e=q('[data-sact="lt-hand"]')).length&&Math.random()<.15)return click(e[0]);
  if((e=q('[data-sact="lt-full"]')).length&&Math.random()<.5)return click(e[0]);
  if((e=q('[data-sact="lt-swap"]')).length&&Math.random()<.5)return click(rnd(e));
  // Practice Rush
  if((e=q('[data-sact="rush-place"]')).length){const s=right?e.sort((a,b)=>(+a.dataset.k)-(+b.dataset.k)):e.sort(()=>Math.random()-.5);return click(s[0])+' rplace';}
  if((e=q('#rans')).length&&q('[data-sact="rush-check"]').length&&!e[0].value){type(e[0],rnd(SENT));return 'rush type';}
  if((e=q('[data-sact="rush-check"]')).length)return click(e[0]);
  if((e=q('[data-sact="rush-pick"]')).length)return click(rnd(e));
  if((e=q('[data-sact="rush-next"]')).length)return click(e[0]);
  // Battle
  if((e=q('[data-sact="vote"]')).length)return click(rnd(e));
  if((e=q('[data-sact="act"]')).length)return click(rnd(e));
  if((e=q('[data-sact="tile-add"]')).length){const s=right?e.sort((a,b)=>(+a.dataset.i)-(+b.dataset.i)):e.sort(()=>Math.random()-.5);return click(s[0])+' tile';}
  if((e=q('[data-sact="tile-check"]')).length)return click(e[0]);
  if((e=q('#ans')).length&&q('[data-sact="send"]').length){type(e[0],rnd(SENT));return click(q('[data-sact="send"]')[0]);}
  if((e=q('[data-sact="choose"]')).length)return click(rnd(e));
  if((e=q('[data-sact="buzz"]')).length)return click(e[0]);
  if((e=q('[data-sact="power"]')).length&&Math.random()<.6)return click(e[0]);
  if(shop&&(e=q('[data-sact="buy"]')).length&&Math.random()<.7)return click(rnd(e));
  if((e=q('[data-sact="shop-close"]')).length)return click(e[0]);
  if(shop&&(e=q('[data-sact="shop"],#t-supply')).length&&Math.random()<.5)return click(e[0]);
  return '';
};
