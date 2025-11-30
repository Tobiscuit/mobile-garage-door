"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const node_server_1 = require("@hono/node-server");
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
const port = 3001;
console.log(`Server is running on port ${port}`);
(0, node_server_1.serve)({
    fetch: app.fetch,
    port
});
