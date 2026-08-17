/* New HSK 1 vocabulary classes and lesson-level 小语助力 tips.
   POS values are assigned by lesson order so polyfunctional words keep the
   class used in the lesson (for example 在 is v./prep./adv. in different lessons). */
(()=>{
  'use strict';
  const LABELS={
    n:'名词 · Danh từ',v:'动词 · Động từ',adj:'形容词 · Tính từ',adv:'副词 · Phó từ',
    pron:'代词 · Đại từ',num:'数词 · Số từ',m:'量词 · Lượng từ',part:'助词 · Trợ từ',
    prep:'介词 · Giới từ',conj:'连词 · Liên từ',modal:'能愿动词 · Động từ năng nguyện',
    loc:'方位词 · Từ chỉ phương vị',time:'时间词 · Từ chỉ thời gian',proper:'专有名词 · Danh từ riêng',
    phrase:'固定用语 · Cách nói cố định',interj:'叹词 · Thán từ',prefix:'前缀 · Tiền tố',
    'n/v':'名词/动词 · Danh từ/Động từ','num-m':'数量词 · Cụm số lượng'
  };

  const POS={
    1:['phrase','pron','adj','n','part','phrase','pron','pron','n','v','n','phrase','proper'],
    2:['adv','phrase','adj','adv','v','phrase','phrase','n','pron','phrase','v','pron','v','pron','adv'],
    3:['part','adj','n/v','n','adv','n','part','adj','pron','n','n','pron','pron','adv','interj','pron','v','pron','proper','proper','proper','n'],
    4:['adj','adj','pron','n','num','n','m','n','conj','pron','n','time','num','m','num','num','num','n','v','n','part','n','num','num','num','num','num','m','pron','num','num','v'],
    5:['n','n','adj','n','modal','n','time','n','n','pron','v','v','adj','n','time','time','v','num-m','n','adv','v','v'],
    6:['n','n','v','n','n','n','adv','adj','n','v','n','time','pron','loc','n','v','n','n','modal','m','pron','v','proper','proper'],
    7:['num','n','n','n','n','n','n','n','loc','n','v','v','n','loc','part','v','v','time','n','time','v','time','time','n','v','time'],
    8:['n','adj','v','adv','n','n','n/v','v','n','adv','modal','adj','loc','n','loc','n','loc','adj','n','n','prep','m','n','proper'],
    9:['m','loc','v','prefix','n','v','n','n','adj','conj','m','pron','pron','n','loc','loc','n','loc','v','v','n','v'],
    10:['n','v','adj','m','m','m','pron','pron','adj','adj','adj','n','n','n','adj','n','n','n','m','pron','loc','pron','pron'],
    11:['n','n','n','n','v','prep','n','v','pron','pron','v','n','v','v','v','v','n','v','modal','n','adv','v','adv','v','time'],
    12:['n','n','v','v','v','v','v','part','adj','adj','v','n','n','n','v','v','n','n','num-m','adv','n','adv','pron'],
    13:['m','n','v','n','v','modal','v','n','n','n','v','n','n','modal','num-m','num-m','adv','n','pron','v'],
    14:['phrase','adv','n','v','part','time','pron','v','v','v','pron','pron','pron','v','v','adj','n','n','v','pron','pron','time','n','n','n','n','n'],
    15:['n','adj','n','pron','n','v','pron','pron','n','n','time','n','m','modal','adj','v','proper','proper']
  };

  const TIPS={
    1:[
      {zh:'“您”是“你”的敬称。第一次见面、对老师或长辈说话时，用“您”更礼貌。',vn:'“您” là cách xưng hô kính trọng của “你”. Khi mới gặp hoặc nói với giáo viên, người lớn tuổi, dùng “您” sẽ lịch sự hơn.'},
      {zh:'“们”主要放在人称代词或表示人的名词后边：我们、你们、同学们。',vn:'“们” chủ yếu đứng sau đại từ nhân xưng hoặc danh từ chỉ người: 我们、你们、同学们.'}
    ],
    2:[
      {zh:'“请问”放在问题前边，可以让提问更礼貌。',vn:'Đặt “请问” trước câu hỏi giúp lời hỏi lịch sự, tự nhiên hơn.'},
      {zh:'汉语姓名通常先说姓，再说名，例如“王一雪”。',vn:'Tên tiếng Trung thường nói họ trước, tên sau, ví dụ “王一雪”.'}
    ],
    3:[
      {zh:'“谁”可以读 shéi，也可以读 shuí；日常口语中 shéi 更常见。',vn:'“谁” có thể đọc shéi hoặc shuí; trong khẩu ngữ hằng ngày, shéi thường gặp hơn.'},
      {zh:'人称代词和亲属称谓之间常省略“的”：我姐姐、他妈妈。',vn:'Giữa đại từ nhân xưng và danh từ chỉ quan hệ thân thuộc thường có thể lược “的”: 我姐姐、他妈妈.'}
    ],
    4:[
      {zh:'数数、读号码或表示序数时常用“二”；放在量词前通常用“两”：两个人、两本书。',vn:'Khi đếm, đọc số hoặc nói số thứ tự thường dùng “二”; trước lượng từ thường dùng “两”: 两个人、两本书.'},
      {zh:'问数量时，“几”多用于数量较小的情况；“多少”的范围更广。',vn:'Khi hỏi số lượng, “几” thường dùng với số lượng nhỏ; “多少” dùng rộng hơn.'}
    ],
    5:[
      {zh:'汉语日期按“年—月—日/号”的顺序说，不按越南语的日—月—年顺序。',vn:'Ngày tháng tiếng Trung nói theo thứ tự “năm - tháng - ngày”, khác thứ tự ngày - tháng - năm trong tiếng Việt.'},
      {zh:'说日期、星期和年龄时，常不用“是”：今天五月一号。',vn:'Khi nói ngày tháng, thứ hoặc tuổi, thường không dùng “是”: 今天五月一号。'}
    ],
    6:[
      {zh:'手机号一般逐个数字读；数字“1”在电话号码中也常读 yāo。',vn:'Số điện thoại thường đọc từng chữ số; số “1” trong số điện thoại cũng thường đọc là yāo.'},
      {zh:'“哪儿”和“哪里”都表示“ở đâu”，意思基本相同。',vn:'“哪儿” và “哪里” đều có nghĩa là “ở đâu”, cách dùng cơ bản giống nhau.'}
    ],
    7:[
      {zh:'说时间时用“点、分、半”：六点、六点十分、六点半。',vn:'Khi nói giờ dùng “点、分、半”: 六点, 六点十分, 六点半.'},
      {zh:'时间词语通常放在动词前：我晚上六点半下班。',vn:'Cụm từ thời gian thường đứng trước động từ: 我晚上六点半下班。'}
    ],
    8:[
      {zh:'方位词通常放在名词后边：桌子上、房间里、学校外。',vn:'Từ chỉ phương vị thường đứng sau danh từ: 桌子上, 房间里, 学校外.'},
      {zh:'表示动作发生的地方时，用“在 + 地点 + 动词”：我在学校吃午饭。',vn:'Để nói nơi hành động diễn ra, dùng “在 + địa điểm + động từ”: 我在学校吃午饭。'}
    ],
    9:[
      {zh:'“地方 + 有 + 人/物”强调存在；“地方 + 是 + 人/物”强调身份或类别。',vn:'“Nơi chốn + 有 + người/vật” nhấn mạnh sự tồn tại; “nơi chốn + 是 + người/vật” nhấn mạnh đó là ai/cái gì.'},
      {zh:'“第”放在数词前表示顺序：第一、第二、第三。',vn:'“第” đứng trước số từ để biểu thị thứ tự: 第一, 第二, 第三.'}
    ],
    10:[
      {zh:'口语中“元”常说“块”，“角”常说“毛”：三块五就是三元五角。',vn:'Trong khẩu ngữ, “元” thường nói là “块”, “角” thường nói là “毛”; 三块五 nghĩa là 3 tệ 5 hào.'},
      {zh:'形容词可以直接作谓语，一般不用“是”：这个苹果很贵。',vn:'Tính từ có thể trực tiếp làm vị ngữ, thường không dùng “是”: 这个苹果很贵。'}
    ],
    11:[
      {zh:'正反问句用“动词/形容词 + 不/没 + 动词/形容词”：去不去、去没去、好不好。',vn:'Câu hỏi chính-phản dùng “động/tính từ + 不/没 + động/tính từ”: 去不去, 去没去, 好不好.'},
      {zh:'“在/正在 + 动词”表示动作正在进行；否定一般用“没（有）”。',vn:'“在/正在 + động từ” biểu thị hành động đang diễn ra; dạng phủ định thường dùng “没（有）”.'}
    ],
    12:[
      {zh:'句末“了”常表示情况发生了变化：下雪了、十二点了。',vn:'“了” cuối câu thường biểu thị tình huống đã thay đổi: 下雪了, 十二点了.'},
      {zh:'“有点儿”多放在不太理想的形容词前：有点儿冷、有点儿贵。',vn:'“有点儿” thường đứng trước tính từ mang sắc thái không như ý: 有点儿冷, 有点儿贵.'}
    ],
    13:[
      {zh:'“动词 + 一下”让语气更轻、更礼貌：看一下、问一下。',vn:'“Động từ + 一下” làm sắc thái nhẹ và lịch sự hơn: 看一下, 问一下.'},
      {zh:'点饮料时要带合适的量词：一杯茶、一杯牛奶。',vn:'Khi gọi đồ uống cần dùng lượng từ phù hợp: 一杯茶, 一杯牛奶.'}
    ],
    14:[
      {zh:'动作已经发生时可以用“动词 + 了”；否定用“没（有）”，不用“了”。',vn:'Khi hành động đã xảy ra có thể dùng “động từ + 了”; phủ định dùng “没（有）” và không dùng “了”.'},
      {zh:'“都”放在它概括的人或事物后边：同学们都来了。',vn:'“都” đứng sau phạm vi người/vật mà nó khái quát: 同学们都来了。'}
    ],
    15:[
      {zh:'“也”和“还”都能表示补充；“也”强调相同，“还”强调另外增加。',vn:'“也” và “还” đều có thể bổ sung ý; “也” nhấn mạnh giống nhau, “还” nhấn mạnh thêm một điều nữa.'},
      {zh:'钟点用“点”，时长用“小时”：三点见；坐三个小时飞机。',vn:'Giờ trên đồng hồ dùng “点”, thời lượng dùng “小时”: 三点见; 坐三个小时飞机.'}
    ]
  };

  const lessons=window.HSK1_LESSONS||[];
  const errors=[];
  lessons.forEach(lesson=>{
    const codes=POS[lesson.id]||[];
    if(codes.length!==lesson.vocab.length)errors.push(`Bài ${lesson.id}: ${codes.length}/${lesson.vocab.length}`);
    lesson.vocab.forEach((word,index)=>{
      const code=codes[index]||(word.kind==='proper'?'proper':'');
      word.pos=code;
      word.posLabel=LABELS[code]||'';
    });
    lesson.xiaoyuTips=TIPS[lesson.id]||[];
  });
  window.__NEW_HSK1_POS_TIPS={version:'2026-08-17-v1',labels:LABELS,errors,assigned:lessons.reduce((n,l)=>n+l.vocab.filter(w=>w.posLabel).length,0)};
  if(errors.length)console.error('New HSK 1 POS audit failed:',errors);
})();
