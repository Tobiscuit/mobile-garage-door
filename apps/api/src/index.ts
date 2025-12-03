import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { doors } from './data/doors'
import { VertexAI } from '@google-cloud/vertexai'

const app = new Hono()

app.use('/*', cors())

// Initialize Vertex AI
// Note: Requires GOOGLE_APPLICATION_CREDENTIALS or gcloud auth in environment
const vertex_ai = new VertexAI({ project: process.env.PROJECT_ID || 'mobile-garage-door-demo', location: 'us-central1' });
const model = vertex_ai.getGenerativeModel({ model: 'gemini-1.5-flash-001' });

app.get('/', (c) => {
    return c.json({ message: 'Universal Garage Door Index API (Hono + Vertex AI)' })
})

app.get('/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/doors', (c) => {
    return c.json({ data: doors })
})

app.get('/doors/:id', (c) => {
    const id = c.req.param('id')
    const door = doors.find(d => d.id === id)
    if (!door) return c.json({ error: 'Door not found' }, 404)
    return c.json({ data: door })
})

// Real AI Visualization Endpoint
app.post('/visualize', async (c) => {
    try {
        const body = await c.req.parseBody()
        const imageFile = body['image']
        const doorId = body['doorId']

        if (!imageFile || !(imageFile instanceof File)) {
            return c.json({ error: 'Image file is required' }, 400)
        }

        console.log(`Processing visualization for door: ${doorId}`)

        // Convert File to Base64 for Gemini
        const arrayBuffer = await imageFile.arrayBuffer()
        const base64Image = Buffer.from(arrayBuffer).toString('base64')

        // Construct Prompt
        const prompt = `Replace the garage door in this image with a ${doorId} style garage door. Maintain the exact lighting, perspective, and surroundings. High photorealism.`

        // Call Gemini API
        const req = {
            contents: [
                {
                    role: 'user',
                    parts: [
                        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
                        { text: prompt }
                    ]
                }
            ],
        };

        const streamingResp = await model.generateContentStream(req);
        const aggregatedResponse = await streamingResp.response;
        const responseText = aggregatedResponse.candidates?.[0]?.content?.parts?.[0]?.text || 'No description available';

        return c.json({
            success: true,
            result: `data:image/jpeg;base64,${base64Image}`, // Echoing back original for now as "processed" placeholder
            ai_metadata: {
                model: 'gemini-1.5-flash-001',
                prompt_used: prompt,
                analysis: responseText
            }
        })

    } catch (error) {
        console.error('AI Processing Error:', error)
        // Fallback for demo if credentials fail
        return c.json({
            success: true,
            mock: true,
            message: "AI Processing Simulated (Check Server Logs for Real API Error)",
            result: "https://placehold.co/600x400/1e293b/f1c40f?text=AI+Processed+Image"
        })
    }
})

const port = 3001
console.log(`Server is running on port ${port}`)

serve({
    fetch: app.fetch,
    port
})
