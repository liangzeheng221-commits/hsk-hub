/* HSK4 下 authoritative locked textbook corpus loader. */
(()=>{
'use strict';
const META={
  corpus_id:"hsk4l-authoritative-locked-v1",
  source_pdf_sha256:"1831dbd6132619de2f180c1d5d02c3f178f317cdd7ba73cf7588eb4c7d0fbe84",
  source_pdf_pages:164,
  lessons:10,
  text_units:50,
  lines:286,
  vi_mode:'editorial_translation_reviewed'
};
function fail(message){
  window.__HSK4L_TEXTBOOK_LOCKED={ok:false,error:message,...META};
  document.documentElement.dataset.hsk4LockedTextData='error';
  document.documentElement.dataset.hsk4LowerTextbookLocked='error';
  throw new Error('[HSK4L locked] '+message);
}
try{
  if(!window.pako?.ungzip)fail('pako gzip decoder unavailable');
  const b64=window.__HSK4L_LOCKED_B64;
  if(typeof b64!=='string'||!b64)fail('packed corpus missing');
  if(b64.length!==73804)fail('packed corpus length mismatch');
  const bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
  const corpus=JSON.parse(window.pako.ungzip(bytes,{to:'string'}));
  const expectedLessons=Array.from({length:10},(_,i)=>String(i+11));
  const lessonKeys=Object.keys(corpus||{}).sort((a,b)=>Number(a)-Number(b));
  if(JSON.stringify(lessonKeys)!==JSON.stringify(expectedLessons))fail('lesson keys must be 11–20');

  let unitCount=0,lineCount=0;
  const han=/[\u3400-\u9fff\uf900-\ufaff]/;
  for(const lesson of expectedLessons){
    const units=corpus[lesson];
    if(!Array.isArray(units)||units.length!==5)fail(`lesson ${lesson} must contain 5 textbook texts`);
    units.forEach((u,i)=>{
      if(Number(u?.n)!==i+1)fail(`lesson ${lesson} text order mismatch at ${i+1}`);
      if(!u?.id||!u?.title||!u?.vn_title||!u?.type)fail(`lesson ${lesson} text ${i+1} metadata incomplete`);
      if(!Array.isArray(u?.src?.text)||!u.src.text.length||!Array.isArray(u?.src?.pinyin)||!u.src.pinyin.length)fail(`lesson ${lesson} text ${i+1} source pages missing`);
      if(Object.prototype.hasOwnProperty.call(u,'summary')||Object.prototype.hasOwnProperty.call(u,'points'))fail(`lesson ${lesson} text ${i+1} contains non-canonical summary/points`);
      if(!Array.isArray(u?.lines)||!u.lines.length)fail(`lesson ${lesson} text ${i+1} is empty`);
      u.lines.forEach((x,j)=>{
        if(!String(x?.zh||'').trim()||!String(x?.py||'').trim()||!String(x?.vi||'').trim())fail(`lesson ${lesson} text ${i+1} line ${j+1} missing zh/py/vi`);
        if(han.test(String(x.py)))fail(`lesson ${lesson} text ${i+1} line ${j+1} pinyin contains Han text`);
        lineCount++;
      });
      unitCount++;
    });
  }
  if(unitCount!==META.text_units||lineCount!==META.lines)fail(`canonical counts invalid: ${unitCount}/${lineCount}`);

  const l11t5=corpus['11'][4].lines.map(x=>x.py).join(' ');
  const allLines=Object.values(corpus).flatMap(units=>units.flatMap(u=>u.lines));
  if(!/hào\s+dúshū/i.test(l11t5))fail('lesson 11 好读书 contextual reading not locked');
  if(!allLines.some(x=>String(x?.zh||'').includes('71%')))fail('lesson 17 71% checkpoint missing');
  if(!allLines.some(x=>String(x?.zh||'').includes('5500公里')))fail('lesson 20 5500公里 checkpoint missing');

  window.HSK4L_LOCKED_TEXTS=corpus;
  delete window.__HSK4L_LOCKED_B64;
  window.__HSK4L_TEXTBOOK_LOCKED={ok:true,...META};
  document.documentElement.dataset.hsk4LockedTextData='50/50';
  document.documentElement.dataset.hsk4LowerTextbookLocked='ok';
}catch(err){
  if(!window.__HSK4L_TEXTBOOK_LOCKED?.error){
    window.__HSK4L_TEXTBOOK_LOCKED={ok:false,error:err?.message||String(err),...META};
    document.documentElement.dataset.hsk4LockedTextData='error';
    document.documentElement.dataset.hsk4LowerTextbookLocked='error';
  }
  console.error(err);
}
})();
