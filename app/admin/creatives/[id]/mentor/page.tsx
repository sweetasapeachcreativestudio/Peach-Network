import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import MentorPicker from "./mentor-picker";

export default async function MentorPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params; const admin=createAdminClient();
 const {data:mentee}=await admin.from("creatives").select("id,peach_level,primary_specialty,profiles:user_id(full_name,email)").eq("id",id).single();
 if(!mentee)notFound();
 const {data:mentors}=await admin.from("creatives").select("id,peach_level,primary_specialty,city,state,reliability_score,profiles:user_id(full_name,email)").eq("application_status","approved").in("peach_level",["root","blossom"]).neq("id",id).order("reliability_score",{ascending:false});
 const {data:assignment}=await admin.from("creative_mentor_assignments").select("id,mentor_creative_id,assigned_at,notes").eq("mentee_creative_id",id).is("ended_at",null).maybeSingle();
 let completed=0;
 if(assignment){const {count}=await admin.from("projects").select("id",{count:"exact",head:true}).eq("assigned_creative_id",id).eq("status","completed").gte("completed_at",assignment.assigned_at);completed=count??0;}
 return <main className="shell" style={{maxWidth:1000}}><p className="muted">HQ · MENTORSHIP</p><h1>Assign a Peach Mentor</h1><p>Pair <strong>{(mentee as any).profiles?.full_name??"this creative"}</strong> with an approved Peach Blossom or Peach Root mentor.</p>
 {assignment&&<section className="card" style={{marginBottom:18}}><strong>Current mentorship</strong><p className="muted">Together since {new Date(assignment.assigned_at).toLocaleDateString()} · {completed} successfully completed project{completed===1?"":"s"} during this mentorship.</p></section>}
 <MentorPicker menteeId={id} mentors={mentors??[]} currentMentorId={assignment?.mentor_creative_id??null} currentNotes={assignment?.notes??""}/></main>;
}