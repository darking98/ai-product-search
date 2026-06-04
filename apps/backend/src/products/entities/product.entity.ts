import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

@Entity('products')
@Index('idx_products_category_id', ['categoryId'])
@Index('idx_products_brand', ['brand'])
@Index('idx_products_active', ['active'])
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'int', default: 0 })
  stock!: number;

  @Column({ name: 'category_id', nullable: true })
  categoryId!: number;

  @ManyToOne(() => Category, (category) => category.products, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @Column({ length: 100, nullable: true })
  brand!: string;

  @Column({ type: 'text', nullable: true })
  image_url!: string;

  @Column({ type: 'text', array: true, nullable: true })
  additional_images!: string[];

  @Column({ length: 255, unique: true, nullable: true })
  slug!: string;

  @Column({ type: 'text', array: true, nullable: true })
  keywords!: string[];

  // Embeddings para búsqueda vectorial (1536 dimensiones para OpenAI)
  // pgvector usa el tipo 'vector', pero TypeORM lo trata como string
  @Column('vector', { nullable: true })
  text_embedding!: string;

  @Column('vector', { nullable: true })
  image_embedding!: string;

  @Column({ default: true })
  active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
