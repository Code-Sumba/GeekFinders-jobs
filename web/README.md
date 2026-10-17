# GeeksFinder

Fresher jobs matched to your resume, on Telegram. Tailor your resume and email HR in one click.

Next.js 15 (App Router) on Vercel · Supabase (DB, auth, storage) · GitHub Actions cron · Gemini/Groq for parsing and tailoring · Claude Haiku for blog drafts · Telegram (default alerts) + Brevo email · Razorpay UPI Autopay.

Design rules: [`../DESIGN.md`](../DESIGN.md) · Project rules: [`../CLAUDE.md`](../CLAUDE.md) · Live component gallery: `/styleguide`.

## Setup

1. **Supabase**: create a project → SQL editor → run [`../supabase/schema.sql`](../supabase/schema.sql).
   - Auth → Providers: enable **Google** and **Email** (6-digit OTP).
   - Auth → URL config: add `http://localhost:3000/auth/callback` and `<your-domain>/auth/callback`.
   - After you sign up: `update public.users set role = 'admin' where email = 'you@…';` to open `/admin`.
2. `cp .env.example .env.local` and fill the keys.
3. **Telegram**: create the bot in @BotFather, deploy, then `npm run telegram:webhook` (needs the public URL). Add the bot as an admin of your channel for article posts.
4. **Razorpay**: Subscriptions → plan (daily, interval 15, ₹10) → `RAZORPAY_PLAN_ID`. Webhook → `<domain>/api/razorpay/webhook` with all `subscription.*` events.
5. **Upstash Redis** and **Cloudflare Turnstile** (both free) for rate limits and CAPTCHA.
6. `npm run dev` → http://localhost:3000

## Scheduled jobs (GitHub Actions → [`daily.yml`](../.github/workflows/daily.yml))

| When | Command | What |
|---|---|---|
| 06:00 IST | `npm run cron:ingest` | JSearch, Adzuna, Greenhouse/Lever, Remotive → dedupe → AI enrich → match ≥ 60 |
| Every hour :30 IST | `npm run cron:notify` | Alerts for users whose chosen alert time is now; 5-day follow-ups; plan downgrades |
| Every 6 h | `npm run cron:news` | News → 2+ source clusters → facts → Claude draft → checks → `/admin/drafts` |

Add the same env vars as repository secrets. Edit `scripts/boards.json` to add company boards.

## Checks

`npm test` (51 tests: auth 401s, IDOR, webhook signatures, rate limits, SSRF, open redirect, CSRF, XSS, no-invented-skills), `npm run lint`, `npx tsc --noEmit`. CI runs these plus `npm audit` on every push; Dependabot opens weekly update PRs.
