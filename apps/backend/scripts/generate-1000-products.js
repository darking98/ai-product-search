// Script para generar 1000 productos variados en la base de datos
const http = require('http');

const baseUrl = 'http://localhost:3001';

// Función para hacer peticiones HTTP
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

// Función para crear un slug
function createSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Datos para generar productos variados
const categories = [
  { name: 'Calzado Deportivo', id: 1 },
  { name: 'Computadoras', id: 2 },
  { name: 'Muebles', id: 3 },
  { name: 'Audio', id: 4 },
  { name: 'Accesorios', id: 5 },
];

const productTemplates = {
  'Calzado Deportivo': {
    types: [
      'Zapatillas Running',
      'Tenis Casual',
      'Zapatos Deportivos',
      'Zapatillas Training',
      'Calzado Trekking',
      'Sandalias Deportivas',
      'Botas Outdoor',
      'Zapatillas Basketball',
      'Zapatos Fútbol',
      'Zapatillas Skate',
    ],
    brands: [
      'Nike',
      'Adidas',
      'Puma',
      'Reebok',
      'New Balance',
      'Asics',
      'Under Armour',
      'Saucony',
      'Vans',
      'Converse',
    ],
    colors: [
      'Negro',
      'Blanco',
      'Rojo',
      'Azul',
      'Verde',
      'Gris',
      'Amarillo',
      'Naranja',
      'Rosa',
      'Morado',
    ],
    descriptions: [
      'con tecnología de amortiguación avanzada',
      'con suela de alta tracción',
      'ideales para uso diario',
      'con diseño ergonómico',
      'con material transpirable',
      'resistentes al agua',
      'ultraligeras y cómodas',
      'con soporte para el arco',
      'con diseño moderno',
      'perfectas para entrenamientos intensos',
    ],
    unsplashIds: [
      'photo-1542291026-7eec264c27ff',
      'photo-1606107557195-0e29a4b5b4aa',
      'photo-1549298916-b41d501d3772',
      'photo-1595950653106-6c9ebd614d3a',
      'photo-1460353581641-37baddab0fa2',
    ],
  },
  Computadoras: {
    types: [
      'Laptop',
      'PC Escritorio',
      'Tablet',
      'Chromebook',
      'Notebook',
      'Workstation',
      'Mini PC',
      'All-in-One',
      'Gaming Laptop',
      'Ultrabook',
    ],
    brands: [
      'Dell',
      'HP',
      'Lenovo',
      'Asus',
      'Acer',
      'Apple',
      'MSI',
      'Samsung',
      'Microsoft',
      'Razer',
    ],
    specs: [
      'Intel i5 8GB RAM',
      'Intel i7 16GB RAM',
      'AMD Ryzen 5 16GB RAM',
      'AMD Ryzen 7 32GB RAM',
      'Intel i9 32GB RAM',
      'M1 8GB RAM',
      'M2 16GB RAM',
      'Intel i3 4GB RAM',
      'Celeron 4GB RAM',
      'Core Ultra 16GB RAM',
    ],
    descriptions: [
      'con pantalla Full HD',
      'ideal para trabajo remoto',
      'perfecta para gaming',
      'con diseño ultradelgado',
      'con batería de larga duración',
      'para profesionales creativos',
      'con SSD de alta velocidad',
      'con tarjeta gráfica dedicada',
      'para estudiantes y profesionales',
      'con pantalla táctil 4K',
    ],
    unsplashIds: [
      'photo-1593642632823-8f785ba67e45',
      'photo-1588872657578-7efd1f1555ed',
      'photo-1603302576837-37561b2e2302',
      'photo-1496181133206-80ce9b88a853',
      'photo-1587202372634-32705e3bf49c',
    ],
  },
  Muebles: {
    types: [
      'Silla Gamer',
      'Escritorio',
      'Mesa',
      'Estantería',
      'Silla Oficina',
      'Sofá',
      'Cama',
      'Librero',
      'Sillón',
      'Banco',
    ],
    brands: [
      'DXRacer',
      'IKEA',
      'Herman Miller',
      'Steelcase',
      'Autonomous',
      'FlexiSpot',
      'Secretlab',
      'La-Z-Boy',
      'Ashley',
      'Wayfair',
    ],
    materials: [
      'Madera',
      'Metal',
      'Vidrio',
      'Cuero',
      'Tela',
      'Plástico',
      'MDF',
      'Bambú',
      'Ratán',
      'Acero',
    ],
    descriptions: [
      'con diseño ergonómico',
      'moderna y minimalista',
      'espacioso y funcional',
      'con acabados de alta calidad',
      'ajustable en altura',
      'con sistema de almacenamiento',
      'resistente y durable',
      'fácil de ensamblar',
      'con iluminación LED integrada',
      'ideal para espacios pequeños',
    ],
    unsplashIds: [
      'photo-1598550476439-6847785fcea6',
      'photo-1505843513577-22bb7d21e455',
      'photo-1551298370-9d3d53740c72',
      'photo-1592078615290-033ee584e267',
      'photo-1567016432779-094069958ea5',
    ],
  },
  Audio: {
    types: [
      'Auriculares',
      'Altavoces',
      'Parlante Bluetooth',
      'Audífonos Deportivos',
      'Headset Gaming',
      'Micrófono',
      'Barra de Sonido',
      'Subwoofer',
      'Amplificador',
      'Auriculares In-Ear',
    ],
    brands: [
      'Sony',
      'Bose',
      'JBL',
      'Sennheiser',
      'Audio-Technica',
      'Beats',
      'AKG',
      'Samsung',
      'Anker',
      'Harman Kardon',
    ],
    features: [
      'con cancelación de ruido',
      'inalámbricos Bluetooth 5.0',
      'con micrófono integrado',
      'resistentes al agua IPX7',
      'con sonido Hi-Res',
      'con batería 30h',
      'con tecnología ANC',
      'con diseño over-ear',
      'con bass boost',
      'con carga rápida',
    ],
    descriptions: [
      'ideal para viajes',
      'perfectos para gaming',
      'sonido envolvente',
      'comodidad todo el día',
      'calidad de estudio',
      'conexión multipunto',
      'ecualizador personalizable',
      'diseño plegable',
      'ultraportátiles',
      'con estuche de carga',
    ],
    unsplashIds: [
      'photo-1546435770-a3e426bf472b',
      'photo-1484704849700-f032a568e944',
      'photo-1505740420928-5e560c06d30e',
      'photo-1590658268037-6bf12165a8df',
      'photo-1524678606370-a47ad25cb82a',
    ],
  },
  Accesorios: {
    types: [
      'Mochila',
      'Bolso',
      'Cartera',
      'Gorra',
      'Lentes de Sol',
      'Reloj',
      'Cinturón',
      'Bufanda',
      'Guantes',
      'Paraguas',
    ],
    brands: [
      'Tactical',
      'North Face',
      'Herschel',
      'Samsonite',
      'Nike',
      'Adidas',
      'Oakley',
      'Ray-Ban',
      'Fossil',
      'Timex',
    ],
    materials: [
      'Nylon',
      'Cuero',
      'Poliéster',
      'Algodón',
      'Lona',
      'Sintético',
      'Neopreno',
      'Silicona',
      'Acero Inoxidable',
      'Plástico Resistente',
    ],
    descriptions: [
      'resistente al agua',
      'con múltiples compartimentos',
      'diseño moderno y elegante',
      'ideal para viajes',
      'compacto y ligero',
      'con protección UV',
      'duradero y funcional',
      'ajustable y cómodo',
      'versátil para cualquier ocasión',
      'fácil de limpiar',
    ],
    unsplashIds: [
      'photo-1553062407-98eeb64c6a62',
      'photo-1491637639811-60e2756cc1c7',
      'photo-1553456558-aff63285bdd1',
      'photo-1590874103328-eac38a683ce7',
      'photo-1622560480605-d83c853bc5c3',
    ],
  },
};

// Función para generar un producto aleatorio
function generateRandomProduct(index) {
  const categoryKeys = Object.keys(productTemplates);
  const categoryName = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
  const category = categories.find((c) => c.name === categoryName);
  const template = productTemplates[categoryName];

  const type = template.types[Math.floor(Math.random() * template.types.length)];
  const brand = template.brands[Math.floor(Math.random() * template.brands.length)];

  let productName = '';
  let description = '';
  let keywords = [];

  // Generar nombre y descripción según categoría
  if (categoryName === 'Calzado Deportivo') {
    const color = template.colors[Math.floor(Math.random() * template.colors.length)];
    productName = `${type} ${brand} ${color}`;
    const desc = template.descriptions[Math.floor(Math.random() * template.descriptions.length)];
    description = `${type} ${desc}. Color ${color.toLowerCase()}, marca ${brand}. Perfectas para deportes y uso casual.`;
    keywords = [type.toLowerCase(), brand.toLowerCase(), color.toLowerCase(), 'deportivo', 'calzado'];
  } else if (categoryName === 'Computadoras') {
    const spec = template.specs[Math.floor(Math.random() * template.specs.length)];
    productName = `${type} ${brand} ${spec.split(' ')[0]} ${spec.split(' ')[1]}`;
    const desc = template.descriptions[Math.floor(Math.random() * template.descriptions.length)];
    description = `${type} ${brand} con ${spec}, ${desc}. Incluye SSD 512GB y conectividad completa.`;
    keywords = [type.toLowerCase(), brand.toLowerCase(), spec.toLowerCase(), 'computadora', 'tecnología'];
  } else if (categoryName === 'Muebles') {
    const material = template.materials[Math.floor(Math.random() * template.materials.length)];
    productName = `${type} ${brand} ${material}`;
    const desc = template.descriptions[Math.floor(Math.random() * template.descriptions.length)];
    description = `${type} de ${material.toLowerCase()} ${desc}. Marca ${brand}, diseño contemporáneo y funcional.`;
    keywords = [type.toLowerCase(), brand.toLowerCase(), material.toLowerCase(), 'mueble', 'hogar'];
  } else if (categoryName === 'Audio') {
    const feature = template.features[Math.floor(Math.random() * template.features.length)];
    productName = `${type} ${brand} ${feature.split(' ')[0]}`;
    const desc = template.descriptions[Math.floor(Math.random() * template.descriptions.length)];
    description = `${type} ${brand} ${feature}, ${desc}. Calidad de audio premium.`;
    keywords = [type.toLowerCase(), brand.toLowerCase(), 'audio', 'sonido', 'música'];
  } else if (categoryName === 'Accesorios') {
    const material = template.materials[Math.floor(Math.random() * template.materials.length)];
    productName = `${type} ${brand} ${material}`;
    const desc = template.descriptions[Math.floor(Math.random() * template.descriptions.length)];
    description = `${type} de ${material.toLowerCase()} ${desc}. Marca ${brand}, estilo y funcionalidad.`;
    keywords = [type.toLowerCase(), brand.toLowerCase(), material.toLowerCase(), 'accesorio', 'estilo'];
  }

  // Generar precio aleatorio según categoría
  let price = 0;
  if (categoryName === 'Calzado Deportivo') {
    price = (Math.random() * 1500 + 500).toFixed(2);
  } else if (categoryName === 'Computadoras') {
    price = (Math.random() * 15000 + 5000).toFixed(2);
  } else if (categoryName === 'Muebles') {
    price = (Math.random() * 5000 + 1000).toFixed(2);
  } else if (categoryName === 'Audio') {
    price = (Math.random() * 4000 + 500).toFixed(2);
  } else if (categoryName === 'Accesorios') {
    price = (Math.random() * 1000 + 200).toFixed(2);
  }

  const stock = Math.floor(Math.random() * 50) + 10;
  const unsplashId =
    template.unsplashIds[Math.floor(Math.random() * template.unsplashIds.length)];
  const imageUrl = `https://images.unsplash.com/${unsplashId}?w=800&sig=${index}`;

  return {
    name: productName,
    description: description,
    price: parseFloat(price),
    stock: stock,
    categoryId: category.id,
    brand: brand,
    image_url: imageUrl,
    slug: createSlug(productName),
    keywords: keywords,
    active: true,
  };
}

// Función para crear un producto en la base de datos
async function createProduct(productData) {
  try {
    const result = await makeRequest('/api/products', 'POST', productData);
    return result;
  } catch (error) {
    console.error('Error creando producto:', error.message);
    return null;
  }
}

// Función para generar embeddings de un producto
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
  console.log('🚀 Generando 1000 productos variados...\n');
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

  const TOTAL_PRODUCTS = 1000;
  const BATCH_SIZE = 50; // Procesar en lotes
  let successCount = 0;
  let failedCount = 0;
  const createdProductIds = [];

  console.log('📦 FASE 1: Creando productos en la base de datos...\n');

  for (let i = 0; i < TOTAL_PRODUCTS; i++) {
    const product = generateRandomProduct(i);

    if ((i + 1) % 50 === 0) {
      console.log(`  Progreso: ${i + 1}/${TOTAL_PRODUCTS} productos creados`);
    }

    const result = await createProduct(product);

    if (result && result.success && result.data) {
      createdProductIds.push({ id: result.data.id, name: result.data.name });
      successCount++;
    } else {
      failedCount++;
    }

    // Pequeña pausa cada 10 productos para no saturar el servidor
    if ((i + 1) % 10 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ Productos creados: ${successCount}`);
  console.log(`❌ Productos fallidos: ${failedCount}`);

  console.log('\n📸 FASE 2: Generando embeddings...\n');
  console.log('⚠️  Este proceso puede tomar 10-15 minutos\n');

  let embeddingSuccess = 0;
  let embeddingFailed = 0;

  for (let i = 0; i < createdProductIds.length; i++) {
    const { id, name } = createdProductIds[i];

    if ((i + 1) % 10 === 0) {
      console.log(
        `  Progreso: ${i + 1}/${createdProductIds.length} embeddings generados`
      );
    }

    const result = await generateEmbeddingsForProduct(id, name);

    if (result) {
      embeddingSuccess++;
    } else {
      embeddingFailed++;
    }

    // Pausa para no saturar las APIs de Google y Groq
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✨ PROCESO COMPLETADO:');
  console.log(`\n📦 Productos:`);
  console.log(`   ✅ Creados: ${successCount}`);
  console.log(`   ❌ Fallidos: ${failedCount}`);
  console.log(`\n📸 Embeddings:`);
  console.log(`   ✅ Generados: ${embeddingSuccess}`);
  console.log(`   ❌ Fallidos: ${embeddingFailed}`);
  console.log(
    '\n🎉 ¡Base de datos lista con 1000+ productos con embeddings!'
  );
}

main().catch(console.error);