/* Unified HSK1 session gate. One password entry unlocks all HSK levels in the current tab session only. */
(()=>{
  const SESSION_SITE_KEY='hsk_portal_unlocked_v2',LEGACY_LOCAL_KEY='hsk_site_unlocked_v1',SESSION_KEY_H1='hsk1_ranteacher_unlocked';
  const HASH='5b363ff1986142a6f34d3e259948aa38ec4773ad293a0cc03f2357877433a0c5';
  const SIG='52.61.6e.6c.61.6f.73.68.69.6d.65.69.6d.65.69';
  const signature=text=>[...text].map(c=>c.codePointAt(0).toString(16)).join('.');
  const clearLegacy=()=>{try{localStorage.removeItem(LEGACY_LOCAL_KEY)}catch(_e){}};
  const markUnlocked=()=>{sessionStorage.setItem(SESSION_SITE_KEY,'1');sessionStorage.setItem(SESSION_KEY_H1,'1');sessionStorage.setItem('hsk_portal_unlocked','1');sessionStorage.setItem('hsk2_ranteacher_unlocked','1');sessionStorage.setItem('hsk3_ranteacher_unlocked','1');sessionStorage.setItem('hsk4_upper_ranteacher_unlocked','1');sessionStorage.setItem('hsk4_lower_ranteacher_unlocked','1')};
  const isUnlocked=()=>sessionStorage.getItem(SESSION_SITE_KEY)==='1';
  clearLegacy();
  if(isUnlocked())markUnlocked();else{sessionStorage.removeItem('hsk_portal_unlocked');sessionStorage.removeItem(SESSION_KEY_H1)}
  window.checkPassword=async function(){
    const input=document.getElementById('pwInput'),err=document.getElementById('pwError'),btn=document.getElementById('pwBtn');if(!input)return;
    if(btn)btn.disabled=true;const raw=input.value.trim();let digest=null;try{digest=typeof sha256==='function'?await sha256(raw):null}catch(e){console.warn(e)}
    const ok=digest?digest===HASH:signature(raw)===SIG;if(btn)btn.disabled=false;
    if(ok){markUnlocked();err?.classList.remove('show');const overlay=document.getElementById('pwOverlay');if(overlay)overlay.style.display='none';document.body.style.overflow=''}else{err?.classList.add('show');input.select()}
  };
  window.initGate=function(){
    clearLegacy();const overlay=document.getElementById('pwOverlay');if(!overlay)return;
    if(isUnlocked()){markUnlocked();overlay.style.display='none';document.body.style.overflow=''}else{sessionStorage.removeItem('hsk_portal_unlocked');sessionStorage.removeItem(SESSION_KEY_H1);overlay.style.display='';document.body.style.overflow='hidden';const input=document.getElementById('pwInput');if(input&&!input.dataset.unifiedGate){input.dataset.unifiedGate='1';input.addEventListener('keydown',e=>{if(e.key==='Enter')window.checkPassword()})}}
  };
  window.__HSK1_SESSION_AUTH={version:'20260815-2',sessionOnly:true};
})();
