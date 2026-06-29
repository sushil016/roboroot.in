import { keywordSearchCatalog } from "./catalog-keyword-retriever.service.js";
import { vectorSearchCatalog } from "./catalog-vector-retriever.service.js";
import { buildContext } from "./context-builder.service.js";
import { expandQuery } from "./expander.service.js";
import { getRelated } from "./graph.service.js";
import { retrieveDocumentTree } from "./document-tree-retriever.service.js";
import { mergeAndRerankCatalog, rerankDocumentHits } from "./reranker.service.js";
import type { HybridRetrievalResult, RetrievalMode } from "../types/rag.types.js";

const ACTION_HINTS = ["order", "buy", "purchase", "pay", "payment", "invoice", "track", "cancel", "history"];
const DOCUMENT_HINTS = ["wire", "wiring", "manual", "datasheet", "policy", "tutorial", "guide", "explain", "steps", "how"];
const CATALOG_HINTS = ["show", "price", "stock", "sku", "sensor", "board", "motor", "kit", "component", "under"];

export async function hybridRetrieve(query: string, filters: Record<string, unknown> = {}): Promise<HybridRetrievalResult> {
  const expandedQuery = await expandQuery(query);
  const mode = classifyRetrievalMode(query);

  const shouldUseCatalog = mode === "catalog" || mode === "combined" || mode === "graph";
  const shouldUseDocuments = mode === "document" || mode === "combined";

  const [vectorHits, keywordHits, documentHits] = await Promise.all([
    shouldUseCatalog ? vectorSearchCatalog(expandedQuery) : Promise.resolve([]),
    shouldUseCatalog ? keywordSearchCatalog(expandedQuery) : Promise.resolve([]),
    shouldUseDocuments ? retrieveDocumentTree(expandedQuery) : Promise.resolve([]),
  ]);

  const catalogHits = mergeAndRerankCatalog(vectorHits, keywordHits);
  const componentIds = catalogHits
    .filter((hit) => hit.sourceType === "component")
    .map((hit) => hit.sourceId);
  const graphHits = componentIds.length > 0 ? await getRelated(componentIds) : [];
  const rankedDocuments = rerankDocumentHits(documentHits);
  const context = buildContext({
    catalogHits,
    documentHits: rankedDocuments,
    graphHits,
  });

  return {
    plan: {
      mode,
      expandedQuery,
      filters,
    },
    catalogHits,
    documentHits: rankedDocuments,
    graphHits,
    context,
  };
}

export function classifyRetrievalMode(query: string): RetrievalMode {
  const normalized = query.toLowerCase();
  const hasAction = ACTION_HINTS.some((hint) => normalized.includes(hint));
  const hasDocument = DOCUMENT_HINTS.some((hint) => normalized.includes(hint));
  const hasCatalog = CATALOG_HINTS.some((hint) => normalized.includes(hint));

  if (hasDocument && (hasCatalog || hasAction)) return "combined";
  if (hasDocument) return "document";
  // Default to catalog for product queries and general requests
  return "catalog";
}
