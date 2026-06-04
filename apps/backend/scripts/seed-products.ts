import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Product } from '../src/products/entities/product.entity';
import { Category } from '../src/categories/entities/category.entity';
import { config } from 'dotenv';

config();

const products = [
  {
    name: 'Zapatillas Nike Air Max 270',
    description:
      'Zapatillas deportivas con tecnología Air Max, cómodas y estilosas para uso diario y running. Color negro con detalles blancos.',
    price: 899.99,
    stock: 25,
    category: 'Calzado Deportivo',
    brand: 'Nike',
    image_url:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    slug: 'zapatillas-nike-air-max-270',
    keywords: ['zapatillas', 'nike', 'air max', 'deportivas', 'running'],
    active: true,
  },
  {
    name: 'Laptop Dell XPS 15',
    description:
      'Laptop de alta gama con procesador Intel i7, 16GB RAM, SSD 512GB, pantalla 4K táctil. Ideal para profesionales y creadores de contenido.',
    price: 12999.99,
    stock: 8,
    category: 'Computadoras',
    brand: 'Dell',
    image_url:
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800',
    slug: 'laptop-dell-xps-15',
    keywords: ['laptop', 'dell', 'xps', 'computadora', 'i7'],
    active: true,
  },
  {
    name: 'Silla Gamer Ergonómica RGB',
    description:
      'Silla gaming ergonómica con iluminación RGB, reposabrazos ajustables 4D, respaldo reclinable hasta 180°. Máximo confort para largas sesiones.',
    price: 2499.99,
    stock: 15,
    category: 'Muebles',
    brand: 'DXRacer',
    image_url:
      'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800',
    slug: 'silla-gamer-ergonomica-rgb',
    keywords: ['silla', 'gaming', 'ergonómica', 'rgb', 'escritorio'],
    active: true,
  },
  {
    name: 'Auriculares Sony WH-1000XM5',
    description:
      'Auriculares inalámbricos con cancelación de ruido líder en la industria. Batería de 30 horas, sonido Hi-Res, conexión multipunto.',
    price: 3499.99,
    stock: 20,
    category: 'Audio',
    brand: 'Sony',
    image_url:
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800',
    slug: 'auriculares-sony-wh-1000xm5',
    keywords: ['auriculares', 'sony', 'inalámbricos', 'noise cancelling'],
    active: true,
  },
  {
    name: 'Mochila Táctica Militar 50L',
    description:
      'Mochila resistente de alta capacidad con múltiples compartimentos, sistema MOLLE, material impermeable. Perfecta para trekking y outdoor.',
    price: 599.99,
    stock: 30,
    category: 'Accesorios',
    brand: 'Tactical',
    image_url:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
    slug: 'mochila-tactica-militar-50l',
    keywords: ['mochila', 'táctica', 'militar', 'outdoor', 'trekking'],
    active: true,
  },
];

async function main() {
  console.log('🚀 Iniciando seed de productos...\n');

  const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'ai-products-search',
    entities: [Product, Category],
    synchronize: false,
  });

  try {
    await AppDataSource.initialize();
    console.log('✅ Conexión a la base de datos establecida\n');

    const productRepository = AppDataSource.getRepository(Product);
    const categoryRepository = AppDataSource.getRepository(Category);

    // Limpiar productos existentes (opcional)
    // await productRepository.clear();
    // console.log('🗑️  Productos existentes eliminados\n');

    // Crear categorías primero
    console.log('📁 Creando categorías...\n');
    const uniqueCategories = [
      ...new Set(products.map((p) => p.category)),
    ] as string[];
    const categoryMap = new Map<string, number>();

    for (const categoryName of uniqueCategories) {
      let category = await categoryRepository.findOne({
        where: { name: categoryName },
      });

      if (!category) {
        const slug = categoryName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');

        category = categoryRepository.create({
          name: categoryName,
          slug,
          active: true,
        });
        category = await categoryRepository.save(category);
        console.log(`✅ Categoría creada: ${categoryName} (ID: ${category.id})`);
      } else {
        console.log(
          `⏭️  Categoría ya existe: ${categoryName} (ID: ${category.id})`,
        );
      }

      categoryMap.set(categoryName, category.id);
    }

    console.log('\n📦 Creando productos...\n');

    // Insertar productos
    for (let i = 0; i < products.length; i++) {
      const productData = products[i];
      const categoryId = categoryMap.get(productData.category);

      // Crear producto con categoryId en lugar de category
      const { category: _category, ...productFields } = productData;
      const product = productRepository.create({
        ...productFields,
        categoryId,
      });
      const saved = await productRepository.save(product);
      console.log(
        `✅ ${i + 1}. Producto creado: ${saved.name} (ID: ${saved.id})`,
      );
    }

    console.log('\n✨ ¡Productos creados exitosamente!');
    console.log('\n📝 Próximo paso: Generar embeddings con:');
    console.log(
      '   curl -X POST http://localhost:3000/products/batch-generate-embeddings',
    );
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

main();
