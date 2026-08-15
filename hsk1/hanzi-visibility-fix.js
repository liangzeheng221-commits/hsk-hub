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

  function hanziSectionVisible(){
    const section=document.getElementById('hanzi');
    if(!section)return false;
    if(!section.classList.contains('active'))return false;
    const style=window.getComputedStyle?window.getComputedStyle(section):null;
    return !style||style.display!=='none';
  }

  function renderWhenVisible(){
    const ticket=++renderTicket;
    const run=()=>{
      if(ticket!==renderTicket)return;
      if(!hanziSectionVisible()){deferred=true;return}
      deferred=false;
      // Wait one paint after display/class changes so the 176×176 canvas has final geometry.
      requestAnimationFrame(()=>{
        if(ticket!==renderTicket||!hanziSectionVisible())return;
        baseRenderHanzi();
        window.__HSK1_HANZI_VISIBILITY_FIX={version:'20260815-1',renderedVisible:true};
      });
    };
    if(typeof requestAnimationFrame==='function')requestAnimationFrame(run);else setTimeout(run,0);
  }

  window.renderHanzi=function(){
    if(!hanziSectionVisible()){
      deferred=true;
      window.__HSK1_HANZI_VISIBILITY_FIX={version:'20260815-1',renderedVisible:false,deferred:true};
      return;
    }
    renderWhenVisible();
  };

  window.showSection=function(sec,push=true){
    const result=baseShowSection(sec,push);
    if(sec==='hanzi')renderWhenVisible();
    return result;
  };

  // Also recover if another script makes the section visible without using showSection().
  const section=document.getElementById('hanzi');
  if(section&&window.MutationObserver){
    new MutationObserver(()=>{
      if((deferred||!document.querySelector('#hanziMaster .hanzi-detail'))&&hanziSectionVisible())renderWhenVisible();
    }).observe(section,{attributes:true,attributeFilter:['class','style']});
  }

  window.addEventListener('resize',()=>{
    if(hanziSectionVisible())renderWhenVisible();
  },{passive:true});
})();