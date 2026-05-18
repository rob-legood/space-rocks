import { COMET } from '../config.js';
import { wrap } from '../utils/canvas.js';

export class Comet {
  constructor(x, y) {
    this.pos    = { x, y };
    const speed = COMET.speedMin + Math.random() * (COMET.speedMax - COMET.speedMin);
    const angle = Math.random() * Math.PI * 2;
    this.vel    = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
    this.radius = COMET.radius;
    // Unit vector used by game.js when spawning trail particles.
    const len   = Math.hypot(this.vel.x, this.vel.y);
    this.dir    = { x: this.vel.x / len, y: this.vel.y / len };
  }

  update(dt, bounds) {
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
    wrap(this.pos, bounds.width, bounds.height);
  }

  draw(ctx) {
    ctx.save();
    // Diffuse glow halo.
    ctx.globalAlpha = 0.4;
    ctx.fillStyle   = COMET.headColor;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius + 5, 0, Math.PI * 2);
    ctx.fill();
    // Solid bright core.
    ctx.globalAlpha = 1;
    ctx.fillStyle   = '#fff';
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
