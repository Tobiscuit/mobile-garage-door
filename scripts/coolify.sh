#!/usr/bin/env bash
# Coolify helper – pull logs and env vars for an application.
#
# Usage:
#   ./scripts/coolify.sh logs [lines]    – Fetch recent application logs (default: 100 lines)
#   ./scripts/coolify.sh env             – Fetch env vars and write to .env
#   ./scripts/coolify.sh env --print     – Print env vars to stdout (don't write file)
#   ./scripts/coolify.sh apps            – List all applications (to find the UUID)
#
# Config: set these in your shell or in .coolify at project root:
#   COOLIFY_URL    – e.g. https://panel.jrcodex.dev
#   COOLIFY_TOKEN  – API bearer token (read permission is enough)
#   COOLIFY_APP    – Application UUID

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load config from .coolify file if it exists
if [[ -f "$PROJECT_ROOT/.coolify" ]]; then
  # shellcheck disable=SC1091
  source "$PROJECT_ROOT/.coolify"
fi

# Validate required vars
if [[ -z "${COOLIFY_URL:-}" || -z "${COOLIFY_TOKEN:-}" ]]; then
  echo "Error: COOLIFY_URL and COOLIFY_TOKEN must be set."
  echo "Either export them or create a .coolify file in the project root:"
  echo ""
  echo "  COOLIFY_URL=https://panel.jrcodex.dev"
  echo "  COOLIFY_TOKEN=your-api-token-here"
  echo "  COOLIFY_APP=your-app-uuid"
  exit 1
fi

API="${COOLIFY_URL}/api/v1"
AUTH="Authorization: Bearer ${COOLIFY_TOKEN}"

# ── List applications ────────────────────────────────────────────
cmd_apps() {
  echo "Fetching applications..."
  curl -sS -H "$AUTH" "${API}/applications" \
    | python3 -m json.tool 2>/dev/null \
    || curl -sS -H "$AUTH" "${API}/applications"
}

# ── Fetch logs ───────────────────────────────────────────────────
cmd_logs() {
  local lines="${1:-100}"

  if [[ -z "${COOLIFY_APP:-}" ]]; then
    echo "Error: COOLIFY_APP must be set (application UUID)."
    echo "Run './scripts/coolify.sh apps' to find it."
    exit 1
  fi

  echo "Fetching last ${lines} lines of logs for app ${COOLIFY_APP}..."
  curl -sS -H "$AUTH" "${API}/applications/${COOLIFY_APP}/logs?limit=${lines}" \
    | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if isinstance(data, list):
        for entry in data:
            ts = entry.get('timestamp', '')
            msg = entry.get('message', entry.get('output', str(entry)))
            print(f'{ts} {msg}')
    elif isinstance(data, dict) and 'logs' in data:
        for entry in data['logs']:
            ts = entry.get('timestamp', '')
            msg = entry.get('message', entry.get('output', str(entry)))
            print(f'{ts} {msg}')
    else:
        print(json.dumps(data, indent=2))
except:
    print(sys.stdin.read())
" 2>/dev/null || curl -sS -H "$AUTH" "${API}/applications/${COOLIFY_APP}/logs?limit=${lines}"
}

# ── Fetch env vars ───────────────────────────────────────────────
cmd_env() {
  local print_only="${1:-}"

  if [[ -z "${COOLIFY_APP:-}" ]]; then
    echo "Error: COOLIFY_APP must be set (application UUID)."
    echo "Run './scripts/coolify.sh apps' to find it."
    exit 1
  fi

  echo "Fetching environment variables for app ${COOLIFY_APP}..."
  local raw
  raw=$(curl -sS -H "$AUTH" "${API}/applications/${COOLIFY_APP}/envs")

  local env_content
  env_content=$(echo "$raw" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if isinstance(data, list):
    for item in data:
        key = item.get('key', '')
        value = item.get('value', '')
        is_build = item.get('is_build_time', False)
        preview = item.get('is_preview', False)
        comment = []
        if is_build: comment.append('build-time')
        if preview: comment.append('preview')
        suffix = f'  # {', '.join(comment)}' if comment else ''
        # Escape quotes in value
        value = value.replace('\"', '\\\\\"')
        print(f'{key}=\"{value}\"{suffix}')
elif isinstance(data, dict):
    for key, value in data.items():
        print(f'{key}=\"{value}\"')
" 2>/dev/null)

  if [[ "$print_only" == "--print" ]]; then
    echo "$env_content"
  else
    echo "$env_content" > "$PROJECT_ROOT/.env"
    echo ""
    echo "✓ Wrote $(echo "$env_content" | wc -l) env vars to .env"
    echo ""
    # Add .env to gitignore if not already there
    if ! grep -q '^\.env$' "$PROJECT_ROOT/.gitignore" 2>/dev/null; then
      echo '.env' >> "$PROJECT_ROOT/.gitignore"
      echo "✓ Added .env to .gitignore"
    fi
  fi
}

# ── Main ─────────────────────────────────────────────────────────
case "${1:-}" in
  apps)  cmd_apps ;;
  logs)  cmd_logs "${2:-100}" ;;
  env)   cmd_env "${2:-}" ;;
  *)
    echo "Usage: $0 {apps|logs [lines]|env [--print]}"
    exit 1
    ;;
esac
