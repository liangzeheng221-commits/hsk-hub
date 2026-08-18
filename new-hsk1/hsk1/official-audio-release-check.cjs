const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const root=__dirname;
function assert(cond,msg){if(!cond)throw new Error(msg)}
function read(name){return fs.readFileSync(path.join(root,name),'utf8')}
function run(name,ctx){vm.runInContext(read(name),ctx,{filename:name})}

const sandbox={console};sandbox.window=sandbox;sandbox.globalThis=sandbox;
const ctx=vm.createContext(sandbox);
run('new-data.js',ctx);run('new-enrichment.js',ctx);
assert(Array.isArray(ctx.HSK1_LESSONS)&&ctx.HSK1_LESSONS.length===15,'Expected 15 HSK1 lessons');
const preRows=ctx.HSK1_LESSONS.reduce((n,L)=>n+(L.scenes||[]).reduce((m,s)=>m+(s.lines||[]).length,0),0);
assert(preRows===201,`Expected current source to have 201 rows before correction, got ${preRows}`);
run('textbook-data-corrections.js',ctx);
const textData=JSON.parse(read('_audio-work/all-text-1-15-compact.json'));
const vocabData=JSON.parse(read('_audio-work/all-vocab-1-15-compact.json'));
const data={text:textData.tracks,vocab:vocabData.tracks,unsupportedSiteVocab:{'4':['一','二','三','四','五','六','七','九','十','千','两','零']},crossLessonReuse:{'6':{'西安':['15-4',13.392,16.143]}}};
const lessons=ctx.HSK1_LESSONS;
const rows=lessons.reduce((n,L)=>n+L.scenes.reduce((m,s)=>m+s.lines.length,0),0);
assert(rows===202,`Expected 202 corrected dialogue rows, got ${rows}`);
const l11=lessons.find(L=>Number(L.id)===11);
assert(l11.scenes[2].lines.length===6,'Lesson 11 scene 3 must have six rows');
assert(l11.scenes[2].lines[4].zh==='去超市。','Lesson 11 missing correction 去超市。');
assert(l11.scenes[2].lines[4].py==='qù chāo shì。','Lesson 11 correction pinyin mismatch');
assert(l11.scenes[2].lines[4].vn==='Đi siêu thị.','Lesson 11 correction Vietnamese mismatch');
assert(ctx.HSK1_TEXTBOOK_DATA_CORRECTIONS.apply()===true,'Data correction must be idempotent');
assert(l11.scenes[2].lines.length===6,'Repeated correction duplicated a row');

const textKeys=Object.keys(data.text||{});assert(textKeys.length===45,`Expected 45 text tracks, got ${textKeys.length}`);
let textRows=0;
for(const L of lessons){
  assert(L.scenes.length===3,`Lesson ${L.id}: expected 3 scenes`);
  [1,3,5].forEach((t,si)=>{
    const id=`${L.id}-${t}`,arr=data.text[id];assert(Array.isArray(arr),`Missing text track ${id}`);
    assert(arr.length===L.scenes[si].lines.length,`${id}: timing rows ${arr.length} != site rows ${L.scenes[si].lines.length}`);
    for(const r of arr){assert(Array.isArray(r)&&Number.isFinite(r[0])&&Number.isFinite(r[1])&&r[1]>r[0],`${id}: invalid range ${JSON.stringify(r)}`);textRows++;}
  });
}
assert(textRows===202,`Expected 202 text ranges, got ${textRows}`);

const vocabKeys=Object.keys(data.vocab||{});assert(vocabKeys.length===45,`Expected 45 vocab tracks, got ${vocabKeys.length}`);
const byLesson={};let recorded=0;
for(const [track,items] of Object.entries(data.vocab)){
  const lesson=track.split('-')[0],map=byLesson[lesson]||(byLesson[lesson]={});
  assert(Array.isArray(items)&&items.length>0,`${track}: empty vocab track`);
  for(const row of items){
    assert(row.length===3&&typeof row[0]==='string'&&Number.isFinite(row[1])&&Number.isFinite(row[2])&&row[2]>row[1],`${track}: invalid vocab row ${JSON.stringify(row)}`);
    if(!map[row[0]])map[row[0]]={track,start:row[1],end:row[2]};recorded++;
  }
}
assert(recorded===330,`Expected 330 recorded vocab items, got ${recorded}`);
for(const [lesson,items] of Object.entries(data.crossLessonReuse||{})){
  const map=byLesson[lesson]||(byLesson[lesson]={});
  for(const [word,row] of Object.entries(items))map[word]={track:row[0],start:row[1],end:row[2]};
}
const unsupported=new Map(Object.entries(data.unsupportedSiteVocab||{}).map(([L,arr])=>[L,new Set(arr)]));
let siteCards=0,mappedCards=0,unsupportedCards=0;const missingCards=[];
for(const L of lessons){
  for(const w of L.vocab){
    siteCards++;
    if(byLesson[String(L.id)]?.[w.zh])mappedCards++;
    else if(unsupported.get(String(L.id))?.has(w.zh))unsupportedCards++;
    else missingCards.push([L.id,w.zh]);
  }
}
assert(siteCards===336,`Expected 336 current site vocab cards, got ${siteCards}`);
assert(mappedCards===324,`Expected 324 site cards with official standalone audio, got ${mappedCards}`);
assert(unsupportedCards===12,`Expected 12 explicitly unsupported site cards, got ${unsupportedCards}`);
assert(missingCards.length===0,`Unexpected unmapped site vocab: ${JSON.stringify(missingCards)}`);
const xian=byLesson['6']['西安'];assert(xian&&xian.track==='15-4'&&xian.start===13.392&&xian.end===16.143,'Lesson 6 西安 cross-lesson mapping is wrong');

const manifest=JSON.parse(read('textbook-audio-manifest.json'));
assert(manifest.count===93&&manifest.entries.length===93,'Manifest must contain 93 audio files');
const expected=new Set();for(let L=1;L<=15;L++){for(let t=1;t<=6;t++)expected.add(`${L}-${t}`);if(L<=3)expected.add(`${L}-7`)}
const ids=new Set(manifest.entries.map(e=>e.id));assert(ids.size===93,'Manifest contains duplicate IDs');
for(const id of expected)assert(ids.has(id),`Manifest missing ${id}`);
for(const id of ids)assert(expected.has(id),`Manifest has unexpected ${id}`);
const meta=Object.fromEntries(manifest.entries.map(e=>[e.id,e]));
for(const e of manifest.entries){
  const f=path.join(root,e.file);assert(fs.existsSync(f),`Missing audio file ${e.file}`);
  const buf=fs.readFileSync(f);assert(buf.length===e.bytes,`${e.id}: byte size mismatch`);
  const sha=crypto.createHash('sha256').update(buf).digest('hex');assert(sha===e.sha256,`${e.id}: SHA-256 mismatch`);
}
for(const [id,arr] of Object.entries(data.text))for(const r of arr)assert(r[1]<=meta[id].duration_s+0.02,`${id}: text range exceeds audio duration`);
for(const [id,arr] of Object.entries(data.vocab))for(const r of arr)assert(r[2]<=meta[id].duration_s+0.02,`${id}: vocab range exceeds audio duration`);

const player=read('textbook-segment-audio.js'),guard=read('textbook-audio-guard.js'),corrections=read('textbook-data-corrections.js');
assert(player.includes('_audio-work/all-text-1-15-compact.json')&&player.includes('_audio-work/all-vocab-1-15-compact.json'),'Player timing-map paths are wrong');
assert(!/speechSynthesis\s*\.\s*speak/.test(player),'Production player must never synthesize speech');
assert(!/speechSynthesis\s*\.\s*speak/.test(guard),'Production guard must never synthesize speech');
assert(guard.includes('guardLegacyClick'),'Guard must block legacy TTS during loading');
assert(guard.includes('official.stop?.();return'),'Guard must stop the previous hidden segment before a new official click');
assert(guard.includes('textbook-data-corrections.js?v=20260818-2'),'Guard must load permanent data corrections');
assert(guard.includes('textbook-segment-audio.js?v=20260818-2'),'Guard must load production segment player');
assert(corrections.includes("zh:'去超市。'"),'Permanent Lesson 11 correction missing');

console.log(JSON.stringify({status:'PASS',lessons:15,siteVocabCards:siteCards,officialVocabCards:mappedCards,unsupportedVocabCards:unsupportedCards,textTracks:textKeys.length,textRows,audioFiles:manifest.count,lesson11Rows:l11.scenes[2].lines.length}));
