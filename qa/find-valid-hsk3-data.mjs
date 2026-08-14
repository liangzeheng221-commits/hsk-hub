import {execFileSync} from 'node:child_process';
import zlib from 'node:zlib';

const git=(args,opts={})=>execFileSync('git',args,{encoding:'utf8',maxBuffer:50*1024*1024,...opts});
const commits=git(['log','--format=%H','--','hsk3/data.js']).trim().split(/\s+/).filter(Boolean);
console.log(`Scanning ${commits.length} historical hsk3/data.js versions...`);
let valid=[];
for(const sha of commits){
  const msg=git(['show','-s','--format=%s',sha]).trim();
  try{
    const src=git(['show',`${sha}:hsk3/data.js`]);
    const m=src.match(/atob\(\s*['"]([A-Za-z0-9+/=]+)['"]\s*\)/);
    if(!m)throw new Error('payload-not-found');
    const json=zlib.gunzipSync(Buffer.from(m[1],'base64')).toString('utf8');
    let data=JSON.parse(json);
    if(!Array.isArray(data)&&Array.isArray(data?.lessons))data=data.lessons;
    if(!Array.isArray(data)&&Array.isArray(data?.HSK3_LESSONS))data=data.HSK3_LESSONS;
    if(!Array.isArray(data)&&data&&typeof data==='object'){
      const vals=Object.values(data);
      if(vals.length===20&&vals.every(x=>x&&typeof x==='object'&&'id'in x))data=vals.sort((a,b)=>a.id-b.id);
    }
    if(!Array.isArray(data))throw new Error('decoded-not-array');
    const ids=data.map(x=>x?.id);
    const idOk=data.length===20&&ids.every((x,i)=>x===i+1);
    const structureOk=idOk&&data.every(L=>Array.isArray(L.vocab)&&L.vocab.length&&Array.isArray(L.grammar)&&L.grammar.length&&Array.isArray(L.scenes)&&L.scenes.length>=2);
    if(!structureOk)throw new Error(`structure lessons=${data.length} ids=${ids.join(',')}`);
    const words=data.reduce((n,L)=>n+L.vocab.length,0);
    console.log(`VALID ${sha} lessons=20 vocab=${words} :: ${msg}`);
    valid.push({sha,msg,words});
  }catch(e){
    console.log(`BAD   ${sha} :: ${msg} :: ${e.message}`);
  }
}
if(!valid.length){
  console.error('NO VALID compressed HSK3 data version found in history');
  process.exit(2);
}
console.log('LATEST_VALID='+valid[0].sha);
console.log('LATEST_VALID_MESSAGE='+valid[0].msg);
console.log('LATEST_VALID_VOCAB='+valid[0].words);
