# SONGS.md — Music System

All music is procedurally synthesised via the Web Audio API. No audio files are used. The sequencer lives in `src/music.js`.

## Architecture

The music system uses a **look-ahead scheduler** pattern — a `setTimeout` loop wakes up every 30 ms and pre-schedules notes 120 ms ahead using `AudioContext.currentTime`. This is the standard technique for drift-free Web Audio sequencing: the JS clock (setTimeout) handles coarse timing, the audio clock handles sample-accurate note placement.

Each note is a short-lived oscillator + gain envelope node, created on demand and discarded after it plays. There is no long-running oscillator kept alive.

A single master gain node (`_bus`) sits between all note nodes and the destination. This can be used for global music volume control.

### Public API (`src/music.js`)

| Function          | Description                                             |
|-------------------|---------------------------------------------------------|
| `playMusic(name)` | Start a named track; no-ops if already on that track   |
| `stopMusic()`     | Stop the scheduler immediately (notes already scheduled will play out naturally) |

### Adding a new track

1. Add a `name: { stepTime, steps[] }` entry to `TRACKS` in `src/music.js`.
2. `stepTime` — seconds per step (e.g. `0.25` = 120 BPM eighth notes).
3. `steps` — array of step entries, looped continuously. Each step is an array of note tuples `[freq, dur, vol, type]`. An empty array `[]` is a rest.
4. Call `playMusic('name')` from the appropriate game state transition in `src/game.js`.

### Note tuple format

```
[freq, dur, vol, type]
 │     │    │    └── oscillator type: 'square' | 'sine' | 'triangle' | 'sawtooth'
 │     │    └─────── peak gain (0–1); fades to silence over `dur` seconds
 │     └──────────── note duration in seconds (should be ≤ stepTime)
 └────────────────── frequency in Hz
```

Multiple tuples per step play simultaneously (for chords or layered timbres).

---

## Current tracks

### `playing` — Asteroid Field

> Plays from the moment the player emerges from the entry wormhole. Switches to `enemy` when the first enemy appears.

Inspired by the original 1979 Asteroids "heartbeat" — two alternating deep bass tones (A1/E2) that create a sense of lurking danger. A sparse triangle-wave melody adds texture without distracting from gameplay.

| Property   | Value                              |
|------------|------------------------------------|
| Tempo      | 120 BPM, eighth notes              |
| Loop       | 16 steps × 0.25 s = 4 s           |
| Bass       | Square wave, A1 (55 Hz) / E2 (82 Hz) alternating |
| Melody     | Triangle wave, Am pentatonic (E3, D3, C3) |
| Trigger    | `_updateEntering` → `'playing'` state transition |

---

### `enemy` — Combat Alert

> Triggered the first time an enemy physically appears on screen (not when they are pending). Stays active for the rest of the level.

Faster tempo with a syncopated bass line and tritone (Bb) dissonance — the flat second / tritone interval is a classic horror/tension device. A high square-wave stab on beats 1 and 5 adds a menacing edge.

| Property   | Value                              |
|------------|------------------------------------|
| Tempo      | 150 BPM, eighth notes              |
| Loop       | 8 steps × 0.2 s = 1.6 s           |
| Bass       | Square wave, A1 with Bb1 tritone alternation |
| Lead stab  | Square wave, E4 / Bb3 (tritone pair) |
| Trigger    | First enemy spawns from `_pendingEnemySpawns` |

---

### `victory` — Level Clear

> Plays the moment the exit wormhole appears (all required enemies and asteroids cleared). Stops naturally when the player flies through the wormhole and `_startStation()` switches to the station theme.

A-major rising triad fanfare — A → C# → E → A (octave) — gives the classic "you did it" lift. The bass provides a driving pulse while the triangle melody climbs to a peak on beat 9 then resolves back down.

| Property   | Value                                         |
|------------|-----------------------------------------------|
| Tempo      | 143 BPM, eighth notes                         |
| Loop       | 16 steps × 0.21 s ≈ 3.36 s                   |
| Bass       | Square wave, A2 / E2 alternating              |
| Melody     | Triangle wave, A major: A3 Cs4 E4 A4 descend |
| Trigger    | `_state = 'levelcomplete'` (both normal and dev shortcut) |

---

### `station` — Starbase Calm

> Plays throughout the Space Station phase (docking animation, menu, upgrades, story text).

A slow A-minor arpeggio in sine waves — ascending from A2 to A3 then descending back. The sine timbre and slow tempo (80 BPM) create a calm, safe feeling that contrasts with the combat themes.

| Property   | Value                              |
|------------|------------------------------------|
| Tempo      | 80 BPM, quarter notes              |
| Loop       | 8 steps × 0.75 s = 6 s            |
| Arpeggio   | Sine wave, Am: A2 C3 E3 G3 A3 G3 E3 C3 |
| Bass drone | Sine wave, A1 on alternating steps |
| Trigger    | `_startStation()`                  |

---

## State machine

```
[splash]  ──── start game ────►  [station] ── launch ──► [entering] ── wormhole done ──► [playing]
                                     ▲                                                        │
                                     │                                                  enemy spawns
                                     │                                                        │
                              [exiting/station] ◄── player exits wormhole                 [enemy]
                                                                  │                          │
                                                           [victory] ◄── level complete ─────┘
                                                        (wormhole appears)

[gameover] — stopMusic() — silence until new game starts
[reset]    — stopMusic()
```
