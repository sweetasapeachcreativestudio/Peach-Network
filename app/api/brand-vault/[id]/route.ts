import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canReadBrandVault, BRAND_KINDS } from "@/lib/brand-vault";

type Context = {params:Promise<{id:string}>};
async function assetContext(id: string) {
  const supabase = await createClient();
  const {data:{user}} = await supabase.auth.getUser();
  if (!user) return {error:NextResponse.json({error:"Sign in required."},{status:401})};
  const admin = createAdminClient();
  const {data:asset} = await admin.from("business_brand_assets").select("*").eq("id",id).maybeSingle();
  if (!asset) return {error:NextResponse.json({error:"Asset not found."},{status:404})};
  const {data:business} = await admin.from("businesses").select("owner_user_id").eq("id",asset.business_id).maybeSingle();
  return {user,admin,asset,isOwner:business?.owner_user_id===user.id};
}
export async function GET(request:Request, context:Context) {
  const {id} = await context.params;
  const c = await assetContext(id); if (c.error) return c.error;
  if (!await canReadBrandVault(c.user.id,c.asset.business_id,new URL(request.url).searchParams.get("project"))) return NextResponse.json({error:"Access denied."},{status:403});
  if (!c.asset.storage_path) return NextResponse.json({error:"This asset has no downloadable file."},{status:400});
  const {data,error} = await c.admin.storage.from("brand-vault").createSignedUrl(c.asset.storage_path,60,{download:c.asset.original_name??true});
  if (error || !data) return NextResponse.json({error:"Could not download asset."},{status:500});
  return NextResponse.redirect(data.signedUrl);
}
export async function PATCH(request:Request, context:Context) {
  const c = await assetContext((await context.params).id); if (c.error) return c.error;
  if (!c.isOwner) return NextResponse.json({error:"Only the business owner can edit assets."},{status:403});
  const body = await request.json();
  const label=String(body.label??"").trim().slice(0,120), kind=String(body.kind??""), value=String(body.value??"").trim().slice(0,2000);
  if (!label || !BRAND_KINDS.includes(kind as typeof BRAND_KINDS[number]) || (kind==="color"&&!/^#[0-9a-f]{6}$/i.test(value)) || (!c.asset.storage_path&&!value)) return NextResponse.json({error:"Add a name, valid category and asset details. Colors use six-digit HEX codes."},{status:400});
  const {error} = await c.admin.from("business_brand_assets").update({label,kind,value:value||null,notes:String(body.notes??"").trim().slice(0,2000)||null,updated_at:new Date().toISOString()}).eq("id",c.asset.id).eq("business_id",c.asset.business_id);
  return error?NextResponse.json({error:"Could not update asset."},{status:500}):NextResponse.json({ok:true});
}
export async function DELETE(_request:Request, context:Context) {
  const c = await assetContext((await context.params).id); if (c.error) return c.error;
  if (!c.isOwner) return NextResponse.json({error:"Only the business owner can delete assets."},{status:403});
  if (c.asset.storage_path) {
    const {error} = await c.admin.storage.from("brand-vault").remove([c.asset.storage_path]);
    if (error) return NextResponse.json({error:"Could not remove file. Please try again."},{status:500});
  }
  const {error} = await c.admin.from("business_brand_assets").delete().eq("id",c.asset.id).eq("business_id",c.asset.business_id);
  return error?NextResponse.json({error:"Could not delete asset."},{status:500}):NextResponse.json({ok:true});
}
