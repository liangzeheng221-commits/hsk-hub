import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const src=read('hsk3/data.js');
const m=src.match(/atob\(\s*['"]([A-Za-z0-9+/=]+)['"]\s*\)/);
assert(m,'compressed HSK3 data payload not found');
let data=JSON.parse(zlib.gunzipSync(Buffer.from(m[1],'base64')).toString('utf8'));
if(!Array.isArray(data)&&Array.isArray(data?.lessons))data=data.lessons;
if(!Array.isArray(data)&&Array.isArray(data?.HSK3_LESSONS))data=data.HSK3_LESSONS;
if(!Array.isArray(data)&&data&&typeof data==='object')data=Object.values(data).sort((a,b)=>a.id-b.id);
assert.equal(data.length,20,'must have 20 lessons');

const sandbox={console,TextDecoder,TextEncoder};sandbox.window=sandbox;sandbox.HSK3_LESSONS=JSON.parse(JSON.stringify(data));
const ctx=vm.createContext(sandbox);
for(const p of ['hsk3/corrections.js','hsk3/textbook-baseline.js','hsk3/textbook-audit.js'])vm.runInContext(read(p),ctx,{filename:p});
const Ls=sandbox.HSK3_LESSONS,meta=sandbox.HSK3_AUDIT_META;
assert.equal(sandbox.__HSK3_CONTENT_AUDITED,true,'audit flag missing');
const counts={1:17,2:20,3:17,4:19,5:14,6:15,7:12,8:17,9:15,10:15,11:19,12:14,13:15,14:17,15:22,16:16,17:16,18:17,19:14,20:14};
for(const L of Ls){
  assert.equal(L.vocab.length,counts[L.id],`L${L.id} textbook vocab count`);
  assert.equal(new Set(L.vocab.map(w=>w.zh)).size,L.vocab.length,`L${L.id} duplicate vocab`);
  assert(L.vocab.every(w=>w.textbook&&w.pos&&w.displayZh),`L${L.id} vocab metadata incomplete`);
  assert.equal(L.grammar.length,meta.grammar[L.id].length,`L${L.id} grammar count`);
  assert(L.grammar.every(g=>g.audited&&g.desc&&g.structure&&g.auditFocus&&Array.isArray(g.examples)&&g.examples.length>=2),`L${L.id} grammar audit incomplete`);
  assert(L.proverb?.zh&&L.proverb?.vn,`L${L.id} proverb missing`);
  assert.equal(L.lessonPage,meta.pages[L.id],`L${L.id} page mapping`);
}
assert.equal(Ls.reduce((n,L)=>n+L.vocab.length,0),325,'textbook item total must be 325');
assert.equal(Ls.reduce((n,L)=>n+L.vocab.filter(w=>!w.properName&&!w.aboveLevel).length,0),300,'core HSK3 words must be 300');
assert.equal(Ls.reduce((n,L)=>n+L.vocab.filter(w=>w.aboveLevel).length,0),13,'textbook supplementary words must be 13');
assert.equal(Ls.reduce((n,L)=>n+L.vocab.filter(w=>w.properName).length,0),12,'proper-name items must be 12');

const get=(id,zh)=>Ls[id-1].vocab.find(w=>w.zh===zh);
assert.deepEqual(Ls[1].vocab.slice(11,14).map(w=>w.zh),['楼','把','拿'],'L2 把 must be restored in textbook order');
assert.equal(get(2,'把').py,'bǎ');assert.equal(get(2,'把').pos,'lượng từ');
assert.equal(get(3,'只').py,'zhǐ');
assert.equal(get(5,'张').vn,'họ Trương');assert.equal(get(5,'张').properName,true);
assert.equal(get(11,'还').py,'huán');assert(!get(11,'还').vn.includes('còn'));
assert.equal(get(11,'口').pos,'lượng từ');
assert.equal(get(13,'过去').vn,'quá khứ');
assert.equal(get(16,'长').py,'zhǎng');assert(get(16,'长').vn.includes('trưởng thành'));
assert.equal(get(17,'口').pos,'danh từ');
assert.equal(get(18,'只').py,'zhī');assert.equal(get(18,'地').py,'de');
assert.equal(get(19,'张').pos,'lượng từ');
assert.equal(get(20,'分').vn,'phân biệt');assert.equal(get(20,'成绩').vn,'thành tích, kết quả (học tập, công tác)');
assert.equal(Ls[1].grammar[1].structure,'V1 + 了……就 + V2……','L2 consecutive-action structure');
assert(Ls[9].grammar[1].structure.includes('相邻数词'),'L10 approximate-number rule must use adjacent numerals');
assert.equal(Ls[4].culture.page,61);assert.equal(Ls[9].culture.page,105);assert.equal(Ls[14].culture.page,150);assert.equal(Ls[19].culture.page,193);
for(const id of [1,2,3,4,6,7,8,9,11,12,13,14,16,17,18,19])assert.equal(Ls[id-1].culture,null,`L${id} should not have a culture box`);

const hanzi=read('assets/hanzi-curriculum.js');
assert(hanzi.includes("items:'一、二、三、上、下、本、末'"),'L1 指事字 must include 三');
assert(hanzi.includes("words:'课间、山路、参赛'"),'L9 old-character new-word must be 山路');
console.log('HSK3 CONTENT AUDIT PASS: 20 lessons · 325 textbook items = 300 core + 13 supplementary + 12 proper names · 47 audited grammar points · proverbs/culture/hanzi checks OK');
