import { Module } from '@nestjs/common';
import { AppConfigModule } from '../../../../config/app-config/app-config.module';
import { MongoDBService } from './mongodb.service';
import { MessagesModel } from './entities/messages.entity';

@Module({
  imports: [AppConfigModule],
  providers: [
    MongoDBService,
    {
      provide: 'MessagesModel',
      useFactory: () => MessagesModel,
    },
  ],
  exports: [MongoDBService],
})
export class MongoDBModule {}
