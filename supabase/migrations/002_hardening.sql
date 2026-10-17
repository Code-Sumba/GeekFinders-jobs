-- 002 — security hardening found in the audit (2026-10-17). Safe to run once on an existing database.

-- 1. HR contact emails must never be readable through the public API (plan: never share HR contact lists).
--    Column-level grants: every jobs column except contact_email.
revoke select on public.jobs from anon, authenticated;
grant select (id, source, source_id, title, company, company_domain, location, remote, description, summary, skills,
  experience_min, experience_max, fresher_friendly, enriched, apply_url, posted_at, expires_at, hash, created_at)
  on public.jobs to anon, authenticated;

-- 2. Students write their own profile directly through the API, so cap sizes in the database too (storage abuse).
alter table public.profiles drop constraint if exists profiles_size;
alter table public.profiles add constraint profiles_size check (
  cardinality(skills) <= 100 and cardinality(preferred_roles) <= 20 and cardinality(locations) <= 20
  and pg_column_size(education) + pg_column_size(projects) + pg_column_size(experience) < 100000
);

-- 3. HR opt-out requests (public "don't contact me" form) are stored with the contact row.
alter table public.company_contacts add column if not exists opted_out_at timestamptz;
create index if not exists company_contacts_email_idx on public.company_contacts (lower(email));

-- 4. Retention helpers used by the daily cron (free tier has 500 MB).
create index if not exists jobs_hash_created_idx on public.jobs (created_at);
create index if not exists news_items_created_idx on public.news_items (created_at);

-- 5. Daily cleanup so the free 500 MB tier doesn't fill up. Never deletes a job a student saved, applied to,
--    emailed HR about or tailored a resume for (those rows would cascade away from their tracker).
create or replace function public.cleanup_old_data() returns jsonb
language plpgsql security definer set search_path = public as $$
declare j int; n int; w int;
begin
  delete from public.jobs jb
   where jb.created_at < now() - interval '45 days'
     and not exists (select 1 from public.applications a where a.job_id = jb.id)
     and not exists (select 1 from public.tailored_resumes t where t.job_id = jb.id)
     and not exists (select 1 from public.outreach o where o.job_id = jb.id);
  get diagnostics j = row_count;
  delete from public.news_items ni
   where ni.created_at < now() - interval '30 days'
     and (ni.cluster_id is null or not exists (select 1 from public.article_drafts d where d.cluster_id = ni.cluster_id and d.status = 'published'));
  get diagnostics n = row_count;
  delete from public.webhook_events where received_at < now() - interval '90 days';
  get diagnostics w = row_count;
  delete from public.ai_usage where day < current_date - 180;
  return jsonb_build_object('jobs', j, 'news_items', n, 'webhook_events', w);
end $$;
revoke execute on function public.cleanup_old_data() from public, anon, authenticated;
