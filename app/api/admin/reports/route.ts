
import { adminRequest } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

export async function GET() {
  return adminRequest("/api/admin/reports");
}
