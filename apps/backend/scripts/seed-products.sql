-- Insertar 5 productos con imágenes reales

INSERT INTO products (name, description, price, stock, category, brand, image_url, slug, keywords, active, created_at, updated_at)
VALUES
  (
    'Zapatillas Nike Air Max 270',
    'Zapatillas deportivas con tecnología Air Max, cómodas y estilosas para uso diario y running. Color negro con detalles blancos.',
    899.99,
    25,
    'Calzado Deportivo',
    'Nike',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    'zapatillas-nike-air-max-270',
    ARRAY['zapatillas', 'nike', 'air max', 'deportivas', 'running'],
    true,
    NOW(),
    NOW()
  ),
  (
    'Laptop Dell XPS 15',
    'Laptop de alta gama con procesador Intel i7, 16GB RAM, SSD 512GB, pantalla 4K táctil. Ideal para profesionales y creadores de contenido.',
    12999.99,
    8,
    'Computadoras',
    'Dell',
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800',
    'laptop-dell-xps-15',
    ARRAY['laptop', 'dell', 'xps', 'computadora', 'i7'],
    true,
    NOW(),
    NOW()
  ),
  (
    'Silla Gamer Ergonómica RGB',
    'Silla gaming ergonómica con iluminación RGB, reposabrazos ajustables 4D, respaldo reclinable hasta 180°. Máximo confort para largas sesiones.',
    2499.99,
    15,
    'Muebles',
    'DXRacer',
    'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800',
    'silla-gamer-ergonomica-rgb',
    ARRAY['silla', 'gaming', 'ergonómica', 'rgb', 'escritorio'],
    true,
    NOW(),
    NOW()
  ),
  (
    'Auriculares Sony WH-1000XM5',
    'Auriculares inalámbricos con cancelación de ruido líder en la industria. Batería de 30 horas, sonido Hi-Res, conexión multipunto.',
    3499.99,
    20,
    'Audio',
    'Sony',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800',
    'auriculares-sony-wh-1000xm5',
    ARRAY['auriculares', 'sony', 'inalámbricos', 'noise cancelling'],
    true,
    NOW(),
    NOW()
  ),
  (
    'Mochila Táctica Militar 50L',
    'Mochila resistente de alta capacidad con múltiples compartimentos, sistema MOLLE, material impermeable. Perfecta para trekking y outdoor.',
    599.99,
    30,
    'Accesorios',
    'Tactical',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
    'mochila-tactica-militar-50l',
    ARRAY['mochila', 'táctica', 'militar', 'outdoor', 'trekking'],
    true,
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;
