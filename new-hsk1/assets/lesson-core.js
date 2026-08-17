const id=Math.min(15,Math.max(1,parseInt(new URLSearchParams(location.search).get('id')||'1')));
const L=HSK2_LESSONS.find(x=>x.id===id);
const SECTION_ORDER=['vocab','text','grammar','hanzi','practice'];
const SECTION_LABELS={vocab:'Từ vựng · 生词',text:'Bài khoá · 课文',grammar:'Ngữ pháp · 语言点',hanzi:'Hán tự · 汉字笔顺',practice:'Luyện tập · 练一练'};
let activeSection=(()=>{const s=new URLSearchParams(location.search).get('sec');return SECTION_ORDER.includes(s)?s:'vocab'})();
function lessonUrl(lessonId=id,sec=activeSection){return `lesson.html?id=${lessonId}&sec=${sec}`}
let mcSelected={},activeScene=0,activeWord=-1,activeHanzi=null,matchState={zh:null,py:null,vn:null},sortState=[];
const HANZI_DATA_CDN='https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/';
const strokeDataCache=new Map();
let wordWriter=null, masterWriter=null;

let pinyinReady=false;
function setupPinyin(){
  if(!window.pinyinPro?.pinyin)return false;
  if(pinyinReady)return true;
  const custom={
    '是不是':'shì bu shì','要不要':'yào bu yào','去不去':'qù bu qù',
    '北京':'Běijīng','大卫':'Dàwèi','张老师':'Zhāng lǎoshī','王老师':'Wáng lǎoshī',
    '小王':'Xiǎo Wáng','小张':'Xiǎo Zhāng','谢先生':'Xiè xiānsheng','张欢':'Zhāng Huān',
    '王方':'Wáng Fāng','杨笑笑':'Yáng Xiàoxiao','新京宾馆':'Xīnjīng Bīnguǎn',
    '好好':'hǎohāo','想想':'xiǎngxiang','看看':'kànkan','等等':'děngdeng','玩儿玩儿':'wánrwanr','时候':'shíhou','朋友':'péngyou','男朋友':'nánpéngyou','女朋友':'nǚpéngyou',
    '漂亮':'piàoliang','回来':'huílai','出去':'chūqu','进去':'jìnqu','看见':'kànjiàn','听见':'tīngjiàn',
    '一点儿':'yìdiǎnr','有点儿':'yǒudiǎnr','怎么样':'zěnmeyàng','怎么':'zěnme','什么':'shénme',
    '这么':'zhème','那个':'nàge','这个':'zhège','哪个':'nǎge','几个':'jǐ ge'
  };
  L.vocab.forEach(v=>{if(v.zh&&v.py)custom[v.zh]=v.py});
  try{window.pinyinPro.customPinyin(custom);pinyinReady=true;return true}catch(e){console.warn('Pinyin setup failed',e);return false}
}
function pinyinText(text){
  if(!setupPinyin())return '';
  try{
    let py=window.pinyinPro.pinyin(String(text),{toneType:'symbol',type:'string',nonZh:'consecutive',separator:' ',toneSandhi:true,segmentit:2});
    py=py.replace(/\s+([，。！？；：,.!?])/g,'$1').replace(/\s{2,}/g,' ').trim();
    return py;
  }catch(e){console.warn('Pinyin conversion failed',text,e);return ''}
}

function markVisited(){const p=getProgress();p[id]=p[id]||{};p[id].visited=true;saveProgress(p)}
function setupHeader(){
  document.title=`HSK 2 · Bài ${L.id} · ${L.title}`;
  $('#lessonHero').dataset.no=L.id;
  $('#lessonTag').textContent=`第 ${L.id} 课 · BÀI ${L.id} · ${L.theme}`;
  $('#lessonTitle').textContent=L.title;$('#lessonVn').textContent=L.vn_title;
  $('#vocabCount').textContent=L.vocab.length;$('#grammarCount').textContent=L.grammar.length;
  $('#vocabChip').textContent=L.vocab.length+' từ';$('#grammarChip').textContent=L.grammar.length+' cấu trúc';
  $('#lessonMenuCurrent').textContent=L.id;
  refreshLessonLinks();
  const p=getProgress();if(p[id]?.complete){$('#completeBtn').textContent='✓ Đã hoàn thành';$('#completeBtn').style.background='var(--moss)'}
}
function refreshLessonLinks(){
  $('#lessonMenu').innerHTML=HSK2_LESSONS.map(x=>`<a class="${x.id===id?'current':''}" href="${lessonUrl(x.id)}"><span class="menu-no">${x.id}</span><span><b>Bài ${x.id}</b><br><span class="menu-title">${esc(x.title)}</span></span></a>`).join('');
  let h='';if(id>1)h+=`<a href="${lessonUrl(id-1)}">← Bài ${id-1}<br><span class="zh">${esc(HSK2_LESSONS[id-2].title)}</span></a>`;else h+='<a href="index.html">← Trang chủ</a>';
  if(id<15)h+=`<a href="${lessonUrl(id+1)}">Bài ${id+1} →<br><span class="zh">${esc(HSK2_LESSONS[id].title)}</span></a>`;else h+='<a href="index.html">Về trang chủ →</a>';$('#lessonSwitch').innerHTML=h;
}
function toggleLessonMenu(e){e?.stopPropagation();const m=$('#lessonMenu'),b=$('#lessonMenuBtn');m.classList.toggle('show');b.classList.toggle('open',m.classList.contains('show'))}
function closeLessonMenu(){const m=$('#lessonMenu'),b=$('#lessonMenuBtn');m?.classList.remove('show');b?.classList.remove('open')}

function renderVocabQuick(){
  $('#vocabQuick').innerHTML=L.vocab.map((v,i)=>`<button class="vocab-pill" data-i="${i}">${esc(v.zh)} · ${esc(v.py)}</button>`).join('');
  $$('.vocab-pill').forEach(b=>b.onclick=()=>showWord(+b.dataset.i));
}
function renderVocab(filter=''){
  const m=getMastered(),g=$('#vocabGrid');g.innerHTML='';const f=filter.trim().toLowerCase();
  L.vocab.forEach((v,i)=>{
    if(f&&!`${v.zh} ${v.py} ${v.vn}`.toLowerCase().includes(f))return;
    const known=!!m[`${id}-${v.zh}`],d=document.createElement('div');d.className='vcard';
    d.innerHTML=`<div class="vinner"><div class="vface"><div class="vpos">${esc(v.pos)}</div><div class="vicon">${v.icon}</div><div class="vzh">${esc(v.zh)}</div><div class="vactions"><button class="tiny speak-word" title="Phát âm" aria-label="Phát âm ${esc(v.zh)}">🔊</button><button class="tiny known" title="Đã nhớ" aria-label="Đánh dấu đã nhớ">${known?'★':'☆'}</button></div><button class="tiny detail-tiny" title="Xem chi tiết" aria-label="Xem chi tiết">ⓘ</button></div><div class="vface vback"><div class="vpy">${esc(v.py)}</div><div class="vvn">${esc(v.vn)}</div><small style="color:var(--sub);margin-top:7px">chạm để lật lại</small></div></div>`;
    d.addEventListener('click',e=>{if(e.target.closest('button'))return;d.classList.toggle('flipped')});
    d.addEventListener('dblclick',()=>showWord(i));
    d.querySelector('.speak-word').onclick=e=>{e.stopPropagation();speak(v.zh)};
    d.querySelector('.detail-tiny').onclick=e=>{e.stopPropagation();showWord(i)};
    d.querySelector('.known').onclick=e=>{e.stopPropagation();const mm=getMastered(),k=`${id}-${v.zh}`;mm[k]=!mm[k];localStorage.setItem(MASTER_KEY,JSON.stringify(mm));e.currentTarget.textContent=mm[k]?'★':'☆';toast(mm[k]?'Đã đánh dấu từ đã nhớ.':'Đã bỏ đánh dấu.')};
    g.appendChild(d);
  });
}
function showWord(i){
  if(i<0||i>=L.vocab.length)return;activeWord=i;const v=L.vocab[i],p=$('#wordPanel'),chars=getHanziChars(v.zh);
  $$('.vocab-pill').forEach(b=>b.classList.toggle('active',+b.dataset.i===i));
  p.classList.add('show');
  p.innerHTML=`<div class="word-panel-head"><div><h3>${esc(v.zh)}</h3><div class="py">${esc(v.py)}</div><div style="color:var(--sub);font-size:13px">${esc(v.pos)} · ${esc(v.vn)}</div></div><div class="word-actions"><button class="speak" id="wordSpeak">🔊</button><button class="word-close" id="wordClose" aria-label="Đóng">×</button></div></div><div class="example-box"><div class="example-label">Ví dụ trong nội dung bài</div><div class="example-py">${esc(pinyinText(v.example.zh))}</div><div class="zh" style="font-size:16px">${esc(v.example.zh)}</div><div style="font-size:12px;color:var(--sub)">${esc(v.example.vn)}</div></div>${chars.length?`<div class="word-hanzi-block"><div class="word-hanzi-title"><b>笔顺 · Bút thuận chữ Hán</b><span>${chars.length} chữ</span></div><div class="word-hanzi-tabs">${chars.map((ch,ci)=>`<button class="word-hanzi-tab ${ci===0?'active':''}" data-char="${esc(ch)}" data-ci="${ci}">${esc(ch)}</button>`).join('')}</div><div class="hanzi-detail compact" id="wordHanziDetail"></div></div>`:''}<div class="word-nav"><button class="ghost-btn" id="wordPrev" ${i===0?'disabled':''}>← Từ trước</button><button class="ghost-btn" id="wordNext" ${i===L.vocab.length-1?'disabled':''}>Từ sau →</button></div><div class="word-tip">Mẹo: nhấp thẻ để lật · nhấp ⓘ hoặc nhấp đúp để mở chi tiết.</div>`;
  $('#wordSpeak').onclick=()=>speak(v.zh);$('#wordClose').onclick=()=>{p.classList.remove('show');activeWord=-1;wordWriter?.cancelQuiz?.();wordWriter=null;$$('.vocab-pill').forEach(b=>b.classList.remove('active'))};
  $('#wordPrev').onclick=()=>showWord(i-1);$('#wordNext').onclick=()=>showWord(i+1);
  if(chars.length){$$('.word-hanzi-tab',p).forEach(b=>b.onclick=()=>{$$('.word-hanzi-tab',p).forEach(x=>x.classList.remove('active'));b.classList.add('active');renderHanziDetail($('#wordHanziDetail'),b.dataset.char,'word')});renderHanziDetail($('#wordHanziDetail'),chars[0],'word')}
  p.scrollIntoView({behavior:'smooth',block:'nearest'});
}
function flipAll(){const cards=$$('.vcard');const flip=!cards.every(c=>c.classList.contains('flipped'));cards.forEach(c=>c.classList.toggle('flipped',flip))}
function speakSequence(items,rate=.78){let i=0;window.speechSynthesis.cancel();const go=()=>{if(i>=items.length)return;const u=new SpeechSynthesisUtterance(items[i++]);u.lang='zh-CN';u.rate=rate;u.onend=()=>setTimeout(go,150);window.speechSynthesis.speak(u)};go()}
function speakAllVocab(){if(!('speechSynthesis' in window)){toast('Trình duyệt này chưa hỗ trợ phát âm.');return}speakSequence(L.vocab.map(v=>v.zh),.75)}

function getHanziChars(text){return [...String(text)].filter(ch=>/[\u3400-\u9FFF\uF900-\uFAFF]/.test(ch))}
function getLessonHanzi(){
  const map=new Map();
  L.vocab.forEach(v=>getHanziChars(v.zh).forEach(ch=>{if(!map.has(ch))map.set(ch,[]);if(!map.get(ch).includes(v.zh))map.get(ch).push(v.zh)}));
  return [...map.entries()].map(([char,words])=>({char,words}));
}
function loadStrokeData(ch){
  if(strokeDataCache.has(ch))return strokeDataCache.get(ch);
  const promise=fetch(HANZI_DATA_CDN+encodeURIComponent(ch)+'.json',{cache:'force-cache'}).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json()});
  strokeDataCache.set(ch,promise);return promise;
}
function hanziLoader(ch,onLoad,onError){loadStrokeData(ch).then(onLoad).catch(onError)}
function renderStrokeFan(target,data){
  target.innerHTML='';const size=68,tf=window.HanziWriter?.getScalingTransform(size,size,5);
  if(!tf)return;
  data.strokes.forEach((_,i)=>{
    const cell=document.createElement('div');cell.className='stroke-step';
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox',`0 0 ${size} ${size}`);svg.setAttribute('aria-label',`第${i+1}笔`);
    const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.setAttribute('transform',tf.transform);svg.appendChild(g);
    data.strokes.slice(0,i+1).forEach((path,j)=>{const el=document.createElementNS('http://www.w3.org/2000/svg','path');el.setAttribute('d',path);el.setAttribute('fill',j===i?'#b68b3b':'#9fb6a7');el.setAttribute('opacity',j===i?'1':'0.62');g.appendChild(el)});
    cell.appendChild(svg);const lab=document.createElement('span');lab.textContent=`第 ${i+1} 笔`;cell.appendChild(lab);target.appendChild(cell);
  });
}
function writerOptions(scope,ch,statusEl){
  return {width:scope==='word'?150:176,height:scope==='word'?150:176,padding:10,showOutline:true,showCharacter:true,strokeColor:'#1e5c3a',radicalColor:'#b68b3b',outlineColor:'#d7e6db',highlightColor:'#d97961',drawingColor:'#1e5c3a',strokeAnimationSpeed:1.2,delayBetweenStrokes:380,showHintAfterMisses:2,highlightOnComplete:true,charDataLoader:hanziLoader,onLoadCharDataError:()=>{statusEl.textContent='⚠️ Không tải được dữ liệu bút thuận. Hãy kiểm tra kết nối mạng rồi thử lại.';statusEl.className='hanzi-status error'}}
}
function renderHanziDetail(target,ch,scope='master'){
  if(!target||!ch)return;activeHanzi=ch;
  const uid=`${scope}-${id}-${ch.codePointAt(0)}-${Date.now().toString(36)}`;
  target.innerHTML=`<div class="hanzi-focus"><div><div class="hanzi-char-label">${esc(ch)}</div><div class="hanzi-stroke-meta" id="${uid}-meta">Đang tải số nét…</div></div><div class="hanzi-canvas-wrap"><div class="hanzi-canvas" id="${uid}-canvas"></div></div><div class="hanzi-controls"><button class="primary-btn mini" id="${uid}-animate">▶ 演示笔顺 · Xem bút thuận</button><button class="ghost-btn" id="${uid}-quiz">✍ 练习书写 · Luyện viết</button><button class="ghost-btn" id="${uid}-reset">↺ 重置 · Đặt lại</button></div></div><div class="hanzi-status" id="${uid}-status">笔顺按简体中文汉字数据逐笔显示。</div><div class="stroke-fan-title">逐笔写法 · Từng bước viết</div><div class="stroke-fan" id="${uid}-fan"><span class="stroke-loading">Đang tải…</span></div>`;
  const status=$('#'+uid+'-status'),canvas=$('#'+uid+'-canvas');
  if(!window.HanziWriter){status.textContent='⚠️ Thư viện bút thuận chưa tải được. Nội dung bài học vẫn dùng bình thường.';status.className='hanzi-status error';$('#'+uid+'-meta').textContent='Chưa tải được dữ liệu';$('#'+uid+'-fan').innerHTML='<span class="stroke-loading error">Không tải được mô-đun bút thuận.</span>';return}
  const opts=writerOptions(scope,ch,status);const writer=window.HanziWriter.create(canvas,ch,opts);if(scope==='word')wordWriter=writer;else masterWriter=writer;
  loadStrokeData(ch).then(data=>{$('#'+uid+'-meta').textContent=`${data.strokes.length} 画 · ${data.strokes.length} nét`;renderStrokeFan($('#'+uid+'-fan'),data)}).catch(()=>{$('#'+uid+'-meta').textContent='Không xác định số nét';$('#'+uid+'-fan').innerHTML='<span class="stroke-loading error">Không tải được dữ liệu.</span>'});
  $('#'+uid+'-animate').onclick=()=>{writer.cancelQuiz?.();writer.hideCharacter({duration:0,onComplete:()=>writer.animateCharacter()});status.textContent=`正在演示“${ch}”的正确笔顺。`;status.className='hanzi-status'};
  $('#'+uid+'-quiz').onclick=()=>{writer.cancelQuiz?.();writer.hideCharacter({duration:0});writer.showOutline({duration:0});status.textContent=`请按正确笔顺书写“${ch}”。写错两次会提示下一笔。`;status.className='hanzi-status';writer.quiz({onCorrectStroke:d=>{status.textContent=`✓ 第 ${d.strokeNum+1} 笔正确，还剩 ${d.strokesRemaining} 笔。`},onMistake:d=>{status.textContent=`再试一次：当前第 ${d.strokeNum+1} 笔。累计错误 ${d.totalMistakes} 次。`;status.className='hanzi-status warn'},onComplete:d=>{status.textContent=`✅ “${ch}”书写完成。错误 ${d.totalMistakes} 次。`;status.className='hanzi-status good'}})};
  $('#'+uid+'-reset').onclick=()=>{writer.cancelQuiz?.();writer.showOutline({duration:0});writer.showCharacter({duration:0});status.textContent='已重置。可再次演示笔顺或练习书写。';status.className='hanzi-status'};
}
function renderHanziSection(){
  const entries=getLessonHanzi();$('#hanziChip').textContent=entries.length+' chữ';
  $('#hanziWordMap').innerHTML=entries.map((x,i)=>`<button class="hanzi-chip ${i===0?'active':''}" data-char="${esc(x.char)}"><b>${esc(x.char)}</b><span>${x.words.map(esc).join(' · ')}</span></button>`).join('');
  $$('.hanzi-chip',$('#hanziWordMap')).forEach(b=>b.onclick=()=>{$$('.hanzi-chip',$('#hanziWordMap')).forEach(x=>x.classList.remove('active'));b.classList.add('active');renderHanziDetail($('#hanziMaster'),b.dataset.char,'master')});
  if(entries.length)renderHanziDetail($('#hanziMaster'),entries[0].char,'master');
}

function speakScene(si=activeScene){if(!('speechSynthesis' in window)){toast('Trình duyệt này chưa hỗ trợ phát âm.');return}speakSequence(L.scenes[si].lines.map(x=>x.zh),.82)}
function renderScene(si=0){
  activeScene=si;$$('.scene-tab').forEach((b,i)=>b.classList.toggle('active',i===si));const s=L.scenes[si];
  $('#scenePane').innerHTML=`<div class="dialogue"><div class="dialogue-head"><b>${esc(s.title)}</b><small>${esc(s.vn)}</small></div>${s.lines.map(x=>`<div class="dlg-line"><div class="speaker">${esc(x.spk)}</div><div class="dlg-copy"><div class="dlg-py">${esc(pinyinText(x.zh))}</div><div class="dlg-zh">${esc(x.zh)}</div><div class="dlg-vn">${esc(x.vn)}</div></div><button class="speak" data-speech="${encodeURIComponent(x.zh)}" aria-label="Đọc câu">🔊</button></div>`).join('')}</div><div class="scene-controls"><span class="scene-position">Đoạn ${si+1}/4 · nghe từng câu hoặc nghe cả đoạn</span><div class="scene-control-buttons"><button class="ghost-btn" onclick="renderScene(${Math.max(0,si-1)})" ${si===0?'disabled':''}>← Trước</button><button class="ghost-btn" onclick="speakScene(${si})">🔊 Nghe cả đoạn</button><button class="ghost-btn" onclick="renderScene(${Math.min(3,si+1)})" ${si===3?'disabled':''}>Sau →</button></div></div>`;
  $$('[data-speech]',$('#scenePane')).forEach(b=>b.onclick=()=>speak(decodeURIComponent(b.dataset.speech)));
}
function renderText(){const tabs=$('#sceneTabs');tabs.innerHTML=L.scenes.map((s,i)=>`<button class="scene-tab ${i===0?'active':''}" onclick="renderScene(${i})">课文${['一','二','三','四'][i]} · ${esc(s.title)}</button>`).join('');renderScene(0)}
function renderGrammar(){
  $('#grammarList').innerHTML=L.grammar.map((g,i)=>`<div class="grammar-card"><div class="grammar-head"><span class="gnum">${i+1}</span><b>${esc(g.title)}</b></div><div class="grammar-body"><div class="formula">${esc(g.formula)}</div><div class="gdesc">${esc(g.desc)}</div><ul class="gex">${g.examples.map(e=>`<li class="grammar-example"><div><div class="gpy">${esc(pinyinText(e.zh))}</div><div class="z">${esc(e.zh)}</div><div class="n">${esc(e.vn)}</div></div><button class="speak" data-gspeech="${encodeURIComponent(e.zh)}" aria-label="Đọc ví dụ">🔊</button></li>`).join('')}</ul></div></div>`).join('');
  $$('[data-gspeech]',$('#grammarList')).forEach(b=>b.onclick=()=>speak(decodeURIComponent(b.dataset.gspeech)));
}
