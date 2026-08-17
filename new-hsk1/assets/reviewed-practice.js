/* Reviewed HSK practice bank renderer. */
(()=>{
  'use strict';

  const by=s=>document.querySelector(s);
  const all=(s,r=document)=>[...r.querySelectorAll(s)];
  const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const html=s=>safe(s).replace(/\n/g,'<br>');
  const norm=s=>String(s??'').replace(/[\s，。！？,.!?；;：:、“”‘’'"（）()]/g,'').trim();

  function install(config){
    let bankPromise=null;
    let selected={basic:{},advanced:{}};

    function validate(bank){
      const expected=config.expected;
      if(bank?.version!==expected.version||!Array.isArray(bank.lessons)||bank.lessons.length!==expected.lessonCount||bank.qa?.total_questions!==expected.totalQuestions){
        throw new Error(`Dữ liệu luyện tập ${config.label} không hợp lệ`);
      }
      const ids=new Set();let total=0;
      for(const lesson of bank.lessons){
        if(!Array.isArray(lesson.basic)||lesson.basic.length!==expected.basicCount||!Array.isArray(lesson.advanced)||lesson.advanced.length!==expected.advancedCount){
          throw new Error(`Số câu của Bài ${lesson.lesson_id} không đúng`);
        }
        for(const q of [...lesson.basic,...lesson.advanced]){
          total++;
          if(!q.id||ids.has(q.id))throw new Error('ID câu hỏi bị thiếu hoặc trùng');
          ids.add(q.id);
          if(!String(q.answer??'').trim()||!String(q.explanation_vi??'').trim())throw new Error(`Câu ${q.id} thiếu đáp án hoặc giải thích`);
          if(q.type==='语序排序'){
            if(!Array.isArray(q.segments)||q.segments.length<2||!norm(q.answer))throw new Error(`Câu ${q.id} có dữ liệu sắp xếp không hợp lệ`);
          }else if(!Array.isArray(q.options)||q.options.length<2||new Set(q.options).size!==q.options.length||!q.options.includes(q.answer)){
            throw new Error(`Câu ${q.id} có lựa chọn/đáp án không hợp lệ`);
          }
        }
      }
      if(total!==expected.totalQuestions)throw new Error(`Tổng số câu phải là ${expected.totalQuestions}`);
      return bank;
    }

    async function gunzip(bytes){
      if(window.pako?.ungzip)return window.pako.ungzip(bytes,{to:'string'});
      if(typeof DecompressionStream==='function'){
        const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
        return new TextDecoder('utf-8',{fatal:true}).decode(await new Response(stream).arrayBuffer());
      }
      throw new Error('Trình duyệt không hỗ trợ giải nén dữ liệu');
    }

    async function loadBank(){
      if(window[config.globalName])return validate(window[config.globalName]);
      if(bankPromise)return bankPromise;
      bankPromise=(async()=>{
        const paths=Array.from({length:config.partCount},(_,i)=>`${config.pathPrefix}${String(i+1).padStart(2,'0')}.b64?v=${config.cacheKey}`);
        const parts=await Promise.all(paths.map(async path=>{
          const response=await fetch(path,{cache:'no-store'});
          if(!response.ok)throw new Error(`Không tải được dữ liệu luyện tập: ${response.status}`);
          return (await response.text()).trim();
        }));
        const bytes=Uint8Array.from(atob(parts.join('')),c=>c.charCodeAt(0));
        const bank=validate(JSON.parse(await gunzip(bytes)));
        window[config.globalName]=bank;
        return bank;
      })();
      return bankPromise;
    }

    function lessonFrom(bank){
      const lessonId=Number(new URL(location.href).searchParams.get('id'));
      return bank.lessons.find(x=>Number(x.lesson_id)===lessonId)||null;
    }

    function renderQuestion(q,index,level,total){
      const prompt=q.prompt_vi?`<div class="practice-prompt">${html(q.prompt_vi)}</div>`:'';
      const stem=q.stem?`<div class="qtitle">${html(q.stem)}</div>`:'';
      let body='';
      if(q.type==='语序排序'){
        body=`<div class="sort-answer reviewed-sort-answer" id="rsa-${level}-${index}"></div><div class="sort-bank reviewed-sort-bank" id="rsb-${level}-${index}">${q.segments.map((segment,key)=>`<button class="token reviewed-sort-token" data-key="${key}" data-word="${safe(segment)}">${html(segment)}</button>`).join('')}</div>`;
      }else{
        const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        body=`<div class="opts">${q.options.map((option,key)=>`<button class="opt reviewed-opt" data-opt="${key}"><b>${letters[key]}.</b> ${html(option)}</button>`).join('')}</div>`;
      }
      return `<article class="qcard reviewed-card ${level==='advanced'?'advanced-card':''}" data-level="${level}" data-i="${index}"><div class="qmeta"><span class="qindex">Câu ${index+1}/${total}</span><span class="difficulty-chip">${html(q.type)}</span></div>${prompt}${stem}${body}<div class="feedback"></div></article>`;
    }

    function renderTier(questions,level,title){
      return `<div class="advanced-intro"><div><span class="advanced-badge">${title}</span><h3>${questions.length} câu</h3><p>Làm bài rồi nộp để xem đáp án và giải thích.</p></div><div class="advanced-count">${questions.length} câu</div></div><div class="advanced-score" id="${level}Score">Làm bài rồi bấm “Nộp bài”.</div>${questions.map((q,i)=>renderQuestion(q,i,level,questions.length)).join('')}<div class="quiz-actions"><button class="primary-btn reviewed-submit" data-level="${level}">✓ Nộp bài</button><button class="ghost-btn reviewed-reset" data-level="${level}">↺ Làm lại</button></div>`;
    }

    function bindSortToken(button,card){
      button.onclick=()=>{
        if(card.dataset.checked)return;
        const level=card.dataset.level,index=card.dataset.i;
        const answer=by(`#rsa-${level}-${index}`),bank=by(`#rsb-${level}-${index}`);
        if(button.parentElement===bank)answer.appendChild(button);else bank.appendChild(button);
      };
    }

    function bindTier(level,lesson){
      const root=level==='basic'?by('#basicPractice'):by('#advancedPractice');
      if(!root)return;
      all('.reviewed-card',root).forEach(card=>{
        const index=Number(card.dataset.i);
        all('.reviewed-opt',card).forEach(button=>button.onclick=()=>{
          if(card.dataset.checked)return;
          all('.reviewed-opt',card).forEach(x=>x.classList.remove('sel'));
          button.classList.add('sel');selected[level][index]=Number(button.dataset.opt);
        });
        all('.reviewed-sort-token',card).forEach(button=>bindSortToken(button,card));
      });
      by('.reviewed-submit',root)?.addEventListener('click',()=>checkTier(level,lesson));
      by('.reviewed-reset',root)?.addEventListener('click',()=>resetTier(level,lesson));
    }

    function checkTier(level,lesson){
      const questions=lesson[level],root=level==='basic'?by('#basicPractice'):by('#advancedPractice');
      let correct=0,answered=0;
      all('.reviewed-card',root).forEach((card,index)=>{
        const question=questions[index];card.dataset.checked='1';
        let good=false,hasAnswer=false;
        if(question.type==='语序排序'){
          const tokens=all('.reviewed-sort-answer .token',card);
          const value=tokens.map(x=>x.dataset.word).join('');
          hasAnswer=tokens.length>0;good=norm(value)===norm(question.answer);
          all('.token',card).forEach(x=>{x.disabled=true});
        }else{
          const chosenIndex=selected[level][index];
          const chosen=Number.isInteger(chosenIndex)?question.options[chosenIndex]:null;
          hasAnswer=chosen!==null;good=chosen===question.answer;
          all('.reviewed-opt',card).forEach((button,key)=>{
            button.disabled=true;
            if(question.options[key]===question.answer)button.classList.add('correct');
            if(key===chosenIndex&&!good)button.classList.add('wrong');
          });
        }
        if(hasAnswer)answered++;if(good)correct++;
        const feedback=by('.feedback',card);
        feedback.innerHTML=`<div>${good?'✅ Đúng':hasAnswer?'❌ Chưa đúng':'⚠️ Chưa trả lời'} · Đáp án / 正确答案: <b>${html(question.answer)}</b></div><div class="answer-explain"><b>解析 · Giải thích</b><div>${html(question.explanation_vi)}</div></div>`;
        feedback.className=`feedback ${good?'good':'bad'}`;
      });
      const score=by(`#${level}Score`);
      if(score)score.innerHTML=`Kết quả: <b>${correct}/${questions.length}</b> · đã trả lời ${answered}/${questions.length} · ${Math.round(correct/questions.length*100)}%`;
    }

    function resetTier(level,lesson){
      selected[level]={};
      const root=level==='basic'?by('#basicPractice'):by('#advancedPractice');
      root.innerHTML=renderTier(lesson[level],level,level==='basic'?'基础测试 · Cơ bản':'进阶测试 · Nâng cao');
      bindTier(level,lesson);
    }

    function switchLevel(level){
      const advanced=level==='advanced';
      if(by('#basicPractice'))by('#basicPractice').hidden=advanced;
      if(by('#advancedPractice'))by('#advancedPractice').hidden=!advanced;
      all('.practice-level-btn',by('#practice')).forEach(button=>button.classList.toggle('active',button.dataset.level===level));
    }

    function finish(bank){
      const lesson=lessonFrom(bank);
      if(!lesson)throw new Error('Không tìm thấy bài luyện tập');
      selected={basic:{},advanced:{}};
      by('#basicPractice').innerHTML=renderTier(lesson.basic,'basic','基础测试 · Cơ bản');
      by('#advancedPractice').innerHTML=renderTier(lesson.advanced,'advanced','进阶测试 · Nâng cao');
      bindTier('basic',lesson);bindTier('advanced',lesson);switchLevel('basic');
      window[config.diagnosticsName]={ok:true,version:bank.version,lessonId:Number(lesson.lesson_id),basic:lesson.basic.length,advanced:lesson.advanced.length,total:bank.qa.total_questions};
      document.documentElement.dataset.reviewedPractice='ready';
    }

    window.renderPractice=function(){
      const section=by('#practice');if(!section)return;
      section.innerHTML=`<div class="section-head"><h2>LUYỆN TẬP — 练一练</h2><span class="chip">${config.expected.basicCount+config.expected.advancedCount} câu · Cơ bản + Nâng cao</span></div><div class="practice-note">Mỗi bài gồm ${config.expected.basicCount} câu cơ bản và ${config.expected.advancedCount} câu nâng cao. Làm bài rồi nộp để xem đúng/sai, đáp án và giải thích.</div><div class="practice-level-tabs"><button class="practice-level-btn active" data-level="basic">基础测试 · Cơ bản<small>${config.expected.basicCount} câu</small></button><button class="practice-level-btn advanced" data-level="advanced">进阶测试 · Nâng cao<small>${config.expected.advancedCount} câu</small></button></div><div id="basicPractice"><div class="practice-note">Đang tải câu hỏi…</div></div><div id="advancedPractice" class="advanced-practice" hidden></div>`;
      all('.practice-level-btn',section).forEach(button=>button.onclick=()=>switchLevel(button.dataset.level));
      const ready=window[config.globalName];
      if(ready){try{finish(validate(ready))}catch(error){fail(error)};return}
      loadBank().then(finish).catch(fail);
    };

    function fail(error){
      console.error(`[${config.label} practice]`,error);
      document.documentElement.dataset.reviewedPractice='error';
      if(by('#basicPractice'))by('#basicPractice').innerHTML='<div class="feedback bad">Không tải được bài tập. Vui lòng tải lại trang.</div>';
      if(by('#advancedPractice'))by('#advancedPractice').innerHTML='';
    }
  }

  window.ReviewedPractice={install};
})();
