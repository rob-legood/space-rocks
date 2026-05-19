import { BOMBER } from '../config.js';
import { drawAtWrappedPositions, wrap } from '../utils/canvas.js';

let _nextId = 0;

export class Bomber {
  constructor(x, y, {
    hp           = BOMBER.hp,
    speed        = BOMBER.speed,
    shotInterval = BOMBER.shotInterval,
    minCoins = 0, maxCoins = 0,
    minPlatinum = 0, maxPlatinum = 0,
    minDilithium = 0, maxDilithium = 0,
  } = {}) {
    this.id       = _nextId++;
    this.pos      = { x, y };
    this.angle    = Math.random() * Math.PI * 2; // drift direction + draw orientation
    this.vel      = { x: Math.cos(this.angle) * speed, y: Math.sin(this.angle) * speed };
    this.radius   = BOMBER.radius;
    this.hp       = hp;
    this.shotInterval = shotInterval;
    // Stagger first shot so simultaneous bombers don't all fire at once.
    this.shotTimer = shotInterval * (0.4 + Math.random() * 0.6);
    this.hitFlash  = 0;
    this.minCoins    = minCoins;    this.maxCoins    = maxCoins;
    this.minPlatinum = minPlatinum; this.maxPlatinum = maxPlatinum;
    this.minDilithium = minDilithium; this.maxDilithium = maxDilithium;
  }

  update(dt, bounds) {
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
    this.shotTimer -= dt;
    if (this.hitFlash > 0) this.hitFlash = Math.max(0, this.hitFlash - dt);
    wrap(this.pos, bounds.width, bounds.height);
  }

  // Returns a missile plain object aimed toward shipPos, or null if not ready.
  tryFire(shipPos, bounds) {
    if (this.shotTimer > 0) return null;
    this.shotTimer += this.shotInterval;

    // Launch toward ship via toroidal shortest path.
    let dx = shipPos.x - this.pos.x;
    let dy = shipPos.y - this.pos.y;
    if (dx >  bounds.width  / 2) dx -= bounds.width;
    else if (dx < -bounds.width  / 2) dx += bounds.width;
    if (dy >  bounds.height / 2) dy -= bounds.height;
    else if (dy < -bounds.height / 2) dy += bounds.height;

    const launchAngle = Math.atan2(dy, dx);
    const initSpeed   = BOMBER.missile.speed * 0.5;
    return {
      pos:      { x: this.pos.x, y: this.pos.y },
      vel:      { x: Math.cos(launchAngle) * initSpeed, y: Math.sin(launchAngle) * initSpeed },
      angle:    launchAngle,
      age:      0,
      radius:   BOMBER.missile.radius,
      bomberId: this.id,
      dead:     false,
    };
  }

  draw(ctx, bounds) {
    ctx.save();
    ctx.strokeStyle = this.hitFlash > 0 ? '#fff' : BOMBER.color;
    drawAtWrappedPositions(this.pos, this.radius, bounds, (x, y) => {
      const r = this.radius;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(this.angle);
      // Swept-wing hexagonal hull — wide and heavy-looking.
      ctx.beginPath();
      ctx.moveTo( r,        0        ); // nose
      ctx.lineTo( 0,        r        ); // right wing tip
      ctx.lineTo(-r * 0.5,  r * 0.6  ); // right wing root
      ctx.lineTo(-r * 0.7,  0        ); // tail
      ctx.lineTo(-r * 0.5, -r * 0.6  ); // left wing root
      ctx.lineTo( 0,       -r        ); // left wing tip
      ctx.closePath();
      ctx.stroke();
      // Fuselage centreline — suggests a heavy body.
      ctx.beginPath();
      ctx.moveTo(-r * 0.4, 0);
      ctx.lineTo( r * 0.75, 0);
      ctx.stroke();
      // Engine pods at the wing roots.
      ctx.beginPath();
      ctx.moveTo(-r * 0.15,  r * 0.42);
      ctx.lineTo(-r * 0.15,  r * 0.68);
      ctx.moveTo(-r * 0.15, -r * 0.42);
      ctx.lineTo(-r * 0.15, -r * 0.68);
      ctx.stroke();
      ctx.restore();
    });
    ctx.restore();
  }
}
