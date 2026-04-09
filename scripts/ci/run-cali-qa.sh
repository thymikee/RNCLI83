#!/usr/bin/env bash

set -euo pipefail

PLATFORM="${1:?platform is required}"
ARTIFACT_PATH="${2:?artifact path is required}"
PROMPT="${3:-Run a lightweight smoke test of app launch and the primary visible flow. Report blockers clearly and capture screenshots for meaningful states.}"
OUTPUT_DIR="${4:-./artifacts/qa}"

mkdir -p ./.cali

npx cali write-mobile-pr-context \
  --from github-actions \
  --output ./.cali/cali-context.json \
  --platform "$PLATFORM" \
  --artifact "$ARTIFACT_PATH" \
  --output-dir "$OUTPUT_DIR"

npx cali qa \
  --env mobile-pr \
  --context ./.cali/cali-context.json \
  --prompt "$PROMPT"
