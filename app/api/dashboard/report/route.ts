import { testResults } from "@/data/dashboard-data";
import { getCurrentSession } from "@/lib/request-auth";

export const dynamic = "force-dynamic";

function escapePdf(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function createReportPdf() {
  const reportDate = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());
  const lines = [
    "Radiological Analysis Dashboard",
    `Report generated: ${reportDate}`,
    "",
    "Measurement                                      Value",
    ...testResults.map((result) => `${result.physical.padEnd(48)} ${result.data}`),
    "",
    "This report contains the values currently displayed in the dashboard.",
  ];

  const content = lines
    .map((line, index) => `BT /F1 ${index === 0 ? 18 : 10} Tf 54 ${780 - index * 24} Td (${escapePdf(line)}) Tj ET`)
    .join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${new TextEncoder().encode(content).length} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(new TextEncoder().encode(pdf).length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = new TextEncoder().encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}

export async function GET() {
  if (!(await getCurrentSession())) return new Response("Unauthorized", { status: 401 });

  return new Response(createReportPdf(), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="radiological-analysis-report.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
