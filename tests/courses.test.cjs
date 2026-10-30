const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs'),vm=require('node:vm');
const R=require('../ligas.js'),base=require('../liga-config.js').GYMS,L=require('../motor/league.js'),X=require('../motor/access.js'),Q=require('../motor/questions.js'),Rewards=require('../motor/rewards.js');
const memory=()=>{const data=new Map();return {data,getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};};
test('las entradas tienen carpetas distintas y una liga fijada no cambia con un parámetro',()=>{
 assert.equal(R.resolve('').id,'2medio');assert.equal(R.resolve('?gym=aurora').id,'2medio');assert.equal(R.resolve('?liga=7basico').id,'7basico');assert.equal(R.resolve('?liga=6basico').available,false);assert.equal(R.resolve('?liga=unknown'),null);assert.equal(R.resolve('?liga='),null);assert.throws(()=>R.gyms(base,'6basico'));
 assert.equal(R.url('2medio'),'segundo-medio/');assert.equal(R.url('2medio','combate.html',{gym:'aurora'}),'segundo-medio/combate.html?gym=aurora');assert.equal(R.url('7basico'),'septimo-basico/');assert.equal(R.url('7basico','combate.html',{gym:'aurora',preview:1,liga:'2medio'}),'septimo-basico/combate.html?gym=aurora&preview=1');assert.equal(R.resolve('?liga=2medio','7basico').id,'7basico');assert.equal(R.resolve('?liga=7basico','2medio').id,'2medio');assert.equal(R.resolve('?liga=2medio','no-existe'),null);assert.throws(()=>R.url('unknown'));assert.throws(()=>R.url('7basico','https://external.invalid'));
});
test('las dos ligas usan el mismo combate, paisajes y premios con bancos y códigos propios',()=>{
 const before=JSON.stringify(base),second=R.gyms(base,'2medio'),seventh=R.gyms(base,'7basico');
 for(let i=0;i<5;i++){assert.equal(second[i].bankUrl,base[i].bankUrl);assert.equal(second[i].entryCode,base[i].entryCode);assert.equal(seventh[i].bankUrl,'bancos/7basico/'+base[i].slug+'.json');assert.notEqual(second[i].entryCode,seventh[i].entryCode);assert.deepEqual(seventh[i].rewards,base[i].rewards);assert.deepEqual(seventh[i].phases,base[i].phases);assert.equal(seventh[i].background,base[i].background);assert.equal(seventh[i].portrait,base[i].portrait);assert.equal(seventh[i].leader,base[i].leader);}
 assert.equal(new Set([...second,...seventh].map(g=>g.entryCode)).size,10);assert.equal(JSON.stringify(base),before);
});
test('las activaciones antiguas de 2.º medio se conservan y no abren 7.º',()=>{
 const s=memory();s.setItem('biodex.liga.access.v1.ada',JSON.stringify({aurora:true}));const second=X.create({storage:s,gyms:R.gyms(base,'2medio'),leagueId:'2medio'}),seventh=X.create({storage:s,gyms:R.gyms(base,'7basico'),leagueId:'7basico'});
 assert.equal(second.isUnlocked('Ada','aurora'),true);assert.equal(seventh.isUnlocked('Ada','aurora'),false);assert.throws(()=>seventh.activate('Ada',base[0].entryCode));seventh.activate('Ada',R.gyms(base,'7basico')[1].entryCode);assert.equal(seventh.isUnlocked('Ada','prisma'),true);assert.equal(second.isUnlocked('Ada','prisma'),false);assert.equal(seventh.isUnlocked('Otro','prisma'),false);
 const after=X.create({storage:s,gyms:R.gyms(base,'7basico'),leagueId:'7basico'});assert.equal(after.isUnlocked('Ada','prisma'),true);
});
test('los sellos de 2.º medio, 7.º y el ensayo permanecen separados sin perder el formato antiguo',()=>{
 const s=memory(),old={aurora:{mode:'challenge',version:2}};s.setItem('biodex.liga.v1.ada',JSON.stringify(old));assert.deepEqual(L.readProgress(s,'Ada'),old);assert.deepEqual(L.readProgress(s,'Ada','7basico'),{});
 L.markWin(s,'Ada','prisma',1,'challenge','7basico');L.markWin(s,'ensayo','nexo',1,'trial','7basico');assert.deepEqual(L.readProgress(s,'Ada'),old);assert.equal(L.readProgress(s,'Ada','7basico').prisma.mode,'challenge');assert.equal(L.readProgress(s,'Ada','7basico').nexo,undefined);assert.equal(L.readProgress(s,'ensayo','7basico').nexo.mode,'trial');
});
test('los 150 ítems de séptimo conservan el contenido importado y la corrección documentada de VPH',()=>{
 const reference=require('../reference/septimo-import.json');let count=0,numerals=0,five=0,answerE=0;const seen=new Set();
 for(const gym of R.gyms(base,'7basico')){const bank=require('../'+gym.bankUrl),check=L.validateBank(bank,gym.slug,'7basico');assert.equal(check.ready,true,check.errors.join(' '));assert.equal(bank.questions.length,30);assert.equal(L.validateBank(bank,gym.slug,'2medio').valid,false);assert.equal(L.validateBank(require('../bancos/liga/'+gym.slug+'.json'),gym.slug,'7basico').valid,false);const expected=reference.sheets.find(s=>s.gym===gym.slug);
  const state=Q.create(()=>.3,bank.questions,{repeat:false});
  for(const q of bank.questions){assert.equal(seen.has(q.id),false);seen.add(q.id);const payload={id:q.id,stem:q.stem,options:q.options,correct:q.options[q.answer],statements:q.statements||[],explain:q.explain};assert.equal(crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex'),expected.questions.find(e=>e.id===q.id).sha256,q.id);count++;if(q.statements)numerals++;if(q.options.length===5)five++;if(q.answer===4)answerE++;}
  for(let i=0;i<30;i++){const q=Q.present(state,'attack',()=>.2),original=bank.questions.find(x=>x.id===q.id);assert.equal(q.options[q.answer],original.options[original.answer]);assert.deepEqual(q.statements,original.statements||[]);assert.equal(Q.choose(state,q.answer),true);assert.equal(Q.grade(state).correct,true);Q.consume(state);}assert.equal(Q.present(state,'attack'),null);
 }
 assert.deepEqual([count,numerals,five,answerE],[150,50,50,10]);assert.equal(reference.corrections.length,1);const correction=reference.corrections[0],q=require('../bancos/7basico/bruma.json').questions.find(q=>q.id===correction.id);assert.notEqual(q.statements[3],correction.original.statements[3]);assert.equal(q.options[q.answer],correction.original.correct);assert.match(q.explain,/dosis única/);
});
test('una victoria de séptimo admite solo su banco y nunca entrega premios con el banco de otro curso',async()=>{
 const gym=R.gyms(base,'7basico')[0],bank=require('../'+gym.bankUrl),calls=[];const account={session:{name:'Ada'},redeem:async code=>{calls.push(code);const r=gym.rewards.find(r=>r.code===code);return{kind:'capture',bioforma:r.id,progreso:{capturadas:gym.rewards.map(r=>r.id)}};}};
 const wrong=Rewards.create({account,gym,bank:require('../bancos/liga/aurora.json'),won:true,demo:false});await assert.rejects(wrong.claim());assert.equal(calls.length,0);
 const correct=Rewards.create({account,gym,bank,won:true,demo:false});await correct.claim();assert.equal(calls.length,4);assert.equal(Object.values(correct.snapshot()).every(s=>s.status==='claimed'),true);
});
function context(search='',fixedId='7basico',page='index.html',hash=''){
 const eyebrow={textContent:''},main={innerHTML:''};const links=['index.html','revision.html','revision-tablet.html','combate.html?gym=aurora','./','https://nespinozagonzalez-hub.github.io/biodex/','#main'].map(href=>({href,getAttribute(){return this.href;}}));
 const document={documentElement:{dataset:fixedId===null?{}:{league:fixedId}},body:{dataset:{}},title:'',querySelector(selector){return selector==='main'?main:selector==='.league-hero>.eyebrow'?eyebrow:null;},querySelectorAll(selector){return selector==='a[href]'?links:[];}};
 let redirect=null,cleaned=null;const pathname='/gimnasiosbiodex/'+(fixedId===null?'':R.get(fixedId).path+'/')+page;
 const window={BioDexCourses:R,BioDexGyms:{GYMS:base}},c={window,document,location:{search,pathname,hash,replace:url=>redirect=url},history:{replaceState:(_,__,url)=>cleaned=url},URLSearchParams};vm.runInNewContext(fs.readFileSync(require.resolve('../course-context.js'),'utf8'),c);return{window,document,links,main,get redirect(){return redirect;},get cleaned(){return cleaned;}};
}
test('los enlaces de combate, regreso y preparación permanecen dentro de cada liga, sin selector',()=>{
 for(const id of ['2medio','7basico']){
  const c=context('?liga='+ (id==='2medio'?'7basico':'2medio'),id),prefix=R.get(id).path+'/';assert.equal(c.window.BioDexCourse.id,id);assert.equal(c.window.BioDexCourse.available,true);assert.equal(c.redirect,null);assert.equal(c.links[0].href,prefix);assert.equal(c.links[1].href,prefix+'revision.html');assert.equal(c.links[2].href,prefix+'revision-tablet.html');assert.equal(c.links[3].href,prefix+'combate.html?gym=aurora');assert.equal(c.links[4].href,prefix);assert.equal(c.links[5].href,'https://nespinozagonzalez-hub.github.io/biodex/');assert.equal(c.cleaned,'/gimnasiosbiodex/'+prefix+'index.html');assert.equal(c.document.body.dataset.league,id);
 }
 const battle=context('?gym=nexo&preview=1','7basico','combate.html');assert.equal(battle.links[6].href,'septimo-basico/combate.html?gym=nexo&preview=1#main');
});
test('los enlaces ya compartidos redirigen al mismo curso sin cargar cuentas ni bancos antes del cambio',()=>{
 for(const [query,id] of [['','2medio'],['?liga=2medio','2medio'],['?liga=7basico','7basico'],['?liga=6basico','6basico']]){
  const c=context(query,null);assert.equal(c.redirect,R.url(id));assert.equal(c.window.BioDexCourse.available,false);assert.equal(c.window.BioDexGyms.GYMS.length,0);
 }
 const combat=context('?liga=7basico&gym=bruma&preview=1',null,'combate.html','#main');assert.equal(combat.redirect,'septimo-basico/combate.html?gym=bruma&preview=1#main');assert.equal(context('?liga=otro',null).redirect,null);
});
test('6.º y las ligas inexistentes muestran una espera o salida clara, sin cargar preguntas ni cuentas',()=>{
 for(const c of [context('','6basico'),context('?liga=no-existe',null)]){assert.equal(c.window.BioDexCourse.available,false);assert.equal(c.window.BioDexGyms.GYMS.length,0);assert.ok(c.main.innerHTML.includes('Volver a mi BioDex'));assert.ok(!c.main.innerHTML.includes('segundo-medio'));assert.ok(!c.main.innerHTML.includes('septimo-basico'));}
 assert.match(context('','6basico').main.innerHTML,/se habilitará al incorporar sus preguntas/);
});
test('las doce entradas publicadas están sincronizadas, fijan su curso y resuelven todos sus recursos',()=>{
 const {build,pages}=require('../scripts/build-league-entries.cjs'),path=require('node:path'),root=path.resolve(__dirname,'..');assert.doesNotThrow(()=>build(true));
 for(const course of R.COURSES)for(const page of pages){
  const source=fs.readFileSync(path.join(root,course.path,page),'utf8');assert.ok(source.includes('data-league="'+course.id+'"'));assert.ok(source.includes('<base href="../">'));assert.ok(!/league-switcher|data-league-nav|ELIGE TU LIGA/.test(source));
  for(const [,ref] of source.matchAll(/(?:src|href)="([^"]+)"/g)){if(/^(https?:|#|data:)/.test(ref)||ref==='../')continue;const file=ref.split(/[?#]/)[0];if(file)assert.ok(fs.existsSync(path.resolve(root,file)),course.path+'/'+page+' necesita '+file);}
 }
});
