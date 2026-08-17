const STORAGE_KEY='hsk1_ranteacher_progress_v1';
const MASTER_KEY='hsk1_ranteacher_mastered_v1';
const SESSION_KEY='hsk1_ranteacher_unlocked';
const PASSWORD_HASH='7cdee08809e6b166a8e8a9ecd162ffdd4395a7f1c5c76a10f96bacd5a7447da1';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function norm(s){return String(s??'').replace(/[\s，。！？,.!?；;：:、“”‘’'"（）()]/g,'').trim()}
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
function getProgress(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')}catch{return {}}}
function saveProgress(p){localStorage.setItem(STORAGE_KEY,JSON.stringify(p))}
function toast(msg){let t=$('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t)}t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1700)}
async function sha256(text){if(!globalThis.crypto?.subtle)return null;const d=new TextEncoder().encode(text),h=await crypto.subtle.digest('SHA-256',d);return [...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function checkPassword(){const input=$('#pwInput'),err=$('#pwError'),btn=$('#pwBtn');if(!input)return;btn.disabled=true;const ok=(await sha256(input.value.trim()))===PASSWORD_HASH;btn.disabled=false;if(ok){sessionStorage.setItem(SESSION_KEY,'1');sessionStorage.setItem('hsk_portal_unlocked','1');$('#pwOverlay').style.display='none';document.body.style.overflow=''}else{err?.classList.add('show');input.select()}}
function initGate(){const o=$('#pwOverlay');if(!o)return;if(sessionStorage.getItem(SESSION_KEY)==='1'||sessionStorage.getItem('hsk_portal_unlocked')==='1'){o.style.display='none';document.body.style.overflow=''}else{document.body.style.overflow='hidden';$('#pwInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')checkPassword()})}}
function speak(text){if(!('speechSynthesis' in window)){toast('Trình duyệt chưa hỗ trợ phát âm.');return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='zh-CN';u.rate=.82;const vs=speechSynthesis.getVoices();u.voice=vs.find(v=>/zh|Chinese|Mandarin/i.test(v.lang+' '+v.name))||null;speechSynthesis.speak(u)}
function resetCourse(){if(confirm('Xóa toàn bộ tiến độ HSK 1 trên trình duyệt này?')){localStorage.removeItem(STORAGE_KEY);localStorage.removeItem(MASTER_KEY);location.reload()}}
function allVocab(){return HSK1_LESSONS.flatMap(x=>x.vocab)}
function markVisited(id){const p=getProgress();p[id]??={};p[id].visited=true;saveProgress(p)}
function toggleComplete(){const p=getProgress();p[id]??={};p[id].complete=!p[id].complete;saveProgress(p);renderComplete();toast(p[id].complete?'Đã đánh dấu hoàn thành.':'Đã bỏ đánh dấu hoàn thành.')}
function renderComplete(){const b=$('#completeBtn');if(!b)return;const done=!!getProgress()[id]?.complete;b.textContent=done?'✓ Đã hoàn thành':'✓ Đánh dấu hoàn thành';b.classList.toggle('done',done)}

const LESSON1_PHONETICS=[
  {
    title:'语音 1 · 汉语音节',
    vn_title:'Ngữ âm 1 · Âm tiết tiếng Hán',
    structure:'声母 + 韵母 + 声调 · Thanh mẫu + vận mẫu + thanh điệu',
    desc:'Mỗi âm tiết tiếng Hán thường gồm thanh mẫu, vận mẫu và thanh điệu. Một số âm tiết không có thanh mẫu. Dấu thanh được đặt trên nguyên âm chính của vận mẫu.',
    examples:[
      {zh:'茶 · 狗 · 猫 · 菜',py:'chá · gǒu · māo · cài',vn:'trà · chó · mèo · rau / món ăn'},
      {zh:'杯子 · 学生 · 老师 · 鸡蛋',py:'bēizi · xuésheng · lǎoshī · jīdàn',vn:'cốc · học sinh · giáo viên · trứng gà'},
      {zh:'你好 · 谢谢 · 再见 · 不客气',py:'nǐ hǎo · xièxie · zàijiàn · bú kèqi',vn:'xin chào · cảm ơn · tạm biệt · không có gì'}
    ]
  },
  {
    title:'语音 2 · 声母和韵母（1）',
    vn_title:'Ngữ âm 2 · Thanh mẫu và vận mẫu (1)',
    structure:'声母: b p m f · d t n l · g k h　|　韵母: a o e i u er · ai ei ao ou · an en · ang eng ong',
    desc:'Thanh mẫu đứng ở đầu âm tiết, còn vận mẫu tạo thành phần chính phía sau. Khi phát âm, cần phân biệt rõ các cặp không bật hơi và bật hơi b/p, d/t, g/k; không đọc chúng theo tên chữ cái tiếng Việt.',
    examples:[
      {zh:'八 · 趴 · 妈 · 发',py:'bā · pā · mā · fā',vn:'luyện đọc b · p · m · f'},
      {zh:'大 · 他 · 拿 · 拉',py:'dà · tā · ná · lā',vn:'luyện đọc d · t · n · l'},
      {zh:'哥 · 科 · 喝',py:'gē · kē · hē',vn:'luyện đọc g · k · h'}
    ]
  },
  {
    title:'语音 3 · 声调',
    vn_title:'Ngữ âm 3 · Thanh điệu',
    structure:'第一声 55 · 第二声 35 · 第三声 214 · 第四声 51 · 轻声',
    desc:'Tiếng Phổ thông có bốn thanh cơ bản và thanh nhẹ. Thanh 1 cao và đều; thanh 2 đi lên; thanh 3 hạ xuống rồi đi lên; thanh 4 hạ mạnh. Thanh nhẹ ngắn, nhẹ và không ghi dấu thanh.',
    examples:[
      {zh:'妈 · 麻 · 马 · 骂',py:'mā · má · mǎ · mà',vn:'mẹ · cây gai · ngựa · mắng'},
      {zh:'一 · 移 · 椅 · 意',py:'yī · yí · yǐ · yì',vn:'một · di chuyển · ghế · ý nghĩa'},
      {zh:'老师 · 学生 · 谢谢',py:'lǎoshī · xuésheng · xièxie',vn:'giáo viên · học sinh · cảm ơn; “sheng” và âm thứ hai của “xie” đọc thanh nhẹ'}
    ]
  }
];
function languageItems(lesson){return lesson.id===1?[...LESSON1_PHONETICS,...lesson.grammar]:lesson.grammar}

function renderHome(){const p=getProgress(),grid=$('#lessonGrid');if(!grid)return;let done=0,words=0;grid.innerHTML='';const sections=[['vocab','Từ vựng'],['text','Bài khoá'],['grammar','Ngữ âm / Ngữ pháp'],['hanzi','Hán tự'],['practice','Luyện tập']];HSK1_LESSONS.forEach(L=>{words+=L.vocab.length;const isDone=!!p[L.id]?.complete;if(isDone)done++;const pct=isDone?100:(p[L.id]?.visited?32:0);const c=document.createElement('article');c.className='lesson-card';c.innerHTML=`<a class="lesson-main-link" href="lesson.html?id=${L.id}&sec=vocab"><div class="lesson-num">Bài ${L.id} ${isDone?'· ✓ Đã học':''}</div><div class="lesson-title zh">${esc(L.title)}</div><div class="lesson-vn">${esc(L.vn_title)}</div></a><div class="lesson-open-row"><a class="lesson-open-all" href="lesson.html?id=${L.id}&sec=vocab">Mở bài</a>${sections.map(([sec,label])=>`<a href="lesson.html?id=${L.id}&sec=${sec}">${label}</a>`).join('')}</div><div class="mini-progress"><i style="width:${pct}%"></i></div>`;grid.appendChild(c)});$('#wordStat').textContent=words;$('#doneStat').textContent=done+'/15';$('#progressSummary').textContent='Tiến độ '+Math.round(done/15*100)+'%'}

let id=1,L=null,currentSec='vocab',sceneIndex=0,hanziWriter=null,hanziSelected='';
const secOrder=['vocab','text','grammar','hanzi','practice'];
const secNames={vocab:'Từ vựng · 生词',text:'Bài khoá · 课文',grammar:'Ngữ âm / Ngữ pháp · 小语讲堂',hanzi:'Hán tự · 汉字笔顺',practice:'Luyện tập · 练一练'};
function initLesson(){const u=new URL(location.href);id=Math.max(1,Math.min(15,parseInt(u.searchParams.get('id')||'1',10)));L=HSK1_LESSONS.find(x=>x.id===id)||HSK1_LESSONS[0];currentSec=secOrder.includes(u.searchParams.get('sec'))?u.searchParams.get('sec'):'vocab';markVisited(id);renderLessonShell();renderVocab();renderText();renderGrammar();renderHanzi();renderPractice();showSection(currentSec,false);renderComplete()}
function renderLessonShell(){const items=languageItems(L);$('#lessonTitle').textContent=L.title;$('#lessonVn').textContent=L.vn_title;$('#lessonTag').textContent=`BÀI ${id} · 新HSK教程 1`;$('#vocabCount').textContent=L.vocab.length;$('#grammarCount').textContent=items.length;$('#grammarCount').nextElementSibling.textContent='Nội dung ngôn ngữ';$('#vocabChip').textContent=L.vocab.length+' từ';$('#grammarChip').textContent=items.length+' mục';$('#hanziChip').textContent=uniqueHanzi().length+' chữ';$$('.section-tab[data-sec="grammar"]').forEach(b=>b.textContent='Ngữ âm / Ngữ pháp');$('#grammar .section-head h2').textContent='NGỮ ÂM / NGỮ PHÁP — 小语讲堂';const sel=$('#lessonSelect');sel.innerHTML=HSK1_LESSONS.map(x=>`<option value="${x.id}" ${x.id===id?'selected':''}>Bài ${x.id} · ${esc(x.title)}</option>`).join('');sel.onchange=()=>location.href=`lesson.html?id=${sel.value}&sec=${currentSec}`;$$('.section-tab[data-sec]').forEach(b=>b.onclick=()=>showSection(b.dataset.sec));renderLessonSwitch();setupModuleNav()}
function showSection(sec,push=true){if(!secOrder.includes(sec))sec='vocab';currentSec=sec;$$('.content-section').forEach(x=>x.classList.toggle('active',x.id===sec));$$('.section-tab[data-sec]').forEach(x=>x.classList.toggle('active',x.dataset.sec===sec));$('#moduleStepTitle').textContent=secNames[sec];const i=secOrder.indexOf(sec);$('#prevModuleBtn').disabled=i===0;$('#nextModuleBtn').textContent=i===secOrder.length-1?'Về từ vựng ↺':'Mục tiếp theo →';if(push){const u=new URL(location.href);u.searchParams.set('sec',sec);history.replaceState(null,'',u);window.scrollTo({top:0,behavior:'smooth'})}}
function setupModuleNav(){$('#prevModuleBtn').onclick=()=>{const i=secOrder.indexOf(currentSec);if(i>0)showSection(secOrder[i-1])};$('#nextModuleBtn').onclick=()=>{const i=secOrder.indexOf(currentSec);showSection(secOrder[(i+1)%secOrder.length])}}
function renderLessonSwitch(){const prev=id>1?`<a class="ghost-btn" href="lesson.html?id=${id-1}&sec=${currentSec}">← Bài ${id-1}</a>`:'<span></span>';const next=id<15?`<a class="primary-btn" href="lesson.html?id=${id+1}&sec=${currentSec}">Bài ${id+1} →</a>`:'<a class="primary-btn" href="index.html">Về HSK 1</a>';$('#lessonSwitch').innerHTML=prev+next}

function renderVocab(){const q=$('#vSearch'),grid=$('#vocabGrid');function draw(term=''){const t=term.trim().toLowerCase(),items=L.vocab.filter(w=>!t||[w.zh,w.py,w.vn].some(x=>x.toLowerCase().includes(t)));grid.innerHTML=items.map((w,i)=>`<article class="vocab-card" data-zh="${esc(w.zh)}"><div class="vocab-card-inner"><div class="vocab-face vocab-front"><div class="vocab-zh">${esc(w.zh)}</div><div class="vocab-py">${esc(w.py)}</div><div class="vocab-actions"><button class="mini-btn listen" type="button">🔊 Nghe</button><button class="mini-btn flip" type="button">↻ Lật</button></div></div><div class="vocab-face vocab-back"><div class="vocab-vn">${esc(w.vn)}</div><div class="vocab-py">${esc(w.py)}</div><div class="vocab-actions"><button class="mini-btn listen" type="button">🔊 Nghe</button><button class="mini-btn flip" type="button">↻ Lật</button></div></div></div></article>`).join('');$$('.vocab-card',grid).forEach(card=>{const w=L.vocab.find(x=>x.zh===card.dataset.zh);card.onclick=e=>{if(e.target.closest('.listen')){e.stopPropagation();speak(w.zh);return}card.classList.toggle('flipped');showWordDetail(w)};$$('.flip',card).forEach(b=>b.onclick=e=>{e.stopPropagation();card.classList.toggle('flipped');showWordDetail(w)})});if(items[0])showWordDetail(items[0])}q.oninput=()=>draw(q.value);draw()}
function showWordDetail(w){$('#wordPanel').innerHTML=`<div class="word-detail"><div class="word-detail-head"><div class="word-main">${esc(w.zh)}</div><div class="word-py">${esc(w.py)}</div></div><div class="word-context">${esc(w.vn)}</div><div class="vocab-actions"><button class="mini-btn" onclick="speak('${esc(w.zh)}')">🔊 Nghe phát âm</button></div></div>`}
function flipAll(){$$('.vocab-card').forEach(c=>c.classList.toggle('flipped'))}
function speakAllVocab(){speak(L.vocab.map(x=>x.zh).join('，'))}

function renderText(){sceneIndex=0;const tabs=$('#sceneTabs');tabs.innerHTML=L.scenes.map((s,i)=>`<button class="scene-tab ${i===0?'active':''}" data-i="${i}">${i+1}. ${esc(s.place_vn)}</button>`).join('');$$('.scene-tab',tabs).forEach(b=>b.onclick=()=>{sceneIndex=+b.dataset.i;$$('.scene-tab',tabs).forEach(x=>x.classList.toggle('active',x===b));drawScene()});drawScene()}
function drawScene(){const s=L.scenes[sceneIndex];$('#scenePane').innerHTML=`<div class="scene-title"><h3>${esc(s.place)} · ${esc(s.place_vn)}</h3><button class="ghost-btn" onclick="speak(${JSON.stringify(s.lines.map(x=>x.zh).join('，'))})">🔊 Đọc đoạn</button></div><div class="dialogue-card">${s.lines.map(x=>`<div class="dialogue-line"><div class="speaker">${esc(x.s)}</div><div><div class="line-py">${esc(x.py)}</div><div class="line-zh">${esc(x.zh)}</div><div class="line-vn">${esc(x.vn)}</div></div><button class="speak-line" onclick="speak(${JSON.stringify(x.zh)})">🔊</button></div>`).join('')}</div>`}
function renderGrammar(){const items=languageItems(L);$('#grammarList').innerHTML=items.length?items.map((g,i)=>`<article class="grammar-card"><h3>${i+1}. ${esc(g.title)}</h3><div class="grammar-vn-title">${esc(g.vn_title)}</div>${g.structure?`<div class="grammar-structure">${esc(g.structure)}</div>`:''}<div class="grammar-desc">${esc(g.desc)}</div><div class="grammar-examples">${g.examples.map(e=>{const x=typeof e==='string'?{zh:e,py:'',vn:''}:e;return `<div class="grammar-example"><div><span class="grammar-example-py">${esc(x.py)}</span><span class="grammar-example-zh">${esc(x.zh)}</span>${x.vn?`<span class="grammar-example-vn">${esc(x.vn)}</span>`:''}</div><button onclick="speak(${JSON.stringify(x.zh)})">🔊</button></div>`}).join('')}</div></article>`).join(''):'<article class="grammar-card"><h3>Bài này không có nội dung ngữ âm hoặc ngữ pháp riêng.</h3><div class="grammar-desc">Hãy chuyển sang mục tiếp theo hoặc chọn bài khác.</div></article>'}

function uniqueHanzi(){const out=[];L.vocab.forEach(w=>[...w.zh].forEach(ch=>{if(/\p{Script=Han}/u.test(ch)&&!out.includes(ch))out.push(ch)}));return out}
function renderHanzi(){const chars=uniqueHanzi();$('#hanziWordMap').innerHTML=`<div class="hanzi-char-list">${chars.map((c,i)=>`<button class="hanzi-char-btn ${i===0?'active':''}" data-char="${c}">${c}</button>`).join('')}</div>`;$$('.hanzi-char-btn').forEach(b=>b.onclick=()=>{$$('.hanzi-char-btn').forEach(x=>x.classList.toggle('active',x===b));drawHanzi(b.dataset.char)});if(chars[0])drawHanzi(chars[0])}
function drawHanzi(ch){hanziSelected=ch;hanziWriter=null;const words=L.vocab.filter(w=>w.zh.includes(ch));$('#hanziMaster').innerHTML=`<div class="hanzi-canvas-wrap"><div id="hanziCanvas"><div class="hanzi-static">${ch}</div></div></div><div class="hanzi-info"><h3>${ch}</h3><p>Chọn “Xem bút thuận” để xem thứ tự nét chuẩn. Dữ liệu nét dùng Hanzi Writer / Make Me a Hanzi.</p><div class="hanzi-words">${words.map(w=>`<span class="hanzi-word-chip"><b>${esc(w.zh)}</b> · ${esc(w.py)} · ${esc(w.vn)}</span>`).join('')}</div><div class="hanzi-controls"><button class="primary-btn" onclick="animateHanzi()">▶ Xem bút thuận</button><button class="ghost-btn" onclick="quizHanzi()">✍ Luyện viết</button><button class="ghost-btn" onclick="speak('${ch}')">🔊 Nghe</button></div><div id="hanziStatus" class="word-context"></div></div>`;ensureWriter(false)}
function ensureWriter(showStatus=true){if(hanziWriter)return true;if(!window.HanziWriter){if(showStatus)$('#hanziStatus').textContent='Đang tải dữ liệu bút thuận… hãy thử lại sau vài giây.';return false}const box=$('#hanziCanvas');box.innerHTML='';try{hanziWriter=HanziWriter.create('hanziCanvas',hanziSelected,{width:240,height:240,padding:12,showOutline:true,strokeAnimationSpeed:1,delayBetweenStrokes:160,drawingWidth:4,showCharacter:false});return true}catch(e){console.error(e);if(showStatus)$('#hanziStatus').textContent='Không tải được nét chữ này. Vui lòng kiểm tra kết nối.';return false}}
function animateHanzi(){if(!ensureWriter())return;$('#hanziStatus').textContent='Đang phát thứ tự nét…';hanziWriter.animateCharacter({onComplete:()=>$('#hanziStatus').textContent='✓ Đã phát xong thứ tự nét.'})}
function quizHanzi(){if(!ensureWriter())return;$('#hanziStatus').textContent='Dùng chuột hoặc ngón tay viết theo đúng thứ tự nét.';hanziWriter.quiz({showHintAfterMisses:2,highlightOnComplete:true,onComplete:()=>$('#hanziStatus').textContent='✓ Hoàn thành chữ '+hanziSelected+'!'})}
