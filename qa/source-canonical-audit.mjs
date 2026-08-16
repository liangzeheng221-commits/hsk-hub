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
function loadLowerRaw(){
  const ctx={window:{HSK4_LOWER_LESSONS:[]},console};ctx.window.window=ctx.window;
  for(let id=11;id<=20;id++){const p=`hsk4/data/${id}.js`;run(read(p),ctx,p)}
  return ctx.window.HSK4_LOWER_LESSONS;
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

check('HSK4L raw 50-point titles and rule details',()=>{
  const lessons=loadLowerRaw();
  assert.equal(lessons.length,10);
  assert.equal(lessons.reduce((n,L)=>n+(L.grammar?.length||0),0),50);
  const G=(id,title)=>lessons.find(L=>L.id===id)?.grammar?.find(g=>g.title===title);
  assert.match(G(11,'连').vn_title,/Giới từ/);
  assert.match(G(11,'无论').structure,/是A还是B/);
  assert.match(G(11,'同时').structure,/在……（的）同时/);
  assert.match(G(12,'对于').structure,/Chủ ngữ \+ 对于/);
  assert.match(G(12,'相反').structure,/相反的 \+ N/);
  assert.match(G(14,'以').desc,/hai vế cùng chủ ngữ/);
  assert.match(G(15,'来').desc,/Nếu bỏ “来”/);
  assert.match(G(15,'左右').desc,/Chỉ dùng sau cụm số lượng/);
  assert.match(G(16,'恐怕').structure,/Chủ ngữ/);
  assert.match(G(16,'到底').desc,/không đi với câu hỏi có 吗/);
  assert.match(G(17,'倒').structure,/倒\(dào\)/);
  assert.match(G(17,'干').vn_title,/gàn/);
  assert.match(G(19,'上').structure,/V \+ 得上/);
  assert.match(G(20,'一……就……').desc,/hễ… thì…/);
  assert.match(G(20,'究竟').desc,/từ nghi vấn làm chủ ngữ/);
  assert.match(G(20,'动词+起').structure,/说\/谈\/讲\/问\/提\/聊\/回忆/);
});

check('HSK4L raw comparison details',()=>{
  const lessons=loadLowerRaw(),C=id=>lessons.find(L=>L.id===id)?.compare;
  const needles={11:'不管热不热',12:'tên sách/bài viết',13:'kế hoạch tương lai',14:'nhân quả logic',15:'不一定',16:'phỏng đoán thuần túy',17:'lượt xe/tàu',18:'chủ ngữ hai việc',19:'想出来',20:'看到底'};
  for(const [id,needle] of Object.entries(needles))assert(String(C(Number(id))?.vn||'').includes(needle),`L${id} compare missing ${needle}`);
});

const report={passed:errors.length===0,checks:5,errors};
fs.writeFileSync('qa/source-canonical-audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(errors.length)process.exit(1);
