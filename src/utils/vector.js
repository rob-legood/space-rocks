// Lightweight vector helpers. We use plain {x, y} objects rather than a class
// to keep allocations cheap and interop easy.

export function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function scale(v, s) {
  return { x: v.x * s, y: v.y * s };
}

export function fromAngle(angle, magnitude = 1) {
  return { x: Math.cos(angle) * magnitude, y: Math.sin(angle) * magnitude };
}

export function magnitude(v) {
  return Math.hypot(v.x, v.y);
}
