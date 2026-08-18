const fs=require('fs'),path=require('path');
const p=path.join(__dirname,'audio-architecture-runtime.cjs');
let s=fs.readFileSync(p,'utf8');
const from="  for(const n of ['new-data.js','new-enrichment.js','textbook-data-corrections.js','textbook-audio-segments.js','textbook-segment-audio.js','app-core.js'])w.eval(read(n));\n  w.eval(fs.readFileSync(path.join(root,'../assets/hsk2-parity.js'),'utf8'));\n  w.eval(read('tts-only.js'));\n";
const to="  for(const n of ['new-data.js','new-enrichment.js','textbook-data-corrections.js','textbook-audio-segments.js','textbook-segment-audio.js'])w.eval(read(n));\n  // app-core defines top-level lexical bindings (id/L). Classic script tags share that global lexical environment;\n  // separate window.eval() calls in JSDOM do not. Evaluate app-core + the production parity layer together\n  // so the regression models browser classic-script binding semantics instead of inventing window.L.\n  w.eval(read('app-core.js')+'\\n'+fs.readFileSync(path.join(root,'../assets/hsk2-parity.js'),'utf8'));\n  w.eval(read('tts-only.js'));\n";
if(!s.includes(from))throw new Error('runtime parity eval target missing');
s=s.replace(from,to);
fs.writeFileSync(p,s);
console.log('Patched HSK1 parity runtime test script semantics.');
