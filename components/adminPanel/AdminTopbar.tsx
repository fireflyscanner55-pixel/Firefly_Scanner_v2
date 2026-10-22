
"use client";

import { usePathname } from "next/navigation";
import {
  Menu,
  ShieldCheck,
} from "lucide-react";

type AdminTopbarProps = {
  onMenuClick: () => void;
};

const pageNames: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/users": "User Management",
  "/admin/scenarios": "Scenario Configuration",
  "/admin/reports": "Simulation Reports",
  "/admin/audit": "Audit Logs",
  "/admin/settings": "System Settings",
};

export default function AdminTopbar({
  onMenuClick,
}: AdminTopbarProps) {
  const pathname = usePathname();

  const currentTitle =
    pageNames[pathname] ??
    "Administration";

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-slate-800 bg-[#0a1729]/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 lg:hidden"
        >
          <Menu size={21} />
        </button>

        <div className="min-w-0">
          <p className="text-xs text-slate-500">
            Administration / Radioanalysis
          </p>
          <h2 className="truncate text-base font-semibold text-white sm:text-lg">
            {currentTitle}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-3 py-2 text-xs text-slate-300 sm:flex">
          <ShieldCheck
            size={15}
            className="text-emerald-400"
          />
          Admin Console
        </div>

        <div
          className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-500/30 bg-blue-600/20 text-sm font-bold text-blue-300"
          aria-label="Administrator"
        >
          A
        </div>
      </div>
    </header>
  );
}
