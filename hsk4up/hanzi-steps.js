/* HSK 4 上: progressive stroke-order cards, matching the lower-level course UI. */
(function(){
  'use strict';
  const PANEL_ID='hsk4UpperStrokeSteps';
  const STYLE_ID='hsk4UpperStrokeStepsStyle';
  let loadToken=0;

  function currentChar(){
    const active=document.querySelector('#hanziWordMap .hanzi-char-btn.active[data-char],#hanziWordMap [data-char].active');
    if(active?.dataset?.char)return active.dataset.char;
    const first=document.querySelector('#hanziWordMap [data-char]');
    return first?.dataset?.char||'';
  }

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      #${PANEL_ID}{margin-top:14px;border:1px solid #e5eae7;border-radius:16px;background:#fff;padding:16px 18px;overflow:hidden}
      #${PANEL_ID} .h4u-stroke-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:11px}
      #${PANEL_ID} .h4u-stroke-head b{font-size:13px;color:#713036}
      #${PANEL_ID} .h4u-stroke-head span{font-size:9px;color:#8a7773;border:1px solid #ead7d4;background:#fff7f5;border-radius:999px;padding:4px 8px;white-space:nowrap}
      #${PANEL_ID} .h4u-stroke-note{font-size:10px;line-height:1.6;color:#65736d;margin-bottom:12px}
      #${PANEL_ID} .h4u-stroke-scroll{display:flex;gap:10px;overflow-x:auto;padding:2px 1px 9px;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch}
      #${PANEL_ID} .h4u-stroke-scroll::-webkit-scrollbar{height:6px}
      #${PANEL_ID} .h4u-stroke-scroll::-webkit-scrollbar-thumb{background:#d7dfda;border-radius:999px}
      #${PANEL_ID} .h4u-stroke-card{flex:0 0 108px;scroll-snap-align:start;border:1px solid #e0e7e3;border-radius:12px;background:#fff;overflow:hidden}
      #${PANEL_ID} .h4u-stroke-svg{width:108px;height:108px;display:flex;align-items:center;justify-content:center;background-color:#fff;background-image:linear-gradient(to right,transparent calc(50% - .5px),#e7ece9 50%,transparent calc(50% + .5px)),linear-gradient(to bottom,transparent calc(50% - .5px),#e7ece9 50%,transparent calc(50% + .5px)),linear-gradient(45deg,transparent calc(50% - .5px),#f0f2f1 50%,transparent calc(50% + .5px)),linear-gradient(-45deg,transparent calc(50% - .5px),#f0f2f1 50%,transparent calc(50% + .5px))}
      #${PANEL_ID} .h4u-stroke-svg svg{width:100%;height:100%;display:block}
      #${PANEL_ID} .h4u-stroke-label{text-align:center;padding:7px 4px 8px;border-top:1px solid #eef1ef;color:#6b7771;font-size:9px}
      #${PANEL_ID} .h4u-stroke-error{padding:9px 0;color:#8a4b4d;font-size:10px}
      @media(max-width:720px){#${PANEL_ID}{padding:14px}#${PANEL_ID} .h4u-stroke-card{flex-basis:100px}#${PANEL_ID} .h4u-stroke-svg{width:100px;height:100px}}
    `;
    document.head.appendChild(s);
  }

  function makeSvg(strokes,index){
    const NS='http://www.w3.org/2000/svg';
    const svg=document.createElementNS(NS,'svg');
    svg.setAttribute('viewBox','0 0 108 108');
    svg.setAttribute('role','img');
    svg.setAttribute('aria-label','第 '+(index+1)+' 笔');
    const g=document.createElementNS(NS,'g');
    let transform='';
    try{
      if(window.HanziWriter?.getScalingTransform){
        transform=window.HanziWriter.getScalingTransform(108,108,9).transform||'';
      }
    }catch(_e){}
    if(!transform){
      const scale=(108-18)/1024;
      transform='translate(9,99) scale('+scale+',-'+scale+')';
    }
    g.setAttribute('transform',transform);
    for(let i=0;i<=index;i++){
      const p=document.createElementNS(NS,'path');
      p.setAttribute('d',strokes[i]);
      p.setAttribute('fill',i===index?'#8d252b':'#cfd6d2');
      g.appendChild(p);
    }
    svg.appendChild(g);
    return svg;
  }

  function render(char,data){
    const master=document.getElementById('hanziMaster');
    if(!master||currentChar()!==char)return;
    let panel=document.getElementById(PANEL_ID);
    if(!panel){
      panel=document.createElement('div');
      panel.id=PANEL_ID;
      master.insertAdjacentElement('afterend',panel);
    }
    panel.dataset.char=char;
    panel.innerHTML='';

    const head=document.createElement('div');
    head.className='h4u-stroke-head';
    head.innerHTML='<b>逐笔写法 · Từng bước viết</b><span>'+data.strokes.length+' 画 · '+data.strokes.length+' nét</span>';
    const note=document.createElement('div');
    note.className='h4u-stroke-note';
    note.textContent='每一格按正确笔顺逐步累积显示；红色为当前这一笔。';
    const scroll=document.createElement('div');
    scroll.className='h4u-stroke-scroll';

    data.strokes.forEach((_,i)=>{
      const card=document.createElement('div');
      card.className='h4u-stroke-card';
      const box=document.createElement('div');
      box.className='h4u-stroke-svg';
      box.appendChild(makeSvg(data.strokes,i));
      const label=document.createElement('div');
      label.className='h4u-stroke-label';
      label.textContent='第 '+(i+1)+' 笔';
      card.appendChild(box);
      card.appendChild(label);
      scroll.appendChild(card);
    });
    panel.appendChild(head);
    panel.appendChild(note);
    panel.appendChild(scroll);
  }

  async function refresh(){
    ensureStyle();
    const char=currentChar();
    if(!char)return;
    const existing=document.getElementById(PANEL_ID);
    if(existing?.dataset?.char===char&&existing.querySelector('.h4u-stroke-card'))return;
    if(!window.HanziWriter||typeof window.HanziWriter.loadCharacterData!=='function')return;

    const token=++loadToken;
    try{
      const data=await window.HanziWriter.loadCharacterData(char);
      if(token!==loadToken||currentChar()!==char)return;
      if(!data||!Array.isArray(data.strokes)||!data.strokes.length)throw new Error('No stroke data');
      render(char,data);
    }catch(err){
      if(token!==loadToken||currentChar()!==char)return;
      const master=document.getElementById('hanziMaster');
      if(!master)return;
      let panel=document.getElementById(PANEL_ID);
      if(!panel){panel=document.createElement('div');panel.id=PANEL_ID;master.insertAdjacentElement('afterend',panel)}
      panel.dataset.char=char;
      panel.innerHTML='<div class="h4u-stroke-error">暂时无法加载“'+char+'”的逐笔数据，请检查网络后重试。</div>';
      console.warn('[HSK4 Upper stroke steps]',err);
    }
  }

  function start(){
    ensureStyle();
    refresh();
    document.addEventListener('click',e=>{
      if(e.target?.closest?.('#hanziWordMap [data-char]'))setTimeout(refresh,0);
    });
    const master=document.getElementById('hanziMaster');
    if(window.MutationObserver&&master){
      const obs=new MutationObserver(muts=>{
        if(muts.some(m=>m.target?.closest?.('#'+PANEL_ID)))return;
        setTimeout(refresh,0);
      });
      obs.observe(master,{childList:true,subtree:true});
    }
    window.__HSK4_UPPER_REFRESH_STROKES=refresh;
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
  else start();
})();
