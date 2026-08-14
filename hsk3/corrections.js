/* Textbook-alignment corrections for HSK Standard Course 3. */
(()=>{
  const lessons=window.HSK3_LESSONS||[];
  const official={
    1:{zh:'周末你有什么打算？',vn:'Anh dự định làm gì vào cuối tuần vậy?'},2:{zh:'他什么时候回来？',vn:'Khi nào anh ấy quay về?'},3:{zh:'桌子上放着很多饮料。',vn:'Trên bàn có rất nhiều thức uống.'},4:{zh:'她总是笑着跟客人说话。',vn:'Cô ấy luôn cười khi nói chuyện với khách hàng.'},5:{zh:'我最近越来越胖了。',vn:'Dạo này em ngày càng béo ra.'},
    6:{zh:'怎么突然找不到了？',vn:'Sao bỗng dưng lại không tìm thấy?'},7:{zh:'我跟她都认识五年了。',vn:'Tôi và cô ấy quen nhau được năm năm rồi.'},8:{zh:'你去哪儿我就去哪儿。',vn:'Em đi đâu thì anh đi đến đó.'},9:{zh:'她的汉语说得跟中国人一样好。',vn:'Cô ấy nói tiếng Trung Quốc hay như người Trung Quốc vậy.'},10:{zh:'数学比历史难多了。',vn:'Môn Toán khó hơn môn Lịch sử nhiều.'},
    11:{zh:'别忘了把空调关了。',vn:'Đừng quên tắt máy điều hòa không khí nhé.'},12:{zh:'把重要的东西放在我这儿吧。',vn:'Hãy để những đồ quan trọng ở chỗ tôi đi.'},13:{zh:'我是走回来的。',vn:'Anh đi bộ về.'},14:{zh:'你把水果拿过来。',vn:'Cậu hãy mang trái cây đến đây.'},15:{zh:'其他都没什么问题。',vn:'Những câu khác đều không có vấn đề gì.'},
    16:{zh:'我现在累得下了班就想睡觉。',vn:'Bây giờ tôi mệt đến nỗi chỉ muốn đi ngủ sau khi hết giờ làm việc.'},17:{zh:'谁都有办法看好你的“病”。',vn:'Ai cũng có cách chữa khỏi “bệnh” của em.'},18:{zh:'我相信他们会同意的。',vn:'Tôi tin họ sẽ đồng ý.'},19:{zh:'你没看出来吗？',vn:'Anh không nhìn ra được à?'},20:{zh:'我被他影响了。',vn:'Mình chịu ảnh hưởng từ anh ấy.'}
  };
  lessons.forEach(L=>{const o=official[L.id];if(o){L.title=o.zh;L.vn_title=o.vn}});
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
