
import { backendFetch } from "@/lib/backend";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const url = new URL(request.url);
    const download =
      url.searchParams.get("download") === "1";

    const path =
      `/api/admin/reports/${encodeURIComponent(id)}/pdf` +
      (download ? "?download=1" : "");

    const response = await backendFetch(path, {
      method: "GET",
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("PDF backend error:", {
        status: response.status,
        body: errorText,
      });

      return Response.json(
        {
          message: "Unable to generate PDF report",
          details: errorText.slice(0, 500),
        },
        { status: response.status }
      );
    }

    const contentType =
      response.headers.get("content-type") ?? "";

    if (!contentType.includes("application/pdf")) {
      console.error(
        "Unexpected PDF response:",
        contentType
      );

      return Response.json(
        { message: "Backend did not return a PDF" },
        { status: 502 }
      );
    }

    const pdf = await response.arrayBuffer();

    return new Response(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          response.headers.get("content-disposition") ??
          `${download ? "attachment" : "inline"}; filename="radioanalysis-report.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("PDF proxy failed:", error);

    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
