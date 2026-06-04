# Configuración del MCP Server para Búsqueda de Productos por Imagen

Este servidor MCP permite buscar productos similares usando embeddings de imágenes con Google AI y búsqueda vectorial en PostgreSQL.

## Requisitos Previos

1. **Base de datos PostgreSQL con pgvector** en ejecución
2. **Google AI API Key** configurada
3. **Node.js** y **pnpm** instalados
4. **Claude Desktop** o **Cliente MCP compatible**

## Paso 1: Iniciar la Base de Datos

```bash
# Desde el directorio apps/db
cd apps/db
docker-compose up -d
```

Esto iniciará PostgreSQL con la extensión pgvector en el puerto 5432.

## Paso 2: Verificar Variables de Entorno

Asegúrate de que el archivo `apps/backend/.env` contenga:

```env
GOOGLE_AI_API_KEY=tu-api-key-aqui

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=ai-products-search
```

## Paso 3: Sincronizar la Base de Datos

Inicia la aplicación NestJS para que TypeORM cree las tablas automáticamente:

```bash
cd apps/backend
pnpm start:dev
```

Verás en los logs que se crean las tablas incluyendo `products` con las columnas de embeddings vectoriales.

## Paso 4: Compilar el MCP Server

```bash
# Desde el directorio apps/backend
cd apps/backend
pnpm build:mcp
```

Esto compilará el servidor MCP a `dist/mcp/mcp-server.js`.

## Paso 5: Configurar Claude Desktop

### Para Claude Desktop

Edita tu archivo de configuración de Claude Desktop:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Agrega la configuración del servidor:

```json
{
  "mcpServers": {
    "ecommerce-visual": {
      "command": "node",
      "args": [
        "C:\\Users\\diego\\Desktop\\projects\\ai-product-search\\apps\\backend\\dist\\mcp\\mcp-server.js"
      ],
      "env": {
        "GOOGLE_AI_API_KEY": "tu-api-key-aqui",
        "DB_HOST": "localhost",
        "DB_PORT": "5432",
        "DB_USERNAME": "postgres",
        "DB_PASSWORD": "postgres",
        "DB_DATABASE": "ai-products-search"
      }
    }
  }
}
```

**Nota**: Ajusta la ruta del archivo según tu sistema operativo y ubicación del proyecto.

### Para desarrollo (alternativa con tsx)

```json
{
  "mcpServers": {
    "ecommerce-visual": {
      "command": "pnpm",
      "args": ["--filter", "backend", "mcp:dev"],
      "cwd": "C:\\Users\\diego\\Desktop\\projects\\ai-product-search",
      "env": {
        "GOOGLE_AI_API_KEY": "tu-api-key-aqui",
        "DB_HOST": "localhost",
        "DB_PORT": "5432",
        "DB_USERNAME": "postgres",
        "DB_PASSWORD": "postgres",
        "DB_DATABASE": "ai-products-search"
      }
    }
  }
}
```

## Paso 6: Reiniciar Claude Desktop

Cierra y vuelve a abrir Claude Desktop para que cargue la nueva configuración.

## Uso

Una vez configurado, puedes usar el MCP server en Claude:

1. **Sube una imagen** a Claude Desktop
2. **Pídele a Claude** que busque productos similares usando esa imagen

### Ejemplo de conversación:

```
Usuario: [sube una imagen de unos zapatos deportivos]
Usuario: Busca productos similares a estos zapatos en mi catálogo

Claude: [utiliza automáticamente la herramienta buscar_producto_por_imagen]
Claude: Encontré 5 productos similares en tu catálogo:
1. Zapatos deportivos Nike Air - $89.99 - Stock: 15
2. Zapatillas Adidas Running - $79.99 - Stock: 23
...
```

## Herramientas Disponibles

### `buscar_producto_por_imagen`

Busca productos similares en la base de datos usando embeddings de imagen y búsqueda vectorial.

**Parámetros:**
- `image_base64` (string, requerido): Imagen en formato base64 sin el prefijo data:image
- `mime_type` (string, opcional): Tipo MIME de la imagen (default: 'image/jpeg')
- `limit` (number, opcional): Número máximo de productos a retornar (default: 5)

**Funcionamiento:**
1. Recibe la imagen en base64
2. Genera embeddings usando Google AI (modelo text-embedding-004)
3. Realiza búsqueda vectorial en PostgreSQL usando distancia coseno
4. Retorna los productos más similares

**Respuesta de éxito:**
```json
{
  "status": "success",
  "total": 5,
  "productos": [
    {
      "id": 1,
      "nombre": "Producto 1",
      "descripcion": "Descripción del producto",
      "precio": 99.99,
      "stock": 10,
      "categoria": "Electrónica",
      "marca": "Marca X",
      "imagen": "https://...",
      "slug": "producto-1"
    }
  ]
}
```

**Respuesta sin resultados:**
```json
{
  "status": "not_found",
  "message": "No se encontraron productos similares en el catálogo."
}
```

**Respuesta de error:**
```json
{
  "status": "error",
  "message": "Error al buscar productos: [detalles del error]"
}
```

## Desarrollo

### Scripts Disponibles

```bash
# Ejecutar en modo desarrollo (con recarga automática)
pnpm mcp:dev

# Compilar el servidor
pnpm build:mcp

# Ejecutar versión compilada
pnpm mcp:start
```

### Probar manualmente con MCP Inspector

```bash
# Instalar MCP Inspector (si no lo tienes)
npm install -g @modelcontextprotocol/inspector

# Ejecutar
mcp-inspector node dist/mcp/mcp-server.js
```

## Arquitectura

### Flujo de Búsqueda

```
1. Cliente MCP (Claude) → Envía imagen en base64
2. MCP Server → Genera embeddings con Google AI
3. MCP Server → Consulta PostgreSQL con pgvector
4. PostgreSQL → Retorna productos ordenados por similitud (distancia coseno)
5. MCP Server → Formatea y envía resultados al cliente
```

### Tecnologías Utilizadas

- **NestJS**: Framework backend
- **TypeORM**: ORM para PostgreSQL
- **PostgreSQL + pgvector**: Base de datos vectorial
- **Google AI (text-embedding-004)**: Generación de embeddings
- **MCP SDK**: Protocolo Model Context Protocol

## Solución de Problemas

### Error: "No se puede conectar a la base de datos"
- Verifica que PostgreSQL esté corriendo: `docker ps`
- Verifica las credenciales en `.env`
- Asegúrate de que el puerto 5432 no esté ocupado

### Error: "GOOGLE_AI_API_KEY no está configurada"
- Verifica que la API key esté en `.env`
- Verifica que la API key sea válida en [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

### Error: "No se encontraron productos similares"
- Asegúrate de tener productos en la base de datos
- Los productos deben tener sus `image_embedding` previamente generados
- Verifica que los productos tengan `active = true`
- Revisa los logs del MCP server con `console.error`

### Error: "Property 'getGenerativeModel' does not exist"
- Esto indica que estás usando una versión antigua de @google/genai
- Asegúrate de usar la nueva API: `genAI.models.embedContent()`

### El servidor no aparece en Claude Desktop
- Reinicia Claude Desktop completamente
- Verifica que el archivo de configuración JSON sea válido
- Revisa los logs de Claude Desktop en:
  - **Windows**: `%APPDATA%\Claude\logs\`
  - **macOS**: `~/Library/Logs/Claude/`

## Notas Importantes

1. **Los productos necesitan embeddings**: Debes poblar la columna `image_embedding` de tus productos antes de hacer búsquedas
2. **Búsqueda vectorial**: Utiliza el operador `<=>` de pgvector para distancia coseno
3. **Solo productos activos**: La búsqueda filtra por `active = true`
4. **Modelo de embeddings**: Usa `text-embedding-004` de Google AI (768 dimensiones)
5. **Dimensiones**: Asegúrate de que las columnas vector en PostgreSQL tengan la dimensión correcta

## Próximos Pasos

1. **Poblar embeddings de productos**: Crear un script para generar embeddings de todas las imágenes de productos
2. **Optimización**: Agregar índices vectoriales para búsquedas más rápidas
3. **Cache**: Implementar caché de embeddings para imágenes frecuentes
4. **Filtros adicionales**: Añadir parámetros para filtrar por categoría, precio, etc.

## Recursos

- [Documentación MCP SDK](https://github.com/modelcontextprotocol/sdk)
- [Claude Desktop](https://claude.ai/download)
- [Google AI Studio](https://aistudio.google.com/)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
