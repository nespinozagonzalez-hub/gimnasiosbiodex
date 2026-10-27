const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const E=require('../motor/combat.js'),R=require('../motor/roster.js'),M=require('../misiones/umbral.js'),Q=require('../motor/questions.js'),A=require('../assets/bioformas/manifest.js'),C=require('../catalog.json');
const bio=id=>C.find(b=>b.id===id),create=(ids=['B001','B008','B014'])=>E.create(ids.map(bio),M);

test('las 33 bioformas tienen ficha, habilidad, pasiva y arte de combate',()=>{
 assert.equal(C.length,33);assert.equal(Object.keys(R.PROFILES).length,33);assert.equal(Object.keys(A.ART).length,33);
 for(const b of C){const m=E.combatant(b);assert.ok(m.hp>=94&&m.hp<=108);assert.ok(m.attack>=17&&m.attack<=22);assert.ok(m.defense>=0&&m.defense<=.08);assert.ok(E.skillDescription(m).includes('Consume 2'));assert.ok(E.passiveDescription(m.passive).length>20);assert.ok(fs.existsSync(path.resolve(__dirname,'..',A.ART[b.id].file)));}
});
test('equipo de 1–3 distinto; se rechazan desconocidos y misiones inválidas',()=>{
 assert.throws(()=>E.create([],M));assert.throws(()=>E.create([bio('B001'),bio('B001')],M));assert.throws(()=>E.create(C.slice(0,4),M));assert.throws(()=>E.create([{id:'NO'}],M));assert.throws(()=>E.create([C[0]],{}));
});
test('afinidades con ventaja, resistencia y equivalencias legendarias',()=>{
 assert.equal(E.affinity('Aurora','Umbral'),1.25);assert.equal(E.affinity('Umbral','Aurora'),.85);assert.equal(E.affinity('Umbral','Umbral'),1);
 for(const [mega,base] of Object.entries(R.ALIASES))for(const type of Object.keys(R.ADVANTAGES))assert.equal(E.affinity(mega,type),E.affinity(base,type));
 for(const [a,targets] of Object.entries(R.ADVANTAGES)){assert.equal(targets.length,2);for(const b of targets)assert.ok(!R.ADVANTAGES[b].includes(a));}
});
test('elegir bioforma cambia el daño real; un error no ataca ni activa ventajas',()=>{
 const s=create(['B001']);const events=E.act(s,'attack');assert.equal(events[0].multiplier,1.25);assert.equal(events[0].damage,Math.round(s.team[0].attack*1.25));
 const f=create(['B001']);f.team[0].hp=50;const hp=f.enemy.hp;E.act(f,'skill',undefined,{correct:false});assert.equal(f.enemy.hp,hp);assert.equal(f.team[0].energy,2);assert.equal(f.team[0].skillsUsed,0);assert.ok(f.team[0].hp<50);
});
test('la protección espera al próximo golpe y no se gasta durante una carga',()=>{
 const s=create(['B001']);s.enemyIndex=1;E.act(s,'guard');assert.equal(s.team[0].ward,.75);assert.equal(E.intent(s).kind,'attack');const hp=s.team[0].hp,forecast=E.forecast(s);E.act(s,'attack');assert.equal(s.team[0].ward,0);assert.equal(s.team[0].hp,hp-forecast);assert.ok(forecast<=9);
});
test('respuesta de defensa incorrecta no cura ni protege',()=>{
 const s=create(['B001']);s.enemyIndex=1;s.team[0].hp=40;E.act(s,'guard',undefined,{correct:false});assert.equal(s.team[0].hp,40);assert.equal(s.team[0].ward,0);
});
test('la pasiva de vida solo se activa con respuestas correctas',()=>{
 const s=create(['B001']);s.team[0].hp=50;s.enemyIndex=1;E.act(s,'attack');assert.equal(s.team[0].hp,53);
});
test('curación de equipo conserva los compañeros caídos',()=>{
 const s=create(['B009','B001','B014']);s.enemyIndex=1;s.team.forEach(m=>m.hp=30);s.team[2].hp=0;E.act(s,'skill');assert.equal(s.team[0].hp,43);assert.equal(s.team[1].hp,43);assert.equal(s.team[2].hp,0);
});
test('Nexora cura reservas con su pasiva y protege con su habilidad',()=>{
 const s=create(['B008','B001']);s.team[1].hp=30;s.enemyIndex=1;E.act(s,'skill');assert.equal(s.team[1].hp,38);assert.equal(s.team[0].ward,.65);
});
test('Caelix atraviesa todo el escudo y Aegira lo retira',()=>{
 for(const id of ['B023','B012']){const s=create([id]);s.enemy.shield=30;s.enemyIndex=1;const events=E.act(s,'skill');assert.equal(events.find(e=>e.type==='playerSkill').absorbed,0);if(id==='B012')assert.equal(s.enemy.shield,0);}
});
test('concentración y marca mejoran ataques posteriores, sin aplicarse al golpe que las crea',()=>{
 const s=create(['B004']);s.enemyIndex=1;E.act(s,'skill');assert.equal(s.team[0].focus,5);const events=E.act(s,'attack');assert.equal(events[0].damage,s.team[0].attack+5);assert.equal(s.team[0].focus,0);
 const a=create(['B003']);a.enemyIndex=1;const first=E.act(a,'skill')[0];assert.equal(first.damage,Math.round(23*1.25));assert.equal(a.enemy.exposeHits,2);E.act(a,'attack');assert.equal(a.enemy.exposeHits,1);
});
test('debilitar permanece hasta el siguiente ataque del rival',()=>{
 const s=create(['B014']);s.enemyIndex=1;E.act(s,'skill');assert.equal(s.enemy.weaken,.35);E.act(s,'attack');assert.equal(s.enemy.weaken,0);
});
test('el eco aplica exactamente dos veces y desaparece al cambiar de fase',()=>{
 const s=create(['B013']);s.enemyIndex=1;assert.ok(E.act(s,'skill').some(e=>e.type==='echo'));assert.equal(s.enemy.dotTurns,1);assert.ok(E.act(s,'guard').some(e=>e.type==='echo'));assert.equal(s.enemy.dotTurns,0);
 s.enemy.hp=1;E.act(s,'attack');assert.equal(s.phase,2);assert.equal(s.enemy.dotTurns,0);
 const a=create(['B013']);a.enemy.hp=3;a.enemy.dot=5;a.enemy.dotTurns=1;a.enemyIndex=1;E.act(a,'guard');assert.equal(a.phase,2);assert.equal(a.turn,2);
});
test('reglas de energía, rechazo atómico y reembolso único',()=>{
 const s=create(['B016']);s.enemyIndex=1;E.act(s,'skill');assert.equal(s.team[0].energy,1);const before=JSON.stringify(s);assert.throws(()=>E.act(s,'skill'),/energía/);assert.equal(JSON.stringify(s),before);
 E.act(s,'attack');s.enemyIndex=1;E.act(s,'skill');assert.equal(s.team[0].energy,0);
 const g=create(['B011']);g.team[0].energy=0;g.enemyIndex=1;E.act(g,'guard');assert.equal(g.team[0].energy,2);
});
test('la coraza reduce daño y el primer escudo se consume solo una vez',()=>{
 const s=create(['B007']);const first=E.forecast(s);E.act(s,'attack',undefined,{correct:false});s.enemyIndex=0;assert.ok(E.forecast(s)>first);
 const a=create(['B010']);assert.ok(E.forecast(a)<18);
});
test('relevo forzado gratuito; voluntario recibe la respuesta rival',()=>{
 const s=create();s.team[0].hp=1;E.act(s,'attack',undefined,{correct:false});assert.equal(s.needsSwitch,true);assert.throws(()=>E.act(s,'guard'));const turn=s.turn;E.act(s,'switch',1);assert.equal(s.turn,turn);assert.equal(s.active,1);assert.equal(s.needsSwitch,false);
 const v=create();E.act(v,'switch',1);assert.equal(v.turn,2);assert.ok(v.team[1].hp<v.team[1].maxHp);
});
test('transición sin contraataque; victoria y derrota son terminales',()=>{
 const s=create();s.enemy.hp=1;const hp=s.team[0].hp;E.act(s,'attack');assert.equal(s.phase,2);assert.equal(s.team[0].hp,hp);s.enemy.hp=1;E.act(s,'attack');assert.equal(s.status,'won');assert.throws(()=>E.act(s,'attack'));
 const a=create(['B001']);a.team[0].hp=1;E.act(a,'attack',undefined,{correct:false});assert.equal(a.status,'lost');assert.throws(()=>E.act(a,'guard'));
});
test('motor reutilizable: misión alternativa con una sola fase',()=>{
 const custom={id:'otra',phases:[{id:'B010',name:'Terral',type:'Nova',baseHp:1,moves:[{name:'Pulso',kind:'attack',power:12}]}]};const s=E.create([C[0]],custom);E.act(s,'attack');assert.equal(s.status,'won');assert.equal(s.phase,1);assert.equal(custom.phases[0].baseHp,1);
});
test('las 33 bioformas pueden superar solas el ensayo con aciertos y defensa táctica',()=>{
 for(const b of C){const s=create([b.id]);for(let turn=0;turn<60&&s.status==='playing';turn++)E.act(s,E.intent(s).power>=32?'guard':s.team[0].energy>=2?'skill':'attack');assert.equal(s.status,'won',b.name);}
});
test('33 orientaciones válidas y lados opuestos incluso al relevar',()=>{
 for(const art of Object.values(A.ART)){assert.equal(A.shouldFlip(art.facing,'player'),false);assert.equal(A.shouldFlip(art.facing,'enemy'),true);}
 assert.equal(A.shouldFlip('left','player'),true);assert.equal(A.shouldFlip('left','enemy'),false);assert.throws(()=>A.shouldFlip('front','enemy'));
});
test('16 preguntas, orden aleatorio estable y confirmación/resolución de un solo uso',()=>{
 assert.equal(Q.BANK.length,16);const s=Q.create(()=>.37),seen=[];
 for(let i=0;i<16;i++){const q=Q.present(s,'attack',()=>.37);seen.push(q.id);assert.equal(Q.grade(s),null);assert.equal(Q.present(s,'skill'),q);Q.choose(s,q.answer);assert.equal(Q.grade(s).correct,true);assert.equal(Q.grade(s),null);assert.deepEqual(Q.consume(s),{correct:true,mode:'attack'});assert.equal(Q.consume(s),null);}
 assert.equal(new Set(seen).size,16);Q.present(s,'guard');assert.equal(s.cycle,1);
});
test('el motor de preguntas admite otro banco sin modificar código',()=>{
 const bank=[{id:'x',topic:'otro',stem:'Otra pregunta',options:['a','b','c','d'],answer:1,explain:'Explicación'}];const s=Q.create(()=>.3,bank);assert.equal(Q.present(s,'skill').id,'x');assert.throws(()=>Q.create(undefined,[]));
});
