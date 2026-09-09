import { Save } from './systems/Save.js';
import { AudioSystem } from './systems/Audio.js';
import { Assets } from './systems/Assets.js';
import { Input } from './systems/Input.js';
import { Renderer } from './systems/Renderer.js';
import { Game } from './scenes/Game.js';
import { UI } from './ui/UI.js';
import { standUp, meetingRoom } from './scenes/Cutscene.js';
const $=id=>document.getElementById(id);
const save=new Save();const audio=new AudioSystem(save);const ui=new UI(save,audio);const input=new Input();const assets=new Assets();
let game=null,ready=null,cutTimers=[],cutscene=null,starting=false,stopStand=null;
if(matchMedia('(pointer:coarse)').matches)$('game-screen').classList.add('touch');
function prepare(){return ready||=(assets.load().then(()=>{const renderer=new Renderer($('game'),assets,save);game=new Game(input,audio,save,renderer,{chapter:ui.chapter,hud:ui.hud,hint:ui.hint,toast:ui.toast,pause:ui.pause,ending:()=>ending(),finish:reason=>failure(reason)});})).catch(error=>{ready=null;throw error;});}
function cancelCut(){$('cinema-stage').classList.add('hidden');stopStand?.();stopStand=null;$('cinematic').classList.remove('standing');cutTimers.forEach(clearTimeout);cutTimers=[];cutscene=null;$('cinematic').classList.remove('zoom');}
function later(fn,delay){cutTimers.push(setTimeout(fn,delay));}
async function start(index=0,withIntro=true){
  if(starting)return;starting=true;audio.unlock();ui.panel.close();cancelCut();$('loading').classList.remove('hidden');
  try{await prepare();$('loading').classList.add('hidden');if(withIntro&&index===0)intro();else launch(index);}catch(error){$('loading').classList.add('hidden');ui.open('<h2 class="panel-title">THE BAG IS STUCK.</h2><p class="error-message">A game asset could not load. Check your connection and try again.</p><button class="play-button" data-action="restart"><strong>TRY AGAIN</strong></button>','error');console.error(error);}finally{starting=false;}
}
function launch(index=0){cancelCut();ui.show('game-screen');game.start(index);$('game').focus();}
function intro(){
  ui.show('cinematic');cutscene=()=>launch(0);$('cinema-kicker').textContent='09:55 AM · A PERFECTLY NORMAL MORNING';$('cinema-title').innerHTML='MEETING STARTS IN<br><em>5 MINUTES.</em>';$('cinema-line').textContent='He had other plans. They involved sitting.';audio.sound('phone');
  later(()=>{$('cinematic').classList.add('zoom');$('cinema-title').textContent='…';$('cinema-line').textContent='';},1800);
  later(()=>{$('cinema-kicker').textContent='ONE MAN. ONE BAG.';$('cinema-title').innerHTML='MISSION<br><em>ACCEPTED.</em>';$('cinema-line').textContent='The bag has been equipped. Dignity remains intact.';audio.sound('boss');},3000);
  later(()=>{$('cinematic').classList.add('standing');stopStand=standUp($('cinema-stage'),assets);},3700);
  later(()=>launch(0),5500);
}
function ending(){
  cancelCut();ui.show('cinematic');$('cinematic').classList.add('zoom');meetingRoom($('cinema-stage'),assets);$('cinema-kicker').textContent='THE MEETING ROOM';$('cinema-title').innerHTML='“MEETING<br><em>CANCELLED.”</em>';$('cinema-line').textContent='Everyone looks at him. He checks his phone.';cutscene=()=>{cancelCut();ui.show('game-screen');ui.result(game.state);};
  later(()=>{$('cinema-title').textContent='…';$('cinema-line').textContent='';},2300);
  later(()=>{if(cutscene)cutscene();},4000);
}
function failure(reason){
  if(reason!=='late'){ui.result(game.state,reason);return;}
  cancelCut();ui.show('cinematic');$('cinematic').classList.add('zoom');$('cinema-kicker').textContent='00:00 · THE CALENDAR WINS';$('cinema-title').innerHTML='YOU ARE<br><em>LATE.</em>';$('cinema-line').textContent='Meeting rescheduled to tomorrow.';audio.sound('alarm');cutscene=()=>{cancelCut();ui.show('game-screen');ui.result(game.state,reason);};later(()=>{if(cutscene)cutscene();},3000);
}
function home(){cancelCut();game?.stop();ui.panel.close();ui.show('menu');$('play').focus();}
$('play').onclick=()=>start(0,true);$('skip').onclick=()=>cutscene?.();$('pause').onclick=()=>game?.pause();
ui.onAction=(action,value)=>{
  if(action==='close'){if(game?.mode==='paused')game.resume();return;}
  if(action==='level')start(Number(value),false);
  if(action==='resume'){ui.panel.close();game.resume();$('game').focus();}
  if(action==='restart')start(game?.state?.startLevel||0,false);
  if(action==='controls')ui.showPanel('controls');
  if(action==='settings')ui.showPanel('settings');
  if(action==='home')home();
  if(action==='fullscreen')ui.fullscreen();
};
window.addEventListener('keydown',e=>{
  if(e.code==='Escape'){if(ui.panel.open)return;if(cutscene){e.preventDefault();cutscene();return;}if(game?.mode==='playing'){e.preventDefault();game.pause();}else if(game?.mode==='paused'){e.preventDefault();ui.panel.close();game.resume();}}
  if((e.code==='Space'||e.code==='Enter')&&cutscene){e.preventDefault();cutscene();return;}
  if(e.code==='Enter'&&!ui.panel.open&&!$('menu').classList.contains('hidden')&&e.target.tagName!=='BUTTON'){e.preventDefault();start();}
});
window.addEventListener('blur',()=>{if(game?.mode==='playing')game.pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&game?.mode==='playing')game.pause();});
