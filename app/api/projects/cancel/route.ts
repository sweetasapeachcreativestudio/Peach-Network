import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request:Request){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) return NextResponse.json({error:"Sign in required."},{status:401});
  const {projectId}=await request.json();
  const admin=createAdminClient();

  const {data:project}=await admin.from("projects").select("id,business_id,coin_amount,status").eq("id",projectId).single();
  if(!project) return NextResponse.json({error:"Project not found."},{status:404});

  const {data:business}=await admin.from("businesses").select("owner_user_id").eq("id",project.business_id).single();
  const {data:profile}=await admin.from("profiles").select("role").eq("id",user.id).single();
  if(business?.owner_user_id!==user.id && profile?.role!=="admin")
    return NextResponse.json({error:"Not authorized."},{status:403});

  const heldStatuses=["accepted","in_progress","waiting_on_client","proof_uploaded","revisions","submitted"];
  if(heldStatuses.includes(project.status)){
    // Once work may have begun, don't auto-refund. Send to Peach review.
    await admin.from("projects").update({status:"cancel_requested"}).eq("id",project.id);
    return NextResponse.json({ok:true,reviewRequired:true});
  }

  await admin.from("projects").update({status:"cancelled"}).eq("id",project.id);
  return NextResponse.json({ok:true,reviewRequired:false});
}
