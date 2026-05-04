// All tunables live here. Adjust freely — this is your "feel" dial.

export const CANVAS = {
  width: 800,
  height: 600,
  background: '#000',
  stroke: '#fff',
  lineWidth: 1.5,
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
