#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      throw new Error(`Unexpected argument: ${token}`);
    }

    const key = token
      .slice(2)
      .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for ${token}`);
    }

    args[key] = value;
    index += 1;
  }

  return args;
}

function removeUndefinedValues(value) {
  if (Array.isArray(value)) {
    return value
      .map(removeUndefinedValues)
      .filter(entry => entry !== undefined);
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value)
      .map(([entryKey, entryValue]) => [
        entryKey,
        removeUndefinedValues(entryValue),
      ])
      .filter(([, entryValue]) => entryValue !== undefined);

    if (entries.length === 0) {
      return undefined;
    }

    return Object.fromEntries(entries);
  }

  return value ?? undefined;
}

async function readJsonFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content);
}

async function readOptionalEvent() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    return undefined;
  }

  try {
    return await readJsonFile(eventPath);
  } catch {
    return undefined;
  }
}

function resolvePathFromCwd(cwd, filePath) {
  if (!filePath) {
    return undefined;
  }

  return path.isAbsolute(filePath) ? filePath : path.resolve(cwd, filePath);
}

function normalizeLabels(labels) {
  if (!Array.isArray(labels)) {
    return [];
  }

  return labels
    .map(label => {
      if (!label) {
        return undefined;
      }

      if (typeof label === 'string') {
        return label;
      }

      if (typeof label.name === 'string') {
        return label.name;
      }

      return undefined;
    })
    .filter(Boolean);
}

function normalizePullRequest(pullRequest) {
  if (!pullRequest) {
    return undefined;
  }

  return removeUndefinedValues({
    number: pullRequest.number,
    title: pullRequest.title,
    body: pullRequest.body ?? null,
    url: pullRequest.html_url ?? pullRequest.url,
    labels: normalizeLabels(pullRequest.labels),
    isDraft: Boolean(pullRequest.draft ?? pullRequest.isDraft),
    baseBranch: pullRequest.base?.ref ?? pullRequest.baseBranch,
    headBranch: pullRequest.head?.ref ?? pullRequest.headBranch,
  });
}

function normalizeWorkflowRunPullRequest(pullRequest) {
  if (!pullRequest) {
    return undefined;
  }

  return removeUndefinedValues({
    number: pullRequest.number,
    url: pullRequest.html_url ?? pullRequest.url,
    labels: normalizeLabels(pullRequest.labels),
    isDraft: Boolean(pullRequest.draft),
    baseBranch: pullRequest.base?.ref,
    headBranch: pullRequest.head?.ref,
  });
}

async function main() {
  const cwd = process.cwd();
  const args = parseArgs(process.argv.slice(2));
  const event = await readOptionalEvent();
  const workflowRun = event?.workflow_run;
  const [repositoryOwner, repositoryName] = (
    process.env.GITHUB_REPOSITORY ?? ''
  ).split('/');

  const platform = args.platform;
  const artifactPath = args.artifact;
  const outputPath = args.output;

  if (!platform) {
    throw new Error('`--platform <android|ios>` is required.');
  }

  if (!artifactPath) {
    throw new Error('`--artifact <path>` is required.');
  }

  if (!outputPath) {
    throw new Error('`--output <path>` is required.');
  }

  let pullRequest;
  if (args.prJson) {
    pullRequest = normalizePullRequest(
      await readJsonFile(resolvePathFromCwd(cwd, args.prJson)),
    );
  }

  if (!pullRequest) {
    pullRequest =
      normalizePullRequest(event?.pull_request) ??
      normalizeWorkflowRunPullRequest(workflowRun?.pull_requests?.[0]);
  }

  const buildId =
    args.buildId ?? workflowRun?.id?.toString() ?? process.env.GITHUB_RUN_ID;
  const workflowUrl =
    args.workflowUrl ??
    workflowRun?.html_url ??
    (buildId &&
    repositoryOwner &&
    repositoryName &&
    process.env.GITHUB_SERVER_URL
      ? `${process.env.GITHUB_SERVER_URL}/${repositoryOwner}/${repositoryName}/actions/runs/${buildId}`
      : undefined);

  const context = removeUndefinedValues({
    workspaceRoot: resolvePathFromCwd(
      cwd,
      args.workspaceRoot ?? process.env.GITHUB_WORKSPACE ?? cwd,
    ),
    repository:
      repositoryOwner && repositoryName
        ? {
            provider: 'github.com',
            owner: repositoryOwner,
            name: repositoryName,
            webUrl: `${
              process.env.GITHUB_SERVER_URL ?? 'https://github.com'
            }/${repositoryOwner}/${repositoryName}`,
            defaultBranch:
              workflowRun?.head_repository?.default_branch ??
              event?.repository?.default_branch,
            currentBranch:
              args.currentBranch ??
              workflowRun?.head_branch ??
              process.env.GITHUB_REF_NAME,
            commitSha:
              args.commitSha ?? workflowRun?.head_sha ?? process.env.GITHUB_SHA,
          }
        : undefined,
    pullRequest,
    mobile: {
      platform,
      artifactPath: resolvePathFromCwd(cwd, artifactPath),
      appId: args.appId,
      deviceName: args.device,
    },
    build: {
      id: buildId,
      workflowUrl,
      logsUrl: args.logsUrl ?? workflowUrl,
    },
    output: {
      outputDir: resolvePathFromCwd(cwd, args.outputDir ?? './artifacts/qa'),
    },
  });

  const destinationPath = resolvePathFromCwd(cwd, outputPath);
  await fs.mkdir(path.dirname(destinationPath), { recursive: true });
  await fs.writeFile(
    destinationPath,
    `${JSON.stringify(context, null, 2)}\n`,
    'utf8',
  );

  console.log(`Wrote ${destinationPath}`);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
