/* Inline vocabulary stroke-order panel shared by HSK 4 上 / 下. */
(()=>{
  'use strict';
  const DATA_CDN='https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/';
  const cache=new Map();
  let writer=null,selected='',token=0,mount=null;
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const chars=s=>[...String(s??'')].filter((ch,i,a)=>/[\u3400-\u9FFF\uF900-\uFAFF]/.test(ch)&&a.indexOf(ch)===i);

  function loadData(ch){
    if(cache.has(ch))return cache.get(ch);
    const request=(window.HanziWriter?.loadCharacterData?window.HanziWriter.loadCharacterData(ch):fetch(DATA_CDN+encodeURIComponent(ch)+'.json',{cache:'force-cache'}).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json()})).then(data=>{
      if(!data||!Array.isArray(data.strokes)||!data.strokes.length)throw new Error('Invalid stroke data');
      return data;
    }).catch(err=>{cache.delete(ch);throw err});
    cache.set(ch,request);return request;
  }
  function loader(ch,onLoad,onError){loadData(ch).then(onLoad).catch(onError)}
  function setStatus(text,state=''){
    const el=q('.vocab-hanzi-status',mount);if(!el)return;
    el.textContent=text;el.className='vocab-hanzi-status'+(state?' '+state:'');
  }
  function svgFor(strokes,index){
    const NS='http://www.w3.org/2000/svg',size=94;
    const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox',`0 0 ${size} ${size}`);svg.setAttribute('role','img');svg.setAttribute('aria-label',`第 ${index+1} 笔`);
    const g=document.createElementNS(NS,'g');
    let transform='';try{transform=window.HanziWriter?.getScalingTransform?.(size,size,6)?.transform||''}catch(_e){}
    if(!transform){const scale=(size-12)/1024;transform=`translate(6,${size-6}) scale(${scale},-${scale})`}
    g.setAttribute('transform',transform);svg.appendChild(g);
    strokes.slice(0,index+1).forEach((path,i)=>{const p=document.createElementNS(NS,'path');p.setAttribute('d',path);p.setAttribute('fill',i===index?'#b68b3b':'#bdc8c2');p.setAttribute('opacity',i===index?'1':'.62');g.appendChild(p)});
    return svg;
  }
  function renderSteps(data){
    const root=q('.vocab-hanzi-steps',mount);if(!root)return;root.innerHTML='';
    data.strokes.forEach((_,i)=>{const cell=document.createElement('div');cell.className='vocab-hanzi-step';const board=document.createElement('div');board.className='vocab-hanzi-step-board';board.appendChild(svgFor(data.strokes,i));const label=document.createElement('span');label.textContent=`第 ${i+1} 笔`;cell.append(board,label);root.appendChild(cell)});
  }
  function createWriter(ch){
    writer?.cancelQuiz?.();writer=null;
    const canvas=q('.vocab-hanzi-canvas',mount);if(!canvas)return;
    if(!window.HanziWriter){setStatus('⚠️ Thư viện bút thuận chưa tải xong. Hãy đợi vài giây rồi chọn lại chữ.','warn');return}
    canvas.innerHTML='';
    try{writer=window.HanziWriter.create(canvas,ch,{width:200,height:200,padding:12,showOutline:true,showCharacter:true,strokeColor:'#8d252b',outlineColor:'#d9dfdc',highlightColor:'#b68b3b',drawingColor:'#8d252b',drawingWidth:5,strokeAnimationSpeed:1.15,delayBetweenStrokes:330,charDataLoader:loader,onLoadCharDataError:()=>setStatus('⚠️ Không tải được dữ liệu bút thuận. Hãy kiểm tra mạng rồi chọn lại chữ.','error')})}
    catch(err){console.error('[HSK4 vocabulary Hanzi]',err);setStatus('⚠️ Không khởi tạo được bút thuận cho chữ này.','error')}
  }
  function select(ch){
    selected=ch;const current=++token;
    qa('.vocab-hanzi-tab',mount).forEach(b=>b.classList.toggle('active',b.dataset.char===ch));
    q('.vocab-hanzi-current',mount).textContent=ch;q('.vocab-hanzi-count',mount).textContent='Đang tải số nét…';q('.vocab-hanzi-steps',mount).innerHTML='<span class="vocab-hanzi-loading">Đang tải…</span>';
    createWriter(ch);
    loadData(ch).then(data=>{if(current!==token||selected!==ch)return;q('.vocab-hanzi-count',mount).textContent=`${data.strokes.length} 画 · ${data.strokes.length} nét`;renderSteps(data)}).catch(err=>{console.error('[HSK4 vocabulary stroke data]',err);if(current!==token||selected!==ch)return;q('.vocab-hanzi-count',mount).textContent='Không xác định số nét';q('.vocab-hanzi-steps',mount).innerHTML='<span class="vocab-hanzi-loading">Không tải được dữ liệu từng nét.</span>'});
  }
  function render(word,target='#hsk4VocabHanziMount'){
    mount=typeof target==='string'?q(target):target;writer?.cancelQuiz?.();writer=null;token++;
    if(!mount)return;
    const list=chars(word?.zh);
    if(!list.length){mount.innerHTML='<div class="vocab-hanzi-empty">Từ này không có chữ Hán để hiển thị bút thuận.</div>';return}
    mount.innerHTML=`<section class="vocab-hanzi-panel"><div class="vocab-hanzi-head"><b>笔顺 · Bút thuận chữ Hán</b><span>${list.length} chữ</span></div><div class="vocab-hanzi-tabs">${list.map((ch,i)=>`<button class="vocab-hanzi-tab ${i===0?'active':''}" type="button" data-char="${esc(ch)}">${esc(ch)}</button>`).join('')}</div><div class="vocab-hanzi-detail"><div class="vocab-hanzi-top"><div class="vocab-hanzi-board"><div class="vocab-hanzi-canvas"><span class="vocab-hanzi-static">${esc(list[0])}</span></div></div><div><div class="vocab-hanzi-summary"><div class="vocab-hanzi-current">${esc(list[0])}</div><div class="vocab-hanzi-count">Đang tải số nét…</div></div><div class="vocab-hanzi-controls"><button class="primary-btn vocab-hanzi-animate" type="button">▶ 演示笔顺 · Xem bút thuận</button><button class="ghost-btn vocab-hanzi-quiz" type="button">✍ 练习书写 · Luyện viết</button><button class="ghost-btn vocab-hanzi-reset" type="button">↺ 重置 · Đặt lại</button></div><div class="vocab-hanzi-status">笔顺按简体中文汉字数据逐笔显示。</div></div></div><div class="vocab-hanzi-steps-title">逐笔写法 · Từng bước viết</div><div class="vocab-hanzi-steps"><span class="vocab-hanzi-loading">Đang tải…</span></div></div></section>`;
    qa('.vocab-hanzi-tab',mount).forEach(b=>b.onclick=()=>select(b.dataset.char));
    q('.vocab-hanzi-animate',mount).onclick=()=>{if(!writer){createWriter(selected);if(!writer)return}writer.cancelQuiz?.();setStatus(`正在演示“${selected}”的正确笔顺。`);writer.hideCharacter({duration:0,onComplete:()=>writer.animateCharacter({onComplete:()=>setStatus(`✓ “${selected}”笔顺演示完成。`,'good')})})};
    q('.vocab-hanzi-quiz',mount).onclick=()=>{if(!writer){createWriter(selected);if(!writer)return}writer.cancelQuiz?.();writer.hideCharacter({duration:0});writer.showOutline({duration:0});setStatus(`请按正确笔顺书写“${selected}”。写错两次会提示下一笔。`);writer.quiz({showHintAfterMisses:2,highlightOnComplete:true,onCorrectStroke:d=>setStatus(`✓ 第 ${d.strokeNum+1} 笔正确，还剩 ${d.strokesRemaining} 笔。`,'good'),onMistake:d=>setStatus(`再试一次：当前第 ${d.strokeNum+1} 笔。累计错误 ${d.totalMistakes} 次。`,'warn'),onComplete:d=>setStatus(`✅ “${selected}”书写完成。错误 ${d.totalMistakes||0} 次。`,'good')})};
    q('.vocab-hanzi-reset',mount).onclick=()=>{if(!writer){createWriter(selected);if(!writer)return}writer.cancelQuiz?.();writer.showOutline({duration:0});writer.showCharacter({duration:0});setStatus('已重置。可再次演示笔顺或练习书写。')};
    select(list[0]);
  }
  window.HSK4VocabHanzi={render,chars};
})();
