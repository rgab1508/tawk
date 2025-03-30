import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { KafkaModule } from '../../shared/queues/kafka/kafka.module';
import { AppConfigModule } from '../../shared/config/app-config/app-config.module';
import { MessagesService } from './messages.service';
import { MessagesModel } from '../../infra/setup/databases/mongodb/entities/messages.entity';
import { MessagesRepository } from '../../infra/setup/databases/mongodb/repositories/messages.repository';

@Module({
  imports: [KafkaModule, AppConfigModule],
  controllers: [MessagesController],
  providers: [
    // Providers
    {
      provide: 'MessagesModel',
      useFactory: () => MessagesModel,
    },
    MessagesRepository,
    MessagesService,
  ],
})
export class MessagesModule {}
