import { CANVAS, ASTEROID, INVULN } from './config.js';
import { Ship } from './entities/ship.js';
import { Bullet } from './entities/bullet.js';
import { Asteroid } from './entities/asteroid.js';
import { Input } from './input.js';
import { circlesOverlap } from './utils/collision.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvas.width = CANVAS.width;
    this.canvas.height = CANVAS.height;

    this.bounds = { width: CANVAS.width, height: CANVAS.height };
    this.input = new Input();
    this.ship = new Ship(CANVAS.width / 2, CANVAS.height / 2);
    this.bullets = [];
    this.asteroids = this._spawnInitialAsteroids();
    this._respawnTimer = 0;
    this._invulnTimer = 0;

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

    ctx.fillStyle = CANVAS.background;
    ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);

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
