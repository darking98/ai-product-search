-- Script para crear categorías e actualizar los productos existentes

-- Crear la tabla categories si no existe
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  slug VARCHAR(255) UNIQUE NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insertar categorías base
INSERT INTO categories (name, description, slug, active) VALUES
('Calzado Deportivo', 'Zapatillas, tenis y calzado para deportes', 'calzado-deportivo', true),
('Computadoras', 'Laptops, PCs de escritorio y accesorios', 'computadoras', true),
('Muebles', 'Sillas, escritorios y mobiliario para oficina y hogar', 'muebles', true),
('Audio', 'Auriculares, parlantes y equipos de audio', 'audio', true),
('Accesorios', 'Mochilas, bolsos y accesorios varios', 'accesorios', true),
('Electrónica', 'Dispositivos electrónicos y gadgets', 'electronica', true),
('Ropa', 'Vestimenta y indumentaria', 'ropa', true),
('Deportes', 'Equipamiento deportivo y fitness', 'deportes', true),
('Hogar', 'Artículos para el hogar', 'hogar', true),
('Gaming', 'Productos para gaming y entretenimiento', 'gaming', true)
ON CONFLICT (slug) DO NOTHING;

-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(active);

-- Actualizar la tabla products para agregar category_id si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='products' AND column_name='category_id'
  ) THEN
    ALTER TABLE products ADD COLUMN category_id INTEGER;
    ALTER TABLE products ADD CONSTRAINT fk_products_category
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
    CREATE INDEX idx_products_category_id ON products(category_id);
  END IF;
END $$;

-- Migrar datos de category (string) a category_id (integer)
-- Mapear los nombres de categorías actuales a las nuevas categorías
UPDATE products SET category_id = (SELECT id FROM categories WHERE name = 'Calzado Deportivo')
WHERE category = 'Calzado Deportivo' OR category ILIKE '%zapati%' OR category ILIKE '%calzado%';

UPDATE products SET category_id = (SELECT id FROM categories WHERE name = 'Computadoras')
WHERE category = 'Computadoras' OR category ILIKE '%laptop%' OR category ILIKE '%computador%';

UPDATE products SET category_id = (SELECT id FROM categories WHERE name = 'Muebles')
WHERE category = 'Muebles' OR category ILIKE '%silla%' OR category ILIKE '%mueble%';

UPDATE products SET category_id = (SELECT id FROM categories WHERE name = 'Audio')
WHERE category = 'Audio' OR category ILIKE '%auricular%' OR category ILIKE '%audio%';

UPDATE products SET category_id = (SELECT id FROM categories WHERE name = 'Accesorios')
WHERE category = 'Accesorios' OR category ILIKE '%mochila%' OR category ILIKE '%accesorio%';

-- Si todavía quedan productos sin categoría, asignar a Electrónica
UPDATE products SET category_id = (SELECT id FROM categories WHERE name = 'Electrónica')
WHERE category_id IS NULL AND category IS NOT NULL;

-- Opcionalmente, eliminar la columna category antigua (comentado por seguridad)
-- ALTER TABLE products DROP COLUMN IF EXISTS category;

SELECT 'Categorías creadas y productos migrados exitosamente' as resultado;
