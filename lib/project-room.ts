export function roomStage(status:string) {
  if(['submitted','approved','completed'].includes(status))return 3;
  if(['proof_uploaded','revisions'].includes(status))return 2;
  if(['accepted','in_progress','waiting_on_client'].includes(status))return 1;
  return 0;
}
export function roomStatus(status:string) {
 return ({draft:'Scope review',matching:'Finding your creative',offer_sent:'Awaiting acceptance',accepted:'Kickoff ready',in_progress:'Work in progress',proof_uploaded:'Proof ready',revisions:'Revision in progress',waiting_on_client:'Waiting on you',submitted:'Final delivery ready',approved:'Approved',completed:'Completed',cancelled:'Cancelled',dispute:'Support needed',dispute_review:'Support reviewing'} as Record<string,string>)[status]??status.replaceAll('_',' ');
}
export function briefSections(description:string|null) {
 const blocks=(description??'').split(/\n\s*\n/); const field=(label:string)=>blocks.find(b=>b.toLowerCase().startsWith(label.toLowerCase()+':'))?.slice(label.length+1).trim();
 return {objective:blocks.filter(b=>! /^(Format|Style|Details to print\/use):/i.test(b)).join('\n\n')||'Your project brief is being prepared.',format:field('Format'),style:field('Style'),details:field('Details to print/use')};
}
export type RoomFile={id:string;file_kind:string;original_name:string;mime_type:string|null;note:string|null;created_at:string;size_bytes:number};
export type VaultAsset={id:string;label:string;value:string|null;notes:string|null;storage_path:string|null;original_name:string|null};
