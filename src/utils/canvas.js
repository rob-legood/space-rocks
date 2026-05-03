// Reusable canvas helpers. Each entity calls drawPolygon with its local-space
// shape; the helper handles translation/rotation. This keeps entity files
// focused on game logic rather than ctx bookkeeping.

export function drawPolygon(ctx, points, { x, y, angle = 0, scale = 1 } = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  if (scale !== 1) ctx.scale(scale, scale);

  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.stroke();

  ctx.restore();
}

// Draw an entity at its position and at any mirror positions needed so it
// smoothly slides through screen edges. radius is the max extent of the shape
// from its centre (used as the threshold for generating ghost copies).
export function drawAtWrappedPositions(pos, radius, bounds, drawFn) {
  const xs = [pos.x];
  if (pos.x - radius < 0)              xs.push(pos.x + bounds.width);
  if (pos.x + radius > bounds.width)   xs.push(pos.x - bounds.width);

  const ys = [pos.y];
  if (pos.y - radius < 0)              ys.push(pos.y + bounds.height);
  if (pos.y + radius > bounds.height)  ys.push(pos.y - bounds.height);

  for (const x of xs) {
    for (const y of ys) {
      drawFn(x, y);
    }
  }
}

// Toroidal screen wrap — mutates pos in place.
export function wrap(pos, width, height) {
  if (pos.x < 0) pos.x += width;
  else if (pos.x > width) pos.x -= width;
  if (pos.y < 0) pos.y += height;
  else if (pos.y > height) pos.y -= height;
}
