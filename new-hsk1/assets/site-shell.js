/* HSK Hub shared shell · 2026-08-16
   Progressive enhancement only: no course data is rewritten here.
   Responsibilities: shared CSS, accessibility semantics, accurate module-level
   local progress, last-lesson continuation, language tags and mobile tab keyboard UX. */
(()=>{
'use strict';
if(window.__HSK_SITE_SHELL_LOADED)return;
window.__HSK_SITE_SHELL_LOADED=true;

const VERSION='2026-08-16-1';
const PROGRESS_KEY='hsk_module_progress_v1';
const RECENT_KEY='hsk_recent_lesson_v1';
const MODULES=['vocab','text','grammar','hanzi','practice'];
const MODULE_LABELS={vocab:'Từ vựng',text:'Bài khoá',grammar:'Ngữ pháp',hanzi:'Hán tự',practice:'Luyện tập'};
const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>[...r.querySelectorAll(s)];

function assetUrl(name){
  const self=qa('script').find(s=>/site-shell\.js(?:\?|$)/.test(s.src||''));
  try{return new URL(name,self?.src||location.href).href}catch(_e){return name}
}
function ensureCss(){
  if(q('link[data-hsk-site-polish]'))return;
  const l=document.createElement('link');l.rel='stylesheet';l.href=assetUrl('site-polish.css?v='+VERSION);l.dataset.hskSitePolish='1';document.head.appendChild(l);
}
function safeJsonGet(key,fallback={}){try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch(_e){return fallback}}
function safeJsonSet(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch(_e){}}
function courseCode(){
  if(document.body?.classList.contains('hsk1')||/\/hsk1\//i.test(location.pathname))return 'hsk1';
  if(document.body?.classList.contains('hsk3')||/\/hsk3\//i.test(location.pathname))return 'hsk3';
  if(document.body?.classList.contains('hsk4-upper')||/\/hsk4up\//i.test(location.pathname))return 'hsk4u';
  if(document.body?.classList.contains('hsk4-lower')||/\/hsk4\//i.test(location.pathname))return 'hsk4l';
  if(/\/hsk2(?:\.html|\/)/i.test(location.pathname)||window.HSK2_LESSONS)return 'hsk2';
  return '';
}
function lessonId(){
  const n=Number(new URL(location.href).searchParams.get('id'));
  if(Number.isFinite(n)&&n>0)return n;
  const tag=(q('#lessonTag')?.textContent||'').match(/(?:BÀI|第)\s*(\d+)/i);return tag?Number(tag[1]):0;
}
function currentSection(){
  const u=new URL(location.href),s=u.searchParams.get('sec');if(MODULES.includes(s))return s;
  const active=q('.section-tab.active[data-sec]');return MODULES.includes(active?.dataset.sec)?active.dataset.sec:'';
}
function courseLabel(code){return ({hsk1:'HSK 1',hsk2:'HSK 2',hsk3:'HSK 3',hsk4u:'HSK 4 上',hsk4l:'HSK 4 下'})[code]||''}

function markModule(sec=currentSection()){
  const code=courseCode(),id=lessonId();if(!code||!id||!MODULES.includes(sec))return;
  const all=safeJsonGet(PROGRESS_KEY,{}),key=`${code}:${id}`,row=all[key]||{modules:[]};
  row.modules=[...new Set([...(Array.isArray(row.modules)?row.modules:[]),sec])].filter(x=>MODULES.includes(x));row.updatedAt=Date.now();all[key]=row;safeJsonSet(PROGRESS_KEY,all);
  const title=(q('#lessonTitle')?.textContent||q('.lesson-title.zh')?.textContent||'').trim();
  safeJsonSet(RECENT_KEY,{code,id,sec,title,url:location.pathname+location.search,updatedAt:Date.now()});
}
function moduleCount(code,id){const row=safeJsonGet(PROGRESS_KEY,{})[`${code}:${id}`];return new Set((row?.modules||[]).filter(x=>MODULES.includes(x))).size}
function enhanceHomeProgress(){
  const code=courseCode();if(!code||lessonId())return;
  qa('.lesson-card').forEach(card=>{
    const a=card.querySelector('a[href*="id="]');if(!a)return;
    let id=0;try{id=Number(new URL(a.href,location.href).searchParams.get('id'))}catch(_e){}if(!id)return;
    const n=moduleCount(code,id),bar=card.querySelector('.mini-progress');if(!bar)return;
    const fill=bar.querySelector('i');if(fill&&n>0){fill.style.width=`${Math.round(n/MODULES.length*100)}%`;bar.dataset.hskModules=`${n}/${MODULES.length}`;bar.setAttribute('aria-label',`${n}/${MODULES.length} mô-đun đã mở`)}
  });
}
function injectContinueCard(){
  if(!/\/hsk-hub\/?$/i.test(location.pathname)||q('.hsk-continue-card'))return;
  const r=safeJsonGet(RECENT_KEY,null);if(!r?.url||!r.code||!r.id)return;
  const grid=q('.level-grid');if(!grid)return;
  const card=document.createElement('section');card.className='hsk-continue-card';card.setAttribute('aria-label','Tiếp tục bài học gần nhất');
  const sec=MODULE_LABELS[r.sec]||'Bài học';const title=r.title?` · ${r.title}`:'';
  card.innerHTML=`<div class="hsk-continue-copy"><div class="hsk-continue-eyebrow">Tiếp tục học</div><div class="hsk-continue-title">${courseLabel(r.code)} · Bài ${r.id}${escapeHtml(title)}</div><div class="hsk-continue-sub">${sec} · tiếp tục từ lần học gần nhất trên thiết bị này</div></div><a class="hsk-continue-link" href="${escapeAttr(r.url)}">Tiếp tục →</a>`;
  grid.parentNode.insertBefore(card,grid);
}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function escapeAttr(s){return escapeHtml(s).replace(/`/g,'&#96;')}

function enhanceDialog(){
  const overlay=q('#pwOverlay'),box=overlay?.querySelector('.pw-box');if(!overlay||!box)return;
  const title=box.querySelector('h2'),desc=box.querySelector('p'),input=q('#pwInput'),err=q('#pwError');
  if(title&&!title.id)title.id='pwTitle';if(desc&&!desc.id)desc.id='pwDesc';
  box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');if(title)box.setAttribute('aria-labelledby',title.id);if(desc)box.setAttribute('aria-describedby',desc.id);
  if(input){
    input.setAttribute('aria-label','Mật khẩu');input.setAttribute('aria-describedby',err?.id||'pwError');
    if(!box.querySelector('label[for="pwInput"]')){const lab=document.createElement('label');lab.className='hsk-field-label';lab.htmlFor='pwInput';lab.textContent='Mật khẩu';input.parentNode.insertBefore(lab,input)}
  }
  if(err){err.setAttribute('role','alert');err.setAttribute('aria-live','assertive')}
  if(!overlay.dataset.hskFocusTrap){
    overlay.dataset.hskFocusTrap='1';document.addEventListener('keydown',ev=>{
      if(ev.key!=='Tab'||getComputedStyle(overlay).display==='none')return;
      const f=qa('input,button,a[href],[tabindex]:not([tabindex="-1"])',box).filter(x=>!x.disabled&&x.offsetParent!==null);if(!f.length)return;
      const first=f[0],last=f[f.length-1];if(ev.shiftKey&&document.activeElement===first){ev.preventDefault();last.focus()}else if(!ev.shiftKey&&document.activeElement===last){ev.preventDefault();first.focus()}
    });
  }
}

function enhanceTabs(){
  qa('.section-tabs,.top-section-tabs').forEach((list,groupIndex)=>{
    list.setAttribute('role','tablist');list.setAttribute('aria-label','Nội dung bài học');
    const tabs=qa('.section-tab[data-sec]',list);tabs.forEach((tab,i)=>{
      const sec=tab.dataset.sec,panel=document.getElementById(sec);tab.setAttribute('role','tab');
      tab.id=tab.id||`hsk-tab-${groupIndex}-${sec}`;tab.setAttribute('aria-controls',sec);const active=tab.classList.contains('active');tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;
      if(panel){panel.setAttribute('role','tabpanel');panel.setAttribute('aria-label',(tab.textContent||sec).trim());panel.tabIndex=0}
      if(!tab.dataset.hskA11y){tab.dataset.hskA11y='1';tab.addEventListener('click',()=>setTimeout(()=>{markModule(sec);syncTabState()},0));tab.addEventListener('keydown',ev=>{
        if(!['ArrowLeft','ArrowRight','Home','End'].includes(ev.key))return;ev.preventDefault();let j=i;if(ev.key==='ArrowLeft')j=(i-1+tabs.length)%tabs.length;if(ev.key==='ArrowRight')j=(i+1)%tabs.length;if(ev.key==='Home')j=0;if(ev.key==='End')j=tabs.length-1;tabs[j]?.focus();tabs[j]?.click();
      })}
    });
  });
}
function syncTabState(){qa('.section-tab[data-sec]').forEach(tab=>{const active=tab.classList.contains('active');tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1})}
function tagLanguages(){
  qa('.zh,.vocab-zh,.vzh,.line-zh,.word-main,.grammar-example span,.grammar-card h3').forEach(el=>{if(!el.lang)el.lang='zh-Hans'});
}
function labelSearch(){const s=q('#vSearch');if(s&&!s.getAttribute('aria-label'))s.setAttribute('aria-label','Tìm từ vựng bằng chữ Hán, pinyin hoặc nghĩa tiếng Việt')}
function recordInitialModule(){if(lessonId())markModule()}
function enhance(){ensureCss();enhanceDialog();enhanceTabs();syncTabState();tagLanguages();labelSearch();recordInitialModule();enhanceHomeProgress();injectContinueCard()}

ensureCss();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance,{once:true});else enhance();
window.addEventListener('load',()=>{enhance();setTimeout(enhance,250)},{once:true});
const mo=new MutationObserver(()=>{clearTimeout(window.__hskShellMutationTimer);window.__hskShellMutationTimer=setTimeout(()=>{enhanceTabs();syncTabState();tagLanguages();labelSearch();enhanceHomeProgress()},80)});
if(document.documentElement)mo.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
window.__HSK_SITE_SHELL={version:VERSION,markModule,enhance};
})();

/* Large Hanzi Writer is loaded only when the Hanzi module is actually opened. */
(()=>{
'use strict';
if(window.__HSK_HANZI_LAZY_BOUND)return;window.__HSK_HANZI_LAZY_BOUND=true;
let loading=null;
function isHanziSection(){
  const s=new URL(location.href).searchParams.get('sec');
  return s==='hanzi'||document.querySelector('.section-tab.active[data-sec="hanzi"]')!==null||document.querySelector('#hanzi.content-section.active')!==null;
}
function ensureHanziWriter(){
  if(window.HanziWriter)return Promise.resolve(window.HanziWriter);
  if(loading)return loading;
  loading=new Promise((resolve,reject)=>{
    const old=[...document.scripts].find(s=>/hanzi-writer(?:\.min)?\.js/i.test(s.src||''));
    if(old){old.addEventListener('load',()=>resolve(window.HanziWriter),{once:true});old.addEventListener('error',reject,{once:true});return}
    const s=document.createElement('script');s.src='../assets/hanzi-writer.min.js?v=3.7.3';s.async=true;s.dataset.hskLazyHanzi='1';
    s.onload=()=>resolve(window.HanziWriter);s.onerror=()=>reject(new Error('Không tải được Hanzi Writer'));document.head.appendChild(s);
  }).then(lib=>{setTimeout(()=>{try{if(typeof window.renderHanzi==='function')window.renderHanzi();else if(typeof window.drawHanzi==='function'){const c=document.querySelector('.hanzi-char-btn.active')?.dataset.char;if(c)window.drawHanzi(c)}else if(typeof window.ensureWriter==='function')window.ensureWriter(false)}catch(e){console.error('[lazy hanzi redraw]',e)}},0);return lib}).catch(e=>{loading=null;console.error('[lazy hanzi]',e);throw e});
  return loading;
}
function maybe(){if(isHanziSection())ensureHanziWriter().catch(()=>{})}
document.addEventListener('click',()=>setTimeout(maybe,0),true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',maybe,{once:true});else maybe();
window.__HSK_HANZI_LAZY={ensure:ensureHanziWriter,version:'2026-08-16-1'};
})();
