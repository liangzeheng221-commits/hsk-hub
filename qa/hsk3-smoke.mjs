import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
import {JSDOM,VirtualConsole} from 'jsdom';

const read=p=>fs.readFileSync(p,'utf8');
const dataSrc=read('hsk3/data.js');
const m=dataSrc.match(/atob\(\s*['"]([A-Za-z0-9+/=]+)['"]\s*\)/);
assert(m,'data.js compressed payload not found');
const json=zlib.gunzipSync(Buffer.from(m[1],'base64')).toString('utf8');
let data=JSON.parse(json);
if(!Array.isArray(data)&&Array.isArray(data?.lessons))data=data.lessons;
if(!Array.isArray(data)&&Array.isArray(data?.HSK3_LESSONS))data=data.HSK3_LESSONS;
if(!Array.isArray(data)&&data&&typeof data==='object'){
  const vals=Object.values(data);
  if(vals.length===20&&vals.every(x=>x&&typeof x==='object'&&'id'in x))data=vals.sort((a,b)=>a.id-b.id);
}
assert(Array.isArray(data),'decoded HSK3 data is not an array');
assert.equal(data.length,20,'HSK3 must contain 20 lessons');
assert.deepEqual(data.map(x=>x.id),Array.from({length:20},(_,i)=>i+1),'lesson IDs must be 1..20');
for(const L of data){
  assert(L.title&&L.vn_title,`lesson ${L.id}: title missing`);
  assert(Array.isArray(L.vocab)&&L.vocab.length,`lesson ${L.id}: vocab missing`);
  assert(Array.isArray(L.grammar)&&L.grammar.length,`lesson ${L.id}: grammar missing`);
  assert(L.grammar.every(g=>Array.isArray(g.examples)&&g.examples.length),`lesson ${L.id}: grammar examples missing`);
  assert(Array.isArray(L.scenes)&&L.scenes.length>=2,`lesson ${L.id}: scenes missing`);
  assert(L.scenes.every(s=>Array.isArray(s.lines)&&s.lines.length),`lesson ${L.id}: scene lines missing`);
  assert(L.scenes[0].lines.length>=2&&L.scenes[1].lines.length>=2,`lesson ${L.id}: advanced-practice source lines missing`);
}
console.log(`DATA PASS: 20 lessons, ${data.reduce((n,L)=>n+L.vocab.length,0)} raw vocab entries`);

const practiceB64=Array.from({length:9},(_,i)=>read(`practice/reviewed/hsk3-v1.1.part${String(i+1).padStart(2,'0')}.b64`).trim()).join('');
const practiceBank=JSON.parse(zlib.gunzipSync(Buffer.from(practiceB64,'base64')).toString('utf8'));
assert.equal(practiceBank.version,'V1.1','reviewed practice version mismatch');
assert.equal(practiceBank.lessons?.length,20,'reviewed practice must contain 20 lessons');
assert.equal(practiceBank.qa?.total_questions,640,'reviewed practice must contain 640 questions');
let practiceTotal=0;const practiceIds=new Set();
for(const L of practiceBank.lessons){
  assert.equal(L.basic?.length,18,`practice lesson ${L.lesson_id}: basic count must be 18`);
  assert.equal(L.advanced?.length,14,`practice lesson ${L.lesson_id}: advanced count must be 14`);
  for(const q of [...L.basic,...L.advanced]){
    practiceTotal++;
    assert(q.id&&!practiceIds.has(q.id),`practice duplicate/missing ID ${q.id}`);practiceIds.add(q.id);
    assert(String(q.answer||'').trim(),`${q.id}: answer missing`);
    assert(String(q.explanation_vi||'').trim(),`${q.id}: Vietnamese explanation missing`);
    assert.equal(q.explanation_zh,undefined,`${q.id}: Chinese explanation field should not exist`);
    for(const key of ['source_mode','source_page','source_id','source_basis'])assert.equal(q[key],undefined,`${q.id}: internal source field ${key} should not exist`);
    if(q.type==='语序排序')assert(Array.isArray(q.segments)&&q.segments.length>=2,`${q.id}: sort segments missing`);
    else{
      assert(Array.isArray(q.options)&&q.options.length>=2,`${q.id}: options missing`);
      assert.equal(new Set(q.options).size,q.options.length,`${q.id}: duplicate options`);
      assert(q.options.includes(q.answer),`${q.id}: answer not in options`);
    }
  }
}
assert.equal(practiceTotal,640,'reviewed practice total mismatch');
console.log('PRACTICE DATA PASS: 20 lessons · 640 questions · 18 basic + 14 advanced per lesson');

const cloneData=()=>JSON.parse(JSON.stringify(data));
const clonePractice=()=>JSON.parse(JSON.stringify(practiceBank));
const run=(ctx,path)=>vm.runInContext(read(path),ctx,{filename:path});
function makeDom(file,url){
  const errors=[];
  const vc=new VirtualConsole();
  vc.on('jsdomError',e=>errors.push(e));
  vc.on('error',(...a)=>console.error(...a));
  const dom=new JSDOM(read(file),{url,runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
  const w=dom.window;
  w.scrollTo=()=>{};
  w.confirm=()=>false;
  w.speechSynthesis={cancel(){},getVoices(){return[]},speak(){}};
  w.SpeechSynthesisUtterance=function(text){this.text=text};
  return {dom,w,ctx:dom.getInternalVMContext(),errors};
}
function baseRuntime(env,lesson=false){
  env.w.HSK3_LESSONS=cloneData();
  env.w.HSK3_PRACTICE_V11=clonePractice();
  run(env.ctx,'hsk3/corrections.js');
  run(env.ctx,'hsk3/textbook-baseline.js');
  run(env.ctx,'hsk3/textbook-audit.js');
  assert.equal(env.w.__HSK3_CONTENT_AUDITED,true,'content audit layer must initialize');
  run(env.ctx,'hsk3/app-core.js');
  if(lesson)run(env.ctx,'assets/hsk2-parity.js');
  run(env.ctx,'hsk3/app-practice.js');
  run(env.ctx,'hsk3/textbook-audit-ui.js');
}

{
  const env=makeDom('hsk3/index.html','https://example.test/hsk3/index.html');
  baseRuntime(env,false);
  vm.runInContext('renderHome()',env.ctx);
  assert.equal(env.w.document.querySelectorAll('#lessonGrid .lesson-card').length,20,'home: 20 lesson cards expected');
  assert(env.w.document.querySelectorAll('#lessonGrid a[href*="lesson.html?id="]').length>=120,'home: lesson links missing');
  assert.equal(env.w.document.querySelector('#wordStat').textContent.trim(),'325','home: audited textbook item count should be 325');
  assert(env.w.document.querySelector('#hsk3TextbookNote'),'home: HSK textbook note missing');
  env.dom.window.close();
  console.log('HOME PASS: 20 cards, 325 audited textbook items and textbook note rendered');
}

for(let id=1;id<=20;id++){
  const env=makeDom('hsk3/lesson.html',`https://example.test/hsk3/lesson.html?id=${id}&sec=vocab`);
  baseRuntime(env,true);
  vm.runInContext('initLesson()',env.ctx);
  await new Promise(r=>setTimeout(r,0));
  const d=env.w.document;
  assert(d.querySelector('#lessonTitle').textContent.trim(),`lesson ${id}: title not rendered`);
  assert.equal(d.querySelectorAll('#lessonSelect option').length,20,`lesson ${id}: selector not 20 lessons`);
  assert(d.querySelector('#vocabGrid').children.length>0,`lesson ${id}: vocab not rendered`);
  assert(d.querySelector('#sceneTabs').children.length>0,`lesson ${id}: text scenes not rendered`);
  assert(d.querySelector('#grammarList').children.length>0,`lesson ${id}: grammar not rendered`);
  assert(d.querySelector('#hanziWordMap').children.length>0,`lesson ${id}: hanzi not rendered`);
  assert.equal(d.querySelectorAll('#basicPractice .reviewed-card').length,18,`lesson ${id}: basic practice must render 18 questions`);
  assert.equal(d.querySelectorAll('#advancedPractice .reviewed-card').length,14,`lesson ${id}: advanced practice must render 14 questions`);
  const practiceText=d.querySelector('#practice').textContent;
  assert(!/依据官方练习册|练习册第|改编为|source_mode|source_page|source_id|source_basis|怎么做网站|如何做网站/.test(practiceText),`lesson ${id}: internal production/source note leaked into practice UI`);
  vm.runInContext(`checkReviewedTier('basic')`,env.ctx);
  const firstFeedback=d.querySelector('#basicPractice .reviewed-card .feedback');
  assert(firstFeedback.textContent.includes('Đáp án / 正确答案'),`lesson ${id}: answer not shown after submit`);
  assert(firstFeedback.textContent.includes('Giải thích'),`lesson ${id}: Vietnamese explanation not shown after submit`);
  for(const sec of ['vocab','text','grammar','hanzi','practice'])vm.runInContext(`showSection('${sec}',false)`,env.ctx);
  run(env.ctx,'assets/lesson-menu-parity.js');
  run(env.ctx,'assets/hanzi-curriculum.js');
  await new Promise(r=>setTimeout(r,15));
  assert(d.querySelector('.parity-lesson-menu-wrap'),`lesson ${id}: custom lesson menu missing`);
  assert(d.querySelector('#textbookHanziFocus'),`lesson ${id}: textbook hanzi focus missing`);
  assert(d.querySelector('#auditVocabSummary'),`lesson ${id}: audited vocab summary missing`);
  assert(d.querySelector('#auditTextbookSource'),`lesson ${id}: textbook text/source panel missing`);
  assert(d.querySelector('#auditGrammarNote'),`lesson ${id}: audited grammar note missing`);
  assert(d.querySelector('#practice .practice-note'),`lesson ${id}: practice note missing`);
  const textbookCount=env.w.HSK3_LESSONS[id-1].vocab.length;
  assert.equal(textbookCount,env.w.HSK3_AUDIT_META.counts[id],`lesson ${id}: audited textbook count mismatch`);
  const fatal=env.errors.filter(e=>!/Could not load|Not implemented/.test(String(e?.message||e)));
  assert.equal(fatal.length,0,`lesson ${id}: jsdom runtime errors: ${fatal.map(e=>e.message).join(' | ')}`);
  env.dom.window.close();
}
console.log('LESSON PASS: all 20 lessons rendered 18 basic + 14 advanced reviewed questions, answers and explanations');
console.log('HSK3 SMOKE TEST PASS');
