/* Unified site unlock for HSK1: one successful password entry unlocks HSK1/2/3 on this browser. */
(()=>{
  const SITE_KEY='hsk_site_unlocked_v1',SESSION_KEY_H1='hsk1_ranteacher_unlocked';
  const HASH='7cdee08809e6b166a8e8a9ecd162ffdd4395a7f1c5c76a10f96bacd5a7447da1';
  const SIG='7136.8001.5e08.6700.7f8e';
  const signature=text=>[...text].map(c=>c.codePointAt(0).toString(16)).join('.');
  const markUnlocked=()=>{localStorage.setItem(SITE_KEY,'1');sessionStorage.setItem(SESSION_KEY_H1,'1');sessionStorage.setItem('hsk_portal_unlocked','1');sessionStorage.setItem('hsk2_ranteacher_unlocked','1');sessionStorage.setItem('hsk3_ranteacher_unlocked','1')};
  if(localStorage.getItem(SITE_KEY)==='1'||sessionStorage.getItem('hsk_portal_unlocked')==='1')markUnlocked();
  window.checkPassword=async function(){
    const input=document.getElementById('pwInput'),err=document.getElementById('pwError'),btn=document.getElementById('pwBtn');if(!input)return;
    if(btn)btn.disabled=true;const raw=input.value.trim();let digest=null;try{digest=typeof sha256==='function'?await sha256(raw):null}catch(e){console.warn(e)}
    const ok=digest?digest===HASH:signature(raw)===SIG;if(btn)btn.disabled=false;
    if(ok){markUnlocked();const overlay=document.getElementById('pwOverlay');if(overlay)overlay.style.display='none';document.body.style.overflow=''}else{err?.classList.add('show');input.select()}
  };
  window.initGate=function(){
    const overlay=document.getElementById('pwOverlay');if(!overlay)return;
    if(localStorage.getItem(SITE_KEY)==='1'||sessionStorage.getItem('hsk_portal_unlocked')==='1'||sessionStorage.getItem(SESSION_KEY_H1)==='1'){markUnlocked();overlay.style.display='none';document.body.style.overflow=''}else{document.body.style.overflow='hidden';const input=document.getElementById('pwInput');if(input&&!input.dataset.unifiedGate){input.dataset.unifiedGate='1';input.addEventListener('keydown',e=>{if(e.key==='Enter')window.checkPassword()})}}
  };
})();
