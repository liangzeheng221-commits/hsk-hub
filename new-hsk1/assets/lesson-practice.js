let reviewedSelected={basic:{},advanced:{}};
let reviewedSortState={basic:{},advanced:{}};
let reviewedBankPromise=null;

function practiceEscHtml(s){return esc(s??'').replace(/\n/g,'<br>')}
function practiceNorm(s){return String(s??'').replace(/[\s，。！？,.!?；;：:、“”‘’'"（）()]/g,'').trim()}

async function ensureReviewedBank(){
  if(window.HSK2_PRACTICE_V58)return window.HSK2_PRACTICE_V58;
  if(reviewedBankPromise)return reviewedBankPromise;
  reviewedBankPromise=(async()=>{
    const paths=[
      'practice/reviewed/hsk2-v5.8.part01.b64',
      'practice/reviewed/hsk2-v5.8.part02.b64',
      'practice/reviewed/hsk2-v5.8.part03.b64',
      'practice/reviewed/hsk2-v5.8.part04.b64',
      'practice/reviewed/hsk2-v5.8.part05.b64'
    ];
    const parts=await Promise.all(paths.map(async p=>{
      const r=await fetch(p,{cache:'no-store'});
      if(!r.ok)throw new Error('Không tải được dữ liệu luyện tập: '+r.status);
      return (await r.text()).trim();
    }));
    const bytes=Uint8Array.from(atob(parts.join('')),c=>c.charCodeAt(0));
    const bank=JSON.parse(pako.ungzip(bytes,{to:'string'}));
    if(bank.version!=='HSK2-V5.8-2026-08-15'||bank.course!=='HSK2'||!Array.isArray(bank.lessons)||bank.lessons.length!==15||bank.qa?.total_questions!==360){
      throw new Error('Dữ liệu luyện tập HSK2 không hợp lệ');
    }
    window.HSK2_PRACTICE_V58=bank;
    return bank;
  })();
  return reviewedBankPromise;
}

function currentReviewedLesson(){
  const bank=window.HSK2_PRACTICE_V58;
  return bank?.lessons?.find(x=>Number(x.lesson_id)===Number(id))||null;
}

function renderPracticeShell(){
  const section=$('#practice');
  if(!section)return;
  section.innerHTML=`
    <div class="section-head"><h2>LUYỆN TẬP — 练一练</h2><span class="chip">24 câu · Cơ bản + Nâng cao</span></div>
    <div class="practice-note">Mỗi bài gồm 14 câu cơ bản và 10 câu nâng cao. Làm bài rồi nộp để xem đáp án và giải thích cho từng câu.</div>
    <div class="practice-level-tabs">
      <button class="practice-level-btn active" data-level="basic">基础测试 · Cơ bản<small>14 câu · đúng mức HSK 2</small></button>
      <button class="practice-level-btn advanced" data-level="advanced">进阶测试 · Nâng cao<small>10 câu · ngữ cảnh và vận dụng</small></button>
    </div>
    <div id="basicPractice"></div>
    <div id="advancedPractice" class="advanced-practice"></div>`;
  $$('.practice-level-btn',section).forEach(b=>b.onclick=()=>switchPracticeLevel(b.dataset.level));
}

function renderPractice(){
  renderPracticeShell();
  const basic=$('#basicPractice'),advanced=$('#advancedPractice');
  if(!basic||!advanced)return;
  basic.innerHTML='<div class="practice-note">Đang tải câu hỏi…</div>';
  ensureReviewedBank().then(()=>{
    const lp=currentReviewedLesson();
    if(!lp)throw new Error('Không tìm thấy bài luyện tập');
    reviewedSelected={basic:{},advanced:{}};
    reviewedSortState={basic:{},advanced:{}};
    basic.innerHTML=renderReviewedTier(lp.basic,'basic','基础测试 · Cơ bản');
    advanced.innerHTML=renderReviewedTier(lp.advanced,'advanced','进阶测试 · Nâng cao');
    bindReviewedTier('basic');
    bindReviewedTier('advanced');
    switchPracticeLevel('basic');
  }).catch(err=>{
    console.error(err);
    basic.innerHTML='<div class="feedback bad">Không tải được bài tập. Vui lòng tải lại trang.</div>';
    advanced.innerHTML='';
  });
}

function renderReviewedTier(questions,level,title){
  return `<div class="advanced-intro"><div><span class="advanced-badge">${title}</span><h3>${questions.length} câu</h3></div><div class="advanced-count">${questions.length} câu</div></div>
  <div class="advanced-score" id="${level}Score">Làm bài rồi bấm “Nộp bài” để xem đáp án và giải thích.</div>
  ${questions.map((q,i)=>renderReviewedQuestion(q,i,level,questions.length)).join('')}
  <div class="quiz-actions"><button class="primary-btn reviewed-submit" data-level="${level}">✓ Nộp bài</button><button class="ghost-btn reviewed-reset" data-level="${level}">↺ Làm lại</button></div>`;
}

function renderReviewedQuestion(q,i,level,total){
  const prompt=q.prompt_vi?`<div class="practice-prompt" style="margin-bottom:8px;color:var(--sub);font-weight:600">${practiceEscHtml(q.prompt_vi)}</div>`:'';
  const stem=q.stem?`<div class="qtitle">${practiceEscHtml(q.stem)}</div>`:'';
  let body='';
  if(q.type==='语序排序'&&Array.isArray(q.segments)){
    reviewedSortState[level][i]=[];
    body=`<div class="sort-answer reviewed-sort-answer" id="rsa-${level}-${i}"></div><div class="sort-bank reviewed-sort-bank" id="rsb-${level}-${i}">${q.segments.map((seg,j)=>`<button class="token reviewed-sort-token" data-level="${level}" data-q="${i}" data-key="${j}" data-word="${practiceEscHtml(seg)}">${practiceEscHtml(seg)}</button>`).join('')}</div>`;
  }else{
    const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    body=`<div class="opts">${(q.options||[]).map((o,j)=>`<button class="opt reviewed-opt" data-opt="${j}"><b>${letters[j]||''}.</b> ${practiceEscHtml(o)}</button>`).join('')}</div>`;
  }
  return `<div class="qcard reviewed-card ${level==='advanced'?'advanced-card':''}" data-level="${level}" data-i="${i}"><div class="qmeta"><span class="qindex">Câu ${i+1}/${total}</span><span class="difficulty-chip">${practiceEscHtml(q.type)}</span></div>${prompt}${stem}${body}<div class="feedback"></div></div>`;
}

function bindReviewedTier(level){
  const root=level==='basic'?$('#basicPractice'):$('#advancedPractice');
  if(!root)return;
  $$('.reviewed-card',root).forEach(card=>{
    const qi=Number(card.dataset.i);
    $$('.reviewed-opt',card).forEach(btn=>btn.onclick=()=>{
      if(card.dataset.checked)return;
      $$('.reviewed-opt',card).forEach(x=>x.classList.remove('sel'));
      btn.classList.add('sel');
      reviewedSelected[level][qi]=Number(btn.dataset.opt);
    });
    $$('.reviewed-sort-token',card).forEach(btn=>btn.onclick=()=>moveReviewedSortToken(btn,level,qi));
  });
  $('.reviewed-submit',root)?.addEventListener('click',()=>checkReviewedTier(level));
  $('.reviewed-reset',root)?.addEventListener('click',()=>resetReviewedTier(level));
}

function moveReviewedSortToken(btn,level,qi){
  const card=btn.closest('.reviewed-card');
  if(card?.dataset.checked)return;
  const answer=$(`#rsa-${level}-${qi}`),bank=$(`#rsb-${level}-${qi}`);
  const state=reviewedSortState[level][qi]||[];
  const key=btn.dataset.key,word=btn.dataset.word;
  if(btn.parentElement===bank){
    state.push({key,word});
    answer.appendChild(btn);
  }else{
    const pos=state.findIndex(x=>x.key===key);
    if(pos>=0)state.splice(pos,1);
    const siblings=[...bank.children];
    const target=siblings.find(x=>Number(x.dataset.key)>Number(key));
    if(target)bank.insertBefore(btn,target);else bank.appendChild(btn);
  }
  reviewedSortState[level][qi]=state;
}

function checkReviewedTier(level){
  const lp=currentReviewedLesson();
  if(!lp)return;
  const questions=lp[level]||[];
  const root=level==='basic'?$('#basicPractice'):$('#advancedPractice');
  let ok=0;
  $$('.reviewed-card',root).forEach((card,i)=>{
    const q=questions[i];
    let good=false,chosen=null;
    if(q.type==='语序排序'){
      const words=(reviewedSortState[level][i]||[]).map(x=>x.word);
      chosen=words.join('');
      good=practiceNorm(chosen)===practiceNorm(q.answer);
      $$('.reviewed-sort-token',card).forEach(b=>b.disabled=true);
    }else{
      const chosenIndex=reviewedSelected[level][i];
      chosen=Number.isInteger(chosenIndex)?q.options[chosenIndex]:null;
      good=chosen===q.answer;
      $$('.reviewed-opt',card).forEach((btn,j)=>{
        btn.disabled=true;
        if(q.options[j]===q.answer)btn.classList.add('correct');
        if(j===chosenIndex&&!good)btn.classList.add('wrong');
      });
    }
    if(good)ok++;
    card.dataset.checked='1';
    const f=$('.feedback',card);
    f.innerHTML=`<div>${good?'✅ Đúng':chosen?'❌ Chưa đúng':'⚠️ Chưa chọn'} · Đáp án / 正确答案: <b>${practiceEscHtml(q.answer)}</b></div><div class="answer-explain"><b>Giải thích</b><div>${practiceEscHtml(q.explanation_vi)}</div></div>`;
    f.className='feedback '+(good?'good':'bad');
  });
  const score=$('#'+level+'Score');
  if(score)score.innerHTML=`Kết quả: <b>${ok}/${questions.length}</b> · ${questions.length?Math.round(ok/questions.length*100):0}%`;
}

function resetReviewedTier(level){
  const lp=currentReviewedLesson();
  if(!lp)return;
  reviewedSelected[level]={};
  reviewedSortState[level]={};
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

function resetPractice(){
  const lp=currentReviewedLesson();
  if(!lp){renderPractice();return;}
  resetReviewedTier('basic');resetReviewedTier('advanced');switchPracticeLevel('basic');
  toast('Đã làm lại bài tập.');
}

function toggleComplete(){const p=getProgress();p[id]=p[id]||{};p[id].complete=!p[id].complete;p[id].visited=true;saveProgress(p);$('#completeBtn').textContent=p[id].complete?'✓ Đã hoàn thành':'✓ Đánh dấu hoàn thành';$('#completeBtn').style.background=p[id].complete?'var(--moss)':'var(--pine)';toast(p[id].complete?'Đã lưu: hoàn thành bài '+id+'.':'Đã bỏ đánh dấu hoàn thành.')}
function updateModuleStepNav(){
  const idx=SECTION_ORDER.indexOf(activeSection),prev=$('#prevModuleBtn'),next=$('#nextModuleBtn');
  $('#moduleStepTitle').textContent=SECTION_LABELS[activeSection];
  $('#moduleStepHint').textContent=`Bài ${id} · ${L.title}`;
  if(idx>0){prev.disabled=false;prev.textContent='← '+SECTION_LABELS[SECTION_ORDER[idx-1]].split(' · ')[0];prev.onclick=()=>activateSection(SECTION_ORDER[idx-1]);}
  else if(id>1){prev.disabled=false;prev.textContent=`← Bài ${id-1}`;prev.onclick=()=>location.href=lessonUrl(id-1,'practice');}
  else{prev.disabled=false;prev.textContent='← Trang chủ';prev.onclick=()=>location.href='index.html';}
  if(idx<SECTION_ORDER.length-1){next.disabled=false;next.textContent=SECTION_LABELS[SECTION_ORDER[idx+1]].split(' · ')[0]+' →';next.onclick=()=>activateSection(SECTION_ORDER[idx+1]);}
  else if(id<15){next.disabled=false;next.textContent=`Bài ${id+1} →`;next.onclick=()=>location.href=lessonUrl(id+1,'vocab');}
  else{next.disabled=false;next.textContent='Trang chủ →';next.onclick=()=>location.href='index.html';}
}
function activateSection(sec,scroll=true,updateUrl=true){
  if(!SECTION_ORDER.includes(sec))sec='vocab';activeSection=sec;
  $$('.section-tab').forEach(x=>x.classList.toggle('active',x.dataset.sec===sec));
  $$('.content-section').forEach(s=>s.classList.toggle('active',s.id===sec));
  if(sec==='hanzi'&&!$('#hanziMaster').dataset.ready){$('#hanziMaster').dataset.ready='1';renderHanziSection()}
  if(updateUrl){const u=new URL(location.href);u.searchParams.set('id',id);u.searchParams.set('sec',sec);history.replaceState(null,'',u.pathname+u.search)}
  refreshLessonLinks();updateModuleStepNav();
  if(scroll){const top=$('.mobile-section-tabs')?.offsetTop||$('.lesson-hero')?.offsetTop||0;window.scrollTo({top:Math.max(0,top-58),behavior:'smooth'})}
}
function setupTabs(){
  $$('.section-tab').forEach(b=>b.onclick=()=>activateSection(b.dataset.sec));
  document.addEventListener('click',e=>{if(!e.target.closest('.lesson-menu-wrap'))closeLessonMenu()});
}

initGate();markVisited();setupHeader();setupTabs();renderVocabQuick();renderVocab();$('#vSearch').addEventListener('input',e=>renderVocab(e.target.value));renderText();renderGrammar();$('#hanziChip').textContent=getLessonHanzi().length+' chữ';renderPractice();activateSection(activeSection,false,false);
