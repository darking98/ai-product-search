-- Script de inicialización de índices vectoriales para pgvector
-- Ejecutar después de que TypeORM cree las tablas

-- Índices vectoriales para búsqueda semántica rápida
-- IVFFlat es adecuado para datasets medianos (hasta 1M vectores)
-- Para datasets más grandes, considera usar HNSW

CREATE INDEX IF NOT EXISTS idx_products_text_embedding
  ON products USING ivfflat (text_embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_products_image_embedding
  ON products USING ivfflat (image_embedding vector_cosine_ops)
  WITH (lists = 100);

-- Verificar que los índices se crearon
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE tablename = 'products'
ORDER BY indexname;
