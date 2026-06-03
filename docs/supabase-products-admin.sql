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

insert into public.products (
  id,
  brand_id,
  brand_en,
  brand_ar,
  name_en,
  name_ar,
  category,
  catalog_group,
  size,
  quantity,
  price,
  original_price,
  pricing_mode,
  is_purchasable,
  image_url,
  description_en,
  description_ar,
  in_stock,
  is_published,
  catalog_order,
  image_type,
  image_fit
)
values
  (
    'ava-200-24',
    'ava',
    'Ava',
    'افا',
    'Ava 200ml - 24 Bottles',
    'افا 200 مل 24 حبة',
    'small',
    '200ml',
    '200ml',
    24,
    null,
    null,
    'quote',
    false,
    '/images/new/افا 200 ملي.png',
    'Ava 200ml water pack with 24 bottles. Ask us for the current price on WhatsApp.',
    'كرتون مياه افا 200 مل بعدد 24 حبة. السعر متاح عند الطلب عبر واتساب.',
    true,
    true,
    46,
    'case',
    'balanced'
  ),
  (
    'oubi-1.5l-12',
    'oubi',
    'Oubi',
    'اوبي',
    'Oubi 1.5L - 12 Bottles',
    'اوبي 1.5 لتر 12 قارورة',
    'large',
    'over-330ml',
    '1.5L',
    12,
    null,
    null,
    'quote',
    false,
    '/images/new/اوبي 1.5 لتر.png',
    'Oubi 1.5L water carton with 12 bottles. Ask us for the current price on WhatsApp.',
    'كرتون مياه اوبي 1.5 لتر بعدد 12 قارورة. السعر متاح عند الطلب عبر واتساب.',
    true,
    true,
    47,
    'case',
    'tight'
  ),
  (
    'oubi-real-600-28',
    'oubi',
    'Oubi',
    'اوبي',
    'Oubi Real 600ml - 28 Bottles',
    'اوبي ريال 600 مل 28 قارورة',
    'medium',
    'over-330ml',
    '600ml',
    28,
    null,
    null,
    'quote',
    false,
    '/images/new/اوبي ريال 600 مل.png',
    'Oubi Real 600ml carton with 28 bottles. Ask us for the current price on WhatsApp.',
    'كرتون مياه اوبي ريال 600 مل بعدد 28 قارورة. السعر متاح عند الطلب عبر واتساب.',
    true,
    true,
    48,
    'case',
    'balanced'
  ),
  (
    'berain-600-28-new',
    'berain',
    'Berain',
    'بيرين',
    'Berain 600ml - 28 Bottles',
    'بيرين 600 مل 28 قارورة',
    'medium',
    'over-330ml',
    '600ml',
    28,
    null,
    null,
    'quote',
    false,
    '/images/new/بيرين 600 ملي_.png',
    'Berain 600ml carton with 28 bottles. Ask us for the current price on WhatsApp.',
    'كرتون مياه بيرين 600 مل بعدد 28 قارورة. السعر متاح عند الطلب عبر واتساب.',
    true,
    true,
    49,
    'case',
    'balanced'
  ),
  (
    'rode-200-48',
    'rode',
    'Rode Water',
    'رود',
    'Rode Water 200ml - 48 Bottles',
    'رود 200 مل 48 حبة',
    'small',
    '200ml',
    '200ml',
    48,
    null,
    null,
    'quote',
    false,
    '/images/new/رود 200 ملي.png',
    'Rode Water 200ml carton with 48 bottles. Ask us for the current price on WhatsApp.',
    'كرتون مياه رود 200 مل بعدد 48 حبة. السعر متاح عند الطلب عبر واتساب.',
    true,
    true,
    50,
    'case',
    'balanced'
  ),
  (
    'rode-330-40',
    'rode',
    'Rode Water',
    'رود',
    'Rode Water 330ml - 40 Bottles',
    'رود 330 مل 40 حبة',
    'small',
    '330ml',
    '330ml',
    40,
    null,
    null,
    'quote',
    false,
    '/images/new/رود 330 ملي.png',
    'Rode Water 330ml carton with 40 bottles. Ask us for the current price on WhatsApp.',
    'كرتون مياه رود 330 مل بعدد 40 حبة. السعر متاح عند الطلب عبر واتساب.',
    true,
    true,
    51,
    'case',
    'balanced'
  ),
  (
    'rode-600-24',
    'rode',
    'Rode Water',
    'رود',
    'Rode Water 600ml - 24 Bottles',
    'رود 600 مل 24 قارورة',
    'medium',
    'over-330ml',
    '600ml',
    24,
    null,
    null,
    'quote',
    false,
    '/images/new/رود 600 ملي_.png',
    'Rode Water 600ml carton with 24 bottles. Ask us for the current price on WhatsApp.',
    'كرتون مياه رود 600 مل بعدد 24 قارورة. السعر متاح عند الطلب عبر واتساب.',
    true,
    true,
    52,
    'case',
    'balanced'
  ),
  (
    'sky-330-40-new',
    'sky',
    'Sky',
    'سكاي',
    'Sky 330ml - 40 Bottles',
    'سكاي 330 مل 40 حبة',
    'small',
    '330ml',
    '330ml',
    40,
    null,
    null,
    'quote',
    false,
    '/images/new/سكاي 330 ملي_.png',
    'Sky 330ml water carton with 40 bottles. Ask us for the current price on WhatsApp.',
    'كرتون مياه سكاي 330 مل بعدد 40 حبة. السعر متاح عند الطلب عبر واتساب.',
    true,
    true,
    53,
    'case',
    'balanced'
  ),
  (
    'safa-5l-4',
    'safa',
    'Safa',
    'صفا',
    'Safa Makkah 5L - 4 Bottles',
    'صفا مكة 5 لتر 4 عبوات',
    'gallon',
    'over-330ml',
    '5L',
    4,
    null,
    null,
    'quote',
    false,
    '/images/new/صفا 5 لتر.png',
    'Safa Makkah 5L carton with 4 large bottles. Ask us for the current price on WhatsApp.',
    'كرتون مياه صفا مكة 5 لتر بعدد 4 عبوات. السعر متاح عند الطلب عبر واتساب.',
    true,
    true,
    54,
    'gallon',
    'tight'
  ),
  (
    'view-200-48',
    'view',
    'View',
    'فيو',
    'View 200ml - 48 Bottles',
    'فيو 200 مل 48 حبة',
    'small',
    '200ml',
    '200ml',
    48,
    null,
    null,
    'quote',
    false,
    '/images/new/فيو 200 ملي_.png',
    'View 200ml water carton with 48 bottles. Ask us for the current price on WhatsApp.',
    'كرتون مياه فيو 200 مل بعدد 48 حبة. السعر متاح عند الطلب عبر واتساب.',
    true,
    true,
    55,
    'case',
    'balanced'
  ),
  (
    'view-330-40',
    'view',
    'View',
    'فيو',
    'View 330ml - 40 Bottles',
    'فيو 330 مل 40 حبة',
    'small',
    '330ml',
    '330ml',
    40,
    null,
    null,
    'quote',
    false,
    '/images/new/فيو 330 ملي_.png',
    'View 330ml water carton with 40 bottles. Ask us for the current price on WhatsApp.',
    'كرتون مياه فيو 330 مل بعدد 40 حبة. السعر متاح عند الطلب عبر واتساب.',
    true,
    true,
    56,
    'case',
    'balanced'
  ),
  (
    'marina-5l-1',
    'marina',
    'Marina',
    'مارينا',
    'Marina 5L - 1 Bottle',
    'مارينا 5 لتر عبوة واحدة',
    'gallon',
    'over-330ml',
    '5L',
    1,
    null,
    null,
    'quote',
    false,
    '/images/new/مارينا 5 لتر_.png',
    'Marina 5L large water bottle. Ask us for the current price on WhatsApp.',
    'عبوة مياه مارينا 5 لتر. السعر متاح عند الطلب عبر واتساب.',
    true,
    true,
    57,
    'gallon',
    'portrait'
  ),
  (
    'nova-5l-1',
    'nova',
    'Nova',
    'نوفا',
    'Nova 5L - 1 Bottle',
    'نوفا 5 لتر عبوة واحدة',
    'gallon',
    'over-330ml',
    '5L',
    1,
    null,
    null,
    'quote',
    false,
    '/images/new/نوفا 5 لتر_.png',
    'Nova 5L large water bottle. Ask us for the current price on WhatsApp.',
    'عبوة مياه نوفا 5 لتر. السعر متاح عند الطلب عبر واتساب.',
    true,
    true,
    58,
    'gallon',
    'portrait'
  ),
  (
    'nova-12l-1',
    'nova',
    'Nova',
    'نوفا',
    'Nova 12L - 1 Bottle',
    'نوفا 12 لتر عبوة واحدة',
    'gallon',
    'over-330ml',
    '12L',
    1,
    null,
    null,
    'quote',
    false,
    '/images/new/نوفا 12 لتر.png',
    'Nova 12L large water bottle. Ask us for the current price on WhatsApp.',
    'عبوة مياه نوفا 12 لتر. السعر متاح عند الطلب عبر واتساب.',
    true,
    true,
    59,
    'gallon',
    'tight'
  ),
  (
    'nova-glass-250-24',
    'nova',
    'Nova',
    'نوفا',
    'Nova Glass 250ml - 24 Bottles',
    'نوفا زجاج 250 مل 24 زجاجة',
    'glass',
    '200ml',
    '250ml',
    24,
    null,
    null,
    'quote',
    false,
    '/images/new/نوفا زجاج 250 ملي_.png',
    'Nova still water in 250ml glass bottles, 24 bottles per carton. Ask us for the current price on WhatsApp.',
    'مياه نوفا زجاج غير فوارة 250 مل بعدد 24 زجاجة. السعر متاح عند الطلب عبر واتساب.',
    true,
    true,
    60,
    'bottle',
    'tight'
  ),
  (
    'nova-glass-750-12',
    'nova',
    'Nova',
    'نوفا',
    'Nova Glass 750ml - 12 Bottles',
    'نوفا زجاج 750 مل 12 زجاجة',
    'glass',
    'over-330ml',
    '750ml',
    12,
    null,
    null,
    'quote',
    false,
    '/images/new/نوفا زجاج 750 ملي_.png',
    'Nova still water in 750ml glass bottles, 12 bottles per carton. Ask us for the current price on WhatsApp.',
    'مياه نوفا زجاج غير فوارة 750 مل بعدد 12 زجاجة. السعر متاح عند الطلب عبر واتساب.',
    true,
    true,
    61,
    'bottle',
    'tight'
  ),
  (
    'nova-sparkling-glass-250-24',
    'nova',
    'Nova',
    'نوفا',
    'Nova Sparkling Glass 250ml - 24 Bottles',
    'نوفا زجاج فوارة 250 مل 24 زجاجة',
    'glass',
    '200ml',
    '250ml',
    24,
    null,
    null,
    'quote',
    false,
    '/images/new/نوفا زجاج فوارة 250 مل.png',
    'Nova sparkling water in 250ml glass bottles, 24 bottles per carton. Ask us for the current price on WhatsApp.',
    'مياه نوفا زجاج فوارة 250 مل بعدد 24 زجاجة. السعر متاح عند الطلب عبر واتساب.',
    true,
    true,
    62,
    'bottle',
    'tight'
  ),
  (
    'nova-sparkling-glass-750-12',
    'nova',
    'Nova',
    'نوفا',
    'Nova Sparkling Glass 750ml - 12 Bottles',
    'نوفا زجاج فوارة 750 مل 12 زجاجة',
    'glass',
    'over-330ml',
    '750ml',
    12,
    null,
    null,
    'quote',
    false,
    '/images/new/نوفا زجاج فوارة 750 مل.png',
    'Nova sparkling water in 750ml glass bottles, 12 bottles per carton. Ask us for the current price on WhatsApp.',
    'مياه نوفا زجاج فوارة 750 مل بعدد 12 زجاجة. السعر متاح عند الطلب عبر واتساب.',
    true,
    true,
    63,
    'bottle',
    'tight'
  )
on conflict (id) do update set
  brand_id = excluded.brand_id,
  brand_en = excluded.brand_en,
  brand_ar = excluded.brand_ar,
  name_en = excluded.name_en,
  name_ar = excluded.name_ar,
  category = excluded.category,
  catalog_group = excluded.catalog_group,
  size = excluded.size,
  quantity = excluded.quantity,
  price = excluded.price,
  original_price = excluded.original_price,
  pricing_mode = excluded.pricing_mode,
  is_purchasable = excluded.is_purchasable,
  image_url = excluded.image_url,
  description_en = excluded.description_en,
  description_ar = excluded.description_ar,
  in_stock = excluded.in_stock,
  is_published = excluded.is_published,
  catalog_order = excluded.catalog_order,
  image_type = excluded.image_type,
  image_fit = excluded.image_fit;
