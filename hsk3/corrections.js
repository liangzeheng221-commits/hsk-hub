/* Textbook-alignment corrections for HSK Standard Course 3. */
(()=>{
  const lessons=window.HSK3_LESSONS||[];
  const officialTitles={
    1:'周末你有什么打算？',2:'他什么时候回来？',3:'桌子上放着很多饮料。',4:'她总是笑着跟客人说话。',5:'我最近越来越胖了。',
    6:'怎么突然找不到了？',7:'我跟她都认识五年了。',8:'你去哪儿我就去哪儿。',9:'她的汉语说得跟中国人一样好。',10:'数学比历史难多了。',
    11:'别忘了把空调关了。',12:'把重要的东西放在我这儿吧。',13:'我是走回来的。',14:'你把水果拿过来。',15:'其他都没什么问题。',
    16:'我现在累得下了班就想睡觉。',17:'谁都有办法看好你的“病”。',18:'我相信他们会同意的。',19:'你没看出来吗？',20:'我被他影响了。'
  };
  lessons.forEach(L=>{if(officialTitles[L.id])L.title=officialTitles[L.id]});
  const get=id=>lessons.find(x=>x.id===id);
  const addVocab=(id,item)=>{const L=get(id);if(L&&!L.vocab.some(v=>v.zh===item.zh))L.vocab.push(item)};

  /* Proper names explicitly listed in the textbook lesson vocabulary/contents. */
  addVocab(1,{zh:'小丽',vn:'Tiểu Lệ (tên người)'});
  addVocab(1,{zh:'小刚',vn:'Tiểu Cương (tên người)'});
  addVocab(2,{zh:'周',vn:'họ Chu'});
  addVocab(2,{zh:'周明',vn:'Chu Minh (tên người)'});
  addVocab(4,{zh:'小明',vn:'Tiểu Minh (tên người)'});
  addVocab(4,{zh:'马可',vn:'Marco (tên người)'});
  addVocab(4,{zh:'李小美',vn:'Lý Tiểu Mỹ (tên người)'});
  addVocab(9,{zh:'大山',vn:'Đại Sơn (tên người)'});
  addVocab(9,{zh:'李静',vn:'Lý Tĩnh (tên người)'});
  addVocab(15,{zh:'小云',vn:'Tiểu Vân (tên người)'});
})();
