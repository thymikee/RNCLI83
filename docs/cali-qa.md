# Cali QA Workflow

This project runs `cali qa` inside the existing `.github/workflows/android-build.yml` and `.github/workflows/ios-build.yml` pipelines instead of spawning a separate workflow after the fact.

## What it does

- builds once per platform, then reuses that uploaded artifact in a follow-up QA job inside the same workflow run
- runs Cali QA automatically on `pull_request`
- supports manual `workflow_dispatch` runs with optional QA enabled via `run_cali_qa`
- generates `./.cali/cali-context.json` with `cali write-mobile-pr-context --from github-actions`
- runs `npx cali qa --env mobile-pr`
- uploads the generated `./artifacts/qa` folder
- updates the pull request comment on PR-triggered runs

## Required secrets

Set one of these model auth paths:

- `AI_GATEWAY_API_KEY`
- `ANTHROPIC_API_KEY`

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

## Repo-specific glue

- `scripts/ci/run-cali-qa.sh` wraps the shared `write-mobile-pr-context` and `cali qa` calls.
- `scripts/ci/upsert-cali-pr-comment.mjs` keeps PR comment publishing out of the workflow YAML.

## Gaps to feed back into Cali

- Cali expects an iOS `.app` path at runtime, while this repo's current iOS build workflow publishes `.app.tar.gz`. The required unpack step is not called out in the docs.
- Cali leaves emulator and simulator provisioning to the host workflow. That is workable, but the current instructions do not spell out what CI runners need to provide for Android and iOS QA.
