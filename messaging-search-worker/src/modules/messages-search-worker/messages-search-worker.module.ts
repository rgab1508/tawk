import { Module } from '@nestjs/common';
import { MessagesSearchWorkerService } from './messages-search-worker.service';
import { MessagesSearchWorkerController } from './messages-search-worker.controller';
import { KafkaModule } from '../../shared/queues/kafka/kafka.module';
import { AppConfigModule } from '../../shared/config/app-config/app-config.module';
import { ElasticsearchModule } from '../../infra/setup/databases/elasticsearch/elasticsearch.module';

@Module({
  imports: [KafkaModule, AppConfigModule, ElasticsearchModule],
  providers: [MessagesSearchWorkerService],
  controllers: [MessagesSearchWorkerController],
})
export class MessagesSearchWorkerModule {}
