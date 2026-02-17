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
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
      return new Response('Expected Upgrade: websocket', { status: 426 });
    }

    // 1. Create a WebSocket pair for the Client <-> Worker connection
    const [client, server] = Object.values(new WebSocketPair());

    // 2. Connect to Google Gemini
    // Using the "GenerativeService" which is the simpler v1beta endpoint for Multimodal Live
    const geminiUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${env.GEMINI_API_KEY}`;
    
    let geminiWs: WebSocket | null = null;

    try {
        // Cloudflare Workers can "fetch" a WebSocket URL to connect upstream
        const response = await fetch(geminiUrl, {
            headers: { 'Upgrade': 'websocket' }
        });
        
        // Check if the upstream connection was accepted
        if (response.status !== 101) {
             throw new Error(`Gemini refused connection: ${response.status} ${response.statusText}`);
        }

        geminiWs = response.webSocket;
    } catch (e: any) {
        console.error("Gemini Connection Error:", e);
        return new Response(`Failed to connect to Gemini: ${e.message}`, { status: 502 });
    }

    // 3. Accept the client connection
    server.accept();
    
    if (geminiWs) {
        geminiWs.accept();

        // 4. Setup "Pass-through" Bridge
        
        // Client -> Gemini
        server.addEventListener('message', event => {
            // Forward raw data chunks
            geminiWs?.send(event.data);
        });

        // Gemini -> Client
        geminiWs.addEventListener('message', event => {
            server.send(event.data);
        });

        // 5. Setup Live Persona (The "Service Hero")
        // We send this system prompt immediately upon the 'open' event of the *upstream* connection
        // However, since we just accepted it, we can send it now.
        // NOTE: The Gemini API might need a moment or an initial setup message structure.
        
        const setupMessage = {
          setup: {
            model: "models/gemini-2.0-flash-exp", 
            generationConfig: {
              responseModalities: ["AUDIO", "TEXT"],
            },
            systemInstruction: {
              parts: [{ 
                 text: "You are 'Service Hero', a veteran Garage Door Technician. You are analyzing a video stream. Your goal is to diagnose issues. Be professional, reassuring, and concise. Identify noise, movement, and broken parts." 
              }]
            }
          }
        };
        geminiWs.send(JSON.stringify(setupMessage));
        
        // Handle Closures
        const safeClose = () => {
            try { server.close(); } catch(e){}
            try { geminiWs?.close(); } catch(e){}
        };

        server.addEventListener('close', safeClose);
        server.addEventListener('error', safeClose);
        geminiWs.addEventListener('close', safeClose);
        geminiWs.addEventListener('error', safeClose);
    }

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  },
};
