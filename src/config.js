// All tunables live here. Adjust freely — this is your "feel" dial.

export const CANVAS = {
  width: 800,
  height: 600,
  background: '#000',
  stroke: '#fff',
  lineWidth: 1.5,
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
  lives:       3,    // starting lives
  iconScale:   0.7,  // ship icon size relative to SHIP.size
  iconSpacing: 28,   // px between icon centres
  iconPadding: 20,   // px from canvas right/top edges
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
    large:  { radius: 50, speedMin: 30,  speedMax: 60  },
    medium: { radius: 25, speedMin: 50,  speedMax: 90  },
    small:  { radius: 12, speedMin: 70,  speedMax: 130 },
  },
  minVertices: 8,
  maxVertices: 12,
  jaggedness:  0.35,  // ±35% radius jitter per vertex
  rotationMin: 0.3,   // rad/s
  rotationMax: 0.8,   // rad/s
  spawnCount:  4,     // initial large asteroids
  safeRadius:  150,   // min distance from ship start position
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
