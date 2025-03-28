import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV } from 'src/constants/env';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import { ElasticsearchConfigInterface } from '../../shared/interfaces/app-config.interface';
import { KafkaConfig } from 'kafkajs';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  getKeyFromConfig = (key: string) => this.configService.get(key);

  get env() {
    return (this.getKeyFromConfig('NODE_ENV') ||
      ENV.DEV) as (typeof ENV)[keyof typeof ENV];
  }

  get jwtSecret() {
    return this.getKeyFromConfig('JWT_SECRET');
  }

  get mongoConfig(): MongooseModuleOptions {
    return {
      uri: this.getKeyFromConfig('MONGODB_URI'),
      dbName: this.getKeyFromConfig('MONGODB_DBNAME'),
      user: this.getKeyFromConfig('MONGODB_USER'),
      pass: this.getKeyFromConfig('MONGODB_PASSWORD'),
      authMechanism: 'DEFAULT',
      authSource: this.getKeyFromConfig('MONGODB_AUTH_SOURCE'),
      directConnection: true,
    } as MongooseModuleOptions;
  }

  get elasticsearchConfig(): ElasticsearchConfigInterface {
    return {
      node: this.getKeyFromConfig('ES_NODE_URI'),
      authUsername: this.getKeyFromConfig('ES_USER'),
      authPassword: this.getKeyFromConfig('ES_PASSWORD'),
    };
  }

  get kafkaConfig(): KafkaConfig {
    return {
      clientId: this.getKeyFromConfig('KAFKA_CLIENT_ID'),
      brokers: this.getKeyFromConfig('KAFKA_BROKERS').split(','),
    };
  }
}
