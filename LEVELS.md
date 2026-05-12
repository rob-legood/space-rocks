# LEVELS.md — Level System

Levels define what spawns at the start of each wave and the story text shown at the Space Station between levels. All level definitions live in `src/levels.js`.

## Level definition schema

Each entry in the `LEVELS` array has:

| Field      | Type                        | Description                                                  |
|------------|-----------------------------|--------------------------------------------------------------|
| `id`       | number                      | Level number (1-based, matches array index)                  |
| `title`    | string                      | Display name shown in the story panel header                 |
| `spawn`    | `{ type, count }[]`         | Objects to place at level start (see below)                  |
| `pretext`  | string \| null              | Story text shown after docking, before the menu appears      |
| `posttext` | string \| null              | Story text shown after selecting LAUNCH, before undocking    |

### `spawn` entries

Each entry in `spawn` is `{ type: string, count: number, ...options }`. `type` is either an `ASTEROID.sizes` key (`'large'`, `'medium'`, `'small'`, etc.) or `'enemy'`. Multiple entries are supported — e.g., a mix of large asteroids and an enemy on the same level.

**Asteroid entries** — placed at random positions at least `ASTEROID.safeRadius` px from the ship start point. Spawn is called once when `_advanceLevel` runs; the objects drift frozen in place until the player launches.

**Enemy entries** — enemies do not spawn immediately. Instead they are registered as pending spawns with a random delay between `minSpawnTime` and `maxSpawnTime` seconds (measured from when the level starts). The enemy then appears at a random safe position and drifts in a single direction, firing in random directions on a timer.

| Enemy option     | Type   | Default | Description                                 |
|------------------|--------|---------|---------------------------------------------|
| `count`          | number | —       | Number of enemies to schedule               |
| `speed`          | number | 60      | Movement speed in px/s                      |
| `shotInterval`   | number | 1       | Seconds between shots                       |
| `minSpawnTime`   | number | 5       | Earliest the enemy can appear (seconds)     |
| `maxSpawnTime`   | number | 10      | Latest the enemy can appear (seconds)       |
| `hp`             | number | 1       | Hit points (1 shot = 1 damage)              |

Enemies drop 5 coins on death and do not count toward level completion (all asteroid types must be cleared instead).

### Story text

`pretext` and `posttext` support `\n` for paragraph breaks. Both are optional (null skips the phase entirely). Text is word-wrapped automatically to fit the right-side story panel.

- **pretext** — "INCOMING TRANSMISSION" heading. Shown immediately after the docking animation completes. Intended for post-mission debrief ("good work, pilot…").
- **posttext** — "MISSION BRIEFING" heading. Shown after the player selects LAUNCH. Intended for the next-mission briefing ("two asteroids inbound…").

Pressing **Space** dismisses each panel and advances to the next station phase.

## `getLevel(n)` fallback

`getLevel(n)` in `levels.js` returns the matching `LEVELS` entry for 1 ≤ n ≤ LEVELS.length. Beyond that it generates a synthetic level with `null` story text and one extra large asteroid per level above the last defined level (based on the last entry's spawn count). This keeps the game playable indefinitely without manual level authoring.

## Adding a new level

1. Append an entry to the `LEVELS` array in `src/levels.js`. Keep `id` equal to the 1-based array position.
2. Set `spawn` to the list of objects you want at level start.
3. Write `pretext` and `posttext` strings (or `null` if no story text is needed for a phase).
4. Update this file with the new level entry below.

No changes to `game.js` or `config.js` are needed unless the spawn introduces a new entity type.

## Current levels

### Level 1: First Contact

| Field    | Value                                                                 |
|----------|-----------------------------------------------------------------------|
| Spawn    | 1 dangerous asteroid + 1 enemy (speed 55, 1 shot/s, spawns 5–10 s)  |
| Pretext  | Welcome / station intro                                               |
| Posttext | Single asteroid intercept order                                       |

Introductory level. One dangerous rock (splits into 12 tiny fast asteroids). An enemy ship appears 5–10 seconds after launch, drifts in a straight line, and fires in random directions once per second. It has 1 HP and drops 5 coins on death.

---

### Level 2: Debris Field

| Field    | Value                              |
|----------|------------------------------------|
| Spawn    | 2 large asteroids                  |
| Pretext  | Command notices the pilot's skill  |
| Posttext | Belt debris incoming               |

First level with multiple simultaneous threats.

---

### Level 3: The Swarm

| Field    | Value                            |
|----------|----------------------------------|
| Spawn    | 3 large asteroids                |
| Pretext  | Science team detects the anomaly |
| Posttext | Dense cores; expect fragmentation|

Fragment count peaks here — 3 + 6 + 12 = 21 objects at maximum fragmentation.

---

### Level 4: Storm Front

| Field    | Value                              |
|----------|------------------------------------|
| Spawn    | 4 large asteroids                  |
| Pretext  | Anomaly confirmed; possible intent |
| Posttext | Loose formation; scanners struggling|

Story begins hinting that the asteroid waves may not be natural.

---

### Level 5: The Source

| Field    | Value                               |
|----------|-------------------------------------|
| Spawn    | 5 large asteroids                   |
| Pretext  | Object triangulated at sensor edge  |
| Posttext | Largest wave yet; buy time          |

Final authored level. Beyond level 5 the `getLevel` fallback takes over (6 large, 7 large, …).
