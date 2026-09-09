export class AudioSystem {
  constructor(save) { this.save = save; this.ctx = null; this.mode = 'normal'; this.beat = 0; this.clock = 0; }
  unlock() {
    if (!this.ctx) { const AudioContext = window.AudioContext || window.webkitAudioContext; if (!AudioContext) return; this.ctx = new AudioContext(); this.master = this.ctx.createGain(); this.master.connect(this.ctx.destination); }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    this.apply();
  }
  apply() { if (this.master) this.master.gain.setTargetAtTime(this.save.data.muted ? 0 : this.save.data.volume * .34, this.ctx.currentTime, .04); }
  tone(freq, duration = .1, type = 'sine', gain = .2, end = freq, delay = 0) {
    if (!this.ctx || this.save.data.muted) return;
    const t = this.ctx.currentTime + delay; const osc = this.ctx.createOscillator(); const env = this.ctx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(Math.max(20, freq), t); osc.frequency.exponentialRampToValueAtTime(Math.max(20, end), t + duration);
    env.gain.setValueAtTime(.001, t); env.gain.exponentialRampToValueAtTime(Math.max(.002, gain), t + .008); env.gain.exponentialRampToValueAtTime(.001, t + duration);
    osc.connect(env); env.connect(this.master); osc.start(t); osc.stop(t + duration + .02);
  }
  sound(name) {
    switch (name) {
      case 'jump': this.tone(220, .17, 'triangle', .33, 620); break;
      case 'dash': this.tone(160, .16, 'sawtooth', .10, 900); break;
      case 'swing': this.tone(360, .15, 'triangle', .25, 70); break;
      case 'impact': this.tone(100, .16, 'square', .24, 28); this.tone(540, .05, 'triangle', .17, 80); break;
      case 'hurt': this.tone(155, .3, 'sawtooth', .19, 42); break;
      case 'collect': [660, 880, 1320].forEach((f, i) => this.tone(f, .12, 'sine', .23, f, i * .055)); break;
      case 'chai': [392, 494, 587, 784].forEach((f, i) => this.tone(f, .16, 'triangle', .28, f, i * .055)); break;
      case 'phone': [880, 1175].forEach((f, i) => this.tone(f, .4, 'sine', .25, f, i * .12)); break;
      case 'alarm': this.tone(710, .15, 'square', .12, 790); this.tone(710, .15, 'square', .12, 790, .2); break;
      case 'boss': [98, 104, 110].forEach((f, i) => this.tone(f, .45, 'sawtooth', .13, f / 2, i * .13)); break;
      case 'victory': [392, 494, 587, 784, 988, 1175].forEach((f, i) => this.tone(f, .35, 'triangle', .3, f, i * .1)); break;
      case 'stomp': this.tone(130, .09, 'triangle', .23, 55); break;
    }
  }
  update(dt, mode = 'normal') {
    if (!this.ctx || this.save.data.muted || !this.save.data.music) return;
    if (mode !== this.mode) { this.mode = mode; this.beat = 0; }
    this.clock -= dt; if (this.clock > 0) return;
    this.clock = mode === 'boss' ? .18 : mode === 'danger' ? .22 : mode === 'victory' ? .28 : .3;
    const notes = mode === 'boss' ? [73.42, 73.42, 82.41, 69.30, 73.42, 110, 98, 82.41] : mode === 'victory' ? [130.81, 164.81, 196, 261.63, 196, 164.81, 146.83, 196] : [98, 98, 146.83, 130.81, 98, 116.54, 130.81, 146.83];
    const f = notes[this.beat % notes.length];
    this.tone(f, this.clock * .8, 'triangle', .12, f);
    if (this.beat % 2 === 0) this.tone(70, .08, 'sine', .2, 32);
    if (this.beat % 4 === 3) this.tone(f * 4, .1, 'sine', .055, f * 4);
    this.beat++;
  }
}
