(function(root){
 'use strict';
 const league=typeof module==='object'&&module.exports?require('./league.js'):root.BioDexLeague;
 function create({account,gym,bank,won,demo,onUpdate=()=>{}}){
  let pending=null;
  const owner=account.session?.name;
  const states=new Map(gym.rewards.map(r=>[r.id,{status:'pending',message:'Disponible para canjear.'}]));
  const snapshot=()=>Object.fromEntries([...states].map(([id,value])=>[id,{...value}]));
  function claim(onlyId){
   if(pending)return pending;
   if(!league.rewardEligible({won,demo,bank,slug:gym.slug})||!owner||account.session?.name!==owner)return Promise.reject(Error('Esta partida no habilita recompensas para esta cuenta.'));
   if(onlyId&&!states.has(onlyId))return Promise.reject(Error('Esa recompensa no pertenece al gimnasio.'));
   pending=(async()=>{
    for(const reward of gym.rewards){
     if(onlyId&&reward.id!==onlyId||states.get(reward.id).status==='claimed')continue;
     states.set(reward.id,{status:'saving',message:'Guardando en BioDex…'});onUpdate(snapshot());
     try{
      const data=await account.redeem(reward.code);
      if(data.kind!=='capture'||data.bioforma!==reward.id||!data.progreso.capturadas.includes(reward.id))throw Error('BioDex no confirmó esta captura. Reintenta.');
      states.set(reward.id,{status:'claimed',message:data.duplicate?'Ya estaba en tu BioDex.':'¡Añadida a tu BioDex!'});
     }catch(error){states.set(reward.id,{status:'error',message:error.message});}
     onUpdate(snapshot());
    }
    return snapshot();
   })().finally(()=>{pending=null;});
   return pending;
  }
  return {claim,snapshot,get busy(){return Boolean(pending);}};
 }
 const api={create};if(typeof module==='object'&&module.exports)module.exports=api;else root.BioDexRewards=api;
})(typeof window!=='undefined'?window:this);
