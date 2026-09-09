import { FLOOR } from '../config/game.js';
import { clamp, overlap } from '../utils/math.js';
import { projectile } from './Enemies.js';
export class Boss {
  constructor(type,level) { this.type=type;this.x=level.length-585;this.y=FLOOR-(type==='clock'?228:146);this.w=type==='clock'?202:166;this.h=type==='clock'?228:146;this.maxHp=type==='clock'?18:7;this.hp=this.maxHp;this.active=false;this.dead=false;this.time=0;this.cooldown=2;this.phase=1;this.attack=0;this.warning='Get close. Swing the bag.';this.telegraph=0;this.wave=0;this.hitIds=new Set();this.flash=0;this.intro=0; }
  update(dt,player,level,state,fx,audio,toast) {
    if(this.dead)return;
    if(!this.active){if(player.x>this.x-800){this.active=true;this.intro=1.8;audio.sound('boss');toast(this.type==='clock'?'THE DEADLINE HAS ARRIVED':'THE PRINTER FROM HELL');fx.shake=7;}else return;}
    this.time+=dt;this.intro=Math.max(0,this.intro-dt);this.flash=Math.max(0,this.flash-dt);
    const nextPhase=this.type==='clock'?clamp(1+Math.floor((this.maxHp-this.hp)/6),1,3):1;
    if(nextPhase!==this.phase){this.phase=nextPhase;this.cooldown=2;this.telegraph=0;fx.impact(this.x+this.w/2,this.y+70,true);audio.sound('boss');toast(this.phase===2?'PHASE 2 · YOU HAVE 47 UNREAD EMAILS':'PHASE 3 · EVERYTHING IS URGENT!!!');}
    if(player.attacking&&overlap(player.attackBox,this)&&!this.hitIds.has(player.attackId)){
      this.hitIds.add(player.attackId);this.hp--;this.flash=.16;state.score+=150;state.phone=Math.min(100,state.phone+4);fx.impact(player.centerX+player.facing*75,player.y+30,true);fx.text(this.x+this.w/2,this.y-20,'−1','#f9ce74',24);audio.sound('impact');
      if(this.hp<=0){this.dead=true;state.score+=this.type==='clock'?3000:1800;state.defeated++;level.projectiles=[];level.hazards=[];fx.burst(this.x+this.w/2,this.y+80,'#efbb58',65,520);toast(this.type==='clock'?'DEADLINE DEFEATED. CHECK YOUR CALENDAR.':'PRINTER STATUS: RETIRED');audio.sound('victory');return;}
    }
    if(overlap(player,{x:this.x+30,y:this.y+25,w:this.w-60,h:this.h-25}))player.damage(12,this,state,fx,audio);
    if(this.intro>0)return;
    this.cooldown-=dt;
    if(this.cooldown<.85&&this.telegraph===0){this.telegraph=.85;this.attack=(this.attack+1)%(this.type==='clock'?5:3);this.warning=this.type==='clock'?['CLOCK HAND SWEEP · JUMP','ALARM WAVE · JUMP','EMAIL STORM · KEEP MOVING','CALENDAR INVITE · MOVE OUT','URGENT!!! · DUCK OR JUMP'][this.attack]:['PAPER JAM · DUCK','LOW INK · KEEP MOVING','ERROR 404 · JUMP'][this.attack];audio.sound('alarm');}
    if(this.telegraph>0)this.telegraph=Math.max(.001,this.telegraph-dt);
    if(this.cooldown<=0){this.strike(player,level,fx,audio);this.telegraph=0;this.cooldown=this.type==='clock'?2.6-this.phase*.35:2.3;}
  }
  strike(player,level,fx,audio){
    const cx=this.x+this.w/2;
    if(this.type==='printer'){
      if(this.attack===0){for(let i=0;i<4;i++)projectile(level,this.x-15-i*12,FLOOR-100,-280-i*15,0,'paper',30);}
      if(this.attack===1){for(let i=0;i<5;i++)projectile(level,cx,this.y-20,-130-i*42,-180-i*20,'ink',22);}
      if(this.attack===2){for(let i=0;i<3;i++)projectile(level,this.x-i*90,FLOOR-40,-300,0,'error',34);}
      audio.sound('impact');return;
    }
    const speed=250+this.phase*45;
    if(this.attack===0)level.hazards.push({type:'sweep',x:this.x-700,y:FLOOR-28,w:700,h:28,life:.42});
    if(this.attack===1){for(let i=0;i<this.phase+1;i++)projectile(level,this.x-i*115,FLOOR-41,-speed,0,'wave',44);}
    if(this.attack===2){for(let i=0;i<6+this.phase*2;i++)projectile(level,player.x-360+i*110,125+Math.random()*60,-35,190+Math.random()*80,'paper',28);}
    if(this.attack===3){for(let i=0;i<this.phase;i++)level.hazards.push({type:'invite',x:player.x-45+i*175,y:FLOOR-160,w:135,h:160,life:1.35,warmup:.8});}
    if(this.attack===4){for(let i=0;i<3+this.phase;i++)projectile(level,this.x-i*70,FLOOR-(i%2?100:40),-speed,0,'urgent',42);}
    fx.shake=this.phase===3?10:5;audio.sound('boss');
  }
}
