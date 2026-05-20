import { CIVILIAN, WARP } from '../config.js';
import { drawPolygon, drawAtWrappedPositions, wrap } from '../utils/canvas.js';

const s = CIVILIAN.size;
const SHAPE = [
  { x:  s,        y:  0       },
  { x: -s * 0.7,  y: -s * 0.6 },
  { x: -s * 0.4,  y:  0       },
  { x: -s * 0.7,  y:  s * 0.6 },
];
const FLAME = [
  { x: -s * 0.4, y: -s * 0.3 },
  { x: -s * 1.0, y:  0       },
  { x: -s * 0.4, y:  s * 0.3 },
];

export class Civilian {
  constructor(x, y, { reward = CIVILIAN.reward } = {}) {
    this.pos        = { x, y };
    this.vel        = { x: 0, y: 0 };
    this.angle      = Math.random() * Math.PI * 2; // facing direction
    this.radius     = CIVILIAN.radius;
    this.lives      = CIVILIAN.lives;
    this.warpPhase  = 'none'; // 'none' | 'out' | 'in'
    this.warpTimer  = 0;
    this.attached   = false;
    this.dead       = false;
    this.reward     = reward;
    this.orbitAngle = Math.random() * Math.PI * 2;
    this.thrusting  = true;
    this._rotDir    = Math.random() < 0.5 ? 1 : -1;
    this._rotTimer  = CIVILIAN.rotFlipMin + Math.random() * (CIVILIAN.rotFlipMax - CIVILIAN.rotFlipMin);
    this._thrustTimer = CIVILIAN.thrustOn * Math.random(); // stagger cycles
  }

  update(dt, bounds) {
    if (this.attached) return;

    if (this.warpPhase !== 'none') {
      this.warpTimer += dt;
      if (this.warpPhase === 'out' && this.warpTimer >= WARP.outDuration) {
        this.warpPhase = 'in';
        this.warpTimer = 0;
        const m = WARP.inMargin;
        this.pos.x    = m + Math.random() * (bounds.width  - 2 * m);
        this.pos.y    = m + Math.random() * (bounds.height - 2 * m);
        this.vel      = { x: 0, y: 0 };
        this.angle    = Math.random() * Math.PI * 2;
        this._rotDir  = Math.random() < 0.5 ? 1 : -1;
        this._rotTimer = CIVILIAN.rotFlipMin + Math.random() * (CIVILIAN.rotFlipMax - CIVILIAN.rotFlipMin);
      } else if (this.warpPhase === 'in' && this.warpTimer >= WARP.inDuration) {
        this.warpPhase = 'none';
        this.warpTimer = 0;
      }
      return;
    }

    // Rotate facing angle.
    this.angle += this._rotDir * CIVILIAN.rotSpeed * dt;

    // Periodically flip rotation direction.
    this._rotTimer -= dt;
    if (this._rotTimer <= 0) {
      this._rotDir   = -this._rotDir;
      this._rotTimer = CIVILIAN.rotFlipMin + Math.random() * (CIVILIAN.rotFlipMax - CIVILIAN.rotFlipMin);
    }

    // Toggle thrust on/off in cycles.
    this._thrustTimer -= dt;
    if (this._thrustTimer <= 0) {
      this.thrusting    = !this.thrusting;
      this._thrustTimer = this.thrusting ? CIVILIAN.thrustOn : CIVILIAN.thrustOff;
    }

    if (this.thrusting) {
      this.vel.x += Math.cos(this.angle) * CIVILIAN.thrustAccel * dt;
      this.vel.y += Math.sin(this.angle) * CIVILIAN.thrustAccel * dt;
    }

    // Friction (frame-rate independent exponential decay).
    const f = Math.pow(CIVILIAN.friction, dt);
    this.vel.x *= f;
    this.vel.y *= f;

    // Speed cap.
    const spd = Math.hypot(this.vel.x, this.vel.y);
    if (spd > CIVILIAN.maxSpeed) {
      this.vel.x = (this.vel.x / spd) * CIVILIAN.maxSpeed;
      this.vel.y = (this.vel.y / spd) * CIVILIAN.maxSpeed;
    }

    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
    wrap(this.pos, bounds.width, bounds.height);
  }

  // Returns true when the final life is gone (caller should spawn explosion + sound).
  hit() {
    this.lives -= 1;
    if (this.lives > 0) {
      this.warpPhase = 'out';
      this.warpTimer = 0;
      return false;
    }
    this.dead = true;
    return true;
  }

  draw(ctx, bounds) {
    ctx.save();
    ctx.strokeStyle = CIVILIAN.color;

    let hullScale = 1;
    if (this.warpPhase !== 'none') {
      const dur = this.warpPhase === 'out' ? WARP.outDuration : WARP.inDuration;
      const t   = Math.min(this.warpTimer / dur, 1);
      hullScale = this.warpPhase === 'out' ? 1 - t : t;

      ctx.save();
      ctx.strokeStyle = CIVILIAN.warpColor;
      for (const fraction of [0.35, 0.65]) {
        const ringT     = (t + fraction) % 1;
        const ringR     = ringT * WARP.ringMaxRadius;
        const ringAlpha = (1 - ringT) ** 2;
        ctx.globalAlpha = ringAlpha;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, ringR, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    if (hullScale > 0.01) {
      drawAtWrappedPositions(this.pos, this.radius, bounds, (wx, wy) => {
        const transform = { x: wx, y: wy, angle: this.angle, scale: hullScale };
        if (this.thrusting && this.warpPhase === 'none' && Math.random() > 0.3) {
          ctx.save();
          ctx.strokeStyle = CIVILIAN.flameColor;
          drawPolygon(ctx, FLAME, transform);
          ctx.restore();
        }
        drawPolygon(ctx, SHAPE, transform);
      });
    }

    ctx.restore();
  }

  // Draw at an explicit position with optional warp scale (for orbit rendering).
  drawAt(ctx, x, y, scale = 1) {
    ctx.save();
    ctx.strokeStyle = CIVILIAN.color;
    const transform = { x, y, angle: this.angle, scale };
    if (this.thrusting && Math.random() > 0.3) {
      ctx.save();
      ctx.strokeStyle = CIVILIAN.flameColor;
      drawPolygon(ctx, FLAME, transform);
      ctx.restore();
    }
    drawPolygon(ctx, SHAPE, transform);
    ctx.restore();
  }
}
