import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

export async function GET(){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) return NextResponse.json({error:"Sign in required."},{status:401});

  const admin=createAdminClient();
  const {data:creative}=await admin.from("creatives")
    .select("stripe_connect_account_id").eq("user_id",user.id).single();

  if(!creative?.stripe_connect_account_id)
    return NextResponse.json({status:"not_started",ready:false});

  const account=await stripe.accounts.retrieve(creative.stripe_connect_account_id);
  const ready=Boolean(account.details_submitted && account.payouts_enabled && account.charges_enabled !== false);

  let status="information_needed";
  if(ready) status="ready";
  else if(account.requirements?.disabled_reason) status="restricted";

  return NextResponse.json({
    status,ready,
    detailsSubmitted:account.details_submitted,
    payoutsEnabled:account.payouts_enabled,
    currentlyDue:account.requirements?.currently_due ?? []
  });
}
