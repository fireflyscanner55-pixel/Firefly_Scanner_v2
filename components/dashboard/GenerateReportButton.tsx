"use client";

import { useState } from "react";

import { radioApi } from "@/lib/api/radioanalysis";
import { generateScanReportPdf } from "@/lib/pdf/generateScanReport";

import type {
  Isotope,
  ScanReport,
  SimulationConfig,
} from "@/types/radioanalysis";

interface GenerateReportButtonProps {
  scenarioId: string;
  scenarioName: string;
  config: SimulationConfig;
  isotope: Isotope | null;
  isotopes?: Isotope[];
}

export default function GenerateReportButton({
  scenarioId,
  scenarioName,
  config,
  isotope,
  isotopes = [],
}: GenerateReportButtonProps) {
  const [isGenerating, setIsGenerating] =
    useState(false);

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);

      const isotopeEntries = (
        isotopes.length ? isotopes : isotope ? [isotope] : []
      ).map((entry) => ({
        name: entry.name,
        symbol: entry.symbol,
        status: entry.status?.join(", ") ?? undefined,
      }));

      
const report: ScanReport = {
  scenarioId,
  scenarioName,

  cpsTarget: config.cps.target,
  doseRateTarget: config.doseRate.target,
  batteryTarget: config.battery.initialLevel,
  temperatureTarget: config.temperature.target,
  pressureTarget: config.pressure.target,

  isotopeName: isotope?.name,
  isotopeStatus:
    isotope?.status?.join(", ") ?? undefined,

  isotopes: isotopeEntries.length
    ? isotopeEntries
    : undefined,

  createdAt: new Date().toISOString(),
};


      const savedReport =
        await radioApi.createScanReport(report);

      generateScanReportPdf(savedReport);
    } catch (error) {
      console.error(
        "Failed to generate scan report:",
        error
      );

      window.alert(
        "Unable to generate the scan report."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGenerateReport}
      disabled={isGenerating}
      className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isGenerating
        ? "Generating Report..."
        : "Generate PDF Report"}
    </button>
  );
}