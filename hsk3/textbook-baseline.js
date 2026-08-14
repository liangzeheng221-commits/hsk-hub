/* HSK Standard Course 3 textbook baseline.
   - Keeps the official lesson-vocabulary spine in textbook order.
   - Restores missing textbook headwords without deleting useful supplemental items.
   - Locks grammar point headings/structures to the textbook table of contents.
*/
(()=>{
  const B={
1:{v:[['周末','cuối tuần'],['打算','dự định'],['啊','a; nhé; vậy'],['跟','với; cùng'],['一直','liên tục; suốt'],['游戏','trò chơi'],['作业','bài tập'],['着急','sốt ruột'],['复习','ôn tập'],['南方','phía Nam'],['北方','phía Bắc'],['面包','bánh mì'],['带','mang; đem'],['地图','bản đồ'],['搬','chuyển; dọn'],['小丽','Tiểu Lệ (tên người)'],['小刚','Tiểu Cương (tên người)']],g:[['结果补语“好”','Bổ ngữ kết quả “好”','V + 好'],['“一……也/都 + 不/没……”表否定','Cấu trúc phủ định toàn bộ','一 + lượng từ/danh từ + 也/都 + 不/没 + V'],['连词“那”','Liên từ “那”','那 + mệnh đề']]},
2:{v:[['腿','chân'],['疼','đau'],['脚','bàn chân'],['树','cây'],['容易','dễ'],['难','khó'],['太太','bà; vợ'],['秘书','thư ký'],['经理','giám đốc; quản lý'],['办公室','văn phòng'],['辆','lượng từ cho xe'],['楼','tòa nhà; tầng'],['拿','cầm; lấy'],['伞','ô; dù'],['胖','béo'],['其实','thực ra'],['瘦','gầy'],['周','họ Chu'],['周明','Chu Minh (tên người)']],g:[['简单趋向补语','Bổ ngữ chỉ phương hướng đơn giản','V + 来/去'],['两个动作连续发生','Hai hành động xảy ra liên tiếp','V1 + O1 + V2 + O2'],['反问的表达：能……吗？','Câu hỏi phản vấn với “能……吗？”','能……吗？']]},
3:{v:[['还是','hay là'],['爬山','leo núi'],['小心','cẩn thận'],['条','lượng từ cho vật dài/mềm'],['裤子','quần'],['记得','nhớ'],['衬衫','áo sơ mi'],['元','tệ; đồng nhân dân tệ'],['新鲜','tươi'],['甜','ngọt'],['只','chỉ'],['放','đặt; để'],['饮料','đồ uống'],['或者','hoặc'],['舒服','thoải mái'],['花','hoa'],['绿','xanh lục']],g:[['“还是”和“或者”','“还是” và “或者”','还是 / 或者'],['存在的表达','Cách diễn tả sự tồn tại','处所词 + V着 + 数词 + 量词 + 名词'],['“会”表示可能','“会” biểu thị khả năng','会 + V']]},
4:{v:[['比赛','cuộc thi; trận đấu'],['照片','ảnh'],['年级','khối; năm học'],['又','lại; vừa...vừa'],['聪明','thông minh'],['热情','nhiệt tình'],['努力','nỗ lực'],['总是','luôn luôn'],['回答','trả lời'],['站','đứng'],['饿','đói'],['超市','siêu thị'],['蛋糕','bánh ngọt'],['年轻','trẻ'],['认真','nghiêm túc'],['客人','khách'],['小明','Tiểu Minh (tên người)'],['马可','Marco (tên người)'],['李小美','Lý Tiểu Mỹ (tên người)']],g:[['又……又……','Cấu trúc “vừa... vừa...”','又 + Adj/V + 又 + Adj/V'],['动作的伴随','Hành động đi kèm','V1着（O1）+ V2（O2）']]},
5:{v:[['发烧','sốt'],['为','vì; cho'],['照顾','chăm sóc'],['用','dùng'],['感冒','cảm cúm'],['季节','mùa'],['当然','đương nhiên'],['春天','mùa xuân'],['草','cỏ'],['夏天','mùa hè'],['裙子','váy'],['最近','gần đây'],['越','càng'],['张','họ Trương; lượng từ']],g:[['“了”表示变化','“了” biểu thị sự thay đổi','……了'],['越来越 + 形容词/心理动词','Càng ngày càng...','越来越 + Adj/động từ tâm lý']]},
6:{v:[['眼镜','kính mắt'],['突然','đột nhiên'],['离开','rời khỏi'],['清楚','rõ ràng'],['刚才','vừa nãy'],['帮忙','giúp đỡ'],['特别','đặc biệt'],['讲','nói; giảng'],['明白','hiểu'],['锻炼','rèn luyện'],['音乐','âm nhạc'],['公园','công viên'],['聊天儿','trò chuyện'],['睡着','ngủ thiếp đi'],['更','càng hơn']],g:[['可能补语','Bổ ngữ khả năng','V + 得/不 + 结果/趋向补语'],['“呢”询问处所','Dùng “呢” hỏi vị trí','名词 + 呢？'],['“刚”和“刚才”','Phân biệt “刚” và “刚才”','刚 / 刚才']]},
7:{v:[['同事','đồng nghiệp'],['以前','trước đây'],['银行','ngân hàng'],['久','lâu'],['感兴趣','cảm thấy hứng thú'],['结婚','kết hôn'],['欢迎','hoan nghênh'],['迟到','đến muộn'],['半','nửa'],['接','đón; nhận'],['刻','khắc; 15 phút'],['差','kém; còn thiếu']],g:[['时段的表达','Cách biểu đạt khoảng thời gian','时长 + 了'],['表达兴趣','Cách biểu đạt sự hứng thú','对……感兴趣'],['用“半”“刻”“差”表示时间','Nói giờ với “半/刻/差”','半 / 刻 / 差']]},
8:{v:[['又','lại'],['满意','hài lòng'],['电梯','thang máy'],['层','tầng'],['害怕','sợ'],['熊猫','gấu trúc'],['见面','gặp mặt'],['安静','yên tĩnh'],['可乐','cola'],['一会儿','một lát'],['马上','ngay lập tức'],['洗手间','nhà vệ sinh'],['老','già; cũ'],['几乎','gần như'],['变化','thay đổi'],['健康','sức khỏe; khỏe mạnh'],['重要','quan trọng']],g:[['“又”和“再”','Phân biệt “又” và “再”','又 / 再'],['疑问代词活用 1','Đại từ nghi vấn dùng linh hoạt (1)','谁/什么/哪儿...']]},
9:{v:[['中文','tiếng Trung'],['班','lớp'],['一样','giống nhau'],['最后','cuối cùng'],['放心','yên tâm'],['一定','nhất định'],['担心','lo lắng'],['比较','khá; tương đối; so sánh'],['了解','hiểu; tìm hiểu'],['先','trước'],['中间','ở giữa'],['参加','tham gia'],['影响','ảnh hưởng'],['大山','Đại Sơn (tên người)'],['李静','Lý Tĩnh (tên người)']],g:[['越A越B','Càng A càng B','越 A 越 B'],['比较句 1','Câu so sánh (1)','A 跟 B 一样（+ 形容词）']]},
10:{v:[['个子','vóc dáng; chiều cao'],['矮','thấp'],['历史','lịch sử'],['体育','thể dục; thể thao'],['数学','toán học'],['方便','thuận tiện'],['自行车','xe đạp'],['骑','đi; cưỡi'],['旧','cũ'],['换','đổi'],['地方','nơi; chỗ'],['中介','trung gian; môi giới'],['主要','chủ yếu'],['环境','môi trường'],['附近','gần; khu vực lân cận']],g:[['比较句 2','Câu so sánh (2)','A 比 B + Adj + 一点儿/一些/得多/多了'],['概数的表达 1','Cách biểu đạt số ước lượng (1)','数词 + 多/几...']]},
11:{v:[['图书馆','thư viện'],['借','mượn'],['词典','từ điển'],['还','trả; còn'],['灯','đèn'],['会议','cuộc họp'],['结束','kết thúc'],['忘记','quên'],['空调','điều hòa'],['关','tắt; đóng'],['地铁','tàu điện ngầm'],['双','đôi'],['筷子','đũa'],['啤酒','bia'],['口','ngụm; miệng'],['瓶子','chai; lọ'],['笔记本电脑','máy tính xách tay'],['电子邮件','thư điện tử'],['习惯','thói quen; quen']],g:[['“把”字句 1','Câu chữ 把 (1)','A 把 B + V + ……'],['概数的表达 2：左右','Cách biểu đạt số ước lượng (2)','数量 + 左右']]},
12:{v:[['太阳','mặt trời'],['西','phía Tây'],['生气','tức giận'],['行李箱','va-li'],['自己','bản thân'],['包','túi; gói'],['发现','phát hiện'],['护照','hộ chiếu'],['起飞','cất cánh'],['司机','tài xế'],['教','dạy'],['画','vẽ'],['需要','cần'],['黑板','bảng đen']],g:[['“才”和“就”','Phân biệt “才” và “就”','才 / 就'],['“把”字句 2','Câu chữ 把 (2)','A 把 B + V + 在/到/给……']]},
13:{v:[['终于','cuối cùng'],['爷爷','ông nội'],['礼物','quà'],['奶奶','bà nội'],['遇到','gặp'],['一边','một bên; vừa...'],['过去','đi qua; quá khứ'],['一般','thông thường'],['愿意','bằng lòng'],['起来','đứng/dậy; lên'],['应该','nên'],['生活','cuộc sống; sinh sống'],['校长','hiệu trưởng'],['坏','xấu; hỏng'],['经常','thường xuyên']],g:[['复合趋向补语','Bổ ngữ chỉ phương hướng dạng kết hợp','V + 上/下/进/出/回/过/起 + 来/去'],['一边……一边……','Vừa... vừa...','一边 + V1，一边 + V2']]},
14:{v:[['打扫','quét dọn'],['干净','sạch'],['然后','sau đó'],['冰箱','tủ lạnh'],['洗澡','tắm'],['节目','chương trình'],['月亮','mặt trăng'],['像','giống như'],['盘子','đĩa'],['刮风','có gió'],['叔叔','chú; bác trai'],['阿姨','cô; dì'],['故事','câu chuyện'],['声音','âm thanh'],['菜单','thực đơn'],['简单','đơn giản'],['香蕉','chuối']],g:[['“把”字句 3','Câu chữ 把 (3)','A 把 B + V + 结果补语/趋向补语'],['先……，再/又……，然后……','Trình tự hành động','先……，再/又……，然后……']]},
15:{v:[['留学','du học'],['水平','trình độ'],['提高','nâng cao'],['练习','luyện tập'],['完成','hoàn thành'],['句子','câu'],['其他','khác'],['发','gửi; phát'],['要求','yêu cầu'],['注意','chú ý'],['上网','lên mạng'],['除了','ngoài; trừ'],['新闻','tin tức'],['花','tốn; tiêu'],['极了','cực kỳ'],['节日','ngày lễ'],['举行','tổ chức'],['世界','thế giới'],['街道','đường phố'],['各','mỗi; các'],['文化','văn hóa'],['小云','Tiểu Vân (tên người)']],g:[['除了……以外，都/还/也……','Ngoài... ra...','除了……以外，都/还/也……'],['疑问代词活用 2','Đại từ nghi vấn dùng linh hoạt (2)','谁/什么/哪儿...'],['程度的表达：极了','Biểu đạt mức độ với “极了”','Adj + 极了']]},
16:{v:[['城市','thành phố'],['如果','nếu'],['认为','cho rằng'],['皮鞋','giày da'],['帽子','mũ'],['长','dài'],['可爱','đáng yêu'],['米','mét'],['公斤','kilôgam'],['鼻子','mũi'],['头发','tóc'],['检查','kiểm tra'],['刷牙','đánh răng'],['关系','quan hệ'],['别人','người khác'],['词语','từ ngữ']],g:[['如果……（的话），（主语）就……','Câu điều kiện “nếu... thì...”','如果……（的话），（主语）就……'],['复杂的状态补语','Bổ ngữ trạng thái phức tạp','V + 得 + cụm từ'],['单音节形容词重叠','Tính từ một âm tiết lặp lại','AA']]},
17:{v:[['请假','xin nghỉ'],['一共','tổng cộng'],['邻居','hàng xóm'],['后来','sau đó'],['爱好','sở thích'],['办法','cách; biện pháp'],['饱','no'],['为了','để; vì'],['决定','quyết định'],['选择','lựa chọn'],['冬天','mùa đông'],['必须','phải'],['根据','căn cứ theo'],['情况','tình hình'],['口','miệng; lượng từ'],['渴','khát']],g:[['双音节动词重叠','Động từ hai âm tiết lặp lại','ABAB'],['疑问代词活用 3','Đại từ nghi vấn dùng linh hoạt (3)','谁/什么/哪儿...']]},
18:{v:[['向','hướng về'],['万','vạn; mười nghìn'],['只','con; chỉ'],['嘴','miệng'],['动物','động vật'],['段','đoạn'],['不但……而且……','không những... mà còn...'],['有名','nổi tiếng'],['同意','đồng ý'],['相信','tin'],['关于','về; liên quan đến'],['机会','cơ hội'],['国家','quốc gia'],['种','loại'],['特点','đặc điểm'],['奇怪','kỳ lạ'],['地','trợ từ trạng ngữ']],g:[['只要……，就……','Chỉ cần... thì...','只要……，就……'],['介词“关于”','Giới từ “关于”','关于 + N']]},
19:{v:[['耳朵','tai'],['脸','mặt'],['短','ngắn'],['马','ngựa'],['张','tờ; cái'],['位','vị (lượng từ lịch sự)'],['蓝','xanh lam'],['秋天','mùa thu'],['过','qua; trải qua'],['鸟','chim'],['哭','khóc'],['黄河','Hoàng Hà'],['船','thuyền'],['经过','đi qua; trải qua']],g:[['趋向补语的引申义','Nghĩa mở rộng của bổ ngữ chỉ phương hướng','起来/下来/出来...'],['“使”“叫”“让”','Câu khiến với 使/叫/让','使/叫/让 + người + V/Adj']]},
20:{v:[['照相机','máy ảnh'],['被','bị'],['难过','buồn'],['东','phía Đông'],['信用卡','thẻ tín dụng'],['关心','quan tâm'],['只有……才……','chỉ có... mới...'],['成绩','thành tích; điểm số'],['碗','bát'],['分','điểm; phút'],['解决','giải quyết'],['试','thử'],['真正','thực sự'],['多么','biết bao']],g:[['“被”字句','Câu chữ 被','A 被 B + V + ……'],['只有……，才……','Chỉ có... mới...','只有……，才……']]}
  };
  const lessons=window.HSK3_LESSONS||[];
  const norm=s=>String(s??'').replace(/[\s（）()儿]/g,'').replace(/天$/,'天');
  lessons.forEach(L=>{
    const b=B[L.id]; if(!b)return;
    const existing=L.vocab||[], used=new Set(), ordered=[];
    b.v.forEach(([zh,vn])=>{
      let idx=existing.findIndex((x,i)=>!used.has(i)&&(x.zh===zh||norm(x.zh)===norm(zh)));
      if(idx>=0){const x=existing[idx];used.add(idx);if(!String(x.vn||'').trim())x.vn=vn;x.textbook=true;ordered.push(x)}
      else ordered.push({zh,vn,textbook:true,textbookAdded:true});
    });
    existing.forEach((x,i)=>{if(!used.has(i)){x.supplemental=true;ordered.push(x)}});
    L.vocab=ordered;L.textbookVocabCount=b.v.length;
    L.grammar=L.grammar||[];
    b.g.forEach((g,i)=>{
      if(!L.grammar[i])L.grammar[i]={title:g[0],vn_title:g[1],structure:g[2],desc:g[1],examples:[]};
      else{L.grammar[i].title=g[0];L.grammar[i].vn_title=g[1];L.grammar[i].structure=g[2]}
      L.grammar[i].textbook=true;
    });
    L.textbookGrammarCount=b.g.length;
  });
  window.HSK3_TEXTBOOK_BASELINE=B;
})();
