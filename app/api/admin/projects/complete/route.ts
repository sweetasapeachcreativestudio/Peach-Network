import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request:Request){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) return NextResponse.json({error:"Sign in required."},{status:401});

  const {data:profile}=await supabase.from("profiles").select("role").eq("id",user.id).single();
  if(profile?.role!=="admin") return NextResponse.json({error:"Admin required."},{status:403});

  const {projectId}=await request.json();
  const admin=createAdminClient();

  const {data:project}=await admin.from("projects")
    .select("id,business_id,assigned_creative_id,coin_amount,status")
    .eq("id",projectId).single();

  if(!project?.assigned_creative_id) return NextResponse.json({error:"Assigned creative required."},{status:400});

  const {data:offer}=await admin.from("project_offers")
    .select("payout_cents").eq("project_id",project.id).eq("creative_id",project.assigned_creative_id)
    .eq("status","accepted").single();

  if(!offer) return NextResponse.json({error:"Accepted payout agreement not found."},{status:400});

  const {data:payoutId,error}=await admin.rpc("peach_complete_project",{
    p_project_id:project.id,p_business_id:project.business_id,p_creative_id:project.assigned_creative_id,
    p_coins:project.coin_amount,p_payout_cents:offer.payout_cents,p_admin_user_id:user.id
  });
  if(error) return NextResponse.json({error:error.message},{status:400});

  await admin.from("audit_log").insert({
    actor_user_id:user.id,action:"project_completed_payout_created",entity_type:"project",entity_id:project.id,
    metadata:{payout_id:payoutId,payout_cents:offer.payout_cents,coins_spent:project.coin_amount}
  });

  return NextResponse.json({ok:true,payoutId});
}
