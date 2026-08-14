/* HSK4 下 final content UI — vocabulary POS, textbook pages, proper nouns, source/context notes. */
(()=>{
'use strict';
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const e=s=>typeof esc==='function'?esc(s):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const wordPy=w=>String(w?.py||pyOf(w?.zh||''));
const posText=w=>String(w?.posLabel||window.HSK4_POS_LABELS?.[w?.pos]||w?.pos||'');

const baseShell=window.renderLessonShell;
window.renderLessonShell=function(){
  baseShell();
  const tag=q('#lessonTag');
  if(tag)tag.textContent=`第 ${id} 课 · 标准教程 4（下） · 书内第 ${L.bookPage} 页`;
  const hero=q('.open-access-chip');
  if(hero)hero.textContent=`✓ 教材2014版 · 书内第 ${L.bookPage} 页 · PDF第 ${L.pdfPage} 页`;
};

window.renderVocab=function(){
  const search=q('#vSearch'),grid=q('#vocabGrid');
  function draw(term=''){
    const t=String(term||'').trim().toLowerCase();
    const items=L.vocab.filter(w=>!t||[w.zh,wordPy(w),w.vn,w.pos,posText(w)].some(x=>String(x||'').toLowerCase().includes(t)));
    grid.innerHTML=items.map(w=>`<article class="vcard" data-zh="${e(w.zh)}"><div class="vinner"><div class="vface vfront"><div class="vno">${L.vocab.indexOf(w)+1}</div><div class="vzh">${e(w.zh)}</div><div class="vpy">${e(wordPy(w))}</div><div class="pos-badge">${e(posText(w))}</div><div class="vactions"><button class="tiny listen" aria-label="Nghe ${e(w.zh)}">🔊</button><button class="tiny flip">↻</button></div></div><div class="vface vback"><div class="vvn">${e(w.vn)}</div><div class="vpy">${e(wordPy(w))}</div><div class="pos-badge">${e(posText(w))}</div><small>Chạm để lật lại</small></div></div></article>`).join('');
    qa('.vcard',grid).forEach(card=>{
      const w=L.vocab.find(x=>x.zh===card.dataset.zh);
      card.onclick=ev=>{if(ev.target.closest('.listen')){ev.stopPropagation();speak(w.zh);return}card.classList.toggle('flipped');showWordDetail(w)};
      q('.flip',card)?.addEventListener('click',ev=>{ev.stopPropagation();card.classList.toggle('flipped');showWordDetail(w)});
    });
    if(items[0])showWordDetail(items[0]); else q('#wordPanel').innerHTML='<div class="source-note">Không tìm thấy từ phù hợp.</div>';
  }
  search.oninput=()=>draw(search.value);draw();
};

window.showWordDetail=function(w){
  q('#wordPanel').innerHTML=`<div class="word-detail final-word-detail"><div><div class="word-main">${e(w.zh)}</div><div class="word-py">${e(wordPy(w))}</div><div class="word-pos">${e(posText(w))}</div><div class="word-context">${e(w.vn)}</div></div><button class="ghost-btn" onclick='speak(${JSON.stringify(w.zh)})'>🔊 Nghe phát âm</button></div>`;
};

function properNounHTML(){
  if(!L.properNouns?.length)return '';
  return `<div class="proper-noun-box"><div class="proper-noun-head"><b>专有名词 · Tên riêng trong bài</b><span>${L.properNouns.length}</span></div><div class="proper-noun-grid">${L.properNouns.map(x=>`<button class="proper-noun-item" data-speak="${e(x.zh)}"><b>${e(x.zh)}</b><span>${e(x.py)}</span><small>${e(x.vn)}</small></button>`).join('')}</div></div>`;
}
window.renderText=function(){
  sceneIndex=0;
  const tabs=q('#sceneTabs');
  let meta=q('#textbookTextMeta');
  if(!meta){meta=document.createElement('div');meta.id='textbookTextMeta';tabs.before(meta)}
  meta.innerHTML=`<div class="textbook-page-meta"><b>教材定位</b><span>书内第 ${L.bookPage} 页起 · PDF第 ${L.pdfPage} 页起 · 2014年版</span></div>${L.titleToneNote?`<div class="tone-note"><b>课题读音：</b>${e(L.titlePinyin)}<br>${e(L.titleToneNote)}</div>`:''}${L.eraNote?`<div class="era-note">${e(L.eraNote)}</div>`:''}${properNounHTML()}`;
  qa('.proper-noun-item',meta).forEach(b=>b.onclick=()=>speak(b.dataset.speak));
  tabs.innerHTML=L.scenes.map((s,i)=>`<button class="scene-tab ${i===0?'active':''}" data-i="${i}">${i+1}. ${e(s.vn_title)}</button>`).join('');
  qa('.scene-tab',tabs).forEach(b=>b.onclick=()=>{sceneIndex=+b.dataset.i;qa('.scene-tab',tabs).forEach(x=>x.classList.toggle('active',x===b));drawScene()});
  drawScene();
};
window.drawScene=function(){
  const s=L.scenes[sceneIndex],pts=pointsOf(s);
  q('#scenePane').innerHTML=`<article class="text-card"><div class="text-card-head"><div><span class="text-no">${e(s.title)}</span><h3>${e(s.vn_title)}</h3></div><button class="ghost-btn" onclick='speak(${JSON.stringify(pts.join('，'))})'>🔊 Nghe câu trọng điểm</button></div><div class="text-summary">${e(s.summary)}</div>${s.contextNote?`<div class="context-note"><b>教材语境说明 · Lưu ý ngữ cảnh</b><span>${e(s.contextNote)}</span></div>`:''}<div class="key-lines">${pts.map(x=>`<div class="key-line"><div><div class="line-py">${e(pyOf(x))}</div><div class="line-zh">${e(x)}</div></div><button onclick='speak(${JSON.stringify(x)})'>🔊</button></div>`).join('')}</div><div class="source-boundary">教材对应：第 ${L.id} 课 · ${e(s.title)} · 书内页码约从 ${L.bookPage} 页开始。本站用摘要与重点句服务学习，不复制整篇课文。</div></article>`;
};

const baseGrammar=window.renderGrammar;
window.renderGrammar=function(){
  baseGrammar();
  const culture=q('#culturePanel');
  if(culture && L.id===18){
    culture.insertAdjacentHTML('beforeend','<div class="context-note compact"><b>时间边界</b><span>该文化主题来自2014年教材，平台功能和使用规则应以当前产品说明为准。</span></div>');
  }
};

document.documentElement.dataset.hsk4UiFinal='20260814-6';
})();