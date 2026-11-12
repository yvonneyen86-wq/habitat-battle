/* Everything to run before a change goes live, in one command:  node tools/e2e/all.js
   (syntax of the three inline scripts, bank check, 3D smoke test, regression checks, one bot-played lesson, runner testbench)
   Prints one PASS/FAIL line per step; exit code 1 if any step fails. QUICK=1 skips the lesson and the runner testbench. */
const {spawnSync}=require('child_process');const fs=require('fs');const path=require('path');const os=require('os');
const ROOT=path.join(__dirname,'..','..');const steps=[];
const run=(name,cmd,args,opt={})=>{const t0=Date.now();const r=spawnSync(cmd,args,{cwd:ROOT,encoding:'utf8',timeout:opt.timeout||600000,env:process.env});const out=(r.stdout||'')+(r.stderr||'');const ok=r.status===0&&(!opt.ok||opt.ok(out));
  steps.push([name,ok]);console.log(`${ok?'PASS':'FAIL'}  ${name}  (${Math.round((Date.now()-t0)/1000)}s)`);if(!ok)console.log(out.split('\n').filter(l=>opt.show?opt.show(l):true).slice(-25).map(l=>'      '+l.slice(0,300)).join('\n'));};
/* 1. every inline <script> of index.html must parse */
{const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');const parts=[...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);let ok=parts.length>=3,msg='';
  parts.forEach((src,i)=>{const f=path.join(os.tmpdir(),`hb-inline-${process.pid}-${i}.js`);fs.writeFileSync(f,src);const r=spawnSync(process.execPath,['--check',f],{encoding:'utf8'});fs.unlinkSync(f);if(r.status!==0){ok=false;msg+=(r.stderr||'').split('\n').slice(0,6).join('\n')+'\n';}});
  steps.push(['inline scripts parse',ok]);console.log(`${ok?'PASS':'FAIL'}  inline scripts parse (${parts.length} scripts)`);if(!ok)console.log(msg);}
run('bank files (tools/check_bank.py)','python3',['tools/check_bank.py'],{ok:o=>/\bOK\s*$/.test(o.trim())});
run('3D stage smoke test (3d/stubtest.js)',process.execPath,['3d/stubtest.js'],{ok:o=>/smoke ok/.test(o)});
run('regression checks (tools/e2e/tests.js)',process.execPath,['tools/e2e/tests.js'],{show:l=>/FAIL|passed|Error/.test(l)});
if(!process.env.QUICK){
  run('bot-played lesson OD1 U1 (tools/e2e/lesson.js)',process.execPath,['tools/e2e/lesson.js','OD1','1','.8','6'],{show:l=>/^!!|problem|FAIL|Error/.test(l)});
  run('classroom-runner testbench (tools/e2e/runner.js)',process.execPath,['tools/e2e/runner.js'],{timeout:180000});
}
const bad=steps.filter(s=>!s[1]);console.log(bad.length?`\n${bad.length} step(s) failed — do not push`:'\nAll steps passed');process.exit(bad.length?1:0);
