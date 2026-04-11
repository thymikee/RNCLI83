#!/usr/bin/env bash

set -euo pipefail

PLATFORM="${1:?PLATFORM argument is required}"
ARTIFACT_PATH="${2:?ARTIFACT_PATH argument is required}"
QA_PROMPT="${3:-}"
METRO_PORT="${METRO_PORT:-8081}"
METRO_LOG="${METRO_LOG:-artifacts/qa/metro.log}"
METRO_READY_TIMEOUT_SECONDS="${METRO_READY_TIMEOUT_SECONDS:-60}"

mkdir -p artifacts/qa

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

if [[ "$PLATFORM" == "android" ]]; then
  adb wait-for-device
  adb reverse "tcp:${METRO_PORT}" "tcp:${METRO_PORT}"
  adb shell wm dismiss-keyguard >/dev/null 2>&1 || true
  adb shell cmd statusbar collapse >/dev/null 2>&1 || true

  for package_name in \
    com.google.android.apps.nexuslauncher \
    com.android.launcher3 \
    com.android.launcher \
    com.android.quickstep; do
    adb shell am force-stop "$package_name" >/dev/null 2>&1 || true
  done

  sleep "${ANDROID_DEVICE_STABILIZATION_SECONDS:-5}"
fi

agent-device devices --platform "$PLATFORM"
cali_args=(
  --ci github-actions
  --quiet
  --platform "$PLATFORM"
  --artifact "$ARTIFACT_PATH"
  --prompt "$QA_PROMPT"
)

npx cali qa "${cali_args[@]}"
