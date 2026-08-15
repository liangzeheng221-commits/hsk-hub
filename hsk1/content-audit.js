/* Textbook-completeness and content-audit layer for HSK1. */
(()=>{
  const lessons=window.HSK1_LESSONS||[];
  if(!Array.isArray(lessons)||!lessons.length)return;
  const get=id=>lessons.find(x=>Number(x.id)===Number(id));

  const SUPPLEMENT={1:['您'],5:['口'],6:['好吃'],7:['问'],13:['也','吧'],14:['啊'],15:['一起']};
  const PROPER={3:['李月','中国','美国'],10:['王方','谢朋'],13:['大卫'],14:['张']};

  const ensureVocab=(id,item)=>{const L=get(id);if(L&&!L.vocab.some(v=>v.zh===item.zh))L.vocab.push(item)};
  ensureVocab(3,{zh:'李月',py:'Lǐ Yuè',vn:'Lý Nguyệt (tên người)'});
  ensureVocab(3,{zh:'中国',py:'Zhōngguó',vn:'Trung Quốc'});
  ensureVocab(3,{zh:'美国',py:'Měiguó',vn:'Mỹ, Hoa Kỳ'});

  const phonetics={
    3:{title:'发音辨析与拼音规则（2）',vn:'Phân biệt phát âm và quy tắc pinyin (2)',points:[
      '声母 j、q、x 与 z、c、s 的发音辨析。',
      '韵母 i、u、ü 的发音辨析。',
      '“不”的变调：在第四声音节前常读 bú；书写仍标本调 bù。',
      'ü 以及以 ü 开头的韵母跟 j、q、x 相拼时，书写省去两点。'
    ]},
    4:{title:'发音辨析、“一”的变调与拼音规则（3）',vn:'Phân biệt phát âm, biến điệu của 一 và quy tắc pinyin (3)',points:[
      '声母 zh、ch、sh、r 的发音辨析。',
      '前鼻音韵母与后鼻音韵母的辨析。',
      '“一”的变调：根据后一个音节的声调发生读音变化。',
      '拼音规则（3）：y、w 的使用规则。'
    ]},
    5:{title:'儿化、送气/不送气与拼音规则（4）',vn:'Âm cuốn lưỡi, âm bật hơi/không bật hơi và quy tắc pinyin (4)',points:[
      '儿化的发音。',
      '以 i、u、ü 开头的韵母发音辨析。',
      '送气音与不送气音的辨析。',
      '拼音规则（4）：隔音符号的使用。'
    ]},
    6:{title:'双音节词语的声调搭配（1）',vn:'Phối hợp thanh điệu của từ hai âm tiết (1)',points:['第一声音节 + 第一/二/三/四声音节。']},
    7:{title:'双音节词语的声调搭配（2）',vn:'Phối hợp thanh điệu của từ hai âm tiết (2)',points:['第二声音节 + 第一/二/三/四声音节。']},
    8:{title:'双音节词语的声调搭配（3）',vn:'Phối hợp thanh điệu của từ hai âm tiết (3)',points:['第三声音节 + 第一/二/三/四声音节。']},
    9:{title:'双音节词语的声调搭配（4）',vn:'Phối hợp thanh điệu của từ hai âm tiết (4)',points:['第四声音节 + 第一/二/三/四声音节。']},
    10:{title:'轻声、叠音词与带后缀词的读法',vn:'Cách đọc thanh nhẹ, từ láy và từ có hậu tố',points:[
      '轻声音节的读法。',
      '叠音词的读法。',
      '带后缀词的读法：如“-们”“-子”“-头”等。'
    ]},
    11:{title:'轻声的功能',vn:'Chức năng của thanh nhẹ',points:['轻声除了使音节读得短而轻，还可在部分词语中帮助形成固定的词汇读法与语流节奏。']},
    12:{title:'三音节词语的声调搭配（1）',vn:'Phối hợp thanh điệu của từ ba âm tiết (1)',points:['以第一声音节开头的三音节词语声调搭配。']},
    13:{title:'三音节词语的声调搭配（2）',vn:'Phối hợp thanh điệu của từ ba âm tiết (2)',points:['以第二声音节开头的三音节词语声调搭配。']},
    14:{title:'三音节词语的声调搭配（3）',vn:'Phối hợp thanh điệu của từ ba âm tiết (3)',points:['以第三声音节开头的三音节词语声调搭配。']},
    15:{title:'三音节词语的声调搭配（4）',vn:'Phối hợp thanh điệu của từ ba âm tiết (4)',points:['以第四声音节开头的三音节词语声调搭配。']}
  };

  const cultures={
    5:{title:'文化：中国人对年龄的询问方法',vn_title:'Văn hóa: Cách hỏi tuổi của người Trung Quốc',body:'询问年龄时会根据对象和场合选择不同表达。对儿童常用“几岁”，一般询问可用“多大”；面对长者或正式场合更注意礼貌和称呼。',vn:'Khi hỏi tuổi, cách nói thay đổi theo đối tượng và hoàn cảnh. Với trẻ em thường dùng “几岁”, câu hỏi thông thường dùng “多大”; với người lớn tuổi hoặc trong hoàn cảnh trang trọng cần chú ý cách xưng hô và mức độ lịch sự.'},
    10:{title:'文化：中国人姓名的特点',vn_title:'Văn hóa: Đặc điểm họ tên người Trung Quốc',body:'汉语姓名通常姓在前、名在后。交际中常见“姓 + 老师/先生/女士”等称呼方式；本课出现的王方、谢朋属于人名。',vn:'Tên người Trung Quốc thường đặt họ trước, tên sau. Trong giao tiếp thường gặp cách xưng hô “họ + 老师/先生/女士”; 王方 và 谢朋 trong bài là tên người.'},
    15:{title:'文化：中国人经常使用的通信工具',vn_title:'Văn hóa: Các phương tiện liên lạc thường dùng',body:'电话、手机和网络通信等都是日常联系的重要方式。学习相关表达时要区分“打电话、给……打电话”等常用搭配。',vn:'Điện thoại, điện thoại di động và các hình thức liên lạc qua mạng đều là phương tiện liên lạc hằng ngày. Khi học cần phân biệt các kết hợp thường dùng như “打电话” và “给……打电话”.'}
  };

  const posSets={
    '代词':new Set(['你','您','你们','我','我们','他','她','谁','什么','哪','哪儿','那儿','这儿','几','多少','怎么','怎么样','这','那','这些']),
    '数词':new Set(['一','二','三','四','五','六','七','八','九','十','零']),
    '量词':new Set(['个','本','口','岁','块','些']),
    '数量词':new Set(['一点儿']),
    '方位词':new Set(['上','下','里','前面','后面','下面','前','后']),
    '时间词':new Set(['今天','昨天','明天','今年','现在','上午','中午','下午','星期','月','年','时候','分钟','点','分','号']),
    '副词':new Set(['不','没','很','太','也','都','再','一起','多']),
    '能愿动词':new Set(['会','能','想']),
    '助词':new Set(['的','吗','呢','了','吧','啊']),
    '连词':new Set(['和']),
    '介词':new Set(['给']),
    '叹词':new Set(['喂']),
    '形容词':new Set(['好','大','小','高兴','冷','热','漂亮','好吃','少']),
    '动词':new Set(['是','在','吃饭','爱','吃','喝','打电话','读','工作','回','叫','开','看','看见','来','买','去','请','请问','认识','睡觉','说','说话','听','喜欢','下雨','写','谢谢','学习','有','没有','住','坐','做','问','出','回来']),
    '专名':new Set(['北京','中国','美国','王方','谢朋','大卫','张']),
    '固定表达':new Set(['对不起','没关系','不客气','再见'])
  };
  const posLabel={
    '代词':'代词 · Đại từ','数词':'数词 · Số từ','量词':'量词 · Lượng từ','数量词':'数量词 · Cụm số lượng','方位词':'方位词 · Từ chỉ phương vị','时间词':'时间词 · Từ chỉ thời gian','副词':'副词 · Phó từ','能愿动词':'能愿动词 · Động từ năng nguyện','助词':'助词 · Trợ từ','连词':'连词 · Liên từ','介词':'介词 · Giới từ','叹词':'叹词 · Thán từ','形容词':'形容词 · Tính từ','动词':'动词 · Động từ','专名':'专名 · Tên riêng','固定表达':'固定表达 · Cụm cố định','名词':'名词 · Danh từ'
  };
  function getPos(zh){for(const [k,s] of Object.entries(posSets))if(s.has(zh))return posLabel[k];return posLabel['名词']}

  lessons.forEach(L=>{
    const sid=Number(L.id);
    if(phonetics[sid])L.phonetics=[phonetics[sid]];
    if(cultures[sid])L.culture=cultures[sid];
    const supp=new Set(SUPPLEMENT[sid]||[]),proper=new Set(PROPER[sid]||[]);
    (L.vocab||[]).forEach(v=>{
      v.kind=proper.has(v.zh)?'proper':supp.has(v.zh)?'supplement':'core';
      v.pos=v.pos||getPos(v.zh);
      if(v.kind==='proper')v.pos=posLabel['专名'];
      v.kind_label=v.kind==='proper'?'专名 · Tên riêng':v.kind==='supplement'?'★ 教材补充词 · Từ bổ sung':'核心词 · Từ trọng tâm';
    });
    L.coreVocabCount=(L.vocab||[]).filter(v=>v.kind==='core').length;
  });

  const L8=get(8),kuai=L8?.vocab?.find(v=>v.zh==='块');
  if(kuai){kuai.vn='đồng/tệ (cách nói khẩu ngữ của 元; trong bài này dùng chỉ đơn vị tiền)';kuai.note='本课目标义：货币单位“块”，口语中相当于“元”。'}
  const L11=get(11);
  if(L11){for(const s of L11.scenes||[])for(const line of s.lines||[])if(line.zh==='我星期一去北京。')line.vn='Thứ hai tôi đi Bắc Kinh.'}
  const L2=get(2),bukeqi=L2?.vocab?.find(v=>v.zh==='不客气');
  if(bukeqi)bukeqi.note='“不”的本调是 bù；在“不客气”中受后面第四声影响，实际常读 bú kèqi。';

  if(typeof document==='undefined')return;

  function badgeHTML(v){return `<span class="audit-badge ${v.kind}">${typeof esc==='function'?esc(v.kind_label):v.kind_label}</span><span class="audit-pos">${typeof esc==='function'?esc(v.pos):v.pos}</span>`}
  function renderProperPanel(){
    if(typeof L==='undefined'||!L)return;document.getElementById('hsk1ProperPanel')?.remove();
    const term=String(document.getElementById('vSearch')?.value||'').trim().toLowerCase();
    const proper=(L.vocab||[]).filter(v=>v.kind==='proper').filter(v=>!term||[v.zh,v.py,v.vn].some(x=>String(x||'').toLowerCase().includes(term)));
    if(!proper.length)return;const panel=document.createElement('section');panel.id='hsk1ProperPanel';panel.className='proper-name-panel';
    panel.innerHTML=`<div class="proper-name-head"><b>专有名词 · Danh từ riêng</b><span>${proper.length}</span></div><div class="proper-name-list">${proper.map(v=>`<button type="button" data-zh="${esc(v.zh)}"><b>${esc(v.zh)}</b><span>${esc(v.py)}</span><small>${esc(v.vn)}</small></button>`).join('')}</div>`;
    document.getElementById('vocabGrid')?.after(panel);panel.querySelectorAll('button').forEach(b=>b.onclick=()=>{const v=L.vocab.find(x=>x.zh===b.dataset.zh);if(v)showWordDetail(v)});
  }
  function decorateCards(){
    document.querySelectorAll('.vocab-card[data-zh]').forEach(card=>{
      const v=(typeof L!=='undefined'&&L?.vocab||[]).find(x=>x.zh===card.dataset.zh);if(!v)return;
      card.style.display=v.kind==='proper'?'none':'';card.classList.toggle('audit-extra',v.kind==='supplement');
      card.querySelectorAll('.vocab-face').forEach(face=>{if(face.querySelector('.audit-meta'))return;const box=document.createElement('div');box.className='audit-meta';box.innerHTML=badgeHTML(v);face.appendChild(box)});
    });
  }

  if(typeof renderVocab==='function'){
    const base=renderVocab;
    renderVocab=function(){base();decorateCards();renderProperPanel();const q=document.getElementById('vSearch');if(q&&!q.dataset.auditBound){q.dataset.auditBound='1';q.addEventListener('input',()=>setTimeout(()=>{decorateCards();renderProperPanel()},0))}};
  }
  if(typeof showWordDetail==='function'){
    const base=showWordDetail;
    showWordDetail=function(w){base(w);const p=document.getElementById('wordPanel');if(!p||!w)return;const old=p.querySelector('.audit-word-meta');old?.remove();const box=document.createElement('div');box.className='audit-word-meta';box.innerHTML=badgeHTML(w)+(w.note?`<div class="audit-note">${typeof esc==='function'?esc(w.note):w.note}</div>`:'');p.querySelector('.word-detail')?.appendChild(box)};
  }
  if(typeof renderGrammar==='function'){
    const base=renderGrammar;
    renderGrammar=function(){base();const list=document.getElementById('grammarList');if(!list||typeof L==='undefined')return;
      const p=L.phonetics?.[0];if(p){const box=document.createElement('section');box.className='audit-block phonetics-block';box.innerHTML=`<div class="audit-block-head"><b>语音 · NGỮ ÂM</b><span>教材重点</span></div><h3>${esc(p.title)}</h3><div class="audit-vn-title">${esc(p.vn)}</div><ol>${p.points.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>`;list.prepend(box);}
      if(L.culture){const c=L.culture,box=document.createElement('section');box.className='audit-block culture-block';box.innerHTML=`<div class="audit-block-head"><b>文化 · VĂN HÓA</b><span>Bài ${L.id}</span></div><h3>${esc(c.title)}</h3><div class="audit-vn-title">${esc(c.vn_title)}</div><p>${esc(c.body)}</p><p class="audit-vn-body">${esc(c.vn)}</p>`;list.appendChild(box);}
      const chip=document.getElementById('grammarChip');if(chip&&p)chip.textContent=`${L.grammar.length} điểm + ngữ âm`;
    };
  }

  if(typeof allVocab==='function')allVocab=function(){return HSK1_LESSONS.flatMap(x=>(x.vocab||[]).filter(v=>v.kind==='core'))};
  if(typeof speakAllVocab==='function')speakAllVocab=function(){speak((L.vocab||[]).filter(v=>v.kind!=='proper').map(v=>v.zh).join('，'))};
  if(typeof genVocabMC==='function')genVocabMC=function(){
    const core=(L.vocab||[]).filter(v=>v.kind==='core'),global=allVocab(),out=[];
    core.forEach((w,i)=>{const meaning=i%2===0;if(meaning){const ds=shuffle(global.filter(x=>x.zh!==w.zh).map(x=>x.vn).filter((x,j,a)=>a.indexOf(x)===j)).slice(0,3);out.push({q:`“${w.zh}” (${w.py}) nghĩa là gì?`,opts:shuffle([w.vn,...ds]),ans:w.vn,why:`${w.zh} · ${w.py} = ${w.vn}.`})}else{const ds=shuffle(global.filter(x=>x.py!==w.py).map(x=>x.py).filter((x,j,a)=>a.indexOf(x)===j)).slice(0,3);out.push({q:`Pinyin đúng của “${w.zh}” là gì?`,opts:shuffle([w.py,...ds]),ans:w.py,why:`“${w.zh}” đọc là ${w.py}.`})}});
    return out;
  };
  if(typeof renderMatch==='function'){
    const base=renderMatch;
    renderMatch=function(){const orig=L.vocab;L.vocab=orig.filter(v=>v.kind==='core');try{return base()}finally{L.vocab=orig}};
  }
  if(typeof checkFix==='function')checkFix=function(){
    let ok=0,review=0;$$('.fix-input',$('#q-fix')).forEach(inp=>{const q=L.fixes[+inp.dataset.i],answers=[q.correct,...(q.alts||[])],val=inp.value.trim(),good=answers.some(a=>norm(val)===norm(a));inp.classList.toggle('good',good);inp.classList.toggle('bad',!good&&!val);inp.classList.toggle('review',!good&&!!val);if(good)ok++;else if(val)review++;const f=$('#fixfb-'+inp.dataset.i);if(good){f.innerHTML=`<div>✅ Khớp đáp án.</div>${explain(q.why)}`;f.className='feedback good'}else if(!val){f.innerHTML=`<div>⚠️ Chưa nhập câu. · Đáp án tham khảo: <b>${esc(q.correct)}</b></div>${explain(q.why)}`;f.className='feedback bad'}else{f.innerHTML=`<div>⚠️ Câu của bạn khác đáp án tham khảo: <b>${esc(q.correct)}</b>. Hãy đối chiếu cấu trúc.</div>${explain(q.why)}`;f.className='feedback review'}});setScore(`Sửa câu: ${ok}/${L.fixes.length} khớp đáp án${review?` · ${review} câu cần đối chiếu`:''}`)
  };
})();