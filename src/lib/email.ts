/**
 * Edge-native email utility using Resend.
 * Works on Cloudflare Workers via fetch-based API.
 *
 * Requires RESEND_API_KEY environment variable to be set.
 * In dev mode (no API key), falls back to console.log.
 */

import { Resend } from 'resend';

const FROM_EMAIL = 'Mobil Garage Door <noreply@mobilgaragedoor.com>';

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
  from,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}) => {
  const apiKey = process.env.RESEND_API_KEY;

  // Dev fallback: log to console if no API key
  if (!apiKey) {
    console.log(`\n📧 [DEV EMAIL - No RESEND_API_KEY set]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${text || html || 'No content'}\n`);
    return { id: 'dev-mock-id' };
  }

  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from: from || FROM_EMAIL,
    to: [to],
    subject,
    html: html || undefined,
    text: text || undefined,
  });

  if (error) {
    console.error('[Resend] Failed to send email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  console.log(`[Resend] Email sent to ${to}, id: ${data?.id}`);
  return { id: data?.id };
};
