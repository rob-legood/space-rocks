export function circlesOverlap(a, b, bounds) {
  let dx = Math.abs(a.pos.x - b.pos.x);
  let dy = Math.abs(a.pos.y - b.pos.y);
  if (dx > bounds.width  / 2) dx = bounds.width  - dx;
  if (dy > bounds.height / 2) dy = bounds.height - dy;
  const rSum = a.radius + b.radius;
  return dx * dx + dy * dy < rSum * rSum;
}
