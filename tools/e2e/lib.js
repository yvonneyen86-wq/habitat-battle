/* Test world: one teacher page + student pages in separate browser contexts, joined by a mock PeerJS (mockpeer.js) routed through Playwright. */
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const MOCK=fs.readFileSync(path.join(__dirname,'mockpeer.js'),'utf8');
const http=require('http');const ROOT=path.join(__dirname,'..','..');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript','.txt':'text/plain; charset=utf-8','.json':'application/json','.png':'image/png'};
/* tiny static server for the repo root, so the suite needs nothing but `node` */
function serve(){return new Promise(res=>{const srv=http.createServer((q,r)=>{let f=decodeURIComponent(q.url.split('?')[0]);if(f==='/')f='/index.html';const fp=path.join(ROOT,f);if(!fp.startsWith(ROOT))return r.writeHead(403).end();fs.readFile(fp,(e,d)=>{if(e)return r.writeHead(404).end();r.writeHead(200,{'Content-Type':MIME[path.extname(fp)]||'application/octet-stream'});r.end(d);});});srv.listen(0,'127.0.0.1',()=>res(srv));});}
const shot=async(page,name)=>{if(process.env.SHOTS){fs.mkdirSync(process.env.SHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.SHOTS,name+'.png')});}};
async function world(opts={}){
  const srv=process.env.BASE?null:await serve();const BASE=process.env.BASE||`http://127.0.0.1:${srv.address().port}/index.html`;
  const browser=await chromium.launch();const reg=new Map();const errors=[];const all=[];
  async function mk(name,url,vp){
    const ctx=await browser.newContext({viewport:vp||{width:1366,height:768},deviceScaleFactor:1});
    await ctx.route(/cdn\.jsdelivr|cdnjs\.cloudflare|fonts\.g|drive\.google|googleusercontent/,r=>r.abort());
    await ctx.exposeBinding('__net',async({page},m)=>{
      if(m.k==='reg'){reg.set(m.id,page);return;}
      if(m.k==='unreg'){if(reg.get(m.id)===page)reg.delete(m.id);return;}
      const t=reg.get(m.to);
      if(!t||t.isClosed()){if(m.k==='connect')page.evaluate(x=>window.__recv(x),{k:'nopeer',to:m.from}).catch(()=>{});return;}
      t.evaluate(x=>window.__recv(x),m).catch(()=>{});
    });
    await ctx.addInitScript(MOCK);
    if(opts.init)await ctx.addInitScript(opts.init);
    const page=await ctx.newPage();
    page.on('pageerror',e=>{errors.push(`[${name}] PAGEERROR ${e.message}\n${(e.stack||'').split('\n').slice(0,4).join('\n')}`);});
    page.on('console',msg=>{if(msg.type()==='error'){const t=msg.text();if(/net::ERR_FAILED|Failed to load resource/.test(t))return;errors.push(`[${name}] console.error ${t.slice(0,600)}`);}});
    await page.goto(url);all.push(page);page._name=name;return page;
  }
  return {browser,mk,errors,reg,BASE,close:async()=>{await browser.close();if(srv)srv.close();}};
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// visible buttons summary
async function btns(page,sel='body'){return page.evaluate(sel=>[...document.querySelectorAll(sel+' [data-act],'+sel+' [data-s],'+sel+' button')].filter(b=>b.offsetParent!==null).map(b=>(b.dataset.act||b.dataset.s||b.id||'?')+(b.disabled?'(dis)':'')+':'+b.textContent.trim().slice(0,24)).join(' | '),sel);}
module.exports={world,sleep,btns,shot};
