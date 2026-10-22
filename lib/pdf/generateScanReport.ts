import jsPDF from "jspdf";

import type {
  ScanReport,
} from "@/types/radioanalysis";

export function generateScanReportPdf(
  report: ScanReport
) {
  const pdf = new jsPDF();

  const pageWidth = pdf.internal.pageSize.getWidth();

  let y = 25;

  pdf.setFontSize(20);
  pdf.text(
    "Radiation Analysis Scan Report",
    pageWidth / 2,
    y,
    {
      align: "center",
    }
  );

  y += 18;

  pdf.setFontSize(11);

  pdf.text(
    `Report ID: ${report.id ?? "Pending"}`,
    20,
    y
  );

  y += 8;

  pdf.text(
    `Date: ${new Date(report.createdAt).toLocaleString()}`,
    20,
    y
  );

  y += 15;

  pdf.setFontSize(14);
  pdf.text("Scan Information", 20, y);

  y += 10;

  pdf.setFontSize(11);

  pdf.text(
    `Scenario: ${report.scenarioName}`,
    20,
    y
  );

  y += 8;

  pdf.text(
    `Scenario ID: ${report.scenarioId}`,
    20,
    y
  );

  y += 15;

  pdf.setFontSize(14);
  pdf.text("Configured Target Values", 20, y);

  y += 10;

  pdf.setFontSize(11);

  pdf.text(
    `CPS Target: ${report.cpsTarget} CPS`,
    20,
    y
  );

  y += 8;

  pdf.text(
    `Dose Rate Target: ${report.doseRateTarget} µSv/h`,
    20,
    y
  );

  if (report.isotopeName) {
    y += 15;

    pdf.setFontSize(14);
    pdf.text("Radioisotope Analysis", 20, y);

    y += 10;

    pdf.setFontSize(11);

    pdf.text(
      `Isotope: ${report.isotopeName}`,
      20,
      y
    );

    if (report.isotopeStatus) {
      y += 8;

      pdf.text(
        `Status: ${report.isotopeStatus}`,
        20,
        y
      );
    }
  }

  y += 20;

  pdf.setFontSize(10);

  pdf.text(
    "This report contains configured simulation target values.",
    20,
    y
  );

  y += 6;

  pdf.text(
    "Live dashboard values may fluctuate during the simulation.",
    20,
    y
  );

  pdf.save(
    `radiation-scan-report-${report.createdAt.replace(
      /[:.]/g,
      "-"
    )}.pdf`
  );
}