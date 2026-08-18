const fs=require('fs'),path=require('path'),os=require('os');
const source=path.join(__dirname,'apply-parity-official-vocab-fix.cjs');
let code=fs.readFileSync(source,'utf8');
const old="runtime=replaceOne(runtime,'<body>','<body class=\"hsk1\">','runtime body class');";
const next="if(!runtime.includes('<body>'))throw new Error('runtime body marker missing');runtime=runtime.replace('<body>','<body class=\"hsk1\">');";
if(!code.includes(old))throw new Error('v1 runtime body patch statement missing');
code=code.replace(old,next);
const temp=path.join(__dirname,'.apply-parity-official-vocab-fix-v2-runtime.cjs');
fs.writeFileSync(temp,code);
try{require(temp)}finally{try{fs.unlinkSync(temp)}catch(_e){}}
