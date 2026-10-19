import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncFinalsToVault } from "@/lib/project-vault-sync";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request:Request){
  const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:"Sign in required."},{status:401});
  const {projectId}=await request.json();const admin=createAdminClient();
  const {data:project}=await admin.from("projects").select("id,business_id,status").eq("id",projectId).single();
  if(!project)return NextResponse.json({error:"Project not found."},{status:404});
  const {data:business}=await admin.from("businesses").select("owner_user_id").eq("id",project.business_id).single();
  if(business?.owner_user_id!==user.id)return NextResponse.json({error:"Business owner required."},{status:403});
  if(!["proof_uploaded","submitted"].includes(project.status))return NextResponse.json({error:"There is not a proof or final delivery ready for approval yet."},{status:400});
  if(project.status==="submitted") {
    const {data:finals,error:filesError}=await admin.from("project_files").select("id").eq("project_id",projectId).eq("file_kind","final").limit(1);
    if(filesError||!finals?.length)return NextResponse.json({error:"Your creative needs to upload the final delivery first."},{status:409});
  }
  const {data:updated,error}=await admin.from("projects").update({status:"approved"}).eq("id",projectId).eq("status",project.status).select("id").maybeSingle();
  if(error)return NextResponse.json({error:error.message},{status:400});
  if(!updated)return NextResponse.json({error:"The project changed. Refresh before approving."},{status:409});
  await admin.from("project_messages").insert({project_id:projectId,sender_user_id:user.id,message:project.status==="proof_uploaded"?"Proof approved by the business. Creative can prepare final delivery.":"Final delivery approved by the business."});
  let vaultSynced=true;
  if(project.status==="submitted")try{await syncFinalsToVault(projectId,project.business_id)}catch{vaultSynced=false}
  return NextResponse.json({ok:true,vaultSynced});
}
