/* HSK4 上 textbook-vocabulary contract: 309 numbered items + 9 starred items within them + 15 proper names = 324 textbook lexical items. */
const HSK4U_SUPPLEMENT={1:['星星','亮'],4:['并'],5:['制冷'],6:['会员卡'],7:['既','精神','流血'],9:['面对']};
const HSK4U_PROPER={
  1:[
    {zh:'高',py:'Gāo',vn:'Cao (họ)'},{zh:'李',py:'Lǐ',vn:'Lý (họ)'},{zh:'李进',py:'Lǐ Jìn',vn:'Lý Tiến (tên người)'},{zh:'孙月',py:'Sūn Yuè',vn:'Tôn Nguyệt (tên người)'},{zh:'王静',py:'Wáng Jìng',vn:'Vương Tĩnh (tên người)'}
  ],
  2:[
    {zh:'林',py:'Lín',vn:'Lâm (họ)'},{zh:'马克',py:'Mǎkè',vn:'Mark'},{zh:'上海',py:'Shànghǎi',vn:'Thượng Hải (một thành phố của Trung Quốc)'},{zh:'夏',py:'Xià',vn:'Hạ (họ)'},{zh:'张远',py:'Zhāng Yuǎn',vn:'Trương Viễn (tên người)'}
  ],
  3:[{zh:'马',py:'Mǎ',vn:'Mã (họ)'},{zh:'小雨',py:'Xiǎoyǔ',vn:'Tiểu Vũ (tên người)'}],
  4:[{zh:'王',py:'Wáng',vn:'Vương (họ)'}],
  9:[{zh:'爱迪生',py:'Àidíshēng',vn:'Thomas Alva Edison (1847–1931), nhà phát minh người Mỹ'},{zh:'王红',py:'Wáng Hóng',vn:'Vương Hồng (tên người)'}]
};
function applyHSK4UpperVocabContract(){
  const lessons=window.HSK4_UPPER_LESSONS||[];
  if(!Array.isArray(lessons)||lessons.length!==10)throw new Error('HSK4 上 vocab contract: lesson data missing');
  const missing=[];
  for(const L of lessons){
    const ss=new Set(HSK4U_SUPPLEMENT[L.id]||[]);
    for(const w of L.vocab||[]){
      w.kind=ss.has(w.zh)?'supplement':'core';
      w.kind_label=w.kind==='supplement'?'★ 教材补充/超纲词 · Từ bổ sung':'生词 · Từ mới';
      if(!w.py)w.py=pyOf(w.zh);
    }
    for(const zh of ss)if(!(L.vocab||[]).some(w=>w.zh===zh))missing.push(`L${L.id}:★${zh}`);
    L.properNouns=(HSK4U_PROPER[L.id]||[]).map(x=>({...x,kind:'proper',kind_label:'专有名词 · Danh từ riêng',pos:'专名'}));
    L.textbookVocab=[...(L.vocab||[]),...L.properNouns];
    const seen=new Set();
    for(const w of L.textbookVocab){if(seen.has(w.zh))throw new Error(`HSK4 上 vocab contract: Bài ${L.id} trùng ${w.zh}`);seen.add(w.zh)}
  }
  const numbered=lessons.reduce((n,L)=>n+L.vocab.length,0);
  const supplement=lessons.reduce((n,L)=>n+L.vocab.filter(w=>w.kind==='supplement').length,0);
  const proper=lessons.reduce((n,L)=>n+L.properNouns.length,0);
  const total=lessons.reduce((n,L)=>n+L.textbookVocab.length,0);
  const ok=!missing.length&&numbered===309&&supplement===9&&proper===15&&total===324;
  window.__HSK4U_VOCAB_CONTRACT={version:'2026-08-15-vocab-1',ok,numbered,supplement,proper,total,missing};
  document.documentElement.dataset.hsk4UpperVocabContract=ok?'ok':'error';
  if(!ok)throw new Error(`HSK4 上 vocab contract failed: ${JSON.stringify(window.__HSK4U_VOCAB_CONTRACT)}`);
}
applyHSK4UpperVocabContract();

/* Strengthen the normal validator with the textbook lexical contract. */
const _hsk4uValidateData=validateData;
validateData=function(){const A=_hsk4uValidateData();applyHSK4UpperVocabContract();return A};

/* Homepage and lesson counters use all textbook lexical items, while retaining numbered 生词 inside each lesson. */
const _hsk4uRenderHome=renderHome;
renderHome=function(){
  _hsk4uRenderHome();
  const A=window.HSK4_UPPER_LESSONS,total=A.reduce((n,L)=>n+L.textbookVocab.length,0);
  const stat=$('#wordStat');if(stat){stat.textContent=total;const lab=stat.nextElementSibling;if(lab)lab.textContent='MỤC TỪ GIÁO TRÌNH'}
  $$('#lessonGrid .lesson-card').forEach((card,i)=>{
    const Lx=A[i],meta=$('.lesson-meta-line',card);if(!Lx||!meta)return;
    const proper=Lx.properNouns.length,supp=Lx.vocab.filter(w=>w.kind==='supplement').length;
    meta.innerHTML=`<span>${Lx.textbookVocab.length} 教材词汇</span><span>${Lx.vocab.length} 生词</span>${supp?`<span>${supp} ★补充</span>`:''}${proper?`<span>${proper} 专名</span>`:''}`;
  });
};
const _hsk4uRenderLessonShell=renderLessonShell;
renderLessonShell=function(){
  _hsk4uRenderLessonShell();
  const total=L.textbookVocab.length,proper=L.properNouns.length,supp=L.vocab.filter(w=>w.kind==='supplement').length;
  $('#vocabCount').textContent=total;
  $('#vocabChip').textContent=`${total} mục · ${L.vocab.length} sinh từ${supp?` · ${supp} ★`:''}${proper?` · ${proper} tên riêng`:''}`;
  const listen=$('#vocab .tool-row button[onclick="speakAllVocab()"]');if(listen)listen.textContent='🔊 Nghe toàn bộ';
};

/* Vocabulary cards keep textbook numbered order; starred words get a badge; proper names are a searchable panel in the same vocabulary module. */
function ensureHSK4UVocabStyle(){
  if(document.getElementById('hsk4uVocabContractStyle'))return;
  const s=document.createElement('style');s.id='hsk4uVocabContractStyle';s.textContent=`
    .hsk4u-kind{display:inline-flex;margin-top:7px;padding:3px 7px;border-radius:999px;font-size:10px;font-weight:800;background:#f2eee6;color:#6a4a24}.hsk4u-kind.supplement{background:#fff1cf;color:#8a5a00}
    .hsk4u-proper{margin-top:18px;padding:16px;border:1px solid #ead8cf;border-radius:14px;background:#fffaf7}.hsk4u-proper-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px}.hsk4u-proper-head b{color:#762a2e}.hsk4u-proper-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:9px}.hsk4u-proper-item{border:1px solid #e9d8cf;background:#fff;border-radius:10px;padding:10px;text-align:left;cursor:pointer}.hsk4u-proper-item b,.hsk4u-proper-item span,.hsk4u-proper-item small{display:block}.hsk4u-proper-item b{font-size:18px}.hsk4u-proper-item span{font-size:12px;color:#8d252b;margin-top:3px}.hsk4u-proper-item small{margin-top:5px;line-height:1.35;color:#5f6368}
  `;document.head.appendChild(s);
}
function renderHSK4UProperPanel(term=''){
  ensureHSK4UVocabStyle();document.getElementById('hsk4uProperPanel')?.remove();
  const t=String(term||'').trim().toLowerCase(),items=(L.properNouns||[]).filter(w=>!t||[w.zh,w.py,w.vn].some(x=>String(x||'').toLowerCase().includes(t)));
  if(!items.length)return;
  const panel=document.createElement('section');panel.id='hsk4uProperPanel';panel.className='hsk4u-proper';
  panel.innerHTML=`<div class="hsk4u-proper-head"><b>专有名词 · Danh từ riêng</b><span>${items.length}</span></div><div class="hsk4u-proper-grid">${items.map((w,i)=>`<button type="button" class="hsk4u-proper-item" data-i="${i}"><b>${esc(w.zh)}</b><span>${esc(w.py)}</span><small>${esc(w.vn)}</small></button>`).join('')}</div>`;
  $('#vocabGrid')?.after(panel);
  $$('.hsk4u-proper-item',panel).forEach((b,i)=>b.onclick=()=>{
    const w=items[i],p=$('#wordPanel');
    if(p)p.innerHTML=`<div class="word-detail"><div><div class="word-main zh">${esc(w.zh)}</div><div class="word-py">${esc(w.py)}</div><div class="word-context">专有名词 · ${esc(w.vn)} · Bài ${id}</div></div><button class="primary-btn" id="speakProperWord">🔊 Nghe</button></div><div id="hsk4VocabHanziMount"></div>`;
    $('#speakProperWord')?.addEventListener('click',()=>speak(w.zh));window.HSK4VocabHanzi?.render(w);
  });
}
const _hsk4uRenderVocab=renderVocab;
renderVocab=function(filter=''){
  const r=_hsk4uRenderVocab(filter);ensureHSK4UVocabStyle();
  $$('#vocabGrid .vcard[data-vocab]').forEach(card=>{
    card.querySelector('.hsk4u-kind')?.remove();
    const w=L.vocab[+card.dataset.vocab];if(!w)return;
    if(w.kind==='supplement'){
      const badge=document.createElement('span');badge.className='hsk4u-kind supplement';badge.textContent='★ 教材补充/超纲词';card.querySelector('.vfront')?.appendChild(badge);
    }
  });
  renderHSK4UProperPanel(filter);return r;
};

/* No artificial 36-character cap: all unique characters from the numbered lesson vocabulary can be studied. */
getHanziChars=function(){const chars=[];for(const w of L.vocab){for(const ch of [...w.zh]){if(/[\u3400-\u9fff]/.test(ch)&&!chars.includes(ch))chars.push(ch)}}return chars};

/* “Nghe toàn bộ” now really reads all textbook lexical items, including proper names. */
speakAllVocab=function(){
  if(!('speechSynthesis' in window)){toast('Trình duyệt chưa hỗ trợ phát âm.');return}
  let i=0;const words=(L.textbookVocab||L.vocab).map(x=>x.zh);
  function next(){if(i>=words.length)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(words[i++]);u.lang='zh-CN';u.rate=.8;u.onend=()=>setTimeout(next,150);speechSynthesis.speak(u)}next();
};

function renderPractice(){const b=$('#basicPractice'),a=$('#advancedPractice');if(!b||!a)return;const vocabQuestions=buildVocabQuestions(),grammarQuestions=buildGrammarQuestions();b.innerHTML=`<div class="practice-level-tabs"><button class="practice-level-btn active"><b>基础 · Cơ bản</b><small>10 từ vựng + 5 ngữ pháp</small></button></div><div class="quiz-tabs"><button class="quiz-tab active" data-quiz="vocabQ">Từ vựng</button><button class="quiz-tab" data-quiz="grammarQ">Ngữ pháp</button></div><div class="quiz-pane active" id="vocabQ">${renderMC(vocabQuestions,'v')}</div><div class="quiz-pane" id="grammarQ">${renderMC(grammarQuestions,'g')}</div><div class="quiz-actions"><button class="primary-btn" id="submitBasic">Chấm phần cơ bản</button> <span class="scorebar" id="basicScore">Chưa chấm</span></div>`;$$('.quiz-tab',b).forEach(t=>t.onclick=()=>{$$('.quiz-tab',b).forEach(x=>x.classList.toggle('active',x===t));$$('.quiz-pane',b).forEach(x=>x.classList.toggle('active',x.id===t.dataset.quiz))});$$('.opt',b).forEach(o=>o.onclick=()=>{const q=o.closest('.qcard');$$('.opt',q).forEach(x=>x.classList.remove('sel'));o.classList.add('sel')});$('#submitBasic').onclick=()=>scorePractice(b,[...vocabQuestions,...grammarQuestions],'basicScore');const readQuestions=buildReadingQuestions();a.innerHTML=`<div class="advanced-intro"><div><span class="advanced-badge">进阶 · NÂNG CAO</span><h3>Đọc hiểu + câu hỏi theo giáo trình</h3><p>5 câu nhận diện nội dung bài khoá, sau đó là câu hỏi mở/复述/运用 bám sát bài.</p></div><span class="advanced-count">5 + mở</span></div><div id="readingQuiz">${renderMC(readQuestions,'r')}</div><div class="quiz-actions"><button class="primary-btn" id="submitAdvanced">Chấm đọc hiểu</button> <span class="advanced-score" id="advancedScore">Chưa chấm</span></div><div class="open-practice"><section><h3>根据课文内容回答问题 · Câu hỏi theo bài</h3><ol>${L.comprehension.map(q=>`<li>${esc(q)}</li>`).join('')}</ol></section><section><h3>复述 · Thuật lại</h3><ol>${L.tasks.retell.map(q=>`<li>${esc(q)}</li>`).join('')}</ol></section><section><h3>运用 · Vận dụng</h3><ol>${L.tasks.application.map(q=>`<li>${esc(q)}</li>`).join('')}</ol></section></div>`;$$('.opt',a).forEach(o=>o.onclick=()=>{const q=o.closest('.qcard');$$('.opt',q).forEach(x=>x.classList.remove('sel'));o.classList.add('sel')});$('#submitAdvanced').onclick=()=>scorePractice(a,readQuestions,'advancedScore')}
function buildVocabQuestions(){const pool=L.textbookVocab||L.vocab;const picks=seededShuffle(pool.map((w,i)=>i),1000+id).slice(0,10);return picks.map((idx,q)=>{const w=pool[idx];const distract=seededShuffle(pool.map(x=>x.vn).filter(x=>x!==w.vn),id*100+q).slice(0,3);const opts=seededShuffle([w.vn,...distract],id*1000+q);return {prompt:`“${w.zh}” nghĩa là gì?`,answer:opts.indexOf(w.vn),options:opts,explain:`${w.zh} · ${w.py||pyOf(w.zh)} = ${w.vn}`}})}
function buildGrammarQuestions(){return L.grammar.map((q,i)=>{const others=L.grammar.filter((_,j)=>j!==i).map(x=>x.vn_title);const opts=seededShuffle([q.vn_title,...seededShuffle(others,id*200+i).slice(0,3)],id*300+i);return {prompt:`Điểm ngôn ngữ “${q.title}” diễn đạt ý nào?`,answer:opts.indexOf(q.vn_title),options:opts,explain:`Cấu trúc: ${q.structure}. ${q.desc}`}})}
function buildReadingQuestions(){return L.scenes.map((s,i)=>{const correct=s.vn_title;const others=L.scenes.filter((_,j)=>j!==i).map(x=>x.vn_title);const opts=seededShuffle([correct,...seededShuffle(others,id*400+i).slice(0,3)],id*500+i);const clue=s.summary.length>135?s.summary.slice(0,135)+'…':s.summary;return {prompt:`Nội dung nào phù hợp với tóm tắt sau? “${clue}”`,answer:opts.indexOf(correct),options:opts,explain:`Đây là 课文 ${i+1}: ${s.vn_title}.`}})}
function renderMC(qs,prefix){return qs.map((q,i)=>`<article class="qcard" data-key="${q.answer}" data-prefix="${prefix}"><div class="qmeta"><span>Câu ${i+1}</span><span>1 điểm</span></div><div class="qtitle">${esc(q.prompt)}</div><div class="opts">${q.options.map((o,j)=>`<button class="opt" data-opt="${j}">${String.fromCharCode(65+j)}. ${esc(o)}</button>`).join('')}</div><div class="feedback"><span class="status"></span><div class="answer-explain">${esc(q.explain)}</div></div></article>`).join('')}
function scorePractice(root,questions,scoreId){let total=0,answered=0;const cards=$$('.qcard',root);cards.forEach((c,i)=>{const sel=$('.opt.sel',c),key=+c.dataset.key;$$('.opt',c).forEach(o=>{o.classList.remove('correct','wrong');if(+o.dataset.opt===key)o.classList.add('correct')});const fb=$('.feedback',c);const status=$('.status',fb);if(sel){answered++;if(+sel.dataset.opt===key){total++;fb.className='feedback good';if(status)status.textContent='✓ Đúng.'}else{sel.classList.add('wrong');fb.className='feedback bad';if(status)status.textContent='✗ Chưa đúng.'}}else{fb.className='feedback bad';if(status)status.textContent='Chưa trả lời.'}});const el=$('#'+scoreId);if(el)el.textContent=`${total}/${cards.length} đúng · đã trả lời ${answered}/${cards.length}`;const p=getProgress();p[id]??={};p[id][scoreId]=Math.max(p[id][scoreId]||0,total);saveProgress(p);toast(`Kết quả: ${total}/${cards.length}`)}

window.checkPassword=checkPassword;window.resetCourse=resetCourse;window.toggleComplete=toggleComplete;window.flipAll=flipAll;window.speakAllVocab=speakAllVocab;
document.addEventListener('DOMContentLoaded',()=>{initGate();try{validateData();if($('#lessonGrid'))renderHome();if($('.lesson-container'))initLesson();document.documentElement.dataset.hsk4Upper='ready';window.__HSK4_UPPER_DIAGNOSTICS={ok:true,lessons:10,vocabContract:window.__HSK4U_VOCAB_CONTRACT,page:$('#lessonGrid')?'home':'lesson'}}catch(e){document.documentElement.dataset.hsk4Upper='error';showFatal(e)}});
document.write('<script src="../assets/session-auth.js?v=20260815-1"><\/script>');
