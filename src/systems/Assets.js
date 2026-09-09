import { ART, CHARACTER_FRAMES } from '../config/game.js';
function loadImage(url) { return new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(new Error(`Could not load ${url}`)); img.src = url; }); }
function unmatte(image) {
  const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true }); ctx.drawImage(image, 0, 0);
  const frame = ctx.getImageData(0, 0, canvas.width, canvas.height); const data = frame.data; const w = canvas.width; const h = canvas.height;
  const seen = new Uint8Array(w * h); const queue = new Int32Array(w * h); let head = 0; let tail = 0;
  const add = n => { if (n < 0 || n >= w * h || seen[n]) return; seen[n] = 1; const p = n * 4; const hi = Math.max(data[p], data[p + 1], data[p + 2]); const lo = Math.min(data[p], data[p + 1], data[p + 2]); if (lo > 172 && hi - lo < 18) queue[tail++] = n; };
  for (let x = 0; x < w; x++) { add(x); add((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { add(y * w); add(y * w + w - 1); }
  while (head < tail) { const n = queue[head++]; data[n * 4 + 3] = 0; const x = n % w; if (x > 0) add(n - 1); if (x < w - 1) add(n + 1); add(n - w); add(n + w); }
  ctx.putImageData(frame, 0, 0); return canvas;
}
export class Assets {
  async load() {
    const loaded = await Promise.all(Object.entries(ART).map(async ([key, url]) => [key, await loadImage(url)]));
    for (const [key, image] of loaded) this[key] = image;
    this.character = unmatte(this.character); this.props = unmatte(this.props); this.office = unmatte(this.office);
  }
  characterFrame(ctx, index, x, feet, { facing = 1, scale = .32, alpha = 1, tilt = 0 } = {}) {
    const [sx, sy, sw, sh] = CHARACTER_FRAMES[index];
    ctx.save(); ctx.translate(x, feet); ctx.scale(facing, 1); ctx.rotate(tilt); ctx.globalAlpha *= alpha;
    const shift = index === 6 ? 14 : index === 3 ? 9 : 0;
    ctx.drawImage(this.character, sx, sy, sw, sh, -sw * scale / 2 + shift, -sh * scale, sw * scale, sh * scale); ctx.restore();
  }
  prop(ctx, index, x, y, width, height = width, angle = 0) {
    const cell = this.props.width / 4; const sx = index % 4 * cell; const sy = Math.floor(index / 4) * cell;
    ctx.save(); ctx.translate(x + width / 2, y + height / 2); ctx.rotate(angle); ctx.drawImage(this.props, sx + 2, sy + 2, cell - 4, cell - 4, -width / 2, -height / 2, width, height); ctx.restore();
  }
  officeProp(ctx, index, x, y, width, height) {
    const cell = this.office.width / 2;
    ctx.drawImage(this.office, index % 2 * cell + 2, Math.floor(index / 2) * cell + 2, cell - 4, cell - 4, x, y, width, height);
  }
}
