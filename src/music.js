// Procedural music sequencer using the Web Audio API clock.
// Uses a look-ahead scheduler for drift-free, gap-free looping.
// All tones are synthesised — no audio files.

let _ctx = null;
let _bus = null;

function ac() {
  if (!_ctx) {
    _ctx = new AudioContext();
    _bus = _ctx.createGain();
    _bus.gain.value = 1;
    _bus.connect(_ctx.destination);
  }
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

function scheduleNote(freq, t0, dur, vol, type) {
  const c = ac();
  const osc = c.createOscillator();
  const env = c.createGain();
  osc.connect(env);
  env.connect(_bus);
  osc.type = type;
  osc.frequency.value = freq;
  env.gain.setValueAtTime(vol, t0);
  env.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.start(t0);
  osc.stop(t0 + dur + 0.01);
}

// ── Note frequencies ──────────────────────────────────────────────────────────

const A1 = 55.0, Bb1 = 58.3;
const D2 = 73.4, E2 = 82.4, A2 = 110.0;
const C3 = 130.8, D3 = 146.8, E3 = 164.8, G3 = 196.0, A3 = 220.0, Bb3 = 233.1;
const Cs4 = 277.2, E4 = 329.6, A4 = 440.0;

// ── Track definitions ─────────────────────────────────────────────────────────
//
// Each step is an array of note tuples: [freq, dur, vol, type].
// An empty array [] is a rest. Steps loop continuously while the track plays.

const TRACKS = {

  // Asteroids-inspired: alternating A1/E2 bass pulse + sparse triangle melody.
  // 16 steps × 0.25 s = 4 s loop (120 BPM, eighth notes).
  playing: {
    stepTime: 0.25,
    steps: [
      [[A1, 0.20, 0.22, 'square'], [A2, 0.07, 0.09, 'square']],  // beat 1 — root
      [],
      [[E3, 0.18, 0.05, 'triangle']],                             // off-beat melody
      [],
      [[E2, 0.20, 0.22, 'square']],                               // beat 2 — fifth
      [],
      [[C3, 0.18, 0.05, 'triangle']],
      [],
      [[A1, 0.20, 0.22, 'square'], [A2, 0.07, 0.09, 'square']],  // beat 3 — root repeat
      [],
      [[D3, 0.18, 0.05, 'triangle']],
      [],
      [[E2, 0.20, 0.22, 'square']],                               // beat 4 — fifth
      [],
      [[E3, 0.18, 0.05, 'triangle']],
      [],
    ],
  },

  // Combat alert: faster tempo, syncopated bass, tritone (Bb) dissonance.
  // 8 steps × 0.2 s = 1.6 s loop (150 BPM, eighth notes).
  enemy: {
    stepTime: 0.2,
    steps: [
      [[A1, 0.17, 0.28, 'square'], [E4, 0.07, 0.06, 'square']],  // hard downbeat
      [[A1, 0.10, 0.20, 'square']],                               // syncopated echo
      [[Bb1, 0.17, 0.26, 'square']],                              // tritone — menace
      [],
      [[A1, 0.17, 0.28, 'square'], [Bb3, 0.07, 0.06, 'square']], // downbeat + high stab
      [[E2, 0.10, 0.20, 'square']],
      [[A1, 0.17, 0.24, 'square']],
      [[D2, 0.14, 0.20, 'square']],                               // descending tail
    ],
  },

  // Victory fanfare: A-major rising triad arpeggio, driving bass, triumphant peak.
  // 16 steps × 0.21 s ≈ 3.36 s loop (143 BPM, eighth notes).
  victory: {
    stepTime: 0.21,
    steps: [
      [[A2, 0.18, 0.30, 'square'], [A3, 0.16, 0.12, 'triangle']],  // downbeat — root
      [],
      [[Cs4, 0.16, 0.10, 'triangle']],                              // major third — brightness
      [],
      [[E2, 0.18, 0.28, 'square'], [E4, 0.16, 0.10, 'triangle']],  // fifth — lift
      [],
      [[Cs4, 0.16, 0.10, 'triangle']],
      [],
      [[A2, 0.18, 0.30, 'square'], [A4, 0.16, 0.13, 'triangle']],  // octave peak — triumph
      [[A2, 0.10, 0.18, 'square']],                                 // syncopated echo
      [[E4,  0.16, 0.10, 'triangle']],                              // descend
      [],
      [[A2, 0.18, 0.28, 'square'], [Cs4, 0.14, 0.09, 'triangle']], // resolve
      [[A3, 0.12, 0.09, 'triangle']],                               // quick tail
      [[E3, 0.12, 0.08, 'triangle']],
      [],
    ],
  },

  // Starbase calm: slow Am arpeggio in sine waves, ascending then descending.
  // 8 steps × 0.75 s = 6 s loop (80 BPM, quarter notes).
  station: {
    stepTime: 0.75,
    steps: [
      [[A2, 0.70, 0.09, 'sine'], [A1, 0.72, 0.05, 'sine']],  // root
      [[C3, 0.70, 0.08, 'sine']],
      [[E3, 0.70, 0.08, 'sine'], [A1, 0.72, 0.04, 'sine']],
      [[G3, 0.70, 0.07, 'sine']],
      [[A3, 0.70, 0.07, 'sine'], [A1, 0.72, 0.05, 'sine']],  // octave peak
      [[G3, 0.70, 0.07, 'sine']],
      [[E3, 0.70, 0.08, 'sine'], [A1, 0.72, 0.04, 'sine']],
      [[C3, 0.70, 0.08, 'sine']],                             // descend back to root
    ],
  },
};

// ── Look-ahead scheduler ──────────────────────────────────────────────────────

const LOOKAHEAD_S = 0.12; // seconds of notes to pre-schedule each tick
const TICK_MS     = 30;   // how often the scheduler wakes up (ms)

let _currentTrack = null;
let _stepIndex    = 0;
let _nextStepAt   = 0;
let _timer        = null;

function _tick() {
  const c = ac();
  const track = TRACKS[_currentTrack];
  if (!track) return;

  while (_nextStepAt < c.currentTime + LOOKAHEAD_S) {
    const step = track.steps[_stepIndex % track.steps.length];
    for (const [freq, dur, vol, type = 'square'] of step) {
      scheduleNote(freq, _nextStepAt, dur, vol, type);
    }
    _nextStepAt += track.stepTime;
    _stepIndex++;
  }

  _timer = setTimeout(_tick, TICK_MS);
}

function _stopScheduler() {
  if (_timer !== null) {
    clearTimeout(_timer);
    _timer = null;
  }
  _currentTrack = null;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function playMusic(name) {
  if (_currentTrack === name) return;
  _stopScheduler();
  _currentTrack = name;
  _stepIndex    = 0;
  _nextStepAt   = ac().currentTime + 0.05;
  _tick();
}

export function stopMusic() {
  _stopScheduler();
}
