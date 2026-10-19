import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const allowedStages=new Set(["concept","designing","proof_ready","final_delivery"]);
const statusForStage:Record<string,string>={concept:"in_progress",designing:"in_progress",proof_ready:"proof_uploaded",final_delivery:"submitted"};

export async function POST(request:Request){
  const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:"Sign in required."},{status:401});
  const body=await request.json();
  if(!body.projectId||!allowedStages.has(body.stage)||!Number.isInteger(body.progress)||!body.note?.trim())return NextResponse.json({error:"Stage, progress and an update note are required."},{status:400});
  const admin=createAdminClient();
  const {data:creative}=await admin.from("creatives").select("id,application_status").eq("user_id",user.id).single();
  if(!creative||creative.application_status!=="approved")return NextResponse.json({error:"Approved creative required."},{status:403});
  const {data:project}=await admin.from("projects").select("id,assigned_creative_id,status").eq("id",body.projectId).single();
  if(!project||project.assigned_creative_id!==creative.id)return NextResponse.json({error:"This project is not assigned to you."},{status:403});

  const {error:updateError}=await admin.from("project_updates").insert({project_id:body.projectId,creative_id:creative.id,progress_percent:body.progress,stage:body.stage,note:body.note.trim()});
  if(updateError)return NextResponse.json({error:updateError.message},{status:400});
  const nextStatus=statusForStage[body.stage]??"in_progress";
  await admin.from("projects").update({status:nextStatus}).eq("id",body.projectId);
  await admin.from("project_messages").insert({project_id:body.projectId,sender_user_id:user.id,message:`Peach check-in · ${body.progress}% · ${body.stage.replaceAll("_"," ")}: ${body.note.trim()}`});
  return NextResponse.json({ok:true});
}
