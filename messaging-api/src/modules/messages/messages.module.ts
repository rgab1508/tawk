import { forwardRef, Module } from '@nestjs/common';
import { MessagesService } from './services/messages.service';
import { MessagesModel } from '../../infra/setup/databases/mongodb/entities/messages.entity';
import { MessagesRepository } from '../../infra/setup/databases/mongodb/repositories/messages.repository';
import { MessagesController } from './controllers/v1/messages.controller';
import { CreateMessageUseCase } from './use-cases/v1/create-message.use-case';
import { KafkaModule } from '../../shared/queues/kafka/kafka.module';

@Module({
  imports: [KafkaModule],
  providers: [
    // Use-cases
    CreateMessageUseCase,

    // Providers
    {
      provide: 'MessagesModel',
      useFactory: () => MessagesModel,
    },
    MessagesRepository,
    MessagesService,
  ],
  exports: [MessagesService],
  controllers: [MessagesController],
})
export class MessagesModule {}
