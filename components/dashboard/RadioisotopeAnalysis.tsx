"use client";

import { useEffect, useState } from "react";
import type {
  Isotope,
  UserScenarioIsotope,
} from "@/types/radioanalysis";

interface RadioisotopeAnalysisProps {
  isotope?: Isotope | null;
  isotopes?: UserScenarioIsotope[];
  isLoading: boolean;
  error: string | null;
}

export default function RadioisotopeAnalysis ({
  isotope,
  isotopes,
  isLoading,
  error,
}: RadioisotopeAnalysisProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const entries = isotopes ?? (isotope ? [{
    id: isotope.id,
    name: isotope.name,
    symbol: isotope.symbol,
    energy: isotope.energy,
    description: isotope.description,
    status: isotope.status?.join(", "),
  }] : []);

  useEffect(() => {
    if (entries.length < 2) return;

    const interval = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % entries.length);
    }, 600);

    return () => window.clearInterval(interval);
  }, [entries.length]);

    if (isLoading) {
    return (
      <section className="h-72 w-full overflow-hidden rounded-xl border border-gray-200 bg-white p-6 text-slate-950">
        <h2 className="text-lg font-semibold">
          Radioisotope Analysis
        </h2>

        <p className="mt-4 text-sm text-gray-500">
          Loading isotope analysis...
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="h-72 w-full overflow-hidden rounded-xl border border-gray-200 p-6 text-slate-950">
        <h2 className="text-lg font-semibold">
          Radioisotope Analysis
        </h2>

        <p className="mt-4 text-sm text-red-500">
          {error}
        </p>
      </section>
    );
  }

  if (entries.length === 0) {
    return (
      <section className="h-72 w-full overflow-hidden rounded-xl border border-gray-200 bg-white p-6 text-slate-950">
        <h2 className="text-lg font-semibold">
          Radioisotope Analysis
        </h2>

        <p className="mt-4 text-sm text-gray-500">
          No isotope is currently available.
        </p>
      </section>
    );
  }

  const selectedIndex = activeIndex % entries.length;
  const selectedIsotope = entries[selectedIndex];

  return (
    <section className="h-45 w-full overflow-hidden rounded-xl border border-gray-200 p-6 text-slate-600 dark:text-slate-400">

      <div className="mt-1 flex items-center gap-5" aria-live="polite">

        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-gray-300 text-xl font-semibold">
          {selectedIsotope.symbol ?? "RI"}
        </div>

        <div className="min-w-0">
          <h3 className="line-clamp-2 break-words text-2xl font-semibold">
            {selectedIsotope.name}
          </h3>

          {selectedIsotope.energy && (
            <p className="mt-1 text-sm text-gray-500">
              Energy: {selectedIsotope.energy}
            </p>
          )}
          {selectedIsotope.status && (
            <p className="mt-1 text-sm text-gray-500">
              Status: {selectedIsotope.status}
            </p>
          )}
        </div>

      </div>

      {selectedIsotope.description && (
        <p className="mt-6 text-sm leading-6 text-gray-600">
          {selectedIsotope.description}
        </p>
      )}

      

    </section>
  );
}