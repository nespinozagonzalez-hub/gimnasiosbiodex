(async()=>{
 'use strict';
 const slug=new URLSearchParams(location.search).get('gym');
 const gym=window.BioDexGyms.get(slug);
 const error=message=>{document.getElementById('loginError').textContent=message;document.getElementById('loginButton').disabled=true;document.getElementById('demoButton').disabled=true;};
 if(!gym){error('Elige uno de los cinco gimnasios en «La liga».');return;}
 try{
  const response=await fetch(gym.bankUrl);if(!response.ok)throw Error('No se pudo abrir el banco del gimnasio.');
  const bank=await response.json(),check=window.BioDexLeague.validateBank(bank,slug);
  if(!check.valid)throw Error(check.errors.join(' '));
  window.BioDexMission={...gym,bank};
  document.title='BioDex · '+gym.title;
  document.body.dataset.gym=slug;
  document.documentElement.style.setProperty('--gym-background',`url("${gym.background}")`);
  document.documentElement.style.setProperty('--gym-portrait',`url("${gym.portrait}")`);
  document.body.classList.toggle('portrait-single',!gym.portraitSheet);
  document.querySelector('.welcome-copy h1').textContent=gym.title;
  document.querySelector('.welcome-copy .intro').textContent=gym.summary;
  document.querySelector('.welcome-copy > .eyebrow').textContent=gym.sector.toUpperCase();
  document.querySelector('.mission-topline > span').textContent='LIGA DE LOS CINCO SELLOS / '+String(gym.order).padStart(2,'0');
  document.querySelector('.hero-creature canvas').dataset.pixelId=gym.phases[0].id;
  document.querySelector('.hero-creature canvas').setAttribute('aria-label',gym.phases[0].name+', bioforma del líder');
  document.querySelector('.creature-caption b').textContent=gym.phases[0].name;
  document.querySelector('.creature-caption span').textContent=gym.sector+' · FASE I';
  document.querySelector('.leader-quote b').textContent=gym.leader+' · '+gym.leaderTitle;
  document.querySelector('.mission-map > span').textContent='DESTINO / '+gym.sector.toUpperCase();
  document.querySelector('.collection-area > .eyebrow').textContent='PREPARACIÓN / '+gym.title.toUpperCase();
  document.querySelector('.battle-topline .eyebrow').textContent=gym.title.toUpperCase();
  document.querySelector('.battle-topline h2').textContent=gym.leader+', '+gym.leaderTitle.toLowerCase();
  document.querySelector('.story-location > .eyebrow').textContent=gym.sector.toUpperCase();
  document.querySelector('.story-topline > .eyebrow').textContent=gym.title.toUpperCase()+' / PRÓLOGO';
  document.querySelector('.story-companion').dataset.pixelId=gym.phases[0].id;
  document.querySelectorAll('.dialogue-meta > b').forEach(e=>e.textContent=gym.leader.toUpperCase());
  document.querySelectorAll('#storyPortrait,#battlePortrait').forEach(e=>e.setAttribute('aria-label',gym.leader));
  document.querySelector('.enemy-intel .intel-facts').innerHTML='<span>2 fases</span><span>Banco de 30 preguntas</span>';
  document.querySelector('.enemy-intel .bank-note').textContent=check.ready?'Contenido: '+gym.subject:'Maqueta: 30 espacios reemplazables. Los premios se simulan.';
  document.querySelector('.mission-chips').innerHTML='<span>◆ Preguntas + estrategia</span><span>◇ 4 bioformas de premio</span><span>◷ 45 s por pregunta</span>';
  document.getElementById('missionStatus').textContent=check.ready?'DESAFÍO ACTIVO · 30 preguntas':'MAQUETA · 30 espacios de ensayo · premios simulados';
  document.querySelector('.practice-setting').hidden=check.ready;
  document.querySelector('#infoDialog .help-note p').textContent='La colección se consulta con tu cuenta actual. Al publicar las 30 preguntas, ganar con una cuenta real permite ver cuatro códigos de captura. Se canjean en BioDex. Los ensayos no entregan códigos reales. El reloj continúa al cambiar de estrategia o pestaña; al agotarse falla la acción. Una página web no puede impedir las capturas de pantalla.';
  const script=document.createElement('script');script.src='app.js?v=3';script.onerror=()=>error('No se pudo preparar el combate. Recarga la página.');document.body.append(script);
 }catch(e){error(e.message||'No se pudo preparar el gimnasio.');}
})();
