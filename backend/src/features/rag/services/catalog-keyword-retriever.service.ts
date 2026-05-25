import { prisma } from "../../../lib/prisma.js";
import type { CatalogRetrievalHit } from "../types/rag.types.js";

interface KeywordHitRow {
  id: string;
  sourceType: string;
  sourceId: string;
  chunkText: string;
  metadata: unknown;
  keywordScore: number;
}

export async function keywordSearchCatalog(query: string, limit = 20): Promise<CatalogRetrievalHit[]> {
  const rows = await prisma.$queryRaw<KeywordHitRow[]>`
    SELECT
      "id",
      "sourceType"::text AS "sourceType",
      "sourceId",
      "chunkText",
      "metadata",
      similarity("chunkText", ${query}) AS "keywordScore"
    FROM "RagChunk"
    WHERE similarity("chunkText", ${query}) > 0.05
    ORDER BY similarity("chunkText", ${query}) DESC
    LIMIT ${limit}
  `;

  return rows.map((row) => ({
    kind: "catalog",
    id: row.id,
    sourceType: normalizeSourceType(row.sourceType),
    sourceId: row.sourceId,
    title: titleFromMetadata(row.metadata, row.sourceId),
    text: row.chunkText,
    keywordScore: Number(row.keywordScore),
    catalogScore: Number(row.keywordScore),
    metadata: metadataRecord(row.metadata),
  }));
}

function normalizeSourceType(sourceType: string): CatalogRetrievalHit["sourceType"] {
  const normalized = sourceType.toLowerCase();
  if (normalized === "component" || normalized === "project" || normalized === "faq" || normalized === "short_policy") {
    return normalized;
  }

  return "component";
}

function titleFromMetadata(metadata: unknown, fallback: string): string {
  const record = metadataRecord(metadata);
  const title = record.title ?? record.name ?? record.sku;
  return typeof title === "string" ? title : fallback;
}

function metadataRecord(metadata: unknown): Record<string, unknown> {
  return metadata && typeof metadata === "object" && !Array.isArray(metadata) ? metadata as Record<string, unknown> : {};
}
