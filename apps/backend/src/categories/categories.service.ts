import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Category | null> {
    return this.categoriesRepository.findOne({
      where: { id },
      relations: { products: true },
    });
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return this.categoriesRepository.findOne({
      where: { slug },
      relations: { products: true },
    });
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoriesRepository.create(createCategoryDto);

    // Generar slug automáticamente si no se proporciona
    if (!category.slug) {
      category.slug = this.generateSlug(category.name);
    }

    return this.categoriesRepository.save(category);
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);

    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    // Si se actualiza el nombre y no se proporciona slug, regenerar slug
    if (updateCategoryDto.name && !updateCategoryDto.slug) {
      updateCategoryDto.slug = this.generateSlug(updateCategoryDto.name);
    }

    Object.assign(category, updateCategoryDto);
    return this.categoriesRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);

    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    await this.categoriesRepository.remove(category);
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9\s-]/g, '') // Eliminar caracteres especiales
      .trim()
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-'); // Eliminar guiones duplicados
  }
}
