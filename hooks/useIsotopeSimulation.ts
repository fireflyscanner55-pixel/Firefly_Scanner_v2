"use client";

import { useEffect, useState } from "react";

import { radioApi } from "@/lib/api/radioanalysis";
import type { Isotope } from "@/types/radioanalysis";

interface UseIsotopeSimulationResult {
  isotopes: Isotope[];
  currentIsotope: Isotope | null;
  isLoading: boolean;
  error: string | null;
}

const ISOTOPE_CHANGE_INTERVAL = 500;

export function useIsotopeSimulation(): UseIsotopeSimulationResult {
  const [isotopes, setIsotopes] = useState<Isotope[]>([]);
  const [currentIsotope, setCurrentIsotope] =
    useState<Isotope | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadIsotopes() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await radioApi.getIsotopes();

        if (cancelled) return;

        if (!data.length) {
          throw new Error("No isotopes are configured.");
        }

        setIsotopes(data);

        const randomIndex = Math.floor(
          Math.random() * data.length
        );

        setCurrentIsotope(data[randomIndex]);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load isotope configuration."
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadIsotopes();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isotopes.length <= 1) return;

    const interval = window.setInterval(() => {
      setCurrentIsotope((previous) => {
        if (!previous) {
          return isotopes[0];
        }

        const available = isotopes.filter(
          (isotope) => isotope.id !== previous.id
        );

        if (!available.length) {
          return previous;
        }

        const randomIndex = Math.floor(
          Math.random() * available.length
        );

        return available[randomIndex];
      });
    }, ISOTOPE_CHANGE_INTERVAL);

    return () => {
      window.clearInterval(interval);
    };
  }, [isotopes]);

  return {
    isotopes,
    currentIsotope,
    isLoading,
    error,
  };
}