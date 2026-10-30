(function(root){
 'use strict';
 const DEFAULT_ID='2medio';
 const COURSES=[
  {id:DEFAULT_ID,path:'segundo-medio',label:'2.º medio',title:'Liga Celular',eyebrow:'LIGA CELULAR · 2.º MEDIO',available:true,bankRoot:'bancos/liga'},
  {id:'7basico',path:'septimo-basico',label:'7.º básico',title:'Liga de la Materia y la Vida',eyebrow:'MATERIA Y VIDA · 7.º BÁSICO',available:true,bankRoot:'bancos/7basico',subjects:['Materia y gases','Fuerzas y sus efectos','Microorganismos e inmunidad','Pubertad y reproducción','Autocuidado y prevención'],codes:['LIGA7-AURORA-742','LIGA7-PRISMA-385','LIGA7-NEXO-916','LIGA7-NOVA-528','LIGA7-BRUMA-263']},
  {id:'6basico',path:'sexto-basico',label:'6.º básico',title:'Liga de 6.º básico',eyebrow:'6.º BÁSICO · PRÓXIMAMENTE',available:false,bankRoot:null}
 ];
 const get=id=>COURSES.find(course=>course.id===id)||null;
 const resolve=(search,fixedId)=>{if(fixedId!==undefined&&fixedId!==null)return get(fixedId);const id=new URLSearchParams(search).get('liga');return get(id===null?DEFAULT_ID:id);};
 function url(id,page='index.html',extra={}){
  const course=get(id);if(!course||!['index.html','combate.html','revision.html','revision-tablet.html'].includes(page))throw Error('Ruta de liga no válida.');
  const params=new URLSearchParams();for(const [key,value] of Object.entries(extra))if(value!==undefined&&value!==null&&key!=='liga')params.set(key,String(value));
  return course.path+'/'+(page==='index.html'?'':page)+(params.size?'?'+params.toString():'');
 }
 function gyms(base,id){
  const course=get(id);if(!course?.available)throw Error('Esta liga todavía no está disponible.');
  return base.map((gym,i)=>({...gym,leagueId:id,id:id===DEFAULT_ID?gym.id:id+'-'+gym.slug,subject:course.subjects?.[i]||gym.subject,entryCode:course.codes?.[i]||gym.entryCode,bankUrl:course.bankRoot+'/'+gym.slug+'.json',story:gym.story.map(scene=>({...scene,line:scene.line.replace('Esta maqueta usa preguntas de ensayo y recompensas simuladas.','Al vencer con tu cuenta, tus cuatro recompensas se canjean en BioDex.')}))}));
 }
 const api={DEFAULT_ID,COURSES,get,resolve,url,gyms};if(typeof module==='object'&&module.exports)module.exports=api;else root.BioDexCourses=api;
})(typeof window!=='undefined'?window:this);
