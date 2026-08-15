/* HSK 4 上 textbook-detail renderer. Pure UI: never mutates lesson semantics. */
(()=>{
  'use strict';
  const escHtml=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const LABELS={
    position:'句法位置 · Vị trí cú pháp',
    collocation:'固定搭配 · Kết hợp',
    usage:'用法 · Cách dùng',
    restriction:'使用限制 · Giới hạn',
    discourse:'语境 · Ngữ cảnh',
    distinction:'辨析 · Phân biệt',
    note:'注意 · Lưu ý'
  };
  function currentLesson(){try{return typeof L!=='undefined'?L:null}catch{return null}}
  function addGrammarDetails(){
    const lesson=currentLesson(), list=document.getElementById('grammarList');
    if(!lesson||!list)return;
    const cards=[...list.querySelectorAll('.grammar-card')];
    (lesson.grammar||[]).forEach((g,i)=>{
      const card=cards[i];if(!card)return;
      card.querySelectorAll('.textbook-detail').forEach(x=>x.remove());
      const structures=Array.isArray(g.structures)?g.structures.filter(Boolean):[];
      const atoms=Array.isArray(g.rule_atoms)?g.rule_atoms.filter(x=>x&&x.text):[];
      const note=g.logic_note||g.textbook_note||'';
      if(!structures.length&&!atoms.length&&!note)return;
      const box=document.createElement('section');box.className='textbook-detail';
      let html='<div class="textbook-detail-head">教材用法细则 · Chi tiết theo giáo trình</div>';
      if(structures.length>1){
        html+='<div class="textbook-sub"><b>结构 · Cấu trúc</b><ol>'+structures.map(x=>`<li><code>${escHtml(x)}</code></li>`).join('')+'</ol></div>';
      }
      if(atoms.length){
        html+='<div class="textbook-sub"><b>规则 · Quy tắc</b><ul>'+atoms.map(a=>`<li><span class="rule-type">${escHtml(LABELS[a.type]||LABELS.note)}</span><span>${escHtml(a.text)}</span></li>`).join('')+'</ul></div>';
      }
      if(note)html+=`<div class="textbook-note"><b>说明 · Ghi chú</b><span>${escHtml(note)}</span></div>`;
      const source=g.source||{};
      if(source.book||source.lesson_start_page){
        const parts=[source.book,source.lesson?`第 ${source.lesson} 课`:'',source.lesson_start_page?`约第 ${source.lesson_start_page} 页起`:'' ].filter(Boolean);
        html+=`<div class="textbook-source">教材定位 · ${escHtml(parts.join(' · '))}</div>`;
      }
      box.innerHTML=html;card.appendChild(box);
    });
  }
  function addCompareDetails(){
    const lesson=currentLesson(),panel=document.getElementById('comparePanel');
    if(!lesson||!panel)return;
    panel.querySelectorAll('.compare-detail-table').forEach(x=>x.remove());
    const c=lesson.compare;if(!c||!Array.isArray(c.differences)||!c.differences.length)return;
    const names=String(c.title||'').split(/\s*[—–-]\s*/);const left=names[0]||'A',right=names[1]||'B';
    const wrap=document.createElement('div');wrap.className='compare-detail-table';
    wrap.innerHTML=`<div class="compare-detail-head">教材辨析 · So sánh chi tiết</div><div class="compare-grid"><div class="compare-th">比较点</div><div class="compare-th">${escHtml(left)}</div><div class="compare-th">${escHtml(right)}</div>${c.differences.map(d=>`<div class="compare-dim">${escHtml(d.dimension)}</div><div>${escHtml(d.left)}</div><div>${escHtml(d.right)}</div>`).join('')}</div>`;
    panel.appendChild(wrap);
  }
  function decorate(){addGrammarDetails();addCompareDetails();document.documentElement.dataset.hsk4UpperTextbookDetail='20260815-1'}
  if(typeof renderGrammar==='function'){
    const base=renderGrammar;
    window.renderGrammar=function(){const result=base.apply(this,arguments);decorate();return result};
  }
})();
