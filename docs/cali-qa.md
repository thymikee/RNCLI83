# Cali QA Workflow

This project includes a GitHub Actions workflow at `.github/workflows/cali-qa.yml` that runs `cali qa` against build artifacts produced by the existing `Android Build` and `iOS Build` workflows.

## What it does

- listens for successful completions of `Android Build` and `iOS Build`
- can also be run manually with `workflow_dispatch`
- downloads the artifact from the source workflow run with `actions/download-artifact@v5`
- normalizes the source workflow metadata into `./.cali/cali-context.json`
- runs `npx cali qa --env mobile-pr`
- uploads the generated `./artifacts/qa` folder
- updates a pull request comment when the source build came from a PR

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

Use the `Cali QA` workflow dispatch inputs:

- `platform`
- `source_run_id`
- `pr_number` when you want PR metadata and PR comments
- `prompt` when you want a more specific QA focus than the default smoke test

## Repo-specific glue

`scripts/cali/write-workflow-run-context.mjs` exists because the current Cali helper only understands direct `pull_request`-style GitHub Actions payloads. Our QA workflow is triggered by `workflow_run` so it needs a small adapter layer.

The script writes a normalized `cali-context.json` with repository, PR, build, mobile, and output metadata for the downloaded artifact.

## Gaps to feed back into Cali

- `write-mobile-pr-context --from github-actions` does not support `workflow_run` events, which blocks first-class artifact reuse across workflows.
- The docs show how to write context in GitHub Actions, but they do not include an end-to-end example for downloading a build artifact from another run and then running `cali qa`.
- Cali expects an iOS `.app` path at runtime, while this repo's current iOS build workflow publishes `.app.tar.gz`. The required unpack step is not called out in the docs.
- Cali leaves emulator and simulator provisioning to the host workflow. That is workable, but the current instructions do not spell out what CI runners need to provide for Android and iOS QA.
