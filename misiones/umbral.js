(function(root){
 'use strict';
 const moves=power=>[
  {name:'Golpe de corriente',hint:'Ataque directo. La cifra estima el daño a tu bioforma activa.',kind:'attack',power:18+power},
  {name:'Concentración de energía',hint:'Este turno no golpea. Preparar una defensa protege la siguiente oleada.',kind:'charge',power:0},
  {name:'Oleada del Umbral',hint:'Ataque potente. Defender o usar protección puede reducirlo.',kind:'attack',power:36+power},
  {name:'Manto de reflejos',hint:'Preparará un escudo. Algunas habilidades pueden atravesarlo.',kind:'shield',power:0,shield:12}
 ];
 const mission={id:'umbral-ensayo',title:'El guardián del Umbral',subject:'Lectura crítica y evidencias',leader:'Iria',phases:[
  {id:'B023',name:'Caelix',type:'Umbral',baseHp:45,hpPerAlly:16,moves:moves(0),intro:'Caelix custodia el primer sello.'},
  {id:'B024',name:'Nuvora',type:'Umbral',baseHp:45,hpPerAlly:16,moves:moves(4),intro:'La corriente cambia. Nuvora custodia el último sello.'}
 ],story:[
  {title:'El agua guarda ecos.',caption:'ENCUENTRO EN EL SANTUARIO',line:'Llegaste al Umbral. Soy Iria, guardiana de este lago. Mis bioformas protegen una puerta que responde a quienes observan, comparan y sostienen sus decisiones con evidencia.'},
  {title:'Una decisión enciende el vínculo.',caption:'LA PRUEBA DEL CRITERIO',line:'Cada bioforma aporta una habilidad y una ventaja propia. Aurora y Lumen tienen ventaja ante mi equipo Umbral. Tu respuesta activa el ataque, la habilidad o la defensa: conocer a tu equipo también importa.'},
  {title:'Escucha antes de actuar.',caption:'EL COMBATE ESTÁ POR COMENZAR',line:'Caelix y Nuvora anuncian sus movimientos. Una protección permanece hasta recibir un golpe. Puedes curar, atravesar escudos o preparar un relevo. Este ensayo trata sobre lectura crítica y evidencias. Tómate el tiempo que necesites.'}
 ]};
 if(typeof module==='object'&&module.exports)module.exports=mission;else root.BioDexMission=mission;
})(typeof window!=='undefined'?window:this);
