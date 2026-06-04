import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * GET /categories
   * Obtiene todas las categorías
   */
  @Get()
  async findAll() {
    const categories = await this.categoriesService.findAll();
    return {
      success: true,
      data: categories,
      total: categories.length,
    };
  }

  /**
   * GET /categories/:id
   * Obtiene una categoría por ID
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const category = await this.categoriesService.findOne(id);

    if (!category) {
      return {
        success: false,
        message: 'Categoría no encontrada',
      };
    }

    return {
      success: true,
      data: category,
    };
  }

  /**
   * GET /categories/slug/:slug
   * Obtiene una categoría por slug
   */
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const category = await this.categoriesService.findBySlug(slug);

    if (!category) {
      return {
        success: false,
        message: 'Categoría no encontrada',
      };
    }

    return {
      success: true,
      data: category,
    };
  }

  /**
   * POST /categories
   * Crea una nueva categoría
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const category = await this.categoriesService.create(createCategoryDto);

    return {
      success: true,
      data: category,
      message: 'Categoría creada exitosamente',
    };
  }

  /**
   * PATCH /categories/:id
   * Actualiza una categoría existente
   */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.categoriesService.update(id, updateCategoryDto);

    return {
      success: true,
      data: category,
      message: 'Categoría actualizada exitosamente',
    };
  }

  /**
   * DELETE /categories/:id
   * Elimina una categoría
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.categoriesService.remove(id);
  }
}
