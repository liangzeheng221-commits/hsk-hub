/* Textbook-completeness and content-audit layer for HSK2. */
(()=>{
  const lessons=window.HSK2_LESSONS||[];
  if(!Array.isArray(lessons)||!lessons.length)return;
  const SUPPLEMENT={2:['米'],3:['粉色','粉'],4:['接'],6:['自行车','经常','公斤'],7:['过'],9:['欢迎'],12:['度'],13:['拿','班','长','一直'],15:['更']};
  const PROPER={1:['花花'],13:['杨笑笑']};
  const phonetics={
    1:{title:'双音节词语的重音',vn:'Trọng âm của từ hai âm tiết',points:['中重格式：前一音节读得相对较轻，后一音节重读。','重轻格式：前一音节重读，后一音节读轻声。']},
    2:{title:'三音节词语的重音',vn:'Trọng âm của từ ba âm tiết',points:['中轻重格式。','中重轻格式。','重轻轻格式。']},
    3:{title:'四音节词语的重音',vn:'Trọng âm của từ bốn âm tiết',points:['不含轻声音节的四音节词语。','含轻声音节的四音节词语。']},
    4:{title:'句子的语法重音（1）',vn:'Trọng âm ngữ pháp của câu (1)',points:['谓语重读。','补语重读。']},
    5:{title:'句子的语法重音（2）',vn:'Trọng âm ngữ pháp của câu (2)',points:['定语重读。','状语重读。']},
    6:{title:'句子的逻辑重音',vn:'Trọng âm logic của câu',points:['根据说话人要突出、对比或纠正的信息调整重音；同一句话重音位置不同，信息焦点也会不同。']},
    7:{title:'汉语的基本句调',vn:'Ngữ điệu cơ bản của câu tiếng Trung',points:['结合语义、语气和句末走向认识汉语基本句调，为后续不同句型的语调练习打基础。']},
    8:{title:'陈述句的句调',vn:'Ngữ điệu của câu trần thuật',points:['陈述句通常以平稳、完整的语调表达信息，句末常呈自然收束。']},
    9:{title:'是非疑问句的句调',vn:'Ngữ điệu của câu hỏi đúng/sai',points:['用“吗”等构成的是非问句要结合疑问语气练习句末语调。']},
    10:{title:'特指问句的句调',vn:'Ngữ điệu của câu hỏi có đại từ nghi vấn',points:['含“谁、什么、哪儿、怎么”等疑问词的特指问句按教材句调练习，疑问信息焦点通常落在疑问词及相关成分。']},
    11:{title:'正反问句的句调',vn:'Ngữ điệu của câu hỏi khẳng định–phủ định',points:['练习“是不是、去不去、有没有”等正反问句的整体句调。']},
    12:{title:'选择问句的句调',vn:'Ngữ điệu của câu hỏi lựa chọn',points:['选择项之间和句末的语调共同标示“二选一/多选一”的提问关系。']},
    13:{title:'祈使句的句调',vn:'Ngữ điệu của câu cầu khiến',points:['请求、劝告、命令等语气强弱不同，祈使句的重音和句调也随之变化。']},
    14:{title:'感叹句的句调',vn:'Ngữ điệu của câu cảm thán',points:['感叹句通过重音、音高和句末语调表达惊讶、赞叹等情感。']},
    15:{title:'用“吧”和“吗”构成的疑问句的句调',vn:'Ngữ điệu của câu hỏi dùng 吧 và 吗',points:['比较“吧”与“吗”问句的语气差别，并结合句末语调理解确认、征询与一般疑问。']}
  };
  const cultures={
    5:{title:'文化：中国人的餐桌礼仪',vn_title:'Văn hóa: Phép lịch sự trên bàn ăn của người Trung Quốc',body:'教材在本课安排餐桌礼仪文化。学习时可关注入座、敬让、夹菜与使用筷子等交际细节；具体习惯会因地区、家庭和场合而不同。',vn:'Giáo trình giới thiệu phép lịch sự trên bàn ăn. Khi học có thể chú ý cách ngồi, nhường mời, gắp thức ăn và dùng đũa; tập quán cụ thể có thể khác theo vùng, gia đình và hoàn cảnh.'},
    10:{title:'文化：中国的茶文化',vn_title:'Văn hóa: Văn hóa trà của Trung Quốc',body:'茶既是日常饮品，也常出现在待客与社交场景中。不同地区有不同饮茶习惯，学习时重点掌握“喝茶、请喝茶”等交际表达。',vn:'Trà vừa là đồ uống hằng ngày, vừa thường xuất hiện khi tiếp khách và giao tiếp. Mỗi vùng có thói quen uống trà khác nhau; phần học tập trung vào các cách nói như “喝茶、请喝茶”.'},
    15:{title:'文化：中国的“新年”——春节',vn_title:'Văn hóa: “Năm mới” của Trung Quốc — Tết Nguyên đán',body:'春节是重要的传统节日，常见活动包括家庭团聚、拜年、贴春联等；饮食和庆祝方式因地区而异。',vn:'Tết Nguyên đán là một lễ hội truyền thống quan trọng, thường có đoàn tụ gia đình, chúc Tết và dán câu đối xuân; món ăn và cách ăn mừng thay đổi theo từng vùng.'}
  };
  const hanzi={
    1:{strokes:'汉字的笔画（7）',chars:'为、也',radicals:'王、足'},
    2:{strokes:'汉字的笔画（8）',chars:'生、高',radicals:'艹、火'},
    3:{strokes:'汉字的笔画（9）',chars:'手、丈、夫',radicals:'木、刂'},
    4:{strokes:'汉字的笔画（10）',chars:'两、乐、长',radicals:'纟、忄'},
    5:{chars:'鱼、衣',radicals:'弓、广'},
    6:{chars:'门、羊',radicals:'扌、心'},
    7:{radicals:'亻、父'},8:{radicals:'又、巾'},9:{radicals:'土、灬'},10:{radicals:'走、穴'},11:{radicals:'户、冫'},12:{radicals:'止、门'},13:{radicals:'斤、页'},14:{radicals:'雨、贝'},15:{radicals:'山、大'}
  };

  function textOfExercise(L){return JSON.stringify({mc:L.mc||[],fills:L.fills||[],fixes:L.fixes||[],sorts:L.sorts||[]})}
  function addCoverageMC(L){
    const core=(L.vocab||[]).filter(v=>v.kind==='core');let corpus=textOfExercise(L);L.mc=L.mc||[];
    core.forEach(w=>{if(corpus.includes(w.zh))return;const ds=core.filter(x=>x.zh!==w.zh).map(x=>x.vn).filter((x,j,a)=>a.indexOf(x)===j).slice(0,3);if(ds.length<3){for(const x of lessons.flatMap(k=>k.vocab||[])){if(x.kind==='core'&&x.zh!==w.zh&&!ds.includes(x.vn))ds.push(x.vn);if(ds.length===3)break}}
      L.mc.push({q:`“${w.zh}” (${w.py}) nghĩa là gì?`,opts:[w.vn,...ds.slice(0,3)],ans:w.vn,hint:'Từ trọng tâm của đúng bài này.',audit_generated:true});corpus+=w.zh;
    });
  }
  lessons.forEach(L=>{
    const sid=Number(L.id),supp=new Set(SUPPLEMENT[sid]||[]),proper=new Set(PROPER[sid]||[]);
    (L.vocab||[]).forEach(v=>{v.kind=proper.has(v.zh)?'proper':supp.has(v.zh)?'supplement':'core';v.kind_label=v.kind==='proper'?'专名 · Tên riêng':v.kind==='supplement'?'★ 教材补充词 · Từ bổ sung':'核心词 · Từ trọng tâm';if(!v._audit_pos){v.base_pos=v.pos||'';v.pos=v.kind==='proper'?`专名 · Tên riêng${v.base_pos?' · '+v.base_pos:''}`:v.kind==='supplement'?`★ 补充词${v.base_pos?' · '+v.base_pos:''}`:v.base_pos;v._audit_pos=true}});
    L.coreVocabCount=(L.vocab||[]).filter(v=>v.kind==='core').length;L.phonetics=[phonetics[sid]];L.textbookHanzi=hanzi[sid];if(cultures[sid])L.culture=cultures[sid];addCoverageMC(L);
  });

  if(typeof document==='undefined')return;
  const esc2=s=>typeof esc==='function'?esc(s):String(s??'');
  document.querySelectorAll('.section-tab[data-sec="grammar"]').forEach(b=>b.textContent='Ngữ âm & Ngữ pháp');
  const gh=document.querySelector('#grammar .section-head h2');if(gh)gh.textContent='NGỮ ÂM & NGỮ PHÁP — 语音与语言点';
  if(typeof SECTION_LABELS!=='undefined')SECTION_LABELS.grammar='Ngữ âm & Ngữ pháp · 语音与语言点';

  if(typeof renderGrammar==='function'){
    const base=renderGrammar;
    renderGrammar=function(){base();const list=document.getElementById('grammarList');if(!list||typeof L==='undefined')return;const p=L.phonetics?.[0];if(p){const box=document.createElement('section');box.className='audit-block phonetics-block';box.innerHTML=`<div class="audit-block-head"><b>语音 · NGỮ ÂM</b><span>教材重点</span></div><h3>${esc2(p.title)}</h3><div class="audit-vn-title">${esc2(p.vn)}</div><ol>${p.points.map(x=>`<li>${esc2(x)}</li>`).join('')}</ol>`;list.prepend(box)}if(L.culture){const c=L.culture,box=document.createElement('section');box.className='audit-block culture-block';box.innerHTML=`<div class="audit-block-head"><b>文化 · VĂN HÓA</b><span>Bài ${L.id}</span></div><h3>${esc2(c.title)}</h3><div class="audit-vn-title">${esc2(c.vn_title)}</div><p>${esc2(c.body)}</p><p class="audit-vn-body">${esc2(c.vn)}</p>`;list.appendChild(box)}const chip=document.getElementById('grammarChip');if(chip)chip.textContent=`${L.grammar.length} cấu trúc + ngữ âm`};
  }
  function renderTextbookHanzi(){if(typeof L==='undefined'||!L.textbookHanzi)return;const map=document.getElementById('hanziWordMap');if(!map)return;let box=document.getElementById('hsk2TextbookHanzi');if(!box){box=document.createElement('section');box.id='hsk2TextbookHanzi';box.className='textbook-hanzi-focus audit-hanzi';map.before(box)}const h=L.textbookHanzi;box.innerHTML=`<div class="textbook-hanzi-head"><b>教材汉字重点 · Trọng điểm chữ Hán trong giáo trình</b><span>Bài ${L.id}</span></div><div class="textbook-hanzi-body">${h.strokes?`<div><span class="curriculum-label">笔画 · Nét</span><strong>${esc2(h.strokes)}</strong></div>`:''}${h.chars?`<div><span class="curriculum-label">独体字 · Chữ đơn</span><strong class="curriculum-chars">${esc2(h.chars)}</strong></div>`:''}${h.radicals?`<div><span class="curriculum-label">偏旁 · Bộ</span><strong class="curriculum-chars">${esc2(h.radicals)}</strong></div>`:''}</div>`}
  if(typeof renderHanziSection==='function'){const base=renderHanziSection;renderHanziSection=function(){const r=base();renderTextbookHanzi();return r}}
  else if(typeof renderHanzi==='function'){const base=renderHanzi;renderHanzi=function(){const r=base();renderTextbookHanzi();return r}}
})();
