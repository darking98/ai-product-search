import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  slug?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
