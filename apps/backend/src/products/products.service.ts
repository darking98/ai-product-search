import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { Product } from './entities';
import { EmbeddingsService } from '../embeddings';

@Injectable()
export class ProductsService {
  private groq: Groq;

  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private embeddingsService: EmbeddingsService,
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      throw new Error('GROQ_API_KEY no está configurada');
    }
    this.groq = new Groq({ apiKey });
  }

  async findAll(
    page?: number,
    limit?: number,
  ): Promise<{
    data: Product[];
    total: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  }> {
    // Si no hay parámetros de paginación, devolver todos los productos
    if (!page && !limit) {
      const products = await this.productsRepository.find({
        where: { active: true },
        order: { created_at: 'DESC' },
      });

      return {
        data: products,
        total: products.length,
      };
    }

    // Con paginación
    const pageNum = page || 1;
    const limitNum = limit || 10;
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await this.productsRepository.findAndCount({
      where: { active: true },
      order: { created_at: 'DESC' },
      skip,
      take: limitNum,
    });

    const totalPages = Math.ceil(total / limitNum);

    return {
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  }

  async findOne(id: number): Promise<Product | null> {
    return this.productsRepository.findOne({
      where: { id, active: true },
    });
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return this.productsRepository.findOne({
      where: { slug, active: true },
    });
  }

  async findByIds(ids: number[]): Promise<Product[]> {
    return this.productsRepository.find({
      where: ids.map((id) => ({ id, active: true })),
    });
  }

  // Método para búsqueda vectorial por texto
  async searchSimilar(query: string, limit: number = 5): Promise<Product[]> {
    console.log(
      `[searchSimilar] Iniciando búsqueda vectorial para: "${query}"`,
    );

    try {
      // Generar embedding del texto de búsqueda
      console.log('[searchSimilar] Paso 1: Generando embedding...');
      const queryEmbedding =
        await this.embeddingsService.generateTextEmbedding(query);

      console.log(
        `[searchSimilar] Paso 2: Embedding generado correctamente, dimensión: ${queryEmbedding.length}`,
      );

      // Convertir el array de números a formato de vector de PostgreSQL
      const vectorString = `[${queryEmbedding.join(',')}]`;
      console.log(
        `[searchSimilar] Paso 3: Vector convertido a string, longitud: ${vectorString.length} caracteres`,
      );

      // Usar query raw con pgvector para búsqueda por similitud
      // <=> es el operador de distancia coseno de pgvector
      // Solo retornar productos con similitud >= 60% (distancia <= 0.8)
      console.log(
        '[searchSimilar] Paso 4: Ejecutando query SQL con pgvector...',
      );
      const rawResults = await this.dataSource.query(
        `
        SELECT
          product.*,
          category.id as "category_id",
          category.name as "category_name",
          category.slug as "category_slug",
          product.text_embedding <=> $1::vector as distance,
          ROUND(((1 - (product.text_embedding <=> $1::vector) / 2) * 100)::numeric, 2) as similarity
        FROM products product
        LEFT JOIN categories category ON product.category_id = category.id
        WHERE product.active = true
          AND product.text_embedding IS NOT NULL
          AND (product.text_embedding <=> $1::vector) <= 0.8
        ORDER BY product.text_embedding <=> $1::vector ASC
        LIMIT $2
        `,
        [vectorString, limit],
      );

      console.log(
        `[searchSimilar] Búsqueda vectorial exitosa, encontrados: ${rawResults.length} productos`,
      );

      if (rawResults.length > 0) {
        rawResults.slice(0, 3).forEach((r: any) => {
          console.log(
            `  - ${r.name} (similitud: ${r.similarity}%, distancia: ${r.distance})`,
          );
        });
      }
      // Mapear los resultados raw a objetos Product
      return rawResults.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price,
        stock: row.stock,
        categoryId: row.category_id,
        category: row.category_id
          ? {
              id: row.category_id,
              name: row.category_name,
              slug: row.category_slug,
            }
          : null,
        brand: row.brand,
        image_url: row.image_url,
        additional_images: row.additional_images || [],
        slug: row.slug,
        keywords: row.keywords || [],
        active: row.active,
        created_at: row.created_at,
        updated_at: row.updated_at,
        text_embedding: null,
        image_embedding: null,
      }));
    } catch (error) {
      console.error('❌ [searchSimilar] Error en búsqueda vectorial:', error);
      console.error(
        'Stack:',
        error instanceof Error ? error.stack : 'No stack trace',
      );
      console.log(`⚠️ [searchSimilar] Usando fallback ILIKE para: "${query}"`);

      // Fallback a búsqueda básica si falla la búsqueda vectorial
      return this.productsRepository
        .createQueryBuilder('product')
        .where('product.active = :active', { active: true })
        .andWhere(
          '(product.name ILIKE :query OR product.description ILIKE :query)',
          { query: `%${query}%` },
        )
        .take(limit)
        .getMany();
    }
  }

  /**
   * Busca productos similares usando embeddings de imagen
   * Usa distancia coseno con el operador <=> de pgvector
   * @param embedding - Vector de embeddings de la imagen
   * @param limit - Número máximo de resultados
   * @returns Productos similares ordenados por similitud con score de similitud
   */
  async searchByImageEmbedding(
    embedding: number[],
    limit: number = 5,
  ): Promise<Array<Product & { similarity: number; distance: number }>> {
    // Convertir el array de números a formato de vector de PostgreSQL
    const vectorString = `[${embedding.join(',')}]`;

    // Usar query raw con parámetros para evitar problemas con vectores grandes
    // <=> es el operador de distancia coseno de pgvector
    // La distancia va de 0 (idéntico) a 2 (opuesto)
    // Similitud = (1 - distancia/2) * 100 para obtener porcentaje
    // Solo retornar productos con similitud >= 60% (distancia <= 0.8)
    const rawResults = await this.dataSource.query(
      `
      SELECT
        product.*,
        category.id as "category_id",
        category.name as "category_name",
        category.slug as "category_slug",
        product.image_embedding <=> $1::vector as distance,
        ROUND(((1 - (product.image_embedding <=> $1::vector) / 2) * 100)::numeric, 2) as similarity
      FROM products product
      LEFT JOIN categories category ON product.category_id = category.id
      WHERE product.active = true
        AND product.image_embedding IS NOT NULL
        AND (product.image_embedding <=> $1::vector) <= 0.8
      ORDER BY product.image_embedding <=> $1::vector ASC
      LIMIT $2
      `,
      [vectorString, limit],
    );

    // Mapear los resultados raw a objetos Product con similarity y distance
    return rawResults.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      stock: row.stock,
      categoryId: row.category_id,
      category: row.category_id
        ? {
            id: row.category_id,
            name: row.category_name,
            slug: row.category_slug,
          }
        : null,
      brand: row.brand,
      image_url: row.image_url,
      additional_images: row.additional_images || [],
      slug: row.slug,
      keywords: row.keywords || [],
      active: row.active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      text_embedding: null,
      image_embedding: null,
      distance: parseFloat(row.distance),
      similarity: parseFloat(row.similarity),
    }));
  }

  /**
   * Genera y guarda el embedding de imagen para un producto
   * @param productId - ID del producto
   * @param imageBase64 - Imagen en base64
   * @param mimeType - Tipo MIME de la imagen
   * @returns Producto actualizado
   */
  async generateImageEmbedding(
    productId: number,
    imageBase64: string,
    mimeType: string = 'image/jpeg',
  ): Promise<Product | null> {
    // Generar el embedding
    const embedding = await this.embeddingsService.generateImageEmbedding(
      imageBase64,
      mimeType,
    );

    // Convertir el array a formato de vector de PostgreSQL
    const vectorString = `[${embedding.join(',')}]`;

    // Actualizar el producto con el embedding
    await this.productsRepository
      .createQueryBuilder()
      .update(Product)
      .set({ image_embedding: vectorString as any })
      .where('id = :id', { id: productId })
      .execute();

    return this.findOne(productId);
  }

  /**
   * Genera texto enriquecido para embeddings usando Groq LLM
   * Agrega contexto, sinónimos y casos de uso de forma automática
   */
  private async generateEnrichedProductText(product: Product): Promise<string> {
    const prompt = `Genera un texto descriptivo ALTAMENTE ESPECÍFICO para embeddings de búsqueda de un producto de e-commerce. El objetivo es que productos de categorías diferentes tengan embeddings MUY distintos.

Producto: ${product.name}
Categoría: ${product.category?.name || 'General'}
Marca: ${product.brand || 'Sin marca'}
Descripción: ${product.description || 'Sin descripción'}

INSTRUCCIONES CRÍTICAS:
1. REPITE la categoría del producto 5-6 veces usando diferentes variaciones
2. Incluye 10+ sinónimos MUY ESPECÍFICOS del tipo exacto de producto
3. Describe características físicas únicas de este tipo de producto
4. Menciona materiales, partes y componentes específicos
5. Agrega casos de uso MUY específicos (no genéricos)
6. Incluye palabras de búsqueda que SOLO se usarían para este tipo de producto
7. Máximo 200 palabras
8. Solo texto plano, sin formato, sin listas con viñetas
9. Separa ideas con puntos

Ejemplos:

Para "Zapatillas Nike Air Max 270":
"Zapatillas deportivas Nike Air Max 270. CALZADO DEPORTIVO zapatos tenis sneakers zapatillas running. Calzado para pies footwear zapatos deportivos. Categoría CALZADO DEPORTIVO zapatería zapatos tenis. Producto de CALZADO DEPORTIVO para correr caminar trotar. Zapatillas con suela cordones plantilla talón puntera lengüeta. Calzado textil sintético goma EVA mesh. Para running jogging ejercicio gimnasio entrenamiento fitness deporte atletismo maratón caminar trotar. Zapatos deportivos tenis zapatillas sneakers running shoes trainers. Calzado deportivo para pies piernas corredores atletas deportistas. CALZADO DEPORTIVO categoría zapatos zapatillas tenis footwear."

Para "Laptop Dell XPS 15":
"Laptop Dell XPS 15. COMPUTADORA PORTÁTIL notebook ordenador PC computador portátil. Categoría COMPUTADORAS ELECTRÓNICA tecnología informática computing. Dispositivo electrónico COMPUTADORA con procesador CPU Intel Core i7 memoria RAM disco duro SSD almacenamiento. LAPTOP PORTÁTIL con pantalla display monitor teclado keyboard touchpad ratón mouse puertos USB HDMI. Computadora para programar codificar desarrollar software escribir código programming desarrollo web diseño gráfico edición video renderizado. COMPUTADORA PORTÁTIL notebook laptop para trabajo oficina estudios universidad profesionales desarrolladores programadores diseñadores. Equipo de cómputo tecnología informática dispositivo electrónico digital. COMPUTADORAS categoría tecnología electrónica informática computing hardware."

Para "Auriculares Sony WH-1000XM5":
"Auriculares Sony WH-1000XM5. AUDIO AURICULARES headphones audífonos cascos headset. Categoría AUDIO ACÚSTICA sonido música audio equipment. AURICULARES con drivers altavoces speakers transductores diadema almohadillas ear pads cancelación ruido ANC. Dispositivo AUDIO para escuchar oír música podcasts audio cancelling noise. AURICULARES inalámbricos Bluetooth wireless headphones over-ear circumaurales. Para escuchar música audio podcasts streaming Spotify YouTube música radio audiobooks audiolibros. AURICULARES AUDIO con micrófono mic batería recargable controles volumen. Audio equipment AURICULARES headphones cascos audífonos para oídos cabeza ears head. AUDIO categoría sonido música acústica auriculares headphones hearing."

Genera el texto:`;

    try {
      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 250,
      });

      const enrichedText =
        completion.choices[0]?.message?.content?.trim() || '';

      // Si Groq falla o devuelve vacío, usar texto básico
      if (!enrichedText) {
        console.warn(
          `[generateEnrichedProductText] Groq devolvió vacío para ${product.name}, usando fallback`,
        );
        return this.getBasicProductText(product);
      }

      return enrichedText;
    } catch (error) {
      console.error(
        `[generateEnrichedProductText] Error con Groq para ${product.name}:`,
        error,
      );
      // Fallback a texto básico si Groq falla
      return this.getBasicProductText(product);
    }
  }

  /**
   * Texto básico de fallback si Groq falla
   */
  private getBasicProductText(product: Product): string {
    const parts = [
      product.name,
      product.description || '',
      product.category?.name || '',
      product.brand || '',
      ...(product.keywords || []),
    ].filter(Boolean);

    return parts.join('. ');
  }

  /**
   * Genera y guarda el embedding de texto para un producto
   * Usa Groq para generar texto enriquecido con contexto
   * @param productId - ID del producto
   * @returns Producto actualizado
   */
  async generateTextEmbedding(productId: number): Promise<Product | null> {
    const product = await this.findOne(productId);
    if (!product) {
      return null;
    }

    // Generar texto enriquecido con Groq
    const enrichedText = await this.generateEnrichedProductText(product);

    // Generar el embedding del texto enriquecido
    const embedding =
      await this.embeddingsService.generateTextEmbedding(enrichedText);

    // Convertir el array a formato de vector de PostgreSQL
    const vectorString = `[${embedding.join(',')}]`;

    // Actualizar el producto con el embedding
    await this.productsRepository
      .createQueryBuilder()
      .update(Product)
      .set({ text_embedding: vectorString as any })
      .where('id = :id', { id: productId })
      .execute();
    return this.findOne(productId);
  }

  /**
   * Genera embeddings de imagen desde una URL
   * Descarga la imagen, la convierte a base64 y genera el embedding
   * @param productId - ID del producto
   * @returns Producto actualizado
   */
  async generateImageEmbeddingFromUrl(
    productId: number,
  ): Promise<Product | null> {
    const product = await this.findOne(productId);
    if (!product || !product.image_url) {
      return null;
    }

    // Descargar la imagen
    const response = await fetch(product.image_url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');

    // Detectar el tipo MIME de la respuesta
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Generar el embedding
    return this.generateImageEmbedding(productId, base64, contentType);
  }
}
