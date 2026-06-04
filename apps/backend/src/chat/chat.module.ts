import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ProductsModule } from '../products/products.module';
import { ConversationsModule } from '../conversations/conversations.module';

@Module({
  imports: [ProductsModule, ConversationsModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
