'use strict';
let reviewedBankPromise=null;
let reviewedSelected={basic:{},advanced:{}};

function practiceHtml(s){return esc(s??'').replace(/\n/g,'<br>')}
function practiceNorm(s){return String(s??'').replace(/[\s，。！？,.!?；;：:、“”‘’'"（）()]/g,'').trim()}

async function ensureReviewedBank(){
  if(window.HSK3_PRACTICE_V11)return window.HSK3_PRACTICE_V11;
  if(reviewedBankPromise)return reviewedBankPromise;
  reviewedBankPromise=(async()=>{
    const paths=Array.from({length:9},(_,i)=>`../practice/reviewed/hsk3-v1.1.part${String(i+1).padStart(2,'0')}.b64`);
    const parts=await Promise.all(paths.map(async path=>{
      const r=await fetch(path,{cache:'no-store'});
      if(!r.ok)throw new Error('Không tải được dữ liệu luyện tập: '+r.status);
      return (await r.text()).trim();
    }));
    const bytes=Uint8Array.from(atob(parts.join('')),c=>c.charCodeAt(0));
    const bank=JSON.parse(pako.ungzip(bytes,{to:'string'}));
    validateReviewedBank(bank);
    window.HSK3_PRACTICE_V11=bank;
    return bank;
  })();
  return reviewedBankPromise;
}

function validateReviewedBank(bank){
  if(bank?.version!=='V1.1'||!Array.isArray(bank.lessons)||bank.lessons.length!==20||bank.qa?.total_questions!==640){
    throw new Error('Dữ liệu luyện tập HSK3 không hợp lệ');
  }
  const ids=new Set();let total=0;
  for(const lesson of bank.lessons){
    if(!Array.isArray(lesson.basic)||lesson.basic.length!==18||!Array.isArray(lesson.advanced)||lesson.advanced.length!==14)throw new Error('Số câu của bài '+lesson.lesson_id+' không đúng');
    for(const q of [...lesson.basic,...lesson.advanced]){
      total++;
      if(!q.id||ids.has(q.id))throw new Error('ID câu hỏi bị thiếu hoặc trùng');ids.add(q.id);
      if(!String(q.answer??'').trim()||!String(q.explanation_vi??'').trim())throw new Error('Câu '+q.id+' thiếu đáp án hoặc giải thích');
      if(q.type==='语序排序'){
        if(!Array.isArray(q.segments)||q.segments.length<2||!practiceNorm(q.answer))throw new Error('Câu '+q.id+' có dữ liệu sắp xếp không hợp lệ');
      }else{
        if(!Array.isArray(q.options)||q.options.length<2||new Set(q.options).size!==q.options.length||!q.options.includes(q.answer))throw new Error('Câu '+q.id+' có lựa chọn/đáp án không hợp lệ');
      }
    }
  }
  if(total!==640)throw new Error('Tổng số câu không phải 640');
}

function currentReviewedLesson(){return window.HSK3_PRACTICE_V11?.lessons?.find(x=>Number(x.lesson_id)===Number(id))||null}

function renderPractice(){
  const section=$('#practice');
  if(!section)return;
  section.innerHTML=`
    <div class="section-head"><h2>LUYỆN TẬP — 练一练</h2><span class="chip">32 câu · Cơ bản + Nâng cao</span></div>
    <div class="practice-note">Mỗi bài gồm 18 câu cơ bản và 14 câu nâng cao. Làm bài rồi nộp để xem đúng/sai, đáp án và giải thích.</div>
    <div class="practice-level-tabs">
      <button class="practice-level-btn active" data-level="basic">基础测试 · Cơ bản<small>18 câu</small></button>
      <button class="practice-level-btn advanced" data-level="advanced">进阶测试 · Nâng cao<small>14 câu</small></button>
    </div>
    <div id="basicPractice"><div class="practice-note">Đang tải câu hỏi…</div></div>
    <div id="advancedPractice" class="advanced-practice"></div>`;
  $$('.practice-level-btn',section).forEach(b=>b.onclick=()=>switchPracticeLevel(b.dataset.level));
  ensureReviewedBank().then(()=>{
    const lesson=currentReviewedLesson();
    if(!lesson)throw new Error('Không tìm thấy bài luyện tập');
    reviewedSelected={basic:{},advanced:{}};
    $('#basicPractice').innerHTML=renderReviewedTier(lesson.basic,'basic','基础测试 · Cơ bản');
    $('#advancedPractice').innerHTML=renderReviewedTier(lesson.advanced,'advanced','进阶测试 · Nâng cao');
    bindReviewedTier('basic');bindReviewedTier('advanced');switchPracticeLevel('basic');
  }).catch(err=>{
    console.error('[HSK3 practice]',err);
    $('#basicPractice').innerHTML='<div class="feedback bad">Không tải được bài tập. Vui lòng tải lại trang.</div>';
    $('#advancedPractice').innerHTML='';
  });
}

function renderReviewedTier(questions,level,title){
  return `<div class="advanced-intro"><div><span class="advanced-badge">${title}</span><h3>${questions.length} câu</h3></div><div class="advanced-count">${questions.length} câu</div></div>
  <div class="advanced-score" id="${level}Score">Làm bài rồi bấm “Nộp bài”.</div>
  ${questions.map((q,i)=>renderReviewedQuestion(q,i,level,questions.length)).join('')}
  <div class="quiz-actions"><button class="primary-btn reviewed-submit" data-level="${level}">✓ Nộp bài</button><button class="ghost-btn reviewed-reset" data-level="${level}">↺ Làm lại</button></div>`;
}

function renderReviewedQuestion(q,i,level,total){
  const prompt=q.prompt_vi?`<div class="practice-prompt" style="margin-bottom:8px;color:var(--sub);font-weight:600">${practiceHtml(q.prompt_vi)}</div>`:'';
  const stem=q.stem?`<div class="qtitle">${practiceHtml(q.stem)}</div>`:'';
  let body='';
  if(q.type==='语序排序'){
    body=`<div class="sort-answer reviewed-sort-answer" id="rsa-${level}-${i}"></div><div class="sort-bank reviewed-sort-bank" id="rsb-${level}-${i}">${q.segments.map((seg,j)=>`<button class="token reviewed-sort-token" data-key="${j}" data-word="${practiceHtml(seg)}">${practiceHtml(seg)}</button>`).join('')}</div>`;
  }else{
    const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    body=`<div class="opts">${q.options.map((o,j)=>`<button class="opt reviewed-opt" data-opt="${j}"><b>${letters[j]}.</b> ${practiceHtml(o)}</button>`).join('')}</div>`;
  }
  return `<div class="qcard reviewed-card ${level==='advanced'?'advanced-card':''}" data-level="${level}" data-i="${i}"><div class="qmeta"><span class="qindex">Câu ${i+1}/${total}</span><span class="difficulty-chip">${practiceHtml(q.type)}</span></div>${prompt}${stem}${body}<div class="feedback"></div></div>`;
}

function bindReviewedTier(level){
  const root=level==='basic'?$('#basicPractice'):$('#advancedPractice');if(!root)return;
  $$('.reviewed-card',root).forEach(card=>{
    const qi=Number(card.dataset.i);
    $$('.reviewed-opt',card).forEach(btn=>btn.onclick=()=>{
      if(card.dataset.checked)return;
      $$('.reviewed-opt',card).forEach(x=>x.classList.remove('sel'));btn.classList.add('sel');reviewedSelected[level][qi]=Number(btn.dataset.opt);
    });
    $$('.reviewed-sort-token',card).forEach(btn=>bindSortToken(btn,card));
  });
  $('.reviewed-submit',root)?.addEventListener('click',()=>checkReviewedTier(level));
  $('.reviewed-reset',root)?.addEventListener('click',()=>resetReviewedTier(level));
}

function bindSortToken(btn,card){
  btn.onclick=()=>{
    if(card.dataset.checked)return;
    const level=card.dataset.level,qi=card.dataset.i;
    const answer=$(`#rsa-${level}-${qi}`),bank=$(`#rsb-${level}-${qi}`);
    if(btn.parentElement===bank)answer.appendChild(btn);else bank.appendChild(btn);
  };
}

function checkReviewedTier(level){
  const lesson=currentReviewedLesson();if(!lesson)return;
  const qs=lesson[level],root=level==='basic'?$('#basicPractice'):$('#advancedPractice');let ok=0,answered=0;
  $$('.reviewed-card',root).forEach((card,i)=>{
    const q=qs[i];card.dataset.checked='1';let good=false,hasAnswer=false;
    if(q.type==='语序排序'){
      const tokens=$$('.reviewed-sort-answer .token',card),got=tokens.map(x=>x.dataset.word).join('');
      hasAnswer=tokens.length>0;good=practiceNorm(got)===practiceNorm(q.answer);tokens.forEach(x=>x.disabled=true);$$('.reviewed-sort-bank .token',card).forEach(x=>x.disabled=true);
    }else{
      const chosenIndex=reviewedSelected[level][i],chosen=Number.isInteger(chosenIndex)?q.options[chosenIndex]:null;
      hasAnswer=chosen!==null;good=chosen===q.answer;
      $$('.reviewed-opt',card).forEach((btn,j)=>{btn.disabled=true;if(q.options[j]===q.answer)btn.classList.add('correct');if(j===chosenIndex&&!good)btn.classList.add('wrong')});
    }
    if(hasAnswer)answered++;if(good)ok++;
    const fb=$('.feedback',card);fb.innerHTML=`<div>${good?'✅ Đúng':hasAnswer?'❌ Chưa đúng':'⚠️ Chưa trả lời'} · Đáp án / 正确答案: <b>${practiceHtml(q.answer)}</b></div><div class="answer-explain"><b>Giải thích</b><div>${practiceHtml(q.explanation_vi)}</div></div>`;fb.className='feedback '+(good?'good':'bad');
  });
  const score=$('#'+level+'Score');if(score)score.innerHTML=`Kết quả: <b>${ok}/${qs.length}</b> · đã trả lời ${answered}/${qs.length} · ${Math.round(ok/qs.length*100)}%`;
}

function resetReviewedTier(level){
  const lesson=currentReviewedLesson();if(!lesson)return;
  reviewedSelected[level]={};const root=level==='basic'?$('#basicPractice'):$('#advancedPractice');
  root.innerHTML=renderReviewedTier(lesson[level],level,level==='basic'?'基础测试 · Cơ bản':'进阶测试 · Nâng cao');bindReviewedTier(level);
}

function switchPracticeLevel(level){
  const advanced=level==='advanced';
  $('#basicPractice')?.classList.toggle('hidden-level',advanced);
  $('#advancedPractice')?.classList.toggle('active',advanced);
  $$('.practice-level-btn','#practice').forEach(b=>b.classList.toggle('active',b.dataset.level===level));
}
