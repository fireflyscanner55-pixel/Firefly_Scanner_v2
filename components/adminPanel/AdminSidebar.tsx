
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { createPortal } from "react-dom";

import {
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Radiation,
  Settings2,
  Shield,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";

type AdminSidebarProps = {
  open: boolean;
  onClose: () => void;
};

const navigation = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Scenarios",
    href: "/admin/scenarios",
    icon: Settings2,
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: FileText,
  },
  {
    label: "Audit Logs",
    href: "/admin/audit",
    icon: ClipboardList,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: SlidersHorizontal,
  },
];

export default function AdminSidebar({
  open,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const [showLogoutConfirm, setShowLogoutConfirm] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [logoutError, setLogoutError] =
    useState("");

  const [mounted] = useState(
    () => typeof document !== "undefined"
  );

  function openLogoutDialog() {
    setLogoutError("");
    setShowLogoutConfirm(true);
  }

  function closeLogoutDialog() {
    if (loggingOut) return;

    setLogoutError("");
    setShowLogoutConfirm(false);
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setLogoutError("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
      });

      const result = await response
        .json()
        .catch(() => null);

      if (!response.ok || result?.success !== true) {
        throw new Error(
          result?.message ??
            "Unable to log out. Please try again."
        );
      }

      // Full navigation resets client-side state.
      window.location.replace("/login");
    } catch (error) {
      setLogoutError(
        error instanceof Error
          ? error.message
          : "Logout failed. Please try again."
      );

      setLoggingOut(false);
    }
  }

  const logoutDialog = showLogoutConfirm ? (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeLogoutDialog();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-logout-title"
        aria-describedby="admin-logout-description"
        className="w-full max-w-sm rounded-2xl border border-slate-700 bg-[#0f1e33] p-6 shadow-2xl"
      >
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
          <LogOut className="h-6 w-6 text-red-400" />
        </div>

        <h2
          id="admin-logout-title"
          className="text-lg font-semibold text-white"
        >
          Log out of Admin Console?
        </h2>

        <p
          id="admin-logout-description"
          className="mt-2 text-sm leading-6 text-slate-400"
        >
          Your administrator session will end and you
          will be redirected to the login page.
        </p>

        {logoutError && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
          >
            {logoutError}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={closeLogoutDialog}
            disabled={loggingOut}
            className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={16} />
            {loggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <aside
        aria-label="Admin navigation"
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col
          border-r border-slate-800 bg-[#0a1729]
          transition-transform duration-200
          lg:translate-x-0
          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Logo */}
        <div className="flex h-[72px] items-center justify-between border-b border-slate-800 px-5">
          <Link
            href="/admin"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400">
              <Radiation size={23} />
            </div>

            <div>
              <p className="text-sm font-bold tracking-wide text-white">
                RIID
              </p>
              <p className="text-[11px] text-slate-400">
                Admin Console
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-4">
          <p className="mb-3 px-3 pt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Management
          </p>

          {navigation.map(
            ({ label, href, icon: Icon }) => {
              const active =
                href === "/admin"
                  ? pathname === href
                  : pathname === href ||
                    pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  aria-current={
                    active ? "page" : undefined
                  }
                  className={`
                    flex items-center gap-3 rounded-xl
                    px-3 py-3 text-sm font-medium transition
                    ${
                      active
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }
                  `}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              );
            }
          )}
        </nav>

        {/* Logout */}
        <div className="border-t border-slate-800 p-4">
          <button
            type="button"
            onClick={openLogoutDialog}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut size={18} />
            <span>Log out</span>
          </button>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 p-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <div className="flex items-center gap-2">
              <Shield
                size={16}
                className="text-blue-400"
              />
              <span className="text-xs font-medium text-white">
                Administration
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Authorized personnel only
            </p>
          </div>
        </div>
      </aside>

      {/* Render modal outside transformed sidebar */}
      {mounted &&
        logoutDialog &&
        createPortal(logoutDialog, document.body)}
    </>
  );
}
