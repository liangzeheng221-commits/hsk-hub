const STORAGE_KEY='hsk2_ranteacher_progress_v1';
const MASTER_KEY='hsk2_ranteacher_mastered_v1';
const SESSION_KEY='hsk2_ranteacher_unlocked';
const PASSWORD_HASH='7cdee08809e6b166a8e8a9ecd162ffdd4395a7f1c5c76a10f96bacd5a7447da1';
const PASSWORD_SIG='7136.8001.5e08.6700.7f8e';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
function getProgress(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')}catch{return {}}}
function saveProgress(p){localStorage.setItem(STORAGE_KEY,JSON.stringify(p));}
function getMastered(){try{return JSON.parse(localStorage.getItem(MASTER_KEY)||'{}')}catch{return {}}}
function toast(msg){let t=$('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t)}t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1700)}
function passSig(text){return [...text].map(c=>c.codePointAt(0).toString(16)).join('.')}
async function sha256(text){if(globalThis.crypto?.subtle){const data=new TextEncoder().encode(text);const hash=await crypto.subtle.digest('SHA-256',data);return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('')}return null}
async function checkPassword(){const input=$('#pwInput'),err=$('#pwError'),btn=$('#pwBtn');if(!input)return;btn.disabled=true;const raw=input.value.trim();const digest=await sha256(raw);const ok=digest?digest===PASSWORD_HASH:passSig(raw)===PASSWORD_SIG;btn.disabled=false;if(ok){sessionStorage.setItem(SESSION_KEY,'1');$('#pwOverlay').style.display='none';document.body.style.overflow='';}else{err.classList.add('show');input.select();}}
function initGate(){const o=$('#pwOverlay');if(!o)return;if(sessionStorage.getItem(SESSION_KEY)==='1'){o.style.display='none';document.body.style.overflow='';}else{document.body.style.overflow='hidden';$('#pwInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')checkPassword()})}}
function speak(text){if(!('speechSynthesis' in window)){toast('Trình duyệt này chưa hỗ trợ phát âm.');return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='zh-CN';u.rate=.82;const voices=speechSynthesis.getVoices();u.voice=voices.find(v=>/zh|Chinese|Mandarin/i.test(v.lang+' '+v.name))||null;speechSynthesis.speak(u)}
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

(function(){
  if(!document.getElementById('practice'))return;
  const load=(src)=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error('Không tải được '+src));document.head.appendChild(s)});
  const start=()=>{
    if(typeof renderPractice!=='function'){setTimeout(start,40);return}
    load('assets/practice-explain.js?v=11')
      .then(()=>load('assets/practice-advanced.js?v=11'))
      .then(()=>{setupPracticeLevels();renderPractice()})
      .catch(e=>console.error('Practice enhancement failed',e));
  };
  start();
})();
