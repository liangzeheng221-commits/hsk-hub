/* HSK Standard Course 3 — textbook content audit layer.
   Source basis: the teacher-provided Vietnamese edition of HSK Standard Course 3.
   This layer makes the textbook vocabulary spine authoritative, separates proper names
   and above-level supplementary words, fixes target readings/senses, and replaces
   grammar descriptions/examples with rechecked HSK3-level material. */
(()=>{
  'use strict';
  const lessons=window.HSK3_LESSONS||[];
  const counts={1:17,2:20,3:17,4:19,5:14,6:15,7:12,8:17,9:15,10:15,11:19,12:14,13:15,14:17,15:22,16:16,17:16,18:17,19:14,20:14};
  const pages={1:17,2:27,3:36,4:45,5:53,6:62,7:71,8:80,9:88,10:97,11:106,12:114,13:123,14:132,15:141,16:151,17:159,18:167,19:175,20:184};
  const proverbs={
    1:['不到长城非好汉','Chưa đến Trường Thành chưa phải hảo hán.'],
    2:['饭后百步走，活到九十九','Đi bộ một trăm bước sau bữa ăn, sống khỏe đến chín mươi chín tuổi.'],
    3:['茶好客常来','Trà ngon thì khách thường đến.'],
    4:['五十步笑百步','Năm mươi bước cười một trăm bước: chê người khác trong khi mình cũng tương tự.'],
    5:['药到病除','Thuốc đến, bệnh trừ.'],
    6:['万事开头难','Vạn sự khởi đầu nan.'],
    7:['一步走错步步错','Sai một bước, các bước sau dễ sai theo.'],
    8:['站得高，看得远','Đứng càng cao, nhìn càng xa.'],
    9:['三人行，必有我师','Trong ba người cùng đi, ắt có người có thể làm thầy ta.'],
    10:['不可同日而语','Không thể đặt hai việc ngang nhau để so sánh.'],
    11:['贵人多忘事','Người bận rộn, có địa vị thường hay quên việc.'],
    12:['习惯成自然','Thói quen lâu ngày thành tự nhiên.'],
    13:['礼轻情意重','Quà tuy nhẹ nhưng tình nghĩa nặng.'],
    14:['先到先得','Đến trước thì được trước.'],
    15:['一是一，二是二','Một là một, hai là hai; việc gì ra việc ấy.'],
    16:['钱不是万能的','Tiền không phải là vạn năng.'],
    17:['早睡早起身体好','Ngủ sớm, dậy sớm tốt cho sức khỏe.'],
    18:['见怪不怪','Thấy chuyện lạ nhiều rồi thì không còn thấy lạ.'],
    19:['百闻不如一见','Trăm nghe không bằng một thấy.'],
    20:['车到山前必有路','Xe đến trước núi ắt có đường; đến lúc sẽ có cách.']
  };
  const cultures={
    5:{page:61,zh:'中国有什么传统运动',vn:'Các môn thể thao truyền thống của Trung Quốc'},
    10:{page:105,zh:'中国人结婚时穿什么',vn:'Trang phục trong ngày cưới của người Trung Quốc'},
    15:{page:150,zh:'中国人过生日吃什么',vn:'Món ăn của người Trung Quốc trong dịp sinh nhật'},
    20:{page:193,zh:'中国人什么礼物不能送',vn:'Những đồ vật không nên dùng làm quà tặng ở Trung Quốc'}
  };
  const proper={1:['小丽','小刚'],2:['周','周明'],4:['小明','马可','李小美'],5:['张'],9:['大山','李静'],15:['小云'],19:['黄河']};
  const extra={2:['太太','秘书'],6:['眼镜','睡着'],8:['可乐'],10:['中介'],13:['生活'],15:['举行','各'],16:['词语'],17:['情况'],18:['特点'],20:['真正']};
  const pos={
    1:['danh từ','danh từ / động từ','trợ từ','giới từ','phó từ','danh từ','danh từ','tính từ','động từ','danh từ','danh từ','danh từ','động từ','danh từ','động từ','danh từ riêng','danh từ riêng'],
    2:['danh từ','tính từ','danh từ','danh từ','tính từ','tính từ','danh từ','danh từ','danh từ','danh từ','lượng từ','danh từ','lượng từ','động từ','danh từ','tính từ','phó từ','tính từ','danh từ riêng','danh từ riêng'],
    3:['liên từ','động từ','tính từ','lượng từ','danh từ','động từ','danh từ','lượng từ','tính từ','tính từ','phó từ','động từ','danh từ','liên từ','tính từ','danh từ','tính từ'],
    4:['danh từ','danh từ','danh từ','phó từ','tính từ','tính từ','tính từ','phó từ','động từ','động từ','tính từ','danh từ','danh từ','tính từ','tính từ','danh từ','danh từ riêng','danh từ riêng','danh từ riêng'],
    5:['động từ','giới từ','động từ','động từ','động từ','danh từ','phó từ','danh từ','danh từ','danh từ','danh từ','phó từ','phó từ','danh từ riêng'],
    6:['danh từ','phó từ','động từ','tính từ','danh từ chỉ thời gian','động từ','phó từ','động từ','tính từ','động từ','danh từ','danh từ','động từ','động từ','phó từ'],
    7:['danh từ','danh từ chỉ thời gian','danh từ','tính từ','cụm động từ','động từ','động từ','động từ','số từ','động từ','lượng từ','động từ'],
    8:['phó từ','động từ','danh từ','lượng từ','động từ','danh từ','động từ','tính từ','danh từ','danh từ chỉ thời gian','phó từ','danh từ','tính từ','phó từ','động từ','tính từ','tính từ'],
    9:['danh từ','danh từ','tính từ','danh từ','động từ','phó từ','động từ','phó từ','động từ','phó từ','danh từ','động từ','danh từ','danh từ riêng','danh từ riêng'],
    10:['danh từ','tính từ','danh từ','danh từ','danh từ','tính từ','danh từ','động từ','tính từ','động từ','danh từ','danh từ','tính từ','danh từ','danh từ'],
    11:['danh từ','động từ','danh từ','động từ','danh từ','danh từ','động từ','động từ','danh từ','động từ','danh từ','lượng từ','danh từ','danh từ','lượng từ','danh từ','danh từ','danh từ','động từ / danh từ'],
    12:['danh từ','danh từ','động từ','danh từ','đại từ','danh từ','động từ','danh từ','động từ','danh từ','động từ','động từ / danh từ','động từ','danh từ'],
    13:['phó từ','danh từ','danh từ','danh từ','động từ','phó từ','danh từ','tính từ','động từ năng nguyện','động từ','động từ năng nguyện','danh từ','danh từ','tính từ','phó từ'],
    14:['động từ','tính từ','liên từ','danh từ','động từ','danh từ','danh từ','động từ','danh từ','động từ','danh từ','danh từ','danh từ','danh từ','danh từ','tính từ','danh từ'],
    15:['động từ','danh từ','động từ','danh từ','động từ','danh từ','đại từ / danh từ','động từ','danh từ','động từ','động từ','giới từ','danh từ','động từ','phó từ','danh từ','động từ','danh từ','danh từ','đại từ','danh từ','danh từ riêng'],
    16:['danh từ','liên từ','động từ','danh từ','danh từ','động từ','tính từ','đơn vị đo','đơn vị đo','danh từ','danh từ','động từ','động từ','danh từ','danh từ','danh từ'],
    17:['động từ','phó từ','danh từ','danh từ chỉ thời gian','danh từ','danh từ','tính từ','giới từ','động từ','động từ','danh từ','phó từ','giới từ','danh từ','danh từ','tính từ'],
    18:['giới từ','số từ','lượng từ','danh từ','danh từ','lượng từ','liên từ','tính từ','động từ','động từ','giới từ','danh từ','danh từ','lượng từ','danh từ','tính từ','trợ từ'],
    19:['danh từ','danh từ','tính từ','danh từ','lượng từ','lượng từ','tính từ','danh từ','động từ','danh từ','động từ','danh từ riêng','danh từ','động từ'],
    20:['danh từ','giới từ','tính từ','danh từ','danh từ','động từ','liên từ','danh từ','danh từ','động từ','động từ','động từ','phó từ','phó từ']
  };
  const display={1:{'南方':'南（方）'},5:{'春天':'春（天）','夏天':'夏（天）'},6:{'聊天儿':'聊天（儿）'},11:{'笔记本电脑':'笔记本（电脑）'},15:{'极了':'极（了）'},17:{'冬天':'冬（天）'},19:{'秋天':'秋（天）'}};
  const overrides={
    1:{'着急':{py:'zháojí',vn:'lo lắng, sốt ruột'}},
    2:{'把':{py:'bǎ',vn:'lượng từ cho đồ vật có cán hoặc tay cầm (cái, cây...)'},'太太':{py:'tàitai',vn:'bà; vợ'},'周':{py:'Zhōu',vn:'họ Chu'},'周明':{py:'Zhōu Míng',vn:'Chu Minh (tên người)'}},
    3:{'只':{py:'zhǐ',vn:'chỉ, chỉ có'},'还是':{py:'háishi',vn:'hay là (dùng chủ yếu trong câu hỏi lựa chọn)'}},
    4:{'又':{py:'yòu',vn:'vừa... vừa... (trong cấu trúc 又……又……)'}},
    5:{'为':{py:'wèi',vn:'cho; vì'},'张':{py:'Zhāng',vn:'họ Trương'}},
    6:{'睡着':{py:'shuìzháo',vn:'ngủ được; ngủ thiếp đi'},'明白':{py:'míngbai',vn:'rõ, hiểu rõ'}},
    7:{'差':{py:'chà',vn:'kém, thiếu; còn thiếu (dùng khi nói giờ)'}},
    8:{'又':{py:'yòu',vn:'lại (một việc đã xảy ra trước đó)'},'健康':{py:'jiànkāng',vn:'khỏe mạnh'}},
    9:{'比较':{py:'bǐjiào',vn:'khá, tương đối'}},
    11:{'还':{py:'huán',vn:'trả, hoàn trả'},'口':{py:'kǒu',vn:'lượng từ: ngụm, miếng...'},'笔记本电脑':{py:'bǐjìběn (diànnǎo)',vn:'máy tính xách tay'}},
    13:{'一边':{py:'yìbiān',vn:'vừa... (dùng trong 一边……一边……)'},'过去':{py:'guòqù',vn:'quá khứ'},'起来':{py:'qǐlái',vn:'lên; dùng làm bổ ngữ phương hướng'}},
    15:{'练习':{py:'liànxí',vn:'bài tập, bài luyện tập'},'花':{py:'huā',vn:'tốn, tiêu tốn'}},
    16:{'长':{py:'zhǎng',vn:'lớn lên, trưởng thành; phát triển'}},
    17:{'口':{py:'kǒu',vn:'miệng'},'根据':{py:'gēnjù',vn:'căn cứ theo, dựa theo'}},
    18:{'只':{py:'zhī',vn:'lượng từ dùng cho động vật: con'},'地':{py:'de',vn:'trợ từ nối trạng ngữ với động từ mà nó bổ nghĩa'},'种':{py:'zhǒng',vn:'lượng từ: loại'},'不但……而且……':{py:'bùdàn……érqiě……',vn:'không những... mà còn...'}},
    19:{'张':{py:'zhāng',vn:'lượng từ cho vật phẳng như giấy, ảnh: tờ, tấm, bức...'},'位':{py:'wèi',vn:'lượng từ lịch sự dùng cho người: vị'},'黄河':{py:'Huáng Hé',vn:'Hoàng Hà'}},
    20:{'成绩':{py:'chéngjì',vn:'thành tích, kết quả (học tập, công tác)'},'分':{py:'fēn',vn:'phân biệt'},'被':{py:'bèi',vn:'bị; giới từ đánh dấu câu bị động'}}
  };

  const G={
    1:[
      ['V + 好','“好” đứng sau động từ để biểu thị hành động đã đạt kết quả mong muốn hoặc đã hoàn tất, chuẩn bị xong.',['我已经准备好明天的东西了。','作业做好了。'],'好'],
      ['一 + 量词/名词 + 也/都 + 不/没 + V','Dùng “一……也/都 + 不/没……” để phủ định toàn bộ: không một... nào, hoàn toàn không.',['我一个苹果也没吃。','他一件衣服都没买。'],'也'],
      ['那 + mệnh đề','“那” nối với tình huống phía trước để đưa ra kết luận, đề nghị hoặc bước tiếp theo, tương đương “vậy/thế thì”.',['你今天没时间，那我们明天再去吧。','外面下雨了，那别出去了。'],'那']
    ],
    2:[
      ['V + 来 / 去','Bổ ngữ phương hướng đơn giản “来/去” cho biết động tác hướng về phía người nói (来) hay rời xa người nói (去).',['请把书拿来。','你先回去吧。'],'来'],
      ['V1 + 了……就 + V2……','Hai hành động xảy ra liên tiếp; hành động thứ hai nối ngay sau hành động thứ nhất. Nếu hai vế có hai chủ ngữ, chủ ngữ thứ hai đặt trước “就”.',['我下了课就回家。','你下了课我们就去书店。'],'就'],
      ['能 + khẳng định/phủ định + 吗？','“能……吗？” có thể dùng làm câu hỏi phản vấn: phần giữa khẳng định thì cả câu thường mang ý phủ định; phần giữa phủ định thì cả câu thường mang ý khẳng định.',['这么近，我能不去吗？','你不复习，能考好吗？'],'能']
    ],
    3:[
      ['还是（câu hỏi lựa chọn）/ 或者（câu trần thuật）','“还是” chủ yếu nối các lựa chọn trong câu hỏi; “或者” chủ yếu nối các khả năng/lựa chọn trong câu trần thuật.',['你喝茶还是喝咖啡？','周末我去公园或者在家休息。'],'还是'],
      ['处所词 + V着 + 数词 + 量词 + 名词','Câu tồn tại miêu tả người/vật đang tồn tại ở một nơi; động từ thường kèm “着”.',['桌子上放着一本书。','门口站着两个人。'],'着'],
      ['会 + V','“会” ngoài nghĩa biết làm còn có thể biểu thị khả năng/dự đoán sẽ xảy ra.',['明天会下雨。','他这么晚还没来，会不会迷路了？'],'会']
    ],
    4:[
      ['又 + A + 又 + B','“又……又……” nối hai tính chất hoặc hai hành động cùng tồn tại.',['她又聪明又热情。','这个苹果又大又甜。'],'又'],
      ['V1着（O1）+ V2（O2）','“V1着” biểu thị tư thế/trạng thái đi kèm khi thực hiện hành động chính V2.',['他笑着跟我说话。','她拿着书走进教室。'],'着']
    ],
    5:[
      ['……了','“了” đặt cuối câu có thể biểu thị sự thay đổi của tình trạng hoặc xuất hiện tình huống mới.',['天气冷了。','我现在不发烧了。'],'了'],
      ['越来越 + 形容词/心理动词','“越来越……” biểu thị mức độ tăng dần theo thời gian.',['天气越来越热了。','我越来越喜欢汉语了。'],'越来越']
    ],
    6:[
      ['V + 得/不 + 结果补语/趋向补语','Bổ ngữ khả năng cho biết một kết quả hoặc hướng có thể/không thể đạt được.',['这个字我看得清楚。','声音太小，我听不清楚。'],'得'],
      ['名词 + 呢？','“呢” sau danh từ/đại từ dùng để hỏi người hoặc vật đang ở đâu, hoặc hỏi tiếp cùng chủ đề.',['我的眼镜呢？','小王呢？'],'呢'],
      ['刚 / 刚才','“刚” là phó từ, đứng trước động từ và nhấn mạnh hành động vừa mới xảy ra; “刚才” là từ chỉ thời gian, có thể làm trạng ngữ/chủ đề và thường dùng với “了”.',['我刚到家。','刚才谁给你打电话了？'],'刚']
    ],
    7:[
      ['主语 + V + 时段 + 了','Khoảng thời gian đặt sau động từ cho biết hành động/trạng thái đã kéo dài bao lâu; “了” cuối câu thường cho biết vẫn liên quan tới hiện tại.',['我学汉语三年了。','他们认识五年了。'],'了'],
      ['对 + 人/事物 + 感兴趣','Dùng “对……感兴趣” để nói hứng thú đối với người/sự vật/chủ đề nào đó.',['我对中国历史很感兴趣。','她对运动不太感兴趣。'],'感兴趣'],
      ['半 / 刻 / 差 + thời gian','“半” = rưỡi/nửa giờ; “刻” = một phần tư giờ; “差” dùng để nói còn thiếu bao nhiêu phút đến giờ tiếp theo.',['现在八点半。','现在差一刻九点。'],'半']
    ],
    8:[
      ['又（đã lặp lại）/ 再（chưa xảy ra, sẽ lặp lại）','“又” thường nói một việc đã lặp lại trong quá khứ/hiện tại; “再” thường nói việc sẽ lặp lại trong tương lai hoặc sau đó.',['他昨天又迟到了。','这本书很好，我想再看一遍。'],'又'],
      ['疑问代词 + ... + 疑问代词 + ...','Đại từ nghi vấn có thể dùng phi nghi vấn để chỉ toàn thể/tùy ý: “ai... thì người đó”, “cái gì... thì cái đó”, “đâu... thì đó”.',['你想吃什么就点什么。','谁先来谁先坐。'],'什么']
    ],
    9:[
      ['越 A 越 B','“越A越B” cho biết khi A tăng/tiến triển thì B cũng thay đổi theo.',['天气越冷，我越想喝热茶。','他越说越快。'],'越'],
      ['A 跟 B 一样（+ 形容词）','Dùng “A跟B一样” để nói A và B giống nhau; có thể thêm tính từ sau “一样”.',['我的书跟你的一样。','她说汉语跟老师一样流利。'],'一样']
    ],
    10:[
      ['A 比 B + 形容词 + 一点儿/一些/得多/多了','Sau tính từ trong câu “比” có thể thêm “一点儿/一些” để chỉ chênh lệch nhỏ, “得多/多了” để chỉ chênh lệch lớn. Phủ định thường dùng “A没有B（这么/那么）+形容词”.',['今天比昨天冷一点儿。','地铁比公共汽车方便多了。'],'比'],
      ['相邻数词并列 + 量词 + 名词（如：三四个）','Hai số đếm liền nhau có thể đặt cạnh nhau để biểu thị số ước lượng, như 一两、两三、三四、五六、七八、八九.',['我每天学习一两个小时汉语。','附近有三四个车站。'],'一两']
    ],
    11:[
      ['A 把 B + V + 其他成分','Câu “把” đưa đối tượng chịu tác động lên trước động từ; sau động từ thường phải có thành phần khác như kết quả, số lượng, phương hướng...',['请把门关上。','我把那本书借来了。'],'把'],
      ['数量短语 + 左右','“左右” đặt sau cụm số lượng để biểu thị con số xấp xỉ, khoảng chừng.',['会议八点左右开始。','这里有二十个人左右。'],'左右']
    ],
    12:[
      ['才（muộn/chậm/ít hơn mong đợi）/ 就（sớm/nhanh/dễ hơn mong đợi）','“才” nhấn mạnh muộn, chậm, ít hoặc điều kiện khó; “就” nhấn mạnh sớm, nhanh, nhiều hoặc quan hệ điều kiện-kết quả trực tiếp.',['他十点才来。','我八点就到公司了。'],'才'],
      ['A 把 B + V + 在/到/给……','Câu “把” có thể dùng “V + 在/到/给……” để nói vị trí, đích đến hoặc người nhận sau khi xử lý B.',['请把书放在桌子上。','我把照片发给你了。'],'把']
    ],
    13:[
      ['V + 上/下/进/出/回/过/起 + 来/去','Bổ ngữ phương hướng kép gồm động từ phương hướng + 来/去; lựa chọn 来/去 theo hướng tương đối với người nói.',['他从外面走进来了。','请把书拿回去。'],'进来'],
      ['一边 + V1，一边 + V2','“一边……一边……” biểu thị hai hành động diễn ra đồng thời, thường cùng một chủ ngữ.',['我一边吃饭，一边听音乐。','他一边走，一边给朋友打电话。'],'一边']
    ],
    14:[
      ['A 把 B + V + 结果补语/趋向补语','Câu “把” loại 3 nhấn mạnh kết quả hoặc hướng của việc xử lý đối tượng B.',['请把房间打扫干净。','你把水果拿过来。'],'把'],
      ['先……，再/又……，然后……','Dùng “先、再/又、然后” để sắp xếp trình tự các hành động. “再” thường cho bước tiếp theo chưa xảy ra; “又” có thể kể hành động tiếp theo trong chuỗi đã xảy ra.',['我先洗澡，再看书，然后睡觉。','他先去了银行，又去了超市，然后回家。'],'先']
    ],
    15:[
      ['除了……以外，都/还/也……','“除了A以外，都……” loại trừ A khỏi toàn thể; “除了A以外，还/也……” bổ sung thêm A bên cạnh những mục khác.',['除了小王以外，大家都来了。','除了汉语以外，我还学英语。'],'除了'],
      ['疑问代词活用 2','Đại từ nghi vấn có thể chỉ mọi người/mọi vật không có ngoại lệ, thường kết hợp “都/也”.',['谁都可以参加。','我什么都想试试。'],'谁'],
      ['形容词 + 极了','“极了” đứng sau tính từ để biểu thị mức độ rất cao, thường mang sắc thái cảm thán.',['今天热极了。','这个地方漂亮极了。'],'极了']
    ],
    16:[
      ['如果……（的话），（主语）就……','Câu điều kiện “如果……（的话），……就……” nêu điều kiện ở vế trước và kết quả ở vế sau.',['如果明天下雨的话，我们就不去公园了。','如果你累了，就早点儿休息。'],'如果'],
      ['V + 得 + 复杂短语','Bổ ngữ trạng thái phức tạp sau “得” có thể là cụm động từ hoặc cụm chủ-vị để miêu tả mức độ/trạng thái do hành động gây ra.',['我累得下了班就想睡觉。','孩子高兴得一直笑。'],'得'],
      ['单音节形容词重叠：AA（的）','Tính từ đơn âm tiết có thể lặp AA để miêu tả tính chất một cách sinh động; thường dùng “的” khi bổ nghĩa danh từ.',['她有一双大大的眼睛。','桌子擦得干干净净。'],'大大']
    ],
    17:[
      ['双音节动词重叠：ABAB','Động từ hai âm tiết lặp theo dạng ABAB, thường biểu thị hành động ngắn, thử làm hoặc sắc thái nhẹ nhàng.',['我们讨论讨论这个问题吧。','你休息休息再走。'],'讨论讨论'],
      ['疑问代词活用 3','Đại từ nghi vấn có thể dùng để chỉ không xác định/nhượng bộ; ý nghĩa cụ thể phụ thuộc cấu trúc như “谁都…、什么都…、哪儿都…”.',['谁都有自己的办法。','哪儿都有人喜欢运动。'],'谁']
    ],
    18:[
      ['只要……，就……','“只要……就……” nêu một điều kiện đủ: chỉ cần điều kiện ở vế trước được thỏa mãn thì kết quả ở vế sau có thể xảy ra.',['只要你同意，我们就开始。','只要认真学习，就会有进步。'],'只要'],
      ['关于 + 名词/短语','“关于” là giới từ, đưa ra chủ đề/phạm vi mà lời nói hoặc sự việc liên quan đến; thường đứng đầu câu hoặc trước danh từ.',['关于这个问题，我想说两句。','这是一本关于中国文化的书。'],'关于']
    ],
    19:[
      ['趋向补语的引申义：起来/下来/出来……','Một số bổ ngữ phương hướng có nghĩa mở rộng: “起来” có thể chỉ bắt đầu/nhớ ra, “下来” chỉ tiếp tục/ổn định, “出来” chỉ nhận ra/phân biệt ra...',['天气慢慢暖和起来了。','我听出来是他的声音了。'],'起来'],
      ['使/叫/让 + 人 + V/形容词','“使、叫、让” tạo câu sai khiến/khiến cho; sau chúng là người/vật chịu tác động rồi đến động từ hoặc tính từ.',['这个消息让大家很高兴。','老师叫我们早点儿来。'],'让']
    ],
    20:[
      ['A 被（B）+ V + 其他成分','Câu “被” biểu thị bị động; A là đối tượng chịu tác động, B là tác nhân và có thể lược bỏ. Sau động từ thường có thành phần kết quả/hoàn thành.',['我的自行车被朋友借走了。','问题已经被解决了。'],'被'],
      ['只有……，才……','“只有……才……” nêu điều kiện cần: chỉ khi điều kiện ở vế trước được thỏa mãn thì kết quả ở vế sau mới xảy ra.',['只有认真练习，才会进步。','只有你们的爸爸妈妈才能分出来。'],'只有']
    ]
  };

  function ensureBa(L){
    if(L.id!==2)return;
    let idx=L.vocab.findIndex(x=>x.zh==='把');
    let item=idx>=0?L.vocab.splice(idx,1)[0]:{zh:'把',vn:'lượng từ cho đồ vật có cán hoặc tay cầm',textbook:true,textbookAdded:true};
    const after=L.vocab.findIndex(x=>x.zh==='楼');
    L.vocab.splice(after>=0?after+1:12,0,item);
  }
  function applyGrammar(L){
    const rows=G[L.id]||[];
    if(!Array.isArray(L.grammar))L.grammar=[];
    rows.forEach((r,i)=>{
      const g=L.grammar[i]||(L.grammar[i]={title:'',vn_title:'',examples:[]});
      g.structure=r[0];g.desc=r[1];g.examples=[...r[2]];g.auditFocus=r[3];g.textbook=true;g.audited=true;
    });
    if(L.grammar.length>rows.length)L.grammar=L.grammar.slice(0,rows.length);
    L.textbookGrammarCount=rows.length;
  }

  lessons.forEach(L=>{
    ensureBa(L);
    const expected=counts[L.id];
    if(!expected)return;
    // textbook-baseline places the official spine first; remove legacy raw extras from the teaching list.
    if(L.vocab.length>expected){L.extraVocab=L.vocab.slice(expected);L.vocab=L.vocab.slice(0,expected)}else L.extraVocab=[];
    if(L.vocab.length<expected)throw new Error(`HSK3 textbook audit: lesson ${L.id} vocab ${L.vocab.length}/${expected}`);
    const p=pos[L.id]||[];
    if(p.length!==expected)throw new Error(`HSK3 textbook audit: lesson ${L.id} POS ${p.length}/${expected}`);
    L.vocab.forEach((w,i)=>{w.textbook=true;w.pos=p[i];w.properName=(proper[L.id]||[]).includes(w.zh);w.aboveLevel=(extra[L.id]||[]).includes(w.zh);w.supplemental=!!w.aboveLevel;w.displayZh=(display[L.id]||{})[w.zh]||w.zh;const o=(overrides[L.id]||{})[w.zh];if(o)Object.assign(w,o)});
    L.textbookVocabCount=expected;L.lessonPage=pages[L.id];L.proverb={zh:proverbs[L.id][0],vn:proverbs[L.id][1]};L.culture=cultures[L.id]||null;
    applyGrammar(L);
  });
  window.HSK3_AUDIT_META={counts,pages,proverbs,cultures,proper,extra,overrides,grammar:G};
  window.__HSK3_CONTENT_AUDITED=true;
})();