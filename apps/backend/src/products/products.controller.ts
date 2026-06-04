import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { GenerateEmbeddingDto } from './dto';
import { EmbeddingsService } from '../embeddings';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly embeddingsService: EmbeddingsService,
  ) {}

  /**
   * GET /products
   * Lista todos los productos activos con paginación opcional
   * Query params: page (opcional), limit (opcional)
   */
  @Get()
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    const result = await this.productsService.findAll(pageNum, limitNum);
    return {
      success: true,
      ...result,
    };
  }

  /**
   * GET /products/slug/:slug
   * Obtiene un producto por su slug
   */
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const product = await this.productsService.findBySlug(slug);
    if (!product) {
      return {
        success: false,
        message: 'Producto no encontrado',
      };
    }
    return {
      success: true,
      data: product,
    };
  }

  /**
   * GET /products/:id
   * Obtiene un producto por ID
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const product = await this.productsService.findOne(id);
    if (!product) {
      return {
        success: false,
        message: 'Producto no encontrado',
      };
    }
    return {
      success: true,
      data: product,
    };
  }

  /**
   * POST /products/:id/generate-image-embedding
   * Genera el embedding de imagen para un producto desde base64
   * Body: { image_base64: string, mime_type?: string }
   */
  @Post(':id/generate-image-embedding')
  async generateImageEmbedding(
    @Param('id', ParseIntPipe) id: number,
    @Body() generateEmbeddingDto: GenerateEmbeddingDto,
  ) {
    const { image_base64, mime_type = 'image/jpeg' } = generateEmbeddingDto;

    const product = await this.productsService.generateImageEmbedding(
      id,
      image_base64,
      mime_type,
    );

    if (!product) {
      return {
        success: false,
        message: 'Producto no encontrado',
      };
    }

    return {
      success: true,
      data: product,
      message: 'Embedding de imagen generado exitosamente',
    };
  }

  /**
   * POST /products/:id/generate-image-embedding-from-url
   * Genera el embedding de imagen desde la URL del producto
   */
  @Post(':id/generate-image-embedding-from-url')
  async generateImageEmbeddingFromUrl(@Param('id', ParseIntPipe) id: number) {
    const product =
      await this.productsService.generateImageEmbeddingFromUrl(id);

    if (!product) {
      return {
        success: false,
        message: 'Producto no encontrado o no tiene URL de imagen',
      };
    }

    return {
      success: true,
      data: product,
      message: 'Embedding de imagen generado desde URL exitosamente',
    };
  }

  /**
   * POST /products/:id/generate-text-embedding
   * Genera el embedding de texto para un producto
   */
  @Post(':id/generate-text-embedding')
  async generateTextEmbedding(@Param('id', ParseIntPipe) id: number) {
    const product = await this.productsService.generateTextEmbedding(id);

    if (!product) {
      return {
        success: false,
        message: 'Producto no encontrado',
      };
    }

    return {
      success: true,
      data: product,
      message: 'Embedding de texto generado exitosamente',
    };
  }

  /**
   * POST /products/search-by-image
   * Busca productos similares por imagen
   * Body: { image_base64: string, mime_type?: string, limit?: number }
   */
  @Post('search-by-image')
  @HttpCode(HttpStatus.OK)
  async searchByImage(
    @Body()
    searchDto: {
      image_base64: string;
      mime_type?: string;
      limit?: number;
    },
  ) {
    const { image_base64, mime_type = 'image/jpeg', limit = 5 } = searchDto;

    // Generar embedding de la imagen
    const embedding = await this.embeddingsService.generateImageEmbedding(
      image_base64,
      mime_type,
    );

    // Buscar productos similares
    const products = await this.productsService.searchByImageEmbedding(
      embedding,
      limit,
    );

    return {
      success: true,
      data: products,
      total: products.length,
      message: `Se encontraron ${products.length} productos similares`,
    };
  }

  /**
   * POST /products/batch-generate-embeddings
   * Genera embeddings para todos los productos que tienen image_url
   */
  @Post('batch-generate-embeddings')
  @HttpCode(HttpStatus.OK)
  async batchGenerateEmbeddings() {
    // Obtener todos los productos sin paginación
    const { data: products } = await this.productsService.findAll();
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const product of products) {
      try {
        if (product.image_url) {
          await this.productsService.generateImageEmbeddingFromUrl(product.id);
          await this.productsService.generateTextEmbedding(product.id);
          results.success++;
        }
      } catch (error) {
        results.failed++;
        results.errors.push(
          `Producto ${product.id}: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        );
      }
    }

    return {
      success: true,
      message: 'Proceso de generación de embeddings completado',
      results,
    };
  }
}
