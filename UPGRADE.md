# UPGRADE.md — Ship Upgrade System

Upgrades are purchased with space bucks (§) at the Space Station between levels. They persist for the entire run; starting a new game resets all upgrades.

## Upgrade definitions

All upgrades are defined in `src/upgrades.json`. Each entry has:

| Field    | Type       | Description                                              |
|----------|------------|----------------------------------------------------------|
| `id`     | string     | Internal key used by game logic                          |
| `name`   | string     | Display name shown in the upgrade screen                 |
| `unit`   | string     | Optional suffix appended to values in the UI (e.g. `s`) |
| `levels` | number[]   | Value at each tier; `levels[0]` is the default (free)   |
| `costs`  | number[]   | Space bucks to reach each tier; `costs[0]` is always 0  |

To add a new upgrade, add an entry to `upgrades.json` and apply its value in `game.js` via `this._getUpgradeValue(id)`.

## Current upgrades

### RECHARGE SPEED (`rechargeCooldown`)

Minimum time in seconds between shots. Firing before the cooldown expires does nothing; the input is still consumed so it doesn't queue.

| Tier | Value | Cost |
|------|-------|------|
| 0    | 2.0s  | free |
| 1    | 1.6s  | §8   |
| 2    | 1.2s  | §18  |
| 3    | 1.0s  | §30  |
| 4    | 0.8s  | §45  |
| 5    | 0.6s  | §65  |
| 6    | 0.5s  | §90  |

### THRUST POWER (`thrustAccel`)

Acceleration applied each frame when thrusting, in px/s². Higher values let the ship reach top speed faster and feel more responsive.

| Tier | Value | Cost |
|------|-------|------|
| 0    | 110   | free |
| 1    | 180   | §10  |
| 2    | 260   | §24  |
| 3    | 350   | §42  |
| 4    | 430   | §64  |
| 5    | 500   | §90  |

## UI flow

1. At the Space Station, select **UPGRADE** from the main menu.
2. The upgrade list shows each upgrade with its current → next value and cost:
   - Affordable upgrades are shown at full brightness.
   - Unaffordable upgrades are dimmed gold.
   - Maxed upgrades show `[MAX]` and are greyed out.
3. Press **Space** to purchase the selected upgrade. Space bucks will never go negative.
4. Select **BACK** to return to the station main menu.
