import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';

const read=p=>fs.readFileSync(p,'utf8');

function loadBank(prefix,parts){
  const encoded=Array.from({length:parts},(_,i)=>read(`practice/reviewed/${prefix}.part${String(i+1).padStart(2,'0')}.b64`).trim()).join('');
  return JSON.parse(zlib.gunzipSync(Buffer.from(encoded,'base64')).toString('utf8'));
}

function validateBank(bank,expected){
  assert.equal(bank.version,expected.version);
  assert.equal(bank.lessons.length,expected.lessonCount);
  assert.equal(bank.qa.total_questions,expected.total);
  const ids=new Set();let total=0;
  for(const lesson of bank.lessons){
    assert.equal(lesson.basic.length,expected.basic,`Bài ${lesson.lesson_id}: basic`);
    assert.equal(lesson.advanced.length,expected.advanced,`Bài ${lesson.lesson_id}: advanced`);
    for(const q of [...lesson.basic,...lesson.advanced]){
      total++;assert(q.id&&!ids.has(q.id),`${q.id}: missing/duplicate ID`);ids.add(q.id);
      assert(String(q.answer||'').trim(),`${q.id}: answer`);
      assert(String(q.explanation_vi||'').trim(),`${q.id}: explanation_vi`);
      if(q.type==='语序排序')assert(Array.isArray(q.segments)&&q.segments.length>1,`${q.id}: segments`);
      else assert(Array.isArray(q.options)&&q.options.includes(q.answer),`${q.id}: answer in options`);
    }
  }
  assert.equal(total,expected.total);
}

function renderEveryLesson({bank,config,ids,globalName}){
  for(const id of ids){
    const dom=new JSDOM('<!doctype html><html><body><section id="practice"></section></body></html>',{url:`https://example.test/lesson.html?id=${id}&sec=practice`,runScripts:'outside-only'});
    const w=dom.window;w[globalName]=JSON.parse(JSON.stringify(bank));
    const context=dom.getInternalVMContext();
    vm.runInContext(read('assets/reviewed-practice.js'),context,{filename:'assets/reviewed-practice.js'});
    vm.runInContext(read(config),context,{filename:config});
    vm.runInContext('renderPractice()',context);
    const d=w.document;
    assert.equal(d.querySelectorAll('#basicPractice .reviewed-card').length,20,`Bài ${id}: 20 basic cards`);
    assert.equal(d.querySelectorAll('#advancedPractice .reviewed-card').length,16,`Bài ${id}: 16 advanced cards`);
    assert.equal(d.querySelectorAll('#basicPractice .reviewed-submit').length,1,`Bài ${id}: submit`);
    d.querySelector('#basicPractice .reviewed-submit').click();
    const feedback=d.querySelector('#basicPractice .reviewed-card .feedback').textContent;
    assert(feedback.includes('Đáp án / 正确答案'),`Bài ${id}: answer feedback`);
    assert(feedback.includes('解析 · Giải thích'),`Bài ${id}: Vietnamese explanation feedback`);
    const text=d.querySelector('#practice').textContent;
    assert(!/怎么做网站|如何做网站|source_mode|source_page|source_id|source_basis/.test(text),`Bài ${id}: internal note leaked`);
    assert.equal(w[config.includes('hsk4up')?'__HSK4_UP_REVIEWED_PRACTICE':'__HSK4_LOWER_REVIEWED_PRACTICE'].lessonId,id);
    dom.window.close();
  }
}

const hsk3=loadBank('hsk3-v1.1',9);
validateBank(hsk3,{version:'V1.1',lessonCount:20,total:640,basic:18,advanced:14});

const upper=loadBank('hsk4up-v1.0',7);
validateBank(upper,{version:'HSK4上-V1.0',lessonCount:10,total:360,basic:20,advanced:16});
renderEveryLesson({bank:upper,config:'hsk4up/reviewed-practice-config.js',ids:[1,2,3,4,5,6,7,8,9,10],globalName:'HSK4_UP_PRACTICE_V10'});

const lower=loadBank('hsk4lower-v1.0',7);
validateBank(lower,{version:'HSK4下-V1.0',lessonCount:10,total:360,basic:20,advanced:16});
renderEveryLesson({bank:lower,config:'hsk4/reviewed-practice-config.js',ids:[11,12,13,14,15,16,17,18,19,20],globalName:'HSK4_LOWER_PRACTICE_V10'});

for(const file of ['hsk4up/lesson.html','hsk4/lesson.html']){
  const html=read(file);
  assert(html.includes('pako@2.1.0/dist/pako.min.js'),`${file}: pako missing`);
  assert(html.includes('../assets/reviewed-practice.js'),`${file}: renderer missing`);
  assert(html.includes('reviewed-practice-config.js'),`${file}: config missing`);
}

console.log('REVIEWED PRACTICE PASS: HSK3 640 questions; HSK4 上 360 questions; HSK4 下 360 questions; all 20 HSK4 lessons rendered with answers and Vietnamese explanations');
