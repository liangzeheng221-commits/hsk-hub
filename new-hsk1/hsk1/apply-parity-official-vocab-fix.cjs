const fs=require('fs'),path=require('path');
const hsk1=__dirname;
const parityPath=path.join(hsk1,'../assets/hsk2-parity.js');
const playerPath=path.join(hsk1,'textbook-segment-audio.js');
const runtimePath=path.join(hsk1,'audio-architecture-runtime.cjs');
const checkPath=path.join(hsk1,'audio-architecture-check.cjs');
const lessonPath=path.join(hsk1,'lesson.html');
function replaceOne(text,from,to,label){
  const first=text.indexOf(from);
  if(first<0)throw new Error('Missing patch target: '+label);
  if(text.indexOf(from,first+from.length)>=0)throw new Error('Patch target not unique: '+label);
  return text.slice(0,first)+to+text.slice(first+from.length);
}

let parity=fs.readFileSync(parityPath,'utf8');
parity=replaceOne(parity,
"  const sentencePinyin=(text,line)=>String(line?.py || (typeof pyOf==='function'?pyOf(text):'') || '');\n",
"  const sentencePinyin=(text,line)=>String(line?.py || (typeof pyOf==='function'?pyOf(text):'') || '');\n  function parityOfficialVocabSegment(v){\n    if(LEVEL!==1)return null;\n    return window.HSK1_OFFICIAL_AUDIO?.vocabSegment?.(id,String(v?.zh||''))||null;\n  }\n  function playParityWord(v){\n    if(LEVEL!==1){if(typeof speak==='function')speak(v.zh);return true}\n    const audio=window.HSK1_OFFICIAL_AUDIO;\n    if(!audio?.ready){if(typeof toast==='function')toast('教材真人原声尚未就绪，请刷新页面后重试。');return false}\n    const seg=audio.vocabSegment?.(id,v.zh);\n    if(!seg){if(typeof toast==='function')toast('教材没有这个词的独立真人录音。');return false}\n    return audio.playVocab(v.zh,id);\n  }\n  function configureParityWordAudioButton(button,v){\n    if(!button)return;\n    if(LEVEL!==1){button.disabled=false;button.textContent='🔊';button.title='Phát âm';return}\n    const available=!!parityOfficialVocabSegment(v);\n    button.dataset.officialAudio='1';\n    button.disabled=!available;\n    button.textContent=available?'🎧':'🔇';\n    button.title=available?'教材真人原声':'教材没有该词的独立真人录音';\n    button.setAttribute('aria-label',available?`教材真人发音 ${v.zh}`:`无独立教材真人录音 ${v.zh}`);\n  }\n",
'parity official helper');
parity=replaceOne(parity,
"      q('.speak-word',card).onclick=e=>{e.stopPropagation();speak(v.zh)};\n",
"      const speakWordBtn=q('.speak-word',card);configureParityWordAudioButton(speakWordBtn,v);speakWordBtn.onclick=e=>{e.stopPropagation();playParityWord(v)};\n",
'parity card audio handler');
parity=replaceOne(parity,
"    q('#parityWordSpeak').onclick=()=>speak(v.zh);\n",
"    const parityWordSpeak=q('#parityWordSpeak');configureParityWordAudioButton(parityWordSpeak,v);parityWordSpeak.onclick=()=>playParityWord(v);\n",
'parity detail audio handler');
fs.writeFileSync(parityPath,parity);

let player=fs.readFileSync(playerPath,'utf8');
player=replaceOne(player,
"    const panel=document.querySelector('#wordPanel .word-detail');\n",
"    document.querySelectorAll('#vocabGrid .vcard').forEach(card=>{\n      const word=card.querySelector('.vzh')?.textContent?.trim()||'';\n      const b=card.querySelector('.speak-word'),available=!!vocabSegment(lesson,word);\n      if(b){b.dataset.officialAudio='1';if(available){b.disabled=false;setText(b,'🎧');b.title='教材真人原声'}else{b.disabled=true;setText(b,'🔇');b.title='教材没有该词的独立真人录音'}}\n    });\n    const panel=document.querySelector('#wordPanel .word-detail');\n",
'player parity card decorator');
player=replaceOne(player,
"    const all=[...document.querySelectorAll('#vocab .tool-row button')].find(b=>/Nghe từ|Nghe giáo trình/.test(b.textContent||''));\n",
"    const parityPanel=document.querySelector('#wordPanel.hsk2-word-panel');\n    if(parityPanel){\n      const word=parityPanel.querySelector('.word-panel-head h3')?.textContent?.trim()||'';\n      const b=parityPanel.querySelector('#parityWordSpeak'),available=!!vocabSegment(lesson,word);\n      if(b){b.dataset.officialAudio='1';if(available){b.disabled=false;setText(b,'🎧');b.title='教材真人原声'}else{b.disabled=true;setText(b,'🔇');b.title='教材没有该词的独立真人录音'}}\n    }\n    const all=[...document.querySelectorAll('#vocab .tool-row button')].find(b=>/Nghe từ|Nghe giáo trình/.test(b.textContent||''));\n",
'player parity detail decorator');
fs.writeFileSync(playerPath,player);

let runtime=fs.readFileSync(runtimePath,'utf8');
runtime=replaceOne(runtime,'<body>','<body class="hsk1">','runtime body class');
runtime=replaceOne(runtime,
"  w.scrollTo=()=>{};w.confirm=()=>false;\n",
"  w.scrollTo=()=>{};w.confirm=()=>false;w.HTMLElement.prototype.scrollIntoView=()=>{};\n",
'runtime scroll stub');
runtime=replaceOne(runtime,
"  for(const n of ['new-data.js','new-enrichment.js','textbook-data-corrections.js','textbook-audio-segments.js','textbook-segment-audio.js','app-core.js','tts-only.js'])w.eval(read(n));\n",
"  for(const n of ['new-data.js','new-enrichment.js','textbook-data-corrections.js','textbook-audio-segments.js','textbook-segment-audio.js','app-core.js'])w.eval(read(n));\n  w.eval(fs.readFileSync(path.join(root,'../assets/hsk2-parity.js'),'utf8'));\n  w.eval(read('tts-only.js'));\n",
'runtime production parity load');
const tailStart=runtime.indexOf('(async()=>{');
if(tailStart<0)throw new Error('runtime tail marker missing');
runtime=runtime.slice(0,tailStart)+`function cardFor(doc,word){return [...doc.querySelectorAll('.vcard')].find(c=>c.querySelector('.vzh')?.textContent===word)||null}\nfunction wait(){return new Promise(r=>setTimeout(r,0))}\n(async()=>{\n  const a=await make(1);\n  if(!a.w.HSK1_OFFICIAL_AUDIO?.ready)throw new Error('official player not ready after DOMContentLoaded');\n  if(!a.w.document.querySelector('.hsk2-vocab-grid .vcard'))throw new Error('production parity vocabulary renderer did not take over');\n  const card=cardFor(a.w.document,'不客气'),vocab=card?.querySelector('.speak-word');\n  if(!vocab)throw new Error('lesson1 parity 不客气 button missing');\n  vocab.click();await wait();\n  if(a.speechCount!==0)throw new Error(\`parity vocab clicked TTS \${a.speechCount} times\`);\n  if(!FakeAudio.log.at(-1)?.track)throw new Error('parity vocab did not route to Audio');\n  if(vocab.textContent.trim()!=='🎧')throw new Error(\`parity vocab button copy wrong: \${vocab.textContent}\`);\n  card.querySelector('.detail-tiny').click();await wait();\n  const detail=a.w.document.querySelector('#parityWordSpeak');\n  if(!detail||detail.textContent.trim()!=='🎧')throw new Error('parity detail official button missing');\n  const audioBeforeDetail=FakeAudio.log.length;detail.click();await wait();\n  if(a.speechCount!==0)throw new Error('parity detail fell back to TTS');\n  if(FakeAudio.log.length<=audioBeforeDetail)throw new Error('parity detail did not route to Audio');\n  const scene=a.w.document.querySelector('#scenePane .speak-line');\n  if(!scene)throw new Error('text line button missing');\n  scene.click();await wait();\n  if(a.speechCount!==0)throw new Error(\`text clicked TTS \${a.speechCount} times\`);\n  if(!FakeAudio.log.at(-1)?.track?.endsWith('-1'))throw new Error('text line did not route to text track');\n  a.w.speak('老师');await wait();\n  if(a.speechCount!==1)throw new Error('grammar/Hanzi TTS path no longer works');\n\n  const unsupportedWords=new Set(['一','二','三','四','五','六','七','九','十','千','两','零']);\n  let total=0,official=0,unsupported=0,detailChecks=0;\n  for(let lesson=1;lesson<=15;lesson++){\n    const x=await make(lesson);\n    const cards=[...x.w.document.querySelectorAll('.vcard')];\n    if(!cards.length)throw new Error(\`lesson \${lesson}: parity cards missing\`);\n    let checkedDetail=false;\n    for(const c of cards){\n      total++;const word=c.querySelector('.vzh')?.textContent||'',btn=c.querySelector('.speak-word');\n      if(!btn)throw new Error(\`lesson \${lesson} \${word}: speak button missing\`);\n      const speechBefore=x.speechCount,audioBefore=FakeAudio.log.length;\n      if(btn.disabled){\n        unsupported++;\n        if(lesson!==4||!unsupportedWords.has(word))throw new Error(\`unexpected unsupported vocab \${lesson}:\${word}\`);\n        if(btn.textContent.trim()!=='🔇')throw new Error(\`unsupported copy wrong \${lesson}:\${word}\`);\n        btn.click();await wait();\n        if(x.speechCount!==speechBefore||FakeAudio.log.length!==audioBefore)throw new Error(\`unsupported vocab routed audio/TTS \${lesson}:\${word}\`);\n      }else{\n        official++;\n        if(btn.textContent.trim()!=='🎧')throw new Error(\`official copy wrong \${lesson}:\${word}\`);\n        btn.click();await wait();\n        if(x.speechCount!==speechBefore)throw new Error(\`official parity vocab used TTS \${lesson}:\${word}\`);\n        if(FakeAudio.log.length<=audioBefore||!FakeAudio.log.at(-1)?.track)throw new Error(\`official parity vocab missed Audio \${lesson}:\${word}\`);\n        if(!checkedDetail){\n          c.querySelector('.detail-tiny').click();await wait();\n          const d=x.w.document.querySelector('#parityWordSpeak');\n          if(!d||d.disabled||d.textContent.trim()!=='🎧')throw new Error(\`lesson \${lesson}: detail official button wrong\`);\n          const sb=x.speechCount,ab=FakeAudio.log.length;d.click();await wait();\n          if(x.speechCount!==sb||FakeAudio.log.length<=ab)throw new Error(\`lesson \${lesson}: detail did not stay official\`);\n          checkedDetail=true;detailChecks++;\n        }\n      }\n    }\n  }\n  if(total!==336)throw new Error(\`expected 336 site vocab cards, got \${total}\`);\n  if(official!==324)throw new Error(\`expected 324 official vocab cards, got \${official}\`);\n  if(unsupported!==12)throw new Error(\`expected 12 unsupported cards, got \${unsupported}\`);\n  if(detailChecks!==15)throw new Error(\`expected 15 detail route checks, got \${detailChecks}\`);\n\n  const six=await make(6);\n  for(const word of ['包子','超市','吃','出租车','电话','东西','非常','好吃','号','买','米饭','明天','哪儿','那边','牛奶','去','手机','晚饭','想','些','怎么','坐','西安','西安饭店']){\n    const b=cardFor(six.w.document,word)?.querySelector('.speak-word');\n    if(!b||b.disabled||b.textContent.trim()!=='🎧')throw new Error(\`lesson6 official mapping missing: \${word}\`);\n    const sb=six.speechCount,ab=FakeAudio.log.length;b.click();await wait();\n    if(six.speechCount!==sb||FakeAudio.log.length<=ab)throw new Error(\`lesson6 routed incorrectly: \${word}\`);\n  }\n\n  const c=await make(11);\n  const tabs=c.w.document.querySelectorAll('#sceneTabs .scene-tab');tabs[2].click();await wait();\n  const rows=c.w.document.querySelectorAll('#scenePane .dialogue-line');\n  if(rows.length!==6)throw new Error(\`lesson11 scene3 expected 6 rows, got \${rows.length}\`);\n  if(![...rows].some(r=>r.querySelector('.line-zh')?.textContent==='去超市。'))throw new Error('lesson11 去超市 missing');\n  console.log(JSON.stringify({status:'PASS',productionParityLoaded:true,totalSiteVocab:total,officialVocab:official,unsupportedVocab:unsupported,detailOfficialChecks:detailChecks,lesson6VisibleWordsOfficial:24,lesson1TextOfficial:true,ttsOnlyGrammarHanzi:true,lesson11Rows:6,speechCountOfficialClicks:0}));\n})().catch(e=>{console.error(e);process.exit(1)});\n`;
fs.writeFileSync(runtimePath,runtime);

let check=fs.readFileSync(checkPath,'utf8');
check=replaceOne(check,
"const core=read('app-core.js'),lesson=read('lesson.html'),player=read('textbook-segment-audio.js'),guard=read('textbook-audio-guard.js'),tts=read('tts-only.js'),segments=read('textbook-audio-segments.js');\n",
"const core=read('app-core.js'),lesson=read('lesson.html'),player=read('textbook-segment-audio.js'),guard=read('textbook-audio-guard.js'),tts=read('tts-only.js'),segments=read('textbook-audio-segments.js'),parity=read('../assets/hsk2-parity.js');\n",
'checker parity source');
check=replaceOne(check,
"assert(core.includes('function renderGrammar')&&core.includes('onclick=\"speak('),'grammar/Hanzi TTS unexpectedly removed');\n",
"assert(core.includes('function renderGrammar')&&core.includes('onclick=\"speak('),'grammar/Hanzi TTS unexpectedly removed');\nassert(parity.includes('function playParityWord(v)'),'parity official word router missing');\nassert(parity.includes(\"if(LEVEL!==1){if(typeof speak==='function')speak(v.zh);return true}\"),'shared parity no longer preserves HSK3 TTS');\nassert(!parity.includes(\"q('.speak-word',card).onclick=e=>{e.stopPropagation();speak(v.zh)}\"),'parity card still routes HSK1 vocab to TTS');\nassert(!parity.includes(\"q('#parityWordSpeak').onclick=()=>speak(v.zh)\"),'parity detail still routes HSK1 vocab to TTS');\nassert(parity.includes('configureParityWordAudioButton(speakWordBtn,v)'),'parity card official-state decoration missing');\nassert(parity.includes('configureParityWordAudioButton(parityWordSpeak,v)'),'parity detail official-state decoration missing');\n",
'checker parity assertions');
check=replaceOne(check,
"assert(player.includes('window.HSK1_OFFICIAL_SEGMENTS'),'static segment source missing');\n",
"assert(player.includes('window.HSK1_OFFICIAL_SEGMENTS'),'static segment source missing');\nassert(player.includes(\"#vocabGrid .vcard\"),'player does not recognize parity vocab cards');\nassert(player.includes(\"#parityWordSpeak\"),'player does not recognize parity word detail button');\n",
'checker parity player DOM');
check=replaceOne(check,
"const required=['new-enrichment.js','textbook-data-corrections.js','textbook-audio-segments.js','textbook-segment-audio.js','app-core.js','tts-only.js','textbook-audio-guard.js','textbook-audio.js'];\n",
"const required=['new-enrichment.js','textbook-data-corrections.js','textbook-audio-segments.js','textbook-segment-audio.js','app-core.js','../assets/hsk2-parity.js','tts-only.js','textbook-audio-guard.js','textbook-audio.js'];\n",
'checker production script order');
check=replaceOne(check,
"assert(!lesson.includes('_audio-work'),'lesson references underscore runtime assets');\n",
"assert(!lesson.includes('_audio-work'),'lesson references underscore runtime assets');\nassert(lesson.includes('../assets/hsk2-parity.js?v=20260818-5'),'parity cache-bust missing');\nassert(lesson.includes('textbook-segment-audio.js?v=20260818-5'),'player cache-bust missing');\n",
'checker cache bust');
check=replaceOne(check,
"console.log(JSON.stringify({status:'PASS',architecture:'static-direct-routing',textTracks:45,textRows,vocabTracks:45,vocabRows,audioFiles:93,legacyAudioFixLoaded:false,runtimeFetch:false,playerClickInterception:false,literalSceneBinding:true}));\n",
"console.log(JSON.stringify({status:'PASS',architecture:'static-direct-routing-with-parity',textTracks:45,textRows,vocabTracks:45,vocabRows,audioFiles:93,legacyAudioFixLoaded:false,runtimeFetch:false,playerClickInterception:false,parityOfficialVocab:true,parityDetailOfficialVocab:true,hsk3TtsPreserved:true,literalSceneBinding:true}));\n",
'checker result');
fs.writeFileSync(checkPath,check);

let lesson=fs.readFileSync(lessonPath,'utf8');
lesson=replaceOne(lesson,'textbook-segment-audio.js?v=20260818-4','textbook-segment-audio.js?v=20260818-5','player cache bust');
lesson=replaceOne(lesson,'../assets/hsk2-parity.js?v=20260817-3','../assets/hsk2-parity.js?v=20260818-5','parity cache bust');
fs.writeFileSync(lessonPath,lesson);

console.log('Applied HSK1 parity official-vocabulary audio fix.');
