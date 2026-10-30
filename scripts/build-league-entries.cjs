'use strict';
const fs=require('node:fs'),path=require('node:path'),courses=require('../ligas.js').COURSES;
const root=path.join(__dirname,'..'),pages=['index.html','combate.html','revision.html','revision-tablet.html'];
function render(course,page){
 const source=fs.readFileSync(path.join(root,page),'utf8');
 return source.replace('<html lang="es">','<html lang="es" data-league="'+course.id+'">')
  .replace('<meta charset="utf-8">','<meta charset="utf-8"><base href="../">')
  .replace(/<title>[^<]*<\/title>/,'<title>BioDex · '+course.title+' · '+course.label+'</title>')
  .replace('LIGA CELULAR · 2.º MEDIO',course.eyebrow);
}
function build(check=false){
 const stale=[];
 for(const course of courses)for(const page of pages){
  const file=path.join(root,course.path,page),content=render(course,page);
  if(check){if(!fs.existsSync(file)||fs.readFileSync(file,'utf8')!==content)stale.push(course.path+'/'+page);}
  else{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,content);}
 }
 if(stale.length)throw Error('Regenera las entradas con node scripts/build-league-entries.cjs: '+stale.join(', '));
}
if(require.main===module)build(process.argv.includes('--check'));
module.exports={build,render,pages};
