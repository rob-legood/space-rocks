# CLAUDE.md — space-rocks

Asteroids clone. Vanilla JS + Vite + Canvas 2D. No runtime dependencies.

```
npm run dev    # Vite dev server, usually http://localhost:5173
npm run build  # production bundle to dist/
```

## Current state (v0.1 + post-launch additions)

Slices 1–4 are complete:

- **Ship** — rotate, thrust with momentum, toroidal wrap, orange thrust-flame flicker
- **Bullets** — fire on Space (edge-triggered, no key-repeat), fixed screen speed, expire by distance or age
- **Asteroids** — large/medium/small, irregular jittered shapes, drift + rotation, split on hit, dual-edge wrap rendering
- **Collision** — circle-based, toroidal distance, bullet-asteroid splitting, ship death + respawn + invulnerability blink

Post-launch additions:
- **Starfield** — 80 randomly-placed stars, generated once, drawn as a dimmed background layer
- **Splash screen** — title + START / ABOUT THE AUTHOR menu; ←→ to navigate, Space to select

Not yet implemented (Slice 5+): lives, score, game-over/restart, particles, sound, UFO, hyperspace, high scores.

## File map

```
src/
  main.js               entry — creates Game, calls start()
  game.js               game loop, state machine, collision passes, respawn logic
  input.js              keyboard state; consumeFire/Left/Right() for edge-triggered input
  config.js             all tunables — adjust feel here, not in entity files
  entities/
    ship.js             rotate/thrust/friction, dead + radius properties
    asteroid.js         buildShape() called once at construction (no shimmer)
    bullet.js           fixed screen-speed velocity, radius for collision
    starfield.js        static background stars, draw() only (no update)
  utils/
    vector.js           add, scale, fromAngle, magnitude — plain {x,y} objects
    canvas.js           drawPolygon, drawAtWrappedPositions, wrap
    collision.js        circlesOverlap(a, b, bounds) — toroidal distance
```

## Key design decisions

**Config-driven feel.** Every tunable (speeds, radii, counts, timers, colours) lives in `config.js`. Entity files import what they need; they don't hardcode numbers.

**Frame-rate independent updates.** `dt = Math.min((time - lastTime) / 1000, 1/30)`. The 1/30 cap prevents entities teleporting after a tab-restore pause. Ship friction uses `Math.pow(SHIP.friction, dt)` for correct exponential decay at any frame rate.

**Fixed-speed bullets.** Bullet velocity is `fromAngle(ship.angle, BULLET.speed)` — it does *not* inherit ship velocity. Adding ship velocity caused inconsistent on-screen range depending on heading vs drift direction; fixed speed feels more predictable.

**Edge-triggered input.** `Input` suppresses OS key-repeat with `if (e.repeat) return` in the keydown handler. `consumeFire()`, `consumeLeft()`, and `consumeRight()` each return-and-clear a one-shot flag. All consume calls happen unconditionally every frame so buffers are always drained (e.g. pressing Space while dead doesn't queue a shot for the respawn frame; pressing ←→ during gameplay doesn't queue menu jumps for a future state change).

**Dual-edge wrap rendering.** `drawAtWrappedPositions(pos, radius, bounds, drawFn)` in `canvas.js` takes the Cartesian product of up to two x-positions and two y-positions (normal + mirror), generating up to four draw calls so an entity smoothly slides through all four edges simultaneously. The threshold radius for asteroids is `this.radius * (1 + ASTEROID.jaggedness)` — the maximum possible jittered vertex extent — so ghost copies appear before any part of the shape clips.

**Toroidal collision.** `circlesOverlap` wraps each delta at the halfway point (`if (dx > width/2) dx = width - dx`) before squaring, matching the visual wrap exactly. Both bullet-asteroid and ship-asteroid passes use this. No sqrt — comparison is done in squared space.

**Bullet-asteroid collision pattern.** Bullets iterate over asteroids; on first overlap the bullet is marked dead and the asteroid is added to a `Set`, then `break` exits the inner loop. After both loops, `splitAsteroid` is called for each asteroid in the Set. The Set deduplication means an asteroid is only split once even if two bullets hit it in the same frame. The `break` means one bullet can only destroy one asteroid.

**Invuln blink phase.** Blink is computed from *elapsed* invuln time, not remaining: `Math.floor((INVULN.invulnDuration - invulnTimer) / INVULN.blinkInterval) % 2`. This guarantees index 0 (even → visible) at the moment of respawn, avoiding a floating-point quirk that made the ship start hidden when counting down. The first life also starts with full invuln (constructor sets `_invulnTimer = INVULN.invulnDuration`) so behaviour is consistent with every subsequent respawn.

**Splash screen state machine.** `Game._state` is either `'splash'` or `'playing'`. Both `update` and `render` branch on this at the top and return early, so the game loop runs continuously but the gameplay systems are completely inert until the player starts. Asteroids are spawned in the constructor and frozen in place until `_state` flips to `'playing'`. `_renderSplash` wraps its body in `ctx.save()` / `ctx.restore()` to prevent canvas context state (textAlign, textBaseline, font) from leaking into the game render and breaking future HUD text.

**Flame colour isolation.** `ship.draw` wraps the flame `drawPolygon` call in `ctx.save()` / `ctx.restore()` and sets `ctx.strokeStyle = SHIP.flameColor` inside. Without this, the coloured stroke would leak into the subsequent ship-body draw since `drawPolygon`'s internal save/restore only covers the transform, not the stroke style.

## Entity contract

Each entity exposes:
- `pos: {x, y}` — world position (mutated in place by `wrap`)
- `radius: number` — hitbox radius, also used as wrap threshold
- `update(dt, bounds)` — advance physics, call `wrap`
- `draw(ctx[, bounds])` — render; asteroids need bounds for `drawAtWrappedPositions`

`Ship` also has `dead: boolean`, `vel`, `angle`, `thrusting`.

`Starfield` is draw-only (no `pos`, `radius`, or `update`) — it is not an entity in the physics sense.

## drawPolygon convention

Shapes are defined in local space with the "front" at +x. `drawPolygon(ctx, points, {x, y, angle})` translates → rotates → strokes. The ship nose is at `{x: SHIP.size, y: 0}`; bullets spawn at `ship.pos + fromAngle(ship.angle) * SHIP.size`.
