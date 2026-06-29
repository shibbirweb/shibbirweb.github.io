---
title: 'Understanding Vector Embeddings for Search'
description: 'What embeddings actually are, why cosine similarity works, and how semantic search beats keyword matching for real questions.'
date: '2026-04-05'
tags: ['AI', 'Embeddings', 'Search']
cover: '/images/articles/understanding-vector-embeddings.svg'
category: 'AI Engineering'
difficulty: 'Beginner'
tech: ['Python', 'NumPy', 'OpenAI']
series:
    name: 'Building an LLM Knowledge System'
    order: 1
learn:
    - 'What an embedding vector represents and where it comes from'
    - 'Why cosine similarity captures meaning better than keyword overlap'
    - 'How semantic search answers questions exact-match search misses'
---

An embedding turns text into a list of numbers that captures meaning. Similar ideas land close together in that space, which is what makes semantic search possible.

## Why not just keywords?

Keyword search matches characters. Embeddings match meaning, so "how do I cancel my plan" finds a doc titled "Ending a subscription" even with no shared words.

## Measuring closeness

Most systems compare vectors with cosine similarity, which looks at the angle between them rather than their length:

```py
import numpy as np

def cosine(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
```

## Where it goes wrong

Embeddings inherit the biases and blind spots of their training data, and chunking choices matter a lot. Test retrieval on real queries before trusting it.
