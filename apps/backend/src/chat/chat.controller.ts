import { Controller, Post, Body, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ChatService } from './chat.service';
import { ChatMessageDto } from './dto/chat-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * POST /api/chat/stream
   * Endpoint con streaming compatible con Vercel AI SDK UI Stream Protocol (SSE)
   */
  @Post('stream')
  async chatStream(
    @Body() chatMessageDto: ChatMessageDto,
    @Res() res: Response,
  ) {
    // Extraer el mensaje del usuario y conversationId del formato de Vercel AI SDK
    let userMessage: string = '';
    const conversationId = chatMessageDto.conversationId;

    if (chatMessageDto.messages && chatMessageDto.messages.length > 0) {
      const lastMessage =
        chatMessageDto.messages[chatMessageDto.messages.length - 1];

      if (lastMessage.parts && lastMessage.parts.length > 0) {
        const textPart = lastMessage.parts.find((part) => part.type === 'text');
        userMessage = textPart?.text || '';
      } else {
        userMessage = lastMessage.text || lastMessage.content || '';
      }
    } else {
      userMessage = chatMessageDto.message || '';
    }

    if (!userMessage) {
      res.status(400).json({ error: 'No se proporcionó un mensaje' });
      return;
    }

    try {
      // Configurar headers CORS (necesario cuando usamos @Res() directamente)
      const origin = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');

      // Configurar headers para SSE con UI Message Stream Protocol
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('x-vercel-ai-ui-message-stream', 'v1');

      const generator = this.chatService.chatStream(
        userMessage,
        conversationId,
      );

      // Generar IDs únicos
      const messageId = `msg_${Date.now()}`;
      const textId = `text_${Date.now()}`;

      // 1. Iniciar mensaje
      res.write(`data: ${JSON.stringify({ type: 'start', messageId })}\n\n`);

      // 2. Iniciar bloque de texto
      res.write(
        `data: ${JSON.stringify({ type: 'text-start', id: textId })}\n\n`,
      );

      // Acumular productos
      const allProducts: any[] = [];

      // 3. Enviar deltas de texto
      for await (const chunk of generator) {
        if (chunk.type === 'text') {
          res.write(
            `data: ${JSON.stringify({ type: 'text-delta', id: textId, delta: chunk.content })}\n\n`,
          );
        } else if (chunk.type === 'tool-result') {
          if (chunk.data?.products) {
            allProducts.push(...chunk.data.products);
          }
        }
      }

      // Si hay productos, enviarlos como data personalizado
      if (allProducts.length > 0) {
        res.write(
          `data: ${JSON.stringify({ type: 'data-products', data: allProducts })}\n\n`,
        );
      }

      // 4. Terminar bloque de texto
      res.write(
        `data: ${JSON.stringify({ type: 'text-end', id: textId })}\n\n`,
      );

      // 5. Terminar mensaje
      res.write(`data: ${JSON.stringify({ type: 'finish' })}\n\n`);

      // 6. Terminar stream
      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (error) {
      console.error('Error en chat stream:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error al procesar el mensaje' });
      } else {
        res.write(
          `data: ${JSON.stringify({ type: 'error', errorText: 'Error al procesar el mensaje' })}\n\n`,
        );
        res.write(`data: [DONE]\n\n`);
        res.end();
      }
    }
  }
}
