(function(root){
  'use strict';
  // Reglas exclusivas del combate. Los datos guardados en BioDex no se alteran.
  const ADVANTAGES={Aurora:['Umbral','Bruma'],Prisma:['Aurora','Nova'],Nexo:['Prisma','Vector'],Nova:['Nexo','Arcana'],Bruma:['Nova','Terra'],Lumen:['Bruma','Umbral'],Vector:['Lumen','Prisma'],Umbral:['Vector','Terra'],Arcana:['Aurora','Lumen'],Terra:['Arcana','Nexo']};
  const ALIASES={Astral:'Prisma',Abisal:'Umbral',Primordial:'Arcana'};
  const rows=[
    ['B001','Apoyo',{power:16,heal:12},{name:'Luz compañera',regen:3}],
    ['B002','Protector',{power:17,teamHeal:7,guard:.35},{name:'Alas de abrigo',armor:2}],
    ['B003','Estratega',{power:23,expose:3},{name:'Tres reflejos',every:3,bonus:7}],
    ['B004','Explorador',{power:26,focus:5},{name:'Instinto lunar',lowBonus:6}],
    ['B005','Estratega',{power:24,pierce:.6},{name:'Órbita constante',every:2,bonus:4}],
    ['B006','Atacante',{power:32,heal:6},{name:'Primer amanecer',regen:2}],
    ['B007','Explorador',{power:23,energy:1},{name:'Paso ligero',firstWard:.35}],
    ['B008','Protector',{power:16,guard:.65,teamHeal:5},{name:'Compañeros de ruta',reserveHeal:3}],
    ['B009','Apoyo',{power:19,teamHeal:13},{name:'Halo persistente',armor:2}],
    ['B010','Protector',{power:18,heal:10,guard:.55},{name:'Piel de roca',armor:3}],
    ['B011','Protector',{power:20,guard:.7},{name:'Puerta del bosque',guardEnergy:2}],
    ['B012','Protector',{power:22,guard:.55,cleanse:true},{name:'Cristal templado',firstWard:.45}],
    ['B013','Estratega',{power:15,dot:5},{name:'Musgo reparador',regen:3}],
    ['B014','Explorador',{power:27,weaken:.35},{name:'Viento a favor',every:2,bonus:4}],
    ['B015','Apoyo',{power:17,teamHeal:9,dot:3},{name:'Raíces vivas',reserveHeal:4}],
    ['B016','Apoyo',{power:17,heal:18},{name:'Brasa paciente',firstRefund:1}],
    ['B017','Estratega',{power:23,energy:1},{name:'Engranaje doble',every:3,bonus:8}],
    ['B018','Apoyo',{power:18,teamHeal:15,cleanse:true},{name:'Aliento sereno',regen:2}],
    ['B019','Explorador',{power:24,focus:7},{name:'Órbita veloz',firstWard:.3}],
    ['B020','Atacante',{power:31,pierce:.5},{name:'Garra tenaz',lowBonus:7}],
    ['B021','Atacante',{power:34,expose:2},{name:'Horizonte abierto',every:3,bonus:6}],
    ['B022','Protector',{power:19,weaken:.45},{name:'Sello antiguo',armor:2}],
    ['B023','Estratega',{power:24,pierce:1},{name:'Estela del lago',regen:2}],
    ['B024','Protector',{power:23,guard:.45,heal:8},{name:'Nube errante',firstWard:.4}],
    ['B025','Protector',{power:20,guard:.6},{name:'Risco firme',armor:3}],
    ['B026','Atacante',{power:29,expose:3},{name:'Eco profundo',every:2,bonus:5}],
    ['B027','Atacante',{power:30,dot:4},{name:'Forja encendida',lowBonus:6}],
    ['B028','Estratega',{power:21,focus:8},{name:'Memoria del archivo',guardEnergy:2}],
    ['B029','Apoyo',{power:20,teamHeal:12},{name:'Jardín del archivo',reserveHeal:3}],
    ['B030','Protector',{power:24,teamHeal:8,guard:.35},{name:'Siete territorios',armor:2}],
    ['B031','Estratega',{power:29,focus:5},{name:'Horizonte estelar',every:3,bonus:6}],
    ['B032','Apoyo',{power:24,teamHeal:11,pierce:.5},{name:'Marea constante',regen:3}],
    ['B033','Atacante',{power:32,guard:.25},{name:'Primera forja',lowBonus:6}]
  ];
  const PROFILES=Object.fromEntries(rows.map(([id,role,active,passive])=>[id,{role,active,passive}]));
  function family(type){return ALIASES[type]||type;}
  function affinity(attackType,defendType){
    const a=family(attackType),d=family(defendType);
    if(a===d)return 1;
    if(ADVANTAGES[a]?.includes(d))return 1.25;
    if(ADVANTAGES[d]?.includes(a))return .85;
    return 1;
  }
  function passiveDescription(p){
    if(p.regen)return 'Cada acierto recupera '+p.regen+' de vida.';
    if(p.armor)return 'Reduce cada golpe recibido en '+p.armor+' puntos.';
    if(p.every)return 'Cada '+p.every+' aciertos ofensivos suma '+p.bonus+' al daño base.';
    if(p.lowBonus)return 'Con la mitad de vida o menos, suma '+p.lowBonus+' al daño base de tus aciertos.';
    if(p.firstWard)return 'El primer golpe recibido en la partida se reduce un '+Math.round(p.firstWard*100)+' %.';
    if(p.reserveHeal)return 'Cada acierto recupera '+p.reserveHeal+' de vida a los compañeros en reserva que sigan en pie.';
    if(p.guardEnergy)return 'Una defensa acertada recupera '+p.guardEnergy+' de energía.';
    if(p.firstRefund)return 'La primera habilidad acertada devuelve '+p.firstRefund+' de energía.';
    return '';
  }
  function skillDescription(member){
    const a=member.ability||PROFILES[member.id]?.active;if(!a)return '';
    const parts=[a.power+' de daño base (se ajusta por afinidad)'];
    if(a.heal)parts.push('recupera '+a.heal+' de vida');
    if(a.teamHeal)parts.push('cura '+a.teamHeal+' a cada aliado en pie');
    if(a.guard)parts.push('protege un '+Math.round(a.guard*100)+' % del próximo golpe recibido');
    if(a.pierce)parts.push('atraviesa '+Math.round(a.pierce*100)+' % del escudo');
    if(a.focus)parts.push('añade '+a.focus+' de daño base a tu siguiente ataque acertado');
    if(a.expose)parts.push('añade '+a.expose+' de daño base a los próximos 2 ataques del equipo');
    if(a.weaken)parts.push('reduce un '+Math.round(a.weaken*100)+' % el siguiente golpe rival');
    if(a.dot)parts.push('deja un eco de '+a.dot+' de daño durante 2 respuestas rivales');
    if(a.energy)parts.push('devuelve '+a.energy+' de energía');
    if(a.cleanse)parts.push('retira el escudo del rival antes del golpe');
    return parts.join('; ')+'. Consume 2 de energía al acertar.';
  }
  const api={PROFILES,ADVANTAGES,ALIASES,family,affinity,passiveDescription,skillDescription};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.BattleRoster=api;
})(typeof window!=='undefined'?window:this);
