import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";

export async function POST(request:Request){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"Sign in required."},{status:401});
  const {data:me}=await supabase.from("profiles").select("role").eq("id",user.id).single();
  if(me?.role!=="admin")return NextResponse.json({error:"Admin required."},{status:403});

  const {disputeId,resolutionType,coinsReturned,payoutCents,note}=await request.json();
  if(!["full_refund","partial_refund","creative_paid","split","continue"].includes(resolutionType))
    return NextResponse.json({error:"Invalid resolution."},{status:400});
  if(!Number.isInteger(coinsReturned)||coinsReturned<0||!Number.isInteger(payoutCents)||payoutCents<0||!note?.trim())
    return NextResponse.json({error:"Resolution values and note are required."},{status:400});

  const admin=createAdminClient();
  const {error}=await admin.rpc("peach_resolve_dispute",{
    p_dispute_id:disputeId,p_admin_user_id:user.id,p_resolution_type:resolutionType,
    p_coins_returned:coinsReturned,p_payout_cents:payoutCents,p_resolution_note:note.trim()
  });
  if(error)return NextResponse.json({error:error.message},{status:400});

  await admin.from("audit_log").insert({
    actor_user_id:user.id,action:"dispute_resolved",entity_type:"dispute",entity_id:disputeId,
    metadata:{resolution_type:resolutionType,coins_returned:coinsReturned,payout_cents:payoutCents}
  });
  return NextResponse.json({ok:true});
}
