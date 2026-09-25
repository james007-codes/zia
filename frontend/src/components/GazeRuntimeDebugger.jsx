const STATE_STYLES = {
  FOCUS: "bg-emerald-50 text-emerald-700 border-emerald-200",
  STRUGGLE: "bg-amber-50 text-amber-700 border-amber-200",
  ABANDON: "bg-rose-50 text-rose-700 border-rose-200",
  IDLE: "bg-slate-50 text-slate-600 border-slate-200",
};

export default function GazeRuntimeDebugger({ runtime, onExport }) {
  if (!import.meta.env.DEV) return null;

  const stateClass =
    STATE_STYLES[runtime.state] || STATE_STYLES.IDLE;

  return (
    <div className="fixed bottom-4 right-4 z-[100] w-72 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          ZIA Runtime Debug
        </span>

        <span
          className={`rounded-full border px-2 py-1 text-[10px] font-bold ${stateClass}`}
        >
          {runtime.state}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-slate-400">Calibrated</span>
          <p className="font-semibold">
            {runtime.calibrated ? "Yes" : "No"}
          </p>
        </div>

        <div>
          <span className="text-slate-400">Card</span>
          <p className="font-semibold">
            {runtime.focusedProductId || "None"}
          </p>
        </div>

        <div>
          <span className="text-slate-400">Dwell</span>
          <p className="font-semibold">
            {(runtime.cardDwellMs / 1000).toFixed(1)}s
          </p>
        </div>

        <div>
          <span className="text-slate-400">Velocity</span>
          <p className="font-semibold">
            {Math.round(runtime.velocity)} px/s
          </p>
        </div>

        <div>
          <span className="text-slate-400">Switches</span>
          <p className="font-semibold">
            {runtime.switchCount}
          </p>
        </div>

        <div>
          <span className="text-slate-400">Outside</span>
          <p className="font-semibold">
            {(runtime.outsideMs / 1000).toFixed(1)}s
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onExport}
        className="mt-3 w-full rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
      >
        Export Runtime JSON
      </button>

      <p className="mt-3 border-t border-slate-100 pt-3 text-[10px] leading-relaxed text-slate-400">
        Focus = sustained card dwell. Struggle = rapid gaze
        movement or repeated card switching. Abandon = prolonged
        gaze outside the product cards.
      </p>
    </div>
  );
}
