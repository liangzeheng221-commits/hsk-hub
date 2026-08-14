/* HSK4 Lower interactive runtime — lessons 11–20. */
'use strict';
const HSK4_FIRST=11, HSK4_LAST=20, HSK4_TOTAL=10;
const SITE_UNLOCK_KEY='hsk_site_unlocked_v1', STORAGE_KEY='hsk4_lower_ranteacher_progress_v1';
const PASSWORD_HASH='7cdee08809e6b166a8e8a9ecd162ffdd4395a7f1c5c76a10f96bacd5a7447da1';
const PASSWORD_SIG='7136.8001.5e08.6700.7f8e';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const norm=s=>String(s??'').replace(/[\s，。！？,.!?；;：:、“”‘’'"（）()…]/g,'').trim();
const unique=a=>[...new Set(a)];
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
function toast(msg){let t=$('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t)}t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1700)}
function passSig(text){return [...text].map(c=>c.codePointAt(0).toString(16)).join('.')}
async function sha256(text){if(!globalThis.crypto?.subtle)return null;const d=new TextEncoder().encode(text),h=await crypto.subtle.digest('SHA-256',d);return [...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function checkPassword(){const input=$('#pwInput'),err=$('#pwError'),btn=$('#pwBtn');if(!input)return;btn.disabled=true;const raw=input.value.trim(),digest=await sha256(raw);const ok=digest?digest===PASSWORD_HASH:passSig(raw)===PASSWORD_SIG;btn.disabled=false;if(ok){localStorage.setItem(SITE_UNLOCK_KEY,'1');sessionStorage.setItem('hsk_portal_unlocked','1');sessionStorage.setItem('hsk4_lower_ranteacher_unlocked','1');$('#pwOverlay').style.display='none';document.body.style.overflow=''}else{err?.classList.add('show');input.select()}}
function initGate(){const o=$('#pwOverlay');if(!o)return;if(localStorage.getItem(SITE_UNLOCK_KEY)==='1'||sessionStorage.getItem('hsk_portal_unlocked')==='1'){o.style.display='none';document.body.style.overflow=''}else{document.body.style.overflow='hidden';$('#pwInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')checkPassword()})}}
function getProgress(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')}catch{return {}}}
function saveProgress(p){localStorage.setItem(STORAGE_KEY,JSON.stringify(p))}
function resetCourse(){if(confirm('Xóa toàn bộ tiến độ HSK 4 下 trên trình duyệt này?')){localStorage.removeItem(STORAGE_KEY);location.reload()}}
function markVisited(n){const p=getProgress();p[n]??={};p[n].visited=true;saveProgress(p)}
function toggleComplete(){const p=getProgress();p[id]??={};p[id].complete=!p[id].complete;saveProgress(p);renderComplete();toast(p[id].complete?'Đã đánh dấu hoàn thành.':'Đã bỏ đánh dấu hoàn thành.')}
function renderComplete(){const b=$('#completeBtn');if(!b)return;const done=!!getProgress()[id]?.complete;b.textContent=done?'✓ Đã hoàn thành':'✓ Đánh dấu hoàn thành';b.classList.toggle('done',done)}
function speak(text){if(!('speechSynthesis' in window)){toast('Trình duyệt chưa hỗ trợ phát âm.');return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='zh-CN';u.rate=.82;const vs=speechSynthesis.getVoices?.()||[];u.voice=vs.find(v=>/zh|Chinese|Mandarin/i.test((v.lang||'')+' '+(v.name||'')))||null;speechSynthesis.speak(u)}
const pyCache=new Map();
function pyOf(text){if(pyCache.has(text))return pyCache.get(text);let out='';try{if(window.pinyinPro?.pinyin)out=window.pinyinPro.pinyin(text,{toneType:'symbol',type:'array'}).join(' ')}catch(e){}pyCache.set(text,out);return out}
function validateData(){
  const A=window.HSK4_LOWER_LESSONS;
  if(!Array.isArray(A)||A.length!==10)throw new Error('HSK4 下 phải có đúng 10 bài (11–20).');
  A.forEach((L,i)=>{
    if(L.id!==i+11)throw new Error(`Sai thứ tự bài: cần ${i+11}, nhận ${L.id}`);
    if(!L.title||!L.vn_title)throw new Error(`Bài ${L.id} thiếu tiêu đề.`);
    if(!Array.isArray(L.vocab)||L.vocab.length<29)throw new Error(`Bài ${L.id} thiếu từ vựng.`);
    if(!Array.isArray(L.grammar)||L.grammar.length!==5)throw new Error(`Bài ${L.id} phải có đúng 5 điểm ngôn ngữ.`);
    if(!Array.isArray(L.scenes)||L.scenes.length!==5)throw new Error(`Bài ${L.id} phải có đúng 5 bài khóa.`);
    if(!L.compare?.title||!L.expansion?.char||!L.culture?.title)throw new Error(`Bài ${L.id} thiếu 比一比 / 同字词 / 文化.`);
    L.vocab.forEach((v,j)=>{if(!v.zh||!v.vn)throw new Error(`Bài ${L.id}, từ ${j+1} thiếu dữ liệu.`)});
    L.grammar.forEach((g,j)=>{if(!g.title||!g.vn_title||!g.desc||!Array.isArray(g.examples)||g.examples.length<2)throw new Error(`Bài ${L.id}, ngữ pháp ${j+1} thiếu dữ liệu.`)});
    L.scenes.forEach((s,j)=>{if(!s.title||!s.vn_title||!s.summary||!String(s.points||'').includes('|'))throw new Error(`Bài ${L.id}, bài khóa ${j+1} thiếu dữ liệu.`)});
  });
  return A;
}
function showFatal(err){console.error('[HSK4 Lower]',err);document.documentElement.dataset.hsk4Runtime='error';const target=$('#lessonGrid')||$('.lesson-container')||$('main');if(target){const d=document.createElement('div');d.className='fatal-box';d.innerHTML=`<b>Không tải được HSK 4 下.</b><br>${esc(err?.message||String(err))}`;target.prepend(d)}}
const sections=[['vocab','Từ vựng'],['text','Bài khoá'],['grammar','Ngữ pháp'],['hanzi','Hán tự'],['practice','Luyện tập']];
function renderHome(){
  const A=window.HSK4_LOWER_LESSONS,p=getProgress(),grid=$('#lessonGrid');let done=0,words=0;
  grid.innerHTML='';
  A.forEach(L=>{words+=L.vocab.length;const ok=!!p[L.id]?.complete;if(ok)done++;const pct=ok?100:(p[L.id]?.visited?32:0);const c=document.createElement('article');c.className='lesson-card';c.innerHTML=`<a class="lesson-main-link" href="lesson.html?id=${L.id}&sec=vocab"><div class="lesson-num">第 ${L.id} 课 ${ok?'· ✓ Đã học':''}</div><div class="lesson-title zh">${esc(L.title)}</div><div class="lesson-vn">${esc(L.vn_title)}</div><div class="lesson-meta-line"><span>${L.vocab.length} 生词</span><span>5 语言点</span><span>5 课文</span><span>文化</span></div></a><div class="lesson-open-row"><a class="lesson-open-all" href="lesson.html?id=${L.id}&sec=vocab">Mở bài</a>${sections.map(([sec,label])=>`<a href="lesson.html?id=${L.id}&sec=${sec}">${label}</a>`).join('')}</div><div class="mini-progress"><i style="width:${pct}%"></i></div>`;grid.appendChild(c)});
  $('#wordStat').textContent=words;$('#doneStat').textContent=done+'/10';$('#progressSummary').textContent='Tiến độ '+Math.round(done/10*100)+'%';
}
let id=11,L=null,currentSec='vocab',sceneIndex=0,hanziWriter=null,hanziSelected='';
const secOrder=sections.map(x=>x[0]),secNames={vocab:'Từ vựng · 生词',text:'Bài khoá · 课文',grammar:'Ngữ pháp · 语言点',hanzi:'Hán tự · 汉字笔顺',practice:'Luyện tập · 练习'};
function initLesson(){
  const u=new URL(location.href);id=Math.max(11,Math.min(20,parseInt(u.searchParams.get('id')||'11',10)));L=window.HSK4_LOWER_LESSONS.find(x=>x.id===id)||window.HSK4_LOWER_LESSONS[0];
  currentSec=secOrder.includes(u.searchParams.get('sec'))?u.searchParams.get('sec'):'vocab';markVisited(id);renderLessonShell();renderVocab();renderText();renderGrammar();renderHanzi();renderPractice();showSection(currentSec,false);renderComplete();
}
function renderLessonShell(){
  $('#lessonTitle').textContent=L.title;$('#lessonVn').textContent=L.vn_title;$('#lessonTag').textContent=`第 ${id} 课 · 标准教程 4（下）`;
  $('#vocabCount').textContent=L.vocab.length;$('#grammarCount').textContent=L.grammar.length;$('#vocabChip').textContent=L.vocab.length+' từ/cụm';$('#grammarChip').textContent='5 điểm + 比一比';
  const sel=$('#lessonSelect');sel.innerHTML=window.HSK4_LOWER_LESSONS.map(x=>`<option value="${x.id}" ${x.id===id?'selected':''}>Bài ${x.id} · ${esc(x.title)}</option>`).join('');sel.onchange=()=>location.href=`lesson.html?id=${sel.value}&sec=${currentSec}`;
  $$('.section-tab[data-sec]').forEach(b=>b.onclick=()=>showSection(b.dataset.sec));renderLessonSwitch();setupModuleNav();
}
function showSection(sec,push=true){if(!secOrder.includes(sec))sec='vocab';currentSec=sec;$$('.content-section').forEach(x=>x.classList.toggle('active',x.id===sec));$$('.section-tab[data-sec]').forEach(x=>x.classList.toggle('active',x.dataset.sec===sec));$('#moduleStepTitle').textContent=secNames[sec];const i=secOrder.indexOf(sec);$('#prevModuleBtn').disabled=i===0;$('#nextModuleBtn').textContent=i===4?'Về từ vựng ↺':'Mục tiếp theo →';if(push){const u=new URL(location.href);u.searchParams.set('sec',sec);history.replaceState(null,'',u);window.scrollTo({top:0,behavior:'smooth'})}}
function setupModuleNav(){$('#prevModuleBtn').onclick=()=>{const i=secOrder.indexOf(currentSec);if(i>0)showSection(secOrder[i-1])};$('#nextModuleBtn').onclick=()=>{const i=secOrder.indexOf(currentSec);showSection(secOrder[(i+1)%5])}}
function renderLessonSwitch(){const prev=id>11?`<a class="ghost-btn" href="lesson.html?id=${id-1}&sec=${currentSec}">← Bài ${id-1}</a>`:'<span></span>';const next=id<20?`<a class="primary-btn" href="lesson.html?id=${id+1}&sec=${currentSec}">Bài ${id+1} →</a>`:'<a class="primary-btn" href="index.html">Về HSK 4 下</a>';$('#lessonSwitch').innerHTML=prev+next}
