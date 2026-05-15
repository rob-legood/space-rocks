import { CARGO } from '../config.js';
import { drawAtWrappedPositions, wrap } from '../utils/canvas.js';

export class Cargo {
  constructor(x, y, opts = {}) {
    this.pos = { x, y };
    const speed = CARGO.speedMin + Math.random() * (CARGO.speedMax - CARGO.speedMin);
    const angle = Math.random() * Math.PI * 2;
    this.vel = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
    this.angle = Math.random() * Math.PI * 2;
    const rotSpeed = CARGO.rotationMin + Math.random() * (CARGO.rotationMax - CARGO.rotationMin);
    this.rotVel = rotSpeed * (Math.random() < 0.5 ? 1 : -1);
    this.radius = CARGO.radius;
    this.hp = 1;
    this.hitFlash = 0;
    this.optional = true;
    this.minCoins     = opts.minCoins     ?? CARGO.minCoins;
    this.maxCoins     = opts.maxCoins     ?? CARGO.maxCoins;
    this.minPlatinum  = opts.minPlatinum  ?? CARGO.minPlatinum;
    this.maxPlatinum  = opts.maxPlatinum  ?? CARGO.maxPlatinum;
    this.minDilithium = opts.minDilithium ?? CARGO.minDilithium;
    this.maxDilithium = opts.maxDilithium ?? CARGO.maxDilithium;
  }

  update(dt, bounds) {
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
    this.angle += this.rotVel * dt;
    if (this.hitFlash > 0) this.hitFlash = Math.max(0, this.hitFlash - dt);
    wrap(this.pos, bounds.width, bounds.height);
  }

  draw(ctx, bounds) {
    const needsFlash = this.hitFlash > 0;
    drawAtWrappedPositions(this.pos, this.radius, bounds, (x, y) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(this.angle);
      ctx.strokeStyle = needsFlash ? '#f66' : CARGO.color;
      const s = this.radius;
      // Outer box
      ctx.strokeRect(-s, -s, s * 2, s * 2);
      // Diagonal cross braces (classic crate look)
      ctx.beginPath();
      ctx.moveTo(-s, -s); ctx.lineTo(s, s);
      ctx.moveTo(s, -s);  ctx.lineTo(-s, s);
      ctx.stroke();
      ctx.restore();
    });
  }
}
