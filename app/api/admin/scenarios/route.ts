import {backendFetch} from "@/lib/backend";
import {adminRequest,body,badBody} from "@/lib/admin-proxy";
export async function GET(request:Request){
 try { const upstream=await backendFetch("/api/admin/scenarios");const payload=await upstream.json().catch(()=>null);
 if(!upstream.ok)return Response.json({success:false,message:payload?.message??"Unable to get scenarios"},{status:upstream.status});
 const userId=new URL(request.url).searchParams.get("userId");
 const scenarios=Array.isArray(payload)?payload:[];
 return Response.json({success:true,data:userId ? scenarios.find((s:{userId:string})=>s.userId===userId)??null : scenarios});
 }catch{return Response.json({success:false,message:"Backend unavailable"},{status:502});}
}
export async function POST(request:Request){const data=await body(request);if(!data||typeof data.userId!=="string")return badBody();const {id,userId,updatedAt,createdAt,_id,__v,...config}=data;return adminRequest(`/api/admin/scenarios/${encodeURIComponent(userId)}`,{method:"PUT",body:JSON.stringify(config)});}
