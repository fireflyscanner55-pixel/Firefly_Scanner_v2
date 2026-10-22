"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardHeader() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout failed; scanner may still be active");

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="flex min-h-12 items-center justify-end">
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="
          text-xs font-medium text-slate-700
          transition-colors
          hover:text-slate-950
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {isLoggingOut ? "Logging out..." : "Logout"}
      </button>
    </header>
  );
}