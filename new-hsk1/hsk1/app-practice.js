/* Lesson review generated only from the vocabulary and texts in 《新HSK教程1》3.0. */
let practiceState={basic:{},advanced:{}};

function stableOptions(answer,pool,seed){
  const unique=[answer,...pool.filter(x=>x!==answer)].filter((x,i,a)=>a.indexOf(x)===i).slice(0,4);
  while(unique.length<4)unique.push('—');
  const shift=seed%unique.length;
  return unique.slice(shift).concat(unique.slice(0,shift));
}

function practiceQuestions(){
  const words=L.vocab.filter(w=>w.kind!=='proper');
  const meaningPool=words.map(w=>w.vn),pinyinPool=words.map(w=>w.py);
  const lines=L.scenes.flatMap(s=>s.lines),basic=[];
  const picks=[0,Math.floor(words.length/4),Math.floor(words.length/2),Math.floor(words.length*3/4)].map(i=>words[i]).filter(Boolean);
  picks.forEach((w,i)=>basic.push({type:'Từ vựng',prompt:`“${w.zh}” có nghĩa tiếng Việt là gì?`,stem:w.py,options:stableOptions(w.vn,meaningPool.slice(i+1).concat(meaningPool.slice(0,i+1)),i+id),answer:w.vn,explain:`${w.zh} · ${w.py} · ${w.vn}`}));
  words.slice(-3).forEach((w,i)=>basic.push({type:'Pinyin',prompt:`Chọn pinyin đúng của “${w.zh}”.`,stem:w.vn,options:stableOptions(w.py,pinyinPool.slice(0,-3),i+id+2),answer:w.py,explain:`Cách đọc trong bài: ${w.zh} — ${w.py}.`}));
  const advanced=[];
  L.scenes.forEach((s,i)=>{const x=s.lines[Math.min(i,s.lines.length-1)]||s.lines[0];if(!x)return;advanced.push({type:'Bài khoá',prompt:`Chọn bản dịch đúng của câu trong ${s.place_vn.toLowerCase()}.`,stem:`${x.py}\n${x.zh}`,options:stableOptions(x.vn,lines.map(y=>y.vn),i+id),answer:x.vn,explain:`Câu này xuất hiện nguyên văn trong Bài khoá ${i+1}: “${x.zh}”.`})});
  return {basic,advanced};
}

function qHtml(q,i,total,level){return `<article class="qcard reviewed-card" data-level="${level}" data-i="${i}"><div class="qmeta"><span class="qindex">Câu ${i+1}/${total}</span><span class="difficulty-chip">${esc(q.type)}</span></div><div class="practice-prompt">${esc(q.prompt)}</div><div class="qtitle">${esc(q.stem).replace(/\n/g,'<br>')}</div><div class="opts">${q.options.map((o,j)=>`<button class="opt reviewed-opt" data-opt="${j}"><b>${String.fromCharCode(65+j)}.</b> ${esc(o)}</button>`).join('')}</div><div class="feedback"></div></article>`}
function tierHtml(items,level,title){return `<div class="advanced-intro"><div><span class="advanced-badge">${title}</span><h3>${items.length} câu · theo đúng nội dung bài</h3></div><div class="advanced-count">${items.length} câu</div></div><div class="advanced-score" id="${level}Score">Chọn đáp án rồi bấm “Nộp bài”.</div>${items.map((q,i)=>qHtml(q,i,items.length,level)).join('')}<div class="quiz-actions"><button class="primary-btn reviewed-submit" data-level="${level}">✓ Nộp bài</button><button class="ghost-btn reviewed-reset" data-level="${level}">↺ Làm lại</button></div>`}

function renderPractice(){
  const bank=practiceQuestions();practiceState={basic:{},advanced:{}};
  const basic=$('#basicPractice'),advanced=$('#advancedPractice');if(!basic||!advanced)return;
  basic.innerHTML=tierHtml(bank.basic,'basic','基础巩固 · Củng cố cơ bản');advanced.innerHTML=tierHtml(bank.advanced,'advanced','课文理解 · Hiểu bài khoá');
  const note=$('#practice .practice-note');if(note)note.textContent='Câu hỏi được tạo trực tiếp từ từ vựng và câu thoại của bài này; không dùng ngân hàng câu hỏi HSK cũ.';
  const chip=$('#practice .section-head .chip');if(chip)chip.textContent=(bank.basic.length+bank.advanced.length)+' câu · Theo giáo trình';
  $$('.practice-level-btn').forEach((b,i)=>{b.onclick=()=>switchPracticeLevel(b.dataset.level);b.innerHTML=i===0?'基础巩固 · Cơ bản<small>Từ vựng và pinyin của bài</small>':'课文理解 · Bài khoá<small>Đọc hiểu câu thoại nguyên bản</small>'});
  bindTier('basic',bank.basic);bindTier('advanced',bank.advanced);switchPracticeLevel('basic');
}

function bindTier(level,items){
  const root=level==='basic'?$('#basicPractice'):$('#advancedPractice');
  $$('.reviewed-card',root).forEach(card=>$$('.reviewed-opt',card).forEach(btn=>btn.onclick=()=>{if(card.dataset.checked)return;$$('.reviewed-opt',card).forEach(x=>x.classList.remove('sel'));btn.classList.add('sel');practiceState[level][Number(card.dataset.i)]=Number(btn.dataset.opt)}));
  $('.reviewed-submit',root)?.addEventListener('click',()=>checkTier(level,items));
  $('.reviewed-reset',root)?.addEventListener('click',()=>{practiceState[level]={};root.innerHTML=tierHtml(items,level,level==='basic'?'基础巩固 · Củng cố cơ bản':'课文理解 · Hiểu bài khoá');bindTier(level,items)});
}

function checkTier(level,items){
  const root=level==='basic'?$('#basicPractice'):$('#advancedPractice');let ok=0;
  $$('.reviewed-card',root).forEach((card,i)=>{const q=items[i],j=practiceState[level][i],picked=Number.isInteger(j)?q.options[j]:null,good=picked===q.answer;if(good)ok++;card.dataset.checked='1';$$('.reviewed-opt',card).forEach((b,k)=>{b.disabled=true;if(q.options[k]===q.answer)b.classList.add('correct');if(k===j&&!good)b.classList.add('wrong')});const f=$('.feedback',card);f.className='feedback '+(good?'good':'bad');f.innerHTML=`<div>${good?'✅ Đúng':picked===null?'⚠️ Chưa chọn':'❌ Chưa đúng'} · Đáp án: <b>${esc(q.answer)}</b></div><div class="answer-explain"><b>Giải thích</b><div>${esc(q.explain)}</div></div>`});
  $('#'+level+'Score').innerHTML=`Kết quả: <b>${ok}/${items.length}</b> · ${items.length?Math.round(ok/items.length*100):0}%`;
}

function switchPracticeLevel(level){const advanced=level==='advanced';$('#basicPractice')?.classList.toggle('hidden-level',advanced);$('#advancedPractice')?.classList.toggle('active',advanced);$$('.practice-level-btn').forEach(b=>b.classList.toggle('active',b.dataset.level===level))}

window.addEventListener('DOMContentLoaded',()=>{initGate();if($('#lessonGrid'))renderHome();if($('#lessonTitle')){initLesson();const current=$('.parity-current-lesson');if(current)current.textContent=id}});
