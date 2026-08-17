/* HSK1/HSK3 lesson UI parity layer — mirrors the proven HSK2 interaction model. */
(()=>{
  if(!document.body || !(document.body.classList.contains('hsk1') || document.body.classList.contains('hsk3'))) return;
  document.body.classList.add('hsk2-parity');

  const LEVEL=document.body.classList.contains('hsk3')?3:1;
  const MASTER_KEY=`hsk${LEVEL}_ranteacher_mastered_v1`;
  const HANZI_DATA_CDN='../assets/hanzi-data/';
  const strokeDataCache=new Map();
  let parityWordWriter=null, parityMasterWriter=null, parityActiveWord=-1;

  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const htmlEscape=s=>typeof esc==='function'?esc(s):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const pinyinOf=w=>String(w?.py || (typeof pyOf==='function'?pyOf(w?.zh||''):'') || '');
  const sentencePinyin=(text,line)=>String(line?.py || (typeof pyOf==='function'?pyOf(text):'') || '');
  const getMastered=()=>{try{return JSON.parse(localStorage.getItem(MASTER_KEY)||'{}')}catch{return {}}};
  const saveMastered=m=>localStorage.setItem(MASTER_KEY,JSON.stringify(m));

  function getHanziChars(text){return [...String(text??'')].filter(ch=>/[\u3400-\u9FFF\uF900-\uFAFF]/.test(ch))}
  function getLessonHanzi(){
    const map=new Map();
    (L?.vocab||[]).forEach(v=>getHanziChars(v.zh).forEach(ch=>{
      if(!map.has(ch))map.set(ch,[]);
      if(!map.get(ch).includes(v.zh))map.get(ch).push(v.zh);
    }));
    return [...map.entries()].map(([char,words])=>({char,words}));
  }
  function findExample(v){
    for(const scene of (L?.scenes||[])){
      for(const line of (scene.lines||[])){
        if(String(line.zh||'').includes(v.zh)) return {zh:line.zh,py:sentencePinyin(line.zh,line),vn:line.vn||''};
      }
    }
    return null;
  }
  function loadStrokeData(ch){
    if(strokeDataCache.has(ch))return strokeDataCache.get(ch);
    const p=fetch(HANZI_DATA_CDN+encodeURIComponent(ch)+'.json',{cache:'force-cache'}).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json()});
    strokeDataCache.set(ch,p);return p;
  }
  function hanziLoader(ch,onLoad,onError){loadStrokeData(ch).then(onLoad).catch(onError)}
  function renderStrokeFan(target,data){
    if(!target)return;
    target.innerHTML='';
    const size=68,tf=window.HanziWriter?.getScalingTransform(size,size,5);
    if(!tf){target.innerHTML='<span class="stroke-loading error">Không tạo được sơ đồ từng nét.</span>';return}
    data.strokes.forEach((_,i)=>{
      const cell=document.createElement('div');cell.className='stroke-step';
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox',`0 0 ${size} ${size}`);svg.setAttribute('aria-label',`第${i+1}笔`);
      const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.setAttribute('transform',tf.transform);svg.appendChild(g);
      data.strokes.slice(0,i+1).forEach((path,j)=>{
        const el=document.createElementNS('http://www.w3.org/2000/svg','path');
        el.setAttribute('d',path);el.setAttribute('fill',j===i?'#b68b3b':'#9fb6a7');el.setAttribute('opacity',j===i?'1':'0.62');g.appendChild(el);
      });
      cell.appendChild(svg);
      const lab=document.createElement('span');lab.textContent=`第 ${i+1} 笔`;cell.appendChild(lab);target.appendChild(cell);
    });
  }
  function writerOptions(scope,statusEl){
    return {width:scope==='word'?150:176,height:scope==='word'?150:176,padding:10,showOutline:true,showCharacter:true,strokeColor:'#1e5c3a',radicalColor:'#b68b3b',outlineColor:'#d7e6db',highlightColor:'#d97961',drawingColor:'#1e5c3a',strokeAnimationSpeed:1.2,delayBetweenStrokes:380,showHintAfterMisses:2,highlightOnComplete:true,charDataLoader:hanziLoader,onLoadCharDataError:()=>{statusEl.textContent='⚠️ Không tải được dữ liệu bút thuận. Hãy kiểm tra kết nối mạng rồi thử lại.';statusEl.className='hanzi-status error'}};
  }
  function renderHanziDetail(target,ch,scope='master'){
    if(!target||!ch)return;
    const uid=`parity-${scope}-${LEVEL}-${id}-${ch.codePointAt(0)}-${Date.now().toString(36)}`;
    target.classList.add('hanzi-detail');
    if(scope==='word')target.classList.add('compact');else target.classList.remove('compact');
    target.innerHTML=`<div class="hanzi-focus"><div class="hanzi-label-block"><div class="hanzi-char-label">${htmlEscape(ch)}</div><div class="hanzi-stroke-meta" id="${uid}-meta">Đang tải số nét…</div></div><div class="hanzi-canvas-wrap"><div class="hanzi-canvas" id="${uid}-canvas"></div></div><div class="hanzi-controls"><button class="primary-btn mini" id="${uid}-animate">▶ 演示笔顺 · Xem bút thuận</button><button class="ghost-btn" id="${uid}-quiz">✍ 练习书写 · Luyện viết</button><button class="ghost-btn" id="${uid}-reset">↺ 重置 · Đặt lại</button></div></div><div class="hanzi-status" id="${uid}-status">笔顺按简体中文汉字数据逐笔显示。</div><div class="stroke-fan-title">逐笔写法 · Từng bước viết</div><div class="stroke-fan" id="${uid}-fan"><span class="stroke-loading">Đang tải…</span></div>`;
    const status=q('#'+uid+'-status'),canvas=q('#'+uid+'-canvas');
    if(!window.HanziWriter){status.textContent='⚠️ Thư viện bút thuận chưa tải xong. Hãy đợi vài giây rồi chọn lại chữ.';status.className='hanzi-status warn';q('#'+uid+'-meta').textContent='Đang chờ mô-đun';q('#'+uid+'-fan').innerHTML='<span class="stroke-loading">Đang chờ Hanzi Writer…</span>';return}
    let writer;
    try{writer=window.HanziWriter.create(canvas,ch,writerOptions(scope,status))}catch(e){console.error(e);status.textContent='⚠️ Không khởi tạo được bút thuận cho chữ này.';status.className='hanzi-status error';return}
    if(scope==='word')parityWordWriter=writer;else parityMasterWriter=writer;
    loadStrokeData(ch).then(data=>{q('#'+uid+'-meta').textContent=`${data.strokes.length} 画 · ${data.strokes.length} nét`;renderStrokeFan(q('#'+uid+'-fan'),data)}).catch(()=>{q('#'+uid+'-meta').textContent='Không xác định số nét';q('#'+uid+'-fan').innerHTML='<span class="stroke-loading error">Không tải được dữ liệu.</span>'});
    q('#'+uid+'-animate').onclick=()=>{writer.cancelQuiz?.();writer.hideCharacter({duration:0,onComplete:()=>writer.animateCharacter()});status.textContent=`正在演示“${ch}”的正确笔顺。`;status.className='hanzi-status'};
    q('#'+uid+'-quiz').onclick=()=>{writer.cancelQuiz?.();writer.hideCharacter({duration:0});writer.showOutline({duration:0});status.textContent=`请按正确笔顺书写“${ch}”。写错两次会提示下一笔。`;status.className='hanzi-status';writer.quiz({onCorrectStroke:d=>{status.textContent=`✓ 第 ${d.strokeNum+1} 笔正确，还剩 ${d.strokesRemaining} 笔。`;status.className='hanzi-status good'},onMistake:d=>{status.textContent=`再试一次：当前第 ${d.strokeNum+1} 笔。累计错误 ${d.totalMistakes} 次。`;status.className='hanzi-status warn'},onComplete:d=>{status.textContent=`✅ “${ch}”书写完成。错误 ${d.totalMistakes} 次。`;status.className='hanzi-status good'}})};
    q('#'+uid+'-reset').onclick=()=>{writer.cancelQuiz?.();writer.showOutline({duration:0});writer.showCharacter({duration:0});status.textContent='已重置。可再次演示笔顺或练习书写。';status.className='hanzi-status'};
  }

  function renderUnifiedHanzi(){
    const entries=getLessonHanzi(),map=q('#hanziWordMap'),master=q('#hanziMaster');
    if(!map||!master)return;
    const chip=q('#hanziChip');if(chip)chip.textContent=entries.length+' chữ';
    map.className='hanzi-word-map';
    map.innerHTML=entries.map((x,i)=>`<button class="hanzi-chip ${i===0?'active':''}" data-char="${htmlEscape(x.char)}"><b>${htmlEscape(x.char)}</b><span>${x.words.map(htmlEscape).join(' · ')}</span></button>`).join('');
    qa('.hanzi-chip',map).forEach(b=>b.onclick=()=>{qa('.hanzi-chip',map).forEach(x=>x.classList.remove('active'));b.classList.add('active');parityMasterWriter?.cancelQuiz?.();renderHanziDetail(master,b.dataset.char,'master')});
    if(entries.length)renderHanziDetail(master,entries[0].char,'master');else master.innerHTML='<div class="hanzi-status">Bài này chưa có chữ Hán để luyện.</div>';
  }

  function ensureVocabQuick(){
    const section=q('#vocab'),tool=q('.tool-row',section);if(!section||!tool)return null;
    let bar=q('#vocabQuick',section);
    if(!bar){bar=document.createElement('div');bar.id='vocabQuick';bar.className='vocab-quick';tool.before(bar)}
    return bar;
  }
  function renderUnifiedVocab(filter=''){
    const grid=q('#vocabGrid');if(!grid||!L)return;
    const quick=ensureVocabQuick(),mastered=getMastered(),f=String(filter||'').trim().toLowerCase();
    if(quick){quick.innerHTML=L.vocab.map((v,i)=>`<button class="vocab-pill" data-i="${i}">${htmlEscape(v.zh)} · ${htmlEscape(pinyinOf(v))}</button>`).join('');qa('.vocab-pill',quick).forEach(b=>b.onclick=()=>showUnifiedWord(+b.dataset.i))}
    grid.innerHTML='';grid.className='vocab-grid hsk2-vocab-grid';
    L.vocab.forEach((v,i)=>{
      const py=pinyinOf(v);if(f&&!`${v.zh} ${py} ${v.vn||''}`.toLowerCase().includes(f))return;
      const key=`${id}-${v.zh}`,known=!!mastered[key],card=document.createElement('div');card.className='vcard';
      card.innerHTML=`<div class="vinner"><div class="vface"><div class="vzh">${htmlEscape(v.zh)}</div><div class="vactions"><button class="tiny speak-word" title="Phát âm" aria-label="Phát âm ${htmlEscape(v.zh)}">🔊</button><button class="tiny known" title="Đã nhớ" aria-label="Đánh dấu đã nhớ">${known?'★':'☆'}</button></div><button class="tiny detail-tiny" title="Xem chi tiết" aria-label="Xem chi tiết">ⓘ</button></div><div class="vface vback"><div class="vpy">${htmlEscape(py)}</div><div class="vvn">${htmlEscape(v.vn||'')}</div><small>chạm để lật lại</small></div></div>`;
      card.onclick=e=>{if(e.target.closest('button'))return;card.classList.toggle('flipped')};
      card.ondblclick=()=>showUnifiedWord(i);
      q('.speak-word',card).onclick=e=>{e.stopPropagation();speak(v.zh)};
      q('.detail-tiny',card).onclick=e=>{e.stopPropagation();showUnifiedWord(i)};
      q('.known',card).onclick=e=>{e.stopPropagation();const mm=getMastered();mm[key]=!mm[key];saveMastered(mm);e.currentTarget.textContent=mm[key]?'★':'☆';if(typeof toast==='function')toast(mm[key]?'Đã đánh dấu từ đã nhớ.':'Đã bỏ đánh dấu.')};
      grid.appendChild(card);
    });
    const search=q('#vSearch');if(search&&!search.dataset.parityBound){search.dataset.parityBound='1';search.oninput=()=>renderUnifiedVocab(search.value)}
  }
  function showUnifiedWord(input){
    const i=typeof input==='number'?input:L.vocab.indexOf(input);if(i<0||i>=L.vocab.length)return;
    parityActiveWord=i;const v=L.vocab[i],panel=q('#wordPanel'),chars=getHanziChars(v.zh),example=findExample(v),py=pinyinOf(v);if(!panel)return;
    qa('.vocab-pill').forEach(b=>b.classList.toggle('active',+b.dataset.i===i));
    panel.classList.add('show','hsk2-word-panel');
    panel.innerHTML=`<div class="word-panel-head"><div><h3>${htmlEscape(v.zh)}</h3><div class="py">${htmlEscape(py)}</div><div class="word-vn">${htmlEscape(v.vn||'')}</div></div><div class="word-actions"><button class="speak" id="parityWordSpeak">🔊</button><button class="word-close" id="parityWordClose" aria-label="Đóng">×</button></div></div>${example?`<div class="example-box"><div class="example-label">VÍ DỤ TRONG NỘI DUNG BÀI</div><div class="example-py">${htmlEscape(example.py)}</div><div class="zh example-zh">${htmlEscape(example.zh)}</div><div class="example-vn">${htmlEscape(example.vn)}</div></div>`:''}${chars.length?`<div class="word-hanzi-block"><div class="word-hanzi-title"><b>笔顺 · Bút thuận chữ Hán</b><span>${chars.length} chữ</span></div><div class="word-hanzi-tabs">${chars.map((ch,ci)=>`<button class="word-hanzi-tab ${ci===0?'active':''}" data-char="${htmlEscape(ch)}">${htmlEscape(ch)}</button>`).join('')}</div><div class="hanzi-detail compact" id="parityWordHanziDetail"></div></div>`:''}<div class="word-nav"><button class="ghost-btn" id="parityWordPrev" ${i===0?'disabled':''}>← Từ trước</button><button class="ghost-btn" id="parityWordNext" ${i===L.vocab.length-1?'disabled':''}>Từ sau →</button></div><div class="word-tip">Mẹo: nhấp thẻ để lật · nhấp ⓘ hoặc nhấp đúp để mở chi tiết.</div>`;
    q('#parityWordSpeak').onclick=()=>speak(v.zh);
    q('#parityWordClose').onclick=()=>{panel.classList.remove('show');parityActiveWord=-1;parityWordWriter?.cancelQuiz?.();parityWordWriter=null;qa('.vocab-pill').forEach(b=>b.classList.remove('active'))};
    q('#parityWordPrev').onclick=()=>showUnifiedWord(i-1);q('#parityWordNext').onclick=()=>showUnifiedWord(i+1);
    if(chars.length){qa('.word-hanzi-tab',panel).forEach(b=>b.onclick=()=>{qa('.word-hanzi-tab',panel).forEach(x=>x.classList.remove('active'));b.classList.add('active');parityWordWriter?.cancelQuiz?.();renderHanziDetail(q('#parityWordHanziDetail'),b.dataset.char,'word')});renderHanziDetail(q('#parityWordHanziDetail'),chars[0],'word')}
    panel.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  function flipUnifiedVocab(){const cards=qa('.vcard');const flip=!cards.every(c=>c.classList.contains('flipped'));cards.forEach(c=>c.classList.toggle('flipped',flip))}

  window.renderVocab=renderUnifiedVocab;
  window.showWordDetail=showUnifiedWord;
  window.renderHanzi=renderUnifiedHanzi;
  window.flipAll=flipUnifiedVocab;
  window.__HSK_PARITY={renderHanziDetail,renderVocab:renderUnifiedVocab,showWord:showUnifiedWord};
})();
