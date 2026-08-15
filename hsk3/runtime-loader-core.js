/* Robust HSK3 runtime bootstrap. */
(()=>{
  'use strict';
  const BUILD='20260815-hsk3-locked-1';
  const isLesson=()=>!!document.getElementById('lessonTitle');
  const qs=s=>document.querySelector(s);
  const domReady=()=>document.readyState==='loading'?new Promise(r=>document.addEventListener('DOMContentLoaded',r,{once:true})):Promise.resolve();
  const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));

  function showFatal(err){
    console.error('[HSK3 bootstrap]',err);
    document.documentElement.dataset.hsk3Runtime='error';
    const msg='HSK 3 tải dữ liệu thất bại: '+(err?.message||String(err));
    const stat=qs('#wordStat');if(stat)stat.textContent='!';
    const grid=qs('#lessonGrid');
    if(grid)grid.innerHTML='<div style="grid-column:1/-1;padding:18px 20px;border:1px solid #e7b6a7;border-radius:14px;background:#fff6f2;color:#8c2f16;line-height:1.65"><b>Không tải được dữ liệu HSK 3.</b><br>'+escapeHtml(msg)+'<br><small>Hãy tải lại trang. Nếu lỗi vẫn còn, vui lòng báo giáo viên.</small></div>';
    const container=qs('.lesson-container');
    if(container&&!qs('#hsk3RuntimeError')){const box=document.createElement('div');box.id='hsk3RuntimeError';box.style.cssText='margin:18px 0;padding:18px 20px;border:1px solid #e7b6a7;border-radius:14px;background:#fff6f2;color:#8c2f16;line-height:1.65';box.innerHTML='<b>Không tải được dữ liệu HSK 3.</b><br>'+escapeHtml(msg);container.prepend(box)}
  }

  async function getCompressedBytes(){
    const res=await fetch('data.js?bootstrap='+BUILD,{cache:'no-store'});
    if(!res.ok)throw new Error('data.js HTTP '+res.status);
    const src=await res.text();
    const m=src.match(/atob\(\s*['"]([A-Za-z0-9+/=]+)['"]\s*\)/);
    if(!m)throw new Error('không tìm thấy gói dữ liệu trong data.js');
    const bin=atob(m[1]),out=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);
    return out;
  }

  function loadScript(src,external=false){
    return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src+(src.includes('?')?'&':'?')+(external?'hsk3fallback=':'bootstrap=')+BUILD;s.async=false;s.onload=resolve;s.onerror=()=>reject(new Error('không tải được '+src));document.head.appendChild(s)});
  }

  async function ensurePako(){
    if(window.pako?.ungzip)return;
    const urls=['https://cdn.jsdelivr.net/npm/pako@2.1.0/dist/pako.min.js','https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js','https://unpkg.com/pako@2.1.0/dist/pako.min.js'];
    for(const u of urls){try{await loadScript(u,true);if(window.pako?.ungzip)return}catch(e){console.warn('[HSK3] pako fallback failed',u,e)}}
    throw new Error('trình duyệt không hỗ trợ gzip và không tải được pako');
  }

  async function gunzip(bytes){
    if(typeof DecompressionStream==='function'){
      const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
      return new TextDecoder('utf-8',{fatal:true}).decode(await new Response(stream).arrayBuffer());
    }
    await ensurePako();
    return new TextDecoder('utf-8',{fatal:true}).decode(window.pako.ungzip(bytes));
  }

  function normalize(raw){
    if(Array.isArray(raw))return raw;
    if(Array.isArray(raw?.lessons))return raw.lessons;
    if(Array.isArray(raw?.HSK3_LESSONS))return raw.HSK3_LESSONS;
    if(raw&&typeof raw==='object'){
      const vals=Object.values(raw);
      if(vals.length===20&&vals.every(x=>x&&typeof x==='object'&&'id'in x))return vals.sort((a,b)=>a.id-b.id);
    }
    return raw;
  }

  function validate(raw){
    const data=normalize(raw);
    if(!Array.isArray(data))throw new Error('dữ liệu bài học không phải mảng');
    if(data.length!==20)throw new Error('số bài HSK 3 = '+data.length+', cần 20');
    const ids=new Set();
    for(const L of data){
      if(!Number.isInteger(L?.id)||L.id<1||L.id>20)throw new Error('ID bài không hợp lệ');
      if(ids.has(L.id))throw new Error('trùng ID bài '+L.id);ids.add(L.id);
      if(!String(L.title||'').trim())throw new Error('Bài '+L.id+' thiếu tiêu đề');
      if(!Array.isArray(L.vocab)||!L.vocab.length)throw new Error('Bài '+L.id+' thiếu từ vựng');
      if(L.vocab.some(v=>!String(v?.zh||'').trim()||!String(v?.vn||'').trim()))throw new Error('Bài '+L.id+' có mục từ thiếu dữ liệu');
      if(!Array.isArray(L.grammar)||!L.grammar.length)throw new Error('Bài '+L.id+' thiếu ngữ pháp');
      if(L.grammar.some(g=>!Array.isArray(g?.examples)||!g.examples.length))throw new Error('Bài '+L.id+' có điểm ngữ pháp thiếu ví dụ');
      if(!Array.isArray(L.scenes)||L.scenes.length<2)throw new Error('Bài '+L.id+' thiếu tình huống');
      L.scenes.forEach((s,i)=>{if(!Array.isArray(s?.lines)||!s.lines.length)throw new Error('Bài '+L.id+' tình huống '+(i+1)+' thiếu câu')});
      for(let i=0;i<2;i++)if(L.scenes[i].lines.length<2)throw new Error('Bài '+L.id+' tình huống '+(i+1)+' chưa đủ câu cho luyện tập');
    }
    for(let i=1;i<=20;i++)if(!ids.has(i))throw new Error('thiếu Bài '+i);
    return data;
  }

  function applyTextbookVocabContract(){
    const lessons=window.HSK3_LESSONS||[];
    const L9=lessons.find(L=>L.id===9),zhongwen=L9?.vocab?.find(v=>v.zh==='中文');
    if(!zhongwen)throw new Error('HSK3 vocab contract: Bài 9 thiếu 中文');
    zhongwen.properName=true;zhongwen.kind='proper';zhongwen.pos='danh từ riêng';
    if(window.HSK3_AUDIT_META?.proper){const p=window.HSK3_AUDIT_META.proper;p[9]=Array.from(new Set([...(p[9]||[]),'中文']))}
    for(const L of lessons)for(const v of L.vocab||[]){if(v.properName)v.kind='proper';else if(v.aboveLevel)v.kind='supplement';else v.kind='core'}
    const words=lessons.reduce((n,L)=>n+L.vocab.length,0);
    const properCount=lessons.reduce((n,L)=>n+L.vocab.filter(v=>v.properName).length,0);
    const supplementCount=lessons.reduce((n,L)=>n+L.vocab.filter(v=>v.aboveLevel).length,0);
    const coreCount=lessons.reduce((n,L)=>n+L.vocab.filter(v=>!v.properName&&!v.aboveLevel).length,0);
    const ok=words===325&&properCount===13&&supplementCount===13&&coreCount===299;
    window.__HSK3_VOCAB_CONTRACT={version:'2026-08-15-vocab-1',ok,words,coreCount,supplementCount,properCount};
    document.documentElement.dataset.hsk3VocabContract=ok?'ok':'error';
    if(!ok)throw new Error(`HSK3 vocab contract failed: total=${words}, core=${coreCount}, supplement=${supplementCount}, proper=${properCount}`);
  }

  function verifyHome(){
    const cards=[...document.querySelectorAll('#lessonGrid .lesson-card')];
    if(cards.length!==20)throw new Error('trang chủ chỉ dựng được '+cards.length+'/20 thẻ bài học');
    const links=[...document.querySelectorAll('#lessonGrid a[href*="lesson.html?id="]')];
    if(links.length<120)throw new Error('thiếu liên kết vào các phần bài học');
    const word=qs('#wordStat');if(!word||!/^\d+$/.test(word.textContent.trim()))throw new Error('không tính được tổng số từ');
    if(!window.__HSK3_TEXTBOOK_LOCKED?.ok)throw new Error('locked textbook corpus chưa sẵn sàng');
  }

  function verifyLesson(){
    if(document.querySelectorAll('#lessonSelect option').length!==20)throw new Error('danh sách chọn bài không đủ 20 bài');
    if(!qs('#lessonTitle')?.textContent.trim())throw new Error('tiêu đề bài học chưa render');
    if(!qs('#vocabGrid')?.children.length)throw new Error('từ vựng chưa render');
    if(!qs('#grammarList')?.children.length)throw new Error('ngữ pháp chưa render');
    if(!qs('#basicPractice')?.children.length)throw new Error('luyện tập chưa render');
    if(!window.__HSK3_TEXTBOOK_LOCKED?.ok)throw new Error('locked textbook corpus chưa sẵn sàng');
    if(!L?.textbookLocked||L.scenes?.length!==4)throw new Error('bài khoá chưa được thay bằng 4 đơn vị canonical');
    if(L.scenes.some(s=>!s.locked||!s.lines?.length||s.lines.some(x=>!x.locked||!x.zh||!x.py||!x.vn)))throw new Error('bài khoá canonical thiếu trường bắt buộc');
    if(qs('#auditTextbookSource')||qs('#auditVocabSummary')||qs('#auditGrammarNote'))throw new Error('metadata kiểm định không được hiển thị cho học viên');
    if(!qs('#practice .practice-note'))throw new Error('练习区未渲染');
  }

  async function boot(){
    try{
      window.HSK3_LESSONS=validate(JSON.parse(await gunzip(await getCompressedBytes())));
      window.__HSK3_DATA_READY=true;
      await domReady();
      await loadScript('corrections.js');
      await loadScript('textbook-baseline.js');
      await loadScript('textbook-audit.js');
      if(!window.__HSK3_CONTENT_AUDITED)throw new Error('textbook audit chưa khởi tạo');
      applyTextbookVocabContract();
      await loadScript('textbook-locked-data.js');
      await loadScript('textbook-locked.js');
      await window.HSK3_TEXTBOOK_LOCKED_READY;
      if(!window.__HSK3_TEXTBOOK_LOCKED?.ok)throw new Error('locked textbook corpus integrity failed');
      await loadScript('app-core.js');
      await loadScript('../assets/session-auth.js');
      if(isLesson())await loadScript('../assets/hsk2-parity.js');
      await loadScript('app-practice.js');
      await loadScript('textbook-audit-ui.js');
      if(isLesson())await loadScript('textbook-locked-ui.js');
      if(typeof initGate!=='function')throw new Error('app-core chưa khởi tạo');
      initGate();
      if(isLesson()){
        if(typeof initLesson!=='function')throw new Error('initLesson không tồn tại');
        initLesson();await new Promise(r=>setTimeout(r,0));verifyLesson();
        await loadScript('../assets/lesson-menu-parity.js');
        await loadScript('../assets/hanzi-curriculum.js');
      }else{
        if(typeof renderHome!=='function')throw new Error('renderHome không tồn tại');
        renderHome();verifyHome();
      }
      const words=window.HSK3_LESSONS.reduce((n,L)=>n+L.vocab.length,0);
      const coreWords=window.HSK3_LESSONS.reduce((n,L)=>n+L.vocab.filter(v=>!v.properName&&!v.aboveLevel).length,0);
      window.__HSK3_DIAGNOSTICS={ok:true,build:BUILD,lessons:window.HSK3_LESSONS.length,words,coreWords,page:isLesson()?'lesson':'home',contentAudited:true,textbookLocked:window.__HSK3_TEXTBOOK_LOCKED,vocabContract:window.__HSK3_VOCAB_CONTRACT};
      document.documentElement.dataset.hsk3Runtime='ok';window.__HSK3_RUNTIME_OK=true;
      console.info('[HSK3 bootstrap] OK',window.__HSK3_DIAGNOSTICS);
    }catch(err){showFatal(err)}
  }
  boot();
})();
