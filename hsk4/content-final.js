/* HSK4 下 final textbook/content layer — 2026-08-14.
   Applies after content-audit.js and before UI render. Keeps the 2014 HSK Standard Course 4B
   textbook semantics explicit while separating textbook-era statements from current facts. */
(()=>{
'use strict';
const lessons=window.HSK4_LOWER_LESSONS;
if(!Array.isArray(lessons)||lessons.length!==10)throw new Error('HSK4 final: lesson data missing');
const byId=id=>lessons.find(x=>x.id===id);
const patchScene=(id,n,patch)=>Object.assign(byId(id).scenes[n-1],patch);
const POS={"11":["adj.","adj.","n.","adj.","n.","prep.","v.","v.","adj.","adv.","v.","v.","conj.","n.","conj.","n.","adj.","m.","v.","n.","part.","n.","conj.","n.","adj.","n.","v.","v.","conj.","adj."],"12":["n.","adj.","adj.","n.","adv.","v.","conj.","n.","n.","v.","n.","v.","m.","adj.","v.","prep.","n.","v.","v.","n.","adj.","v.","n.","adj.","idiom","v.","n.","conj.","n.","n.","adj.","v."],"13":["n.","n.","n.","adj.","v.","adv.","v.","m.","adv.","v.","n.","v.","adj.","v.","adj.","adj.","v.","prep.","v.","adv.","n.","n.","n.","v.","adj.","prep.","adv.","adj.","n.","adv.","adj.","n."],"14":["v.","n.","n.","adj.","v.","v.","v.","n.","adj.","v.","adj.","n.","v.","prep.","n.","n.","conj.","v.","adj.","n.","adj.","n.","conj.","v.","v.","v.","n.","n.","v.","v.","n.","adj."],"15":["v.","adj.","n.","n.","n.","n.","v.","v.","v.","n.","v.","v.","v.","v.","n.","v.","adv.","v.","adv.","v.","v.","adj.","v.","n.","adj.","n.","adj.","adj.","adj.","adj.","v."],"16":["n.","n.","v.","n.","v.","n.","v.","adj.","n.","n.","v.","adv.","v.","n.","adv.","part.","n.","n.","v.","v.","v.","v.","v.","n.","adj.","adj.","adj.","v.","v.","v.","v."],"17":["adj.","adj.","n.","n.","v.","adv.","n.","v.","v.","adj.","adj.","m.","v.","n.","n.","v.","adj.","n.","v.","n.","v.","adj.","n.","n.","n.","m.","adv.","v.","n."],"18":["v.","adj.","n.","n.","n.","adv.","m.","n.","phrase","n.","adj.","n.","v.","m.","n.","adj.","adv.","n.","v.","adj.","n.","v.","v.","v.","n.","n.","n.","n.","v.","n.","n.","n."],"19":["n.","v.","n.","v.","v.","v.","n.","n.","adj.","v.","v.","n.","n.","v.","v.","n.","n.","n.","v.","n.","v.","v.","adj.","n.","n.","v.","n.","n.","n.","m.","v.","n."],"20":["n.","n.","v.","n.","n.","n.","v.","adv.","adj.","n.","n.","v.","adj.","v.","n.","v.","n.","v.","n.","adv.","m.","n.","v.","n.","n.","v.","v.","adj.","adj.","adj."]};
const PROPER={"11":[{"zh":"大卫","py":"Dàwèi","vn":"tên người"}],"13":[{"zh":"广东省","py":"Guǎngdōng Shěng","vn":"tỉnh Quảng Đông, Trung Quốc"}],"17":[{"zh":"安娜","py":"Ānnà","vn":"tên người"},{"zh":"香山","py":"Xiāng Shān","vn":"Hương Sơn (Bắc Kinh)"},{"zh":"长城","py":"Chángchéng","vn":"Vạn Lý Trường Thành"},{"zh":"六一儿童节","py":"Liùyī Értóngjié","vn":"Ngày Quốc tế Thiếu nhi 1/6"},{"zh":"亚洲","py":"Yàzhōu","vn":"châu Á"}],"20":[{"zh":"首都机场","py":"Shǒudū Jīchǎng","vn":"Sân bay Quốc tế Thủ đô Bắc Kinh"},{"zh":"长江","py":"Cháng Jiāng","vn":"Trường Giang / sông Dương Tử"},{"zh":"长江大桥","py":"Chángjiāng Dàqiáo","vn":"Cầu Trường Giang (Nam Kinh trong ngữ cảnh giáo trình)"}]};
const TASKS={"11":{"warmup":["你平时喜欢读什么书？为什么？","考试阅读题做不完时，你通常怎样安排时间？"],"retell":["用“流利、准确、词语”概括马克学习汉语的方法。","用“来得及、复杂、只好、猜、否则”复述考试经历。","解释“读书好、读好书、好读书”三个短语的不同意思。"],"application":["为自己设计一个一周阅读计划，并说明怎样养成习惯。","比较“无论”和“不管”，各造一个符合语境的句子。"]},"12":{"warmup":["遇到旧方法解决不了的问题时，你会继续坚持还是换方法？为什么？","你觉得“用心发现世界”在生活中是什么意思？"],"retell":["复述“规定和经验是死的，人是活的”这一段的主要意思。","说明王教授为什么要根据学生特点选择不同教育方法。","用“事半功倍、相反、仔细”概括方法与效率的关系。"],"application":["选一个学习问题，提出两种解决方法并比较优缺点。","用“对于”和“关于”各写一句，说明两者对象/主题的区别。"]},"13":{"warmup":["你看过京剧或其他传统戏曲吗？印象最深的是什么？","你所在国家有哪些有代表性的餐具或饮食礼仪？"],"retell":["介绍小夏爷爷与京剧的关系。","说明马克怎样自学京剧以及为什么能学得好。","概括中国茶从药用到日常饮品的发展。"],"application":["向同学介绍一种传统艺术，至少使用“大概、偶尔、随着”中的两个。","比较“大概”和“也许”，分别造句并说明差别。"]},"14":{"warmup":["你旅行时会自带哪些日用品？为什么？","你每天做哪些可以减少能源或塑料使用的小事？"],"retell":["复述李进出差前关于毛巾、牙膏和交通方式的对话。","说明“地球一小时”课文中的活动背景与目的。","概括课文提出的几种日常环保做法。"],"application":["为班级设计一个“减少一次性用品”的小计划。","用“既然、于是、什么的”写一段环保主题短文。"]},"15":{"warmup":["你认为表扬孩子时应该更重视结果还是过程？","小时候谁对你的学习习惯影响最大？"],"retell":["说明父母为什么被称为孩子最重要的老师。","复述孩子如何学习安排时间、自己的事情自己做。","概括课文对“表扬”和“给孩子贴标签”的态度。"],"application":["针对“孩子做事慢”提出一种不批评、不欺骗的处理方法。","用“千万、左右、来”各造一个和教育/家庭有关的句子。"]},"16":{"warmup":["遇到无法完成的请求时，你会怎样礼貌拒绝？","你有没有拖到“明天”才做、最后来不及的经历？"],"retell":["复述小夏准备出国读博士、办理签证的情况。","解释王老板用三块西瓜说明机会与选择的故事。","概括“不要把事情推到明天”和“敢承认不知道”两段的主旨。"],"application":["写一段礼貌拒绝朋友请求的对话。","拿学习汉语来说，谈谈你认为最重要的两个习惯。"]},"17":{"warmup":["秋天你最喜欢去哪儿看自然景色？","你觉得动物、植物和海洋分别最需要人类保护什么？"],"retell":["按天气—香山—长城—时间安排的顺序复述课文1。","说明森林里的植物为什么会竞争，以及气候如何影响叶片形态。","复述海底世界中“能听到什么、能看到什么”的科学描述。"],"application":["谈谈你对保护动物实验、皮毛制品或森林保护中的一个问题的看法。","至少使用“倒、趟、为了……而……、仍然”中的三个写一段自然主题短文。"]},"18":{"warmup":["遇到不知道的问题时，你现在通常怎样找答案？","你最常用手机的哪些功能？哪些信息需要保护隐私？"],"retell":["介绍《新十万个为什么》为什么适合孩子。","概括电脑和互联网给学习与生活方式带来的变化。","说明科学技术为什么让世界像“地球村”。"],"application":["讨论互联网带来的两个便利和两个风险。","用“是否、接着、除此以外”写一段使用手机或电脑的说明。"]},"19":{"warmup":["你搬家或租房时最看重哪些条件？","你会哪些运动或舞蹈？学习动作时最难的是什么？"],"retell":["复述填错表格后重新打印填写的经过。","说明马克为什么一直联系不上房东。","概括看乒乓球比赛时课文提到的观赛规则。"],"application":["写一则简短租房需求，包含地点、厨房、安静程度等信息。","用“谁都/什么都、出来、在于”写三句话。"]},"20":{"warmup":["坐飞机前你会提前确认哪些信息？","你旅行时更重视风景、食物、语言还是其他体验？"],"retell":["复述航班推迟后去机场的安排。","介绍安娜在丽江的导游和旅行印象。","说明课文怎样区分上海话与上海人讲普通话时的“上海味儿”。"],"application":["比较你熟悉的两个地区在气候、饮食或语言上的差异。","讲一次难忘旅行，至少使用“一……就……、起来、V+起”中的两个结构。"]}};
const COMPREHENSION={"11":[{"q":"马克为什么能比较流利地使用汉语？","a":"因为他把汉语用在真实交流中，并通过阅读、查词典和复习不断积累词语。"},{"q":"小雨这次考试为什么有些题来不及做？","a":"因为他在复杂、没把握的题上花了太多时间，时间安排不合理。"},{"q":"课文怎样说明每天少量阅读也能产生积累？","a":"每天坚持读几页，一个月累积起来也能读很多内容。"},{"q":"做读书笔记时为什么还要有自己的判断？","a":"因为不能完全相信书本上的所有内容，要形成自己的看法和判断。"},{"q":"“好读书”在课题里是什么意思？","a":"这里“好”读 hào，意思是喜欢读书、养成阅读习惯。"}],"12":[{"q":"为什么课文说“规定和经验是死的，人是活的”？","a":"因为旧规定和经验不能解决所有新问题，人需要根据实际情况改变思路和方法。"},{"q":"课文中盐水洗新衣服的例子想说明什么？","a":"想说明生活中有很多问题可以通过观察、总结经验找到答案。"},{"q":"王教授为什么要对不同学生采用不同教育方法？","a":"因为学生的能力和特点不同，没有两个人完全一样。"},{"q":"直接指出别人的缺点为什么可能引起误会？","a":"因为虽然直接可能很诚实，但表达方式不合适会让对方感到不友好或被冒犯。"},{"q":"为什么别人的好方法不一定适合自己？","a":"因为每个人和每种情况不同，应该根据自己的实际情况选择方法。"}],"13":[{"q":"小夏为什么从小就对京剧比较熟悉？","a":"因为爷爷是京剧演员，小夏常看爷爷演出，还听爷爷讲京剧里的历史故事。"},{"q":"马克没有专业学过京剧，为什么仍然唱得不错？","a":"因为他有音乐基础、兴趣浓厚，并跟着电视反复练习，还会和中国人一起唱。"},{"q":"举办中国传统文化节的目的是什么？","a":"让各国学生更好地了解中国，并提供交流和学习的机会。"},{"q":"课文为什么说有些外国人觉得筷子难用？","a":"因为筷子的使用方法需要练习，一些国外中餐馆甚至会提供详细说明。"},{"q":"茶在中国的用途发生了怎样的变化？","a":"最早曾被当作药，后来逐渐成为解渴饮品，并形成了茶文化。"}],"14":[{"q":"王静为什么建议李进自己带毛巾和牙膏？","a":"因为她认为保护环境应从身边的小事做起，减少一次性用品的使用。"},{"q":"经理对餐厅卫生提出了什么要求？","a":"不管客人多、生意多忙，都要保证餐厅干净卫生。"},{"q":"“地球一小时”活动的主要目的是什么？","a":"通过关灯一小时提醒人们节约用电并关注气候和环境问题。"},{"q":"课文提出哪些减少塑料袋使用的方法？","a":"不免费提供、鼓励重复使用购物袋、自备购物袋并减少或拒绝使用塑料袋。"},{"q":"课文认为普通人可以从哪些小事保护环境？","a":"提高空调温度、关掉不用的电器、少开车、多用公共交通并把垃圾扔进垃圾桶等。"}],"15":[{"q":"课文为什么说父母是孩子最重要的老师？","a":"因为父母长期陪伴孩子，言行和教育方式会直接影响孩子习惯与成长。"},{"q":"孩子做事慢时，课文建议培养什么能力？","a":"培养安排时间和自己处理自己事情的能力。"},{"q":"表扬孩子时为什么不能只看结果？","a":"因为有效表扬还要关注过程、努力和具体行为，过度表扬也可能带来压力。"},{"q":"孩子故意哭闹或敲东西引起注意时，父母应该先做什么？","a":"先冷静下来，陪孩子整理东西并沟通，弄清问题，而不是生气或欺骗孩子。"},{"q":"为什么不应该随便给孩子贴“懒、笨、粗心”的标签？","a":"因为孩子性格和发展特点不同，需要合适的教育方法，负面标签会伤害和限制孩子。"}],"16":[{"q":"小夏办理出国读博士的材料中还缺什么？","a":"还没有收到国外大学传真来的邀请信。"},{"q":"王老板为什么先吃最小的一块西瓜？","a":"因为这样在别人还没吃完最大一块时，他还有时间再吃一块，用来说明抓住机会和选择策略。"},{"q":"课文为什么说礼貌拒绝有时反而是负责？","a":"因为对无法完成的任务及时说明情况，比勉强答应后做不到更负责任。"},{"q":"课文怎样批评把事情都推到“明天”的习惯？","a":"拖延会浪费时间并导致事情最后做不完，应该从现在开始行动。"},{"q":"敢说“我不知道”为什么不等于比别人差？","a":"因为诚实承认不了解能保持冷静并继续学习，反而更容易得到尊重。"}],"17":[{"q":"安娜为什么当天没有去香山看红叶？","a":"小夏判断当天可能有大雨，而且香山看红叶的人太多，于是建议改天去长城。"},{"q":"训练狗完成任务为什么不能只教一次？","a":"需要耐心反复训练，让它熟悉要求后才能比较稳定地完成任务。"},{"q":"北京动物园课文里为什么特别提到大熊猫？","a":"因为大熊猫数量不多、很受欢迎，也是需要保护的动物。"},{"q":"为什么不同地区植物的叶子形状会不同？","a":"因为气候、水分和阳光条件不同；暖和湿润处叶子往往大而厚，阳光强且水少处往往细而长。"},{"q":"海底看上去很安静，为什么课文说并不是没有声音？","a":"因为海底动物一直在“说话”，只是很多声音人的耳朵听不到；深海里还可看到一些鱼发出的彩色亮光。"}],"18":[{"q":"《新十万个为什么》为什么适合孩子阅读？","a":"内容涵盖多种科学知识，语言比较简单易懂，能帮助孩子增长科学知识。"},{"q":"课文举了哪些互联网改变学习和生活的例子？","a":"上网快速找答案、网上写日记、使用密码控制谁能看到内容等。"},{"q":"王静为什么梦到到处找矿泉水？","a":"因为她晚饭吃得太咸，睡觉时身体的感觉进入了梦的内容。"},{"q":"课文说现代手机有哪些用途？","a":"除打电话发短信外，还可听音乐、看电影、阅读、玩游戏、付款购物和用地图查地址等。"},{"q":"为什么人们把现代世界比作“地球村”？","a":"因为飞机、电子邮件和网站等科技大幅缩短了人与人之间的时间和空间距离。"}],"19":[{"q":"学生为什么需要重新打印并填写表格？","a":"因为原来的表格里护照号码填错了，需要重新核对并填写。"},{"q":"做饺子时发生了什么意外？","a":"有人用刀时把手弄破了，之后改为买包子等替代办法。"},{"q":"课文怎样说明舞蹈可以跨越国籍差异？","a":"舞蹈通过身体动作表达意思，不同国籍的人也能观察动作、模仿并交流。"},{"q":"马克为什么一直没联系上房东？","a":"因为他记错了电话号码中的一个数字。"},{"q":"看乒乓球比赛时，运动员发球阶段观众应注意什么？","a":"要保持安静，不大声讲话，也不要随便离开座位走动。"}],"20":[{"q":"航班推迟以后，去机场的安排为什么也要调整？","a":"因为出发时间和到机场的时间都要重新计算，还要考虑加油和高速公路行程。"},{"q":"孙月一家为什么准备带女儿去广西旅行？","a":"想让女儿在辛苦学习后放松，并在她考试全部合格时把旅行消息作为惊喜告诉她。"},{"q":"安娜照片里和她干杯的人是谁？","a":"是她在丽江旅行时的导游，不是少数民族。"},{"q":"课文怎样区分“上海话”和上海人说的普通话？","a":"上海话本身与普通话差别很大；上海人也会讲普通话，但说普通话时仍可能带有上海口音。"},{"q":"对课文中的“我”来说，旅行最重要的收获之一是什么？","a":"有机会品尝各地有名的小吃，尤其湖南菜的咸辣、香辣和酸辣给他留下深刻印象。"}]};
const SCENE_PATCHES={"12-2":{"contextNote":"教材把“用盐水洗新衣服”作为人物分享的生活经验。这里保留教材语境，不把它表述为经过本站独立验证的现代纺织护理结论。"},"13-4":{"contextNote":"“每六个中国人中有一个使用筷子的方法是错误的”是教材课文转述的一项网络调查，教材未提供调查机构、样本和年份；学习时应把它当作课文信息，而不是当前人口统计事实。"},"14-3":{"summary":"Tôn Nguyệt nghe tin về “Giờ Trái Đất”. Vương Tĩnh giải thích hoạt động bắt đầu từ năm 2007 và kêu gọi mọi người tắt đèn một giờ để nhắc nhở tiết kiệm điện, quan tâm đến khí hậu và môi trường. Trong đoạn hội thoại, khi nghe công ty tối hôm sau sẽ tắt đèn/ngắt điện, Tôn Nguyệt vui vì nghĩ rằng mình không phải tăng ca.","points":"“地球一小时”最早从2007年开始，活动倡议关灯一小时。|这个活动的目的，是提醒人们节约用电并关注气候变暖等环境问题。","contextNote":"“公司会关灯停电”是课文人物所在公司的安排，并带有孙月想到“不用加班”的对话语境；不要把“整家公司停电”理解成“地球一小时”对所有参与者的统一规则。"},"17-1":{"summary":"Tiểu Hạ và Anna nói về thời tiết đầu thu và kế hoạch đi ngắm lá đỏ. Anna muốn tới Hương Sơn vì nhiệt độ giảm làm nhiều lá chuyển từ xanh sang vàng hoặc đỏ. Tiểu Hạ nhìn mây, cho rằng hôm đó có thể mưa to và Hương Sơn quá đông nên đề nghị đổi sang Vạn Lý Trường Thành; ngày hôm sau lại vướng sinh nhật bố của Tiểu Hạ, nên hai người hẹn dịp khác.","points":"随着气温降低，香山许多植物的叶子由绿变黄或者变红，吸引很多游客。|小夏担心当天会下大雨，而且香山人太多，所以建议改天去长城。"},"17-4":{"summary":"Không chỉ con người mà thực vật trong rừng cũng cạnh tranh ánh sáng, không khí và nước. Cây cao thường nhận được nhiều tài nguyên hơn, cây thấp phải sống phía dưới. Khí hậu còn ảnh hưởng rõ đến hình dạng lá: nơi ấm và nhiều nước, lá thường lớn và dày; nơi nắng mạnh, ít nước, lá thường hẹp và dài.","points":"森林里的植物会为了阳光、空气和水而竞争。|气候条件不同会影响叶子的样子：暖和、水分多的地方叶子往往又大又厚，阳光强、水分少的地方往往又细又长。"},"17-5":{"summary":"Khoảng 71% bề mặt Trái Đất là đại dương. Thế giới đáy biển nhìn bề ngoài rất yên tĩnh nhưng không phải hoàn toàn không có âm thanh: các động vật biển vẫn “nói chuyện”, chỉ là tai người không nghe được nhiều âm thanh đó. Ngay cả ở độ sâu vài kilômét vẫn có thể nhìn thấy ánh sáng do nhiều loài cá phát ra với nhiều màu khác nhau, giống những chiếc đèn xếp thành hàng.","points":"海洋底部看上去非常安静，然而海底的动物们一直在“说话”，只是人的耳朵听不到。|就算在几公里深的海底也仍然能看到东西，许多鱼会发出各种颜色的亮光。","contextNote":"课文中的“71%”和海底声音、发光描述用于语言学习；本页按教材原意呈现，不把概括句改写成“海底没有声音”。"},"18-2":{"contextNote":"课文里的“70%的人遇到问题首先想到上网找答案”属于2014年教材语境中的调查转述，教材未给出调查机构、样本和年份；它不应被读成2026年的最新统计数据。"},"20-2":{"contextNote":"“广西冬天比较暖和、能吃到新鲜水果”是教材人物在旅行计划中的描述。实际旅行时仍应根据具体城市、日期和实时天气判断。"},"20-3":{"contextNote":"“12月至次年3月游客较少、交通和吃住较便宜”是教材人物安娜的旅行经验，反映教材成书时期的叙述，不作为2026年的实时价格或客流建议。"},"20-4":{"summary":"Bài đọc so sánh khác biệt Nam–Bắc Trung Quốc về khí hậu, cảnh vật, ẩm thực và ngôn ngữ. Khi đi tàu từ Bắc xuống Nam vào tháng 3–4, cảnh sắc thay đổi rõ theo khí hậu; món ăn miền Nam, đặc biệt là canh, cũng có nét riêng. Về ngôn ngữ, bài đọc nói tiếng Thượng Hải nghe rất khác tiếng Phổ thông; người Thượng Hải vẫn nói được tiếng Phổ thông, nhưng khi nói thường còn mang “vị”/giọng Thượng Hải.","points":"上海话本身和普通话差别很大，课文说它听起来“像外语一样”。|上海人也会讲普通话，但仔细听，普通话里仍可能带有上海味儿。"}};
const PY_OVERRIDES={"厉害":"lìhai","来得及":"láidejí","勺子":"sháozi","叶子":"yèzi","商量":"shāngliang","部分":"bùfen","孙子":"sūnzi","闹钟":"nàozhōng","胳膊":"gēbo","马虎":"mǎhu","暖和":"nuǎnhuo","热闹":"rènao","功夫":"gōngfu","打扮":"dǎban","笑话":"xiàohua","钥匙":"yàoshi","收拾":"shōushi","小伙子":"xiǎohuǒzi","盒子":"hézi","呀":"ya","照":"zhào","倒":"dào","干":"gàn","火":"huǒ","怪":"guài","转":"zhuǎn","场":"chǎng","省":"shěng","行":"xíng","空":"kōng","重":"zhòng","假":"jiǎ","填空":"tián kòng","凉快":"liángkuai","放暑假":"fàng shǔjià","弹钢琴":"tán gāngqín","打招呼":"dǎ zhāohu","打针":"dǎ zhēn","道歉":"dào qiàn","出差":"chū chāi","报名":"bào míng","付款":"fù kuǎn","理发":"lǐ fà"};
const POS_LABELS={'n.':'名词 · Danh từ','v.':'动词 · Động từ','adj.':'形容词 · Tính từ','adv.':'副词 · Phó từ','prep.':'介词 · Giới từ','conj.':'连词 · Liên từ','part.':'助词 · Trợ từ','m.':'量词 · Lượng từ','phrase':'短语 · Cụm từ','idiom':'成语 · Thành ngữ'};
window.HSK4_POS_LABELS=POS_LABELS;

byId(16).title='生活可以更美好';
byId(16).vn_title='Cuộc sống có thể tốt đẹp hơn';

const targetSense={
'11|词语':'từ ngữ; cách diễn đạt',
'11|之':'trợ từ văn viết nối định ngữ với trung tâm ngữ; tương đương “的” trong nhiều trường hợp',
'13|厚':'sâu sắc; sâu đậm','13|省':'tỉnh (đơn vị hành chính)',
'14|丢':'vứt; ném',
'15|骄傲':'kiêu ngạo; tự mãn',
'16|传真':'gửi fax; gửi bằng fax','16|推':'hoãn; dời lại',
'17|照':'chụp; chụp ảnh',
'18|火':'hot; nổi tiếng, thịnh hành (khẩu ngữ)','18|举':'nêu; đưa ra (ví dụ)','18|收':'nhận',
'19|功夫':'võ công; kung fu',
'20|怪':'khá; thật là; tương đối (phó từ khẩu ngữ)','20|打扮':'ăn mặc; sửa soạn, chưng diện',
'20|存':'cất giữ; gửi giữ; lưu trữ','20|小吃':'món ăn nhẹ; món ăn bình dân địa phương'
};

for(const L of lessons){
  L.pdfPage=Number(L.page);
  L.bookPage=Number(L.page)-8;
  L.textbookEdition='2014-11';
  L.textbookSystem='HSK Standard Course 4B · 《HSK标准教程4（下）》教材口径';
  const pos=POS[String(L.id)];
  if(!pos||pos.length!==L.vocab.length)throw new Error(`HSK4 final: POS count mismatch lesson ${L.id}`);
  L.vocab.forEach((w,i)=>{
    w.pos=pos[i];
    w.posLabel=POS_LABELS[w.pos]||w.pos;
    const key=`${L.id}|${w.zh}`;
    if(targetSense[key])w.vn=targetSense[key];
    if(PY_OVERRIDES[w.zh])w.py=PY_OVERRIDES[w.zh];
    else if(window.pinyinPro?.pinyin){
      try{w.py=window.pinyinPro.pinyin(w.zh,{toneType:'symbol',type:'array'}).join(' ')}catch{}
    }
  });
  L.properNouns=PROPER[String(L.id)]||[];
  L.tasks=TASKS[String(L.id)];
  L.comprehension=COMPREHENSION[String(L.id)];
}

byId(11).titlePinyin='Dúshū hǎo, dú hǎo shū, hào dúshū';
byId(11).titleToneNote='课题里的前两个“好”读 hǎo（好、有益；好的书），最后一个“好”读 hào（喜爱、爱好）。';
byId(13).expansion.vn='同字“量”在词中读音不同：商量 shāngliang；数量 shùliàng；质量 zhìliàng。';
byId(18).culture.vn='教材以微博与微信说明网络技术如何改变信息分享与交流。这里保留2014年教材的文化主题；平台功能、产品规则和使用习惯会随时间变化，学习时不要把教材中的早期功能描述当作2026年的实时产品说明。';

Object.entries(SCENE_PATCHES).forEach(([key,patch])=>{
  const [id,n]=key.split('-').map(Number);patchScene(id,n,patch);
});

const eraNotes={
12:'本课第2篇中的盐水护色属于教材人物分享的生活经验。',
13:'本课第4篇引用的网络调查没有在教材中给出调查机构、样本和年份。',
18:'本课涉及的“70%”调查、网上日记、微博/微信等内容应按2014年教材语境理解。',
20:'本课旅行季节、价格和客流描述来自教材人物经验，不替代实时旅行信息。'
};
lessons.forEach(L=>{if(eraNotes[L.id])L.eraNote=eraNotes[L.id]});

for(const L of lessons){
  if(!L.vocab.every(w=>w.pos))throw new Error(`HSK4 final: missing POS lesson ${L.id}`);
  if(!Array.isArray(L.tasks?.warmup)||!Array.isArray(L.tasks?.retell)||!Array.isArray(L.tasks?.application))throw new Error(`HSK4 final: missing tasks lesson ${L.id}`);
  if(!Array.isArray(L.comprehension)||L.comprehension.length!==5)throw new Error(`HSK4 final: missing comprehension lesson ${L.id}`);
  if(L.bookPage!==L.pdfPage-8)throw new Error(`HSK4 final: page mapping lesson ${L.id}`);
}
if(byId(16).title!=='生活可以更美好')throw new Error('HSK4 final: lesson16 title');
if(!byId(17).scenes[4].points.includes('海底的动物们一直在“说话”')||!byId(17).scenes[4].points.includes('各种颜色的亮光'))throw new Error('HSK4 final: lesson17 scene5');
if(!byId(20).scenes[3].points.includes('上海话')||!byId(20).scenes[3].points.includes('普通话'))throw new Error('HSK4 final: lesson20 scene4');

window.HSK4_LOWER_CONTENT_FINAL={
  version:'2026-08-14.5',
  textbook:'HSK Standard Course 4B / 《HSK标准教程4（下）》',
  publication:'2014-11',
  syllabusContext:'《HSK标准教程4（下）》教材口径',
  lessons:10,
  vocab:lessons.reduce((n,L)=>n+L.vocab.length,0),
  vocabWithPos:lessons.reduce((n,L)=>n+L.vocab.filter(w=>w.pos).length,0),
  properNouns:lessons.reduce((n,L)=>n+L.properNouns.length,0),
  comprehension:lessons.reduce((n,L)=>n+L.comprehension.length,0),
  corrected:true
};
document.documentElement.dataset.hsk4ContentFinal='20260814-5';
})();
