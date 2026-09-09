import { WIDTH, HEIGHT, PROP } from '../config/game.js';
export function standUp(canvas, assets, onComplete) {
  const ctx = canvas.getContext('2d'); const start = performance.now(); let cancelled = false;
  canvas.classList.remove('hidden');
  const draw = now => {
    if (cancelled) return;
    const t = Math.min(1, (now - start) / 1400); const ease = 1 - Math.pow(1 - t, 3);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);ctx.globalAlpha = Math.min(1, t * 5);
    const image=assets.environments;ctx.drawImage(image,0,0,image.width,image.height/5,0,0,WIDTH,HEIGHT);
    ctx.fillStyle='#1e271c35';ctx.fillRect(0,0,WIDTH,HEIGHT);
    assets.prop(ctx,PROP.chair,770,440,150,215);
    assets.characterFrame(ctx,t<.28?5:0,862,650,{scale:.65+(ease*.05),alpha:1});
    if(t<.75){const bagX=1015-(ease*140);const bagY=570-(ease*170);assets.prop(ctx,PROP.bag,bagX,bagY,95,78,-.2+ease*.2);}
    ctx.globalAlpha=1;
    if(t<1)requestAnimationFrame(draw);else onComplete?.();
  };
  requestAnimationFrame(draw);
  return ()=>{cancelled=true;canvas.classList.add('hidden');};
}
export function meetingRoom(canvas, assets) {
  canvas.classList.remove('hidden');const ctx=canvas.getContext('2d');const image=assets.environments;
  ctx.drawImage(image,0,image.height*3/5,image.width,image.height/5,0,0,WIDTH,HEIGHT);
  ctx.fillStyle='#15261c55';ctx.fillRect(0,0,WIDTH,HEIGHT);
  assets.officeProp(ctx,0,1070,320,155,290);
  assets.officeProp(ctx,1,940,340,150,265);
  assets.prop(ctx,PROP.door,670,240,155,360);
  assets.characterFrame(ctx,8,880,645,{scale:.7});
}
