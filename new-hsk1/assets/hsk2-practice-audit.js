/* HSK2 practice fairness layer: core vocabulary only in matching; soft review for open correction answers. */
(()=>{
  if(typeof document==='undefined'||typeof L==='undefined')return;
  if(typeof renderMatch==='function'){
    const base=renderMatch;
    renderMatch=function(){const orig=L.vocab;L.vocab=orig.filter(v=>v.kind==='core');try{return base()}finally{L.vocab=orig}};
    try{renderMatch()}catch(e){console.warn('HSK2 core match rerender failed',e)}
  }
  if(typeof checkFix==='function')checkFix=function(){let ok=0,review=0;$$('.fix-input').forEach(inp=>{const q=L.fixes[+inp.dataset.i],answers=[q.correct,...(q.alts||[])],val=inp.value.trim(),good=answers.some(a=>norm(val)===norm(a));inp.classList.toggle('good',good);inp.classList.toggle('bad',!good&&!val);inp.classList.toggle('review',!good&&!!val);const f=$('#ff-'+inp.dataset.i);if(good){f.innerHTML='✅ Khớp đáp án';f.className='feedback good';ok++}else if(!val){f.innerHTML=`⚠️ Chưa nhập câu.<div class="fix-why">Đáp án tham khảo: ${esc(q.correct)}</div>`;f.className='feedback bad'}else{f.innerHTML=`⚠️ Câu của bạn khác đáp án tham khảo.<div class="fix-why">Đáp án mẫu: ${esc(q.correct)}<br>${esc(q.why)}</div>`;f.className='feedback review';review++}});setScore(`Sửa câu: ${ok}/${L.fixes.length} khớp đáp án${review?` · ${review} câu cần đối chiếu`:''}`)};
})();