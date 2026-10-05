import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {createAdminClient} from '@/lib/supabase/admin';
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'Sign in required.'},{status:401});const admin=createAdminClient();
 const {data:file}=await admin.from('project_files').select('id,project_id,storage_path,original_name,file_kind,mime_type').eq('id',id).single();if(!file)return NextResponse.json({error:'File not found.'},{status:404});
 const {data:p}=await admin.from('projects').select('business_id,assigned_creative_id,status').eq('id',file.project_id).single();const {data:profile}=await admin.from('profiles').select('role').eq('id',user.id).single();let allowed=profile?.role==='admin',owner=false;
 if(p){const {data:b}=await admin.from('businesses').select('owner_user_id').eq('id',p.business_id).single();owner=b?.owner_user_id===user.id;allowed=allowed||owner;if(!allowed&&p.assigned_creative_id){const {data:c}=await admin.from('creatives').select('user_id').eq('id',p.assigned_creative_id).single();allowed=c?.user_id===user.id}}
 if(!allowed)return NextResponse.json({error:'Access denied.'},{status:403});if(owner&&profile?.role!=='admin'&&file.file_kind==='final'&&!['approved','completed'].includes(p?.status??''))return NextResponse.json({error:'Final downloads unlock after delivery approval.'},{status:409});
 const preview=new URL(request.url).searchParams.get('preview')==='1';if(preview&&!['application/pdf','image/png','image/jpeg','image/webp'].includes(file.mime_type??''))return NextResponse.json({url:null,downloadOnly:true});
 const {data,error}=await admin.storage.from('project-files').createSignedUrl(file.storage_path,90,preview?undefined:{download:file.original_name});if(error||!data?.signedUrl)return NextResponse.json({error:'Could not create secure download.'},{status:500});return preview?NextResponse.json({url:data.signedUrl}):NextResponse.redirect(data.signedUrl);
}
