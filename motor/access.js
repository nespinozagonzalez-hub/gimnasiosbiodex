(function(root){
 'use strict';
 const key=player=>'biodex.liga.access.v1.'+encodeURIComponent(String(player||'').trim().normalize('NFC').toLocaleLowerCase('es'));
 const normalize=code=>String(code||'').trim().toUpperCase().replace(/\s+/g,'');
 function read(storage,player){try{const data=JSON.parse(storage.getItem(key(player))||'{}');return data&&typeof data==='object'&&!Array.isArray(data)?data:{};}catch(_){return {};}}
 function create({storage,gyms}){
  const memory=new Map();
  const activated=player=>({...read(storage,player),...(memory.get(key(player))||{})});
  return {
   isUnlocked(player,slug){return Boolean(player&&activated(player)[slug]);},
   activate(player,code){
    if(!player)throw Error('Conecta primero tu cuenta de BioDex.');
    const gym=gyms.find(g=>normalize(g.entryCode)===normalize(code));if(!gym)throw Error('Código de gimnasio no reconocido. Revisa el que te entregó tu docente.');
    const data=activated(player);data[gym.slug]=true;memory.set(key(player),data);let saved=true;try{storage.setItem(key(player),JSON.stringify(data));}catch(_){saved=false;}
    return {gym,saved};
   }
  };
 }
 const api={create};if(typeof module==='object'&&module.exports)module.exports=api;else root.BioDexAccess=api;
})(typeof window!=='undefined'?window:this);
