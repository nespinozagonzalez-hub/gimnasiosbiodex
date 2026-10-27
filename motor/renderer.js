(function(root){
'use strict';
const ART=window.BattleArt.ART;
const cache=new Map();
function load(file){if(!cache.has(file))cache.set(file,new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>{cache.delete(file);reject(Error('Recurso visual no disponible'));};im.src=file;}));return cache.get(file);}
async function source(id){const art=ART[id];if(!art)throw Error('Bioforma sin arte de combate');
 try{const im=await load(art.file);return {im,r:art.cell===undefined?[0,0,im.width,im.height]:[art.cell%2*im.width/2,Math.floor(art.cell/2)*im.height/2,im.width/2,im.height/2],facing:art.facing};}
 catch(_){const im=await load('assets/cutouts/'+id+'.png');return {im,r:[0,0,im.width,im.height],facing:['B004','B014'].includes(id)?'left':'right'};}
}
function drawSprite(ctx,src,x,y,size,flip,alpha=1){if(!src)return;ctx.save();ctx.globalAlpha=alpha;ctx.translate(Math.round(x),Math.round(y));if(flip)ctx.scale(-1,1);ctx.drawImage(src.im,...src.r,Math.round(-size/2),Math.round(-size),Math.round(size),Math.round(size));ctx.restore();}
async function paint(canvas,id){if(!canvas||canvas.dataset.painted===id+':'+(canvas.dataset.side||'player'))return;canvas.dataset.painted=id+':'+(canvas.dataset.side||'player');try{const src=await source(id);if(!canvas.isConnected)return;const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,canvas.width,canvas.height);drawSprite(c,src,canvas.width/2,canvas.height,Math.min(canvas.width,canvas.height),window.BattleArt.shouldFlip(src.facing,canvas.dataset.side||'player'));}catch(_){canvas.dataset.painted='';}}
function paintAll(scope=document){scope.querySelectorAll('canvas[data-pixel-id]').forEach(c=>paint(c,c.dataset.pixelId));}
class Renderer{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.active=false;this.state=null;this.sources={};this.actors={};this.effect=null;this.pops=[];this.frame=0;this.request=0;this.reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas);this.resize();}
 resize(){const w=this.canvas.clientWidth,h=this.canvas.clientHeight;if(!w||!h)return;this.canvas.width=Math.round(w/2);this.canvas.height=Math.round(h/2);this.ctx.imageSmoothingEnabled=false;this.draw(performance.now());}
 start(){if(this.active)return;this.active=true;this.resize();const loop=t=>{if(!this.active)return;this.draw(t);this.frame=requestAnimationFrame(loop);};this.frame=requestAnimationFrame(loop);}
 stop(){this.active=false;cancelAnimationFrame(this.frame);this.effect=null;}
 async setBattle(state){this.state=JSON.parse(JSON.stringify(state));const n=++this.request;const player=state.team[state.active].id,enemy=state.enemy.id;
  try{const [p,e]=await Promise.all([source(player),source(enemy)]);if(n!==this.request)return;this.sources={player:p,enemy:e};this.draw(performance.now());}catch(_){} }
 pos(){const w=this.canvas.width,h=this.canvas.height,small=w<250;return {player:{x:w*.23,y:h*.88,size:Math.min(h*.7,w*.4)},enemy:{x:w*.77,y:h*.69,size:Math.min(h*.62,w*.36)}};}
 async play(kind,extra={}){const duration=this.reduced?80:kind==='switch'?450:kind==='guard'?600:1050;this.effect={kind,start:performance.now(),duration,...extra};await new Promise(r=>setTimeout(r,duration));this.effect=null;}
 draw(t){const c=this.ctx,w=this.canvas.width,h=this.canvas.height;if(!w||!h)return;c.clearRect(0,0,w,h);c.imageSmoothingEnabled=false;if(!this.state)return;
  const positions=this.pos(),fx=this.effect,progress=fx?Math.min(1,(t-fx.start)/fx.duration):0,player=this.state.team[this.state.active];
  for(const who of ['player','enemy']){const p=positions[who],src=this.sources[who];if(!src)continue;let x=p.x,y=p.y,alpha=who==='player'&&player.hp<=0?.25:1;
   if(fx){const attack=fx.kind==='playerAttack'||fx.kind==='playerSkill'||fx.kind==='playerMiss',outgoing=attack?'player':'enemy';if((attack||fx.kind==='enemyAttack')&&who===outgoing)x+=(who==='player'?1:-1)*Math.sin(progress*Math.PI)*w*.035;
    if((attack||fx.kind==='enemyAttack')&&who!==outgoing&&progress>.65&&fx.kind!=='playerMiss'){x+=Math.sin(progress*60)*2;alpha=Math.floor(progress*15)%2?.4:1;}
    if(fx.kind==='switch'&&who==='player')alpha=Math.abs(progress*2-1);
   }
   if(!this.reduced)y+=Math.sin(t/600+(who==='enemy'?2:0))*1.2;
   c.fillStyle='#061c2788';c.beginPath();c.ellipse(p.x,p.y+1,p.size*.32,4,0,0,Math.PI*2);c.fill();
   const flip=window.BattleArt.shouldFlip(src.facing,who);drawSprite(c,src,x,y,p.size,flip,alpha);
  }
  if(fx){
   const attack=['playerAttack','playerSkill','playerMiss'].includes(fx.kind),enemyAttack=fx.kind==='enemyAttack';
   if(attack||enemyAttack){const from=attack?positions.player:positions.enemy,to=attack?positions.enemy:positions.player;const travel=Math.max(0,Math.min(1,(progress-.2)/.5)),sx=from.x+(attack?1:-1)*from.size*.15,sy=from.y-from.size*.5,tx=to.x,ty=to.y-to.size*.48;
    const color=enemyAttack?'#9fe8ff':fx.kind==='playerSkill'?'#c1fff0':'#ffe297';
    if(progress>.15&&progress<.77){for(let i=5;i>=0;i--){const v=Math.max(0,travel-i*.055);c.globalAlpha=1-i*.13;c.fillStyle=i===0?'#fff9d5':color;const x=Math.round(sx+(tx-sx)*v),y=Math.round(sy+(ty-sy)*v);c.fillRect(x-(i===0?3:2),y-(i===0?3:2),i===0?7:4,i===0?7:4);}c.globalAlpha=1;}
    if(progress>.68){const k=(progress-.68)/.32,blocked=fx.kind==='playerMiss';c.fillStyle=blocked?'#a3e8e2':color;for(let i=0;i<12;i++){const a=i*Math.PI/6,d=(5+k*20),x=Math.round(tx+Math.cos(a)*d),y=Math.round(ty+Math.sin(a)*d);c.globalAlpha=1-k;c.fillRect(x,y,i%2?2:4,i%2?2:4);}c.globalAlpha=1;if(blocked)this.shield(to,'#a3e8e2');}
   }
   if(fx.kind==='guard'||fx.guarding)this.shield(positions.player,'#b2f3e8');
   if(fx.kind==='enemyGuard')this.shield(positions.enemy,'#b0d2ff');
   if(fx.kind==='enemyCharge'||fx.healing){const p=fx.kind==='enemyCharge'?positions.enemy:positions.player;c.fillStyle='#bbf6c7';for(let i=0;i<7;i++){const a=i*2.4+t/450;c.fillRect(Math.round(p.x+Math.cos(a)*p.size*.28),Math.round(p.y-p.size*.5+Math.sin(a)*p.size*.3),3,3);}}
  }
  if(this.state.enemy.shield)this.shield(positions.enemy,'#a7daed55');
 }
 shield(p,color){const c=this.ctx,x=p.x+(p===this.pos().player?10:0),y=p.y-p.size*.48,s=p.size*.29;c.strokeStyle=color;c.lineWidth=2;c.fillStyle='#a3e8e215';c.beginPath();[[0,-1],[.8,-.6],[.7,.5],[0,1],[-.7,.5],[-.8,-.6]].forEach(([a,b],i)=>i?c.lineTo(Math.round(x+a*s),Math.round(y+b*s)):c.moveTo(Math.round(x+a*s),Math.round(y+b*s)));c.closePath();c.fill();c.stroke();}
}
root.PixelArt={paint,paintAll,source,ART};root.PixelBattleRenderer=Renderer;
})(window);
