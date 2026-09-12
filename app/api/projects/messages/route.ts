import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request:Request){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"Sign in required."},{status:401});
  const {projectId,body}=await request.json();
  if(!projectId||!body?.trim())return NextResponse.json({error:"Message cannot be empty."},{status:400});

  const admin=createAdminClient();
  const {data:project}=await admin.from("projects").select("id,business_id,assigned_creative_id").eq("id",projectId).single();
  if(!project)return NextResponse.json({error:"Project not found."},{status:404});
  const {data:profile}=await admin.from("profiles").select("role").eq("id",user.id).single();
  let allowed=profile?.role==="admin";
  if(!allowed){
    const {data:business}=await admin.from("businesses").select("owner_user_id").eq("id",project.business_id).single();
    allowed=business?.owner_user_id===user.id;
  }
  if(!allowed&&project.assigned_creative_id){
    const {data:creative}=await admin.from("creatives").select("user_id").eq("id",project.assigned_creative_id).single();
    allowed=creative?.user_id===user.id;
  }
  if(!allowed)return NextResponse.json({error:"You are not part of this project."},{status:403});

  const {error}=await admin.from("project_messages").insert({project_id:projectId,sender_user_id:user.id,message:body.trim()});
  if(error)return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({ok:true});
}
