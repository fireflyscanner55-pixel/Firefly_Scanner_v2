
import {
  adminRequest,
  body,
  badBody,
} from "@/lib/admin-proxy";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(
  request: Request,
  context: RouteContext
) {
  const { id } = await context.params;

  const data = await body(request);

  if (!data) {
    return badBody();
  }

  return adminRequest(
    `/api/admin/scenarios/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}
