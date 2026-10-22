import {adminRequest,body,badBody} from "@/lib/admin-proxy";
type Context={params:Promise<{id:string}>};
export async function PATCH(request:Request,{params}:Context){const data=await body(request);if(!data)return badBody();const {username,...fields}=data;return adminRequest(`/api/admin/users/${encodeURIComponent((await params).id)}`,{method:"PATCH",body:JSON.stringify(fields)});}
export async function DELETE(_request:Request,{params}:Context){return adminRequest(`/api/admin/users/${encodeURIComponent((await params).id)}`,{method:"DELETE"});}
