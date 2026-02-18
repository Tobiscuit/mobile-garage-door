import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
dotenv.config();

const PORT = 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is missing in .env');
  process.exit(1);
}

const wss = new WebSocketServer({ port: PORT });

console.log(`🚀 Live API Proxy running on ws://localhost:${PORT}`);

wss.on('connection', (clientWs: WebSocket) => {
  console.log('Client connected');

  // Connect to Google Gemini Live API
  const googleWs = new WebSocket(
    `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${GEMINI_API_KEY}`
  );

  googleWs.on('open', () => {
    console.log('Connected to Gemini');
    
    // Initial Setup: Send Config
    const setupMessage = {
      setup: {
        model: "models/gemini-2.5-flash-native-audio-preview-12-2025", 
        generationConfig: {
          responseModalities: ["AUDIO"],
        },
        outputAudioTranscription: {},
        systemInstruction: {
          parts: [
            { 
              text: `You are "Service Hero", a 20-year veteran Garage Door Technician. 
                      You are interacting with a customer via a live video/audio feed.
                      Your goal is to diagnose their garage door issue by asking them to show you specific parts (springs, rollers, opener).
                      Be concise, professional, and reassuring. 
                      If you identify a dangerous issue (like a broken torsion spring), warn them immediately not to touch it.` 
            }
          ]
        }
      }
    };
    googleWs.send(JSON.stringify(setupMessage));
  });

  googleWs.on('message', (data: Buffer) => {
    // Forward message from Google to Client
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(data);
    }
  });

  googleWs.on('error', (err: Error) => {
    console.error('Gemini Error:', err);
    clientWs.close();
  });

  googleWs.on('close', () => {
    console.log('Gemini Disconnected');
    clientWs.close();
  });

  // Handle Client Messages
  clientWs.on('message', (data: Buffer) => {
    // Forward message from Client to Google
    if (googleWs.readyState === WebSocket.OPEN) {
      googleWs.send(data);
    }
  });

  clientWs.on('close', () => {
    console.log('Client Disconnected');
    googleWs.close();
  });
});
