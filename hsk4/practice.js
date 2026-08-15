/* HSK4 下 textbook-vocabulary contract.
 * Important visual recheck of the textbook p.160: the starred L19 word is “吵 chǎo = ồn ào”, NOT “炒”.
 * All 10 starred/above-level words are already among the 311 numbered lesson entries; 10 proper names are separate.
 * Therefore the complete textbook lexical total is 311 + 10 proper names = 321 unique items.
 */
const HSK4L_EXPECTED_COUNTS={11:30,12:32,13:32,14:32,15:31,16:31,17:29,18:32,19:32,20:30};
const HSK4L_SUPPLEMENT={12:['达到','事半功倍'],15:['闹钟'],16:['代表'],17:['美人鱼'],18:['方式','抓'],19:['吵','舞蹈'],20:['怪']};
const HSK4L_PROPER={
  11:[{zh:'大卫',py:'Dàwèi',vn:'David (tên người)'}],
  13:[{zh:'广东省',py:'Guǎngdōng Shěng',vn:'tỉnh Quảng Đông, Trung Quốc'}],
  17:[{zh:'安娜',py:'Ānnà',vn:'Anna (tên người)'},{zh:'香山',py:'Xiāngshān',vn:'Hương Sơn (Bắc Kinh)'},{zh:'长城',py:'Chángchéng',vn:'Vạn Lý Trường Thành'},{zh:'六一儿童节',py:'Liùyī Értóngjié',vn:'Ngày Quốc tế Thiếu nhi 1/6'},{zh:'亚洲',py:'Yàzhōu',vn:'châu Á'}],
  20:[{zh:'首都机场',py:'Shǒudū Jīchǎng',vn:'Sân bay Quốc tế Thủ đô Bắc Kinh'},{zh:'长江',py:'Chángjiāng',vn:'Trường Giang / sông Dương Tử'},{zh:'长江大桥',py:'Chángjiāng Dàqiáo',vn:'Cầu Trường Giang (Nam Kinh trong ngữ cảnh giáo trình)'}]
};
function applyHSK4LowerVocabContract(){
  const lessons=window.HSK4_LOWER_LESSONS||[];
  if(!Array.isArray(lessons)||lessons.length!==10)throw new Error('HSK4 下 vocab contract: lesson data missing');
  const missing=[];
  for(const L of lessons){
    const expected=HSK4L_EXPECTED_COUNTS[L.id];
    if(L.vocab?.length!==expected)throw new Error(`HSK4 下 Bài ${L.id}: số sinh từ ${L.vocab?.length||0}, cần ${expected}`);
    const ss=new Set(HSK4L_SUPPLEMENT[L.id]||[]);
    for(const w of L.vocab||[]){
      w.kind=ss.has(w.zh)?'supplement':'core';
      w.kind_label=w.kind==='supplement'?'★ 教材补充/超纲词 · Từ bổ sung':'生词 · Từ mới';
      if(!w.py)w.py=pyOf(w.zh);
    }
    for(const zh of ss)if(!(L.vocab||[]).some(w=>w.zh===zh))missing.push(`L${L.id}:★${zh}`);
    L.properNouns=(HSK4L_PROPER[L.id]||[]).map(x=>({...x,kind:'proper',kind_label:'专有名词 · Danh từ riêng',pos:'专名',posLabel:'专有名词 · Danh từ riêng'}));
    L.textbookVocab=[...(L.vocab||[]),...L.properNouns];
    const seen=new Set();for(const w of L.textbookVocab){if(seen.has(w.zh))throw new Error(`HSK4 下 Bài ${L.id}: trùng mục từ ${w.zh}`);seen.add(w.zh)}
  }
  const numbered=lessons.reduce((n,L)=>n+L.vocab.length,0);
  const supplement=lessons.reduce((n,L)=>n+L.vocab.filter(w=>w.kind==='supplement').length,0);
  const proper=lessons.reduce((n,L)=>n+L.properNouns.length,0);
  const total=lessons.reduce((n,L)=>n+L.textbookVocab.length,0);
  const l19=lessons.find(L=>L.id===19),hasChao=!!l19?.vocab?.some(w=>w.zh==='吵'),wrongChao=!!l19?.vocab?.some(w=>w.zh==='炒');
  const ok=!missing.length&&numbered===311&&supplement===10&&proper===10&&total===321&&hasChao&&!wrongChao;
  window.__HSK4L_VOCAB_CONTRACT={version:'2026-08-15-vocab-2',ok,numbered,supplement,proper,total,missing,l19StarWord:'吵',hasChao,wrongChao};
  document.documentElement.dataset.hsk4LowerVocabContract=ok?'ok':'error';
  if(!ok)throw new Error(`HSK4 下 vocab contract failed: ${JSON.stringify(window.__HSK4L_VOCAB_CONTRACT)}`);
}
applyHSK4LowerVocabContract();

const _hsk4lValidateData=validateData;
validateData=function(){const A=_hsk4lValidateData();applyHSK4LowerVocabContract();return A};

const _hsk4lRenderHome=renderHome;
renderHome=function(){
  _hsk4lRenderHome();
  const A=window.HSK4_LOWER_LESSONS,total=A.reduce((n,L)=>n+L.textbookVocab.length,0);
  const stat=$('#wordStat');if(stat){stat.textContent=total;const lab=stat.nextElementSibling;if(lab)lab.textContent='Mục từ giáo trình'}
  $$('#lessonGrid .lesson-card').forEach((card,i)=>{
    const Lx=A[i],meta=$('.lesson-meta-line',card);if(!Lx||!meta)return;
    const proper=Lx.properNouns.length,supp=Lx.vocab.filter(w=>w.kind==='supplement').length;
    meta.innerHTML=`<span>${Lx.textbookVocab.length} 教材词汇</span><span>${Lx.vocab.length} 生词</span>${supp?`<span>${supp} ★补充</span>`:''}${proper?`<span>${proper} 专名</span>`:''}`;
  });
};
const _hsk4lRenderLessonShell=renderLessonShell;
renderLessonShell=function(){
  _hsk4lRenderLessonShell();
  const total=L.textbookVocab.length,proper=L.properNouns.length,supp=L.vocab.filter(w=>w.kind==='supplement').length;
  $('#vocabCount').textContent=total;
  $('#vocabChip').textContent=`${total} mục · ${L.vocab.length} sinh từ${supp?` · ${supp} ★`:''}${proper?` · ${proper} tên riêng`:''}`;
  const listen=$('#vocab .tool-row button[onclick="speakAllVocab()"]');if(listen)listen.textContent='🔊 Nghe toàn bộ';
};

function ensureHSK4LVocabStyle(){
  if(document.getElementById('hsk4lVocabContractStyle'))return;
  const s=document.createElement('style');s.id='hsk4lVocabContractStyle';s.textContent=`
    .hsk4l-kind{display:inline-flex;margin-top:7px;padding:3px 7px;border-radius:999px;font-size:10px;font-weight:800;background:#f2eee6;color:#6a4a24}.hsk4l-kind.supplement{background:#fff1cf;color:#8a5a00}.hsk4l-kind.proper{background:#f5e8e9;color:#7c252b}
  `;document.head.appendChild(s);
}
function hsk4lWordPy(w){return String(w?.py||pyOf(w?.zh||''))}
function hsk4lPos(w){return String(w?.posLabel||window.HSK4_POS_LABELS?.[w?.pos]||w?.pos||'')}
renderVocab=function(){
  ensureHSK4LVocabStyle();
  const search=$('#vSearch'),grid=$('#vocabGrid');
  function draw(term=''){
    const t=String(term||'').trim().toLowerCase();
    const items=(L.textbookVocab||L.vocab).filter(w=>!t||[w.zh,hsk4lWordPy(w),w.vn,w.kind,hsk4lPos(w)].some(x=>String(x||'').toLowerCase().includes(t)));
    grid.innerHTML=items.map(w=>{
      const baseIndex=L.vocab.indexOf(w),isProper=w.kind==='proper',label=isProper?'专名':baseIndex+1;
      return `<article class="vcard" data-key="${esc(w.zh)}"><div class="vinner"><div class="vface vfront"><div class="vno">${label}</div><div class="vzh">${esc(w.zh)}</div><div class="vpy">${esc(hsk4lWordPy(w))}</div>${hsk4lPos(w)?`<div class="pos-badge">${esc(hsk4lPos(w))}</div>`:''}${w.kind==='supplement'?'<span class="hsk4l-kind supplement">★ 教材补充/超纲词</span>':isProper?'<span class="hsk4l-kind proper">专有名词</span>':''}<div class="vactions"><button class="tiny listen" aria-label="Nghe ${esc(w.zh)}">🔊</button><button class="tiny flip">↻</button></div></div><div class="vface vback"><div class="vvn">${esc(w.vn)}</div><div class="vpy">${esc(hsk4lWordPy(w))}</div>${hsk4lPos(w)?`<div class="pos-badge">${esc(hsk4lPos(w))}</div>`:''}<small>${isProper?'Danh từ riêng trong giáo trình':'Chạm để lật lại'}</small></div></div></article>`;
    }).join('');
    $$('.vcard',grid).forEach(card=>{const w=(L.textbookVocab||L.vocab).find(x=>x.zh===card.dataset.key);card.onclick=ev=>{if(ev.target.closest('.listen')){ev.stopPropagation();speak(w.zh);return}card.classList.toggle('flipped');showWordDetail(w)};$('.flip',card)?.addEventListener('click',ev=>{ev.stopPropagation();card.classList.toggle('flipped');showWordDetail(w)})});
    if(items[0])showWordDetail(items[0]);else $('#wordPanel').innerHTML='<div class="source-note">Không tìm thấy từ phù hợp.</div>';
  }
  search.oninput=()=>draw(search.value);draw(search.value||'');
};

speakAllVocab=function(){
  if(!('speechSynthesis' in window)){toast('Trình duyệt chưa hỗ trợ phát âm.');return}
  let i=0;const words=(L.textbookVocab||L.vocab).map(x=>x.zh);
  function next(){if(i>=words.length)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(words[i++]);u.lang='zh-CN';u.rate=.8;u.onend=()=>setTimeout(next,150);speechSynthesis.speak(u)}next();
};

let selectedMC={},selectedGrammar={},selectedRead={};
function allVocab(){return window.HSK4_LOWER_LESSONS.flatMap(x=>(x.textbookVocab||x.vocab).filter(v=>v.kind!=='proper'))}
function allGrammar(){return window.HSK4_LOWER_LESSONS.flatMap(x=>x.grammar)}
function renderPractice(){
  $('#basicPractice').innerHTML=`<div class="quiz-tabs"><button class="quiz-tab active" data-q="mc">Từ vựng</button><button class="quiz-tab" data-q="fill">Điền từ</button><button class="quiz-tab" data-q="grammar">Ngữ pháp</button><button class="quiz-tab" data-q="read">Đọc hiểu</button></div><div class="quiz-pane active" id="q-mc"></div><div class="quiz-pane" id="q-fill"></div><div class="quiz-pane" id="q-grammar"></div><div class="quiz-pane" id="q-read"></div><div class="scorebar" id="scoreText">Làm bài và nộp để xem đáp án + giải thích.</div>`;
  $$('.quiz-tab',$('#basicPractice')).forEach(b=>b.onclick=()=>{$$('.quiz-tab',$('#basicPractice')).forEach(x=>x.classList.toggle('active',x===b));$$('.quiz-pane',$('#basicPractice')).forEach(x=>x.classList.toggle('active',x.id==='q-'+b.dataset.q))});
  renderMC();renderFill();renderGrammarQuiz();renderReadQuiz();renderAdvanced();
}
function optionCards(qs,key,target,checker){window[key]=qs;const selected=key==='_mcQs'?selectedMC:key==='_gQs'?selectedGrammar:selectedRead;selectedMC=key==='_mcQs'?{}:selectedMC;selectedGrammar=key==='_gQs'?{}:selectedGrammar;selectedRead=key==='_rQs'?{}:selectedRead;const state=key==='_mcQs'?selectedMC:key==='_gQs'?selectedGrammar:selectedRead;
  $(target).innerHTML=qs.map((q,i)=>`<div class="qcard" data-i="${i}"><div class="qmeta"><span>Câu ${i+1}/${qs.length}</span></div><div class="qtitle">${esc(q.q)}</div><div class="opts">${q.opts.map(o=>`<button class="opt" data-val="${esc(o)}">${esc(o)}</button>`).join('')}</div><div class="feedback"></div></div>`).join('')+`<div class="quiz-actions"><button class="primary-btn" onclick="${checker}()">✓ Nộp bài</button></div>`;
  $$('.qcard',$(target)).forEach((c,i)=>$$('.opt',c).forEach(b=>b.onclick=()=>{if(c.dataset.checked)return;$$('.opt',c).forEach(x=>x.classList.remove('sel'));b.classList.add('sel');state[i]=b.dataset.val}));
}
function renderMC(){const pool=allVocab(),qs=L.vocab.slice(0,8).map(w=>{const ds=shuffle(unique(pool.filter(x=>x.zh!==w.zh).map(x=>x.vn))).slice(0,3);return{q:`“${w.zh}” (${w.py||pyOf(w.zh)}) nghĩa là gì?`,opts:shuffle([w.vn,...ds]),ans:w.vn,why:`${w.zh} = ${w.vn}.`}});optionCards(qs,'_mcQs','#q-mc','checkMC')}
function checkOptions(target,qs,state,label){let ok=0;$$('.qcard',$(target)).forEach((c,i)=>{const q=qs[i],chosen=state[i],good=chosen===q.ans;c.dataset.checked='1';$$('.opt',c).forEach(b=>{b.disabled=true;if(b.dataset.val===q.ans)b.classList.add('correct');if(b.classList.contains('sel')&&!good)b.classList.add('wrong')});if(good)ok++;const f=$('.feedback',c);f.innerHTML=`<div>${good?'✅ Đúng':chosen?'❌ Chưa đúng':'⚠️ Chưa chọn'} · Đáp án: <b>${esc(q.ans)}</b></div><div class="answer-explain"><b>解析 · Giải thích</b><div>${esc(q.why)}</div></div>`;f.className='feedback '+(good?'good':'bad')});$('#scoreText').textContent=`${label}: ${ok}/${qs.length} · ${Math.round(ok/qs.length*100)}%`}
function checkMC(){checkOptions('#q-mc',window._mcQs,selectedMC,'Từ vựng')}
function renderFill(){const items=L.vocab.slice(8,13);$('#q-fill').innerHTML=items.map((w,i)=>`<div class="fill-card"><b>${i+1}.</b> Viết từ tiếng Trung cho “${esc(w.vn)}”: <input class="fill-input" data-i="${i}" autocomplete="off"><div class="feedback" id="fillfb-${i}"></div></div>`).join('')+`<div class="quiz-actions"><button class="primary-btn" onclick="checkFill()">✓ Kiểm tra</button></div>`;window._fillItems=items}
function checkFill(){let ok=0;$$('.fill-input',$('#q-fill')).forEach(inp=>{const w=window._fillItems[+inp.dataset.i],good=norm(inp.value)===norm(w.zh);if(good)ok++;inp.classList.toggle('good',good);inp.classList.toggle('bad',!good);const f=$('#fillfb-'+inp.dataset.i);f.innerHTML=`${good?'✅':'❌'} Đáp án: <b>${esc(w.zh)}</b> ${esc(w.py||pyOf(w.zh))}`;f.className='feedback '+(good?'good':'bad')});$('#scoreText').textContent=`Điền từ: ${ok}/${window._fillItems.length} · ${Math.round(ok/window._fillItems.length*100)}%`}
function renderGrammarQuiz(){const pool=allGrammar();const qs=L.grammar.map(g=>{const ds=shuffle(unique(pool.filter(x=>x.title!==g.title).map(x=>x.vn_title))).slice(0,3);return{q:`Cấu trúc “${g.title}” trong bài này chủ yếu dùng thế nào?`,opts:shuffle([g.vn_title,...ds]),ans:g.vn_title,why:`${g.desc} Mẫu: ${g.structure}`}});optionCards(qs,'_gQs','#q-grammar','checkGrammarQuiz')}
function checkGrammarQuiz(){checkOptions('#q-grammar',window._gQs,selectedGrammar,'Ngữ pháp')}
function renderReadQuiz(){const qs=L.scenes.map((s,i)=>{const correct=pointsOf(s)[0],ds=shuffle(L.scenes.filter((_,j)=>j!==i).map(x=>pointsOf(x)[0])).slice(0,3);return{q:`Câu nào phù hợp với ý chính của ${s.title} – ${s.vn_title}?`,opts:shuffle([correct,...ds]),ans:correct,why:s.summary}});optionCards(qs,'_rQs','#q-read','checkReadQuiz')}
function checkReadQuiz(){checkOptions('#q-read',window._rQs,selectedRead,'Đọc hiểu')}
function renderAdvanced(){
  const qs=L.grammar.map((g,i)=>{const ex=g.examples[i%g.examples.length],others=shuffle(L.grammar.filter(x=>x!==g).map(x=>x.title)).slice(0,3);return{q:`Câu “${ex}” minh họa điểm ngôn ngữ nào?`,opts:shuffle([g.title,...others]),ans:g.title,why:`${g.vn_title}: ${g.desc}`}});
  $('#advancedPractice').innerHTML=`<div class="advanced-intro"><div><span class="advanced-badge">进阶测试 · NÂNG CAO</span><h3>Nhận diện cấu trúc trong ngữ cảnh</h3><p>5 câu bám đúng 5 điểm ngôn ngữ của Bài ${id}.</p></div><div class="advanced-count">5 câu</div></div><div class="advanced-score" id="advancedScore">Làm đủ câu rồi bấm “Nộp bài nâng cao”.</div>`+qs.map((q,i)=>`<div class="qcard advanced-card" data-i="${i}"><div class="qmeta"><span>Nâng cao ${i+1}/5</span><span class="difficulty-chip">HSK 4</span></div><div class="qtitle">${esc(q.q)}</div><div class="opts">${q.opts.map(o=>`<button class="opt" data-val="${esc(o)}">${esc(o)}</button>`).join('')}</div><div class="feedback"></div></div>`).join('')+`<div class="quiz-actions"><button class="primary-btn" onclick="checkAdvanced()">✓ Nộp bài nâng cao</button></div>`;window._advQs=qs;window._advSel={};$$('.advanced-card',$('#advancedPractice')).forEach((c,i)=>$$('.opt',c).forEach(b=>b.onclick=()=>{if(c.dataset.checked)return;$$('.opt',c).forEach(x=>x.classList.remove('sel'));b.classList.add('sel');window._advSel[i]=b.dataset.val}))}
function checkAdvanced(){let ok=0;$$('.advanced-card',$('#advancedPractice')).forEach((c,i)=>{const q=window._advQs[i],chosen=window._advSel[i],good=chosen===q.ans;c.dataset.checked='1';$$('.opt',c).forEach(b=>{b.disabled=true;if(b.dataset.val===q.ans)b.classList.add('correct');if(b.classList.contains('sel')&&!good)b.classList.add('wrong')});if(good)ok++;const f=$('.feedback',c);f.innerHTML=`<div>${good?'✅ Đúng':'❌ Chưa đúng'} · <b>${esc(q.ans)}</b></div><div class="answer-explain"><b>解析</b><div>${esc(q.why)}</div></div>`;f.className='feedback '+(good?'good':'bad')});$('#advancedScore').textContent=`Nâng cao: ${ok}/5 · ${ok*20}%`}
function boot(){
  try{validateData();initGate();if($('#lessonGrid'))renderHome();if($('#lessonTitle'))initLesson();document.documentElement.dataset.hsk4Runtime='ok';window.__HSK4_LOWER_RUNTIME_OK=true;window.__HSK4_LOWER_DIAGNOSTICS={ok:true,lessons:10,words:window.HSK4_LOWER_LESSONS.reduce((n,L)=>n+(L.textbookVocab||L.vocab).length,0),numberedWords:window.HSK4_LOWER_LESSONS.reduce((n,L)=>n+L.vocab.length,0),page:$('#lessonGrid')?'home':'lesson',vocabContract:window.__HSK4L_VOCAB_CONTRACT};console.info('[HSK4 Lower] OK',window.__HSK4_LOWER_DIAGNOSTICS)}catch(e){showFatal(e)}
}
if(!window.HSK4_BOOT_DISABLE_AUTO){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot()}
document.write('<script src="../assets/session-auth.js?v=20260815-1"><\/script>');
