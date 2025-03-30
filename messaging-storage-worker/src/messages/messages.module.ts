import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { KafkaModule } from '../shared/queues/kafka/kafka.module';
import { AppConfigModule } from 'src/shared/config/app-config/app-config.module';
import { MessagesService } from 'src/modules/messages/messages.service';

@Module({
  imports: [KafkaModule, AppConfigModule],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
