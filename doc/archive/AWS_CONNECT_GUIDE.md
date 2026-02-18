# Amazon Connect & Lex Integration Guide

This guide outlines how to set up an AI Call Center using Amazon Connect and Amazon Lex to handle garage door service calls.

## Overview
- **Amazon Connect**: Cloud contact center that provides the phone number and call flow logic.
- **Amazon Lex**: AI chatbot (voice & text) that understands intent (e.g., "I need a repair", "Schedule maintenance").
- **Integration**: Lex will collect information from the caller and then trigger a Lambda function to call your `mobile-garage-door` API.

## Step 1: Create Amazon Lex Bot
1. Go to AWS Console > **Amazon Lex**.
2. **Create Bot**: Name it `GarageDoorAssistant`.
3. **Create Intent**: `ScheduleRepair`.
4. **Add Utterances**:
   - "My garage door is broken"
   - "I need a repair"
   - "Schedule a technician"
5. **Add Slots** (Information to collect):
   - `IssueDescription` (Free form text)
   - `Urgency` (Slot type: Standard/Emergency)
   - `CallbackNumber` (AMAZON.PhoneNumber)
6. **Confirmation**: "I have your request for a {Urgency} repair. A technician will call you back at {CallbackNumber} shortly. Is this correct?"

## Step 2: Create AWS Lambda Function
1. Go to AWS Console > **Lambda**.
2. Create Function: `GarageDoorBookingHandler` (Node.js 18.x).
3. **Code**: This function will receive data from Lex and call your Next.js API.

```javascript
const https = require('https');

exports.handler = async (event) => {
    const slots = event.sessionState.intent.slots;
    
    const bookingData = {
        guestName: "Voice Caller", // Or ask for name in Lex
        guestPhone: slots.CallbackNumber.value.originalValue,
        issueDescription: slots.IssueDescription.value.originalValue,
        urgency: slots.Urgency.value.originalValue.toLowerCase(),
        // ... other fields
    };

    // Call your Next.js API
    // POST https://your-domain.com/api/service-requests
    
    // Return response to Lex
    return {
        sessionState: {
            dialogAction: {
                type: "Close",
                fulfillmentState: "Fulfilled",
                message: {
                    contentType: "PlainText",
                    content: "Your request has been dispatched. You will receive an SMS shortly."
                }
            },
            intent: {
                name: event.sessionState.intent.name,
                state: "Fulfilled"
            }
        }
    };
};
```

## Step 3: Set Up Amazon Connect
1. Go to AWS Console > **Amazon Connect**.
2. **Add an Instance** and claim a phone number.
3. **Create Contact Flow**:
   - **Entry Point**: Inbound Call.
   - **Get Customer Input**: Select "Amazon Lex" tab.
   - **Choose Bot**: Select `GarageDoorAssistant`.
   - **Branch**:
     - If Intent = `ScheduleRepair` -> Play prompt "Dispatching now..." -> Disconnect.
     - If Error -> Transfer to human queue.

## Complexity Assessment
- **High Complexity**: Setting up the AWS IAM permissions, Lambda networking, and fine-tuning the Lex conversation model can be tricky.
- **Alternative**: **Twilio Voice AI** or **Vapi.ai** are often developer-friendlier for this specific "Voice-to-API" use case and integrate faster with Next.js.

## Recommendation
Start with the **Web Booking Flow** (`/book-service`) we just built. It's live and works perfectly for "Call Now" buttons (which can open the link on mobile). Add the Voice AI layer later as you scale.
