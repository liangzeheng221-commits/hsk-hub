/* HSK4 Lower Hanzi parity layer — matches the proven HSK1/HSK2 stroke-order experience. */
(()=>{
  'use strict';

  const DATA_CDN='https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/';
  const strokeCache=new Map();
  let activeWriter=null;
  let selectedChar='';
  let renderToken=0;

  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const hanChars=s=>[...String(s??'')].filter(ch=>/[\u3400-\u9FFF\uF900-\uFAFF]/.test(ch));

  function loadStrokeData(ch){
    if(strokeCache.has(ch))return strokeCache.get(ch);
    const url=DATA_CDN+encodeURIComponent(ch)+'.json';
    const request=fetch(url,{cache:'force-cache'}).then(r=>{
      if(!r.ok)throw new Error('HTTP '+r.status);
      return r.json();
    }).then(data=>{
      if(!data||!Array.isArray(data.strokes)||!data.strokes.length)throw new Error('Invalid stroke data');
      return data;
    }).catch(err=>{
      strokeCache.delete(ch);
      throw err;
    });
    strokeCache.set(ch,request);
    return request;
  }

  function charDataLoader(ch,onLoad,onError){
    loadStrokeData(ch).then(onLoad).catch(onError);
  }

  function renderStrokeFan(target,data){
    if(!target)return;
    target.innerHTML='';
    if(!window.HanziWriter?.getScalingTransform){
      target.innerHTML='<span class="stroke-loading error">Không tạo được sơ đồ từng nét.</span>';
      return;
    }
    const size=82,tf=window.HanziWriter.getScalingTransform(size,size,6);
    data.strokes.forEach((_,i)=>{
      const cell=document.createElement('div');
      cell.className='stroke-step';
      const board=document.createElement('div');
      board.className='stroke-step-board';
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.setAttribute('viewBox',`0 0 ${size} ${size}`);
      svg.setAttribute('role','img');
      svg.setAttribute('aria-label',`第 ${i+1} 笔`);
      const g=document.createElementNS('http://www.w3.org/2000/svg','g');
      g.setAttribute('transform',tf.transform);
      svg.appendChild(g);
      data.strokes.slice(0,i+1).forEach((path,j)=>{
        const el=document.createElementNS('http://www.w3.org/2000/svg','path');
        el.setAttribute('d',path);
        el.setAttribute('fill',j===i?'#b68b3b':'#bdc8c2');
        el.setAttribute('opacity',j===i?'1':'0.62');
        g.appendChild(el);
      });
      board.appendChild(svg);
      cell.appendChild(board);
      const lab=document.createElement('span');
      lab.textContent=`第 ${i+1} 笔`;
      cell.appendChild(lab);
      target.appendChild(cell);
    });
  }

  function setStatus(text,state=''){
    const el=q('#hanziStatus');
    if(!el)return;
    el.textContent=text;
    el.className='hanzi-status'+(state?' '+state:'');
  }

  function createWriter(ch){
    activeWriter?.cancelQuiz?.();
    activeWriter=null;
    const canvas=q('#hanziCanvas');
    if(!canvas)return;
    if(!window.HanziWriter){
      setStatus('⚠️ Thư viện bút thuận chưa tải xong. Hãy đợi vài giây rồi chọn lại chữ.','warn');
      return;
    }
    canvas.innerHTML='';
    try{
      activeWriter=window.HanziWriter.create(canvas,ch,{
        width:300,
        height:300,
        padding:18,
        showOutline:true,
        showCharacter:true,
        strokeColor:'#8d252b',
        outlineColor:'#d9dfdc',
        highlightColor:'#b68b3b',
        drawingColor:'#8d252b',
        drawingWidth:5,
        strokeAnimationSpeed:1.15,
        delayBetweenStrokes:360,
        charDataLoader,
        onLoadCharDataError:()=>setStatus('⚠️ Không tải được dữ liệu bút thuận. Hãy kiểm tra mạng rồi chọn lại chữ.','error')
      });
    }catch(e){
      console.error('[HSK4 Hanzi]',e);
      setStatus('⚠️ Không khởi tạo được bút thuận cho chữ này.','error');
    }
  }

  function renderDetail(ch){
    selectedChar=ch;
    const token=++renderToken;
    activeWriter?.cancelQuiz?.();
    activeWriter=null;
    const master=q('#hanziMaster');
    if(!master)return;
    const words=(L?.vocab||[]).filter(w=>String(w.zh||'').includes(ch));
    master.className='hanzi-master hsk4-hanzi-parity';
    master.innerHTML=`
      <div class="hanzi-detail">
        <div class="hanzi-topline">
          <div class="hanzi-current-char">${esc(ch)}</div>
          <div class="hanzi-stroke-meta" id="hanziStrokeMeta">Đang tải số nét…</div>
        </div>
        <div class="hanzi-main-board"><div id="hanziCanvas" class="hanzi-canvas"><div class="hanzi-static">${esc(ch)}</div></div></div>
        <div class="hanzi-related-words">${words.map(w=>`<span><b>${esc(w.zh)}</b> · ${esc(pyOf(w.zh))} · ${esc(w.vn)}</span>`).join('')}</div>
        <div class="hanzi-controls hsk4-hanzi-controls">
          <button class="primary-btn" id="hanziAnimateBtn">▶ 演示笔顺 · Xem bút thuận</button>
          <button class="ghost-btn" id="hanziQuizBtn">✍ 练习书写 · Luyện viết</button>
          <button class="ghost-btn" id="hanziResetBtn">↺ 重置 · Đặt lại</button>
          <button class="ghost-btn" id="hanziSpeakBtn">🔊 Nghe</button>
        </div>
        <div id="hanziStatus" class="hanzi-status">笔顺按简体中文汉字数据逐笔显示。</div>
        <div class="stroke-fan-title">逐笔写法 · Từng bước viết</div>
        <div class="stroke-fan" id="hanziStrokeFan"><span class="stroke-loading">Đang tải…</span></div>
      </div>`;

    q('#hanziAnimateBtn').onclick=()=>window.animateHanzi();
    q('#hanziQuizBtn').onclick=()=>window.quizHanzi();
    q('#hanziResetBtn').onclick=()=>window.resetHanzi();
    q('#hanziSpeakBtn').onclick=()=>speak(ch);

    createWriter(ch);
    loadStrokeData(ch).then(data=>{
      if(token!==renderToken||selectedChar!==ch)return;
      q('#hanziStrokeMeta').textContent=`${data.strokes.length} 画 · ${data.strokes.length} nét`;
      renderStrokeFan(q('#hanziStrokeFan'),data);
    }).catch(err=>{
      console.error('[HSK4 Hanzi data]',err);
      if(token!==renderToken||selectedChar!==ch)return;
      q('#hanziStrokeMeta').textContent='Không xác định số nét';
      q('#hanziStrokeFan').innerHTML='<span class="stroke-loading error">Không tải được dữ liệu từng nét. Hãy kiểm tra kết nối rồi chọn lại chữ.</span>';
    });
  }

  window.renderHanzi=function(){
    const chars=[];
    (L?.vocab||[]).forEach(w=>hanChars(w.zh).forEach(ch=>{if(!chars.includes(ch))chars.push(ch)}));
    const chip=q('#hanziChip');
    if(chip)chip.textContent=chars.length+' chữ';
    const map=q('#hanziWordMap');
    const master=q('#hanziMaster');
    if(!map||!master)return;
    map.className='hanzi-word-map hsk4-hanzi-map';
    map.innerHTML=`<div class="hanzi-char-list">${chars.map((c,i)=>`<button class="hanzi-char-btn ${i===0?'active':''}" data-char="${esc(c)}">${esc(c)}</button>`).join('')}</div>`;
    qa('.hanzi-char-btn',map).forEach(btn=>btn.onclick=()=>{
      qa('.hanzi-char-btn',map).forEach(x=>x.classList.toggle('active',x===btn));
      renderDetail(btn.dataset.char);
    });
    if(chars.length)renderDetail(chars[0]);
    else master.innerHTML='<div class="hanzi-status">Bài này chưa có chữ Hán để luyện.</div>';
  };

  window.drawHanzi=renderDetail;

  window.animateHanzi=function(){
    if(!activeWriter){createWriter(selectedChar);if(!activeWriter)return;}
    activeWriter.cancelQuiz?.();
    setStatus(`正在演示“${selectedChar}”的正确笔顺。`);
    activeWriter.hideCharacter({duration:0,onComplete:()=>activeWriter.animateCharacter({
      onComplete:()=>setStatus(`✓ “${selectedChar}”笔顺演示完成。`,'good')
    })});
  };

  window.quizHanzi=function(){
    if(!activeWriter){createWriter(selectedChar);if(!activeWriter)return;}
    activeWriter.cancelQuiz?.();
    activeWriter.hideCharacter({duration:0});
    activeWriter.showOutline({duration:0});
    setStatus(`请按正确笔顺书写“${selectedChar}”。写错两次会提示下一笔。`);
    activeWriter.quiz({
      showHintAfterMisses:2,
      highlightOnComplete:true,
      onCorrectStroke:d=>setStatus(`✓ 第 ${d.strokeNum+1} 笔正确，还剩 ${d.strokesRemaining} 笔。`,'good'),
      onMistake:d=>setStatus(`再试一次：当前第 ${d.strokeNum+1} 笔。累计错误 ${d.totalMistakes} 次。`,'warn'),
      onComplete:d=>setStatus(`✅ “${selectedChar}”书写完成。错误 ${d.totalMistakes||0} 次。`,'good')
    });
  };

  window.resetHanzi=function(){
    if(!activeWriter){createWriter(selectedChar);if(!activeWriter)return;}
    activeWriter.cancelQuiz?.();
    activeWriter.showOutline({duration:0});
    activeWriter.showCharacter({duration:0});
    setStatus('已重置。可再次演示笔顺或练习书写。');
  };
})();
