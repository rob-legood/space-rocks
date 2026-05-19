import { STEALTH } from '../config.js';
import { drawAtWrappedPositions, wrap } from '../utils/canvas.js';

export class Stealth {
  constructor(x, y, {
    hp           = STEALTH.hp,
    speed        = 60,
    shotInterval = STEALTH.shotInterval,
    minCoins = 0, maxCoins = 0,
    minPlatinum = 0, maxPlatinum = 0,
    minDilithium = 0, maxDilithium = 0,
  } = {}) {
    this.pos    = { x, y };
    const a     = Math.random() * Math.PI * 2;
    this.vel    = { x: Math.cos(a) * speed, y: Math.sin(a) * speed };
    this.radius = STEALTH.radius;
    this.hp     = hp;
    this.angle  = Math.random() * Math.PI * 2; // visual rotation, not heading
    this.hitFlash    = 0;
    this.shotInterval = shotInterval;

    // Phase state machine: 'cloaked' | 'uncloaking' | 'recloaking'
    this.phase      = 'cloaked';
    this.phaseTimer = 0;
    // Stagger so simultaneous spawns don't all fire together.
    this.shotTimer  = shotInterval * (0.3 + Math.random() * 0.7);

    this._shouldFire = false;

    this.minCoins    = minCoins;    this.maxCoins    = maxCoins;
    this.minPlatinum = minPlatinum; this.maxPlatinum = maxPlatinum;
    this.minDilithium = minDilithium; this.maxDilithium = maxDilithium;
  }

  update(dt, bounds) {
    this._shouldFire = false;

    if (this.phase === 'cloaked') {
      this.shotTimer -= dt;
      if (this.shotTimer <= 0) {
        this.phase      = 'uncloaking';
        this.phaseTimer = 0;
      }
    } else if (this.phase === 'uncloaking') {
      this.phaseTimer += dt;
      if (this.phaseTimer >= STEALTH.uncloak) {
        this.phase       = 'recloaking';
        this.phaseTimer  = 0;
        this._shouldFire = true;
      }
    } else { // recloaking
      this.phaseTimer += dt;
      if (this.phaseTimer >= STEALTH.recloak) {
        this.phase     = 'cloaked';
        this.shotTimer = this.shotInterval;
      }
    }

    this.angle += STEALTH.rotSpeed * dt;
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
    if (this.hitFlash > 0) this.hitFlash = Math.max(0, this.hitFlash - dt);
    wrap(this.pos, bounds.width, bounds.height);
  }

  // Returns a bullet plain object when the uncloak fires, else null.
  tryFire() {
    if (!this._shouldFire) return null;
    const angle = Math.random() * Math.PI * 2;
    const { speed, maxDistance, maxAge, radius } = STEALTH.bullet;
    return {
      pos: { x: this.pos.x, y: this.pos.y },
      vel: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
      age: 0, distanceTraveled: 0, radius, maxDistance, maxAge, dead: false,
    };
  }

  _alpha() {
    if (this.hitFlash > 0) return 1;
    if (this.phase === 'cloaked')    return STEALTH.cloakAlpha;
    if (this.phase === 'uncloaking') return STEALTH.cloakAlpha + (1 - STEALTH.cloakAlpha) * (this.phaseTimer / STEALTH.uncloak);
    // recloaking
    return 1 - (1 - STEALTH.cloakAlpha) * (this.phaseTimer / STEALTH.recloak);
  }

  draw(ctx, bounds) {
    ctx.save();
    ctx.globalAlpha  = this._alpha();
    ctx.strokeStyle  = STEALTH.color;
    drawAtWrappedPositions(this.pos, this.radius, bounds, (x, y) => {
      const r = this.radius;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(this.angle);
      // Elongated rotating diamond — wider than tall, distinct from square enemy.
      ctx.beginPath();
      ctx.moveTo( r * 1.4,  0);
      ctx.lineTo( 0,        r * 0.55);
      ctx.lineTo(-r * 0.9,  0);
      ctx.lineTo( 0,       -r * 0.55);
      ctx.closePath();
      ctx.stroke();
      // Small centre dot marks the firing point even at low alpha.
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
    ctx.restore();
  }
}
