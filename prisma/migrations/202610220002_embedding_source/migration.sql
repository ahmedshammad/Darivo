ALTER TABLE "Property" ADD COLUMN "embeddingSource" TEXT NOT NULL DEFAULT 'mock-hash-v1';
CREATE INDEX "Property_embedding_hnsw" ON "Property" USING hnsw (embedding vector_cosine_ops);
CREATE INDEX "PropertyTranslation_search" ON "PropertyTranslation" USING GIN (to_tsvector('simple', title || ' ' || description));
