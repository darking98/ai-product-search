import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('categories')
@Index('idx_categories_slug', ['slug'])
@Index('idx_categories_active', ['active'])
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ length: 255, unique: true })
  slug!: string;

  @Column({ default: true })
  active!: boolean;

  @OneToMany(() => Product, (product) => product.category)
  products!: Product[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}