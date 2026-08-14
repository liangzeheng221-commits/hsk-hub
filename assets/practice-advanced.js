let advancedSelected={},advancedDataPromise=null;
function ensurePracticeLevelUI(){
  const practice=$('#practice');
  if(!practice||$('#practiceLevelTabs'))return;
  const note=$('.practice-note',practice),level=document.createElement('div');
  level.id='practiceLevelTabs';level.className='practice-level-tabs';
  level.innerHTML=`<button class="practice-level-btn active" data-level="basic">基础测试 · Cơ bản<small>Giữ nguyên toàn bộ bài tập hiện có</small></button><button class="practice-level-btn advanced" data-level="advanced">进阶测试 · Nâng cao<small>Ngữ cảnh + ngữ pháp vận dụng</small></button>`;
  const basic=document.createElement('div');basic.id='basicPractice';
  const nodes=[$('.quiz-tabs',practice),...$$('.quiz-pane',practice),$('.scorebar',practice)].filter(Boolean);nodes.forEach(n=>basic.appendChild(n));
  const adv=document.createElement('div');adv.id='advancedPractice';note.after(level,basic,adv);
  if(!document.querySelector('link[data-advanced-css]')){const link=document.createElement('link');link.rel='stylesheet';link.href='assets/advanced.css?v=11';link.dataset.advancedCss='1';document.head.appendChild(link)}
}
function loadAdvancedScript(src){return new Promise((resolve,reject)=>{const el=document.createElement('script');el.src=src;el.onload=resolve;el.onerror=()=>reject(new Error('Không tải được '+src));document.head.appendChild(el)})}
function advancedQuestions(){return (window.HSK2_ADVANCED&&window.HSK2_ADVANCED[id])||[]}
function ensureAdvancedData(){
  if(advancedQuestions().length)return Promise.resolve(advancedQuestions());
  if(!advancedDataPromise){const part=Math.ceil(id/3);advancedDataPromise=loadAdvancedScript(`data/advanced-${part}.js?v=11`).then(()=>{const qs=advancedQuestions();if(!qs.length)throw new Error('Dữ liệu bài nâng cao không đầy đủ.');return qs})}
  return advancedDataPromise;
}
function renderAdvanced(){
  advancedSelected={};const qs=advancedQuestions(),box=$('#advancedPractice');if(!box)return;
  if(!qs.length){box.innerHTML='<div class="practice-note">Đang tải bài nâng cao…</div>';return}
  box.innerHTML=`<div class="advanced-intro"><div><span class="advanced-badge">进阶测试 · NÂNG CAO</span><h3>综合运用 · Vận dụng tổng hợp</h3><p>Câu hỏi khó hơn phần cơ bản, nhưng vẫn chỉ dùng từ vựng và ngữ pháp HSK 2 của bài hiện tại.</p></div><div class="advanced-count">${qs.length} câu</div></div><div id="advancedScore" class="advanced-score">Làm đủ câu rồi bấm “Nộp bài nâng cao”.</div>`+
  qs.map((q,i)=>`<div class="qcard advanced-card" data-ai="${i}"><div class="qmeta"><span class="qindex">Nâng cao ${i+1}/${qs.length}</span><span class="difficulty-chip">★★</span></div><div class="qtitle">${esc(q.q)}</div><div class="opts">${shuffle(q.opts).map(o=>`<button class="opt adv-opt" data-val="${esc(o)}">${esc(o)}</button>`).join('')}</div><div class="feedback adv-feedback"></div></div>`).join('')+
  `<div class="quiz-actions advanced-actions"><button class="primary-btn" onclick="checkAdvanced()">✓ Nộp bài nâng cao</button><button class="ghost-btn" onclick="renderAdvanced()">↺ Làm lại</button></div>`;
  $$('.advanced-card',box).forEach((c,i)=>$$('.adv-opt',c).forEach(b=>b.onclick=()=>{if(c.dataset.checked)return;$$('.adv-opt',c).forEach(x=>x.classList.remove('sel'));b.classList.add('sel');advancedSelected[i]=b.dataset.val}));
}
function checkAdvanced(){
  const qs=advancedQuestions();let ok=0,answered=0;
  $$('.advanced-card',$('#advancedPractice')).forEach((c,i)=>{
    const q=qs[i],ans=q.ans,chosen=advancedSelected[i],good=chosen===ans;if(chosen)answered++;if(good)ok++;c.dataset.checked='1';
    $$('.adv-opt',c).forEach(b=>{b.disabled=true;if(b.dataset.val===ans)b.classList.add('correct');if(b.classList.contains('sel')&&b.dataset.val!==ans)b.classList.add('wrong')});
    const g=L.grammar[q.g]||null,fb=$('.adv-feedback',c);
    fb.innerHTML=`<div class="adv-result">${good?'✅ Đúng':(chosen?'❌ Chưa đúng':'⚠️ Chưa chọn')} · Đáp án: <b>${esc(ans)}</b></div><div class="answer-explain advanced-explain"><b>解析 · Giải thích</b>${g?`<div><span class="explain-rule">${esc(g.title)}</span> ${esc(g.desc)}</div>`:''}<div class="answer-context">Trong câu này, lựa chọn <b>${esc(ans)}</b> phù hợp với đúng trật tự và cách dùng của mẫu câu trên.</div></div>`;
    fb.className='feedback adv-feedback '+(good?'good':'bad');
  });
  const pct=Math.round(ok/qs.length*100),score=$('#advancedScore');score.innerHTML=`Kết quả nâng cao: <b>${ok}/${qs.length}</b> · ${pct}%${answered<qs.length?` · còn ${qs.length-answered} câu chưa chọn`:''}`;score.className='advanced-score '+(pct>=80?'great':pct>=60?'ok':'need');
}
async function switchPracticeLevel(level){
  const basic=level!=='advanced';$('#basicPractice')?.classList.toggle('hidden-level',!basic);$('#advancedPractice')?.classList.toggle('active-level',!basic);$$('.practice-level-btn').forEach(b=>b.classList.toggle('active',b.dataset.level===level));
  if(!basic){const box=$('#advancedPractice');if(!advancedQuestions().length)box.innerHTML='<div class="practice-note">Đang tải câu hỏi nâng cao…</div>';try{await ensureAdvancedData();if(!box.dataset.ready){box.dataset.ready='1';renderAdvanced()}}catch(e){console.error(e);box.innerHTML='<div class="practice-note" style="border-color:#d59b8f;color:#8b392c">Không tải được bài nâng cao. Vui lòng tải lại trang.</div>'}}
}
function setupPracticeLevels(){ensurePracticeLevelUI();$$('.practice-level-btn').forEach(b=>b.onclick=()=>switchPracticeLevel(b.dataset.level));switchPracticeLevel('basic')}
