'use server';

import { getDB } from "@/db";
import { emails, emailThreads } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from 'next/cache';
import { getCloudflareContext } from "@/lib/cloudflare";

export async function getEmailThreads() {
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);

  try {
    const results = await db.select().from(emailThreads).orderBy(desc(emailThreads.lastMessageAt)).limit(50);
    return results.map((thread) => ({
      id: thread.id,
      subject: thread.subject,
      status: thread.status,
      lastMessageAt: thread.lastMessageAt,
    }));
  } catch (error) {
    console.error('Error fetching email threads:', error);
    return [];
  }
}

export async function getThreadDetails(threadId: string) {
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);

  try {
    const id = parseInt(threadId);
    const thread = await db.select().from(emailThreads).where(eq(emailThreads.id, id)).limit(1);

    if (!thread[0]) return null;

    const messages = await db.select().from(emails).where(eq(emails.threadId, id)).orderBy(emails.createdAt);

    return {
      thread: thread[0],
      messages: messages.map(msg => ({
        id: msg.id,
        from: msg.from,
        to: msg.to,
        bodyRaw: msg.bodyRaw || '', 
        createdAt: msg.createdAt,
        direction: msg.direction,
      })),
    };

  } catch (error) {
    console.error(`Error fetching thread \${threadId}:`, error);
    return null;
  }
}

export async function sendReply(threadId: string, content: string) {
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);
  
  const id = parseInt(threadId);
  const threadResult = await db.select().from(emailThreads).where(eq(emailThreads.id, id)).limit(1);
  const thread = threadResult[0];

  if (!thread) throw new Error('Thread not found');

  const inboundMessages = await db.select().from(emails)
      .where(and(eq(emails.threadId, id), eq(emails.direction, 'inbound')))
      .orderBy(desc(emails.createdAt))
      .limit(1);

  const recipientEmail = inboundMessages[0]?.from;

  if (!recipientEmail) {
      throw new Error('Could not determine recipient email from thread history.');
  }

  try {
      const { emailTransport } = await import('@/lib/email');
      
      const info = await emailTransport.sendMail({
          from: process.env.SES_FROM_ADDRESS || 'dispatch@mobilegaragedoor.com',
          to: recipientEmail,
          subject: `Re: \${thread.subject}`,
          text: content,
      });

      const emailRecord = await db.insert(emails).values({
          threadId: id,
          from: process.env.SES_FROM_ADDRESS || 'dispatch@mobilegaragedoor.com',
          to: recipientEmail,
          subject: `Re: \${thread.subject}`,
          bodyRaw: content,
          direction: 'outbound',
          messageId: info.messageId,
      }).returning();

      await db.update(emailThreads).set({
          lastMessageAt: new Date().toISOString(),
          status: 'open',
          updatedAt: new Date().toISOString()
      }).where(eq(emailThreads.id, id));

      revalidatePath(`/dashboard/emails/\${threadId}`);
      revalidatePath(`/dashboard/emails`);

      return { success: true, messageId: emailRecord[0].id };

  } catch (error: any) {
      console.error('Failed to send reply:', error);
      return { success: false, error: error.message };
  }
}
