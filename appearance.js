(function(root){
 'use strict';
 const KEY='biodex.liga.typeface.v1';
 function create({storage,element}){
  let mode='retro';try{if(storage.getItem(KEY)==='clear')mode='clear';}catch(_){}
  function apply(value){mode=value==='clear'?'clear':'retro';element.dataset.typeface=mode;return mode;}
  apply(mode);
  return {get mode(){return mode;},set(value){apply(value);try{storage.setItem(KEY,mode);}catch(_){}return mode;},toggle(){return this.set(mode==='retro'?'clear':'retro');}};
 }
 const api={KEY,create};if(typeof module==='object'&&module.exports){module.exports=api;return;}
 const preference=create({storage:{getItem:k=>localStorage.getItem(k),setItem:(k,v)=>localStorage.setItem(k,v)},element:document.documentElement});
 function paint(){document.querySelectorAll('[data-typeface-toggle]').forEach(b=>{b.setAttribute('aria-pressed',String(preference.mode==='retro'));b.querySelector('[data-typeface-label]').textContent='Letra retro: '+(preference.mode==='retro'?'sí':'no');});}
 document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('[data-typeface-toggle]').forEach(b=>b.addEventListener('click',()=>{preference.toggle();paint();}));paint();});
 root.addEventListener('storage',event=>{if(event.key===KEY){preference.set(event.newValue);paint();}});
 root.BioDexAppearance=preference;
})(typeof window!=='undefined'?window:this);
