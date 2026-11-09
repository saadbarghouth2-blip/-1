-- Safe, append-only payment and WhatsApp delivery events.
-- Run the whole file once in Supabase SQL Editor after supabase-sales-read-only.sql.
-- Existing orders, order items, and sales rows are never updated or deleted.

begin;

create extension if not exists "pgcrypto";

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  provider text not null default 'moyasar',
  provider_event_id text not null unique,
  provider_payment_id text,
  status text not null check (
    status in ('initiated', 'pending', 'paid', 'failed', 'cancelled', 'refunded')
  ),
  amount numeric(12, 2) check (amount is null or amount >= 0),
  currency text not null default 'SAR',
  is_live boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.invoice_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  payment_event_id uuid references public.payment_events(id) on delete restrict,
  channel text not null default 'whatsapp' check (channel = 'whatsapp'),
  provider_message_id text unique,
  template_name text not null,
  status text not null check (status in ('queued', 'sent', 'delivered', 'read', 'failed')),
  error_code text,
  created_at timestamptz not null default now(),
  unique (order_id, payment_event_id, template_name)
);

create index if not exists payment_events_order_created_idx
  on public.payment_events (order_id, created_at desc);
create index if not exists invoice_events_order_created_idx
  on public.invoice_events (order_id, created_at desc);

alter table public.payment_events enable row level security;
alter table public.invoice_events enable row level security;

revoke all on table public.payment_events from anon, authenticated;
revoke all on table public.invoice_events from anon, authenticated;
grant select on table public.payment_events to authenticated;
grant select on table public.invoice_events to authenticated;

do $$
begin
  if to_regprocedure('public.is_product_admin()') is not null then
    execute 'drop policy if exists "Product admins can read payment events" on public.payment_events';
    execute 'create policy "Product admins can read payment events" on public.payment_events for select to authenticated using (public.is_product_admin())';
    execute 'drop policy if exists "Product admins can read invoice events" on public.invoice_events';
    execute 'create policy "Product admins can read invoice events" on public.invoice_events for select to authenticated using (public.is_product_admin())';
  end if;
end $$;

create or replace function public.prevent_financial_event_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'Payment and invoice events are append-only and cannot be updated or deleted.'
    using errcode = '42501';
end;
$$;

drop trigger if exists payment_events_prevent_mutation on public.payment_events;
create trigger payment_events_prevent_mutation
before update or delete on public.payment_events
for each row execute function public.prevent_financial_event_mutation();

drop trigger if exists invoice_events_prevent_mutation on public.invoice_events;
create trigger invoice_events_prevent_mutation
before update or delete on public.invoice_events
for each row execute function public.prevent_financial_event_mutation();

comment on table public.payment_events is
  'Append-only provider-confirmed payment status history. Existing orders stay immutable.';
comment on table public.invoice_events is
  'Append-only WhatsApp invoice delivery history.';

commit;

notify pgrst, 'reload schema';
