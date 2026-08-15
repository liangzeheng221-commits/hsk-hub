/* HSK1 Hanzi first-render fix.
   HanziWriter must be initialized only after the Hanzi section becomes visible;
   otherwise its first SVG can be laid out with a zero/hidden container and appear clipped or oversized. */
(()=>{
  'use strict';
  if(!document.body?.classList.contains('hsk1'))return;
  if(typeof window.renderHanzi!=='function'||typeof window.showSection!=='function')return;

  const baseRenderHanzi=window.renderHanzi;
  const baseShowSection=window.showSection;
  let deferred=false;
  let renderTicket=0;
  const nextFrame=cb=>typeof window.requestAnimationFrame==='function'?window.requestAnimationFrame(cb):setTimeout(cb,0);

  function hanziSectionVisible(){
    const section=document.getElementById('hanzi');
    if(!section)return false;
    if(!section.classList.contains('active'))return false;
    const style=window.getComputedStyle?window.getComputedStyle(section):null;
    return !style||style.display!=='none';
  }

  function renderWhenVisible(){
    const ticket=++renderTicket;
    nextFrame(()=>{
      if(ticket!==renderTicket)return;
      if(!hanziSectionVisible()){deferred=true;return}
      deferred=false;
      nextFrame(()=>{
        if(ticket!==renderTicket||!hanziSectionVisible())return;
        baseRenderHanzi();
        window.__HSK1_HANZI_VISIBILITY_FIX={version:'20260815-2',renderedVisible:true};
      });
    });
  }

  window.renderHanzi=function(){
    if(!hanziSectionVisible()){
      deferred=true;
      window.__HSK1_HANZI_VISIBILITY_FIX={version:'20260815-2',renderedVisible:false,deferred:true};
      return;
    }
    renderWhenVisible();
  };

  window.showSection=function(sec,push=true){
    const result=baseShowSection(sec,push);
    if(sec==='hanzi')renderWhenVisible();
    return result;
  };

  const section=document.getElementById('hanzi');
  if(section&&window.MutationObserver){
    new MutationObserver(()=>{
      if((deferred||!document.querySelector('#hanziMaster .hanzi-detail'))&&hanziSectionVisible())renderWhenVisible();
    }).observe(section,{attributes:true,attributeFilter:['class','style']});
  }
})();

/* Shared vocabulary presentation: Hanzi → pinyin → bilingual POS. */
(()=>{
  if(!document.querySelector('script[data-vocab-unified]')){
    const l=document.createElement('link');l.rel='stylesheet';l.href='../assets/vocab-unified.css?v=20260816-1';l.dataset.vocabUnified='1';document.head.appendChild(l);
    const s=document.createElement('script');s.src='../assets/vocab-unified.js?v=20260815-4';s.dataset.vocabUnified='1';document.body.appendChild(s);
  }
  if(!document.querySelector('script[data-student-polish]')){
    const p=document.createElement('script');p.src='../assets/student-polish.js?v=20260816-1';p.dataset.studentPolish='1';document.body.appendChild(p);
  }
})();
