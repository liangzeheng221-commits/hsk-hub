const STORAGE_KEY='hsk2_ranteacher_progress_v1';
const MASTER_KEY='hsk2_ranteacher_mastered_v1';
const SESSION_KEY='hsk2_ranteacher_unlocked';
const SITE_SESSION_KEY='hsk_portal_unlocked_v2';
const LEGACY_LOCAL_KEY='hsk_site_unlocked_v1';
const PASSWORD_HASH='5b363ff1986142a6f34d3e259948aa38ec4773ad293a0cc03f2357877433a0c5';
const PASSWORD_SIG='52.61.6e.6c.61.6f.73.68.69.6d.65.69.6d.65.69';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
function getProgress(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')}catch{return {}}}
function saveProgress(p){localStorage.setItem(STORAGE_KEY,JSON.stringify(p));}
function getMastered(){try{return JSON.parse(localStorage.getItem(MASTER_KEY)||'{}')}catch{return {}}}
function toast(msg){let t=$('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t)}t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1700)}
function passSig(text){return [...text].map(c=>c.codePointAt(0).toString(16)).join('.')}
async function sha256(text){if(globalThis.crypto?.subtle){const data=new TextEncoder().encode(text);const hash=await crypto.subtle.digest('SHA-256',data);return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('')}return null}
function clearLegacyUnlock(){try{localStorage.removeItem(LEGACY_LOCAL_KEY)}catch(_e){}}
function markSessionUnlocked(){sessionStorage.setItem(SITE_SESSION_KEY,'1');sessionStorage.setItem(SESSION_KEY,'1');sessionStorage.setItem('hsk_portal_unlocked','1');sessionStorage.setItem('hsk1_ranteacher_unlocked','1');sessionStorage.setItem('hsk3_ranteacher_unlocked','1');sessionStorage.setItem('hsk4_upper_ranteacher_unlocked','1');sessionStorage.setItem('hsk4_lower_ranteacher_unlocked','1')}
async function checkPassword(){const input=$('#pwInput'),err=$('#pwError'),btn=$('#pwBtn');if(!input)return;btn.disabled=true;const raw=input.value.trim();const digest=await sha256(raw);const ok=digest?digest===PASSWORD_HASH:passSig(raw)===PASSWORD_SIG;btn.disabled=false;if(ok){markSessionUnlocked();err?.classList.remove('show');$('#pwOverlay').style.display='none';document.body.style.overflow='';}else{err.classList.add('show');input.select();}}
function initGate(){clearLegacyUnlock();const o=$('#pwOverlay');if(!o)return;if(sessionStorage.getItem(SITE_SESSION_KEY)==='1'){markSessionUnlocked();o.style.display='none';document.body.style.overflow='';}else{sessionStorage.removeItem('hsk_portal_unlocked');sessionStorage.removeItem(SESSION_KEY);o.style.display='';document.body.style.overflow='hidden';$('#pwInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')checkPassword()})}}
function speak(text){if(!('speechSynthesis' in window)){toast('Trình duyệt này chưa hỗ trợ phát âm.');return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='zh-CN';u.rate=.82;const voices=speechSynthesis.getVoices();u.voice=voices.find(v=>/zh|Chinese|Mandarin/i.test(v.lang+' '+v.name))||null;speechSynthesis.speak(u)}
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

(function(){
  clearLegacyUnlock();
  if(!document.getElementById('practice'))return;
  const load=(src)=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error('Không tải được '+src));document.head.appendChild(s)});
  const start=()=>{
    if(typeof renderPractice!=='function'){setTimeout(start,40);return}
    load('assets/practice-explain.js?v=12')
      .then(()=>load('assets/practice-advanced.js?v=12'))
      .then(()=>{setupPracticeLevels();renderPractice()})
      .catch(e=>console.error('Practice enhancement failed',e));
  };
  start();
})();
