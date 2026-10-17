-- 004 — three paid plans (Hustle ₹10/15 days, Season ₹59/3 months, Year Pass ₹199/year), all UPI Autopay.
-- Features are identical (users.plan stays 'free' | 'pro'); the subscription remembers which plan was bought.
-- Only the service role (checkout route + Razorpay webhook) writes this table.
alter table public.subscriptions add column if not exists plan_code text;
alter table public.subscriptions drop constraint if exists subscriptions_plan_code_check;
alter table public.subscriptions add constraint subscriptions_plan_code_check check (plan_code is null or plan_code in ('hustle', 'season', 'yearpass'));
-- Everyone subscribed before this migration was on the 15-day plan
update public.subscriptions set plan_code = 'hustle' where plan_code is null and razorpay_subscription_id is not null;
-- Billing tables are written only by the service role (checkout route, Razorpay webhook). RLS already denies
-- client writes (no insert/update policy); revoking the grants is a second lock in case a policy is ever added by mistake.
revoke insert, update, delete, truncate on public.subscriptions, public.payments from anon, authenticated;
