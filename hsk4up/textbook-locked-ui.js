/* Student renderer for HSK4 上 full canonical textbook texts. Pinyin is read from the locked corpus, never generated at runtime. */
(()=>{
  'use strict';
  if(!window.__HSK4U_TEXTBOOK_LOCKED?.ok)return;
  const esc2=s=>typeof esc==='function'?esc(s):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  let initialized=false;
  function pickInitial(){if(initialized)return;initialized=true;try{const n=parseInt(new URL(location.href).searchParams.get('text')||'1',10);sceneIndex=Math.max(0,Math.min(4,(Number.isFinite(n)?n:1)-1))}catch{sceneIndex=0}}
  function updateTextParam(n){try{const u=new URL(location.href);u.searchParams.set('text',String(n));history.replaceState(null,'',u)}catch{}}
  window.renderText=function(){
    const tabs=$('#sceneTabs'),pane=$('#scenePane');if(!tabs||!pane||!L)return;pickInitial();
    const head=document.querySelector('#text .section-head h2');if(head)head.textContent='BÀI KHOÁ — 教材课文';
    const note=document.querySelector('#text .source-note');if(note)note.textContent='Đầy đủ nguyên văn giáo trình · Mỗi lượt/câu gồm tiếng Trung → pinyin giáo trình → tiếng Việt.';
    tabs.innerHTML=L.scenes.map((s,i)=>`<button class="scene-tab ${i===sceneIndex?'active':''}" data-scene="${i}">课文 ${i+1} · ${esc2(s.vn_title)}</button>`).join('');
    $$('.scene-tab',tabs).forEach(b=>b.onclick=()=>{sceneIndex=+b.dataset.scene;updateTextParam(sceneIndex+1);renderText()});
    const s=L.scenes[sceneIndex],allZh=s.lines.map(x=>x.zh).join('，');
    pane.innerHTML=`<article class="text-card textbook-locked-card" data-text-no="${s.text_no}"><div class="text-card-head"><div><div class="text-no">课文 ${s.text_no} · 教材第 ${s.textbook_page} 页 · 拼音第 ${s.pinyin_page} 页</div><h3 class="zh">${esc2(s.title_zh||s.title)}</h3><div class="locked-title-vi">${esc2(s.title_vi||s.vn_title)}</div></div><button class="ghost-btn" id="sceneListen">🔊 Nghe toàn bài</button></div><div class="textbook-locked-lines">${s.lines.map((x,i)=>`<div class="textbook-locked-line" data-line-no="${i+1}">${x.s?`<div class="locked-speaker zh">${esc2(x.s)}</div>`:''}<div class="locked-line-body"><div class="line-zh zh">${esc2(x.zh)}</div><div class="line-py">${esc2(x.py)}</div><div class="line-vn">${esc2(x.vn)}</div></div><button class="locked-line-audio" data-locked-line="${i}" title="Nghe câu">🔊</button></div>`).join('')}</div></article>`;
    $('#sceneListen').onclick=()=>speak(allZh);$$('[data-locked-line]',pane).forEach(b=>b.onclick=()=>speak(s.lines[+b.dataset.lockedLine].zh));
    document.documentElement.dataset.hsk4UpperTextbookUi='ok';
  };
})();
