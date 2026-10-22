
"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  Activity,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  FilterX,
  RefreshCw,
  ScrollText,
  Search,
  Settings2,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useAdminPreferences } from "@/hooks/useAdminPreferences";

type AuditRecord = Record<string, unknown>;

type AuditEvent = {
  id: string;
  action: string;
  actor: string;
  target: string;
  timestamp: string | null;
  category: "user" | "scenario" | "other";
  raw: AuditRecord;
};

type CategoryFilter =
  | "all"
  | "user"
  | "scenario"
  | "other";

const PAGE_SIZE = 10;

const panel =
  "rounded-2xl border border-slate-800 bg-[#101f33]";

const control =
  "h-9 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-slate-200 outline-none focus:border-blue-500";

function readString(
  record: AuditRecord,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = record[key];

    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value;
    }

    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return String(value);
    }
  }

  return undefined;
}

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString();
}

function parseTime(value: string | null) {
  if (!value) return 0;

  const timestamp = new Date(value).getTime();

  return Number.isFinite(timestamp)
    ? timestamp
    : 0;
}

function normalizeEvent(
  record: AuditRecord,
  index: number
): AuditEvent {
  const action =
    readString(
      record,
      "action",
      "event",
      "eventType",
      "type"
    ) ?? "Unknown event";

  // Categories are inferred from action text.
  // They are not assumed to be backend-provided.
  const actionText = action.toLowerCase();

  const category: AuditEvent["category"] =
    /scenario|simulation/.test(actionText)
      ? "scenario"
      : /user|account|otp|login|logout|password/.test(
            actionText
          )
        ? "user"
        : "other";

  return {
    id:
      readString(record, "id", "_id") ??
      `event-${index}`,
    action,
    actor:
      readString(
        record,
        "actor",
        "actorId",
        "adminId",
        "performedBy",
        "userId"
      ) ?? "—",
    target:
      readString(
        record,
        "target",
        "targetId",
        "entityId",
        "resourceId"
      ) ?? "—",
    timestamp:
      readString(
        record,
        "createdAt",
        "timestamp",
        "occurredAt",
        "date"
      ) ?? null,
    category,
    raw: record,
  };
}

function unwrapEvents(payload: unknown): AuditRecord[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (
    !payload ||
    typeof payload !== "object"
  ) {
    throw new Error("Unexpected audit API response");
  }

  const value = payload as AuditRecord;

  for (const key of [
    "logs",
    "audit",
    "events",
    "data",
  ]) {
    if (Array.isArray(value[key])) {
      return value[key] as AuditRecord[];
    }
  }

  // Supports { data: { logs: [...] } }.
  if (
    value.data &&
    typeof value.data === "object"
  ) {
    const nested = value.data as AuditRecord;

    for (const key of [
      "logs",
      "audit",
      "events",
      "items",
    ]) {
      if (Array.isArray(nested[key])) {
        return nested[key] as AuditRecord[];
      }
    }
  }

  throw new Error("Audit response has no event list");
}

function MetricCard({
  label,
  value,
  icon,
  color,
  loading,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  color: string;
  loading: boolean;
}) {
  return (
    <article className={`${panel} p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400">
            {label}
          </p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {loading ? "—" : value}
          </p>
        </div>

        <div
          className={`rounded-xl bg-slate-950 p-2.5 ${color}`}
        >
          {icon}
        </div>
      </div>
    </article>
  );
}

function DetailsDialog({
  event,
  onClose,
}: {
  event: AuditEvent;
  onClose: () => void;
}) {
  const rows = [
    ["Action", event.action],
    ["Category", event.category],
    ["Actor", event.actor],
    ["Target", event.target],
    ["Timestamp", formatDate(event.timestamp)],
    ["Event ID", event.id],
  ];

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-details-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-[#101f33] p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="audit-details-title"
              className="text-xl font-semibold"
            >
              Audit Event Details
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Recorded administration activity
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close event details"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800"
          >
            <X size={19} />
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/50 p-3"
            >
              <p className="text-xs text-slate-500">
                {label}
              </p>
              <p className="mt-1 break-all text-sm text-slate-200">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold">
            Recorded Event Data
          </h3>

          <pre className="max-h-[300px] overflow-auto rounded-xl border border-slate-800 bg-[#07111f] p-4 text-xs leading-relaxed text-slate-300">
            {JSON.stringify(event.raw, null, 2)}
          </pre>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          This displays the data recorded by the backend.
          It does not reconstruct unrecorded changes.
        </p>
      </section>
    </div>
  );
}

export default function AdminAuditPage() {

    const { preferences } = useAdminPreferences();

  const [events, setEvents] = useState<
    AuditEvent[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [search, setSearch] = useState("");
  const [category, setCategory] =
    useState<CategoryFilter>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  const [selectedEvent, setSelectedEvent] =
    useState<AuditEvent | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(
          "/api/admin/audit",
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const payload: unknown =
          await response.json();

        if (!response.ok) {
          const message =
            payload &&
            typeof payload === "object" &&
            "message" in payload &&
            typeof payload.message === "string"
              ? payload.message
              : "Unable to load audit logs";

          throw new Error(message);
        }

        const records = unwrapEvents(payload);

        if (controller.signal.aborted) return;

        setEvents(
          records.map((record, index) =>
            normalizeEvent(record, index)
          )
        );

        setError("");
      } catch (cause) {
        if (controller.signal.aborted) return;

        setError(
          cause instanceof Error
            ? cause.message
            : "Unable to load audit logs"
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => controller.abort();
  }, [refreshKey]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    const from = startDate
      ? new Date(`${startDate}T00:00:00`).getTime()
      : null;

    const to = endDate
      ? new Date(`${endDate}T23:59:59.999`).getTime()
      : null;

    return events
      .filter((event) => {
        const matchesSearch =
          !query ||
          [
            event.action,
            event.actor,
            event.target,
            event.id,
          ].some((field) =>
            field.toLowerCase().includes(query)
          );

        const matchesCategory =
          category === "all" ||
          event.category === category;

        const timestamp = parseTime(
          event.timestamp
        );

        const matchesStart =
          from === null ||
          (timestamp > 0 && timestamp >= from);

        const matchesEnd =
          to === null ||
          (timestamp > 0 && timestamp <= to);

        return (
          matchesSearch &&
          matchesCategory &&
          matchesStart &&
          matchesEnd
        );
      })
      .sort(
        (a, b) =>
          parseTime(b.timestamp) -
          parseTime(a.timestamp)
      );
  }, [
    events,
    search,
    category,
    startDate,
    endDate,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE)
  );

  const currentPage = Math.min(
    page,
    totalPages
  );

  const visibleEvents = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const userCount = events.filter(
    (event) => event.category === "user"
  ).length;

  const scenarioCount = events.filter(
    (event) => event.category === "scenario"
  ).length;

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Audit Logs
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Review recorded account and scenario activity.
          </p>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setLoading(true);
            setRefreshKey((key) => key + 1);
          }}
          className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={
              loading ? "animate-spin" : ""
            }
          />
          Refresh
        </button>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      {/* Overview cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Total Events"
          value={events.length}
          loading={loading}
          color="text-blue-400"
          icon={<ScrollText size={20} />}
        />

        <MetricCard
          label="User Events"
          value={userCount}
          loading={loading}
          color="text-emerald-400"
          icon={<Users size={20} />}
        />

        <MetricCard
          label="Scenario Events"
          value={scenarioCount}
          loading={loading}
          color="text-purple-400"
          icon={<Settings2 size={20} />}
        />
      </section>

      {/* Audit table */}
      <section className={`${panel} overflow-hidden`}>
        {/* Compact toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 p-4">
          <div className="relative min-w-[180px] flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search activity..."
              className={`${control} w-full pl-9`}
            />
          </div>

          <select
            aria-label="Filter event category"
            className={`${control} w-[118px]`}
            value={category}
            onChange={(event) => {
              setCategory(
                event.target.value as CategoryFilter
              );
              setPage(1);
            }}
          >
            <option value="all">All Events</option>
            <option value="user">Users</option>
            <option value="scenario">Scenarios</option>
            <option value="other">Other</option>
          </select>

          <div className="relative">
            <CalendarDays
              size={13}
              className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="date"
              aria-label="Start date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => {
                setStartDate(event.target.value);
                setPage(1);
              }}
              className={`${control} w-[145px] pl-7`}
            />
          </div>

          <div className="relative">
            <CalendarDays
              size={13}
              className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="date"
              aria-label="End date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => {
                setEndDate(event.target.value);
                setPage(1);
              }}
              className={`${control} w-[145px] pl-7`}
            />
          </div>

          <button
            type="button"
            onClick={clearFilters}
            title="Clear filters"
            aria-label="Clear filters"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800"
          >
            <FilterX size={16} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-800/50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-4">
                  Activity
                </th>
                <th className="px-5 py-4">
                  Actor
                </th>
                <th className="px-5 py-4">
                  Target
                </th>
                <th className="px-5 py-4">
                  Timestamp
                </th>
                <th className="px-5 py-4 text-right">
                  Details
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-slate-400"
                  >
                    Loading audit history...
                  </td>
                </tr>
              ) : visibleEvents.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-slate-400"
                  >
                    No matching audit events.
                  </td>
                </tr>
              ) : (
                visibleEvents.map((event) => (
                  <tr
                    key={event.id}
                    className="hover:bg-slate-800/30"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                            event.category === "scenario"
                              ? "bg-purple-500/10 text-purple-400"
                              : event.category === "user"
                                ? "bg-blue-500/10 text-blue-400"
                                : "bg-slate-700/50 text-slate-400"
                          }`}
                        >
                          {event.category === "scenario" ? (
                            <Settings2 size={16} />
                          ) : event.category === "user" ? (
                            <Users size={16} />
                          ) : (
                            <Activity size={16} />
                          )}
                        </div>

                        <div>
                          <p className="font-medium text-slate-200">
                            {event.action}
                          </p>
                          <p className="mt-1 text-xs capitalize text-slate-500">
                            {event.category} event
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="max-w-[180px] truncate px-5 py-4 text-slate-400">
                      {event.actor}
                    </td>

                    <td className="max-w-[180px] truncate px-5 py-4 text-slate-400">
                      {event.target}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-400">
                      {formatDate(event.timestamp)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedEvent(event)
                        }
                        aria-label={`View details for ${event.action}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-blue-400 hover:bg-slate-800"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 px-5 py-4">
          <p className="text-xs text-slate-400">
            {filtered.length} matching events
            {" · "}
            Page {currentPage} of {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() =>
                setPage((value) =>
                  Math.max(1, value - 1)
                )
              }
              aria-label="Previous page"
              className="rounded-lg border border-slate-700 p-2 disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setPage((value) =>
                  Math.min(totalPages, value + 1)
                )
              }
              aria-label="Next page"
              className="rounded-lg border border-slate-700 p-2 disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </footer>
      </section>

      {/* Note */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck size={14} />
        Audit records are read-only.
      </div>

      {selectedEvent && (
        <DetailsDialog
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
