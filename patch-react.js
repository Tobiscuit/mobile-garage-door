const fs = require('fs');
const glob = require('glob');

// Use hardcoded paths if glob isn't perfect, but let's just find everything
const { execSync } = require('child_process');
const files = execSync('find node_modules/react-server-dom-webpack -type f -name "*.js"').toString().split('\n').filter(Boolean);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Next.js/React server formatting usually does something like:
  // errorInfo = { digest: customDigest || defaultDigest }
  // We want to force development mode error reporting in production.
  // We can look for `error.message` being stripped or `digest` being created.
  
  // Or we can just patch `new Error("An error occurred in the Server Components render...")`.
  // Wait, the client generates this string because the server only sends the digest.
  // Actually, we can patch `process.env.NODE_ENV` checks inside the server bundle to 'development'.
  if (content.includes('process.env.NODE_ENV === "production"')) {
     // replace with something that forces dev mode for error reporting if we can, but that is risky
  }
}
