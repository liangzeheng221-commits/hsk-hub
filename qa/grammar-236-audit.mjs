import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const manifest=JSON.parse(read('curriculum/grammar-manifest.json'));
const run=(code,ctx,name)=>vm.runInNewContext(code,ctx,{filename:name,timeout:5000});
const errors=[];const check=(fn)=>{try{fn()}catch(e){errors.push(e.stack||String(e))}};

function loadH1(){const ctx={window:{},console};ctx.window.window=ctx.window;for(let i=1;i<=5;i++)run(read(`hsk1/data-${i}.js`),ctx,`hsk1/data-${i}.js`);run(read('hsk1/corrections.js'),ctx,'hsk1/corrections.js');return {data:ctx.window.HSK1_LESSONS,ctx}}
function loadH2(){const ctx={window:{},console};ctx.window.window=ctx.window;for(let i=1;i<=8;i++)run(read(`data/v7-${i}.js`),ctx,`data/v7-${i}.js`);const b64=ctx.window.__HSK2_V7;assert(b64,'HSK2 packed chunks missing');ctx.window.HSK2_LESSONS=JSON.parse(zlib.gunzipSync(Buffer.from(b64,'base64')).toString('utf8'));run(read('assets/hsk2-content-audit.js'),ctx,'assets/hsk2-content-audit.js');return {data:ctx.window.HSK2_LESSONS,ctx}}
function loadH3(){const src=read('hsk3/data.js'),m=src.match(/atob\(\s*['"]([A-Za-z0-9+/=]+)['"]\s*\)/);assert(m,'HSK3 packed payload missing');let data=JSON.parse(zlib.gunzipSync(Buffer.from(m[1],'base64')).toString('utf8'));if(!Array.isArray(data)&&Array.isArray(data?.lessons))data=data.lessons;if(!Array.isArray(data)&&Array.isArray(data?.HSK3_LESSONS))data=data.HSK3_LESSONS;if(!Array.isArray(data)&&data&&typeof data==='object')data=Object.values(data).sort((a,b)=>a.id-b.id);const ctx={window:{HSK3_LESSONS:data},console};ctx.window.window=ctx.window;for(const f of ['hsk3/corrections.js','hsk3/textbook-baseline.js','hsk3/textbook-audit.js'])run(read(f),ctx,f);return {data:ctx.window.HSK3_LESSONS,ctx}}
function loadH4U(){const ctx={window:{HSK4_UPPER_LESSONS:[]},console};ctx.window.window=ctx.window;for(let i=1;i<=10;i++)run(read(`hsk4up/data/${String(i).padStart(2,'0')}.js`),ctx,`hsk4up/data/${String(i).padStart(2,'0')}.js`);run(read('hsk4up/grammar-canonical.js'),ctx,'hsk4up/grammar-canonical.js');return {data:ctx.window.HSK4_UPPER_LESSONS,ctx}}
function loadH4L(){const ctx={window:{HSK4_LOWER_LESSONS:[]},console};ctx.window.window=ctx.window;run(read('hsk4/data.js'),ctx,'hsk4/data.js');for(let i=11;i<=20;i++)run(read(`hsk4/data/${i}.js`),ctx,`hsk4/data/${i}.js`);run(read('hsk4/grammar-canonical.js'),ctx,'hsk4/grammar-canonical.js');run(read('hsk4/content-audit.js'),ctx,'hsk4/content-audit.js');return {data:ctx.window.HSK4_LOWER_LESSONS,ctx}}

const loaders={'HSK1':loadH1,'HSK2':loadH2,'HSK3':loadH3,'HSK4上':loadH4U,'HSK4下':loadH4L};
const loaded={};
for(const [book,loader] of Object.entries(loaders))check(()=>{loaded[book]=loader()});

check(()=>assert.equal(manifest.total,236,'manifest total'));
let total=0;
for(const book of Object.keys(loaders))check(()=>{
  const data=loaded[book].data,base=manifest.books[book];assert(Array.isArray(data),`${book}: data array`);
  let count=0;
  for(const [id,items] of Object.entries(base.lessons)){
    const L=data.find(x=>Number(x.id)===Number(id));assert(L,`${book} L${id} missing`);
    const expected=items.map(x=>x.textbook_title);
    let actual;
    if(book==='HSK1')actual=(L.grammar||[]).filter(g=>g.content_type==='grammar').map(g=>g.title);
    else actual=(L.grammar||[]).map(g=>g.title);
    assert.deepEqual(actual,expected,`${book} L${id} grammar titles/order`);
    count+=actual.length;
  }
  assert.equal(count,base.expected,`${book}: expected formal grammar count`);total+=count;
});
check(()=>assert.equal(total,236,'five-book formal grammar total'));

check(()=>{
  const {data,ctx}=loaded.HSK1;assert.equal(ctx.window.HSK1_GRAMMAR_CANONICAL?.total,45,'HSK1 canonical marker');
  for(const L of data){for(const g of L.grammar||[]){assert(['grammar','phonetics'].includes(g.content_type),`HSK1 L${L.id} ${g.title}: content_type`)}}
  const l5=data.find(x=>x.id===5),l7=data.find(x=>x.id===7),l15=data.find(x=>x.id===15);assert(l5.grammar.some(g=>g.title==='百以内的数字'));assert(l5.grammar.some(g=>g.title==='“了”表变化'));assert(l7.grammar.some(g=>g.title==='日期的表达（1）：月、日/号、星期'));assert(l15.grammar.some(g=>g.title==='日期的表达（2）：年、月、日/号、星期'));
  const l13=data.find(x=>x.id===13),phone=l13.grammar.find(g=>g.title==='电话号码的表达');assert.match(phone.desc,/yāo/);assert.match(l13.scenes[2].lines[0].py,/yāo/);assert.match(l13.scenes[2].lines[1].py,/yāo/);
});

check(()=>{
  const {data,ctx}=loaded['HSK4上'];assert.equal(ctx.window.HSK4_UPPER_GRAMMAR_CANONICAL?.total,50,'HSK4上 canonical marker');
  const get=(id,title)=>data.find(x=>x.id===id).grammar.find(g=>g.title===title);
  const jishi=get(1,'即使……也……');assert.match(jishi.desc,/chủ ngữ/);assert(jishi.structures.some(x=>x.startsWith('主语 + 即使')));assert(jishi.rule_atoms.some(x=>x.id==='subject-position'));
  const chabuduo=data.find(x=>x.id===2).compare;assert.equal(chabuduo.differences.length,3);assert(chabuduo.differences.some(x=>x.dimension.includes('数量')));assert(chabuduo.differences.some(x=>x.dimension.includes('最终没发生')));
  const shouxian=get(3,'首先……其次……');assert.match(shouxian.desc,/sớm nhất/);assert(shouxian.structures.some(x=>x.includes('首先 + V')));
  const buguan=get(3,'不管');for(const token of ['疑问代词','还是','A不A','都/也'])assert(buguan.structure.includes(token),`不管 missing ${token}`);
  const bing=get(4,'并');assert.match(bing.desc,/chuyển ý|đính chính/);
  const shenzhi=get(4,'甚至');assert.match(shenzhi.desc,/danh từ, động từ hoặc mệnh đề/);
  const youqi=data.find(x=>x.id===5).compare;assert(youqi.differences.some(x=>String(x.right).includes('特别的 + N')));
  const yaoshi=get(7,'要是');assert(yaoshi.structure.includes('（的话）'));
  const zhiyao=get(8,'只要');assert.match(zhiyao.desc,/chỉ cần/);assert(!/điều kiện đủ/i.test(zhiyao.desc));assert.match(zhiyao.logic_note,/Giáo trình/);
});

check(()=>{
  const {data,ctx}=loaded['HSK4下'];assert.equal(ctx.window.HSK4_LOWER_GRAMMAR_CANONICAL?.total,50,'HSK4下 canonical marker');
  const get=(id,title)=>data.find(x=>x.id===id).grammar.find(g=>g.title===title);
  assert.match(get(11,'连').vn_title,/Giới từ/);assert.match(get(11,'无论').structure,/是A还是B/);assert.match(get(11,'同时').structure,/在……（的）同时/);
  assert.match(get(12,'对于').desc,/trước hoặc sau chủ ngữ/);assert.match(get(12,'名量词重叠').desc,/không dùng làm tân ngữ/);assert.match(get(12,'相反').structure,/相反的/);
  assert.match(get(13,'大概').structure,/大概的/);assert.match(get(14,'够').structure,/够 \+ Adj/);assert.match(get(14,'以').structure,/以A为B/);assert.equal(get(15,'来').structure,'来 + V');assert.match(get(15,'左右').desc,/sau cụm số lượng/);assert.match(get(16,'恐怕').vn_title,/Động từ \/ phó từ/);
});

const report={passed:errors.length===0,total,expected:236,books:Object.fromEntries(Object.entries(manifest.books).map(([k,v])=>[k,v.expected])),errors};
fs.mkdirSync('qa',{recursive:true});fs.writeFileSync('qa/grammar-236-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(errors.length)process.exit(1);
