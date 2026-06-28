---
title: 'Designing a CI/CD Pipeline'
description: 'Stages that catch problems early and ship with confidence: lint, test, build, and deploy, each gating the next.'
date: '2026-06-21'
tags: ['CI/CD', 'DevOps', 'Automation']
---

A good pipeline turns "it works on my machine" into "it works because the pipeline proved it." Each stage gates the next, so a failure stops the line before bad code reaches production.

## The stage flow

```mermaid
graph LR;
    A[Push] --> B[Lint];
    B --> C[Test];
    C --> D[Build];
    D --> E[Deploy to staging];
    E --> F[Deploy to production];
```

## A workflow definition

Jobs run in order, and a red stage blocks everything downstream:

```yaml .github/workflows/ci.yml
name: CI
on: [push]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
```

## Fail fast, fail cheap

Order stages from quickest to slowest. Linting takes seconds and catches the silly mistakes before a multi-minute test suite even starts:

```sh
pnpm lint && pnpm test --bail
```

## Cache the slow parts

Cache dependencies and build output keyed on the lockfile so unchanged installs are near-instant. CI minutes add up fast otherwise.

## Promote, do not rebuild

Build the artifact once and promote the same one through staging to production. Rebuilding per environment invites drift.

## A reusable deploy job

A deploy job with environment protection rules:

https://gist.github.com/octocat/6cad326836d38bd3a7ae

Keep stages ordered, fast feedback first, and ship the exact artifact you tested.
