import { SHIP } from '../config.js';
import { add, scale, fromAngle } from '../utils/vector.js';
import { drawPolygon, wrap } from '../utils/canvas.js';

// Ship outline in local space (nose at +x, stern at -x). Angle = 0 means
// pointing right; the ship spawns at -PI/2 so it points up on screen.
const SHIP_SHAPE = [
  { x: SHIP.size, y: 0 },
  { x: -SHIP.size * 0.7, y: -SHIP.size * 0.6 },
  { x: -SHIP.size * 0.4, y: 0 },
  { x: -SHIP.size * 0.7, y: SHIP.size * 0.6 },
];

const FLAME_SHAPE = [
  { x: -SHIP.size * 0.4, y: -SHIP.size * 0.3 },
  { x: -SHIP.size * 1.0, y: 0 },
  { x: -SHIP.size * 0.4, y: SHIP.size * 0.3 },
];

export class Ship {
  constructor(x, y) {
    this.pos = { x, y };
    this.vel = { x: 0, y: 0 };
    this.angle = -Math.PI / 2; // pointing up
    this.thrusting = false;
    this.dead = false;
    this.radius = SHIP.size * 0.7;
  }

  update(dt, input, bounds) {
    // Rotation
    if (input.left) this.angle -= SHIP.rotationSpeed * dt;
    if (input.right) this.angle += SHIP.rotationSpeed * dt;

    // Thrust
    this.thrusting = input.thrust;
    if (this.thrusting) {
      const accel = scale(fromAngle(this.angle), SHIP.thrustAccel * dt);
      this.vel = add(this.vel, accel);
    }

    // Friction (frame-rate independent: vel *= friction^dt)
    const frictionFactor = Math.pow(SHIP.friction, dt);
    this.vel.x *= frictionFactor;
    this.vel.y *= frictionFactor;

    // Cap speed
    const speed = Math.hypot(this.vel.x, this.vel.y);
    if (speed > SHIP.maxSpeed) {
      this.vel.x = (this.vel.x / speed) * SHIP.maxSpeed;
      this.vel.y = (this.vel.y / speed) * SHIP.maxSpeed;
    }

    // Integrate position
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;

    // Toroidal wrap
    wrap(this.pos, bounds.width, bounds.height);
  }

  static explode(ship, config) {
    const cos = Math.cos(ship.angle);
    const sin = Math.sin(ship.angle);
    const toWorld = ({ x, y }) => ({
      x: ship.pos.x + cos * x - sin * y,
      y: ship.pos.y + sin * x + cos * y,
    });
    return [[0,1],[1,2],[2,3],[3,0]].map(([i, j]) => {
      const a = toWorld(SHIP_SHAPE[i]);
      const b = toWorld(SHIP_SHAPE[j]);
      const cx = (a.x + b.x) / 2;
      const cy = (a.y + b.y) / 2;
      const outDir = Math.atan2(cy - ship.pos.y, cx - ship.pos.x)
                   + (Math.random() - 0.5);
      const speed = config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed);
      return {
        points: [{ x: a.x - cx, y: a.y - cy }, { x: b.x - cx, y: b.y - cy }],
        pos:    { x: cx, y: cy },
        vel:    { x: ship.vel.x + Math.cos(outDir) * speed,
                  y: ship.vel.y + Math.sin(outDir) * speed },
        angle:  0,
        rotVel: (Math.random() - 0.5) * 2 * config.rotSpeed,
        age:    0,
      };
    });
  }

  static drawIcon(ctx, x, y, scale) {
    drawPolygon(ctx, SHIP_SHAPE, { x, y, angle: -Math.PI / 2, scale });
  }

  static drawAt(ctx, x, y, angle) {
    drawPolygon(ctx, SHIP_SHAPE, { x, y, angle });
  }

  draw(ctx) {
    const transform = { x: this.pos.x, y: this.pos.y, angle: this.angle };

    // Flame first so the ship outline draws on top
    if (this.thrusting && Math.random() > 0.3) {
      ctx.save();
      ctx.strokeStyle = SHIP.flameColor;
      drawPolygon(ctx, FLAME_SHAPE, transform);
      ctx.restore();
    }

    drawPolygon(ctx, SHIP_SHAPE, transform);
  }
}
