import { Module, OnModuleInit } from '@nestjs/common';
import { AppService } from './app.service';
import { AppConfigModule } from './config/app-config/app-config.module';
import { MongoDBModule } from './infra/setup/databases/mongodb/mongodb.module';
import { ElasticsearchModule } from './infra/setup/databases/elasticsearch/elasticsearch.module';
import { MessagesService } from './modules/messages/services/messages.service';
import { MessagesModule } from './modules/messages/messages.module';
import { ConversationsModule } from './modules/conversations/conversations.module';

@Module({
  imports: [
    AppConfigModule,
    MongoDBModule,
    ElasticsearchModule,
    MessagesModule,
    ConversationsModule,
  ],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly appService: AppService) {}

  async onModuleInit() {
    await this.appService.onAppInit();
  }
}
