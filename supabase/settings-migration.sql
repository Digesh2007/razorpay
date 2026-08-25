alter table public.merchant_settings add column if not exists max_retry_attempts integer not null default 3 check (max_retry_attempts between 1 and 5);
alter table public.merchant_settings add column if not exists min_confidence_threshold integer not null default 70 check (min_confidence_threshold between 50 and 95);
alter table public.merchant_settings add column if not exists alternate_payment_enabled boolean not null default true;
alter table public.merchant_settings add column if not exists payment_link_enabled boolean not null default true;
alter table public.merchant_settings add column if not exists notifications_enabled boolean not null default true;