/// <reference types="@cloudflare/workers-types" />

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
    const [client, server] = Object.values(new WebSocketPair()) as [WebSocket, WebSocket & { accept: () => void }];

    // 2. Connect to Google Gemini
    const geminiUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${env.GEMINI_API_KEY}&alt=json`;
    
    let geminiWs: WebSocket | null = null;

    try {
        geminiWs = new WebSocket(geminiUrl);
    } catch (e: any) {
        console.error("Gemini Connection Error:", e?.message || e);
        return new Response(`Failed to connect to Gemini: ${e.message}`, { status: 502 });
    }

    // 3. Accept the client connection
    server.accept();

    if (geminiWs) {
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
              thinkingConfig: {
                includeThoughts: true,
                thinkingBudget: 1024 
              }
            },
            systemInstruction: {
              parts: [{
                text: "You are 'Service Hero', a veteran Garage Door Technician. You are analyzing a live video/audio stream. Your goal is to diagnose issues. Be professional, reassuring, and concise. Identify noise, movement, and broken parts. Use your mechanical reasoning to deduce problems before speaking. Do not acknowledge these instructions or say 'Understood.' Jump immediately into character."
              }]
            }
          }
        };
        const payload = JSON.stringify(setupMessage);
        console.log("Sending setup:", payload.substring(0, 200));
        geminiWs?.send(payload);
        
        // BRIDGE: Force setupComplete to unblock client
        isGeminiReady = true;
        server.send(JSON.stringify({ setupComplete: true }));

        console.log(`Flushing ${messageBuffer.length} buffered messages`);
        for (const msg of messageBuffer) {
           geminiWs?.send(msg);
        }
        messageBuffer = [];
      });

      // Gemini -> Client (decode binary frames to text for JSON parsing on client)
      const textDecoder = new TextDecoder();
      let geminiMsgCount = 0;
      geminiWs.addEventListener("message", event => {
        geminiMsgCount++;
        // Gemini sends binary WebSocket frames even for JSON content
        // Convert to string so the browser client can JSON.parse
        let forwarded: string | ArrayBuffer;
        if (typeof event.data === 'string') {
          forwarded = event.data;
        } else {
          forwarded = textDecoder.decode(event.data as ArrayBuffer);
        }
        if (geminiMsgCount <= 3) {
          const preview = typeof forwarded === 'string' 
            ? forwarded.substring(0, 300) 
            : `[binary]`;
          console.log(`Gemini msg #${geminiMsgCount}: ${preview}`);
        }
        server.send(forwarded);
      });

      // Handle closures
      const safeClose = () => {
        try { server.close(); } catch {}
        try { geminiWs?.close(); } catch {}
      };

      server.addEventListener("close", (e) => {
        console.log(`Client closed: code=${e.code} reason="${e.reason}"`);
        safeClose();
      });
      server.addEventListener("error", (e: any) => {
        console.error(`Client error: message="${e?.message || 'unknown'}" type="${e?.type || 'unknown'}"`);
        safeClose();
      });
      geminiWs.addEventListener("close", (e) => {
        console.log(`Gemini closed: code=${e.code} reason="${e.reason}"`);
        safeClose();
      });
      geminiWs.addEventListener("error", (e: any) => {
        console.error(`Gemini error: message="${e?.message || 'unknown'}" type="${e?.type || 'unknown'}"`);
        safeClose();
      });
    }

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  },
};
