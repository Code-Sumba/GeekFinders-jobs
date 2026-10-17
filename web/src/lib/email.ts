/** Email alerts via Brevo (free daily quota). Email is the optional secondary channel. */
export async function sendEmail(to: string, subject: string, html: string, opts: { unsubscribeUrl?: string } = {}) {
  if (!process.env.BREVO_API_KEY || !process.env.EMAIL_FROM) return false;
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": process.env.BREVO_API_KEY },
    body: JSON.stringify({
      sender: { email: process.env.EMAIL_FROM, name: "GeeksFinder" },
      to: [{ email: to }],
      subject: subject.replace(/[\r\n]+/g, " ").slice(0, 150),
      htmlContent: html,
      // RFC 8058 one-click unsubscribe (Gmail/Yahoo show a native Unsubscribe button)
      ...(opts.unsubscribeUrl
        ? { headers: { "List-Unsubscribe": `<${opts.unsubscribeUrl.replace("/unsubscribe?", "/api/unsubscribe?")}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } }
        : {}),
    }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) console.warn(`[email] Brevo ${res.status}`);
  return res.ok;
}
