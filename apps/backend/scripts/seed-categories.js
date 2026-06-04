// Script para ejecutar el seed de categorías
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function seedCategories() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'ai-products-search',
  });

  try {
    console.log('🔌 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'seed-categories.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 Ejecutando script de seed de categorías...');
    await client.query(sql);
    console.log('✅ Script ejecutado exitosamente\n');

    // Verificar las categorías creadas
    const categoriesResult = await client.query(
      'SELECT id, name, slug, active FROM categories ORDER BY name',
    );
    console.log('📦 Categorías en la base de datos:');
    categoriesResult.rows.forEach((cat) => {
      console.log(`  ${cat.id}. ${cat.name} (${cat.slug}) ${cat.active ? '✓' : '✗'}`);
    });

    // Verificar la migración de productos
    const productsResult = await client.query(
      `
      SELECT
        p.id,
        p.name,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id
      `,
    );
    console.log('\n📦 Productos migrados:');
    productsResult.rows.forEach((prod) => {
      console.log(`  ${prod.id}. ${prod.name} → ${prod.category_name || 'Sin categoría'}`);
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Desconectado de la base de datos');
  }
}

seedCategories();
