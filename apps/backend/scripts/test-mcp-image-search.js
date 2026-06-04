// Script para probar búsqueda por imagen usando el MCP server
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

/**
 * Cliente MCP que se comunica con el servidor usando JSON-RPC sobre stdio
 */
class MCPClient {
  constructor(serverPath) {
    this.serverPath = serverPath;
    this.requestId = 0;
    this.pendingRequests = new Map();
    this.serverProcess = null;
  }

  /**
   * Inicia el proceso del servidor MCP
   */
  async start() {
    console.log('🚀 Iniciando servidor MCP...\n');

    this.serverProcess = spawn('node', [this.serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Configurar readline para leer respuestas línea por línea
    this.rl = readline.createInterface({
      input: this.serverProcess.stdout,
      crlfDelay: Infinity,
    });

    this.rl.on('line', (line) => {
      try {
        const message = JSON.parse(line);
        this.handleMessage(message);
      } catch (e) {
        console.error('Error al parsear mensaje:', line);
      }
    });

    // Capturar errores del servidor (stderr)
    this.serverProcess.stderr.on('data', (data) => {
      // Los logs del servidor van a stderr
      const message = data.toString().trim();
      if (message) {
        console.log('📝 [Servidor]:', message);
      }
    });

    this.serverProcess.on('exit', (code) => {
      console.log(`\n🛑 Servidor MCP terminado con código ${code}`);
    });

    // Inicializar el protocolo MCP
    await this.initialize();
  }

  /**
   * Envía un request JSON-RPC al servidor
   */
  sendRequest(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.requestId;
      const request = {
        jsonrpc: '2.0',
        id,
        method,
        params,
      };

      this.pendingRequests.set(id, { resolve, reject });
      this.serverProcess.stdin.write(JSON.stringify(request) + '\n');
    });
  }

  /**
   * Envía una notificación JSON-RPC (sin esperar respuesta)
   */
  sendNotification(method, params = {}) {
    const notification = {
      jsonrpc: '2.0',
      method,
      params,
    };
    this.serverProcess.stdin.write(JSON.stringify(notification) + '\n');
  }

  /**
   * Maneja los mensajes recibidos del servidor
   */
  handleMessage(message) {
    if (message.id && this.pendingRequests.has(message.id)) {
      const { resolve, reject } = this.pendingRequests.get(message.id);
      this.pendingRequests.delete(message.id);

      if (message.error) {
        reject(new Error(message.error.message));
      } else {
        resolve(message.result);
      }
    }
  }

  /**
   * Inicializa la conexión con el servidor MCP
   */
  async initialize() {
    const result = await this.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {},
      },
      clientInfo: {
        name: 'test-mcp-client',
        version: '1.0.0',
      },
    });

    console.log('✅ Servidor MCP inicializado\n');

    // Enviar notificación de initialized
    this.sendNotification('notifications/initialized');

    return result;
  }

  /**
   * Llama a un tool del servidor MCP
   */
  async callTool(toolName, args) {
    return await this.sendRequest('tools/call', {
      name: toolName,
      arguments: args,
    });
  }

  /**
   * Cierra la conexión con el servidor
   */
  close() {
    if (this.serverProcess) {
      this.serverProcess.kill();
    }
  }
}

/**
 * Busca productos por imagen usando el MCP server
 */
async function searchByImage(client, imagePath) {
  console.log(`📸 Leyendo imagen: ${imagePath}\n`);

  // Leer la imagen y convertir a base64
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

  // Llamar al tool del MCP server
  const result = await client.callTool('buscar_producto_por_imagen', {
    image_base64: base64Image,
    mime_type: mimeType,
    limit: 5,
  });

  return result;
}

/**
 * Formatea y muestra los resultados
 */
function displayResults(result) {
  // El resultado viene en result.content[0].text como JSON string
  const textContent = result.content[0].text;
  const data = JSON.parse(textContent);

  if (data.status === 'success') {
    console.log('✅ Búsqueda exitosa!');
    console.log(`📦 Productos encontrados: ${data.total}\n`);

    if (data.productos && data.productos.length > 0) {
      console.log('🎯 Resultados:\n');
      data.productos.forEach((producto, index) => {
        console.log(`${index + 1}. ${producto.nombre}`);
        console.log(`   🎯 Similitud: ${producto.similitud}%`);
        console.log(`   💰 Precio: $${producto.precio}`);
        console.log(`   📦 Stock: ${producto.stock}`);
        console.log(`   🏷️  Categoría: ${producto.categoria}`);
        console.log(`   🔗 ${producto.imagen}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No se encontraron productos similares');
    }
  } else if (data.status === 'not_found') {
    console.log('⚠️  No se encontraron productos similares');
    console.log(`   ${data.message}`);
  } else {
    console.error('❌ Error en la búsqueda:', data.message);
  }
}

/**
 * Función principal
 */
async function main() {
  // Obtener la ruta de la imagen desde argumentos
  const imagePath = process.argv[2];

  if (!imagePath) {
    console.error('❌ Debes proporcionar la ruta de una imagen');
    console.log('\nUso:');
    console.log('  node test-mcp-image-search.js <ruta-imagen>');
    console.log('\nEjemplo:');
    console.log('  node test-mcp-image-search.js zapato.jpg');
    console.log('  node test-mcp-image-search.js "C:\\Users\\diego\\Pictures\\laptop.png"');
    process.exit(1);
  }

  if (!fs.existsSync(imagePath)) {
    console.error(`❌ La imagen no existe: ${imagePath}`);
    process.exit(1);
  }

  // Ruta al servidor MCP compilado
  const serverPath = path.join(__dirname, '..', 'dist', 'mcp', 'mcp', 'mcp-server.js');

  if (!fs.existsSync(serverPath)) {
    console.error('❌ El servidor MCP no está compilado.');
    console.log('\n💡 Compila el servidor primero con:');
    console.log('   pnpm build:mcp');
    process.exit(1);
  }

  const client = new MCPClient(serverPath);

  try {
    // Iniciar el servidor MCP
    await client.start();

    // Buscar productos similares
    const result = await searchByImage(client, imagePath);

    // Mostrar resultados
    displayResults(result);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // Cerrar el cliente
    client.close();
  }
}

main().catch(console.error);
