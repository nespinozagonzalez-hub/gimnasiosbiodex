(async()=>{
 'use strict';
 const slug=new URLSearchParams(location.search).get('gym');
 const gym=window.BioDexGyms.get(slug);
 const error=message=>{document.getElementById('loginError').textContent=message;document.getElementById('loginButton').disabled=true;document.getElementById('demoButton').disabled=true;};
 if(!gym){error('Elige uno de los cinco gimnasios en «La liga».');return;}
 try{
  const response=await fetch(gym.bankUrl,{cache:'no-store'});if(!response.ok)throw Error('No se pudo abrir el banco del gimnasio.');
  const bank=await response.json(),check=window.BioDexLeague.validateBank(bank,slug);
  if(!check.valid)throw Error(check.errors.join(' '));
  const preview=new URLSearchParams(location.search).get('preview')==='1';
  window.BioDexMission={...gym,bank,preview};
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
  document.querySelector('.enemy-intel .bank-note').textContent='Contenido: '+gym.subject;
  document.querySelector('.mission-chips').innerHTML='<span>◆ Preguntas + estrategia</span><span>◇ 4 bioformas de premio</span><span>◷ 45 s por pregunta</span>';
  document.getElementById('missionStatus').textContent=preview?'PREPARACIÓN DOCENTE · recompensas desactivadas':check.ready?'DESAFÍO ACTIVO · 30 preguntas':'ACTIVIDAD PRÓXIMAMENTE';
  document.querySelector('.practice-setting').hidden=!preview;
  for(const id of ['previewDivider','demoButton','previewNote'])document.getElementById(id).hidden=!preview;
  document.getElementById('loginForm').hidden=preview;
  document.querySelector('#infoDialog .help-note p').textContent='La colección se carga desde tu cuenta de BioDex. Al vencer, las cuatro recompensas se canjean y guardan en esa misma cuenta. Si la conexión falla, puedes reintentar cada captura. El reloj continúa al cambiar de estrategia o pestaña; al agotarse falla la acción.';
  const script=document.createElement('script');script.src='app.js?v=6';script.onerror=()=>error('No se pudo preparar el combate. Recarga la página.');document.body.append(script);
 }catch(e){error(e.message||'No se pudo preparar el gimnasio.');}
})();
