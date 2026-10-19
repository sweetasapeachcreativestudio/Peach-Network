import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:"Sign in required."},{status:401});
  const admin=createAdminClient();const {data:profile}=await admin.from("profiles").select("role").eq("id",user.id).single();if(profile?.role!=="admin")return NextResponse.json({error:"Admin access required."},{status:403});
  const body=await request.json();const {projectId,creativeId,payoutCents,matchScore,reasons}=body;
  if(!projectId||!creativeId||!Number.isInteger(payoutCents)||payoutCents<=0)return NextResponse.json({error:"Invalid offer."},{status:400});
  const {data:project}=await admin.from("projects").select("id,status").eq("id",projectId).single();if(!project)return NextResponse.json({error:"Project not found."},{status:404});if(!["matching","offer_sent","draft"].includes(project.status))return NextResponse.json({error:"Project is not open for matching."},{status:400});
  const expiresAt=new Date(Date.now()+72*60*60*1000).toISOString();
  const {data:offer,error}=await admin.from("project_offers").insert({project_id:projectId,creative_id:creativeId,status:"sent",payout_cents:payoutCents,expires_at:expiresAt}).select("id,expires_at").single();
  if(error)return NextResponse.json({error:error.message},{status:400});
  await admin.from("projects").update({status:"offer_sent"}).eq("id",projectId);
  await admin.from("audit_log").insert({actor_user_id:user.id,action:"peach_match_offer_sent",entity_type:"project",entity_id:projectId,metadata:{offer_id:offer.id,creative_id:creativeId,payout_cents:payoutCents,match_score:matchScore??null,reasons:reasons??[],expires_at:expiresAt}});
  return NextResponse.json({ok:true,offer});
}
