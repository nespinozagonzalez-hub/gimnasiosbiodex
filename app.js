(()=>{
  'use strict';
  const $=id=>document.getElementById(id),E=window.BattleEngine,Q=window.MissionQuestions;
  const knownViews=['access','team','story','battle','result'];
  let catalog=[],session=null,owned=[],selected=[],demo=false,showAll=false,battle=null,animating=false,networkBusy=false,displayState=null,forcedSwitch=false;
  let currentView='access',sound=false,audioContext=null,toastTimer=null,lastModalFocus=null;
  let quiz=null,renderer=null,storyIndex=0,typingTimer=null,fullStory='',questionOrigin=null;
  const M=window.BioDexMission,STORY=M.story,IS_LEAGUE=Boolean(M.slug),BANK=M.bank||null;
  let clockTimer=null,untimed=false;
  const account=window.BioDexAccount.create({config:window.BIODEX_CONFIG,fetch:window.fetch.bind(window),storage:{getItem:k=>sessionStorage.getItem(k),setItem:(k,v)=>sessionStorage.setItem(k,v),removeItem:k=>sessionStorage.removeItem(k)}});
  const access=IS_LEAGUE?window.BioDexAccess.create({storage:{getItem:k=>localStorage.getItem(k),setItem:(k,v)=>localStorage.setItem(k,v)},gyms:window.BioDexGyms.GYMS}):null;
  const canEnter=()=>!IS_LEAGUE||M.preview||(leagueCheck.ready&&session&&access.isUnlocked(session.name,M.slug));
  function enterWithAccount(){
    if(IS_LEAGUE&&!canEnter()){
      $('loginForm').hidden=true;$('gymGate').hidden=false;$('gateAccount').textContent='Colección conectada · '+session.name;
      const unlocked=access.isUnlocked(session.name,M.slug);
      $('gateStatus').textContent=!unlocked?'Activa este destino con el código de tu docente.':!leagueCheck.ready?'Gimnasio activado. Tu docente anunciará la apertura de la actividad.':'';
      $('gymCodeForm').hidden=unlocked;setView('access');return;
    }
    if($('gymGate'))$('gymGate').hidden=true;renderTeam();setView('team');tone();
  }
  $('gymCodeForm')?.addEventListener('submit',event=>{
    event.preventDefault();try{const {gym}=access.activate(session?.name,$('gymCode').value);if(gym.slug!==M.slug)throw Error('Este código activa '+gym.title+'. Puedes encontrarlo en la liga.');$('gymCode').value='';$('gateError').textContent='';enterWithAccount();}catch(error){$('gateError').textContent=error.message;}
  });
  const leagueCheck=IS_LEAGUE?window.BioDexLeague.validateBank(BANK,M.slug):null;
  const DEMO_IDS=Array.from({length:33},(_,i)=>'B'+String(i+1).padStart(3,'0'));
  const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const getBio=id=>catalog.find(b=>b.id===id);
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,window.matchMedia('(prefers-reduced-motion: reduce)').matches?20:ms));
  function toast(message){clearTimeout(toastTimer);$('toast').textContent=message;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,4200);}
  function tone(kind='tap'){
    if(!sound)return;
    try{
      audioContext??=new (window.AudioContext||window.webkitAudioContext)();audioContext.resume().catch(()=>{});
      const osc=audioContext.createOscillator(),gain=audioContext.createGain(),t=audioContext.currentTime;
      const f={tap:480,attack:170,skill:710,hurt:95,guard:330,win:840}[kind]||440;
      osc.type=kind==='hurt'?'sawtooth':'triangle';osc.frequency.setValueAtTime(f,t);osc.frequency.exponentialRampToValueAtTime(kind==='win'?f*1.7:f*.65,t+.16);gain.gain.setValueAtTime(.045,t);gain.gain.exponentialRampToValueAtTime(.001,t+.2);osc.connect(gain);gain.connect(audioContext.destination);osc.start(t);osc.stop(t+.21);
    }catch(_){sound=false;$('soundButton').setAttribute('aria-pressed','false');toast('El sonido no está disponible en este navegador.');}
  }
  function setView(view,focus=true){
    currentView=view;document.body.dataset.view=view;knownViews.forEach(v=>$(v+'View').hidden=v!==view);
    if(view==='battle')renderer?.start();else renderer?.stop();
    if(view!=='story')finishStory();
    const step=view==='result'?'battle':view;
    document.querySelectorAll('[data-step]').forEach(el=>{el.classList.toggle('active',el.dataset.step===step);el.classList.toggle('done',knownViews.indexOf(el.dataset.step)<knownViews.indexOf(step));});
    if(focus){window.scrollTo({top:0,behavior:'instant'});$('main').focus({preventScroll:true});}
    window.PixelArt.paintAll($(view+'View'));
  }
  function openDialog(id){lastModalFocus=document.activeElement;$(id).showModal();}
  function closeDialog(id){$(id).close();lastModalFocus?.focus?.();}
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeDialog(b.dataset.close)));
  $('loadingDialog').addEventListener('cancel',e=>e.preventDefault());
  $('switchDialog').addEventListener('cancel',e=>{if(forcedSwitch)e.preventDefault();});
  $('helpButton').addEventListener('click',()=>openDialog('infoDialog'));
  $('showPin').addEventListener('click',()=>{const reveal=$('playerPin').type==='password';$('playerPin').type=reveal?'text':'password';$('showPin').textContent=reveal?'Ocultar':'Ver';$('showPin').setAttribute('aria-pressed',String(reveal));$('showPin').setAttribute('aria-label',reveal?'Ocultar clave':'Mostrar clave');});
  $('soundButton').addEventListener('click',()=>{sound=!sound;$('soundButton').setAttribute('aria-pressed',String(sound));$('soundButton').title=sound?'Desactivar sonido':'Activar sonido';$('soundButton').setAttribute('aria-label',$('soundButton').title);tone('tap');});
  $('fullButton').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else toast('Para ampliar la misión, ábrela en una pestaña independiente y gira el teléfono.');}catch(_){toast('El navegador no permitió ampliar la pantalla. Puedes abrir la misión en una pestaña independiente.');}});

  async function request(action,fields={}){
    if(action==='login')return account.login(fields.name,fields.pin);
    if(action==='load')return account.load();
    if(action==='logout')return account.logout();
    throw Error('Operación no disponible.');
  }
  function collectionFrom(data){
    if(!data.progreso||!Array.isArray(data.progreso.capturadas))throw new Error('BioDex respondió sin una colección válida. Intenta otra vez.');
    return [...new Set(data.progreso.capturadas.filter(id=>typeof id==='string'&&getBio(id)))];
  }
  async function withLoading(callback,refresh=false){
    networkBusy=true;$('loginButton').disabled=true;$('demoButton').disabled=true;$('refreshButton').disabled=true;$('exitButton').disabled=true;
    $('loadingTitle').textContent=refresh?'Actualizando tu colección…':'Recuperando tu colección…';$('loadingText').textContent='Verificando tu pasaporte y buscando tus bioformas.';
    openDialog('loadingDialog');const timer=setTimeout(()=>$('loadingText').textContent='El archivo sigue respondiendo. La consulta puede tardar unos instantes más.',10000);
    try{return await callback();}finally{clearTimeout(timer);closeDialog('loadingDialog');networkBusy=false;$('loginButton').disabled=false;$('demoButton').disabled=false;$('refreshButton').disabled=false;$('exitButton').disabled=false;}
  }
  $('loginForm').addEventListener('submit',async event=>{
    event.preventDefault();if(networkBusy)return;
    const name=$('playerName').value.trim().replace(/\s+/g,' '),pin=$('playerPin').value;
    $('loginError').textContent='';
    if(name.length<2||!/^\d{6}$/.test(pin)){$('loginError').textContent='Escribe tu nombre y una clave de exactamente 6 dígitos.';return;}
    $('playerPin').value='';
    try{
      await withLoading(async()=>{
        const data=await request('login',{name,pin});const ids=collectionFrom(data);
        if(typeof data.token!=='string'||!data.token)throw new Error('No se recibió una sesión válida. Intenta otra vez.');
        session={token:data.token,name:String(data.progreso.jugador||name)};owned=ids;selected=[];demo=false;showAll=false;
      });
      enterWithAccount();
    }catch(error){$('loginError').textContent=error.message;$('playerPin').focus();}
  });
  $('demoButton').addEventListener('click',()=>{
    if(networkBusy||(IS_LEAGUE&&!M.preview))return;session=null;demo=true;owned=DEMO_IDS.filter(id=>getBio(id));selected=['B001','B008','B014'].filter(id=>owned.includes(id));showAll=false;
    $('playerPin').value='';renderTeam();setView('team');tone();
  });
  $('refreshButton').addEventListener('click',async()=>{
    if(networkBusy||demo||!session)return;
    try{await withLoading(async()=>{const data=await request('load');owned=collectionFrom(data);selected=selected.filter(id=>owned.includes(id));},true);renderTeam();toast('Colección consultada. Tu equipo está al día.');}
    catch(error){toast(error.message);}
  });
  $('exitButton').addEventListener('click',async()=>{
    if(networkBusy)return;networkBusy=true;$('exitButton').disabled=true;
    try{if(session)await request('logout');}catch(_){/* La sesión local se descarta aunque falle la red. */}
    finally{session=null;owned=[];selected=[];battle=null;demo=false;networkBusy=false;$('exitButton').disabled=false;if($('gymGate'))$('gymGate').hidden=true;$('loginForm').hidden=false;setView('access');}
  });
  $('gateLogout')?.addEventListener('click',()=>$('exitButton').click());
  function toggleBio(id){
    if(!owned.includes(id))return;
    if(selected.includes(id))selected=selected.filter(x=>x!==id);
    else if(selected.length<3)selected.push(id);
    else{toast('Tu equipo ya tiene tres bioformas. Retira una para hacer un cambio.');return;}
    tone();renderTeam(false);
  }
  function renderTeam(rebuildGrid=true){
    $('profileName').textContent=demo?'Equipo de preparación':session?.name||'Explorador';
    $('connectionKind').textContent=demo?'EQUIPO PRESTADO':'BIODEX / COLECCIÓN CONSULTADA';
    $('demoBanner').hidden=!demo;$('refreshButton').hidden=demo;
    const avatar=account.progress?.configuracion?.avatarId;$('profileAvatar').src=!demo&&['aurora','prisma','nexo','terra'].includes(avatar)?'assets/avatars/'+avatar+'.png':'assets/trainer.png';
    $('collectionCount').textContent=owned.length+' / 33 disponibles';
    $('ownedFilter').classList.toggle('selected',!showAll);$('ownedFilter').setAttribute('aria-pressed',String(!showAll));$('allFilter').classList.toggle('selected',showAll);$('allFilter').setAttribute('aria-pressed',String(showAll));
    const list=showAll?catalog:catalog.filter(b=>owned.includes(b.id));
    if(rebuildGrid||!$('collectionGrid').children.length){
      $('collectionGrid').innerHTML=list.length?list.map(b=>{
        const unlocked=owned.includes(b.id),m=E.combatant(b);
        return `<button class="bio-card ${unlocked?'':'locked'} ${selected.includes(b.id)?'chosen':''}" data-bio="${b.id}" ${unlocked?'':'disabled'} aria-pressed="${selected.includes(b.id)}" aria-label="${escape(b.name)}, ${unlocked?m.role:'sin capturar'}"><span class="bio-number">#${b.id.slice(1)}</span><span class="choice-check" aria-hidden="true">✓</span><div class="bio-art"><canvas data-pixel-id="${b.id}" width="96" height="96" aria-hidden="true"></canvas></div><h3>${escape(b.name)}</h3><div class="bio-meta"><span class="type-label">${escape(b.type)}</span><span>${unlocked?m.role:'Sin capturar'}</span></div><div class="bio-skill">${unlocked?'✦ '+escape(b.skill):'◇ Se desbloquea al capturarla en BioDex'}</div>${unlocked?`<div class="bio-combat-stats"><span>♥ ${m.maxHp}</span><span>↗ ${m.attack}</span><span>⬡ ${Math.round(m.defense*100)} %</span></div><span class="affinity-pill ${E.matchup(b,{type:M.phases[0].type}).multiplier>1?'advantage':''}">${E.matchup(b,{type:M.phases[0].type}).label}</span><p class="bio-passive">${escape(m.passive.name)} · ${escape(E.passiveDescription(m.passive))}</p>`:''}</button>`;
      }).join(''):'<div class="empty-collection"><b>Tu primera aventura está por comenzar.</b><p>Tu cuenta todavía no tiene bioformas disponibles para este combate. Captura alguna en BioDex y pulsa Actualizar colección.</p></div>';
      $('collectionGrid').querySelectorAll('[data-bio]').forEach(el=>el.addEventListener('click',()=>toggleBio(el.dataset.bio)));
    }else document.querySelectorAll('[data-bio]').forEach(el=>{el.classList.toggle('chosen',selected.includes(el.dataset.bio));el.setAttribute('aria-pressed',String(selected.includes(el.dataset.bio)));});
    $('teamSlots').innerHTML=Array.from({length:3},(_,i)=>{const b=getBio(selected[i]);return b?`<button class="team-slot filled" data-remove="${b.id}" aria-label="Retirar a ${escape(b.name)}"><span class="remove">×</span><canvas data-pixel-id="${b.id}" width="64" height="64" aria-hidden="true"></canvas><small>${escape(b.name)}</small></button>`:`<div class="team-slot" aria-label="Espacio ${i+1} vacío"><span>+</span></div>`;}).join('');
    $('teamSlots').querySelectorAll('[data-remove]').forEach(b=>b.addEventListener('click',()=>toggleBio(b.dataset.remove)));
    $('startButton').disabled=selected.length===0;$('quickStartButton').disabled=selected.length===0;$('dockCount').textContent=selected.length+' / 3 elegidas';$('startHint').textContent=selected.length?selected.length+' de 3 compañeros listos. La primera elección entra al combate.':'Elige de 1 a 3 bioformas para comenzar.';
    $('rosterMessage').textContent=owned.length===0?'Abre tu BioDex para registrar tu primera bioforma y luego actualiza la colección.':'';
    window.PixelArt.paintAll($('teamView'));
    $('teamAdvice').textContent=selected.length?selected.map(id=>{const b=getBio(id);return b.name+': '+E.matchup(b,{type:M.phases[0].type}).label;}).join(' · '):'Combina afinidad, curación y protección ante '+M.phases[0].type+'.';
  }
  $('ownedFilter').addEventListener('click',()=>{showAll=false;renderTeam();});$('allFilter').addEventListener('click',()=>{showAll=true;renderTeam();});
  function startMission(){
    if(!canEnter()||!selected.length||selected.some(id=>!owned.includes(id)))return;
    battle=E.create(selected.map(getBio),{id:M.id,phases:M.phases});quiz=IS_LEAGUE?Q.create(undefined,BANK.questions,{repeat:false}):Q.create();untimed=IS_LEAGUE&&M.preview&&Boolean($('untimedPractice')?.checked);displayState=E.clone(battle);$('battleLog').replaceChildren();resetQuestion();
    log(M.leader+' te da la bienvenida. '+M.phases[0].intro,1);if($('battleTimeHint'))$('battleTimeHint').textContent=untimed?'Sin reloj':(M.timeLabel||M.questionSeconds+' s por pregunta');renderBattle(battle);storyIndex=0;renderStory();setView('story');tone('skill');
  }
  $('startButton').addEventListener('click',startMission);$('quickStartButton').addEventListener('click',startMission);
  function finishStory(){clearInterval(typingTimer);typingTimer=null;if($('storyText'))$('storyText').textContent=fullStory;}
  function renderStory(){
    finishStory();const scene=STORY[storyIndex];fullStory=scene.line;$('storyHeading').textContent=scene.title;$('storyCaption').textContent=scene.caption;$('storyCount').textContent=String(storyIndex+1).padStart(2,'0')+' / 03';$('storyNext').innerHTML=storyIndex===2?'Entrar a la arena <span>→</span>':'Continuar <span>→</span>';
    $('storyPortrait').classList.toggle('encouraging',storyIndex===2);
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){$('storyText').textContent=fullStory;return;}
    let count=0;$('storyText').textContent='';typingTimer=setInterval(()=>{count+=3;$('storyText').textContent=fullStory.slice(0,count);if(count>=fullStory.length)finishStory();},20);
  }
  function enterBattle(){finishStory();leaderSay('Elige tu estrategia. Tu respuesta dará energía al movimiento.','EL ENCUENTRO COMIENZA');setView('battle');renderBattle(battle);}
  $('storyNext').addEventListener('click',()=>{if(typingTimer){finishStory();return;}if(storyIndex<2){storyIndex++;renderStory();tone();}else enterBattle();});
  $('showStoryText').addEventListener('click',finishStory);$('skipStory').addEventListener('click',enterBattle);$('storyBack').addEventListener('click',()=>{finishStory();renderTeam();setView('team');});
  function leaderSay(line,caption=M.leaderTitle?.toLocaleUpperCase('es')||'GUARDIANA DEL UMBRAL',encouraging=false){$('leaderLine').textContent=line;$('leaderCaption').textContent=caption;$('battlePortrait').classList.toggle('encouraging',encouraging);}
  function hpColor(value,max){return value/max<.25?'#f2a18b':value/max<.5?'#e9c879':'';}
  function renderBattle(state){
    displayState=E.clone(state);const member=state.team[state.active],enemy=state.enemy,move=E.intent(state);
    renderer?.setBattle(state);
    $('enemyName').textContent=enemy.name;$('enemyType').textContent=enemy.type.toLocaleUpperCase('es');$('enemyImage').src='assets/cutouts/'+enemy.id+'.png';$('enemyImage').alt=enemy.name;
    $('enemyHpBar').style.width=(Math.max(0,enemy.hp)/enemy.maxHp*100)+'%';$('enemyHp').textContent=enemy.hp+' / '+enemy.maxHp;
    $('enemyShield').hidden=!enemy.shield;$('enemyShield').textContent='⬡ Escudo '+enemy.shield;
    $('activeName').textContent=member.name;$('activeRole').textContent=member.role.toLocaleUpperCase('es');$('playerImage').src='assets/cutouts/'+member.id+'.png';$('playerImage').alt=member.name;
    $('playerSprite').classList.toggle('fainted',member.hp<=0);$('enemySprite').classList.toggle('fainted',enemy.hp<=0);
    $('playerHpBar').style.width=(Math.max(0,member.hp)/member.maxHp*100)+'%';$('playerHpBar').style.background=hpColor(member.hp,member.maxHp);
    $('playerHp').textContent=member.hp+' / '+member.maxHp;$('playerEnergy').textContent='ENERGÍA '+member.energy+' / 3';
    $('phaseLabel').textContent='FASE '+(state.phase===1?'I':'II')+' / '+(M.phases.length===2?'II':M.phases.length);$('turnLabel').textContent='TURNO '+String(state.turn).padStart(2,'0');
    $('intentTitle').textContent=move.name;$('intentHint').textContent=move.hint;$('intentPower').textContent=move.power?E.forecast(state)+' DAÑO EST.':move.kind==='shield'?'+'+(move.shield||12)+' ESCUDO':'CARGA';
    $('matchupBadge').textContent=member.type+' → '+enemy.type+' · '+E.matchup(member,enemy).label;
    $('passiveName').textContent=member.passive.name;$('passiveDescription').textContent=E.passiveDescription(member.passive);
    $('battleEffects').textContent=[member.ward?'Protección '+Math.round(member.ward*100)+' %':'',member.focus?'Próximo golpe +'+member.focus:'',enemy.weaken?'Golpe rival −'+Math.round(enemy.weaken*100)+' %':'',enemy.dotTurns?'Eco '+enemy.dot+' × '+enemy.dotTurns:'',enemy.exposeHits?'Marca +'+enemy.expose+' × '+enemy.exposeHits:''].filter(Boolean).join(' · ')||'Sin efectos pendientes';
    $('skillName').textContent=member.skill;$('skillDescription').textContent=E.skillDescription(member);$('skillEnergy').innerHTML=Array.from({length:3},(_,i)=>'<i class="'+(i<member.energy?'on':'')+'"></i>').join('');
    $('skillCost').textContent=member.energy>=2?'Consume 2 de energía':'Falta energía · ataca o defiende';
    $('partyList').innerHTML=state.team.map((m,i)=>`<div class="party-member ${m.hp<=0?'down':''}"><canvas data-pixel-id="${m.id}" width="48" height="48" aria-hidden="true"></canvas><div class="party-info"><b>${escape(m.name)} <small>${i===state.active?'EN CAMPO':m.hp<=0?'DESCANSANDO':'RESERVA'}</small></b><div class="hp-track"><div style="width:${m.hp/m.maxHp*100}%"></div></div><span>${m.hp} / ${m.maxHp} · ${escape(m.role)}</span></div></div>`).join('');
    $('learningCount').textContent=(quiz?.history.filter(x=>x.correct).length||0)+' / '+(quiz?.history.length||0);window.PixelArt.paintAll($('partyList'));
    updateCommands();
  }
  function updateCommands(){
    const s=displayState;if(!s)return;const waiting=Boolean(quiz?.current)&&$('questionPanel').open,locked=animating||s.status!=='playing'||s.needsSwitch||waiting;
    $('battleView').dataset.phase=animating?'animating':s.status!=='playing'?'finished':waiting?(quiz.current.graded?'feedback':'question'):s.needsSwitch?'switch':'player';
    document.querySelectorAll('[data-action]').forEach(b=>b.disabled=locked||(b.dataset.action==='skill'&&s.team[s.active].energy<2));
    $('switchButton').disabled=animating||Boolean(quiz?.current)||s.status!=='playing'||s.team.filter(m=>m.hp>0).length<2;
    $('retreatButton').disabled=animating;
    $('commandState').textContent=animating?'RESOLVIENDO TURNO':waiting?'TU DECISIÓN':s.needsSwitch?'ELIGE UN RELEVO':'TU TURNO';
    $('commandPrompt').textContent=animating?'El encuentro sigue su curso…':waiting?'Responde para dar forma a tu estrategia.':s.needsSwitch?'Tu equipo necesita un nuevo compañero.':'Elige una acción y responde para ejecutarla.';
  }
  function log(message,turn){const li=document.createElement('li'),num=document.createElement('span');num.textContent=String(turn).padStart(2,'0');li.append(num,document.createTextNode(message));$('battleLog').prepend(li);while($('battleLog').children.length>30)$('battleLog').lastChild.remove();}
  function floatNumber(value,target='enemy',healing=false){const el=document.createElement('span');el.className='float-number'+(healing?' heal':'');el.textContent=typeof value==='number'?(healing?'+':'−')+value:String(value);el.style.setProperty('--x',target==='enemy'?'76%':'24%');el.style.setProperty('--y',target==='enemy'?'35%':'60%');$('arenaFx').append(el);setTimeout(()=>el.remove(),1000);}
  async function animate(event){
    const visual=['playerAttack','playerSkill','playerMiss','enemyAttack','guard','enemyCharge','enemyGuard','switch'];
    if(visual.includes(event.type)){
      tone(event.type==='playerMiss'?'guard':event.type==='enemyAttack'?'hurt':event.type==='playerSkill'?'skill':event.type==='guard'?'guard':'attack');
      const play=renderer?.play(event.type,event);await sleep(650);
      if(event.damage)floatNumber(event.damage,event.type==='enemyAttack'?'player':'enemy');
      if(event.type==='playerMiss')floatNumber('?', 'enemy');
      if(event.multiplier>1)floatNumber('VENTAJA ×1,25','enemy');
      if(event.absorbed)log('El escudo absorbe '+event.absorbed+' puntos.',event.snapshot.turn);
      if(play)await play;
    }else if(event.type==='echo'){floatNumber(event.damage,'enemy');await sleep(350);
    }else if(event.type==='phase'){
      $('phaseNotice').textContent='FASE '+event.snapshot.phase+' · EL SIGUIENTE SELLO';$('phaseNotice').hidden=false;
      leaderSay(event.snapshot.mission.phases[event.snapshot.phase-1].intro+' Mantén tu criterio y observa su próximo movimiento.','EL SELLO CAMBIA DE GUARDIÁN');tone('skill');await sleep(1200);$('phaseNotice').hidden=true;
    }
    renderBattle(event.snapshot);
    if(!['ready','win','loss'].includes(event.type))log(event.text,event.snapshot.turn);
  }
  async function perform(action,index,outcome){
    if(animating||!battle||(action!=='switch'&&!outcome))return;animating=true;updateCommands();
    try{
      const events=E.act(battle,action,index,outcome||{correct:true});
      for(const event of events)await animate(event);
      if(IS_LEAGUE&&battle.status==='playing'&&quiz.history.length>=30){battle.status='lost';log('Se agotaron las 30 preguntas del intento. Prepara otro equipo y vuelve a probar.',battle.turn);}
      renderBattle(battle);
      if(battle.status!=='playing'){await sleep(700);renderResult();setView('result');if(battle.status==='won')tone('win');}
    }catch(error){toast(error.message);}
    finally{animating=false;updateCommands();if(battle?.status==='playing'&&!battle.needsSwitch){const target=questionOrigin&&!questionOrigin.disabled?questionOrigin:document.querySelector('[data-action="attack"]');target?.focus({preventScroll:true});}}
    if(battle?.needsSwitch&&battle.status==='playing')openSwitch(true);
  }
  function stopClock(){clearInterval(clockTimer);clockTimer=null;}
  function hideQuestion(){if($('questionPanel').open)$('questionPanel').close();document.body.classList.remove('question-active');document.querySelector('.battle-main').classList.remove('question-open');}
  function resetQuestion(){stopClock();if(quiz)quiz.current=null;hideQuestion();}
  function timeoutOutcome(graded){
    if(!graded?.timedOut||animating)return;
    stopClock();const outcome=Q.consume(quiz);if(!outcome)return;
    for(const id of ['guideDialog','infoDialog','retreatDialog'])if($(id).open)$(id).close();
    hideQuestion();toast('Tiempo agotado. Tu acción falla y el rival continúa.');
    leaderSay('Se agotó el tiempo: la acción no se activó. '+graded.explain,'EL RIVAL TOMA LA INICIATIVA');
    perform(outcome.mode,undefined,outcome);
  }
  function tickClock(){
    if(!IS_LEAGUE||untimed||!quiz?.current||quiz.current.graded){stopClock();return;}
    const q=quiz.current,remaining=Q.remaining(quiz);if(remaining===null)return;
    const seconds=Math.ceil(remaining/1000),panel=$('questionClock');
    $('questionSeconds').textContent=seconds+' s';$('questionClockBar').style.width=Math.max(0,remaining/q.duration*100)+'%';panel.classList.toggle('urgent',seconds<=10);
    if(seconds<=10&&!q.announced){q.announced=true;$('clockAnnouncement').textContent='Quedan diez segundos para confirmar.';}
    if(remaining<=0)timeoutOutcome(Q.expire(quiz));
  }
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)tickClock();});
  window.addEventListener('focus',tickClock);
  function reconsiderQuestion(){if(!quiz?.current||quiz.current.graded||animating)return;hideQuestion();updateCommands();questionOrigin?.focus({preventScroll:true});}
  $('cancelQuestion').addEventListener('click',reconsiderQuestion);
  $('questionPanel').addEventListener('cancel',event=>{event.preventDefault();reconsiderQuestion();});
  if(IS_LEAGUE){
    $('questionPanel').classList.add('protected-question');
    for(const type of ['copy','cut','contextmenu','dragstart','selectstart'])$('questionPanel').querySelector('.question-content').addEventListener(type,e=>e.preventDefault());
  }
  function presentQuestion(action){
    if(animating||!battle||battle.status!=='playing'||battle.needsSwitch||quiz.current?.graded||$('questionPanel').open)return;
    if(action==='skill'&&battle.team[battle.active].energy<2)return;
    questionOrigin=document.querySelector('[data-action="'+action+'"]');
    const q=Q.present(quiz,action);if(!q){toast('Se agotaron las preguntas de este intento.');return;}q.mode=action;
    renderQuestion();tone();$('questionPanel').showModal();updateCommands();document.body.classList.add('question-active');$('questionPanel').querySelector('.question-content').scrollTop=0;$('questionStem').focus({preventScroll:true});
    if(IS_LEAGUE&&!untimed){const duration=q.seconds??M.questionSeconds;Q.arm(quiz,duration);$('questionClock').hidden=false;tickClock();if(!q.graded){stopClock();clockTimer=setInterval(tickClock,150);}}
    else if($('questionClock'))$('questionClock').hidden=true;
  }
  function renderQuestion(){
    const q=quiz.current;if(!q)return;
    document.querySelector('.battle-main').classList.add('question-open');$('questionPanel').classList.toggle('graded',q.graded);$('cancelQuestion').hidden=q.graded;$('resolveAnswer').hidden=!q.graded;
    const member=battle.team[battle.active];$('questionMatchup').textContent=member.name+' → '+battle.enemy.name+' · '+E.matchup(member,battle.enemy).label;
    $('questionOptions').hidden=q.graded;$('questionSelection').hidden=!q.graded;$('questionSelection').textContent=q.graded?(q.timedOut?'Tiempo agotado.':'Tu elección: '+q.options[q.selected]):'';
    $('questionTopic').textContent=q.topic;$('questionNumber').textContent='DECISIÓN '+String(quiz.history.length+(q.graded?0:1)).padStart(2,'0');
    $('questionAction').textContent={attack:'↗ PREPARANDO ATAQUE',skill:'✦ PREPARANDO HABILIDAD',guard:'⬡ PREPARANDO DEFENSA'}[q.mode];$('questionStem').textContent=q.stem;
    if($('questionStatements')){$('questionStatements').hidden=!q.statements?.length;$('questionStatements').innerHTML=(q.statements||[]).map(text=>'<li>'+escape(text)+'</li>').join('');}
    $('questionFigure').hidden=!q.figure;
    $('questionFigure').replaceChildren();
    if(q.figure==='ratios')$('questionFigure').innerHTML='<div class="data-card"><span>REGISTRO DEL ENSAYO</span><div><b>Grupo A</b><strong>12 <small>de 20</small></strong></div><div><b>Grupo B</b><strong>18 <small>de 40</small></strong></div></div>';
    else if(q.figure?.src){const img=document.createElement('img');img.src=q.figure.src;img.alt=q.figure.alt;img.style.cssText='max-width:100%;max-height:220px;object-fit:contain';$('questionFigure').append(img);}
    $('questionOptions').innerHTML=q.options.map((option,i)=>`<button class="question-option ${q.selected===i?'selected':''} ${q.graded&&q.answer===i?'correct':''} ${q.graded&&!q.correct&&q.selected===i?'incorrect':''}" data-option="${i}" aria-pressed="${q.selected===i}" ${q.graded?'disabled':''}><span>${String.fromCharCode(65+i)}</span><b>${escape(option)}</b>${q.graded&&q.answer===i?'<i>✓</i>':''}</button>`).join('');
    $('questionOptions').querySelectorAll('[data-option]').forEach(button=>button.addEventListener('click',()=>{if(Q.choose(quiz,Number(button.dataset.option))){renderQuestion();$('questionOptions').querySelector('[data-option="'+button.dataset.option+'"]').focus({preventScroll:true});tone();}}));
    if(IS_LEAGUE){let watermark=$('questionWatermark');if(!watermark){watermark=document.createElement('small');watermark.id='questionWatermark';watermark.className='question-watermark';$('questionPanel').querySelector('.question-content').append(watermark);}watermark.textContent=(demo?'PREPARACIÓN DOCENTE':session?.name||'BioDex')+' · '+M.title+' · '+q.id;}
    $('confirmAnswer').hidden=q.graded;$('confirmAnswer').disabled=q.selected===null||q.graded;
    $('answerFeedback').hidden=!q.graded;
    if(q.graded){
      $('answerFeedback').classList.toggle('needs-review',!q.correct);$('feedbackTitle').textContent=q.correct?'✦ Decisión bien fundamentada':'◇ Una oportunidad para revisar';
      $('feedbackExplanation').textContent=q.explain;$('feedbackAnswer').textContent=q.correct?'Tu respuesta activa la estrategia elegida.':'Respuesta mejor respaldada: '+q.options[q.answer];
      $('resolveAnswer').innerHTML=q.correct?'Ejecutar '+({attack:'ataque',skill:'habilidad',guard:'defensa'}[q.mode])+' <span>→</span>':'Continuar y observar al rival <span>→</span>';
    }
  }
  $('confirmAnswer').addEventListener('click',()=>{
    const graded=Q.grade(quiz);if(!graded)return;if(graded.timedOut){timeoutOutcome(graded);return;}stopClock();renderQuestion();updateCommands();$('learningCount').textContent=quiz.history.filter(x=>x.correct).length+' / '+quiz.history.length;
    leaderSay(graded.correct?'Tu decisión tiene fundamento. Ahora deja que tu bioforma transforme esa idea en acción.':'La señal no se ha estabilizado. Revisa la explicación: entender el error también forma parte de la travesía.',graded.correct?'EL VÍNCULO RESPONDE':'PAUSA PARA COMPRENDER',graded.correct);
    $('questionPanel').querySelector('.question-content').scrollTop=0;$('resolveAnswer').focus({preventScroll:true});
  });
  $('resolveAnswer').addEventListener('click',()=>{
    if(animating)return;const outcome=Q.consume(quiz);if(!outcome)return;resetQuestion();
    perform(outcome.mode,undefined,outcome);
  });
  document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>presentQuestion(b.dataset.action)));
  function openSwitch(forced=false){
    if(animating||!battle||quiz?.current)return;forcedSwitch=forced;$('switchClose').hidden=forced;
    $('switchHint').textContent=forced?'Elige un compañero que siga en pie. Este relevo no consume otro turno.':'Cambiar consume tu turno. Elige con cuidado.';
    $('switchOptions').innerHTML=battle.team.map((m,i)=>`<button class="switch-choice" data-switch="${i}" ${i===battle.active||m.hp<=0?'disabled':''}><canvas data-pixel-id="${m.id}" width="64" height="64" aria-hidden="true"></canvas><span><b>${escape(m.name)}</b><small>${m.hp<=0?'Necesita descansar':i===battle.active?'Ya está en campo':m.hp+' / '+m.maxHp+' de vida · '+escape(m.role)}</small></span></button>`).join('');
    $('switchOptions').querySelectorAll('[data-switch]').forEach(b=>b.addEventListener('click',()=>{closeDialog('switchDialog');forcedSwitch=false;perform('switch',Number(b.dataset.switch));}));window.PixelArt.paintAll($('switchOptions'));openDialog('switchDialog');
  }
  $('switchButton').addEventListener('click',()=>openSwitch(battle?.needsSwitch||false));
  $('retreatButton').addEventListener('click',()=>{if(!animating)openDialog('retreatDialog');});
  $('confirmRetreat').addEventListener('click',()=>{closeDialog('retreatDialog');resetQuestion();quiz=null;battle=null;displayState=null;renderTeam();setView('team');});
  function statementList(q){return q.statements?.length?'<ol class="question-statements">'+q.statements.map(s=>'<li>'+escape(s)+'</li>').join('')+'</ol>':'';}
  function renderLegacyResult(){
    const won=battle.status==='won',standing=battle.team.filter(m=>m.hp>0).length;
    $('resultView').innerHTML=`<div class="result-wrap"><div class="result-emblem"><span>${won?'✦':'◇'}</span></div><div class="eyebrow gold">${won?'MISIÓN COMPLETADA':'UNA PAUSA EN EL CAMINO'}</div><h2>${won?'El Umbral se abre.':'Toda aventura enseña.'}</h2><p>${won?'Iria reconoce el vínculo de tu equipo. Las aguas se aquietan y el último sello comienza a brillar.':'Tu equipo necesita descansar. Observa las señales de la corriente, combina tus habilidades y vuelve a intentarlo.'}</p><div class="result-stats"><span><b>${battle.turn}</b>TURNOS</span><span><b>${standing} / ${battle.team.length}</b>EN PIE</span><span><b>${battle.phase} / 2</b>FASES</span></div>${won?'<div class="reward-box"><span class="reward-icon">◈</span><div><span class="tiny-label">RECOMPENSA DE ENSAYO</span><h3>Emblema del Umbral</h3><p>Una muestra de cómo recibirías el premio de esta misión. Este emblema pertenece a la partida de prueba.</p><button class="text-button" id="claimReward">Recibir emblema de ensayo →</button><p id="claimMessage" hidden></p></div></div>':''}<div class="result-actions"><button class="button primary" id="retryButton">Preparar otro equipo <span>→</span></button><a class="button secondary" href="${window.BIODEX_CONFIG.homeUrl}" target="_blank" rel="noopener noreferrer">Volver a mi BioDex <span>↗</span></a></div><p class="result-note">${won?'Para una recompensa real, el docente puede entregarte un código de una bioforma existente. Se canjea en el escáner de BioDex.':'Tus bioformas de BioDex conservan sus capturas. Cada nuevo intento empieza con el equipo recuperado.'}</p></div>`;
    const review=document.createElement('section');review.className='learning-review';
    const missed=[...new Set(quiz.history.filter(x=>!x.correct).map(x=>x.id))];
    review.innerHTML='<div class="eyebrow">LO QUE TE LLEVAS DE ESTE ENCUENTRO</div><h3>'+quiz.history.filter(x=>x.correct).length+' de '+quiz.history.length+' decisiones fundamentadas</h3><p>Banco de ensayo: lectura crítica y evidencias. Este resultado pertenece a la preview.</p>'+(missed.length?missed.map(id=>{const q=quiz.bank.find(x=>x.id===id);return '<details><summary>'+escape(q.topic)+'</summary><p>'+escape(q.stem)+'</p>'+statementList(q)+'<b>'+escape(q.options[q.answer])+'</b><p>'+escape(q.explain)+'</p></details>';}).join(''):'<p class="review-complete">✦ Todas tus respuestas estuvieron bien fundamentadas.</p>');
    $('resultView').querySelector('.result-actions').before(review);
    $('retryButton').addEventListener('click',()=>{battle=null;displayState=null;resetQuestion();quiz=null;renderTeam();setView('team');});
    $('claimReward')?.addEventListener('click',()=>{const b=$('claimReward');b.disabled=true;b.textContent='✓ Emblema recibido en esta partida';b.classList.add('reward-claimed');$('claimMessage').hidden=false;$('claimMessage').textContent='La preview no guarda este emblema en tu cuenta.';tone('win');});
  }
  function renderResult(){
    if(!IS_LEAGUE){renderLegacyResult();return;}
    stopClock();const won=battle.status==='won',standing=battle.team.filter(m=>m.hp>0).length;
    const eligible=!M.preview&&window.BioDexLeague.rewardEligible({won,demo,bank:BANK,slug:M.slug});
    let saved=false;if(won)try{saved=window.BioDexLeague.markWin(localStorage,demo?'ensayo':session?.name,M.slug,BANK.version,eligible?'challenge':'trial');}catch(_){}
    const rewardCards=won?'<div class="reward-codes">'+M.rewards.map(r=>'<article class="reward-code" id="reward-'+r.id+'"><img src="assets/cutouts/'+r.id+'.png" alt=""><b>'+escape(r.name)+'</b><small class="reward-status" role="status">'+(eligible?'Preparando el canje…':'Recompensa de este encuentro. No se guarda durante la preparación docente.')+'</small>'+(eligible?'<button class="text-button claim-bio" data-reward="'+r.id+'">Canjear '+escape(r.name)+'</button>':'')+'</article>').join('')+'</div>':'';
    const missed=[...new Set(quiz.history.filter(x=>!x.correct).map(x=>x.id))];
    $('resultView').innerHTML='<div class="result-wrap"><div class="result-emblem"><span>'+(won?'✦':'◇')+'</span></div><div class="eyebrow gold">'+escape(M.sector)+'</div><h2>'+escape(won?M.emblem+' conseguido.':'El territorio te espera.')+'</h2><p>'+escape(won?M.leader+' reconoce la estrategia de tu equipo. El siguiente camino queda abierto.':'Tu equipo necesita descansar. Revisa las explicaciones y prepara otra combinación.')+'</p><div class="result-stats"><span><b>'+quiz.history.filter(x=>x.correct).length+' / '+quiz.history.length+'</b>ACIERTOS</span><span><b>'+quiz.history.filter(x=>x.timedOut).length+'</b>TIEMPOS AGOTADOS</span><span><b>'+standing+' / '+battle.team.length+'</b>EN PIE</span></div>'+rewardCards+(eligible?'<div class="reward-claim-summary"><p id="rewardSummary" role="status" aria-live="polite">Guardando tus cuatro recompensas en BioDex…</p><button class="button primary" id="claimAll">Canjear las cuatro bioformas →</button></div>':'')+(saved?'<p class="result-note">El sello quedó registrado en este navegador.</p>':'')+'<section class="learning-review"><div class="eyebrow">EL REGISTRO DEL ENCUENTRO</div><h3>Decisiones que puedes revisar.</h3>'+missed.map(id=>{const q=quiz.bank.find(x=>x.id===id);return '<details><summary>'+escape(q.topic)+'</summary><p>'+escape(q.stem)+'</p>'+statementList(q)+'<b>'+escape(q.options[q.answer])+'</b><p>'+escape(q.explain)+'</p></details>';}).join('')+(missed.length?'':'<p>Todas tus respuestas estuvieron bien fundamentadas.</p>')+'</section><div class="result-actions"><button class="button primary" id="retryButton">Preparar otro equipo →</button><a class="button secondary" id="returnLeague" href="index.html">Volver a la liga →</a></div><a id="viewCollection" class="league-result-link" href="'+escape(window.BIODEX_CONFIG.homeUrl)+'">Ver mis bioformas en BioDex →</a></div>';
    let claiming=false;
    $('retryButton').addEventListener('click',()=>{if(claiming)return;battle=null;displayState=null;resetQuestion();quiz=null;renderTeam();setView('team');});
    if(!eligible)return;
    function paintClaims(states){
      let confirmed=0;for(const reward of M.rewards){const state=states[reward.id],card=$('reward-'+reward.id);card.dataset.status=state.status;card.querySelector('.reward-status').textContent=state.message;const button=card.querySelector('button');button.disabled=claiming||state.status==='claimed';button.textContent=state.status==='claimed'?'✓ En tu BioDex':state.status==='error'?'Reintentar canje':'Canjear '+reward.name;if(state.status==='claimed')confirmed++;}
      $('claimAll').disabled=claiming||confirmed===4;$('claimAll').textContent=confirmed===4?'✓ Cuatro bioformas en tu BioDex':'Reintentar premios pendientes →';
      $('rewardSummary').textContent=confirmed===4?'¡Tus cuatro recompensas están guardadas en BioDex!':claiming?'Guardando recompensas en BioDex… '+confirmed+' / 4 confirmadas.':confirmed+' / 4 confirmadas. Reintenta las pendientes antes de salir.';
      $('retryButton').disabled=claiming;for(const id of ['returnLeague','viewCollection']){$(id).setAttribute('aria-disabled',String(claiming));$(id).classList.toggle('claim-wait',claiming);}
    }
    const rewards=window.BioDexRewards.create({account,gym:M,bank:BANK,won,demo,onUpdate:paintClaims});
    async function claimRewards(id){if(claiming)return;claiming=true;paintClaims(rewards.snapshot());try{await rewards.claim(id);owned=collectionFrom({progreso:account.progress});}catch(error){toast(error.message);}finally{claiming=false;paintClaims(rewards.snapshot());}}
    document.querySelectorAll('[data-reward]').forEach(button=>button.addEventListener('click',()=>claimRewards(button.dataset.reward)));
    $('claimAll').addEventListener('click',()=>claimRewards());
    for(const id of ['returnLeague','viewCollection'])$(id).addEventListener('click',event=>{if(claiming){event.preventDefault();toast('Espera la confirmación de tus capturas.');}});
    // Solo se inicia tras una victoria real con las 30 preguntas publicadas.
    claimRewards();
  }
  function renderGuide(){
    const query=$('guideSearch').value.trim().toLocaleLowerCase('es'),type=$('guideOpponent').value;
    const list=catalog.filter(b=>[b.name,b.type,E.combatant(b).role].join(' ').toLocaleLowerCase('es').includes(query));
    $('guideCount').textContent=list.length+' / 33 bioformas';
    $('guideCards').innerHTML=list.map(b=>{const m=E.combatant(b),match=E.matchup(b,{type});return `<details class="guide-bio"><summary><canvas data-pixel-id="${b.id}" width="75" height="75" aria-hidden="true"></canvas><span><b>${escape(b.name)}</b><small>${escape(b.type)} · ${m.role}</small><em>${match.label}</em></span><span class="guide-expand">+</span></summary><div class="guide-details"><div class="bio-combat-stats"><span>♥ Vida ${m.maxHp}</span><span>↗ Ataque ${m.attack}</span><span>⬡ Defensa ${Math.round(m.defense*100)} %</span></div><b>✦ ${escape(b.skill)}</b><p>${escape(E.skillDescription(m))}</p><b>◇ ${escape(m.passive.name)}</b><p>${escape(E.passiveDescription(m.passive))}</p><div class="facing-pair"><canvas data-pixel-id="${b.id}" width="100" height="100" aria-label="${escape(b.name)} hacia la derecha"></canvas><span>VS</span><canvas data-pixel-id="${b.id}" data-side="enemy" width="100" height="100" aria-label="${escape(b.name)} hacia la izquierda"></canvas></div></div></details>`;}).join('')||'<p>No hay coincidencias.</p>';
    window.PixelArt.paintAll($('guideCards'));
  }
  $('atlasButton').addEventListener('click',()=>{renderGuide();openDialog('guideDialog');});
  $('guideSearch').addEventListener('input',renderGuide);$('guideOpponent').addEventListener('change',renderGuide);
  async function init(){
    renderer=new window.PixelBattleRenderer($('battleCanvas'));window.PixelArt.paintAll();
    $('loginButton').disabled=true;$('demoButton').disabled=true;
    try{const response=await fetch('catalog.json');if(!response.ok)throw new Error();catalog=await response.json();if(!Array.isArray(catalog)||catalog.length!==33)throw new Error();$('loginButton').disabled=false;$('demoButton').disabled=false;
      if(IS_LEAGUE&&!M.preview){try{const data=await withLoading(()=>account.restore());if(data){session=account.session;owned=collectionFrom(data);selected=[];demo=false;enterWithAccount();}}catch(error){$('loginError').textContent=error.message;}}
    }
    catch(_){$('loginError').textContent='No se pudo preparar el catálogo de la misión. Recarga la página.';}
  }
  init();
})();
