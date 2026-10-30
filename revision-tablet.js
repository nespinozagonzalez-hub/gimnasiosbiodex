(()=>{
 'use strict';
 const C=window.BioDexCourse;if(!C?.available)return;
 const frame=document.getElementById('preview'),scene=document.getElementById('scene');
 function load(){const [page,query]=scene.value.split('?');frame.src=C.url(page,{...Object.fromEntries(new URLSearchParams(query)),rev:'separate-10'});}
 document.getElementById('size').addEventListener('change',event=>{const [w,h]=event.target.value.split(',');frame.width=w;frame.height=h;});
 scene.addEventListener('change',load);load();
})();
