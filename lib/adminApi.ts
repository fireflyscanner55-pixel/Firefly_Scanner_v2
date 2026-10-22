
export class AdminApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  users?: T;
  scenarios?: T;
  reports?: T;
  logs?: T;
  audit?: T;
};

export async function adminRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    cache: "no-store",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType =
    response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    throw new AdminApiError(
      `Unexpected response format from ${endpoint}`,
      response.status
    );
  }

  const payload: ApiEnvelope<T> | T =
    await response.json();

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : `API request failed (${response.status})`;

    throw new AdminApiError(message, response.status);
  }

  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    payload.success === false
  ) {
    throw new AdminApiError(
      ("message" in payload && payload.message) ||
        "Operation failed",
      response.status
    );
  }

  return payload as T;
}

export function extractList<T>(
  payload: unknown,
  keys: string[]
): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid API list response");
  }

  const object = payload as Record<string, unknown>;

  for (const key of [...keys, "data"]) {
    const value = object[key];

    if (Array.isArray(value)) {
      return value as T[];
    }

    if (value && typeof value === "object") {
      for (const nestedKey of [
        "items",
        "results",
        ...keys,
      ]) {
        const nested = (
          value as Record<string, unknown>
        )[nestedKey];

        if (Array.isArray(nested)) {
          return nested as T[];
        }
      }
    }
  }

  throw new Error(
    "Unable to identify list in API response"
  );
}

export function extractRecord<T>(
  payload: unknown
): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    payload.data != null
  ) {
    return payload.data as T;
  }

  return payload as T;
}
