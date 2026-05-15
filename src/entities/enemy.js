import { ENEMY } from '../config.js';
import { drawAtWrappedPositions, wrap } from '../utils/canvas.js';

export class Enemy {
  constructor(x, y, { speed = 60, shotInterval = 1, hp = 1, size = ENEMY.radius,
    minCoins = 0, maxCoins = 0,
    minPlatinum = 0, maxPlatinum = 0,
    minDilithium = 0, maxDilithium = 0,
  } = {}) {
    this.pos = { x, y };
    const angle = Math.random() * Math.PI * 2;
    this.vel = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
    this.radius = size;
    this.minCoins = minCoins; this.maxCoins = maxCoins;
    this.minPlatinum = minPlatinum; this.maxPlatinum = maxPlatinum;
    this.minDilithium = minDilithium; this.maxDilithium = maxDilithium;
    this.hp = hp;
    this.hitFlash = 0;
    // Stagger first shot so enemies spawning simultaneously don't all fire at once.
    this.shotTimer = Math.random() * shotInterval;
    this.shotInterval = shotInterval;
  }

  update(dt, bounds) {
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
    if (this.hitFlash > 0) this.hitFlash = Math.max(0, this.hitFlash - dt);
    this.shotTimer -= dt;
    wrap(this.pos, bounds.width, bounds.height);
  }

  // Returns a new enemy-bullet plain object if the shot timer fired, else null.
  tryFire() {
    if (this.shotTimer > 0) return null;
    this.shotTimer += this.shotInterval;
    const angle = Math.random() * Math.PI * 2;
    const { speed, maxDistance, maxAge, radius } = ENEMY.bullet;
    return {
      pos: { x: this.pos.x, y: this.pos.y },
      vel: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
      age: 0,
      distanceTraveled: 0,
      radius,
      maxDistance,
      maxAge,
      dead: false,
    };
  }

  draw(ctx, bounds) {
    ctx.save();
    ctx.strokeStyle = this.hitFlash > 0 ? '#f66' : ENEMY.color;
    drawAtWrappedPositions(this.pos, this.radius, bounds, (x, y) => {
      const r = this.radius;
      // Diamond body with horizontal bar — visually distinct from asteroids and ship.
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.lineTo(x + r * 0.65, y);
      ctx.lineTo(x, y + r * 0.55);
      ctx.lineTo(x - r * 0.65, y);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - r * 0.65, y);
      ctx.lineTo(x + r * 0.65, y);
      ctx.stroke();
    });
    ctx.restore();
  }
}
