/**
 * Cloudflare Worker: Gemini Multimodal Live Proxy
 * 
 * Bridges Client WebSockets to Google's Gemini API at the Edge.
 * latency: <50ms
 */

export interface Env {
  GEMINI_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
      return new Response('Expected Upgrade: websocket', { status: 426 });
    }

    // 1. Create a WebSocket pair for the Client <-> Worker connection
    const [client, server] = Object.values(new WebSocketPair());

    // 2. Connect to Google Gemini
    // Using the "GenerativeService" which is the simpler v1beta endpoint for Multimodal Live
    const geminiUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${env.GEMINI_API_KEY}`;
    
    let geminiWs: WebSocket | null = null;

    try {
        // Cloudflare Workers - Use standard WebSocket constructor for external connections
        geminiWs = new WebSocket(geminiUrl);
        
        // We cannot await 'open' on the standard WebSocket object in the same way as a response
        // Setup will happen in the 'open' event listener below.
        
        // Note: We don't need to check response.status here because the 'error' event will fire if connection fails.
    } catch (e: any) {
        console.error("Gemini Connection Error:", e);
        return new Response(`Failed to connect to Gemini: ${e.message}`, { status: 502 });
    }

    // 3. Accept the client connection
    server.accept();

    if (geminiWs) {
      // Standard WebSocket does not have an .accept() method.
      // It connects automatically.
      let isGeminiReady = false;
      let messageBuffer: Array<string | ArrayBuffer> = [];
      const maxBufferedMessages = 200;

      // Client -> Gemini (buffer until setupComplete)
      server.addEventListener("message", event => {
        const payload = event.data as string | ArrayBuffer;

        if (isGeminiReady && geminiWs?.readyState === WebSocket.OPEN) {
          geminiWs.send(payload);
          return;
        }

        if (messageBuffer.length >= maxBufferedMessages) {
          messageBuffer.shift();
        }
        messageBuffer.push(payload);
      });

      geminiWs.addEventListener("open", () => {
        console.log("Connected to Gemini API");
        const setupMessage = {
          setup: {
            model: "models/gemini-2.5-flash-native-audio-preview-12-2025",
            generationConfig: {
              responseModalities: ["AUDIO"],
            },
            outputAudioTranscription: {},
            systemInstruction: {
              parts: [{
                text: "You are 'Service Hero', a veteran Garage Door Technician. You are analyzing a video stream. Your goal is to diagnose issues. Be professional, reassuring, and concise. Identify noise, movement, and broken parts."
              }]
            }
          }
        };
        geminiWs?.send(JSON.stringify(setupMessage));
      });

      // Gemini -> Client (detect setupComplete and flush buffered media once ready)
      geminiWs.addEventListener("message", event => {
        try {
          if (typeof event.data === "string") {
            const parsed = JSON.parse(event.data) as { setupComplete?: unknown };
            if (!isGeminiReady && parsed.setupComplete) {
              isGeminiReady = true;
              console.log(`Gemini setup complete, flushing ${messageBuffer.length} buffered messages`);
              for (const msg of messageBuffer) {
                if (geminiWs?.readyState === WebSocket.OPEN) {
                  geminiWs.send(msg);
                }
              }
              messageBuffer = [];
            }
          }
        } catch {
          // Non-JSON payloads are forwarded as-is.
        }

        server.send(event.data);
      });

      // Handle closures
      const safeClose = () => {
        try { server.close(); } catch {}
        try { geminiWs?.close(); } catch {}
      };

      server.addEventListener("close", safeClose);
      server.addEventListener("error", safeClose);
      geminiWs.addEventListener("close", safeClose);
      geminiWs.addEventListener("error", safeClose);
    }

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  },
};
