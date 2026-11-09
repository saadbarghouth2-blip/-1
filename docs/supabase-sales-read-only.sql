-- Safe, idempotent sales setup for Supabase.
-- Run the whole file once in Supabase SQL Editor.
-- Existing tables and rows are preserved. Missing sales tables are created.

begin;

create extension if not exists "pgcrypto";

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  payment_reference text not null unique,
  source text not null default 'mobile_app',
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  customer_address text,
  customer_notes text,
  customer_lat double precision,
  customer_lng double precision,
  total_items integer not null check (total_items >= 0),
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  delivery_fee numeric(12, 2) not null default 0 check (delivery_fee >= 0),
  discount numeric(12, 2) not null default 0 check (discount >= 0),
  final_total numeric(12, 2) not null check (final_total >= 0),
  locale text not null default 'ar' check (locale in ('ar', 'en')),
  payment_status text not null default 'paid'
    check (payment_status in ('paid', 'unpaid', 'pending_verification')),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  product_id text not null,
  name text not null,
  quantity integer not null check (quantity >= 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  line_total numeric(12, 2) not null check (line_total >= 0),
  image text,
  created_at timestamptz not null default now(),
  unique (order_id, product_id)
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists order_items_order_id_idx on public.order_items (order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

grant select, insert on table public.orders to authenticated;
grant select, insert on table public.order_items to authenticated;
revoke update, delete, truncate on table public.orders from anon, authenticated;
revoke update, delete, truncate on table public.order_items from anon, authenticated;

drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
on public.orders for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own"
on public.orders for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "orders_update_own" on public.orders;
drop policy if exists "orders_delete_own" on public.orders;

drop policy if exists "order_items_select_own" on public.order_items;
create policy "order_items_select_own"
on public.order_items for select to authenticated
using (
  exists (
    select 1 from public.orders
    where public.orders.id = public.order_items.order_id
      and public.orders.user_id = auth.uid()
  )
);

drop policy if exists "order_items_insert_own" on public.order_items;
create policy "order_items_insert_own"
on public.order_items for insert to authenticated
with check (
  exists (
    select 1 from public.orders
    where public.orders.id = public.order_items.order_id
      and public.orders.user_id = auth.uid()
  )
);

drop policy if exists "order_items_update_own" on public.order_items;
drop policy if exists "order_items_delete_own" on public.order_items;

-- Preserve the existing product-admin access model when that function exists.
do $$
begin
  if to_regprocedure('public.is_product_admin()') is not null then
    execute 'drop policy if exists "Product admins can read all orders" on public.orders';
    execute 'create policy "Product admins can read all orders" on public.orders for select to authenticated using (public.is_product_admin())';
    execute 'drop policy if exists "Product admins can read all order items" on public.order_items';
    execute 'create policy "Product admins can read all order items" on public.order_items for select to authenticated using (public.is_product_admin())';
  end if;
end $$;

create or replace function public.prevent_sales_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'Sales records are append-only and cannot be updated or deleted.'
    using errcode = '42501';
end;
$$;

drop trigger if exists orders_prevent_mutation on public.orders;
create trigger orders_prevent_mutation
before update or delete on public.orders
for each row execute function public.prevent_sales_mutation();

drop trigger if exists order_items_prevent_mutation on public.order_items;
create trigger order_items_prevent_mutation
before update or delete on public.order_items
for each row execute function public.prevent_sales_mutation();

comment on table public.orders is
  'Append-only order records used by the website and mobile app.';
comment on table public.order_items is
  'Append-only line items belonging to immutable order records.';
comment on function public.prevent_sales_mutation() is
  'Protects sales records from UPDATE and DELETE operations.';

commit;

notify pgrst, 'reload schema';
