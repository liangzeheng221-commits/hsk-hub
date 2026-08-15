/* HSK4 上 canonical textbook-text layer. Full textbook text only; summary/points remain auxiliary data. */
(()=>{
  'use strict';
  const CORPUS_ID='HSK4U-CANONICAL-LOCKED-v1';
  const SOURCE_SHA='c99d5c503f88bc9d718269f06cb8ca155aafc628da2603ad4253ec4f1bf7e4cc';
  const CHUNKS=15, PACKED_LENGTH=56828;
  function fail(message){window.__HSK4U_TEXTBOOK_LOCKED={ok:false,error:message};document.documentElement.dataset.hsk4UpperTextbookLocked='error';throw new Error('[HSK4U locked] '+message)}
  try{
    if(!window.pako?.ungzip)fail('pako gzip decoder unavailable');
    const parts=[];
    for(let i=1;i<=CHUNKS;i++){const key='__HSK4U_LOCKED_B64_'+String(i).padStart(2,'0'),v=window[key];if(typeof v!=='string'||!v)fail('missing corpus chunk '+i);parts.push(v)}
    const b64=parts.join('');if(b64.length!==PACKED_LENGTH)fail('packed corpus length mismatch');
    const bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
    const corpus=JSON.parse(window.pako.ungzip(bytes,{to:'string'}));
    if(corpus?.corpus_id!==CORPUS_ID)fail('corpus id mismatch');
    if(corpus?.source_sha256!==SOURCE_SHA)fail('Tier-0 source SHA-256 mismatch');
    if(corpus?.source_pages!==152)fail('source PDF physical page count mismatch');
    if(corpus?.units!==50||corpus?.lines!==290||!Array.isArray(corpus.lessons)||corpus.lessons.length!==10)fail('corpus count mismatch');
    const base=window.HSK4_UPPER_LESSONS;if(!Array.isArray(base)||base.length!==10)fail('base lesson data missing');
    let unitCount=0,lineCount=0;
    for(let lesson=1;lesson<=10;lesson++){
      const L=base.find(x=>Number(x.id)===lesson), C=corpus.lessons.find(x=>Number(x.id)===lesson);
      if(!L||!C||!Array.isArray(C.units)||C.units.length!==5)fail('lesson '+lesson+' corpus mismatch');
      if(String(L.title||'').replace(/[。！？!?]+$/,'')!==String(C.title_zh||'').replace(/[。！？!?]+$/,''))fail('lesson '+lesson+' title mismatch');
      C.units.sort((a,b)=>a.n-b.n);
      if(C.units.some((u,i)=>u.n!==i+1))fail('lesson '+lesson+' text order mismatch');
      L.scenes=C.units.map((u,i)=>{
        const old=L.scenes?.[i]||{};
        if(!Array.isArray(u.lines)||!u.lines.length)fail(`lesson ${lesson} text ${u.n} is empty`);
        const lines=u.lines.map((row,j)=>{
          if(!Array.isArray(row)||row.length!==4||!String(row[1]||'').trim()||!String(row[2]||'').trim()||!String(row[3]||'').trim())fail(`lesson ${lesson} text ${u.n} line ${j+1} incomplete`);
          lineCount++;
          return {line_no:j+1,s:row[0]||'',speaker:row[0]||'',zh:row[1],py:row[2],vn:row[3],locked:true};
        });
        unitCount++;
        return {...old,id:`hsk4u-l${String(lesson).padStart(2,'0')}-t${u.n}`,text_no:u.n,title:u.title_zh,title_zh:u.title_zh,vn_title:u.title_vi,title_vi:u.title_vi,type:u.type,textbook_page:u.tp,pinyin_page:u.pp,lines,locked:true};
      });
      L.textbookLocked=true;L.textbookCorpusId=CORPUS_ID;L.textbookTextUnits=5;
    }
    if(unitCount!==50||lineCount!==290)fail(`applied counts mismatch: units=${unitCount}, lines=${lineCount}`);
    window.__HSK4U_TEXTBOOK_LOCKED={ok:true,corpus_id:CORPUS_ID,source_pdf_sha256:SOURCE_SHA,source_pdf_pages:152,lessons:10,text_units:50,lines:290,vi_mode:'editorial_translation_reviewed'};
    document.documentElement.dataset.hsk4UpperTextbookLocked='ok';
    for(let i=1;i<=CHUNKS;i++)delete window['__HSK4U_LOCKED_B64_'+String(i).padStart(2,'0')];
  }catch(err){if(!window.__HSK4U_TEXTBOOK_LOCKED?.error){window.__HSK4U_TEXTBOOK_LOCKED={ok:false,error:err?.message||String(err)};document.documentElement.dataset.hsk4UpperTextbookLocked='error'}console.error(err)}
})();
