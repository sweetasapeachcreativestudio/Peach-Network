import 'server-only';
import {createAdminClient} from '@/lib/supabase/admin';
export async function syncFinalsToVault(projectId:string,businessId:string){
 const admin=createAdminClient();const {data:files,error}=await admin.from('project_files').select('id,storage_path,original_name,size_bytes').eq('project_id',projectId).eq('file_kind','final');if(error)throw Error('Could not load final files.');
 let count=0;
 for(const file of files??[]){const name=file.original_name.replace(/[^a-zA-Z0-9._-]/g,'_').slice(-150),directory=`${businessId}/deliveries/${projectId}`,path=`${directory}/${file.id}-${name}`;
 const {data:existing,error:lookupError}=await admin.from('business_brand_assets').select('id').eq('business_id',businessId).eq('storage_path',path).maybeSingle();if(lookupError)throw Error('Could not check your Brand Vault.');if(existing){count++;continue}
 const {data:objects,error:listError}=await admin.storage.from('brand-vault').list(directory,{search:`${file.id}-${name}`});if(listError)throw Error('Could not access your Brand Vault.');
 if(!objects?.some(o=>o.name===`${file.id}-${name}`)){const {error:copyError}=await admin.storage.from('project-files').copy(file.storage_path,path,{destinationBucket:'brand-vault'});if(copyError)throw Error('Could not save a final file to Brand Vault. Please retry.');}
 const {error:saveError}=await admin.from('business_brand_assets').upsert({business_id:businessId,kind:'other',label:file.original_name.slice(0,120),storage_path:path,original_name:file.original_name,size_bytes:file.size_bytes,notes:`Approved final delivery · Project ${projectId}`},{onConflict:'storage_path',ignoreDuplicates:true});if(saveError)throw Error('Could not save final asset details. Please retry.');count++;
 }
 return count;
}
