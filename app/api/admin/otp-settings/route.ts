import { NextResponse } from "next/server";
import { getAuthSettings, saveAuthSettings } from "@/lib/auth-settings";
import { getCurrentSession } from "@/lib/request-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireSession() {
  const session = await getCurrentSession();
  return session ? null : NextResponse.json({ message: "Unauthorized." }, { status: 401 });
}

export async function GET() {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  return NextResponse.json(await getAuthSettings());
}

export async function PATCH(request: Request) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  try {
    const { otpEnabled } = await request.json();
    if (typeof otpEnabled !== "boolean") {
      return NextResponse.json({ message: "otpEnabled must be a boolean." }, { status: 400 });
    }

    return NextResponse.json(await saveAuthSettings({ otpEnabled }));
  } catch {
    return NextResponse.json({ message: "Unable to update OTP settings." }, { status: 400 });
  }
}
