import { ASTEROID } from '../config.js';
import { fromAngle } from '../utils/vector.js';
import { drawPolygon, drawAtWrappedPositions, wrap } from '../utils/canvas.js';

function buildShape(radius) {
  const n =
    ASTEROID.minVertices +
    Math.floor(Math.random() * (ASTEROID.maxVertices - ASTEROID.minVertices + 1));
  const points = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = radius * (1 + (Math.random() * 2 - 1) * ASTEROID.jaggedness);
    points.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
  }
  return points;
}

export class Asteroid {
  constructor(x, y, size = 'large') {
    this.pos = { x, y };
    this.size = size;

    const cfg = ASTEROID.sizes[size];
    this.radius = cfg.radius;

    const speed = cfg.speedMin + Math.random() * (cfg.speedMax - cfg.speedMin);
    this.vel = fromAngle(Math.random() * Math.PI * 2, speed);

    const rotSpeed =
      ASTEROID.rotationMin +
      Math.random() * (ASTEROID.rotationMax - ASTEROID.rotationMin);
    this.rotVel = rotSpeed * (Math.random() < 0.5 ? 1 : -1);
    this.angle = Math.random() * Math.PI * 2;

    this.shape = buildShape(cfg.radius);
    this.hp = cfg.hp;
    this.hitFlash = 0;
    this.childType = cfg.childType ?? null;
    this.childCount = cfg.childCount ?? 0;
    this.color = cfg.color ?? null;
    this.bangSize = cfg.bangSize ?? size;
    this.optional = cfg.optional ?? false;
    this.dyingDuration = cfg.dyingDuration ?? 0;
    this.dying = false;
    this.dyingTimer = 0;
    this.maxAge = cfg.maxAge ?? null;
    this.deathDropsCoin = cfg.deathDropsCoin ?? false;
    this.age = 0;
  }

  update(dt, bounds) {
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
    this.angle += this.rotVel * dt;
    if (this.hitFlash > 0) this.hitFlash = Math.max(0, this.hitFlash - dt);
    if (this.dying) this.dyingTimer = Math.max(0, this.dyingTimer - dt);
    if (this.maxAge !== null) this.age += dt;
    wrap(this.pos, bounds.width, bounds.height);
  }

  draw(ctx, bounds) {
    const wrapRadius = this.radius * (1 + ASTEROID.jaggedness);
    const needsSave = this.hitFlash > 0 || this.dying || this.color;
    if (needsSave) {
      ctx.save();
      if (this.color) ctx.strokeStyle = this.color;
      if (this.dying) {
        const elapsed = this.dyingDuration - this.dyingTimer;
        const t = elapsed / this.dyingDuration;
        const freq = ASTEROID.dyingPulseFreqStart + t * (ASTEROID.dyingPulseFreqEnd - ASTEROID.dyingPulseFreqStart);
        ctx.strokeStyle = Math.sin(elapsed * freq) > 0 ? '#ff2222' : (this.color || '#fff');
      }
      if (this.hitFlash > 0) ctx.strokeStyle = '#f66';
    }
    drawAtWrappedPositions(this.pos, wrapRadius, bounds, (x, y) => {
      drawPolygon(ctx, this.shape, { x, y, angle: this.angle });
    });
    if (needsSave) ctx.restore();
  }
}
