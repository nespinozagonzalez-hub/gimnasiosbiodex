(function(root){
 'use strict';
 const atlas={B001:['a',0],B004:['a',1],B008:['a',2],B010:['a',3],B014:['b',0],B019:['b',1],B023:['b',2],B024:['b',3],B003:['c',0],B013:['c',1],B015:['c',2],B016:['c',3]};
 const ART=Object.fromEntries(Array.from({length:33},(_,i)=>{const id='B'+String(i+1).padStart(3,'0'),cell=atlas[id];return [id,cell?{file:'assets/bioformas/pixel-'+cell[0]+'.png',cell:cell[1],facing:'right',format:'pixel'}:{file:'assets/cutouts/'+id+'.png',facing:'right',format:'png'}];}));
 function shouldFlip(nativeFacing,side){if(!['right','left'].includes(nativeFacing)||!['player','enemy'].includes(side))throw Error('Orientación no válida.');return nativeFacing!==(side==='player'?'right':'left');}
 const api={ART,shouldFlip};if(typeof module==='object'&&module.exports)module.exports=api;else root.BattleArt=api;
})(typeof window!=='undefined'?window:this);
