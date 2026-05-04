// ============================================================================
// /api/notify — Vercel serverless function
// ============================================================================
// Runs on Vercel's edge/node runtime. Triggered when the sushi invite page
// POSTs to /api/notify. Sends two emails via Resend:
//   1. To Joel (so he knows she responded)
//   2. To her (with the date confirmation + calendar link)
//
// Env vars required (set in Vercel project settings):
//   RESEND_API_KEY  — starts with re_...
// ============================================================================

import type { VercelRequest, VercelResponse } from "@vercel/node";

// The shape of data the frontend sends us.
type NotifyPayload = {
  responseType: "yes" | "no";
  guestEmail: string;
  selectedDate?: {
    label: string;       // e.g. "Friday May 8th"
    time: string;        // e.g. "6:30 PM"
    dateTime: string;    // e.g. "20260508T183000" (Google Cal format)
  };
  alternativeDates?: string[]; // ISO date strings if she said no
};

// The "from" address. Once goofysaga.xyz is verified in Resend, this will
// route through your domain. Until then, this address would only deliver to
// joelabate7272@gmail.com — that's why we did the domain verification step.
const FROM_ADDRESS = "Sushi Date <sushi@goofysaga.xyz>";
const JOEL_EMAIL = "joelabate7272@gmail.com";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept POST. Anything else is rejected — this prevents accidental
  // GET requests (e.g. from web crawlers) from triggering email sends.
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // The key wasn't set in Vercel's env vars. Log it server-side so Joel
    // can see in Vercel logs, but don't leak the detail to the public.
    console.error("RESEND_API_KEY env var is not set");
    return res.status(500).json({ error: "Server misconfigured" });
  }

  // Parse and validate the request body.
  const body = req.body as NotifyPayload;
  if (!body || !body.responseType || !body.guestEmail) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Basic email sanity check — not bulletproof, just catches obvious typos.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.guestEmail)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  // Build a Google Calendar "add event" link (same URL trick as before,
  // but now we generate it server-side so we can include it in the email).
  const buildCalendarUrl = (date: { label: string; dateTime: string }) => {
    const startDateTime = date.dateTime;
    // Add 2 hours for end time.
    const endDateTime = date.dateTime.replace(
      /T(\d{2})(\d{2})/,
      (_m, hours: string, minutes: string) => {
        const endHour = (parseInt(hours, 10) + 2).toString().padStart(2, "0");
        return `T${endHour}${minutes}`;
      },
    );
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: "Sushii Ting",
      dates: `${startDateTime}/${endDateTime}`,
      details: "Let's see what this sushi saying",
      location: "Determined but not defined for you",
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  // Compose the two emails based on YES vs NO.
  let joelSubject: string;
  let joelHtml: string;
  let guestSubject: string;
  let guestHtml: string;

  if (body.responseType === "yes" && body.selectedDate) {
    const calUrl = buildCalendarUrl(body.selectedDate);

    joelSubject = `🍣 SHE SAID YES — ${body.selectedDate.label}`;
    joelHtml = `
      <h2>Sushi date is on 🎉</h2>
      <p><strong>${escapeHtml(body.guestEmail)}</strong> picked:</p>
      <p style="font-size:18px"><strong>${escapeHtml(body.selectedDate.label)} at ${escapeHtml(body.selectedDate.time)}</strong></p>
      <p><a href="${calUrl}">Add to your Google Calendar →</a></p>
    `;

    guestSubject = `🍣 Sushi date confirmed — ${body.selectedDate.label}`;
    guestHtml = `
      <h2>Sushi date locked in 🍣</h2>
      <p>You picked: <strong>${escapeHtml(body.selectedDate.label)} at ${escapeHtml(body.selectedDate.time)}</strong></p>
      <p>Tap below to drop it in your calendar:</p>
      <p><a href="${calUrl}" style="display:inline-block;padding:12px 24px;background:#ec4899;color:white;text-decoration:none;border-radius:8px">Add to Google Calendar</a></p>
      <p style="color:#888;font-size:13px;margin-top:32px">If that button doesn't work: <a href="${calUrl}">${calUrl}</a></p>
    `;
  } else {
    // NO path — she suggested alternative dates instead.
    const altList = (body.alternativeDates ?? [])
      .filter(Boolean)
      .map((d) =>
        new Date(d).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      );

    joelSubject = `🍣 She suggested other dates`;
    joelHtml = `
      <h2>She can't do those dates — suggested alternatives:</h2>
      <p><strong>${escapeHtml(body.guestEmail)}</strong> suggested:</p>
      <ul>
        ${altList.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}
      </ul>
    `;

    guestSubject = `🍣 Sushi date — your suggested dates received`;
    guestHtml = `
      <h2>Got it!</h2>
      <p>You suggested:</p>
      <ul>
        ${altList.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}
      </ul>
      <p>Joel will be in touch to confirm one of these.</p>
    `;
  }

  // Fire both emails to Resend in parallel. If either fails, we report the
  // failure to the frontend so the UI can show an error state.
  try {
    const sendEmail = (to: string, subject: string, html: string) =>
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_ADDRESS,
          to: [to],
          subject,
          html,
        }),
      });

    const [joelRes, guestRes] = await Promise.all([
      sendEmail(JOEL_EMAIL, joelSubject, joelHtml),
      sendEmail(body.guestEmail, guestSubject, guestHtml),
    ]);

    if (!joelRes.ok || !guestRes.ok) {
      const joelText = await joelRes.text();
      const guestText = await guestRes.text();
      console.error("Resend error:", { joelText, guestText });
      return res.status(502).json({ error: "Email send failed" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Unexpected server error" });
  }
}

// Tiny HTML escape so user-supplied email addresses can't inject markup
// into the email body. Defense-in-depth — the email is going to Joel, but
// good hygiene matters.
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
