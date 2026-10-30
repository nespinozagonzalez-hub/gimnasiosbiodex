(()=>{
 'use strict';
 const R=window.BioDexCourses,fixedId=document.documentElement.dataset.league,course=R.resolve(location.search,fixedId),escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const context={...(course||{}),available:Boolean(fixedId&&course?.available),url:(page,extra)=>R.url(course.id,page,extra)};
 window.BioDexCourse=context;
 const base=window.BioDexGyms,gyms=context.available?R.gyms(base.GYMS,course.id):[];
 window.BioDexGyms={GYMS:gyms,get:slug=>gyms.find(g=>g.slug===slug)};
 document.body.dataset.league=course?.id||'unavailable';
 document.title='BioDex · '+(course?course.title+' · '+course.label:'Liga no disponible');
 const page=location.pathname.split('/').pop()||'index.html';
 if(!fixedId&&course){
  location.replace(context.url(page,Object.fromEntries(new URLSearchParams(location.search)))+location.hash);return;
 }
 if(fixedId&&new URLSearchParams(location.search).has('liga')){
  const params=new URLSearchParams(location.search);params.delete('liga');
  history.replaceState(null,'',location.pathname+(params.size?'?'+params.toString():'')+location.hash);
 }
 if(course)document.querySelectorAll('a[href]').forEach(link=>{
  const href=link.getAttribute('href');if(href.startsWith('#')){link.href=context.url(page,Object.fromEntries(new URLSearchParams(location.search)))+href;return;}if(/^(https?:|mailto:)/.test(href))return;
  const [path,query]=href.split('?');const target=path==='./'?'index.html':path;if(!['index.html','combate.html','revision.html','revision-tablet.html'].includes(target))return;
  link.href=context.url(target,Object.fromEntries(new URLSearchParams(query)));
 });
 if(!context.available){
  const main=document.querySelector('main');main.innerHTML='<section class="league-unavailable"><span class="eyebrow gold">'+escape(course?.label||'LIGA NO DISPONIBLE')+'</span><h1>'+escape(course?'El próximo camino se está preparando.':'Esta liga no está disponible.')+'</h1><p>'+escape(course?'La liga de '+course.label+' se habilitará al incorporar sus preguntas.':'Utiliza el enlace que te entregó tu docente.')+'</p><a class="button secondary" href="https://nespinozagonzalez-hub.github.io/biodex/">Volver a mi BioDex →</a></section>';return;
 }
 const eyebrow=document.querySelector('.league-hero>.eyebrow');if(eyebrow)eyebrow.textContent=course.eyebrow;
 document.querySelectorAll('[data-course-name]').forEach(el=>el.textContent=course.label);
})();
