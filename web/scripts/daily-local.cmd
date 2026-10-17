@echo off
rem Local stand-in for the GitHub Actions schedule until the site is deployed.
rem Windows Task Scheduler runs this at 06:00 and 18:00: fetch -> quality gate -> AI step -> match. Log: web\logs\daily.log
cd /d "%~dp0.."
if not exist logs mkdir logs
echo ==== %date% %time% ==== >> logs\daily.log
call npx tsx --env-file=.env.local scripts/cron.ts ingest >> logs\daily.log 2>&1
echo exit %errorlevel% >> logs\daily.log
