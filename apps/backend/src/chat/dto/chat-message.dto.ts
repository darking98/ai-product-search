import { IsString, IsOptional, IsArray } from 'class-validator';

interface MessagePart {
  type: string;
  text: string;
}

interface VercelMessage {
  id: string;
  role: string;
  parts?: MessagePart[];
  content?: string;
  text?: string;
}

export class ChatMessageDto {
  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  conversationId?: string;

  // Campos adicionales para compatibilidad con Vercel AI SDK
  @IsOptional()
  @IsArray()
  messages?: VercelMessage[];

  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  trigger?: string;

  @IsOptional()
  data?: any;
}
