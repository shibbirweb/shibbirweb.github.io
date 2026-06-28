---
title: 'PostgreSQL Query Optimization: Indexes That Matter'
description: 'Reading EXPLAIN ANALYZE, choosing the right index, and avoiding the sequential scans that quietly slow your app down.'
date: '2026-03-18'
tags: ['PostgreSQL', 'Databases', 'Performance']
cover: '/images/articles/postgresql-query-optimization.svg'
---

Most slow queries are not slow because of the database. They are slow because of a missing index or a query the planner cannot use one for.

## Start with EXPLAIN ANALYZE

Always measure before you change anything:

```sql
EXPLAIN ANALYZE
SELECT * FROM orders WHERE customer_id = 42 ORDER BY created_at DESC;
```

A sequential scan on a large table is your signal to add an index.

## Pick the right index

- B-tree for equality and range filters.
- Composite indexes when you filter and sort together, in that column order.
- Partial indexes when you only ever query a subset of rows.

## Keep them honest

Indexes speed up reads but cost you on writes and storage. Add them deliberately, then re-check the plan to confirm they are actually used.
