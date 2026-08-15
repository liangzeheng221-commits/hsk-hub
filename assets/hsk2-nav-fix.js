/* Keep HSK2 lesson navigation inside HSK2 while the global portal remains available via level switch. */
(()=>{
  const home='hsk2.html';
  const fixTop=()=>{document.querySelectorAll('.nav-actions a.nav-btn').forEach(a=>{if(a.getAttribute('href')==='index.html'&&/Trang chủ/i.test(a.textContent||''))a.setAttribute('href',home)})};
  const old=window.refreshLessonLinks;
  if(typeof old==='function'){
    window.refreshLessonLinks=function(){old();const box=document.getElementById('lessonSwitch');if(box)box.querySelectorAll('a[href="index.html"]').forEach(a=>a.setAttribute('href',home));fixTop()};
  }
  fixTop();

  /* lesson-core.js is already loaded when this patch runs. Replace only the textbook text renderer so the 60 locked units use stored canonical pinyin instead of runtime pinyin generation. */
  const loadLockedUI=()=>{
    if(window.__HSK2_LOCKED_UI_LOADING)return window.__HSK2_LOCKED_UI_LOADING;
    window.__HSK2_LOCKED_UI_LOADING=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='assets/hsk2-textbook-locked-ui.js?v=20260815-1';s.onload=resolve;s.onerror=()=>reject(new Error('Không tải được HSK2 locked textbook renderer'));document.head.appendChild(s)});
    return window.__HSK2_LOCKED_UI_LOADING;
  };
  loadLockedUI().catch(e=>console.error('[HSK2 locked textbook UI]',e));
})();
