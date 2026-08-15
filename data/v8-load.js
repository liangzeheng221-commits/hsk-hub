window.HSK2_READY=(async()=>{const b64=window.__HSK2_V7;if(!b64)throw new Error('HSK2 data chunks missing');const bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));let text;if('DecompressionStream' in window){const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));text=await new Response(stream).text()}else if(window.pako){text=window.pako.ungzip(bytes,{to:'string'})}else{throw new Error('This browser cannot decompress course data')};window.HSK2_LESSONS=JSON.parse(text);delete window.__HSK2_V7;
  const load=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error('Không tải được '+src));document.head.appendChild(s)});
  for(let i=1;i<=4;i++)await load(`assets/hsk2-textbook-locked-${i}.js?v=20260815-1`);
  await load('assets/hsk2-textbook-locked.js?v=20260815-1');
  if(!window.__HSK2_TEXTBOOK_LOCKED?.ok)throw new Error('HSK2 locked textbook integrity failed');
  return window.HSK2_LESSONS})();

/* 教材末表词汇合同：等 hsk2-content-audit 完成后再做最终分类校正与自检。 */
(()=>{
  const SUPPLEMENT={2:['米'],3:['粉色'],4:['接'],5:['以后'],6:['公斤','经常','自行车'],7:['过'],9:['欢迎'],12:['度'],13:['班','拿','一直','长'],15:['更']};
  const PROPER={1:['花花'],13:['杨笑笑']};
  const entries=o=>Object.entries(o).flatMap(([lesson,words])=>words.map(zh=>({lesson:Number(lesson),zh})));
  function apply(){
    const lessons=window.HSK2_LESSONS||[];
    if(!Array.isArray(lessons)||lessons.length!==15)return false;
    const supp=new Set(entries(SUPPLEMENT).map(x=>`${x.lesson}:${x.zh}`));
    const proper=new Set(entries(PROPER).map(x=>`${x.lesson}:${x.zh}`));
    for(const L of lessons){
      for(const v of L.vocab||[]){
        const key=`${Number(L.id)}:${v.zh}`;
        const base=v.base_pos||String(v.pos||'').replace(/^★ 补充词\s*·?\s*/,'').replace(/^专名\s*·\s*Tên riêng$/,'');
        v.base_pos=base;
        if(proper.has(key)){
          v.kind='proper';v.kind_label='专名 · Tên riêng';v.pos='专名 · Tên riêng';
        }else if(supp.has(key)){
          v.kind='supplement';v.kind_label='★ 教材补充词 · Từ bổ sung';v.pos=`★ 补充词${base?' · '+base:''}`;
        }else{
          v.kind='core';v.kind_label='核心词 · Từ trọng tâm';v.pos=base;
        }
      }
      L.coreVocabCount=(L.vocab||[]).filter(v=>v.kind==='core').length;
      if(Array.isArray(L.mc)){
        const nonCore=new Set((L.vocab||[]).filter(v=>v.kind!=='core').map(v=>v.zh));
        L.mc=L.mc.filter(q=>!q?.audit_generated||![...nonCore].some(zh=>String(q.q||'').includes(`“${zh}”`)));
      }
    }
    const missing=[...entries(SUPPLEMENT),...entries(PROPER)].filter(x=>!lessons.find(L=>Number(L.id)===x.lesson)?.vocab?.some(v=>v.zh===x.zh)).map(x=>`L${x.lesson}:${x.zh}`);
    const suppCount=lessons.reduce((n,L)=>n+(L.vocab||[]).filter(v=>v.kind==='supplement').length,0);
    const properCount=lessons.reduce((n,L)=>n+(L.vocab||[]).filter(v=>v.kind==='proper').length,0);
    const phantomPowder=lessons.some(L=>(L.vocab||[]).some(v=>v.zh==='粉'));
    const ok=!missing.length&&suppCount===15&&properCount===2&&!phantomPowder;
    window.__HSK2_VOCAB_CONTRACT={version:'2026-08-15-vocab-3',ok,supplement:SUPPLEMENT,proper:PROPER,suppCount,properCount,missing,phantomPowder};
    if(typeof document!=='undefined')document.documentElement.dataset.hsk2VocabContract=ok?'ok':'error';
    if(!ok)console.error('[HSK2 vocab contract]',window.__HSK2_VOCAB_CONTRACT);
    if(typeof L!=='undefined'&&L&&typeof renderVocab==='function'){
      try{renderVocab(document.getElementById('vSearch')?.value||'')}catch(e){console.error('[HSK2 vocab redraw]',e)}
    }
    return ok;
  }
  window.applyHSK2VocabContract=apply;
  function auditReady(){const lessons=window.HSK2_LESSONS||[];return lessons.length===15&&lessons.every(L=>Array.isArray(L.phonetics)&&L.phonetics.length===1)}
  function waitForAudit(){
    let tries=0;const timer=setInterval(()=>{
      tries++;
      if(auditReady()){
        clearInterval(timer);apply();setTimeout(apply,0);
      }else if(tries>=200){
        clearInterval(timer);console.error('[HSK2 vocab contract] textbook audit did not finish within 20s');
      }
    },100);
  }
  if(typeof window!=='undefined')Promise.resolve(window.HSK2_READY).then(waitForAudit).catch(e=>console.error('[HSK2 vocab contract]',e));
})();
