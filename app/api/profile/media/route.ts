import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request:Request){
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser();
  if(!user) return NextResponse.json({error:"Sign in required."},{status:401});
  const form=await request.formData(); const file=form.get("file");
  if(!(file instanceof File)) return NextResponse.json({error:"Choose an image first."},{status:400});
  if(!file.type.startsWith("image/")) return NextResponse.json({error:"Profile media must be an image."},{status:400});
  if(file.size>8*1024*1024) return NextResponse.json({error:"Image must be smaller than 8 MB."},{status:400});
  const admin=createAdminClient(); const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,"_");
  const path=`${user.id}/${crypto.randomUUID()}-${safe}`;
  const {error}=await admin.storage.from("profile-media").upload(path,Buffer.from(await file.arrayBuffer()),{contentType:file.type,upsert:false});
  if(error) return NextResponse.json({error:error.message},{status:500});
  const {data}=admin.storage.from("profile-media").getPublicUrl(path);
  return NextResponse.json({ok:true,url:data.publicUrl});
}
