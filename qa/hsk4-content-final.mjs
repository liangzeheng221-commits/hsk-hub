import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {JSDOM,VirtualConsole} from 'jsdom';
const read=p=>fs.readFileSync(p,'utf8');

{
  const ctx={window:{pinyinPro:{pinyin:t=>Array.from(String(t))}},document:{documentElement:{dataset:{}}}};
  vm.createContext(ctx);
  vm.runInContext(read('hsk4/data.js'),ctx,{filename:'hsk4/data.js'});
  for(let i=11;i<=20;i++)vm.runInContext(read(`hsk4/data/${i}.js`),ctx,{filename:`hsk4/data/${i}.js`});
  vm.runInContext(read('hsk4/content-audit.js'),ctx,{filename:'hsk4/content-audit.js'});
  vm.runInContext(read('hsk4/content-final.js'),ctx,{filename:'hsk4/content-final.js'});
  const A=ctx.window.HSK4_LOWER_LESSONS;
  assert.equal(A.length,10);
  assert.equal(A.reduce((n,L)=>n+L.vocab.length,0),311);
  assert.equal(A.reduce((n,L)=>n+L.vocab.filter(w=>w.pos&&w.posLabel).length,0),311,'all vocabulary has POS');
  assert.equal(A.reduce((n,L)=>n+L.comprehension.length,0),50,'50 detailed comprehension items');
  assert.equal(A.reduce((n,L)=>n+L.properNouns.length,0),10,'proper nouns separated from vocabulary');
  for(const L of A){
    assert.equal(L.bookPage,L.pdfPage-8,`lesson ${L.id}: book/pdf page mapping`);
    assert.equal(L.comprehension.length,5,`lesson ${L.id}: comprehension`);
    assert(L.tasks.warmup.length>=2&&L.tasks.retell.length>=3&&L.tasks.application.length>=2,`lesson ${L.id}: pedagogical tasks`);
  }
  assert.equal(A[0].bookPage,2);
  assert.equal(A[9].bookPage,127);
  assert.equal(A.find(L=>L.id===16).title,'生活可以更美好');
  assert(!A.find(L=>L.id===16).title.endsWith('。'));
  assert.match(A.find(L=>L.id===11).titlePinyin,/hào/);
  const s175=A.find(L=>L.id===17).scenes[4];
  assert.match(s175.points,/海底的动物们一直在“说话”/);
  assert.match(s175.points,/各种颜色的亮光/);
  const s204=A.find(L=>L.id===20).scenes[3];
  assert.match(s204.points,/上海话/);assert.match(s204.points,/普通话/);assert.match(s204.summary,/tiếng Thượng Hải/);
  const s143=A.find(L=>L.id===14).scenes[2];
  assert.match(s143.points,/关灯一小时/);assert.match(s143.contextNote,/统一规则/);
  assert(A.find(L=>L.id===12).scenes[1].contextNote);
  assert(A.find(L=>L.id===13).scenes[3].contextNote);
  assert(A.find(L=>L.id===18).scenes[1].contextNote);
  assert(A.find(L=>L.id===20).scenes[1].contextNote);
  assert(A.find(L=>L.id===20).scenes[2].contextNote);
  const get=(id,zh)=>A.find(L=>L.id===id).vocab.find(w=>w.zh===zh);
  assert.equal(get(11,'厉害').py,'lìhai');
  assert.equal(get(17,'干').py,'gàn');
  assert.equal(get(19,'功夫').py,'gōngfu');
  assert.equal(get(20,'怪').py,'guài');
  assert.match(get(11,'之').posLabel,/助词/);
  assert.match(get(11,'连').posLabel,/介词/);
  assert.equal(ctx.window.HSK4_LOWER_CONTENT_FINAL.vocabWithPos,311);
  console.log('FINAL DATA PASS: 10 lessons · 311 POS-tagged vocab · 50 comprehension · 10 proper nouns · critical textbook corrections');
}

function makeDom(file,url){
  const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e));
  const dom=new JSDOM(read(file),{url,runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
  const w=dom.window;w.HSK4_BOOT_DISABLE_AUTO=true;w.scrollTo=()=>{};w.confirm=()=>false;
  w.speechSynthesis={cancel(){},getVoices(){return[]},speak(){}};w.SpeechSynthesisUtterance=function(text){this.text=text};
  w.pinyinPro={pinyin:t=>Array.from(String(t)).map(x=>x)};
  return {dom,w,ctx:dom.getInternalVMContext(),errors};
}
function load(env){
  for(const f of ['hsk4/data.js',...Array.from({length:10},(_,i)=>`hsk4/data/${i+11}.js`),'hsk4/runtime.js','hsk4/content-audit.js','hsk4/content-final.js','hsk4/modules.js','hsk4/content-ui-final.js','hsk4/practice.js','hsk4/practice-final.js']) vm.runInContext(read(f),env.ctx,{filename:f});
  vm.runInContext('boot()',env.ctx);
}

{
  const env=makeDom('hsk4/lesson.html','https://example.test/hsk4/lesson.html?id=11&sec=vocab');load(env);
  const d=env.w.document;
  assert.equal(d.documentElement.dataset.hsk4ContentFinal,'20260814-5');
  assert.equal(d.documentElement.dataset.hsk4UiFinal,'20260814-6');
  assert.equal(d.documentElement.dataset.hsk4PracticeFinal,'20260814-5');
  const n=env.w.HSK4_LOWER_LESSONS.find(x=>x.id===11).vocab.length;
  assert.equal(d.querySelectorAll('#vocabGrid .vcard').length,n);
  assert.equal(d.querySelectorAll('#vocabGrid .pos-badge').length,n*2);
  assert(d.querySelector('.word-pos')?.textContent.trim());
  vm.runInContext("showSection('text',false)",env.ctx);
  assert.match(d.querySelector('#textbookTextMeta').textContent,/书内第 2 页/);
  assert.match(d.querySelector('#textbookTextMeta').textContent,/hào/);
  assert.equal(d.querySelectorAll('.proper-noun-item').length,1);
  vm.runInContext("showSection('practice',false)",env.ctx);
  assert.match(d.querySelector('#vocabCoverage').textContent,new RegExp(`${n}/${n}`));
  assert.equal(d.querySelectorAll('#q-mc .qcard').length,Math.min(12,n));
  assert.equal(d.querySelectorAll('#q-fill .fill-card').length,n-Math.min(12,n));
  assert.equal(d.querySelectorAll('#q-read .qcard').length,5);
  assert.equal(d.querySelectorAll('.textbook-task-group').length,3);
  env.dom.window.close();console.log('FINAL LESSON 11 UI PASS: POS + page + tone + proper noun + vocab practice + tasks');
}

for(const [id,sceneIndex,needles] of [[14,2,['关灯一小时','统一规则']],[17,4,['海底的动物们一直在“说话”','各种颜色的亮光']],[20,3,['上海话','普通话']]]){
  const env=makeDom('hsk4/lesson.html',`https://example.test/hsk4/lesson.html?id=${id}&sec=text`);load(env);
  vm.runInContext(`sceneIndex=${sceneIndex};drawScene()`,env.ctx);
  const text=env.w.document.querySelector('#scenePane').textContent;
  for(const x of needles)assert(text.includes(x),`lesson ${id} scene ${sceneIndex+1}: ${x}`);
  env.dom.window.close();console.log(`FINAL SCENE PASS: lesson ${id} scene ${sceneIndex+1}`);
}

{
  const env=makeDom('hsk4/index.html','https://example.test/hsk4/index.html');load(env);
  const d=env.w.document;
  assert.equal(d.querySelectorAll('#lessonGrid .lesson-card').length,10);
  assert.match(d.querySelector('#hsk4EraNote').textContent,/2014/);
  assert.equal(d.documentElement.dataset.hsk4ContentFinal,'20260814-5');
  env.dom.window.close();console.log('FINAL HOME PASS: 10 lessons + textbook edition note');
}
console.log('HSK4 LOWER FINAL CONTENT QA PASS');
