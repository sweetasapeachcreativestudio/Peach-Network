import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request:Request){
 const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"Sign in required."},{status:401});
 const admin=createAdminClient(); const {data:profile}=await admin.from("profiles").select("role").eq("id",user.id).single();
 if(profile?.role?.toLowerCase()!=="admin")return NextResponse.json({error:"Admin access required."},{status:403});
 const {menteeId,mentorId,notes}=await request.json(); if(!menteeId)return NextResponse.json({error:"Creative required."},{status:400});
 await admin.from("creative_mentor_assignments").update({ended_at:new Date().toISOString()}).eq("mentee_creative_id",menteeId).is("ended_at",null);
 if(mentorId){
  const {error}=await admin.from("creative_mentor_assignments").insert({mentee_creative_id:menteeId,mentor_creative_id:mentorId,assigned_by:user.id,notes:notes||null});
  if(error)return NextResponse.json({error:error.message},{status:400});
 }
 return NextResponse.json({ok:true});
}