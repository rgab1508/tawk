import { Module } from '@nestjs/common';
import { ConversationsService } from './services/conversations.service';
import { ConversationsController } from './controllers/v1/conversations.controller';
import { MessagesModel } from '../../infra/setup/databases/mongodb/entities/messages.entity';
import { MessagesRepository } from '../../infra/setup/databases/mongodb/repositories/messages.repository';
import { GetConversationMessagesUseCase } from './use-cases/v1/get-conversation-messages.use-case';

@Module({
  providers: [
    // Use-cases
    GetConversationMessagesUseCase,

    // Providers
    {
      provide: 'MessagesModel',
      useFactory: () => MessagesModel,
    },
    MessagesRepository,
    ConversationsService,
  ],
  controllers: [ConversationsController],
})
export class ConversationsModule {}
