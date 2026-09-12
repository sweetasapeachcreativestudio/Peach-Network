import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SERVICE_GUIDE, recommendCoins, requiresManualScope } from "@/lib/project-pricing";

export async function POST(request:Request){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) return NextResponse.json({error:"Sign in required."},{status:401});

  const body=await request.json();
  const serviceKey=body.serviceKey as keyof typeof SERVICE_GUIDE;
  if(!SERVICE_GUIDE[serviceKey]) return NextResponse.json({error:"Choose a valid service."},{status:400});

  const admin=createAdminClient();
  const {data:business}=await admin.from("businesses").select("id").eq("owner_user_id",user.id).single();
  if(!business) return NextResponse.json({error:"Business account required."},{status:403});

  const coins=recommendCoins(serviceKey,body.complexity==="expanded"?"expanded":"standard");

  const {data:project,error}=await admin.from("projects").insert({
    business_id:business.id,
    title:body.title || SERVICE_GUIDE[serviceKey].label,
    category:body.category || "Creative",
    description:body.description || "",
    status: requiresManualScope(coins) ? "draft" : "matching",
    coin_amount:coins,
    due_at:body.dueAt || null,
    revision_rounds:body.revisionRounds ?? 2
  }).select("*").single();

  if(error) return NextResponse.json({error:error.message},{status:500});

  await admin.from("audit_log").insert({
    actor_user_id:user.id,action:"project_created",entity_type:"project",entity_id:project.id,
    metadata:{coins,service_key:serviceKey,manual_scope:requiresManualScope(coins)}
  });

  return NextResponse.json({project,recommendation:SERVICE_GUIDE[serviceKey]});
}
