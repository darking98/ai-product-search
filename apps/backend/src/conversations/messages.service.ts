import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities';
import { CreateMessageDto } from './dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async findByConversation(conversationId: string): Promise<Message[]> {
    return this.messagesRepository.find({
      where: { conversation_id: conversationId },
      order: { created_at: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Message | null> {
    return this.messagesRepository.findOne({
      where: { id },
    });
  }

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = this.messagesRepository.create(createMessageDto);
    return this.messagesRepository.save(message);
  }

  async delete(id: string): Promise<void> {
    await this.messagesRepository.delete(id);
  }

  async deleteByConversation(conversationId: string): Promise<void> {
    await this.messagesRepository.delete({ conversation_id: conversationId });
  }
}
