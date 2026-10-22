import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/auth-store";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  verifyChallengeToken,
} from "@/lib/session";
import { formatIndianPhoneNumber } from "@/lib/phone";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_MOCK_API_URL ??
  "http://localhost:3001";


export async function POST(request: Request) {
  try {
    const {
      mobileNumber,
      otp,
      challengeToken,
    } = await request.json();

    if (
      typeof mobileNumber !== "string" ||
      typeof otp !== "string" ||
      typeof challengeToken !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Required authentication information is missing.",
        },
        { status: 400 }
      );
    }

    const formattedMobileNumber = formatIndianPhoneNumber(mobileNumber);
    if (!formattedMobileNumber) {
      return NextResponse.json(
        {
          success: false,
          message:"Please enter a valid 10-digit Indian mobile number.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP must contain exactly 6 digits.",
        },
        { status: 400 }
      );
    }

    const challenge = await verifyChallengeToken(
      challengeToken
    );

    if (!challenge) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your login session has expired. Please sign in again.",
        },
        { status: 401 }
      );
    }

    const verificationResult = verifyOtp(
      formattedMobileNumber,
      challengeToken,
      otp
    );

    const messages = {
      not_found:
        "No active OTP was found. Please request a new OTP.",
      expired:
        "Your OTP has expired. Please request a new OTP.",
      too_many_attempts:
        "Too many invalid attempts. Please request a new OTP.",
      invalid: "Invalid OTP. Please try again.",
    };

    if (verificationResult !== "success") {
      return NextResponse.json(
        {
          success: false,
          message: messages[verificationResult],
        },
        {
          status:
            verificationResult === "too_many_attempts"
              ? 429
              : 401,
        }
      );
    }

    const userResponse = await fetch(
  `${API_BASE_URL}/users?username=${encodeURIComponent(
    challenge.username
  )}`,
  {
    cache: "no-store",
  }
);

const users = await userResponse.json();
const user = users[0];

if (!user || !user.active || !user.otpEnabled) {
  return NextResponse.json(
    {
      success: false,
      message: "OTP authentication is unavailable for this user.",
    },
    { status: 403 }
  );
}

const sessionToken = await createSessionToken({
  username: user.username,
  role: user.role,
  name: user.name,
});

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful.",
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("OTP verification error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to verify OTP.",
      },
      { status: 500 }
    );
  }
}