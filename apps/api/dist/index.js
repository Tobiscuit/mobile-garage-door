"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const node_server_1 = require("@hono/node-server");
const doors_1 = require("./data/doors");
const nano_banana_2_node_1 = require("@google/nano-banana-2-node");
// Mock vector similarity function (Cosine Similarity)
function cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}
const app = new hono_1.Hono();
app.get('/', (c) => {
    return c.json({
        message: 'Universal Garage Door Index API',
        version: '1.0.0',
        status: 'operational'
    });
});
app.get('/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// GET /doors: List all doors with pagination
app.get('/doors', (c) => {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '10');
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = doors_1.doors.slice(startIndex, endIndex);
    return c.json({
        page,
        limit,
        total: doors_1.doors.length,
        data: results
    });
});
// GET /doors/search: Semantic search using vector embeddings
app.get('/doors/search', (c) => {
    const query = c.req.query('q');
    if (!query) {
        return c.json({ error: 'Query parameter "q" is required' }, 400);
    }
    // In a real app, we would generate an embedding for the query using the model.
    // Here we will just pick a random embedding or one from the existing doors to simulate a match,
    // or just mock the logic since we don't have the model running here to embed the text.
    // For demonstration, let's assume the query "steel" maps to a specific vector (mock).
    const mockQueryEmbedding = [0.02, -0.1, 0.05, 0.85]; // Mock vector
    const results = doors_1.doors.map(door => ({
        ...door,
        similarity: cosineSimilarity(door.embedding, mockQueryEmbedding)
    }))
        .sort((a, b) => b.similarity - a.similarity);
    return c.json(results);
});
// GET /doors/:id: Detailed specs
app.get('/doors/:id', (c) => {
    const id = c.req.param('id');
    const door = doors_1.doors.find(d => d.id === id);
    if (!door) {
        return c.json({ error: 'Door not found' }, 404);
    }
    return c.json(door);
});
// GET /model/weights: Serve the quantized Nano Banana 2 Pro model weights
app.get('/model/weights', (c) => {
    // In a real scenario, this would stream a large file.
    // We will just return a dummy response or headers for now.
    c.header('Content-Type', 'application/octet-stream');
    c.header('Content-Disposition', 'attachment; filename="nano-banana-2-pro.bin"');
    // Simulate a file stream
    return c.text('BINARY_MODEL_DATA_WOULD_BE_HERE');
});
// POST /visualize: Server-Side Fallback for AI
app.post('/visualize', async (c) => {
    try {
        const body = await c.req.parseBody();
        const image = body['image']; // Assuming multipart/form-data or similar where image is a file/blob
        if (!image) {
            return c.json({ error: 'Image is required' }, 400);
        }
        // Run inference (Pro Model)
        // Since NanoBanana2 is mocked, this will just call the mock.
        const result = await nano_banana_2_node_1.NanoBanana2.run(image);
        return c.json(result);
    }
    catch (error) {
        console.error('Visualization error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
const port = 3001;
console.log(`Server is running on port ${port}`);
(0, node_server_1.serve)({
    fetch: app.fetch,
    port
});
