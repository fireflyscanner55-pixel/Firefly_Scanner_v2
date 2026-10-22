import { NextRequest, NextResponse } from "next/server";
export function proxy(request:NextRequest){
  if (!request.cookies.get("radio_backend_token")?.value) return NextResponse.redirect(new URL("/login",request.url));
  return NextResponse.next();
}
export const config={matcher:["/dashboard/:path*","/scan/:path*","/admin/:path*"]};
