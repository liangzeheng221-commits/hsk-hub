function toggleHint(qi){$('#mh-'+qi)?.classList.toggle('show')}
function renderMC(){
  mcSelected={};
  $('#q-mc').innerHTML=L.mc.map((q,qi)=>`<div class="qcard" data-qi="${qi}"><div class="qmeta"><span class="qindex">Câu ${qi+1}/${L.mc.length}</span>${q.hint?`<button class="hint-btn" onclick="toggleHint(${qi})">💡 Gợi ý</button><span class="hint-text" id="mh-${qi}">${esc(q.hint)}</span>`:''}</div><div class="qtitle">${esc(q.q)}</div><div class="opts">${shuffle(q.opts).map(o=>`<button class="opt" data-val="${esc(o)}">${esc(o)}</button>`).join('')}</div><div class="feedback"></div></div>`).join('')+`<div class="quiz-actions"><button class="primary-btn" onclick="checkMC()">✓ Nộp bài</button><button class="ghost-btn" onclick="revealMC()">👁 Xem đáp án</button><button class="ghost-btn" onclick="renderMC()">↺ Làm lại</button></div>`;
  $$('.qcard',$('#q-mc')).forEach((c,qi)=>$$('.opt',c).forEach(b=>b.onclick=()=>{if(c.dataset.checked)return;$$('.opt',c).forEach(x=>x.classList.remove('sel'));b.classList.add('sel');mcSelected[qi]=b.dataset.val}));
}
function checkMC(){
  let ok=0;$$('.qcard',$('#q-mc')).forEach((c,qi)=>{c.dataset.checked='1';const ans=L.mc[qi].ans;$$('.opt',c).forEach(b=>{b.disabled=true;if(b.dataset.val===ans)b.classList.add('correct');if(b.classList.contains('sel')&&b.dataset.val!==ans)b.classList.add('wrong')});if(mcSelected[qi]===ans)ok++;const fb=$('.feedback',c);fb.textContent=mcSelected[qi]===ans?'✅ Đúng':(mcSelected[qi]?'❌ Đáp án: '+ans:'⚠️ Chưa chọn · Đáp án: '+ans);fb.className='feedback '+(mcSelected[qi]===ans?'good':'bad')});setScore(`Trắc nghiệm: ${ok}/${L.mc.length} · ${Math.round(ok/L.mc.length*100)}%`)
}
function revealMC(){$$('.qcard',$('#q-mc')).forEach((c,qi)=>{c.dataset.checked='1';const ans=L.mc[qi].ans;$$('.opt',c).forEach(b=>{b.disabled=true;b.classList.toggle('correct',b.dataset.val===ans)});const fb=$('.feedback',c);fb.textContent='✓ Đáp án: '+ans;fb.className='feedback good'});setScore('Đã hiển thị đáp án phần trắc nghiệm.')}
function renderFill(){
  $('#q-fill').innerHTML=L.fills.map((q,i)=>`<div class="fill-row">${i+1}. ${esc(q.q).replace('______',`<input class="fill-input" data-i="${i}" autocomplete="off">`)}${q.hint?`<span class="fill-hint">💡 ${esc(q.hint)}</span>`:''}</div>`).join('')+`<div class="quiz-actions"><button class="primary-btn" onclick="checkFill()">✓ Kiểm tra</button><button class="ghost-btn" onclick="revealFill()">👁 Đáp án</button><button class="ghost-btn" onclick="renderFill()">↺ Làm lại</button></div>`
}
function norm(s){return String(s).replace(/[\s，。！？,.!?]/g,'').toLowerCase()}
function checkFill(){let ok=0;$$('.fill-input').forEach(inp=>{const ans=L.fills[+inp.dataset.i].ans,good=norm(inp.value)===norm(ans);inp.classList.toggle('good',good);inp.classList.toggle('bad',!good);if(good)ok++});setScore(`Điền từ: ${ok}/${L.fills.length} · ${Math.round(ok/L.fills.length*100)}%`)}
function revealFill(){$$('.fill-input').forEach(inp=>{inp.value=L.fills[+inp.dataset.i].ans;inp.classList.add('good');inp.classList.remove('bad')});setScore('Đã hiển thị đáp án phần điền từ.')}
function renderFix(){
  $('#q-fix').innerHTML=L.fixes.map((q,i)=>`<div class="qcard"><div class="qmeta"><span class="qindex">Câu ${i+1}/${L.fixes.length}</span></div><div class="fix-wrong">✕ ${esc(q.wrong)}</div><input class="fix-input" data-i="${i}" autocomplete="off" placeholder="Viết lại câu đúng…"><div class="feedback" id="ff-${i}"></div></div>`).join('')+`<div class="quiz-actions"><button class="primary-btn" onclick="checkFix()">✓ Kiểm tra</button><button class="ghost-btn" onclick="revealFix()">👁 Đáp án + giải thích</button><button class="ghost-btn" onclick="renderFix()">↺ Làm lại</button></div>`
}
function checkFix(){let ok=0;$$('.fix-input').forEach(inp=>{const q=L.fixes[+inp.dataset.i],good=norm(inp.value)===norm(q.correct);inp.classList.toggle('good',good);inp.classList.toggle('bad',!good);const f=$('#ff-'+inp.dataset.i);f.innerHTML=good?'✅ Đúng':`❌ Chưa đúng<div class="fix-why">${esc(q.why)}</div>`;f.className='feedback '+(good?'good':'bad');if(good)ok++});setScore(`Sửa câu: ${ok}/${L.fixes.length} · ${Math.round(ok/L.fixes.length*100)}%`)}
function revealFix(){$$('.fix-input').forEach(inp=>{const q=L.fixes[+inp.dataset.i];inp.value=q.correct;inp.classList.add('good');inp.classList.remove('bad');const f=$('#ff-'+inp.dataset.i);f.innerHTML=`✓ ${esc(q.correct)}<div class="fix-why">${esc(q.why)}</div>`;f.className='feedback good'});setScore('Đã hiển thị đáp án phần sửa câu.')}
function renderMatch(){
  matchState={zh:null,py:null,vn:null};const words=L.vocab.slice(0,Math.min(6,L.vocab.length));const cols={zh:shuffle(words.map(x=>x.zh)),py:shuffle(words.map(x=>x.py)),vn:shuffle(words.map(x=>x.vn.split(/[;,]/)[0]))};
  $('#q-match').innerHTML=`<div class="match-headline"><div><b>Nối đúng 3 phần của cùng một từ</b><div class="match-progress" id="matchProgress">Đã nối 0/${words.length}</div></div><button class="ghost-btn" onclick="renderMatch()">↺ Trộn lại</button></div><div class="match-grid">${['zh','py','vn'].map(k=>`<div class="match-col" id="m-${k}"><h4>${k==='zh'?'汉字':k==='py'?'Pinyin':'Nghĩa Việt'}</h4>${cols[k].map(x=>`<div class="match-item ${k==='zh'?'zhitem':''}" data-col="${k}" data-val="${esc(x)}">${esc(x)}</div>`).join('')}</div>`).join('')}</div><div class="feedback" id="matchFeedback"></div>`;
  $$('.match-item',$('#q-match')).forEach(el=>el.onclick=()=>selectMatch(el,words));
}
function selectMatch(el,words){
  if(el.classList.contains('matched'))return;const col=el.dataset.col;$$(`#m-${col} .match-item`).forEach(x=>x.classList.remove('sel'));el.classList.add('sel');matchState[col]=el.dataset.val;
  if(matchState.zh&&matchState.py&&matchState.vn){const w=words.find(x=>x.zh===matchState.zh),ok=w&&w.py===matchState.py&&w.vn.split(/[;,]/)[0]===matchState.vn;if(ok){['zh','py','vn'].forEach(k=>{const e=$(`#m-${k} .match-item.sel`);e.classList.remove('sel');e.classList.add('matched')});$('#matchFeedback').textContent='✅ Chính xác';$('#matchFeedback').className='feedback good'}else{$('#matchFeedback').textContent='❌ Chưa đúng, thử lại.';$('#matchFeedback').className='feedback bad';$$('.match-item.sel').forEach(x=>x.classList.remove('sel'))}matchState={zh:null,py:null,vn:null};const done=$$('.match-item.matched').length/3;$('#matchProgress').textContent=`Đã nối ${done}/${words.length}`;if(done===words.length)setScore(`Nối cột: ${words.length}/${words.length} · 100%`)}
}
function renderSort(){
  sortState=L.sorts.map(()=>[]);$('#q-sort').innerHTML=L.sorts.map((q,i)=>`<div class="qcard"><div class="qtitle">${i+1}. Sắp xếp thành câu hoàn chỉnh:</div><div class="sort-answer" id="sa-${i}"></div><div class="sort-bank" id="sb-${i}">${shuffle(q.words).map(w=>`<button class="token" data-i="${i}" data-word="${esc(w)}">${esc(w)}</button>`).join('')}</div>${q.vn?`<div class="sort-hint">💡 ${esc(q.vn)}</div>`:''}<div class="feedback" id="sf-${i}"></div></div>`).join('')+`<div class="quiz-actions"><button class="primary-btn" onclick="checkSort()">✓ Kiểm tra</button><button class="ghost-btn" onclick="revealSort()">👁 Đáp án</button><button class="ghost-btn" onclick="renderSort()">↺ Làm lại</button></div>`;
  bindBankTokens();
}
function bindBankTokens(root=$('#q-sort')){$$('.token',root).forEach(t=>{if(t.dataset.bound)return;t.dataset.bound='1';t.onclick=()=>{const i=+t.dataset.i;sortState[i].push(t.dataset.word);t.remove();const x=document.createElement('button');x.className='token';x.textContent=t.dataset.word;x.dataset.word=t.dataset.word;x.onclick=()=>{const pos=[...x.parentNode.children].indexOf(x);sortState[i].splice(pos,1);x.remove();renderOneBank(i)};$('#sa-'+i).appendChild(x)}})}
function renderOneBank(i){const q=L.sorts[i],used=[...sortState[i]],remaining=[...q.words];used.forEach(w=>{const x=remaining.indexOf(w);if(x>=0)remaining.splice(x,1)});$('#sb-'+i).innerHTML=remaining.map(w=>`<button class="token" data-i="${i}" data-word="${esc(w)}">${esc(w)}</button>`).join('');bindBankTokens($('#sb-'+i))}
function checkSort(){let ok=0;L.sorts.forEach((q,i)=>{const got=sortState[i].join(''),good=norm(got)===norm(q.answer),f=$('#sf-'+i);f.textContent=good?'✅ Đúng':'❌ Đáp án: '+q.answer;f.className='feedback '+(good?'good':'bad');if(good)ok++});setScore(`Sắp xếp câu: ${ok}/${L.sorts.length} · ${Math.round(ok/L.sorts.length*100)}%`)}
function revealSort(){L.sorts.forEach((q,i)=>{sortState[i]=[...q.words];const a=$('#sa-'+i);a.innerHTML='';q.words.forEach(w=>{const x=document.createElement('span');x.className='token';x.textContent=w;a.appendChild(x)});$('#sb-'+i).innerHTML='';const f=$('#sf-'+i);f.textContent='✓ '+q.answer;f.className='feedback good'});setScore('Đã hiển thị đáp án phần sắp xếp câu.')}
function renderPractice(){renderMC();renderFill();renderFix();renderMatch();renderSort()}
function setScore(s){$('#scoreText').textContent=s}
function resetPractice(){renderPractice();setScore('Đã làm mới toàn bộ phần luyện tập.');toast('Đã làm lại bài tập.')}
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
  $$('.quiz-tab').forEach(b=>b.onclick=()=>{$$('.quiz-tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');$$('.quiz-pane').forEach(p=>p.classList.toggle('active',p.id==='q-'+b.dataset.q))});
  document.addEventListener('click',e=>{if(!e.target.closest('.lesson-menu-wrap'))closeLessonMenu()});
}

initGate();markVisited();setupHeader();setupTabs();renderVocabQuick();renderVocab();$('#vSearch').addEventListener('input',e=>renderVocab(e.target.value));renderText();renderGrammar();$('#hanziChip').textContent=getLessonHanzi().length+' chữ';renderPractice();activateSection(activeSection,false,false);
