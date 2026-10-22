
"use client";

import { useEffect, useState } from "react";

export type AdminPreferences = {
  compactTables: boolean;
  timeFormat: "12h" | "24h";
};

export const DEFAULT_ADMIN_PREFERENCES: AdminPreferences = {
  compactTables: false,
  timeFormat: "12h",
};

const STORAGE_KEY = "radioanalysis_admin_preferences";
const CHANGE_EVENT = "radioanalysis:admin-preferences";

function readPreferences(): AdminPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_ADMIN_PREFERENCES;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ADMIN_PREFERENCES;

    const value = JSON.parse(raw) as Partial<AdminPreferences>;

    return {
      compactTables: value.compactTables === true,
      timeFormat:
        value.timeFormat === "24h" ? "24h" : "12h",
    };
  } catch {
    return DEFAULT_ADMIN_PREFERENCES;
  }
}

export function useAdminPreferences() {
  const [preferences, setPreferences] = useState(
    DEFAULT_ADMIN_PREFERENCES
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setPreferences(readPreferences());
    };

    // Sync after hydration to avoid server/client differences.
    const frame = window.requestAnimationFrame(() => {
      sync();
      setReady(true);
    });

    window.addEventListener("storage", sync);
    window.addEventListener(CHANGE_EVENT, sync);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("storage", sync);
      window.removeEventListener(CHANGE_EVENT, sync);
    };
  }, []);

  const updatePreferences = (
    patch: Partial<AdminPreferences>
  ) => {
    const next = {
      ...readPreferences(),
      ...patch,
    };

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(next)
    );

    setPreferences(next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  const resetPreferences = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setPreferences(DEFAULT_ADMIN_PREFERENCES);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  return {
    preferences,
    ready,
    updatePreferences,
    resetPreferences,
  };
}

export function formatAdminDate(
  value: string | Date | null | undefined,
  timeFormat: "12h" | "24h"
) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: timeFormat === "12h",
  });
}
