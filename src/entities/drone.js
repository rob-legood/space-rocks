import { DRONE } from '../config.js';
import { drawAtWrappedPositions, wrap } from '../utils/canvas.js';

export class Drone {
  constructor(x, y, { hp = DRONE.hp, speed = DRONE.speed, accel = DRONE.accel,
    turnRate = DRONE.turnRate,
    minCoins = 0, maxCoins = 0,
    minPlatinum = 0, maxPlatinum = 0,
    minDilithium = 0, maxDilithium = 0,
  } = {}) {
    this.pos      = { x, y };
    this.angle    = Math.random() * Math.PI * 2; // initial heading
    const initSpeed = speed * 0.25;
    this.vel      = { x: Math.cos(this.angle) * initSpeed, y: Math.sin(this.angle) * initSpeed };
    this.radius   = DRONE.radius;
    this.hp       = hp;
    this.speed    = speed;
    this.accel    = accel;
    this.turnRate = turnRate;
    this.hitFlash = 0;
    this.minCoins = minCoins; this.maxCoins = maxCoins;
    this.minPlatinum = minPlatinum; this.maxPlatinum = maxPlatinum;
    this.minDilithium = minDilithium; this.maxDilithium = maxDilithium;
  }

  update(dt, bounds, shipPos) {
    // Toroidal direction to ship.
    let dx = shipPos.x - this.pos.x;
    let dy = shipPos.y - this.pos.y;
    if (dx >  bounds.width  / 2) dx -= bounds.width;
    else if (dx < -bounds.width  / 2) dx += bounds.width;
    if (dy >  bounds.height / 2) dy -= bounds.height;
    else if (dy < -bounds.height / 2) dy += bounds.height;

    // Rotate heading toward target at limited turn rate.
    const targetAngle = Math.atan2(dy, dx);
    let da = targetAngle - this.angle;
    // Wrap angular difference to [-π, π].
    while (da >  Math.PI) da -= Math.PI * 2;
    while (da < -Math.PI) da += Math.PI * 2;
    const maxTurn = this.turnRate * dt;
    this.angle += Math.max(-maxTurn, Math.min(maxTurn, da));

    // Thrust in current heading direction, cap at max speed.
    this.vel.x += Math.cos(this.angle) * this.accel * dt;
    this.vel.y += Math.sin(this.angle) * this.accel * dt;
    const spd = Math.hypot(this.vel.x, this.vel.y);
    if (spd > this.speed) {
      this.vel.x = (this.vel.x / spd) * this.speed;
      this.vel.y = (this.vel.y / spd) * this.speed;
    }

    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
    if (this.hitFlash > 0) this.hitFlash = Math.max(0, this.hitFlash - dt);
    wrap(this.pos, bounds.width, bounds.height);
  }

  draw(ctx, bounds) {
    ctx.save();
    ctx.strokeStyle = this.hitFlash > 0 ? '#fff' : DRONE.color;
    drawAtWrappedPositions(this.pos, this.radius, bounds, (x, y) => {
      const r = this.radius;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(this.angle); // heading angle, not velocity angle
      // Arrowhead: nose at +x, swept-back wings, rear notch.
      ctx.beginPath();
      ctx.moveTo( r,       0);           // nose
      ctx.lineTo(-r * 0.4, -r * 0.65);  // left wing tip
      ctx.lineTo(-r * 0.1,  0);          // rear notch
      ctx.lineTo(-r * 0.4,  r * 0.65);  // right wing tip
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    });
    ctx.restore();
  }
}
