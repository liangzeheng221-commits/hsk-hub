import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import vm from 'node:vm';
const root=process.cwd(),errors=[],warnings=[];
const ok=(c,m)=>{if(!c)errors.push(m)},warn=(c,m)=>{if(!c)warnings.push(m)};
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function run(code,ctx,name){vm.runInNewContext(code,ctx,{filename:name,timeout:5000})}
function loadH1(){const ctx={window:{},console};ctx.window.window=ctx.window;for(let i=1;i<=5;i++)run(read(`hsk1/data-${i}.js`),ctx,`hsk1/data-${i}.js`);run(read('hsk1/corrections.js'),ctx,'hsk1/corrections.js');run(read('hsk1/content-audit.js'),ctx,'hsk1/content-audit.js');return ctx.window.HSK1_LESSONS}
function loadH2(){const ctx={window:{},console};ctx.window.window=ctx.window;for(let i=1;i<=8;i++)run(read(`data/v7-${i}.js`),ctx,`data/v7-${i}.js`);const b64=ctx.window.__HSK2_V7;if(!b64)throw new Error('HSK2 chunks missing');ctx.window.HSK2_LESSONS=JSON.parse(zlib.gunzipSync(Buffer.from(b64,'base64')).toString('utf8'));run(read('assets/hsk2-content-audit.js'),ctx,'assets/hsk2-content-audit.js');return ctx.window.HSK2_LESSONS}
let h1=[],h2=[];try{h1=loadH1()}catch(e){errors.push('HSK1 audit load failed: '+e.message)}try{h2=loadH2()}catch(e){errors.push('HSK2 audit load failed: '+e.message)}
ok(h1.length===15,`HSK1 expected 15 lessons, got ${h1.length}`);ok(h2.length===15,`HSK2 expected 15 lessons, got ${h2.length}`);
for(let i=3;i<=15;i++)ok(h1.find(x=>x.id===i)?.phonetics?.length===1,`HSK1 L${i}: textbook phonetics missing`);
for(let i=1;i<=15;i++)ok(h2.find(x=>x.id===i)?.phonetics?.length===1,`HSK2 L${i}: textbook phonetics missing`);
for(const i of [5,10,15]){ok(!!h1.find(x=>x.id===i)?.culture,`HSK1 L${i}: culture missing`);ok(!!h2.find(x=>x.id===i)?.culture,`HSK2 L${i}: culture missing`)}
for(let i=1;i<=15;i++)ok(!!h2.find(x=>x.id===i)?.textbookHanzi,`HSK2 L${i}: textbook Hanzi focus missing`);
for(const L of h1)for(const v of L.vocab||[]){ok(!!v.pos,`HSK1 L${L.id} ${v.zh}: POS missing`);ok(['core','supplement','proper'].includes(v.kind),`HSK1 L${L.id} ${v.zh}: vocabulary kind missing`)}
for(const L of h2)for(const v of L.vocab||[]){ok(!!v.pos,`HSK2 L${L.id} ${v.zh}: POS missing`);ok(['core','supplement','proper'].includes(v.kind),`HSK2 L${L.id} ${v.zh}: vocabulary kind missing`)}
function kind(data,id,zh){return data.find(x=>x.id===id)?.vocab?.find(v=>v.zh===zh)?.kind}
for(const [id,zh] of [[1,'您'],[5,'口'],[6,'好吃'],[7,'问'],[13,'也'],[13,'吧'],[14,'啊'],[15,'一起']])ok(kind(h1,id,zh)==='supplement',`HSK1 L${id} ${zh}: should be supplement`);
for(const [id,zh] of [[3,'李月'],[3,'中国'],[3,'美国'],[10,'王方'],[10,'谢朋'],[13,'大卫'],[14,'张']])ok(kind(h1,id,zh)==='proper',`HSK1 L${id} ${zh}: should be proper name`);
for(const [id,zh] of [[2,'米'],[3,'粉色'],[4,'接'],[6,'自行车'],[6,'经常'],[6,'公斤'],[7,'过'],[9,'欢迎'],[12,'度'],[13,'拿'],[13,'班'],[13,'长'],[13,'一直'],[15,'更']])ok(kind(h2,id,zh)==='supplement',`HSK2 L${id} ${zh}: should be supplement`);
for(const [id,zh] of [[1,'花花'],[13,'杨笑笑']])ok(kind(h2,id,zh)==='proper',`HSK2 L${id} ${zh}: should be proper name`);
const pos=(data,id,zh)=>data.find(x=>x.id===id)?.vocab?.find(v=>v.zh===zh)?.pos||'';
ok(pos(h1,3,'是').startsWith('动词'), 'HSK1 L3 是: POS should be verb');
ok(pos(h1,9,'在').startsWith('动词'), 'HSK1 L9 在: lesson POS should be verb');
ok(pos(h1,9,'那儿').startsWith('代词'), 'HSK1 L9 那儿: POS should be pronoun');
ok(pos(h1,9,'下面').startsWith('方位词'), 'HSK1 L9 下面: POS should be localizer');
ok(pos(h1,10,'这儿').startsWith('代词'), 'HSK1 L10 这儿: POS should be pronoun');
ok(pos(h1,11,'吃饭').startsWith('动词'), 'HSK1 L11 吃饭: POS should be verb');
ok(pos(h1,12,'些').startsWith('量词'), 'HSK1 L12 些: POS should be measure word');
ok(pos(h1,14,'一点儿').startsWith('数量词'), 'HSK1 L14 一点儿: POS should be quantity expression');
ok(pos(h1,14,'少').startsWith('形容词'), 'HSK1 L14 少: POS should be adjective');
ok(h2.find(x=>x.id===11)?.textbookHanzi?.radicals==='户、氵','HSK2 L11: radicals should be 户、氵');
const l11=h1.find(x=>x.id===11),line11=l11?.scenes?.flatMap(s=>s.lines||[]).find(x=>x.zh==='我星期一去北京。');ok(line11?.vn==='Thứ hai tôi đi Bắc Kinh.','HSK1 L11: Vietnamese subject correction missing');
const kuai=h1.find(x=>x.id===8)?.vocab?.find(v=>v.zh==='块');ok(/元/.test(kuai?.note||'')&&/đồng|tệ/i.test(kuai?.vn||''),'HSK1 L8 块: lesson target meaning not audited');
for(const L of h2){const corpus=JSON.stringify({mc:L.mc||[],fills:L.fills||[],fixes:L.fixes||[],sorts:L.sorts||[]});for(const v of L.vocab.filter(x=>x.kind==='core'))ok(corpus.includes(v.zh),`HSK2 L${L.id}: core word not covered by practice: ${v.zh}`)}
const h1Audit=read('hsk1/content-audit.js');ok(/core\.forEach/.test(h1Audit)&&/genVocabMC/.test(h1Audit),'HSK1: full core-vocabulary MC generator missing');
const hc=read('assets/hanzi-curriculum.js');for(const token of ['笔画','独体字','笔顺规则','结构','偏旁'])ok(hc.includes(token),`HSK1 Hanzi curriculum dimension missing: ${token}`);
ok(hc.includes("8:{chars:'少、个',structure:'汉字结构（3）：上下结构与上中下结构',radicals:'钅、口'}"),'HSK1 L8: radicals should be 钅、口');
const forbidden=/HSK\s*2\.0|HSK\s*3\.0|旧\s*HSK|旧体系|新\s*HSK|HSK\s*新标准|new\s+HSK\s+standard/ig;
function walk(dir='.'){
  for(const e of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){
    if(['.git','node_modules','qa'].includes(e.name))continue;const rel=path.posix.join(dir==='.'?'':dir,e.name);
    if(e.isDirectory())walk(rel);else if(/\.(html|js|css|md)$/i.test(e.name)){
      const txt=read(rel),m=txt.match(forbidden);if(m)errors.push(`${rel}: contains course-system comparison wording: ${[...new Set(m)].join(', ')}`)
    }
  }
}
walk();
const report={passed:errors.length===0,errors,warnings,summary:{hsk1Lessons:h1.length,hsk2Lessons:h2.length,hsk1Core:h1.reduce((n,L)=>n+(L.coreVocabCount||0),0),hsk2Core:h2.reduce((n,L)=>n+(L.coreVocabCount||0),0)}};
fs.mkdirSync(path.join(root,'qa'),{recursive:true});fs.writeFileSync(path.join(root,'qa/hsk12-content-audit.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(errors.length)process.exit(1);
