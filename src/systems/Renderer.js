import { WIDTH, HEIGHT, FLOOR, PROP } from '../config/game.js';
import { clamp, timeLabel } from '../utils/math.js';
export class Renderer {
  constructor(canvas,assets,save) {this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.assets=assets;this.save=save;this.camera=0;this.tick=0;}
  reset(){this.camera=0;}
  draw(game,dt){
    const {level,player:p,state,boss,fx}=game;if(!level)return;
    const c=this.ctx;this.tick+=dt;const desired=clamp(p.centerX-WIDTH*.32+p.vx*.12,0,level.length-WIDTH);
    this.camera+=(desired-this.camera)*(1-Math.exp(-dt*6));
    const reduced=this.save.data.reducedMotion;
    const shake=reduced?0:fx.shake;
    c.save();c.clearRect(0,0,WIDTH,HEIGHT);c.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
    this.background(level,state,c);
    const introScale=boss?.intro>0&&!reduced?1+Math.sin(boss.intro/1.8*Math.PI)*.035:1;
    c.save();c.translate(WIDTH/2,HEIGHT/2);c.scale(introScale,introScale);c.translate(-WIDTH/2,-HEIGHT/2);c.translate(-this.camera,0);
    if (level.index===3 && this.assets.office) this.assets.officeProp(c,3,2980,FLOOR-255,205,255);
    this.floor(level,c);
    this.exit(level,boss,c,game.endingTime);
    for(const pickup of level.pickups){if(pickup.collected||!this.visible(pickup.x))continue;const y=pickup.y+Math.sin(this.tick*3+pickup.phase)*6;c.save();c.shadowColor=pickup.type==='wifi'?'#5fffe0':'#ffc766';c.shadowBlur=15;this.assets.prop(c,PROP[pickup.type],pickup.x,y,pickup.w,pickup.h);c.restore();if(pickup.type==='chai'){c.fillStyle='#eac573';c.font='9px monospace';c.textAlign='center';c.fillText('+25',pickup.x+18,y-7);}}
    for(const o of level.objects){if(o.dead||!this.visible(o.x))continue;this.object(o,level,c);}
    if(boss&&!boss.dead)this.boss(boss,c);
    for(const hazard of level.hazards)this.hazard(hazard,c);
    for(const bullet of level.projectiles){if(!this.visible(bullet.x))continue;this.bullet(bullet,c);}
    this.player(p,state,c,game.endingTime);
    fx.draw(c);c.restore();
    if(state.slow>0){const g=c.createRadialGradient(WIDTH/2,HEIGHT/2,220,WIDTH/2,HEIGHT/2,760);g.addColorStop(0,'#38cec800');g.addColorStop(1,'#22b7be45');c.fillStyle=g;c.fillRect(0,0,WIDTH,HEIGHT);c.fillStyle='#7eeade';c.font='11px monospace';c.textAlign='right';c.fillText('DO NOT DISTURB · '+state.slow.toFixed(1)+'s',WIDTH-36,180);}
    if(state.energy<26){c.fillStyle=`rgba(180,48,30,${.04+Math.sin(this.tick*4)*.025})`;c.fillRect(0,0,WIDTH,HEIGHT);}
    if(fx.flash>0&&!reduced){c.fillStyle=`rgba(255,214,136,${fx.flash*1.2})`;c.fillRect(0,0,WIDTH,HEIGHT);}
    c.restore();
  }
  visible(x){return x>this.camera-260&&x<this.camera+WIDTH+260;}
  background(level,state,c){
    const image=this.assets.environments;const sh=image.height/5;const destH=FLOOR+20;const destW=destH*(image.width/sh);const offset=(this.camera*.24)%destW;
    c.fillStyle=level.palette.sky;c.fillRect(0,0,WIDTH,HEIGHT);
    for(let i=-1;i<2;i++)c.drawImage(image,0,sh*level.index,image.width,sh,-offset+i*destW,0,destW,destH);
    const grade=c.createLinearGradient(0,0,0,FLOOR);grade.addColorStop(0,'#0b190a33');grade.addColorStop(.65,'#1b231100');grade.addColorStop(1,'#101a1866');c.fillStyle=grade;c.fillRect(0,0,WIDTH,FLOOR);
    if(level.index===4){c.save();c.globalAlpha=.23;c.font='bold 216px monospace';c.fillStyle='#ffc869';c.textAlign='center';c.fillText(timeLabel(state.time),WIDTH*.57,365);c.restore();}
    c.save();c.globalCompositeOperation='screen';c.globalAlpha=level.index===4?.025:.045;c.fillStyle=level.palette.light;
    for(let i=0;i<4;i++){const x=i*430-this.camera*.09%430;c.beginPath();c.moveTo(x+120,0);c.lineTo(x+205,0);c.lineTo(x-140,FLOOR);c.lineTo(x-420,FLOOR);c.closePath();c.fill();}c.restore();
    if(!this.save.data.reducedMotion){c.fillStyle='#fae4b680';for(let i=0;i<37;i++){const x=((i*153.7-this.camera*.11+Math.sin(this.tick*.15+i)*25)%WIDTH+WIDTH)%WIDTH;const y=(i*71.3+this.tick*(i%2?4:7))%570;c.globalAlpha=.14+((i%4)/12);c.fillRect(x,y,i%3===0?2:1,i%3===0?2:1);}c.globalAlpha=1;}
  }
  floor(level,c){
    for(const f of level.floor){if(f.x+f.w<this.camera||f.x>this.camera+WIDTH)continue;const g=c.createLinearGradient(0,FLOOR,0,HEIGHT);g.addColorStop(0,level.palette.floor);g.addColorStop(1,'#101a16');c.fillStyle=g;c.fillRect(f.x,f.y,f.w,f.h);c.fillStyle=level.palette.edge;c.fillRect(f.x,f.y,f.w,3);c.fillStyle='#0a150d50';c.fillRect(f.x,f.y+9,f.w,8);c.strokeStyle='#cad3aa13';c.lineWidth=1;for(let x=Math.floor(Math.max(f.x,this.camera)/120)*120;x<Math.min(f.x+f.w,this.camera+WIDTH);x+=120){c.beginPath();c.moveTo(x,FLOOR+18);c.lineTo(x-18,FLOOR+110);c.stroke();}c.fillStyle='#c5b98b15';c.fillRect(f.x,FLOOR+55,f.w,1);}
    for(const [x,w] of level.pits){c.fillStyle='#09140d';c.fillRect(x,FLOOR+3,w,180);c.fillStyle='#edbc55';for(let i=0;i<3;i++){c.fillRect(x-18-i*10,FLOOR,5,6);c.fillRect(x+w+12+i*10,FLOOR,5,6);}c.font='10px monospace';c.textAlign='center';c.fillStyle='#edd086';c.fillText(level.index===2?'POTHOLE':'MIND THE GAP',x+w/2,FLOOR+35);}
    for(const f of level.platforms){if(!this.visible(f.x))continue;c.fillStyle='#192d23';c.fillRect(f.x,f.y,f.w,f.h);c.fillStyle=level.palette.edge;c.fillRect(f.x,f.y,f.w,3);c.fillStyle='#d1d4a540';c.fillRect(f.x+6,f.y+7,f.w-12,2);c.strokeStyle='#253628';c.lineWidth=6;c.beginPath();c.moveTo(f.x+8,f.y+f.h);c.lineTo(f.x+23,f.y+f.h+18);c.lineTo(f.x+f.w-23,f.y+f.h+18);c.lineTo(f.x+f.w-8,f.y+f.h);c.stroke();if(f.moving){c.strokeStyle='#cfdfbc44';c.lineWidth=2;c.beginPath();c.moveTo(f.x+9,f.y);c.lineTo(f.x+9,120);c.moveTo(f.x+f.w-9,f.y);c.lineTo(f.x+f.w-9,120);c.stroke();}}
  }
  exit(level,boss,c,ending){
    const e=level.exit;if(!this.visible(e.x))return;
    c.save();c.shadowColor=boss&&!boss.dead?'#ff7445':'#f3d882';c.shadowBlur=20;this.assets.prop(c,PROP.door,e.x,e.y,e.w,e.h);c.restore();
    const locked=boss&&!boss.dead;c.fillStyle=locked?'#cb7760':'#edd69a';c.font='bold 12px monospace';c.textAlign='center';c.fillText(locked?'DEFEAT THE BOSS':level.index===4?'MEETING ROOM':'EXIT →',e.x+e.w/2,e.y-18);
    if(!locked){c.fillStyle=ending?'#fbe5a796':'#fbe5a730';c.beginPath();c.moveTo(e.x+30,e.y+14);c.lineTo(e.x+75,e.y+14);c.lineTo(e.x+128,FLOOR);c.lineTo(e.x-58,FLOOR);c.closePath();c.fill();}
  }
  object(o,level,c){
    if(o.type==='cable'){c.strokeStyle='#ddc546';c.lineWidth=5;c.beginPath();c.moveTo(o.x,o.y+11);c.bezierCurveTo(o.x+20,o.y-13,o.x+50,o.y+27,o.x+o.w,o.y+8);c.stroke();return;}
    if(o.type==='meeting'){c.fillStyle='#f0bd53';c.fillRect(o.x-2,o.y+4,o.w+4,42);c.fillStyle='#222e1e';c.font='bold 12px monospace';c.textAlign='center';c.fillText('QUICK MEETING?',o.x+o.w/2,o.y+22);c.font='10px monospace';c.fillText('Just 2 minutes.',o.x+o.w/2,o.y+38);this.assets.prop(c,PROP.rolling,o.x+28,o.y+44,64,54);return;}
    if(o.type==='gate'){c.save();c.globalAlpha=o.open?.28:1;this.assets.prop(c,PROP.door,o.x,o.y,o.w,o.h);c.restore();c.fillStyle=o.open?'#7ae4b5':'#f07859';c.fillRect(o.x+o.w/2-3,o.y-9,6,6);return;}
    if(o.type==='guard'||o.type==='crowd'||o.type==='bucket'){
      if(this.assets.office){const n=o.type==='guard'?0:o.type==='crowd'?1:2;this.assets.officeProp(c,n,o.x,o.y,o.w,o.h);}else this.assets.prop(c,o.type==='bucket'?PROP.sign:PROP.files,o.x,o.y,o.w,o.h);
      if(o.type!=='bucket'){c.fillStyle='#dfd5ac';c.font='9px monospace';c.textAlign='center';c.fillText(o.type==='guard'?'SECURITY':'EXCUSE ME',o.x+o.w/2,o.y-9);}return;
    }
    const bob=['rolling','auto','cycle'].includes(o.type)?Math.sin(level.time*11)*1.4:0;this.assets.prop(c,PROP[o.type]??PROP.files,o.x,o.y+bob,o.w,o.h,o.type==='paper'?Math.sin(level.time*2+o.phase)*.15:0);
    if(o.type==='auto'&&Math.abs(o.x-this.camera-440)<150){c.fillStyle='#efddac';c.font='11px monospace';c.textAlign='center';c.fillText('Meter se nahi jayega!',o.x+o.w/2,o.y-15);}
  }
  boss(b,c){
    c.save();const wobble=Math.sin(b.time*(b.phase===3?8:2))*3;c.translate(0,wobble);
    if(b.flash>0){c.shadowColor='#fff0c0';c.shadowBlur=35;}else if(b.telegraph>0){c.shadowColor='#ff7142';c.shadowBlur=20+Math.sin(b.time*22)*12;}
    this.assets.prop(c,b.type==='clock'?PROP.clock:PROP.printer,b.x,b.y,b.w,b.h);c.restore();
    if(b.type==='clock'&&b.phase>1){c.save();c.strokeStyle=b.phase===3?'#ff8654aa':'#e6b95b66';c.lineWidth=2;c.setLineDash([5,12]);c.beginPath();c.arc(b.x+b.w/2,b.y+b.h*.51,b.w*.62,0,Math.PI*2);c.stroke();c.restore();}
    if(b.telegraph>0){c.fillStyle='#ffc678';c.font='bold 14px monospace';c.textAlign='center';c.fillText('!',b.x+b.w/2,b.y-18);}
  }
  bullet(p,c){
    if(p.type==='paper'){this.assets.prop(c,PROP.paper,p.x,p.y,p.w,p.h,p.spin);return;}
    if(p.type==='ink'){c.fillStyle='#c24960';c.beginPath();c.arc(p.x+p.w/2,p.y+p.h/2,p.w/2,0,Math.PI*2);c.fill();return;}
    if(p.type==='wave'){c.strokeStyle='#f4be53';c.lineWidth=5;c.beginPath();c.arc(p.x,p.y+p.h,p.w,Math.PI,Math.PI*2);c.stroke();return;}
    c.fillStyle=p.type==='urgent'?'#ef8254':'#dfc68b';c.fillRect(p.x-10,p.y,p.w+22,p.h);c.fillStyle='#1e2417';c.font='bold 10px monospace';c.textAlign='center';c.fillText(p.type==='urgent'?'URGENT!!!':'ERROR',p.x+p.w/2,p.y+p.h/2+4);
  }
  hazard(h,c){
    c.save();if(h.type==='sweep'){c.fillStyle='#ffb04988';c.fillRect(h.x,h.y,h.w,h.h);c.fillStyle='#ffe0a9';c.fillRect(h.x,h.y+2,h.w,4);}else{const warm=h.warmup>0;c.globalAlpha=warm?.3:.8;c.fillStyle='#ee9b4e';c.fillRect(h.x,h.y,h.w,h.h);c.strokeStyle='#fed889';c.setLineDash([5,5]);c.strokeRect(h.x,h.y,h.w,h.h);c.fillStyle='#1b251a';c.textAlign='center';c.font='bold 12px monospace';c.fillText(warm?'INVITE INCOMING':'ATTENDANCE',h.x+h.w/2,h.y+50);c.fillText(warm?'MOVE!':'MANDATORY',h.x+h.w/2,h.y+70);}c.restore();
  }
  player(p,state,c,ending){
    const shadowScale=clamp(1-(FLOOR-p.feet)/320,.25,1);c.fillStyle='#09170c55';c.beginPath();c.ellipse(p.centerX,FLOOR+4,39*shadowScale,7*shadowScale,0,0,Math.PI*2);c.fill();
    if(!this.save.data.reducedMotion)for(const t of p.trail){this.assets.characterFrame(c,t.frame,t.x,t.y,{facing:p.facing,alpha:t.life*.9});}
    const bob=p.grounded&&Math.abs(p.vx)>10?Math.sin(p.walk*2)*1.4:p.grounded?Math.sin(this.tick*2)*.7:0;
    const frame=ending>1.5||state.slow>4.65?8:state.energy<=0?9:p.frame;const alpha=p.invincible>0&&Math.floor(p.invincible*16)%2===0?.45:1;
    this.assets.characterFrame(c,frame,p.centerX,p.feet+bob,{facing:ending?1:p.facing,alpha,tilt:p.attack>.24?-.035*p.facing:0});
    if(p.attacking&&!this.save.data.reducedMotion){c.save();c.translate(p.centerX,p.y+48);c.scale(p.facing,1);c.strokeStyle='#fff0b699';c.lineWidth=4;c.beginPath();c.arc(20,0,78,-1.1,.7);c.stroke();c.strokeStyle='#eabc5855';c.lineWidth=2;c.beginPath();c.arc(20,0,91,-1.1,.7);c.stroke();c.restore();}
    if(p.dashCooldown>.58){c.fillStyle='#7bddcaaa';c.fillRect(p.centerX-20,p.feet+8,40*(1-p.dashCooldown/.85),2);}
    if(state.slow>0){c.strokeStyle='#64e4db99';c.lineWidth=1;c.beginPath();c.ellipse(p.centerX,p.feet+2,52,11,0,0,Math.PI*2);c.stroke();}
  }
}
