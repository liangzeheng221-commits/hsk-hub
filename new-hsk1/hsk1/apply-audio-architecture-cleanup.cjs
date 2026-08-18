const fs=require('fs');
const path=require('path');
const root=__dirname;
const corePath=path.join(root,'app-core.js');
const lessonPath=path.join(root,'lesson.html');

function replaceOnce(text,oldText,newText,label){
  const count=text.split(oldText).length-1;
  if(count!==1)throw new Error(`${label}: expected 1 match, got ${count}`);
  return text.replace(oldText,newText);
}

let core=fs.readFileSync(corePath,'utf8');
if(!core.includes('function playOfficialVocab(word)')){
  const speakLine=core.split('\n').find(line=>line.startsWith('function speak(text){'));
  if(!speakLine)throw new Error('app-core speak() anchor missing');
  const helpers=`${speakLine}
function officialAudioLayer(){return window.HSK1_OFFICIAL_AUDIO}
function officialAudioUnavailable(){toast('教材真人原声尚未就绪，请刷新页面后重试。');return false}
function playOfficialVocab(word){const a=officialAudioLayer();return a?.ready?a.playVocab(word,id):officialAudioUnavailable()}
function playOfficialVocabLesson(){const a=officialAudioLayer();return a?.ready?a.playVocabLesson(id):officialAudioUnavailable()}
function playOfficialTextLine(scene,line){const a=officialAudioLayer();return a?.ready?a.playTextLine(scene,line,id):officialAudioUnavailable()}
function playOfficialTextScene(scene){const a=officialAudioLayer();return a?.ready?a.playTextScene(scene,id):officialAudioUnavailable()}`;
  core=core.replace(speakLine,helpers);
}

core=core.replaceAll('>🔊 Nghe</button><span class="mini-btn flip-hint">','>🎧 教材</button><span class="mini-btn flip-hint">');
core=replaceOnce(core,"if(e.target.closest('.listen')){e.stopPropagation();speak(w.zh);return}","if(e.target.closest('.listen')){e.stopPropagation();playOfficialVocab(w.zh);return}",'vocab click route');

const oldDetail=`function showWordDetail(w){$('#wordPanel').innerHTML=\`<div class="word-detail"><div class="word-detail-head"><div class="word-main">\${esc(w.zh)}</div><div class="word-py">\${esc(w.py)}</div></div><div class="word-context">\${esc(w.vn)}</div><div class="vocab-actions"><button class="mini-btn" onclick="speak('\${esc(w.zh)}')">🔊 Nghe phát âm</button></div></div>\`}`;
const newDetail=`function showWordDetail(w){$('#wordPanel').innerHTML=\`<div class="word-detail"><div class="word-detail-head"><div class="word-main">\${esc(w.zh)}</div><div class="word-py">\${esc(w.py)}</div></div><div class="word-context">\${esc(w.vn)}</div><div class="vocab-actions"><button class="mini-btn" onclick="playOfficialVocab(\${JSON.stringify(w.zh)})">🎧 教材发音</button></div></div>\`}`;
core=replaceOnce(core,oldDetail,newDetail,'word detail route');

core=replaceOnce(core,"function speakAllVocab(){speak(L.vocab.map(x=>x.zh).join('，'))}","function speakAllVocab(){return playOfficialVocabLesson()}",'whole vocab route');

const lines=core.split('\n');
const sceneIdx=lines.findIndex(line=>line.startsWith('function drawScene(){'));
if(sceneIdx<0)throw new Error('drawScene line missing');
if(!lines[sceneIdx].includes('onclick="speak('))throw new Error('drawScene no longer matches legacy source');
lines[sceneIdx]=`function drawScene(){const s=L.scenes[sceneIndex];$('#scenePane').innerHTML=\`<div class="scene-title"><h3>\${esc(s.place)} · \${esc(s.place_vn)}</h3><button class="ghost-btn" onclick="playOfficialTextScene(sceneIndex)">🎧 教材整段</button></div><div class="dialogue-card">\${s.lines.map((x,i)=>\`<div class="dialogue-line"><div class="speaker">\${esc(x.s)}</div><div><div class="line-py">\${esc(x.py)}</div><div class="line-zh">\${esc(x.zh)}</div><div class="line-vn">\${esc(x.vn)}</div></div><button class="speak-line" onclick="playOfficialTextLine(sceneIndex,\${i})" title="播放这一句教材真人原声">🎧</button></div>\`).join('')}</div>\`}`;
core=lines.join('\n');

if(/speak\(w\.zh\)/.test(core))throw new Error('legacy vocabulary TTS remains');
if(/function speakAllVocab\(\)\{speak/.test(core))throw new Error('legacy whole-vocab TTS remains');
const detailLine=core.split('\n').find(x=>x.startsWith('function showWordDetail'));
if(detailLine?.includes('onclick="speak('))throw new Error('legacy word-detail TTS remains');
const newSceneLine=core.split('\n').find(x=>x.startsWith('function drawScene'));
if(newSceneLine?.includes('onclick="speak('))throw new Error('legacy text TTS remains');
if(!core.includes('playOfficialVocab(w.zh)')||!core.includes('playOfficialTextLine(sceneIndex,${i})')||!core.includes('playOfficialTextScene(sceneIndex)'))throw new Error('official routes missing');

fs.writeFileSync(corePath,core);

let lesson=fs.readFileSync(lessonPath,'utf8');
const enrich=`<script src="new-enrichment.js?v=20260817-3">\n</script>`;
const staticLayer=`${enrich}\n<script src="textbook-data-corrections.js?v=20260818-3">\n</script>\n<script src="textbook-audio-segments.js?v=20260818-4">\n</script>\n<script src="textbook-segment-audio.js?v=20260818-4">\n</script>`;
lesson=replaceOnce(lesson,enrich,staticLayer,'static official layer insertion');
lesson=replaceOnce(lesson,'<script src="audio-fix.js?v=20260817-3">','<script src="tts-only.js?v=20260818-1">','TTS-only script');
lesson=replaceOnce(lesson,'<script src="textbook-audio-guard.js?v=20260818-2">','<script src="textbook-audio-guard.js?v=20260818-3">','guard cache bust');

const order=[
  'new-enrichment.js',
  'textbook-data-corrections.js',
  'textbook-audio-segments.js',
  'textbook-segment-audio.js',
  'app-core.js',
  'tts-only.js',
  'textbook-audio-guard.js',
  'textbook-audio.js'
].map(x=>[x,lesson.indexOf(x)]);
for(const [name,pos] of order)if(pos<0)throw new Error(`lesson missing ${name}`);
for(let i=1;i<order.length;i++)if(order[i][1]<=order[i-1][1])throw new Error(`bad script order: ${order[i-1][0]} -> ${order[i][0]}`);
if(lesson.includes('audio-fix.js'))throw new Error('legacy audio-fix still loaded');
if(lesson.includes('_audio-work'))throw new Error('underscore runtime path leaked into lesson');

fs.writeFileSync(lessonPath,lesson);
console.log(JSON.stringify({status:'APPLIED',core:true,lesson:true,scriptOrder:order.map(x=>x[0])}));
