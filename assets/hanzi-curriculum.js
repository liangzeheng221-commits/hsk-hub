/* Textbook-specific Hanzi curriculum layer for HSK1 and HSK3. Keeps the HSK2-style interactive stroke tool while preserving each textbook's own Hanzi syllabus. */
(()=>{
  const h1={
    1:{focus:'汉字的笔画（1）',items:'一、二、三、十、八、六'},2:{focus:'汉字的笔画（2）',items:'口、见、山、小、不'},3:{focus:'汉字的笔画（3）· 笔顺：先横后竖，先撇后捺',items:'月、心、中、人'},4:{focus:'汉字的笔画（4）· 笔顺：从上到下，从左到右',items:'七、儿、几、九'},5:{focus:'汉字的笔画（5）· 笔顺：先外后内，先中间后两边',items:'水、女、了、大'},6:{focus:'汉字的笔画（6）· 独体结构与合体结构',items:'东、我、西'},7:{focus:'左右结构与左中右结构',items:'四、五、书'},8:{focus:'上下结构与上中下结构',items:'少、个'},9:{focus:'半包围结构',items:'在、子、工'},10:{focus:'全包围结构',items:'上、下、本、末'},11:{focus:'认识独体字与偏旁',items:'牛、电'},12:{focus:'认识独体字与偏旁',items:'天、气、雨'},13:{focus:'认识独体字与偏旁',items:'日、目、习'},14:{focus:'认识独体字与偏旁',items:'开、车、回'},15:{focus:'认识独体字与偏旁',items:'年、出、飞'}
  };
  const h3={
    1:{focus:'汉字知识：指事字',items:'一、二、三、上、下、本、末',words:'游客、外地、北门'},2:{focus:'旧字新词',words:'办公楼、外出、午觉'},3:{focus:'旧字新词',words:'鲜奶、冷饮、上面'},4:{focus:'旧字新词',words:'女孩、做客、鲜花'},5:{focus:'汉字知识：会意字',items:'明、休、从、看',words:'听说、有点儿、草地'},6:{focus:'旧字新词',words:'校园、饭桌、花园'},7:{focus:'旧字新词',words:'以后、到时候、迎接'},8:{focus:'旧字新词',words:'面试、自学、离婚'},9:{focus:'汉字知识：形声字（1）',items:'妈、住、放、邻',words:'课间、山路、参赛'},10:{focus:'旧字新词',words:'换季、地面、主菜'},11:{focus:'旧字新词',words:'字典、运动会、开会'},12:{focus:'旧字新词',words:'钱包、电子邮箱、箱子'},13:{focus:'汉字知识：形声字（2）',items:'爸、苹、想、努',words:'红酒、班长、遇见'},14:{focus:'旧字新词',words:'名单、读音、买单'},15:{focus:'旧字新词',words:'电影节、春节、文化节'},16:{focus:'旧字新词',words:'词语、运动鞋、体检'},17:{focus:'汉字知识：形声字（3）',items:'园、病、问、闻',words:'婚假、怎么办、喜爱'},18:{focus:'旧字新词',words:'动物园、人名、自信'},19:{focus:'旧字新词',words:'前年、路过、运动服'},20:{focus:'旧字新词',words:'碗筷、房卡、东北'}
  };
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function render(){
    const level=document.body.classList.contains('hsk3')?3:document.body.classList.contains('hsk1')?1:0;if(!level)return;
    const lessonId=typeof id!=='undefined'?Number(id):Number(new URL(location.href).searchParams.get('id')||1);
    const data=(level===1?h1:h3)[lessonId],section=document.getElementById('hanzi'),map=document.getElementById('hanziWordMap');if(!data||!section||!map)return;
    let box=document.getElementById('textbookHanziFocus');if(!box){box=document.createElement('div');box.id='textbookHanziFocus';box.className='textbook-hanzi-focus';map.before(box)}
    box.innerHTML=`<div class="textbook-hanzi-head"><b>教材汉字重点 · Trọng điểm chữ Hán trong giáo trình</b><span>Bài ${lessonId}</span></div><div class="textbook-hanzi-body"><div><span class="curriculum-label">重点 · Trọng tâm</span><strong>${esc(data.focus)}</strong></div>${data.items?`<div><span class="curriculum-label">汉字 · Chữ</span><strong class="curriculum-chars">${esc(data.items)}</strong></div>`:''}${data.words?`<div><span class="curriculum-label">旧字新词 · Từ mới từ chữ đã học</span><strong>${esc(data.words)}</strong></div>`:''}</div>`;
  }
  render();
  if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',render,{once:true});
})();