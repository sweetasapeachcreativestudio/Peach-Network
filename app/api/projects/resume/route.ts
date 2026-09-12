import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request:Request){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) return NextResponse.json({error:"Sign in required."},{status:401});
  const {projectId}=await request.json();
  const admin=createAdminClient();

  const {error}=await admin.rpc("peach_resume_from_client_wait",{
    p_project_id:projectId,p_business_user_id:user.id
  });
  if(error) return NextResponse.json({error:error.message},{status:400});

  await admin.from("project_messages").insert({
    project_id:projectId,sender_user_id:user.id,is_system_event:true,
    body:"Client responded. Project resumed and deadline was extended by the client-wait period."
  });
  return NextResponse.json({ok:true});
}
