// AWS LAMBDA FUNCTION CODE
// Runtime: Node.js 18.x
// Description: Connects Amazon Lex V2 to Mobile Garage Door API
// Environment Variables Required:
// - API_URL: https://your-domain.com/api/service-requests (e.g., https://mobilgaragedoor.com/api/service-requests)
// - API_KEY: YOUR_SECRET_SERVICE_API_KEY (Must match process.env.SERVICE_API_KEY in Next.js)

const https = require('https');
const url = require('url');

exports.handler = async (event) => {
    console.log("Event Received:", JSON.stringify(event, null, 2));

    const intentName = event.sessionState.intent.name;
    const slots = event.sessionState.intent.slots;

    // 1. Validate Intent
    if (intentName !== 'ScheduleRepair') {
        return close(event, 'Failed', 'I am only trained to schedule repairs at this time.');
    }

    // 2. Extract Slots (Data collected by Voice)
    const issueDescription = slots.IssueDescription ? slots.IssueDescription.value.originalValue : 'Unspecified Issue';
    const urgency = slots.Urgency ? slots.Urgency.value.originalValue : 'standard';
    const phoneNumber = slots.CallbackNumber ? slots.CallbackNumber.value.originalValue : 'Unknown';
    // Lex doesn't always get name, but we can try if you add a slot
    const guestName = slots.CustomerName ? slots.CustomerName.value.originalValue : 'Voice Caller'; 

    // 3. Prepare Payload for your API
    const postData = JSON.stringify({
        guestName: guestName,
        guestPhone: phoneNumber,
        guestEmail: `voice-${phoneNumber.replace(/\D/g,'')}@placeholder.com`, // Placeholder email for voice users
        issueDescription: issueDescription,
        urgency: urgency.toLowerCase().includes('emergency') ? 'emergency' : 'standard',
        scheduledTime: new Date().toISOString(), // Immediate dispatch
        amount: 0,
        sourceId: 'PAY_LATER', // Special flag we added to API to skip credit card
        guestAddress: 'Address collected via Dispatcher callback' // Or add Address slot to Lex
    });

    // 4. Call Next.js API
    try {
        const result = await postRequest(postData);
        console.log("API Result:", result);

        // 5. Success Response to User
        return close(event, 'Fulfilled', `I have dispatched a technician for your ${urgency} request. We will call you at ${phoneNumber} within 5 minutes to confirm details.`);

    } catch (error) {
        console.error("API Error:", error);
        return close(event, 'Failed', 'I encountered a system error connecting to the dispatch server. Please call our backup line.');
    }
};

// --- Helper Functions ---

function close(event, fulfillmentState, messageContent) {
    return {
        sessionState: {
            dialogAction: {
                type: 'Close',
                fulfillmentState: fulfillmentState,
                message: {
                    contentType: 'PlainText',
                    content: messageContent
                }
            },
            intent: {
                name: event.sessionState.intent.name,
                state: fulfillmentState
            }
        }
    };
}

function postRequest(data) {
    const apiUrl = process.env.API_URL;
    const apiKey = process.env.API_KEY;
    
    if (!apiUrl || !apiKey) {
        throw new Error("Missing API_URL or API_KEY env vars");
    }

    const parsedUrl = url.parse(apiUrl);
    const options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.pathname,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length,
            'x-api-key': apiKey // Critical for authentication
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(body));
                } else {
                    reject(new Error(`API returned ${res.statusCode}: ${body}`));
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}
