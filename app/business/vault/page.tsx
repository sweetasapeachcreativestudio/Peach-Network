import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PeachAppShell } from "../../components/peach-app-shell";
import VaultManager from "./vault-manager";
export default async function BrandVaultPage(){
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/auth?role=business&mode=signin");
 const admin=createAdminClient();const {data:business}=await admin.from("businesses").select("id,name,logo_url").eq("owner_user_id",user.id).maybeSingle();if(!business)redirect("/business");
 const [{data:profile},{data:wallet},{data:assets,error}]=await Promise.all([admin.from("profiles").select("full_name").eq("id",user.id).maybeSingle(),admin.from("coin_wallets").select("available_coins").eq("business_id",business.id).maybeSingle(),admin.from("business_brand_assets").select("id,label,kind,value,notes,original_name,storage_path,size_bytes").eq("business_id",business.id).order("created_at",{ascending:false})]);
 return <PeachAppShell role="business" active="vault" name={profile?.full_name} businessName={business.name} logoUrl={business.logo_url} coinCount={wallet?.available_coins??0}><header style={{marginBottom:24}}><h1 style={{fontSize:30,margin:"0 0 8px"}}>Your Brand Vault</h1><p style={{color:"#69776f",fontSize:14,lineHeight:1.6,margin:0}}>Save it once. Keep every creative on the same page.<br/>Your logos, colors, fonts and reference files stay ready for each project.</p></header>{error?<p role="alert">Your Brand Vault could not load. Please refresh and try again.</p>:<VaultManager assets={assets??[]}/>}</PeachAppShell>;
}
