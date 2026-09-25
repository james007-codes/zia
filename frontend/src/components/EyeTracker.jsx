import React, { useEffect, useState } from "react";

// 9-point calibration layout
const CALIBRATION_POINTS = [
  { id: 1, style: { top: "10%", left: "10%" } },
  {
    id: 2,
    style: {
      top: "10%",
      left: "50%",
      transform: "translateX(-50%)",
    },
  },
  { id: 3, style: { top: "10%", right: "10%" } },

  {
    id: 4,
    style: {
      top: "50%",
      left: "10%",
      transform: "translateY(-50%)",
    },
  },
  {
    id: 5,
    style: {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    },
  },
  {
    id: 6,
    style: {
      top: "50%",
      right: "10%",
      transform: "translateY(-50%)",
    },
  },

  { id: 7, style: { bottom: "10%", left: "10%" } },
  {
    id: 8,
    style: {
      bottom: "10%",
      left: "50%",
      transform: "translateX(-50%)",
    },
  },
  { id: 9, style: { bottom: "10%", right: "10%" } },
];

export default function EyeTracker({ visible = true }) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  const [gazeCoords, setGazeCoords] = useState({
    x: 0,
    y: 0,
  });

  const [calibrated, setCalibrated] = useState(false);

  const [clickCounts, setClickCounts] = useState({});

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        // If WebGazer is already loaded
        if (window.webgazer) {
          resolve(window.webgazer);
          return;
        }

        const script = document.createElement("script");

        script.src = src;
        script.async = true;

        script.onload = () => {
          resolve(window.webgazer);
        };

        script.onerror = () => {
          reject(
            new Error(
              `Failed to load eye tracking library: ${src}`
            )
          );
        };

        document.body.appendChild(script);
      });
    };

    loadScript(
      "https://cdn.jsdelivr.net/npm/webgazer@3.3.0/dist/webgazer.min.js"
    )
      .then((webgazer) => {
        // Check camera support
        if (!navigator.mediaDevices?.getUserMedia) {
          setError(
            "Your browser does not support camera access."
          );
          return;
        }

        webgazer
          .setGazeListener((data) => {
            if (!data) return;

            const sample = {
              x: Math.round(data.x),
              y: Math.round(data.y),
              timestamp: Date.now(),
            };

            setGazeCoords(sample);

            window.dispatchEvent(
              new CustomEvent("zia:gaze-sample", {
                detail: sample,
              })
            );
          })
          .begin()
          .then(() => {
            setIsReady(true);

            // Show camera preview and gaze prediction point
            webgazer
              .showVideoPreview(true)
              .showPredictionPoints(true);
          })
          .catch((err) => {
            setError(
              "Could not start eye tracker: " +
                err.message
            );
          });
      })
      .catch((err) => {
        setError(err.message);
      });

    // Cleanup when component is removed
    return () => {
      if (window.webgazer) {
        try {
          window.webgazer.end();

          const elementsToRemove = [
            "webgazerVideoContainer",
            "webgazerFaceFeedbackBox",
            "webgazerFaceDot",
          ];

          elementsToRemove.forEach((id) => {
            const element =
              document.getElementById(id);

            if (element) {
              element.remove();
            }
          });
        } catch (err) {
          console.warn(
            "Eye tracker cleanup error:",
            err
          );
        }
      }
    };
  }, []);

  // =========================
  // CALIBRATION
  // =========================

  const handleCalibrateClick = (pointId) => {
    const currentClicks =
      (clickCounts[pointId] || 0) + 1;

    const updatedCounts = {
      ...clickCounts,
      [pointId]: currentClicks,
    };

    setClickCounts(updatedCounts);

    // Every point must be clicked 5 times
    const allDone = CALIBRATION_POINTS.every(
      (point) =>
        (updatedCounts[point.id] || 0) >= 5
    );

    if (allDone) {
      setCalibrated(true);
      window.dispatchEvent(
        new CustomEvent("zia:gaze-calibrated")
      );
    }
  };

  if (!visible) return null;

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-red-50 border border-red-200">
        <p className="text-red-600 font-semibold">
          {error}
        </p>

        <p className="text-sm text-red-500 mt-2">
          Please allow camera access and refresh
          the page.
        </p>
      </div>
    );
  }

  // =========================
  // LOADING
  // =========================

  if (!isReady) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse">
          <p className="text-slate-500 font-semibold">
            Initializing eye tracker...
          </p>

          <p className="text-sm text-slate-400 mt-2">
            Please allow camera access when
            prompted.
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // MAIN UI
  // =========================

  return (
    <div className="relative w-full min-h-[500px] border border-slate-200 rounded-xl bg-slate-50 p-6 overflow-hidden">

      {/* =========================
          CALIBRATION
      ========================= */}

      {!calibrated && (
        <div className="absolute inset-0 bg-white/95 z-40 flex flex-col items-center justify-center">

          <div className="text-center max-w-md p-4 mb-20">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Gaze Engine Calibration
            </h2>

            <p className="text-sm text-slate-600">
              Look directly at each red target
              and click it{" "}
              <strong>5 times</strong>.
              <br />
              Complete all 9 points to activate
              eye tracking.
            </p>
          </div>

          {CALIBRATION_POINTS.map((point) => {
            const currentCount =
              clickCounts[point.id] || 0;

            const isCompleted =
              currentCount >= 5;

            return (
              <button
                key={point.id}
                onClick={() =>
                  handleCalibrateClick(
                    point.id
                  )
                }
                disabled={isCompleted}
                style={point.style}
                className={`absolute w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all border shadow ${
                  isCompleted
                    ? "bg-emerald-500 text-white border-emerald-600 scale-90 opacity-60"
                    : "bg-rose-600 text-white border-rose-700 hover:scale-110 active:scale-95 cursor-pointer"
                }`}
              >
                {isCompleted
                  ? "✓"
                  : 5 - currentCount}
              </button>
            );
          })}
        </div>
      )}

      {/* =========================
          TRACKING DISPLAY
      ========================= */}

      <div className="flex flex-col items-center justify-center h-full min-h-[450px] pt-12 text-center">

        {/* Status */}
        <div className="bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-semibold mb-4">
          ✓ Gaze Mapping Active
        </div>

        <p className="text-sm text-slate-500 max-w-sm mb-6">
          Look around the dashboard. Your gaze
          position is being calculated in
          real-time.
        </p>

        {/* Coordinates */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex gap-8 text-left">

          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Gaze X Axis
            </span>

            <span className="text-3xl font-mono font-bold text-slate-800">
              {gazeCoords.x}px
            </span>
          </div>

          <div className="border-l border-slate-200 pl-8">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Gaze Y Axis
            </span>

            <span className="text-3xl font-mono font-bold text-slate-800">
              {gazeCoords.y}px
            </span>
          </div>

        </div>

        {/* Calibration status */}
        {calibrated && (
          <div className="mt-6 text-xs text-slate-400">
            Calibration complete • Real-time
            gaze tracking enabled
          </div>
        )}

      </div>
    </div>
  );
}