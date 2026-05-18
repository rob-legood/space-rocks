import { MINE } from '../config.js';
import { drawAtWrappedPositions, wrap } from '../utils/canvas.js';

export class Mine {
  constructor(x, y, { shockwaveRadius, shockwaveSpeed } = {}) {
    this.pos    = { x, y };
    const angle = Math.random() * Math.PI * 2;
    const speed = MINE.speedMin + Math.random() * (MINE.speedMax - MINE.speedMin);
    this.vel    = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
    this.radius = MINE.radius;
    this.shockwaveRadius = shockwaveRadius ?? MINE.shockwaveMaxRadius;
    this.shockwaveSpeed  = shockwaveSpeed  ?? MINE.shockwaveSpeed;
  }

  update(dt, bounds) {
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
    wrap(this.pos, bounds.width, bounds.height);
  }

  draw(ctx, bounds) {
    drawAtWrappedPositions(this.pos, this.radius + MINE.spikeLength, bounds, (x, y) => {
      ctx.save();
      ctx.strokeStyle = MINE.color;
      ctx.lineWidth   = 1.5;

      ctx.beginPath();
      ctx.arc(x, y, this.radius, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < MINE.spikeCount; i++) {
        const a  = (i / MINE.spikeCount) * Math.PI * 2;
        const cx = Math.cos(a);
        const cy = Math.sin(a);
        ctx.beginPath();
        ctx.moveTo(x + cx * this.radius,                    y + cy * this.radius);
        ctx.lineTo(x + cx * (this.radius + MINE.spikeLength), y + cy * (this.radius + MINE.spikeLength));
        ctx.stroke();
      }
      ctx.restore();
    });
  }
}
