/* HSK3 runtime entrypoint. */
(()=>{
  'use strict';
  function loadUnifiedVocab(){
    if(!document.querySelector('script[data-vocab-unified]')){
      const l=document.createElement('link');
      l.rel='stylesheet';
      l.href='../assets/vocab-unified.css?v=20260816-4';
      l.dataset.vocabUnified='1';
      document.head.appendChild(l);
      const u=document.createElement('script');
      u.src='../assets/vocab-unified.js?v=20260815-4';
      u.dataset.vocabUnified='1';
      document.body.appendChild(u);
    }
    if(!document.querySelector('script[data-student-polish]')){
      const p=document.createElement('script');
      p.src='../assets/student-polish.js?v=20260816-1';
      p.dataset.studentPolish='1';
      document.body.appendChild(p);
    }
  }

  const s=document.createElement('script');
  s.src='runtime-loader-core.js?v=20260815-reviewed-practice-1';
  s.async=false;
  s.onerror=()=>console.error('[HSK3 bootstrap] không tải được runtime-loader-core.js');
  s.onload=()=>{
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      if(window.__HSK3_RUNTIME_OK){clearInterval(timer);loadUnifiedVocab();return}
      if(document.documentElement.dataset.hsk3Runtime==='error'||tries>=240)clearInterval(timer);
    },50);
  };
  document.head.appendChild(s);
})();
