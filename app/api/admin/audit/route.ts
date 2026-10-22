
import { adminRequest } from "@/lib/admin-proxy";

export async function GET() {
  return adminRequest("/api/admin/audit");
}
