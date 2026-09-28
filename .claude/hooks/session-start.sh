#!/bin/bash
# SessionStart hook for Claude Code on the web.
# Installs the Engram binary and connects it to the team's Engram Cloud server
# so the Engram plugin (hooks + MCP memory tools) works in remote sessions.
#
# Environment variables (set in the cloud environment settings):
#   ENGRAM_CLOUD_TOKEN    bearer token for `engram cloud serve` (required, secret)
#   ENGRAM_CLOUD_SERVER   default: https://engram-production-2280.up.railway.app
#   ENGRAM_PROJECT        default: detected from the git remote (airis-content)
#   ENGRAM_VERSION        default: latest
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

export ENGRAM_NO_UPDATE_CHECK=1
export ENGRAM_CLOUD_SERVER="${ENGRAM_CLOUD_SERVER:-https://engram-production-2280.up.railway.app}"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

log() { printf '[engram-setup] %s\n' "$*" >&2; }

# 1. Install the binary (cached with the container after the first run).
if ! command -v engram >/dev/null 2>&1; then
  log "installing engram ${ENGRAM_VERSION:-latest}..."
  GOBIN=/usr/local/bin go install \
    "github.com/Gentleman-Programming/engram/v2/cmd/engram@${ENGRAM_VERSION:-latest}"
fi

# 2. Register the stdio MCP server in user scope (same step the plugin runs).
engram setup claude-code --mcp-only >/dev/null 2>&1 \
  || log "warning: 'engram setup claude-code --mcp-only' failed"

# 3. Persist settings for the plugin's hooks and for Bash commands.
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  {
    echo 'export ENGRAM_NO_UPDATE_CHECK=1'
    echo 'export ENGRAM_CLOUD_AUTOSYNC=1'
    echo "export ENGRAM_CLOUD_SERVER=\"$ENGRAM_CLOUD_SERVER\""
  } >> "$CLAUDE_ENV_FILE"
fi

# 4. Connect to Engram Cloud and pull the existing memories.
engram cloud config --server "$ENGRAM_CLOUD_SERVER" >/dev/null

if [ -z "${ENGRAM_CLOUD_TOKEN:-}" ]; then
  log "ENGRAM_CLOUD_TOKEN not set; cloud sync disabled (local-only memory)"
  exit 0
fi

PROJECT="${ENGRAM_PROJECT:-}"
if [ -z "$PROJECT" ]; then
  PROJECT=$(basename -s .git "$(git -C "$PROJECT_DIR" remote get-url origin 2>/dev/null || echo "$PROJECT_DIR")" \
    | tr '[:upper:]' '[:lower:]')
fi

engram cloud enroll "$PROJECT" >/dev/null 2>&1 \
  || log "warning: could not enroll project '$PROJECT'"

(cd "$PROJECT_DIR" && timeout 60s engram sync --cloud --import --project "$PROJECT" >/dev/null 2>&1) \
  || log "warning: cloud import for '$PROJECT' failed or timed out"

log "ready (project: $PROJECT, server: $ENGRAM_CLOUD_SERVER)"
