import { NextResponse } from "next/server";

import {
  canSendOtp,
  generateOtp,
  saveOtp,
} from "@/lib/auth-store";

import { formatIndianPhoneNumber } from "@/lib/phone";

import {
  verifyChallengeToken,
} from "@/lib/session";

import { sendOtpSms } from "@/lib/twilio";

export async function POST(request: Request) {
  try {
    const {
      mobileNumber,
      challengeToken,
    } = await request.json();

    if (
      typeof mobileNumber !== "string" ||
      typeof challengeToken !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication challenge is required.",
        },
        { status: 400 }
      );
    }

    const formattedMobileNumber =
      formatIndianPhoneNumber(mobileNumber);

    if (!formattedMobileNumber) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid 10-digit Indian mobile number.",
        },
        { status: 400 }
      );
    }

    // Verify that username/password authentication
    // was successfully completed.
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

    // Backend resend protection.
    const otpPermission = canSendOtp(
      formattedMobileNumber,
      challengeToken
    );

    if (!otpPermission.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Please wait ${otpPermission.retryAfter} seconds before requesting another OTP.`,
          retryAfter: otpPermission.retryAfter,
        },
        { status: 429 }
      );
    }

    // Generate the OTP.
    const otp = generateOtp();

    // IMPORTANT:
    // We intentionally send the SMS FIRST.
    // If Twilio fails, we do not store an OTP
    // that the user never received.
    await sendOtpSms(
      formattedMobileNumber,
      // otp
    );

    // Store only the HASH after SMS is accepted.
    saveOtp(
      formattedMobileNumber,
      challengeToken,
      otp
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Verification code sent successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Twilio OTP delivery error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to send the verification code. Please try again.",
      },
      { status: 500 }
    );
  }
}