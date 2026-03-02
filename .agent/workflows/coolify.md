---
description: How to fetch Coolify logs and environment variables for this project
---

# Coolify Integration

## Setup (one-time)

1. Create a `.coolify` file in the project root with your credentials:

```bash
cat > .coolify << 'EOF'
COOLIFY_URL=https://panel.jrcodex.dev
COOLIFY_TOKEN=your-api-token-here
COOLIFY_APP=your-app-uuid
EOF
```

2. To find your app UUID, run:
// turbo
```bash
./scripts/coolify.sh apps
```

3. Copy the UUID for the garage door app and update `.coolify`.

## Fetching Logs

// turbo
```bash
./scripts/coolify.sh logs        # last 100 lines
./scripts/coolify.sh logs 500    # last 500 lines
```

## Syncing Environment Variables

// turbo
```bash
./scripts/coolify.sh env          # writes to .env
./scripts/coolify.sh env --print  # prints to stdout without writing
```

## Notes
- The `.coolify` file and `.env` are gitignored.
- The API token only needs `read` permission.
