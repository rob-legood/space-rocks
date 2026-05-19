# LEVELS.md — Level System

Levels define what spawns at the start of each wave and the story text shown at the Space Station between levels. All level definitions live in `src/levels.js`.

## Level definition schema

Each entry in the `LEVELS` array has:

| Field       | Type                | Description                                              |
|-------------|---------------------|----------------------------------------------------------|
| `id`        | number              | Level number (1-based, matches array index)              |
| `title`     | string              | Display name shown in the story panel header             |
| `spawn`     | `{ type, count }[]` | Objects to place at level start (see below)              |
| `storytext` | string \| null      | Story text shown at the station before launch            |

### `spawn` entries

Each entry in `spawn` is `{ type: string, count: number, ...options }`. `type` is either an `ASTEROID.sizes` key (`'large'`, `'medium'`, `'small'`, etc.), `'enemy'`, `'cargo'`, or `'mine'`. Multiple entries are supported — e.g., a mix of large asteroids and an enemy on the same level.

**Asteroid entries** — placed at random positions at least `ASTEROID.safeRadius` px from the ship start point. Spawn is called once when `_advanceLevel` runs; the objects drift in place until the player launches.

**Enemy entries** — enemies do not spawn immediately. Instead they are registered as pending spawns with a random delay between `minSpawnTime` and `maxSpawnTime` seconds (measured from when the level starts). The enemy then appears at a random safe position, drifts in a single direction, and fires in random directions on a timer.

| Enemy option     | Type   | Default | Description                                 |
|------------------|--------|---------|---------------------------------------------|
| `count`          | number | —       | Number of enemies to schedule               |
| `speed`          | number | 60      | Movement speed in px/s                      |
| `shotInterval`   | number | 1       | Seconds between shots                       |
| `minSpawnTime`   | number | 5       | Earliest the enemy can appear (seconds)     |
| `maxSpawnTime`   | number | 10      | Latest the enemy can appear (seconds)       |
| `hp`             | number | 1       | Hit points (1 shot = 1 damage)              |
| `shield`         | number | 0       | Shield HP; bullets absorbed until depleted; recharges after 3 s delay |
| `size`           | number | —       | Visual radius override (boss enemies)       |
| `minCoins`       | number | 0       | Min space bucks dropped on death            |
| `maxCoins`       | number | 0       | Max space bucks dropped on death            |
| `minPlatinum`    | number | 0       | Min platinum dropped on death               |
| `maxPlatinum`    | number | 0       | Max platinum dropped on death               |
| `minDilithium`   | number | 0       | Min dilithium dropped on death              |
| `maxDilithium`   | number | 0       | Max dilithium dropped on death              |

Enemies do not count toward level completion (all non-optional asteroid types must be cleared instead).

**Cargo entries** — drifting crates placed at random safe positions at level start. Destroyed by bullets (drops loot) or ship collision (no loot, ship unharmed). On destruction: brown wood-splinter particles burst outward and a woody thunk plays. Cargo is `optional = true` so it does not block level completion.

| Cargo option     | Type   | Default | Description                                 |
|------------------|--------|---------|---------------------------------------------|
| `count`          | number | —       | Number of crates to place                   |
| `minCoins`       | number | 2       | Min space bucks dropped when shot           |
| `maxCoins`       | number | 6       | Max space bucks dropped when shot           |
| `minPlatinum`    | number | 0       | Min platinum dropped when shot              |
| `maxPlatinum`    | number | 0       | Max platinum dropped when shot              |
| `minDilithium`   | number | 0       | Min dilithium dropped when shot             |
| `maxDilithium`   | number | 0       | Max dilithium dropped when shot             |

**Mine entries** — slowly drifting hazards placed at random safe positions at level start. When shot or collided with, the mine is destroyed and an expanding shockwave ring erupts outward. The shockwave kills the player when the ring sweeps over the ship. Mines do not drop loot. All mines must be destroyed for the exit wormhole to appear.

| Mine option         | Type   | Default   | Description                                   |
|---------------------|--------|-----------|-----------------------------------------------|
| `count`             | number | —         | Number of mines to place                      |
| `shockwaveRadius`   | number | 160       | Max radius the shockwave expands to (px)      |
| `shockwaveSpeed`    | number | 220       | How fast the shockwave expands (px/s)         |

### Story text

`storytext` supports `\n` for paragraph breaks and is word-wrapped automatically to fit the right-side story panel. A `null` value skips the story phase entirely. The panel uses an "INCOMING TRANSMISSION" heading and is dismissed with **Space**.

## `getLevel(n)` fallback

`getLevel(n)` returns the matching `LEVELS` entry for 1 ≤ n ≤ 50. Beyond that it generates a synthetic level with `null` story text and escalating large asteroid counts (L51 = 4 large, L52 = 5 large, …). This keeps the game playable indefinitely without manual level authoring.

## Adding a new level

1. Append an entry to the `LEVELS` array in `src/levels.js`. Keep `id` equal to the 1-based array position.
2. Set `spawn` to the list of objects you want at level start.
3. Write a `storytext` string (or `null` if no story text is needed).
4. Update this file with the new level entry below.

No changes to `game.js` or `config.js` are needed unless the spawn introduces a new entity type.

---

## Level 0: Dev Sandbox

Dev-only level gated by `LEVEL_ZERO.enabled`. Never counts toward the campaign — completing it drops straight into the normal station flow for L1.

| Spawn | 1 large asteroid · 3 enemies · 3 cargo crates |
|-------|------------------------------------------------|
| Story | none                                           |

---

## Current levels

### Act I — Last Captain Standing (L1–L10)

| Level | Title                           | Spawn                                                                               |
|-------|---------------------------------|-------------------------------------------------------------------------------------|
| 1     | First Contact                   | 1 large                                                                             |
| 2     | Of Coins and Concerns           | 2 large                                                                             |
| 3     | The Paperwork                   | 3 large                                                                             |
| 4     | Welcome Aboard the Rusty Lemon  | 4 large                                                                             |
| 5     | The Wrangler                    | 3 large · **boss** (hp 12, speed 25, spawns 6–10 s, drops 25–35 coins + 2–4 ₧)    |
| 6     | Salvage Rights                  | 3 large · 4 salvage                                                                 |
| 7     | Distress Becomes You            | 1 beacon · 2 large · 3 enemies (hp 1, spawns 8–14 s)                               |
| 8     | The Suit From Sector 12         | 2 large · 5 enemies (hp 1, spawns 4–10 s)                                          |
| 9     | Pretty in Purple                | 2 large · 3 fragile                                                                 |
| 10    | The Hollow                      | 2 fragile · 2 large · **boss** (hp 25, spawns 5–8 s) · 3 enemies (spawns 12–20 s) |

**Notes:**
- L5 introduces the first named boss — The Wrangler.
- L6 introduces salvage (not yet implemented; currently treated as unknown spawn type).
- L7 introduces the beacon entity (not yet implemented).
- L9 introduces fragile asteroids (purple; 1 shot → 10 small shards).
- L10 is the first Act I boss fight — The Hollow.

---

### Act II — What Lies Beneath (L11–L20)

| Level | Title                   | Spawn                                                                                    |
|-------|-------------------------|------------------------------------------------------------------------------------------|
| 11    | Suspiciously Quiet      | 2 large · 3 cargo                                                                        |
| 12    | Red Light, Red Right    | 3 large · 2 dangerous                                                                   |
| 13    | Crossfire               | 3 large · 1 fragile · 4 enemies (hp 1, spawns 5–12 s)                                  |
| 14    | Static Cling            | 2 large · 2 dangerous · 1 fragile                                                       |
| 15    | The Tug                 | 2 large · 2 fragile · **boss** (hp 35, spawns 4–8 s) · 1 blackhole                     |
| 16    | A Merchant Arrives      | 1 civilian · 2 large · 2 enemies (hp 1, spawns 6–12 s)                                 |
| 17    | Escort Service          | 2 civilian · 2 large · 1 fragile · 3 enemies (hp 1, spawns 5–10 s)                     |
| 18    | Trust Issues            | 3 large · 1 dangerous · 4 enemies (hp 1, spawns 4–10 s)                                |
| 19    | Corporate Synergy       | 2 large · 2 bomber · 4 enemies (hp 2, spawns 4–12 s)                                   |
| 20    | The Acquisitions Officer| 2 bomber · 2 large · **boss** (hp 50, spawns 3–6 s) · 4 enemies (hp 1, spawns 10–18 s)|

**Notes:**
- L11 introduces cargo crates alongside standard rocks.
- L12 introduces dangerous asteroids (red; 1 shot → 12 tiny fast shards, `dyingDuration` countdown).
- L15 introduces the blackhole environmental hazard (DONE — stationary gravity well; pulls ship toward center, instant kill at event horizon; indestructible) and the boss The Tug.
- L16–L17 introduce civilian ships (not yet implemented).
- L19 introduces bomber enemies (not yet implemented).
- L20 is the Act II boss fight — The Acquisitions Officer.

---

### Act III — Inside Job (L21–L30)

| Level | Title              | Spawn                                                                                       |
|-------|--------------------|---------------------------------------------------------------------------------------------|
| 21    | Stand Down         | 3 large · 2 fragile                                                                         |
| 22    | Stand Up           | 3 large · 2 dangerous · 3 enemies (hp 2, spawns 6–12 s)                                   |
| 23    | Marshals           | 2 large · 2 stealth · 3 enemies (hp 2, spawns 6–12 s)                                     |
| 24    | The Vanguard       | 2 large · 2 stealth · 1 bomber · 4 enemies (hp 2, spawns 5–10 s)                          |
| 25    | The Inquisitor     | 2 stealth · 2 bomber · 2 large · **boss** (hp 75, spawns 3–6 s, drops 50–80 coins + 12–18 ₧)|
| 26    | Wanted             | 3 large · 4 enemies (hp 2, spawns 4–10 s)                                                  |
| 27    | The Underground    | 2 large · 2 salvage · 1 civilian · 1 stealth                                               |
| 28    | Off the Grid       | 3 large · 2 dangerous · 4 mine                                                             |
| 29    | The Setup          | 3 large · 2 fragile · 1 bomber · 4 enemies (hp 2, spawns 4–10 s)                          |
| 30    | Admiral Maxim      | 2 bomber · 2 stealth · 2 large · **boss** (hp 110, spawns 3–5 s) · 4 enemies (spawns 10–18 s)|

**Notes:**
- L23 introduces stealth enemies (not yet implemented; cloak between shots).
- L25 is the Act III boss fight — The Inquisitor.
- L28 introduces mine hazards (DONE — slow-drifting, shockwave on contact or shot).
- L30 is the Act III climax boss — Admiral Maxim.

---

### Act IV — Going Rogue (L31–L40)

| Level | Title                              | Spawn                                                                                    |
|-------|------------------------------------|------------------------------------------------------------------------------------------|
| 31    | Beyond the Map                     | 3 large · 2 comet                                                                        |
| 32    | First Contact (For Real This Time) | 2 large · 8 drone                                                                        |
| 33    | Weird Tech                         | 2 large · 2 shielded · 6 drone                                                           |
| 34    | The Whisper Network                | 2 large · 3 plasmacloud · 6 drone                                                        |
| 35    | The Queen                          | 10 drone · 2 shielded · 2 plasmacloud · 1 mothership · **boss** (hp 150, spawns 3–5 s) |
| 36    | The Recording                      | 3 large · 3 salvage                                                                      |
| 37    | Lookalike                          | 2 large · 1 doppel                                                                       |
| 38    | Stockpile                          | 2 large · 2 doppel · 4 drone                                                             |
| 39    | The Door                           | 2 large · 2 shielded · 1 doppel · 2 plasmacloud                                         |
| 40    | Yourself                           | 2 large · **doppel boss** (hp 200) · 6 drone                                            |

**Notes:**
- L31 introduces comet entities (not yet implemented).
- L32 introduces drone swarms (not yet implemented).
- L33 introduces shielded asteroids (not yet implemented).
- L34 introduces plasma cloud hazards (not yet implemented).
- L35 is the Act IV midpoint boss — The Queen — with a mothership (not yet implemented).
- L37 introduces the doppel enemy (not yet implemented; AI copy of the player ship).
- L40 is the Act IV climax — fighting a powered-up version of yourself.

---

### Act V — Endgame (L41–L50)

| Level | Title                | Spawn                                                                                                    |
|-------|----------------------|----------------------------------------------------------------------------------------------------------|
| 41    | After the Funeral    | 3 large · 2 comet · 2 salvage                                                                            |
| 42    | The Last Captain Standing | 3 large · 2 fragile · 5 enemies (hp 2, spawns 4–10 s)                                            |
| 43    | Operation: Bad Idea  | 2 large · 3 bomber · 2 stealth · 4 enemies (hp 2, spawns 5–12 s)                                       |
| 44    | The Edge of Forever  | 3 large · 2 dangerous · 1 fragile · 2 bomber · 5 enemies (hp 2, spawns 4–10 s)                         |
| 45    | The Architect        | 2 large · 2 shielded · 1 doppel · **mothership** (hp 250) · **boss** (hp 180, spawns 4–7 s)            |
| 46    | Empty Stars          | 2 large · 3 comet                                                                                        |
| 47    | Burn the Maps        | 3 large · 2 fragile · 2 dangerous · 4 mine                                                              |
| 48    | Bring Everything     | 3 large · 3 bomber · 2 stealth · 6 enemies (hp 2, spawns 3–8 s)                                        |
| 49    | The Long Approach    | 3 large · 2 doppel · 2 shielded · 6 drone                                                               |
| 50    | The Truth            | 3 large · 2 shielded · 2 doppel · 2 bomber · 8 drone · **mothership** (hp 350) · **boss** (hp 300)     |

**Notes:**
- L45 is the Act V mid-boss — The Architect — with both a mothership and a boss enemy simultaneously.
- L50 is the final level with every enemy type on screen. The boss is the Truth Engine.
- After L50, `ENDGAME_TEXT` is surfaced on a dedicated end-of-campaign screen.
