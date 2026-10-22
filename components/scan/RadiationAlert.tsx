
"use client";

type RadiationAlertProps = {
  scenario: "positive" | "negative";
  remainingSeconds?: number;
};

export default function RadiationAlert({
  scenario,
}: RadiationAlertProps) {
  const positive = scenario === "positive";

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        role="status"
        aria-live="polite"
        className={`animate-[fadeIn_400ms_ease-out] flex w-[min(90vw,460px)] flex-col items-center gap-4 rounded-2xl border px-8 py-10 text-center shadow-2xl ${
          positive
            ? "border-amber-500/70 bg-[#1a0c08]/95 shadow-orange-900/40"
            : "border-emerald-500/60 bg-[#071b18]/95 shadow-emerald-950/40"
        }`}
      >
        <div
          className={`rounded-full p-5 ${
            positive
              ? "bg-amber-500/10 text-amber-400"
              : "bg-emerald-500/10 text-emerald-400"
          }`}
        >
          <svg
            viewBox="0 0 100 100"
            className="h-24 w-24"
            aria-hidden="true"
          >
            <circle
              cx="50"
              cy="50"
              r="47"
              fill={positive ? "#fbbf24" : "#34d399"}
            />

            {[0, 120, 240].map((rotation) => (
              <path
                key={rotation}
                d="M 46 38 L 34 14 A 39 39 0 0 1 66 14 L 54 38 A 13 13 0 0 0 46 38 Z"
                fill="#101010"
                transform={`rotate(${rotation} 50 50)`}
              />
            ))}

            <circle
              cx="50"
              cy="50"
              r="8"
              fill="#101010"
            />
          </svg>
        </div>

        <div className="space-y-2">
          <p
            className={`text-xs font-semibold uppercase tracking-[0.28em] ${
              positive ? "text-amber-400" : "text-emerald-400"
            }`}
          >
            Radiation Area Monitor
          </p>

          <h2 className="text-2xl font-bold uppercase tracking-wider text-white sm:text-3xl">
            {positive
              ? "Found the radiation"
              : "No Radiation Found"}
          </h2>

          <p className="text-sm text-white/60">
            {positive
              ? "Radiation signature detected."
              : "No significant radiation signature detected."}
          </p>
        </div>
      </div>
    </div>
  );
}
