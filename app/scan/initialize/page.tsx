
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import RadioanalysisLoader from "@/components/ui/RadioanalysisLoader";
import type { UserScenarioConfig } from "@/types/radioanalysis";

export default function InitializeScanPage() {
  const router = useRouter();

  const [duration, setDuration] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let interval: number | undefined;
    let redirected = false;

    const begin = async () => {
      try {
        const [scenarioResponse, activeResponse] =
          await Promise.all([
            fetch("/api/user/scenario", {
              cache: "no-store",
            }),
            fetch("/api/simulations/active", {
              cache: "no-store",
            }),
          ]);

        const scenarioPayload =
          await scenarioResponse.json();

        const activePayload =
          await activeResponse.json();

        if (!scenarioResponse.ok) {
          throw new Error(
            scenarioPayload.message ??
              "Unable to get assigned scenario"
          );
        }

        if (
          !activeResponse.ok ||
          activePayload.status !== "running"
        ) {
          throw new Error(
            activePayload.message ??
              "No active scan. Start a scan first."
          );
        }

        const scenario = (
          scenarioPayload.data ?? scenarioPayload
        ) as UserScenarioConfig;

        if (
          !scenario ||
          (scenario.scenarioType !== "positive" &&
            scenario.scenarioType !== "negative")
        ) {
          throw new Error(
            "A valid positive or negative scenario must be assigned by the administrator."
          );
        }

        const seconds = Number(
          scenario.scanDurationSeconds
        );

        if (
          !Number.isFinite(seconds) ||
          seconds < 1
        ) {
          throw new Error(
            "The administrator must configure a scan duration of at least one second."
          );
        }

        if (cancelled) return;

        const endAt = Date.now() + seconds * 1000;

        sessionStorage.setItem(
          "radioanalysis_scan_end",
          String(endAt)
        );

        sessionStorage.setItem(
          "radioanalysis_scenario",
          scenario.scenarioType
        );

        sessionStorage.removeItem(
          "radioanalysis_uplink_complete"
        );

        setDuration(seconds);
        setRemaining(seconds);

        const tick = () => {
          if (cancelled || redirected) return;

          const left = Math.max(
            0,
            Math.ceil(
              (endAt - Date.now()) / 1000
            )
          );

          setRemaining(left);

          if (left === 0) {
            redirected = true;

            if (interval !== undefined) {
              window.clearInterval(interval);
            }

            // Both scenarios must complete the
            // particle animation before proceeding.
            router.replace("/scan/identifier");
          }
        };

        interval = window.setInterval(tick, 200);

        tick();
      } catch (cause) {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to initialize scan"
          );
        }
      }
    };

    void begin();

    return () => {
      cancelled = true;

      if (interval !== undefined) {
        window.clearInterval(interval);
      }
    };
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-10 text-white">
      {error ? (
        <div
          className="mt-10 text-center"
          role="alert"
        >
          <p className="text-red-400">
            {error}
          </p>

          <button
            onClick={() =>
              router.replace("/scan")
            }
            className="mt-5 rounded-lg bg-white px-6 py-3 text-black"
          >
            Back to Scan
          </button>
        </div>
      ) : (
        <>
          <RadioanalysisLoader />

          <p className="mt-3 text-center text-slate-400">
            Please wait while the scanner initializes
          </p>
        </>
      )}
    </main>
  );
}
