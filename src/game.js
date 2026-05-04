import { CANVAS, ASTEROID, INVULN, HUD, COIN, FRAGMENT, PARTICLE, WARP } from './config.js';
import { Ship } from './entities/ship.js';
import { Bullet } from './entities/bullet.js';
import { Asteroid } from './entities/asteroid.js';
import { Starfield } from './entities/starfield.js';
import { Input } from './input.js';
import { circlesOverlap } from './utils/collision.js';
import { drawAtWrappedPositions, wrap } from './utils/canvas.js';

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
    this._fragments = [];
    this._particles = [];
    this._coins        = [];
    this._coinParticles = [];
    this._score        = 0;
    this._lives       = HUD.lives;
    this._warpPhase   = 'none'; // 'none' | 'out' | 'in'
    this._warpTimer   = 0;
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
    if (this.input.consumeUp() || this.input.consumeDown()) {
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
    ctx.fillText('↑ ↓  NAVIGATE     SPACE  SELECT', cx, CANVAS.height - 30);
    ctx.restore();
  }

  _spawnParticles(ship) {
    const { pos, vel } = ship;
    return Array.from({ length: PARTICLE.count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = PARTICLE.minSpeed + Math.random() * (PARTICLE.maxSpeed - PARTICLE.minSpeed);
      const lifespan = PARTICLE.minAge + Math.random() * (PARTICLE.maxAge - PARTICLE.minAge);
      return {
        pos:     { x: pos.x, y: pos.y },
        vel:     { x: vel.x + Math.cos(angle) * speed, y: vel.y + Math.sin(angle) * speed },
        age:     0,
        maxAge:  lifespan,
        radius:  PARTICLE.minRadius + Math.random() * (PARTICLE.maxRadius - PARTICLE.minRadius),
        color:   PARTICLE.colors[Math.floor(Math.random() * PARTICLE.colors.length)],
      };
    });
  }

  _killShip() {
    this._lives -= 1;
    if (this._lives <= 0) {
      this._fragments = Ship.explode(this.ship, FRAGMENT);
      this._particles = this._spawnParticles(this.ship);
      this.bullets        = [];
      this._coins         = [];
      this._coinParticles = [];
      this.ship.dead = true;
      this._state = 'gameover';
    } else {
      this.ship.dead = true;
      this._warpPhase = 'out';
      this._warpTimer = 0;
    }
  }

  _randomRespawnPos() {
    const m = WARP.inMargin;
    return {
      x: m + Math.random() * (CANVAS.width  - 2 * m),
      y: m + Math.random() * (CANVAS.height - 2 * m),
    };
  }

  _resetGame() {
    this.ship = new Ship(CANVAS.width / 2, CANVAS.height / 2);
    this.bullets = [];
    this.asteroids = this._spawnInitialAsteroids();
    this._fragments = [];
    this._particles = [];
    this._coins        = [];
    this._coinParticles = [];
    this._score        = 0;
    this._lives       = HUD.lives;
    this._warpPhase   = 'none';
    this._warpTimer   = 0;
    this._invulnTimer = INVULN.invulnDuration;
  }

  _updateGameOver(dt) {
    for (const a of this.asteroids) a.update(dt, this.bounds);

    for (const f of this._fragments) {
      f.pos.x += f.vel.x * dt;
      f.pos.y += f.vel.y * dt;
      f.angle += f.rotVel * dt;
      f.age += dt;
      wrap(f.pos, this.bounds.width, this.bounds.height);
    }
    // Fragments persist until the game-over screen is dismissed.

    for (const p of this._particles) {
      p.pos.x += p.vel.x * dt;
      p.pos.y += p.vel.y * dt;
      p.age += dt;
    }
    this._particles = this._particles.filter((p) => p.age < p.maxAge);

    this.input.consumeUp();
    this.input.consumeDown();
    if (this.input.consumeFire()) {
      this._resetGame();
      this._state = 'splash';
    }
  }

  _renderGameOver(ctx) {
    ctx.save();
    const cx = CANVAS.width / 2;
    const cy = CANVAS.height / 2;

    // Live scene
    ctx.fillStyle = CANVAS.background;
    ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
    this.starfield.draw(ctx);

    ctx.strokeStyle = CANVAS.stroke;
    ctx.lineWidth = CANVAS.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const a of this.asteroids) a.draw(ctx, this.bounds);

    for (const f of this._fragments) {
      const cos = Math.cos(f.angle);
      const sin = Math.sin(f.angle);
      const toWorld = ({ x, y }) => ({
        x: f.pos.x + cos * x - sin * y,
        y: f.pos.y + sin * x + cos * y,
      });
      drawAtWrappedPositions(f.pos, 20, this.bounds, (wx, wy) => {
        const dx = wx - f.pos.x;
        const dy = wy - f.pos.y;
        const a0 = toWorld(f.points[0]);
        const a1 = toWorld(f.points[1]);
        ctx.beginPath();
        ctx.moveTo(a0.x + dx, a0.y + dy);
        ctx.lineTo(a1.x + dx, a1.y + dy);
        ctx.stroke();
      });
    }

    for (const p of this._particles) {
      ctx.globalAlpha = (1 - p.age / p.maxAge) ** 1.5;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Dim overlay so text reads clearly
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);

    // Floating text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = CANVAS.stroke;
    ctx.font = 'bold 64px "Courier New", monospace';
    ctx.fillText('GAME OVER', cx, cy - 40);

    ctx.font = '20px "Courier New", monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText('PRESS SPACE TO CONTINUE', cx, cy + 40);

    ctx.restore();
  }

  _renderHUD(ctx) {
    ctx.save();
    ctx.strokeStyle = CANVAS.stroke;
    ctx.lineWidth = CANVAS.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const displayLives = this._lives + (this._warpPhase === 'out' ? 1 : 0);
    for (let i = 0; i < displayLives; i++) {
      const x = CANVAS.width - HUD.iconPadding - i * HUD.iconSpacing;
      Ship.drawIcon(ctx, x, HUD.iconPadding, HUD.iconScale);
    }

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = '20px "Courier New", monospace';
    ctx.fillStyle = COIN.color;
    ctx.fillText(`${HUD.scoreSymbol} ${this._score}`, HUD.scorePadding, HUD.scorePadding);

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
    } else {
      this._spawnCoins(asteroid.pos);
    }
  }

  _spawnCoins(pos) {
    const count = COIN.minCount + Math.floor(Math.random() * (COIN.maxCount - COIN.minCount + 1));
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = COIN.minSpeed + Math.random() * (COIN.maxSpeed - COIN.minSpeed);
      this._coins.push({
        pos:      { x: pos.x, y: pos.y },
        vel:      { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
        rotAngle: Math.random() * Math.PI * 2,
        rotVel:   COIN.rotSpeed * (Math.random() < 0.5 ? 1 : -1),
        age:      0,
        radius:   COIN.radius,
      });
    }
  }

  _spawnCoinParticles(pos) {
    for (let i = 0; i < COIN.sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = COIN.sparkMinSpeed + Math.random() * (COIN.sparkMaxSpeed - COIN.sparkMinSpeed);
      this._coinParticles.push({
        pos:    { x: pos.x, y: pos.y },
        vel:    { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
        age:    0,
        maxAge: COIN.sparkMinAge + Math.random() * (COIN.sparkMaxAge - COIN.sparkMinAge),
        radius: 1 + Math.random() * 1.5,
        color:  COIN.color,
      });
    }
  }

  update(dt) {
    if (this._state === 'splash')   { this._updateSplash();   return; }
    if (this._state === 'gameover') { this._updateGameOver(dt); return; }

    // Drain fire buffer every frame; only spawn bullet when alive.
    const fired = this.input.consumeFire();
    if (!this.ship.dead && fired) {
      this.bullets.push(new Bullet(this.ship));
    }

    if (this.ship.dead) {
      this._warpTimer += dt;
      if (this._warpPhase === 'out' && this._warpTimer >= WARP.outDuration) {
        this._warpPhase = 'in';
        this._warpTimer = 0;
        this.ship.pos   = this._randomRespawnPos();
        this.ship.vel   = { x: 0, y: 0 };
        this.ship.angle = -Math.PI / 2;
      } else if (this._warpPhase === 'in' && this._warpTimer >= WARP.inDuration) {
        this._warpPhase   = 'none';
        this._warpTimer   = 0;
        this.ship.dead    = false;
        this._invulnTimer = INVULN.invulnDuration;
      }
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

    // Coins: move, spin, wrap, age.
    for (const c of this._coins) {
      c.pos.x    += c.vel.x * dt;
      c.pos.y    += c.vel.y * dt;
      c.rotAngle += c.rotVel * dt;
      c.age      += dt;
      wrap(c.pos, this.bounds.width, this.bounds.height);
    }

    // Bullets vs coins (runs before bullet filter so dead bullets are skipped).
    const deadCoins = new Set();
    for (const b of this.bullets) {
      if (b.dead) continue;
      for (const c of this._coins) {
        if (!deadCoins.has(c) && circlesOverlap(b, c, this.bounds)) {
          b.dead = true;
          deadCoins.add(c);
          this._spawnCoinParticles(c.pos);
          break;
        }
      }
    }
    this.bullets = this.bullets.filter((b) => !b.dead);

    // Expire, collect, and remove bullet-hit coins.
    this._coins = this._coins.filter((c) => {
      if (deadCoins.has(c) || c.age >= COIN.maxAge) return false;
      if (!this.ship.dead && circlesOverlap(this.ship, c, this.bounds)) {
        this._score += 1;
        return false;
      }
      return true;
    });

    // Coin particles: move and expire.
    for (const p of this._coinParticles) {
      p.pos.x += p.vel.x * dt;
      p.pos.y += p.vel.y * dt;
      p.age   += dt;
    }
    this._coinParticles = this._coinParticles.filter((p) => p.age < p.maxAge);

    // Ship vs asteroids: skip while dead or invulnerable.
    if (!this.ship.dead && this._invulnTimer <= 0) {
      for (const a of this.asteroids) {
        if (circlesOverlap(this.ship, a, this.bounds)) {
          this._killShip();
          break;
        }
      }
    }
  }

  render() {
    const { ctx } = this;

    if (this._state === 'splash')   { this._renderSplash(ctx);   return; }
    if (this._state === 'gameover') { this._renderGameOver(ctx); return; }

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
    } else if (this._warpPhase !== 'none') {
      const dur = this._warpPhase === 'out' ? WARP.outDuration : WARP.inDuration;
      const t   = Math.min(this._warpTimer / dur, 1);
      // Warp-out: ship shrinks (1→0); warp-in: ship grows (0→1).
      const shipScale = this._warpPhase === 'out' ? 1 - t : t;

      // Ship hull, scaled around its centre.
      if (shipScale > 0.01) {
        ctx.save();
        ctx.translate(this.ship.pos.x, this.ship.pos.y);
        ctx.scale(shipScale, shipScale);
        ctx.translate(-this.ship.pos.x, -this.ship.pos.y);
        this.ship.draw(ctx);
        ctx.restore();
      }

      // Expanding cyan ring that fades out — same pattern for both phases.
      ctx.save();
      ctx.strokeStyle = WARP.color;
      ctx.lineWidth   = 2;
      ctx.globalAlpha = (1 - t) * 0.9;
      ctx.beginPath();
      ctx.arc(this.ship.pos.x, this.ship.pos.y, WARP.ringMaxRadius * t, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = (1 - t) * 0.5;
      ctx.beginPath();
      ctx.arc(this.ship.pos.x, this.ship.pos.y, WARP.ringMaxRadius * 0.55 * t, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    for (const a of this.asteroids) a.draw(ctx, this.bounds);

    ctx.fillStyle = CANVAS.stroke;
    for (const b of this.bullets) b.draw(ctx);

    for (const c of this._coins) {
      let alpha = 1;
      if (c.age >= COIN.pulseFast) {
        alpha = 0.5 + 0.5 * Math.sin(c.age * COIN.pulseFastFreq);
      } else if (c.age >= COIN.pulseStart) {
        alpha = 0.5 + 0.5 * Math.sin(c.age * COIN.pulseSlowFreq);
      }
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(c.pos.x, c.pos.y);
      ctx.scale(Math.abs(Math.cos(c.rotAngle)), 1);
      ctx.fillStyle = COIN.color;
      ctx.beginPath();
      ctx.arc(0, 0, COIN.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = COIN.shine;
      ctx.beginPath();
      ctx.arc(0, 0, COIN.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (const p of this._coinParticles) {
      ctx.globalAlpha = (1 - p.age / p.maxAge) ** 1.5;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    this._renderHUD(ctx);
  }
}
