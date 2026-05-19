import { BLACKHOLE } from '../config.js';

export class Blackhole {
  constructor(x, y) {
    this.pos    = { x, y };
    this.radius = BLACKHOLE.radius;
    this.age    = 0;
    this._disk  = [];
    for (let i = 0; i < BLACKHOLE.diskParticles; i++) {
      this._disk.push(this._spawnDiskParticle());
    }
  }

  _spawnDiskParticle() {
    const dist  = BLACKHOLE.diskRadiusMin +
                  Math.random() * (BLACKHOLE.diskRadiusMax - BLACKHOLE.diskRadiusMin);
    const speed = BLACKHOLE.orbitSpeedBase / dist;
    return {
      angle:  Math.random() * Math.PI * 2,
      dist,
      speed:  speed * (0.7 + Math.random() * 0.6),
      inward: BLACKHOLE.particleInwardMin +
              Math.random() * (BLACKHOLE.particleInwardMax - BLACKHOLE.particleInwardMin),
      size:   0.6 + Math.random() * 2.4,
      color:  BLACKHOLE.particleColors[Math.floor(Math.random() * BLACKHOLE.particleColors.length)],
    };
  }

  update(dt) {
    this.age += dt;
    for (const p of this._disk) {
      p.angle += p.speed * dt;
      p.dist  -= p.inward * dt;
      if (p.dist < BLACKHOLE.radius) {
        p.dist  = BLACKHOLE.diskRadiusMax - Math.random() * 8;
        p.angle = Math.random() * Math.PI * 2;
        p.color = BLACKHOLE.particleColors[Math.floor(Math.random() * BLACKHOLE.particleColors.length)];
      }
    }
  }

  draw(ctx) {
    const { x, y } = this.pos;

    // Ambient glow halo
    const grd = ctx.createRadialGradient(x, y, BLACKHOLE.radius, x, y, BLACKHOLE.glowRadius);
    grd.addColorStop(0,   BLACKHOLE.coreGlowColor);
    grd.addColorStop(0.5, BLACKHOLE.outerGlowColor);
    grd.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(x, y, BLACKHOLE.glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Accretion disk — particles fade in from outer edge, fade to zero at event horizon
    ctx.save();
    for (const p of this._disk) {
      const px = x + Math.cos(p.angle) * p.dist;
      const py = y + Math.sin(p.angle) * p.dist;
      const t  = (p.dist - BLACKHOLE.radius) / (BLACKHOLE.diskRadiusMax - BLACKHOLE.radius);
      ctx.globalAlpha = Math.max(0, Math.min(1, t)) * 0.9;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // Pulsing event-horizon rings
    ctx.save();
    ctx.strokeStyle = BLACKHOLE.ringColor;
    ctx.lineWidth   = 1.5;
    ctx.globalAlpha = 0.4 + 0.3 * Math.sin(this.age * BLACKHOLE.ringPulseFreq);
    ctx.beginPath();
    ctx.arc(x, y, BLACKHOLE.radius + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.2 + 0.2 * Math.sin(this.age * BLACKHOLE.ringPulseFreq + 1.5);
    ctx.beginPath();
    ctx.arc(x, y, BLACKHOLE.radius + 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();

    // Black core drawn last — covers anything that crossed the horizon
    const core = ctx.createRadialGradient(x, y, 0, x, y, BLACKHOLE.radius);
    core.addColorStop(0,   '#000000');
    core.addColorStop(0.8, '#000000');
    core.addColorStop(1,   'rgba(50,0,90,0.9)');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(x, y, BLACKHOLE.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
