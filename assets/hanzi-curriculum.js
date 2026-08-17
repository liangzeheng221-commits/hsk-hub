/* Textbook-specific Hanzi curriculum layer for HSK1 and HSK3. Keeps the interactive stroke tool while preserving each textbook's own Hanzi syllabus. */
(()=>{
  const h1={
    1:{strokes:'汉字的笔画（1）',chars:'一、二、三、十、八、六'},
    2:{strokes:'汉字的笔画（2）',chars:'口、见、山、小、不'},
    3:{strokes:'汉字的笔画（3）',chars:'月、心、中、人',order:'笔顺（1）：先横后竖；先撇后捺'},
    4:{strokes:'汉字的笔画（4）',chars:'七、儿、几、九',order:'笔顺（2）：从上到下；从左到右'},
    5:{strokes:'汉字的笔画（5）',chars:'水、女、了、大',order:'笔顺（3）：先外后内；先中间后两边'},
    6:{strokes:'汉字的笔画（6）',chars:'东、我、西',structure:'汉字结构（1）：独体结构与合体结构'},
    7:{chars:'四、五、书',structure:'汉字结构（2）：左右结构与左中右结构',radicals:'讠、辶'},
    8:{chars:'少、个',structure:'汉字结构（3）：上下结构与上中下结构',radicals:'钅、口'},
    9:{chars:'在、子、工',structure:'汉字结构（4）：半包围结构',radicals:'辶、门'},
    10:{chars:'上、下、本、末',structure:'汉字结构（5）：全包围结构',radicals:'口、木'},
    11:{chars:'牛、电',radicals:'阝、亻'},
    12:{chars:'天、气、雨',radicals:'女、宀'},
    13:{chars:'日、目、习',radicals:'日、目'},
    14:{chars:'开、车、回',radicals:'月、扌'},
    15:{chars:'年、出、飞',radicals:'艹、辶'}
  };
  const h3={
    1:{focus:'汉字知识：指事字',items:'一、二、三、上、下、本、末',words:'游客、外地、北门'},2:{focus:'旧字新词',words:'办公楼、外出、午觉'},3:{focus:'旧字新词',words:'鲜奶、冷饮、上面'},4:{focus:'旧字新词',words:'女孩、做客、鲜花'},5:{focus:'汉字知识：会意字',items:'明、休、从、看',words:'听说、有点儿、草地'},6:{focus:'旧字新词',words:'校园、饭桌、花园'},7:{focus:'旧字新词',words:'以后、到时候、迎接'},8:{focus:'旧字新词',words:'面试、自学、离婚'},9:{focus:'汉字知识：形声字（1）',items:'妈、住、放、邻',words:'课间、山路、参赛'},10:{focus:'旧字新词',words:'换季、地面、主菜'},11:{focus:'旧字新词',words:'字典、运动会、开会'},12:{focus:'旧字新词',words:'钱包、电子邮箱、箱子'},13:{focus:'汉字知识：形声字（2）',items:'爸、苹、想、努',words:'红酒、班长、遇见'},14:{focus:'旧字新词',words:'名单、读音、买单'},15:{focus:'旧字新词',words:'电影节、春节、文化节'},16:{focus:'旧字新词',words:'词语、运动鞋、体检'},17:{focus:'汉字知识：形声字（3）',items:'园、病、问、闻',words:'婚假、怎么办、喜爱'},18:{focus:'旧字新词',words:'动物园、人名、自信'},19:{focus:'旧字新词',words:'前年、路过、运动服'},20:{focus:'旧字新词',words:'碗筷、房卡、东北'}
  };
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function renderH1(data,lessonId,map){
    let box=document.getElementById('textbookHanziFocus');if(!box){box=document.createElement('div');box.id='textbookHanziFocus';box.className='textbook-hanzi-focus';map.before(box)}
    box.innerHTML=`<div class="textbook-hanzi-head"><b>教材汉字重点 · Trọng điểm chữ Hán trong giáo trình</b><span>Bài ${lessonId}</span></div><div class="textbook-hanzi-body">${data.strokes?`<div><span class="curriculum-label">笔画 · Nét</span><strong>${esc(data.strokes)}</strong></div>`:''}${data.chars?`<div><span class="curriculum-label">独体字 · Chữ đơn</span><strong class="curriculum-chars">${esc(data.chars)}</strong></div>`:''}${data.order?`<div><span class="curriculum-label">笔顺规则 · Thứ tự nét</span><strong>${esc(data.order)}</strong></div>`:''}${data.structure?`<div><span class="curriculum-label">结构 · Kết cấu</span><strong>${esc(data.structure)}</strong></div>`:''}${data.radicals?`<div><span class="curriculum-label">偏旁 · Bộ</span><strong class="curriculum-chars">${esc(data.radicals)}</strong></div>`:''}</div>`;
  }
  function renderH3(data,lessonId,map){
    let box=document.getElementById('textbookHanziFocus');if(!box){box=document.createElement('div');box.id='textbookHanziFocus';box.className='textbook-hanzi-focus';map.before(box)}
    box.innerHTML=`<div class="textbook-hanzi-head"><b>教材汉字重点 · Trọng điểm chữ Hán trong giáo trình</b><span>Bài ${lessonId}</span></div><div class="textbook-hanzi-body"><div><span class="curriculum-label">重点 · Trọng tâm</span><strong>${esc(data.focus)}</strong></div>${data.items?`<div><span class="curriculum-label">汉字 · Chữ</span><strong class="curriculum-chars">${esc(data.items)}</strong></div>`:''}${data.words?`<div><span class="curriculum-label">旧字新词 · Từ mới từ chữ đã học</span><strong>${esc(data.words)}</strong></div>`:''}</div>`;
  }
  function render(){
    const level=document.body.classList.contains('hsk3')?3:document.body.classList.contains('hsk1')?1:0;if(!level)return;
    const lessonId=typeof id!=='undefined'?Number(id):Number(new URL(location.href).searchParams.get('id')||1);
    const data=(level===1?h1:h3)[lessonId],map=document.getElementById('hanziWordMap');if(!data||!map)return;
    if(level===1)renderH1(data,lessonId,map);else renderH3(data,lessonId,map);
  }
  render();
  if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',render,{once:true});
})();
