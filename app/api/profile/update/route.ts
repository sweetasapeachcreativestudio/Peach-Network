import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const splitList=(value:unknown)=>String(value??"").split(",").map(v=>v.trim()).filter(Boolean).slice(0,12);

export async function POST(request:Request){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) return NextResponse.json({error:"Sign in required."},{status:401});
  const body=await request.json();
  const admin=createAdminClient();
  const {data:profile}=await admin.from("profiles").select("role").eq("id",user.id).single();
  if(!profile) return NextResponse.json({error:"Profile not found."},{status:404});

  await admin.from("profiles").update({
    full_name:String(body.fullName??"").trim()||null,
    phone:String(body.phone??"").trim()||null,
    avatar_url:String(body.avatarUrl??"").trim()||null,
  }).eq("id",user.id);

  if(profile.role==="business"){
    const {error}=await admin.from("businesses").update({
      name:String(body.businessName??"").trim()||"Peach Business",
      phone:String(body.businessPhone??body.phone??"").trim()||null,
      website:String(body.website??"").trim()||null,
      industry:String(body.industry??"").trim()||null,
      description:String(body.description??"").trim()||null,
      address_line1:String(body.addressLine1??"").trim()||null,
      city:String(body.city??"").trim()||null,
      state:String(body.state??"").trim()||null,
      postal_code:String(body.postalCode??"").trim()||null,
      logo_url:String(body.logoUrl??"").trim()||null,
      preferred_contact:String(body.preferredContact??"").trim()||null,
      common_needs:splitList(body.commonNeeds),
    }).eq("owner_user_id",user.id);
    if(error) return NextResponse.json({error:error.message},{status:400});
  } else if(profile.role==="creative"){
    const {error}=await admin.from("creatives").update({
      primary_specialty:String(body.primarySpecialty??"").trim()||null,
      secondary_specialties:splitList(body.secondarySpecialties),
      tools:splitList(body.tools),
      industries:splitList(body.industries),
      city:String(body.city??"").trim()||null,
      state:String(body.state??"").trim()||null,
      bio:String(body.bio??"").trim()||null,
      education_level:String(body.educationLevel??"").trim()||null,
      education_detail:String(body.educationDetail??"").trim()||null,
      portfolio_url:String(body.portfolioUrl??"").trim()||null,
      availability_text:String(body.availabilityText??"").trim()||null,
      remote_available:Boolean(body.remoteAvailable),
      service_radius_miles:body.serviceRadiusMiles?Number(body.serviceRadiusMiles):null,
      profile_image_url:String(body.avatarUrl??"").trim()||null,
      mentor_name:String(body.mentorName??"").trim()||null,
      mentorship_notes:String(body.mentorshipNotes??"").trim()||null,
    }).eq("user_id",user.id);
    if(error) return NextResponse.json({error:error.message},{status:400});
  }
  return NextResponse.json({ok:true});
}
