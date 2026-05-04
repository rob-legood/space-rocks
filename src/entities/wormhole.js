import { WORMHOLE } from '../config.js';

export class Wormhole {
  constructor(x, y) {
    this.pos    = { x, y };
    this.radius = WORMHOLE.radius;
    this.age    = 0;
    this._particles  = [];
    this._spawnAccum = 0;
  }

  update(dt) {
    this.age += dt;

    // Accumulator-based spawning — rate is framerate-independent.
    this._spawnAccum += WORMHOLE.particleRate * dt;
    while (this._spawnAccum >= 1) {
      this._spawnParticle();
      this._spawnAccum -= 1;
    }

    for (const p of this._particles) {
      p.x   += p.vx * dt;
      p.y   += p.vy * dt;
      p.age += dt;
    }
    this._particles = this._particles.filter((p) => p.age < p.maxAge);
  }

  _spawnParticle() {
    const angle  = Math.random() * Math.PI * 2;
    const cos    = Math.cos(angle);
    const sin    = Math.sin(angle);
    const spawnR = this.radius * (0.15 + Math.random() * 0.25);
    const speed  = WORMHOLE.particleMinSpeed +
                   Math.random() * (WORMHOLE.particleMaxSpeed - WORMHOLE.particleMinSpeed);

    // 60% radial + 40% tangential → spiral outward.
    this._particles.push({
      x:      cos * spawnR,
      y:      sin * spawnR,
      vx:     (cos * 0.6 - sin * 0.4) * speed,
      vy:     (sin * 0.6 + cos * 0.4) * speed,
      age:    0,
      maxAge: WORMHOLE.particleMinAge +
              Math.random() * (WORMHOLE.particleMaxAge - WORMHOLE.particleMinAge),
      radius: 1 + Math.random() * 1.5,
      color:  Math.random() < 0.5 ? WORMHOLE.outerColor : WORMHOLE.innerColor,
    });
  }

  // openFactor: 0 = closed, 1 = fully open. Scales the visual radius.
  draw(ctx, openFactor = 1) {
    if (openFactor <= 0) return;
    const r   = this.radius * openFactor;
    const rot = this.age * WORMHOLE.rotSpeed;

    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.lineCap = 'round';

    // Particles — behind the rings so they stream out from beneath them.
    for (const p of this._particles) {
      ctx.globalAlpha = (1 - p.age / p.maxAge) ** 1.5 * openFactor;
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Three outer arc segments, rotating clockwise.
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const a = rot + (i / 3) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(0, 0, r, a, a + Math.PI * 0.55);
      ctx.strokeStyle = WORMHOLE.outerColor;
      ctx.stroke();
    }

    // Two inner arc segments, counter-rotating.
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 2; i++) {
      const a = -rot * 1.4 + i * Math.PI;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.58, a, a + Math.PI * 0.7);
      ctx.strokeStyle = WORMHOLE.innerColor;
      ctx.stroke();
    }

    // Dark centre — the actual hole. Drawn last so it sits on top.
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.38, 0, Math.PI * 2);
    ctx.fillStyle = '#000014';
    ctx.fill();

    ctx.restore();
  }
}
