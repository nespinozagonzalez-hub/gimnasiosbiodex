const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const G=require('../liga-config.js').GYMS,L=require('../motor/league.js'),Q=require('../motor/questions.js'),P=require('../appearance.js'),reference=require('../reference/cellular-import.json');
test('150 preguntas conservan íntegros enunciados, alternativas, claves, numerales y explicaciones del Excel',()=>{
 let total=0,numerals=0,five=0,originalE=0;const seen=new Set();
 for(const gym of G){const bank=require('../bancos/liga/'+gym.slug+'.json'),check=L.validateBank(bank,gym.slug);assert.equal(check.ready,true,check.errors.join(' '));assert.equal(bank.questions.length,30);const expected=reference.sheets.find(s=>s.gym===gym.slug);
  for(const q of bank.questions){assert.equal(seen.has(q.id),false);seen.add(q.id);const payload={id:q.id,stem:q.stem,options:q.options,correct:q.options[q.answer],statements:q.statements||[],explain:q.explain};assert.equal(crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex'),expected.questions.find(e=>e.id===q.id).sha256,q.id);assert.equal(q.placeholder,false);assert.ok([45,60,75,90].includes(q.seconds));total++;if(q.statements){numerals++;assert.equal(q.statements.length,4);}if(q.options.length===5)five++;if(q.answer===4)originalE++;}
 }
 assert.equal(total,150);assert.equal(numerals,50);assert.equal(five,50);assert.equal(originalE,10);
});
test('las 150 respuestas siguen siendo correctas después de barajar cuatro o cinco alternativas',()=>{
 for(const gym of G){const bank=require('../bancos/liga/'+gym.slug+'.json'),s=Q.create(()=>.37,bank.questions,{repeat:false});for(let i=0;i<30;i++){const q=Q.present(s,'attack',()=>.23),base=bank.questions.find(x=>x.id===q.id);assert.equal(q.options.length,base.options.length);assert.equal(q.options[q.answer],base.options[base.answer]);assert.deepEqual(q.statements,base.statements||[]);assert.equal(Q.choose(s,q.answer),true);assert.equal(Q.grade(s).correct,true);Q.consume(s);}assert.equal(Q.present(s,'attack'),null);}
});
test('se puede seleccionar la quinta alternativa sin aceptar índices fuera del banco',()=>{
 const base=require('../bancos/liga/prisma.json').questions.find(q=>q.answer===4),s=Q.create(()=>.99,[base]);const q=Q.present(s,'attack',()=>.999);assert.equal(q.answer,4);assert.equal(Q.choose(s,5),false);assert.equal(Q.choose(s,4),true);assert.equal(Q.grade(s).correct,true);
});
test('el validador detecta numerales incompletos y claves fuera de las cuatro o cinco alternativas',()=>{
 const b=structuredClone(require('../bancos/liga/nexo.json')),q=b.questions.find(q=>q.statements);q.statements.pop();assert.equal(L.validateBank(b,'nexo').valid,false);q.statements.push('Otro enunciado');q.answer=5;assert.equal(L.validateBank(b,'nexo').valid,false);
});
test('la letra retro se puede apagar, recordar al navegar y volver a encender',()=>{
 const values=new Map(),storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)},element={dataset:{}};
 const first=P.create({storage,element});assert.equal(first.mode,'retro');assert.equal(first.toggle(),'clear');assert.equal(element.dataset.typeface,'clear');const next=P.create({storage,element:{dataset:{}}});assert.equal(next.mode,'clear');assert.equal(next.toggle(),'retro');assert.equal(values.get(P.KEY),'retro');
});
test('el interruptor tipográfico funciona aunque el navegador bloquee el almacenamiento',()=>{
 const element={dataset:{}},p=P.create({storage:{getItem(){throw Error();},setItem(){throw Error();}},element});assert.equal(p.toggle(),'clear');assert.equal(element.dataset.typeface,'clear');
});
