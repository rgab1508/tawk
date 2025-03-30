import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagesSearchWorkerModule } from './modules/messages-search-worker/messages-search-worker.module';
import { AppConfigModule } from './shared/config/app-config/app-config.module';
import { KafkaModule } from './shared/queues/kafka/kafka.module';
import { ElasticsearchModule } from './infra/setup/databases/elasticsearch/elasticsearch.module';

@Module({
  imports: [
    MessagesSearchWorkerModule,
    AppConfigModule,
    KafkaModule,
    ElasticsearchModule,
  ],
  providers: [AppService],
})
export class AppModule {}
