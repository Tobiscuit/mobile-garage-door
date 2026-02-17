'use server';

import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { revalidatePath } from 'next/cache';

/**
 * Fetches all email threads with their latest status and metadata.
 */
export async function getEmailThreads() {
  const payload = await getPayload({ config: configPromise });

  try {
    const { docs } = await payload.find({
      collection: 'email-threads',
      sort: '-lastMessageAt',
      depth: 1,
      limit: 50, // Pagination can be added later
    });

    // Enhance threads with participant info if needed
    return docs.map((thread) => ({
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

/**
 * Fetches a single thread and all its messages.
 */
export async function getThreadDetails(threadId: string) {
  const payload = await getPayload({ config: configPromise });

  try {
    // 1. Get the Thread
    const thread = await payload.findByID({
      collection: 'email-threads',
      id: threadId,
    });

    if (!thread) return null;

    // 2. Get Messages for this thread
    const { docs: messages } = await payload.find({
      collection: 'emails',
      where: {
        thread: {
          equals: threadId,
        },
      },
      sort: 'createdAt', // Chronological order
      depth: 0,
    });

    return {
      thread,
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
    console.error(`Error fetching thread ${threadId}:`, error);
    return null;
  }
}

/**
 * Sends a reply to a thread and saves it to the database.
 */
export async function sendReply(threadId: string, content: string) {
  const payload = await getPayload({ config: configPromise });
  
  // 1. Fetch thread to get context (User email, subject)
  const thread = await payload.findByID({
      collection: 'email-threads',
      id: threadId,
      depth: 1, 
  });

  if (!thread) throw new Error('Thread not found');

  // Naive logic: Find the first 'inbound' email to get the customer's address
  const { docs: inboundMessages } = await payload.find({
      collection: 'emails',
      where: {
          and: [
              { thread: { equals: threadId } },
              { direction: { equals: 'inbound' } }
          ]
      },
      limit: 1,
      sort: '-createdAt',
  });

  const recipientEmail = inboundMessages[0]?.from;

  if (!recipientEmail) {
      throw new Error('Could not determine recipient email from thread history.');
  }

  try {
      // 2. Send via Nodemailer (AWS SES)
      const { emailTransport } = await import('@/lib/email');
      
      const info = await emailTransport.sendMail({
          from: process.env.SES_FROM_ADDRESS || 'dispatch@mobilegaragedoor.com',
          to: recipientEmail,
          subject: `Re: ${thread.subject}`, 
          text: content,
      });

      console.log('Email sent:', info.messageId);

      // 3. Save Outbound Message to DB
      const emailRecord = await payload.create({
          collection: 'emails',
          data: {
              thread: parseInt(threadId),
              from: process.env.SES_FROM_ADDRESS || 'dispatch@mobilegaragedoor.com',
              to: recipientEmail,
              subject: `Re: ${thread.subject}`,
              bodyRaw: content,
              direction: 'outbound',
              messageId: info.messageId, 
              body: {
                root: {
                  type: 'root',
                  children: [
                    {
                      type: 'paragraph',
                      children: [{ type: 'text', text: content, version: 1 }],
                      version: 1,
                    }
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  version: 1,
                }
              },
          },
      });

      // 4. Update Thread
      await payload.update({
          collection: 'email-threads',
          id: threadId,
          data: {
              lastMessageAt: new Date().toISOString(),
              status: 'open',
          },
      });

      // 5. Revalidate cache
      revalidatePath(`/dashboard/emails/${threadId}`);
      revalidatePath(`/dashboard/emails`);

      return { success: true, messageId: emailRecord.id };

  } catch (error: any) {
      console.error('Failed to send reply:', error);
      return { success: false, error: error.message };
  }
}
