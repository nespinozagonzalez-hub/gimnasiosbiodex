(function(root){
 'use strict';
 const BANK_SIZE=30;
 function validateBank(bank,slug){
  const errors=[];
  if(!bank||bank.gym!==slug)errors.push('El banco no corresponde a este gimnasio.');
  if(!['draft','published'].includes(bank?.status))errors.push('El estado debe ser draft o published.');
  if(!Number.isInteger(bank?.version)||bank.version<1)errors.push('La versión debe ser un entero positivo.');
  if(!Array.isArray(bank?.questions)||bank.questions.length!==BANK_SIZE)errors.push('Se necesitan exactamente 30 preguntas.');
  const ids=new Set();
  for(const [i,q] of (bank?.questions||[]).entries()){
   if(!q||typeof q.id!=='string'||!q.id||ids.has(q.id))errors.push('ID inválido o repetido en pregunta '+(i+1));else ids.add(q.id);
   if(!q||['topic','stem','explain'].some(k=>typeof q[k]!=='string'||!q[k].trim())||!Array.isArray(q.options)||q.options.length!==4||q.options.some(x=>typeof x!=='string'||!x.trim())||new Set(q.options).size!==4||!Number.isInteger(q.answer)||q.answer<0||q.answer>3)errors.push('Contenido incompleto en pregunta '+(i+1));
   if(q?.seconds!==undefined&&(!Number.isFinite(q.seconds)||q.seconds<5||q.seconds>600))errors.push('Tiempo inválido en pregunta '+(i+1));
   if(q?.figure&&!(q.figure==='ratios'||typeof q.figure==='object'&&typeof q.figure.src==='string'&&/^imagenes\/[A-Za-z0-9_./-]+\.(png|webp|jpe?g|svg)$/.test(q.figure.src)&&!q.figure.src.includes('..')&&typeof q.figure.alt==='string'))errors.push('Imagen inválida en pregunta '+(i+1));
  }
  if(bank?.status==='published'&&bank?.questions?.some(q=>q.placeholder!==false))errors.push('No se puede publicar con preguntas de ensayo.');
  return {valid:errors.length===0,errors,ready:errors.length===0&&bank.status==='published'&&bank.questions.every(q=>q.placeholder===false)};
 }
 function rewardEligible({won,demo,bank,slug}){return won===true&&demo===false&&validateBank(bank,slug).ready;}
 function progressKey(player){return 'biodex.liga.v1.'+encodeURIComponent(String(player||'ensayo').trim().normalize('NFC').toLocaleLowerCase('es'));}
 function readProgress(storage,player){try{const data=JSON.parse(storage.getItem(progressKey(player))||'{}');return data&&typeof data==='object'&&!Array.isArray(data)?data:{};}catch(_){return {};}}
 function markWin(storage,player,gym,version,mode='trial'){
  const data=readProgress(storage,player);data[gym]={version,mode,date:new Date().toISOString()};
  try{storage.setItem(progressKey(player),JSON.stringify(data));return true;}catch(_){return false;}
 }
 const api={BANK_SIZE,validateBank,rewardEligible,readProgress,markWin};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.BioDexLeague=api;
})(typeof window!=='undefined'?window:this);
