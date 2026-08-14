/* Robust HSK3 runtime bootstrap.
   Reads the existing compressed data.js as text, decodes it with the browser's
   native gzip support (pako fallback), validates all 20 lessons, then loads the
   lesson runtime in a deterministic order. This prevents silent blank pages. */
(()=>{
  'use strict';
  const BUILD='20260814-1650';
  const isLesson=()=>!!document.getElementById('lessonTitle');
  const qs=s=>document.querySelector(s);
  const domReady=()=>document.readyState==='loading'
    ? new Promise(r=>document.addEventListener('DOMContentLoaded',r,{once:true}))
    : Promise.resolve();

  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function showFatal(err){
    console.error('[HSK3 bootstrap]',err);
    document.documentElement.dataset.hsk3Runtime='error';
    const msg='HSK 3 tải dữ liệu thất bại: '+(err?.message||String(err));
    const stat=qs('#wordStat'); if(stat) stat.textContent='!';
    const grid=qs('#lessonGrid');
    if(grid){
      grid.innerHTML='<div style="grid-column:1/-1;padding:18px 20px;border:1px solid #e7b6a7;border-radius:14px;background:#fff6f2;color:#8c2f16;line-height:1.65"><b>Không tải được dữ liệu HSK 3.</b><br>'+escapeHtml(msg)+'<br><small>Hãy tải lại trang. Nếu lỗi vẫn còn, vui lòng báo giáo viên.</small></div>';
    }
    const lessonContainer=qs('.lesson-container');
    if(lessonContainer && !qs('#hsk3RuntimeError')){
      const box=document.createElement('div'); box.id='hsk3RuntimeError';
      box.style.cssText='margin:18px 0;padding:18px 20px;border:1px solid #e7b6a7;border-radius:14px;background:#fff6f2;color:#8c2f16;line-height:1.65';
      box.innerHTML='<b>Không tải được dữ liệu HSK 3.</b><br>'+escapeHtml(msg);
      lessonContainer.prepend(box);
    }
  }

  async function getCompressedBytes(){
    const res=await fetch('data.js?bootstrap='+BUILD,{cache:'no-store'});
    if(!res.ok) throw new Error('data.js HTTP '+res.status);
    const src=await res.text();
    const m=src.match(/atob\(\s*['"]([A-Za-z0-9+/=]+)['"]\s*\)/);
    if(!m) throw new Error('không tìm thấy gói dữ liệu trong data.js');
    const bin=atob(m[1]);
    const out=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++) out[i]=bin.charCodeAt(i);
    return out;
  }

  async function gunzip(bytes){
    if(typeof DecompressionStream==='function'){
      const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
      const ab=await new Response(stream).arrayBuffer();
      return new TextDecoder('utf-8',{fatal:true}).decode(ab);
    }
    if(window.pako?.ungzip){
      return new TextDecoder('utf-8',{fatal:true}).decode(window.pako.ungzip(bytes));
    }
    throw new Error('trình duyệt không có bộ giải nén gzip');
  }

  function validate(data){
    if(!Array.isArray(data)) throw new Error('dữ liệu bài học không phải mảng');
    if(data.length!==20) throw new Error('số bài HSK 3 = '+data.length+', cần 20');
    const ids=new Set();
    for(const L of data){
      if(!Number.isInteger(L?.id)||L.id<1||L.id>20) throw new Error('ID bài không hợp lệ');
      if(ids.has(L.id)) throw new Error('trùng ID bài '+L.id); ids.add(L.id);
      if(!String(L.title||'').trim()) throw new Error('Bài '+L.id+' thiếu tiêu đề');
      if(!Array.isArray(L.vocab)||!L.vocab.length) throw new Error('Bài '+L.id+' thiếu từ vựng');
      if(!Array.isArray(L.grammar)||!L.grammar.length) throw new Error('Bài '+L.id+' thiếu ngữ pháp');
      if(!Array.isArray(L.scenes)||L.scenes.length<2) throw new Error('Bài '+L.id+' thiếu tình huống');
      for(let i=0;i<2;i++) if(!Array.isArray(L.scenes[i]?.lines)||L.scenes[i].lines.length<2) throw new Error('Bài '+L.id+' tình huống '+(i+1)+' thiếu câu');
    }
    for(let i=1;i<=20;i++) if(!ids.has(i)) throw new Error('thiếu Bài '+i);
    return data;
  }

  function loadScript(src){
    return new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.src=src+(src.includes('?')?'&':'?')+'bootstrap='+BUILD;
      s.async=false;
      s.onload=resolve;
      s.onerror=()=>reject(new Error('không tải được '+src));
      document.head.appendChild(s);
    });
  }

  function verifyHome(){
    const cards=[...document.querySelectorAll('#lessonGrid .lesson-card')];
    if(cards.length!==20) throw new Error('trang chủ chỉ dựng được '+cards.length+'/20 thẻ bài học');
    const links=[...document.querySelectorAll('#lessonGrid a[href*="lesson.html?id="]')];
    if(links.length<120) throw new Error('thiếu liên kết vào các phần bài học');
    const word=qs('#wordStat');
    if(!word||!/^\d+$/.test(word.textContent.trim())) throw new Error('không tính được tổng số từ');
  }

  function verifyLesson(){
    if(document.querySelectorAll('#lessonSelect option').length!==20) throw new Error('danh sách chọn bài không đủ 20 bài');
    if(!qs('#lessonTitle')?.textContent.trim()) throw new Error('tiêu đề bài học chưa render');
    if(!qs('#vocabGrid')?.children.length) throw new Error('từ vựng chưa render');
    if(!qs('#grammarList')?.children.length) throw new Error('ngữ pháp chưa render');
    if(!qs('#basicPractice')?.children.length) throw new Error('luyện tập chưa render');
  }

  async function boot(){
    try{
      const bytes=await getCompressedBytes();
      const json=await gunzip(bytes);
      window.HSK3_LESSONS=validate(JSON.parse(json));
      window.__HSK3_DATA_READY=true;

      await domReady();
      await loadScript('corrections.js');
      await loadScript('textbook-baseline.js');
      await loadScript('app-core.js');
      if(isLesson()) await loadScript('../assets/hsk2-parity.js');
      await loadScript('app-practice.js');

      if(typeof initGate!=='function') throw new Error('app-core chưa khởi tạo');
      initGate();
      if(isLesson()){
        if(typeof initLesson!=='function') throw new Error('initLesson không tồn tại');
        initLesson();
        verifyLesson();
        await loadScript('../assets/lesson-menu-parity.js');
        await loadScript('../assets/hanzi-curriculum.js');
      }else{
        if(typeof renderHome!=='function') throw new Error('renderHome không tồn tại');
        renderHome();
        verifyHome();
      }
      document.documentElement.dataset.hsk3Runtime='ok';
      window.__HSK3_RUNTIME_OK=true;
      console.info('[HSK3 bootstrap] OK: 20 lessons loaded and verified.');
    }catch(err){showFatal(err)}
  }
  boot();
})();
