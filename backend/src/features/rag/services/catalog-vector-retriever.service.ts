import { prisma } from "../../../lib/prisma.js";
import { embedTexts } from "../../embeddings/services/embedder.service.js";
import type { CatalogRetrievalHit } from "../types/rag.types.js";

interface VectorHitRow {
  id: string;
  sourceType: string;
  sourceId: string;
  chunkText: string;
  metadata: unknown;
  vectorScore: number;
}

export async function vectorSearchCatalog(query: string, limit = 20): Promise<CatalogRetrievalHit[]> {
  const [embedding] = await embedTexts([query]);
  if (!embedding) return [];

  const vector = toVectorLiteral(embedding);
  const rows = await prisma.$queryRaw<VectorHitRow[]>`
    SELECT
      "id",
      "sourceType"::text AS "sourceType",
      "sourceId",
      "chunkText",
      "metadata",
      1 - ("embedding" <=> ${vector}::vector) AS "vectorScore"
    FROM "RagChunk"
    WHERE "embedding" IS NOT NULL
    ORDER BY "embedding" <=> ${vector}::vector
    LIMIT ${limit}
  `;

  return rows.map((row) => ({
    kind: "catalog",
    id: row.id,
    sourceType: normalizeSourceType(row.sourceType),
    sourceId: row.sourceId,
    title: titleFromMetadata(row.metadata, row.sourceId),
    text: row.chunkText,
    vectorScore: Number(row.vectorScore),
    catalogScore: Number(row.vectorScore),
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

function toVectorLiteral(values: number[]): string {
  const expectedDimensions = Number(process.env.EMBEDDING_DIMENSIONS ?? 1024);
  if (values.length !== expectedDimensions) {
    throw new Error(`Expected ${expectedDimensions}-dimensional embedding, received ${values.length}`);
  }

  return `[${values.map((value) => {
    if (!Number.isFinite(value)) throw new Error("Embedding contains a non-finite value");
    return Number(value).toFixed(8);
  }).join(",")}]`;
}
