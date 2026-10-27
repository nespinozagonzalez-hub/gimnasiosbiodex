(function(root){
  'use strict';
  const R=typeof module==='object'&&module.exports?require('./roster.js'):root.BattleRoster;
  const clone=x=>JSON.parse(JSON.stringify(x));
  const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
  function combatant(b){
    const profile=R.PROFILES[b?.id];if(!profile)throw Error('Bioforma no reconocida.');
    const stat=key=>clamp(Number(b.stats?.[key])||50,30,100);
    const maxHp=88+Math.round(stat('vida')*.2);
    return {id:b.id,name:b.name,type:b.type,skill:b.skill,role:profile.role,ability:clone(profile.active),passive:clone(profile.passive),maxHp,hp:maxHp,attack:15+Math.round(stat('analisis')*.07),defense:Math.round(stat('evidencia')*.08)/100,energy:2,ward:0,focus:0,offensiveHits:0,receivedHits:0,skillsUsed:0};
  }
  function validateMission(m){
    if(!m?.id||!Array.isArray(m.phases)||!m.phases.length||m.phases.some(p=>!p.id||!p.type||!(p.baseHp>0)||!Array.isArray(p.moves)||!p.moves.length||p.moves.some(x=>!['attack','charge','shield'].includes(x.kind)||!Number.isFinite(x.power)||x.power<0)))throw Error('La misión necesita fases y movimientos válidos.');
  }
  function enemy(phase,size){const maxHp=phase.baseHp+size*(phase.hpPerAlly||0);return {id:phase.id,name:phase.name,type:phase.type,maxHp,hp:maxHp,shield:0,expose:0,exposeHits:0,weaken:0,dot:0,dotTurns:0};}
  function create(bioforms,mission){
    validateMission(mission);
    if(!Array.isArray(bioforms)||bioforms.length<1||bioforms.length>3||new Set(bioforms.map(b=>b.id)).size!==bioforms.length)throw Error('Elige entre 1 y 3 bioformas distintas.');
    return {mission:clone(mission),team:bioforms.map(combatant),active:0,phase:1,enemy:enemy(mission.phases[0],bioforms.length),enemyIndex:0,turn:1,status:'playing',needsSwitch:false};
  }
  function intent(s){return clone(s.mission.phases[s.phase-1].moves[s.enemyIndex%s.mission.phases[s.phase-1].moves.length]);}
  function incomingDamage(member,foe,move,guard=0){return Math.max(0,Math.round(move.power*R.affinity(foe.type,member.type)*(1-member.defense)*(1-guard)*(1-foe.weaken)*(member.receivedHits===0?1-(member.passive.firstWard||0):1))-(member.passive.armor||0));}
  function forecast(s){const m=s.team[s.active],move=intent(s);return move.kind==='attack'?incomingDamage(m,s.enemy,move,m.ward):0;}
  function matchup(member,foe){const mult=R.affinity(member.type,foe.type);return {multiplier:mult,label:mult>1?'Ventaja ×1,25':mult<1?'Resistencia rival ×0,85':'Afinidad neutral ×1'};}
  function act(s,action,index,outcome={correct:true}){
    if(s.status!=='playing')throw Error('El encuentro ya terminó.');
    if(!['attack','skill','guard','switch'].includes(action))throw Error('Movimiento no válido.');
    if(s.needsSwitch&&action!=='switch')throw Error('Elige una bioforma que siga en pie.');
    let member=s.team[s.active];
    if(action==='skill'&&member.energy<2)throw Error('Necesitas 2 de energía para usar la habilidad.');
    if(action==='switch'&&(!Number.isInteger(index)||index<0||index>=s.team.length||index===s.active||s.team[index].hp<=0))throw Error('Ese relevo no está disponible.');
    const events=[],emit=(type,text,extra={})=>events.push({type,text,...extra,snapshot:clone(s)});
    const heal=(m,n)=>{const amount=Math.min(n,m.maxHp-m.hp);if(m.hp>0)m.hp+=amount;return m.hp>0?amount:0;};
    const energy=(m,n)=>{m.energy=clamp(m.energy+n,0,3);};
    const transition=(turnSpent=false)=>{
      if(s.enemy.hp>0)return false;
      if(s.phase<s.mission.phases.length){s.phase++;s.enemy=enemy(s.mission.phases[s.phase-1],s.team.length);s.enemyIndex=0;if(!turnSpent)s.turn++;emit('phase',s.mission.phases[s.phase-1].intro||'Comienza una nueva fase.');}
      else{s.status='won';emit('win','Tu equipo supera el desafío.');}
      return true;
    };
    const correct=outcome.correct===true;
    if(action==='switch'){
      const free=s.needsSwitch;s.active=index;s.needsSwitch=false;member=s.team[index];emit('switch',member.name+' entra al encuentro.');if(free)return events;
    }else if(!correct){
      if(action==='attack')energy(member,1);
      emit('playerMiss',member.name+' no logra activar la acción. Revisa la explicación.',{failedAction:action});
    }else{
      let healed=0;
      if(action==='guard'){
        member.ward=Math.max(member.ward,.75);healed+=heal(member,7);energy(member,member.passive.guardEnergy||1);
        emit('guard',member.name+' protege un 75 % del próximo golpe y recupera energía.',{healing:healed>0,amount:healed,guarding:true});
      }else{
        const a=action==='skill'?member.ability:{power:member.attack};
        if(action==='skill'){energy(member,-2);if(a.cleanse)s.enemy.shield=0;}
        else energy(member,1);
        member.offensiveHits++;
        let base=a.power+member.focus+(s.enemy.exposeHits>0?s.enemy.expose:0);member.focus=0;
        if(s.enemy.exposeHits>0)s.enemy.exposeHits--;
        if(member.passive.lowBonus&&member.hp<=member.maxHp/2)base+=member.passive.lowBonus;
        if(member.passive.every&&member.offensiveHits%member.passive.every===0)base+=member.passive.bonus;
        const mult=R.affinity(member.type,s.enemy.type),damage=Math.round(base*mult),absorbed=Math.min(s.enemy.shield,Math.round(damage*(1-(a.pierce||0))));
        s.enemy.shield-=absorbed;const dealt=Math.min(s.enemy.hp,damage-absorbed);s.enemy.hp-=dealt;
        if(a.heal)healed+=heal(member,a.heal);
        if(a.teamHeal)s.team.forEach(m=>{healed+=heal(m,a.teamHeal);});
        if(a.guard)member.ward=Math.max(member.ward,a.guard);
        if(a.focus)member.focus=a.focus;
        if(a.expose){s.enemy.expose=a.expose;s.enemy.exposeHits=2;}
        if(a.weaken)s.enemy.weaken=Math.max(s.enemy.weaken,a.weaken);
        if(a.dot){s.enemy.dot=a.dot;s.enemy.dotTurns=2;}
        if(a.energy)energy(member,a.energy);
        if(action==='skill'){if(member.skillsUsed===0&&member.passive.firstRefund)energy(member,member.passive.firstRefund);member.skillsUsed++;}
        emit(action==='skill'?'playerSkill':'playerAttack',member.name+(action==='skill'?' usa '+member.skill:' ataca')+': '+dealt+' de daño. '+matchup(member,s.enemy).label+'.',{damage:dealt,absorbed,healing:healed>0,guarding:!!a.guard,multiplier:mult});
      }
      let passiveHeal=0;
      if(member.passive.regen)passiveHeal+=heal(member,member.passive.regen);
      if(member.passive.reserveHeal)s.team.forEach((m,i)=>{if(i!==s.active)passiveHeal+=heal(m,member.passive.reserveHeal);});
      if(passiveHeal)emit('passive',member.passive.name+': el equipo recupera '+passiveHeal+' de vida.',{healing:true,amount:passiveHeal});
      if(transition())return events;
    }
    const move=intent(s);
    if(move.kind==='attack'){
      const guarding=member.ward>0,damage=Math.min(member.hp,incomingDamage(member,s.enemy,move,member.ward));member.hp-=damage;member.receivedHits++;member.ward=0;s.enemy.weaken=0;
      emit('enemyAttack',s.enemy.name+' usa '+move.name+': '+damage+' de daño.',{damage,guarding});
    }else if(move.kind==='charge')emit('enemyCharge',s.enemy.name+' concentra energía. Lee su siguiente movimiento.');
    else{s.enemy.shield=move.shield||12;emit('enemyGuard',s.enemy.name+' levanta un escudo de '+s.enemy.shield+' puntos.');}
    s.enemyIndex++;s.turn++;
    if(member.hp<=0){if(s.team.some(m=>m.hp>0)){s.needsSwitch=true;emit('down',member.name+' necesita descansar. Elige un relevo.');}else{s.status='lost';emit('loss','Tu equipo necesita recuperar fuerzas.');}}
    // Si ambos caen por el eco, la derrota del equipo tiene prioridad.
    if(s.status==='playing'&&s.enemy.dotTurns>0){const damage=Math.min(s.enemy.hp,s.enemy.dot);s.enemy.hp-=damage;s.enemy.dotTurns--;emit('echo','El eco inflige '+damage+' de daño.',{damage});if(transition(true))return events;}
    if(s.status==='playing')emit('ready',s.needsSwitch?'Elige a tu siguiente compañero.':'Tu siguiente decisión puede cambiar el encuentro.');
    return events;
  }
  const api={create,act,intent,combatant,clone,matchup,forecast,skillDescription:R.skillDescription,passiveDescription:R.passiveDescription,affinity:R.affinity};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.BattleEngine=api;
})(typeof window!=='undefined'?window:this);
