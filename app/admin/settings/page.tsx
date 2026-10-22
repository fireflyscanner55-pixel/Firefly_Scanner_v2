
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  ChevronRight,
  CloudSun,
  Database,
  KeyRound,
  MonitorCog,
  RefreshCw,
  RotateCcw,
  Settings2,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";

import {
  useAdminPreferences,
} from "@/hooks/useAdminPreferences";

type ServiceStatus = "idle" | "ok" | "error";

type ServiceCheck = {
  label: string;
  endpoint: string;
  status: ServiceStatus;
  message?: string;
};

const INITIAL_CHECKS: ServiceCheck[] = [
  {
    label: "User Management API",
    endpoint: "/api/admin/users",
    status: "idle",
  },
  {
    label: "Scenario Configuration API",
    endpoint: "/api/admin/scenarios",
    status: "idle",
  },
  {
    label: "Audit History API",
    endpoint: "/api/admin/audit",
    status: "idle",
  },
  {
    label: "Reports API",
    endpoint: "/api/admin/reports",
    status: "idle",
  },
];

const card =
  "rounded-2xl border border-slate-800 bg-[#101f33] p-5 sm:p-6";

function SectionTitle({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Settings2;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400">
        <Icon size={19} />
      </div>

      <div>
        <h2 className="text-base font-semibold text-white">
          {title}
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

function SettingsLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4 transition hover:border-blue-500/40 hover:bg-slate-800/50"
    >
      <div>
        <p className="text-sm font-medium text-white">
          {title}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {description}
        </p>
      </div>
      <ChevronRight
        size={17}
        className="shrink-0 text-slate-500"
      />
    </Link>
  );
}

export default function AdminSettingsPage() {
  const {
    preferences,
    ready,
    updatePreferences,
    resetPreferences,
  } = useAdminPreferences();

  const [checks, setChecks] = useState(INITIAL_CHECKS);
  const [checking, setChecking] = useState(false);
  const [checkedAt, setCheckedAt] = useState<Date | null>(
    null
  );

  const runDiagnostics = async () => {
    if (checking) return;

    setChecking(true);
    setCheckedAt(null);

    const results = await Promise.all(
      INITIAL_CHECKS.map(async (service) => {
        try {
          const controller = new AbortController();
          const timeout = window.setTimeout(
            () => controller.abort(),
            8000
          );

          try {
            const response = await fetch(
              service.endpoint,
              {
                cache: "no-store",
                signal: controller.signal,
              }
            );

            return {
              ...service,
              status: response.ok
                ? ("ok" as const)
                : ("error" as const),
              message: response.ok
                ? "HTTP request successful"
                : `HTTP ${response.status}`,
            };
          } finally {
            window.clearTimeout(timeout);
          }
        } catch (error) {
          return {
            ...service,
            status: "error" as const,
            message:
              error instanceof Error
                ? error.name === "AbortError"
                  ? "Request timed out"
                  : error.message
                : "Request failed",
          };
        }
      })
    );

    setChecks(results);
    setCheckedAt(new Date());
    setChecking(false);
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            System Settings
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Administration preferences and system integration checks.
          </p>
        </div>

        <button
          type="button"
          onClick={resetPreferences}
          disabled={!ready}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm hover:bg-slate-800 disabled:opacity-50"
        >
          <RotateCcw size={16} />
          Reset Preferences
        </button>
      </header>

      {/* Display Preferences */}
      <section className={card}>
        <SectionTitle
          icon={MonitorCog}
          title="Display Preferences"
          description="These preferences are saved in this browser."
        />

        <div className="divide-y divide-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0">
            <div>
              <p className="text-sm font-medium">
                Compact Tables
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Reduce row padding in supported admin tables.
              </p>
            </div>

            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={preferences.compactTables}
                disabled={!ready}
                onChange={(event) =>
                  updatePreferences({
                    compactTables: event.target.checked,
                  })
                }
                aria-label="Compact tables"
              />

              <span className="h-6 w-11 rounded-full bg-slate-700 transition peer-checked:bg-blue-600 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-blue-400 peer-disabled:opacity-50" />
              <span className="pointer-events-none absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 py-4 last:pb-0">
            <div>
              <p className="text-sm font-medium">
                Time Format
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Choose how admin pages display dates and times.
              </p>
            </div>

            <select
              aria-label="Time format"
              value={preferences.timeFormat}
              disabled={!ready}
              onChange={(event) =>
                updatePreferences({
                  timeFormat: event.target.value as
                    | "12h"
                    | "24h",
                })
              }
              className="h-9 w-[130px] rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs outline-none focus:border-blue-500"
            >
              <option value="12h">12-hour</option>
              <option value="24h">24-hour</option>
            </select>
          </div>
        </div>
      </section>

      {/* Configuration shortcuts */}
      <section className={card}>
        <SectionTitle
          icon={Settings2}
          title="Scanner Configuration"
          description="Configure simulation behavior using the existing administration screens."
        />

        <div className="grid gap-3 md:grid-cols-2">
          <SettingsLink
            href="/admin/scenarios"
            title="Simulation Scenarios"
            description="Positive/negative assignments, radiation ranges, video and impression."
          />

          <SettingsLink
            href="/admin/users"
            title="User & OTP Management"
            description="Account access, activation and per-user OTP preferences."
          />
        </div>

        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
          <div className="flex items-center gap-2">
            <CloudSun
              size={17}
              className="text-sky-400"
            />
            <p className="text-sm font-medium">
              Location-Based Weather
            </p>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            The live scanner can obtain outdoor weather for
            the location assigned in each user scenario,
            when the weather endpoint is configured.
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Recommended refresh interval: 5 minutes.
          </p>
        </div>
      </section>

      {/* API diagnostics */}
      <section className={card}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionTitle
            icon={Activity}
            title="API Diagnostics"
            description="Check whether authenticated admin API requests succeed."
          />

          <button
            type="button"
            onClick={() => void runDiagnostics()}
            disabled={checking}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={checking ? "animate-spin" : ""}
            />
            {checking ? "Checking..." : "Run Checks"}
          </button>
        </div>

        <div className="space-y-3">
          {checks.map((service) => (
            <div
              key={service.endpoint}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {service.label}
                </p>
                <p className="mt-1 break-all font-mono text-xs text-slate-500">
                  {service.endpoint}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {service.status === "ok" ? (
                  <CheckCircle2
                    size={18}
                    className="text-emerald-400"
                  />
                ) : service.status === "error" ? (
                  <XCircle
                    size={18}
                    className="text-red-400"
                  />
                ) : (
                  <Database
                    size={18}
                    className="text-slate-500"
                  />
                )}

                <span className="text-xs text-slate-400">
                  {service.status === "idle"
                    ? "Not checked"
                    : service.status === "ok"
                      ? "Reachable"
                      : service.message ?? "Failed"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {checkedAt && (
          <p className="mt-4 text-xs text-slate-500">
            Last checked: {checkedAt.toLocaleString()}
          </p>
        )}

        <p className="mt-3 text-xs text-slate-500">
          These checks verify HTTP responses for the current
          admin session. They are not database, MongoDB,
          or infrastructure health checks.
        </p>
      </section>

      {/* Access and security */}
      <section className={card}>
        <SectionTitle
          icon={ShieldCheck}
          title="Security & Access"
          description="Overview of existing administration responsibilities."
        />

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck
                size={17}
                className="text-emerald-400"
              />
              <p className="text-sm font-medium">
                Admin-Only Reports
              </p>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              PDF generation and retrieval require
              server-side administrator authorization.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
            <div className="flex items-center gap-2">
              <KeyRound
                size={17}
                className="text-blue-400"
              />
              <p className="text-sm font-medium">
                Authentication & OTP
              </p>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Authentication is controlled by the backend.
              User-specific OTP preferences are managed
              from User Management.
            </p>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck size={15} />
        Radioanalysis Administration Settings
      </div>
    </div>
  );
}
