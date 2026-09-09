import { PHYSICS, FLOOR } from '../config/game.js';
import { approach, clamp, overlap } from '../utils/math.js';
export class Player {
  constructor(x=125,y=FLOOR-120) { this.x=x;this.y=y;this.w=43;this.h=120;this.vx=0;this.vy=0;this.facing=1;this.grounded=true;this.coyote=.12;this.buffer=0;this.duck=false;this.dash=0;this.dashCooldown=0;this.attack=0;this.attackCooldown=0;this.attackId=0;this.invincible=0;this.hurt=0;this.walk=0;this.trapped=0;this.escape=0;this.lastSafe=x;this.trail=[]; }
  get centerX(){return this.x+this.w/2;}
  get feet(){return this.y+this.h;}
  get attacking(){return this.attack>.045 && this.attack<.24;}
  get attackBox(){return {x:this.facing>0?this.centerX:this.centerX-142,y:this.y-15,w:142,h:this.h+25};}
  update(dt,input,level,state,fx,audio) {
    this.hurt=Math.max(0,this.hurt-dt);this.invincible=Math.max(0,this.invincible-dt);this.dashCooldown=Math.max(0,this.dashCooldown-dt);this.attackCooldown=Math.max(0,this.attackCooldown-dt);this.attack=Math.max(0,this.attack-dt);this.dash=Math.max(0,this.dash-dt);this.buffer=Math.max(0,this.buffer-dt);
    const jump=input.jump; if(jump)this.buffer=PHYSICS.buffer;
    if(this.trapped>0){ this.trapped-=dt;this.vx=0;this.buffer=0;if(jump){this.escape++;audio.sound('stomp');}if(this.escape>=8||this.trapped<=0){this.trapped=0;this.escape=0;this.invincible=1;fx.text(this.centerX,this.y-25,'COULD HAVE BEEN AN EMAIL', '#f3c760',15);}return; }
    const duck=input.down('KeyS','ArrowDown')&&this.grounded&&this.dash===0;
    if(duck!==this.duck){const oldH=this.h;const next=duck?69:120;const test={x:this.x,y:this.y+oldH-next,w:this.w,h:next};if(duck||![...level.platforms,...level.objects.filter(o=>o.solid&&!o.dead&&!o.open)].some(o=>overlap(test,o))){this.y+=oldH-next;this.h=next;this.duck=duck;}}
    let axis=input.axis; if(axis)this.facing=axis;
    const speed=PHYSICS.speed*(state.wifi>0?1.3:1)*(state.chaiBoost>0?1.16:1)*(this.duck?.4:1);
    if(input.hit('ShiftLeft','ShiftRight')&&this.dashCooldown<=0&&!this.duck){this.dash=PHYSICS.dashDuration;this.dashCooldown=PHYSICS.dashCooldown;this.invincible=Math.max(this.invincible,.21);audio.sound('dash');fx.burst(this.centerX,this.feet-50,'#68cfc4',10,120);}
    if(input.hit('KeyE')&&this.attackCooldown<=0){this.attack=.29;this.attackCooldown=PHYSICS.attackCooldown;this.attackId++;audio.sound('swing');}
    if(this.grounded)this.coyote=PHYSICS.coyote;else this.coyote-=dt;
    if(this.buffer>0&&this.coyote>0&&!this.duck){this.vy=-PHYSICS.jump;this.grounded=false;this.coyote=0;this.buffer=0;audio.sound('jump');fx.burst(this.centerX,this.feet,'#dfc590',7,85);}
    if(input.up('Space','KeyW','ArrowUp')&&this.vy < -240)this.vy*=.52;
    if(this.dash>0){this.vx=this.facing*PHYSICS.dashSpeed;this.vy=Math.min(80,this.vy);}else{this.vx=approach(this.vx,axis*speed,(axis?PHYSICS.acceleration:PHYSICS.friction)*dt);this.vy=Math.min(1050,this.vy+PHYSICS.gravity*dt);}
    const solids=[...level.floor,...level.platforms,...level.objects.filter(o=>o.solid&&!o.dead&&!o.open)];
    this.x+=this.vx*dt;
    for(const s of solids){if(overlap(this,s)&&this.feet>s.y+5&&this.y<s.y+s.h-4){if(this.vx>0)this.x=s.x-this.w;else if(this.vx<0)this.x=s.x+s.w;this.vx=0;}}
    this.x=clamp(this.x,15,level.length-this.w-20);
    const oldFeet=this.feet;const oldY=this.y;this.y+=this.vy*dt;this.grounded=false;
    for(const s of solids){if(this.x+this.w>s.x+1&&this.x<s.x+s.w-1){if(this.vy>=0&&oldFeet<=s.y+8&&this.feet>=s.y){this.y=s.y-this.h;this.vy=0;this.grounded=true;if(s.moving)this.y=s.y-this.h;}else if(this.vy<0&&oldY>=s.y+s.h-4&&this.y<=s.y+s.h){this.y=s.y+s.h;this.vy=30;}}}
    if(this.grounded&&Math.abs(this.feet-FLOOR)<3&&this.x>this.lastSafe+310&&level.floor.some(f=>this.x>f.x+80&&this.x+this.w<f.x+f.w-120))this.lastSafe=this.x-40;
    this.walk+=Math.abs(this.vx)*dt*.044;
    if(this.dash>0){this.trail.push({x:this.centerX,y:this.feet,life:.19,frame:this.frame});}
    for(const t of this.trail)t.life-=dt;this.trail=this.trail.filter(t=>t.life>0).slice(-10);
  }
  damage(amount,source,state,fx,audio) {
    if(this.invincible>0)return false;
    state.energy=Math.max(0,state.energy-amount);state.damage+=amount;state.combo=0;this.invincible=1.2;this.hurt=.3;this.vx=(source.x<this.centerX?1:-1)*240;this.vy=-180;
    fx.impact(this.centerX,this.y+50);fx.text(this.centerX,this.y-20,`−${amount} ENERGY`,'#ffa083',16);audio.sound('hurt');return true;
  }
  get frame(){if(this.trapped>0)return 9;if(this.hurt>0)return 7;if(this.attack>0)return 6;if(this.duck)return 5;if(!this.grounded)return this.vy<0?3:4;if(Math.abs(this.vx)>190)return Math.sin(this.walk)>0?2:1;if(Math.abs(this.vx)>15)return Math.sin(this.walk)>0?1:0;return 0;}
}
