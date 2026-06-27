---
title: 'CI/CD with GitHub Actions for Static Sites'
description: 'A simple, fast GitHub Actions workflow that builds a statically exported site and deploys it to GitHub Pages on every push.'
date: '2026-02-08'
tags: ['CI/CD', 'GitHub Actions', 'DevOps']
cover: '/images/articles/github-actions-static-deploy.svg'
---

Static sites are the easiest thing to deploy well: build once, ship the files, done. GitHub Actions makes that automatic on every push.

## The shape of the workflow

Install dependencies, build the export, then upload and deploy the output folder.

```yaml
- uses: actions/checkout@v4
- run: corepack enable && pnpm install --frozen-lockfile
- run: pnpm build
- uses: actions/upload-pages-artifact@v3
  with:
    path: ./out
```

## Keep it fast

- Cache the package store so installs are near-instant.
- Pin action versions for reproducible runs.
- Fail the build on lint errors so problems never reach production.

Because the output is just static files, a deploy is atomic and a rollback is one revert away.

## Fixing commit authorship

Migrated repos sometimes carry the wrong author on past commits. This script rewrites authorship across history:

https://gist.github.com/octocat/0831f3fbd83ac4d46451
