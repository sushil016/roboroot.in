import type { CatalogRetrievalHit, DocumentTreeRetrievalHit } from "../types/rag.types.js";

export function mergeAndRerankCatalog(
  vectorHits: CatalogRetrievalHit[],
  keywordHits: CatalogRetrievalHit[],
  limit = 4,
): CatalogRetrievalHit[] {
  const merged = new Map<string, CatalogRetrievalHit>();

  for (const hit of vectorHits) {
    merged.set(hit.id, {
      ...hit,
      catalogScore: 0.7 * (hit.vectorScore ?? 0),
    });
  }

  for (const hit of keywordHits) {
    const existing = merged.get(hit.id);
    if (existing) {
      const updated: CatalogRetrievalHit = {
        ...existing,
        catalogScore: 0.7 * (existing.vectorScore ?? 0) + 0.3 * (hit.keywordScore ?? 0),
      };

      if (hit.keywordScore !== undefined) updated.keywordScore = hit.keywordScore;
      merged.set(hit.id, updated);
    } else {
      merged.set(hit.id, {
        ...hit,
        catalogScore: 0.3 * (hit.keywordScore ?? 0),
      });
    }
  }

  return Array.from(merged.values())
    .sort((a, b) => b.catalogScore - a.catalogScore)
    .slice(0, limit);
}

export function rerankDocumentHits(documentHits: DocumentTreeRetrievalHit[], limit = 4): DocumentTreeRetrievalHit[] {
  return [...documentHits]
    .sort((a, b) => b.reasoningScore - a.reasoningScore)
    .slice(0, limit);
}
