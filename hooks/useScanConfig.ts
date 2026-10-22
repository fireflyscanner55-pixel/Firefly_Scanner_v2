"use client";

import { useEffect, useState } from "react";

import { radioApi } from "@/lib/api/radioanalysis";
import type { ScanConfig } from "@/types/radioanalysis";

interface UseScanConfigResult {
  config: ScanConfig | null;
  isLoading: boolean;
  error: string | null;
}

export function useScanConfig(): UseScanConfigResult {
  const [config, setConfig] = useState<ScanConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await radioApi.getScanConfig();

        if (cancelled) return;

        if (!data) {
          throw new Error("Scan configuration was not found.");
        }

        setConfig(data);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load scan configuration."
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadConfig();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    config,
    isLoading,
    error,
  };
}