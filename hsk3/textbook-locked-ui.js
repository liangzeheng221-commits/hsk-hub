/* Final student-facing renderer for the 80 locked HSK3 textbook text units. Uses printed textbook pinyin, never runtime pinyin generation. */
(()=>{
  'use strict';
  if(!window.__HSK3_TEXTBOOK_LOCKED?.ok)return;
  const zhNums=['一','二','三','四'];
  const cleanAuditChrome=()=>{
    ['auditTextbookSource','auditVocabSummary','auditGrammarNote','hsk3TextbookNote'].forEach(id=>document.getElementById(id)?.remove());
    document.querySelector('#text .source-note')?.remove();
    const h=document.querySelector('#text .section-head h2');if(h)h.textContent='教材课文 · Bài khoá';
    if(typeof secNames!=='undefined')secNames.text='Bài khoá · 教材课文';
  };
  const textLabel=s=>s.type==='reading'?'短文 · Bài đọc':`课文${zhNums[(s.text_no||1)-1]} · Bài khoá ${s.text_no||1}`;
  window.drawScene=drawScene=function(){
    const s=L.scenes[sceneIndex];if(!s)return;
    $('#scenePane').innerHTML=`<div class="scene-title"><div><div class="textbook-unit-label">${esc(textLabel(s))}</div><h3>${esc(s.place)}</h3>${s.place_vn?`<div class="scene-vn-title">${esc(s.place_vn)}</div>`:''}</div><button class="ghost-btn" onclick='speak(${JSON.stringify(s.lines.map(x=>x.zh).join('，'))})'>🔊 Đọc đoạn</button></div><div class="dialogue-card">${s.lines.map(x=>`<div class="dialogue-line"><div class="speaker">${esc(x.s||'')}</div><div><div class="line-py">${esc(x.py||'')}</div><div class="line-zh">${esc(x.zh)}</div><div class="line-vn">${esc(x.vn)}</div></div><button class="speak-line" onclick='speak(${JSON.stringify(x.zh)})'>🔊</button></div>`).join('')}</div>`;
  };
  window.renderText=renderText=function(){
    cleanAuditChrome();sceneIndex=0;const tabs=$('#sceneTabs');if(!tabs)return;
    tabs.innerHTML=L.scenes.map((s,i)=>`<button class="scene-tab ${i===0?'active':''}" data-i="${i}">${esc(textLabel(s))} · ${esc(s.place)}</button>`).join('');
    $$('.scene-tab',tabs).forEach(b=>b.onclick=()=>{sceneIndex=+b.dataset.i;$$('.scene-tab',tabs).forEach(x=>x.classList.toggle('active',x===b));drawScene()});drawScene();
  };
  const baseInit=window.initLesson;
  if(typeof baseInit==='function')window.initLesson=initLesson=function(...args){const r=baseInit(...args);cleanAuditChrome();renderText();setTimeout(cleanAuditChrome,0);return r};
  const style=document.createElement('style');style.textContent=`#auditTextbookSource,#auditVocabSummary,#auditGrammarNote,#hsk3TextbookNote{display:none!important}.textbook-unit-label{font-size:11px;font-weight:800;letter-spacing:.04em;color:var(--sub);margin-bottom:4px}.scene-vn-title{font-size:12px;color:var(--sub);margin-top:3px}.dialogue-line .line-py{font-style:normal}`;document.head.appendChild(style);
  cleanAuditChrome();
})();
