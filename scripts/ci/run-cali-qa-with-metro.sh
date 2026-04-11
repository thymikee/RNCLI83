#!/usr/bin/env bash

set -euo pipefail

PLATFORM="${1:?PLATFORM argument is required}"
ARTIFACT_PATH="${2:?ARTIFACT_PATH argument is required}"
QA_PROMPT="${3:-}"
APP_ID="${4:-}"
METRO_PORT="${METRO_PORT:-8081}"
METRO_LOG="${METRO_LOG:-artifacts/qa/metro.log}"
METRO_READY_TIMEOUT_SECONDS="${METRO_READY_TIMEOUT_SECONDS:-60}"
METRO_BUNDLE_TIMEOUT_SECONDS="${METRO_BUNDLE_TIMEOUT_SECONDS:-120}"

mkdir -p artifacts/qa

preload_metro_bundle() {
  local bundle_url="http://127.0.0.1:${METRO_PORT}/index.bundle?platform=${PLATFORM}&dev=true&minify=false"

  if ! curl --silent --fail --show-error --max-time "$METRO_BUNDLE_TIMEOUT_SECONDS" --output /dev/null "$bundle_url"; then
    echo "Metro failed to prebuild the ${PLATFORM} bundle within ${METRO_BUNDLE_TIMEOUT_SECONDS} seconds."
    tail -200 "$METRO_LOG" || true
    return 1
  fi
}

npm start -- --port "$METRO_PORT" >"$METRO_LOG" 2>&1 &
METRO_PID=$!

METRO_READY=0
for _ in $(seq 1 "$METRO_READY_TIMEOUT_SECONDS"); do
  if curl --silent --fail "http://127.0.0.1:${METRO_PORT}/status" | grep -q "packager-status:running"; then
    METRO_READY=1
    break
  fi

  if ! kill -0 "$METRO_PID" 2>/dev/null; then
    break
  fi

  sleep 1
done

if [[ "$METRO_READY" != "1" ]]; then
  echo "Metro did not become ready on port ${METRO_PORT} within ${METRO_READY_TIMEOUT_SECONDS} seconds."
  tail -200 "$METRO_LOG" || true
  exit 1
fi

preload_metro_bundle

if [[ "$PLATFORM" == "android" ]]; then
  adb wait-for-device
  adb reverse "tcp:${METRO_PORT}" "tcp:${METRO_PORT}"
fi

cali_args=(
  --ci github-actions
  --quiet
  --platform "$PLATFORM"
  --artifact "$ARTIFACT_PATH"
  --prompt "$QA_PROMPT"
)

if [[ -n "$APP_ID" ]]; then
  cali_args+=(--app-id "$APP_ID")
fi

npx cali qa "${cali_args[@]}"
