-- DEMO / TEST DATA ONLY. This script creates no real payment activity.
truncate table public.ai_decisions, public.recovery_actions, public.transactions, public.customers, public.merchant_settings cascade;

insert into public.merchant_settings (id, merchant_name, default_currency, recovery_enabled, demo_mode)
values ('00000000-0000-0000-0000-000000000001', 'RecoverAI Demo Store', 'INR', true, true);

insert into public.customers (id, name, email, phone) values
  ('10000000-0000-0000-0000-000000000001', 'Aarav Mehta', 'aarav.mehta@example.com', '+91 98765 43210'),
  ('10000000-0000-0000-0000-000000000002', 'Ananya Iyer', 'ananya.iyer@example.com', '+91 98765 43211'),
  ('10000000-0000-0000-0000-000000000003', 'Rohan Kapoor', 'rohan.kapoor@example.com', '+91 98765 43212'),
  ('10000000-0000-0000-0000-000000000004', 'Meera Nair', 'meera.nair@example.com', '+91 98765 43213'),
  ('10000000-0000-0000-0000-000000000005', 'Vikram Shah', 'vikram.shah@example.com', '+91 98765 43214');

insert into public.transactions (id, customer_id, amount, currency, status, failure_reason, external_reference, created_at) values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 499.00, 'INR', 'failed', 'BANK_TIMEOUT', 'DEMO_TXN_001', now() - interval '2 hours'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 4999.00, 'INR', 'failed', 'UPI_FAILURE', 'DEMO_TXN_002', now() - interval '4 hours'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 24999.00, 'INR', 'recovered', 'CARD_DECLINED', 'DEMO_TXN_003', now() - interval '1 day'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 499.00, 'INR', 'abandoned', 'ABANDONED_CHECKOUT', 'DEMO_TXN_004', now() - interval '1 day 3 hours'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 4999.00, 'INR', 'failed', 'CARD_DECLINED', 'DEMO_TXN_005', now() - interval '2 days');

insert into public.recovery_actions (id, transaction_id, strategy, status, details, executed_at) values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'retry', 'queued', 'Retry after bank timeout cooldown.', null),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'alternate_payment', 'executed', 'Offer a different UPI app or payment method.', now() - interval '3 hours'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'payment_link', 'succeeded', 'Send a fresh payment link after card decline.', now() - interval '20 hours'),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', 'reminder', 'queued', 'Send a gentle checkout reminder.', null),
  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', 'stop', 'skipped', 'Low recovery probability; avoid customer fatigue.', null);

insert into public.ai_decisions (transaction_id, recovery_action_id, recovery_probability, reasoning, model) values
  ('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 82.00, 'Bank timeout is often temporary. A delayed retry has a strong chance of succeeding.', 'demo-rule-engine'),
  ('20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 68.00, 'UPI failure can be isolated to one app or bank. Offer an alternate payment path.', 'demo-rule-engine'),
  ('20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', 74.00, 'A card decline on a high-value order justifies a payment link for another instrument.', 'demo-rule-engine'),
  ('20000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000004', 55.00, 'The checkout was abandoned before payment failure. A timely reminder can recover intent.', 'demo-rule-engine'),
  ('20000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000005', 18.00, 'Repeated card decline and elapsed time indicate a low likelihood of recovery.', 'demo-rule-engine');