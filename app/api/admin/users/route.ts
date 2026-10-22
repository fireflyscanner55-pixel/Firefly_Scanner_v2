import {adminRequest,body,badBody} from "@/lib/admin-proxy";
export async function GET(){ const r=await adminRequest("/api/admin/users");return r; }
export async function POST(request:Request){const data=await body(request);if(!data)return badBody();return adminRequest("/api/admin/users",{method:"POST",body:JSON.stringify(data)});}
