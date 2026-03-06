const fs = require('fs');
const path = require('path');

const serverEdgeProd = path.join(__dirname, 'node_modules', 'react-server-dom-webpack', 'cjs', 'react-server-dom-webpack-server.edge.production.js');

if (fs.existsSync(serverEdgeProd)) {
    let content = fs.readFileSync(serverEdgeProd, 'utf8');

    // React Server DOM Webpack formats the error payload in serializeError or logRecoverableError
    // Typically it looks like:
    // function logRecoverableError(error, request) { ... return { digest: digest } }
    // We want to patch whatever constructs the `{ digest: ... }` to also include `message: error.message, stack: error.stack`

    // Let's just aggressively replace the static string "digest" in the JSON serialization if we can,
    // or patch the default onError handler.

    // The easiest way is to patch the global Error object's toJSON, or we can look for `digest:`
    content = content.replace(/digest:\s*([a-zA-Z0-9_]+)/g, 'digest: $1, message: String(error && error.message ? error.message : "Unknown"), stack: String(error && error.stack ? error.stack : "Unknown")');

    fs.writeFileSync(serverEdgeProd, content);
    console.log('Successfully patched React Server DOM Webpack Server (Edge Production) to leak errors.');
} else {
    console.log('File not found:', serverEdgeProd);
}

const clientEdgeProd = path.join(__dirname, 'node_modules', 'react-server-dom-webpack', 'cjs', 'react-server-dom-webpack-client.edge.production.js');
const clientBrowserProd = path.join(__dirname, 'node_modules', 'react-server-dom-webpack', 'cjs', 'react-server-dom-webpack-client.browser.production.js');

function patchClient(file) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        // The client parses the JSON buffer: buffer = JSON.parse(buffer); streamState = resolveErrorProd(); streamState.digest = buffer.digest;
        // We want to also attach buffer.message and buffer.stack
        content = content.replace(/streamState\.digest\s*=\s*buffer\.digest;/g, 'streamState.digest = buffer.digest; streamState.message = buffer.message || streamState.message; streamState.stack = buffer.stack || streamState.stack;');
        fs.writeFileSync(file, content);
        console.log('Successfully patched Client handler:', file);
    }
}

patchClient(clientEdgeProd);
patchClient(clientBrowserProd);
