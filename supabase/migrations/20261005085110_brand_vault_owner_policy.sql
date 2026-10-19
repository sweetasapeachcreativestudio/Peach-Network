create function public.owns_business_brand_vault(target_business uuid) returns boolean language sql stable security definer set search_path = public as $$ select exists(select 1 from public.businesses where id=target_business and owner_user_id=(select auth.uid())) $$;
revoke all on function public.owns_business_brand_vault(uuid) from public, anon;
grant execute on function public.owns_business_brand_vault(uuid) to authenticated;
drop policy "business owners manage their brand assets" on public.business_brand_assets;
create policy "business owners manage their brand assets" on public.business_brand_assets for all to authenticated using(public.owns_business_brand_vault(business_id)) with check(public.owns_business_brand_vault(business_id));
