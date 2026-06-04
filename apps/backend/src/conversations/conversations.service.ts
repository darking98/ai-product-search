import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities';
import { CreateConversationDto } from './dto';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private conversationsRepository: Repository<Conversation>,
  ) {}

  async findAll(): Promise<Conversation[]> {
    return this.conversationsRepository.find({
      where: { active: true },
      order: { updated_at: 'DESC' },
      take: 50, // Limitar a 50 conversaciones más recientes
    });
  }

  async findOne(id: string): Promise<Conversation | null> {
    return this.conversationsRepository.findOne({
      where: { id, active: true },
      relations: {
        messages: true,
      },
    });
  }

  async create(
    createConversationDto: CreateConversationDto,
  ): Promise<Conversation> {
    const conversation = this.conversationsRepository.create({
      ...createConversationDto,
      title: createConversationDto.title || 'Nueva conversación',
    });
    return this.conversationsRepository.save(conversation);
  }

  async update(id: string, title: string): Promise<Conversation | null> {
    await this.conversationsRepository.update(id, { title });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    // Soft delete - marca como inactivo
    await this.conversationsRepository.update(id, { active: false });
  }

  async delete(id: string): Promise<void> {
    // Hard delete - elimina permanentemente
    await this.conversationsRepository.delete(id);
  }
}
