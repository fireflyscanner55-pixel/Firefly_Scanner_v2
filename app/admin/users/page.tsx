
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type SubmitEvent,
} from "react";
import Link from "next/link";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  UserCheck,
  Users,
  UserX,
  X,
} from "lucide-react";

import {
  adminRequest,
  extractList,
} from "@/lib/adminApi";

import { ADMIN_ENDPOINTS } from "@/lib/adminEndpoints";


import type {
  RadioUser,
  UserScenarioConfig,
} from "@/types/radioanalysis";



import { useAdminPreferences } from "@/hooks/useAdminPreferences";

type UserForm = {
  username: string;
  password: string;
  name: string;
  phone: string;
  role: "user" | "admin";
  active: boolean;
  otpEnabled: boolean;
};

type StatusFilter = "all" | "active" | "inactive";
type RoleFilter = "all" | "user" | "admin";

const PAGE_SIZE = 8;

const EMPTY_FORM: UserForm = {
  username: "",
  password: "",
  name: "",
  phone: "",
  role: "user",
  active: true,
  otpEnabled: false,
};


const fieldClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 disabled:opacity-50";

const cardClass =
  "rounded-2xl border border-slate-800 bg-[#101f33]";

async function apiRequest(
  url: string,
  options?: RequestInit
) {
  const response = await fetch(url, {
    cache: "no-store",
    ...options,
  });

  if (response.status === 204) return null;

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ??
        `Request failed (${response.status})`
    );
  }

  return data;
}

function extractArray<T>(
  payload: unknown,
  key: string
): T[] {
  if (Array.isArray(payload)) return payload as T[];

  if (payload && typeof payload === "object") {
    const data = payload as Record<string, unknown>;

    if (Array.isArray(data[key])) {
      return data[key] as T[];
    }

    if (Array.isArray(data.data)) {
      return data.data as T[];
    }
  }

  throw new Error("Unexpected API response format");
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-medium text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function UserModal({
  user,
  onClose,
  onSaved,
}: {
  user: RadioUser | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const editing = Boolean(user);

  const [form, setForm] = useState<UserForm>(() =>
    user
      ? {
          username: user.username,
          password: "",
          name: user.name ?? "",
          phone: user.phone ?? "",
          role: user.role,
          active: user.active,
          otpEnabled: user.otpEnabled,
        }
      : { ...EMPTY_FORM }
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = <K extends keyof UserForm>(
    key: K,
    value: UserForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const save = async (event: SubmitEvent) => {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setError("");

    try {
      const body = editing
        ? {
            name: form.name,
            phone: form.phone,
            role: form.role,
            active: form.active,
            otpEnabled: form.otpEnabled,
            ...(form.password
              ? { password: form.password }
              : {}),
          }
        : form;

      await apiRequest(
        editing
          ? `/api/admin/users/${user!.id}`
          : "/api/admin/users",
        {
          method: editing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      await onSaved();
      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to save user"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-modal-title"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-700 bg-[#101f33] p-6 text-white shadow-2xl"
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2
              id="user-modal-title"
              className="text-xl font-semibold"
            >
              {editing ? "Edit User" : "Create User"}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              {editing
                ? "Update account information and access"
                : "Register a new scanner account"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close dialog"
            className="rounded-lg p-2 hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name">
              <input
                className={fieldClass}
                value={form.name}
                onChange={(e) =>
                  update("name", e.target.value)
                }
                placeholder="Full name"
              />
            </Field>

            <Field label="Phone">
              <input
                className={fieldClass}
                value={form.phone}
                onChange={(e) =>
                  update("phone", e.target.value)
                }
                placeholder="Phone number"
              />
            </Field>
          </div>

          <Field label="Username">
            <input
              className={fieldClass}
              value={form.username}
              onChange={(e) =>
                update("username", e.target.value)
              }
              required
              minLength={1}
              disabled={editing}
              autoComplete="username"
              placeholder="Username"
            />
          </Field>

          <Field
            label={
              editing
                ? "New Password (leave blank to keep current)"
                : "Password"
            }
          >
            <input
              type="password"
              className={fieldClass}
              value={form.password}
              onChange={(e) =>
                update("password", e.target.value)
              }
              required={!editing}
              minLength={8}
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
            />
          </Field>

          <Field label="Account Role">
            <select
              className={fieldClass}
              value={form.role}
              onChange={(e) =>
                update(
                  "role",
                  e.target.value as UserForm["role"]
                )
              }
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </Field>

          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <label className="flex items-center justify-between gap-4">
              <span className="text-sm">Account Active</span>
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) =>
                  update("active", e.target.checked)
                }
                className="h-4 w-4 accent-blue-500"
              />
            </label>

            <div className="border-t border-slate-800" />

            <label className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-sm">
                <KeyRound size={16} />
                Enable OTP
              </span>
              <input
                type="checkbox"
                checked={form.otpEnabled}
                onChange={(e) =>
                  update("otpEnabled", e.target.checked)
                }
                className="h-4 w-4 accent-blue-500"
              />
            </label>

            {form.otpEnabled && (
              <p className="text-xs text-amber-300">
                OTP verification is not yet configured in the
                current backend. Enabling this setting will
                prevent this user from signing in until OTP
                support is implemented.
              </p>
            )}
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editing
                  ? "Save Changes"
                  : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {

  const { preferences } = useAdminPreferences();
  const [users, setUsers] = useState<RadioUser[]>([]);
  const [scenarios, setScenarios] = useState<
    UserScenarioConfig[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] =
    useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] =
    useState<RadioUser | null>(null);
  const [deletingUser, setDeletingUser] =
    useState<RadioUser | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(
    null
  );

  const loadData = useCallback(async () => {
    const [userData, scenarioData] = await Promise.all([
      apiRequest("/api/admin/users"),
      apiRequest("/api/admin/scenarios"),
    ]);

    setUsers(extractArray<RadioUser>(userData, "users"));
    setScenarios(
      extractArray<UserScenarioConfig>(
        scenarioData,
        "scenarios"
      )
    );
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [userData, scenarioData] = await Promise.all([
          apiRequest("/api/admin/users"),
          apiRequest("/api/admin/scenarios"),
        ]);

        if (cancelled) return;

        setUsers(
          extractArray<RadioUser>(userData, "users")
        );
        setScenarios(
          extractArray<UserScenarioConfig>(
            scenarioData,
            "scenarios"
          )
        );
        setError("");
      } catch (cause) {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to load users"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const scenarioMap = useMemo(
    () =>
      new Map(
        scenarios.map((scenario) => [
          String(scenario.userId),
          scenario,
        ])
      ),
    [scenarios]
  );

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesText =
        !q ||
        [user.name, user.username, user.phone]
          .some((value) =>
            String(value ?? "")
              .toLowerCase()
              .includes(q)
          );

      const matchesRole =
        roleFilter === "all" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active"
          ? user.active
          : !user.active);

      return (
        matchesText &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const pagedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const activeCount = users.filter(
    (user) => user.active
  ).length;

  const inactiveCount = users.length - activeCount;

  const openCreate = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const openEdit = (user: RadioUser) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleSaved = async () => {
    await loadData();
    setNotice("User saved successfully.");
  };

  const toggleActive = async (user: RadioUser) => {
    setBusyUserId(user.id);
    setError("");

    try {
      await apiRequest(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          active: !user.active,
        }),
      });

      await loadData();
      setNotice(
        user.active
          ? "User deactivated."
          : "User activated."
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to update user"
      );
    } finally {
      setBusyUserId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;

    const target = deletingUser;
    setBusyUserId(target.id);
    setError("");

    try {
      await apiRequest(`/api/admin/users/${target.id}`, {
        method: "DELETE",
      });

      await loadData();
      setDeletingUser(null);
      setNotice("User deleted successfully.");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to delete user"
      );
    } finally {
      setBusyUserId(null);
    }
  };

  const refresh = () => {
    setLoading(true);
    setRefreshKey((current) => current + 1);
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            User Management
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Manage account access, user roles and scenario assignments.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            aria-label="Refresh users"
            className="rounded-xl border border-slate-700 p-3 hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
          </button>

          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500"
          >
            <Plus size={18} />
            Add User
          </button>
        </div>
      </div>

      {/* Summary */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            name: "Total Accounts",
            value: users.length,
            icon: Users,
            color: "text-blue-400",
          },
          {
            name: "Active Accounts",
            value: activeCount,
            icon: UserCheck,
            color: "text-emerald-400",
          },
          {
            name: "Inactive Accounts",
            value: inactiveCount,
            icon: UserX,
            color: "text-slate-400",
          },
        ].map(({ name, value, icon: Icon, color }) => (
          <article key={name} className={`${cardClass} p-5`}>
            <Icon size={20} className={color} />
            <p className="mt-4 text-sm text-slate-400">
              {name}
            </p>
            <p className="mt-1 text-3xl font-semibold">
              {loading ? "—" : value}
            </p>
          </article>
        ))}
      </section>

      {/* Alerts */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-sm text-emerald-300"
        >
          <Check size={17} />
          {notice}
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
            className="ml-auto"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* User table */}
      <section className={`${cardClass} overflow-hidden`}>
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 p-4 sm:flex-nowrap">
  {/* Search input */}
  <div className="relative min-w-0 flex-[1_1_100%] sm:flex-1">
    <Search
      size={16}
      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
    />

    <input
      type="text"
      value={search}
      onChange={(event) => {
        setSearch(event.target.value);
        setPage(1);
      }}
      placeholder="Search users..."
      className="h-9 w-full rounded-lg border border-slate-700 bg-slate-950 pl-9 pr-3 text-xs text-white outline-none transition-colors placeholder:text-slate-500 focus:border-blue-500"
    />
  </div>

  {/* Role filter */}
  <select
    aria-label="Filter by role"
    value={roleFilter}
    onChange={(event) => {
      setRoleFilter(event.target.value as RoleFilter);
      setPage(1);
    }}
    className="h-9 w-[108px] shrink-0 cursor-pointer rounded-lg border border-slate-700 bg-slate-950 px-2 text-xs text-slate-300 outline-none focus:border-blue-500"
  >
    <option value="all">All Roles</option>
    <option value="user">Users</option>
    <option value="admin">Admins</option>
  </select>

  {/* Status filter */}
  <select
    aria-label="Filter by status"
    value={statusFilter}
    onChange={(event) => {
      setStatusFilter(event.target.value as StatusFilter);
      setPage(1);
    }}
    className="h-9 w-[120px] shrink-0 cursor-pointer rounded-lg border border-slate-700 bg-slate-950 px-2 text-xs text-slate-300 outline-none focus:border-blue-500"
  >
    <option value="all">All Statuses</option>
    <option value="active">Active</option>
    <option value="inactive">Inactive</option>
  </select>
</div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-800/50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">OTP</th>
                <th className="px-5 py-4">Scenario</th>
                <th className="px-5 py-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-slate-400"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : pagedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-slate-400"
                  >
                    No matching users found.
                  </td>
                </tr>
              ) : (
                pagedUsers.map((user) => {
                  const scenario = scenarioMap.get(user.id);

                  return (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-slate-800/30"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/15 font-semibold text-blue-300">
                            {(user.name || user.username)
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="font-medium text-white">
                              {user.name || user.username}
                            </p>
                            <p className="text-xs text-slate-400">
                              @{user.username}
                            </p>
                            {user.phone && (
                              <p className="text-xs text-slate-500">
                                {user.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-slate-300">
                          {user.role === "admin" && (
                            <Shield size={14} />
                          )}
                          {user.role === "admin"
                            ? "Admin"
                            : "User"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs ${
                            user.active
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-slate-700/70 text-slate-400"
                          }`}
                        >
                          {user.active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs">
                        <span
                          className={
                            user.otpEnabled
                              ? "text-amber-400"
                              : "text-slate-500"
                          }
                        >
                          {user.otpEnabled
                            ? "Enabled"
                            : "Disabled"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {user.role === "admin" ? (
                          <span className="text-xs text-slate-500">
                            Not applicable
                          </span>
                        ) : scenario ? (
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs ${
                              !scenario.enabled
                                ? "bg-slate-700 text-slate-300"
                                : scenario.scenarioType === "positive"
                                  ? "bg-amber-500/10 text-amber-400"
                                  : "bg-purple-500/10 text-purple-400"
                            }`}
                          >
                            {!scenario.enabled
                              ? "Disabled"
                              : scenario.scenarioType === "positive"
                                ? "Positive"
                                : "Negative"}
                          </span>
                        ) : (
                          <Link
                            href="/admin/scenarios"
                            className="text-xs text-blue-400 hover:underline"
                          >
                            Assign Scenario
                          </Link>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            aria-label={`Edit ${user.username}`}
                            title="Edit user"
                            onClick={() => openEdit(user)}
                            className="rounded-lg border border-slate-700 p-2 text-blue-400 hover:bg-slate-800"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            disabled={busyUserId === user.id}
                            onClick={() => void toggleActive(user)}
                            title={
                              user.active
                                ? "Deactivate user"
                                : "Activate user"
                            }
                            aria-label={`${user.active ? "Deactivate" : "Activate"} ${user.username}`}
                            className="rounded-lg border border-slate-700 p-2 text-amber-400 hover:bg-slate-800 disabled:opacity-50"
                          >
                            {user.active ? (
                              <UserX size={16} />
                            ) : (
                              <UserCheck size={16} />
                            )}
                          </button>

                          <button
                            type="button"
                            aria-label={`Delete ${user.username}`}
                            title="Delete user"
                            onClick={() => setDeletingUser(user)}
                            className="rounded-lg border border-red-900/50 p-2 text-red-400 hover:bg-red-950/30"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 px-5 py-4">
          <p className="text-xs text-slate-400">
            {filteredUsers.length} matching accounts
            {" · "}
            Page {currentPage} of {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous page"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-700 p-2 disabled:opacity-30"
            >
              <ChevronLeft size={17} />
            </button>

            <button
              type="button"
              aria-label="Next page"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setPage((p) =>
                  Math.min(totalPages, p + 1)
                )
              }
              className="rounded-lg border border-slate-700 p-2 disabled:opacity-30"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {/* Create / Edit dialog */}
      {modalOpen && (
        <UserModal
          user={editingUser}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {/* Delete confirmation */}
      {deletingUser && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="w-full max-w-md rounded-2xl border border-red-900/40 bg-[#101f33] p-6"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
              <Trash2 size={22} />
            </div>

            <h2
              id="delete-title"
              className="text-xl font-semibold"
            >
              Delete User?
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Delete{" "}
              <strong className="text-white">
                @{deletingUser.username}
              </strong>
              ? Their assigned scenario will also be removed.
              This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                disabled={Boolean(busyUserId)}
                className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void confirmDelete()}
                disabled={Boolean(busyUserId)}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium hover:bg-red-500 disabled:opacity-50"
              >
                {busyUserId ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
