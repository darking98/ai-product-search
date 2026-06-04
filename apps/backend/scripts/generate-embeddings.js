// Script para generar embeddings de los productos
const http = require('http');

const baseUrl = 'http://localhost:3001';

async function makeRequest(path, method = 'POST') {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function generateEmbeddingsForProduct(productId, productName) {
  try {
    console.log(`\n🔄 Procesando: ${productName}`);

    // Generar embedding de imagen desde URL
    console.log('  📸 Generando embedding de imagen...');
    const imageResult = await makeRequest(
      `/api/products/${productId}/generate-image-embedding-from-url`,
    );

    if (imageResult.success) {
      console.log('  ✅ Embedding de imagen generado');
    } else {
      console.log('  ❌ Error:', imageResult.message);
      return false;
    }

    // Generar embedding de texto
    console.log('  📝 Generando embedding de texto...');
    const textResult = await makeRequest(
      `/api/products/${productId}/generate-text-embedding`,
    );

    if (textResult.success) {
      console.log('  ✅ Embedding de texto generado');
    } else {
      console.log('  ❌ Error:', textResult.message);
      return false;
    }

    return true;
  } catch (error) {
    console.log('  ❌ Error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Generando embeddings para productos...\n');
  console.log('⏳ Esperando a que el servidor esté listo...');

  // Esperar a que el servidor esté listo
  let ready = false;
  for (let i = 0; i < 30; i++) {
    try {
      await makeRequest('/', 'GET');
      ready = true;
      break;
    } catch (e) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  if (!ready) {
    console.log(
      '❌ El servidor no está listo. Asegúrate de que esté corriendo con: pnpm start:dev',
    );
    process.exit(1);
  }

  console.log('✅ Servidor listo!\n');

  const products = [
    { id: 1, name: 'Zapatillas Nike Air Max 270' },
    { id: 2, name: 'Laptop Dell XPS 15' },
    { id: 3, name: 'Silla Gamer Ergonómica RGB' },
    { id: 4, name: 'Auriculares Sony WH-1000XM5' },
    { id: 5, name: 'Mochila Táctica Militar 50L' },
  ];

  let success = 0;
  let failed = 0;

  for (const product of products) {
    const result = await generateEmbeddingsForProduct(product.id, product.name);
    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\n✨ Proceso completado:`);
  console.log(`   ✅ Exitosos: ${success}`);
  console.log(`   ❌ Fallidos: ${failed}`);
  console.log(
    '\n📦 Ahora puedes buscar productos similares usando el MCP server!',
  );
}

main().catch(console.error);
