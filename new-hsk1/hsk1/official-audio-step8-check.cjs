const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const root=__dirname;
function assert(cond,msg){if(!cond)throw new Error(msg)}
function read(name){return fs.readFileSync(path.join(root,name),'utf8')}
function run(name,ctx){vm.runInContext(read(name),ctx,{filename:name})}

const sandbox={console};sandbox.window=sandbox;sandbox.globalThis=sandbox;
const ctx=vm.createContext(sandbox);
run('new-data.js',ctx);run('new-enrichment.js',ctx);
assert(Array.isArray(ctx.HSK1_LESSONS)&&ctx.HSK1_LESSONS.length===15,'Expected 15 HSK1 lessons');
run('textbook-data-corrections.js',ctx);
const lessons=ctx.HSK1_LESSONS;
const rows=lessons.reduce((n,L)=>n+L.scenes.reduce((m,s)=>m+s.lines.length,0),0);
assert(rows===202,`Expected 202 corrected dialogue rows, got ${rows}`);
const l11=lessons.find(L=>Number(L.id)===11);
assert(l11.scenes[2].lines.length===6&&l11.scenes[2].lines[4].zh==='去超市。','Lesson 11 correction missing');

const textData=JSON.parse(read('_audio-work/all-text-1-15-compact.json'));
const vocabData=JSON.parse(read('_audio-work/all-vocab-1-15-compact.json'));
assert(/step8/i.test(String(textData.version||'')),'Text timing map is not Step 8 calibrated');
assert(/step8/i.test(String(vocabData.version||'')),'Vocab timing map is not Step 8 calibrated');

const text=textData.tracks||{},vocab=vocabData.tracks||{};
const textKeys=Object.keys(text),vocabKeys=Object.keys(vocab);
assert(textKeys.length===45,`Expected 45 text tracks, got ${textKeys.length}`);
assert(vocabKeys.length===45,`Expected 45 vocab tracks, got ${vocabKeys.length}`);

let textRows=0;
for(const L of lessons){
  assert(L.scenes.length===3,`Lesson ${L.id}: expected 3 scenes`);
  [1,3,5].forEach((t,si)=>{
    const id=`${L.id}-${t}`,arr=text[id];
    assert(Array.isArray(arr),`Missing text track ${id}`);
    assert(arr.length===L.scenes[si].lines.length,`${id}: timing rows ${arr.length} != site rows ${L.scenes[si].lines.length}`);
    for(const r of arr){
      assert(Array.isArray(r)&&Number.isFinite(r[0])&&Number.isFinite(r[1])&&r[0]>=0&&r[1]>r[0],`${id}: invalid text range ${JSON.stringify(r)}`);
      textRows++;
    }
  });
}
assert(textRows===202,`Expected 202 text ranges, got ${textRows}`);

const byLesson={};let recorded=0,trackStartZero=0;
for(const [track,items] of Object.entries(vocab)){
  const lesson=track.split('-')[0],map=byLesson[lesson]||(byLesson[lesson]={});
  assert(Array.isArray(items)&&items.length>0,`${track}: empty vocab track`);
  assert(items[0][1]===0,`${track}: Step 8 must preserve the full file attack for the first New Words item`);
  trackStartZero++;
  for(const row of items){
    assert(row.length===3&&typeof row[0]==='string'&&Number.isFinite(row[1])&&Number.isFinite(row[2])&&row[1]>=0&&row[2]>row[1],`${track}: invalid vocab row ${JSON.stringify(row)}`);
    if(!map[row[0]])map[row[0]]={track,start:row[1],end:row[2]};
    recorded++;
  }
}
assert(trackStartZero===45,'Expected all 45 New Words tracks to start their first item at file start');
assert(recorded===330,`Expected 330 recorded vocab items, got ${recorded}`);

const xian=(vocab['15-4']||[]).find(r=>r[0]==='西安');
assert(xian&&xian[1]===13.278&&xian[2]===16.143,'Step 8 西安 timing mismatch');
byLesson['6']=byLesson['6']||{};
byLesson['6']['西安']={track:'15-4',start:xian[1],end:xian[2]};

const unsupported=new Map([['4',new Set(['一','二','三','四','五','六','七','九','十','千','两','零'])]]);
let siteCards=0,mappedCards=0,unsupportedCards=0;const missing=[];
for(const L of lessons)for(const w of L.vocab){
  siteCards++;
  if(byLesson[String(L.id)]?.[w.zh])mappedCards++;
  else if(unsupported.get(String(L.id))?.has(w.zh))unsupportedCards++;
  else missing.push([L.id,w.zh]);
}
assert(siteCards===336,`Expected 336 site vocab cards, got ${siteCards}`);
assert(mappedCards===324,`Expected 324 mapped site vocab cards, got ${mappedCards}`);
assert(unsupportedCards===12,`Expected 12 unsupported number cards, got ${unsupportedCards}`);
assert(missing.length===0,`Unexpected unmapped site vocab: ${JSON.stringify(missing)}`);

const manifest=JSON.parse(read('textbook-audio-manifest.json'));
assert(manifest.count===93&&manifest.entries.length===93,'Manifest must contain 93 audio files');
const meta=Object.fromEntries(manifest.entries.map(e=>[e.id,e]));
for(const e of manifest.entries){
  const f=path.join(root,e.file);assert(fs.existsSync(f),`Missing audio file ${e.file}`);
  const buf=fs.readFileSync(f);assert(buf.length===e.bytes,`${e.id}: byte size mismatch`);
  const sha=crypto.createHash('sha256').update(buf).digest('hex');assert(sha===e.sha256,`${e.id}: SHA-256 mismatch`);
}
for(const [id,arr] of Object.entries(text))for(const r of arr)assert(r[1]<=meta[id].duration_s+0.02,`${id}: text range exceeds audio duration`);
for(const [id,arr] of Object.entries(vocab))for(const r of arr)assert(r[2]<=meta[id].duration_s+0.02,`${id}: vocab range exceeds audio duration`);

const player=read('textbook-segment-audio.js'),guard=read('textbook-audio-guard.js');
assert(player.includes("const VERSION='20260818-step8-v1'"),'Player Step 8 version missing');
assert(player.includes("a.preload='auto'"),'Segment audio must preload full media');
assert(!player.includes("a.preload='metadata'"),'Legacy metadata-only preload still present');
assert(player.includes('function seekThen('),'Seek-settle helper missing');
assert(player.includes('seekSettled:true'),'Playback diagnostics must confirm seek settled before play');
assert(!/speechSynthesis\s*\.\s*speak/.test(player),'Official player must never synthesize speech');
assert(!/speechSynthesis\s*\.\s*speak/.test(guard),'Official guard must never synthesize speech');
assert(guard.includes("textbook-segment-audio.js?v=20260818-3"),'Guard must cache-bust the Step 8 player');
assert(guard.includes("const VERSION='20260818-step8-v1'"),'Guard Step 8 version missing');

console.log(JSON.stringify({
  status:'PASS',lessons:15,textTracks:textKeys.length,textRows,
  vocabTracks:vocabKeys.length,recordedVocab:recorded,siteVocabCards:siteCards,
  officialVocabCards:mappedCards,unsupportedVocabCards:unsupportedCards,
  audioFiles:manifest.count,firstVocabItemsAtFileStart:trackStartZero,
  xianStart:xian[1],lesson11Rows:l11.scenes[2].lines.length,
  playerPreload:'auto',seekSettledBeforePlay:true
}));
