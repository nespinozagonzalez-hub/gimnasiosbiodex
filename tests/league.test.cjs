const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const L=require('../motor/league.js'),Q=require('../motor/questions.js'),E=require('../motor/combat.js'),G=require('../liga-config.js').GYMS,C=require('../catalog.json');
const bank=g=>require('../bancos/liga/'+g.slug+'.json'),qstate=()=>Q.create(()=>.3,bank(G[0]).questions,{repeat:false});
test('cinco gimnasios: 30 preguntas publicadas, cuatro códigos originales por sector, sin megas ni repetidos',()=>{
 const reference=require('../reference/biodex.json'),sectors=reference.sectors,catalog=reference.catalog;
 const seen=new Set();assert.equal(G.length,5);
 for(const gym of G){const b=bank(gym);assert.equal(L.validateBank(b,gym.slug).valid,true);assert.equal(L.validateBank(b,gym.slug).ready,true);assert.equal(b.questions.length,30);assert.equal(gym.rewards.length,4);const ids=sectors.find(s=>s.id===gym.sectorId).gimnasios.flatMap(s=>s.bioformas);
  for(const reward of gym.rewards){assert.ok(ids.includes(reward.id));assert.equal(reward.code,catalog.find(x=>x.id===reward.id).codigo);assert.equal(reward.name,C.find(x=>x.id===reward.id).name);assert.equal(seen.has(reward.id),false);assert.ok(Number(reward.id.slice(1))<=30);seen.add(reward.id);}
 }
 assert.equal(seen.size,20);
});
test('el reloj no se reinicia ni cambia las alternativas al reconsiderar una pregunta',()=>{
 const s=qstate(),q=Q.present(s,'attack',()=>.2),options=q.options.slice();Q.arm(s,45,1000);assert.equal(Q.remaining(s,11000),35000);assert.equal(Q.arm(s,45,11000),false);assert.equal(Q.present(s,'skill'),q);assert.deepEqual(q.options,options);assert.equal(Q.remaining(s,45999),1);
});
test('fecha límite estricta: elegir a tiempo sin confirmar también expira, una sola vez',()=>{
 const s=qstate(),q=Q.present(s,'skill');Q.arm(s,5,1000);Q.choose(s,q.answer,5999);const result=Q.grade(s,6000);assert.equal(result.timedOut,true);assert.equal(result.correct,false);assert.equal(Q.choose(s,q.answer,6000),false);assert.equal(Q.expire(s,10000),null);assert.equal(Q.grade(s,10000),null);assert.equal(s.history.length,1);assert.deepEqual(Q.consume(s),{correct:false,mode:'skill',timedOut:true});assert.equal(Q.consume(s),null);
});
test('tiempo agotado sin selección falla y conserva la energía de la habilidad',()=>{
 const s=qstate();Q.present(s,'skill');Q.arm(s,5,1000);const b=E.create([C[0]],G[0]),hp=b.enemy.hp,energy=b.team[0].energy;Q.expire(s,6001);const outcome=Q.consume(s),events=E.act(b,outcome.mode,undefined,outcome);assert.equal(b.enemy.hp,hp);assert.equal(b.team[0].energy,energy);assert.equal(b.turn,2);assert.equal(events.filter(e=>e.type==='playerMiss').length,1);assert.equal(events.filter(e=>e.type==='enemyAttack').length,1);
});
test('banco finito: 30 preguntas sin repetición, luego se termina',()=>{
 const s=qstate(),ids=new Set();for(let i=0;i<30;i++){const q=Q.present(s,'attack');ids.add(q.id);Q.choose(s,q.answer);Q.grade(s);Q.consume(s);}assert.equal(ids.size,30);assert.equal(Q.present(s,'attack'),null);assert.equal(s.history.length,30);
});
test('publicar exige 30 preguntas completas y definitivas; el ensayo nunca recibe códigos reales',()=>{
 const original=structuredClone(bank(G[0]));original.status='draft';original.questions[0].placeholder=true;const b=structuredClone(original);b.status='published';assert.equal(L.validateBank(b,G[0].slug).valid,false);b.questions.forEach(q=>q.placeholder=false);assert.equal(L.validateBank(b,G[0].slug).ready,true);
 for(const [won,demo,source,expected] of [[true,false,b,true],[false,false,b,false],[true,true,b,false],[true,false,original,false]])assert.equal(L.rewardEligible({won,demo,bank:source,slug:G[0].slug}),expected);
 b.questions[0].answer=4;assert.equal(L.validateBank(b,G[0].slug).valid,false);b.questions[0].answer=0;b.questions[0].seconds=0;assert.equal(L.validateBank(b,G[0].slug).valid,false);assert.equal(L.validateBank(original,'wrong').valid,false);
});
test('imágenes limitadas a rutas locales válidas y con texto alternativo',()=>{
 const b=structuredClone(bank(G[0]));b.questions[0].figure={src:'imagenes/neurona.webp',alt:'Esquema de una neurona'};assert.equal(L.validateBank(b,G[0].slug).valid,true);b.questions[0].figure.src='https://external.test/x.png';assert.equal(L.validateBank(b,G[0].slug).valid,false);b.questions[0].figure.src='imagenes/../x.png';assert.equal(L.validateBank(b,G[0].slug).valid,false);
});
test('los cinco gimnasios pueden superarse con la estrategia del equipo de ensayo en menos de 30 preguntas',()=>{
 for(const gym of G){const b=E.create(['B001','B008','B014'].map(id=>C.find(x=>x.id===id)),gym);let questions=0;while(b.status==='playing'&&questions<30){if(b.needsSwitch){E.act(b,'switch',b.team.findIndex(m=>m.hp>0));continue;}const member=b.team[b.active];E.act(b,E.intent(b).power>=30?'guard':member.energy>=2?'skill':'attack');questions++;}assert.equal(b.status,'won',gym.slug);assert.ok(questions<=30);}
});
test('progreso separado por cuenta y ensayo; almacenamiento bloqueado no interrumpe el resultado',()=>{
 const data=new Map(),storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};assert.equal(L.markWin(storage,'ensayo','aurora',1),true);assert.equal(L.readProgress(storage,'otra').aurora,undefined);assert.equal(L.readProgress(storage,'ensayo').aurora.mode,'trial');assert.equal(L.markWin({getItem(){throw Error();},setItem(){throw Error();}},'x','aurora',1),false);
});
