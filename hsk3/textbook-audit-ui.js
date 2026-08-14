/* HSK3 audited-content UI + practice corrections. Loaded after app-core/app-practice. */
(()=>{
  'use strict';
  if(!document.body?.classList.contains('hsk3')||!window.__HSK3_CONTENT_AUDITED)return;
  const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const meta=window.HSK3_AUDIT_META;
  const escHtml=s=>typeof esc==='function'?esc(s):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const wordByZh=zh=>(typeof L!=='undefined'&&L?.vocab||[]).find(w=>w.zh===zh);
  const coreWords=()=>((typeof L!=='undefined'&&L?.vocab)||[]).filter(w=>!w.properName&&!w.aboveLevel);
  const regularWords=()=>((typeof L!=='undefined'&&L?.vocab)||[]).filter(w=>!w.properName);
  const properWords=()=>((typeof L!=='undefined'&&L?.vocab)||[]).filter(w=>w.properName);

  // Context-aware pinyin: textbook reading wins for isolated lesson vocabulary.
  if(typeof pyOf==='function'){
    const basePy=pyOf;
    pyOf=function(text){
      const raw=String(text??'');
      const w=wordByZh(raw);
      if(w?.py)return w.py;
      return basePy(raw);
    };
    window.pyOf=pyOf;
  }
  if(typeof allVocab==='function'){
    allVocab=function(){return HSK3_LESSONS.flatMap(x=>x.vocab.filter(v=>!v.properName&&!v.aboveLevel))};
    window.allVocab=allVocab;
  }
  if(typeof globalGrammar==='function'){
    globalGrammar=function(){const max=typeof L!=='undefined'&&L?L.id:20;return HSK3_LESSONS.filter(x=>x.id<=max).flatMap(x=>x.grammar)};
    window.globalGrammar=globalGrammar;
  }

  const style=document.createElement('style');
  style.textContent=`
    .audit-home-note,.audit-source-box,.audit-vocab-summary,.audit-grammar-note{margin:14px 0;padding:14px 16px;border:1px solid #ead9c8;border-radius:14px;background:#fffaf4;line-height:1.65;color:#4b3b2e}
    .audit-home-note b,.audit-source-box b,.audit-vocab-summary b,.audit-grammar-note b{color:#8d4c20}
    .audit-badges{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:7px}
    .audit-badge{display:inline-flex;align-items:center;border-radius:999px;padding:3px 8px;font-size:11px;font-weight:700;background:#f5eee6;color:#704a2c;border:1px solid #ead9c8}
    .audit-badge.extra{background:#fff4dc;color:#8a5b00;border-color:#efd499}.audit-badge.proper{background:#eef5ff;color:#335c8a;border-color:#cadbf0}
    .audit-proper{margin:14px 0;padding:14px;border:1px dashed #cadbf0;border-radius:14px;background:#f8fbff}.audit-proper h3{margin:0 0 10px;font-size:15px}.audit-proper-list{display:flex;gap:8px;flex-wrap:wrap}.audit-proper button{border:1px solid #cadbf0;background:white;border-radius:12px;padding:8px 10px;cursor:pointer}.audit-proper small{display:block;color:#667;margin-top:2px}
    .audit-textbook-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:10px}.audit-textbook-card{padding:12px;border-radius:12px;background:white;border:1px solid #ead9c8}.audit-textbook-card strong{display:block;margin-bottom:5px}.audit-textbook-card small{color:#7b6b5e}
    .audit-core-note{margin-top:8px;font-size:12px;color:#6c6259}.word-audit-meta{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}.word-audit-display{margin-top:5px;font-size:12px;color:#705b4c}
    @media(max-width:720px){.audit-textbook-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  function decorateHome(){
    const hero=q('.hero-inner');if(!hero||q('#hsk3TextbookNote'))return;
    const core=HSK3_LESSONS.reduce((n,x)=>n+x.vocab.filter(v=>!v.properName&&!v.aboveLevel).length,0);
    const extras=HSK3_LESSONS.reduce((n,x)=>n+x.vocab.filter(v=>v.aboveLevel).length,0);
    const names=HSK3_LESSONS.reduce((n,x)=>n+x.vocab.filter(v=>v.properName).length,0);
    const total=core+extras+names;
    const box=document.createElement('div');box.id='hsk3TextbookNote';box.className='audit-home-note';
    box.innerHTML=`<b>教材内容已校准：</b>本课程严格按照《HSK标准教程3》整理。教材本册共整理 <b>${total}</b> 个词目：<b>${core}</b> 个本级核心词 + <b>${extras}</b> 个教材标星补充词 + <b>${names}</b> 个专有名词。`;
    const anchor=q('.free-access-note',hero);(anchor||hero.lastElementChild)?.after(box);
    const stat=q('#wordStat');if(stat)stat.textContent=String(total);
  }

  function vocabAuditSummary(){
    const section=q('#vocab');if(!section||q('#auditVocabSummary',section))return;
    const core=coreWords().length,extras=regularWords().filter(w=>w.aboveLevel).length,names=properWords().length;
    const box=document.createElement('div');box.id='auditVocabSummary';box.className='audit-vocab-summary';
    box.innerHTML=`<b>本课教材词目：</b>${L.vocab.length} 项 · 核心词 ${core} · 教材补充词 ${extras} · 专有名词 ${names}<div class="audit-core-note">带“教材补充”标记的词保留学习，但不计入本级核心练习抽题；专有名词单独列出。</div>`;
    q('.tool-row',section)?.before(box);
  }
  function renderProperPanel(){
    const section=q('#vocab');if(!section)return;let box=q('#auditProper',section);if(box)box.remove();
    const words=properWords();if(!words.length)return;
    const term=String(q('#vSearch')?.value||'').trim().toLowerCase();
    const shown=words.filter(w=>!term||`${w.zh} ${w.py||pyOf(w.zh)} ${w.vn||''}`.toLowerCase().includes(term));
    if(!shown.length)return;
    box=document.createElement('div');box.id='auditProper';box.className='audit-proper';
    box.innerHTML=`<h3>专有名词 · Danh từ riêng</h3><div class="audit-proper-list">${shown.map(w=>{const i=L.vocab.indexOf(w);return `<button type="button" data-i="${i}"><b>${escHtml(w.zh)}</b><small>${escHtml(w.py||pyOf(w.zh))} · ${escHtml(w.vn||'')}</small></button>`}).join('')}</div>`;
    q('#vocabGrid')?.after(box);qa('button',box).forEach(b=>b.onclick=()=>window.showWordDetail?.(+b.dataset.i));
  }
  function decorateVocab(){
    if(typeof L==='undefined'||!L)return;vocabAuditSummary();
    const grid=q('#vocabGrid');if(grid){qa('.vcard',grid).forEach(card=>{
      const zh=q('.vzh',card)?.textContent.trim();const w=wordByZh(zh);if(!w)return;
      card.style.display=w.properName?'none':'';
      qa('.audit-badges',card).forEach(x=>x.remove());
      if(!w.properName){const badges=document.createElement('div');badges.className='audit-badges';badges.innerHTML=`<span class="audit-badge">${escHtml(w.pos)}</span>${w.aboveLevel?'<span class="audit-badge extra">教材补充</span>':''}`;q('.vface',card)?.appendChild(badges)}
    })}
    qa('.vocab-pill').forEach(p=>{const zh=p.textContent.split('·')[0].trim();const w=wordByZh(zh);if(w?.properName)p.style.display='none'});
    renderProperPanel();
  }
  function decorateWordPanel(){
    const panel=q('#wordPanel');if(!panel?.classList.contains('show'))return;
    const zh=q('.word-panel-head h3',panel)?.textContent.trim();const w=wordByZh(zh);if(!w||q('.word-audit-meta',panel))return;
    const head=q('.word-panel-head>div',panel);if(!head)return;
    const metaEl=document.createElement('div');metaEl.className='word-audit-meta';metaEl.innerHTML=`<span class="audit-badge">${escHtml(w.pos)}</span>${w.aboveLevel?'<span class="audit-badge extra">教材补充</span>':''}${w.properName?'<span class="audit-badge proper">专有名词</span>':''}`;head.appendChild(metaEl);
    if(w.displayZh&&w.displayZh!==w.zh){const d=document.createElement('div');d.className='word-audit-display';d.textContent='教材词形：'+w.displayZh;head.appendChild(d)}
  }
  function installVocabObservers(){
    const grid=q('#vocabGrid'),panel=q('#wordPanel');if(grid&&!grid.dataset.auditObs){grid.dataset.auditObs='1';new MutationObserver(()=>queueMicrotask(decorateVocab)).observe(grid,{childList:true})}
    if(panel&&!panel.dataset.auditObs){panel.dataset.auditObs='1';new MutationObserver(()=>queueMicrotask(decorateWordPanel)).observe(panel,{childList:true,subtree:true})}
    const search=q('#vSearch');if(search&&!search.dataset.auditSearch){search.dataset.auditSearch='1';search.addEventListener('input',()=>setTimeout(()=>{decorateVocab();renderProperPanel()},0))}
  }

  function decorateText(){
    const sec=q('#text');if(!sec||q('#auditTextbookSource',sec))return;
    const h=q('.section-head h2',sec);if(h)h.textContent='教材课文定位 & 情景练习 — 课文定位与自编练习';
    const note=q('.source-note',sec);if(note)note.innerHTML='下方“情景练习”为网站根据本课主题、核心词汇和语法重新编写的口语/理解练习，<b>不是教材四篇课文的逐字转载</b>。教材信息与本站原创练习在此明确分层。';
    const box=document.createElement('div');box.id='auditTextbookSource';box.className='audit-source-box';
    box.innerHTML=`<b>教材定位 · Bám sát giáo trình</b><div class="audit-textbook-grid"><div class="audit-textbook-card"><strong>课文起始页 · Trang bắt đầu</strong><span>《HSK标准教程3》第 ${L.lessonPage} 页</span><small>教材每课含 4 个课文场景；本站不将原创情景冒充原文。</small></div><div class="audit-textbook-card"><strong>俗语 · Tục ngữ</strong><span>${escHtml(L.proverb.zh)}</span><small>${escHtml(L.proverb.vn)}</small></div>${L.culture?`<div class="audit-textbook-card"><strong>文化 · Văn hóa（第 ${L.culture.page} 页）</strong><span>${escHtml(L.culture.zh)}</span><small>${escHtml(L.culture.vn)}</small></div>`:''}<div class="audit-textbook-card"><strong>热身与运用 · Khởi động & vận dụng</strong><span>先按教材完成热身/双人或小组活动，再使用本站情景练习巩固。</span><small>本站练习为补充教学材料，不替代教材原题。</small></div></div>`;
    q('#sceneTabs',sec)?.before(box);
  }
  function decorateGrammar(){
    const sec=q('#grammar');if(!sec||q('#auditGrammarNote',sec))return;
    const box=document.createElement('div');box.id='auditGrammarNote';box.className='audit-grammar-note';
    box.innerHTML=`<b>语法已按教材重新核对：</b>本课 ${L.grammar.length} 个语言点的结构、解释和示例已统一到《HSK标准教程3》口径。示例句为本站重新编写，用于说明规则，不冒充教材原句。`;
    q('#grammarList',sec)?.before(box);
  }

  function buckets(){
    const a=coreWords(),n=a.length,one=Math.ceil(n/3),two=Math.ceil((n-one)/2);return [a.slice(0,one),a.slice(one,one+two),a.slice(one+two)];
  }
  if(typeof genBasicMC==='function'){
    genBasicMC=function(){
      const pool=allVocab(),qs=[],chosen=buckets()[0];
      chosen.forEach((w,i)=>{const reverse=i%2===1;if(!reverse){const ds=shuffle(uniqueVals(pool.filter(x=>x.zh!==w.zh).map(x=>x.vn))).filter(x=>x!==w.vn).slice(0,3);qs.push({q:`“${w.zh}” (${w.py||pyOf(w.zh)}) nghĩa là gì?`,opts:shuffle([w.vn,...ds]),ans:w.vn,why:`${w.zh} · ${w.py||pyOf(w.zh)} = ${w.vn}.`})}else{const ds=shuffle(uniqueVals(pool.filter(x=>x.zh!==w.zh).map(x=>x.zh))).slice(0,3);qs.push({q:`Từ tiếng Trung phù hợp với nghĩa “${w.vn}” là gì?`,opts:shuffle([w.zh,...ds]),ans:w.zh,why:`“${w.vn}” trong bài này tương ứng với ${w.zh} (${w.py||pyOf(w.zh)}).`})}});
      const room=Math.max(0,10-qs.length),gp=globalGrammar();L.grammar.slice(0,room).forEach(g=>{const ans=g.examples[0],ds=shuffle(uniqueVals(gp.filter(x=>x!==g).flatMap(x=>x.examples))).filter(x=>x!==ans).slice(0,3);qs.push({q:`Câu nào minh họa đúng nhất cho “${g.vn_title}”?`,opts:shuffle([ans,...ds]),ans,why:`Mẫu trọng tâm: ${g.structure}. ${g.desc}`})});return qs.slice(0,10)
    };window.genBasicMC=genBasicMC;
  }
  if(typeof renderFill==='function'){
    renderFill=function(){const items=buckets()[1];window._auditFill=items;$('#q-fill').innerHTML=items.map((w,i)=>`<div class="fill-card"><b>${i+1}.</b> Điền từ tiếng Trung phù hợp với nghĩa <b>“${esc(w.vn)}”</b>: <input class="fill-input" data-i="${i}" autocomplete="off"><div class="feedback" id="fillfb-${i}"></div></div>`).join('')+`<div class="quiz-actions"><button class="primary-btn" onclick="checkFill()">✓ Kiểm tra</button><button class="ghost-btn" onclick="renderFill()">↺ Làm lại</button></div>`};
    checkFill=function(){const items=window._auditFill||[];let ok=0;$$('.fill-input',$('#q-fill')).forEach(inp=>{const w=items[+inp.dataset.i],good=norm(inp.value)===norm(w.zh);inp.classList.toggle('good',good);inp.classList.toggle('bad',!good);if(good)ok++;const f=$('#fillfb-'+inp.dataset.i);f.innerHTML=`<div>${good?'✅ Đúng':'❌ Chưa đúng'} · Đáp án: <b>${esc(w.zh)}</b> (${esc(w.py||pyOf(w.zh))})</div>${explain(`${w.zh} = ${w.vn}.`)}`;f.className='feedback '+(good?'good':'bad')});setScore(`Điền từ: ${ok}/${items.length} · ${items.length?Math.round(ok/items.length*100):0}%`)};
    window.renderFill=renderFill;window.checkFill=checkFill;
  }
  if(typeof renderMatch==='function'){
    renderMatch=function(){matchState={};const words=buckets()[2].map((w,i)=>({...w,key:'k'+i})),cols={zh:shuffle(words),py:shuffle(words),vn:shuffle(words)};window._matchWords=words;$('#q-match').innerHTML=`<div class="practice-note">Chọn lần lượt một mục ở mỗi cột: Hán tự → pinyin → nghĩa Việt. Ba dạng từ vựng cơ bản cùng nhau bao phủ toàn bộ từ cốt lõi của bài.</div><div class="match-grid"><div class="match-col" id="m-zh">${cols.zh.map(w=>`<button class="match-item" data-col="zh" data-key="${w.key}">${esc(w.zh)}</button>`).join('')}</div><div class="match-col" id="m-py">${cols.py.map(w=>`<button class="match-item" data-col="py" data-key="${w.key}">${esc(w.py||pyOf(w.zh))}</button>`).join('')}</div><div class="match-col" id="m-vn">${cols.vn.map(w=>`<button class="match-item" data-col="vn" data-key="${w.key}">${esc(w.vn)}</button>`).join('')}</div></div><div class="feedback" id="matchFeedback"></div>`;$$('.match-item',$('#q-match')).forEach(b=>b.onclick=()=>selectMatch(b,words))};window.renderMatch=renderMatch;
  }
  if(typeof grammarFocus==='function'){
    grammarFocus=function(g){return g.auditFocus||''};window.grammarFocus=grammarFocus;
  }
  if(typeof renderRestore==='function'){
    renderRestore=function(){const items=L.grammar.slice(0,3).map(g=>{const correct=g.examples[0],focus=g.auditFocus||grammarFocus(g);let broken=correct,answer=focus;if(focus&&correct.includes(focus))broken=correct.replace(focus,'＿＿');else{const clean=correct.replace(/[。！？]$/,'');answer=clean.slice(-1);broken=clean.slice(0,-1)+'＿＿'}return{g,correct,broken,answer}});window._restoreItems=items;$('#q-fix').innerHTML=items.map((x,i)=>`<div class="fix-card"><div><b>${i+1}. Điền phần còn thiếu để đúng mẫu “${esc(x.g.vn_title)}”:</b></div><div class="grammar-structure" style="margin-top:8px">${esc(x.broken)}</div><input class="fix-input" data-i="${i}" placeholder="Chỉ nhập phần còn thiếu" style="width:min(100%,620px);margin-top:8px"><div class="feedback" id="fixfb-${i}"></div></div>`).join('')+`<div class="quiz-actions"><button class="primary-btn" onclick="checkRestore()">✓ Kiểm tra</button><button class="ghost-btn" onclick="renderRestore()">↺ Làm lại</button></div>`};
    checkRestore=function(){let ok=0;$$('.fix-input',$('#q-fix')).forEach(inp=>{const x=window._restoreItems[+inp.dataset.i],good=norm(inp.value)===norm(x.answer);inp.classList.toggle('good',good);inp.classList.toggle('bad',!good);if(good)ok++;const f=$('#fixfb-'+inp.dataset.i);f.innerHTML=`<div>${good?'✅ Đúng':'❌ Chưa đúng'} · Phần cần điền: <b>${esc(x.answer)}</b><br>Câu mẫu: <b>${esc(x.correct)}</b></div>${explain(`${x.g.desc} Cấu trúc: ${x.g.structure}`)}`;f.className='feedback '+(good?'good':'bad')});setScore(`Khôi phục mẫu: ${ok}/${window._restoreItems.length} · ${Math.round(ok/window._restoreItems.length*100)}%`)};
    window.renderRestore=renderRestore;window.checkRestore=checkRestore;
  }
  if(typeof segmentSentence==='function'){
    segmentSentence=function(s){
      const clean=String(s||'').replace(/[。！？；，,.!?]/g,'');const dict=uniqueVals([...coreWords().map(w=>w.zh),...L.grammar.flatMap(g=>[g.auditFocus]),'越来越','一边','除了','如果','只要','只有','不但','而且','左右','刚才','还是','或者','然后','已经','可以','因为','所以','但是','我们','你们','他们']).filter(Boolean).sort((a,b)=>b.length-a.length);const out=[];let i=0;while(i<clean.length){let hit='';for(const w of dict){if(clean.startsWith(w,i)){hit=w;break}}if(!hit)hit=clean[i];out.push(hit);i+=hit.length}return out
    };window.segmentSentence=segmentSentence;
  }

  function decoratePractice(){const sec=q('#practice');if(!sec||q('#auditPracticeNote',sec))return;const box=document.createElement('div');box.id='auditPracticeNote';box.className='audit-grammar-note';box.innerHTML=`<b>练习抽题口径：</b>基础词汇题只从本课 HSK3 核心词抽取；专有名词和教材标星补充词不计入核心得分。选择 / 填空 / 连线三个词汇题型合计覆盖本课全部核心词；语法干扰项只取本课及此前已学课次，避免提前引入后续语言点。`;q('.practice-level-tabs',sec)?.before(box)}

  // Wrap page renderers before initLesson/renderHome runs.
  if(typeof renderHome==='function'){const old=renderHome;renderHome=function(){old();decorateHome()};window.renderHome=renderHome}
  if(typeof renderText==='function'){const old=renderText;renderText=function(){old();decorateText()};window.renderText=renderText}
  if(typeof renderGrammar==='function'){const old=renderGrammar;renderGrammar=function(){old();decorateGrammar()};window.renderGrammar=renderGrammar}
  if(typeof renderVocab==='function'){const old=renderVocab;renderVocab=function(...a){const r=old(...a);setTimeout(()=>{installVocabObservers();decorateVocab()},0);return r};window.renderVocab=renderVocab}
  if(typeof renderPractice==='function'){const old=renderPractice;renderPractice=function(){old();decoratePractice()};window.renderPractice=renderPractice}
  if(typeof speakAllVocab==='function'){speakAllVocab=function(){speak(regularWords().map(x=>x.zh).join('，'))};window.speakAllVocab=speakAllVocab}
})();