function grammarForText(text){
  const s=String(text||'');
  for(const g of L.grammar){
    const quoted=[...g.title.matchAll(/“([^”]+)”/g)].map(m=>m[1]).filter(x=>x.length<=8);
    if(quoted.some(k=>k&&s.includes(k)))return g;
    if(g.title.includes('结果补语')&&/[完懂到错]/.test(s))return g;
    if(g.title.includes('量词的重叠')&&/(天天|家家|个个)/.test(s))return g;
    if(g.title.includes('“的”字短语')&&s.includes('的'))return g;
    if(g.title.includes('状态/程度补语')&&s.includes('得'))return g;
    if(g.title.includes('动词/动词短语作定语')&&s.includes('的'))return g;
    if(g.title.includes('动作的状态')&&/(要|快要|就要).+了/.test(s))return g;
  }
  return null;
}
function explanationHtml(q,answer,sentence=''){
  const parts=[],v=L.vocab.find(x=>x.zh===answer);
  if(v)parts.push(`<div><b>${esc(v.zh)}</b> <span class="explain-py">${esc(v.py)}</span> = ${esc(v.vn)}.</div>`);
  const text=(sentence||q?.q||'').replace('______',answer||''),g=grammarForText(text+' '+(answer||''));
  if(g)parts.push(`<div><span class="explain-rule">${esc(g.title)}</span> ${esc(g.desc)}</div>`);
  if(q?.hint)parts.push(`<div>💡 ${esc(q.hint)}</div>`);
  if(!parts.length)parts.push(`<div>Đáp án đúng là <b>${esc(answer)}</b>; câu này bám trực tiếp từ vựng và mẫu câu của Bài ${id}.</div>`);
  return `<div class="answer-explain"><b>解析 · Giải thích</b>${parts.join('')}</div>`;
}
function renderMC(){
  mcSelected={};
  $('#q-mc').innerHTML=L.mc.map((q,qi)=>`<div class="qcard" data-qi="${qi}"><div class="qmeta"><span class="qindex">Câu ${qi+1}/${L.mc.length}</span>${q.hint?`<button class="hint-btn" onclick="toggleHint(${qi})">💡 Gợi ý</button><span class="hint-text" id="mh-${qi}">${esc(q.hint)}</span>`:''}</div><div class="qtitle">${esc(q.q)}</div><div class="opts">${shuffle(q.opts).map(o=>`<button class="opt" data-val="${esc(o)}">${esc(o)}</button>`).join('')}</div><div class="feedback"></div></div>`).join('')+`<div class="quiz-actions"><button class="primary-btn" onclick="checkMC()">✓ Nộp bài</button><button class="ghost-btn" onclick="revealMC()">👁 Xem đáp án +解析</button><button class="ghost-btn" onclick="renderMC()">↺ Làm lại</button></div>`;
  $$('.qcard',$('#q-mc')).forEach((c,qi)=>$$('.opt',c).forEach(b=>b.onclick=()=>{if(c.dataset.checked)return;$$('.opt',c).forEach(x=>x.classList.remove('sel'));b.classList.add('sel');mcSelected[qi]=b.dataset.val}));
}
function checkMC(){
  let ok=0;$$('.qcard',$('#q-mc')).forEach((c,qi)=>{c.dataset.checked='1';const q=L.mc[qi],ans=q.ans,good=mcSelected[qi]===ans;$$('.opt',c).forEach(b=>{b.disabled=true;if(b.dataset.val===ans)b.classList.add('correct');if(b.classList.contains('sel')&&b.dataset.val!==ans)b.classList.add('wrong')});if(good)ok++;const fb=$('.feedback',c);fb.innerHTML=`<div>${good?'✅ Đúng':(mcSelected[qi]?'❌ Chưa đúng':'⚠️ Chưa chọn')} · Đáp án: <b>${esc(ans)}</b></div>${explanationHtml(q,ans)}`;fb.className='feedback '+(good?'good':'bad')});setScore(`Trắc nghiệm cơ bản: ${ok}/${L.mc.length} · ${Math.round(ok/L.mc.length*100)}%`);
}
function revealMC(){$$('.qcard',$('#q-mc')).forEach((c,qi)=>{c.dataset.checked='1';const q=L.mc[qi],ans=q.ans;$$('.opt',c).forEach(b=>{b.disabled=true;b.classList.toggle('correct',b.dataset.val===ans)});const fb=$('.feedback',c);fb.innerHTML=`<div>✓ Đáp án: <b>${esc(ans)}</b></div>${explanationHtml(q,ans)}`;fb.className='feedback good'});setScore('Đã hiển thị đáp án và解析 phần trắc nghiệm.')}
function renderFill(){
  $('#q-fill').innerHTML=L.fills.map((q,i)=>`<div class="fill-row fill-card" data-i="${i}"><div>${i+1}. ${esc(q.q).replace('______',`<input class="fill-input" data-i="${i}" autocomplete="off">`)}</div>${q.hint?`<span class="fill-hint">💡 ${esc(q.hint)}</span>`:''}<div class="fill-feedback" id="fill-fb-${i}"></div></div>`).join('')+`<div class="quiz-actions"><button class="primary-btn" onclick="checkFill()">✓ Kiểm tra</button><button class="ghost-btn" onclick="revealFill()">👁 Đáp án +解析</button><button class="ghost-btn" onclick="renderFill()">↺ Làm lại</button></div>`;
}
function checkFill(){let ok=0;$$('.fill-input').forEach(inp=>{const q=L.fills[+inp.dataset.i],ans=q.ans,good=norm(inp.value)===norm(ans);inp.classList.toggle('good',good);inp.classList.toggle('bad',!good);if(good)ok++;const f=$('#fill-fb-'+inp.dataset.i);f.innerHTML=`<div>${good?'✅ Đúng':'❌ Chưa đúng'} · Đáp án: <b>${esc(ans)}</b></div>${explanationHtml(q,ans,q.q.replace('______',ans))}`;f.className='fill-feedback show '+(good?'good':'bad')});setScore(`Điền từ cơ bản: ${ok}/${L.fills.length} · ${Math.round(ok/L.fills.length*100)}%`)}
function revealFill(){$$('.fill-input').forEach(inp=>{const q=L.fills[+inp.dataset.i];inp.value=q.ans;inp.classList.add('good');inp.classList.remove('bad');const f=$('#fill-fb-'+inp.dataset.i);f.innerHTML=`<div>✓ Đáp án: <b>${esc(q.ans)}</b></div>${explanationHtml(q,q.ans,q.q.replace('______',q.ans))}`;f.className='fill-feedback show good'});setScore('Đã hiển thị đáp án và解析 phần điền từ.')}
function checkFix(){let ok=0;$$('.fix-input').forEach(inp=>{const q=L.fixes[+inp.dataset.i],good=norm(inp.value)===norm(q.correct);inp.classList.toggle('good',good);inp.classList.toggle('bad',!good);const f=$('#ff-'+inp.dataset.i);f.innerHTML=`<div>${good?'✅ Đúng':'❌ Chưa đúng'} · Câu đúng: <b>${esc(q.correct)}</b></div><div class="answer-explain"><b>解析 · Giải thích</b><div>${esc(q.why)}</div></div>`;f.className='feedback '+(good?'good':'bad');if(good)ok++});setScore(`Sửa câu cơ bản: ${ok}/${L.fixes.length} · ${Math.round(ok/L.fixes.length*100)}%`)}
function revealFix(){$$('.fix-input').forEach(inp=>{const q=L.fixes[+inp.dataset.i];inp.value=q.correct;inp.classList.add('good');inp.classList.remove('bad');const f=$('#ff-'+inp.dataset.i);f.innerHTML=`<div>✓ ${esc(q.correct)}</div><div class="answer-explain"><b>解析 · Giải thích</b><div>${esc(q.why)}</div></div>`;f.className='feedback good'});setScore('Đã hiển thị đáp án và解析 phần sửa câu.')}
function selectMatch(el,words){
  if(el.classList.contains('matched'))return;const col=el.dataset.col;$$(`#m-${col} .match-item`).forEach(x=>x.classList.remove('sel'));el.classList.add('sel');matchState[col]=el.dataset.val;
  if(matchState.zh&&matchState.py&&matchState.vn){const w=words.find(x=>x.zh===matchState.zh),ok=w&&w.py===matchState.py&&w.vn.split(/[;,]/)[0]===matchState.vn;if(ok){['zh','py','vn'].forEach(k=>{const e=$(`#m-${k} .match-item.sel`);e.classList.remove('sel');e.classList.add('matched')});$('#matchFeedback').innerHTML=`✅ Chính xác<div class="answer-explain"><b>解析 · Giải thích</b><div><b>${esc(w.zh)}</b> <span class="explain-py">${esc(w.py)}</span> = ${esc(w.vn)}.</div></div>`;$('#matchFeedback').className='feedback good'}else{$('#matchFeedback').textContent='❌ Chưa đúng, thử lại.';$('#matchFeedback').className='feedback bad';$$('.match-item.sel').forEach(x=>x.classList.remove('sel'))}matchState={zh:null,py:null,vn:null};const done=$$('.match-item.matched').length/3;$('#matchProgress').textContent=`Đã nối ${done}/${words.length}`;if(done===words.length)setScore(`Nối cột cơ bản: ${words.length}/${words.length} · 100%`)}
}
function checkSort(){let ok=0;L.sorts.forEach((q,i)=>{const got=sortState[i].join(''),good=norm(got)===norm(q.answer),f=$('#sf-'+i);f.innerHTML=`<div>${good?'✅ Đúng':'❌ Chưa đúng'} · Đáp án: <b>${esc(q.answer)}</b></div>${explanationHtml(q,q.answer,q.answer)}`;f.className='feedback '+(good?'good':'bad');if(good)ok++});setScore(`Sắp xếp câu cơ bản: ${ok}/${L.sorts.length} · ${Math.round(ok/L.sorts.length*100)}%`)}
function revealSort(){L.sorts.forEach((q,i)=>{sortState[i]=[...q.words];const a=$('#sa-'+i);a.innerHTML='';q.words.forEach(w=>{const x=document.createElement('span');x.className='token';x.textContent=w;a.appendChild(x)});$('#sb-'+i).innerHTML='';const f=$('#sf-'+i);f.innerHTML=`<div>✓ ${esc(q.answer)}</div>${explanationHtml(q,q.answer,q.answer)}`;f.className='feedback good'});setScore('Đã hiển thị đáp án và解析 phần sắp xếp câu.')}
