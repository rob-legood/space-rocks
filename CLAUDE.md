# CLAUDE.md — space-rocks

Asteroids clone. Vanilla JS + Vite + Canvas 2D. No runtime dependencies.

```
npm run dev    # Vite dev server, usually http://localhost:5173
npm run build  # production bundle to dist/
```

## Current state (v0.5)

- **Ship** — rotate, thrust with momentum, toroidal wrap, orange thrust-flame flicker
- **Bullets** — fire on Space (edge-triggered, no key-repeat), fixed screen speed, expire by distance or age
- **Asteroids** — large/medium/small, irregular jittered shapes, drift + rotation, split on hit, dual-edge wrap rendering
- **Collision** — circle-based, toroidal distance, bullet-asteroid splitting, ship death + respawn + invulnerability blink
- **Starfield** — 80 randomly-placed stars, generated once, drawn as a dimmed background layer
- **Splash screen** — title + START / ABOUT THE AUTHOR menu; ←→ to navigate, Space to select
- **Lives + HUD** — 3 lives shown as ship icons in top-right; icon drops when warp-out completes (not on impact)
- **Warp respawn** — on non-final death: ship contracts to a point (cyan rings), teleports to a random position, expands back in; full invuln on arrival
- **Final death** — ship breaks into 4 flying line-segment fragments; red/orange/yellow particles burst outward and fade; asteroids keep drifting; GAME OVER floats above the live scene
- **Game-over screen** — dim overlay + text over the live scene; Space returns to splash
- **Score + coins** — destroying a small asteroid drops 1–3 spinning gold coins; ship collision collects them (+1 each); score displayed top-left as `§ N` in gold; coins live 15s, alpha-pulse slowly from 10s, rapidly from 13s, then vanish; bullets destroy coins and produce a small gold spark burst
- **Space Station** — shown on game start and between every level; upper-left pane animates ship docking (wormhole + glide); menu shows UPGRADE / SELL / BUY and LAUNCH; UPGRADE opens the upgrade sub-screen; SELL / BUY are placeholders; LAUNCH plays undock + wormhole animation then enters the next level; HUD visible throughout; all station tunables in `STATION` config
- **Upgrade system** — UPGRADE sub-screen lets players spend space bucks on persistent ship improvements; definitions live in `src/upgrades.json` (id, name, unit, tier values, tier costs); see `UPGRADE.md` for full documentation

## FUTURE.md

The file FUTURE.MD contains future ideas for the game.  As features are implemented, remove it from that file

## File map

```
src/
  main.js               entry — creates Game, calls start()
  game.js               game loop, state machine, collision passes, respawn/warp logic
  input.js              keyboard state; consumeFire/Left/Right() for edge-triggered input
  config.js             all tunables — adjust feel here, not in entity files
  upgrades.json         upgrade definitions (id, name, unit, levels[], costs[])
  entities/
    ship.js             rotate/thrust/friction; Ship.explode() builds fragment objects; Ship.drawIcon() for HUD; Ship.drawAt() for station pane
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

**Edge-triggered input.** `Input` suppresses OS key-repeat with `if (e.repeat) return` in the keydown handler. `consumeFire()`, `consumeLeft()`, and `consumeRight()` each return-and-clear a one-shot flag. All consume calls happen unconditionally every frame so buffers are always drained (e.g. pressing Space while dead doesn't queue a shot for the respawn frame; pressing ←→ during gameplay or the game-over screen doesn't queue menu jumps when the player returns to splash). `consumeLeft/Right` are drained in `_updateGameOver` for this reason even though the game-over screen doesn't use them.

**Dual-edge wrap rendering.** `drawAtWrappedPositions(pos, radius, bounds, drawFn)` in `canvas.js` takes the Cartesian product of up to two x-positions and two y-positions (normal + mirror), generating up to four draw calls so an entity smoothly slides through all four edges simultaneously. The threshold radius for asteroids is `this.radius * (1 + ASTEROID.jaggedness)` — the maximum possible jittered vertex extent — so ghost copies appear before any part of the shape clips.

**Toroidal collision.** `circlesOverlap` wraps each delta at the halfway point (`if (dx > width/2) dx = width - dx`) before squaring, matching the visual wrap exactly. Both bullet-asteroid and ship-asteroid passes use this. No sqrt — comparison is done in squared space.

**Bullet-asteroid collision pattern.** Bullets iterate over asteroids; on first overlap the bullet is marked dead and the asteroid is added to a `Set`, then `break` exits the inner loop. After both loops, `splitAsteroid` is called for each asteroid in the Set. The Set deduplication means an asteroid is only split once even if two bullets hit it in the same frame. The `break` means one bullet can only destroy one asteroid.

**Invuln blink phase.** Blink is computed from *elapsed* invuln time, not remaining: `Math.floor((INVULN.invulnDuration - invulnTimer) / INVULN.blinkInterval) % 2`. This guarantees index 0 (even → visible) at the moment of respawn, avoiding a floating-point quirk that made the ship start hidden when counting down. The first life also starts with full invuln (constructor sets `_invulnTimer = INVULN.invulnDuration`) so behaviour is consistent with every subsequent respawn.

**State machine.** `Game._state` is `'splash'` | `'playing'` | `'gameover'`. Both `update` and `render` branch on this at the top and return early. Asteroids are spawned in the constructor and frozen in place until `_state` flips to `'playing'`. `_renderSplash` and `_renderGameOver` both wrap their bodies in `ctx.save()` / `ctx.restore()` to prevent canvas context state (textAlign, textBaseline, font) from leaking into the game render.

**Warp respawn.** On non-final death, `_killShip` sets `ship.dead = true`, `_warpPhase = 'out'`. Update increments `_warpTimer`; at `WARP.outDuration` it repositions the ship to a random location and switches to `_warpPhase = 'in'`; at `WARP.inDuration` it clears `dead` and starts full invuln. Render draws the ship hull scaled around its centre (1→0 warp-out, 0→1 warp-in) plus two expanding cyan rings that fade out — same pattern at both locations for consistency. The HUD life count uses `_lives + (warpPhase === 'out' ? 1 : 0)` so the icon drops when the ship visually disappears, not at the moment of impact.

**Fragment system.** `Ship.explode(ship, config)` is a static method that transforms the four edges of `SHIP_SHAPE` into world-space fragment objects (local-space endpoints + pos + vel + rotVel + age). It lives in `ship.js` so the shape definition stays in one place; `game.js` passes the `FRAGMENT` config as a parameter. Fragments are plain objects, not entity instances — game.js integrates them directly. They wrap toroidally and persist until the game-over screen is dismissed.

**Particle system.** 55 particles spawned at the ship's centre on final death, each with a random direction, speed (60–260 px/s), lifespan (0.4–1.1s), radius (1–3px), and colour picked from a red→yellow palette. Alpha fades as `(1 - age/maxAge)^1.5` so particles stay bright longer and snap off at the end. Particles do not wrap — they're too short-lived to reach an edge.

**Coin system.** Destroying a small asteroid spawns 1–3 coins at its position. Coins are plain objects (pos, vel, rotAngle, rotVel, age, radius) managed directly by `game.js` — not entity instances. They drift, wrap toroidally, and spin using `ctx.scale(Math.abs(Math.cos(rotAngle)), 1)` to simulate a 3D coin flip. Ship collision collects a coin (+1 score); bullet collision destroys it and calls `_spawnCoinParticles`. Coins live 15 seconds: alpha pulses slowly from 10s (`0.5 + 0.5 * sin(age * slowFreq)`) and rapidly from 13s, communicating urgency. `globalAlpha` is set inside `ctx.save()/ctx.restore()` so it doesn't leak. Coin spark particles use the same `(1 - t)^1.5` fade curve as ship particles. The bullet-coin collision pass runs before the bullet filter so a bullet already spent on an asteroid cannot also hit a coin in the same frame.

**Score.** `_score` increments by 1 per coin collected. Displayed top-left as `§ N` (§ is the space-bucks symbol) in gold (`COIN.color`) using the same Courier New font as the rest of the HUD. All score/coin state is reset in `_resetGame`.

**Game-over live scene.** When final death occurs, `_state` transitions to `'gameover'` immediately. `_updateGameOver` keeps asteroids drifting and particles/fragments animating. `_renderGameOver` draws the full live scene (bg → stars → asteroids → fragments → particles), then a `rgba(0,0,0,0.45)` overlay so the text reads cleanly on top. `_renderHUD` is not called from game-over (no point showing 0 lives).

**Flame colour isolation.** `ship.draw` wraps the flame `drawPolygon` call in `ctx.save()` / `ctx.restore()` and sets `ctx.strokeStyle = SHIP.flameColor` inside. Without this, the coloured stroke would leak into the subsequent ship-body draw since `drawPolygon`'s internal save/restore only covers the transform, not the stroke style.

## Entity contract

Each entity exposes:
- `pos: {x, y}` — world position (mutated in place by `wrap`)
- `radius: number` — hitbox radius, also used as wrap threshold
- `update(dt, bounds)` — advance physics, call `wrap`
- `draw(ctx[, bounds])` — render; asteroids need bounds for `drawAtWrappedPositions`

`Ship` also has `dead: boolean`, `vel`, `angle`, `thrusting`.

`Starfield` is draw-only (no `pos`, `radius`, or `update`) — it is not an entity in the physics sense.

Fragments, particles, coins, and coin particles are plain objects managed directly by `game.js`, not entity instances.

## drawPolygon convention

Shapes are defined in local space with the "front" at +x. `drawPolygon(ctx, points, {x, y, angle})` translates → rotates → strokes. The ship nose is at `{x: SHIP.size, y: 0}`; bullets spawn at `ship.pos + fromAngle(ship.angle) * SHIP.size`.

**Upgrade system.** Upgrade definitions live in `src/upgrades.json` — add an entry there and call `this._getUpgradeValue(id)` in `game.js` wherever the stat applies. Each entry has `id`, `name`, optional `unit` (appended to values in the UI, e.g. `"s"`), `levels[]` (value at each tier; index 0 is the free default), and `costs[]` (space bucks to reach each tier; costs[0] is always 0). Upgrade state (`_upgradeState`: id → tier index) persists across levels and resets only in `_resetGame`. The fire-rate cooldown (`_fireTimer`) is advanced every frame in `update` and reset to 0 on each shot; it starts at 999 so the player can fire immediately. New upgrades that affect gameplay need their own timer or check wired into the relevant update path.

## UPGRADE.md

The file UPGRADE.md documents the upgrade system design and all current upgrades. As new upgrades are added, document them there.

## DEVTOOLS.md

This file contains cheat codes that are available to be used once dev-tool mode is activated.