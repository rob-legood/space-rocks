import { CANVAS, ASTEROID, INVULN } from './config.js';
import { Ship } from './entities/ship.js';
import { Bullet } from './entities/bullet.js';
import { Asteroid } from './entities/asteroid.js';
import { Starfield } from './entities/starfield.js';
import { Input } from './input.js';
import { circlesOverlap } from './utils/collision.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvas.width = CANVAS.width;
    this.canvas.height = CANVAS.height;

    this.bounds = { width: CANVAS.width, height: CANVAS.height };
    this.starfield = new Starfield();
    this.input = new Input();
    this.ship = new Ship(CANVAS.width / 2, CANVAS.height / 2);
    this.bullets = [];
    this.asteroids = this._spawnInitialAsteroids();
    this._respawnTimer = 0;
    this._invulnTimer = INVULN.invulnDuration;
    this._state     = 'splash';
    this._menuIndex = 0;

    this.lastTime = 0;
    this._loop = this._loop.bind(this);
  }

  start() {
    requestAnimationFrame((t) => {
      this.lastTime = t;
      requestAnimationFrame(this._loop);
    });
  }

  _loop(time) {
    // Clamp dt so a tab-out doesn't teleport entities across the screen.
    const dt = Math.min((time - this.lastTime) / 1000, 1 / 30);
    this.lastTime = time;

    this.update(dt);
    this.render();

    requestAnimationFrame(this._loop);
  }

  _selectMenuItem() {
    if (this._menuIndex === 0) {
      this._state = 'playing';
    } else {
      window.location.href = 'https://roblegood.ca';
    }
  }

  _updateSplash() {
    if (this.input.consumeLeft() || this.input.consumeRight()) {
      this._menuIndex = 1 - this._menuIndex;
    }
    if (this.input.consumeFire()) {
      this._selectMenuItem();
    }
  }

  _renderSplash(ctx) {
    ctx.save();
    const cx = CANVAS.width / 2;
    const cy = CANVAS.height / 2;

    ctx.fillStyle = CANVAS.background;
    ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);

    this.starfield.draw(ctx);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = CANVAS.stroke;
    ctx.font = 'bold 64px "Courier New", monospace';
    ctx.fillText('SPACE ROCKS', cx, cy - 110);

    const items = ['START', 'ABOUT THE AUTHOR'];
    ctx.font = '26px "Courier New", monospace';

    items.forEach((label, i) => {
      const y = cy + 30 + i * 60;
      const selected = i === this._menuIndex;
      ctx.fillStyle = selected ? CANVAS.stroke : 'rgba(255,255,255,0.35)';
      ctx.fillText(label, cx, y);
      if (selected) {
        const w = ctx.measureText(label).width;
        ctx.fillText('>', cx - w / 2 - 20, y);
      }
    });

    ctx.font = '13px "Courier New", monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText('← →  NAVIGATE     SPACE  SELECT', cx, CANVAS.height - 30);
    ctx.restore();
  }

  _spawnInitialAsteroids() {
    const asteroids = [];
    const shipX = CANVAS.width / 2;
    const shipY = CANVAS.height / 2;
    while (asteroids.length < ASTEROID.spawnCount) {
      const x = Math.random() * CANVAS.width;
      const y = Math.random() * CANVAS.height;
      if (Math.hypot(x - shipX, y - shipY) >= ASTEROID.safeRadius) {
        asteroids.push(new Asteroid(x, y, 'large'));
      }
    }
    return asteroids;
  }

  splitAsteroid(asteroid) {
    this.asteroids = this.asteroids.filter((a) => a !== asteroid);
    const next = { large: 'medium', medium: 'small' }[asteroid.size];
    if (next) {
      this.asteroids.push(new Asteroid(asteroid.pos.x, asteroid.pos.y, next));
      this.asteroids.push(new Asteroid(asteroid.pos.x, asteroid.pos.y, next));
    }
  }

  _respawn() {
    this.ship.dead = false;
    this.ship.pos = { x: CANVAS.width / 2, y: CANVAS.height / 2 };
    this.ship.vel = { x: 0, y: 0 };
    this.ship.angle = -Math.PI / 2;
    this._invulnTimer = INVULN.invulnDuration;
  }

  update(dt) {
    if (this._state === 'splash') { this._updateSplash(); return; }

    // Drain fire buffer every frame; only spawn bullet when alive.
    const fired = this.input.consumeFire();
    if (!this.ship.dead && fired) {
      this.bullets.push(new Bullet(this.ship));
    }

    if (this.ship.dead) {
      this._respawnTimer -= dt;
      if (this._respawnTimer <= 0) this._respawn();
    } else {
      this.ship.update(dt, this.input, this.bounds);
    }

    if (this._invulnTimer > 0) {
      this._invulnTimer = Math.max(0, this._invulnTimer - dt);
    }

    for (const b of this.bullets) b.update(dt, this.bounds);
    for (const a of this.asteroids) a.update(dt, this.bounds);

    // Bullets vs asteroids: flag-and-filter so arrays aren't mutated mid-loop.
    const hitAsteroids = new Set();
    for (const b of this.bullets) {
      if (b.dead) continue;
      for (const a of this.asteroids) {
        if (circlesOverlap(b, a, this.bounds)) {
          b.dead = true;
          hitAsteroids.add(a);
          break;
        }
      }
    }
    for (const a of hitAsteroids) this.splitAsteroid(a);
    this.bullets = this.bullets.filter((b) => !b.dead);

    // Ship vs asteroids: skip while dead or invulnerable.
    if (!this.ship.dead && this._invulnTimer <= 0) {
      for (const a of this.asteroids) {
        if (circlesOverlap(this.ship, a, this.bounds)) {
          this.ship.dead = true;
          this._respawnTimer = INVULN.respawnDelay;
          break;
        }
      }
    }
  }

  render() {
    const { ctx } = this;

    if (this._state === 'splash') { this._renderSplash(ctx); return; }

    ctx.fillStyle = CANVAS.background;
    ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);

    this.starfield.draw(ctx);

    ctx.strokeStyle = CANVAS.stroke;
    ctx.lineWidth = CANVAS.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (!this.ship.dead) {
      const hidden =
        this._invulnTimer > 0 &&
        Math.floor((INVULN.invulnDuration - this._invulnTimer) / INVULN.blinkInterval) % 2 !== 0;
      if (!hidden) this.ship.draw(ctx);
    }

    for (const a of this.asteroids) a.draw(ctx, this.bounds);

    ctx.fillStyle = CANVAS.stroke;
    for (const b of this.bullets) b.draw(ctx);
  }
}
