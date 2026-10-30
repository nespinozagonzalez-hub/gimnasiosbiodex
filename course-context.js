(()=>{
 'use strict';
 const R=window.BioDexCourses,course=R.resolve(location.search),escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const context={...(course||{}),available:Boolean(course?.available),url:(page,extra)=>R.url(course.id,page,extra)};
 window.BioDexCourse=context;
 const navigationPage=/\/(revision|revision-tablet)\.html$/.test(location.pathname)?location.pathname.split('/').pop():'index.html';
 const base=window.BioDexGyms,gyms=context.available?R.gyms(base.GYMS,course.id):[];
 window.BioDexGyms={GYMS:gyms,get:slug=>gyms.find(g=>g.slug===slug)};
 document.body.dataset.league=course?.id||'unavailable';
 document.title='BioDex · '+(course?course.title+' · '+course.label:'Elige tu liga');
 document.querySelectorAll('[data-league-nav]').forEach(nav=>{nav.innerHTML='<span class="league-switcher-label">ELIGE TU LIGA</span>'+R.COURSES.map(c=>c.available?'<a href="'+R.url(c.id,navigationPage)+'"'+(c.id===course?.id?' aria-current="page"':'')+'><b>'+escape(c.label)+'</b><small>'+escape(c.title)+'</small></a>':'<span class="league-pending" aria-disabled="true"><b>'+escape(c.label)+'</b><small>Próximamente</small></span>').join('');});
 if(!context.available){
  const main=document.querySelector('main');main.innerHTML='<section class="league-unavailable"><span class="eyebrow gold">'+escape(course?.label||'LIGA NO DISPONIBLE')+'</span><h1>'+escape(course?'El próximo camino se está preparando.':'Elige una liga disponible.')+'</h1><p>'+escape(course?'La liga de '+course.label+' se habilitará al incorporar sus preguntas.':'Puedes volver a las ligas publicadas desde el selector de cursos.')+'</p><a class="button secondary" href="'+R.url(R.DEFAULT_ID)+'">Volver a 2.º medio →</a></section>';return;
 }
 const eyebrow=document.querySelector('.league-hero>.eyebrow');if(eyebrow)eyebrow.textContent=course.eyebrow;
 document.querySelectorAll('a[href]').forEach(link=>{
  if(link.closest('[data-league-nav]'))return;
  const href=link.getAttribute('href');if(/^(https?:|#|mailto:)/.test(href))return;
  const [path,query]=href.split('?');const page=path==='./'?'index.html':path;if(!['index.html','combate.html','revision.html','revision-tablet.html'].includes(page))return;
  const extra=Object.fromEntries(new URLSearchParams(query));link.href=context.url(page,extra);
 });
 document.querySelectorAll('[data-course-name]').forEach(el=>el.textContent=course.label);
})();
