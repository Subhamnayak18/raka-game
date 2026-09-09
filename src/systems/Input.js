const GAME_KEYS = new Set(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','KeyA','KeyD','KeyW','KeyS','KeyE','KeyF','ShiftLeft','ShiftRight']);
export class Input {
  constructor() {
    this.held = new Set(); this.pressed = new Set(); this.released = new Set(); this.enabled = false;
    window.addEventListener('keydown', e => {
      if (!this.enabled || !GAME_KEYS.has(e.code)) return;
      e.preventDefault();
      if (!this.held.has(e.code) && !e.repeat) this.pressed.add(e.code);
      this.held.add(e.code);
    });
    window.addEventListener('keyup', e => { this.held.delete(e.code); this.released.add(e.code); });
    window.addEventListener('blur', () => this.clear());
    for (const el of document.querySelectorAll('[data-key]')) {
      const code = el.dataset.key;
      el.addEventListener('pointerdown', e => { e.preventDefault(); if (!this.enabled) return; el.setPointerCapture(e.pointerId); this.held.add(code); this.pressed.add(code); el.classList.add('pressed'); });
      const release = e => { e.preventDefault(); this.held.delete(code); this.released.add(code); el.classList.remove('pressed'); };
      el.addEventListener('pointerup', release); el.addEventListener('pointercancel', release); el.addEventListener('lostpointercapture', release);
    }
  }
  down(...keys) { return keys.some(k => this.held.has(k)); }
  hit(...keys) { return keys.some(k => this.pressed.has(k)); }
  up(...keys) { return keys.some(k => this.released.has(k)); }
  finishFrame() { this.pressed.clear(); this.released.clear(); }
  clear() { this.held.clear(); this.pressed.clear(); this.released.clear(); document.querySelectorAll('.pressed').forEach(el => el.classList.remove('pressed')); }
  get axis() { return Number(this.down('ArrowRight', 'KeyD')) - Number(this.down('ArrowLeft', 'KeyA')); }
  get jump() { return this.hit('Space', 'KeyW', 'ArrowUp'); }
}
