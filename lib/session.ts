import { SignJWT, jwtVerify } from "jose";

const secretKey = process.env.AUTH_JWT_SECRET;

if (!secretKey) {
  throw new Error("AUTH_JWT_SECRET is not configured.");
}

const encodedKey = new TextEncoder().encode(secretKey);

export const SESSION_COOKIE_NAME = "auth_session";

export type SessionPayload = {
  username: string;
  role: "admin" | "user";
  name?: string;
};

export type ChallengePayload = {
  username: string;
};

export async function createSessionToken(
  payload: SessionPayload
): Promise<string> {
  return new SignJWT({
    username: payload.username,
    role: payload.role,
    name: payload.name,
    type: "session",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .setSubject(payload.username)
    .sign(encodedKey);
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey);

    if (
      payload.type !== "session" ||
      typeof payload.username !== "string" ||
      (payload.role !== "admin" && payload.role !== "user")
    ) {
      return null;
    }

    return {
      username: payload.username,
      role: payload.role,
      name:
        typeof payload.name === "string"
          ? payload.name
          : undefined,
    };
  } catch {
    return null;
  }
}

export async function createChallengeToken(
  payload: ChallengePayload
): Promise<string> {
  return new SignJWT({
    username: payload.username,
    type: "challenge",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .setSubject(payload.username)
    .sign(encodedKey);
}

export async function verifyChallengeToken(
  token: string
): Promise<ChallengePayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey);

    if (
      payload.type !== "challenge" ||
      typeof payload.username !== "string"
    ) {
      return null;
    }

    return {
      username: payload.username,
    };
  } catch {
    return null;
  }
}