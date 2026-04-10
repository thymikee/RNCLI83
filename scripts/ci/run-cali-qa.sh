#!/usr/bin/env bash

set -uo pipefail

PLATFORM="${1:?platform is required}"
ARTIFACT_PATH="${2:?artifact path is required}"
PROMPT="${3:-Run a lightweight smoke test of app launch and the primary visible flow. Report blockers clearly and capture screenshots for meaningful states.}"
OUTPUT_DIR="${4:-./artifacts/qa}"
CONTEXT_PATH="./.cali/cali-context.json"

mkdir -p ./.cali "${OUTPUT_DIR}"

case "${PLATFORM}" in
  ios)
    PLATFORM_LABEL="iOS"
    ;;
  android)
    PLATFORM_LABEL="Android"
    ;;
  *)
    PLATFORM_LABEL="${PLATFORM}"
    ;;
esac

set +e
npx cali write-mobile-pr-context \
  --from github-actions \
  --output "${CONTEXT_PATH}" \
  --platform "${PLATFORM}" \
  --artifact "${ARTIFACT_PATH}" \
  --output-dir "${OUTPUT_DIR}"
CONTEXT_EXIT=$?

if [ "${CONTEXT_EXIT}" -eq 0 ]; then
  npx cali qa \
    --env mobile-pr \
    --context "${CONTEXT_PATH}" \
    --prompt "${PROMPT}"
  EXIT_CODE=$?
else
  EXIT_CODE="${CONTEXT_EXIT}"
fi
set -e

STATUS="$(cat "${OUTPUT_DIR}/status.txt" 2>/dev/null || printf blocked)"

if [ ! -f "${OUTPUT_DIR}/report.json" ]; then
  FALLBACK_SUMMARY="The Cali QA command failed before it could publish a report. Check the workflow logs above."
  cat > "${OUTPUT_DIR}/status.txt" <<EOF
blocked
EOF
  cat > "${OUTPUT_DIR}/section.md" <<EOF
### ${PLATFORM_LABEL}

**Status:** blocked

${FALLBACK_SUMMARY}
EOF
  cat > "${OUTPUT_DIR}/top-issue.txt" <<EOF
${FALLBACK_SUMMARY}
EOF
  cat > "${OUTPUT_DIR}/summary.txt" <<EOF
${FALLBACK_SUMMARY}
EOF
  cat > "${OUTPUT_DIR}/screenshots.json" <<EOF
{"command":"qa","platform":"${PLATFORM}","screenshots":[]}
EOF
  cat > "${OUTPUT_DIR}/comment-github.md" <<EOF
### ${PLATFORM_LABEL} QA

**Status:** blocked

${FALLBACK_SUMMARY}
EOF
  STATUS="blocked"
fi

if [ ! -f "${OUTPUT_DIR}/comment-github.md" ] && [ -f "${OUTPUT_DIR}/section.md" ]; then
  cp "${OUTPUT_DIR}/section.md" "${OUTPUT_DIR}/comment-github.md"
fi

printf '%s\n' "${STATUS}" > "${OUTPUT_DIR}/status.txt"
exit "${EXIT_CODE}"
