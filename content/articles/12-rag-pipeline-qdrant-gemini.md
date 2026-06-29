---
title: 'Building a RAG Pipeline with Qdrant and Gemini'
description: 'A practical walkthrough of retrieval-augmented generation: chunking, embeddings, vector search with Qdrant, and grounding answers with Gemini.'
date: '2026-06-20'
updated: '2026-06-26'
tags: ['AI', 'RAG', 'Qdrant', 'Embeddings']
cover: '/images/articles/rag-pipeline-qdrant-gemini.svg'
category: 'AI Engineering'
difficulty: 'Advanced'
tech: ['Qdrant', 'Gemini', 'Python', 'FastAPI']
series:
    name: 'Building an LLM Knowledge System'
    order: 3
learn:
    - 'How to chunk documents so retrieval stays relevant'
    - 'Storing and querying embeddings in Qdrant'
    - 'Grounding Gemini answers in retrieved context to cut hallucinations'
    - 'Wiring the retrieve-then-generate loop behind an API'
---

Retrieval-augmented generation (RAG) grounds a language model in your own data, so answers stay accurate and current without retraining. Here is the pipeline I reach for.

## The four stages

1. Chunk the source documents into passages.
2. Embed each chunk into a vector.
3. Store the vectors in Qdrant for fast similarity search.
4. Retrieve the top matches and pass them to Gemini as context.


1. **Build the Docker Image**: Use the `Dockerfile` to build the Docker image for the Express application.
   ```sh
   docker build -t express-lb .
   ```

## Request Workflow Diagram

```mermaid
graph TD;
    A[Client] -->|HTTP Request| B[Nginx Load Balancer :8000];
    B -->|Round Robin<br/>Primary| C[App Instance 1 :4500];
    B -->|Round Robin<br/>Primary| D[App Instance 2 :4501];
    B -->|Backup<br/>if 1 & 2 down| E[App Instance 3 :4502<br/>Backup];
    C --> F[Response];
    D --> F;
    E -->|Only if needed| F;
    F --> A;
```

## Searching with Qdrant

Qdrant returns the nearest neighbours for a query embedding in milliseconds:

```ts src/lib/foo.ts
const hits = await client.search('articles', {
    vector: queryEmbedding,
    limit: 5,
});
```

Feed those passages into the prompt and let the model answer from them. The result is grounded, cite-able output that keeps improving as your corpus grows.


## Request Workflow Diagram

```mermaid
graph TD;
    A[Client] -->|HTTP Request| B[Nginx Load Balancer :8000];
    B -->|Round Robin<br/>Primary| C[App Instance 1 :4500];
    B -->|Round Robin<br/>Primary| D[App Instance 2 :4501];
    B -->|Backup<br/>if 1 & 2 down| E[App Instance 3 :4502<br/>Backup];
    C --> F[Response];
    D --> F;
    E -->|Only if needed| F;
    F --> A;
```

## VS Code Laravel

https://gist.github.com/shibbirweb/529577ce5437c6a10953c81308957cc3