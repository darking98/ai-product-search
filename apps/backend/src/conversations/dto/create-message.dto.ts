import { IsString, IsEnum, IsOptional, IsArray } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  conversation_id: string;

  @IsEnum(['user', 'assistant', 'system'])
  role: 'user' | 'assistant' | 'system';

  @IsString()
  content: string;

  @IsArray()
  @IsOptional()
  products?: any[];
}
