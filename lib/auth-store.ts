import { createHash, randomInt } from "crypto";

type OtpRecord = {
  otpHash: string;
  expiresAt: number;
  attempts: number;
  resendAvailableAt: number;
  challengeHash: string;
};

const otpStore = new Map<string, OtpRecord>();

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 30 * 1000;
const MAX_OTP_ATTEMPTS = 5;

function hashValue(value: string): string {
  return createHash("sha256")
    .update(value)
    .digest("hex");
}

export function generateOtp(): string {
  return randomInt(100000, 1000000).toString();
}

function createStoreKey(
  mobileNumber: string,
  challengeToken: string
): string {
  return `${mobileNumber}:${hashValue(challengeToken)}`;
}

export function canSendOtp(
  mobileNumber: string,
  challengeToken: string
): { allowed: boolean; retryAfter?: number } {
  const key = createStoreKey(mobileNumber, challengeToken);
  const record = otpStore.get(key);

  if (!record) {
    return { allowed: true };
  }

  const remaining = record.resendAvailableAt - Date.now();

  if (remaining > 0) {
    return {
      allowed: false,
      retryAfter: Math.ceil(remaining / 1000),
    };
  }

  return { allowed: true };
}

export function saveOtp(
  mobileNumber: string,
  challengeToken: string,
  otp: string
): void {
  const now = Date.now();
  const key = createStoreKey(mobileNumber, challengeToken);

  otpStore.set(key, {
    otpHash: hashValue(otp),
    challengeHash: hashValue(challengeToken),
    expiresAt: now + OTP_EXPIRY_MS,
    attempts: 0,
    resendAvailableAt: now + OTP_RESEND_COOLDOWN_MS,
  });
}

export type VerifyOtpResult =
  | "success"
  | "not_found"
  | "expired"
  | "too_many_attempts"
  | "invalid";

export function verifyOtp(
  mobileNumber: string,
  challengeToken: string,
  otp: string
): VerifyOtpResult {
  const key = createStoreKey(mobileNumber, challengeToken);
  const record = otpStore.get(key);

  if (!record) {
    return "not_found";
  }

  if (record.challengeHash !== hashValue(challengeToken)) {
    return "not_found";
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    return "expired";
  }

  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    otpStore.delete(key);
    return "too_many_attempts";
  }

  if (record.otpHash !== hashValue(otp)) {
    record.attempts += 1;

    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      otpStore.delete(key);
      return "too_many_attempts";
    }

    return "invalid";
  }

  otpStore.delete(key);

  return "success";
}