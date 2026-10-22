
"use client";

import Link from "next/link";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DeviceStatus from "@/components/dashboard/DeviceStatus";
import ImpressionSection from "@/components/dashboard/ImpressionSection";
import ThemeSwitcher from "@/components/theme/ThemeSwitcher";

import { useDashboardSimulation } from "@/hooks/useDashboardSimulation";
import { getImpressions } from "@/lib/impressions";

export default function DashboardPage() {
  const results = useDashboardSimulation();

  const metrics = [
    {
      label: "Count Rate",
      value: results.currentCps,
      unit: "CPS",
      digits: 0,
    },
    {
      label: "Dose Rate",
      value: results.currentDoseRate,
      unit: "µSv/h",
      digits: 3,
    },
    {
      label: "Battery",
      value: results.currentBattery,
      unit: "%",
      digits: 0,
    },
    {
      label: "Temperature",
      value: results.currentTemperature,
      unit: "°C",
      digits: 1,
    },
    {
      label: "Pressure",
      value: results.currentPressure,
      unit: "hPa",
      digits: 0,
    },
  ];

  const impressions = getImpressions(results.impression);

  const formatValue = (
    value: number | null | undefined,
    digits: number
  ) => {
    if (
      typeof value !== "number" ||
      !Number.isFinite(value)
    ) {
      return "—";
    }

    return value.toFixed(digits);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <DashboardHeader />
          <ThemeSwitcher />
        </div>

        {/* Page title and navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold sm:text-3xl">
              Scan Results
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Recorded radiation scan results
            </p>
          </div>

          <Link
            href="/scan/live"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Return to Live Scanner
          </Link>
        </div>

        {/* Loading */}
        {results.isLoading && (
          <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
            Loading scan results...
          </p>
        )}

        {/* Error */}
        {results.error && (
          <p
            role="alert"
            className="mt-8 rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-500"
          >
            {results.error}
          </p>
        )}

        {!results.isLoading && !results.error && (
          <div className="mt-8 space-y-6">
            {/* Stable scan readings */}
            <section>
              <h2 className="mb-4 text-lg font-semibold">
                Radiation Scan Readings
              </h2>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-xl border border-slate-200 bg-gray-200 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
                  >
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {metric.label}
                    </p>

                    <div className="mt-3 flex flex-wrap items-baseline gap-2">
                      <span className="text-3xl font-semibold tracking-tight">
                        {formatValue(
                          metric.value,
                          metric.digits
                        )}
                      </span>

                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {metric.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Device information */}
            <section className="rounded-xl border border-slate-200 bg-gray-200 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
              <h2 className="mb-4 text-lg font-semibold">
                Device Information
              </h2>

              <DeviceStatus
                device={results.device}
                battery={results.currentBattery}
                temperature={results.currentTemperature}
                pressure={results.currentPressure}
              />
            </section>

            {/* One Impression Summary */}
            <section>
              <ImpressionSection
                impressions={impressions}
              />
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
