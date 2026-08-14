/* HSK4 下 final practice layer — complete vocabulary coverage + real comprehension + textbook-style tasks. */
(()=>{
  'use strict';
  const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const MC_COUNT=12;
  const safe=s=>typeof esc==='function'?esc(s):String(s??'');

  function renderTaskList(title,cn,items,cls){
    return `<section class="textbook-task-group ${cls}"><div class="textbook-task-head"><b>${cn}</b><span>${title}</span></div><ol>${(items||[]).map(x=>`<li>${safe(x)}</li>`).join('')}</ol></section>`;
  }
  function renderTextbookTasks(){
    const tasks=L?.tasks;if(!tasks)return '';
    return `<div class="textbook-task-panel"><div class="textbook-task-title"><div><span>教材能力链 · NHIỆM VỤ VẬN DỤNG</span><h3>从理解到复述，再到真实表达</h3></div><small>原创互动任务 · không sao chép nguyên bài tập</small></div><div class="textbook-task-grid">${renderTaskList('Khởi động','热身',tasks.warmup,'warmup')}${renderTaskList('Kể lại','复述',tasks.retell,'retell')}${renderTaskList('Vận dụng','运用',tasks.application,'application')}</div></div>`;
  }

  window.renderPractice=function(){
    const n=L.vocab.length,mc=Math.min(MC_COUNT,n),fill=Math.max(0,n-mc);
    q('#basicPractice').innerHTML=`<div class="practice-coverage"><b>词汇覆盖 · Phủ từ vựng</b><span id="vocabCoverage">${n}/${n} · 100%</span><small>${mc} câu chọn nghĩa + ${fill} câu viết từ; mỗi từ mới của Bài ${id} xuất hiện ít nhất một lần trong lượt này.</small></div><div class="quiz-tabs"><button class="quiz-tab active" data-q="mc">Từ vựng 1 · ${mc}</button><button class="quiz-tab" data-q="fill">Từ vựng 2 · ${fill}</button><button class="quiz-tab" data-q="grammar">Ngữ pháp</button><button class="quiz-tab" data-q="read">Đọc hiểu</button></div><div class="quiz-pane active" id="q-mc"></div><div class="quiz-pane" id="q-fill"></div><div class="quiz-pane" id="q-grammar"></div><div class="quiz-pane" id="q-read"></div><div class="scorebar" id="scoreText">Làm bài và nộp để xem đáp án + giải thích.</div>${renderTextbookTasks()}`;
    qa('.quiz-tab',q('#basicPractice')).forEach(b=>b.onclick=()=>{qa('.quiz-tab',q('#basicPractice')).forEach(x=>x.classList.toggle('active',x===b));qa('.quiz-pane',q('#basicPractice')).forEach(x=>x.classList.toggle('active',x.id==='q-'+b.dataset.q))});
    renderMC();renderFill();renderGrammarQuiz();renderReadQuiz();renderAdvanced();
  };

  window.renderMC=function(){
    selectedMC={};
    const pool=allVocab(),items=L.vocab.slice(0,Math.min(MC_COUNT,L.vocab.length));
    const qs=items.map(w=>{
      const ds=shuffle(unique(pool.filter(x=>x.zh!==w.zh&&x.vn!==w.vn).map(x=>x.vn))).slice(0,3);
      return {q:`“${w.zh}” (${w.py||pyOf(w.zh)}) nghĩa là gì?`,opts:shuffle([w.vn,...ds]),ans:w.vn,why:`${w.zh} · ${w.py||pyOf(w.zh)} · ${w.posLabel||w.pos||''} = ${w.vn}.`};
    });
    optionCards(qs,'_mcQs','#q-mc','checkMC');
  };

  window.renderFill=function(){
    const items=L.vocab.slice(Math.min(MC_COUNT,L.vocab.length));window._fillItems=items;
    if(!items.length){q('#q-fill').innerHTML='<div class="scorebar">Bài này không còn từ nào ở nhóm viết từ.</div>';return}
    q('#q-fill').innerHTML=`<div class="fill-intro"><b>Viết toàn bộ nhóm từ còn lại</b><span>${items.length} từ · chấp nhận đúng chữ Hán của mục từ</span></div>`+items.map((w,i)=>`<div class="fill-card"><div class="qmeta"><span>${Math.min(MC_COUNT,L.vocab.length)+i+1}/${L.vocab.length}</span><span>${safe(w.posLabel||w.pos||'')}</span></div><div class="fill-prompt">Viết từ tiếng Trung cho “<b>${safe(w.vn)}</b>”:</div><input class="fill-input" data-i="${i}" autocomplete="off" inputmode="text"><div class="feedback" id="fillfb-${i}"></div></div>`).join('')+`<div class="quiz-actions"><button class="primary-btn" onclick="checkFill()">✓ Kiểm tra ${items.length} từ</button></div>`;
  };

  window.checkFill=function(){
    let ok=0;qa('.fill-input',q('#q-fill')).forEach(inp=>{const w=window._fillItems[+inp.dataset.i],good=norm(inp.value)===norm(w.zh);if(good)ok++;inp.classList.toggle('good',good);inp.classList.toggle('bad',!good);const f=q('#fillfb-'+inp.dataset.i);f.innerHTML=`${good?'✅':'❌'} Đáp án: <b>${safe(w.zh)}</b> · ${safe(w.py||pyOf(w.zh))} · ${safe(w.posLabel||w.pos||'')}`;f.className='feedback '+(good?'good':'bad')});q('#scoreText').textContent=`Từ vựng viết: ${ok}/${window._fillItems.length} · ${Math.round(ok/window._fillItems.length*100)}%`;
  };

  window.renderReadQuiz=function(){
    selectedRead={};
    const items=Array.isArray(L.comprehension)?L.comprehension:[];
    const allAnswers=items.map(x=>x.a);
    const qs=items.map((x,i)=>{
      const ds=shuffle(allAnswers.filter((_,j)=>j!==i)).slice(0,3);
      return {q:`${i+1}. ${x.q}`,opts:shuffle([x.a,...ds]),ans:x.a,why:`依据 ${x.scene||('课文 '+(i+1))}：${x.a}`};
    });
    optionCards(qs,'_rQs','#q-read','checkReadQuiz');
  };

  const oldAdvanced=window.renderAdvanced;
  window.renderAdvanced=function(){
    oldAdvanced();
    const p=q('#advancedPractice .advanced-intro p');if(p)p.textContent=`5 câu nhận diện cấu trúc; phần từ vựng cơ bản phía trên đã phủ đủ ${L.vocab.length}/${L.vocab.length} từ của Bài ${id}.`;
  };

  document.documentElement.dataset.hsk4PracticeFinal='20260814-5';
})();
