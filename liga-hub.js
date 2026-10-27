(async()=>{
 'use strict';
 const $=id=>document.getElementById(id),G=window.BioDexGyms,L=window.BioDexLeague;
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const storage={getItem:k=>localStorage.getItem(k),setItem:(k,v)=>localStorage.setItem(k,v)};
 const account=window.BioDexAccount.create({config:window.BIODEX_CONFIG,fetch:window.fetch.bind(window),storage:{getItem:k=>sessionStorage.getItem(k),setItem:(k,v)=>sessionStorage.setItem(k,v),removeItem:k=>sessionStorage.removeItem(k)}});
 const access=window.BioDexAccess.create({storage,gyms:G.GYMS});
 let busy=false,results=[];
 function render(){
  const name=account.session?.name,p=account.progress;
  $('hubLoginForm').hidden=Boolean(name);$('accountActions').hidden=!name;
  $('accountStatus').textContent=name?name+' · '+p.capturadas.length+' bioformas en tu colección.':'Ingresa con el mismo nombre y clave de BioDex.';
  $('activateGym').disabled=!name||busy;
  const progress=name?L.readProgress(storage,name):{};
  $('routeProgress').textContent=name?G.GYMS.filter(g=>progress[g.slug]?.mode==='challenge').length+' / 5 sellos conseguidos':'Cinco sellos por descubrir.';
  $('gymCards').innerHTML=G.GYMS.map((g,i)=>{
   const check=results[i]?.status==='fulfilled'?results[i].value:null,ready=check?.ready,unlocked=access.isUnlocked(name,g.slug),done=progress[g.slug]?.mode==='challenge';
   const status=!name||!unlocked?'POR ACTIVAR':!ready?'ACTIVIDAD PRÓXIMAMENTE':done?'SELLO CONSEGUIDO':'GIMNASIO ACTIVO';
   const action=!name?'<button class="button secondary" data-connect>Conectar mi BioDex →</button>':!unlocked?'<button class="button secondary" data-activate>Ingresar código →</button>':ready?'<a class="button primary" href="combate.html?gym='+g.slug+'">Entrar al gimnasio →</a>':'<button class="button secondary" disabled>Actividad próximamente</button>';
   return '<article class="gym-card" id="gym-'+g.slug+'" style="--card-cover:url(\''+g.background+'\')"><div class="gym-card-cover"><span class="gym-card-order">0'+g.order+'</span><span class="gym-card-tag">'+status+'</span><div><small>'+escape(g.sector)+'</small><h2>'+escape(g.title)+'</h2></div></div><div class="gym-card-body"><div class="gym-leader"><span class="gym-leader-art '+(g.portraitSheet?'sheet':'')+'" style="background-image:url(\''+g.portrait+'\')"></span><div><b>'+escape(g.leader)+'</b><small>'+escape(g.leaderTitle)+'</small></div><span class="gym-emblem" title="'+escape(g.emblem)+'">◇</span></div><p>'+escape(g.summary)+'</p><div class="gym-card-info"><span>30 preguntas</span><span>2 fases · 45 s por pregunta</span></div><div class="gym-reward-preview"><small>4 BIOFORMAS AL VENCER</small><div>'+g.rewards.map(r=>'<span><img src="assets/cutouts/'+r.id+'.png" alt="" loading="lazy"><b>'+escape(r.name)+'</b></span>').join('')+'</div></div>'+action+'<small class="gym-card-footnote">'+(!check?'No se pudo consultar la actividad. Recarga la página.':!ready?'Tu docente anunciará la apertura de la actividad.':'Las recompensas se canjean aquí y se guardan en tu BioDex.')+'</small></div></article>';
  }).join('');
  document.querySelectorAll('[data-connect]').forEach(b=>b.addEventListener('click',()=>$('hubName').focus()));
  document.querySelectorAll('[data-activate]').forEach(b=>b.addEventListener('click',()=>$('entryCode').focus()));
 }
 async function task(callback){if(busy)return;busy=true;document.querySelectorAll('button').forEach(b=>b.disabled=true);$('accountError').textContent='';try{await callback();}catch(error){$('accountError').textContent=error.message;}finally{busy=false;render();$('hubLogin').disabled=false;$('refreshAccount').disabled=false;$('logoutAccount').disabled=false;}}
 $('hubLoginForm').addEventListener('submit',event=>{event.preventDefault();const name=$('hubName').value.trim().replace(/\s+/g,' '),pin=$('hubPin').value;$('hubPin').value='';if(name.length<2||!/^\d{6}$/.test(pin)){$('accountError').textContent='Escribe tu nombre y una clave de seis dígitos.';return;}task(async()=>{$('accountStatus').textContent='Recuperando tu colección de BioDex…';await account.login(name,pin);});});
 $('refreshAccount').addEventListener('click',()=>task(async()=>{await account.load();}));
 $('logoutAccount').addEventListener('click',()=>task(async()=>{await account.logout();}));
 $('entryForm').addEventListener('submit',event=>{event.preventDefault();if(busy)return;try{const {gym,saved}=access.activate(account.session?.name,$('entryCode').value);$('entryCode').value='';$('entryMessage').textContent=gym.title+' activado.'+(!results[G.GYMS.indexOf(gym)]?.value?.ready?' Tu docente anunciará la apertura de la actividad.':' Ya puedes entrar a combatir.')+(!saved?' Conserva el código para tu próxima visita.':'');render();$('gym-'+gym.slug).scrollIntoView({behavior:'smooth',block:'center'});}catch(error){$('entryMessage').textContent=error.message;}});
 const banks=Promise.allSettled(G.GYMS.map(async g=>{const r=await fetch(g.bankUrl);if(!r.ok)throw Error(g.slug);const check=L.validateBank(await r.json(),g.slug);if(!check.valid)throw Error(check.errors.join(' '));return check;}));
 await task(async()=>{await account.restore();});results=await banks;render();
 if(results.some(r=>r.status==='rejected'))$('hubError').textContent='No se pudo consultar una actividad. Recarga la página para volver a intentar.';
})();
