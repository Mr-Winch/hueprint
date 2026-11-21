import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const require = createRequire(import.meta.url);
const {createClient} = require('../CODEX_connection.cjs');
const {createOperations} = require('../CODEX_operations.cjs');
const root = fileURLToPath(new URL('..', import.meta.url));
const executable = process.argv[2] || path.join(process.env.ProgramFiles, 'VectorCraft', 'vectorcraft.exe');
const port = 7989;
const request = createClient({port, timeout:10000});
// Refuse an occupied port: this script only modifies its own isolated test instance.
let occupied = false;
try {await request('ui.inspect', {}, 500);occupied = true;} catch {}
if (occupied) throw new Error('Test port 7989 is already in use. No changes made.');
await mkdir(path.join(root,'.test-profile'), {recursive:true});
await mkdir(path.join(root,'test-output'), {recursive:true});
const child = spawn(executable, ['--control='+port], {env:{...process.env,VECTORCRAFT_CONFIG_DIR:path.join(root,'.test-profile')},stdio:'ignore',windowsHide:true});
child.on('error', (error) => console.error(error));
const execute = (command, params={}) => request('engine.execute',{command,params});
const ops = createOperations(request);
const passed = [];
try {
  let ready = false;
  for(let i=0;i<40;i++) {try {await request('ui.inspect',{},500);ready=true;break;}catch {await new Promise(resolve=>setTimeout(resolve,250));}}
  assert.ok(ready,'Isolated VectorCraft starts');
  const result = await execute('file.new',{name:'HuePrint integration test',width:540,height:360});
  const rect = await execute('shape.rectangle',{x:60,y:60,width:180,height:180});
  await execute('select.set',{ids:[rect.id]});
  await ops.applyColor({color:'#C04F32',target:'fill'});
  assert.equal((await ops.readColor('fill')).color,'#C04F32');passed.push('Apply and read fill on selected object');
  await ops.applyColor({color:'#24637A',target:'stroke'});
  assert.equal((await ops.readColor('stroke')).color,'#24637A');passed.push('Apply and read stroke on selected object');
  await execute('edit.undo');
  const node = await request('document.inspect',{ids:[rect.id]});
  assert.notEqual(node.nodes[0].stroke.toUpperCase(),'#24637A');passed.push('Native undo restores the previous paint');
  const added = await ops.sendPalette({name:'HuePrint QA',colors:['#C04F32','#24637A','#E7C07A']});
  assert.equal(added.count,3);
  const swatches = await execute('swatch.list',{group:added.name});
  assert.equal(swatches.swatches.filter(s=>s.group===added.name).length,3);passed.push('Palette creates a native group with three swatches');
  await execute('edit.undo');
  assert.ok(!(await execute('swatch.list')).groups.some(g=>g.name===added.name));passed.push('Entire palette undoes in one step');
  await ops.sendPalette({name:'HuePrint QA',colors:['#C04F32','#24637A','#E7C07A']});
  const duplicated=await ops.sendPalette({name:'HuePrint QA',colors:['#112233']});
  assert.notEqual(duplicated.name,'HuePrint QA');passed.push('Repeated group name preserves the existing group');
  const imported=await ops.readSwatches();
  assert.ok(imported.colors.some(c=>c.hex==='#C04F32' && c.group===added.name));
  assert.ok(imported.groups.some(g=>g.name===added.name && g.count===3));
  assert.ok(imported.groups.some(g=>g.name===duplicated.name && g.count===1));
  assert.ok(imported.ungroupedCount>0);passed.push('Native swatches preserve named groups and ungrouped colors');
  await execute('select.set',{ids:[]});
  const before=(await request('document.inspect',{depth:0})).paint;
  await assert.rejects(ops.applyColor({color:'#112233',target:'fill'}),/Selecciona/);
  assert.deepEqual((await request('document.inspect',{depth:0})).paint,before);passed.push('Empty selection does not change document defaults');
  await execute('document.save',{path:path.join(root,'test-output','CODEX_HuePrint-test.vectorcraft')});
  await request('app.export',{path:path.join(root,'test-output','CODEX_HuePrint-test.png'),format:'png',scale:1});
  await execute('file.close',{index:result.index});
  await request('app.quit');
  const report={passed, count:passed.length, executable, port};
  await writeFile(path.join(root,'test-output','integration.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
} finally {
  // Only the process this script created uses this isolated profile.
  if(child.exitCode === null) child.kill();
}
