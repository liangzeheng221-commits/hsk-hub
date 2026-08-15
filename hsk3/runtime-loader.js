/* HSK3 runtime entrypoint. */
(()=>{
  'use strict';
  const s=document.createElement('script');
  s.src='runtime-loader-core.js?v=20260815-reviewed-practice-1';
  s.async=false;
  s.onerror=()=>console.error('[HSK3 bootstrap] không tải được runtime-loader-core.js');
  document.head.appendChild(s);

  /* Shared vocabulary presentation: Hanzi → pinyin → bilingual POS. */
  if(!document.querySelector('script[data-vocab-unified]')){
    const l=document.createElement('link');l.rel='stylesheet';l.href='../assets/vocab-unified.css?v=20260815-3';l.dataset.vocabUnified='1';document.head.appendChild(l);
    const u=document.createElement('script');u.src='../assets/vocab-unified.js?v=20260815-2';u.dataset.vocabUnified='1';document.body.appendChild(u);
  }
})();
