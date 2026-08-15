/* Hard gate: HSK4 下 cannot boot as ready unless all 50 locked textbook texts are present. */
(()=>{
'use strict';
if(typeof validateData!=='function')throw new Error('[HSK4L locked] validateData unavailable');
const base=validateData;
function lockedValidate(){
  const meta=window.__HSK4L_TEXTBOOK_LOCKED;
  const corpus=window.HSK4L_LOCKED_TEXTS;
  if(!meta?.ok||meta.corpus_id!=="hsk4l-authoritative-locked-v1"||meta.source_pdf_sha256!=="1831dbd6132619de2f180c1d5d02c3f178f317cdd7ba73cf7588eb4c7d0fbe84"||meta.source_pdf_pages!==164||meta.text_units!==50||meta.lines!==286){
    throw new Error('HSK 4 下 locked textbook corpus chưa sẵn sàng.');
  }
  let units=0,lines=0;
  for(let lesson=11;lesson<=20;lesson++){
    const rows=corpus?.[lesson];
    if(!Array.isArray(rows)||rows.length!==5)throw new Error(`Bài ${lesson}: canonical textbook text must have 5 units.`);
    rows.forEach((u,i)=>{
      if(Number(u.n)!==i+1||!Array.isArray(u.lines)||!u.lines.length)throw new Error(`Bài ${lesson}, 课文 ${i+1}: canonical text missing.`);
      if(!u.src?.text?.length||!u.src?.pinyin?.length)throw new Error(`Bài ${lesson}, 课文 ${i+1}: source pages missing.`);
      u.lines.forEach((x,j)=>{
        if(!x.zh||!x.py||!x.vi)throw new Error(`Bài ${lesson}, 课文 ${i+1}, line ${j+1}: 中文/pinyin/Việt incomplete.`);
        lines++;
      });
      units++;
    });
  }
  if(units!==50||lines!==286)throw new Error(`HSK4 下 canonical counts invalid: ${units}/${lines}`);
  const A=base();
  A.forEach(L=>{
    L.textbookLocked=true;
    L.textbookCorpusId=meta.corpus_id;
    L.textbookTextUnits=5;
  });
  document.documentElement.dataset.hsk4LowerTextbookGuard='ok';
  return A;
}
validateData=lockedValidate;
try{lockedValidate();}catch(err){
  document.documentElement.dataset.hsk4LowerTextbookGuard='error';
  console.error(err);
}

if(!document.querySelector('script[data-vocab-unified]')){
  const l=document.createElement('link');l.rel='stylesheet';l.href='../assets/vocab-unified.css?v=20260816-1';l.dataset.vocabUnified='1';document.head.appendChild(l);
  const s=document.createElement('script');s.src='../assets/vocab-unified.js?v=20260815-4';s.dataset.vocabUnified='1';document.body.appendChild(s);
}
if(!document.querySelector('script[data-student-polish]')){
  const p=document.createElement('script');p.src='../assets/student-polish.js?v=20260816-2';p.dataset.studentPolish='1';document.body.appendChild(p);
}
})();
