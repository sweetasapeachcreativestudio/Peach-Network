import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request:Request){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) return NextResponse.json({error:"Sign in required."},{status:401});

  const {offerId}=await request.json();
  const admin=createAdminClient();

  const {data:creative}=await admin.from("creatives").select("id").eq("user_id",user.id).eq("application_status","approved").single();
  if(!creative) return NextResponse.json({error:"Approved creative account required."},{status:403});

  const {data:offer}=await admin.from("project_offers")
    .select("id,project_id,creative_id,status,payout_cents,expires_at,projects(id,business_id,coin_amount,status)")
    .eq("id",offerId).eq("creative_id",creative.id).single();

  if(!offer || offer.status!=="sent") return NextResponse.json({error:"Offer is not available."},{status:400});
  if(new Date(offer.expires_at)<=new Date()) return NextResponse.json({error:"This Peach Match has expired."},{status:400});

  const project:any=offer.projects;
  const {error:holdError}=await admin.rpc("peach_hold_project_coins",{
    p_project_id:project.id,p_business_id:project.business_id,p_coins:project.coin_amount
  });
  if(holdError) return NextResponse.json({error:holdError.message},{status:400});

  await admin.from("project_offers").update({status:"accepted",accepted_at:new Date().toISOString()}).eq("id",offer.id);
  await admin.from("projects").update({status:"accepted",assigned_creative_id:creative.id}).eq("id",project.id);

  await admin.from("audit_log").insert({
    actor_user_id:user.id,action:"project_offer_accepted",entity_type:"project",entity_id:project.id,
    metadata:{offer_id:offer.id,coins_held:project.coin_amount,payout_cents:offer.payout_cents}
  });

  return NextResponse.json({ok:true,projectId:project.id});
}
