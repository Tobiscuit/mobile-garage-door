import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
// @ts-ignore -- sns-validator lacks simple types
import Validator from 'sns-validator';
import { simpleParser } from 'mailparser';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { Readable } from 'stream';

// Initialize Services
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    // Falls back to IAM role (useful if hosting on EC2/Hetzner with configured profile)
    // or loaded from env vars automatically by SDK
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const validator = new Validator();

// Helper to validate SNS signature
const validateSNS = (payload: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    validator.validate(payload, (err: any) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

// Stream to String helper
const streamToString = (stream: Readable): Promise<string> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
};

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);

    // 1. Handle Subscription Confirmation (Auto-confirm)
    if (payload.Type === 'SubscriptionConfirmation') {
      console.log('Confirming SNS Subscription:', payload.SubscribeURL);
      const response = await fetch(payload.SubscribeURL);
      if (response.ok) {
        return NextResponse.json({ message: 'Subscription confirmed' });
      } else {
        return NextResponse.json({ error: 'Failed to confirm subscription' }, { status: 500 });
      }
    }

    // 2. Validate SNS Notification Signature
    if (process.env.NODE_ENV === 'production') {
      try {
        await validateSNS(payload);
      } catch (err) {
        console.error('Invalid SNS Signature:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // 3. Process SES Notification
    if (payload.Type === 'Notification') {
      const message = JSON.parse(payload.Message);
      
      // SES Receipt Object
      const receipt = message.receipt;
      const mail = message.mail;
      const s3Action = receipt.action;

      // Ensure this is an S3 action
      if (!s3Action || s3Action.type !== 'S3') {
        // Might be just a notification, skip
        return NextResponse.json({ message: 'No S3 action found, skipping' });
      }

      const bucketName = s3Action.bucketName;
      const objectKey = s3Action.objectKey;

      console.log(`Processing inbound email: ${objectKey} from bucket ${bucketName}`);

      // 4. Download Email from S3
      const getObjectParams = {
        Bucket: bucketName,
        Key: objectKey,
      };
      
      const s3Item = await s3.send(new GetObjectCommand(getObjectParams));
      
      if (!s3Item.Body) {
        throw new Error('Empty S3 body');
      }

      // AWS SDK v3 streams are generic bodies, cast to Readable for mailparser
      const emailRaw = await streamToString(s3Item.Body as Readable);

      // 5. Parse Email
      const parsed = await simpleParser(emailRaw);
      
      // 6. Save to PayloadCMS
      const payloadClient = await getPayload({ config: configPromise });

      // Find or Create Thread based on Subject (Naive threading for now)
      // Ideally use In-Reply-To headers, but Subject grouping is a good start
      const cleanSubject = parsed.subject?.replace(/^(Re|Fwd): /i, '').trim() || 'No Subject';
      
      let threadID;
      
      const existingThreads = await payloadClient.find({
        collection: 'email-threads',
        where: {
          subject: {
            equals: cleanSubject,
          },
        },
        limit: 1,
      });

      if (existingThreads.totalDocs > 0) {
        threadID = existingThreads.docs[0].id;
        // Re-open thread if it was closed
        if (existingThreads.docs[0].status !== 'open') {
          await payloadClient.update({
            collection: 'email-threads',
            id: threadID,
            data: { status: 'open', lastMessageAt: new Date().toISOString() },
          });
        }
      } else {
        const newThread = await payloadClient.create({
          collection: 'email-threads',
          data: {
            subject: cleanSubject,
            status: 'open',
            lastMessageAt: new Date().toISOString(),
          },
        });
        threadID = newThread.id;
      }

      // Create Email Record
      await payloadClient.create({
        collection: 'emails',
        data: {
          from: parsed.from?.text || 'Unknown',
          to: Array.isArray(parsed.to) ? parsed.to.map(t => t.text).join(', ') : parsed.to?.text || 'Unknown',
          subject: parsed.subject || 'No Subject',
          body: {
            root: {
              type: 'root',
              children: [
                {
                    type: 'paragraph',
                    children: [
                        {
                            type: 'text',
                            text: parsed.text || '(No content)',
                            version: 1,
                        }
                    ],
                    version: 1,
                }
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            }
          },
          bodyRaw: parsed.html || parsed.text || '', // Store raw content for viewing
          thread: threadID,
          direction: 'inbound',
          messageId: parsed.messageId,
          rawMetadata: {
            headers: parsed.headers,
            date: parsed.date,
          },
        },
      });

      return NextResponse.json({ message: 'Email processed successfully' });
    }

    return NextResponse.json({ message: 'Unhandled SNS type' });

  } catch (error) {
    console.error('Error processing SES webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
