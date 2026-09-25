const STORAGE_KEY = "zia:gaze-runtime:v1";

export function createRuntimeSnapshot(runtime) {
  return {
    exportedAt: new Date().toISOString(),
    state: runtime.state,
    calibrated: runtime.calibrated,
    focusedProductId: runtime.focusedProductId,
    cardDwellMs: runtime.cardDwellMs,
    velocity: runtime.velocity,
    switchCount: runtime.switchCount,
    outsideMs: runtime.outsideMs,\n    transitions: runtime.transitions.map((transition) => ({ ...transition })),
    samples: runtime.samples.map((sample) => ({
      x: sample.x,
      y: sample.y,
      timestamp: sample.timestamp,
      velocity: sample.velocity ?? 0,
      productId: sample.productId ?? null,
    })),
  };
}

export function saveRuntimeSnapshot(runtime) {
  const snapshot = createRuntimeSnapshot(runtime);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  return snapshot;
}

export function loadRuntimeSnapshot() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearRuntimeSnapshot() {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportRuntimeJson(runtime) {
  const snapshot = createRuntimeSnapshot(runtime);
  const blob = new Blob(
    [JSON.stringify(snapshot, null, 2)],
    { type: "application/json" }
  );
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `zia-gaze-runtime-${Date.now()}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  return snapshot;
}

export { STORAGE_KEY };
