const KEY = 'sir-on-a-mission-v1';
const DEFAULTS = { highScore: 0, highRank: '—', unlocked: 1, muted: true, music: true, volume: .45, reducedMotion: false, runs: 0 };
export class Save {
  constructor(storage) {
    if (storage === undefined) { try { storage = globalThis.localStorage; } catch { storage = null; } }
    this.storage = storage;
    try { this.data = { ...DEFAULTS, ...JSON.parse(storage?.getItem(KEY) || '{}') }; } catch { this.data = { ...DEFAULTS }; }
    this.data.unlocked = Math.min(5, Math.max(1, Number(this.data.unlocked) || 1));
    this.data.highScore = Math.max(0, Number(this.data.highScore) || 0);
    if (!['—','D','C','B','A','S'].includes(this.data.highRank)) this.data.highRank = '—';
    this.data.runs = Math.max(0, Math.floor(Number(this.data.runs) || 0));
    this.data.volume = Math.min(1, Math.max(0, Number(this.data.volume) || 0));
  }
  set(values) { Object.assign(this.data, values); try { this.storage?.setItem(KEY, JSON.stringify(this.data)); } catch {} }
  unlock(level) { this.set({ unlocked: Math.max(this.data.unlocked, Math.min(5, level + 1)) }); }
  record(score, rank) {
    const order = ['—', 'D', 'C', 'B', 'A', 'S'];
    this.set({ highScore: Math.max(this.data.highScore, score), highRank: order.indexOf(rank) > order.indexOf(this.data.highRank) ? rank : this.data.highRank, runs: this.data.runs + 1 });
  }
}
