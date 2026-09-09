import { FLOOR } from '../config/game.js';
import { overlap } from '../utils/math.js';
export function projectile(level,x,y,vx,vy,type='paper',size=27) { level.projectiles.push({x,y,w:size,h:size*.8,vx,vy,type,life:7,spin:Math.random()*6}); }
export function updateEnemies(level,player,state,dt,fx,audio,toast) {
  level.time+=dt;
  for(const platform of level.platforms){if(platform.moving)platform.y=platform.originY+Math.sin(level.time*1.7)*58;}
  for(const o of level.objects){
    if(o.dead)continue;
    if(o.type==='gate'){o.open=Math.sin(level.time*1.5+o.phase)>.1;continue;}
    if(Math.abs(o.originX-player.x)>1500)continue;
    if(o.type==='paper'){o.y=o.originY+Math.sin(level.time*2.2+o.phase)*62;o.x=o.originX+Math.sin(level.time*1.1+o.phase)*78;}
    if(['rolling','auto','cycle','dog','crowd','guard'].includes(o.type)){const speed=o.type==='auto'?1.3:o.type==='dog'?1.7:.85;const range=o.type==='auto'?115:o.type==='guard'?55:75;o.x=o.originX+Math.sin(level.time*speed+o.phase)*range;}
    if(o.type==='printer'){o.cooldown-=dt;if(o.cooldown<=0&&Math.abs(o.x-player.x)<760){const direction=player.x<o.x?-1:1;projectile(level,o.x+o.w/2,o.y+10,direction*245,-25,'paper');o.cooldown=1.7;audio.tone(110,.08,'square',.08,180);}}
    if(player.attacking&&overlap(player.attackBox,o)&&!o.hitIds.has(player.attackId)&&!['gate','meeting','guard','crowd','cable'].includes(o.type)){
      o.hitIds.add(player.attackId);o.hp--;fx.impact(o.x+o.w/2,o.y+o.h/2);audio.sound('impact');
      if(o.hp<=0){o.dead=true;state.defeated++;state.combo=state.comboTime>0?state.combo+1:1;state.comboTime=2.5;const points=150*Math.min(5,state.combo);state.score+=points;state.phone=Math.min(100,state.phone+7);fx.text(o.x+o.w/2,o.y-10,`+${points}${state.combo>1?' ×'+Math.min(5,state.combo):''}`);if(state.combo>=3)toast(`${Math.min(5,state.combo)}× COMBO · PRODUCTIVITY +100`);}
    }
    if(o.dead)continue;
    if(o.type==='meeting'&&overlap(player,o)&&player.invincible<=0){player.trapped=6;player.escape=0;o.dead=true;toast('JUST ONE QUICK MEETING');audio.sound('alarm');}
    if(o.hostile&&overlap(player,o)){player.damage(o.type==='auto'?16:10,o,state,fx,audio);}
    if(o.type==='cable'&&overlap(player,o))player.damage(7,o,state,fx,audio);
  }
  for(const p of level.projectiles){
    p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.spin+=dt*4;if(p.type==='ink')p.vy+=180*dt;
    if(player.attacking&&overlap(player.attackBox,p)){p.life=0;state.score+=50;fx.burst(p.x,p.y,'#f5dfaf',6,100);}
    else if(overlap(player,p)){if(player.damage(p.type==='urgent'?13:9,p,state,fx,audio))p.life=0;}
  }
  level.projectiles=level.projectiles.filter(p=>p.life>0&&p.y<850&&p.x>player.x-1500&&p.x<player.x+1600);
}
