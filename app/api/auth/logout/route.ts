import { NextResponse } from "next/server";
import { backendFetch, TOKEN_COOKIE } from "@/lib/backend";
export async function POST() {
  try {
    const upstream = await backendFetch("/api/auth/logout",{method:"POST"});
    if (!upstream.ok && upstream.status !== 401) return NextResponse.json({success:false,message:"Unable to stop active simulation"},{status:502});
    const response=NextResponse.json({success:true});
    response.cookies.delete(TOKEN_COOKIE);
    response.cookies.delete("auth_session");
    return response;
  } catch { return NextResponse.json({success:false,message:"Backend unavailable; simulation not confirmed stopped"},{status:502}); }
}
