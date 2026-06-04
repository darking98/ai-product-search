// Script para generar embeddings faltantes
const http = require('http');

const baseUrl = 'http://localhost:3001';

async function makeRequest(path, method = 'POST', body = null) {
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
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function generateEmbeddingsForProduct(productId, productName) {
  try {
    // Generar embedding de imagen desde URL
    const imageResult = await makeRequest(
      `/api/products/${productId}/generate-image-embedding-from-url`
    );

    if (!imageResult.success) {
      console.log(`  ❌ Error imagen: ${imageResult.message}`);
      return false;
    }

    // Generar embedding de texto
    const textResult = await makeRequest(
      `/api/products/${productId}/generate-text-embedding`
    );

    if (!textResult.success) {
      console.log(`  ❌ Error texto: ${textResult.message}`);
      return false;
    }

    return true;
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Generando embeddings faltantes...\n');
  console.log('⏳ Esperando a que el servidor esté listo...');

  // Esperar a que el servidor esté listo
  let ready = false;
  for (let i = 0; i < 30; i++) {
    try {
      await makeRequest('/api/products', 'GET');
      ready = true;
      break;
    } catch (e) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  if (!ready) {
    console.log(
      '❌ El servidor no está listo. Asegúrate de que esté corriendo con: pnpm start:dev'
    );
    process.exit(1);
  }

  console.log('✅ Servidor listo!\n');

  // Obtener todos los productos
  console.log('📦 Obteniendo productos sin embeddings...\n');
  const result = await makeRequest('/api/products', 'GET');

  if (!result.success || !result.data) {
    console.log('❌ No se pudieron obtener los productos');
    process.exit(1);
  }

  // Filtrar productos sin embeddings (los que no tienen text_embedding o image_embedding)
  const productsWithoutEmbeddings = result.data.filter(
    (p) => !p.text_embedding || !p.image_embedding
  );

  console.log(`📊 Total de productos: ${result.data.length}`);
  console.log(`📊 Productos sin embeddings: ${productsWithoutEmbeddings.length}\n`);

  if (productsWithoutEmbeddings.length === 0) {
    console.log('✅ Todos los productos ya tienen embeddings!');
    process.exit(0);
  }

  console.log('📸 Generando embeddings...\n');
  console.log(
    `⚠️  Esto tomará aproximadamente ${Math.ceil(productsWithoutEmbeddings.length * 0.25)} minutos\n`
  );

  let success = 0;
  let failed = 0;

  for (let i = 0; i < productsWithoutEmbeddings.length; i++) {
    const product = productsWithoutEmbeddings[i];

    if ((i + 1) % 10 === 0 || i === 0) {
      console.log(
        `  Progreso: ${i + 1}/${productsWithoutEmbeddings.length} productos procesados`
      );
    }

    const result = await generateEmbeddingsForProduct(product.id, product.name);

    if (result) {
      success++;
    } else {
      failed++;
    }

    // Delay para evitar límites de API (250ms entre cada producto)
    await new Promise((resolve) => setTimeout(resolve, 250));

    // Pausa más larga cada 50 productos
    if ((i + 1) % 50 === 0) {
      console.log('  💤 Pausa breve para evitar límites de API...');
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✨ PROCESO COMPLETADO:');
  console.log(`\n📸 Embeddings:`);
  console.log(`   ✅ Generados: ${success}`);
  console.log(`   ❌ Fallidos: ${failed}`);
  console.log('\n🎉 ¡Embeddings actualizados!');
}

main().catch(console.error);
