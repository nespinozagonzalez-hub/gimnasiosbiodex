(function(root){
'use strict';
// Banco de ensayo transversal. Las respuestas no se marcan en la interfaz
// antes de confirmar. El motor cambia su orden en cada pregunta.
const BANK=typeof module==='object'&&module.exports?require('../bancos/umbral.js'):root.BioDexQuestionBank;

function shuffle(a,rng=Math.random){const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function create(rng,bank=BANK,settings={}){if(!Array.isArray(bank)||!bank.length||new Set(bank.map(q=>q.id)).size!==bank.length||bank.some(q=>!q.id||!q.stem||!q.explain||!Array.isArray(q.options)||![4,5].includes(q.options.length)||!Number.isInteger(q.answer)||q.answer<0||q.answer>=q.options.length))throw Error('Banco de preguntas no válido.');return {bank:JSON.parse(JSON.stringify(bank)),deck:shuffle(bank.map(q=>q.id),rng),cursor:0,current:null,history:[],cycle:0,repeat:settings.repeat!==false};}
function present(state,mode,rng){
 if(!['attack','skill','guard'].includes(mode))throw Error('Estrategia no válida.');
 if(state.current)return state.current;
 if(state.cursor>=state.deck.length){if(state.repeat===false)return null;const missed=state.history.filter(x=>!x.correct).map(x=>x.id);state.deck=shuffle(state.bank.map(q=>q.id),rng).sort((a,b)=>Number(missed.includes(b))-Number(missed.includes(a)));state.cursor=0;state.cycle++;}
 const base=state.bank.find(q=>q.id===state.deck[state.cursor]),order=shuffle(base.options.map((_,i)=>i),rng);
 state.current={id:base.id,topic:base.topic,stem:base.stem,statements:base.statements?.slice()||[],figure:base.figure||null,seconds:base.seconds,options:order.map(i=>base.options[i]),answer:order.indexOf(base.answer),explain:base.explain,mode,selected:null,graded:false,applied:false};return state.current;
}
function arm(state,seconds,now=Date.now()){const q=state.current;if(!q||q.graded||q.deadline)return false;if(!Number.isFinite(seconds)||seconds<5||seconds>600)throw Error('Tiempo de pregunta no válido.');q.duration=seconds*1000;q.deadline=now+q.duration;return true;}
function remaining(state,now=Date.now()){const q=state.current;return q?.deadline?Math.max(0,q.deadline-now):null;}
function expired(q,now){return Boolean(q?.deadline&&now>=q.deadline);}
function expire(state,now=Date.now()){const q=state.current;if(!q||q.graded||!expired(q,now))return null;q.graded=true;q.correct=false;q.timedOut=true;state.history.push({id:q.id,correct:false,mode:q.mode,timedOut:true});state.cursor++;return {correct:false,timedOut:true,explain:q.explain,answer:q.answer,selected:q.selected,mode:q.mode};}
function choose(state,index,now=Date.now()){const q=state.current;if(!q||q.graded||expired(q,now)||!Number.isInteger(index)||index<0||index>=q.options.length)return false;q.selected=index;return true;}
function grade(state,now=Date.now()){const q=state.current;if(!q||q.graded)return null;if(expired(q,now))return expire(state,now);if(q.selected===null)return null;q.graded=true;q.correct=q.selected===q.answer;state.history.push({id:q.id,correct:q.correct,mode:q.mode});state.cursor++;return {correct:q.correct,explain:q.explain,answer:q.answer,selected:q.selected,mode:q.mode};}
function consume(state){const q=state.current;if(!q||!q.graded||q.applied)return null;q.applied=true;const result={correct:q.correct,mode:q.mode};if(q.timedOut)result.timedOut=true;state.current=null;return result;}
const api={BANK,create,present,choose,grade,consume,shuffle,arm,remaining,expire};if(typeof module==='object'&&module.exports)module.exports=api;else root.MissionQuestions=api;
})(typeof window!=='undefined'?window:this);
