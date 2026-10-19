import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
export async function POST(request:Request){
 const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)return NextResponse.json({error:"Sign in required."},{status:401});
 const {projectId,requestType,note}=await request.json(); if(!projectId||!note?.trim())return NextResponse.json({error:"Tell the client what you need."},{status:400});
 const admin=createAdminClient(); const {data:c}=await admin.from("creatives").select("id").eq("user_id",user.id).single();
 const {data:p}=await admin.from("projects").select("assigned_creative_id").eq("id",projectId).single();
 if(!c||p?.assigned_creative_id!==c.id)return NextResponse.json({error:"Assigned creative required."},{status:403});
 await admin.from("project_client_requests").insert({project_id:projectId,requested_by:user.id,request_type:requestType||"other",note:note.trim()});
 await admin.from("projects").update({status:"waiting_on_client",waiting_on_client_since:new Date().toISOString()}).eq("id",projectId);
 await admin.from("project_messages").insert({project_id:projectId,sender_user_id:user.id,message:`Client item requested · ${requestType||"Other"}: ${note.trim()}`});
 return NextResponse.json({ok:true});
}
