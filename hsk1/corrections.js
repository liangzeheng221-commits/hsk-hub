(()=>{
  const lessons=window.HSK1_LESSONS||[];
  const get=id=>lessons.find(x=>x.id===id);
  const addVocab=(id,item)=>{const L=get(id);if(L&&!L.vocab.some(v=>v.zh===item.zh))L.vocab.push(item)};

  /* Lesson 10: textbook TOC lists the two personal names as lesson vocabulary. */
  addVocab(10,{zh:'王方',py:'Wáng Fāng',vn:'Vương Phương (tên người)'});
  addVocab(10,{zh:'谢朋',py:'Xiè Péng',vn:'Tạ Bằng (tên người)'});

  /* Lesson 13: textbook TOC includes 大卫 as a proper name. */
  addVocab(13,{zh:'大卫',py:'Dàwèi',vn:'David (tên người)'});

  /* Lesson 14: textbook TOC includes 张 as a surname used in 张先生. */
  addVocab(14,{zh:'张',py:'Zhāng',vn:'họ Trương'});

  /* Lesson 13 telephone-number reading: 1 is read yāo in the textbook model. */
  const L13=get(13);
  if(L13){
    if(L13.scenes?.[2]?.lines?.[0])L13.scenes[2].lines[0].py='Bā èr sān líng sì yāo wǔ wǔ, zhè shì Lǐ lǎoshī de diànhuà ma?';
    if(L13.scenes?.[2]?.lines?.[1])L13.scenes[2].lines[1].py='Bú shì, tā de diànhuà shì bā èr sān líng sì yāo wǔ liù.';
    if(L13.grammar?.[2])L13.grammar[2].desc='Số điện thoại thường đọc từng chữ số riêng lẻ. “1” trong số điện thoại đọc là yāo theo mẫu của giáo trình; các chữ số được đọc lần lượt từng số.';
  }
})();
