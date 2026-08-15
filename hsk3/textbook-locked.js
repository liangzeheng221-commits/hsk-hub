/* Final canonical textbook-text layer for HSK3. Replaces only lesson text/scenes; vocab, grammar and reviewed practice remain intact. */
(()=>{
  'use strict';
  const CORPUS_ID='HSK3-CANONICAL-LOCKED-v1';
  const SOURCE_SHA='f415d2233eeb18ef843514335ca5f09aae861d9c9a068f4908637e2f7fa43975';
  async function unpack(){
    const b64=[window.__HSK3_LOCKED_B64_1,window.__HSK3_LOCKED_B64_2,window.__HSK3_LOCKED_B64_3,window.__HSK3_LOCKED_B64_4A,window.__HSK3_LOCKED_B64_4B,window.__HSK3_LOCKED_B64_4C,window.__HSK3_LOCKED_B64_4D].join('');
    if(!b64||b64.length!==63532)throw new Error('[HSK3 locked] packed corpus chunks missing or truncated');
    const bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
    let text='';
    if(typeof DecompressionStream==='function'){
      const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
      text=await new Response(stream).text();
    }else if(window.pako?.ungzip){
      text=window.pako.ungzip(bytes,{to:'string'});
    }else throw new Error('[HSK3 locked] gzip decoder unavailable');
    return JSON.parse(text);
  }
  function validateCorpus(corpus){
    if(corpus?.corpus_id!==CORPUS_ID)throw new Error('[HSK3 locked] corpus id mismatch');
    if(corpus?.source_pdf?.sha256!==SOURCE_SHA)throw new Error('[HSK3 locked] Tier-0 source hash mismatch');
    if(corpus?.source_pdf?.physical_pages!==207)throw new Error('[HSK3 locked] source page count mismatch');
    if(corpus?.unit_count!==80||!Array.isArray(corpus.units)||corpus.units.length!==80)throw new Error('[HSK3 locked] expected 80 text units');
    const lineCount=corpus.units.reduce((n,u)=>n+(Array.isArray(u.lines)?u.lines.length:0),0);
    if(corpus?.line_count!==443||lineCount!==443)throw new Error('[HSK3 locked] expected 443 lines');
    if(corpus?.direct_uploaded_pdf_units!==76||corpus?.external_exception_units!==4)throw new Error('[HSK3 locked] source-tier counts mismatch');
    for(const u of corpus.units){
      if(!Number.isInteger(u.lesson)||u.lesson<1||u.lesson>20||!Number.isInteger(u.text_no)||u.text_no<1||u.text_no>4)throw new Error('[HSK3 locked] invalid unit coordinates');
      if(!Array.isArray(u.lines)||!u.lines.length)throw new Error('[HSK3 locked] empty unit '+u.id);
      for(const x of u.lines)if(!String(x.zh||'').trim()||!String(x.py||'').trim()||!String(x.vi||'').trim())throw new Error('[HSK3 locked] incomplete line '+u.id+':'+x.line_no);
    }
    const l18=corpus.units.filter(u=>u.lesson===18);
    if(l18.length!==4||!l18.every(u=>u.verification?.source==='locked_external_HSK3_source_text_crosscheck'))throw new Error('[HSK3 locked] Lesson 18 exception contract mismatch');
    const edit=corpus.units.find(u=>u.lesson===16&&u.text_no===4)?.lines?.find(x=>x.line_no===2)?.zh||'';
    if(!edit.includes('如果能多用一些“您好”“谢谢”这样的词语'))throw new Error('[HSK3 locked] reviewed Lesson 16 correction missing');
    return lineCount;
  }
  function apply(corpus,lineCount){
    const lessons=window.HSK3_LESSONS;
    if(!Array.isArray(lessons)||lessons.length!==20)throw new Error('[HSK3 locked] base course not ready');
    for(let lesson=1;lesson<=20;lesson++){
      const L=lessons.find(x=>Number(x.id)===lesson);
      const units=corpus.units.filter(u=>u.lesson===lesson).sort((a,b)=>a.text_no-b.text_no);
      if(!L||units.length!==4||units.some((u,i)=>u.text_no!==i+1))throw new Error('[HSK3 locked] lesson '+lesson+' does not contain four canonical units');
      L.title=units[0].lesson_title_zh||L.title;
      L.scenes=units.map(u=>({
        id:u.id,text_no:u.text_no,type:u.type,place:u.title_zh||`课文${u.text_no}`,place_vn:u.title_vi||'',title:u.title_zh||'',vn:u.title_vi||'',
        source:u.source,verification:u.verification,title_status:u.title_status,locked:true,
        lines:u.lines.map(x=>({s:x.speaker||'',spk:x.speaker||'',speaker:x.speaker||'',zh:x.zh,py:x.py,vn:x.vi,locked:true,source_printed_page:x.source_printed_page,source_pdf_page:x.source_pdf_page??null}))
      }));
      L.textbookLocked=true;L.textbookCorpusId=CORPUS_ID;L.textbookTextUnits=4;
    }
    const contract={ok:true,corpus_id:CORPUS_ID,source_pdf_sha256:SOURCE_SHA,source_pdf_pages:207,lessons:20,text_units:80,lines:lineCount,direct_uploaded_pdf_units:76,direct_uploaded_pdf_lines:424,external_exception_units:4,external_exception_lines:19,lesson18_missing_printed_pages:[168,169],vi_mode:'editorial_translation_reviewed'};
    window.__HSK3_TEXTBOOK_LOCKED=contract;
    if(typeof document!=='undefined')document.documentElement.dataset.hsk3TextbookLocked='ok';
    for(const k of ['__HSK3_LOCKED_B64_1','__HSK3_LOCKED_B64_2','__HSK3_LOCKED_B64_3','__HSK3_LOCKED_B64_4A','__HSK3_LOCKED_B64_4B','__HSK3_LOCKED_B64_4C','__HSK3_LOCKED_B64_4D'])delete window[k];
    return contract;
  }
  window.HSK3_TEXTBOOK_LOCKED_READY=(async()=>{const corpus=await unpack();const n=validateCorpus(corpus);return apply(corpus,n)})();
})();
