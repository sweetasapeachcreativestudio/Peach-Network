import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
export async function POST(request:Request){
 const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)return NextResponse.json({error:"Sign in required."},{status:401});
 const {requestId,projectId}=await request.json(); const admin=createAdminClient();
 const {data:p}=await admin.from("projects").select("business_id").eq("id",projectId).single(); const {data:b}=p?await admin.from("businesses").select("owner_user_id").eq("id",p.business_id).single():{data:null} as any;
 if(b?.owner_user_id!==user.id)return NextResponse.json({error:"Business owner required."},{status:403});
 await admin.from("project_client_requests").update({status:"resolved",resolved_at:new Date().toISOString()}).eq("id",requestId).eq("project_id",projectId);
 const {count}=await admin.from("project_client_requests").select("id",{count:"exact",head:true}).eq("project_id",projectId).eq("status","open");
 if((count??0)===0) await admin.from("projects").update({status:"in_progress",waiting_on_client_since:null}).eq("id",projectId);
 return NextResponse.json({ok:true});
}
