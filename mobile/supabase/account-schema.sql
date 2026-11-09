create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  default_address text,
  default_lat double precision,
  default_lng double precision,
  locale text not null default 'ar' check (locale in ('ar', 'en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  payment_reference text not null unique,
  source text not null default 'mobile_app' check (source = 'mobile_app'),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  customer_address text,
  customer_notes text,
  customer_lat double precision,
  customer_lng double precision,
  total_items integer not null,
  subtotal numeric(10, 2) not null,
  delivery_fee numeric(10, 2) not null,
  discount numeric(10, 2) not null default 0,
  final_total numeric(10, 2) not null,
  locale text not null check (locale in ('ar', 'en')),
  payment_status text not null default 'paid' check (payment_status = 'paid'),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,
  name text not null,
  quantity integer not null,
  unit_price numeric(10, 2) not null,
  line_total numeric(10, 2) not null,
  image text,
  created_at timestamptz not null default now(),
  unique (order_id, product_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
on public.orders
for select
using (auth.uid() = user_id);

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own"
on public.orders
for insert
with check (auth.uid() = user_id);

drop policy if exists "orders_update_own" on public.orders;
-- Sales records are append-only. Do not add an UPDATE or DELETE policy here.

drop policy if exists "order_items_select_own" on public.order_items;
create policy "order_items_select_own"
on public.order_items
for select
using (
  exists (
    select 1
    from public.orders
    where public.orders.id = public.order_items.order_id
      and public.orders.user_id = auth.uid()
  )
);

drop policy if exists "order_items_insert_own" on public.order_items;
create policy "order_items_insert_own"
on public.order_items
for insert
with check (
  exists (
    select 1
    from public.orders
    where public.orders.id = public.order_items.order_id
      and public.orders.user_id = auth.uid()
  )
);

drop policy if exists "order_items_update_own" on public.order_items;
-- Sales line items are append-only. Do not add an UPDATE or DELETE policy here.
