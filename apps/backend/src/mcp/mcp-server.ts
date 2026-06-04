import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { DataSource } from 'typeorm';
import { GoogleGenAI } from '@google/genai';
import { Product } from '../products/entities/product.entity.js';
import { Category } from '../categories/entities/category.entity.js';
import { config } from 'dotenv';

// Cargar variables de entorno
config();

// Configurar conexión a la base de datos
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'ai-products-search',
  entities: [Product, Category],
  synchronize: false,
  logging: false,
});

// Inicializar Google AI
const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_AI_API_KEY || '',
});

// 1. Inicializamos el servidor MCP con la API de alto nivel
const server = new McpServer(
  {
    name: 'ecommerce-visual-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// 2. Definimos el esquema de entrada usando Zod
const BuscarProductoInputSchema = {
  image_base64: z
    .string()
    .describe(
      'Imagen en formato base64 (sin el prefijo data:image/...;base64,)',
    ),
  mime_type: z
    .string()
    .optional()
    .describe('Tipo MIME de la imagen (por defecto: image/jpeg)'),
  limit: z
    .number()
    .optional()
    .describe('Número máximo de productos a retornar (por defecto: 5)'),
};

// 3. Registramos la herramienta de búsqueda
server.registerTool(
  'buscar_producto_por_imagen',
  {
    description:
      'Busca productos similares en la base de datos usando embeddings de imagen. Recibe una imagen en base64 y retorna los productos más similares visualmente.',
    inputSchema: BuscarProductoInputSchema,
  },
  async (args) => {
    const {
      image_base64,
      mime_type = 'image/jpeg',
      limit = 5,
    } = args as {
      image_base64: string;
      mime_type?: string;
      limit?: number;
    };

    try {
      console.error('[MCP] Generando embedding de la imagen...');

      // Generar embedding de la imagen usando la nueva API
      const result = await genAI.models.embedContent({
        model: 'models/gemini-embedding-2',
        contents: [
          {
            parts: [
              {
                inlineData: {
                  data: image_base64,
                  mimeType: mime_type,
                },
              },
            ],
          },
        ],
      });

      // La respuesta tiene embeddings[0].values
      if (!result.embeddings || result.embeddings.length === 0) {
        throw new Error('No se recibieron embeddings en la respuesta');
      }

      const embedding = result.embeddings[0].values || [];
      console.error(
        `[MCP] Embedding generado (${embedding.length} dimensiones)`,
      );

      // Buscar productos similares en la base de datos
      console.error('[MCP] Buscando productos similares en la DB...');
      console.error('[MCP] Vector dimensions:', embedding.length);

      const vectorString = `[${embedding.join(',')}]`;

      // Usar query raw para evitar problemas de interpolación con vectores grandes
      const rawResults = await AppDataSource.query(
        `
        SELECT
          product.*,
          category.name as "category_name",
          product.image_embedding <=> $1::vector as distance,
          ROUND(((1 - (product.image_embedding <=> $1::vector) / 2) * 100)::numeric, 2) as similarity
        FROM products product
        LEFT JOIN categories category ON product.category_id = category.id
        WHERE product.active = true
          AND product.image_embedding IS NOT NULL
        ORDER BY product.image_embedding <=> $1::vector ASC
        LIMIT $2
        `,
        [vectorString, limit],
      );

      console.error(`[MCP] Raw results count:`, rawResults.length);

      const products = rawResults.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price,
        stock: row.stock,
        category: row.category_name || null,
        brand: row.brand,
        image_url: row.image_url,
        slug: row.slug,
        keywords: row.keywords,
        active: row.active,
        created_at: row.created_at,
        updated_at: row.updated_at,
        text_embedding: null,
        image_embedding: null,
        distance: parseFloat(row.distance),
        similarity: parseFloat(row.similarity),
      }));

      console.error(`[MCP] Se encontraron ${products.length} productos`);

      if (products.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  status: 'not_found',
                  message:
                    'No se encontraron productos similares en el catálogo.',
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      // Formatear resultados
      const resultados = products.map((p) => ({
        id: p.id,
        nombre: p.name,
        descripcion: p.description,
        precio: parseFloat(p.price.toString()),
        stock: p.stock,
        categoria: p.category,
        marca: p.brand,
        imagen: p.image_url,
        slug: p.slug,
        similitud: p.similarity,
        distancia: p.distance,
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                status: 'success',
                total: products.length,
                productos: resultados,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      console.error('[MCP] Error:', error);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                status: 'error',
                message: `Error al buscar productos: ${error instanceof Error ? error.message : 'Error desconocido'}`,
              },
              null,
              2,
            ),
          },
        ],
      };
    }
  },
);

// 4. Función principal para iniciar el servidor
async function main() {
  try {
    // Conectar a la base de datos
    console.error('[MCP] Conectando a la base de datos...');
    await AppDataSource.initialize();
    console.error('[MCP] Conexión a la base de datos establecida');

    // Iniciar el servidor MCP
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('[MCP] Servidor MCP de E-commerce corriendo vía STDIO');
  } catch (error) {
    console.error('[MCP] Error al arrancar el servidor:', error);
    process.exit(1);
  }
}

// Esto ejecuta la función asíncrona inmediatamente
main().catch((error) => {
  console.error('Error al arrancar el servidor MCP:', error);
  process.exit(1);
});
