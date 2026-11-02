// node tools/worksheet_pdf.js a.html b.html … → a.pdf b.pdf (A4, needs playwright)
const {chromium}=require('playwright');const path=require('path');(async()=>{const b=await chromium.launch();const pg=await b.newPage();
for(const f of process.argv.slice(2)){await pg.goto('file://'+path.resolve(f),{waitUntil:'load'});await pg.waitForTimeout(300);const out=f.replace(/\.html$/,'.pdf');await pg.pdf({path:out,format:'A4',printBackground:true,preferCSSPageSize:true});console.log('pdf',out);}
await b.close();})();
