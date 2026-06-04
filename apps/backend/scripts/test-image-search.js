// Script para probar búsqueda por imagen en local
const http = require('http');
const fs = require('fs');
const path = require('path');

const baseUrl = 'http://localhost:3001';

async function searchByImage(imagePath) {
  // Leer la imagen y convertir a base64
  console.log(`📸 Leyendo imagen: ${imagePath}`);
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');

  // Detectar el tipo MIME
  const ext = path.extname(imagePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
  };
  const mimeType = mimeTypes[ext] || 'image/jpeg';

  console.log(`🔍 Buscando productos similares...`);
  console.log(`   Tipo: ${mimeType}`);
  console.log(`   Tamaño: ${(base64Image.length / 1024).toFixed(2)} KB\n`);

  // Hacer la petición
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      image_base64: base64Image,
      mime_type: mimeType,
      limit: 5,
    });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/products/search-by-image',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error(`Error parsing response: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  // Obtener la ruta de la imagen desde argumentos
  const imagePath = process.argv[2];

  if (!imagePath) {
    console.error('❌ Debes proporcionar la ruta de una imagen');
    console.log('\nUso:');
    console.log('  node test-image-search.js <ruta-imagen>');
    console.log('\nEjemplo:');
    console.log('  node test-image-search.js zapato.jpg');
    console.log('  node test-image-search.js "C:\\Users\\diego\\Pictures\\laptop.png"');
    process.exit(1);
  }

  if (!fs.existsSync(imagePath)) {
    console.error(`❌ La imagen no existe: ${imagePath}`);
    process.exit(1);
  }

  console.log('🚀 Iniciando búsqueda por imagen...\n');

  try {
    const result = await searchByImage(imagePath);

    if (result.success) {
      console.log('✅ Búsqueda exitosa!');
      console.log(`📦 Productos encontrados: ${result.total}\n`);

      if (result.data && result.data.length > 0) {
        console.log('🎯 Resultados:\n');
        result.data.forEach((product, index) => {
          console.log(`${index + 1}. ${product.name}`);
          console.log(`   🎯 Similitud: ${product.similarity}%`);
          console.log(`   💰 Precio: $${product.price}`);
          console.log(`   📦 Stock: ${product.stock}`);
          console.log(`   🏷️  Categoría: ${product.category}`);
          console.log(`   🔗 ${product.image_url}`);
          console.log('');
        });
      } else {
        console.log('⚠️  No se encontraron productos similares');
      }
    } else {
      console.error('❌ Error en la búsqueda:', result.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Asegúrate de que el servidor esté corriendo:');
    console.log('   cd apps/backend && pnpm start:dev');
  }
}

main().catch(console.error);
