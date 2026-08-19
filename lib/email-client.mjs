// ============================================================
// JobPriceNow — Email Client (Resend, REST)
// ============================================================

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "quotes@jobpricenow.com";

export function isEmailConfigured() {
  return Boolean(RESEND_API_KEY);
}

/**
 * @param {Object} input
 * @param {string} input.to
 * @param {string} input.subject
 * @param {string} input.html
 * @param {Buffer} input.pdfBuffer
 * @param {string} input.pdfFilename
 */
export async function sendQuoteEmail({ to, subject, html, pdfBuffer, pdfFilename }) {
  if (!RESEND_API_KEY) throw new Error("Email is not configured (missing RESEND_API_KEY)");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM_EMAIL,
      to: [to],
      subject,
      html,
      attachments: [
        {
          filename: pdfFilename,
          content: pdfBuffer.toString("base64"),
        },
      ],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Resend email send failed: ${errBody}`);
  }

  return response.json();
}
