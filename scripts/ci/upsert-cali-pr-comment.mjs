#!/usr/bin/env node

import fs from 'node:fs/promises';

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      throw new Error(`Unexpected argument: ${token}`);
    }

    const key = token.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for ${token}`);
    }

    args[key] = value;
    index += 1;
  }

  return args;
}

async function githubRequest(path, init = {}) {
  const token = process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY;

  if (!token) {
    throw new Error('GITHUB_TOKEN is required.');
  }

  if (!repository) {
    throw new Error('GITHUB_REPOSITORY is required.');
  }

  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'rncli83-cali-qa',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}: ${await response.text()}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const platform = args.platform;
  const commentPath = args.comment;

  if (!platform) {
    throw new Error('`--platform` is required.');
  }

  if (!commentPath) {
    throw new Error('`--comment` is required.');
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  const repository = process.env.GITHUB_REPOSITORY;
  if (!eventPath || !repository) {
    throw new Error('GITHUB_EVENT_PATH and GITHUB_REPOSITORY are required.');
  }

  const event = JSON.parse(await fs.readFile(eventPath, 'utf8'));
  const issueNumber = event.pull_request?.number;

  if (!issueNumber) {
    console.log('No pull request detected, skipping comment upsert.');
    return;
  }

  const [owner, repo] = repository.split('/');
  const marker = `<!-- cali-qa:${platform} -->`;
  const commentBody = `${marker}\n${(await fs.readFile(commentPath, 'utf8')).trim()}`;
  const comments = await githubRequest(
    `/repos/${owner}/${repo}/issues/${issueNumber}/comments?per_page=100`,
  );

  const existingComment = comments.find(
    comment => comment.user?.type === 'Bot' && comment.body?.includes(marker),
  );

  if (existingComment) {
    await githubRequest(
      `/repos/${owner}/${repo}/issues/comments/${existingComment.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: commentBody }),
      },
    );
    console.log(`Updated Cali ${platform} PR comment.`);
    return;
  }

  await githubRequest(
    `/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ body: commentBody }),
    },
  );
  console.log(`Created Cali ${platform} PR comment.`);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
