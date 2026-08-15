/* Unified session-only password gate for the HSK site.
   One successful unlock applies to all levels in the current tab session only.
   Closing the tab/browser session requires the password again. */
(()=>{
  'use strict';
  const SESSION_KEY='hsk_portal_unlocked_v2';
  const LEGACY_LOCAL_KEY='hsk_site_unlocked_v1';
  const COMPAT_SESSION_KEYS=[
    'hsk_portal_unlocked',
    'hsk1_ranteacher_unlocked',
    'hsk2_ranteacher_unlocked',
    'hsk3_ranteacher_unlocked',
    'hsk4_upper_ranteacher_unlocked',
    'hsk4_lower_ranteacher_unlocked'
  ];
  const PASSWORD_HASH='5b363ff1986142a6f34d3e259948aa38ec4773ad293a0cc03f2357877433a0c5';
  const PASSWORD_SIG='52.61.6e.6c.61.6f.73.68.69.6d.65.69.6d.65.69';

  const byId=id=>document.getElementById(id);
  const signature=text=>[...String(text)].map(c=>c.codePointAt(0).toString(16)).join('.');
  async function digest(text){
    if(!globalThis.crypto?.subtle)return null;
    const data=new TextEncoder().encode(text);
    const hash=await crypto.subtle.digest('SHA-256',data);
    return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  function clearLegacyPersistence(){
    try{localStorage.removeItem(LEGACY_LOCAL_KEY)}catch(_e){}
  }
  function setCompatSession(){
    try{
      sessionStorage.setItem(SESSION_KEY,'1');
      COMPAT_SESSION_KEYS.forEach(k=>sessionStorage.setItem(k,'1'));
    }catch(_e){}
  }
  function clearCompatSession(){
    try{COMPAT_SESSION_KEYS.forEach(k=>sessionStorage.removeItem(k))}catch(_e){}
  }
  function isUnlocked(){
    try{return sessionStorage.getItem(SESSION_KEY)==='1'}catch(_e){return false}
  }
  function setOverlay(open){
    const overlay=byId('pwOverlay');
    if(!overlay)return;
    overlay.style.display=open?'':'none';
    document.body.style.overflow=open?'hidden':'';
    if(open){
      const input=byId('pwInput');
      if(input&&!input.disabled)setTimeout(()=>input.focus(),0);
    }
  }
  function syncGate(){
    clearLegacyPersistence();
    if(isUnlocked()){
      setCompatSession();
      setOverlay(false);
    }else{
      clearCompatSession();
      setOverlay(true);
    }
  }
  async function unlock(){
    const input=byId('pwInput'),btn=byId('pwBtn'),err=byId('pwError');
    if(!input)return false;
    if(btn)btn.disabled=true;
    const raw=input.value.trim();
    let hash=null;
    try{hash=await digest(raw)}catch(_e){}
    const ok=hash?hash===PASSWORD_HASH:signature(raw)===PASSWORD_SIG;
    if(btn)btn.disabled=false;
    if(ok){
      err?.classList.remove('show');
      setCompatSession();
      setOverlay(false);
      window.__HSK_SESSION_AUTH={ok:true,version:'20260815-1',sessionOnly:true};
      return true;
    }
    err?.classList.add('show');
    input.select();
    window.__HSK_SESSION_AUTH={ok:false,version:'20260815-1',sessionOnly:true};
    return false;
  }

  // Override global gate functions where classic scripts exposed them.
  window.checkPassword=unlock;
  window.initGate=syncGate;

  // Capture before legacy inline/onclick handlers so only the new password is accepted.
  document.addEventListener('click',ev=>{
    const btn=ev.target?.closest?.('#pwBtn');
    if(!btn)return;
    ev.preventDefault();
    ev.stopImmediatePropagation();
    unlock();
  },true);
  document.addEventListener('keydown',ev=>{
    if(ev.key!=='Enter'||ev.target!==byId('pwInput'))return;
    ev.preventDefault();
    ev.stopImmediatePropagation();
    unlock();
  },true);

  function updatePortalNote(){
    const note=document.querySelector('.portal-note');
    if(note)note.innerHTML='🔐 <b>Chỉ nhập mật khẩu một lần trong phiên mở website hiện tại.</b> Có thể chuyển tự do giữa HSK 1 / 2 / 3 / HSK 4 上 / HSK 4 下; sau khi đóng tab/trình duyệt và mở lại website, cần nhập mật khẩu lại.';
  }

  clearLegacyPersistence();
  syncGate();
  updatePortalNote();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{syncGate();updatePortalNote()},{once:true});
  window.__HSK_SESSION_AUTH_API={version:'20260815-1',unlock,syncGate,isUnlocked,sessionKey:SESSION_KEY};
})();