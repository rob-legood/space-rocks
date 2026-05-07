# UPGRADE.md — Ship Upgrade System

Upgrades are purchased with space bucks (§) at the Space Station between levels. They persist for the entire run; starting a new game resets all upgrades.

## Upgrade definitions

All upgrades are defined in `src/upgrades.json`. Each entry has:

| Field    | Type       | Description                                              |
|----------|------------|----------------------------------------------------------|
| `id`     | string     | Internal key used by game logic                          |
| `name`   | string     | Display name shown in the upgrade screen                 |
| `levels` | number[]   | Value at each tier; `levels[0]` is the default (free)   |
| `costs`  | number[]   | Space bucks to reach each tier; `costs[0]` is always 0  |

To add a new upgrade, add an entry to `upgrades.json` and apply its value in `game.js` via `this._getUpgradeValue(id)`.

## Current upgrades

### MULTI-SHOT (`maxBullets`)

Controls how many bullets can exist on screen simultaneously. Once the cap is reached, firing does nothing until a bullet expires.

| Tier | Value | Cost |
|------|-------|------|
| 0    | 1     | free |
| 1    | 2     | §15  |
| 2    | 3     | §30  |
| 3    | 5     | §60  |

## UI flow

1. At the Space Station, select **UPGRADE** from the main menu.
2. The upgrade list shows each upgrade with its current → next value and cost:
   - Affordable upgrades are shown at full brightness.
   - Unaffordable upgrades are dimmed gold.
   - Maxed upgrades show `[MAX]` and are greyed out.
3. Press **Space** to purchase the selected upgrade. Space bucks will never go negative.
4. Select **BACK** to return to the station main menu.
