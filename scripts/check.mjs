import { readdir, readFile, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
async function walk(dir){const found=[];for(const entry of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory())found.push(...await walk(p));else found.push(p);}return found;}
const files=await walk('dist');let failed=false;
for(const f of files.filter(f=>f.endsWith('.js'))){const r=spawnSync(process.execPath,['--check',f],{encoding:'utf8'});if(r.status){console.error(r.stderr);failed=true;}const text=await readFile(f,'utf8');for(const m of text.matchAll(/(?:from\s+|import\s*)['"](\.[^'"]+)['"]/g)){try{await access(path.resolve(path.dirname(f),m[1]));}catch{console.error(`Missing module ${m[1]} in ${f}`);failed=true;}}}
const html=await readFile('dist/index.html','utf8');for(const m of html.matchAll(/(?:src|href)="(\/[^"#]+)"/g)){if(m[1]==='/')continue;try{await access('dist'+m[1]);}catch{console.error(`Missing entry asset: ${m[1]}`);failed=true;}}
const config=await readFile('dist/src/config/game.js','utf8');for(const m of config.matchAll(/['"](\/assets\/[^'"]+)['"]/g)){try{await access('dist'+m[1]);}catch{console.error(`Missing artwork: ${m[1]}`);failed=true;}}
if(failed)process.exit(1);console.log(`Validated ${files.length} public files, JavaScript syntax, module imports, and entry assets.`);
