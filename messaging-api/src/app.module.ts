import { Module, OnModuleInit } from '@nestjs/common';
import { AppService } from './app.service';
import { AppConfigModule } from './shared/config/app-config/app-config.module';
import { MongoDBModule } from './infra/setup/databases/mongodb/mongodb.module';
import { ElasticsearchModule } from './infra/setup/databases/elasticsearch/elasticsearch.module';
import { MessagesModule } from './modules/messages/messages.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { KafkaModule } from './shared/queues/kafka/kafka.module';

@Module({
  imports: [
    AppConfigModule,
    MongoDBModule,
    ElasticsearchModule,
    MessagesModule,
    ConversationsModule,
    KafkaModule,
  ],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly appService: AppService) {}

  async onModuleInit() {
    await this.appService.onAppInit();
  }
}
