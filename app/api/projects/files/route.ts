import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {createAdminClient} from '@/lib/supabase/admin';
const allowedKinds=new Set(['asset','progress_evidence','proof','revision','final']),MAX_BYTES=25*1024*1024;
export async function POST(request:Request){
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'Sign in required.'},{status:401});
 const isJson=request.headers.get('content-type')?.includes('application/json');let body:any,form:FormData|undefined;
 try{if(isJson)body=await request.json();else{form=await request.formData();body={projectId:form.get('projectId'),kind:form.get('kind'),note:form.get('note')}}}catch{return NextResponse.json({error:'Invalid upload request.'},{status:400})}
 const projectId=String(body.projectId||''),kind=String(body.kind||'asset'),note=String(body.note||'').trim().slice(0,2000)||null;if(!projectId||!allowedKinds.has(kind))return NextResponse.json({error:'Valid project and file type required.'},{status:400});
 const admin=createAdminClient();const {data:p}=await admin.from('projects').select('business_id,assigned_creative_id,status').eq('id',projectId).single();if(!p)return NextResponse.json({error:'Project not found.'},{status:404});
 const [{data:profile},{data:b},{data:c}]=await Promise.all([admin.from('profiles').select('role').eq('id',user.id).single(),admin.from('businesses').select('owner_user_id').eq('id',p.business_id).single(),p.assigned_creative_id?admin.from('creatives').select('user_id').eq('id',p.assigned_creative_id).single():Promise.resolve({data:null})]);
 const isAdmin=profile?.role==='admin',isCreative=c?.user_id===user.id;if(!isAdmin&&!isCreative&&b?.owner_user_id!==user.id)return NextResponse.json({error:'Project access denied.'},{status:403});
 if(['completed','cancelled'].includes(p.status))return NextResponse.json({error:'This project is closed to uploads.'},{status:409});if(['proof','final','progress_evidence'].includes(kind)&&!isAdmin&&!isCreative)return NextResponse.json({error:'Only your assigned creative can upload proofs or final delivery.'},{status:403});
 if(kind==='final'&&!['approved','submitted'].includes(p.status))return NextResponse.json({error:'The business must approve the proof before final delivery.'},{status:409});if(kind==='proof'&&!['accepted','in_progress','revisions','proof_uploaded','waiting_on_client'].includes(p.status))return NextResponse.json({error:'This project is not ready for a new proof.'},{status:409});
 let path:string,name:string,mime:string,size:number;
 if(isJson){
  name=String(body.name||'').replace(/[^a-zA-Z0-9._-]/g,'_').slice(-150);if(!name)return NextResponse.json({error:'Choose a file.'},{status:400});
  if(body.action==='upload'){path=`${projectId}/${crypto.randomUUID()}-${name}`;const {data,error}=await admin.storage.from('project-files').createSignedUploadUrl(path);return error||!data?NextResponse.json({error:'Could not prepare upload.'},{status:500}):NextResponse.json({path,token:data.token})}
  path=String(body.path||'');if(!new RegExp(`^${projectId}/[0-9a-f-]{36}-[a-zA-Z0-9._-]+$`).test(path))return NextResponse.json({error:'Invalid file path.'},{status:400});
  const {data:objects,error}=await admin.storage.from('project-files').list(projectId,{search:path.slice(projectId.length+1)});const file=objects?.find(f=>f.name===path.slice(projectId.length+1));if(error||!file)return NextResponse.json({error:'Upload not found.'},{status:400});size=Number(file.metadata?.size??0);mime=String(file.metadata?.mimetype||'application/octet-stream');
  const {data:existing}=await admin.from('project_files').select('id').eq('project_id',projectId).eq('storage_path',path).maybeSingle();if(existing)return NextResponse.json({ok:true,fileId:existing.id});
 }else{
  const file=form?.get('file');if(!(file instanceof File))return NextResponse.json({error:'Choose a file.'},{status:400});if(file.size>MAX_BYTES)return NextResponse.json({error:'Files must be 25 MB or smaller.'},{status:400});
  name=file.name;mime=file.type||'application/octet-stream';size=file.size;path=`${projectId}/${crypto.randomUUID()}-${name.replace(/[^a-zA-Z0-9._-]/g,'_').slice(-150)}`;const {error}=await admin.storage.from('project-files').upload(path,Buffer.from(await file.arrayBuffer()),{contentType:mime,upsert:false});if(error)return NextResponse.json({error:'Could not upload file.'},{status:500});
 }
 if(size>MAX_BYTES)return NextResponse.json({error:'Files must be 25 MB or smaller.'},{status:400});
 const {data:row,error}=await admin.from('project_files').insert({project_id:projectId,uploaded_by:user.id,file_kind:kind,storage_path:path,original_name:name,mime_type:mime,size_bytes:size,note}).select('id').single();if(error){if(!isJson)await admin.storage.from('project-files').remove([path]);return NextResponse.json({error:'Could not save file details.'},{status:500})}
 if(kind==='proof'||kind==='final'){const {error:stateError}=await admin.from('projects').update({status:kind==='proof'?'proof_uploaded':'submitted'}).eq('id',projectId).eq('status',p.status);if(stateError)return NextResponse.json({error:'File saved, but project status could not update. Contact Peach.'},{status:500})}
 await admin.from('project_messages').insert({project_id:projectId,sender_user_id:user.id,message:`${kind==='final'?'Final delivery':kind==='proof'?'Proof uploaded':'File attached'}: ${name}${note?` · ${note}`:''}`});return NextResponse.json({ok:true,fileId:row.id});
}
