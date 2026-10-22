import { cookies } from "next/headers";
export const backendUrl = process.env.BACKEND_API_URL ?? "http://localhost:5000";
export const TOKEN_COOKIE = "radio_backend_token";
export async function backendFetch(path: string, init: RequestInit = {}) {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  return fetch(`${backendUrl}${path}`, {
    ...init, cache: "no-store",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers },
  });
}
export async function proxyJson(path: string, init: RequestInit = {}) {
  try {
    const r = await backendFetch(path, init);
    const data = await r.json().catch(() => ({ message: "Unexpected backend response" }));
    return Response.json(data, { status: r.status });
  } catch {
    return Response.json({ message: "Backend unavailable" }, { status: 502 });
  }
}
