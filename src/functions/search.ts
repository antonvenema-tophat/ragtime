import { Embedding } from "../models/embedding";

import similarity from "compute-cosine-similarity";

const search = (queryEmbedding: Embedding, sourceEmbeddings: Embedding[]) => {
  const results = sourceEmbeddings.map(sourceEmbedding => {
    return {
      page: sourceEmbedding.source,
      score: similarity(sourceEmbedding.value, queryEmbedding.value),
    };
  }).filter(s => s.score != null).sort((a, b) => b.score! - a.score!);

  if (results.length == 0) return null;

  const result = results[0];
  return (result.score && result.score > 0.5) ? result.page : null;
}

export { search };