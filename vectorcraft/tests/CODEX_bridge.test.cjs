const {test} = require('node:test');
const assert = require('node:assert/strict');
const net = require('node:net');
const {createClient} = require('../CODEX_connection.cjs');
const {createOperations} = require('../CODEX_operations.cjs');

async function serverTest(t, respond) {
  const sockets = new Set();
  const server = net.createServer((socket) => {sockets.add(socket);socket.on('close',()=>sockets.delete(socket));socket.on('error',()=>{});socket.once('data',(bytes)=>respond(socket,JSON.parse(bytes.toString())));});
  await new Promise((resolve)=>server.listen(0,'127.0.0.1',resolve));
  t.after(async()=>{for(const socket of sockets) socket.destroy();await new Promise(resolve=>server.close(resolve));});
  return createClient({port:server.address().port,timeout:300});
}
test('transport reconstructs fragmented response and matches request identity',async(t)=>{
  const request=await serverTest(t,(socket,input)=>{assert.equal(input.method,'ui.inspect');const reply=JSON.stringify({id:input.id,ok:true,result:{connected:true}})+'\n';socket.write(reply.slice(0,12));setTimeout(()=>socket.end(reply.slice(12)),10);});
  assert.deepEqual(await request('ui.inspect'),{connected:true});
});
test('transport rejects errors, wrong ids, and early disconnects',async(t)=>{
  for(const respond of [(s,r)=>s.end(JSON.stringify({id:r.id,ok:false,error:'No document'})+'\n'),(s,r)=>s.end(JSON.stringify({id:r.id+1,ok:true,result:null})+'\n'),s=>s.end()]){
    const request=await serverTest(t,respond);await assert.rejects(request('ui.inspect'));
  }
});
test('transport has an absolute deadline even if no complete reply arrives',async(t)=>{
  const request=await serverTest(t,(socket)=>socket.write('{'));await assert.rejects(request('ui.inspect',{},35),/tiempo/);
});
test('empty selection cannot recolor defaults',async()=>{
  const calls=[];const ops=createOperations(async(method,params)=>{calls.push({method,params});return {selection:[]};});
  await assert.rejects(ops.applyColor({color:'#123456',target:'fill'}),/Selecciona/);
  assert.equal(calls.length,1);
});
test('fill and stroke target the captured selection explicitly',async()=>{
  for(const target of ['fill','stroke']){
    const calls=[];const ops=createOperations(async(method,params)=>{calls.push({method,params});return method==='document.inspect'?{selection:[7,9]}:{objects:2};});
    await ops.applyColor({color:'#aabbcc',target});
    assert.deepEqual(calls[1],{method:'engine.execute',params:{command:target==='fill'?'paint.setFill':'paint.setStroke',params:{color:'#AABBCC',ids:[7,9]}}});
  }
});
test('invalid color, target, and palette are rejected before making changes',async()=>{
  const ops=createOperations(async()=>{assert.fail('must not request');});
  for(const color of ['red','#1234','#12345678',null]) await assert.rejects(ops.applyColor({color,target:'fill'}));
  await assert.rejects(ops.applyColor({color:'#123456',target:'file.delete'}));
  for(const input of [{name:' ',colors:['#123456']},{name:'Test',colors:[]},{name:'Test',colors:['invalid']}]) await assert.rejects(ops.sendPalette(input));
});
test('palette goes in one undoable native command with deduplicated colors',async()=>{
  const calls = [];
  const ops = createOperations(async (method, params) => {
    calls.push({method, params});
    return params.command === 'swatch.list'
      ? {groups:[], swatches:[]}
      : {name:'HuePrint', swatches:['Blue', 'Ink']};
  });
  assert.deepEqual(await ops.sendPalette({name:' HuePrint ',colors:['#aabbcc','#AABBCC','#123456']}),{name:'HuePrint',count:2,created:true});
  assert.deepEqual(calls,[
    {method:'engine.execute',params:{command:'swatch.list',params:{}}},
    {method:'engine.execute',params:{command:'swatch.newGroup',params:{name:'HuePrint',colors:['#AABBCC','#123456']}}},
  ]);
});
test('the swatch catalog preserves native groups and filters out non-solid paints', async () => {
  const ops = createOperations(async (method, params) => {
    if (method === 'engine.execute') return {
      swatches: [
        { kind: 'color', hex: '#aabbcc', name: 'Blue', group: 'Brand' },
        { kind: 'color', hex: '#112233', name: 'Ink', group: '' },
        { kind: 'gradient', hex: '#080808', group: 'Effects' },
        { kind: 'none' },
      ],
      groups: [{ name: 'Brand' }, { name: 'Effects' }],
    };
    return params.ids ? { nodes: [{ fill: 'None' }] } : { selection: [1] };
  });
  await assert.rejects(ops.readColor('fill'),/sólido/);
  assert.deepEqual(await ops.readSwatches(), {
    colors: [
      { hex: '#AABBCC', name: 'Blue', group: 'Brand' },
      { hex: '#112233', name: 'Ink', group: null },
    ],
    groups: [{ name: 'Brand', count: 1 }],
    ungroupedCount: 1,
  });
});
