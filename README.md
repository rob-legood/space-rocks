# Asteroids

A modern take on the 1979 arcade classic, with the original line-vector
aesthetic. Built with vanilla JS + Vite + Canvas 2D.

## Quick start

```sh
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Controls

| Key             | Action       |
| --------------- | ------------ |
| ← / A           | Rotate left  |
| → / D           | Rotate right |
| ↑ / W           | Thrust       |
| Space           | Fire (TODO)  |

## Project structure

```
asteroids/
├── index.html              # canvas host + module entry
├── styles.css              # black bg, centered canvas
├── src/
│   ├── main.js             # entry: bootstraps Game
│   ├── game.js             # game state, update/render loop
│   ├── input.js            # keyboard state tracker
│   ├── config.js           # all tunables (speeds, sizes, colors)
│   ├── entities/
│   │   └── ship.js         # ship: rotate, thrust, wrap, draw
│   └── utils/
│       ├── vector.js       # 2D math helpers
│       └── canvas.js       # drawPolygon, wrap helpers
```

## Iteration plan

This is **Slice 1**. Slices to come:

1. ✅ Ship: rotate, thrust with momentum, screen wrap, flame visual
2. ⬜ Bullets: fire on Space, travel, expire after distance
3. ⬜ Asteroids: large/medium/small with splitting on hit
4. ⬜ Collision detection (circle-based)
5. ⬜ Lives, score, game over / restart
6. ⬜ Particle explosions, hyperspace, UFO, sound, high scores
