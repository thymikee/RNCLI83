# Cali QA Workflow

This project runs `cali qa` directly inside the existing `.github/workflows/android-build.yml` and `.github/workflows/ios-build.yml` pipelines instead of spawning a separate workflow or generating a separate Cali context file.

## What it does

- builds once per platform, then reuses that uploaded artifact in a follow-up QA job inside the same workflow run
- runs Cali QA automatically on `pull_request`
- supports manual `workflow_dispatch` runs with optional QA enabled via `run_cali_qa`
- runs `npx cali qa --ci github-actions --platform <android|ios> --artifact <path>`
- runs `npx cali export-ci --report ./artifacts/qa/report.json`
- uploads the generated `./artifacts/qa` folder
- posts `./artifacts/qa/ci-comment.md` to the pull request on PR-triggered runs

## Required secrets

Set one of these model auth paths:

- `AI_GATEWAY_API_KEY`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_AUTH_TOKEN`

Optional:

- `BLOB_READ_WRITE_TOKEN`
  Use this if you want Cali screenshot links in the PR comment instead of only files in the uploaded artifact.

Optional repository variable:

- `QA_MODEL`
  If omitted, Cali falls back to its default model.

## Manual runs

Use the existing platform build workflow dispatch inputs:

- `run_cali_qa`
- `qa_prompt`
- the existing build-specific inputs such as `android_variant`, `ios_scheme`, or `ios_configuration`

## Stable Cali outputs used by CI

- `report.json`
- `section.md`
- `status.txt`
- `summary.txt`
- `top-issue.txt`
- `screenshots.md`
- `screenshots.json`
- `publisher-manifest.json`
- `ci-comment.md`
- `ci-output.json`

## What stays outside Cali

- building the app artifact
- booting the simulator or emulator
- posting the PR comment with `gh`

## Notes for maintainers

- The old standalone context-writer flow is no longer used.
- The old `render-comment` command is no longer used.
- Downstream CI should not depend on removed outputs such as `comment-github.md` or `status-label.txt`.
