const test=require('node:test'),assert=require('node:assert/strict');
const A=require('../account.js'),R=require('../motor/rewards.js'),X=require('../motor/access.js'),G=require('../liga-config.js').GYMS;
const token='a'.repeat(72),config={endpoint:'https://script.google.com/macros/s/fixture/exec'};
const storage=()=>{const m=new Map();return{getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};};
const published=g=>{const b=structuredClone(require('../bancos/liga/'+g.slug+'.json'));b.status='published';b.questions.forEach(q=>q.placeholder=false);return b;};
function fixture({captured=[],failures={},lost=[]}={}){
 const saved=new Set(captured),calls=[],s=storage();let active=0,maxActive=0;
 const progress=()=>({jugador:'Ada',capturadas:[...saved],configuracion:{avatarId:'aurora'}});
 const account=A.create({config,storage:s,fetch:async(url,options)=>{
  const body=JSON.parse(options.body);calls.push(body);active++;maxActive=Math.max(active,maxActive);await Promise.resolve();active--;
  assert.equal(url,config.endpoint);assert.equal(options.headers['Content-Type'],'text/plain;charset=utf-8');
  if(body.action==='login')return{ok:true,json:async()=>({ok:true,token,progreso:progress()})};
  assert.equal(body.token,token);
  if(body.action==='logout')return{ok:true,json:async()=>({ok:true})};
  if(body.action==='load')return{ok:true,json:async()=>({ok:true,progreso:progress()})};
  const reward=G.flatMap(g=>g.rewards).find(r=>r.code===body.code);assert.ok(reward);
  if(failures[reward.id]){failures[reward.id]--;throw TypeError('offline');}
  const duplicate=saved.has(reward.id);saved.add(reward.id);
  if(lost.includes(reward.id)){lost.splice(lost.indexOf(reward.id),1);throw TypeError('respuesta perdida');}
  return{ok:true,json:async()=>({ok:true,kind:'capture',bioforma:reward.id,duplicate,progreso:progress()})};
 }});
 return{account,calls,s,saved,get maxActive(){return maxActive;}};
}
test('la cuenta restaura la sesión de BioDex, consulta al servidor y nunca guarda el PIN',async()=>{
 const f=fixture({captured:['B001']});await f.account.login('Ada','123456');assert.deepEqual(JSON.parse(f.s.getItem(A.SESSION_KEY)),{token,name:'Ada'});assert.ok(!f.s.getItem(A.SESSION_KEY).includes('123456'));
 const other=A.create({config,storage:f.s,fetch:async(url,o)=>{assert.deepEqual(JSON.parse(o.body),{action:'load',token});return{ok:true,json:async()=>({ok:true,progreso:{jugador:'Ada',capturadas:['B001','B002']}})};}});
 await other.restore();assert.deepEqual(other.progress.capturadas,['B001','B002']);assert.equal(other.session.name,'Ada');await f.account.logout();assert.equal(f.s.getItem(A.SESSION_KEY),null);
});
test('sesión caducada vuelve al acceso; un corte de red conserva el acceso para reintentar',async()=>{
 for(const network of [true,false]){const s=storage();s.setItem(A.SESSION_KEY,JSON.stringify({token,name:'Ada'}));const a=A.create({config,storage:s,fetch:async()=>{if(network)throw TypeError('offline');return{ok:true,json:async()=>({ok:false,error:'Sesión no válida.'})};}});await assert.rejects(a.restore());assert.equal(a.session,null);assert.equal(Boolean(s.getItem(A.SESSION_KEY)),network);}
});
test('un navegador que bloquea almacenamiento permite login y canje confirmados',async()=>{
 const f=fixture();const a=A.create({config,storage:{getItem(){throw Error();},setItem(){throw Error();},removeItem(){throw Error();}},fetch:async(url,o)=>({ok:true,json:async()=>({ok:true,token,kind:'capture',bioforma:'B002',progreso:{jugador:'Ada',capturadas:JSON.parse(o.body).action==='redeem'?['B002']:[]}})})});await a.login('Ada','123456');await a.redeem(G[0].rewards[0].code);assert.deepEqual(a.progress.capturadas,['B002']);assert.equal(f.calls.length,0);
});
test('un servidor ocupado no borra una sesión recuperable de BioDex',async()=>{
 const s=storage();s.setItem(A.SESSION_KEY,JSON.stringify({token,name:'Ada'}));const a=A.create({config,storage:s,fetch:async()=>({ok:true,json:async()=>({ok:false,error:'El archivo está ocupado. Intenta nuevamente.'})})});await assert.rejects(a.restore(),/ocupado/);assert.ok(s.getItem(A.SESSION_KEY));
});
test('cuatro premios se canjean en serie y solo quedan acreditados con confirmación del servidor',async()=>{
 const f=fixture(),gym=G[0];await f.account.login('Ada','123456');const updates=[];
 const r=R.create({account:f.account,gym,bank:published(gym),won:true,demo:false,onUpdate:s=>updates.push(s)});const promise=r.claim();assert.equal(r.snapshot()[gym.rewards[0].id].status,'saving');assert.equal(f.account.progress.capturadas.length,0);const states=await promise;
 assert.equal(Object.values(states).filter(s=>s.status==='claimed').length,4);assert.equal(f.maxActive,1);assert.deepEqual(f.account.progress.capturadas,gym.rewards.map(r=>r.id));assert.equal(f.calls.filter(c=>c.action==='redeem').length,4);assert.ok(updates.length>=8);
});
test('fallo parcial permite reintentar una sola bioforma sin volver a canjear las confirmadas',async()=>{
 const f=fixture({failures:{B003:1}}),gym=G[0];await f.account.login('Ada','123456');const r=R.create({account:f.account,gym,bank:published(gym),won:true,demo:false});await r.claim();assert.equal(r.snapshot().B003.status,'error');assert.equal(f.account.progress.capturadas.length,3);await r.claim('B003');await r.claim();assert.equal(f.account.progress.capturadas.length,4);assert.equal(f.calls.filter(c=>c.action==='redeem').length,5);
});
test('respuesta perdida después de guardar se recupera como duplicado sin inventar ni duplicar capturas',async()=>{
 const f=fixture({lost:['B002']}),gym=G[0];await f.account.login('Ada','123456');const r=R.create({account:f.account,gym,bank:published(gym),won:true,demo:false});await r.claim('B002');assert.equal(r.snapshot().B002.status,'error');assert.equal(f.saved.has('B002'),true);assert.equal(f.account.progress.capturadas.includes('B002'),false);await r.claim('B002');assert.equal(r.snapshot().B002.status,'claimed');assert.match(r.snapshot().B002.message,/Ya estaba/);assert.deepEqual(f.account.progress.capturadas,['B002']);
});
test('doble clic comparte el mismo canje y las bioformas ya obtenidas no se duplican',async()=>{
 const f=fixture({captured:['B002']}),gym=G[0];await f.account.login('Ada','123456');const r=R.create({account:f.account,gym,bank:published(gym),won:true,demo:false});const one=r.claim(),two=r.claim();assert.equal(one,two);await one;assert.equal(f.saved.size,4);assert.equal(f.calls.filter(c=>c.action==='redeem').length,4);assert.match(r.snapshot().B002.message,/Ya estaba/);
});
test('derrotas, equipos prestados, bancos pendientes y otra cuenta no pueden iniciar canjes',async()=>{
 const f=fixture(),gym=G[0];await f.account.login('Ada','123456');for(const extra of [{won:false},{demo:true},{bank:require('../bancos/liga/aurora.json')}]){const r=R.create({account:f.account,gym,bank:published(gym),won:true,demo:false,...extra});await assert.rejects(r.claim());}const r=R.create({account:f.account,gym,bank:published(gym),won:true,demo:false});await f.account.logout();await assert.rejects(r.claim());assert.equal(f.calls.filter(c=>c.action==='redeem').length,0);
});
test('una respuesta de otro premio no acredita la recompensa solicitada',async()=>{
 const gym=G[0],account={session:{name:'Ada'},redeem:async()=>({kind:'capture',bioforma:'B003',progreso:{capturadas:['B003']}})};const r=R.create({account,gym,bank:published(gym),won:true,demo:false});await r.claim('B002');assert.equal(r.snapshot().B002.status,'error');
});
test('los cinco códigos activan solo su gimnasio por cuenta y rechazan códigos inválidos',()=>{
 const s=storage(),a=X.create({storage:s,gyms:G});assert.equal(new Set(G.map(g=>g.entryCode)).size,5);assert.throws(()=>a.activate(null,G[0].entryCode));assert.throws(()=>a.activate('Ada','CAP-NIMBEL-104'));
 for(const g of G){assert.equal(a.activate('Ada',' '+g.entryCode.toLowerCase()+' ').gym.slug,g.slug);assert.equal(a.isUnlocked('Ada',g.slug),true);assert.equal(a.isUnlocked('Bruno',g.slug),false);}const afterReload=X.create({storage:s,gyms:G});assert.equal(afterReload.isUnlocked('Ada','aurora'),true);
});
