import { BULLET, SHIP } from '../config.js';
import { add, scale, fromAngle } from '../utils/vector.js';
import { wrap } from '../utils/canvas.js';

export class Bullet {
  constructor(ship, damage = 1) {
    const dir = fromAngle(ship.angle);
    this.pos = add(ship.pos, scale(dir, SHIP.size));
    this.vel = fromAngle(ship.angle, BULLET.speed);
    this.radius = BULLET.radius;
    this.age = 0;
    this.distanceTraveled = 0;
    this.dead = false;
    this.damage = damage;
  }

  update(dt, bounds) {
    this.age += dt;
    const dx = this.vel.x * dt;
    const dy = this.vel.y * dt;
    this.distanceTraveled += Math.hypot(dx, dy);
    this.pos.x += dx;
    this.pos.y += dy;
    wrap(this.pos, bounds.width, bounds.height);

    if (this.age >= BULLET.maxAge || this.distanceTraveled >= BULLET.maxDistance) {
      this.dead = true;
    }
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, BULLET.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
