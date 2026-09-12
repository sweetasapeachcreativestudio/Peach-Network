import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";

export async function POST(request:Request){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"Sign in required."},{status:401});
  const {disputeId,statement}=await request.json();
  if(!statement?.trim())return NextResponse.json({error:"Response is required."},{status:400});

  const admin=createAdminClient();
  const {data:d}=await admin.from("disputes").select("id,project_id,status").eq("id",disputeId).single();
  if(!d||!["open","under_review"].includes(d.status))return NextResponse.json({error:"Dispute is closed."},{status:400});

  const {data:p}=await admin.from("projects").select("business_id,assigned_creative_id").eq("id",d.project_id).single();
  const {data:b}=await admin.from("businesses").select("owner_user_id").eq("id",p?.business_id).single();
  const {data:c}=p?.assigned_creative_id?await admin.from("creatives").select("user_id").eq("id",p.assigned_creative_id).single():{data:null};

  const patch=b?.owner_user_id===user.id?{client_statement:statement.trim(),status:"under_review"}:
              c?.user_id===user.id?{creative_statement:statement.trim(),status:"under_review"}:null;
  if(!patch)return NextResponse.json({error:"Project participant required."},{status:403});

  await admin.from("disputes").update(patch).eq("id",d.id);
  return NextResponse.json({ok:true});
}
