import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { MessagesService } from './messages.service';
import { CreateConversationDto, CreateMessageDto } from './dto';

@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly messagesService: MessagesService,
  ) {}

  /**
   * GET /conversations
   * Lista todas las conversaciones activas
   */
  @Get()
  async findAll() {
    const conversations = await this.conversationsService.findAll();
    return {
      success: true,
      data: conversations,
      total: conversations.length,
    };
  }

  /**
   * GET /conversations/:id
   * Obtiene una conversación con todos sus mensajes
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const conversation = await this.conversationsService.findOne(id);
    if (!conversation) {
      return {
        success: false,
        message: 'Conversación no encontrada',
      };
    }
    return {
      success: true,
      data: conversation,
    };
  }

  /**
   * POST /conversations
   * Crea una nueva conversación
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createConversationDto: CreateConversationDto) {
    const conversation = await this.conversationsService.create(
      createConversationDto,
    );
    return {
      success: true,
      data: conversation,
      message: 'Conversación creada exitosamente',
    };
  }

  /**
   * PATCH /conversations/:id
   * Actualiza el título de una conversación
   */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: { title: string }) {
    const conversation = await this.conversationsService.update(id, body.title);
    if (!conversation) {
      return {
        success: false,
        message: 'Conversación no encontrada',
      };
    }
    return {
      success: true,
      data: conversation,
      message: 'Conversación actualizada exitosamente',
    };
  }

  /**
   * DELETE /conversations/:id
   * Elimina una conversación (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    await this.conversationsService.remove(id);
    return {
      success: true,
      message: 'Conversación eliminada exitosamente',
    };
  }

  /**
   * GET /conversations/:id/messages
   * Obtiene todos los mensajes de una conversación
   */
  @Get(':id/messages')
  async getMessages(@Param('id') id: string) {
    try {
      const messages = await this.messagesService.findByConversation(id);
      console.log(messages, 'aca messages');
      return {
        success: true,
        data: messages,
        total: messages.length,
      };
    } catch (error) {
      console.error('Error fetching messages:', error);
      return {
        success: true,
        data: [],
        total: 0,
      };
    }
  }

  /**
   * POST /conversations/:id/messages
   * Crea un nuevo mensaje en una conversación
   */
  @Post(':id/messages')
  @HttpCode(HttpStatus.CREATED)
  async createMessage(
    @Param('id') conversationId: string,
    @Body() createMessageDto: Omit<CreateMessageDto, 'conversation_id'>,
  ) {
    const message = await this.messagesService.create({
      ...createMessageDto,
      conversation_id: conversationId,
    });
    return {
      success: true,
      data: message,
      message: 'Mensaje creado exitosamente',
    };
  }

  /**
   * DELETE /conversations/:conversationId/messages/:messageId
   * Elimina un mensaje específico
   */
  @Delete(':conversationId/messages/:messageId')
  @HttpCode(HttpStatus.OK)
  async removeMessage(@Param('messageId') messageId: string) {
    await this.messagesService.delete(messageId);
    return {
      success: true,
      message: 'Mensaje eliminado exitosamente',
    };
  }
}
