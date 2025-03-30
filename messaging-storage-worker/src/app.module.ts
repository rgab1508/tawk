import { Module, OnModuleInit } from '@nestjs/common';
import { AppService } from './app.service';
import { AppConfigModule } from './shared/config/app-config/app-config.module';
import { MessagesModule } from './modules/messages/messages.module';
import { MongoDBModule } from './infra/setup/databases/mongodb/mongodb.module';

@Module({
  imports: [MongoDBModule, AppConfigModule, MessagesModule],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly appService: AppService) {}

  async onModuleInit() {
    await this.appService.onAppInit();
  }
}
