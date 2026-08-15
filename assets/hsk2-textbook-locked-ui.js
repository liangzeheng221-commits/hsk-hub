/* HSK2 textbook text renderer: canonical pinyin/translation only for the 60 locked textbook units. */
(()=>{
if(typeof window.renderScene!=='function'||typeof window.renderText!=='function')return;
window.renderScene=function(si=0){
  activeScene=si;$$('.scene-tab').forEach((b,i)=>b.classList.toggle('active',i===si));const s=L.scenes[si];
  const src=s.source?`<span class="locked-source">教材第 ${esc(s.source.printed_page)} 页 · locked</span>`:'';
  $('#scenePane').innerHTML=`<div class="dialogue"><div class="dialogue-head"><b>${esc(s.title)}</b><small>${esc(s.vn)}</small>${src}</div>${s.lines.map(x=>`<div class="dlg-line"><div class="speaker">${esc(x.spk)}</div><div class="dlg-copy"><div class="dlg-py">${esc(x.py||'')}</div><div class="dlg-zh">${esc(x.zh)}</div><div class="dlg-vn">${esc(x.vn)}</div></div><button class="speak" data-speech="${encodeURIComponent(x.zh)}" aria-label="Đọc câu">🔊</button></div>`).join('')}</div><div class="scene-controls"><span class="scene-position">Đoạn ${si+1}/4 · 教材全文 · nghe từng câu hoặc nghe cả đoạn</span><div class="scene-control-buttons"><button class="ghost-btn" onclick="renderScene(${Math.max(0,si-1)})" ${si===0?'disabled':''}>← Trước</button><button class="ghost-btn" onclick="speakScene(${si})">🔊 Nghe cả đoạn</button><button class="ghost-btn" onclick="renderScene(${Math.min(3,si+1)})" ${si===3?'disabled':''}>Sau →</button></div></div>`;
  $$('[data-speech]',$('#scenePane')).forEach(b=>b.onclick=()=>speak(decodeURIComponent(b.dataset.speech)));
};
window.renderText=function(){const tabs=$('#sceneTabs');tabs.innerHTML=L.scenes.map((s,i)=>`<button class="scene-tab ${i===0?'active':''}" onclick="renderScene(${i})">课文${['一','二','三','四'][i]} · ${esc(s.title)}</button>`).join('');renderScene(0)};
if(typeof L!=='undefined'&&L&&document.getElementById('sceneTabs'))renderText();
})();
