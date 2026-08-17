/* 450 reviewed exercises aligned to 《新HSK教程1》3.0. */
let practiceState={basic:{},advanced:{}};
let practiceBankPromise=null;

function loadPracticeBank(){
  if(!practiceBankPromise){
    practiceBankPromise=(async()=>{
      let bank;
      if(window.HSK1_PRACTICE_PACKED&&window.pako){
        const bytes=Uint8Array.from(atob(window.HSK1_PRACTICE_PACKED),char=>char.charCodeAt(0));
        bank=JSON.parse(window.pako.ungzip(bytes,{to:'string'}));
      }else{
        const response=await fetch('new-practice-bank.json?v=20260817-1',{cache:'force-cache'});
        if(!response.ok)throw new Error(`HTTP ${response.status}`);
        bank=await response.json();
      }
      if(!Array.isArray(bank.lessons)||bank.lessons.length!==15)throw new Error('Invalid practice bank');
      return bank;
    })();
  }
  return practiceBankPromise;
}

function questionHtml(q,i,total,level){
  const typeLabel=[q.type_vi,q.type].filter(Boolean).join(' · ');
  const pinyin=q.pinyin?`<div class="practice-pinyin">${esc(q.pinyin)}</div>`:'';
  const stem=q.stem_zh?`<div class="qtitle practice-zh">${esc(q.stem_zh).replace(/\n/g,'<br>')}</div>`:'';
  return `<article class="qcard reviewed-card ${level==='advanced'?'advanced-card':''}" data-level="${level}" data-i="${i}" data-qid="${esc(q.id)}"><div class="qmeta"><span class="qindex">Câu ${i+1}/${total}</span><span class="difficulty-chip">${esc(typeLabel)}</span></div><div class="practice-prompt">${esc(q.prompt_vi)}</div>${pinyin}${stem}<div class="opts">${q.options.map((option,j)=>`<button type="button" class="opt reviewed-opt" data-opt="${j}"><b>${String.fromCharCode(65+j)}.</b> ${esc(option)}</button>`).join('')}</div><div class="feedback" aria-live="polite"></div></article>`;
}

function tierHtml(items,level,title,subtitle){
  return `<div class="advanced-intro"><div><span class="advanced-badge">${title}</span><h3>${items.length} câu · ${subtitle}</h3><p>Mỗi câu chỉ có một đáp án đúng. Nộp bài để xem đáp án và giải thích bằng tiếng Việt.</p></div><div class="advanced-count">${items.length} câu</div></div><div class="advanced-score" id="${level}Score" aria-live="polite">Chọn đáp án rồi bấm “Nộp bài”.</div>${items.map((q,i)=>questionHtml(q,i,items.length,level)).join('')}<div class="quiz-actions"><button type="button" class="primary-btn reviewed-submit" data-level="${level}">✓ Nộp bài</button><button type="button" class="ghost-btn reviewed-reset" data-level="${level}">↺ Làm lại</button></div>`;
}

async function renderPractice(){
  const basicRoot=$('#basicPractice'),advancedRoot=$('#advancedPractice');
  if(!basicRoot||!advancedRoot)return;
  practiceState={basic:{},advanced:{}};
  basicRoot.innerHTML='<div class="practice-loading">Đang tải 30 câu luyện tập của bài…</div>';
  advancedRoot.innerHTML='';
  try{
    const bank=await loadPracticeBank();
    const lesson=bank.lessons.find(item=>Number(item.lesson_id)===Number(id));
    if(!lesson||!Array.isArray(lesson.questions))throw new Error('Lesson not found');
    const basic=lesson.questions.filter(q=>q.tier==='基础');
    const advanced=lesson.questions.filter(q=>q.tier==='进阶');
    if(basic.length!==18||advanced.length!==12)throw new Error('Unexpected lesson question count');
    basicRoot.innerHTML=tierHtml(basic,'basic','基础巩固 · Củng cố cơ bản','từ vựng, pinyin, Hán tự và mẫu câu cơ bản');
    advancedRoot.innerHTML=tierHtml(advanced,'advanced','进阶运用 · Vận dụng nâng cao','đọc hiểu, ngữ pháp và giao tiếp theo ngữ cảnh');
    const note=$('#practice .practice-note');
    if(note)note.textContent='30 câu được biên soạn riêng cho bài này theo 《新HSK教程1》3.0: 18 câu cơ bản và 12 câu nâng cao. Nội dung không vượt quá phạm vi đã học.';
    const chip=$('#practice .section-head .chip');
    if(chip)chip.textContent='30 câu · 18 cơ bản + 12 nâng cao';
    $$('.practice-level-btn').forEach(button=>{
      button.onclick=()=>switchPracticeLevel(button.dataset.level);
      button.innerHTML=button.dataset.level==='basic'?'基础巩固 · Cơ bản<small>18 câu · củng cố kiến thức trọng tâm</small>':'进阶运用 · Nâng cao<small>12 câu · hiểu và vận dụng trong ngữ cảnh</small>';
    });
    bindTier('basic',basic);
    bindTier('advanced',advanced);
    switchPracticeLevel('basic');
  }catch(error){
    console.error('Practice bank error',error);
    basicRoot.innerHTML='<div class="boot-error">Không tải được bài luyện tập. Vui lòng tải lại trang.</div>';
  }
}

function bindTier(level,items){
  const root=level==='basic'?$('#basicPractice'):$('#advancedPractice');
  $$('.reviewed-card',root).forEach(card=>$$('.reviewed-opt',card).forEach(button=>button.onclick=()=>{
    if(card.dataset.checked)return;
    $$('.reviewed-opt',card).forEach(option=>option.classList.remove('sel'));
    button.classList.add('sel');
    practiceState[level][Number(card.dataset.i)]=Number(button.dataset.opt);
  }));
  $('.reviewed-submit',root)?.addEventListener('click',()=>checkTier(level,items));
  $('.reviewed-reset',root)?.addEventListener('click',()=>{
    practiceState[level]={};
    root.innerHTML=tierHtml(items,level,level==='basic'?'基础巩固 · Củng cố cơ bản':'进阶运用 · Vận dụng nâng cao',level==='basic'?'từ vựng, pinyin, Hán tự và mẫu câu cơ bản':'đọc hiểu, ngữ pháp và giao tiếp theo ngữ cảnh');
    bindTier(level,items);
  });
}

function checkTier(level,items){
  const root=level==='basic'?$('#basicPractice'):$('#advancedPractice');
  let correct=0,answered=0;
  $$('.reviewed-card',root).forEach((card,i)=>{
    const q=items[i],selectedIndex=practiceState[level][i];
    const picked=Number.isInteger(selectedIndex)?q.options[selectedIndex]:null;
    const isCorrect=picked===q.answer;
    if(picked!==null)answered++;
    if(isCorrect)correct++;
    card.dataset.checked='1';
    $$('.reviewed-opt',card).forEach((button,k)=>{
      button.disabled=true;
      if(q.options[k]===q.answer)button.classList.add('correct');
      if(k===selectedIndex&&!isCorrect)button.classList.add('wrong');
    });
    const feedback=$('.feedback',card);
    feedback.className='feedback '+(isCorrect?'good':'bad');
    feedback.innerHTML=`<div>${isCorrect?'✅ Đúng':picked===null?'⚠️ Chưa chọn':'❌ Chưa đúng'} · Đáp án: <b>${esc(q.answer_label)}. ${esc(q.answer)}</b></div><div class="answer-explain"><b>Giải thích bằng tiếng Việt</b><div>${esc(q.explanation_vi)}</div>${q.chinese_note?`<div class="answer-note-zh"><b>中文提示：</b>${esc(q.chinese_note)}</div>`:''}</div>`;
  });
  const score=$('#'+level+'Score');
  const percent=items.length?Math.round(correct/items.length*100):0;
  score.className='advanced-score '+(percent>=80?'great':percent>=60?'ok':'need');
  score.innerHTML=`Kết quả: <b>${correct}/${items.length}</b> · ${percent}% · Đã làm ${answered}/${items.length} câu`;
}

function switchPracticeLevel(level){
  const advanced=level==='advanced';
  $('#basicPractice')?.classList.toggle('hidden-level',advanced);
  $('#advancedPractice')?.classList.toggle('active',advanced);
  $$('.practice-level-btn').forEach(button=>button.classList.toggle('active',button.dataset.level===level));
}

window.addEventListener('DOMContentLoaded',()=>{
  initGate();
  if($('#lessonGrid'))renderHome();
  if($('#lessonTitle')){
    initLesson();
    const current=$('.parity-current-lesson');
    if(current)current.textContent=id;
  }
});
