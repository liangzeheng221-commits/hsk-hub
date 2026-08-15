/* HSK4 下 locked textbook text UI — full Chinese + locked pinyin + reviewed Vietnamese. */
(()=>{
'use strict';
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const e=s=>typeof esc==='function'?esc(s):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const locked=()=>window.HSK4L_LOCKED_TEXTS?.[id]||[];
const pageLabel=a=>Array.isArray(a)&&a.length?a.join('、'):'—';
function properNounHTML(){
  if(!L?.properNouns?.length)return '';
  return `<div class="proper-noun-box"><div class="proper-noun-head"><b>专有名词 · Tên riêng trong bài</b><span>${L.properNouns.length}</span></div><div class="proper-noun-grid">${L.properNouns.map(x=>`<button class="proper-noun-item" data-speak="${e(x.zh)}"><b>${e(x.zh)}</b><span>${e(x.py)}</span><small>${e(x.vn)}</small></button>`).join('')}</div></div>`;
}
window.renderText=function(){
  sceneIndex=0;
  const units=locked();
  const tabs=q('#sceneTabs');
  let meta=q('#textbookTextMeta');
  if(!meta){meta=document.createElement('div');meta.id='textbookTextMeta';tabs.before(meta)}
  const textPages=[...new Set(units.flatMap(u=>u.src?.text||[]))];
  const pinyinPages=[...new Set(units.flatMap(u=>u.src?.pinyin||[]))];
  meta.innerHTML=`<div class="textbook-page-meta locked-meta"><b>LOCKED · 教材全文</b><span>课文页 ${e(pageLabel(textPages))} · 拼音页 ${e(pageLabel(pinyinPages))}</span></div><div class="locked-source-note"><b>唯一基准：</b>《HSK标准教程4（下）》已锁定教材。中文正文与拼音按教材逐句固定；越南语为逐句审校译文。</div>${L.titleToneNote?`<div class="tone-note"><b>课题读音：</b>${e(L.titlePinyin)}<br>${e(L.titleToneNote)}</div>`:''}${L.eraNote?`<div class="era-note">${e(L.eraNote)}</div>`:''}${properNounHTML()}`;
  qa('.proper-noun-item',meta).forEach(b=>b.onclick=()=>speak(b.dataset.speak));
  if(!units.length){tabs.innerHTML='';q('#scenePane').innerHTML='<div class="fatal-box">Locked textbook text data is missing for this lesson.</div>';return}
  tabs.innerHTML=units.map((s,i)=>`<button class="scene-tab ${i===0?'active':''}" data-i="${i}">${s.n}. ${e(s.vn_title)}</button>`).join('');
  qa('.scene-tab',tabs).forEach(b=>b.onclick=()=>{sceneIndex=+b.dataset.i;qa('.scene-tab',tabs).forEach(x=>x.classList.toggle('active',x===b));drawScene()});
  drawScene();
};
window.drawScene=function(){
  const units=locked(),s=units[sceneIndex];
  if(!s)return;
  const whole=s.lines.map(x=>x.zh).join('');
  q('#scenePane').innerHTML=`<article class="text-card locked-text-card"><div class="text-card-head locked-text-head"><div><span class="text-no">课文 ${e(s.n)} · ${e(s.title)}</span><h3>${e(s.vn_title)}</h3></div><button class="ghost-btn" onclick='speak(${JSON.stringify(whole)})'>🔊 Nghe toàn bài</button></div><div class="locked-status-row"><span>中文 ✓ locked</span><span>拼音 ✓ locked</span><span>Tiếng Việt ✓ reviewed</span></div><div class="locked-transcript">${s.lines.map((x,i)=>`<section class="locked-line"><div class="locked-line-top"><span class="locked-line-no">${i+1}</span>${x.speaker?`<b class="locked-speaker">${e(x.speaker)}</b>`:''}<button class="locked-line-audio" onclick='speak(${JSON.stringify(x.zh)})' aria-label="Nghe câu ${i+1}">🔊</button></div><div class="locked-zh">${e(x.zh)}</div><div class="locked-py">${e(x.py)}</div><div class="locked-vi">${e(x.vi)}</div></section>`).join('')}</div><div class="source-boundary locked-source-boundary">教材位置：第 ${e(id)} 课 · 课文 ${e(s.n)} · 中文第 ${e(pageLabel(s.src?.text))} 页 · 拼音第 ${e(pageLabel(s.src?.pinyin))} 页。</div></article>`;
};
document.documentElement.dataset.hsk4LockedTextUi='20260815-1';
})();
