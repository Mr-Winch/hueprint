import {createHash} from 'node:crypto';
import {readFile, writeFile} from 'node:fs/promises';
const {version}=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
const name=`CODEX_HuePrint-VectorCraft-Setup-${version}.exe`;
const release=new URL(`../release/${version}/`,import.meta.url);
const bytes=await readFile(new URL(name,release));
const sha=createHash('sha256').update(bytes).digest('hex');
await writeFile(new URL(name+'.sha256',release),`${sha}  ${name}\n`);
console.log(`${name}: ${(bytes.length/1024/1024).toFixed(1)} MiB; SHA-256 ${sha}`);
