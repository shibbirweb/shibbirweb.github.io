---
title: 'Caching Strategies with Redis'
description: 'Cache-aside, write-through, TTLs, and invalidation: choosing a Redis caching strategy that fits your read and write patterns.'
date: '2025-12-15'
updated: '2026-01-08'
tags: ['Redis', 'Backend', 'Performance']
cover: '/images/articles/redis-caching-strategies.svg'
category: 'Backend'
difficulty: 'Intermediate'
tech: ['Redis', 'Node.js']
learn:
    - 'When cache-aside fits and when to reach for write-through'
    - 'Picking an invalidation approach for your freshness needs'
    - 'Guarding hot keys against cache stampedes'
---

Caching is the fastest way to make a read-heavy app feel instant, and the fastest way to serve stale data if you get invalidation wrong.

## Cache-aside is the default

The app checks the cache, falls back to the database on a miss, and writes the result back:

![Cache-aside read path: the app reads from Redis, queries the database on a miss, then writes the value back with a TTL.](/images/articles/inline/redis-cache-aside.svg)

```ts
let user = await redis.get(key);
if (!user) {
    user = await db.users.find(id);
    await redis.set(key, user, 'EX', 3600);
}
```

## Choose an invalidation approach

- TTLs for data that can be briefly stale.
- Explicit deletes on write for data that must be fresh.
- Versioned keys when a single change invalidates many entries at once.

## Watch the edges

Guard against cache stampedes on hot keys, and never let the cache become the source of truth. It is an optimization, not your database.
