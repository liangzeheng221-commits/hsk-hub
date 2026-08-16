import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const run=(code,ctx,name)=>vm.runInNewContext(code,ctx,{filename:name,timeout:5000});
const errors=[];
const check=(name,fn)=>{try{fn()}catch(e){errors.push(`${name}: ${e.stack||e}`)}};

function loadUpperRaw(ids){
  const ctx={window:{HSK4_UPPER_LESSONS:[]},console};ctx.window.window=ctx.window;
  for(const id of ids){const p=`hsk4up/data/${String(id).padStart(2,'0')}.js`;run(read(p),ctx,p)}
  return ctx.window.HSK4_UPPER_LESSONS;
}

check('HSK4U raw lesson 1 即使',()=>{
  const L=loadUpperRaw([1])[0],g=L.grammar.find(x=>x.title==='即使……也……');
  assert(g,'即使 missing');
  assert.match(g.desc,/chủ ngữ/);
  assert(Array.isArray(g.structures)&&g.structures.some(x=>x.startsWith('主语 + 即使')));
  assert(g.rule_atoms?.some(x=>x.id==='subject-position'));
});

check('HSK4U raw lesson 3 首先/不管',()=>{
  const L=loadUpperRaw([3])[0];
  const first=L.grammar.find(x=>x.title==='首先……其次……');
  assert.match(first.desc,/sớm nhất/);
  assert(first.structures?.some(x=>x.includes('首先 + V')));
  const noMatter=L.grammar.find(x=>x.title==='不管');
  for(const token of ['疑问代词','还是','A不A','都/也'])assert(noMatter.structure.includes(token),`不管 missing ${token}`);
  assert.equal(noMatter.rule_atoms?.length,4);
});

check('HSK4U raw lesson 8 只要',()=>{
  const L=loadUpperRaw([8])[0],g=L.grammar.find(x=>x.title==='只要');
  assert(g,'只要 missing');
  assert.match(g.desc,/chỉ cần/i);
  assert(!/điều kiện cần[;,.\s]/i.test(g.desc),'Vietnamese explanation still states necessary-condition logic');
  assert.match(g.logic_note,/logic hình thức/i);
  assert(g.rule_atoms?.some(x=>x.id==='condition-result'));
});

const report={passed:errors.length===0,checks:3,errors};
fs.writeFileSync('qa/source-canonical-audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(errors.length)process.exit(1);
