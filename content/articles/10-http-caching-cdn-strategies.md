---
title: 'HTTP Caching and CDN Strategies'
description: 'How cache headers and a CDN cut latency and origin load: immutable assets, stale-while-revalidate, and sensible defaults.'
date: '2026-06-18'
tags: ['Performance', 'CDN', 'Web']
---

The fastest request is the one that never reaches your server. HTTP caching and a CDN put responses close to the user and spare the origin from repeat work.

## Where a response can live

A browser caches for one user; a CDN caches for everyone in a region. The origin only runs when both miss.

```mermaid
graph LR;
    A[Browser cache] -->|miss| B[CDN edge cache];
    B -->|miss| C[Origin server];
    C -->|response + headers| B;
    B -->|cached copy| A;
```

## Cache headers that matter

`Cache-Control` decides who may cache a response and for how long:

```text
Cache-Control: public, max-age=31536000, immutable
```

`immutable` tells the browser never to revalidate, which is perfect for hashed asset filenames.

## Serve stale while you refresh

`stale-while-revalidate` returns the cached copy instantly and refreshes in the background, so users never wait on a revalidation:

```text
Cache-Control: public, max-age=60, stale-while-revalidate=600
```

## Setting headers at the edge

A small edge rule can apply caching by path:

```js cdn/headers.js
export default function onRequest({ request, next }) {
    const response = next();
    if (request.url.includes('/static/')) {
        response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }
    return response;
}
```

## Invalidate by changing the name

Do not fight the cache with purges. Hash the filename so a new build is a new URL, and the old one can stay cached forever.

## A full caching config

Header rules for HTML, assets, and API responses together:

https://gist.github.com/octocat/6cad326836d38bd3a7ae

Cache immutable assets aggressively, keep HTML short-lived with revalidation, and let the CDN absorb the traffic.
