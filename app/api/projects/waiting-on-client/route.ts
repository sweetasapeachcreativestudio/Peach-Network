import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request:Request){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) return NextResponse.json({error:"Sign in required."},{status:401});
  const {projectId,note}=await request.json();
  if(!note?.trim()) return NextResponse.json({error:"Explain what you need from the client."},{status:400});

  const admin=createAdminClient();
  const {data:creative}=await admin.from("creatives").select("id").eq("user_id",user.id).single();
  if(!creative) return NextResponse.json({error:"Creative required."},{status:403});

  const {error}=await admin.rpc("peach_set_waiting_on_client",{
    p_project_id:projectId,p_creative_id:creative.id,p_note:note.trim()
  });
  if(error) return NextResponse.json({error:error.message},{status:400});

  await admin.from("project_messages").insert({
    project_id:projectId,sender_user_id:user.id,is_system_event:true,
    body:`Waiting on client: ${note.trim()}`
  });
  return NextResponse.json({ok:true});
}
