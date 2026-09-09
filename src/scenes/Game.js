import { START_TIME, FLOOR } from '../config/game.js';
import { createLevel } from '../config/levels.js';
import { Player } from '../entities/Player.js';
import { Boss } from '../entities/Boss.js';
import { updateEnemies } from '../entities/Enemies.js';
import { Effects } from '../systems/Effects.js';
import { overlap } from '../utils/math.js';
export class Game {
  constructor(input,audio,save,renderer,hooks){this.input=input;this.audio=audio;this.save=save;this.renderer=renderer;this.hooks=hooks;this.mode='menu';this.accumulator=0;this.last=0;this.hudClock=0;this.endingTime=0;this.raf=0;}
  start(index=0){this.state={time:START_TIME,energy:100,score:0,documents:0,chai:0,wifi:0,chaiBoost:0,phone:100,slow:0,damage:0,combo:0,comboTime:0,defeated:0,won:false,startLevel:index};this.endingTime=0;this.mode='playing';this.input.enabled=true;this.input.clear();this.loadLevel(index);this.last=performance.now();if(!this.raf)this.loop(this.last);}
  loadLevel(index){this.level=createLevel(index);this.player=new Player();this.boss=this.level.boss?new Boss(this.level.boss,this.level):null;this.fx=new Effects();this.renderer.reset();this.transition=1.8;this.save.unlock(index);this.hooks.chapter(this.level);this.hooks.hud(this);}
  loop(now){const dt=Math.min(.05,Math.max(0,(now-this.last)/1000));this.last=now;
    if(this.mode==='playing'||this.mode==='ending'){
      this.accumulator+=dt;let steps=0;while(this.accumulator>=1/60&&steps<4){this.update(1/60);this.input.finishFrame();this.accumulator-=1/60;steps++;}
      this.renderer.draw(this,dt);this.hudClock+=dt;if(this.hudClock>.075){this.hooks.hud(this);this.hudClock=0;}
    }else this.accumulator=0;
    this.raf=requestAnimationFrame(t=>this.loop(t));
  }
  update(dt){
    const s=this.state,p=this.player,fx=this.fx;fx.update(dt);
    if(this.mode==='ending'){this.endingTime+=dt;if(this.endingTime<1.5){p.x+=dt*42;p.vx=42;p.walk+=dt*5;}else p.vx=0;this.audio.update(dt,'victory');if(this.endingTime>2.5){this.mode='results';this.hooks.ending();}return;}
    if(this.mode!=='playing')return;
    if(this.transition>0){this.transition-=dt;return;}
    s.time=Math.max(0,s.time-dt);if(s.time<=0){this.finish(false,'late');return;}
    if(s.energy<=0){this.finish(false,'energy');return;}
    s.wifi=Math.max(0,s.wifi-dt);s.chaiBoost=Math.max(0,s.chaiBoost-dt);s.slow=Math.max(0,s.slow-dt);s.comboTime=Math.max(0,s.comboTime-dt);s.phone=Math.min(100,s.phone+dt*3.2);
    if(s.comboTime<=0)s.combo=0;
    if(this.input.hit('KeyF')){if(s.phone>=99.9&&s.slow<=0){s.phone=0;s.slow=5;this.hooks.toast('DO NOT DISTURB MODE');this.audio.sound('phone');fx.burst(p.centerX,p.y+50,'#74e5dc',30,220);}else this.hooks.toast(`PHONE RECHARGING · ${Math.floor(s.phone)}%`);}
    if(fx.hitstop>0)return;
    const worldDt=dt*(s.slow>0?.28:1);
    updateEnemies(this.level,p,s,worldDt,fx,this.audio,this.hooks.toast);
    p.update(dt,this.input,this.level,s,fx,this.audio);
    if(this.boss)this.boss.update(worldDt,p,this.level,s,fx,this.audio,this.hooks.toast);
    for(const h of this.level.hazards){h.life-=worldDt;h.warmup=Math.max(0,(h.warmup||0)-worldDt);if(h.warmup<=0&&overlap(p,h))p.damage(h.type==='sweep'?15:13,h,s,fx,this.audio);}
    this.level.hazards=this.level.hazards.filter(h=>h.life>0);
    if(p.y>790){p.invincible=0;p.damage(14,{x:p.x+10},s,fx,this.audio);s.time=Math.max(0,s.time-2);p.x=p.lastSafe;p.y=FLOOR-150;p.vx=0;p.vy=0;p.invincible=1.8;this.hooks.toast('MINOR DETOUR. −2 SECONDS.');}
    for(const item of this.level.pickups){if(!item.collected&&overlap({x:p.x-13,y:p.y-22,w:p.w+26,h:p.h+30},item)){item.collected=true;this.collect(item);}}
    for(const hint of this.level.hints){if(!hint.seen&&p.x>=hint.x){hint.seen=true;this.hooks.hint(hint.text);}}
    this.audio.update(dt,this.boss?.active&&!this.boss.dead?'boss':s.time<60||s.energy<26?'danger':'normal');
    if(p.x>this.level.exit.x-10&&(!this.boss||this.boss.dead)){
      if(this.level.index===4){s.won=true;this.mode='ending';this.endingTime=.01;this.input.enabled=false;p.vx=0;p.facing=1;this.audio.sound('victory');this.hooks.hint('You made it. Was it worth it?');}
      else{this.audio.sound('collect');s.energy=Math.min(100,s.energy+15);s.score+=1000;this.loadLevel(this.level.index+1);}
    }
    if(s.energy<=0)this.finish(false,'energy');
  }
  collect(item){const s=this.state;const fx=this.fx;const x=item.x+18;const y=item.y;
    if(item.type==='document'){s.documents++;s.score+=500;s.phone=Math.min(100,s.phone+12);fx.text(x,y,'+500');this.audio.sound('collect');}
    if(item.type==='chai'){s.chai++;s.energy=Math.min(100,s.energy+25);s.chaiBoost=6;s.score+=200;this.hooks.toast('CHAI POWER +25');fx.text(x,y,'+25 ENERGY','#f4c066',16);this.audio.sound('chai');}
    if(item.type==='wifi'){s.wifi=8;s.score+=100;this.hooks.toast('FULL NETWORK! · SPEED +30%');this.audio.sound('phone');}
    fx.burst(x,y+15,item.type==='wifi'?'#77dfd4':'#f5c366',12,135);
  }
  pause(){if(this.mode!=='playing')return;this.mode='paused';this.input.enabled=false;this.input.clear();this.hooks.pause();}
  resume(){if(this.mode!=='paused')return;this.mode='playing';this.input.enabled=true;this.input.clear();this.last=performance.now();}
  stop(){this.mode='menu';this.input.enabled=false;this.input.clear();}
  finish(won,reason){if(this.mode==='results')return;this.state.won=won;this.mode='results';this.input.enabled=false;this.input.clear();this.hooks.finish(reason);}
}
