---
title: 'Dockerizing a Next.js App for Production'
description: 'A lean multi-stage Dockerfile for Next.js: smaller images, faster builds, and a non-root runtime that is ready to deploy.'
date: '2026-05-10'
tags: ['Docker', 'Next.js', 'DevOps']
---

A good Next.js image is small, reproducible, and runs as a non-root user. A multi-stage build gets you there.

## Separate the stages

Split dependency installation, the build, and the runtime so each layer caches well and the final image ships only what it needs.

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
USER node
CMD ["pnpm", "start"]
```

## Why it matters

- Smaller images pull and start faster.
- A frozen lockfile keeps builds deterministic.
- Running as `node` instead of root limits the blast radius if something is compromised.

For a static export you can skip the runtime entirely and serve `out/` from any CDN.
