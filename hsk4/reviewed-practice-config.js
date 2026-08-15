ReviewedPractice.install({
  label:'HSK 4 下',
  globalName:'HSK4_LOWER_PRACTICE_V10',
  diagnosticsName:'__HSK4_LOWER_REVIEWED_PRACTICE',
  pathPrefix:'../practice/reviewed/hsk4lower-v1.0.part',
  partCount:7,
  cacheKey:'20260815-reviewed-1',
  expected:{version:'HSK4下-V1.0',lessonCount:10,totalQuestions:360,basicCount:20,advancedCount:16}
});

/* Locked textbook full-text boot: HSK4 下 lessons 11–20. */
(()=>{
  const v='20260815-locked-1';
  const css=document.createElement('link');
  css.rel='stylesheet'; css.href='locked-text.css?v='+v; document.head.appendChild(css);
  const srcs=[
    'locked-text/chunk1.js','locked-text/chunk2.js','locked-text/chunk3.js','locked-text/chunk4.js',
    'locked-text/chunk5.js','locked-text/chunk6.js','locked-text/chunk7.js','locked-text/chunk8.js',
    'locked-text/load.js','locked-text-ui.js'
  ];
  const load=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src+'?v='+v;s.onload=resolve;s.onerror=()=>reject(new Error('Failed to load '+src));document.head.appendChild(s);});
  const apply=()=>{
    const sec=document.getElementById('text');
    if(sec){const h=sec.querySelector('.section-head h2');if(h)h.textContent='BÀI KHOÁ — 课文全文';const n=sec.querySelector('.source-note');if(n)n.textContent='Đầy đủ 5 phần bài khoá theo giáo trình: chữ Hán, pinyin chuẩn đã khóa và bản dịch tiếng Việt từng câu.';}
    if(window.L&&typeof window.renderText==='function')window.renderText();
  };
  (async()=>{try{for(const src of srcs)await load(src);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(apply,0),{once:true});else apply();}catch(err){console.error('[HSK4 locked text]',err);document.documentElement.dataset.hsk4LockedTextData='load-error';}})();
})();
