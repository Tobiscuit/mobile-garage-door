/**
 * Edge-native email utility.
 * No nodemailer — just console logging for now.
 * Replace with Cloudflare Email Workers or fetch-based provider (Resend, Mailchannels) when ready.
 */

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
  console.log(`\n📧 [INTERCEPTED EMAIL]`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body:\n${text || 'HTML Content'}\n`);
  return { MessageId: 'mock-id' };
};
