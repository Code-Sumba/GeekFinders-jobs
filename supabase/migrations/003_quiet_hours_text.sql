-- 003 — quiet hours like 22:00 → 07:00 wrap past midnight, which int4range rejects ("lower bound must be <= upper bound").
-- Store the "[start,end)" string as text; app and cron already parse it and handle the wrap.
alter table public.alert_settings alter column quiet_hours type text using quiet_hours::text;
alter table public.alert_settings drop constraint if exists alert_settings_quiet_hours_format;
alter table public.alert_settings add constraint alert_settings_quiet_hours_format
  check (quiet_hours is null or quiet_hours ~ '^\[([01]?[0-9]|2[0-3]),([01]?[0-9]|2[0-3])\)$');
-- Column-level update grant is unchanged by the type change (re-grant to be explicit)
grant update (frequency, channels, alert_hour, quiet_hours) on public.alert_settings to authenticated;
