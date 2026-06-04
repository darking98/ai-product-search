export class CreateProductDto {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  categoryId?: number;
  brand?: string;
  image_url?: string;
  additional_images?: string[];
  slug?: string;
  keywords?: string[];
}
