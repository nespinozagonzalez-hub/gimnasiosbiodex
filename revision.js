(()=>{
 'use strict';
 const $=id=>document.getElementById(id),G=window.BioDexGyms,L=window.BioDexLeague;
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let bank=null,dirty=false,loadedSlug=null,loadId=0,editingIndex=0;
 const cache=new Map();
 $('reviewGym').innerHTML=G.GYMS.map(g=>'<option value="'+g.slug+'">0'+g.order+' · '+escape(g.title)+'</option>').join('');
 $('reviewSlot').innerHTML=Array.from({length:30},(_,i)=>'<option value="'+i+'">Espacio '+String(i+1).padStart(2,'0')+'</option>').join('');
 const message=text=>$('reviewMessage').textContent=text;
 function render(){if(!bank)return;editingIndex=Number($('reviewSlot').value);const q=bank.questions[editingIndex];$('editingId').textContent=q.id;$('editTopic').value=q.topic;$('editStem').value=q.stem;for(let i=0;i<4;i++)$('editOption'+i).value=q.options[i];$('editAnswer').value=q.answer;$('editSeconds').value=q.seconds||45;$('editExplain').value=q.explain;$('editReady').checked=q.placeholder===false;$('bankStatus').value=bank.status;$('reviewCount').textContent=bank.questions.filter(x=>x.placeholder===false).length+' / 30 definitivas';dirty=false;}
 async function load(){
  const slug=$('reviewGym').value,gym=G.get(slug),requestId=++loadId;
  try{
   const next=cache.has(slug)?cache.get(slug):await(async()=>{const r=await fetch(gym.bankUrl);if(!r.ok)throw Error('No se pudo abrir el banco.');return r.json();})();
   if(requestId!==loadId)return;
   const check=L.validateBank(next,slug);if(!check.valid)throw Error(check.errors.join(' '));bank=next;loadedSlug=slug;cache.set(slug,bank);$('reviewSlot').value='0';render();message('Banco cargado. Los cambios se conservan durante esta sesión de edición.');$('reviewPlay').href='combate.html?gym='+slug;
   $('reviewRewards').innerHTML='<div class="eyebrow gold">'+escape(gym.sector)+'</div><h3>'+escape(gym.emblem)+'</h3><p>Cuatro códigos de captura existentes. Se muestran tras una victoria con cuenta real y banco publicado. El ensayo solo muestra simulaciones.</p><table><thead><tr><th>Bioforma</th><th>Código</th></tr></thead><tbody>'+gym.rewards.map(r=>'<tr><td>'+escape(r.name)+'</td><td><code>'+escape(r.code)+'</code></td></tr>').join('')+'</tbody></table><p>Estos códigos pueden compartirse. Esta página de preparación es pública.</p>';
  }catch(e){message(e.message);}
 }
 function save(redraw=true){
  if(!bank)return false;
  const i=editingIndex,q={...bank.questions[i],topic:$('editTopic').value.trim(),stem:$('editStem').value.trim(),options:Array.from({length:4},(_,j)=>$('editOption'+j).value.trim()),answer:Number($('editAnswer').value),explain:$('editExplain').value.trim(),seconds:Number($('editSeconds').value),placeholder:!$('editReady').checked};
  const candidate={...bank,status:'draft',questions:bank.questions.map((x,j)=>j===i?q:x)},check=L.validateBank(candidate,bank.gym);
  if(!check.valid){message(check.errors.join(' '));return false;}
  bank.questions[i]=q;if(bank.questions.some(x=>x.placeholder!==false))bank.status='draft';dirty=false;if(redraw)render();message('Espacio guardado. Descarga el banco para conservar estos cambios.');return true;
 }
 $('questionEditor').addEventListener('input',()=>dirty=true);
 $('questionEditor').addEventListener('submit',e=>{e.preventDefault();save();});
 $('reviewSlot').addEventListener('change',()=>{if(dirty&&!save(false)){$('reviewSlot').value=String(editingIndex);return;}render();message('Editando el espacio seleccionado.');});
 $('reviewGym').addEventListener('change',()=>{if(dirty&&!save(false)){$('reviewGym').value=loadedSlug;return;}load();});
 $('bankStatus').addEventListener('change',()=>{if(!bank)return;const candidate={...bank,status:$('bankStatus').value},check=L.validateBank(candidate,bank.gym);if(!check.valid){$('bankStatus').value=bank.status;message(check.errors.join(' '));return;}bank.status=candidate.status;message(bank.status==='published'?'Banco listo para publicarse al reemplazar su archivo JSON.':'Banco en borrador: recompensas simuladas.');});
 $('downloadBank').addEventListener('click',()=>{if(!bank)return;if(dirty&&!save())return;const check=L.validateBank(bank,loadedSlug);if(!check.valid){message(check.errors.join(' '));return;}const url=URL.createObjectURL(new Blob([JSON.stringify(bank,null,2)+'\n'],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=bank.gym+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message('Banco descargado. Reemplaza bancos/liga/'+bank.gym+'.json en el repositorio para publicarlo.');});
 $('importBank').addEventListener('change',async()=>{const file=$('importBank').files[0];if(!file)return;try{if(file.size>500000)throw Error('El banco supera el tamaño esperado.');const data=JSON.parse(await file.text()),slug=$('reviewGym').value,check=L.validateBank(data,slug);if(!check.valid)throw Error(check.errors.join(' '));bank=data;loadedSlug=slug;cache.set(slug,bank);render();message('Banco importado y validado. Puedes revisarlo y descargarlo.');}catch(e){message(e.message||'Archivo no válido.');}finally{$('importBank').value='';}});
 window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
 load();
})();
