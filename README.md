# ragtime

## Experiments with RAG

`OPENAI_API_KEY` environment variable must be set to your OpenAI API key.

```
npm install

# Baseline - no RAG.
npm run start -- --ragless

# Naive RAG without vector search.
npm run start

# Improved RAG with vector search.
npm run start -- --embed
```

![ragtime](ragtime.png "ragtime")