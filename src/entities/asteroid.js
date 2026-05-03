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
  }

  update(dt, bounds) {
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
    this.angle += this.rotVel * dt;
    wrap(this.pos, bounds.width, bounds.height);
  }

  draw(ctx, bounds) {
    const wrapRadius = this.radius * (1 + ASTEROID.jaggedness);
    drawAtWrappedPositions(this.pos, wrapRadius, bounds, (x, y) => {
      drawPolygon(ctx, this.shape, { x, y, angle: this.angle });
    });
  }
}
