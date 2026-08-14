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

  /* Proper names explicitly listed in the textbook contents. */
  addVocab(10,{zh:'王方',py:'Wáng Fāng',vn:'Vương Phương (tên người)'});
  addVocab(10,{zh:'谢朋',py:'Xiè Péng',vn:'Tạ Bằng (tên người)'});
  addVocab(13,{zh:'大卫',py:'Dàwèi',vn:'David (tên người)'});
  addVocab(14,{zh:'张',py:'Zhāng',vn:'họ Trương'});

  /* Lesson 13 telephone-number reading: 1 is read yāo in the textbook model. */
  const L13=get(13);
  if(L13){
    if(L13.scenes?.[2]?.lines?.[0])L13.scenes[2].lines[0].py='Bā èr sān líng sì yāo wǔ wǔ, zhè shì Lǐ lǎoshī de diànhuà ma?';
    if(L13.scenes?.[2]?.lines?.[1])L13.scenes[2].lines[1].py='Bú shì, tā de diànhuà shì bā èr sān líng sì yāo wǔ liù.';
    if(L13.grammar?.[2])L13.grammar[2].desc='Số điện thoại thường đọc từng chữ số riêng lẻ. “1” trong số điện thoại đọc là yāo theo mẫu của giáo trình; các chữ số được đọc lần lượt từng số.';
  }
})();
