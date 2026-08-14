import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {JSDOM,VirtualConsole} from 'jsdom';

const read=p=>fs.readFileSync(p,'utf8');
const dataCtx={window:{}};vm.createContext(dataCtx);vm.runInContext(read('hsk4/data.js'),dataCtx,{filename:'hsk4/data.js'});
for(let i=11;i<=20;i++)vm.runInContext(read(`hsk4/data/${i}.js`),dataCtx,{filename:`hsk4/data/${i}.js`});
const data=dataCtx.window.HSK4_LOWER_LESSONS;
assert.equal(data.length,10);
assert.equal(data.reduce((n,L)=>n+L.vocab.length,0),311,'audited HSK4 Lower vocab total');
assert.equal(JSON.stringify(Array.from(data,x=>x.id)),JSON.stringify([11,12,13,14,15,16,17,18,19,20]));
for(const L of data){
  assert(L.title&&L.vn_title,`Bài ${L.id}: title`);
  assert.equal(new Set(L.vocab.map(v=>v.zh)).size,L.vocab.length,`Bài ${L.id}: duplicate vocab`);
  assert.equal(new Set(L.grammar.map(g=>g.title)).size,5,`Bài ${L.id}: duplicate grammar`);
  assert(L.vocab.length>=29,`Bài ${L.id}: vocab`);
  assert.equal(L.grammar.length,5,`Bài ${L.id}: grammar`);
  assert.equal(L.scenes.length,5,`Bài ${L.id}: texts`);
  assert(L.compare?.title&&L.expansion?.char&&L.culture?.title,`Bài ${L.id}: feature panels`);
}
console.log(`DATA PASS: 10 lessons, ${data.reduce((n,L)=>n+L.vocab.length,0)} vocab entries, 50 grammar points, 50 text units`);

const expectedTitles={
11:'读书好，读好书，好读书',12:'用心发现世界',13:'喝着茶看京剧',14:'保护地球母亲',15:'教育孩子的艺术',
16:'生活可以更美好。',17:'人与自然',18:'科技与世界',19:'生活的味道',20:'路上的风景'};
const expectedGrammar={
11:['连','否则','无论','然而','同时'],
12:['并且','再……也……','对于','名量词重叠','相反'],
13:['大概','偶尔','由','进行','随着'],
14:['够','以','既然','于是','什么的'],
15:['想起来','弄','千万','来','左右'],
16:['可','恐怕','到底','拿……来说','敢'],
17:['倒','干','趟','为了……而……','仍然'],
18:['是否','受不了','接着','除此以外','把……叫作……'],
19:['疑问代词活用表示任指','上','出来','总的来说','在于'],
20:['动词+着+动词+着','一……就……','究竟','起来','动词+起']};
for(const L of data){assert.equal(L.title,expectedTitles[L.id]);assert.equal(JSON.stringify(Array.from(L.grammar,g=>g.title)),JSON.stringify(expectedGrammar[L.id]))}
console.log('TEXTBOOK BASELINE PASS: lesson titles and all 50 language-point headings match audited source');
assert(read('index.html').includes('hsk4/index.html'),'root portal must link HSK4 Lower');

function makeDom(file,url){
 const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e));
 const dom=new JSDOM(read(file),{url,runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
 const w=dom.window;w.HSK4_BOOT_DISABLE_AUTO=true;w.scrollTo=()=>{};w.confirm=()=>false;
 w.speechSynthesis={cancel(){},getVoices(){return[]},speak(){}};w.SpeechSynthesisUtterance=function(text){this.text=text};
 w.pinyinPro={pinyin:t=>Array.from(String(t))};
 return {dom,w,ctx:dom.getInternalVMContext(),errors};
}
function load(env){vm.runInContext(read('hsk4/data.js'),env.ctx,{filename:'hsk4/data.js'});for(let i=11;i<=20;i++)vm.runInContext(read(`hsk4/data/${i}.js`),env.ctx,{filename:`hsk4/data/${i}.js`});vm.runInContext(read('hsk4/runtime.js'),env.ctx,{filename:'hsk4/runtime.js'});vm.runInContext(read('hsk4/modules.js'),env.ctx,{filename:'hsk4/modules.js'});vm.runInContext(read('hsk4/practice.js'),env.ctx,{filename:'hsk4/practice.js'});vm.runInContext('boot()',env.ctx)}

{
 const env=makeDom('hsk4/index.html','https://example.test/hsk4/index.html');load(env);
 const d=env.w.document;
 assert.equal(d.documentElement.dataset.hsk4Runtime,'ok');
 assert.equal(d.querySelectorAll('#lessonGrid .lesson-card').length,10);
 assert.equal(d.querySelectorAll('#lessonGrid a[href*="lesson.html?id="]').length,70);
 assert(/^\d+$/.test(d.querySelector('#wordStat').textContent.trim()));
 env.dom.window.close();console.log('HOME PASS: 10 lesson cards + 5 direct module links per lesson');
}
for(let id=11;id<=20;id++){
 const env=makeDom('hsk4/lesson.html',`https://example.test/hsk4/lesson.html?id=${id}&sec=vocab`);load(env);
 const d=env.w.document;
 assert.equal(d.documentElement.dataset.hsk4Runtime,'ok',`lesson ${id}: runtime`);
 assert(d.querySelector('#lessonTitle').textContent.trim(),`lesson ${id}: title`);
 assert.equal(d.querySelectorAll('#lessonSelect option').length,10,`lesson ${id}: chooser`);
 assert(d.querySelectorAll('#vocabGrid .vcard').length>=29,`lesson ${id}: vocab`);
 assert.equal(d.querySelectorAll('#sceneTabs .scene-tab').length,5,`lesson ${id}: texts`);
 assert.equal(d.querySelectorAll('#grammarList .grammar-card').length,5,`lesson ${id}: grammar`);
 assert(d.querySelector('#comparePanel').textContent.includes('比一比'),`lesson ${id}: compare`);
 assert(d.querySelector('#expansionPanel').textContent.includes('同字词'),`lesson ${id}: expansion`);
 assert(d.querySelector('#culturePanel').textContent.includes('文化'),`lesson ${id}: culture`);
 assert(d.querySelectorAll('#hanziWordMap .hanzi-char-btn').length>0,`lesson ${id}: hanzi`);
 assert(d.querySelectorAll('#q-mc .qcard').length===8,`lesson ${id}: vocab quiz`);
 assert(d.querySelectorAll('#q-grammar .qcard').length===5,`lesson ${id}: grammar quiz`);
 assert(d.querySelectorAll('#q-read .qcard').length===5,`lesson ${id}: reading quiz`);
 assert(d.querySelectorAll('#advancedPractice .advanced-card').length===5,`lesson ${id}: advanced`);
 vm.runInContext('checkMC();checkFill();checkGrammarQuiz();checkReadQuiz();checkAdvanced()',env.ctx);
 for(const sec of ['vocab','text','grammar','hanzi','practice'])vm.runInContext(`showSection('${sec}',false)`,env.ctx);
 env.dom.window.close();
 console.log(`LESSON ${id} PASS`);
}
console.log('HSK4 LOWER SMOKE TEST PASS');
