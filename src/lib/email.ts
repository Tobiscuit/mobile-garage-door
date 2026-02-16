import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import nodemailer from 'nodemailer';
import * as aws from '@aws-sdk/client-ses';

const region = process.env.AWS_REGION || 'us-east-1';
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

// Check if credentials are configured
const isConfigured = accessKeyId && secretAccessKey;

if (!isConfigured) {
  console.warn('AWS SES credentials not found. Email sending will be disabled or logged only.');
}

// 1. Raw SES Client for BetterAuth (lightweight, no nodemailer overhead needed if just sending simple links)
export const sesClient = new SESClient({
  region,
  credentials: {
    accessKeyId: accessKeyId || '',
    secretAccessKey: secretAccessKey || '',
  },
});

// 2. Nodemailer Transport for PayloadCMS (Payload expects a nodemailer transport)
export const emailTransport = isConfigured
  ? nodemailer.createTransport({
      SES: { ses: sesClient, aws },
    } as any)
  : nodemailer.createTransport({
      jsonTransport: true,
    });

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
  if (!isConfigured) {
    console.log(`[Mock Email] To: ${to}, Subject: ${subject}`);
    return;
  }

  const command = new SendEmailCommand({
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Html: html ? { Data: html, Charset: 'UTF-8' } : undefined,
        Text: text ? { Data: text, Charset: 'UTF-8' } : undefined,
      },
      Subject: {
        Data: subject,
        Charset: 'UTF-8',
      },
    },
    Source: from || process.env.SES_FROM_AUTH || 'no-reply@example.com',
  });

  try {
    const response = await sesClient.send(command);
    console.log('Email sent successfully:', response.MessageId);
    return response;
  } catch (error) {
    console.error('Error sending email via SES:', error);
    throw error;
  }
};
