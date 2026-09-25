export const GAZE_THRESHOLDS = {
  sampleHistoryMs: 4000,
  focusDwellMs: 1200,
  struggleHighMovementMs: 1500,
  struggleSwitchCount: 3,
  struggleWindowMs: 3000,
  highVelocityPxPerSecond: 700,
  abandonOutsideMs: 3500,
  abandonNoSampleMs: 2500,
};

export function findCardAtPoint(x, y, cardRefs) {
  for (const [id, element] of cardRefs.entries()) {
    if (!element) continue;

    const rect = element.getBoundingClientRect();

    if (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    ) {
      return String(id);
    }
  }

  return null;
}

export function distance(a, b) {
  if (!a || !b) return 0;

  return Math.hypot(a.x - b.x, a.y - b.y);
}
