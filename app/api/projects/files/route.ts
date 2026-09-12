import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const allowedKinds=new Set(["asset","progress_evidence","proof","revision","final"]);
const MAX_BYTES=25*1024*1024;

export async function POST(request:Request){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) return NextResponse.json({error:"Sign in required."},{status:401});

  const form=await request.formData();
  const file=form.get("file");
  const projectId=String(form.get("projectId")||"");
  const kind=String(form.get("kind")||"progress_evidence");
  const updateId=form.get("updateId") ? String(form.get("updateId")) : null;

  if(!(file instanceof File) || !projectId || !allowedKinds.has(kind))
    return NextResponse.json({error:"Valid file, project and file type are required."},{status:400});
  if(file.size>MAX_BYTES) return NextResponse.json({error:"Files must be 25 MB or smaller."},{status:400});

  // RLS check through the user's client.
  const {data:project}=await supabase.from("projects").select("id").eq("id",projectId).single();
  if(!project) return NextResponse.json({error:"Project access denied."},{status:403});

  const admin=createAdminClient();
  const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,"_");
  const path=`${projectId}/${crypto.randomUUID()}-${safeName}`;
  const bytes=Buffer.from(await file.arrayBuffer());

  const {error:uploadError}=await admin.storage.from("project-files").upload(path,bytes,{
    contentType:file.type||"application/octet-stream",upsert:false
  });
  if(uploadError) return NextResponse.json({error:uploadError.message},{status:500});

  const {data:row,error}=await admin.from("project_files").insert({
    project_id:projectId,uploaded_by:user.id,update_id:updateId,file_kind:kind,
    storage_path:path,original_name:file.name,mime_type:file.type,size_bytes:file.size
  }).select("id").single();

  if(error){
    await admin.storage.from("project-files").remove([path]);
    return NextResponse.json({error:error.message},{status:500});
  }
  return NextResponse.json({ok:true,fileId:row.id});
}
