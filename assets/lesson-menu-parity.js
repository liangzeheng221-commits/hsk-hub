/* HSK1/HSK3 lesson chooser parity with HSK2 custom lesson menu. */
(()=>{
  const level=document.body.classList.contains('hsk3')?3:document.body.classList.contains('hsk1')?1:0;
  if(!level)return;
  const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const escHtml=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function lessons(){return level===1?(window.HSK1_LESSONS||[]): (window.HSK3_LESSONS||[])}
  function section(){try{return typeof currentSec==='string'?currentSec:'vocab'}catch{return 'vocab'}}
  function lessonId(){try{return Number(id)||1}catch{return 1}}
  function lessonUrl(n){return `lesson.html?id=${n}&sec=${encodeURIComponent(section())}`}
  function setup(){
    const select=q('#lessonSelect');if(!select||q('.parity-lesson-menu-wrap'))return;
    select.classList.add('parity-native-select');select.setAttribute('aria-hidden','true');select.tabIndex=-1;
    const wrap=document.createElement('div');wrap.className='lesson-menu-wrap parity-lesson-menu-wrap';
    wrap.innerHTML='<button class="lesson-menu-btn parity-lesson-menu-btn" type="button" aria-expanded="false">第 <b class="parity-current-lesson"></b> 课 <span>▾</span></button><div class="lesson-menu parity-lesson-menu"></div>';
    select.parentNode.insertBefore(wrap,select);
    const btn=q('.parity-lesson-menu-btn',wrap),menu=q('.parity-lesson-menu',wrap),current=q('.parity-current-lesson',wrap);
    function render(){
      const currentId=lessonId();current.textContent=currentId;
      menu.innerHTML=lessons().map(x=>`<a class="${Number(x.id)===currentId?'current':''}" href="${lessonUrl(x.id)}"><span class="menu-no">${x.id}</span><span><b>Bài ${x.id}</b><br><span class="menu-title">${escHtml(x.title||'')}</span></span></a>`).join('');
    }
    function close(){menu.classList.remove('show');btn.classList.remove('open');btn.setAttribute('aria-expanded','false')}
    btn.onclick=e=>{e.stopPropagation();render();const open=!menu.classList.contains('show');menu.classList.toggle('show',open);btn.classList.toggle('open',open);btn.setAttribute('aria-expanded',String(open))};
    menu.onclick=e=>e.stopPropagation();document.addEventListener('click',close);document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
    render();
  }
  const start=()=>setTimeout(setup,0);
  if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
