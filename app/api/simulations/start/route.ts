import { proxyJson } from "@/lib/backend";
export async function POST() { return proxyJson("/api/simulations/start",{method:"POST"}); }
