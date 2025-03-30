import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { AppConfigService } from '../../../../shared/config/app-config/app-config.service';

@Injectable()
export class MongoDBService {
  constructor(private readonly appConfigService: AppConfigService) {}

  async handleMongoConnection() {
    const { uri, ...otherCredentials } = this.appConfigService.mongoConfig;

    const connectWithRetry = async () => {
      try {
        mongoose.set('debug', true);
        await mongoose.connect(uri as string, otherCredentials);
      } catch (error) {
        await new Promise((resolve) => {
          setTimeout(resolve, 5000);
        });
        await connectWithRetry();
      }
    };

    const { connection } = mongoose;

    connection.on('connected', () => {
      console.log('MongoDB connected');
    });

    connection.on('error', async (error) => {
      console.error(error);
      await connectWithRetry();
    });

    connection.on('disconnected', async () => {
      await connectWithRetry();
    });

    await connectWithRetry();
  }
}
