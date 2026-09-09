export class Effects {
  constructor() { this.particles = []; this.labels = []; this.shake = 0; this.flash = 0; this.hitstop = 0; }
  burst(x, y, color = '#f0bb4b', amount = 16, force = 270) {
    for (let i = 0; i < amount; i++) { const angle = Math.random() * Math.PI * 2; const speed = force * (.3 + Math.random()); const life = .35 + Math.random() * .45; this.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life, max: life, size: 2 + Math.random() * 5, color }); }
    if (this.particles.length > 350) this.particles.splice(0, this.particles.length - 350);
  }
  text(x, y, value, color = '#f7cf75', size = 19) { this.labels.push({ x, y, value, color, size, life: 1.05 }); }
  impact(x, y, large = false) { this.burst(x, y, large ? '#ff9d62' : '#efb744', large ? 30 : 18, large ? 360 : 240); this.shake = large ? 11 : 5; this.flash = large ? .18 : .045; this.hitstop = large ? .09 : .045; }
  update(dt) {
    this.shake = Math.max(0, this.shake - dt * 25); this.flash = Math.max(0, this.flash - dt); this.hitstop = Math.max(0, this.hitstop - dt);
    for (const p of this.particles) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 650 * dt; p.vx *= 1 - dt * 1.7; }
    this.particles = this.particles.filter(p => p.life > 0);
    for (const t of this.labels) { t.life -= dt; t.y -= dt * 44; } this.labels = this.labels.filter(t => t.life > 0);
  }
  draw(ctx) {
    for (const p of this.particles) { ctx.globalAlpha = Math.min(1, p.life / p.max); ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, p.size, p.size); }
    ctx.textAlign = 'center';
    for (const t of this.labels) { ctx.globalAlpha = Math.min(1, t.life * 2); ctx.font = `bold ${t.size}px monospace`; ctx.lineWidth = 4; ctx.strokeStyle = '#192317'; ctx.strokeText(t.value, t.x, t.y); ctx.fillStyle = t.color; ctx.fillText(t.value, t.x, t.y); }
    ctx.globalAlpha = 1;
  }
}
