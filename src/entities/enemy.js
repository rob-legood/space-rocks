import { ENEMY } from '../config.js';
import { drawAtWrappedPositions, wrap } from '../utils/canvas.js';

export class Enemy {
  constructor(x, y, { speed = 60, shotInterval = 1, hp = 1, size = ENEMY.radius,
    shield = 0,
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
    this.shield    = shield;
    this.shieldMax = shield;
    this._shieldRechargeTimer = 0;
    this.shieldFlash = 0;
    // Stagger first shot so enemies spawning simultaneously don't all fire at once.
    this.shotTimer = Math.random() * shotInterval;
    this.shotInterval = shotInterval;
  }

  update(dt, bounds) {
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
    if (this.hitFlash > 0)    this.hitFlash    = Math.max(0, this.hitFlash    - dt);
    if (this.shieldFlash > 0) this.shieldFlash = Math.max(0, this.shieldFlash - dt);
    this.shotTimer -= dt;
    wrap(this.pos, bounds.width, bounds.height);

    // Recharge shield after delay.
    if (this.shieldMax > 0 && this.shield < this.shieldMax) {
      if (this._shieldRechargeTimer > 0) {
        this._shieldRechargeTimer = Math.max(0, this._shieldRechargeTimer - dt);
      } else {
        this.shield = Math.min(this.shieldMax, this.shield + ENEMY.shieldRechargeRate * dt);
      }
    }
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

    // Shield arc — only drawn when shield is active.
    if (this.shieldMax > 0 && this.shield > 0) {
      const fraction  = this.shield / this.shieldMax;
      const shieldR   = this.radius + ENEMY.shieldOffset;
      // Dim the arc while the recharge timer is still counting down (shield is depleted and waiting).
      const rechargePending = this._shieldRechargeTimer > 0;
      const alpha = this.shieldFlash > 0 ? 1.0
                  : rechargePending       ? 0.25
                  : 0.35 + fraction * 0.55;

      ctx.save();
      ctx.strokeStyle = this.shieldFlash > 0 ? '#fff' : ENEMY.shieldColor;
      ctx.lineWidth   = 2;
      ctx.globalAlpha = alpha;
      // Draw as a thin outer glow ring behind the arc.
      ctx.shadowColor = ENEMY.shieldColor;
      ctx.shadowBlur  = 6;
      drawAtWrappedPositions(this.pos, shieldR + 2, bounds, (x, y) => {
        ctx.beginPath();
        ctx.arc(x, y, shieldR, -Math.PI / 2, -Math.PI / 2 + fraction * Math.PI * 2);
        ctx.stroke();
      });
      ctx.restore();
    }
  }
}
