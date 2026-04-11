#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

const args = parseArgs(process.argv.slice(2));
const prNumber = required(args.pr, '--pr');
const commentPath = required(args.comment, '--comment');
const markerName = required(args.marker, '--marker');
const fallbackHeading = args['fallback-heading'];
const repository = required(process.env.GITHUB_REPOSITORY, 'GITHUB_REPOSITORY');
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

if (!token) {
  throw new Error('GITHUB_TOKEN or GH_TOKEN is required.');
}

const marker = `<!-- ${markerName} -->`;
const fileBody = await readFile(commentPath, 'utf8');
const body = fileBody.includes(marker) ? fileBody : `${marker}\n${fileBody}`;
const [owner, repo] = repository.split('/');

if (!owner || !repo) {
  throw new Error(`Invalid GITHUB_REPOSITORY value: ${repository}`);
}

const existingComment = await findExistingComment({
  owner,
  repo,
  prNumber,
  marker,
  fallbackHeading,
  token,
});

if (existingComment) {
  await githubRequest({
    token,
    method: 'PATCH',
    path: `/repos/${owner}/${repo}/issues/comments/${existingComment.id}`,
    body: { body },
  });
  console.log(`Updated existing PR comment ${existingComment.html_url}`);
} else {
  const created = await githubRequest({
    token,
    method: 'POST',
    path: `/repos/${owner}/${repo}/issues/${prNumber}/comments`,
    body: { body },
  });
  console.log(`Created PR comment ${created.html_url}`);
}

function parseArgs(rawArgs) {
  const parsed = {};

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];

    if (!arg.startsWith('--')) {
      throw new Error(`Unexpected argument: ${arg}`);
    }

    const key = arg.slice(2);
    const value = rawArgs[index + 1];

    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for ${arg}`);
    }

    parsed[key] = value;
    index += 1;
  }

  return parsed;
}

function required(value, name) {
  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

async function findExistingComment({
  owner,
  repo,
  prNumber,
  marker,
  fallbackHeading,
  token,
}) {
  for (let page = 1; ; page += 1) {
    const comments = await githubRequest({
      token,
      path: `/repos/${owner}/${repo}/issues/${prNumber}/comments?per_page=100&page=${page}`,
    });

    const match = comments.find(comment => {
      const commentBody = comment.body ?? '';
      return (
        commentBody.includes(marker) ||
        Boolean(fallbackHeading && commentBody.includes(fallbackHeading))
      );
    });
    if (match) {
      return match;
    }

    if (comments.length < 100) {
      return undefined;
    }
  }
}

async function githubRequest({ token, method = 'GET', path, body }) {
  const response = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `GitHub API ${method} ${path} failed: ${response.status} ${errorBody}`,
    );
  }

  return response.json();
}
