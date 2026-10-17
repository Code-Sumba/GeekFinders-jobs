/**
 * Local development only: Telegram can't reach localhost, so instead of a webhook we long-poll
 * getUpdates and forward each update to the local webhook route (with the same secret header).
 * Run alongside `npm run dev`:  npm run telegram:dev
 * After deploying, run `npm run telegram:webhook` to switch the bot back to the real webhook.
 */
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
const APP = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/+$/, "");

if (!TOKEN || !SECRET) throw new Error("Set TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET in .env.local");
// Never run against production: deleting the webhook would stop the live bot
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(APP)) throw new Error(`Refusing to run: NEXT_PUBLIC_APP_URL is ${APP}, not localhost`);

const api = (method: string, params: Record<string, string | number> = {}) =>
  fetch(`https://api.telegram.org/bot${TOKEN}/${method}?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))}`).then((r) => r.json());

async function main() {
  // Keeps pending updates, so Start presses made while nothing was listening still go through
  await api("deleteWebhook", { drop_pending_updates: "false" });
  console.log(`Forwarding Telegram updates to ${APP}/api/telegram/webhook (Ctrl+C to stop)`);
  let offset = 0;
  for (;;) {
    const res = await api("getUpdates", { offset, timeout: 25 }).catch(() => null);
    if (!res?.ok) {
      await new Promise((r) => setTimeout(r, 3000));
      continue;
    }
    for (const update of res.result) {
      offset = update.update_id + 1;
      const text: string = update.message?.text ?? "(non-text update)";
      const r = await fetch(`${APP}/api/telegram/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Telegram-Bot-Api-Secret-Token": SECRET! },
        body: JSON.stringify(update),
      }).catch((e) => ({ status: `failed: ${e.message}` }));
      console.log(`${text.split(" ")[0]} → ${r.status}`);
    }
  }
}

main();
