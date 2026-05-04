import { STARS, CANVAS } from '../config.js';

export class Starfield {
  constructor() {
    this.stars = Array.from({ length: STARS.count }, () => ({
      x: Math.random() * CANVAS.width,
      y: Math.random() * CANVAS.height,
      r: STARS.minRadius + Math.random() * (STARS.maxRadius - STARS.minRadius),
    }));
  }

  draw(ctx) {
    ctx.fillStyle = `rgba(255,255,255,${STARS.alpha})`;
    for (const { x, y, r } of this.stars) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
