const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
test('todas las páginas y hojas de estilo resuelven sus archivos dentro del nuevo proyecto',()=>{
 for(const name of fs.readdirSync(root).filter(n=>/\.(html|css)$/.test(n))){
  const content=fs.readFileSync(path.join(root,name),'utf8'),refs=[...content.matchAll(/(?:src|href)="([^"]+)"/g),...content.matchAll(/url\(['"]?([^'"\)]+)['"]?\)/g)];
  for(const [,ref] of refs){if(/^(https?:|#|data:)/.test(ref))continue;const file=ref.split(/[?#]/)[0];if(!file)continue;assert.ok(!file.startsWith('../'),'Ruta fuera del proyecto en '+name+': '+file);assert.ok(fs.existsSync(path.resolve(root,file)),name+' necesita '+file);}
 }
});
test('los cinco gimnasios tienen retratos y fondos propios en la copia independiente',()=>{
 for(const g of require('../liga-config.js').GYMS)for(const file of [g.portrait,g.background,g.landscape])assert.ok(fs.existsSync(path.join(root,file)),file);
});
test('la cuenta y la vuelta a BioDex usan direcciones explícitas',()=>{
 const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'config.js'),'utf8'),context);const c=context.window.BIODEX_CONFIG;assert.match(c.endpoint,/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/);assert.equal(c.homeUrl,'https://nespinozagonzalez-hub.github.io/biodex/');
 const app=fs.readFileSync(path.join(root,'app.js'),'utf8');assert.ok(app.includes("['login','load','logout']"));assert.ok(!app.includes('href="../"'));
});
test('la entrada abre la liga y mantiene el ensayo original en su propio enlace',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.ok(html.includes('liga-hub.js'));assert.ok(html.includes('href="ensayo.html"'));assert.ok(fs.readFileSync(path.join(root,'ensayo.html'),'utf8').includes('misiones/umbral.js'));
});
