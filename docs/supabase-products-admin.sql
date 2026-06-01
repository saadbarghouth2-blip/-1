-- Riq Store products admin setup
-- Run this once in the Supabase SQL editor for the project used by VITE_SUPABASE_URL.

create table if not exists public.product_admins (
  email text primary key,
  created_at timestamptz not null default now(),
  constraint product_admins_email_lowercase check (email = lower(email))
);

insert into public.product_admins (email)
values ('saadsaad50begiseralex6@gmail.com')
on conflict (email) do nothing;

create table if not exists public.products (
  id text primary key,
  brand_id text not null,
  brand_en text not null,
  brand_ar text not null,
  name_en text not null,
  name_ar text not null,
  category text not null check (category in ('small', 'medium', 'large', 'gallon', 'glass', 'offer')),
  catalog_group text not null check (catalog_group in ('200ml', '330ml', 'over-330ml')),
  size text not null,
  quantity integer not null check (quantity > 0),
  price numeric(10, 2),
  original_price numeric(10, 2),
  pricing_mode text not null default 'fixed' check (pricing_mode in ('fixed', 'quote')),
  is_purchasable boolean not null default true,
  image_url text,
  description_en text not null default '',
  description_ar text not null default '',
  in_stock boolean not null default true,
  is_published boolean not null default true,
  catalog_order integer not null default 0,
  image_type text default 'case' check (image_type in ('case', 'offer', 'bottle', 'gallon')),
  image_fit text default 'balanced' check (image_fit in ('relaxed', 'balanced', 'tight', 'portrait')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_public_catalog_idx
  on public.products (is_published, catalog_group, catalog_order);

create or replace function public.is_product_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.product_admins
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

create or replace function public.touch_products_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
before update on public.products
for each row
execute function public.touch_products_updated_at();

alter table public.product_admins enable row level security;
alter table public.products enable row level security;

drop policy if exists "Product admins can read their admin row" on public.product_admins;
create policy "Product admins can read their admin row"
on public.product_admins
for select
to authenticated
using (email = lower(coalesce(auth.jwt() ->> 'email', '')));

drop policy if exists "Anyone can read published products" on public.products;
create policy "Anyone can read published products"
on public.products
for select
to anon, authenticated
using (is_published = true or public.is_product_admin());

drop policy if exists "Product admins can insert products" on public.products;
create policy "Product admins can insert products"
on public.products
for insert
to authenticated
with check (public.is_product_admin());

drop policy if exists "Product admins can update products" on public.products;
create policy "Product admins can update products"
on public.products
for update
to authenticated
using (public.is_product_admin())
with check (public.is_product_admin());

drop policy if exists "Product admins can delete products" on public.products;
create policy "Product admins can delete products"
on public.products
for delete
to authenticated
using (public.is_product_admin());

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Anyone can read product images" on storage.objects;
create policy "Anyone can read product images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'product-images');

drop policy if exists "Product admins can upload product images" on storage.objects;
create policy "Product admins can upload product images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'product-images' and public.is_product_admin());

drop policy if exists "Product admins can update product images" on storage.objects;
create policy "Product admins can update product images"
on storage.objects
for update
to authenticated
using (bucket_id = 'product-images' and public.is_product_admin())
with check (bucket_id = 'product-images' and public.is_product_admin());

drop policy if exists "Product admins can delete product images" on storage.objects;
create policy "Product admins can delete product images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'product-images' and public.is_product_admin());

do $$
begin
  if to_regclass('public.orders') is not null then
    execute 'drop policy if exists "Product admins can read all orders" on public.orders';
    execute 'create policy "Product admins can read all orders" on public.orders for select to authenticated using (public.is_product_admin())';
  end if;

  if to_regclass('public.order_items') is not null then
    execute 'drop policy if exists "Product admins can read all order items" on public.order_items';
    execute 'create policy "Product admins can read all order items" on public.order_items for select to authenticated using (public.is_product_admin())';
  end if;
end $$;
