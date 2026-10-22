import { backendFetch } from "@/lib/backend";
export async function adminRequest(path: string, init: RequestInit = {}) {
  try {
    // The backend independently verifies the authenticated user's admin role.
    const response = await backendFetch(path, init);
    const payload = response.status === 204 ? null : await response.json().catch(() => null);
    if (!response.ok) return Response.json({ success: false, message: payload?.message ?? "Request failed", details: payload?.details }, { status: response.status });
    return Response.json({ success: true, data: payload, ...(Array.isArray(payload) ? {users: payload} : {}) }, { status: response.status === 204 ? 200 : response.status });
  } catch { return Response.json({ success:false, message:"Backend unavailable" }, {status:502}); }
}
export async function body(request:Request): Promise<Record<string,unknown> | null> {
  try { const value:unknown=await request.json(); return value && typeof value==='object' && !Array.isArray(value) ? value as Record<string,unknown> : null; } catch { return null; }
}
export const badBody=()=>Response.json({success:false,message:"Invalid JSON object"},{status:400});
