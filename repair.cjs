const {execSync}=require('child_process');
const fs=require('fs'), path=require('path');
function walk(dir,cb){for(const f of fs.readdirSync(dir)){const p=path.join(dir,f);const st=fs.statSync(p);if(st.isDirectory()){if(['node_modules','dist','.git'].includes(f))continue;walk(p,cb);}else cb(p);}}
const exts=new Set(['.ts','.tsx']);
let total=0;
walk('.',(p)=>{
  if(!exts.has(path.extname(p))) return;
  let orig;
  try { orig=execSync('git show HEAD:'+p.replace(/\\/g,'/'),{encoding:'utf8',stdio:['pipe','pipe','ignore']}); }
  catch(e){ return; }
  const cur=fs.readFileSync(p,'utf8');
  const names=new Set();
  const re=/\b([A-Za-z_$][\w$]*)\(\)/g; let m;
  while((m=re.exec(orig))!==null) names.add(m[1]);
  let s=cur, changed=false;
  for(const name of names){
    const r=new RegExp('\\b'+name+'(?!\\()', 'g');
    const ns=s.replace(r, name+'()');
    if(ns!==s){ changed=true; s=ns; }
  }
  if(changed){ fs.writeFileSync(p,s); total++; }
});
console.log('files changed', total);