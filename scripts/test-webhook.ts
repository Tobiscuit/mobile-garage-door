import { fetch } from 'undici';

async function testWebhook() {
  const payload = {
    Type: 'Notification',
    MessageId: 'test-message-id',
    TopicArn: 'arn:aws:sns:us-east-1:123456789012:ses-emails',
    Message: JSON.stringify({
      receipt: {
        action: {
          type: 'S3',
          bucketName: 'mobile-garage-door-inbound',
          objectKey: 'test-email-key',
        },
      },
      mail: {
        timestamp: new Date().toISOString(),
        source: 'sender@example.com',
        messageId: 'test-ses-message-id',
        destination: ['recipient@mobilegaragedoor.com'],
      },
    }),
    Timestamp: new Date().toISOString(),
    SignatureVersion: '1',
    Signature: 'dummy-signature',
    SigningCertURL: 'https://sns.us-east-1.amazonaws.com/SimpleNotificationService-test.pem',
    UnsubscribeURL: 'https://sns.us-east-1.amazonaws.com/?Action=Unsubscribe',
  };

  try {
    const response = await fetch('http://localhost:3000/api/webhooks/ses', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain; charset=UTF-8',
        },
        body: JSON.stringify(payload),
    });

    console.log('Status:', response.status);
    console.log('Body:', await response.text());
  } catch (err) {
    console.error('Error:', err);
  }
}

testWebhook();
