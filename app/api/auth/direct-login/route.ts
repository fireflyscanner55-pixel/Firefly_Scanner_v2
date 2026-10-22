import { NextResponse } from "next/server";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
} from "@/lib/session";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_MOCK_API_URL ??
  "http://localhost:3001";

export async function POST(request: Request) {
  try {
    const { username } = await request.json();

    if (
      typeof username !== "string" ||
      !username.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Username is required.",
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/users?username=${encodeURIComponent(
        username.trim()
      )}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to access user service.",
        },
        { status: 502 }
      );
    }

    const users = await response.json();
    const user = users[0];

    if (!user || !user.active) {
      return NextResponse.json(
        {
          success: false,
          message: "User account is unavailable.",
        },
        { status: 403 }
      );
    }

    if (user.otpEnabled) {
      return NextResponse.json(
        {
          success: false,
          message:
            "OTP verification is required for this account.",
        },
        { status: 400 }
      );
    }

    const token = await createSessionToken({
      username: user.username,
      role: user.role,
      name: user.name,
    });

    const result = NextResponse.json({
      success: true,
      role: user.role,
      name: user.name,
    });

    result.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    return result;
  } catch (error) {
    console.error("Direct login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to complete login.",
      },
      { status: 500 }
    );
  }
}
