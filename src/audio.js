// Synthesised sound effects via the Web Audio API.
// AudioContext is created lazily on first use (satisfies browser autoplay policy).
// All sounds are procedural — no audio files required.

let _ctx = null;
let _noiseBuffer = null;

function ac() {
  if (!_ctx) _ctx = new AudioContext();
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

// 3-second white-noise buffer, generated once and shared by all noise sources.
function noise() {
  const c = ac();
  if (_noiseBuffer) return _noiseBuffer;
  const len = c.sampleRate * 3;
  _noiseBuffer = c.createBuffer(1, len, c.sampleRate);
  const d = _noiseBuffer.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return _noiseBuffer;
}

// Oscillator with an exponential frequency sweep and gain decay.
function sweep(type, freqA, freqB, dur, vol) {
  const c = ac();
  const o = c.createOscillator();
  const g = c.createGain();
  o.connect(g);
  g.connect(c.destination);
  const t = c.currentTime;
  o.type = type;
  o.frequency.setValueAtTime(freqA, t);
  o.frequency.exponentialRampToValueAtTime(freqB, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.start(t);
  o.stop(t + dur);
}

// Band-passed noise burst with gain decay.
function noiseBurst(freq, q, dur, vol) {
  const c = ac();
  const src = c.createBufferSource();
  src.buffer = noise();
  const filt = c.createBiquadFilter();
  filt.type = 'bandpass';
  filt.frequency.value = freq;
  filt.Q.value = q;
  const gain = c.createGain();
  const t = c.currentTime;
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(filt);
  filt.connect(gain);
  gain.connect(c.destination);
  src.start(t);
  src.stop(t + dur);
}

// ── Gameplay sounds ───────────────────────────────────────────────────────────

export function playFire() {
  // Sharp attack transient — brief triangle zap at the front.
  sweep('triangle', 2800, 1000, 0.03, 0.18);
  // Laser body — clean sine sweep staying in the bright mid range.
  sweep('sine', 1400, 200, 0.10, 0.25);
}

const BANG_CFG = {
  large:  { freq: 70,  q: 0.7, dur: 0.9,  vol: 1.2 },
  medium: { freq: 180, q: 0.8, dur: 0.55, vol: 1.0 },
  small:  { freq: 550, q: 1.0, dur: 0.25, vol: 0.7 },
};

export function playBang(size) {
  const { freq, q, dur, vol } = BANG_CFG[size];
  noiseBurst(freq, q, dur, vol);
}

export function playExplosion() {
  // Wide noise burst + descending rumble for final ship death.
  noiseBurst(200, 0.3, 1.5, 2.0);
  sweep('sawtooth', 80, 20, 1.2, 0.5);
}

export function playWarpOut() {
  // Descending sweep + narrow noise for warp/wormhole exit.
  sweep('sine', 600, 60, 0.5, 0.45);
  noiseBurst(300, 2.0, 0.4, 0.3);
}

export function playWarpIn() {
  // Ascending sweep + narrow noise for warp/wormhole entry.
  sweep('sine', 60, 600, 0.5, 0.45);
  noiseBurst(300, 2.0, 0.4, 0.3);
}

export function playCoinCollect() {
  // Three-note ascending chime: 660 → 880 → 1100 Hz.
  const c = ac();
  [660, 880, 1100].forEach((freq, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.type = 'sine';
    o.frequency.value = freq;
    const onset = c.currentTime + i * 0.04;
    g.gain.setValueAtTime(0, onset);
    g.gain.linearRampToValueAtTime(0.18, onset + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, onset + 0.1);
    o.start(onset);
    o.stop(onset + 0.1);
  });
}

export function playHit() {
  // Short metallic clank — bandpass noise tick + brief pitch drop.
  noiseBurst(950, 4.5, 0.09, 0.38);
  sweep('triangle', 550, 260, 0.07, 0.1);
}

export function playCoinDestroy() {
  sweep('square', 400, 200, 0.06, 0.15);
}

export function playEnemyFire() {
  // Low growling pulse — descending sawtooth snarl + sub-bass thud.
  sweep('sawtooth', 180, 55, 0.18, 0.35);
  noiseBurst(90, 1.2, 0.14, 0.28);
}

export function playCargoDestroy() {
  // Woody thunk: mid-frequency noise burst + short descending thud.
  noiseBurst(220, 3.5, 0.28, 0.85);
  sweep('triangle', 280, 90, 0.22, 0.45);
}

export function playMissileLaunch() {
  // Rising woosh — missile leaving the tube.
  sweep('sine', 300, 1100, 0.14, 0.28);
  noiseBurst(700, 4.5, 0.08, 0.14);
}

export function playMissileExplode() {
  // Sharp crack — missile detonating or self-destructing.
  sweep('triangle', 900, 180, 0.22, 0.22);
  noiseBurst(450, 2.2, 0.18, 0.18);
}

export function playBomberDestroy() {
  // Deep booming explosion — much larger than an asteroid.
  noiseBurst(75, 0.5, 1.4, 2.0);
  sweep('sawtooth', 140, 22, 1.1, 0.7);
  sweep('square',   220, 55, 0.55, 0.35);
}

export function playStealthDestroy() {
  // Cloaking device failing: electric static burst + descending power-down sweep.
  noiseBurst(620, 1.4, 0.42, 0.80);
  sweep('sawtooth', 460, 70, 0.38, 0.38);
}

export function playStealthFire() {
  // Silenced energy pulse — quiet high-pitch sine with a brief hiss.
  sweep('sine', 860, 180, 0.16, 0.20);
  noiseBurst(480, 3.5, 0.10, 0.14);
}

export function playShieldHit() {
  // Resonant energy deflection — glassy high-pitched ping with a brief shimmer.
  sweep('sine', 1900, 700, 0.22, 0.28);
  sweep('sine', 2800, 1400, 0.10, 0.12);
}

export function playDroneDestroy() {
  // Electronic pop: sharp high-freq zap + narrow noise crackle.
  sweep('square', 1400, 280, 0.18, 0.35);
  noiseBurst(900, 3.0, 0.14, 0.28);
}

export function playCivilianWarp() {
  // Higher-pitched distress warp — shorter and softer than the player warp.
  sweep('sine', 1100, 160, 0.32, 0.22);
  noiseBurst(600, 2.8, 0.22, 0.14);
}

export function playCivilianDestroy() {
  // Small explosion + descending distress tone.
  noiseBurst(420, 1.3, 0.40, 0.55);
  sweep('triangle', 280, 70, 0.32, 0.28);
}

export function playCivilianAttach() {
  // Two ascending tones — positive lock-on / docking chime.
  const c = ac();
  [660, 1100].forEach((freq, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.type = 'sine';
    o.frequency.value = freq;
    const onset = c.currentTime + i * 0.08;
    g.gain.setValueAtTime(0, onset);
    g.gain.linearRampToValueAtTime(0.22, onset + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, onset + 0.14);
    o.start(onset);
    o.stop(onset + 0.14);
  });
}

// ── Menu sounds ───────────────────────────────────────────────────────────────

export function playMenuNav() {
  sweep('square', 440, 330, 0.07, 0.12);
}

export function playMenuSelect() {
  // Two-tone confirmation: 440 Hz then 660 Hz.
  const c = ac();
  [440, 660].forEach((freq, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.type = 'square';
    o.frequency.value = freq;
    const onset = c.currentTime + i * 0.07;
    g.gain.setValueAtTime(0.18, onset);
    g.gain.exponentialRampToValueAtTime(0.001, onset + 0.07);
    o.start(onset);
    o.stop(onset + 0.07);
  });
}

// ── Thrust (looping) ──────────────────────────────────────────────────────────

let _thrust = null;

export function startThrust() {
  if (_thrust) return;
  const c = ac();
  const src = c.createBufferSource();
  src.buffer = noise();
  src.loop = true;
  const filt = c.createBiquadFilter();
  filt.type = 'bandpass';
  filt.frequency.value = 100;
  filt.Q.value = 2.0;
  const gain = c.createGain();
  const t = c.currentTime;
  gain.gain.setValueAtTime(0.001, t);
  gain.gain.linearRampToValueAtTime(0.18, t + 0.05);
  src.connect(filt);
  filt.connect(gain);
  gain.connect(c.destination);
  src.start(t);
  _thrust = { src, gain };
}

export function stopThrust() {
  if (!_thrust) return;
  const { src, gain } = _thrust;
  const t = ac().currentTime;
  gain.gain.setValueAtTime(gain.gain.value, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  src.stop(t + 0.08);
  _thrust = null;
}
