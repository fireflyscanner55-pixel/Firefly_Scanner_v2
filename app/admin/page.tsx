
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  Activity,
  ArrowRight,
  ClipboardList,
  Radiation,
  RefreshCw,
  Settings2,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";

import AdminStatCard from "@/components/adminPanel/AdminStatCard";

import type {
  RadioUser,
  UserScenarioConfig,
} from "@/types/radioanalysis";

type AuditEntry = {
  _id?: string;
  id?: string;
  action?: string;
  createdAt?: string;
  userId?: string;
  targetId?: string;
};

type DashboardData = {
  users: RadioUser[];
  scenarios: UserScenarioConfig[];
  audit: AuditEntry[];
};

const panel =
  "min-w-0 rounded-2xl border border-slate-800 bg-[#101f33] p-5 sm:p-6";

async function requestArray<T>(
  endpoint: string,
  signal: AbortSignal
): Promise<T[]> {
  const response = await fetch(endpoint, {
    cache: "no-store",
    signal,
  });

  const contentType =
    response.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("application/json")) {
    const body = await response.text();

    console.warn(
  `[Admin API] ${endpoint}`,
  {
    status: response.status,
    redirected: response.redirected,
    finalUrl: response.url,
    contentType,
    preview: body.slice(0, 300),
  }
);

    throw new Error(
      `${endpoint} returned ${response.status} (${contentType || "unknown content type"}) instead of JSON. Check API routing or authentication.`
    );
  }

  const payload: unknown = await response.json();

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : `Request failed (${response.status})`;

    throw new Error(`${endpoint}: ${message}`);
  }

  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === "object") {
    const object = payload as Record<string, unknown>;

    for (const key of [
      "data",
      "users",
      "scenarios",
      "audit",
      "logs",
    ]) {
      if (Array.isArray(object[key])) {
        return object[key] as T[];
      }
    }
  }

  throw new Error(
    `${endpoint}: Unexpected JSON response structure`
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData>({
    users: [],
    scenarios: [],
    audit: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const [users, scenarios, audit] = await Promise.all([
          requestArray<RadioUser>(
            "/api/admin/users",
            controller.signal
          ),
          requestArray<UserScenarioConfig>(
            "/api/admin/scenarios",
            controller.signal
          ),
          requestArray<AuditEntry>(
            "/api/admin/audit",
            controller.signal
          ),
        ]);

        if (controller.signal.aborted) return;

        setData({ users, scenarios, audit });
        setLastUpdated(new Date());
        setError("");
      } catch (cause) {
        if (controller.signal.aborted) return;

        setError(
          cause instanceof Error
            ? cause.message
            : "Unable to load dashboard"
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => controller.abort();
  }, [reloadKey]);

  const refresh = useCallback(() => {
    setLoading(true);
    setReloadKey((previous) => previous + 1);
  }, []);

  const stats = useMemo(() => {
    const regularUsers = data.users.filter(
      (user) => user.role === "user"
    );

    return {
      totalUsers: regularUsers.length,
      activeUsers: regularUsers.filter(
        (user) => user.active
      ).length,
      positive: data.scenarios.filter(
        (scenario) =>
          scenario.enabled &&
          scenario.scenarioType === "positive"
      ).length,
      negative: data.scenarios.filter(
        (scenario) =>
          scenario.enabled &&
          scenario.scenarioType === "negative"
      ).length,
      configured: data.scenarios.length,
    };
  }, [data]);

  const totalEnabled = stats.positive + stats.negative;
  const positivePct =
    totalEnabled > 0
      ? (stats.positive / totalEnabled) * 100
      : 0;

  const recentAudit = useMemo(
    () =>
      [...data.audit]
        .sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime()
        )
        .slice(0, 5),
    [data.audit]
  );

  return (
    <div className="space-y-6">
      {/* Dashboard heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Dashboard Overview
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Manage users, scenario assignments and audit activity.
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-300"
        >
          {error}
          <p className="mt-1 text-xs text-red-300/70">
            Check your authenticated admin API connection.
          </p>
        </div>
      )}

      {/* Statistics */}
      <section
        aria-label="Administration statistics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <AdminStatCard
          title="Total Users"
          value={stats.totalUsers}
          description="Registered scanner user accounts"
          icon={Users}
          accent="blue"
          loading={loading}
        />

        <AdminStatCard
          title="Active Users"
          value={stats.activeUsers}
          description="Enabled user accounts"
          icon={UserCheck}
          accent="green"
          loading={loading}
        />

        <AdminStatCard
          title="Positive Scenarios"
          value={stats.positive}
          description="Enabled positive assignments"
          icon={Radiation}
          accent="amber"
          loading={loading}
        />

        <AdminStatCard
          title="Negative Scenarios"
          value={stats.negative}
          description="Enabled negative assignments"
          icon={ShieldCheck}
          accent="purple"
          loading={loading}
        />
      </section>

      {/* Scenario distribution and quick actions */}
      <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-5">
        <section className={`${panel} xl:col-span-3`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold">
                Scenario Distribution
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Breakdown of enabled scenario assignments
              </p>
            </div>
            <Settings2
              size={20}
              className="text-slate-500"
            />
          </div>

          <div className="mt-7">
            <div className="mb-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {loading ? "—" : totalEnabled}
              </span>
              <span className="text-xs text-slate-400">
                enabled scenarios
              </span>
            </div>

            <div className="flex h-3 overflow-hidden rounded-full bg-slate-800">
              <div
                className="bg-amber-500 transition-[width]"
                style={{
                  width: `${positivePct}%`,
                }}
              />
              <div
                className="flex-1 bg-purple-500"
                style={{
                  display: totalEnabled > 0 ? "block" : "none",
                }}
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <p className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  Positive
                </p>
                <p className="mt-2 text-xl font-semibold">
                  {stats.positive}
                </p>
              </div>

              <div>
                <p className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                  Negative
                </p>
                <p className="mt-2 text-xl font-semibold">
                  {stats.negative}
                </p>
              </div>
            </div>

            <p className="mt-5 text-xs text-slate-500">
              {stats.configured} total saved scenario records,
              including disabled assignments.
            </p>
          </div>
        </section>

        <section className={`${panel} xl:col-span-2`}>
          <h2 className="text-base font-semibold">
            Quick Actions
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Common administration tasks
          </p>

          <div className="mt-5 space-y-3">
            {[
              {
                title: "Manage Users",
                description: "Create and manage accounts",
                href: "/admin/users",
                icon: Users,
              },
              {
                title: "Configure Scenarios",
                description: "Assign radiation simulations",
                href: "/admin/scenarios",
                icon: Settings2,
              },
              {
                title: "View Audit Logs",
                description: "Review recorded admin actions",
                href: "/admin/audit",
                icon: ClipboardList,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3 transition-colors hover:border-blue-500/40 hover:bg-slate-800/60"
                >
                  <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.description}
                    </p>
                  </div>

                  <ArrowRight
                    size={16}
                    className="text-slate-500"
                  />
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      {/* Recent audit activity */}
      <section className={panel}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">
              Recent Activity
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Latest recorded administration events
            </p>
          </div>

          <Link
            href="/admin/audit"
            className="flex items-center gap-2 text-xs font-medium text-blue-400 hover:text-blue-300"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="h-14 animate-pulse rounded-xl bg-slate-800/60"
              />
            ))}
          </div>
        ) : recentAudit.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-500">
            No audit activity available.
          </p>
        ) : (
          <div className="divide-y divide-slate-800">
            {recentAudit.map((entry, index) => (
              <div
                key={entry.id ?? entry._id ?? index}
                className="flex items-center gap-3 py-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-blue-400">
                  <Activity size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-200">
                    {entry.action ?? "Administration event"}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {entry.targetId ?? entry.userId ?? "System"}
                  </p>
                </div>

                <span className="shrink-0 text-xs text-slate-500">
                  {entry.createdAt
                    ? new Date(entry.createdAt).toLocaleString()
                    : "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
        <span>Radioanalysis Administration</span>
        <span>
          {lastUpdated
            ? `Updated ${lastUpdated.toLocaleTimeString()}`
            : "Waiting for dashboard data"}
        </span>
      </div>
    </div>
  );
}
