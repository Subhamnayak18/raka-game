export const clamp = (n, low, high) => Math.max(low, Math.min(high, n));
export const approach = (n, target, step) => n < target ? Math.min(n + step, target) : Math.max(n - step, target);
export const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
export const timeLabel = (seconds) => { const n = Math.max(0, Math.ceil(seconds)); return `${Math.floor(n / 60).toString().padStart(2, '0')}:${(n % 60).toString().padStart(2, '0')}`; };
export function seeded(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
export function rankFor({ score, damage = 0, won = true }) {
  if (!won) return 'D';
  if (score >= 22000 && damage <= 80) return 'S';
  if (score >= 15500) return 'A';
  if (score >= 10000) return 'B';
  if (score >= 5000) return 'C';
  return 'D';
}
export function finalScore(state) {
  return Math.round(state.score + (state.won ? Math.max(0, state.time) * 35 + Math.max(0, 100 - state.damage) * 30 + 2500 : 0));
}
