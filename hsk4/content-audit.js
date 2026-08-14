/* HSK4 下 content audit corrections — textbook-aligned, 2026-08-14. */
(function(){
  'use strict';
  const lessons=window.HSK4_LOWER_LESSONS;
  if(!Array.isArray(lessons)) throw new Error('HSK4 下 content audit: lesson data missing.');
  const lesson=id=>lessons.find(x=>x.id===id);
  const vocab=(id,zh,patch)=>{const w=lesson(id)?.vocab?.find(x=>x.zh===zh);if(!w)throw new Error(`HSK4 下 audit: missing vocab ${id}/${zh}`);Object.assign(w,patch)};
  const grammar=(id,title,patch)=>{const g=lesson(id)?.grammar?.find(x=>x.title===title);if(!g)throw new Error(`HSK4 下 audit: missing grammar ${id}/${title}`);Object.assign(g,patch)};
  const scene=(id,n,patch)=>{const s=lesson(id)?.scenes?.[n-1];if(!s)throw new Error(`HSK4 下 audit: missing scene ${id}/${n}`);Object.assign(s,patch)};
  const compare=(id,patch)=>{const c=lesson(id)?.compare;if(!c)throw new Error(`HSK4 下 audit: missing compare ${id}`);Object.assign(c,patch)};
  const cultureTitles={
    11:'中国古典文学名著——《西游记》',12:'孔子“因材施教”',13:'中国的筷子文化',
    14:'“天人合一”——中国人的“人与自然观”',15:'孟母三迁的故事',16:'只要功夫深，铁杵磨成针',
    17:'中国国宝大熊猫',18:'微博与微信',19:'舌尖上的中国——饺子',20:'中国的少数民族'
  };
  const vnTitles={
    11:'Đọc sách có rất nhiều lợi ích, đọc sách hay, thích đọc sách',12:'Khám phá thế giới bằng trái tim',
    13:'Uống trà trong lúc xem Kinh kịch',14:'Bảo vệ Mẹ Trái đất',15:'Nghệ thuật giáo dục con cái',
    16:'Cuộc sống có thể tốt đẹp hơn.',17:'Con người và thiên nhiên',18:'Khoa học công nghệ và thế giới',
    19:'Mùi vị của cuộc sống',20:'Quang cảnh dọc đường'
  };
  Object.entries(vnTitles).forEach(([id,title])=>lesson(+id).vn_title=title);
  Object.entries(cultureTitles).forEach(([id,title])=>lesson(+id).culture.title=title);

  // Vocabulary: use the target sense/part of speech shown in this lesson, not an unrelated common sense.
  vocab(11,'词语',{vn:'từ ngữ; cách diễn đạt'});
  vocab(11,'之',{vn:'trợ từ văn viết nối định ngữ với trung tâm ngữ; tương đương “的” trong nhiều trường hợp'});
  vocab(13,'厚',{vn:'sâu sắc; sâu đậm'});
  vocab(13,'省',{vn:'tỉnh (đơn vị hành chính)'});
  vocab(16,'传真',{vn:'gửi fax; gửi bằng fax'});
  vocab(16,'推',{vn:'hoãn; dời lại'});
  vocab(14,'丢',{vn:'vứt; ném'});
  vocab(15,'骄傲',{vn:'kiêu ngạo; tự mãn'});
  vocab(17,'照',{vn:'chụp; chụp ảnh'});
  vocab(18,'火',{vn:'hot; nổi tiếng, thịnh hành (khẩu ngữ)'});
  vocab(18,'举',{vn:'nêu; đưa ra (ví dụ)'});
  vocab(18,'收',{vn:'nhận'});
  vocab(19,'功夫',{vn:'võ công; kung fu'});
  vocab(20,'怪',{vn:'khá; thật là; tương đối (phó từ khẩu ngữ)'});
  vocab(20,'打扮',{vn:'ăn mặc; sửa soạn, chưng diện'});
  vocab(20,'存',{vn:'cất giữ; gửi giữ; lưu trữ'});
  vocab(20,'小吃',{vn:'món ăn nhẹ; món ăn bình dân địa phương'});

  // Lesson 11.
  grammar(11,'连',{
    vn_title:'Giới từ “连”',
    structure:'连 + danh từ/đại từ + 都/也 + …',
    desc:'Giới từ dùng để đưa ra một trường hợp cực đoan nhằm nhấn mạnh; thường phối hợp với 都/也. Thành phần sau 连 có thể là chủ ngữ hoặc tân ngữ được đưa lên trước.'
  });
  grammar(11,'无论',{
    structure:'无论 + từ nghi vấn / 是A还是B / A还是不A，(都/也) + …',
    desc:'Biểu thị dù điều kiện hoặc lựa chọn nào xảy ra thì kết quả ở mệnh đề sau vẫn không thay đổi; mệnh đề sau thường có 都/也.'
  });
  grammar(11,'同时',{
    vn_title:'Liên từ / danh từ “同时”',
    structure:'A，同时(又/也/还)B / 在……（的）同时',
    desc:'Là liên từ khi bổ sung một sự việc hoặc phương diện xảy ra/cùng tồn tại với điều trước; thường đi với 又/也/还. Đồng thời còn là danh từ trong cấu trúc “在……（的）同时”.'
  });
  compare(11,{
    title:'无论 — 不管',
    vn:'Cả hai đều có nghĩa “bất kể/dù” và mệnh đề sau thường có 都/也. “无论” thiên về văn viết, dùng được với các hình thức trang trọng như 如何、是否; “不管” khẩu ngữ hơn. Với dạng khẳng định–phủ định, “不管热不热” dùng trực tiếp được, còn “无论” thường cần 还是/跟/与 như “无论热还是不热”.'
  });

  // Lesson 12.
  grammar(12,'名量词重叠',{
    vn_title:'Lặp danh từ / lượng từ',
    structure:'AA（如：人人、天天、件件）',
    desc:'Danh từ hoặc lượng từ được lặp theo dạng AA để biểu thị ý “mỗi/từng”. Sau khi lặp, chúng có thể làm chủ ngữ, định ngữ của chủ ngữ hoặc trạng ngữ; không dùng làm tân ngữ hay định ngữ của tân ngữ theo cách dùng được dạy trong bài.',
    examples:['人人都应该有自己的学习方法。','件件小事都应该认真做好。','他天天都坚持阅读半个小时。']
  });
  grammar(12,'相反',{
    vn_title:'Liên từ / tính từ “相反”',
    structure:'…，相反，… / A 和 B 相反 / 相反的 + N',
    desc:'Là liên từ khi đứng ở đầu hoặc giữa vế sau để nêu ý trái ngược hay tăng tiến theo hướng ngược lại. “相反” còn là tính từ, chỉ hai mặt đối lập nhau; khi làm định ngữ phải dùng “相反的 + danh từ”.',
    examples:['方法不对不但不能省力，相反会浪费更多时间。','调查结果和我们原来的想法完全相反。','两个人选择了相反的方向。']
  });
  grammar(12,'对于',{
    structure:'对于 + đối tượng，… / Chủ ngữ + 对于 + đối tượng + …',
    desc:'Giới từ đưa ra đối tượng/đích mà một tình huống, thái độ hay nhận xét hướng tới. Cụm 对于 có thể đứng trước hoặc sau chủ ngữ.'
  });
  compare(12,{
    title:'对于 — 关于',
    vn:'“对于” nêu đối tượng chịu tác động/được đánh giá; “关于” nêu chủ đề hoặc phạm vi bàn luận. Cụm 对于 có thể đứng trước hoặc sau chủ ngữ, còn 关于 thường đứng trước chủ ngữ. “关于” có thể dùng trong tên sách/bài viết; “对于” không dùng theo cách đó.'
  });
  scene(12,2,{
    points:'用盐水洗新衣服，可以保护衣服的颜色。|很多问题的答案可以从生活中找到，需要用眼睛发现、用心总结。'
  });

  // Lesson 13.
  grammar(13,'大概',{
    vn_title:'“大概” biểu thị phỏng đoán/ước lượng',
    structure:'大概 + mệnh đề / 大概 + số lượng / 大概的 + danh từ',
    desc:'Làm phó từ để phỏng đoán hoặc ước lượng số lượng/thời gian; ngoài ra có thể làm tính từ/định ngữ với nghĩa “khái quát, đại thể, không chi tiết”.'
  });
  compare(13,{
    title:'大概 — 也许',
    vn:'Cả hai đều có thể biểu thị phỏng đoán. “大概” thường cho cảm giác chắc chắn cao hơn, còn có thể ước lượng số lượng/thời gian và làm định ngữ với nghĩa “khái quát”; “也许” không có các cách dùng đó. Khi nói kế hoạch tương lai của chính người nói còn chưa chắc, thường dùng “也许”, không dùng “大概”.'
  });

  // Lesson 14.
  grammar(14,'够',{
    vn_title:'Động từ / phó từ “够”',
    structure:'V + 够 + số lượng / 够 + Adj (+ 的)',
    desc:'Làm động từ khi nói số lượng đạt mức đủ; làm phó từ khi mức độ đạt một tiêu chuẩn nhất định. Trong câu khẳng định “够 + tính từ”, sau tính từ thường có 的.'
  });
  grammar(14,'以',{
    vn_title:'Giới từ / liên từ “以”',
    structure:'以 + phương thức/tiêu chuẩn + V / 以A为B / …，以 + V',
    desc:'Là giới từ với nghĩa “dùng/lấy/dựa vào”, thường gặp trong “以……V”; “以A为B” nghĩa là lấy/coi A làm B. “以” còn có thể là liên từ chỉ mục đích, tương đương “để/nhằm”, thường mở đầu vế sau và hai vế cùng chủ ngữ.'
  });
  grammar(14,'既然',{
    examples:['既然决定了，就认真做下去。','既然天气不错，我们就骑自行车去吧。','既然知道塑料袋会污染环境，就应该少用。']
  });
  compare(14,{
    title:'于是 — 因此',
    vn:'Cả hai đều nối nguyên nhân với kết quả. “于是” thường nhấn mạnh trình tự diễn biến: sự việc trước xảy ra rồi dẫn đến hành động/kết quả tiếp theo; “因此” nhấn mạnh quan hệ nhân quả logic và thiên về văn viết hơn.'
  });

  // Lesson 15.
  grammar(15,'来',{
    vn_title:'Động từ “来” đứng trước động từ khác',
    structure:'来 + V',
    desc:'Trong khẩu ngữ, “来” đứng trước một động từ khác để biểu thị “sẽ/để ai đó làm việc ấy”. Nếu bỏ “来”, ý chính của câu thường không thay đổi.',
    examples:['这个沙发太重了，我来帮你一起抬。','这次活动让李老师来负责吧。','记者需要到处调查，来了解真实情况。']
  });
  grammar(15,'左右',{
    vn_title:'Danh từ “左右”',
    structure:'số lượng + 左右',
    desc:'Chỉ dùng sau cụm số lượng để biểu thị con số thực tế hơi nhiều hơn hoặc ít hơn con số được nêu, tương đương “khoảng/xấp xỉ”.',
    examples:['那本书三天左右就能到。','前方五百米左右有一个停车场。','七岁左右的儿童普遍比较好动。']
  });
  compare(15,{
    title:'千万 — 一定',
    vn:'Cả hai có thể dùng để nhấn mạnh lời yêu cầu/dặn dò. “千万” thường đi với 别/不要/不能 và mang sắc thái tha thiết nhắc nhở; “一定” thường gặp trong yêu cầu khẳng định và mạnh hơn. “一定” còn có thể diễn đạt quyết tâm của ngôi thứ nhất, sự chắc chắn/tất yếu, hoặc trong “不一定” = chưa chắc; “千万” không có các cách dùng này.'
  });

  // Lesson 16.
  grammar(16,'恐怕',{
    vn_title:'Động từ / phó từ “恐怕”',
    structure:'恐怕 + V / (Chủ ngữ) + 恐怕 + mệnh đề',
    desc:'Có thể là động từ “lo rằng/e rằng”; cũng có thể là phó từ phỏng đoán, đôi khi kèm sắc thái lo lắng. Khi chỉ phỏng đoán, nghĩa gần 大概/也许.'
  });
  grammar(16,'到底',{
    vn_title:'“到底” đến cùng / rốt cuộc',
    structure:'V + 到底 / 到底 + từ nghi vấn + …',
    desc:'Là động từ/bổ tố nghĩa “đến tận cùng/đến cùng”; cũng là phó từ dùng trong câu nghi vấn hoặc mệnh đề có từ nghi vấn để truy hỏi mạnh “rốt cuộc”. Cách dùng này không đi với câu hỏi có 吗. Nếu từ nghi vấn làm chủ ngữ, 到底 đứng trước nó.',
    examples:['你到底想去哪儿？','这件事到底是谁负责的？','这本书我一定要看到底。']
  });
  grammar(16,'敢',{
    examples:['有问题就要敢问。','我第一次一个人旅行，有点儿不敢出发。','敢承认自己的不足，才能继续进步。']
  });
  compare(16,{
    title:'恐怕 — 怕',
    vn:'Hai từ đều có thể liên quan đến “lo/sợ” và phỏng đoán có sắc thái lo lắng. Khi là động từ, “恐怕” chủ yếu đứng trước động từ/mệnh đề, còn “怕” có thể mang tân ngữ trực tiếp. Khi phỏng đoán, “恐怕” có thể đứng trước hoặc sau chủ ngữ và còn dùng như 大概/也许; “怕” bị hạn chế hơn và không dùng để phỏng đoán thuần túy theo cách đó.'
  });

  // Lesson 17.
  grammar(17,'倒',{
    vn_title:'Động từ / phó từ “倒”',
    structure:'倒(dào) + đồ uống / 倒 + V/Adj',
    desc:'Đọc dào có thể là động từ “rót/đổ chất lỏng ra khỏi vật chứa”. Khi làm phó từ, “倒” biểu thị điều trái với dự đoán, nhượng bộ hoặc chuyển sang một mặt khác; đôi khi dùng “倒是”.'
  });
  grammar(17,'干',{
    vn_title:'Động từ “干” (gàn)',
    structure:'干 + công việc/việc',
    desc:'Đọc gàn, nghĩa là làm/tiến hành một công việc hay hoạt động. Cần phân biệt với 干 gān = khô và các từ có cách đọc/nghĩa khác.'
  });
  compare(17,{
    title:'趟 — 次',
    vn:'Cả hai đều có thể đếm số lần. “趟” nhấn mạnh một chuyến/hành trình đi lại và thường đi với 来、去、走、跑; “次” là lượng từ chung cho số lần của nhiều hành động như hỏi, nói, xem, thảo luận. “趟” còn có thể đếm một lượt xe/tàu theo chuyến; “次” không dùng theo cách đó.'
  });

  // Lesson 18.
  compare(18,{
    title:'接着 — 然后',
    vn:'Cả hai đều biểu thị trình tự. “接着” là phó từ, nhấn mạnh việc sau xảy ra ngay tiếp theo về thời gian và chủ ngữ hai việc có thể khác nhau. “然后” là liên từ chỉ trình tự, thường dùng trong “先……然后（再）……” và hai hành động thường cùng chủ ngữ.'
  });
  lesson(18).culture.vn='Giáo trình dùng Weibo và WeChat để minh họa cách công nghệ mạng thay đổi việc chia sẻ thông tin và giao tiếp. Khi học phần này nên đồng thời chú ý quyền riêng tư, mật khẩu và an toàn thông tin.';

  // Lesson 19.
  grammar(19,'上',{
    vn_title:'Bổ ngữ kết quả/khả năng “上”',
    structure:'V + 上 / V + 得上、V + 不上',
    desc:'Đứng sau động từ để biểu thị hành động đạt được mục đích/kết quả mong muốn; trong bổ ngữ khả năng, cho biết mục đích đó có đạt được hay không.',
    examples:['这家饭馆太受欢迎了，周末很难订上座位。','哥哥终于考上研究生了。','我赶上了最后一班地铁。']
  });
  compare(19,{
    title:'出来 — 起来',
    vn:'Nghĩa phương hướng cơ bản: “出来” từ trong ra ngoài, “起来” từ dưới lên. Nghĩa mở rộng: “出来” thường làm điều ẩn/chưa có trở nên xuất hiện hoặc được nhận ra; “起来” thường chỉ bắt đầu rồi tiếp tục, hoặc đưa ra cảm nhận/đánh giá. Đặc biệt, “想出来” là nghĩ ra điều mới, còn “想起来” là nhớ lại điều đã quên.'
  });

  // Lesson 20.
  grammar(20,'动词+着+动词+着',{
    vn_title:'Cấu trúc V着V着…',
    structure:'V着V着 + (就/突然) + sự việc mới',
    desc:'Thường lặp cùng một động từ (hay là động từ đơn âm tiết) với 着 để tạo nền hành động đang tiếp diễn; trong quá trình đó xuất hiện một hành động hoặc tình huống mới.'
  });
  grammar(20,'一……就……',{
    desc:'Biểu thị việc sau xảy ra ngay khi việc trước vừa xảy ra; cũng có thể biểu thị quan hệ điều kiện “hễ… thì…”. Chủ ngữ của hai vế có thể giống hoặc khác nhau.'
  });
  grammar(20,'究竟',{
    desc:'Phó từ thiên về văn viết, dùng trong câu nghi vấn hoặc mệnh đề có từ nghi vấn để truy hỏi “rốt cuộc/chính xác”. Nếu từ nghi vấn làm chủ ngữ, 究竟 đứng trước chủ ngữ đó.'
  });
  grammar(20,'起来',{
    desc:'Có nghĩa phương hướng từ dưới lên; nghĩa mở rộng có thể biểu thị hành động/trạng thái bắt đầu rồi tiếp tục, hoặc dẫn ra cảm nhận/đánh giá từ một phương diện như 看起来、听起来.'
  });
  grammar(20,'动词+起',{
    vn_title:'“V + 起 + N” nêu chủ đề',
    structure:'说/谈/讲/问/提/聊/回忆 + 起 + N',
    desc:'Chỉ một nhóm động từ chuyển tiếp như 说、谈、讲、问、提、聊、回忆 đi với 起 rồi danh từ/cụm danh từ để đưa một người, vật hay chuyện ra làm chủ đề.'
  });
  compare(20,{
    title:'究竟 — 到底',
    vn:'Cả hai đều là phó từ dùng để tăng sắc thái truy hỏi “rốt cuộc”. “究竟” thường thiên về văn viết/trang trọng hơn. “到底” ngoài cách dùng phó từ còn có thể mang nghĩa “đến tận cùng/đến cùng” trong cấu trúc như “看到底”; “究竟” không có cách dùng đó.'
  });
  scene(20,1,{
    summary:'Một chuyến bay bị hoãn một giờ. Trên đường ra sân bay, người lái xe cần ghé trạm xăng rồi đi đường cao tốc; tới nơi, Tiểu Trương tự vào làm thủ tục và lấy thẻ lên máy bay.',
    points:'航班推迟以后，要重新安排去机场的时间。|到了机场以后，小张自己进去办手续、拿登机牌。'
  });
  scene(20,5,{
    summary:'Người kể cho rằng du lịch làm phong phú trải nghiệm và giảm áp lực. Điều khiến anh nhớ nhất là các món ăn địa phương; ẩm thực Hồ Nam để lại ấn tượng với vị mặn-cay, thơm-cay và chua-cay. Sau chuyến đi, anh thu dọn hành lý và trở lại công việc với tinh thần tốt hơn.',
    points:'旅行能丰富经历，也能帮助人减轻工作压力。|说起湖南菜，咸辣、香辣、酸辣的味道都给人很深的印象。'
  });

  // Pinyin for isolated single-character vocabulary. This prevents polyphonic characters from being
  // pronounced with an unrelated default reading when pinyin-pro has no word context.
  const py={
    '连':'lián','猜':'cāi','页':'yè','之':'zhī',
    '死':'sǐ','盐':'yán','节':'jié',
    '厚':'hòu','遍':'biàn','由':'yóu','苦':'kǔ','省':'shěng',
    '重':'zhòng','行':'xíng','脏':'zāng','空':'kōng','扔':'rēng','以':'yǐ','停':'tíng','暖':'nuǎn','丢':'diū',
    '棒':'bàng','响':'xiǎng','醒':'xǐng','赶':'gǎn','弄':'nòng','敲':'qiāo','骗':'piàn','假':'jiǎ','懒':'lǎn','笨':'bèn',
    '呀':'ya','挂':'guà','推':'tuī','输':'shū','敢':'gǎn',
    '云':'yún','照':'zhào','倒':'dào','毛':'máo','抱':'bào','干':'gàn','趟':'tàng','剩':'shèng','底':'dǐ','梦':'mèng',
    '火':'huǒ','秒':'miǎo','座':'zuò','桥':'qiáo','抓':'zhuā','咸':'xián','举':'jǔ','收':'shōu',
    '刀':'dāo','破':'pò','脱':'tuō','戴':'dài','抬':'tái','转':'zhuǎn','租':'zū','吵':'chǎo','场':'chǎng',
    '怪':'guài','存':'cún','棵':'kē','汤':'tāng','辣':'là','香':'xiāng','酸':'suān'
  };
  lessons.forEach(L=>L.vocab.forEach(w=>{if(py[w.zh])w.py=py[w.zh]}));
  if(typeof pyOf==='function'){
    const basePyOf=pyOf;
    pyOf=function(text){const k=String(text??'').trim();return py[k]||basePyOf(text)};
    window.pyOf=pyOf;
  }

  window.HSK4_LOWER_CONTENT_AUDIT={
    version:'2026-08-14.3',
    textbook:'《Chuẩn HSK4 下》 / HSK Standard Course 4B',
    corrected:true,
    cultureTitles:10,
    explicitSingleCharPinyin:Object.keys(py).length
  };
})();
