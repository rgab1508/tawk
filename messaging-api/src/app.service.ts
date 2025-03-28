import { Injectable } from '@nestjs/common';
import { MongoDBService } from './infra/setup/databases/mongodb/mongodb.service';

@Injectable()
export class AppService {
  constructor(private readonly mongoDBService: MongoDBService) {}
  async onAppInit() {
    this.mongoDBService.handleMongoConnection().catch(console.error);
  }
}
