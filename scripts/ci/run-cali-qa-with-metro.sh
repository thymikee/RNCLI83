#!/usr/bin/env bash

set -euo pipefail

PLATFORM="${1:?PLATFORM argument is required}"
ARTIFACT_PATH="${2:?ARTIFACT_PATH argument is required}"
QA_PROMPT="${3:-}"
METRO_PORT="${METRO_PORT:-8081}"
METRO_LOG="${METRO_LOG:-artifacts/qa/metro.log}"

mkdir -p artifacts/qa

npm start -- --port "$METRO_PORT" >"$METRO_LOG" 2>&1 &
METRO_PID=$!

cleanup_metro() {
  if kill -0 "$METRO_PID" 2>/dev/null; then
    kill "$METRO_PID" 2>/dev/null || true
    wait "$METRO_PID" 2>/dev/null || true
  fi
}
trap cleanup_metro EXIT

if ! METRO_PORT="$METRO_PORT" node ./scripts/ci/wait-for-metro.mjs; then
  tail -200 "$METRO_LOG" || true
  exit 1
fi

agent-device devices --platform "$PLATFORM"
npx cali qa \
  --ci github-actions \
  --quiet \
  --platform "$PLATFORM" \
  --artifact "$ARTIFACT_PATH" \
  --prompt "$QA_PROMPT"
