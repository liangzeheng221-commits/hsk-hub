let reviewedSelected={basic:{},advanced:{}};
let reviewedBankPromise=null;

async function ensureReviewedBank(){
  if(window.HSK1_PRACTICE_V5) return window.HSK1_PRACTICE_V5;
  if(reviewedBankPromise) return reviewedBankPromise;
  reviewedBankPromise=(async()=>{
    const files=[
      '../practice/reviewed/hsk1-v5.0.part01.b64',
      '../practice/reviewed/hsk1-v5.0.part02.b64',
      '../practice/reviewed/hsk1-v5.0.part03.b64',
      '../practice/reviewed/hsk1-v5.0.part04.b64'
    ];
    const parts=await Promise.all(files.map(async path=>{
      const res=await fetch(path,{cache:'no-store'});
      if(!res.ok) throw new Error('practice data '+res.status);
      return (await res.text()).trim();
    }));
    const bytes=Uint8Array.from(atob(parts.join('')),c=>c.charCodeAt(0));
    const bank=JSON.parse(pako.ungzip(bytes,{to:'string'}));
    if(bank.version!=='HSK1-V5.0-2026-08-15'||bank.course!=='HSK1'||!Array.isArray(bank.lessons)||bank.lessons.length!==15||bank.qa?.total_questions!==360){
      throw new Error('invalid HSK1 practice bank');
    }
    window.HSK1_PRACTICE_V5=bank;
    return bank;
  })();
  return reviewedBankPromise;
}
function getReviewedPracticeLesson(){
  const external=window.getReviewedPracticeLesson;
  if(typeof external==='function'&&external!==getReviewedPracticeLesson){
    const overridden=external();
    if(overridden) return overridden;
  }
  const bank=window.HSK1_PRACTICE_V5;
  if(!bank||!Array.isArray(bank.lessons)) return null;
  return bank.lessons.find(x=>Number(x.lesson_id)===Number(id))||null;
}
function practiceHtml(s){
  return esc(s??'').replace(/\n/g,'<br>');
}
function practiceExplanation(text){
  return `<div class="answer-explain"><b>解析 · Giải thích</b><div>${practiceHtml(text)}</div></div>`;
}
function renderPractice(){
  const lessonPractice=getReviewedPracticeLesson();
  const basicBox=$('#basicPractice');
  const advancedBox=$('#advancedPractice');
  const practiceSection=$('#practice');
  if(!basicBox||!advancedBox) return;
  const note=practiceSection?.querySelector('.practice-note');
  if(note) note.textContent='Mỗi bài gồm 14 câu cơ bản và 10 câu nâng cao. Sau khi nộp, xem đáp án và giải thích cho từng câu.';
  const chip=practiceSection?.querySelector('.section-head .chip');
  if(chip) chip.textContent='24 câu · Cơ bản + Nâng cao';
  const levelBtns=$$('.practice-level-btn',practiceSection||document);
  if(levelBtns[0]) levelBtns[0].innerHTML='基础测试 · Cơ bản<small>14 câu · đúng mức HSK 1</small>';
  if(levelBtns[1]) levelBtns[1].innerHTML='进阶测试 · Nâng cao<small>10 câu · ngữ cảnh và vận dụng</small>';
  if(!lessonPractice){
    basicBox.innerHTML='<div class="feedback bad">Không tải được bộ bài tập của bài này.</div>';
    advancedBox.innerHTML='';
    return;
  }
  reviewedSelected={basic:{},advanced:{}};
  basicBox.innerHTML=renderReviewedTier(lessonPractice.basic,'basic','基础测试 · Cơ bản');
  advancedBox.innerHTML=renderReviewedTier(lessonPractice.advanced,'advanced','进阶测试 · Nâng cao');
  bindReviewedTier('basic');
  bindReviewedTier('advanced');
  $$('.practice-level-btn').forEach(b=>b.onclick=()=>switchPracticeLevel(b.dataset.level));
  switchPracticeLevel('basic');
}
function renderReviewedTier(questions,level,title){
  const total=questions.length;
  return `<div class="advanced-intro">
    <div><span class="advanced-badge">${title}</span><h3>${total} câu</h3></div>
    <div class="advanced-count">${total} câu</div>
  </div>
  <div class="advanced-score" id="${level}Score">Làm bài rồi bấm “Nộp bài” để xem đáp án và giải thích.</div>
  ${questions.map((q,i)=>renderReviewedQuestion(q,i,level,total)).join('')}
  <div class="quiz-actions">
    <button class="primary-btn reviewed-submit" data-level="${level}">✓ Nộp bài</button>
    <button class="ghost-btn reviewed-reset" data-level="${level}">↺ Làm lại</button>
  </div>`;
}
function renderReviewedQuestion(q,i,level,total){
  const prompt=q.prompt_vi?`<div class="practice-prompt" style="margin-bottom:8px;color:var(--muted,#64748b);font-weight:600">${practiceHtml(q.prompt_vi)}</div>`:'';
  const stem=q.stem?`<div class="qtitle">${practiceHtml(q.stem)}</div>`:'';
  const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return `<div class="qcard reviewed-card ${level==='advanced'?'advanced-card':''}" data-level="${level}" data-i="${i}">
    <div class="qmeta">
      <span class="qindex">Câu ${i+1}/${total}</span>
      <span class="difficulty-chip">${practiceHtml(q.type)}</span>
    </div>
    ${prompt}${stem}
    <div class="opts">
      ${q.options.map((o,j)=>`<button class="opt reviewed-opt" data-opt="${j}"><b>${letters[j]||''}.</b> ${practiceHtml(o)}</button>`).join('')}
    </div>
    <div class="feedback"></div>
  </div>`;
}
function bindReviewedTier(level){
  const root=level==='basic'?$('#basicPractice'):$('#advancedPractice');
  if(!root) return;
  $$('.reviewed-card',root).forEach(card=>{
    const qi=Number(card.dataset.i);
    $$('.reviewed-opt',card).forEach(btn=>{
      btn.onclick=()=>{
        if(card.dataset.checked) return;
        $$('.reviewed-opt',card).forEach(x=>x.classList.remove('sel'));
        btn.classList.add('sel');
        reviewedSelected[level][qi]=Number(btn.dataset.opt);
      };
    });
  });
  $('.reviewed-submit',root)?.addEventListener('click',()=>checkReviewedTier(level));
  $('.reviewed-reset',root)?.addEventListener('click',()=>resetReviewedTier(level));
}
function checkReviewedTier(level){
  const lp=getReviewedPracticeLesson();
  if(!lp) return;
  const questions=lp[level]||[];
  const root=level==='basic'?$('#basicPractice'):$('#advancedPractice');
  let ok=0;
  $$('.reviewed-card',root).forEach((card,i)=>{
    const q=questions[i];
    const chosenIndex=reviewedSelected[level][i];
    const chosen=Number.isInteger(chosenIndex)?q.options[chosenIndex]:null;
    const good=chosen===q.answer;
    if(good) ok++;
    card.dataset.checked='1';
    $$('.reviewed-opt',card).forEach((btn,j)=>{
      btn.disabled=true;
      const value=q.options[j];
      if(value===q.answer) btn.classList.add('correct');
      if(j===chosenIndex&&!good) btn.classList.add('wrong');
    });
    const f=$('.feedback',card);
    f.innerHTML=`<div>${good?'✅ Đúng':chosen!==null?'❌ Chưa đúng':'⚠️ Chưa chọn'} · Đáp án / 正确答案: <b>${practiceHtml(q.answer)}</b></div>${practiceExplanation(q.explanation_vi)}`;
    f.className='feedback '+(good?'good':'bad');
  });
  const score=$('#'+level+'Score');
  if(score) score.innerHTML=`Kết quả: <b>${ok}/${questions.length}</b> · ${questions.length?Math.round(ok/questions.length*100):0}%`;
}
function resetReviewedTier(level){
  const lp=getReviewedPracticeLesson();
  if(!lp) return;
  reviewedSelected[level]={};
  const root=level==='basic'?$('#basicPractice'):$('#advancedPractice');
  root.innerHTML=renderReviewedTier(lp[level]||[],level,level==='basic'?'基础测试 · Cơ bản':'进阶测试 · Nâng cao');
  bindReviewedTier(level);
}
function switchPracticeLevel(level){
  const adv=level==='advanced';
  $('#basicPractice')?.classList.toggle('hidden-level',adv);
  $('#advancedPractice')?.classList.toggle('active',adv);
  $$('.practice-level-btn').forEach(b=>b.classList.toggle('active',b.dataset.level===level));
}

window.addEventListener('DOMContentLoaded',async()=>{
  initGate();
  if($('#lessonGrid')) renderHome();
  if($('#lessonTitle')){
    try{await ensureReviewedBank()}catch(err){console.error('HSK1 practice load failed',err)}
    initLesson();
  }
});
