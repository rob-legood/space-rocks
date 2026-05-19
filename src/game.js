import { CANVAS, ASTEROID, INVULN, HUD, COIN, PLATINUM, DILITHIUM, FRAGMENT, PARTICLE, WARP, WORMHOLE, STATION, SHIP, HIT_SPARK, ENEMY, DRONE, CARGO, MINE, COMET } from './config.js';
import UPGRADES from './upgrades.json';
import { getLevel, LEVEL_ZERO } from './levels.js';
import { Ship } from './entities/ship.js';
import { Bullet } from './entities/bullet.js';
import { Asteroid } from './entities/asteroid.js';
import { Enemy } from './entities/enemy.js';
import { Drone } from './entities/drone.js';
import { Cargo } from './entities/cargo.js';
import { Mine } from './entities/mine.js';
import { Comet } from './entities/comet.js';
import { Wormhole } from './entities/wormhole.js';
import { Starfield } from './entities/starfield.js';
import { Input } from './input.js';
import { circlesOverlap } from './utils/collision.js';
import { drawAtWrappedPositions, wrap } from './utils/canvas.js';
import {
  playFire, playBang, playExplosion, playHit,
  playCoinCollect, playCoinDestroy, playCargoDestroy, playEnemyFire, playDroneDestroy,
  playWarpOut, playWarpIn,
  playMenuNav, playMenuSelect,
  startThrust, stopThrust,
} from './audio.js';
import { playMusic, stopMusic } from './music.js';

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
    this._fragments = [];
    this._particles = [];
    this._coins            = [];
    this._coinParticles    = [];
    this._platinum         = [];
    this._platinumParticles= [];
    this._dilithium        = [];
    this._hitParticles  = [];
    this._enemies             = [];
    this._enemyBullets        = [];
    this._pendingEnemySpawns  = [];
    this._drones              = [];
    this._cargos              = [];
    this._splinterParticles   = [];
    this._mines               = [];
    this._shockwaves          = [];
    this._comets              = [];
    this._cometTrail          = [];
    this._score        = 0;
    this._lives       = HUD.lives;
    this._warpPhase   = 'none'; // 'none' | 'out' | 'in'
    this._warpTimer   = 0;
    this._invulnTimer   = INVULN.invulnDuration;
    this._wasThrusting  = false;
    this._state     = 'splash';
    this._menuIndex = 0;
    this._level         = LEVEL_ZERO.enabled ? 0 : 1;
    this.asteroids = this._spawnInitialAsteroids(this._level);
    this._enterTimer    = 0;
    this._exitTimer     = 0;
    this._entryWormhole = null;
    this._exitWormhole  = null;

    this._stationPhase     = 'docking';
    this._stationTimer     = 0;
    this._stationMenuIndex = 3; // default to LAUNCH
    this._stationScreen    = 'menu'; // 'menu' | 'upgrade'
    this._upgradeMenuIndex = 0;
    this._upgradeState     = {}; // upgrade id → current tier index
    this._fireTimer        = 999; // time since last shot; 999 allows immediate first shot

    this._devMode = false;

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
      this._resetGame();
      this._startStation();
    } else {
      window.location.href = 'https://roblegood.ca';
    }
  }

  _updateSplash() {
    const nav = this.input.consumeUp() | this.input.consumeDown();
    if (nav) {
      this._menuIndex = 1 - this._menuIndex;
      playMenuNav();
    }
    if (this.input.consumeFire()) {
      playMenuSelect();
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
    stopThrust();
    this._wasThrusting = false;
    this._lives -= 1;
    if (this._lives <= 0) {
      stopMusic();
      playExplosion();
      this._fragments = Ship.explode(this.ship, FRAGMENT);
      this._particles = this._spawnParticles(this.ship);
      this.bullets               = [];
      this._coins                = [];
      this._coinParticles        = [];
      this._platinum             = [];
      this._platinumParticles    = [];
      this._dilithium            = [];
      this._hitParticles         = [];
      this._mines                = [];
      this._shockwaves           = [];
      this._comets               = [];
      this._cometTrail           = [];
      this._drones               = [];
      this.ship.dead = true;
      this._state = 'gameover';
    } else {
      playWarpOut();
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
    stopThrust();
    stopMusic();
    this._wasThrusting = false;
    this.ship = new Ship(CANVAS.width / 2, CANVAS.height / 2);
    this.bullets = [];
    this._fragments = [];
    this._particles = [];
    this._coins            = [];
    this._coinParticles    = [];
    this._platinum         = [];
    this._platinumParticles= [];
    this._dilithium        = [];
    this._hitParticles  = [];
    this._enemies             = [];
    this._enemyBullets        = [];
    this._pendingEnemySpawns  = [];
    this._drones              = [];
    this._cargos              = [];
    this._splinterParticles   = [];
    this._mines               = [];
    this._shockwaves          = [];
    this._comets              = [];
    this._cometTrail          = [];
    this._score        = 0;
    this._lives       = HUD.lives;
    this._warpPhase     = 'none';
    this._warpTimer     = 0;
    this._invulnTimer   = INVULN.invulnDuration;
    this._level         = LEVEL_ZERO.enabled ? 0 : 1;
    this.asteroids = this._spawnInitialAsteroids(this._level);
    this._enterTimer    = 0;
    this._exitTimer     = 0;
    this._entryWormhole = null;
    this._exitWormhole  = null;
    this._stationPhase     = 'docking';
    this._stationTimer     = 0;
    this._stationMenuIndex = 3;
    this._stationScreen    = 'menu';
    this._upgradeMenuIndex = 0;
    this._upgradeState     = {};
    this._fireTimer        = 999;
  }

  _startStation() {
    stopThrust();
    playMusic('station');
    this._wasThrusting    = false;
    this._stationPhase    = 'docking';
    this._stationTimer    = 0;
    this._stationMenuIndex = 3;
    this._stationScreen   = 'menu';
    this._upgradeMenuIndex = 0;
    this.ship.vel  = { x: 0, y: 0 };
    this.ship.dead = false;
    this._state    = 'station';
  }

  _getUpgradeValue(id) {
    const def  = UPGRADES.upgrades.find(u => u.id === id);
    const tier = this._upgradeState[id] ?? 0;
    return def.levels[tier];
  }

  _updateUpgradeScreen() {
    const items = [...UPGRADES.upgrades, { id: '_back', name: 'BACK' }];
    if (this.input.consumeUp()) {
      this._upgradeMenuIndex = (this._upgradeMenuIndex - 1 + items.length) % items.length;
      playMenuNav();
    }
    if (this.input.consumeDown()) {
      this._upgradeMenuIndex = (this._upgradeMenuIndex + 1) % items.length;
      playMenuNav();
    }
    if (this.input.consumeFire()) {
      const item = items[this._upgradeMenuIndex];
      if (item.id === '_back') {
        playMenuSelect();
        this._stationScreen    = 'menu';
        this._stationMenuIndex = 0; // land on UPGRADE
      } else {
        const tier     = this._upgradeState[item.id] ?? 0;
        const nextTier = tier + 1;
        if (nextTier < item.levels.length) {
          const cost = item.costs[nextTier];
          if (this._score >= cost) {
            this._score -= cost;
            this._upgradeState[item.id] = nextTier;
            playMenuSelect();
          }
        }
      }
    }
  }

  _renderUpgradeScreen(ctx) {
    const { x: px, y: py, w: pw, h: ph } = STATION.pane;
    const menuX      = px + 24;
    const menuStartY = py + ph + 14;
    const items      = [...UPGRADES.upgrades, { id: '_back', name: 'BACK' }];

    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.font         = 'bold 18px "Courier New", monospace';
    ctx.fillStyle    = STATION.borderColor;
    ctx.fillText('UPGRADES', menuX, menuStartY);

    items.forEach((item, i) => {
      const itemY    = menuStartY + 36 + i * 46;
      const selected = i === this._upgradeMenuIndex;

      ctx.textAlign    = 'left';
      ctx.textBaseline = 'middle';

      if (item.id === '_back') {
        ctx.font      = '20px "Courier New", monospace';
        ctx.fillStyle = selected ? CANVAS.stroke : 'rgba(255,255,255,0.28)';
        ctx.fillText('BACK', menuX, itemY);
        if (selected) ctx.fillText('>', px + 8, itemY);
        return;
      }

      const tier    = this._upgradeState[item.id] ?? 0;
      const maxTier = item.levels.length - 1;
      const maxed   = tier >= maxTier;
      const curVal  = item.levels[tier];
      const u       = item.unit ?? '';

      let label;
      let canAfford = false;
      if (maxed) {
        label = `${item.name}  ${curVal}${u}  [MAX]`;
      } else {
        const nextVal = item.levels[tier + 1];
        const cost    = item.costs[tier + 1];
        canAfford     = this._score >= cost;
        label = `${item.name}  ${curVal}${u} -> ${nextVal}${u}  (${HUD.scoreSymbol}${cost})`;
      }

      ctx.font = '20px "Courier New", monospace';
      if (maxed) {
        ctx.fillStyle = selected ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)';
      } else if (!canAfford) {
        ctx.fillStyle = selected ? 'rgba(255,180,0,0.45)' : 'rgba(255,180,0,0.2)';
      } else {
        ctx.fillStyle = selected ? CANVAS.stroke : 'rgba(255,255,255,0.28)';
      }
      ctx.fillText(label, menuX, itemY);
      if (selected) ctx.fillText('>', px + 8, itemY);
    });

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'bottom';
    ctx.font         = '13px "Courier New", monospace';
    ctx.fillStyle    = 'rgba(255,255,255,0.3)';
    ctx.fillText('↑ ↓  NAVIGATE     SPACE  SELECT', CANVAS.width / 2, CANVAS.height - 12);
  }

  _startEntering() {
    stopThrust();
    this._wasThrusting    = false;
    this._enterTimer      = 0;
    this._enterSoundFired = false;
    this._entryWormhole   = new Wormhole(CANVAS.width / 2, CANVAS.height / 2);
    this.ship.pos   = { x: CANVAS.width / 2, y: CANVAS.height / 2 };
    this.ship.vel   = { x: 0, y: 0 };
    this.ship.angle = -Math.PI / 2;
    this.ship.dead  = false;
    this._state     = 'entering';
  }

  _advanceLevel() {
    this._level++;
    this.starfield = new Starfield();
    this.bullets              = [];
    this._coins               = [];
    this._coinParticles       = [];
    this._platinum            = [];
    this._platinumParticles   = [];
    this._dilithium           = [];
    this._hitParticles        = [];
    this._fragments           = [];
    this._particles           = [];
    this._enemies             = [];
    this._enemyBullets        = [];
    this._drones              = [];
    this._splinterParticles   = [];
    this._mines               = [];
    this._shockwaves          = [];
    this._comets              = [];
    this._cometTrail          = [];
    this._warpPhase           = 'none';
    this._warpTimer           = 0;
    this._exitWormhole        = null;
    this.asteroids            = this._spawnInitialAsteroids(this._level);
    this._startStation();
  }

  _spawnExitWormhole() {
    let x, y;
    do {
      x = Math.random() * CANVAS.width;
      y = Math.random() * CANVAS.height;
    } while (Math.hypot(x - this.ship.pos.x, y - this.ship.pos.y) < WORMHOLE.safeDistance);
    return new Wormhole(x, y);
  }

  _updateEntering(dt) {
    this.input.consumeFire(); // drain so Space pressed during animation doesn't queue a shot
    this._enterTimer += dt;
    if (!this._enterSoundFired && this._enterTimer >= WORMHOLE.enterDuration * 0.4) {
      playWarpIn();
      this._enterSoundFired = true;
    }
    this._entryWormhole.update(dt);
    for (const a of this.asteroids) a.update(dt, this.bounds);
    for (const c of this._cargos) c.update(dt, this.bounds);
    if (this._enterTimer >= WORMHOLE.enterDuration) {
      this._entryWormhole = null;
      this._invulnTimer   = INVULN.invulnDuration;
      this._state         = 'playing';
      playMusic(this._drones.length > 0 ? 'enemy' : 'playing');
    }
  }

  _renderEntering(ctx) {
    ctx.fillStyle = CANVAS.background;
    ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
    this.starfield.draw(ctx);

    ctx.strokeStyle = CANVAS.stroke;
    ctx.lineWidth   = CANVAS.lineWidth;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';

    for (const a of this.asteroids) a.draw(ctx, this.bounds);
    for (const c of this._cargos) c.draw(ctx, this.bounds);

    const openFactor = Math.min(this._enterTimer / WORMHOLE.enterDuration, 1);

    // Wormhole drawn first; ship emerges through it on top.
    this._entryWormhole.draw(ctx, openFactor);

    // Ship grows out of the wormhole in the second half of the animation.
    const shipScale = Math.max(0, (openFactor - 0.4) / 0.6);
    if (shipScale > 0.01) {
      const { x, y } = this.ship.pos;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(shipScale, shipScale);
      ctx.translate(-x, -y);
      this.ship.draw(ctx);
      ctx.restore();
    }

    this._renderHUD(ctx);
  }

  _updateExiting(dt) {
    this._exitTimer += dt;
    this._exitWormhole.update(dt);
    if (this._exitTimer >= WORMHOLE.exitDuration) {
      this._advanceLevel();
    }
  }

  _renderExiting(ctx) {
    ctx.fillStyle = CANVAS.background;
    ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
    this.starfield.draw(ctx);

    ctx.strokeStyle = CANVAS.stroke;
    ctx.lineWidth   = CANVAS.lineWidth;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';

    // Wormhole first so the ship renders on top and visibly shrinks into it.
    this._exitWormhole.draw(ctx, 1);

    const t = Math.min(this._exitTimer / WORMHOLE.exitDuration, 1);
    const shipScale = 1 - t;
    if (shipScale > 0.01) {
      const { x, y } = this.ship.pos;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(shipScale, shipScale);
      ctx.translate(-x, -y);
      this.ship.draw(ctx);
      ctx.restore();
    }

    this._renderHUD(ctx);
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

    if (this._devMode) {
      ctx.textAlign = 'center';
      ctx.font = '13px "Courier New", monospace';
      ctx.fillStyle = '#0f0';
      ctx.fillText('[DEV]', CANVAS.width / 2, HUD.scorePadding);
    }

    ctx.restore();
  }

  _spawnInitialAsteroids(level) {
    const asteroids = [];
    this._pendingEnemySpawns = [];
    this._cargos = [];
    const shipX = CANVAS.width / 2;
    const shipY = CANVAS.height / 2;
    const lvl = getLevel(level);
    for (const entry of lvl.spawn) {
      if (entry.type === 'enemy') {
        const minT = entry.minSpawnTime ?? 5;
        const maxT = entry.maxSpawnTime ?? 10;
        for (let i = 0; i < (entry.count ?? 1); i++) {
          this._pendingEnemySpawns.push({
            timer:        minT + Math.random() * (maxT - minT),
            speed:        entry.speed        ?? 60,
            shotInterval: entry.shotInterval ?? 1,
            hp:           entry.hp           ?? 1,
            size:         entry.size         ?? undefined,
            minCoins:     entry.minCoins     ?? 0,
            maxCoins:     entry.maxCoins     ?? 0,
            minPlatinum:  entry.minPlatinum  ?? 0,
            maxPlatinum:  entry.maxPlatinum  ?? 0,
            minDilithium: entry.minDilithium ?? 0,
            maxDilithium: entry.maxDilithium ?? 0,
          });
        }
      } else if (entry.type === 'cargo') {
        for (let i = 0; i < (entry.count ?? 1); i++) {
          let x, y;
          do {
            x = Math.random() * CANVAS.width;
            y = Math.random() * CANVAS.height;
          } while (Math.hypot(x - shipX, y - shipY) < ASTEROID.safeRadius);
          this._cargos.push(new Cargo(x, y, entry));
        }
      } else if (entry.type === 'mine') {
        for (let i = 0; i < (entry.count ?? 1); i++) {
          let x, y;
          do {
            x = Math.random() * CANVAS.width;
            y = Math.random() * CANVAS.height;
          } while (Math.hypot(x - shipX, y - shipY) < ASTEROID.safeRadius);
          this._mines.push(new Mine(x, y, {
            shockwaveRadius: entry.shockwaveRadius,
            shockwaveSpeed:  entry.shockwaveSpeed,
          }));
        }
      } else if (entry.type === 'comet') {
        for (let i = 0; i < (entry.count ?? 1); i++) {
          let x, y;
          do {
            x = Math.random() * CANVAS.width;
            y = Math.random() * CANVAS.height;
          } while (Math.hypot(x - shipX, y - shipY) < ASTEROID.safeRadius);
          this._comets.push(new Comet(x, y));
        }
      } else if (entry.type === 'drone') {
        for (let i = 0; i < (entry.count ?? 1); i++) {
          let x, y;
          do {
            x = Math.random() * CANVAS.width;
            y = Math.random() * CANVAS.height;
          } while (Math.hypot(x - shipX, y - shipY) < ASTEROID.safeRadius);
          this._drones.push(new Drone(x, y, {
            hp:           entry.hp           ?? DRONE.hp,
            speed:        entry.speed        ?? DRONE.speed,
            accel:        entry.accel        ?? DRONE.accel,
            turnRate:     entry.turnRate     ?? DRONE.turnRate,
            minCoins:     entry.minCoins     ?? 0,
            maxCoins:     entry.maxCoins     ?? 0,
            minPlatinum:  entry.minPlatinum  ?? 0,
            maxPlatinum:  entry.maxPlatinum  ?? 0,
            minDilithium: entry.minDilithium ?? 0,
            maxDilithium: entry.maxDilithium ?? 0,
          }));
        }
      } else {
        const { type, count } = entry;
        let spawned = 0;
        while (spawned < count) {
          const x = Math.random() * CANVAS.width;
          const y = Math.random() * CANVAS.height;
          if (Math.hypot(x - shipX, y - shipY) >= ASTEROID.safeRadius) {
            asteroids.push(new Asteroid(x, y, type));
            spawned++;
          }
        }
      }
    }
    return asteroids;
  }

  splitAsteroid(asteroid) {
    playBang(asteroid.bangSize);
    this.asteroids = this.asteroids.filter((a) => a !== asteroid);
    if (asteroid.childType && asteroid.childCount > 0) {
      for (let i = 0; i < asteroid.childCount; i++) {
        this.asteroids.push(new Asteroid(asteroid.pos.x, asteroid.pos.y, asteroid.childType));
      }
    } else {
      this._spawnResources(asteroid.pos, asteroid);
    }
  }

  _spawnCoins(pos, count = null) {
    count = count ?? (COIN.minCount + Math.floor(Math.random() * (COIN.maxCount - COIN.minCount + 1)));
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

  _spawnResources(pos, cfg) {
    const coins = (cfg.minCoins ?? 0) + Math.floor(Math.random() * ((cfg.maxCoins ?? 0) - (cfg.minCoins ?? 0) + 1));
    if (coins > 0) this._spawnCoins(pos, coins);
    const plat = (cfg.minPlatinum ?? 0) + Math.floor(Math.random() * ((cfg.maxPlatinum ?? 0) - (cfg.minPlatinum ?? 0) + 1));
    if (plat > 0) this._spawnPlatinum(pos, plat);
    const dil = (cfg.minDilithium ?? 0) + Math.floor(Math.random() * ((cfg.maxDilithium ?? 0) - (cfg.minDilithium ?? 0) + 1));
    if (dil > 0) this._spawnDilithium(pos, dil);
  }

  _spawnPlatinum(pos, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = PLATINUM.minSpeed + Math.random() * (PLATINUM.maxSpeed - PLATINUM.minSpeed);
      this._platinum.push({
        pos:      { x: pos.x, y: pos.y },
        vel:      { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
        rotAngle: Math.random() * Math.PI * 2,
        rotVel:   PLATINUM.rotSpeed * (Math.random() < 0.5 ? 1 : -1),
        age:      0,
        radius:   PLATINUM.radius,
      });
    }
  }

  _spawnDilithium(pos, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = DILITHIUM.minSpeed + Math.random() * (DILITHIUM.maxSpeed - DILITHIUM.minSpeed);
      this._dilithium.push({
        pos:      { x: pos.x, y: pos.y },
        vel:      { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
        rotAngle: Math.random() * Math.PI * 2,
        rotVel:   DILITHIUM.rotSpeed * (Math.random() < 0.5 ? 1 : -1),
        age:      0,
        radius:   DILITHIUM.radius,
      });
    }
  }

  _spawnPlatinumParticles(pos) {
    for (let i = 0; i < PLATINUM.sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = PLATINUM.sparkMinSpeed + Math.random() * (PLATINUM.sparkMaxSpeed - PLATINUM.sparkMinSpeed);
      this._platinumParticles.push({
        pos:    { x: pos.x, y: pos.y },
        vel:    { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
        age:    0,
        maxAge: PLATINUM.sparkMinAge + Math.random() * (PLATINUM.sparkMaxAge - PLATINUM.sparkMinAge),
        radius: 1 + Math.random() * 1.5,
        color:  PLATINUM.color,
      });
    }
  }

  _spawnDroneParticles(pos) {
    for (let i = 0; i < DRONE.sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = DRONE.sparkMinSpeed + Math.random() * (DRONE.sparkMaxSpeed - DRONE.sparkMinSpeed);
      this._hitParticles.push({
        pos:    { x: pos.x, y: pos.y },
        vel:    { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
        age:    0,
        maxAge: DRONE.sparkMinAge + Math.random() * (DRONE.sparkMaxAge - DRONE.sparkMinAge),
        radius: DRONE.sparkMinRadius + Math.random() * (DRONE.sparkMaxRadius - DRONE.sparkMinRadius),
        color:  DRONE.sparkColor,
      });
    }
  }

  _spawnHitParticles(pos) {
    for (let i = 0; i < HIT_SPARK.count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = HIT_SPARK.minSpeed + Math.random() * (HIT_SPARK.maxSpeed - HIT_SPARK.minSpeed);
      this._hitParticles.push({
        pos:    { x: pos.x, y: pos.y },
        vel:    { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
        age:    0,
        maxAge: HIT_SPARK.minAge + Math.random() * (HIT_SPARK.maxAge - HIT_SPARK.minAge),
        radius: HIT_SPARK.minRadius + Math.random() * (HIT_SPARK.maxRadius - HIT_SPARK.minRadius),
        color:  HIT_SPARK.color,
      });
    }
  }

  _spawnSplinterParticles(pos) {
    for (let i = 0; i < CARGO.splinterCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = CARGO.splinterMinSpeed + Math.random() * (CARGO.splinterMaxSpeed - CARGO.splinterMinSpeed);
      this._splinterParticles.push({
        pos:    { x: pos.x, y: pos.y },
        vel:    { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
        age:    0,
        maxAge: CARGO.splinterMinAge + Math.random() * (CARGO.splinterMaxAge - CARGO.splinterMinAge),
        radius: 1 + Math.random() * 2,
        color:  CARGO.splinterColors[Math.floor(Math.random() * CARGO.splinterColors.length)],
      });
    }
  }

  _spawnCometTrail(comet, dt) {
    const count = Math.floor(COMET.trailRate * dt + Math.random());
    for (let i = 0; i < count; i++) {
      const perp = (Math.random() * 2 - 1) * COMET.trailSpread;
      this._cometTrail.push({
        pos: {
          x: comet.pos.x + (-comet.dir.y) * perp,
          y: comet.pos.y + ( comet.dir.x) * perp,
        },
        vel: {
          x: -comet.dir.x * COMET.trailSpeed + (Math.random() - 0.5) * 10,
          y: -comet.dir.y * COMET.trailSpeed + (Math.random() - 0.5) * 10,
        },
        age:    0,
        maxAge: COMET.trailMinAge + Math.random() * (COMET.trailMaxAge - COMET.trailMinAge),
        radius: COMET.trailRadius,
        color:  COMET.trailColors[Math.floor(Math.random() * COMET.trailColors.length)],
      });
    }
  }

  _triggerMine(mine) {
    this._shockwaves.push({
      pos:         { x: mine.pos.x, y: mine.pos.y },
      radius:      0,
      maxRadius:   mine.shockwaveRadius,
      expandSpeed: mine.shockwaveSpeed,
      dead:        false,
    });
    playBang('large');
  }

  _updateStation(dt) {
    if (this._stationPhase === 'docking') {
      this.input.consumeFire();
      this.input.consumeUp();
      this.input.consumeDown();
      this._stationTimer += dt;
      if (this._stationTimer >= STATION.dockDuration) {
        const lvl = getLevel(this._level);
        this._stationPhase = lvl.storytext ? 'storytext' : 'docked';
        this._stationTimer = 0;
      }
      return;
    }

    if (this._stationPhase === 'storytext') {
      this.input.consumeUp();
      this.input.consumeDown();
      if (this.input.consumeFire()) {
        playMenuSelect();
        this._stationPhase = 'docked';
        this._stationTimer = 0;
      }
      return;
    }

    if (this._stationPhase === 'docked') {
      if (this._stationScreen === 'upgrade') {
        this._updateUpgradeScreen();
        return;
      }

      const items = STATION.menuItems;
      if (this.input.consumeUp()) {
        this._stationMenuIndex = (this._stationMenuIndex - 1 + items.length) % items.length;
        playMenuNav();
      }
      if (this.input.consumeDown()) {
        this._stationMenuIndex = (this._stationMenuIndex + 1) % items.length;
        playMenuNav();
      }
      if (this.input.consumeFire()) {
        if (items[this._stationMenuIndex] === 'LAUNCH') {
          playMenuSelect();
          this._stationPhase = 'launching';
          this._stationTimer = 0;
        } else if (items[this._stationMenuIndex] === 'UPGRADE') {
          playMenuSelect();
          this._stationScreen    = 'upgrade';
          this._upgradeMenuIndex = 0;
        }
        // SELL / BUY: placeholder — no action yet
      }
      return;
    }

    if (this._stationPhase === 'launching') {
      this.input.consumeFire();
      this.input.consumeUp();
      this.input.consumeDown();
      this._stationTimer += dt;
      if (this._stationTimer >= STATION.launchDuration) {
        this._startEntering();
      }
    }
  }

  // Returns ship state {x, y, angle, scale} in pane-local coordinates.
  _getStationShipState() {
    const { dockX, dockY, entryX, entryY, exitX, exitY, dockDuration } = STATION;
    const t = this._stationTimer;

    if (this._stationPhase === 'docking') {
      const p    = Math.min(t / dockDuration, 1);
      const ease = 1 - (1 - p) ** 2; // ease-out quad
      return {
        x: entryX + (dockX - entryX) * ease,
        y: entryY + (dockY - entryY) * ease,
        angle: Math.PI,
        scale: 1,
      };
    }

    if (this._stationPhase === 'docked' ||
        this._stationPhase === 'storytext') {
      return { x: dockX, y: dockY, angle: Math.PI, scale: 1 };
    }

    if (this._stationPhase === 'launching') {
      // Rotate nose from left (π) through up to right (2π≡0) over first 0.4s.
      const angleT = Math.min(t / 0.4, 1);
      const angle  = Math.PI + Math.PI * angleT;

      // Move from dock to exit wormhole over [0.3, 1.1].
      let x = dockX, y = dockY;
      if (t > 0.3) {
        const mt   = Math.min((t - 0.3) / 0.8, 1);
        const ease = mt * mt; // ease-in
        x = dockX + (exitX - dockX) * ease;
        y = dockY + (exitY - dockY) * ease;
      }

      // Shrink into wormhole over [0.9, 1.5].
      const scale = t > 0.9 ? Math.max(0, 1 - (t - 0.9) / 0.6) : 1;

      return { x, y, angle, scale };
    }

    return { x: dockX, y: dockY, angle: Math.PI, scale: 0 };
  }

  _drawPaneWormhole(ctx, cx, cy, openFactor, age) {
    if (openFactor <= 0) return;
    const r   = STATION.wormholeR * openFactor;
    const rot = age * WORMHOLE.rotSpeed;

    ctx.save();
    ctx.translate(cx, cy);

    for (let i = 0; i < 3; i++) {
      const a = rot + (i / 3) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(0, 0, r, a, a + Math.PI * 0.55);
      ctx.strokeStyle = WORMHOLE.outerColor;
      ctx.lineWidth   = 1.5;
      ctx.stroke();
    }
    for (let i = 0; i < 2; i++) {
      const a = -rot * 1.4 + i * Math.PI;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.58, a, a + Math.PI * 0.7);
      ctx.strokeStyle = WORMHOLE.innerColor;
      ctx.lineWidth   = 1;
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.38, 0, Math.PI * 2);
    ctx.fillStyle = '#000014';
    ctx.fill();

    ctx.restore();
  }

  _wrapText(ctx, text, maxWidth) {
    const lines = [];
    for (const paragraph of text.split('\n')) {
      const words = paragraph.split(' ');
      let line = '';
      for (const word of words) {
        const test = line ? line + ' ' + word : word;
        if (ctx.measureText(test).width > maxWidth && line) {
          lines.push(line);
          line = word;
        } else {
          line = test;
        }
      }
      lines.push(line);
    }
    return lines;
  }

  _renderStoryPanel(ctx) {
    const { x: px, y: py, w: pw } = STATION.pane;
    const lvl        = getLevel(this._level);
    const text        = lvl.storytext;
    const headerLabel = 'INCOMING TRANSMISSION';

    const panelX = px + pw + 24;
    const panelY = py;
    const panelW = CANVAS.width - panelX - 16;
    const panelH = CANVAS.height - panelY - 16;

    // Background + border
    ctx.fillStyle   = 'rgba(0,8,18,0.92)';
    ctx.fillRect(panelX, panelY, panelW, panelH);
    ctx.strokeStyle = STATION.borderColor;
    ctx.lineWidth   = 1.5;
    ctx.strokeRect(panelX, panelY, panelW, panelH);

    const innerX   = panelX + 22;
    const innerW   = panelW - 44;
    let   curY     = panelY + 26;

    // Small header label
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'top';
    ctx.font         = '12px "Courier New", monospace';
    ctx.fillStyle    = STATION.borderColor;
    ctx.fillText(headerLabel, innerX, curY);
    curY += 20;

    // Level title
    ctx.font      = 'bold 20px "Courier New", monospace';
    ctx.fillStyle = CANVAS.stroke;
    ctx.fillText(lvl.title, innerX, curY);
    curY += 32;

    // Separator
    ctx.strokeStyle = 'rgba(68,170,255,0.25)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(innerX, curY);
    ctx.lineTo(panelX + panelW - 22, curY);
    ctx.stroke();
    curY += 18;

    // Story text (wrapped, supports \n paragraphs)
    ctx.font         = '15px "Courier New", monospace';
    ctx.fillStyle    = 'rgba(255,255,255,0.82)';
    ctx.textBaseline = 'top';
    const lineHeight = 22;
    const lines      = this._wrapText(ctx, text, innerW);
    for (const line of lines) {
      ctx.fillText(line, innerX, curY);
      curY += lineHeight;
    }

    // Blinking dismiss prompt
    const blink = Math.floor(performance.now() / 500) % 2 === 0;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'bottom';
    ctx.font         = '14px "Courier New", monospace';
    ctx.fillStyle    = blink ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)';
    ctx.fillText('[ PRESS SPACE TO CONTINUE ]', panelX + panelW / 2, panelY + panelH - 14);
  }

  _renderStation(ctx) {
    ctx.save();

    ctx.fillStyle = CANVAS.background;
    ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
    this.starfield.draw(ctx);

    const { x: px, y: py, w: pw, h: ph } = STATION.pane;

    // Pane background + border (drawn outside clip so border isn't cropped).
    ctx.fillStyle = 'rgba(0,8,18,0.92)';
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = STATION.borderColor;
    ctx.lineWidth   = 1.5;
    ctx.strokeRect(px, py, pw, ph);

    // --- Pane contents (clipped) ---
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py, pw, ph);
    ctx.clip();

    ctx.strokeStyle = CANVAS.stroke;
    ctx.lineWidth   = CANVAS.lineWidth;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';

    // Space station structure
    const sx = px + STATION.stationX;
    const sy = py + STATION.stationY;
    const r  = STATION.hubRadius;

    // Hub hexagon
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a  = (i / 6) * Math.PI * 2 - Math.PI / 6;
      const vx = sx + r * Math.cos(a);
      const vy = sy + r * Math.sin(a);
      if (i === 0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy);
    }
    ctx.closePath();
    ctx.stroke();

    // Left solar panel arm + panel
    ctx.beginPath();
    ctx.moveTo(sx - r, sy);
    ctx.lineTo(sx - r - STATION.panelLen, sy);
    ctx.stroke();
    const lpx = sx - r - STATION.panelLen;
    ctx.beginPath();
    ctx.moveTo(lpx, sy - STATION.panelW);
    ctx.lineTo(lpx, sy + STATION.panelW);
    ctx.stroke();

    // Right dock arm
    const armTipX = px + STATION.dockX - 14;
    ctx.beginPath();
    ctx.moveTo(sx + r, sy);
    ctx.lineTo(armTipX, sy);
    ctx.stroke();

    // Dock bracket (opens right, toward ship)
    ctx.beginPath();
    ctx.moveTo(armTipX, sy - 8);
    ctx.lineTo(armTipX, sy + 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(armTipX, sy - 8);
    ctx.lineTo(armTipX + 6, sy - 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(armTipX, sy + 8);
    ctx.lineTo(armTipX + 6, sy + 8);
    ctx.stroke();

    // Wormholes
    const t = this._stationTimer;
    if (this._stationPhase === 'docking') {
      this._drawPaneWormhole(ctx, px + STATION.entryX, py + STATION.entryY, Math.min(t / 0.3, 1), t);
    } else if (this._stationPhase === 'launching') {
      this._drawPaneWormhole(ctx, px + STATION.exitX, py + STATION.exitY, Math.min(t / 0.35, 1), t);
    }

    // Ship
    const { x: shipPX, y: shipPY, angle: shipAngle, scale: shipScale } = this._getStationShipState();
    if (shipScale > 0.01) {
      const cx = px + shipPX;
      const cy = py + shipPY;
      ctx.save();
      ctx.strokeStyle = CANVAS.stroke;
      ctx.lineWidth   = CANVAS.lineWidth;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
      ctx.translate(cx, cy);
      ctx.scale(shipScale, shipScale);
      ctx.translate(-cx, -cy);
      Ship.drawAt(ctx, cx, cy, shipAngle);
      ctx.restore();
    }

    ctx.restore(); // end pane clip

    // Story panel (storytext) OR title when idle
    if (this._stationPhase === 'storytext') {
      this._renderStoryPanel(ctx);
    } else {
      const titleX = (px + pw + CANVAS.width) / 2;
      const titleY = py + ph / 2;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.font         = 'bold 26px "Courier New", monospace';
      ctx.fillStyle    = STATION.borderColor;
      ctx.fillText('SPACE STATION', titleX, titleY - 22);
      ctx.font      = '16px "Courier New", monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText(`LEVEL ${this._level}`, titleX, titleY + 10);
      const subtitle = getLevel(this._level).title.replace(/^Level \d+:\s*/, '');
      ctx.font      = '13px "Courier New", monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillText(subtitle, titleX, titleY + 32);
    }

    // Menu (only when docked — shown after docking animation completes)
    if (this._stationPhase === 'docked') {
      if (this._stationScreen === 'upgrade') {
        this._renderUpgradeScreen(ctx);
      } else {
        const menuX      = px + 24;
        const menuStartY = py + ph + 30;
        const items      = STATION.menuItems;

        items.forEach((label, i) => {
          const isLaunch = label === 'LAUNCH';
          const extraGap = isLaunch ? 18 : 0;
          const itemY    = menuStartY + i * 44 + extraGap;
          const selected = i === this._stationMenuIndex;

          ctx.textAlign    = 'left';
          ctx.textBaseline = 'middle';
          ctx.font         = isLaunch
            ? 'bold 24px "Courier New", monospace'
            : '20px "Courier New", monospace';
          ctx.fillStyle    = selected ? CANVAS.stroke : 'rgba(255,255,255,0.28)';

          ctx.fillText(label, menuX, itemY);

          if (selected) {
            ctx.fillText('>', px + 8, itemY);
          }
        });

        // Separator line before LAUNCH — positioned midway between BUY and LAUNCH
        const sepY = menuStartY + 2 * 44 + 32;
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(px, sepY);
        ctx.lineTo(px + pw, sepY);
        ctx.stroke();

        // Hint text
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'bottom';
        ctx.font         = '13px "Courier New", monospace';
        ctx.fillStyle    = 'rgba(255,255,255,0.3)';
        ctx.fillText('↑ ↓  NAVIGATE     SPACE  SELECT', CANVAS.width / 2, CANVAS.height - 12);
      }
    }

    this._renderHUD(ctx);
    ctx.restore();
  }

  _updateDevTools() {
    if (this.input.consumeDevToggle()) this._devMode = !this._devMode;

    const devW = this.input.consumeDevWormhole();
    const devG = this.input.consumeDevCoin();
    const devT = this.input.consumeDevBucks();

    if (!this._devMode) return;

    if (devG) this._score += 1;
    if (devT) this._score += 1000;

    if (devW && this._state === 'playing') {
      this.asteroids    = [];
      this._state       = 'levelcomplete';
      this._exitWormhole = this._spawnExitWormhole();
      playMusic('victory');
    }
  }

  update(dt) {
    this._updateDevTools();

    if (this._state === 'splash')   { this._updateSplash();      return; }
    if (this._state === 'gameover') { this._updateGameOver(dt);  return; }
    if (this._state === 'station')  { this._updateStation(dt);   return; }
    if (this._state === 'entering') { this._updateEntering(dt);  return; }
    if (this._state === 'exiting')  { this._updateExiting(dt);   return; }

    // Drain fire buffer every frame; only spawn bullet when alive and recharged.
    this._fireTimer += dt;
    const fired    = this.input.consumeFire();
    const cooldown = this._getUpgradeValue('rechargeCooldown');
    if (!this.ship.dead && fired && this._fireTimer >= cooldown) {
      this.bullets.push(new Bullet(this.ship));
      playFire();
      this._fireTimer = 0;
    }

    if (this.ship.dead) {
      this._warpTimer += dt;
      if (this._warpPhase === 'out' && this._warpTimer >= WARP.outDuration) {
        this._warpPhase = 'in';
        this._warpTimer = 0;
        this.ship.pos   = this._randomRespawnPos();
        this.ship.vel   = { x: 0, y: 0 };
        this.ship.angle = -Math.PI / 2;
        playWarpIn();
      } else if (this._warpPhase === 'in' && this._warpTimer >= WARP.inDuration) {
        this._warpPhase   = 'none';
        this._warpTimer   = 0;
        this.ship.dead    = false;
        this._invulnTimer = INVULN.invulnDuration;
      }
    } else {
      this.ship.update(dt, this.input, this.bounds, this._getUpgradeValue('thrustAccel'));
      const nowThrusting = this.ship.thrusting;
      if (nowThrusting && !this._wasThrusting) startThrust();
      else if (!nowThrusting && this._wasThrusting) stopThrust();
      this._wasThrusting = nowThrusting;
    }

    if (this._invulnTimer > 0) {
      this._invulnTimer = Math.max(0, this._invulnTimer - dt);
    }

    for (const b of this.bullets) b.update(dt, this.bounds);
    for (const a of this.asteroids) a.update(dt, this.bounds);
    for (const c of this._cargos) c.update(dt, this.bounds);
    for (const m of this._mines) m.update(dt, this.bounds);

    for (const c of this._comets) {
      c.update(dt, this.bounds);
      this._spawnCometTrail(c, dt);
    }
    for (const p of this._cometTrail) {
      p.pos.x += p.vel.x * dt;
      p.pos.y += p.vel.y * dt;
      p.age   += dt;
    }
    this._cometTrail = this._cometTrail.filter(p => p.age < p.maxAge);

    // Expand shockwaves; mark done when they reach max radius.
    for (const sw of this._shockwaves) {
      sw.radius += sw.expandSpeed * dt;
      if (sw.radius >= sw.maxRadius) sw.dead = true;
    }

    // Tick pending enemy spawns (only while level is still active).
    if (this._state === 'playing') {
      const ready = [];
      for (const p of this._pendingEnemySpawns) {
        p.timer -= dt;
        if (p.timer <= 0) ready.push(p);
      }
      this._pendingEnemySpawns = this._pendingEnemySpawns.filter(p => p.timer > 0);
      const hadEnemies = this._enemies.length > 0;
      for (const p of ready) {
        let x, y;
        do {
          x = Math.random() * CANVAS.width;
          y = Math.random() * CANVAS.height;
        } while (Math.hypot(x - this.ship.pos.x, y - this.ship.pos.y) < ASTEROID.safeRadius);
        this._enemies.push(new Enemy(x, y, { speed: p.speed, shotInterval: p.shotInterval, hp: p.hp, size: p.size, minCoins: p.minCoins, maxCoins: p.maxCoins, minPlatinum: p.minPlatinum, maxPlatinum: p.maxPlatinum, minDilithium: p.minDilithium, maxDilithium: p.maxDilithium }));
      }
      if (!hadEnemies && this._enemies.length > 0) playMusic('enemy');
    }

    // Update enemies and collect any shots they fire.
    for (const e of this._enemies) {
      e.update(dt, this.bounds);
      const shot = e.tryFire();
      if (shot) { this._enemyBullets.push(shot); playEnemyFire(); }
    }

    for (const d of this._drones) d.update(dt, this.bounds, this.ship.pos);

    // Update enemy bullets.
    for (const b of this._enemyBullets) {
      b.age += dt;
      const dx = b.vel.x * dt;
      const dy = b.vel.y * dt;
      b.distanceTraveled += Math.hypot(dx, dy);
      b.pos.x += dx;
      b.pos.y += dy;
      wrap(b.pos, this.bounds.width, this.bounds.height);
      if (b.age >= b.maxAge || b.distanceTraveled >= b.maxDistance) b.dead = true;
    }
    this._enemyBullets = this._enemyBullets.filter(b => !b.dead);

    // Bullets vs asteroids: accumulate damage per asteroid so two bullets in one frame
    // don't double-split, but do stack damage.
    const asteroidHits = new Map(); // asteroid → { damage, impactPos }
    for (const b of this.bullets) {
      if (b.dead) continue;
      for (const a of this.asteroids) {
        if (a.dying) continue; // immune while death countdown is running
        if (circlesOverlap(b, a, this.bounds)) {
          b.dead = true;
          if (!asteroidHits.has(a)) {
            asteroidHits.set(a, { damage: 0, impactPos: { x: b.pos.x, y: b.pos.y } });
          }
          asteroidHits.get(a).damage += b.damage;
          break;
        }
      }
    }
    for (const [a, { damage, impactPos }] of asteroidHits) {
      a.hp -= damage;
      if (a.hp <= 0) {
        if (a.dyingDuration > 0) {
          a.dying = true;
          a.dyingTimer = a.dyingDuration;
        } else {
          this.splitAsteroid(a);
        }
      } else {
        a.hitFlash = ASTEROID.hitFlashDuration;
        this._spawnHitParticles(impactPos);
        playHit();
      }
    }

    // Dying asteroids whose countdown has elapsed now explode.
    for (const a of this.asteroids.filter(x => x.dying && x.dyingTimer <= 0)) {
      this.splitAsteroid(a);
    }

    // Tiny asteroids that reached their natural lifespan expire and drop a coin.
    const agedOut = this.asteroids.filter(a => a.maxAge !== null && a.age >= a.maxAge);
    for (const a of agedOut) {
      this.asteroids = this.asteroids.filter(x => x !== a);
      this._spawnResources(a.pos, a);
    }

    // Player bullets vs enemies.
    for (const b of this.bullets) {
      if (b.dead) continue;
      for (const e of this._enemies) {
        if (circlesOverlap(b, e, this.bounds)) {
          b.dead = true;
          e.hp -= b.damage;
          if (e.hp > 0) {
            e.hitFlash = ENEMY.hitFlashDuration;
            this._spawnHitParticles(b.pos);
            playHit();
          }
          break;
        }
      }
    }
    // Remove killed enemies and drop coins.
    const enemyCountBefore = this._enemies.length;
    this._enemies = this._enemies.filter(e => {
      if (e.hp <= 0) {
        this._spawnResources(e.pos, e);
        playBang('small');
        return false;
      }
      return true;
    });
    const enemiesGone = enemyCountBefore > 0 && this._enemies.length === 0;

    // Player bullets vs drones.
    for (const b of this.bullets) {
      if (b.dead) continue;
      for (const d of this._drones) {
        if (circlesOverlap(b, d, this.bounds)) {
          b.dead = true;
          d.hp -= b.damage;
          if (d.hp > 0) {
            d.hitFlash = DRONE.hitFlashDuration;
            this._spawnHitParticles(b.pos);
            playHit();
          }
          break;
        }
      }
    }
    // Remove killed drones, spawn destruction effect, and drop loot.
    const droneCountBefore = this._drones.length;
    this._drones = this._drones.filter(d => {
      if (d.hp <= 0) {
        this._spawnDroneParticles(d.pos);
        this._spawnResources(d.pos, d);
        playDroneDestroy();
        return false;
      }
      return true;
    });
    const dronesGone = droneCountBefore > 0 && this._drones.length === 0;

    if ((enemiesGone && this._drones.length === 0) ||
        (dronesGone  && this._enemies.length === 0)) playMusic('playing');

    // Coins: move, spin, wrap, age.
    for (const c of this._coins) {
      c.pos.x    += c.vel.x * dt;
      c.pos.y    += c.vel.y * dt;
      c.rotAngle += c.rotVel * dt;
      c.age      += dt;
      wrap(c.pos, this.bounds.width, this.bounds.height);
    }

    // Platinum: move, spin, wrap, age.
    for (const p of this._platinum) {
      p.pos.x    += p.vel.x * dt;
      p.pos.y    += p.vel.y * dt;
      p.rotAngle += p.rotVel * dt;
      p.age      += dt;
      wrap(p.pos, this.bounds.width, this.bounds.height);
    }

    // Dilithium: move, spin, wrap, age.
    for (const d of this._dilithium) {
      d.pos.x    += d.vel.x * dt;
      d.pos.y    += d.vel.y * dt;
      d.rotAngle += d.rotVel * dt;
      d.age      += dt;
      wrap(d.pos, this.bounds.width, this.bounds.height);
    }

    // Bullets vs coins and platinum (before bullet filter so dead bullets are skipped).
    // Dilithium is indestructible — bullets pass through it.
    const deadCoins = new Set();
    for (const b of this.bullets) {
      if (b.dead) continue;
      for (const c of this._coins) {
        if (!deadCoins.has(c) && circlesOverlap(b, c, this.bounds)) {
          b.dead = true;
          deadCoins.add(c);
          this._spawnCoinParticles(c.pos);
          playCoinDestroy();
          break;
        }
      }
    }

    const deadPlatinum = new Set();
    for (const b of this.bullets) {
      if (b.dead) continue;
      for (const p of this._platinum) {
        if (!deadPlatinum.has(p) && circlesOverlap(b, p, this.bounds)) {
          b.dead = true;
          deadPlatinum.add(p);
          this._spawnPlatinumParticles(p.pos);
          playCoinDestroy();
          break;
        }
      }
    }
    // Bullets vs cargo: destroys the crate and drops loot; bullet is spent.
    const deadCargos = new Set();
    for (const b of this.bullets) {
      if (b.dead) continue;
      for (const cargo of this._cargos) {
        if (!deadCargos.has(cargo) && circlesOverlap(b, cargo, this.bounds)) {
          b.dead = true;
          deadCargos.add(cargo);
          this._spawnSplinterParticles(cargo.pos);
          this._spawnResources(cargo.pos, cargo);
          playCargoDestroy();
          break;
        }
      }
    }
    this._cargos = this._cargos.filter(c => !deadCargos.has(c));

    // Bullets vs mines: trigger shockwave, spent bullet.
    const triggeredMines = new Set();
    for (const b of this.bullets) {
      if (b.dead) continue;
      for (const mine of this._mines) {
        if (!triggeredMines.has(mine) && circlesOverlap(b, mine, this.bounds)) {
          b.dead = true;
          triggeredMines.add(mine);
          break;
        }
      }
    }
    for (const mine of triggeredMines) this._triggerMine(mine);
    this._mines = this._mines.filter(m => !triggeredMines.has(m));

    // Bullets vs comets: destroy comet, no loot, trail persists.
    const deadComets = new Set();
    for (const b of this.bullets) {
      if (b.dead) continue;
      for (const c of this._comets) {
        if (!deadComets.has(c) && circlesOverlap(b, c, this.bounds)) {
          b.dead = true;
          deadComets.add(c);
          playBang('small');
          break;
        }
      }
    }
    this._comets = this._comets.filter(c => !deadComets.has(c));

    this.bullets = this.bullets.filter((b) => !b.dead);

    // Expire, collect, and remove bullet-hit coins.
    this._coins = this._coins.filter((c) => {
      if (deadCoins.has(c) || c.age >= COIN.maxAge) return false;
      if (!this.ship.dead && circlesOverlap(this.ship, c, this.bounds)) {
        this._score += 1;
        playCoinCollect();
        return false;
      }
      return true;
    });

    // Expire, collect, and remove bullet-hit platinum.
    this._platinum = this._platinum.filter((p) => {
      if (deadPlatinum.has(p) || p.age >= PLATINUM.maxAge) return false;
      if (!this.ship.dead && circlesOverlap(this.ship, p, this.bounds)) {
        this._score += PLATINUM.value;
        playCoinCollect();
        return false;
      }
      return true;
    });

    // Expire and collect dilithium (indestructible by bullets).
    this._dilithium = this._dilithium.filter((d) => {
      if (d.age >= DILITHIUM.maxAge) return false;
      if (!this.ship.dead && circlesOverlap(this.ship, d, this.bounds)) {
        this._score += DILITHIUM.value;
        playCoinCollect();
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

    // Platinum particles: move and expire.
    for (const p of this._platinumParticles) {
      p.pos.x += p.vel.x * dt;
      p.pos.y += p.vel.y * dt;
      p.age   += dt;
    }
    this._platinumParticles = this._platinumParticles.filter((p) => p.age < p.maxAge);

    // Splinter particles: move and expire.
    for (const p of this._splinterParticles) {
      p.pos.x += p.vel.x * dt;
      p.pos.y += p.vel.y * dt;
      p.age   += dt;
    }
    this._splinterParticles = this._splinterParticles.filter((p) => p.age < p.maxAge);

    // Hit spark particles: move and expire.
    for (const p of this._hitParticles) {
      p.pos.x += p.vel.x * dt;
      p.pos.y += p.vel.y * dt;
      p.age   += dt;
    }
    this._hitParticles = this._hitParticles.filter((p) => p.age < p.maxAge);

    // Ship vs asteroids: skip while dead or invulnerable.
    if (!this.ship.dead && this._invulnTimer <= 0) {
      for (const a of this.asteroids) {
        if (circlesOverlap(this.ship, a, this.bounds)) {
          this._killShip();
          break;
        }
      }
      // Enemy bullets vs ship.
      if (!this.ship.dead) {
        for (const b of this._enemyBullets) {
          if (circlesOverlap(b, this.ship, this.bounds)) {
            b.dead = true;
            this._killShip();
            break;
          }
        }
        this._enemyBullets = this._enemyBullets.filter(b => !b.dead);
      }
      // Ship vs enemies.
      if (!this.ship.dead) {
        for (const e of this._enemies) {
          if (circlesOverlap(this.ship, e, this.bounds)) {
            this._killShip();
            break;
          }
        }
      }
      // Ship vs drones: drone rams the ship.
      if (!this.ship.dead) {
        for (const d of this._drones) {
          if (circlesOverlap(this.ship, d, this.bounds)) {
            this._killShip();
            break;
          }
        }
      }
    }

    // Ship vs cargo: crate destroyed, no loot, ship unharmed.
    if (!this.ship.dead) {
      const hitCargos = new Set();
      for (const cargo of this._cargos) {
        if (circlesOverlap(this.ship, cargo, this.bounds)) {
          hitCargos.add(cargo);
          this._spawnSplinterParticles(cargo.pos);
          playCargoDestroy();
        }
      }
      if (hitCargos.size > 0) this._cargos = this._cargos.filter(c => !hitCargos.has(c));
    }

    // Ship vs mines (only when not dead / invuln): trigger shockwave, ship killed by the wave.
    if (!this.ship.dead && this._invulnTimer <= 0) {
      const hitMines = new Set();
      for (const mine of this._mines) {
        if (circlesOverlap(this.ship, mine, this.bounds)) hitMines.add(mine);
      }
      for (const mine of hitMines) this._triggerMine(mine);
      this._mines = this._mines.filter(m => !hitMines.has(m));
    }

    // Ship vs comets and comet trail: both lethal.
    if (!this.ship.dead && this._invulnTimer <= 0) {
      for (const c of this._comets) {
        if (circlesOverlap(this.ship, c, this.bounds)) {
          this._killShip();
          break;
        }
      }
    }
    if (!this.ship.dead && this._invulnTimer <= 0) {
      for (const p of this._cometTrail) {
        if (circlesOverlap(this.ship, p, this.bounds)) {
          this._killShip();
          break;
        }
      }
    }

    // Ship vs shockwaves: killed when the ring front sweeps over the ship.
    if (!this.ship.dead && this._invulnTimer <= 0) {
      for (const sw of this._shockwaves) {
        let dx = Math.abs(sw.pos.x - this.ship.pos.x);
        let dy = Math.abs(sw.pos.y - this.ship.pos.y);
        if (dx > this.bounds.width  / 2) dx = this.bounds.width  - dx;
        if (dy > this.bounds.height / 2) dy = this.bounds.height - dy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (Math.abs(dist - sw.radius) <= MINE.shockwaveKillBand + this.ship.radius) {
          this._killShip();
          break;
        }
      }
    }

    this._shockwaves = this._shockwaves.filter(sw => !sw.dead);

    // Level complete: all required asteroids, enemies, drones, mines, and comets cleared.
    if (this._state === 'playing' &&
        this.asteroids.filter(a => !a.optional).length === 0 &&
        this._enemies.length === 0 &&
        this._pendingEnemySpawns.length === 0 &&
        this._drones.length === 0 &&
        this._mines.length === 0 &&
        this._comets.length === 0) {
      this._state = 'levelcomplete';
      this._exitWormhole = this._spawnExitWormhole();
      playMusic('victory');
    }

    // Exit wormhole: player navigates to it to trigger the exit animation.
    if (this._state === 'levelcomplete' && this._exitWormhole) {
      this._exitWormhole.update(dt);
      if (!this.ship.dead && circlesOverlap(this.ship, this._exitWormhole, this.bounds)) {
        this.ship.vel = { x: 0, y: 0 };
        this._exitTimer = 0;
        this._state = 'exiting';
        playWarpOut();
        stopThrust();
        this._wasThrusting = false;
      }
    }
  }

  render() {
    const { ctx } = this;

    if (this._state === 'splash')   { this._renderSplash(ctx);   return; }
    if (this._state === 'gameover') { this._renderGameOver(ctx); return; }
    if (this._state === 'station')  { this._renderStation(ctx);  return; }
    if (this._state === 'entering') { this._renderEntering(ctx); return; }
    if (this._state === 'exiting')  { this._renderExiting(ctx);  return; }

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
      if (!hidden) {
        this.ship.draw(ctx);
        const cooldown = this._getUpgradeValue('rechargeCooldown');
        const progress = Math.min(this._fireTimer / cooldown, 1);
        if (progress < 1) {
          ctx.save();
          ctx.strokeStyle = WARP.color;
          ctx.lineWidth   = 1.5;
          ctx.globalAlpha = 0.6;
          ctx.beginPath();
          ctx.arc(
            this.ship.pos.x, this.ship.pos.y,
            SHIP.size + 8,
            -Math.PI / 2,
            -Math.PI / 2 + progress * Math.PI * 2
          );
          ctx.stroke();
          ctx.restore();
        }
      }
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

    // Comet trail particles drawn before entities so the head renders on top.
    for (const p of this._cometTrail) {
      ctx.globalAlpha = (1 - p.age / p.maxAge) ** 0.8;
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    for (const a of this.asteroids) a.draw(ctx, this.bounds);
    for (const c of this._cargos) c.draw(ctx, this.bounds);
    for (const e of this._enemies) e.draw(ctx, this.bounds);
    for (const d of this._drones) d.draw(ctx, this.bounds);
    for (const m of this._mines) m.draw(ctx, this.bounds);
    for (const c of this._comets) c.draw(ctx);

    ctx.fillStyle = CANVAS.stroke;
    for (const b of this.bullets) b.draw(ctx);

    // Enemy bullets drawn in red.
    ctx.fillStyle = ENEMY.color;
    for (const b of this._enemyBullets) {
      ctx.beginPath();
      ctx.arc(b.pos.x, b.pos.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
    }

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

    // Platinum: silver spinning coin.
    for (const p of this._platinum) {
      let alpha = 1;
      if (p.age >= PLATINUM.pulseFast) {
        alpha = 0.5 + 0.5 * Math.sin(p.age * PLATINUM.pulseFastFreq);
      } else if (p.age >= PLATINUM.pulseStart) {
        alpha = 0.5 + 0.5 * Math.sin(p.age * PLATINUM.pulseSlowFreq);
      }
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.pos.x, p.pos.y);
      ctx.scale(Math.abs(Math.cos(p.rotAngle)), 1);
      ctx.fillStyle = PLATINUM.color;
      ctx.beginPath();
      ctx.arc(0, 0, PLATINUM.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PLATINUM.shine;
      ctx.beginPath();
      ctx.arc(0, 0, PLATINUM.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (const p of this._platinumParticles) {
      ctx.globalAlpha = (1 - p.age / p.maxAge) ** 1.5;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Dilithium: cyan diamond crystal.
    for (const d of this._dilithium) {
      let alpha = 1;
      if (d.age >= DILITHIUM.pulseFast) {
        alpha = 0.5 + 0.5 * Math.sin(d.age * DILITHIUM.pulseFastFreq);
      } else if (d.age >= DILITHIUM.pulseStart) {
        alpha = 0.5 + 0.5 * Math.sin(d.age * DILITHIUM.pulseSlowFreq);
      }
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(d.pos.x, d.pos.y);
      ctx.rotate(d.rotAngle);
      const r = DILITHIUM.radius;
      ctx.fillStyle = DILITHIUM.color;
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(r * 0.6, 0);
      ctx.lineTo(0, r);
      ctx.lineTo(-r * 0.6, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = DILITHIUM.shine;
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.5);
      ctx.lineTo(r * 0.3, 0);
      ctx.lineTo(0, r * 0.5);
      ctx.lineTo(-r * 0.3, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    for (const p of this._hitParticles) {
      ctx.globalAlpha = (1 - p.age / p.maxAge) ** 1.5;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const p of this._splinterParticles) {
      ctx.globalAlpha = (1 - p.age / p.maxAge) ** 1.5;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Shockwaves: expanding ring with fading glow.
    for (const sw of this._shockwaves) {
      const t = sw.radius / sw.maxRadius;
      const alpha = 1 - t;
      drawAtWrappedPositions(sw.pos, sw.radius, this.bounds, (wx, wy) => {
        ctx.save();
        ctx.globalAlpha = alpha * 0.35;
        ctx.strokeStyle = MINE.shockwaveColor;
        ctx.lineWidth   = 10;
        ctx.beginPath();
        ctx.arc(wx, wy, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = alpha * 0.85;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth   = 2;
        ctx.beginPath();
        ctx.arc(wx, wy, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });
    }

    if (this._state === 'levelcomplete' && this._exitWormhole) {
      this._exitWormhole.draw(ctx, 1);
    }

    this._renderHUD(ctx);
  }
}
