"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useScanConfig } from "@/hooks/useScanConfig";

export default function ScanLoadingPage() {
  const router = useRouter();

  const { config, isLoading, error } = useScanConfig();

  const [remainingSeconds, setRemainingSeconds] =
    useState<number | null>(() => config?.durationSeconds ?? null);

  useEffect(() => {
    if (!config) return;

    const resetTimeout = window.setTimeout(() => {
      setRemainingSeconds(config.durationSeconds);
    }, 0);

    const interval = window.setInterval(() => {
      setRemainingSeconds((previous) => {
        if (previous === null) {
          return config.durationSeconds;
        }

        if (previous <= 1) {
          window.clearInterval(interval);
          return 0;
        }

        return previous - 1;
      });
    }, 10000);

    return () => {
      window.clearTimeout(resetTimeout);
      window.clearInterval(interval);
    };
  }, [config]);

  useEffect(() => {
    if (remainingSeconds !== 0) return;

    const timeout = window.setTimeout(() => {
      router.push("/dashboard");
    }, 5000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [remainingSeconds, router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

          <h1 className="text-xl font-semibold">
            Preparing Scan
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Loading scan configuration...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold text-red-600">
            Unable to Start Scan
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() => router.push("/scan")}
            className="mt-6 rounded-lg bg-black px-6 py-3 text-sm font-medium text-white"
          >
            Back to Scan
          </button>
        </div>
      </main>
    );
  }

  if (!config) {
    return null;
  }

  return (
    <main className="min-h-screen bg-white px-6 py-12">
      <div className="mx-auto flex min-h-[80vh] max-w-4xl flex-col items-center justify-center">

        <div className="w-full max-w-2xl">

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold">
              Radiation Scan in Progress
            </h1>

            <p className="mt-3 text-sm text-gray-500">
              Please wait while the scan is being performed.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-black shadow-sm">
            <video
              src={config.videoUrl}
              autoPlay
              muted
              playsInline
              controls={false}
              disablePictureInPicture
              className="h-auto w-full"
              onContextMenu={(event) =>
                event.preventDefault()
              }
            />
          </div>

          <div className="mt-8 text-center">

            <div className="text-5xl font-semibold">
              {remainingSeconds}
            </div>

            <p className="mt-2 text-sm text-gray-500">
              seconds remaining
            </p>

          </div>

          <div className="mt-8 h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-black transition-all duration-1000"
              style={{
                width: `${
                  ((config.durationSeconds -
                    (remainingSeconds ?? config.durationSeconds)) /
                    config.durationSeconds) *
                  100
                }%`,
              }}
            />
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            Please do not close or refresh this page while the
            scan is running.
          </p>

        </div>
      </div>
    </main>
  );
}