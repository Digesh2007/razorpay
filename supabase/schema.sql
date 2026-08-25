create extension if not exists "pgcrypto";

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'INR',
  status text not null check (status in ('failed', 'recovered', 'pending', 'abandoned')),
  failure_reason text check (failure_reason in ('BANK_TIMEOUT', 'UPI_FAILURE', 'CARD_DECLINED', 'ABANDONED_CHECKOUT')),
  external_reference text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.recovery_actions (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  strategy text not null check (strategy in ('retry', 'alternate_payment', 'payment_link', 'reminder', 'stop')),
  status text not null check (status in ('queued', 'executed', 'succeeded', 'failed', 'skipped')),
  details text,
  executed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_decisions (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  recovery_action_id uuid references public.recovery_actions(id) on delete set null,
  recovery_probability numeric(5, 2) not null check (recovery_probability >= 0 and recovery_probability <= 100),
  reasoning text not null,
  model text not null default 'demo-rule-engine',
  created_at timestamptz not null default now()
);

create table if not exists public.merchant_settings (
  id uuid primary key default gen_random_uuid(),
  merchant_name text not null,
  default_currency text not null default 'INR',
  recovery_enabled boolean not null default true,
  demo_mode boolean not null default true,
  max_retry_attempts integer not null default 3 check (max_retry_attempts between 1 and 5),
  min_confidence_threshold integer not null default 70 check (min_confidence_threshold between 50 and 95),
  alternate_payment_enabled boolean not null default true,
  payment_link_enabled boolean not null default true,
  notifications_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transactions_status_idx on public.transactions(status);
create index if not exists transactions_created_at_idx on public.transactions(created_at desc);
create index if not exists recovery_actions_transaction_id_idx on public.recovery_actions(transaction_id);
create index if not exists ai_decisions_transaction_id_idx on public.ai_decisions(transaction_id);

alter table public.customers enable row level security;
alter table public.transactions enable row level security;
alter table public.recovery_actions enable row level security;
alter table public.ai_decisions enable row level security;
alter table public.merchant_settings enable row level security;

drop policy if exists "Demo users can view customers" on public.customers;
create policy "Demo users can view customers" on public.customers for select to anon, authenticated using (true);

drop policy if exists "Demo users can view transactions" on public.transactions;
create policy "Demo users can view transactions" on public.transactions for select to anon, authenticated using (true);

drop policy if exists "Demo users can view recovery actions" on public.recovery_actions;
create policy "Demo users can view recovery actions" on public.recovery_actions for select to anon, authenticated using (true);

drop policy if exists "Demo users can view AI decisions" on public.ai_decisions;
create policy "Demo users can view AI decisions" on public.ai_decisions for select to anon, authenticated using (true);

drop policy if exists "Demo users can view merchant settings" on public.merchant_settings;
create policy "Demo users can view merchant settings" on public.merchant_settings for select to anon, authenticated using (true);