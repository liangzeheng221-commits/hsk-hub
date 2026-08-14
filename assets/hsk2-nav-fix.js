/* Keep HSK2 lesson navigation inside HSK2 while the global portal remains available via level switch. */
(()=>{
  const home='hsk2.html';
  const fixTop=()=>{document.querySelectorAll('.nav-actions a.nav-btn').forEach(a=>{if(a.getAttribute('href')==='index.html'&&/Trang chủ/i.test(a.textContent||''))a.setAttribute('href',home)})};
  const old=window.refreshLessonLinks;
  if(typeof old==='function'){
    window.refreshLessonLinks=function(){old();const box=document.getElementById('lessonSwitch');if(box)box.querySelectorAll('a[href="index.html"]').forEach(a=>a.setAttribute('href',home));fixTop()};
  }
  fixTop();
})();
