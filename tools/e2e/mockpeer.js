(()=>{
  const rid=()=>Math.random().toString(36).slice(2,10);
  const peers=window.__peers={};
  class Em{constructor(){this._h={};}on(ev,fn){(this._h[ev]=this._h[ev]||[]).push(fn);return this;}_emit(ev,...a){(this._h[ev]||[]).slice().forEach(f=>{try{f(...a);}catch(e){console.error('handler error '+ev+': '+(e&&e.stack||e));}});}}
  class Conn extends Em{constructor(peer,remote,cn){super();this.peerObj=peer;this.peer=remote;this.cn=cn;this.open=false;}
    send(d){if(!this.open)throw new Error('conn not open');window.__net({k:'data',from:this.peerObj.id,to:this.peer,cn:this.cn,d:JSON.parse(JSON.stringify(d))});}
    close(){if(!this.open)return;this.open=false;window.__net({k:'close',from:this.peerObj.id,to:this.peer,cn:this.cn});this._emit('close');}}
  window.Peer=class extends Em{constructor(id){super();this.id=id||('stu-'+rid());this._conns={};this.destroyed=false;this.disconnected=false;peers[this.id]=this;window.__net({k:'reg',id:this.id});setTimeout(()=>{if(!this.destroyed)this._emit('open',this.id);},20);}
    connect(to){const c=new Conn(this,to,rid());this._conns[c.cn]=c;window.__net({k:'connect',from:this.id,to,cn:c.cn});return c;}
    reconnect(){}
    destroy(){if(this.destroyed)return;Object.values(this._conns).forEach(c=>c.close());this.destroyed=true;window.__net({k:'unreg',id:this.id});delete peers[this.id];}};
  window.__recv=m=>{const p=peers[m.to];if(!p||p.destroyed)return;
    if(m.k==='connect'){const c=new Conn(p,m.from,m.cn);c.open=true;p._conns[m.cn]=c;p._emit('connection',c);window.__net({k:'accept',from:p.id,to:m.from,cn:m.cn});}
    else if(m.k==='accept'){const c=p._conns[m.cn];if(c){c.open=true;c._emit('open');}}
    else if(m.k==='data'){const c=p._conns[m.cn];if(c&&c.open)c._emit('data',m.d);}
    else if(m.k==='close'){const c=p._conns[m.cn];if(c&&c.open){c.open=false;c._emit('close');}}
    else if(m.k==='nopeer'){p._emit('error',{type:'peer-unavailable'});}};
})();
