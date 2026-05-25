import type { CatalogRetrievalHit, DocumentTreeRetrievalHit, GraphRetrievalHit } from "../types/rag.types.js";

export interface BuildContextInput {
  catalogHits: CatalogRetrievalHit[];
  documentHits: DocumentTreeRetrievalHit[];
  graphHits: GraphRetrievalHit[];
  tokenBudget?: number;
}

export function buildContext(input: BuildContextInput): string {
  const tokenBudget = input.tokenBudget ?? Number(process.env.RAG_CONTEXT_TOKEN_BUDGET ?? 700);
  const sections = [
    ...input.catalogHits.map(formatCatalogHit),
    ...input.documentHits.map(formatDocumentHit),
    ...input.graphHits.map(formatGraphHit),
  ];

  return trimByApproxTokens(sections.join("\n"), tokenBudget);
}

function formatCatalogHit(hit: CatalogRetrievalHit): string {
  return `Product: ${hit.title} (${hit.sourceType}:${hit.sourceId})\n${firstWords(hit.text, 60)}`;
}

function formatDocumentHit(hit: DocumentTreeRetrievalHit): string {
  const page = hit.startPage === undefined ? "page unknown" : `pages ${hit.startPage}${hit.endPage ? `-${hit.endPage}` : ""}`;
  return `Document: ${hit.title} (${page}, node ${hit.nodeId})\nSummary: ${hit.summary}\nExcerpt: ${hit.excerpt ?? ""}`;
}

function formatGraphHit(hit: GraphRetrievalHit): string {
  return `Related product: ${hit.sourceComponentId} ${hit.relationType} ${hit.targetComponentId}`;
}

function firstWords(text: string, maxWords: number): string {
  return text.split(/\s+/).slice(0, maxWords).join(" ");
}

function trimByApproxTokens(text: string, tokenBudget: number): string {
  const maxWords = Math.max(50, Math.floor(tokenBudget * 0.75));
  return firstWords(text, maxWords);
}
