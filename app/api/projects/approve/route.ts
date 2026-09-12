import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request:Request){
  const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:"Sign in required."},{status:401});
  const {projectId}=await request.json();const admin=createAdminClient();
  const {data:project}=await admin.from("projects").select("id,business_id,status").eq("id",projectId).single();
  if(!project)return NextResponse.json({error:"Project not found."},{status:404});
  const {data:business}=await admin.from("businesses").select("owner_user_id").eq("id",project.business_id).single();
  if(business?.owner_user_id!==user.id)return NextResponse.json({error:"Business owner required."},{status:403});
  if(project.status!=="submitted")return NextResponse.json({error:"Final delivery has not been submitted yet."},{status:400});
  const {error}=await admin.from("projects").update({status:"approved"}).eq("id",projectId);
  if(error)return NextResponse.json({error:error.message},{status:400});
  await admin.from("project_messages").insert({project_id:projectId,sender_user_id:user.id,message:"Final delivery approved by the business."});
  return NextResponse.json({ok:true});
}
