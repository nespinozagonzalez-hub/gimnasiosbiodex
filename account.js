(function(root){
 'use strict';
 const SESSION_KEY='biodex_session_v2';
 function create({config,fetch:send,storage}){
  let session=null,progress=null;
  const remembered=()=>{try{const s=JSON.parse(storage.getItem(SESSION_KEY));return s&&typeof s.token==='string'&&s.token.length>=50?s:null;}catch(_){return null;}};
  function remember(){try{if(session)storage.setItem(SESSION_KEY,JSON.stringify(session));else storage.removeItem(SESSION_KEY);}catch(_){/* La cuenta funciona aunque el navegador bloquee el almacenamiento. */}}
  function accept(data){
   if(!data.progreso||typeof data.progreso.jugador!=='string'||!Array.isArray(data.progreso.capturadas))throw Error('BioDex respondió sin una colección válida. Vuelve a intentar.');
   progress=data.progreso;if(session)session.name=progress.jugador;remember();return data;
  }
  async function request(action,fields={}){
   if(!['login','load','redeem','logout'].includes(action))throw Error('Operación no disponible.');
   if(!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(config.endpoint))throw Error('La conexión de BioDex no está disponible.');
   if(action!=='login'&&!session?.token)throw Error('Conecta tu cuenta de BioDex para continuar.');
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),45000);
   try{
    const response=await send(config.endpoint,{method:'POST',redirect:'follow',credentials:'omit',referrerPolicy:'no-referrer',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({...fields,action,...(action!=='login'?{token:session.token}:{})}),signal:controller.signal});
    if(!response.ok)throw Error('BioDex no pudo responder. Vuelve a intentar.');
    const data=await response.json();if(!data.ok){const error=Error(data.error||'No fue posible completar la operación.');error.sessionExpired=/sesi[oó]n (?:no v[aá]lida|venci[oó])|cuenta no disponible/i.test(error.message);throw error;}
    return data;
   }catch(error){
    if(error.name==='AbortError')throw Error('La confirmación tardó demasiado. Reintenta: las capturas no se duplican.');
    if(error instanceof TypeError)throw Error('No se pudo confirmar la operación. Revisa la conexión y reintenta.');
    if(error instanceof SyntaxError)throw Error('No se pudo leer la confirmación de BioDex. Reintenta.');
    throw error;
   }finally{clearTimeout(timer);}
  }
  return {
   get session(){return session?{...session}:null;},get progress(){return progress;},
   async restore(){session=remembered();if(!session)return null;try{return accept(await request('load'));}catch(error){session=null;progress=null;if(error.sessionExpired)remember();throw error;}},
   async login(name,pin){const data=await request('login',{name,pin});if(typeof data.token!=='string'||data.token.length<50)throw Error('No se recibió una sesión válida.');session={token:data.token,name};try{return accept(data);}catch(error){session=null;throw error;}},
   async load(){return accept(await request('load'));},
   async redeem(code){return accept(await request('redeem',{code}));},
   async logout(){try{if(session)await request('logout');}finally{session=null;progress=null;remember();}}
  };
 }
 const api={SESSION_KEY,create};if(typeof module==='object'&&module.exports)module.exports=api;else root.BioDexAccount=api;
})(typeof window!=='undefined'?window:this);
