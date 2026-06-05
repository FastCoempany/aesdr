/**
 * AESDR — affiliates@ inbound Email Worker
 * ----------------------------------------
 * Paste this into Cloudflare → Email → Email Workers (create a worker, replace
 * the default code with this, deploy), then bind it to affiliates@aesdr.com.
 *
 * It does TWO things on every inbound message, and nothing else:
 *   1. Forwards the message to the human inbox — keeps your existing
 *      affiliates@ → antaeus.coe@gmail.com copy exactly as it is today.
 *   2. POSTs the raw message to the AESDR inbound webhook so Sentinel can
 *      triage it (the route parses it into the partner_inbound_email table).
 *
 * Both steps are best-effort: a webhook hiccup or a forward error can never
 * bounce or drop the mail. The mail always still reaches your inbox.
 *
 * ONE setting to add: a Worker variable named INBOUND_EMAIL_SECRET, whose value
 * matches the INBOUND_EMAIL_SECRET you set in Vercel. The webhook rejects any
 * POST that doesn't carry it, so randoms can't inject fake mail.
 */
export default {
  async email(message, env) {
    // 1) Keep the human copy. antaeus.coe@gmail.com is already a verified
    //    Email Routing destination, so this just mirrors today's behavior.
    try {
      await message.forward("antaeus.coe@gmail.com");
    } catch (_) {
      // Never let a forward error block the webhook step.
    }

    // 2) Hand the raw RFC822 message to the webhook for Sentinel to triage.
    try {
      // Skip absurdly large mail (attachments etc.) — triage only needs the text.
      if (message.rawSize && message.rawSize > 512 * 1024) return;
      const raw = await new Response(message.raw).text();
      await fetch("https://affiliatekit.aesdr.com/api/webhooks/inbound-email", {
        method: "POST",
        headers: {
          "content-type": "message/rfc822",
          "x-inbound-secret": env.INBOUND_EMAIL_SECRET || "",
          "x-mail-from": message.from || "",
          "x-mail-to": message.to || "",
        },
        body: raw,
      });
    } catch (_) {
      // A webhook outage must never affect mail delivery.
    }
  },
};
