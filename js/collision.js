function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.width  &&
    a.x + a.width  > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// Push `mover` out of `obstacle` along whichever axis has the smallest overlap.
function resolveCollision(mover, obstacle) {
  const overlapLeft   = (mover.x + mover.width)  - obstacle.x;
  const overlapRight  = (obstacle.x + obstacle.width)  - mover.x;
  const overlapTop    = (mover.y + mover.height) - obstacle.y;
  const overlapBottom = (obstacle.y + obstacle.height) - mover.y;

  const minX = overlapLeft < overlapRight ? -overlapLeft : overlapRight;
  const minY = overlapTop  < overlapBottom ? -overlapTop  : overlapBottom;

  if (Math.abs(minX) < Math.abs(minY)) {
    mover.x += minX;
  } else {
    mover.y += minY;
  }
}
