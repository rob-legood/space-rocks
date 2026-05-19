// All tunables live here. Adjust freely — this is your "feel" dial.

export const CANVAS = {
  width: 800,
  height: 600,
  background: '#000',
  stroke: '#fff',
  lineWidth: 1.5,
};

export const WORMHOLE = {
  radius:          30,   // collision and visual radius in px
  enterDuration:   1.0,  // seconds for the entry animation
  exitDuration:    0.7,  // seconds for the exit shrink animation
  rotSpeed:        2.2,  // rad/s — ring rotation rate
  safeDistance:    100,  // min px from ship when exit wormhole spawns
  outerColor:      '#4af',
  innerColor:      '#a4f',
  particleRate:    10,   // particles spawned per second
  particleMinSpeed: 25,  // px/s outward
  particleMaxSpeed: 85,  // px/s outward
  particleMinAge:   0.4, // seconds
  particleMaxAge:   1.0, // seconds
};

export const WARP = {
  outDuration:    0.40,   // seconds for warp-out shrink
  inDuration:     0.35,   // seconds for warp-in expand
  ringMaxRadius:  60,     // px — ring expands to this radius
  color:          '#4cf', // bright cyan
  inMargin:       100,    // min px from each canvas edge for random arrival
};

export const FRAGMENT = {
  minSpeed: 60,   // px/s minimum fragment velocity
  maxSpeed: 150,  // px/s maximum fragment velocity
  rotSpeed: 3.5,  // max angular velocity rad/s
  maxAge:   1.8,  // seconds before fragment disappears
};

export const PARTICLE = {
  count:    55,
  minSpeed: 60,
  maxSpeed: 260,
  minAge:   0.4,  // shortest a particle can live
  maxAge:   1.1,  // longest a particle can live
  minRadius: 1,
  maxRadius: 3,
  colors: ['#f22', '#f50', '#f80', '#fb0', '#ff0'],
};

export const HUD = {
  lives:        3,    // starting lives
  iconScale:    0.7,  // ship icon size relative to SHIP.size
  iconSpacing:  28,   // px between icon centres
  iconPadding:  20,   // px from canvas right/top edges
  scorePadding: 16,   // px from canvas left/top edges
  scoreSymbol:  '§',  // space bucks currency glyph
};

export const COIN = {
  minCount:      1,
  maxCount:      3,
  radius:        6,     // px — also used as collision radius
  minSpeed:      30,    // px/s
  maxSpeed:      90,    // px/s
  rotSpeed:      4.5,   // rad/s spin rate
  maxAge:        15,    // seconds before disappearing
  pulseStart:    10,    // seconds — slow pulse begins
  pulseFast:     13,    // seconds — fast pulse begins
  pulseSlowFreq: 10,    // rad/s oscillation rate (slow)
  pulseFastFreq: 26,    // rad/s oscillation rate (fast)
  sparkCount:    8,
  sparkMinSpeed: 40,    // px/s
  sparkMaxSpeed: 120,   // px/s
  sparkMinAge:   0.25,  // seconds
  sparkMaxAge:   0.55,  // seconds
  color:         '#fbb500', // bright gold face
  shine:         '#7a4d00', // darker inner circle
};

export const PLATINUM = {
  radius:        6,
  minSpeed:      30,    maxSpeed:      90,
  rotSpeed:      4.5,
  maxAge:        15,
  pulseStart:    10,    pulseFast:     13,
  pulseSlowFreq: 10,    pulseFastFreq: 26,
  sparkCount:    8,
  sparkMinSpeed: 40,    sparkMaxSpeed: 120,
  sparkMinAge:   0.25,  sparkMaxAge:   0.55,
  color:  '#e8e8e8',   // silver face
  shine:  '#909090',   // darker inner
  value:  5,
};

export const DILITHIUM = {
  radius:        8,
  minSpeed:      20,    maxSpeed:      60,
  rotSpeed:      1.8,
  maxAge:        20,
  pulseStart:    12,    pulseFast:     17,
  pulseSlowFreq: 6,     pulseFastFreq: 16,
  color:  '#00ffee',   // cyan crystal face
  shine:  '#007060',   // darker teal inner
  value:  50,
};

export const CARGO = {
  radius:           4,    // collision + visual half-size of the crate square
  speedMin:         15,    // px/s drift
  speedMax:         40,
  rotationMin:      0.1,   // rad/s
  rotationMax:      0.4,
  hitFlashDuration: 0.12,  // seconds the flash tint lasts
  splinterCount:    14,
  splinterMinSpeed: 50,    // px/s
  splinterMaxSpeed: 140,
  splinterMinAge:   0.2,   // seconds
  splinterMaxAge:   0.6,
  color:  '#c8a060',       // warm wood tone
  splinterColors: ['#8b5a2b', '#c68642', '#d4a96a', '#6b3a1f', '#a07040'],
  minCoins:     2,
  maxCoins:     6,
  minPlatinum:  0,
  maxPlatinum:  0,
  minDilithium: 0,
  maxDilithium: 0,
};

export const COMET = {
  radius:       8,        // visual + collision radius px
  speedMin:     320,      // px/s
  speedMax:     420,      // px/s
  headColor:    '#8df',   // cyan-blue glow halo colour
  trailRate:    60,       // trail particles spawned per second
  trailRadius:  4,        // px — collision radius of each trail particle
  trailSpeed:   25,       // px/s — trail drifts backward at this speed
  trailSpread:  5,        // px — perpendicular spread from comet centre
  trailMinAge:  0.5,      // seconds a trail particle lives
  trailMaxAge:  1.4,      // seconds
  trailColors:  ['#cff', '#9cf', '#fff', '#ffc', '#ff8', '#f80'],
};

export const MINE = {
  radius:             5,    // visual + collision radius px
  speedMin:           3,     // px/s drift
  speedMax:           10,    // px/s drift
  spikeCount:         8,
  spikeLength:        2,     // px
  color:              '#f80',
  shockwaveMaxRadius: 160,   // px — default max expansion radius
  shockwaveSpeed:     220,   // px/s — default expansion rate
  shockwaveKillBand:  12,    // px — ring half-width for kill detection
  shockwaveColor:     '#f84',
};

export const STARS = {
  count:     80,
  minRadius: 0.5,   // px — smallest pinprick
  maxRadius: 1.5,   // px — largest star
  alpha:     0.35,  // opacity (0–1)
};

export const INVULN = {
  respawnDelay:   1.5,  // seconds ship stays dead before reappearing
  invulnDuration: 2.0,  // seconds of invulnerability granted on respawn
  blinkInterval:  0.1,  // seconds per blink toggle while invulnerable
};

export const ASTEROID = {
  sizes: {
    large:     { radius: 50, speedMin: 30,  speedMax: 60,  hp: 3, childType: 'medium', childCount: 2,  minCoins: 0, maxCoins: 0, minPlatinum: 0, maxPlatinum: 0, minDilithium: 0, maxDilithium: 0 },
    medium:    { radius: 25, speedMin: 50,  speedMax: 90,  hp: 2, childType: 'small',  childCount: 2,  minCoins: 0, maxCoins: 0, minPlatinum: 0, maxPlatinum: 0, minDilithium: 0, maxDilithium: 0 },
    small:     { radius: 12, speedMin: 70,  speedMax: 130, hp: 1, childType: null,     childCount: 0,  minCoins: 1, maxCoins: 3, minPlatinum: 0, maxPlatinum: 0, minDilithium: 0, maxDilithium: 0 },
    fragile:   { radius: 38, speedMin: 45,  speedMax: 85,  hp: 1, childType: 'small',  childCount: 10, minCoins: 0, maxCoins: 0, minPlatinum: 0, maxPlatinum: 0, minDilithium: 0, maxDilithium: 0, color: '#c8a0f0', bangSize: 'large' },
    dangerous: { radius: 14, speedMin: 70,  speedMax: 130, hp: 1, childType: 'tiny',   childCount: 12, minCoins: 0, maxCoins: 0, minPlatinum: 0, maxPlatinum: 0, minDilithium: 0, maxDilithium: 0, color: '#f33',    bangSize: 'large', optional: true, dyingDuration: 2.0 },
    tiny:      { radius: 5,  speedMin: 200, speedMax: 340, hp: 1, childType: null,     childCount: 0,  minCoins: 1, maxCoins: 1, minPlatinum: 0, maxPlatinum: 0, minDilithium: 0, maxDilithium: 0, maxAge: 5.0 },
  },
  minVertices:        8,
  maxVertices:        12,
  jaggedness:         0.35,  // ±35% radius jitter per vertex
  rotationMin:        0.3,   // rad/s
  rotationMax:        0.8,   // rad/s
  spawnCount:         4,     // initial large asteroids
  safeRadius:         150,   // min distance from ship start position
  hitFlashDuration:   0.12,  // seconds the red-hit tint lasts
  dyingPulseFreqStart: 4,    // rad/s — pulse rate at start of dying countdown
  dyingPulseFreqEnd:   22,   // rad/s — pulse rate just before explosion
};

export const HIT_SPARK = {
  count:    5,
  minSpeed: 40,   // px/s
  maxSpeed: 110,  // px/s
  minAge:   0.12, // seconds
  maxAge:   0.28, // seconds
  minRadius: 1,
  maxRadius: 2,
  color:    '#cce',  // pale blue-white
};

export const BULLET = {
  speed: 520,        // px/s added on top of ship velocity
  maxDistance: 600,  // px before expiry
  maxAge: 1.2,       // seconds before expiry
  radius: 2,         // drawn radius in px
};

export const SHIP = {
  size: 14,                // base radius in px
  rotationSpeed: 4.5,      // radians per second
  thrustAccel: 220,        // pixels per second^2
  friction: 0.55,          // velocity multiplier per second (lower = more drag)
  maxSpeed: 420,           // pixels per second
  flameColor: '#f60',      // thrust flame stroke colour
};

export const ENEMY = {
  radius:           12,     // collision and visual radius px
  color:            '#f44', // stroke colour
  hitFlashDuration: 0.12,   // seconds the red-hit tint lasts
  bullet: {
    speed:       280,  // px/s
    maxDistance: 520,  // px before expiry
    maxAge:      1.4,  // seconds before expiry
    radius:      2,
  },
};

export const BOMBER = {
  radius:           22,
  color:            '#f64',   // warm orange-red — distinct from all other enemies
  hitFlashDuration: 0.14,
  speed:            38,       // px/s slow drift
  hp:               8,
  shotInterval:     3.5,      // seconds between missile launches
  missile: {
    radius:        3,
    color:         '#ff8',    // bright yellow
    speed:         210,       // px/s max
    accel:         290,       // px/s²
    turnRate:      3.0,       // rad/s — quite agile once up to speed
    maxAge:        4.5,       // seconds until self-destruct
    sparkCount:    5,
    sparkMinSpeed: 50,        sparkMaxSpeed: 130,
    sparkMinAge:   0.15,      sparkMaxAge:   0.40,
    sparkColor:    '#ff8',
  },
  fragMinSpeed:  70,
  fragMaxSpeed: 190,
  fragRotSpeed:   3.2,
  fragMaxAge:     1.5,
  sparkCount:    20,
  sparkMinSpeed:  80,         sparkMaxSpeed: 260,
  sparkMinAge:    0.45,       sparkMaxAge:   1.2,
  sparkColors:   ['#f64', '#f80', '#f42', '#ffc', '#f00'],
};

export const STEALTH = {
  radius:           12,     // collision and visual radius px
  color:            '#a4f', // purple — distinct from red enemy and cyan drone
  cloakAlpha:       0.07,   // barely-visible shimmer while cloaked
  uncloak:          0.40,   // seconds to fade in before firing
  recloak:          0.60,   // seconds to fade out after firing
  shotInterval:     3.0,    // seconds between shots while cloaked
  rotSpeed:         0.9,    // rad/s — slowly rotates even while cloaked
  hitFlashDuration: 0.30,   // long enough to see the flash through the cloak
  hp:               1,
  bullet: {
    speed:       260,
    maxDistance: 480,
    maxAge:      1.3,
    radius:      2,
  },
  fragMinSpeed: 55,   // px/s minimum fragment velocity
  fragMaxSpeed: 145,  // px/s maximum fragment velocity
  fragRotSpeed: 4.2,  // rad/s max fragment spin
  fragMaxAge:   1.0,  // seconds before fragment disappears
  sparkCount:      8,
  sparkMinSpeed:  40,
  sparkMaxSpeed: 120,
  sparkMinAge:   0.20,
  sparkMaxAge:   0.50,
  sparkColor:    '#c88fff', // lighter purple for sparks
};

export const DRONE = {
  radius:           8,      // collision and visual radius px
  color:            '#4ef', // cyan stroke — visually distinct from red enemy
  hitFlashDuration: 0.10,   // seconds the white-hit tint lasts
  speed:            110,    // px/s max speed
  accel:            160,    // px/s² thrust in current heading direction
  turnRate:         1.6,    // rad/s max heading change — limits sharpness of curve
  hp:               1,
  sparkCount:       10,
  sparkMinSpeed:    55,
  sparkMaxSpeed:    150,
  sparkMinAge:      0.3,
  sparkMaxAge:      0.65,
  sparkMinRadius:   1.5,
  sparkMaxRadius:   3.5,
  sparkColor:       '#4ef',
};

export const STATION = {
  pane:      { x: 16, y: 48, w: 240, h: 160 }, // canvas coords for the animation pane
  stationX:  68,   // station hub center, pane-local
  stationY:  80,
  dockX:     130,  // ship center when docked, pane-local
  dockY:     80,
  entryX:    220,  // entry wormhole center, pane-local
  entryY:    80,
  exitX:     190,  // exit wormhole center, pane-local
  exitY:     80,
  hubRadius:    14,
  panelLen:     34,  // solar panel arm length in px
  panelW:       10,  // solar panel half-height
  wormholeR:    16,  // radius of mini wormhole in pane
  dockDuration:   2.0,  // seconds for docking animation
  launchDuration: 1.6,  // seconds for launch animation
  borderColor: '#4af',
  menuItems:   ['UPGRADE', 'SELL', 'BUY', 'LAUNCH'],
};
