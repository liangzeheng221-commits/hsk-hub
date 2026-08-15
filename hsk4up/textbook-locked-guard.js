/* Hard gate: HSK4 上 cannot be marked ready unless all 50 canonical textbook texts are present. */
(()=>{
  'use strict';
  if(typeof validateData!=='function')throw new Error('[HSK4U locked] validateData unavailable');
  const base=validateData;
  validateData=function(){
    const c=window.__HSK4U_TEXTBOOK_LOCKED;
    if(!c?.ok||c.text_units!==50||c.lines!==290||c.source_pdf_pages!==152)throw new Error('HSK 4 上 locked textbook corpus chưa sẵn sàng.');
    const A=base();let units=0,lines=0;
    for(const L of A){
      if(!L.textbookLocked||L.textbookCorpusId!==c.corpus_id||L.scenes?.length!==5)throw new Error(`Bài ${L.id}: bài khoá canonical chưa đủ 5 phần.`);
      for(const s of L.scenes){
        if(!s.locked||!Array.isArray(s.lines)||!s.lines.length)throw new Error(`Bài ${L.id}, bài khoá ${s.text_no}: thiếu văn bản canonical.`);
        for(const x of s.lines){if(!x.locked||!x.zh||!x.py||!x.vn)throw new Error(`Bài ${L.id}, bài khoá ${s.text_no}: thiếu 中文/pinyin/Việt.`);lines++}units++;
      }
    }
    if(units!==50||lines!==290)throw new Error(`HSK4 上 canonical counts invalid: ${units}/${lines}`);
    document.documentElement.dataset.hsk4UpperTextbookLocked='ok';
    return A;
  };

  /* Shared vocabulary presentation: Hanzi → pinyin → bilingual POS. */
  if(!document.querySelector('script[data-vocab-unified]')){
    const l=document.createElement('link');l.rel='stylesheet';l.href='../assets/vocab-unified.css?v=20260815-2';l.dataset.vocabUnified='1';document.head.appendChild(l);
    const s=document.createElement('script');s.src='../assets/vocab-unified.js?v=20260815-2';s.dataset.vocabUnified='1';document.body.appendChild(s);
  }
})();
