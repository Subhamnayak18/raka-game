import test from 'node:test';
import assert from 'node:assert/strict';
import { Player } from '../dist/src/entities/Player.js';
import { Boss } from '../dist/src/entities/Boss.js';
import { updateEnemies } from '../dist/src/entities/Enemies.js';
import { Game } from '../dist/src/scenes/Game.js';
import { createLevel, CHAPTERS } from '../dist/src/config/levels.js';
import { PHYSICS, FLOOR } from '../dist/src/config/game.js';
import { Save } from '../dist/src/systems/Save.js';
import { finalScore, rankFor, timeLabel } from '../dist/src/utils/math.js';
const fx={burst(){},text(){},impact(){},update(){},hitstop:0};
const audio={sound(){},tone(){},update(){}};
function state(){return{time:300,energy:100,score:0,documents:0,chai:0,wifi:0,chaiBoost:0,phone:100,slow:0,damage:0,combo:0,comboTime:0,defeated:0,won:false,startLevel:0};}
function input(){return{axis:0,jump:false,held:new Set(),pressed:new Set(),released:new Set(),down(...k){return k.some(x=>this.held.has(x));},hit(...k){return k.some(x=>this.pressed.has(x));},up(...k){return k.some(x=>this.released.has(x));},clear(){this.held.clear();this.pressed.clear();this.released.clear();this.jump=false;},finishFrame(){this.pressed.clear();this.released.clear();this.jump=false;}};}
function empty(){return{length:5000,floor:[{x:0,y:FLOOR,w:5000,h:300}],platforms:[],objects:[],projectiles:[]};}
function memory(){const m=new Map();return{getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)};}
function fixture(index=0){const keys=input();const records=[];const save=new Save(memory());const g=new Game(keys,audio,save,{reset(){}},{chapter(){},hud(){},hint(){},toast(){},pause(){},ending(){records.push('ending');},finish:r=>records.push(r)});g.state=state();g.mode='playing';g.loadLevel(index);g.transition=0;return{g,keys,records};}

test('all five chapters have reachable exits, bounded pickups, and jumpable gaps',()=>{
  assert.equal(CHAPTERS.length,5);
  for(let i=0;i<5;i++){const l=createLevel(i);assert(l.exit.x<l.length&&l.exit.x>2000);assert(l.floor.some(f=>l.exit.x>f.x&&l.exit.x<f.x+f.w));for(const [x,w] of l.pits){assert(w<PHYSICS.speed*PHYSICS.jump/PHYSICS.gravity*2-50);assert(x>100&&x+w<l.exit.x);}for(const p of l.pickups){assert(p.x>0&&p.x+p.w<l.length);assert(p.y>300&&p.y+p.h<FLOOR);}assert(l.pickups.some(p=>p.type==='chai'));}
});
test('movement accelerates, stops on release, and lands without floor penetration',()=>{
  const p=new Player(),keys=input(),s=state();keys.axis=1;
  for(let n=0;n<30;n++)p.update(1/60,keys,empty(),s,fx,audio);
  assert.equal(p.vx,PHYSICS.speed);assert(p.x>200);keys.axis=0;
  for(let n=0;n<30;n++)p.update(1/60,keys,empty(),s,fx,audio);
  assert.equal(p.vx,0);assert.equal(p.feet,FLOOR);assert(p.grounded);
});
test('coyote jump works shortly after walking off a ledge',()=>{
  const p=new Player();const keys=input();const l={...empty(),floor:[]};p.grounded=false;p.coyote=.08;p.y=FLOOR-115;keys.jump=true;
  p.update(1/60,keys,l,state(),fx,audio);assert(p.vy < -600);
});
test('buffered jump fires on the frame after landing',()=>{
  const p=new Player();p.y=FLOOR-126;p.grounded=false;p.coyote=0;p.vy=380;const keys=input();keys.jump=true;
  p.update(1/60,keys,empty(),state(),fx,audio);assert(p.grounded);keys.jump=false;
  p.update(1/60,keys,empty(),state(),fx,audio);assert(p.vy < -600);
});
test('holding jump reaches higher than releasing it',()=>{
  function height(release){const p=new Player(),keys=input();keys.jump=true;let highest=p.y;for(let n=0;n<65;n++){if(n===4&&release)keys.released.add('Space');p.update(1/60,keys,empty(),state(),fx,audio);keys.finishFrame();highest=Math.min(highest,p.y);}return highest;}
  assert(height(false)<height(true)-35);
});
test('ducking preserves feet and cannot stand through a low solid',()=>{
  const p=new Player();const keys=input();const l=empty();keys.held.add('KeyS');p.update(1/60,keys,l,state(),fx,audio);assert.equal(p.h,69);assert.equal(p.feet,FLOOR);
  l.platforms.push({x:p.x-10,y:490,w:100,h:35});keys.held.clear();p.update(1/60,keys,l,state(),fx,audio);assert.equal(p.h,69);
});
test('dash grants brief protection and respects its cooldown',()=>{
  const p=new Player(),keys=input(),s=state();keys.pressed.add('ShiftLeft');p.update(1/60,keys,empty(),s,fx,audio);assert(p.dash>0);assert(p.invincible>0);assert(p.vx>700);assert.equal(p.damage(10,{x:0},s,fx,audio),false);keys.finishFrame();
  for(let n=0;n<16;n++)p.update(1/60,keys,empty(),s,fx,audio);keys.pressed.add('ShiftLeft');p.update(1/60,keys,empty(),s,fx,audio);assert.equal(p.dash,0);
});
test('one bag swing cannot repeatedly damage the same printer',()=>{
  const l=createLevel(1),o=l.objects.find(o=>o.type==='printer');const p=new Player(o.x-85);p.attack=.15;p.attackId=1;const s=state();
  updateEnemies(l,p,s,1/60,fx,audio,()=>{});assert.equal(o.hp,1);updateEnemies(l,p,s,1/60,fx,audio,()=>{});assert.equal(o.hp,1);
  p.attackId=2;updateEnemies(l,p,s,1/60,fx,audio,()=>{});assert(o.dead);assert.equal(s.defeated,1);
});
test('quick meeting requires distinct jump presses to escape',()=>{
  const p=new Player();p.trapped=6;const keys=input();for(let n=0;n<7;n++){keys.jump=true;p.update(1/60,keys,empty(),state(),fx,audio);}assert(p.trapped>0);keys.jump=true;p.update(1/60,keys,empty(),state(),fx,audio);assert.equal(p.trapped,0);assert(p.invincible>0);
});
test('clock boss progresses through three phases and dies after eighteen separate hits',()=>{
  const l=createLevel(4),b=new Boss('clock',l),p=new Player(bX(l)-105),s=state();b.active=true;p.attack=.15;const phases=new Set();
  function bX(level){return level.length-585;}
  for(let n=1;n<=18;n++){p.attackId=n;b.update(1/60,p,l,s,fx,audio,()=>{});if(!b.dead)b.update(1/60,p,l,s,fx,audio,()=>{});phases.add(b.phase);}
  assert.deepEqual([...phases],[1,2,3]);assert(b.dead);assert.equal(b.hp,0);assert.equal(l.projectiles.length,0);
});
test('chai caps energy at 100, Wi-Fi lasts eight seconds, documents charge phone',()=>{
  const {g}=fixture();g.state.energy=90;g.collect({type:'chai',x:0,y:0});assert.equal(g.state.energy,100);assert.equal(g.state.chai,1);g.collect({type:'wifi',x:0,y:0});assert.equal(g.state.wifi,8);g.state.phone=10;g.collect({type:'document',x:0,y:0});assert.equal(g.state.documents,1);assert.equal(g.state.phone,22);assert.equal(g.state.score,800);
});
test('phone slows the environment while five-minute meeting clock stays in real time',()=>{
  const {g,keys}=fixture();keys.pressed.add('KeyF');g.update(1/60);keys.finishFrame();for(let i=0;i<59;i++)g.update(1/60);assert(Math.abs(g.state.time-299)<.001);assert(g.level.time<.35);assert(g.state.slow>3.9&&g.state.slow<4.1);assert(g.state.phone<4);
});
test('pause prevents movement and countdown',()=>{
  const {g}=fixture();g.pause();const time=g.state.time,x=g.player.x;g.update(1);assert.equal(g.state.time,time);assert.equal(g.player.x,x);g.resume();g.update(1/60);assert(g.state.time<time);
});
test('chapter exits advance and persist unlocks; boss locks the final exit',()=>{
  const {g}=fixture(0);g.player.x=g.level.exit.x;g.update(1/60);assert.equal(g.level.index,1);assert.equal(g.save.data.unlocked,2);
  g.loadLevel(4);g.transition=0;g.player.x=g.level.exit.x;g.update(1/60);assert.equal(g.mode,'playing');g.boss.dead=true;g.update(1/60);assert.equal(g.mode,'ending');assert(g.state.won);
});
test('timer and energy exhaustion freeze the run at a terminal result',()=>{
  const a=fixture();a.g.state.time=.001;a.g.update(1/60);assert.equal(a.g.mode,'results');assert.deepEqual(a.records,['late']);
  const b=fixture();b.g.state.energy=0;b.g.update(1/60);assert.equal(b.g.mode,'results');assert.deepEqual(b.records,['energy']);
});
test('save records retain best score and highest rank independently',()=>{
  const m=memory(),s=new Save(m);s.record(15000,'B');s.record(10000,'A');s.unlock(3);const restored=new Save(m);assert.equal(restored.data.highScore,15000);assert.equal(restored.data.highRank,'A');assert.equal(restored.data.unlocked,4);assert.equal(restored.data.runs,2);
});
test('corrupted or unavailable storage does not prevent play',()=>{
  const s=new Save({getItem(){throw new Error('Blocked');},setItem(){throw new Error('Quota');}});s.unlock(2);assert.equal(s.data.unlocked,3);const corrupt=new Save({getItem:()=>'{bad',setItem(){}});assert.equal(corrupt.data.highScore,0);
});
test('losses cannot earn unused-time bonuses; victory score and ranks are deterministic',()=>{
  const s={...state(),score:5000};assert.equal(finalScore(s),5000);s.won=true;s.time=100;s.damage=10;assert.equal(finalScore(s),13700);assert.equal(rankFor({score:23000,damage:20,won:true}),'S');assert.equal(rankFor({score:50000,won:false}),'D');assert.equal(timeLabel(299.9),'05:00');assert.equal(timeLabel(0),'00:00');
});
