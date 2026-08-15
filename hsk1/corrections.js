(()=>{
  const lessons=window.HSK1_LESSONS||[];
  const official={
    1:{zh:'你好！',vn:'Chào anh!'},2:{zh:'谢谢你！',vn:'Cảm ơn anh!'},3:{zh:'你叫什么名字？',vn:'Cô tên gì?'},4:{zh:'她是我的汉语老师。',vn:'Cô ấy là cô giáo dạy tôi tiếng Trung Quốc.'},5:{zh:'她女儿今年二十岁。',vn:'Con gái của cô ấy năm nay 20 tuổi.'},
    6:{zh:'我会说汉语。',vn:'Tôi biết nói tiếng Trung Quốc.'},7:{zh:'今天几号？',vn:'Hôm nay là ngày mấy?'},8:{zh:'我想喝茶。',vn:'Tôi muốn uống trà.'},9:{zh:'你儿子在哪儿工作？',vn:'Con trai anh làm việc ở đâu?'},10:{zh:'我能坐这儿吗？',vn:'Tôi có thể ngồi ở đây được không?'},
    11:{zh:'现在几点？',vn:'Bây giờ là mấy giờ?'},12:{zh:'明天天气怎么样？',vn:'Ngày mai thời tiết thế nào?'},13:{zh:'他在学做中国菜呢。',vn:'Anh ấy đang học nấu món ăn Trung Quốc.'},14:{zh:'她买了不少衣服。',vn:'Cô ấy đã mua nhiều quần áo.'},15:{zh:'我是坐飞机来的。',vn:'Tôi đáp máy bay đến đây.'}
  };
  lessons.forEach(L=>{const o=official[L.id];if(o){L.title=o.zh;L.vn_title=o.vn}});
  const get=id=>lessons.find(x=>x.id===id);
  const addVocab=(id,item)=>{const L=get(id);if(L&&!L.vocab.some(v=>v.zh===item.zh))L.vocab.push(item)};
  const norm=s=>String(s??'').replace(/[()]/g,ch=>ch==='('?'（':'）').replace(/\s+/g,'').trim();
  const formal={
    3:['疑问代词“什么”','“是”字句','用“吗”的疑问句'],
    4:['疑问代词“谁”“哪”','结构助词“的”','疑问助词“呢”（1）'],
    5:['疑问代词“几”','百以内的数字','“了”表变化','“多 + 大”表示疑问'],
    6:['能愿动词“会”（1）','形容词谓语句','疑问代词“怎么”（1）'],
    7:['日期的表达（1）：月、日/号、星期','名词谓语句','连动句（1）：去 + 地方 + 做什么'],
    8:['能愿动词“想”','疑问代词“多少”','量词“个”“口”','钱数的表达'],
    9:['动词“在”','疑问代词“哪儿”','介词“在”','疑问助词“呢”（2）'],
    10:['“有”字句：表示存在','连词“和”','能愿动词“能”','用“请”的祈使句'],
    11:['时间的表达','时间词做状语','名词“前”'],
    12:['疑问代词“怎么样”','主谓谓语句','程度副词“太”','能愿动词“会”（2）'],
    13:['叹词“喂”','“在……呢”表示动作正在进行','电话号码的表达','语气助词“吧”'],
    14:['“了”表发生或完成','名词“后”','语气助词“啊”','副词“都”'],
    15:['“是……的”句：强调时间、地点、方式','日期的表达（2）：年、月、日/号、星期']
  };
  const aliases={
    '100以内的数字':'百以内的数字','“了”表示变化':'“了”表变化','日期的表达（1）':'日期的表达（1）：月、日/号、星期','日期的表达（2）':'日期的表达（2）：年、月、日/号、星期'
  };
  for(const L of lessons){
    const expected=formal[L.id]||[];
    if(expected.length&&Array.isArray(L.grammar)&&L.grammar.length===expected.length){
      L.grammar.forEach((g,i)=>{g.title=expected[i];g.textbook_title=expected[i];g.content_type='grammar'});
    }else{
      const expectedNorm=new Map(expected.map(x=>[norm(x),x]));
      for(const g of L.grammar||[]){
        if(aliases[g.title])g.title=aliases[g.title];
        const canonical=expectedNorm.get(norm(g.title));
        if(canonical){g.title=canonical;g.textbook_title=canonical;g.content_type='grammar'}else g.content_type='phonetics';
      }
    }
    L.phonetics=(L.grammar||[]).filter(g=>g.content_type==='phonetics').map(g=>({...g}));
    L.formalGrammarCount=(L.grammar||[]).filter(g=>g.content_type==='grammar').length;
    L.grammarManifestVersion='2026-08-15';
  }

  /* 教材专有名词：统一补入课程数据，避免依赖后续审计层临时补词。 */
  addVocab(3,{zh:'李月',py:'Lǐ Yuè',vn:'Lý Nguyệt (tên người)'});
  addVocab(3,{zh:'中国',py:'Zhōngguó',vn:'Trung Quốc'});
  addVocab(3,{zh:'美国',py:'Měiguó',vn:'Mỹ, Hoa Kỳ'});
  addVocab(10,{zh:'王方',py:'Wáng Fāng',vn:'Vương Phương (tên người)'});
  addVocab(10,{zh:'谢朋',py:'Xiè Péng',vn:'Tạ Bằng (tên người)'});
  addVocab(13,{zh:'大卫',py:'Dàwèi',vn:'David (tên người)'});
  addVocab(14,{zh:'张',py:'Zhāng',vn:'họ Trương'});

  /* Lesson 13 telephone-number reading: 1 is read yāo in the textbook model. */
  const L13=get(13);
  if(L13){
    if(L13.scenes?.[2]?.lines?.[0])L13.scenes[2].lines[0].py='Bā èr sān líng sì yāo wǔ wǔ, zhè shì Lǐ lǎoshī de diànhuà ma?';
    if(L13.scenes?.[2]?.lines?.[1])L13.scenes[2].lines[1].py='Bú shì, tā de diànhuà shì bā èr sān líng sì yāo wǔ liù.';
    const phone=(L13.grammar||[]).find(g=>g.title==='电话号码的表达');
    if(phone){phone.structure='逐个数字读；电话号码中的 1 → yāo';phone.desc='Số điện thoại thường đọc từng chữ số riêng lẻ. Theo mẫu của giáo trình, chữ số “1” trong số điện thoại đọc là yāo; pinyin phải ghi theo cách đọc thực tế.';phone.canonicalized='2026-08-15'}
  }

  /* 教材末尾词表最终口径：10 个★补充词 + 8 个专有名词。 */
  const VOCAB_SUPPLEMENT={1:['您'],5:['口'],6:['好吃'],7:['问'],12:['身体'],13:['给','吧','也'],14:['啊'],15:['一起']};
  const VOCAB_PROPER={3:['李月','中国','美国'],10:['王方','谢朋'],11:['北京'],13:['大卫'],14:['张']};
  const entries=o=>Object.entries(o).flatMap(([lesson,words])=>words.map(zh=>({lesson:Number(lesson),zh})));
  function applyVocabContract(){
    const supp=new Set(entries(VOCAB_SUPPLEMENT).map(x=>`${x.lesson}:${x.zh}`));
    const proper=new Set(entries(VOCAB_PROPER).map(x=>`${x.lesson}:${x.zh}`));
    for(const L of lessons){
      for(const v of L.vocab||[]){
        const key=`${Number(L.id)}:${v.zh}`;
        if(proper.has(key)){
          v.kind='proper';v.kind_label='专名 · Tên riêng';v.pos='专名 · Tên riêng';
        }else if(supp.has(key)){
          v.kind='supplement';v.kind_label='★ 教材补充词 · Từ bổ sung';
        }
      }
      L.coreVocabCount=(L.vocab||[]).filter(v=>v.kind==='core').length;
    }
    const missing=[...entries(VOCAB_SUPPLEMENT),...entries(VOCAB_PROPER)].filter(x=>!get(x.lesson)?.vocab?.some(v=>v.zh===x.zh)).map(x=>`L${x.lesson}:${x.zh}`);
    const suppCount=lessons.reduce((n,L)=>n+(L.vocab||[]).filter(v=>v.kind==='supplement').length,0);
    const properCount=lessons.reduce((n,L)=>n+(L.vocab||[]).filter(v=>v.kind==='proper').length,0);
    const ok=!missing.length&&suppCount===10&&properCount===8;
    window.__HSK1_VOCAB_CONTRACT={version:'2026-08-15-vocab-1',ok,supplement:VOCAB_SUPPLEMENT,proper:VOCAB_PROPER,suppCount,properCount,missing};
    if(typeof document!=='undefined')document.documentElement.dataset.hsk1VocabContract=ok?'ok':'error';
    if(!ok)console.error('[HSK1 vocab contract]',window.__HSK1_VOCAB_CONTRACT);
    if(typeof document!=='undefined'&&typeof L!=='undefined'&&L&&typeof renderVocab==='function'){
      try{renderVocab(document.getElementById('vSearch')?.value||'')}catch(e){console.error('[HSK1 vocab redraw]',e)}
    }
  }
  if(typeof window!=='undefined'&&typeof document!=='undefined'){
    if(document.readyState==='complete')applyVocabContract();
    else window.addEventListener('load',applyVocabContract,{once:true});
  }

  window.HSK1_GRAMMAR_CANONICAL={version:'2026-08-15',total:45,classified:true};
})();